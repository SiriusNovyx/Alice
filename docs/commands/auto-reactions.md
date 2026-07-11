# Auto reactions

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/AutoReactions`

[← All commands](../COMMANDS.md)

**Slash group:** `/auto_reactions`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!auto_reactions` | `!auto_reactions <channel> <emoji> [emoji...]` |  | `can_manage` |
| `!auto_reactions disable` | `!auto_reactions disable <channel>` |  | `can_manage` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/auto_reactions disable` | Disable auto-reactions in a channel | `can_manage` |
| `/auto_reactions set` | Set auto-reactions for a channel | `can_manage` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
