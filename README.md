# Known Roses

A hobby project for sending a little thought — a real rose.

- Live site: https://known-roses.vercel.app/
- Recipient preview: https://known-roses.vercel.app/rose/claim

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
