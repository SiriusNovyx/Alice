# Message saver

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/MessageSaver`

[← All commands](../COMMANDS.md)

**Slash group:** `/message_saver`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!save_messages_to_db` | `!save_messages_to_db` |  | `can_manage` |
| `!save_pins_to_db` | `!save_pins_to_db` |  | `can_manage` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/message_saver messages` | Save specific messages to the database permanently | `can_manage` |
| `/message_saver pins` | Save all pinned messages from a channel to the database | `can_manage` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
