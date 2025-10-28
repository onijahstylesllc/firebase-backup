# Firebase Studio

This project is a Next.js 15 App Router application built with React 18, Tailwind CSS, shadcn/ui, and Supabase-backed AI tooling.

## Getting started (local development)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` (the `.env*` files are already gitignored). The example file ships with the shared Supabase development project credentials so you can get started immediately:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://pszmwgpjwuprytrahkro.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzem13Z3Bqd3Vwcnl0cmFoa3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTM2MDYsImV4cCI6MjA3NjQ2OTYwNn0.56OQIcwoz7UwQMpaEuRfP4k7qEE1ZobPmn-aTbONLwI
   ```

   If you need to point at a different Supabase project, update the values above in your `.env.local`.

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
