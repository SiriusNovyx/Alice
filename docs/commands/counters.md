# Counters

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/Counters`

[← All commands](../COMMANDS.md)

**Slash group:** `/counter`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!counters add` (aliases: `counter add`, `addcounter`) | `!counters add` |  | `can_edit` |
| `!counters list` (aliases: `counter list`, `counters`) | `!counters list` |  | `can_view` |
| `!counters reset` (aliases: `counter reset`, `resetcounter`) | `!counters reset` |  | `can_edit` |
| `!counters reset_all` | `!counters reset_all` |  | `can_reset_all` |
| `!counters set` (aliases: `counter set`, `setcounter`) | `!counters set` |  | `can_edit` |
| `!counters view` (aliases: `counter view`, `viewcounter`, `counter`) | `!counters view` |  | `can_view` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/counter add` | Add to a counter's value | `can_edit` |
| `/counter list` | List configured counters | `can_view` |
| `/counter reset` | Reset a counter value to its initial value | `can_edit` |
| `/counter reset_all` | Reset ALL values for a counter (users and channels) | `can_reset_all` |
| `/counter set` | Set a counter's value | `can_edit` |
| `/counter view` | View a counter's value | `can_view` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
