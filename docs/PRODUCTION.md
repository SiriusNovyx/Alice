# Alice — Production Environment

⚠️ **Updating from before 30 Mar 2024? See [MIGRATE_PROD.md](./MIGRATE_PROD.md) for instructions.**

Alice's production environment uses Docker. There are three ways to run Alice in production:

1. **Standalone** — Easiest setup. Comes with a built-in MySQL database and web server. Recommended for most users.
2. **Lightweight** — No built-in database or web server. You provide your own database and reverse proxy.
3. **Manual** — Run individual services directly via Docker for custom platforms (e.g. Railway).

---

## Prerequisites

- Docker installed on the host machine
- A Discord application with a bot token — [Discord Developer Portal](https://discord.com/developers/applications)
- Your bot invited to your server with the correct scopes:
  ```
  https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot+applications.commands
  ```
  > The `applications.commands` scope is required for slash commands.

---

## Standalone

### Setup
1. Install Docker
2. Copy `.env.example` to `.env`
3. Fill in all values in `.env`, including the **PRODUCTION - STANDALONE** section:
   - `KEY` — a random 32-character secret
   - `CLIENT_ID` and `CLIENT_SECRET` — from the Discord Developer Portal
   - `BOT_TOKEN` — your bot token
   - `STAFF` — your Discord user ID
   - `DEFAULT_ALLOWED_SERVERS` — your server ID
   - `STANDALONE_MYSQL_PASSWORD` and `STANDALONE_MYSQL_ROOT_PASSWORD` — choose strong passwords

> **Security note:** The dashboard and API are served over HTTP. It is strongly recommended to place a reverse proxy with TLS in front of them. [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/) is a popular free option.

### Running the Bot
```bash
docker compose -f docker-compose.standalone.yml up -d
```

### Shutting Down
```bash
docker compose -f docker-compose.standalone.yml down
```

### Updating the Bot
```bash
docker compose -f docker-compose.standalone.yml down
git pull
docker compose -f docker-compose.standalone.yml build --no-cache
docker compose -f docker-compose.standalone.yml up -d
```

> **Important:** Always use `--no-cache` when rebuilding after changing source files. Docker caches build layers and will not recompile changed TypeScript files without it.

### Viewing Logs
```bash
docker compose -f docker-compose.standalone.yml logs -t -f
```

### Checking Build Warnings
The following warning during build is **safe to ignore**:
```
Warning: Ignored build scripts: bufferutil, utf-8-validate.
```
These are optional WebSocket performance addons. Discord.js has pure JavaScript fallbacks and works correctly without them.

---

## Lightweight

### Setup
1. Install Docker
2. Copy `.env.example` to `.env`
3. Fill in all values in `.env`, including the **PRODUCTION - LIGHTWEIGHT** section
4. Provide your own MySQL database and configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`

### Running the Bot
```bash
docker compose -f docker-compose.lightweight.yml up -d
```

### Shutting Down
```bash
docker compose -f docker-compose.lightweight.yml down
```

### Updating the Bot
```bash
docker compose -f docker-compose.lightweight.yml down
git pull
docker compose -f docker-compose.lightweight.yml build --no-cache
docker compose -f docker-compose.lightweight.yml up -d
```

### Viewing Logs
```bash
docker compose -f docker-compose.lightweight.yml logs -t -f
```

---

## Manual

Build the Alice image and run individual services directly.

### Build the Image
```bash
docker build --tag 'alice' .
```

### Run Individual Services
```bash
# Bot
docker run alice pnpm run start-bot

# API
docker run alice pnpm run start-api

# Dashboard
docker run alice pnpm run start-dashboard
```

### Run Migrations
Always run migrations when updating the bot:
```bash
docker run alice pnpm run migrate-prod
```

### Environment Variables
Pass environment variables when running manually:
```bash
docker run -e NODE_ENV=production --env-file .env alice pnpm run start-bot
```

Required environment variables:

| Variable | Description |
|---|---|
| `NODE_ENV` | Must be `production` |
| `KEY` | Random 32-character secret |
| `CLIENT_ID` | Discord application client ID |
| `CLIENT_SECRET` | Discord application client secret |
| `BOT_TOKEN` | Discord bot token |
| `STAFF` | Comma-separated Discord user IDs with owner access |
| `DEFAULT_ALLOWED_SERVERS` | Comma-separated server IDs allowed by default |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_DATABASE` | MySQL database name |
| `API_PATH_PREFIX` | API path prefix (default `/api`) |

### Platform Deployments (e.g. Railway)
Point the platform to Alice's repository — it will detect the `Dockerfile` automatically.
Use these start commands per service: `pnpm run start-bot`, `pnpm run start-api`, `pnpm run start-dashboard`.
Always run `pnpm run migrate-prod` before starting after an update.

---

## First Run Checklist

After the bot is running:

- [ ] Bot is online and visible in your server
- [ ] Run `@Alice allow_server YOUR_SERVER_ID YOUR_USER_ID` in a channel the bot can see
- [ ] Open the dashboard and paste your server config YAML
- [ ] Verify log channels are receiving events
- [ ] Test `!ping` and `/ping` to confirm both prefix and slash commands work
- [ ] Confirm censor notifications are being sent on filtered messages

See [MANAGEMENT.md](./MANAGEMENT.md) for full configuration guidance.
