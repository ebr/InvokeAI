#######################
#### Builder stage ####

FROM library/ubuntu:22.04 AS builder

ARG DEBIAN_FRONTEND=noninteractive
RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt update && apt-get install -y \
        git \
        python3-venv \
        python3-pip \
        build-essential

ENV INVOKEAI_SRC=/invokeai
ENV VIRTUAL_ENV=/opt/invokeai/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
ARG TORCH_VERSION=1.13.1
ARG TORCHVISION_VERSION=0.14.1
ARG GPU_DRIVER=cuda
ARG TARGETPLATFORM
# unused but available
ARG BUILDPLATFORM

WORKDIR ${INVOKEAI_SRC}

# Install pytorch before all other pip packages
# NOTE: there are no pytorch builds for arm64 with GPU accelearion
# Only CPU images are built for ARM currently
# x86_64/CUDA is the default build
RUN --mount=type=cache,target=/root/.cache/pip \
    python3 -m venv ${VIRTUAL_ENV} &&\
    if [ "$TARGETPLATFORM" = "linux/arm64" ] || [ "$GPU_DRIVER" = "cpu" ]; then \
        extra_index_url_arg="--extra-index-url https://download.pytorch.org/whl/cpu"; \
    elif [ "$GPU_DRIVER" = "rocm" ]; then \
        extra_index_url_arg="--extra-index-url https://download.pytorch.org/whl/rocm5.2"; \
    fi &&\
    pip install $extra_index_url_arg \
        torch==$TORCH_VERSION \
        torchvision==$TORCHVISION_VERSION &&\
    pip install git+https://github.com/invoke-ai/PyPatchMatch@0.1.3#egg=pypatchmatch &&\
    if [ "$TARGETPLATFORM" = "linux/amd64" ] && [ "$GPU_DRIVER" = "cuda" ]; then \
        pip install triton xformers==0.0.16rc425; \
    fi

# Install the local package.
# Editable mode helps use the same image for development:
# the local working copy can be bind-mounted into the image
# at path defined by ${INVOKEAI_SRC}
COPY . .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -e .

#######################
#### Runtime stage ####

FROM library/ubuntu:22.04 as runtime

ARG DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt update && apt install -y --no-install-recommends \
        git \
        curl \
        vim \
        ncdu \
        iotop \
        bzip2 \
        gosu \
        libglib2.0-0 \
        libgl1-mesa-glx \
        python3-venv \
        python3-pip \
        build-essential \
        libopencv-dev &&\
    apt-get clean && apt-get autoclean

ENV INVOKEAI_SRC=/invokeai
ENV INVOKEAI_ROOT=/mnt/invokeai
ENV VIRTUAL_ENV=/opt/invokeai/venv
ENV PATH="$VIRTUAL_ENV/bin:$INVOKEAI_SRC:$PATH"

COPY --from=builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}

# add magic-wormhole for easier sending/receiving of files when running in limited cloud provider environments
RUN pip install magic-wormhole

COPY --from=builder ${INVOKEAI_SRC} ${INVOKEAI_SRC}

WORKDIR ${INVOKEAI_SRC}

# build patchmatch
RUN cd /usr/lib/$(uname -p)-linux-gnu/pkgconfig/ && ln -sf opencv4.pc opencv.pc
RUN python3 -c "from patchmatch import patch_match"

RUN mv docker/docker-entrypoint.sh ./

# Create unprivileged user
RUN useradd --create-home --shell /bin/bash -u 1000 --comment "container local user" invoke

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["invoke", "--web", "--host", "0.0.0.0"]
