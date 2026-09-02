# TC Market Next.js — Phase 1 Architecture

We are starting a clean Next.js application for **TC Market**, the public storefront frontend for TCPoS businesses.

For this first phase, do NOT implement products, categories, cart, orders, checkout, search, authentication, or any real storefront UI.

The objective is only to establish:

* hostname-based multitenancy;
* Laravel storefront resolution;
* theme/template selection;
* shared routing;
* two storefront templates;
* four empty pages.

---

# Technology

Use the current stable Next.js with:

* App Router
* TypeScript
* Server Components by default
* Tailwind CSS
* ESLint

Keep the architecture simple.

Do not introduce Redux, Zustand, authentication libraries, database libraries, or unnecessary dependencies at this stage.

TC Market does NOT have its own database for now.

Laravel/TCPoS remains the source of tenant configuration.

---

# Important Terminology

Do not treat `classic` and `pro` as actual tenants.

They are **storefront templates/themes**.

Actual tenants are businesses resolved from their hostname.

For example:

```text
fashion-house.tcmarket.app
        ↓
Laravel resolve API
        ↓
Tenant: Fashion House
Template: classic
```

Another business:

```text
premium-tech.tcmarket.app
        ↓
Laravel resolve API
        ↓
Tenant: Premium Tech
Template: pro
```

Both storefronts run from the same Next.js application.

---

# Phase 1 Templates

Support exactly two template keys:

```text
classic
pro
```

Each template should initially contain only four pages:

```text
/
 /about
 /contact
 /signup
```

The pages can be visually empty/minimal for now.

The purpose is to verify that tenant resolution and template selection work correctly.

For testing, it should be obvious which template has loaded.

For example, temporarily rendering:

```text
Classic — Home
Classic — About
```

versus:

```text
Pro — Home
Pro — About
```

is sufficient.

Do not design the real storefront yet.

---

# API Contract

The main API endpoint for this phase is:

```text
POST /api/storefront/resolve
```

It runs against the CENTRAL TCPoS API host.

The request body is:

```json
{
    "hostname": "business.tcmarket.app"
}
```

Authentication:

```text
Authorization: Bearer {STOREFRONT_SERVICE_TOKEN}
```

The token is a server secret.

NEVER expose it through:

```text
NEXT_PUBLIC_*
browser JavaScript
client components
HTML
logs
error messages
```

The resolve response contains information including:

```text
tcpos_subdomain
storefront_subdomain
storefront_status
template_key
default_locale
supported_locales
current_domain
primary_domain
branding
business
sections
seo
config_version
updated_at
```

For Phase 1, the most important fields are:

```text
template_key
tcpos_subdomain
current_domain
branding
default_locale
supported_locales
```

Store the full returned configuration in the TypeScript type, however, because we will use the remaining configuration later.

---

# Environment Variables

Use server-only environment variables similar to:

```text
TCPOS_API_BASE_URL=https://api.tcpos.app
STOREFRONT_SERVICE_TOKEN=secret
```

For local development these may point to:

```text
TCPOS_API_BASE_URL=http://tcpos.local
```

or whichever central Laravel URL is configured.

Do NOT use:

```text
NEXT_PUBLIC_STOREFRONT_SERVICE_TOKEN
```

The Laravel service token must remain server-side.

---

# Request Flow

The desired flow is:

```text
Browser
   │
   ▼
classic-shop.tcmarket.app/about
   │
   ▼
Next.js receives hostname
   │
   ▼
Extract normalized hostname
   │
   ▼
Resolve hostname through Laravel
   │
   ▼
Laravel response
   │
   ├── tenant information
   ├── tcpos_subdomain
   └── template_key
           │
           ▼
      Theme registry
           │
      ┌────┴────┐
      │         │
   classic     pro
      │         │
      ▼         ▼
Render requested page
```

---

# Hostname Resolution

Create a central hostname utility.

It should correctly extract and normalize the hostname from the incoming request.

It must eventually support both:

```text
business.tcmarket.app
```

and custom domains such as:

```text
shop.business.com
```

Do not determine the tenant by manually splitting only `.tcmarket.app`.

Instead, treat the complete hostname as the tenant lookup key.

Laravel's `/resolve` endpoint is responsible for deciding what tenant/domain that hostname belongs to.

Therefore:

```text
hostname
   ↓
Laravel resolve
   ↓
tenant
```

not:

```text
hostname
   ↓
Next.js guesses tenant
```

---

# Next.js Proxy

Use the current Next.js request interception mechanism (`proxy.ts`) for hostname-aware routing where appropriate.

