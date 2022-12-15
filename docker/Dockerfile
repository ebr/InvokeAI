#######################
#### Builder stage ####

FROM library/ubuntu:22.04 AS builder

ARG DEBIAN_FRONTEND=noninteractive
RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt update && apt-get install -y \
        git \
        libglib2.0-0 \
        libgl1-mesa-glx \
        python3-venv \
        python3-pip \
        build-essential \
        python3-opencv \
        libopencv-dev

ARG WORKDIR=/invokeai
WORKDIR ${WORKDIR}

ENV VIRTUAL_ENV=${WORKDIR}/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
ARG TORCH_VERSION=1.13.0
ARG TORCHVISION_VERSION=0.14.0

RUN --mount=type=cache,target=/root/.cache/pip \
    echo $(uname -p) &&\
    python3 -m venv ${VIRTUAL_ENV} &&\
    if [ $(uname -p) = "x86_64" ]; then \
        extra_index_url=https://download.pytorch.org/whl/cu116; \
        torch=$TORCH_VERSION+cu116; \
        torchvision=$TORCHVISION_VERSION+cu116; \
    else \
        extra_index_url=https://download.pytorch.org/whl/nightly/cpu; \
        torch=$TORCH_VERSION; \
        torchvision=$TORCHVISION_VERSION; \
    fi &&\
    echo $extra_index_url $torch $torchvision &&\
    pip install --extra-index-url $extra_index_url \
        torch==$torch \
        torchvision==$torchvision &&\
    pip install -e git+https://github.com/invoke-ai/PyPatchMatch@0.1.3#egg=pypatchmatch

COPY . .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r environments-and-requirements/requirements-base.txt &&\
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
        ncdu \
        iotop \
        bzip2 \
        libglib2.0-0 \
        libgl1-mesa-glx \
        python3-venv \
        python3-pip \
        build-essential \
        python3-opencv \
        libopencv-dev &&\
    apt-get clean && apt-get autoclean

ARG WORKDIR=/invokeai
WORKDIR ${WORKDIR}

ENV INVOKEAI_ROOT=/mnt/invokeai
ENV VIRTUAL_ENV=${WORKDIR}/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY --from=builder ${WORKDIR} ${WORKDIR}

# build patchmatch
RUN cd /usr/lib/$(uname -p)-linux-gnu/pkgconfig/ && ln -sf opencv4.pc opencv.pc
RUN python -c "from patchmatch import patch_match"

ENTRYPOINT ["bash", "-c"]

CMD ["python3 scripts/invoke.py --web --host 0.0.0.0"]
