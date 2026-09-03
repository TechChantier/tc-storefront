# Adding a storefront template

Tenants pick a **template** (`template_key` from Laravel resolve). They do not own the template files. This app maps each registered key to a theme under `src/themes/`.

Registered keys: `classic`, `pro`, `vibrant`.

Unknown keys (including Laravel’s old default `modern`) do **not** fall back. The shopper sees the unsupported-template page.

Copy **classic** or **pro**, then register the new key. Do not invent extra App Router pages unless you are adding a new public route for every theme.

---

## Architecture

```text
Browser  /{locale}/products
  → app/sites/[hostname]/[locale]/products/page.tsx   (fetch + hydrate)
  → StorefrontProvider  (Zustand)
  → theme.Layout + theme.ProductListPage  (read/write store only)
```

| Layer | Owns |
|---|---|
| App routes | Hostname rewrite, locale, `loadReadyStorefront`, catalogue fetch, hydrators |
| Zustand store | Config, locale, catalogue slices, cart, checkout form, `placeOrder` |
| Theme | Layout, page UI, copy, styling |

Themes are always **client components** (`"use client"`) so they can call `useStorefrontStore`.

### Do not import from a theme

- `@/lib/queries/get-*`
- `@/lib/storefront/tcpos-client`
- `@/lib/storefront/resolve-storefront`
- `@/lib/order/create-order`
- Env / service token

URL helpers such as `buildProductListHref` from `@/lib/queries/product-query` are allowed (they only build query strings).

---

## What the store offers

Import from `@/stores/storefront-store`:

```ts
import {
  useStorefrontStore,
  selectCartCount,
  selectCartSubtotal,
  selectCartCurrency,
  selectCartErrorMessage,
  selectCheckoutFieldError,
  selectCanPlaceOrder,
} from "@/stores/storefront-store";
```

Re-exported types: `CartItem`, `CartStockSource`, `CartErrorCode`, `CheckoutForm`, `OrderError`, `OrderResult`, `OrderStatus`.

### Tenant / locale

| Selector | Use |
|---|---|
| `state.config` | Resolve payload (branding, business, sections, seo, locales, `template_key`) |
| `state.locale` | Current `/{locale}` |
| `state.hostname` | Shop hostname |

Branding colors (`primary_color`, `secondary_color`) are on `config.branding` but are not applied yet. Leave a comment slot if you read them.

### Catalogue (hydrated by routes)

| Selector | Page |
|---|---|
| `products`, `productsMeta`, `productsQuery`, `productsStatus` | Product list |
| `product`, `productStatus` | Product detail |
| `categories`, `categoriesStatus` | Category list (and product filters) |
| `category`, `categoryStatus` | Category detail (metadata only) |
| `featuredProducts`, `featuredStatus` | Home featured section (`featured=true` from the API) |

Statuses: `idle` \| `ok` \| `not_found` \| `unavailable` \| `invalid` \| `invalid_locale` \| `redirect`. Treat anything other than `ok` / `idle` as a load failure in the UI.

Products in a category = product list with `?category={slug}`, not category detail.

Filters that exist on the API (no `sort`): `search`, `category`, `featured`, `min_price`, `max_price`, `availability` (`all` \| `in_stock` \| `out_of_stock`), `page`, `per_page`.

### Cart

| Action / field | Behaviour |
|---|---|
| `addToCart(product, qty?)` | Caps at stock; `!available` cannot add |
| `reduceFromCart(productId)` | Decrements; `0` removes |
| `updateCart(productId, quantity)` | `0` removes; clamps to stock |
| `removeFromCart` / `clearCart` | |
| `remainingCapacity(product)` | `null` = unlimited; `0` = cannot add |
| `cartQuantityFor` / `cartMaxQuantity` | Line qty / max |
| `cartItems`, `cartHydrated` | Wait for hydrate before empty-state (localStorage) |

Selectors: `selectCartCount`, `selectCartSubtotal`, `selectCartCurrency`.

Cart is persisted per `config.tcpos_subdomain`. Do not persist it yourself.

### Checkout / order

| Field / action | Behaviour |
|---|---|
| `checkoutForm` / `setCheckoutField` / `setCheckoutForm` | Shopper fields only |
| `checkoutErrors` / `selectCheckoutFieldError` | Zod + Laravel field errors |
| `placeOrder()` | Builds items + `displayed_price` + `idempotency_key`; POSTs via a server action |
| `confirmUpdatedPrices()` | After `ORDER_REQUIRES_CONFIRMATION` |
| `orderStatus` | `idle` \| `submitting` \| `success` \| `error` |
| `orderResult` | `public_reference`, `subtotal`, `delivery_fee`, `tax`, `total`, `status` — shown on `SuccessPage` |
| `orderError` | `message`, `fields`, `priceChanges`, `stockItems` |
| `selectCanPlaceOrder` | Cart non-empty, ≤ 50 lines, not submitting/success |

Form fields: `name`, `phone`, `email` (optional), `country`, `city`, `address` (always required), `method` (`delivery` \| `pickup`), `fulfillmentAddress` (required if delivery), `note`, `sameAsCustomerAddress` (UX only).

Never send from the theme: `variant_id`, `final_total`, `final_price`, `tenant_id`, `tcpos_subdomain`. The store builds `items[]` from the cart.

---

## Contract

[`src/themes/contracts.ts`](../src/themes/contracts.ts) — every theme must export this object:

