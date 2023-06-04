#!/bin/bash
set -e -o pipefail

# This script will configure the InvokeAI runtime directory first, if necessary.
# It will then run the CMD as defined by the Dockerfile, unless overridden.
# Override using `docker run --entrypoint ...` to bypass this script.
#
# Pass the --skip-setup CLI switch to bypass the config directory "preflight check":
#   docker run --rm -it <this image> --skip-setup invokeai
# Ensure that the INVOKEAI_ROOT envvar points to a valid runtime directory in this case.
#
# Set the CONTAINER_UID envvar (optional) to ensure that any files
# created by the container are owned by the given UID:
#   docker run --rm -it -v /some/path:/invokeai -e CONTAINER_UID=$(id -u) <this image>
# User ID 1000 is chosen as default due to popularity on Linux systems, but you can
# change it if different on your system. It might be 501 on MacOS.

USER_ID=${CONTAINER_UID:-1000}
USER=invoke
usermod -u ${USER_ID} ${USER} 1>/dev/null

setup() {
    # testing for model files and config file is sufficient to determine if we need to configure
    if [[ ! -d "${INVOKEAI_ROOT}/models" ]] ||
    [[ -z $(ls -A "${INVOKEAI_ROOT}/models") ]]; then
        mkdir -p ${INVOKEAI_ROOT}
        chown --recursive ${USER} ${INVOKEAI_ROOT} || true
        gosu ${USER} invokeai-configure --yes
    fi
}


#### Runpod-specific:
# We do not install openssh-server in the image by default, but it is useful to have in Runpod,
# so that SCP can be used to copy files to/from the image.
# Setting the $PUBLIC_KEY env var in Runpod enables SSH access.
if [[ -v "PUBLIC_KEY" ]] && [[ ! -d "${HOME}/.ssh" ]]; then
    apt-get update
    apt-get install -y openssh-server
    pushd $HOME
    mkdir -p .ssh
    echo ${PUBLIC_KEY} > .ssh/authorized_keys
    chmod -R 700 .ssh
    popd
    service ssh start
fi

# This special switch will skip all preflight checks and runtime dir initialization.
# It must be passed first to be recognized.
if [[ $1 != "--skip-setup" ]]; then
    setup
else
    shift
fi

cd ${INVOKEAI_ROOT}

exec gosu ${USER} "$@"
