# VM build instructions

The live demo embeds a v86 WebAssembly i686 emulator booting a custom 32-bit Linux kernel.

## Build the kernel (bzImage.bin)

Cross-compiles Linux 6.6.136 for i386 using `gcc-i686-linux-gnu`. Works natively on any host architecture.

6.6.136 is the last 6.6.x release before the CVE-2026-31431 fix was backported to the 6.6.y stable branch (landed in 6.6.137 on 2026-04-30).

```sh
docker build -f Dockerfile --output . .
# → bzImage.bin (2.7 MB)
```

## Build the rootfs (initrd.img)

Downloads Alpine 3.20.5 x86 minirootfs, installs Python 3 + shadow, strips unused modules, packs into initrd.

Alpine 3.20.5 is pinned so the `/usr/bin/passwd` binary layout stays consistent with the exploit.

```sh
docker build -f Dockerfile.rootfs --output . .
# → initrd.img (~10 MB)
```

## Seabios / VGA BIOS

Sourced from the v86 repository — no Docker build needed:

```sh
wget https://github.com/copy/v86/raw/v0.3.0/bios/seabios.bin
wget https://github.com/copy/v86/raw/v0.3.0/bios/vgabios.bin
```

## What's inside the rootfs

- Alpine Linux 3.20.5 (x86 32-bit)
- Python 3 with only the standard library modules needed for socket + os operations
- User `demo` / password `demo`
- `/home/demo/copy_fail.py` — the CVE-2026-31431 exploit
