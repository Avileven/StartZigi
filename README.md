# base44-next-template

Template Next.js (Pages router) prepared for migrating apps exported from Base44.
Modern stack: Next 14, React 18, Tailwind CSS, Supabase client boilerplate.
Dev server configured to run on port 5173 to match common Base44 expectations.

## Quickstart
1. Extract the zip and open a terminal in the project folder.
2. Copy your exported `src/` (or relevant React components) into `src/` here.
3. Copy `.env.example` to `.env.local` and set your Supabase values.
4. Install dependencies and run dev:
   ```bash
   npm install
   npm run dev
   ```
   The app will run at: http://localhost:5173

## Notes and migration tips
- Routing: Next uses the `pages/` directory. Convert any `react-router` routes to files under `pages/` (e.g. `pages/dashboard.jsx`).
- Env variables: replace `import.meta.env.VITE_*` with `process.env.NEXT_PUBLIC_*` in your code.
- Aliases: `@/` is set to `src/` via `jsconfig.json` so imports like `@/components/Button` will work.
- Supabase: `supabaseClient.js` is provided and reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Tailwind: global CSS imported in `_app.jsx`. Run `npx tailwindcss -i ./src/styles/globals.css -o ./public/output.css --watch` only if you need to build manually; Next handles it on dev.

## Adding shadcn/ui (optional modern UI)
To add shadcn UI components follow their official steps. A common approach:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button form
```
After adding, copy the generated components into `src/components/ui`.

## If you hit import resolution errors after pasting your code
- Run `grep -R --line-number "from ['\"]@" src || true` to find `@` imports and fix paths.
- Add small shim files under `src/compat/` for any `@base44/*` imports (see README section below).

## Compat / Shim approach (recommended incremental migration)
1. Create `src/compat/base44/index.js` and export minimal functions your code expects (use `supabaseClient` inside).
2. Add a path alias if needed (already `@/*` maps to `src/*`). Example shim:
   ```js
   // src/compat/base44/index.js
   import { createClient } from '@supabase/supabase-js'
   export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
   export function usePage(){ return { params: {}, query: {} } }
   ```

## Support
If you want, I can adapt this template to your exact exported folder (create shims automatically and a short patch). Upload a small zip of your exported `src/` and I’ll prepare an adapted version.
