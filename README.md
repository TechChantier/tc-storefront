# TC Storefront

Multi-tenant Next.js storefront for TCPoS. Pushes to `main` build a Docker image and deploy to production.

[![Build and deploy](https://github.com/TechChantier/tc-storefront/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/TechChantier/tc-storefront/actions/workflows/deploy.yml)
[![Production](https://img.shields.io/github/deployments/TechChantier/tc-storefront/production?logo=github&label=production)](https://github.com/TechChantier/tc-storefront/deployments/production)
[![Last commit](https://img.shields.io/github/last-commit/TechChantier/tc-storefront/main)](https://github.com/TechChantier/tc-storefront/commits/main)

Live demo site: [supaa-mall.tcpos.site](https://supaa-mall.tcpos.site/) · [Workflow runs](https://github.com/TechChantier/tc-storefront/actions/workflows/deploy.yml) · [Production deployments](https://github.com/TechChantier/tc-storefront/deployments/production)

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

## Deployment

GitHub Actions builds the image and SSHs it onto the production host. Each successful `deploy` job is recorded against the [production](https://github.com/TechChantier/tc-storefront/deployments/production) environment, which is what the badges and the repo Deployments tab use.
