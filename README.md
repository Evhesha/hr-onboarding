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

## Monorepo Deployment Notes

This repository deploys as two separate Vercel projects:

- Frontend project root: `/`
- Backend project root: `/backend`

Frontend required env vars:

- `BACKEND_URL=https://<your-backend-project>.vercel.app`
- `STRIPE_SECRET_KEY=...`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...`

Backend required env vars:

- `DATABASE_URL=...` (Neon/Postgres connection string)
- `JWT_SECRET=...`
- `CLIENT_URL=https://<your-frontend-project>.vercel.app`
- `NODE_ENV=production`

Important:

- `BACKEND_URL` must be configured for frontend production; otherwise API routes fallback to localhost only in local/dev mode.
- Neon variables should be available in the backend project for the `Production` environment, not only Preview.

### Run backend migrations against production database

```bash
cd backend
NODE_ENV=production DATABASE_URL="postgresql://..." npx sequelize-cli db:migrate --env production
```
