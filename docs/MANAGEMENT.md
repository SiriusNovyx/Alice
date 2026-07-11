# Alice — Management Guide

After starting Alice in either the [development](./DEVELOPMENT.md) or [production](./PRODUCTION.md) environment, you have several tools available to manage it.

---

## Initial Setup Checklist

Before inviting the bot to any server, make sure to:

1. Add yourself to the `STAFF` list in `.env` — this gives you bot-owner level access
2. Add at least one server to `DEFAULT_ALLOWED_SERVERS` in `.env`, **or** use `allow_server` after inviting the bot
3. Invite the bot to your server using the OAuth2 URL:
   ```
   https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot+applications.commands
   ```
   > The `applications.commands` scope is required for slash commands and the Discord "Uses Slash Commands" badge.

---

## Bot Management Commands

All management commands are run by **mentioning the bot** in a channel it can see. The bot must be in the server.

**Command syntax:**
- `<this>` — required parameter (do not include the `< >` symbols)
- `[this]` — optional parameter (do not include the `[ ]` symbols)
- `<this...>` — required parameter that can be repeated multiple times

In all examples, `@Alice` refers to a mention of your bot user.

---

### Allow a Server
Permit a server to use the bot:
```
@Alice allow_server <serverId> [userId]
```
When a `userId` is specified, that user receives **Bot manager** access to the server's dashboard, allowing them to manage access for other users.

### Disallow a Server
Remove a server's access:
```
@Alice disallow_server <serverId>
```

### Grant Dashboard Access
Give a user access to a server's dashboard:
```
@Alice add_dashboard_user <serverId> <userId...>
```

### Remove Dashboard Access
Revoke a user's dashboard access:
```
@Alice remove_dashboard_user <serverId> <userId...>
```

---

## Dashboard

The dashboard is where you configure Alice for each server. Access it at the URL you set up (e.g. `http://localhost:80` in standalone mode).

### Configuring a Server

Navigate to your server in the dashboard and paste your YAML config into the editor. The config structure is:

```yaml
prefix: "!"

levels:
  "ROLE_ID": 100    # Admin
  "ROLE_ID": 50     # Moderator

plugins:
  mod_actions:
    config:
      # ... plugin settings
    overrides:
      - level: ">=50"
        config:
          can_warn: true
```

### Permission Levels

Alice uses numeric permission levels (higher = more access):

| Level | Typical use |
|---|---|
| `9999` | Server owner / highest authority |
| `100` | Admin |
| `50` | Moderator |
| `0` | Regular member (default) |

Assign levels to roles in the `levels:` section using the role's Discord ID.

### Available Plugins

| Plugin | Purpose |
|---|---|
| `common` | Core settings (success/error emoji) |
| `mod_actions` | Warn, kick, ban, mute, note, cases |
| `mutes` | Mute role management |
| `cases` | Case logging and display |
| `logs` | Server logging across multiple channels |
| `automod` | Automated moderation rules and anti-raid |
| `censor` | Word/phrase/regex filtering with user notifications |
| `utility` | Info commands, clean, nickname, vcmove, etc. |
| `roles` | Role assignment commands |
| `slowmode` | Bot-managed and native slowmodes |
| `tags` | Custom commands / tags |
| `welcome_message` | Welcome new members |
| `persist` | Re-apply roles/mutes on member rejoin |
| `starboard` | Pin popular messages |
| `reaction_roles` | Role assignment via reactions |
| `reminders` | User reminders |
| `self_grantable_roles` | Let members self-assign roles |
| `time_and_date` | Timezone configuration |

---

## Log Channels

Alice supports 4 separate log channels for granular logging. Add them to your config:

```yaml
logs:
  config:
    channels:
      "MOD_LOG_CHANNEL_ID":
        include:
          - MEMBER_WARN
          - MEMBER_BAN
          - MEMBER_KICK
          - MEMBER_MUTE
          - AUTOMOD_ACTION
          - MEMBER_TIMEOUT
          - MEMBER_TIMEOUT_REMOVED

      "MESSAGE_LOG_CHANNEL_ID":
        include:
          - MESSAGE_DELETE
          - MESSAGE_DELETE_BULK
          - MESSAGE_EDIT
          - CENSOR

      "MEMBER_LOG_CHANNEL_ID":
        include:
          - MEMBER_JOIN
          - MEMBER_LEAVE
          - MEMBER_ROLE_ADD
          - MEMBER_ROLE_REMOVE
          - MEMBER_NICK_CHANGE

      "SERVER_LOG_CHANNEL_ID":
        include:
          - CHANNEL_CREATE
          - CHANNEL_DELETE
          - ROLE_CREATE
          - ROLE_DELETE
          - VOICE_CHANNEL_JOIN
          - VOICE_CHANNEL_LEAVE
```

---

## Slash Commands

Alice supports both `!prefix` and `/slash` commands simultaneously. Most slash commands live under plugin groups (for example `/mod warn`, `/roles add`, `/utility clean`).

For the full command list — including every prefix, slash, and context-menu command — see **[COMMANDS.md](./COMMANDS.md)** and the per-plugin files in **[commands/](./commands/)**. Those markdown files are the offline fallback when the dashboard docs website is unavailable.

Slash commands respect the same permission levels as their `!prefix` counterparts. Run `!help <command>` in Discord for live usage text.

---

## Useful Docker Commands

```bash
# Start the bot
docker compose -f docker-compose.standalone.yml up -d

# Stop the bot
docker compose -f docker-compose.standalone.yml down

# View live logs
docker compose -f docker-compose.standalone.yml logs -t -f

# Rebuild after code changes
docker compose -f docker-compose.standalone.yml down
docker compose -f docker-compose.standalone.yml build
docker compose -f docker-compose.standalone.yml up -d

# Optional: clean corrupted / stale Docker build cache
docker compose -f docker-compose.standalone.yml build --no-cache
```

> **`--no-cache` is optional** — use it only when a normal rebuild still serves a stale or corrupted image.

---

## Offline command reference

If the dashboard docs site is down or unreachable, use the markdown command docs in this folder:

- [COMMANDS.md](./COMMANDS.md) — index of all commands
- [commands/](./commands/) — one file per plugin
