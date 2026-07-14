The project is called Zeppelin. It's a Discord bot that uses Discord.js. The bot is built on the Vety framework (formerly called Knub).

This repository is a monorepository that contains these projects:
1. **Backend**: The shared codebase of the bot and API. Located in `backend`.
2. **Dashboard**: The web dashboard that contains the bot's management interface and documentation. Located in `dashboard`.
3. **Config checker**: A tool to check the configuration of the bot. Located in `config-checker`.

There is also a `shared` folder that contains shared code used by all projects, such as types and utilities.

# Backend
The backend codebase is located in the `backend` directory. It contains the main bot code, API code, and shared code used by both the bot and API.
Zeppelin's functionality is split into plugins, which are located in the `src/plugins` directory.
Each plugin has its own directory, with a `types.ts` for config types, `docs.ts` for a `ZeppelinPluginDocs` structure, and the plugin's main file.
Each plugin has an internal name, such as "common". In this example, the folder would be `src/plugins/Common` (note the capitalization). The plugin's main file would be `src/plugins/CommonPlugin.ts`.
There are two types of plugins: "guild plugins" and "global plugins". Guild plugins are loaded on a per-guild basis, while global plugins are loaded once for the entire bot.
Plugins can specify dependencies on other plugins and call their public methods. Likewise, plugins can specify public methods in the main file.
Available plugins are specified in `src/plugins/availablePlugins.ts`.

Zeppelin's data layer uses TypeORM. Entities are located in `src/data/entities`, while repositories are in `src/data`. If the repository name is prefixed with "Guild", it's a guild-specific repository. If it's prefixed with "User", it's a user-specific repository. If it has no prefix, it's a global repository.

Environment variables are parsed in `src/env.ts`.

## Cursor Cloud specific instructions

Standard commands live in `docs/DEVELOPMENT.md`, the root `package.json`, `backend/package.json`, and `dashboard/package.json` — refer to those rather than duplicating them. The notes below are the non-obvious things specific to running this repo natively in the Cursor Cloud VM (the official dev flow is Docker-based, but the VM runs the services natively instead).

### Toolchain
- The project requires **Node 24** (`engines.node >= 24`) and **pnpm 10.19.0**. The VM's default `/exec-daemon/node` is Node 22; Node 24 is installed via `nvm` and made default through `~/.bashrc`, so a login shell (`bash -l`) picks it up. Verify with `node --version` → `v24.x`. If it shows v22, run `nvm use 24`.

### Services (not started by the update script — start them each session)
- **MySQL 8** and **Redis** are installed via apt but there is no systemd, so start them manually:
  - `sudo service mysql start`
  - `sudo service redis-server start`
- The dev DB/user is: database `zeppelin`, user `zeppelin`, password `password` (created with `mysql_native_password`). Connection settings are in `.env` (`DB_HOST=127.0.0.1`, etc.).
- `backend/src/data/db.ts` requires the DB session timezone to be **UTC** (it throws otherwise). The VM is UTC, so this is fine.

### Environment file
- `.env` (gitignored, in repo root) is required and read by `backend/src/env.ts`. `KEY`/`CLIENT_ID`/`CLIENT_SECRET`/`BOT_TOKEN` are validated for *format* only. The committed dev `.env` uses placeholder Discord credentials that pass validation, which is enough to run the **API**, **migrations**, **build**, and **dashboard**. The **bot** (`dist/index.js`) additionally needs a real `BOT_TOKEN` to log in to Discord's gateway; without real Discord credentials it will build/start but fail at `client.login()`.

### Build / test gotchas
- The repo commits `backend/tsconfig.tsbuildinfo` and `shared/tsconfig.tsbuildinfo`. Because `tsc --build` is incremental, a plain build against the committed buildinfo can silently skip emitting files (e.g. `dist/logger.js` goes missing and tests fail with `ERR_MODULE_NOT_FOUND`). Do a clean build when in doubt: `rm -rf backend/dist backend/tsconfig.tsbuildinfo shared/dist shared/tsconfig.tsbuildinfo` then rebuild. Avoid committing changes to the `*.tsbuildinfo` files.
- Build the backend with the Dockerfile's flags to avoid a `tsc` SIGSEGV on Node 24: `cd backend && node --no-maglev --max-old-space-size=4096 ../node_modules/typescript/bin/tsc --build`.
- `pnpm run test` in `backend` runs `tsc --build && ava`; use `pnpm run run-tests` to run ava alone after a build.
- `pnpm run lint` (root) is currently broken in this repo: `dashboard/.eslintrc.json` extends a root `../.eslintrc.js` that does not exist, so ESLint 8 errors with "couldn't find a configuration file". Use `pnpm run codestyle-check` (Prettier) for style checks instead. Note Prettier `--check` reports many pre-existing formatting diffs across the codebase; that is the repo's existing state, not a regression.

### Running services natively (dev)
- API: `cd backend && pnpm run start-api-prod` → listens on `http://localhost:3001` with path prefix `/api` (dev). Quick check: `curl http://localhost:3001/api/` returns `{"status":"cookies","with":"milk"}`; `curl http://localhost:3001/api/docs/plugins` lists plugins.
- Dashboard: `cd dashboard && pnpm run dev` → Vite dev server on `http://localhost:3002`.
- Full backend watch (`backend/pnpm run watch`) starts both the bot and API; the bot half will error out on Discord login without real credentials.
- The dashboard reads the API base URL from `window.API_URL` in `dashboard/public/env.js` (default `/api`, same-origin). The official dev setup uses nginx to serve the dashboard and proxy `/api` on one origin (port `DEVELOPMENT_WEB_PORT`). When running the two dev servers directly without that proxy, point the dashboard at the API by setting `window.API_URL = "http://localhost:3001/api"` in `dashboard/public/env.js` (do not commit this change); CORS on the API already allows `DASHBOARD_URL` (`http://localhost:3002`).
