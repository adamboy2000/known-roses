# Cityscape night lighting

Mode: built-in image generation, lighting edits. The user approved `cityscape-night-preview.png` before this integration. Original sunset, first cityscape and evening artwork remain preserved.

## Saved assets

- [Approved flat](cityscape-night-preview.png)
- [Night background](cityscape-night-background.png)
- [Night transparent rose](cityscape-night-foreground.png)

## Background prompt

Use case: lighting-weather.
Asset type: opaque cityscape background plate for an existing layered website animation.
Input image 1 is the EDIT TARGET, the existing evening background plate with a skyline and rose garden. Input image 2 is the APPROVED NIGHT LIGHTING REFERENCE, a flat composite containing a central red rose.
Change ONLY the lighting and color grade of image 1 to match the night exposure and colors in image 2 closely. Preserve image 1's exact framing, skyline architecture, building placement, horizon height, rose garden objects, foliage geometry and aspect ratio. Do not copy the central red rose from image 2 into this background; it is a separate animation layer.
The sky must read as night: upper two thirds almost-black charcoal with a faint desaturated navy undertone, near RGB 4/7/12 at the top. Only a thin barely perceptible gray-violet remnant of dusk on the far-left horizon. Remove the broad blue twilight and all peach, pink or orange sunset. Buildings are dark believable silhouettes with a few dim neutral-warm windows, no bright gold sparkle. Garden foliage mostly deep green-black shadow with restrained cool ambient detail. Match the reference, not a brighter interpretation.
Preserve all objects and edge-to-edge composition. No red hero rose, new stars, moon, clouds, lights, architecture, text, logos, UI or borders. Output one opaque background plate.

## Foreground prompt

Use case: lighting-weather.
Asset type: transparent rose foreground layer for an existing website animation.
Input image 1 is the EDIT TARGET, a transparent cutout of the evening red rose, buds, leaves and white roses. Input image 2 is the APPROVED NIGHT LIGHTING REFERENCE, a flat cityscape composition.
Change ONLY the lighting and color grade of image 1 to match the rose and foliage in image 2. Preserve the exact rose size and position, petal shape, stems, buds, white roses, leaf placement, silhouette, cutout edges, transparent gaps and framing of image 1. No redraw, repositioning or crop.
The rose should have the reference's deeper wine-crimson petals, dimmer softer highlights and subtle cool blue-gray ambient reflections on outward-facing petal edges and leaves. Retain enough velvety petal detail for it to remain the focal point of the night scene. Avoid bright red daylight illumination. Keep it naturally red, never glowing blue, purple or neon. Foliage is deep green-black with subdued cool detail; remove golden rim light and direct sunset illumination. White roses should have dim cool ivory lighting, no bright white or golden glare.
Output only the recolored transparent cutout. Preserve genuine alpha including every gap between leaves, do not add a black matte, skyline, sky, backdrop, text or frame. Preserve the input aspect ratio. Match the approved reference closely.

## Integration

Runtime layers and matching poster: `public/rose-runtime/cityscape-night/`.

Export with `python3 scripts/build_cityscape_assets.py --night`. Composition and camera movement are unchanged.

Live preview: `/cityscape`; recipient page: `/cityscape/rose/claim`. Default sunset: `/`.
