# Alice documentation

Self-host and offline reference docs. Prefer the dashboard website at `/docs` when it is available; use this folder when the site is down or unreachable.

| Doc | Purpose |
|---|---|
| [PRODUCTION.md](./PRODUCTION.md) | Run Alice in production (Docker) |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Local development environment |
| [MANAGEMENT.md](./MANAGEMENT.md) | Allowlist, dashboard, config overview |
| [COMMANDS.md](./COMMANDS.md) | **Offline command reference** (all plugins) |
| [commands/](./commands/) | One command doc file per plugin |
| [MIGRATE_PROD.md](./MIGRATE_PROD.md) | Production migration notes |
| [MIGRATE_DEV.md](./MIGRATE_DEV.md) | Development migration notes |

## Docker rebuild note

A normal `docker compose ... build` is enough after code changes. `--no-cache` is **optional** — use it only to clear a corrupted or stale Docker layer cache:

```bash
docker compose -f docker-compose.standalone.yml build --no-cache
```

## Regenerating command docs

From the repo root:

```bash
python docs/_gen_commands.py
```
