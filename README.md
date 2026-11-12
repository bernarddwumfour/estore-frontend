This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Local store selection

Run `npm run dev:iplug` for the iPlug storefront or `npm run dev:oak` for
Oak & Loom. These commands load `.env.iplug` or `.env.oakandloom` respectively;
both currently point to the local API on port 8000. Start the matching backend
profile using `manage_store.py` in the backend project. These environment
files are local and ignored by Git.


## TyrePapa storefront

Run `npm run dev:tyrepapa -- --port 3002` for TyrePapa. It loads the local,
ignored `.env.tyrepapa` profile:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_STORE=tyrepapa
NEXT_DEV_DIST_DIR=.next-tyrepapa
```

The frontend profile currently points to `http://localhost:8000/api`. The
backend selector has profiles for iPlug and Oak & Loom only; TyrePapa does not
yet have a separate backend environment/database profile. The frontend will
use whichever API is running on port 8000, so it does not isolate catalog or
customer data by itself. The separate Next.js build directory lets TyrePapa
run alongside the other storefronts. Restart the dev server after changing an
environment profile.

For deployment, commit and push `src/templates/tyrepapa`, `public/tyrepapa`,
and the storefront registry changes before building. The local `.env.tyrepapa`
file is ignored by Git and is not sent with the deployment. Set
`NEXT_PUBLIC_STORE=tyrepapa` and `NEXT_PUBLIC_API_BASE_URL` to the public API
URL in the deployment project's build environment, then trigger a new build.
A runtime-only change to `NEXT_PUBLIC_STORE` cannot switch an already built
frontend. Do not use `localhost:8000` for the deployed API URL; that address
refers to each visitor's own machine. `NEXT_DEV_DIST_DIR` is only for local
preview isolation and can be left unset in deployment.

The template lives in `src/templates/tyrepapa`. Its homepage, navigation, footer,
and product cards override the baseline; remaining pages currently inherit the
default template. Navigation search, bag, accounts, and product actions reuse
shared storefront behavior. Catalog failures and empty catalogs show a labeled
collection preview, with no fabricated prices, stock, reviews, or discounts.

Campaign artwork lives in `public/tyrepapa`; replace illustrative imagery with
approved product photography before preparing a live store. See
`src/templates/tyrepapa/ASSETS.md` for asset notes.
