# Known Roses

A hobby project for sending a little thought — a real rose.

- Live site: https://known-roses.vercel.app/
- Recipient preview: https://known-roses.vercel.app/rose/claim
- Cityscape alternative: https://known-roses.vercel.app/cityscape
- Cityscape recipient preview: https://known-roses.vercel.app/cityscape/rose/claim

Both options share the same composition, camera motion and checkout. The cityscape uses the approved night lighting: an almost-black sky, a faint trace of dusk and deeper crimson petals with cool ambient reflections. The original sunset remains the default; first cityscape and evening artwork are also preserved. Delivery locations are San Francisco, San Diego, Los Angeles, Orange County, Seattle, Chicago, Denver, Austin and Dallas.

Night artwork and prompts are in `artwork/cityscape-night-*`; runtime assets are in `public/rose-runtime/cityscape-night/`. Export with `python3 scripts/build_cityscape_assets.py --night`.

## Run locally

Install Node.js 20.9+ and pnpm, then:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:3000. Use `pnpm build` for a production build and `pnpm typecheck` to check types.

## Project

Next.js, React, TypeScript and GSAP. `app/` contains routes and styling; `components/` contains checkout, recipient and motion components; `lib/` contains validation, assets and temporary invite preview helpers; `public/` contains site assets.

## Demo behavior

Payments are simulated. No payment is charged, no order is submitted, and no delivery is arranged. Recipient preview data stays in the sender's browser for 15 minutes; cross-device prefill needs a backend invite service. Addresses are not saved. SMS and email buttons open drafts for the sender to review and send.

## Fonts

Inter and Libre Baskerville use the open licenses in `licenses/`. Rhymes Text and Switzer are optional locally installed fonts; their proprietary binaries are not included.
