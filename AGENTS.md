# AGENTS.md

## Cursor Cloud specific instructions

ProdScreen is a MERN production-tracking app organized as an npm-workspaces monorepo with two packages:

- `server` — Express 5 + Mongoose API (port `4000`). Scripts in `server/package.json` (`npm run dev` = nodemon, `npm test` = vitest, `npm run seed`).
- `client` — React 19 + Vite SPA (dev port `5173`). Scripts in `client/package.json` (`npm run dev`, `npm run lint` = oxlint, `npm run build`).

Standard run/build/lint commands are documented in `README.md` and the package manifests; reference those rather than duplicating. Root `npm install` installs both workspaces.

### Required services and how to run them

- **MongoDB** is required — the API exits on boot if it cannot connect. MongoDB 8 is installed at the VM level but there is **no systemd**, so start it manually (not via `service`/`systemctl`), in its own tmux session:
  `mongod --dbpath /data/db --bind_ip 127.0.0.1 --port 27017` (`/data/db` exists and is writable).
- **API**: `npm --prefix server run dev` (needs MongoDB running first). Health check: `curl http://localhost:4000/api/health` → `{"status":"ok",...}` (note the `/api` prefix; there is no bare `/health`).
- **Web**: `npm --prefix client run dev` (Vite at `http://localhost:5173`).

### Environment files (gitignored — must exist locally)

`.gitignore` excludes `.env`/`.env.*`, so env files are **not** committed; `server/.env.example` and `client/.env.example` **do** exist as templates — copy them. The server fails fast (Zod-validated `server/src/config/env.js`) without valid config.

- `server/.env` must define at least `MONGODB_URI=mongodb://127.0.0.1:27017/prodscreen` and `JWT_SECRET` (**minimum 16 chars**). Useful extras: `PORT=4000`, `CLIENT_URL=http://localhost:5173`. To seed the first admin, also set `SEED_SUPER_ADMIN_NAME`, `SEED_SUPER_ADMIN_EMAIL`, `SEED_SUPER_ADMIN_PASSWORD`.
- `client/.env`: `VITE_API_URL=http://localhost:4000` (the client appends `/api`).

`GROQ_API_KEY` and KPI+ integration vars are optional; those integrations degrade gracefully when unset.

### Bootstrapping the first user (no public registration)

There is **no** public registration endpoint — `/api/auth` only exposes `login`, `logout`, `me`. New users are created by an authenticated admin via `/api/users`. To bootstrap, run the seed script, which creates a `super_admin` (and base column/table templates) from the `SEED_SUPER_ADMIN_*` env vars:
`npm --prefix server run seed`. Then log in through the UI at `/login`.

User roles are `super_admin`, `factory_admin`, `supervisor`, `operator`.

### Gotchas

- Auth uses an httpOnly cookie (`ps_token`); the client relies on CORS credentials, so `CLIENT_URL` in `server/.env` must match the web origin.
- Vite dev server hot-reloads the client; the API uses `nodemon` and restarts on file changes.
- `docker-compose.yml` exposes the web on port `8080` and the API on `4000`; prefer the local dev flow above for development.
