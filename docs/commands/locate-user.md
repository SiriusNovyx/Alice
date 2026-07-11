# Locate user

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/LocateUser`

[← All commands](../COMMANDS.md)

**Slash group:** `/locate`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!follow` (aliases: `f`) | `!f <user>` | Sets up an alert that notifies you any time `<member>` switches or joins voice channels | `can_alert` |
| `!follows` (aliases: `fs`) | `!fs` | Displays all of your active alerts ordered by expiration time | `can_alert` |
| `!follows delete` (aliases: `fs d`) | `!fs d <num>` | Deletes the alert at the position <num>.\nThe value needed for <num> can be found using `!follows` (`!fs`) | `can_alert` |
| `!where` (aliases: `w`) | `!w <user>` | Posts an instant invite to the voice channel that `<member>` is in | `can_where` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/locate follow` | Alert when a member joins or switches voice channels | `can_alert` |
| `/locate follows` | List your active voice alerts | `can_alert` |
| `/locate unfollow` | Delete a voice alert by its list number | `can_alert` |
| `/locate where` | Posts an invite to the voice channel a member is in | `can_where` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
