# Reaction roles

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/ReactionRoles`

[← All commands](../COMMANDS.md)

**Slash group:** `/reaction_roles`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!reaction_roles` | `!reaction_roles` |  | `can_manage` |
| `!reaction_roles clear` | `!reaction_roles clear` |  | `can_manage` |
| `!reaction_roles refresh` | `!reaction_roles refresh` |  | `can_manage` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/reaction_roles clear` | Clear reaction roles from a message | `can_manage` |
| `/reaction_roles init` | Add reaction roles to a message | `can_manage` |
| `/reaction_roles refresh` | Refresh reaction role emojis on a message | `can_manage` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
