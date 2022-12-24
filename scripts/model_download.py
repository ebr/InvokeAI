#!/usr/bin/env python
"""
Script to download a model from Huggingface and add it to the current models.yaml
"""

import argparse
import os
from pathlib import Path
import yaml
from pprint import pprint as print
from configure_invokeai import hf_download_with_resume

def add_model_to_yaml(model_name, config_yaml, filepath, vaepath=None):
    with open(config_yaml, "r") as f:
        cfg = yaml.safe_load(f)
    ## use the 1.5 config
    src_config = "stable-diffusion-1.5"

    try:
        new_model_conf = {}
        for param in ["config", "width", "height"]:
            new_model_conf[param] = cfg[src_config][param]

        new_model_conf["weights"] = str(Path(filepath).expanduser().resolve())

        if vaepath is not None:
            new_model_conf["vae"] = str(Path(vaepath).expanduser().resolve())
        else:
            new_model_conf["vae"] = cfg[src_config]["vae"]

        cfg[model_name] = new_model_conf

        with open(config_yaml, "w") as f:
            yaml.safe_dump(cfg, f)

    except Exception as e:
        print(e)
        raise



if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    from ldm.invoke.globals import Globals

    root = Path(Globals.root)
    ckpt_dir = root / "models/ldm/stable-diffusion-v1/"
    models_yaml = root / "configs/models.yaml"

    parser.add_argument(
        "-r", "--repo", dest="repo", help="HF repo name"
    )
    parser.add_argument(
        "-f", "--file", dest="file", help="Model file name name"
    )
    parser.add_argument(
        "-v", "--vae", dest="vae", help="VAE file", default=None
    )
    parser.add_argument(
        "-d",
        "--destination",
        dest="dest_path",
        help="Download destination",
        default=str(ckpt_dir.expanduser().resolve()),
    )
    parser.add_argument(
        "-y",
        "--yaml",
        dest="models_yaml_path",
        help="Path to models.yaml",
        default=str(models_yaml.expanduser().resolve()),
    )

    opt = parser.parse_args()

    print("Downloading model")

    hf_download_with_resume(repo_id = opt.repo, model_dir = opt.dest_path, model_name = opt.file, access_token = os.getenv("HUGGINGFACE_TOKEN"))

    if opt.vae is not None:
        hf_download_with_resume(repo_id = opt.repo, model_dir = opt.dest_path, model_name = opt.vae, access_token = os.getenv("HUGGINGFACE_TOKEN"))
    vaepath = Path(opt.dest_path)/opt.vae if opt.vae is not None else None

    add_model_to_yaml(model_name = opt.repo, config_yaml = opt.models_yaml_path, filepath = Path(opt.dest_path)/opt.file, vaepath = vaepath)