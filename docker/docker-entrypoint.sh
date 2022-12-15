#!/bin/bash
set -eu -o pipefail

# The entrypoint script will try to configure the InvokeAI runtime directory if necessary
# It should be overridden in scenarios where automatic configuration is not desirable

# This is set in the Dockerfile
cd ${INVOKEAI_SRC}

# testing for model files and config file is sufficient to determine if we need to configure
# if this test falls though, the internal emergency_model_reconfigure will be the fallback
if [[ ! -d "${INVOKEAI_ROOT}/models/ldm/stable-diffusion-v1" ]] ||
   [[ -z $(ls -A "${INVOKEAI_ROOT}/models/ldm/stable-diffusion-v1") ]] ||
   [[ ! -f "${INVOKEAI_ROOT}/invokeai.init" ]]; then
    python3 ./scripts/configure_invokeai.py --yes
fi

exec "$@"
