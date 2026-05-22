<<<<<<< HEAD
# Migrating from a version before 30 Mar 2024
Zeppelin's production environment was restructured on 30 Mar 2024. Here's a list of changes to keep in mind when updating to the new version:
* The docker compose file for the production environment is now called `docker-compose.standalone.yml`. There is also a `docker-compose.lightweight.yml` file for different use cases, see [PRODUCTION.md](PRODUCTION.md) for details.
* Env variables in `backend/bot.env` and `backend/api.env` have been consolidated into `.env` at the root directory
  * It is recommended to create a fresh `.env` file based on `.env.example`
* MySQL data is no longer symlinked to `docker/production/data`. This means that when you start the bot for the first time, the database will also be created fresh.
  * To migrate your data, connect to the database and import a database dump
  * If you did not take a backup of your data before updating, check the `volumes` section of the `mysql` service in [docker-compose.production.yml](../docker-compose.production.yml) for instructions on loading the old data folder
* When the production Docker image is being built, files from the bot's folder are now *copied* rather than linked. This means that if you make changes to the files, you need to rebuild the services to see the changes.

If you need help with any of these steps, please join us on the Zeppelin self-hosting community The Hangar at [https://discord.gg/uTcdUmF6Q7](https://discord.gg/uTcdUmF6Q7)!
=======
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
>>>>>>> a0a54da391085c24c9e28ad6ab2874adc81600a7
