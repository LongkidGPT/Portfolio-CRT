#!/usr/bin/env python3
"""Remove a still image background with a consistent local segmentation model."""

import argparse
from pathlib import Path

from PIL import Image
from rembg import new_session, remove


def tighten_alpha(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")

    def remap(value: int) -> int:
        if value <= 96:
            return 0
        if value >= 192:
            return 255
        progress = (value - 96) / 96
        smooth = progress * progress * (3 - 2 * progress)
        return round(smooth * 255)

    rgba.putalpha(alpha.point(remap))
    return rgba


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--model", default="birefnet-general-lite")
    parser.add_argument("--alpha-matting", action="store_true")
    args = parser.parse_args()

    session = new_session(args.model)
    sources = (
        sorted(args.input.glob("*.png")) if args.input.is_dir() else [args.input]
    )
    if not sources:
        raise SystemExit(f"No PNG frames found in {args.input}")

    output_is_dir = args.input.is_dir()
    if output_is_dir:
        args.output.mkdir(parents=True, exist_ok=True)
    else:
        args.output.parent.mkdir(parents=True, exist_ok=True)

    for index, source_path in enumerate(sources, start=1):
        output_path = args.output / source_path.name if output_is_dir else args.output
        with Image.open(source_path) as source:
            options = {"session": session}
            if args.alpha_matting:
                options.update(
                    alpha_matting=True,
                    alpha_matting_foreground_threshold=235,
                    alpha_matting_background_threshold=15,
                    alpha_matting_erode_size=3,
                )
            result = remove(source.convert("RGB"), **options)
            tighten_alpha(result).save(output_path)
        print(f"[{index}/{len(sources)}] {source_path.name}", flush=True)


if __name__ == "__main__":
    main()
