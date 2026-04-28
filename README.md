# 📊 eva-web [WIP]

> **The Visual Truth Engine**  
> Web interface (React + Fastify) for the [EVA-LLM](https://eva-llm.github.io) ecosystem — create test runs against `eva-run` and visualize results in real time.

---

## Architecture

```
packages/
  api/   — Fastify backend (Node 22, TypeScript, Prisma v7)
  web/   — React 19 frontend (Vite, TanStack Query, React Router v7)
```

The **API** package acts as a BFF:
- `POST /api/runs` — forwards a batch of test configs to `eva-run POST /eval` and returns the `test_ids`.
- `GET  /api/runs` — lists all distinct runs with aggregate pass/fail counts (reads the shared Postgres DB).
- `GET  /api/runs/:run_id` — run detail: stats + all `TestResult` rows.
- `GET  /api/runs/:run_id/tests/:test_id/asserts` — all `AssertResult` rows for a specific test.

The **Web** package is a dark-themed dashboard with three screens:
- **Run List** — table of all runs, auto-refreshes every 15 s.
- **Run Detail** — stats bar + test table; click a row to expand its assert results.
- **Create Run** — form to configure a Live Evaluation or JQA/Audit test and fire it to `eva-run`.

---

## Quick Start

```bash
# 1. Copy and fill in env vars
cp .env.example packages/api/.env

# 2. Install dependencies
pnpm install

# 3. Generate Prisma client (same DB as eva-run)
pnpm --filter @eva-web/api run db:generate

# 4. Start both servers in parallel
pnpm dev
#   API → http://localhost:3001
#   Web → http://localhost:5173
```

> **Prerequisite:** `eva-run` must be running and accessible at the URL set in `EVA_RUN_URL` (default `http://localhost:3000`).

---

## License

MIT
