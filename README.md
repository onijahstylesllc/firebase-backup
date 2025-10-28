# Firebase Studio

This repository contains a Next.js 15 (App Router) + TypeScript application that integrates with Supabase for authentication, storage, and real-time data. Tailwind CSS and shadcn/ui provide the component foundation for the interface.

## Requirements

- Node.js **20 or newer** (matches the runtime used by Vercel)
- Yarn Classic (1.x via Corepack) — aligns with the `packageManager` declared in `package.json`

## Environment variables

Copy `.env.example` to `.env.local` (or configure the variables directly in Vercel) and provide project-specific values for the required Supabase settings.

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public API key | `your-supabase-anon-key` |

## Local development

1. Duplicate `.env.example` into `.env.local` and fill in your Supabase credentials.
2. Install dependencies: `yarn install`
3. Start the development server: `yarn dev`
4. Run a production build check before pushing: `yarn build`

## Vercel preview deployment setup

Follow these steps to enable automatic preview deployments for every pull request:

1. Visit [vercel.com/new](https://vercel.com/new) and import this GitHub repository. If the organization is not already linked, authorize Vercel to access it.
2. During the import flow, add the environment variables listed above for both **Preview** and **Production** environments. Use the same Supabase values for each environment unless you maintain separate Supabase projects.
3. Complete the import. Vercel will deploy the `main` branch (Production) and create a first Preview deployment if a non-default branch exists.
4. In the Vercel dashboard, navigate to **Project Settings → Git** and ensure **GitHub pull request comments** are enabled. This posts a ready-to-share preview comment on every PR.
5. Preview URLs are available from multiple places:
   - The pull request comment left by the Vercel GitHub integration.
   - The **Deployments** tab of the project in the Vercel dashboard (Preview tab).
   - The commit status checks attached to each PR.

After this setup, pushing a branch or opening a pull request automatically creates a Vercel Preview Deployment with a public URL. Merging to the production branch triggers a Production deployment using the same environment variables configured above.
