# Alice — Command Reference

Offline fallback documentation for bot commands when the local dashboard docs site is down or unreachable.

The interactive docs live in the dashboard at `/docs`. Prefer those when available; use these markdown files otherwise.

## How to use commands

- **Prefix commands** use the server prefix (default `!`). Example: `!warn @user reason`
- **Slash commands** are Discord native. Most live under a plugin group (e.g. `/mod warn`).
- **Staff / bot-control** commands are run by **mentioning the bot**: `@Alice allow_server <id>`
- **Context menus** appear when you right-click a user or message (Apps).
- Run `!help <command>` in Discord for live usage text.

## Syntax legend

| Notation | Meaning |
|---|---|
| `<this>` | Required argument |
| `[this]` | Optional argument |
| `[-flag]` | Optional flag |

## Plugins

| Plugin | Slash group | Docs |
|---|---|---|
| Auto reactions | `/auto_reactions` | [commands/auto-reactions.md](./commands/auto-reactions.md) |
| Automod | `/antiraid` | [commands/automod.md](./commands/automod.md) |
| Bot control (staff / mention) | — | [commands/bot-control.md](./commands/bot-control.md) |
| Channel archiver | — | [commands/channel-archiver.md](./commands/channel-archiver.md) |
| Context menus | — | [commands/context-menus.md](./commands/context-menus.md) |
| Counters | `/counter` | [commands/counters.md](./commands/counters.md) |
| Locate user | `/locate` | [commands/locate-user.md](./commands/locate-user.md) |
| Message saver | `/message_saver` | [commands/message-saver.md](./commands/message-saver.md) |
| Mod actions | `/mod` | [commands/mod-actions.md](./commands/mod-actions.md) |
| Mutes | `/mutes` | [commands/mutes.md](./commands/mutes.md) |
| Name history | — | [commands/name-history.md](./commands/name-history.md) |
| Pingable roles | `/pingable_role` | [commands/pingable-roles.md](./commands/pingable-roles.md) |
| Post | `/post` | [commands/post.md](./commands/post.md) |
| Reaction roles | `/reaction_roles` | [commands/reaction-roles.md](./commands/reaction-roles.md) |
| Reminders | `/remind` | [commands/reminders.md](./commands/reminders.md) |
| Role buttons | `/role_buttons` | [commands/role-buttons.md](./commands/role-buttons.md) |
| Roles | `/roles` | [commands/roles.md](./commands/roles.md) |
| Self-grantable roles | `/srole` | [commands/self-grantable-roles.md](./commands/self-grantable-roles.md) |
| Slowmode | `/slowmode` | [commands/slowmode.md](./commands/slowmode.md) |
| Starboard | `/starboard` | [commands/starboard.md](./commands/starboard.md) |
| Tags | `/tag` | [commands/tags.md](./commands/tags.md) |
| Time and date | `/timezone` | [commands/time-and-date.md](./commands/time-and-date.md) |
| Utility | `/utility` | [commands/utility.md](./commands/utility.md) |

## Related

- [MANAGEMENT.md](./MANAGEMENT.md) — setup, allowlist, dashboard
- [PRODUCTION.md](./PRODUCTION.md) — self-host / Docker
- [DEVELOPMENT.md](./DEVELOPMENT.md) — local development
