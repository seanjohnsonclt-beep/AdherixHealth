"""
Adherix advisor headshot processor.
Run after saving raw photos to public/:
  public/advisor-clair.png  (rectangular headshot, grey bg)
  public/advisor-brandon.png (circular crop on dark bg)

Outputs clean 400x400 face-centered squares ready for the CSS circle crop.
"""

from PIL import Image
import os, sys

PUBLIC = os.path.join(os.path.dirname(__file__), "public")

def crop_to_square_top(img: Image.Image, size=400) -> Image.Image:
    """Square crop biased toward the upper portion (face area), then resize."""
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    # Bias upward: take top 80% of height range so face is centred in circle
    top = max(0, int((h - side) * 0.25))
    img = img.crop((left, top, left + side, top + side))
    return img.resize((size, size), Image.LANCZOS)

def strip_dark_background(img: Image.Image, size=400) -> Image.Image:
    """
    Brandon's photo: circular face on dark background.
    Find the bright circular region, crop tight to it, return square.
    Falls back to simple top-biased square crop if detection fails.
    """
    import numpy as np  # type: ignore

    try:
        arr = np.array(img.convert("RGB"))
        # Dark pixels = value < 60 in all channels
        brightness = arr.mean(axis=2)
        bright_mask = brightness > 60
        rows = bright_mask.any(axis=1)
        cols = bright_mask.any(axis=0)
        row_indices = np.where(rows)[0]
        col_indices = np.where(cols)[0]
        if len(row_indices) == 0 or len(col_indices) == 0:
            raise ValueError("No bright region found")
        top, bottom = int(row_indices[0]), int(row_indices[-1])
        left, right = int(col_indices[0]), int(col_indices[-1])
        # Pad slightly
        pad = 10
        top    = max(0, top - pad)
        left   = max(0, left - pad)
        bottom = min(img.height, bottom + pad)
        right  = min(img.width, right + pad)
        cropped = img.crop((left, top, right, bottom))
        # Make square from cropped region
        return crop_to_square_top(cropped, size)
    except Exception as e:
        print(f"  [strip_dark_background] fallback to simple crop: {e}")
        return crop_to_square_top(img, size)

def process(filename: str, mode: str):
    path = os.path.join(PUBLIC, filename)
    if not os.path.exists(path):
        print(f"  SKIP: {filename} not found in public/")
        return False
    img = Image.open(path).convert("RGBA")
    if mode == "clair":
        out = crop_to_square_top(img.convert("RGB"), 400).convert("RGBA")
    elif mode == "brandon":
        out = strip_dark_background(img, 400).convert("RGBA")
    else:
        out = crop_to_square_top(img.convert("RGB"), 400).convert("RGBA")
    out.save(path, "PNG")
    print(f"  OK: {filename} → 400x400 saved")
    return True

if __name__ == "__main__":
    ok = True
    print("Processing advisor-clair.png ...")
    ok &= process("advisor-clair.png", "clair")
    print("Processing advisor-brandon.png ...")
    ok &= process("advisor-brandon.png", "brandon")
    if not ok:
        sys.exit(1)
    print("\nAll done. Reload localhost:3000 to see the result.")
