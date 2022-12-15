#######################
#### Builder stage ####

FROM library/ubuntu:22.04 AS builder

ARG DEBIAN_FRONTEND=noninteractive
RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt update && apt-get install -y \
        git \
        libglib2.0-0 \
        libgl1-mesa-glx \
        python3-venv \
        python3-pip \
        build-essential

ENV INVOKEAI_SRC=/invokeai
ENV VIRTUAL_ENV=${INVOKEAI_SRC}/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
ARG TORCH_VERSION=1.13.0
ARG TORCHVISION_VERSION=0.14.0
ARG GPU_DRIVER=cuda
ARG TARGETPLATFORM
# unused but available
ARG BUILDPLATFORM

WORKDIR ${INVOKEAI_SRC}

# Install pytorch before all other pip packages
# NOTE: there are no pytorch builds for arm64 with GPU accelearion
# Only CPU images are build for ARM currently
# x86_64/CUDA is the default build
RUN python3 -m venv ${VIRTUAL_ENV} &&\
    if [ "$TARGETPLATFORM" = "linux/arm64" ] || [ "$GPU_DRIVER" = "cpu" ]; then \
        extra_index_url=https://download.pytorch.org/whl/nightly/cpu; \
        torch=$TORCH_VERSION; \
        torchvision=$TORCHVISION_VERSION; \
    elif [ "$GPU_DRIVER" = "rocm"]; then \
        extra_index_url=https://download.pytorch.org/whl/rocm5.2; \
        torch=$TORCH_VERSION \
        torchvision=$TORCHVISION_VERSION; \
    else \
        extra_index_url=https://download.pytorch.org/whl/cu116; \
        torch=$TORCH_VERSION+cu116; \
        torchvision=$TORCHVISION_VERSION+cu116; \
    fi &&\
    pip install --extra-index-url $extra_index_url \
        torch==$torch \
        torchvision==$torchvision &&\
    pip install -e git+https://github.com/invoke-ai/PyPatchMatch@0.1.3#egg=pypatchmatch

# Install the rest of requirements
# and the local package (in editable mode)
COPY . .
RUN pip install -r environments-and-requirements/requirements-base.txt &&\
    pip install -e .

#######################
#### Runtime stage ####

FROM library/ubuntu:22.04 as runtime

ARG DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt update && apt install -y --no-install-recommends \
        git \
        curl \
        vim \
        ncdu \
        iotop \
        bzip2 \
        libglib2.0-0 \
        libgl1-mesa-glx \
        python3-venv \
        python3-pip \
        build-essential \
        libopencv-dev &&\
    apt-get clean && apt-get autoclean

ENV INVOKEAI_SRC=/invokeai
ENV INVOKEAI_ROOT=/mnt/invokeai
ENV VIRTUAL_ENV=${INVOKEAI_SRC}/.venv
ENV PATH="$VIRTUAL_ENV/bin:$INVOKEAI_SRC:$PATH"


WORKDIR ${INVOKEAI_SRC}

COPY --from=builder ${INVOKEAI_SRC}/ ./

# build patchmatch
RUN cd /usr/lib/$(uname -p)-linux-gnu/pkgconfig/ && ln -sf opencv4.pc opencv.pc
RUN python -c "from patchmatch import patch_match"

RUN mv docker/docker-entrypoint.sh ./

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["python3", "scripts/invoke.py", "--web", "--host", "0.0.0.0"]
