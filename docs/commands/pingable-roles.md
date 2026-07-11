# Pingable roles

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/PingableRoles`

[← All commands](../COMMANDS.md)

**Slash group:** `/pingable_role`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!pingable_role` | `!pingable_role` |  | `can_manage` |
| `!pingable_role disable` (aliases: `pingable_role d`) | `!pingable_role disable` |  | `can_manage` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/pingable_role disable` | Stop a role from being pingable in a channel | `can_manage` |
| `/pingable_role enable` | Make a role pingable in a channel | `can_manage` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
