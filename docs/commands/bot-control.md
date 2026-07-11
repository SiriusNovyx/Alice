# Bot control (staff / mention)

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/BotControl`

[← All commands](../COMMANDS.md)

These commands are run by **mentioning the bot** in a channel it can see (not with the server prefix). Example: `@Alice allow_server <id>`.

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Mention commands (staff)

| Command | Usage | Description | Permission |
|---|---|---|---|
| `@Alice add_dashboard_user` | `@Alice add_dashboard_user <serverId> <userId...>` | Grant dashboard access for a server. | `—` |
| `@Alice add_server_from_invite` (aliases: `allow_server_from_invite`, `adv`) | `@Alice add_server_from_invite <invite> [userId]` | Allow a server using an invite code/URL. | `can_add_server_from_invite` |
| `@Alice allow_server` (aliases: `allowserver`, `add_server`, `addserver`) | `@Alice allow_server <serverId> [userId]` | Allow a server to use the bot. Optional userId gets Bot manager dashboard access. | `—` |
| `@Alice bot_reload_global_plugins` | `@Alice bot_reload_global_plugins` | Reload global plugins (staff). | `—` |
| `@Alice channel_to_server` (aliases: `channel2server`) | `@Alice channel_to_server <channelId>` | Resolve a channel ID to its server. | `—` |
| `@Alice debug_counters` | `@Alice debug_counters` |  | `can_performance` |
| `@Alice disallow_server` (aliases: `disallowserver`, `remove_server`, `removeserver`) | `@Alice disallow_server <serverId>` | Remove a server from the allowlist. | `—` |
| `@Alice eligible` (aliases: `is_eligible`, `iseligible`) | `@Alice eligible <serverId>` | Check whether a server is eligible. | `can_eligible` |
| `@Alice leave_server` (aliases: `leave_guild`) | `@Alice leave_server <serverId>` | Make the bot leave a server. | `—` |
| `@Alice list_dashboard_permissions` (aliases: `list_dashboard_perms`, `list_dash_permissions`, `list_dash_perms`) | `@Alice list_dashboard_permissions <serverId> [userId]` | List dashboard permission assignments. | `can_list_dashboard_perms` |
| `@Alice list_dashboard_users` | `@Alice list_dashboard_users <serverId>` | List users with dashboard access for a server. | `can_list_dashboard_perms` |
| `@Alice profiler_data` | `@Alice profiler_data` |  | `can_performance` |
| `@Alice rate_limit_performance` | `@Alice rate_limit_performance` |  | `can_performance` |
| `@Alice reload_server` (aliases: `reload_guild`) | `@Alice reload_server <serverId>` | Reload a server's config/plugins. | `—` |
| `@Alice remove_dashboard_user` | `@Alice remove_dashboard_user <serverId> <userId...>` | Revoke dashboard access for a server. | `—` |
| `@Alice rest_performance` | `@Alice rest_performance` |  | `can_performance` |
| `@Alice servers` (aliases: `guilds`) | `@Alice servers` | List allowed servers. | `—` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
