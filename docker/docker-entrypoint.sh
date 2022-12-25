#!/bin/bash
set -eu -o pipefail

# The entrypoint script will try to configure the InvokeAI runtime directory if necessary
# Where automatic configuration is not desirable it can be bypassed by overriding the docker entrypoint
# --skip-setup CLI switch will bypass the preflight checks, e.g.:
# docker run --rm -it <this image> --skip-setup python3

# Change the unprivileged user's UID to the given UID
# UID 1000 is chosen as default due to popularity
USER=invoke
USER_ID=${CONTAINER_UID:-1000}
usermod -u ${USER_ID} ${USER} 1>/dev/null

setup() {
    # testing for model files and config file is sufficient to determine if we need to configure
    # if this test falls though, the internal emergency_model_reconfigure will be the fallback
    if [[ ! -d "${INVOKEAI_ROOT}/models/ldm/stable-diffusion-v1" ]] ||
    [[ -z $(ls -A "${INVOKEAI_ROOT}/models/ldm/stable-diffusion-v1") ]] ||
    [[ ! -f "${INVOKEAI_ROOT}/invokeai.init" ]]; then
        python3 ./scripts/configure_invokeai.py --yes
    fi
}

# This is set in the Dockerfile
cd ${INVOKEAI_SRC}

# special switch will skip all preflight checks and runtime dir initialization
if [[ $1 != "--skip-setup" ]]; then
    setup
else
    shift
fi

exec "$@"
