# AGENTS.md

## Cursor Cloud specific instructions

ProdScreen is a MERN production-tracking app organized as an npm-workspaces monorepo with two packages:

- `server` — Express 5 + Mongoose API (port `4000`). Scripts in `server/package.json` (`npm run dev` = nodemon).
- `client` — React 19 + Vite SPA (dev port `5173`). Scripts in `client/package.json` (`npm run dev`, `npm run lint`).

Standard run/build/lint commands are documented in `README.md` and the package manifests; reference those rather than duplicating.

### Required services and how to run them

- **MongoDB** is required — the API calls `process.exit(1)` on boot if it cannot connect. MongoDB 8 is preinstalled but there is **no systemd**, so start it manually (not via `service`/`systemctl`):
  `mongod --dbpath /data/db --bind_ip 127.0.0.1 --port 27017` (run it in its own tmux session; `/data/db` already exists and is writable).
- **API**: `npm --prefix server run dev` (needs MongoDB running first). Health check: `curl http://localhost:4000/health`.
- **Web**: `npm --prefix client run dev`.

### Environment files (gitignored — must exist locally)

`.gitignore` excludes `.env` and `.env.*`, so the env files are **not** committed and `server/.env.example` / `client/.env.example` referenced by the README and `docker-compose.yml` do **not** exist in the repo. The server fails fast (Zod-validated `server/src/config/env.js`) without valid config. If missing, recreate them:

- `server/.env` must define at least `MONGO_URI=mongodb://127.0.0.1:27017/prodscreen` and `JWT_SECRET` (**minimum 16 chars**). Useful extras: `PORT=4000`, `CLIENT_ORIGIN=http://localhost:5173`.
- `client/.env`: `VITE_API_URL=http://localhost:4000` (the client appends `/api`).

`CLAUDE_API_KEY` and `KPI_PLUS_*` are optional; those integrations degrade gracefully (`status: "skipped"`) when unset.

### Gotchas

- **No DB seeding / default user.** The **first** user registered via the UI or `POST /api/auth/register` automatically becomes `admin`; later registrations default to `operator`. Register a user before testing protected/admin flows.
- **`npm test` in `server` does not work** — `server/package.json` points at `src/tests/*.test.js`, but that directory does not exist. There are no automated tests in this repo.
- **Docker path is broken out of the box** because `docker-compose.yml` references the missing `server/.env.example`. Prefer the local dev flow above over `docker compose up`.
- Vite dev server hot-reloads the client; the API uses `nodemon` and restarts on file changes.
