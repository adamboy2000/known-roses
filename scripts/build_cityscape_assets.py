"""Export cityscape layers and a matching poster using the existing camera.
--evening exports the approved darker option without replacing prior artwork.
"""
from pathlib import Path
import argparse, hashlib, json
from PIL import Image
import numpy as np

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--evening', action='store_true')
args = parser.parse_args()
name = 'cityscape-evening' if args.evening else 'cityscape'
out = root / 'public/rose-runtime' / name
out.mkdir(parents=True, exist_ok=True)
background_source = 'artwork/cityscape-evening-background.png' if args.evening else 'artwork/cityscape-background.png'
background = Image.open(root / background_source).convert('RGBA').resize((1672, 941), Image.Resampling.LANCZOS)
background.convert('RGB').save(out / 'background.webp', 'WEBP', quality=90, method=6)
if args.evening:
    foreground = Image.open(root / 'artwork/cityscape-evening-foreground.png').convert('RGBA')
    assert foreground.getextrema()[3] == (0, 255), 'Foreground must retain real transparency.'
    foreground = foreground.convert('RGBa').resize((1448, 1086), Image.Resampling.LANCZOS).convert('RGBA')
    foreground.save(out / 'foreground.webp', 'WEBP', quality=92, method=6)
    foreground_path = out / 'foreground.webp'
else:
    foreground_path = root / 'public/rose-runtime/red/foreground.webp'
# Bake the exact decoded runtime layers so loading/reduced-motion posters agree.
background = Image.open(out / 'background.webp').convert('RGBA')
foreground = Image.open(foreground_path).convert('RGBA')

def plane(image, width, x, y):
    scale = width / image.width
    return image.convert('RGBa').transform((1920, 1080), Image.Transform.AFFINE,
        (1/scale, 0, -x/scale, 0, 1/scale, -y/scale), Image.Resampling.BICUBIC).convert('RGBA')

base = plane(background, 1920 * 1.18, (1920 - 1920 * 1.18)/2, -10)
front = plane(foreground, 1200, 980 - 1200 * .505, 515)
frame = Image.alpha_composite(base, front)
assert np.asarray(frame)[:, :, 3].min() == 255
frame.convert('RGB').crop((40, 0, 1920, 1080)).save(out / 'poster.webp', 'WEBP', quality=90, method=6)
manifest = {p.name: {'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in out.iterdir() if p.is_file()}
(root / 'deliverables' / f'{name}-assets.json').write_text(json.dumps(manifest, indent=2))
print(json.dumps(manifest, indent=2))
