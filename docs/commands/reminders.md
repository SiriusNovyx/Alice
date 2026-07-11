# Reminders

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/Reminders`

[← All commands](../COMMANDS.md)

**Slash group:** `/remind`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!remind` (aliases: `remindme`, `reminder`) | `!remind <time> [reminder]` |  | `can_use` |
| `!reminders` | `!reminders` |  | `can_use` |
| `!reminders delete` (aliases: `reminders d`) | `!reminders delete` |  | `can_use` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/remind create` | Create a reminder | `can_use` |
| `/remind delete` | Delete a reminder by its list number | `can_use` |
| `/remind list` | List your reminders | `can_use` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
