#!/usr/bin/env python3
"""Build images/portrait.webp from images/portrait.png with a transparent background.

The hero portrait sits on a dark stage, so the studio background has to go.
This script keys it out, keeps the hair/shoulder edges soft, trims the empty
margin and writes a resized WebP with an alpha channel. The original PNG is
never modified, so it stays the master copy.

Usage
-----
    python3 tools/portrait_webp.py                 # key the background out
    python3 tools/portrait_webp.py --mode arch     # soft capsule mask instead
    python3 tools/portrait_webp.py --tolerance 34  # keep more of the background
    python3 tools/portrait_webp.py --src other.png --out /tmp/other.webp

Only Pillow is required. Exit code is 0 on success, 1 when the source is
missing or the key looks wrong (the report says which).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SRC = ROOT / "images" / "portrait.png"
DEFAULT_OUT = ROOT / "images" / "portrait.webp"

# Sentinel colour used while flood-filling; never survives into the output.
KEY = (255, 0, 255)


def key_alpha(img: Image.Image, tolerance: int, step: int, depth: float) -> Image.Image:
    """Return an alpha mask: background reachable from the border is removed.

    Flood-filling from edge seeds (rather than keying a global colour) keeps
    bright interior areas such as the shirt, because they are not connected to
    the edge of the frame. The bottom edge is left alone and the side seeds stop
    at ``depth`` of the height: shoulders and crossed arms usually run off the
    bottom of a portrait, and keying from there would eat the subject.
    """
    rgb = img.convert("RGB")
    width, height = rgb.size
    px = rgb.load()
    side_limit = int(height * depth)

    seeds = []
    for x in range(0, width, step):
        seeds.append((x, 0))
    for y in range(0, side_limit, step):
        seeds.extend(((0, y), (width - 1, y)))

    for seed in seeds:
        if px[seed] == KEY:
            continue
        ImageDraw.floodfill(rgb, seed, KEY, thresh=tolerance)

    alpha = Image.new("L", (width, height), 255)
    ap = alpha.load()
    for y in range(height):
        for x in range(width):
            if px[x, y] == KEY:
                ap[x, y] = 0

    # Pull the edge in by a pixel, then soften it: removes the pale fringe a
    # white studio background leaves around hair and shoulders.
    alpha = alpha.filter(ImageFilter.MinFilter(3))
    alpha = alpha.filter(ImageFilter.GaussianBlur(1.1))
    return alpha


def arch_alpha(img: Image.Image, feather: float) -> Image.Image:
    """Soft capsule mask used when keying the background is not clean."""
    width, height = img.size
    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask)
    radius = width // 2
    draw.rounded_rectangle((0, 0, width - 1, height - 1), radius=radius, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(feather))


def coverage(alpha: Image.Image) -> float:
    """Share of pixels that stay visible, as a percentage."""
    hist = alpha.histogram()
    kept = sum(count for value, count in enumerate(hist) if value > 8)
    return kept * 100.0 / (alpha.size[0] * alpha.size[1])


def fit(img: Image.Image, max_width: int, max_height: int) -> Image.Image:
    scale = min(max_width / img.size[0], max_height / img.size[1], 1.0)
    if scale >= 1.0:
        return img
    size = (max(1, round(img.size[0] * scale)), max(1, round(img.size[1] * scale)))
    return img.resize(size, Image.LANCZOS)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--src", type=Path, default=DEFAULT_SRC, help="source PNG")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help="output WebP")
    parser.add_argument(
        "--mode", choices=("key", "arch"), default="key",
        help="key: remove the background; arch: soft capsule mask",
    )
    parser.add_argument("--tolerance", type=int, default=28, help="flood-fill tolerance (0-80)")
    parser.add_argument("--step", type=int, default=16, help="spacing of edge seeds in px")
    parser.add_argument(
        "--seed-depth", type=float, default=0.68,
        help="share of the height to seed from the side edges (default 0.68)",
    )
    parser.add_argument("--feather", type=float, default=10.0, help="arch blur radius in px")
    parser.add_argument("--max-width", type=int, default=900)
    parser.add_argument("--max-height", type=int, default=1150)
    parser.add_argument("--quality", type=int, default=82)
    args = parser.parse_args(argv)

    if not args.src.exists():
        print(f"error: {args.src} not found - upload the portrait there first.")
        print("       the hero shows its fallback monogram until the file exists.")
        return 1

    source = Image.open(args.src).convert("RGBA")
    if args.mode == "arch":
        alpha = arch_alpha(source, args.feather)
    else:
        alpha = key_alpha(source, args.tolerance, args.step, args.seed_depth)

    source.putalpha(alpha)

    box = alpha.getbbox()
    if box:
        pad = 8
        box = (
            max(0, box[0] - pad),
            max(0, box[1] - pad),
            min(source.size[0], box[2] + pad),
            min(source.size[1], box[3] + pad),
        )
        source = source.crop(box)

    source = fit(source, args.max_width, args.max_height)

    share = coverage(alpha)
    if args.mode == "key" and not 8.0 <= share <= 92.0:
        print(f"key looks wrong ({share:.1f}% visible) - nothing written.")
        print("try --tolerance 20 (or lower), --seed-depth 0.55, or --mode arch.")
        return 2

    args.out.parent.mkdir(parents=True, exist_ok=True)
    source.save(args.out, "WEBP", quality=args.quality, method=6, alpha_quality=100)

    size_kb = args.out.stat().st_size / 1024
    print(f"wrote {args.out.relative_to(ROOT) if args.out.is_relative_to(ROOT) else args.out}")
    print(f"  {source.size[0]}x{source.size[1]}px, {size_kb:.0f} KB, mode={args.mode}")
    print(f"  visible pixels: {share:.1f}%")
    return 0


if __name__ == "__main__":
    sys.exit(main())
