# Roles

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/Roles`

[← All commands](../COMMANDS.md)

**Slash group:** `/roles`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!addrole` | `!addrole <user> <role> [-reason]` | Add a role to the specified member | `can_assign` |
| `!massaddrole` | `!massaddrole <role> [user] [user] ...` |  | `can_mass_assign` |
| `!massremoverole` | `!massremoverole <role> [user] [user] ...` |  | `can_mass_assign` |
| `!removerole` | `!removerole <user> <role>` | Remove a role from the specified member | `can_assign` |
| `!temprole` | `!temprole <user> <duration> <role> [-reason]` | Add a timed role to the specified member | `can_assign_temp` |
| `!untemprole` | `!untemprole <user> <role>` | Remove a timed role from the specified member | `can_assign_temp` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/roles add` | Add a role to the specified member | `can_assign` |
| `/roles massadd` | Add a role to multiple members | `can_mass_assign` |
| `/roles massremove` | Remove a role from multiple members | `can_mass_assign` |
| `/roles remove` | Remove a role from the specified member | `can_assign` |
| `/roles temprole` | Add a timed role to the specified member | `can_assign_temp` |
| `/roles untemprole` | Remove a timed role from the specified member | `can_assign_temp` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
