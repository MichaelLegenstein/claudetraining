# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo currently contains a single app, `finance-dashboard/` — a personal finance tracker (transactions, categories, budgets, spending summaries). It's an npm workspaces monorepo with three parts:

- `finance-dashboard/client` — React 18 + Vite + TypeScript SPA, styled with Tailwind, data fetching via TanStack Query, charts via Recharts.
- `finance-dashboard/server` — Express + TypeScript API, using Node's built-in `node:sqlite` (`DatabaseSync`) — no ORM.
- `finance-dashboard/shared` — TypeScript types shared between client and server (`shared/types.ts`). Both sides import from here (client via the `@shared/*` path alias, server via relative `../../../shared/...` imports) — this is the single source of truth for API request/response shapes, so update it first when changing an API contract.

## Commands

Run from `finance-dashboard/`:

- `npm run dev` — runs client (Vite) and server (tsx watch) concurrently.
- `npm run build` — builds client then server.
- `npm run dev -w client` / `npm run dev -w server` — run just one side.
- `npm run build -w server` — compiles server TS and copies `schema.sql` into `dist`.

There are no lint or test scripts configured in this repo.

## Architecture

### Server (`finance-dashboard/server/src`)

Layered as `routes` → `validation` (Zod) → `repositories` (raw SQL via `node:sqlite`) → `db`.

- `db/index.ts` opens the SQLite DB (file at `server/data/finance.db`, gitignored) with WAL mode and foreign keys on, and exports `runInTransaction` for multi-statement writes (used by budget upserts and seeding).
- `db/schema.sql` is the entire schema (`categories`, `transactions`, `budgets`); `db/migrate.ts` just executes it with `CREATE TABLE IF NOT EXISTS` — there is no migration framework, so schema changes are additive edits to this one file.
- `db/seed.ts` inserts a fixed set of default categories (`INSERT OR IGNORE`) on every server startup, after `migrate()`, in `index.ts`.
- Each repository (`categoriesRepo.ts`, `transactionsRepo.ts`, `budgetsRepo.ts`, `summaryRepo.ts`) hand-writes SQL with named (`@param`) or positional (`?`) placeholders and maps snake_case rows to camelCase domain objects (see `toCategory`/`toTransaction`) — follow this convention for new tables/columns.
- Routes parse `req.body`/`req.query` with a Zod schema from `validation/schemas.ts` before touching a repository. Validation failures throw `ZodError`, which `middleware/errorHandler.ts` catches and turns into a `400`. Domain errors (e.g. `CategoryInUseError` from deleting a category still referenced by transactions/budgets) are also translated centrally in `errorHandler.ts` — add new domain error classes there rather than handling status codes in routes.
- Month-based filtering throughout (`transactions`, `budgets`, `summary`) uses a `YYYY-MM` string, matched against dates via SQLite's `substr(date, 1, 7)`; budgets additionally store `year`/`month` as separate integer columns (unique per `category_id, year, month`).
- `summaryRepo.ts` computes derived aggregates directly in SQL (`getSpendingByCategory`, `getBudgetVsActual`) rather than composing them from other repositories.

### Client (`finance-dashboard/client/src`)

- `App.tsx` wraps everything in a single `QueryClientProvider`; `AppShell` (layout) wraps `Dashboard` (the one page).
- `api/client.ts` is the sole place that calls `fetch` — a small `request<T>` wrapper prefixes paths with `/api`, throws on non-OK responses using the server's `{ error }` body, and every endpoint is exposed as a method on the `api` object. Add new endpoints here rather than calling `fetch` from components/hooks.
- Vite proxies `/api` to `http://localhost:3001` in dev (`vite.config.ts`), so the client never needs an absolute server URL.
- Data access from components goes through `hooks/use*.ts`, one hook module per resource, wrapping TanStack Query. Mutations invalidate related query keys via a local `useInvalidateMonth`-style helper — e.g. mutating a transaction invalidates `['transactions', month]` plus both summary query keys for that month. When adding a mutation, invalidate every query key whose data it affects.
- Components are organized by feature under `components/{budgets,charts,transactions,layout}`.

### Adding a new resource end-to-end

The established pattern (follow it for consistency): add/extend a table in `schema.sql` → add types to `shared/types.ts` → add a Zod schema in `server/src/validation/schemas.ts` → add a repository function → add/extend a route → add a method in `client/src/api/client.ts` → add a `use*` hook → consume it in a component.