Its responsibility should remain lightweight.

It can:

1. inspect the incoming hostname;
2. normalize it;
3. rewrite the request internally to the tenant-aware route structure.

Avoid putting unnecessary application/business logic inside Proxy.

Do not expose the internal tenant route structure publicly if it can be avoided.

---

# Recommended Internal Routing

Externally, visitors see:

```text
/
 /about
 /contact
 /signup
```

Internally Next.js can rewrite requests into a tenant-aware route.

For example:

```text
classic-shop.tcmarket.app/about
```

can internally become conceptually:

```text
/_sites/classic-shop.tcmarket.app/about
```

The user should continue seeing:

```text
https://classic-shop.tcmarket.app/about
```

in their browser.

Do not make the tenant hostname part of the visible URL path.

---

# Shared Routes, Different Templates

Do NOT create route trees like:

```text
app/classic/
    page.tsx
    about/
    contact/
    signup/

app/pro/
    page.tsx
    about/
    contact/
    signup/
```

That makes the URL architecture depend on template names.

Also do NOT create:

```text
app/tenant-a/
app/tenant-b/
app/tenant-c/
```

We may eventually have hundreds or thousands of tenants.

Instead:

```text
one routing system
        +
tenant configuration
        +
theme registry
```

---

# Proposed Project Structure

Use something conceptually similar to:

```text
src/
│
├── app/
│   │
│   └── _sites/
│       └── [hostname]/
│           │
│           ├── layout.tsx
│           ├── page.tsx
│           │
│           ├── about/
│           │   └── page.tsx
│           │
│           ├── contact/
│           │   └── page.tsx
│           │
│           └── signup/
│               └── page.tsx
│
├── themes/
│   │
│   ├── classic/
│   │   ├── layout.tsx
│   │   └── pages/
│   │       ├── home.tsx
│   │       ├── about.tsx
│   │       ├── contact.tsx
│   │       └── signup.tsx
│   │
│   └── pro/
│       ├── layout.tsx
│       └── pages/
│           ├── home.tsx
│           ├── about.tsx
│           ├── contact.tsx
│           └── signup.tsx
│
├── components/
│   └── shared/
│
├── lib/
│   │
│   ├── storefront/
│   │   ├── resolve-storefront.ts
│   │   ├── types.ts
│   │   └── errors.ts
│   │
│   ├── tenant/
│   │   ├── hostname.ts
│   │   └── get-tenant.ts
│   │
│   └── themes/
│       └── registry.ts
│
└── proxy.ts
```

Adjust naming if Next.js conventions require it, but preserve the architectural separation.

---

# Theme Registry

Create one centralized registry.

Conceptually:

```ts
const themes = {
    classic: ClassicTheme,
    pro: ProTheme,
}
```

Do not scatter logic such as:

```ts
if (template === 'classic')
```

throughout the project.

Theme resolution should happen through one abstraction.

Conceptually:

```text
resolve storefront
       ↓
template_key
       ↓
theme registry
       ↓
theme implementation
```

If Laravel returns an unsupported template key, handle it explicitly.

Do not silently choose an arbitrary template.

A controlled fallback to `classic` may be added only if we intentionally configure that behaviour.

---

# Page Architecture

The route should determine which logical page is being requested:

```text
home
about
contact
signup
```

Then pass that page request to the active theme.

Conceptually:

```text
Tenant
   ↓
template_key = classic
   ↓
Classic theme
   ↓
Home component
```

or:

```text
Tenant
   ↓
template_key = pro
   ↓
Pro theme
   ↓
About component
```

This allows the same route architecture to work across every storefront.

---

# Shared Components

Create:

```text
components/shared/
```

but keep it nearly empty for now.

Later it may contain functionality shared between templates:

```text
ProductCard
Currency
Image
SEO
Analytics
Cart primitives
Locale switcher
Error states
```

Do not prematurely create large shared-component abstractions.

---

# Laravel Resolve Client

Create one server-only function such as:

```text
resolveStorefront(hostname)
```

Responsibilities:

1. normalize hostname;
2. POST to:

```text
{TCPOS_API_BASE_URL}/api/storefront/resolve
```

3. include:

```text
Authorization: Bearer {STOREFRONT_SERVICE_TOKEN}
Content-Type: application/json
```

4. send:

```json
{
    "hostname": "..."
}
```

5. validate the returned response;
6. return typed storefront configuration;
7. convert API failures into defined application errors.

The rest of the application should not manually call `/resolve`.

All resolve requests should pass through this module.

---

# TypeScript Types

