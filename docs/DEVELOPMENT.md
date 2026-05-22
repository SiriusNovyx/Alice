# Alice — Development Environment

⚠️ **Updating from before 30 Mar 2024? See [MIGRATE_DEV.md](./MIGRATE_DEV.md) for instructions.**

Alice's development environment runs entirely within a Docker container.
Below you can find instructions for setting up the environment and getting started with development.

**Note:** If you'd just like to run the bot for your own server, see 👉 **[PRODUCTION.md](./PRODUCTION.md)** 👈

---

## Starting the Development Environment

### Using VSCode Devcontainers
1. Install Docker
2. Make a copy of `.env.example` called `.env`
3. Fill in the missing values in `.env`
4. In VSCode: Install the `Dev Containers` plugin
5. In VSCode: Run `Dev Containers: Open Folder in Container...` and select the Alice folder

### Using VSCode Remote SSH Plugin
1. Install Docker
2. Make a copy of `.env.example` called `.env`
3. Fill in the missing values in `.env`
4. Run `docker compose -f docker-compose.development.yml up` to start the development environment
5. In VSCode: Install the `Remote - SSH` plugin
6. In VSCode: Run `Remote-SSH: Connect to Host...`
   - Address: `ubuntu@127.0.0.1:3022` (where `3022` matches `DEVELOPMENT_SSH_PORT` in `.env`)
   - Password: value of `DEVELOPMENT_SSH_PASSWORD` in `.env`
7. In VSCode: Once connected, click `Open folder...` and select `/home/ubuntu/alice`

### Using JetBrains Gateway
1. Install Docker
2. Make a copy of `.env.example` called `.env`
3. Fill in the missing values in `.env`
4. Run `docker compose -f docker-compose.development.yml up` to start the development environment
5. Choose `Connect via SSH` and create a new connection:
   - Username: `ubuntu`
   - Host: `127.0.0.1`
   - Port: `3022` (matching `DEVELOPMENT_SSH_PORT` in `.env`)
6. Click `Check Connection and Continue` and enter the password from `DEVELOPMENT_SSH_PASSWORD`
7. In the next pane:
   - IDE version: WebStorm, PHPStorm, or IntelliJ IDEA
   - Project directory: `/home/ubuntu/alice`
8. Click `Download and Start IDE`

### Using Any Other IDE with SSH Support
1. Install Docker
2. Make a copy of `.env.example` called `.env`
3. Fill in the missing values in `.env`
4. Run `docker compose -f docker-compose.development.yml up`
5. Connect your IDE using:
   - Host: `127.0.0.1`
   - Port: `3022` (matching `DEVELOPMENT_SSH_PORT` in `.env`)
   - Username: `ubuntu`
   - Password: value of `DEVELOPMENT_SSH_PASSWORD` in `.env`

---

## Starting the Project

These commands are run inside the dev container. Open a terminal in your IDE after connecting.

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start the Backend (Bot + API)
```bash
cd ~/alice/backend
pnpm run watch
```

### 3. Start the Dashboard
```bash
cd ~/alice/dashboard
pnpm run watch
```

### 4. Open the Dashboard
Browse to `https://localhost:3300`

---

## Building for Production (Local Build)

Alice uses a **local build** via `docker-compose.standalone.yml` rather than pulling a pre-built image. This means your code changes are always compiled and included.

```bash
docker compose -f docker-compose.standalone.yml build --no-cache
docker compose -f docker-compose.standalone.yml up -d
```

> **Why `--no-cache`?** Docker caches build layers aggressively. Use `--no-cache` after changing any TypeScript source files to guarantee a fresh compile.

---

## Enabling Slash Commands

To register slash commands with Discord, re-invite the bot using the `applications.commands` scope:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot+applications.commands
```

Slash commands are registered automatically on bot startup once the scope is granted.

---

## Project Structure

```
alice/
├── backend/                  # Bot + API (TypeScript / Node.js)
│   └── src/
│       ├── plugins/          # All bot plugins (automod, logs, moderation, etc.)
│       ├── data/             # Database entities and repositories
│       ├── api/              # REST API for the dashboard
│       └── utils/            # Shared utilities
├── dashboard/                # Web dashboard (Vue 3)
├── docs/                     # Documentation (you are here)
├── docker-compose.*.yml      # Docker Compose configs
├── Dockerfile                # Main build image
└── .env.example              # Environment variable template
```

---

## Adding a New Plugin Command

### Message command (`!prefix`)
Create a file following this pattern:
```typescript
export const MyCmd = myPluginMsgCmd({
  trigger: "mycommand",
  description: "What this command does",
  usage: "!mycommand <user> [reason]",
  permission: "can_mycommand",
  signature: {
    user: ct.string(),
    reason: ct.string({ catchAll: true }),
  },
  async run({ message: msg, args, pluginData }) {
    // implementation
  },
});
```

### Slash command (`/slash`)
Create a matching `MySlashCmd.ts` file:
```typescript
export const MySlashCmd = myPluginSlashCmd({
  name: "mycommand",
  configPermission: "can_mycommand",
  description: "What this command does",
  allowDms: false,
  signature: [
    slashOptions.user({ name: "user", description: "Target user", required: true }),
    slashOptions.string({ name: "reason", description: "Reason", required: false }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    // implementation
  },
});
```

Register both in the plugin's `Plugin.ts` under `messageCommands` and `slashCommands`.

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `KEY` | Random 32-character secret key |
| `CLIENT_ID` | Discord application client ID |
| `CLIENT_SECRET` | Discord application client secret |
| `BOT_TOKEN` | Discord bot token |
| `STAFF` | Comma-separated list of Discord user IDs with bot-owner access |
| `DEFAULT_ALLOWED_SERVERS` | Comma-separated server IDs allowed on startup |
| `DEVELOPMENT_SSH_PORT` | SSH port for the dev container (default `3022`) |
| `DEVELOPMENT_SSH_PASSWORD` | SSH password for the dev container |

See `.env.example` for the full list including database and production variables.
