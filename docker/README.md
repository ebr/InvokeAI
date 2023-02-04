# InvokeAI in a Docker Container

All commands are to be run from the `docker` directory: `cd docker`

Linux users might need to  `sudo apt install docker-compose-plugin` (if errors about lack of buildkit support prevent the build)

Mac users: 1) Ensure Docker has at least 16GB RAM; 2) Enable VirtioFS for file sharing; 3) enable "`docker-compose` V2" support

## Quickstart

1. Make a copy of `example.env` and name it `.env` (`cp example.env .env` (Mac/Linux) or `copy example.env .env` (Windows))
2. `docker-compose up`

The image will be built automatically if needed.

The runtime directory (holding models and outputs) will be created in your home directory, under `~/invokeai`, populated with necessary content (you will be asked a couple of questions during setup)

### Use a GPU

- Linux is *recommended* for GPU support in Docker.
- WSL2 is *required* for Windows.
- only `x86_64` architecture is supported.

The Docker daemon on the system must be already set up to use the GPU. In case of Linux, this involves installing `nvidia-docker-runtime` and configuring the `nvidia` runtime as default. Steps will be different for AMD. Please see Docker documentation for the most up-to-date instructions for using your GPU with Docker.

If the `nvidia` runtime is not the default on your system, uncomment the `runtime: nvidia` line in `docker-compose.yml` to use your GPU from a container.

## Customize

Check the `.env` file. It contains environment variables for running in Docker. Fill it in with your own values. Next time you run `docker-compose up`, your custom values will be used.

You can also set these values in `docker-compose.yml` directly, but `.env` will help avoid conflicts when code is updated.

Example:

```
LOCAL_ROOT_DIR=/Volumes/HugeDrive/invokeai
HUGGINGFACE_TOKEN=the_actual_token
CONTAINER_UID=1000
GPU_DRIVER=cuda
```

## Moar Customize!

See the `docker-compose.yaml` file. The `command` instruction can be uncommented and used to run arbitrary startup commands. Some examples below.


#### Turn off the NSFW checker

```
command:
  - invokeai
  - --no-nsfw_check
  - --web
  - --host 0.0.0.0
```


### Reconfigure the runtime directory

Can be used to download additional models from the supported model list

In conjunction with `LOCAL_ROOT_DIR` can be also used to create bran

```
command:
  - invokeai-configure
  - --yes
```


#### Run in CLI mode

This container starts InvokeAI in web mode by default.

Override the `command` and run `docker compose:

```
command:
   - invoke
```

Then attach to the container from another terminal:

```
$ docker attach $(docker compose ps invokeai -q)

invoke>
```

Enjoy using the `invoke>` prompt. To detach from the container, type `Ctrl+P` followed by `Ctrl+Q` (this is the escape sequence).
