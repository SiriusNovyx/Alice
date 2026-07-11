# Post

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/Post`

[← All commands](../COMMANDS.md)

**Slash group:** `/post`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!edit` | `!edit` |  | `can_post` |
| `!edit_embed` | `!edit_embed` |  | `can_post` |
| `!post` | `!post` |  | `can_post` |
| `!post_embed` | `!post_embed` |  | `can_post` |
| `!scheduled_posts` (aliases: `scheduled_posts list`) | `!scheduled_posts` |  | `can_post` |
| `!scheduled_posts` (aliases: `scheduled_posts show`) | `!scheduled_posts` |  | `can_post` |
| `!scheduled_posts delete` (aliases: `scheduled_posts d`) | `!scheduled_posts delete` |  | `can_post` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/post edit` | Edit a bot-posted message | `can_post` |
| `/post edit_embed` | Edit a bot-posted embed | `can_post` |
| `/post post` | Post a message to a channel | `can_post` |
| `/post post_embed` | Post an embed to a channel | `can_post` |
| `/post scheduled_delete` | Delete a scheduled post by number | `can_post` |
| `/post scheduled_list` | List scheduled posts | `can_post` |
| `/post scheduled_show` | Show a scheduled post by number | `can_post` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
