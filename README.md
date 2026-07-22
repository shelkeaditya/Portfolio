# Portfolio

Personal portfolio site built with TanStack Start and deployed on Cloudflare Workers.

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19, SSR)
- **Routing:** [TanStack Router](https://tanstack.com/router) (file-based)
- **Data fetching:** [TanStack Query](https://tanstack.com/query)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI components:** [shadcn/ui](https://ui.shadcn.com/) (Radix primitives)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Contact form:** EmailJS
- **Build tool:** [Vite 7](https://vite.dev/)
- **Package manager:** [Bun](https://bun.sh/)
- **Hosting:** [Cloudflare Workers](https://developers.cloudflare.com/workers/) via `@cloudflare/vite-plugin` + Wrangler

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

Starts Vite dev server at `http://localhost:5173`, with Cloudflare bindings available via the dev CLI prompts (`b` to list bindings, `t` to start a tunnel).

### Build for production

```bash
bun run build
```

Builds both the client and SSR (Worker) bundles into `dist/client` and `dist/server`.

### Preview a production build locally

```bash
bun run preview
```

## Deployment

This project deploys to Cloudflare Workers. The build produces a `dist/server/wrangler.json` config consumed by Wrangler; the top-level `wrangler.jsonc` sets the Worker name, compatibility flags, and points `main` at `src/server.ts` (a custom SSR entry that wraps TanStack Start's server handler with error capturing and a branded error page).

Deployment is handled by Cloudflare's Workers Builds CI, which runs:

```bash
bun run build
```

on every push, using `bun.lock` as the single source of truth for dependencies.

## Project Structure

```
src/
  routes/          # File-based routes (TanStack Router)
  lib/
    error-capture.ts
    error-page.ts
  server.ts        # Custom Worker fetch handler / SSR entry wrapper
  start.ts         # TanStack Start instance + server middleware
  router.tsx       # Router factory
public/            # Static assets
wrangler.jsonc     # Cloudflare Workers config
vite.config.ts     # Vite + TanStack Start + Cloudflare plugin config
```

## Linting & Formatting

```bash
bun run lint
bun run format
```

## License

MIT — see [LICENSE](./LICENSE).
