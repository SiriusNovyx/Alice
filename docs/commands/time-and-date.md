# Time and date

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/TimeAndDate`

[← All commands](../COMMANDS.md)

**Slash group:** `/timezone`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!timezone` | `!timezone` |  | `can_set_timezone` |
| `!timezone` | `!timezone` |  | `can_set_timezone` |
| `!timezone reset` | `!timezone reset` |  | `can_set_timezone` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/timezone get` | View your current timezone setting | `can_set_timezone` |
| `/timezone reset` | Reset your timezone to the server default | `can_set_timezone` |
| `/timezone set` | Set your personal timezone | `can_set_timezone` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