| Key | Public URL | Store data |
|---|---|---|
| `Layout` | all `/{locale}/*` | nav, branding, cart count |
| `HomePage` | `/{locale}` | config, locale, `featuredProducts`, `categories` |
| `AboutPage` | `/{locale}/about` | config, locale |
| `ContactPage` | `/{locale}/contact` | config, locale |
| `SignupPage` | `/{locale}/signup` | config, locale |
| `CategoryListPage` | `/{locale}/categories` | `categories` |
| `ProductListPage` | `/{locale}/products` | `products` + filters |
| `ProductPage` | `/{locale}/products/{slug}` | `product` + add to cart |
| `CartPage` | `/{locale}/cart` | editable cart |
| `CheckoutPage` | `/{locale}/checkout` | read-only lines + form + `placeOrder` (then navigate to success) |
| `SuccessPage` | `/{locale}/success` | `orderResult`, `checkoutForm`, business WhatsApp |

Locale-less `/about`, `/cart`, … already redirect to `/{default_locale}/…`. You do not add those files per theme.

If you add a **new** public page (new URL), you must:

1. Add a key to `StorefrontTemplate`
2. Implement it on **classic**, **pro**, and the new theme
3. Add `[locale]/…/page.tsx` + a locale-less redirect (same pattern as about)

---

## Files to add

Replace `bold` with the Laravel `template_key` (lowercase, stable, e.g. `bold`). Folder name **must** match the registry key.

```text
src/themes/bold/
  index.ts                 # StorefrontTemplate export (default)
  layout.tsx               # header/nav/footer
  cart-controls.tsx        # add-to-cart + line qty (optional but recommended)
  checkout-form.tsx        # customer + fulfillment fields
  pages/
    home.tsx
    about.tsx
    contact.tsx
    signup.tsx
    categories.tsx
    products.tsx
    product.tsx
    cart.tsx
    checkout.tsx
    success.tsx
```

All of these are `"use client"`.

`index.ts` shape (see classic):

```ts
import type { StorefrontTemplate } from "@/themes/contracts";
import { BoldLayout } from "./layout";
// …page imports

const boldTheme: StorefrontTemplate = {
  Layout: BoldLayout,
  HomePage: BoldHomePage,
  AboutPage: BoldAboutPage,
  ContactPage: BoldContactPage,
  SignupPage: BoldSignupPage,
  CategoryListPage: BoldCategoryListPage,
  ProductListPage: BoldProductListPage,
  ProductPage: BoldProductPage,
  CartPage: BoldCartPage,
  CheckoutPage: BoldCheckoutPage,
  SuccessPage: BoldSuccessPage,
};

export default boldTheme;
```

Fastest path: copy `src/themes/classic/` (or `pro/`), rename components, restyle. Keep the same store selectors and actions.

---

## Register the key

Edit [`src/themes/registry.ts`](../src/themes/registry.ts):

```ts
import boldTheme from "@/themes/bold";

export const themeRegistry = {
  classic: classicTheme,
  pro: proTheme,
  bold: boldTheme,
} as const satisfies Record<string, StorefrontTemplate>;
```

The object key **must** equal TCPoS `template_key`. Do not load theme paths from the API string (`import(\`./${key}\`)`).

Laravel: set the shop’s `template_key` to the same value. Until that is registered here, the shop gets “Unsupported template”.

No other app files need a theme import. Routes already do `loaded.theme.HomePage` (etc.).

---

## Layout and links

Use `state.locale` in hrefs:

| Nav | Href |
|---|---|
| Home | `/${locale}` |
| Products | `/${locale}/products` |
| Categories | `/${locale}/categories` |
| Cart | `/${locale}/cart` (badge: `selectCartCount`) |
| Checkout | `/${locale}/checkout` |
| Success | `/${locale}/success` |
| About / Contact / Signup | `/${locale}/about` … |

Product detail: `/${locale}/products/${product.slug}`.  
Category → products: `buildProductListHref(locale, { category: category.slug })`.

---

## Page behaviour to keep

- **Product list:** GET form to `/${locale}/products` with the filter names above. Pagination via `buildProductListHref` + `productsMeta`. Add-to-cart outside the title `Link` so the button does not navigate.
- **Product detail:** handle `productStatus !== "ok"`. Respect stock (`remainingCapacity`).
- **Categories:** list from `categories`; image is `category.image?.url`.
- **Cart:** wait for `cartHydrated`; qty controls; link to checkout.
- **Checkout:** read-only lines; “Edit cart”; pickup hides delivery address. After `placeOrder` succeeds, navigate to `/{locale}/success` (do not keep confirmation inline). Empty cart → browse products. Price mismatch → `confirmUpdatedPrices`.
- **Success:** thank-you hero, order ID, Customer / Delivery / Timeline cards, WhatsApp share + continue shopping. Use `orderResult` + `checkoutForm`. If there is no successful order in the store, send the shopper to products. Mark missing API fields with `*** … ***` (empty email, no WhatsApp number, missing delivery address). Theme dummy is allowed for copy the API does not own (e.g. estimated arrival).

---

## Checklist

1. Copy `classic` or `pro` to `src/themes/{key}/`.
2. Implement every `StorefrontTemplate` page; `"use client"`; `useStorefrontStore` only for data.
3. Register `{key}` in `themeRegistry`.
4. Set Laravel `template_key` to `{key}`.
5. `npx tsc --noEmit` — missing contract keys fail the `satisfies Record<string, StorefrontTemplate>` check.
6. Hit `/{locale}/…` on a shop that resolves to that key.

You do not add a store, Zod schemas, or fetchers for a new look. Those stay shared.
