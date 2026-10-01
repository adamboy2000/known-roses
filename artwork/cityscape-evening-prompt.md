# Cityscape evening refinement

Generated with the built-in image generation tool. The approved flat is `cityscape-evening-approved.png`. The evening background and transparent rose are isolated from both the original sunset and the first cityscape assets. Their framing and camera remain the same.

## Background prompt

Use case: lighting-weather.
Asset type: background plate for an existing layered website hero animation.
Image 1 is the EDIT TARGET: the original city skyline and rose garden background, with no central red rose. Image 2 is the APPROVED LIGHTING REFERENCE: a darker flat composition approved by the user.
Change only the lighting, sky color and color grade of image 1 to match image 2 closely. Preserve the exact framing, skyline architecture, building placement, horizon height, background roses and all foliage geometry of image 1. Do not copy the red rose from image 2 into this background plate. The central red rose is a separate animation layer.
Upper third very dark charcoal navy approaching black. Smooth natural falloff into smoky blue-gray sky, with just a faint muted blush-gray glow low on the far-left horizon. Remove the vivid orange/pink sunset and saturated cobalt/purple. Dim neutral-warm window lights, no festive golden sparkle. Garden foliage should be dark natural green, with subtle cool ambient detail rather than yellow rim light.
A quiet, sophisticated late evening city mood exactly like image 2. No new architecture, clouds, stars, moon, objects, text or logo. Preserve image 1 aspect ratio and edge-to-edge composition. Output one full opaque photographic background plate.

## Foreground prompt

Use case: lighting-weather.
Asset type: transparent foreground rose layer for an existing website animation.
Image 1 is the EDIT TARGET: the red rose and foliage cutout on a transparent background. Image 2 is the APPROVED LIGHTING REFERENCE, showing the same rose in a quiet darker evening city scene.
Change ONLY the light and color grade of image 1 to match the rose and foliage lighting in image 2. Preserve the exact rose size and position, petal geometry, stems, buds, white roses, leaf placement, silhouette, cutout edges, transparent negative space and framing of image 1. Do not redraw, crop or reposition any object.
Keep the rose naturally crimson with visible velvety petal detail. Remove yellow/golden glare from the foliage; dark natural green with softer cool ambient light, modest highlights and no festive shine. Preserve enough detail so the rose reads beautifully against a dark city.
Background must remain genuinely transparent, including all gaps between leaves. Do not add skyline, sky, shadow backdrop, black matte, text or frame. Match original aspect ratio. Output only the recolored transparent cutout.

## Integration

Sources: `cityscape-evening-background.png` and `cityscape-evening-foreground.png`.

Runtime: `public/rose-runtime/cityscape-evening/` (background, foreground, and matching poster).

Export with `python3 scripts/build_cityscape_assets.py --evening`.

Live comparison: `/cityscape`; matching recipient page: `/cityscape/rose/claim`. The original sunset remains `/`.
