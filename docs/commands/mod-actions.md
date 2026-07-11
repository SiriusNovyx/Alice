# Mod actions

> Offline fallback docs for when the dashboard website is unavailable.
> Source plugin: `backend/src/plugins/ModActions`

[← All commands](../COMMANDS.md)

**Slash group:** `/mod`

Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable).

## Prefix commands

| Command | Usage | Description | Permission |
|---|---|---|---|
| `!addcase` | `!addcase <type> <user> [reason] [-mod]  (types: Note, Warn, Mute, Unmute, Kick, Ban, Unban)` | Add an arbitrary case to the specified user without taking any action | `can_addcase` |
| `!ban` | `!ban <user> [duration] [reason] [-mod] [-notify] [-notify-channel] [-delete-days/-d]` | Ban or Tempban the specified member | `can_ban` |
| `!case` | `!case <caseNumber>` | Show information about a specific case | `can_view` |
| `!cases` (aliases: `modlogs`, `infractions`) | `!cases` | Show the most recent 5 cases by the specified -mod | `can_view` |
| `!cases` (aliases: `modlogs`, `infractions`) | `!cases <user> [-mod] [-expand/-e] [-hidden/-h] [-notes/-n] [-warns/-w] [-mutes/-m] [-kicks/-k] [-bans/-b] [-unbans/-ub]` | Show a list of cases the specified user has | `can_view` |
| `!delete_case` (aliases: `deletecase`) | `!deletecase <caseNumber> [-force/-f]` |  | `can_deletecase` |
| `!forceban` | `!forceban <user> [reason] [-mod]` | Force-ban the specified user, even if they aren't on the server | `can_ban` |
| `!forcemute` | `!forcemute <user> [duration] [reason] [-mod] [-notify] [-notify-channel]` | Force-mute the specified user, even if they're not on the server | `can_mute` |
| `!forceunmute` | `!forceunmute <user> [duration] [reason] [-mod]` | Force-unmute the specified user, even if they're not on the server | `can_mute` |
| `!hide` (aliases: `hidecase`, `hide_case`) | `!hidecase <caseNumber>` | Hide the specified case so it doesn't appear in !cases or !info | `can_hidecase` |
| `!kick` | `!kick <user> [reason] [-mod] [-notify] [-notify-channel] [-clean]` | Kick the specified member | `can_kick` |
| `!massban` | `!massban <user> [user] ... (bot will prompt for reason)` | Mass-ban a list of user IDs | `can_massban` |
| `!massmute` | `!massmute <user> [user] ... (bot will prompt for reason)` | Mass-mute a list of user IDs | `can_massmute` |
| `!massunban` | `!massunban <user> [user] ... (bot will prompt for reason)` | Mass-unban a list of user IDs | `can_massunban` |
| `!mute` | `!mute <user> [duration] [reason] [-mod] [-notify] [-notify-channel]` | Mute the specified member | `can_mute` |
| `!note` | `!note <user> [note text]` | Add a note to the specified user | `can_note` |
| `!unban` | `!unban <user> [reason] [-mod]` | Unban the specified member | `can_unban` |
| `!unhide` (aliases: `unhidecase`, `unhide_case`) | `!unhide` | Un-hide the specified case, making it appear in !cases and !info again | `can_hidecase` |
| `!unmute` | `!unmute <user> [duration] [reason] [-mod]` | Unmute the specified member | `can_mute` |
| `!update` (aliases: `reason`) | `!update` | Update the specified case (or, if case number is omitted, your latest case) by adding more notes/details to it | `can_note` |
| `!warn` | `!warn <user> <reason> [-mod] [-notify] [-notify-channel]` | Send a warning to the specified user | `can_warn` |

## Slash commands

| Slash | Description | Permission |
|---|---|---|
| `/mod addcase` | Add an arbitrary case to the specified user without taking any action | `can_addcase` |
| `/mod ban` | Ban or Tempban the specified member | `can_ban` |
| `/mod case` | Show information about a specific case | `can_view` |
| `/mod cases` | Show a list of cases the specified user has or the specified mod made | `can_view` |
| `/mod deletecase` | Delete the specified case. This operation can *not* be reversed. | `can_deletecase` |
| `/mod forceban` | Force-ban the specified user, even if they aren't on the server | `can_ban` |
| `/mod forcemute` | Force-mute the specified user, even if they're not on the server | `can_mute` |
| `/mod forceunmute` | Force-unmute the specified user, even if they're not on the server | `can_mute` |
| `/mod hidecase` | Hide the specified case so it doesn't appear in !cases or !info | `can_hidecase` |
| `/mod kick` | Kick the specified member | `can_kick` |
| `/mod massban` | Mass-ban a list of user IDs | `can_massban` |
| `/mod massmute` | Mass-mute a list of user IDs | `can_massmute` |
| `/mod massunban` | Mass-unban a list of user IDs | `can_massunban` |
| `/mod mute` | Mute the specified member | `can_mute` |
| `/mod note` | Add a note to the specified user | `can_note` |
| `/mod unban` | Unban the specified member | `can_unban` |
| `/mod unhidecase` | Un-hide the specified case | `can_hidecase` |
| `/mod unmute` | Unmute the specified member | `can_mute` |
| `/mod update` | Update the specified case (or your latest case) by adding more notes to it | `can_note` |
| `/mod warn` | Send a warning to the specified user | `can_warn` |

---

In Discord, run `!help <command>` for live usage for any prefix command.
