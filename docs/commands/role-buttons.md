# Role buttons

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/RoleButtons`

[← All commands](../COMMANDS.md)

**Slash group:** `/role_buttons`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!role_buttons reset` | `!role_buttons reset <name>` | In case of issues, you can run this command to have Zeppelin 'forget' about specific role buttons and re-apply them. This will also repost the message, if not targeting an existing message. | `can_reset` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/role_buttons reset` | Forget and re-apply a set of role buttons | `can_reset` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
