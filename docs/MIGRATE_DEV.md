<<<<<<< HEAD
# Migrating from a version before 30 Mar 2024
Zeppelin's development environment was restructured on 30 Mar 2024. Here's a list of changes to keep in mind when updating to the new version:
* Env variables in `backend/bot.env` and `backend/api.env` have been consolidated into `.env` at the root directory
  * It is recommended to create a fresh `.env` file based on `.env.example`
* MySQL data is no longer symlinked to `docker/development/data`. This means that when you start the dev env for the first time, the database will also be created fresh.
  * The data is now saved to a named Docker volume instead
  * If you need to move over the old data, check the `volumes` section of the `mysql` service in [docker-compose.development.yml](../docker-compose.development.yml) for instructions.
* The recommended dashboard watch command has changed from `npm run watch-build` to `npm run watch`
* If you had made changes to the home folder of the devenv (i.e. `/home/ubuntu` inside the `devenv` container), e.g. by adding SSH keys to `.ssh`, these will need to be re-applied
  * For SSH specifically, it is recommended to use SSH agent forwarding rather than copying key files directly to the container. VS Code and Jetbrains Gateway handle this for you automatically.
=======
# Migrating the Development Environment

## Migrating from before 30 Mar 2024

The development environment was restructured on 30 Mar 2024. Here's what changed:

- **Environment variables consolidated** — `backend/bot.env` and `backend/api.env` no longer exist. All variables are now in `.env` at the root directory. Create a fresh `.env` from `.env.example`.
- **MySQL data location changed** — Data is no longer symlinked to `docker/development/data`. It is now saved to a named Docker volume.
  - On first start after migration, the database will be created fresh.
  - To migrate old data, check the `volumes` section of the `mysql` service in [docker-compose.development.yml](../docker-compose.development.yml) for instructions.
- **Dashboard watch command changed** — Use `pnpm run watch` instead of the old `npm run watch-build`.
- **SSH keys** — If you had SSH keys or other files in `/home/ubuntu` inside the `devenv` container, they need to be re-applied. For SSH specifically, use SSH agent forwarding — VSCode and JetBrains Gateway handle this automatically.

---

## Migrating from a Pre-Local-Build Setup

If you were previously running Alice using the `dragory/zeppelin` image pulled from Docker Hub, your local file changes were **not being applied** — the pre-built image was used instead.

Alice now builds from your local source code. To switch:

1. Replace `docker-compose.standalone.yml` with the updated version that uses `build: context: .` instead of `image: dragory/zeppelin`
2. Run a full clean rebuild:
   ```bash
   docker compose -f docker-compose.standalone.yml down
   docker compose -f docker-compose.standalone.yml build --no-cache
   docker compose -f docker-compose.standalone.yml up -d
   ```

> **Always use `--no-cache`** when rebuilding after TypeScript source changes. Without it, Docker may use cached layers and skip recompilation.
>>>>>>> a0a54da391085c24c9e28ad6ab2874adc81600a7
