# Cityscape option

Generated with the built-in image generation tool, using `garden-background.png` as the edit target. The original sunset plate remains untouched. Runtime foreground and camera motion are shared by both versions.

## Final prompt

Use case: precise-object-edit. Asset type: photographic background plate for a two-plane rose website hero and checkout image. Input image 1 is the EDIT TARGET (garden-background.png). Replace only the distant tree silhouettes with a believable generic American city skyline at dusk, visible across the central horizon. Keep the existing garden of roses, foreground foliage, composition, low camera viewpoint, purple-blue sky, peach sunset glow on the left, warm side lighting and understated photographic exposure. A cohesive actual city: mid-rise masonry neighborhoods with a small cluster of modern glass towers, realistic scale and perspective, a few softly glowing windows, atmospheric depth; no recognizable famous landmark, no fantasy mega-city, no duplicated buildings, no billboards or logos. City buildings should occupy the middle distance at roughly 40–70% of image height, clearly readable behind the central rose that will be composited later. Keep a natural, quiet planted rooftop-garden feel. Output only the wide 16:9 background photograph, no central foreground hero rose, no text, no frame. Preserve the subtle luxurious evening mood of the supplied photograph.

## Integration

Source: `artwork/cityscape-background.png`.

Runtime: `public/rose-runtime/cityscape/background.webp` and `poster.webp`.

Preview: `/cityscape`; recipient preview: `/cityscape/rose/claim`.

Export with `python3 scripts/build_cityscape_assets.py`.
