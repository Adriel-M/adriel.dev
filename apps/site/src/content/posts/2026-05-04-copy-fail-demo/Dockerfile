FROM debian:bookworm-slim AS builder

RUN apt-get update && apt-get install -y \
    gcc-i686-linux-gnu \
    flex \
    bison \
    bc \
    wget \
    xz-utils \
    make \
    && rm -rf /var/lib/apt/lists/*

# One patch version before the exploit fix
ARG KERNEL_VERSION=6.6.136
WORKDIR /build

RUN wget -q https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-${KERNEL_VERSION}.tar.xz \
    && tar xf linux-${KERNEL_VERSION}.tar.xz

WORKDIR /build/linux-${KERNEL_VERSION}

COPY kernel-config .config

RUN make ARCH=i386 CROSS_COMPILE=i686-linux-gnu- olddefconfig \
    && make ARCH=i386 CROSS_COMPILE=i686-linux-gnu- -j$(nproc) bzImage \
    && cp arch/x86/boot/bzImage /build/bzImage

FROM scratch
COPY --from=builder /build/bzImage /bzImage.bin