Create proper types for the Laravel resolve response.

For example:

```text
StorefrontResolveResponse
StorefrontConfig
StorefrontBranding
StorefrontBusiness
StorefrontSections
StorefrontSeo
```

Do not use `any`.

Match the Laravel API contract.

---

# Error Handling

Handle these resolve errors explicitly:

```text
401 UNAUTHORIZED
403 STOREFRONT_DISABLED
404 STOREFRONT_NOT_FOUND
422 VALIDATION_ERROR
429 RATE_LIMIT_EXCEEDED
```

Initial behaviour can be simple.

For example:

### STOREFRONT_NOT_FOUND

Render a storefront-not-found page.

### STOREFRONT_DISABLED

Render a storefront-unavailable page.

### 401

Treat this as a server configuration problem rather than showing API details to visitors.

### 429

Render a temporary error or retry-friendly response.

Do not expose Laravel responses, service tokens, stack traces, or internal configuration publicly.

---

# Resolve Caching

Do not call Laravel unnecessarily on every component render.

Create one centralized caching strategy for hostname resolution.

The API response contains:

```text
config_version
updated_at
```

which we can use later for smarter invalidation.

For now, a short cache is acceptable.

For example:

```text
1–5 minutes
```

The exact implementation should use current Next.js server caching/revalidation conventions.

Do not cache indefinitely.

Later, TCPoS webhooks will be able to invalidate storefront configuration and catalogue caches.

---

# Local Development

We need at least two test storefront domains.

For example:

```text
classic.tcmarket.local
pro.tcmarket.local
```

or another locally supported hostname strategy.

These exact hostnames must also exist in the Laravel `storefront_domains` data because Laravel—not Next.js—is responsible for resolving the domain.

Configure:

```text
classic.tcmarket.local
```

to return:

```text
template_key = classic
```

and:

```text
pro.tcmarket.local
```

to return:

```text
template_key = pro
```

Do not hardcode this association in Next.js.

It must come from `/resolve`.

---

# Expected Test

When visiting:

```text
http://classic.tcmarket.local:3000/
```

the application should:

```text
extract classic.tcmarket.local
→ call Laravel resolve
→ receive template_key=classic
→ render Classic Home
```

Visiting:

```text
http://classic.tcmarket.local:3000/about
```

should render:

```text
Classic About
```

And:

```text
http://pro.tcmarket.local:3000/
```

should:

```text
extract pro.tcmarket.local
→ call Laravel resolve
→ receive template_key=pro
→ render Pro Home
```

Similarly:

```text
/pro-domain/about
/contact
/signup
```

must use the correct resolved template.

The visible paths remain:

```text
/
 /about
 /contact
 /signup
```

There should never be visible URLs such as:

```text
/classic/about
/pro/about
```

---

# Do Not Implement Yet

Do NOT implement:

```text
products
product details
categories
cart
orders
checkout
payments
customer accounts
search
filters
webhooks
catalogue caching
stock
product images
real contact forms
real signup functionality
localization UI
custom-domain management UI
```

The API already supports many of these, but they belong to later phases.

---

# Phase 1 Definition of Done

Phase 1 is complete when:

1. The clean Next.js application runs successfully.

2. Requests are tenant-aware based on hostname.

3. The current hostname is passed to Laravel's `/api/storefront/resolve`.

4. The Laravel service token exists only server-side.

5. Resolve responses are strongly typed.

6. Two template implementations exist:

```text
classic
pro
```

7. Each has:

```text
home
about
contact
signup
```

8. The correct template is selected using Laravel's `template_key`.

9. No hostname-to-template mapping is hardcoded inside Next.js.

10. Unknown storefronts are handled cleanly.

11. Disabled storefronts are handled cleanly.

12. Resolve calls have basic server-side caching.

13. The architecture allows us to add more templates without changing the tenant-routing system.

14. The architecture allows us to later add catalogue APIs without redesigning multitenancy.

---

# Future Phase

Once this foundation is verified, the next phase will be:

```text
resolved tenant
      ↓
tcpos_subdomain
      ↓
construct tenant TCPoS API hostname
      ↓
products
categories
product detail
```

The resolve response's:

```text
tcpos_subdomain
```

will determine which TCPoS tenant API host we call.

For example:

```text
TC Market hostname:
abc-company.tcmarket.app

       ↓ resolve

tcpos_subdomain:
abc

       ↓

TCPoS catalogue host:
https://abc.tcpos.app/api/storefront/products
```

Do not implement this part yet.

For now, establish the multitenant/theme foundation correctly.
