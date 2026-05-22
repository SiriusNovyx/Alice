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
