"""Export the generated city plate and a matching poster using the existing camera.
The original sunset files and the foreground layer remain untouched.
"""
from pathlib import Path
import hashlib, json
from PIL import Image
import numpy as np

root = Path(__file__).resolve().parents[1]
out = root / 'public/rose-runtime/cityscape'
out.mkdir(parents=True, exist_ok=True)
background = Image.open(root / 'artwork/cityscape-background.png').convert('RGBA').resize((1672, 941), Image.Resampling.LANCZOS)
foreground = Image.open(root / 'public/rose-runtime/red/foreground.webp').convert('RGBA')
background.convert('RGB').save(out / 'background.webp', 'WEBP', quality=90, method=6)

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
(root / 'deliverables/cityscape-assets.json').write_text(json.dumps(manifest, indent=2))
print(json.dumps(manifest, indent=2))
