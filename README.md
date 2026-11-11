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


## Third template: beauty / velux

Run `npm run dev:beauty -- --port 3002` for the third template. Like the
other stores, it loads a local, ignored environment profile (`.env.beauty`):

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_STORE=beauty
NEXT_DEV_DIST_DIR=.next-beauty
```

The API URL matches the current Oak & Loom backend. Only the template changes;
the catalog, authentication, wishlist, cart, and database remain shared.
The separate build directory allows both store previews to run together.
Restart the dev server after changing an environment profile. When the dedicated
beauty backend is ready, change the API URL in `.env.beauty`.

The template lives in `src/templates/beauty`. Its homepage, navigation, footer,
and product cards override the baseline; remaining pages currently inherit the
default template. Navigation search, bag, accounts, and product actions reuse
shared storefront behavior. Catalog failures and empty catalogs show a labeled
collection preview, with no fabricated prices, stock, reviews, or discounts.

Campaign artwork is illustrative and lives in `public/beauty`; replace it with
approved product photography when preparing a live store. See
`src/templates/beauty/ASSETS.md` for generation prompts and provenance.
