# Firebase Studio

This project is a Next.js 15 App Router application built with React 18, Tailwind CSS, shadcn/ui, and Supabase-backed AI tooling.

## Getting started (local development)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` (the `.env*` files are already gitignored) and supply your Supabase project credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```

   If you only need a local preview without Supabase access, you can leave the provided placeholder values:

   ```
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000) with hot module replacement enabled. Tailwind CSS and shadcn/ui styles are loaded via `src/app/globals.css`.

### Key routes to verify

- `/` – Marketing landing page
- `/dashboard` – Authenticated dashboard experience
- `/documents`, `/convert`, `/compress`, `/summarize-meeting`, etc. – Main document tooling pages

Refer to `src/app` for the complete list of available tool routes.
