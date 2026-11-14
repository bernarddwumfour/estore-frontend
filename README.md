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

## On-demand cache invalidation

Published blog post changes call `POST /api/revalidate/blog` after the backend
transaction commits. The endpoint refreshes the blog list, the Oak & Loom home
preview, and the affected post URLs, including an old URL after a slug change.
The existing five-minute cache lifetime remains a fallback if the callback
fails. Draft-only changes do not trigger a callback.

Product category saves and deletes also refresh the categories on the home
and products pages through `POST /api/revalidate/categories`.
Published product, variant, and variant image changes refresh cached listings
and the TyrePapa home collection through `POST /api/revalidate/products`.
Publishing, archiving, deleting, or moving a product also refreshes cached
category counts when it changes membership. Product detail pages fetch fresh
data on every request. Routine stock adjustments do not call this endpoint
unless a published variant crosses between in stock and out of stock.

Set the same long, random `REVALIDATE_SECRET` on the backend and frontend for
each store. Set the backend's `STOREFRONT_BASE_URL` to that store's public
frontend origin, such as `https://store.example`. The backend derives the
fixed `/api/revalidate/blog`, `/api/revalidate/categories`, and
`/api/revalidate/products` callback URLs
from that origin. For local development on port 3000, use
`STOREFRONT_BASE_URL=http://localhost:3000`.
These variables are server-only; never use a `NEXT_PUBLIC_` prefix for the
secret. Restart or redeploy both services after setting them.

The callback requires an `Authorization: Bearer <secret>` header and a JSON
body such as `{"slugs":["old-slug","new-slug"]}`. It accepts no arbitrary
cache tags or paths.

Category admin mutations return a `storefront_revalidation` status. The admin
shows “Live on store” when every configured storefront accepts the callback;
this is an acceptance message, not a check that a shopper has loaded the
refreshed page yet.

Run `npm run dev:iplug` for the iPlug storefront or `npm run dev:oak` for
Oak & Loom. These commands load `.env.iplug` or `.env.oakandloom` respectively;
both currently point to the local API on port 8000. Start the matching backend
profile using `manage_store.py` in the backend project. These environment
files are local and ignored by Git.

## Beauty storefront

Run `npm run dev:beauty -- --port 3003` to preview the Reel Spa beauty template.
It reads the shared local `.env` API settings, selects `NEXT_PUBLIC_STORE=beauty`
for this process, and writes its Next.js build files to `.next-beauty` so it can
run alongside another local storefront. It displays products from whichever API
is configured in `.env`; treatments and their sample prices are frontend-only
content in `src/templates/beauty/pages/HomePage.tsx` and need no service API.

For a deployment, set `NEXT_PUBLIC_STORE=beauty` and point
`NEXT_PUBLIC_API_BASE_URL` at the existing catalog API in that deployment's
build environment, then build and redeploy the frontend. The template does not
add or require backend routes. `NEXT_DEV_DIST_DIR` is only used by the local
preview command.


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
