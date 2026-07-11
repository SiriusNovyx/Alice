# Utility

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/Utility`

[← All commands](../COMMANDS.md)

**Slash group:** `/utility`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!about` | `!about` | Show information about Zeppelin's status on the server | `can_about` |
| `!avatar` (aliases: `av`) | `!avatar` | Retrieves a user's profile picture | `can_avatar` |
| `!bansearch` (aliases: `bs`) | `!bansearch <query>` | Search banned users | `can_search` |
| `!channel` (aliases: `channelinfo`) | `!channel <channel>` | Show information about a channel | `can_channelinfo` |
| `!clean` (aliases: `clear`) | `!clean <count>` | Remove a number of recent messages | `can_clean` |
| `!context` | `!context <channelId> <messageId>` | Get a link to the context of the specified message | `can_context` |
| `!emoji` (aliases: `emojiinfo`) | `!emoji <emoji>` | Show information about an emoji | `can_emojiinfo` |
| `!help` | `!help <command>` | Show usage information for one or more commands | `can_help` |
| `!info` | `!info` | Show information about the specified thing | `can_info` |
| `!invite` (aliases: `inviteinfo`) | `!invite <code>` | Show information about an invite | `can_inviteinfo` |
| `!jumbo` | `!jumbo` | Makes an emoji jumbo | `can_jumbo` |
| `!level` | `!level [user]` | Show the permission level of a user | `can_level` |
| `!message` (aliases: `messageinfo`) | `!message <channelId>-<messageId>` | Show information about a message | `can_messageinfo` |
| `!nickname` (aliases: `nick`) | `!nickname <user> <nickname>` | Set a member's nickname | `can_nickname` |
| `!nickname reset` (aliases: `nick reset`) | `!nickname reset <user>` | Reset a member's nickname to their username | `can_nickname` |
| `!ping` (aliases: `pong`) | `!ping` | Test the bot's ping to the Discord API | `can_ping` |
| `!reload_guild` | `!reload_guild` | Reload the Zeppelin configuration and all plugins for the server. This can sometimes fix issues. | `can_reload_guild` |
| `!roleinfo` | `!role <role>` | Show information about a role | `can_roleinfo` |
| `!roles` | `!roles [search]` | List all roles or roles matching a search | `can_roles` |
| `!search` (aliases: `s`) | `!search <query>` | Search server members | `can_search` |
| `!server` (aliases: `serverinfo`) | `!server` | Show server information | `can_server` |
| `!snowflake` (aliases: `snowflakeinfo`) | `!snowflake <id>` | Show information about a snowflake ID | `can_snowflake` |
| `!source` | `!source <messageId>` | View the message source of the specified message id | `can_source` |
| `!user` (aliases: `userinfo`, `whois`) | `!user <user>` | Show information about a user | `can_userinfo` |
| `!vcdisconnect` (aliases: `vcdisc`, `vcdc`, `vckick`, `vck`) | `!vcdc <user>` | Disconnect a member from their voice channel | `can_vckick` |
| `!vcmove` | `!vcmove <user> <channel>` | Move a member to another voice channel | `can_vcmove` |
| `!vcmoveall` | `!vcmoveall <fromChannel> <toChannel>` | Move all members of a voice channel to another voice channel | `can_vcmove` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/utility about` | Show information about Zeppelin's status on the server | `can_about` |
| `/utility avatar` | Get a user's profile picture | `can_avatar` |
| `/utility bansearch` | Search banned users | `can_search` |
| `/utility clean` | Remove a number of recent messages | `can_clean` |
| `/utility context` | Get a link to the context of a message | `can_context` |
| `/utility help` | Show usage information for commands | `can_help` |
| `/utility info` | Show information about a user, channel, role, invite, emoji, or ID | `can_info` |
| `/utility jumbo` | Make an emoji jumbo | `can_jumbo` |
| `/utility level` | Show the permission level of a user | `can_level` |
| `/utility lookup` | Look up invite, channel, message, snowflake, role, or emoji info | `can_info` |
| `/utility nickname` | Set, view, or reset a member's nickname | `can_nickname` |
| `/utility ping` | Test the bot's ping to the Discord API | `can_ping` |
| `/utility reload_guild` | Reload the bot configuration and plugins for this server | `can_reload_guild` |
| `/utility roles` | List all roles or roles matching a search | `can_roles` |
| `/utility search` | Search server members | `can_search` |
| `/utility serverinfo` | Show server information | `can_server` |
| `/utility source` | View the message source of a message | `can_source` |
| `/utility userinfo` | Show information about a user | `can_userinfo` |
| `/utility vcdisconnect` | Disconnect a member from their voice channel | `can_vckick` |
| `/utility vcmove` | Move a member to another voice channel | `can_vcmove` |
| `/utility vcmoveall` | Move all members from one voice channel to another | `can_vcmove` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
