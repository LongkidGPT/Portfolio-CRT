#!/usr/bin/env python3

import unittest
from pathlib import Path

from PIL import Image


class GeneratedAlphaQualityTest(unittest.TestCase):
    def test_neutral_frame_has_a_tight_antialiased_edge(self) -> None:
        frame = (
            Path(__file__).resolve().parents[1]
            / "public"
            / "kv"
            / "frames"
            / "frame-065.webp"
        )
        alpha = Image.open(frame).convert("RGBA").getchannel("A")
        partial_pixels = sum(1 for value in alpha.getdata() if 0 < value < 255)

        self.assertLess(
            partial_pixels,
            15_000,
            f"soft alpha halo is too broad: {partial_pixels} partial pixels",
        )


if __name__ == "__main__":
    unittest.main()
