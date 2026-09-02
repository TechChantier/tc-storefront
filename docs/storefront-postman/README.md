# TCPoS Storefront API — Postman

Import both files into Postman:

1. `TCPoS-Storefront-API.postman_collection.json`
2. `TCPoS-Storefront-Local.postman_environment.json`

Select the **TCPoS Storefront — Local** environment, then set:

| Variable | What to put |
|----------|-------------|
| `storefront_service_token` | Same value as `.env` → `STOREFRONT_SERVICE_TOKEN` |
| `market_hostname` | Verified Market hostname (resolve body only), e.g. `demo.tcmarket.app` |
| `central_base_url` | Resolve host only, e.g. `http://tcpos.local` or `http://127.0.0.1:8005` |
| `tenant_base_url` | Catalogue/orders host, e.g. `http://demo.tcpos.local` |
| `locale` | `en` / `fr` (must be in supported locales) |
| `product_slug` / `category_slug` / `product_id` | Fill from list responses (or use the Resolve test script to set `tcpos_subdomain`) |

## Hosts reminder

- **Resolve** → `central_base_url` + Market `hostname` in JSON body
- **Catalogue / orders** → `tenant_base_url` (TCPoS tenant subdomain host)
- Do not put `tenant_id` / `tcpos_subdomain` in request bodies

## Covered routes

| Method | Path | Source |
|--------|------|--------|
| `POST` | `/api/storefront/resolve` | `routes/storefront.php` |
| `GET` | `/api/storefront/products` | `routes/storefront-tenant.php` |
| `GET` | `/api/storefront/products/{slug}` | `routes/storefront-tenant.php` |
| `GET` | `/api/storefront/categories` | `routes/storefront-tenant.php` |
| `GET` | `/api/storefront/categories/{slug}` | `routes/storefront-tenant.php` |
| `POST` | `/api/storefront/orders` | `routes/storefront-tenant.php` |

Orders require `customer.country` / `city` / `address` (separate from `fulfillment.address`). Fulfillment is stored on the sale note as labeled lines.

Full contracts: `docs/storefront-api-specs.md`.
