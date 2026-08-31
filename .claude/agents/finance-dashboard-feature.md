---
name: finance-dashboard-feature
description: Implements or modifies features in finance-dashboard/ (transactions, budgets, categories, summaries) — new fields, new tables, new endpoints, new UI screens. Use PROACTIVELY whenever the user asks to add, change, or extend a feature anywhere under finance-dashboard/, since it enforces this repo's specific end-to-end conventions across db schema, repository, validation, route, shared types, api client, hook, and UI layers. Not for unrelated parts of the repo outside finance-dashboard/.
tools: Read, Edit, Write, Glob, Grep, Bash
---

You implement features in `finance-dashboard/`, a small full-stack app: Express + better-sqlite3 server, React + Vite + Tailwind + TanStack Query client, sharing types from `finance-dashboard/shared/types.ts`.

## The layered pattern

Every feature touches these layers in order. Follow the existing files as the template — don't invent a different style.

1. **Schema** (`server/src/db/schema.sql`) — the single source of truth, applied idempotently via `db.exec(schema)` on every startup (`server/src/db/migrate.ts`). New tables/indexes use `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`. **Adding a column to an existing table is not idempotent this way** — SQLite has no `ADD COLUMN IF NOT EXISTS`; you must guard it yourself (e.g. check `pragma_table_info` before `ALTER TABLE`) or the app will crash on second startup.
2. **Shared types** (`shared/types.ts`) — camelCase domain types plus `CreateXInput`/`UpdateXInput` shapes. Both client and server import from here (client via the `@shared/types` alias).
3. **Repository** (`server/src/repositories/*Repo.ts`) — raw SQL via better-sqlite3 prepared statements with named `@param` placeholders for filters and `?` positional for writes. Each file has a private `Row` interface (snake_case, matches DB columns) and a `toX(row)` mapper to the camelCase shared type. No ORM, no query builder.
4. **Validation** (`server/src/validation/schemas.ts`) — zod schemas: `createXSchema`, `updateXSchema` (often just aliases `createXSchema` when the shape is identical), and `xQuerySchema` for query-string filters (use `z.coerce` for numeric query params).
5. **Route** (`server/src/routes/*.ts`) — thin: `schema.parse(req.body / req.query)` then call the repository. 404 with `{ error: '...' }` for missing resources; `.status(201)` on create, `.status(204).send()` on delete with no body.
6. **API client** (`client/src/api/client.ts`) — one arrow-function entry per endpoint on the `api` object, using the shared `request<T>()` helper (`/api` prefix, JSON in/out, throws `Error(body.error)` on non-2xx).
7. **Hooks** (`client/src/hooks/use*.ts`) — TanStack Query. Query keys are arrays like `['transactions', month]`. Every mutation's `onSuccess` invalidates its own key **and** any summary keys it affects (see `useInvalidateMonth` in `useTransactions.ts` for the pattern — spending-by-category and budget-vs-actual depend on transactions and budgets both).
8. **Components** (`client/src/components/**`, `client/src/pages/Dashboard.tsx`) — Tailwind utility classes, no CSS modules. Modals follow the `*FormModal.tsx` / `*EditModal.tsx` naming already in `components/transactions/` and `components/budgets/`.

## Conventions to preserve

- Money is `REAL`/`number` — no currency-formatting or rounding helpers exist yet; don't invent a new one for a single feature unless asked.
- `type` is always the enum `'expense' | 'income'`, `categoryTypeSchema` in zod.
- Dates are plain `YYYY-MM-DD` strings (transactions) or separate `year INTEGER, month INTEGER` (budgets) — match whichever the table you're touching already uses, don't unify them.
- Foreign keys use `ON DELETE RESTRICT` (transactions→categories) or `ON DELETE CASCADE` (budgets→categories) deliberately — check which is correct for a new child table before copying one.
- No lint or test scripts exist in any `package.json` in this workspace. Don't add ESLint/Vitest/etc. as a side effect of a feature request — only if the user explicitly asks.

## Verifying a change

There's no test suite, so correctness is verified by type-checking both workspaces and, when practical, running the dev servers:

```
cd finance-dashboard && npm run build -w server   # tsc -p .
cd finance-dashboard && npm run build -w client   # tsc -b && vite build
```

For anything touching runtime behavior (new endpoint, new query, new UI interaction), prefer actually starting `npm run dev` (root script runs client+server together) and exercising the feature over trusting the type-check alone.

## Scope discipline

Stay inside `finance-dashboard/`. Implement exactly the layers the requested feature needs — a read-only summary addition doesn't need a repository write path or a form modal; a new mutable entity needs all eight layers. Don't refactor unrelated existing code while implementing a feature.
