#!/bin/bash
set -e -o pipefail

#######################################################################################################################
# This entrypoint script will by default try to configure the InvokeAI runtime directory first, if necessary.
# It will then run the CMD as defined by the Dockerfile, unless overridden.
# Where automatic configuration and/or dropping into the unprivileged user is not desirable at all,
# this entrypoint can be bypassed by overriding the ENTRYPOINT directive.
#
# Passing the --skip-setup CLI switch will bypass the config directory "preflight check" completely:
#   docker run --rm -it <this image> --skip-setup invokeai
#
# Setting the CONTAINER_UID envvar will ensure that any files created by the container in a mounted volume
# are owned by the given UID:
#   docker run --rm -it -v /some/path:/invokeai -e CONTAINER_UID=$(id -u) <this image>
########################################################################################################################

# Change the unprivileged user's UID to the given UID
# UID 1000 is chosen as default due to popularity
USER=invoke
USER_ID=${CONTAINER_UID:-1000}
usermod -u ${USER_ID} ${USER} 1>/dev/null

setup() {
    # testing for model files and config file is sufficient to determine if we need to configure
    # if this test falls though, the internal emergency_model_reconfigure will be the fallback
    if [[ ! -d "${INVOKEAI_ROOT}/models" ]] ||
    [[ -z $(ls -A "${INVOKEAI_ROOT}/models") ]] ||
    [[ ! -f "${INVOKEAI_ROOT}/invokeai.init" ]]; then
        mkdir -p ${INVOKEAI_ROOT}
        chown --recursive ${USER} ${INVOKEAI_ROOT} || true
        gosu ${USER} invokeai-configure --yes
    fi
}

# This is a workaround specifically for running this image in RunPod.
# Install the openssh service so that SCP can be used to copy files to/from the image.
# This is not an *explicit* test for RunPod, but RunPod sets this environment variable
# if the public key is configured in settings.
# consider exposing a separate env var or another control for this purpose?
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

# special switch will skip all preflight checks and runtime dir initialization
if [[ $1 != "--skip-setup" ]]; then
    setup
else
    shift
fi

cd ${INVOKEAI_ROOT}

exec gosu ${USER} "$@"
