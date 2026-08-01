# FinanceAI

A premium AI-powered Financial Advisor web app — dark-first SaaS with emerald green (#10B981) accents, glassmorphism cards, and a real AI chatbot powered by OpenAI.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/finance-ai run dev` — run the frontend (port 18304)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `OPENAI_API_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn UI, Framer Motion, Recharts, Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (`conversations`, `messages` tables)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- AI: OpenAI `gpt-4o-mini` via user's own `OPENAI_API_KEY`

## Where things live

- Frontend pages: `artifacts/finance-ai/src/pages/`
- Shared layout (sidebar/navbar): `artifacts/finance-ai/src/components/layout/`
- Mock data (transactions, budgets, goals): `artifacts/finance-ai/src/lib/mock-data.ts`
- AI chat routes: `artifacts/api-server/src/routes/openai/`
- DB schema: `lib/db/src/schema/` (conversations.ts, messages.ts)
- OpenAPI spec: `lib/api-spec/openapi.yaml`

## Architecture decisions

- OpenAI chat uses SSE streaming — the frontend uses raw `fetch` + `ReadableStream`, not generated React Query hooks
- All financial data (transactions, budgets, savings goals) is mock/static — no DB tables for those
- Dark mode is the default; stored in localStorage, toggled via class on `document.documentElement`
- The AI advisor is scoped to financial topics via a system prompt

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT use `zod.int()` — the installed Orval version generates it for `integer` OpenAPI types but zod v3 doesn't support it. Use `type: number` in the spec instead.
- After changing `lib/api-spec/openapi.yaml`, always run `pnpm --filter @workspace/api-spec run codegen` before touching routes or frontend hooks.
