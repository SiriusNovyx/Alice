# Mutes

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/Mutes`

[← All commands](../COMMANDS.md)

**Slash group:** `/mutes`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!clear_banned_mutes` | `!clear_banned_mutes` | Clear dangling mutes for members who have been banned | `can_cleanup` |
| `!clear_mutes` | `!clear_mutes` | Clear dangling mute records from the bot. Be careful not to clear valid mutes. | `can_cleanup` |
| `!clear_mutes_without_role` | `!clear_mutes_without_role` | Clear dangling mutes for members whose mute role was removed by other means | `can_cleanup` |
| `!mutes` | `!mutes` |  | `can_view_list` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/mutes clear` | Clear mute records for specific user IDs | `can_cleanup` |
| `/mutes clear_banned` | Clear dangling mutes for banned members | `can_cleanup` |
| `/mutes clear_without_role` | Clear mutes for members missing the mute role | `can_cleanup` |
| `/mutes list` | List active mutes | `can_view_list` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
