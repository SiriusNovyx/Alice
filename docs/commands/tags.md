# Tags

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/Tags`

[← All commands](../COMMANDS.md)

**Slash group:** `/tag`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!tag` | `!tag <name> <content>` |  | `can_create` |
| `!tag` | `!tag` |  | `can_create` |
| `!tag delete` | `!tag delete <name>` |  | `can_create` |
| `!tag eval` | `!tag eval` |  | `can_create` |
| `!tag list` (aliases: `tags`, `taglist`) | `!tag list` |  | `can_list` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/tag create` | Create or update a tag | `can_create` |
| `/tag delete` | Delete a tag | `can_create` |
| `/tag eval` | Evaluate tag template syntax | `can_create` |
| `/tag get` | Get a tag's source | `can_create` |
| `/tag list` | List available tags | `can_list` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
