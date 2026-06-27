# ZEHN Fashion — Hydrogen Storefront, Shopify Oxygen Hosted

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Shopify Hydrogen](https://img.shields.io/badge/Shopify_Hydrogen-2025.10.1-95BF47)](https://shopify.dev/custom-storefronts/hydrogen)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://react.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7.12-red)](https://reactrouter.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple)](https://vitejs.dev/)
[![GraphQL](https://img.shields.io/badge/GraphQL-16-E10098)](https://graphql.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-green)](https://nodejs.org/)

Headless e-commerce frontend for **[ZEHN Fashion](https://zehnfashion.de)** — a German menswear brand. Built with **Shopify Hydrogen**, **React Router 7**, and deployed on **Shopify Oxygen** (Cloudflare Workers). Product data, cart, checkout, and customer accounts come from **Shopify Storefront API** and **Customer Account API**; custom features (AI chat, contact email, cache webhooks) run as server routes on the same Oxygen worker.

This README is written for developers learning headless Shopify commerce, contributors, and anyone reusing patterns from this codebase.

---

## Table of contents

1. [What this project is](#what-this-project-is)
2. [Keywords & concepts](#keywords--concepts)
3. [Tech stack](#tech-stack)
4. [Architecture overview](#architecture-overview)
5. [Project structure](#project-structure)
6. [Routes & pages](#routes--pages)
7. [API endpoints](#api-endpoints)
8. [Key features](#key-features)
9. [Environment variables](#environment-variables)
10. [Getting started](#getting-started)
11. [Development workflow](#development-workflow)
12. [Testing & quality gates](#testing--quality-gates)
13. [Components & reuse guide](#components--reuse-guide)
14. [Performance & caching](#performance--caching)
15. [Deploying to Oxygen](#deploying-to-oxygen)
16. [Learning resources](#learning-resources)
17. [Conclusion](#conclusion)
18. [License](#license)

---

## What this project is

| Aspect        | Detail                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------ |
| **Type**      | Custom Shopify Hydrogen storefront (not Liquid theme)                                      |
| **Store**     | `ipnjut-hz.myshopify.com` → production at `zehnfashion.de`                                 |
| **Language**  | UI copy primarily German (`de`); code and comments in English                              |
| **Backend**   | Shopify (products, collections, cart, checkout, orders) + optional server routes on Oxygen |
| **Rendering** | SSR on first load; client navigation via React Router; Workers Cache at the edge           |

Hydrogen is Shopify’s React framework for headless storefronts. Unlike a traditional Shopify theme (Liquid in Admin), this repo is a standalone app that talks to Shopify over GraphQL. You get full control over UI, routing, and performance while Shopify handles inventory, payments, and fulfillment.

---

## Keywords & concepts

| Term                     | Meaning in this project                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Headless commerce**    | Frontend and backend are separate; Shopify is the commerce backend, this app is the frontend.           |
| **Storefront API**       | Public GraphQL API for products, collections, cart, search. Used in `loader()` functions.               |
| **Customer Account API** | OAuth-based customer login, orders, profile — routes under `/account/*`.                                |
| **Oxygen**               | Shopify’s hosting on Cloudflare Workers; `server.ts` is the worker entry.                               |
| **Loader**               | React Router server function that fetches data before a page renders (similar to `getServerSideProps`). |
| **Action**               | React Router server function for mutations (add to cart, form POST, webhooks).                          |
| **clientLoader**         | Runs in the browser to cache catalog data on back-navigation (`catalogClientLoader`).                   |
| **GraphQL codegen**      | `storefrontapi.generated.d.ts` — typed query results from Shopify schema.                               |
| **MiniOxygen**           | Local dev runtime that mimics Oxygen Workers (`npm run dev`).                                           |

---

## Tech stack

### Core

| Library                                                    | Version   | Role                                                               |
| ---------------------------------------------------------- | --------- | ------------------------------------------------------------------ |
| [@shopify/hydrogen](https://shopify.dev/docs/api/hydrogen) | 2025.10.1 | Storefront helpers, `<Image>`, cart, analytics, Oxygen integration |
| [react-router](https://reactrouter.com/)                   | 7.12.0    | Routing, loaders, actions, SSR (**not** `react-router-dom`)        |
| [react](https://react.dev/)                                | 18.3.1    | UI                                                                 |
| [graphql](https://graphql.org/)                            | 16.x      | Storefront & Admin API queries                                     |
| [vite](https://vitejs.dev/)                                | 6.x       | Dev server and production bundler                                  |
| [tailwindcss](https://tailwindcss.com/)                    | 3.4.x     | Utility-first styling                                              |
| [typescript](https://www.typescriptlang.org/)              | 5.9.x     | Type safety                                                        |

### UI & UX

| Library                                                      | Purpose                                         |
| ------------------------------------------------------------ | ----------------------------------------------- |
| **Radix UI** (`@radix-ui/react-*`)                           | Accessible dialogs, tabs, accordion, popover    |
| **embla-carousel-react**                                     | Product and category carousels                  |
| **lucide-react**                                             | Icons                                           |
| **sonner**                                                   | Toast notifications                             |
| **vaul**                                                     | Mobile drawer patterns                          |
| **class-variance-authority** + **clsx** + **tailwind-merge** | Variant-based component styling (`cn()` helper) |

### Tooling

| Tool                | Purpose                                               |
| ------------------- | ----------------------------------------------------- |
| **Shopify CLI**     | `hydrogen dev`, `hydrogen build`, `hydrogen env pull` |
| **Vitest**          | Unit tests (`app/__tests__/`)                         |
| **ESLint**          | Linting (`eslint.config.js`)                          |
| **GraphQL Codegen** | Types from Storefront API schema                      |

---

## Architecture overview

```bash
Browser
   │
   ▼
Oxygen Worker (server.ts)
   │
   ├── createHydrogenRouterContext()  ← session, cache, storefront client
   │
   └── React Router (app/routes/*.tsx)
         ├── loader()     → Shopify Storefront API (SSR)
         ├── action()     → cart mutations, webhooks, /api/*
         └── clientLoader → catalog cache + image warm (browser)
```

**Data flow example — product page:**

1. User visits `/products/some-handle`.
2. Worker runs `loader()` → GraphQL query to Shopify → HTML streamed to browser.
3. `meta()` may inject `<link rel="preload">` for the hero image.
4. React hydrates; `ZehnShopifyImage` shows skeleton then fade-in.
5. Add to cart → `action()` on cart route → Storefront API cart mutation → session cookie updated.

**There is no separate Node/Express backend.** Shopify is the product backend; Oxygen routes handle everything else (webhooks, email, AI chat).

---

## Project structure

```bash
zehn-frontend/
├── app/
│   ├── routes/              # File-based routes (pages + API)
│   ├── components/
│   │   ├── zehn/            # ZEHN brand UI (Header, Hero, filters, PDP, etc.)
│   │   └── ui/              # Shared primitives (shadcn-style Radix wrappers)
│   ├── hooks/               # React hooks (image warm, preload, cart count, …)
│   ├── lib/                 # Business logic, cache, filters, chat, tokens
│   │   └── chat/            # OpenRouter AI chat integration
│   ├── graphql/admin/       # Admin API mutations (returns — future/backoffice)
│   ├── styles/              # Global CSS (app.css, reset.css)
│   ├── __tests__/           # Vitest unit tests
│   └── root.tsx             # App shell, root loader, analytics
├── public/                  # Static assets (fonts, favicon)
├── server.ts                # Oxygen worker entry point
├── vite.config.ts
├── react-router.config.ts   # Hydrogen preset for React Router
├── storefrontapi.generated.d.ts  # Generated GraphQL types
├── .env.example             # Environment variable template
└── package.json
```

### Important `app/lib/` modules

| Module                                         | Purpose                                                                |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| `fragments.ts` / `queries.ts`                  | Shared GraphQL fragments and queries                                   |
| `design-tokens.ts`                             | Brand colors, typography tokens (Indigo, Signal orange, Space Grotesk) |
| `product-filters.ts`                           | Client-side catalog filtering (size, color, price, sort)               |
| `catalog-client-loader.ts`                     | Browser cache for catalog routes + image warm on miss                  |
| `storefront-cache-policy.ts`                   | Cache TTL rules per route type                                         |
| `storefront-cache-purge.ts`                    | Webhook-driven Workers Cache purge                                     |
| `zehn-image-preload.ts` / `zehn-image-warm.ts` | Zero-flicker image loading                                             |
| `link-prefetch.ts`                             | React Router `<Link prefetch>` strategy                                |
| `context.ts`                                   | Hydrogen context factory (session, cache, cart)                        |
| `session.ts`                                   | Encrypted cookie session                                               |

---

## Routes & pages

Routes live in `app/routes/` using React Router file conventions.

### Storefront pages

| Route file                           | URL                               | Description                                                    |
| ------------------------------------ | --------------------------------- | -------------------------------------------------------------- |
| `_index.tsx`                         | `/`                               | Homepage — hero, trust badges, product grid, featured sections |
| `collections.all.tsx`                | `/collections/all`                | Full catalog with filters                                      |
| `collections.$handle.tsx`            | `/collections/:handle`            | Collection PLP                                                 |
| `collections.$parent.$sub.tsx`       | `/collections/:parent/:sub`       | Nested collection URLs                                         |
| `collections.$root.$parent.$sub.tsx` | `/collections/:root/:parent/:sub` | Deep nested collections                                        |
| `products.$handle.tsx`               | `/products/:handle`               | Product detail page (PDP)                                      |
| `search.tsx`                         | `/search`                         | Search results                                                 |
| `cart.tsx`                           | `/cart`                           | Cart page                                                      |
| `wishlist.tsx`                       | `/wishlist`                       | Client-side wishlist (localStorage)                            |
| `about-us.tsx`                       | `/about-us`                       | About page                                                     |
| `pages.$handle.tsx`                  | `/pages/:handle`                  | Shopify CMS pages                                              |
| `policies.*`                         | `/policies/*`                     | Legal policies from Shopify                                    |
| `blogs.*`                            | `/blogs/*`                        | Blog listing and articles                                      |
| `discount.$code.tsx`                 | `/discount/:code`                 | Apply discount and redirect                                    |

### Customer account

| Route                         | URL                        |
| ----------------------------- | -------------------------- |
| `account.login.tsx`           | `/account/login`           |
| `account.authorize.tsx`       | `/account/authorize`       |
| `account._index.tsx`          | `/account`                 |
| `account.orders.$orderId.tsx` | `/account/orders/:orderId` |
| `account.logout.tsx`          | `/account/logout`          |

Requires Customer Account API env vars and a public domain for OAuth (see [Shopify docs](https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen)).

### SEO & system

| Route                             | URL                                     |
| --------------------------------- | --------------------------------------- |
| `[sitemap.xml].tsx`               | `/sitemap.xml`                          |
| `sitemap.$type.$page[.xml].tsx`   | Dynamic sitemap pages                   |
| `[robots.txt].tsx`                | `/robots.txt`                           |
| `api.$version.[graphql.json].tsx` | Storefront API proxy (Hydrogen default) |
| `$.tsx`                           | Catch-all / 404                         |

---

## API endpoints

Custom server routes (implemented as React Router `action` or `loader`):

| Method | Path                      | Env required                    | Description                                           |
| ------ | ------------------------- | ------------------------------- | ----------------------------------------------------- |
| `POST` | `/webhooks`               | `SHOPIFY_WEBHOOK_SECRET` (prod) | Shopify product/collection webhooks → cache purge     |
| `GET`  | `/api/cache-version`      | —                               | Returns catalog cache version for client revalidation |
| `POST` | `/api/chat`               | `OPENROUTER_API_KEY`            | AI shopping assistant (OpenRouter / DeepSeek)         |
| `POST` | `/api/contact`            | `RESEND_API_KEY`                | Contact form email via Resend                         |
| `POST` | `/api/wishlist-analytics` | —                               | Wishlist analytics beacon                             |

**Example — webhook handler pattern:**

```tsx
// app/routes/webhooks.tsx
export async function action({request, context}: ActionFunctionArgs) {
  const topic = request.headers.get('X-Shopify-Topic');
  // 1. Verify HMAC with SHOPIFY_WEBHOOK_SECRET
  // 2. Purge Workers Cache keys for affected products/collections
  // 3. Bump catalog cache version for open browser tabs
  return new Response('OK', {status: 200});
}
```

Cart mutations use Hydrogen’s `CartForm` component posting to `/cart` — not a custom REST API.

---

## Key features

### 1. Homepage & merchandising

- Animated **Hero** with configurable copy (`hero-content.ts`)
- **Trust badges**, testimonials, newsletter, CTA banners
- **Product grid** with seasonal/keyword-based product bands
- **Category navigation** chips with nested collection hierarchy

### 2. Catalog & filtering

- **Client-side filters** — size, color, price range, sort (no full page reload)
- **Active filter chips** and mobile filter drawer
- **Catalog chip nav** context for shared navigation state across PLPs
- Deep collection URL support (`/collections/root/parent/sub`)

### 3. Product detail (PDP)

- Image gallery with thumbnails and variant-aware media
- **ZehnShopifyImage** — skeleton, fade-in, LCP priority, cache-aware revisits
- Quick add, variant selection, structured data for SEO
- Mobile gallery uses **ZehnMediaFrame** with `aspect-[2/3]` token

### 4. Cart & checkout

- **CartDrawer** slide-over + full cart page
- Hydrogen `CartForm` for add/update/remove lines
- Checkout redirects to Shopify-hosted checkout (`PUBLIC_CHECKOUT_DOMAIN`)

### 5. Wishlist

- **localStorage**-backed wishlist (`wishlist-context.tsx`)
- Sync hooks for logged-in customers (extendable)
- `/wishlist` page and header badge count

### 6. Search

- Predictive search modal in header
- Full search results page with product cards

### 7. AI chat assistant

- Floating chat widget (`ContactChat`) → `POST /api/chat`
- System prompt includes live product context from Storefront API
- Rate limited: 20 requests / 60 s per IP

### 8. Contact & legal

- Contact form → Resend email (`hello@zehn.store`)
- Cookie consent manager, Meta Pixel events (optional `PUBLIC_META_PIXEL_ID`)
- Static legal/about page components

### 9. Performance stack (zero-flicker)

| Piece                | File                             | What it does                                |
| -------------------- | -------------------------------- | ------------------------------------------- |
| Scoped preload       | `useScopedImagePreload.ts`       | Injects `<link rel="preload">` with cleanup |
| Image warm           | `zehn-image-warm.ts`             | Pre-fetches URLs via `new Image()`          |
| Catalog client cache | `catalog-client-loader.ts`       | Reuses loader data on back-nav              |
| Link prefetch        | `link-prefetch.ts`               | Intent-based route prefetch for products    |
| Cache revalidation   | `useCatalogCacheRevalidation.ts` | Polls `/api/cache-version` on focus         |

---

## Environment variables

Copy `.env.example` to `.env`. **You cannot run the dev server without Shopify credentials** — there is no “offline mode” for product data.

### Required for local development

| Variable                                | How to get it                                        |
| --------------------------------------- | ---------------------------------------------------- |
| `PUBLIC_STORE_DOMAIN`                   | Your `*.myshopify.com` domain                        |
| `PUBLIC_STOREFRONT_ID`                  | Shopify Admin → Headless / Hydrogen app              |
| `PUBLIC_STOREFRONT_API_TOKEN`           | Same — public Storefront API token                   |
| `PRIVATE_STOREFRONT_API_TOKEN`          | Same — private token (server-only, keep secret)      |
| `SHOP_ID`                               | Shopify shop GID                                     |
| `SESSION_SECRET`                        | Any long random string (e.g. `openssl rand -hex 32`) |
| `PUBLIC_CHECKOUT_DOMAIN`                | Usually same as store domain                         |
| `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` | Customer Account API setup                           |
| `PUBLIC_CUSTOMER_ACCOUNT_API_URL`       | Customer Account API setup                           |

**Fastest setup — pull from Shopify:**

```bash
nvm use 20
npm install
npx shopify auth login
npx shopify hydrogen link          # link to your Hydrogen storefront
npx shopify hydrogen env pull      # writes .env from Shopify
# If SESSION_SECRET missing after pull:
echo "SESSION_SECRET=$(openssl rand -hex 32)" >> .env
npm run dev
```

**Manual setup:**

```bash
cp .env.example .env
# Fill tokens from Shopify Admin → Sales channels → Headless
npm install
npm run dev
```

Dev server typically runs at **<http://localhost:3001>** (MiniOxygen; port may vary).

### Optional — not needed for typecheck / tests / basic UI

| Variable                  | Feature                       | Without it                    |
| ------------------------- | ----------------------------- | ----------------------------- |
| `OPENROUTER_API_KEY`      | AI chat (`/api/chat`)         | Chat returns 500 — expected   |
| `RESEND_API_KEY`          | Contact form (`/api/contact`) | Form returns 500 — expected   |
| `SHOPIFY_WEBHOOK_SECRET`  | Webhook HMAC verification     | Skipped in dev — expected     |
| `PUBLIC_META_PIXEL_ID`    | Meta Pixel tracking           | Pixel disabled                |
| `OXYGEN_DEPLOYMENT_TOKEN` | CI/CD deploy to Oxygen        | Only needed in GitHub Actions |

Vitest and typecheck **do not require** any `.env` file — 586 tests run without secrets.

---

## Getting started

### Prerequisites

- **Node.js ≥ 20** (`nvm use 20` recommended)
- **npm** (comes with Node)
- Shopify store with Hydrogen / Headless channel linked
- Shopify CLI (installed via devDependencies)

### Install & run

```bash
git clone https://github.com/zaman365/zehn-hydrogen-frontend-clean.git
cd zehn-hydrogen-frontend-clean
git checkout development

nvm use 20
npm install
cp .env.example .env        # then fill or use env pull
npm run dev
```

Open **<http://localhost:3001>** and compare with production **<https://zehnfashion.de>**.

### Production build preview

```bash
npm run build
npm run preview
```

---

## Development workflow

### Scripts

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start MiniOxygen dev server + GraphQL codegen |
| `npm run build`     | Production build for Oxygen                   |
| `npm run preview`   | Preview production build locally              |
| `npm run typecheck` | React Router typegen + `tsc --noEmit`         |
| `npm run lint`      | ESLint across the repo                        |
| `npx vitest run`    | Run all unit tests                            |
| `npm run codegen`   | Regenerate GraphQL + route types              |

### Adding a new page

1. Create `app/routes/my-page.tsx`
2. Export `loader` for data, default component for UI
3. Optionally export `meta` for SEO tags

```tsx
// app/routes/my-page.tsx
import type {Route} from './+types/my-page';

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  // const data = await storefront.query(MY_QUERY);
  return {title: 'My Page'};
}

export default function MyPage() {
  const {title} = useLoaderData<typeof loader>();
  return <h1>{title}</h1>;
}
```

### GraphQL queries

Define queries in `app/lib/queries.ts` or route files. Run codegen after changes:

```bash
npm run codegen
```

Import types from `storefrontapi.generated`.

### Import alias

Use `~/` for `app/` imports (configured in `tsconfig.json`):

```tsx
import {Hero} from '~/components/zehn/Hero';
import {ZehnColors} from '~/lib/design-tokens';
```

**Never import from `react-router-dom`** — this project uses **`react-router`** only (Hydrogen + React Router 7).

---

## Testing & quality gates

Before committing:

```bash
npm run typecheck
npx vitest run    # 586 tests
npm run lint      # 0 errors, 0 warnings
npm run build
```

Tests cover cache policy, filters, nav, image loading, webhooks, API routes, and component wiring. No live Shopify or API keys needed for the test suite.

---

## Components & reuse guide

### Design system entry points

```tsx
import {ZehnColors, FontFamilies} from '~/lib/design-tokens';
import {ZehnShopifyImage} from '~/components/zehn/ZehnShopifyImage';
import {ZehnMediaFrame} from '~/components/zehn/ZehnMediaFrame';
import {ZehnLink} from '~/components/zehn/ZehnLink';
```

### ZehnShopifyImage — reusable product image

Wraps Hydrogen `<Image>` with skeleton, fade-in, and CDN cache detection:

```tsx
<ZehnMediaFrame aspect="productCard">
  <ZehnShopifyImage
    data={product.featuredImage}
    alt={product.title}
    sizes="(max-width: 768px) 50vw, 25vw"
    priority={index < 4} // above-fold cards
    isLCP={index === 0} // one LCP candidate per page
    skipSkeleton={inSlider} // fixed aspect frame, no pulse
  />
</ZehnMediaFrame>
```

**Reuse in another Hydrogen project:** copy `ZehnShopifyImage.tsx`, `zehn-media-styles.ts`, `zehn-image-cache.ts`, and `useIsomorphicLayoutEffect.ts`.

### Wishlist context

Wrap your app (already done in `PageLayout.tsx`):

```tsx
import {
  WishlistProvider,
  useWishlist,
} from '~/components/zehn/wishlist-context';

function ProductCard({product}) {
  const {toggleItem, isInWishlist} = useWishlist();
  // ...
}
```

Persists to `localStorage` key `zehn-wishlist` — portable to any React app with minimal changes.

### Catalog filters

Filters are **client-side only** — loader fetches products once; `product-filters.ts` narrows in the browser:

```tsx
import {applyProductFilters, parseFilterParams} from '~/lib/product-filters';

const filters = parseFilterParams(searchParams);
const filtered = applyProductFilters(products, filters);
```

Good pattern when Shopify collection size is bounded and you want instant chip toggles without network round-trips.

### Provider stack (PageLayout)

```bash
WishlistProvider
  └── CatalogChipNavProvider
        └── CatalogCacheProvider
              └── Aside.Provider (cart/search drawers)
                    └── ZehnHeader + children + ZehnFooter
```

Copy this stack when building alternate layouts in the same repo.

---

## Performance & caching

| Layer                      | Mechanism                                               |
| -------------------------- | ------------------------------------------------------- |
| **Oxygen Workers Cache**   | Short/long TTL per route (`storefront-cache-policy.ts`) |
| **Webhook purge**          | Product/collection changes → instant cache invalidation |
| **Client loader cache**    | Back-navigation reuses warm catalog JSON                |
| **Catalog version signal** | `/api/cache-version` + focus revalidation               |
| **Image preload/warm**     | SSR meta preload + client warm before paint             |
| **Link prefetch**          | Product links prefetch on hover/intent                  |

Root loader intentionally **does not revalidate** on every navigation (`shouldRevalidate` in `root.tsx`) to avoid redundant header/footer queries.

---

## Deploying to Oxygen

1. Connect repo to Shopify Oxygen via GitHub (`zaman365/zehn-hydrogen-frontend-clean`, branch `development`).
2. Set production env vars in Oxygen dashboard:
   - All required Shopify vars from `.env.example`
   - `OPENROUTER_API_KEY`, `RESEND_API_KEY`, `SHOPIFY_WEBHOOK_SECRET` for full features
3. Register Shopify webhooks → `https://zehnfashion.de/webhooks`:
   - `products/create`, `products/update`, `products/delete`
   - `collections/create`, `collections/update`, `collections/delete`
4. Deploy via Shopify CLI or GitHub integration:

```bash
npm run build
npx shopify hydrogen deploy
```

---

## Learning resources

| Topic                        | Link                                                 |
| ---------------------------- | ---------------------------------------------------- |
| Hydrogen docs                | <https://shopify.dev/custom-storefronts/hydrogen>    |
| React Router 7               | <https://reactrouter.com/>                           |
| Storefront API               | <https://shopify.dev/docs/api/storefront>            |
| Customer Account API         | <https://shopify.dev/docs/api/customer>              |
| Oxygen hosting               | <https://shopify.dev/docs/custom-storefronts/oxygen> |
| Remix → React Router upgrade | <https://reactrouter.com/upgrading/remix>            |

---

## Conclusion

This repository is a production-grade example of a **custom Shopify Hydrogen storefront**: React Router 7 file-based routing, GraphQL data loading, edge caching on Oxygen, client-side catalog UX, and optional server routes for AI chat, email, and webhooks. Use it to learn headless commerce patterns, study performance-focused image loading, or adapt ZEHN components into your own Hydrogen project.

For agent-oriented internal docs, see `AGENTS.md` and `Docs/project-idea/PROJECT_WALKTHROUGH.md` (local / gitignored in some setups).

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.
