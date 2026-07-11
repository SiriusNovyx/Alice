# Starboard

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/Starboard`

[← All commands](../COMMANDS.md)

**Slash group:** `/starboard`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!starboard migrate_pins` | `!starboard migrate_pins` | Posts all pins from a channel to the specified starboard. The pins are NOT unpinned automatically. | `can_migrate` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/starboard migrate_pins` | Migrate pinned messages to a starboard (pins are not removed) | `can_migrate` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
