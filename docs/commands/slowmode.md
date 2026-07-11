# Slowmode

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/Slowmode`

[← All commands](../COMMANDS.md)

**Slash group:** `/slowmode`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!slowmode` | `!slowmode` |  | `can_manage` |
| `!slowmode` | `!slowmode <duration> [channel]` |  | `can_manage` |
| `!slowmode clear` (aliases: `slowmode c`) | `!slowmode clear` |  | `can_manage` |
| `!slowmode disable` (aliases: `slowmode d`) | `!slowmode disable [channel]` |  | `can_manage` |
| `!slowmode list` (aliases: `slowmode l`, `slowmodes`) | `!slowmode list` |  | `can_manage` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/slowmode clear` | Clear bot slowmode from a user in a channel | `can_manage` |
| `/slowmode disable` | Disable slowmode for a channel | `can_manage` |
| `/slowmode list` | List active slowmodes in the server | `can_manage` |
| `/slowmode set` | Set slowmode for a channel (use 0 to disable) | `can_manage` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
