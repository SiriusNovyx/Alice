# Automod

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/Automod`

[← All commands](../COMMANDS.md)

**Slash group:** `/antiraid`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!antiraid` | `!antiraid` |  | `can_set_antiraid` |
| `!antiraid` | `!antiraid` |  | `can_view_antiraid` |
| `!antiraid clear` (aliases: `antiraid reset`, `antiraid none`, `antiraid off`) | `!antiraid clear` |  | `can_set_antiraid` |
| `!debug_automod` | `!debug_automod` |  | `can_debug_automod` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/antiraid clear` | Turn off anti-raid | `can_set_antiraid` |
| `/antiraid debug_automod` | Debug which automod rules would match a saved message | `can_debug_automod` |
| `/antiraid set` | Set the anti-raid level | `can_set_antiraid` |
| `/antiraid view` | View the current anti-raid level | `can_view_antiraid` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
