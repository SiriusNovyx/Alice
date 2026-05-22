# Migrating the Production Environment

## Migrating from before 30 Mar 2024

The production environment was restructured on 30 Mar 2024. Here's what changed:

- **New compose file name** — The production Docker Compose file is now `docker-compose.standalone.yml`. There is also `docker-compose.lightweight.yml` for setups where you provide your own database and reverse proxy. See [PRODUCTION.md](./PRODUCTION.md) for details.
- **Environment variables consolidated** — `backend/bot.env` and `backend/api.env` no longer exist. All variables are now in `.env` at the root directory. Create a fresh `.env` from `.env.example`.
- **MySQL data location changed** — Data is no longer symlinked to `docker/production/data`.
  - To migrate your data, connect to the database and import a database dump before starting.
  - If you did not take a backup before updating, check the `volumes` section of the `mysql` service in [docker-compose.production.yml](../docker-compose.production.yml) for instructions on loading from the old data folder.
- **Files are now copied, not linked** — The production Docker image now copies source files at build time rather than linking them. This means **you must rebuild the image after any file change** for changes to take effect.

---

## Migrating from a Pre-Local-Build Setup

If you were previously running Alice using the `dragory/zeppelin` image pulled from Docker Hub, your local code changes were **silently ignored** — the pre-built remote image was always used instead.

Alice now builds entirely from your local source. To switch:

1. Replace `docker-compose.standalone.yml` with the updated version that includes `build: context: .` instead of `image: dragory/zeppelin`
2. Place all your modified source files in the correct locations under `backend/src/`
3. Run a full clean rebuild:
   ```bash
   docker compose -f docker-compose.standalone.yml down
   docker compose -f docker-compose.standalone.yml build --no-cache
   docker compose -f docker-compose.standalone.yml up -d
   ```

> **Always use `--no-cache`** when rebuilding after TypeScript changes. Docker's layer cache will skip recompilation otherwise.

---

## Common Build Errors After Migration

| Error | Cause | Fix |
|---|---|---|
| `Cannot find module '...'` | A file was placed in the wrong folder | Check the correct path — e.g. `SlowmodePlugin.ts` goes in `Slowmode/`, not `Slowmode/commands/` |
| `error TS1005: ',' expected` | Missing comma after a property in a command definition | Add `,` after `description:` before `usage:` |
| `error TS2339: Property does not exist` | TypeScript can't find a property on a type | Rebuild with `--no-cache` to ensure the latest type definitions are compiled |
| `error TS2345: Argument of type 'GuildMember \| undefined'` | `.cache.get()` returns `undefined` but function expects `GuildMember` | Add `!` non-null assertion: `.cache.get(id)!` |
| Build succeeds but config gives `unrecognized_keys` | Backend wasn't rebuilt with new `types.ts` | Rebuild with `--no-cache` |
