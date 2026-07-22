# Portfolio

Aditya Shelke's personal portfolio website. Originally scaffolded with Lovable.dev's AI
website builder, then migrated off Lovable's build tooling onto a plain, standard Vite +
TanStack Start setup so it can be built and deployed independently of Lovable.

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19, full SSR)
- **Routing:** [TanStack Router](https://tanstack.com/router) (file-based, routes in `src/routes/`)
- **Data fetching:** [TanStack Query](https://tanstack.com/query)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives), configured in `components.json`
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Contact form:** EmailJS (`@emailjs/browser`)
- **Build tool:** [Vite 7](https://vite.dev/)
- **Package manager:** [Bun](https://bun.sh/) — the *only* package manager used in this project
- **Hosting:** [Cloudflare Workers](https://developers.cloudflare.com/workers/), via `@cloudflare/vite-plugin` + Wrangler

## Project Structure

```
src/
  routes/            # File-based routes (TanStack Router)
  lib/
    error-capture.ts  # Captures unhandled errors server-side
    error-page.ts     # Renders a branded HTML error page
  server.ts           # Custom Worker fetch handler / SSR entry wrapper
  start.ts            # TanStack Start instance + server error middleware
  router.tsx          # Router factory (QueryClient + TanStack Router)
public/               # Static assets (favicon, CV PDF, etc.)
wrangler.jsonc        # Cloudflare Workers config (name, compatibility flags, main entry)
vite.config.ts        # Vite + TanStack Start + Cloudflare plugin config
bunfig.toml           # Bun install config (24h supply-chain release-age guard)
bun.lock              # The lockfile — single source of truth for dependencies
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed (`curl -fsSL https://bun.sh/install | bash`)

### Install dependencies

```bash
bun install
```

### Run the dev server

```bash
bun run dev
```

Starts the Vite dev server at `http://localhost:5173`, with Cloudflare bindings available
via the dev CLI prompts (`b` to list bindings, `t` to start a tunnel).

### Build for production

```bash
bun run build
```

Builds both the client and SSR (Worker) bundles into `dist/client` and `dist/server`
(including a generated `dist/server/wrangler.json`).

### Preview a production build locally

```bash
bun run preview
```

### Lint & format

```bash
bun run lint
bun run format
```

## Deployment

This project deploys via **Cloudflare Workers Builds** — Cloudflare's own CI, connected
directly to this GitHub repo (not GitHub Actions). Every push to `main` triggers:

1. `bun install --frozen-lockfile` (automatic, using `bun.lock`)
2. **Build command** — configured in Cloudflare dashboard → Worker → Settings → Build:
   ```
   bun run build
   ```
3. **Deploy command** — a separate field in the same settings page:
   ```
   npx wrangler deploy -c dist/server/wrangler.json
   ```

The `-c dist/server/wrangler.json` flag is required. Deploying with a bare
`npx wrangler deploy` reads the top-level `wrangler.jsonc`, which points at the raw
*source* `src/server.ts` and fails to resolve TanStack Start's internal virtual modules
(`#tanstack-router-entry`, `#tanstack-start-entry`, `tanstack-start-manifest:v`). Those
only resolve correctly through Vite's plugin pipeline — hence the build must run first,
and the deploy step must target the *built* config in `dist/server/`, not the source config.

`wrangler.jsonc`'s `main` field points to `src/server.ts` for local dev purposes and must
stay in sync with the `tanstackStart({ server: { entry: "server" } })` option in
`vite.config.ts`.

## Notes & Gotchas

A few decisions worth knowing before making changes:

- **Only use Bun — never run `npm install`.** This repo used to carry both `bun.lock` and
  `package-lock.json`; `package-lock.json` has been removed and should stay removed, since
  running `npm install` regenerates it and can cause dependency drift. Use `bun add <pkg>`
  / `bun add -d <pkg>` instead of `npm install <pkg>`.
- **No `@lovable.dev/vite-tanstack-config`.** The project originally used Lovable's wrapper
  package in `vite.config.ts`, which bundled the TanStack Start / Cloudflare / Tailwind /
  tsconfig-paths plugins together along with Lovable-editor-only features (component
  tagging, sandbox detection, an error-logging bridge to Lovable's UI). None of that is
  needed outside Lovable's own editor, so `vite.config.ts` now imports the underlying
  plugins directly. Don't re-add this package.
- **Build command and Deploy command are separate fields** in the Cloudflare dashboard —
  don't paste one into the other.
- **`bunfig.toml`'s supply-chain guard is intentional.** `minimumReleaseAge = 86400` skips
  installing any package version published less than 24 hours ago, as a defense against
  newly-published/compromised packages.
- **Worker name.** `wrangler.jsonc`'s `"name"` must match the actual Cloudflare Workers
  project name (`"portfolio"`), or Cloudflare's CI will keep flagging a mismatch.

## License

MIT — see [LICENSE](./LICENSE).
