![Alice Banner](assets/ALICEbanner.png)
# Alice
Forked from Zeppelin

### Original Copyright

Copyright (c) Zeppelin Contributors

This project includes software developed as part of the Zeppelin project.

## Disclaimer & Attribution
**ALICE** is a modified version of the original **Zeppelin** moderation bot.
This project is not affiliated with, endorsed by, or officially connected to the original Zeppelin project or its authors.
The original software was developed as **Zeppelin** and is available at: https://zeppelin.gg/
This repository contains a derivative work that has been modified from the original source. All modifications, changes, and additions have been made independently.

---

### License Notice
This project includes software licensed under the **Elastic License 2.0 (ELv2)**.
You must comply with the terms of that license when using, modifying, or distributing this software.
A copy of the license is included in this repository.

---

### No Warranty
This software is provided "as is", without warranty of any kind, express or implied.
Use at your own risk.

---

## What's New in ALICE

ALICE builds on Zeppelin with a significant number of bug fixes, security improvements, and new features. All changes are documented below.

### 🔒 Security Fixes

- **Dashboard self-permission escalation patched** — A missing check in `misc.ts` allowed a logged-in dashboard user to modify their own permission level. This has been fixed.
- **Discord API request hardening** — The OAuth login flow now enforces a 10-second timeout on Discord API requests and safely handles malformed API responses, preventing the auth process from hanging indefinitely.
- **Ban action no longer silently deletes messages** — The default for `deleteMessageDays` on ban was `1`, meaning every ban silently deleted 1 day of the user's messages. Changed to `0` — explicit is safer.
- ## Security Fixes

- Updated `config-checker` Vite dependency to `6.4.2` to fix arbitrary file read via Vite dev server WebSocket.
- Updated `presetup-configurator` Rollup dependency resolution to `2.80.0` to fix DOM clobbering/XSS and arbitrary file write advisories.
- Updated backend `multer` to `2.1.1` to fix denial-of-service vulnerabilities.
- Updated backend `lodash-es` resolution to a patched `4.18.x` release for code injection protection.
- Added workspace overrides for vulnerable transitive dependencies:
  - `fast-uri`
  - `flatted`
  - `glob`
  - `lodash`
  - `minimatch`
  - `path-to-regexp`
  - `picomatch`
  - `undici`
- Updated dashboard serving dependencies:
  - `fastify` to `5.8.5`
  - `@fastify/static` to `9.1.3`
- Added `presetup-configurator` npm overrides for vulnerable Snowpack transitive dependencies:
  - `@tootallnate/once`
  - `form-data`
  - `qs`
  - `tar`
  - `tough-cookie`
- Regenerated affected lockfiles:
  - `pnpm-lock.yaml`
  - `config-checker/package-lock.json`
  - `presetup-configurator/package-lock.json`

## Verification

- `pnpm audit --audit-level high` reports no remaining high or critical vulnerabilities.
- `npm audit --audit-level high --package-lock-only` reports no high or critical vulnerabilities for `config-checker`.
- `npm audit --audit-level high --package-lock-only` reports no high or critical vulnerabilities for `presetup-configurator`.

### 🐛 Bug Fixes

**Moderation**
- `!massremoverole` showed "Cannot **add** roles" when it should say "Cannot **remove** roles"
- `!massremoverole` loop had no error handling — failures were silently ignored and the `failed` array was never populated. Now uses `try/catch` with proper logging.
- `!massaddrole` was missing `await` on `addRole()`, meaning errors couldn't be caught
- `addcase` was blocked by `canActOn()` even for server owners and admins — fixed by passing `allowAdmins: true` since addcase is a record-keeping action, not a punitive one
- Automod `ban` action showed `"Kicked automatically"` as the default reason — copy-paste bug from kick action
- Automod `addRoles` action was missing `await` inside `Promise.all`

**Censor**
- All `censorMessage()` calls inside `applyFiltersToMsg.ts` were missing `await`, making censoring a race condition that silently failed in most cases
- `formatReasonForAttachments` stored a link to the command message instead of direct CDN image URLs when a mod attached an image to a note/case

**Cases**
- Case embeds never displayed attached images — `getCaseEmbed` now detects Discord CDN image URLs from note bodies and renders them inline using `embed.image`

**Core Systems**
- `Blocker.ts` — resolved blocks were never removed from the internal Map, leaking memory on every blocked key forever
- `SimpleCache.ts` — `cleanLoop()` was never called automatically; the expiry loop only ran if manually triggered, causing unbounded cache growth
- `RegExpRunner.ts` — `failedTimes` entries that decayed to zero were kept in the Map indefinitely with negative values instead of being deleted
- `VcmoveAllCmd` — `currMember.edit()` was missing `await` inside the loop, so the catch block never triggered and `errAmt` was always 0
- `AddCounterCmd` — `if (!amount)` was falsy for `0`, causing the interactive prompt to fire when `0` was passed as an explicit argument

**Logs**
- `log.ts` had a `// TODO: Show/log this somewhere` comment when the bot lacked channel permissions — now logs a proper console warning
- `Logs/types.ts` had a duplicate `import { TemplateSafeValueContainer }` that TypeScript's strict mode rejects

**API / Auth**
- `guilds.ts` (dead orphan file, no longer imported) identified and documented

### ✨ New Features

**Censor — User Notification**

When a message is deleted by the censor, the user now receives a notification explaining why. Configurable in your dashboard config:

```yaml
censor:
  config:
    notify_user: true
    notify_message: "Your message in **{guildName}** was removed. Reason: **{reason}**. Please keep the chat clean! 🙏"
    # Optional: send notice in a channel instead of DM
    # notify_channel: "CHANNEL_ID"
    # notify_channel_message: "{userMention} Your message was removed. Reason: **{reason}**"
```

Available template variables: `{guildName}`, `{reason}`, `{userMention}`, `{channelMention}`

**Logs — Discord Timeout Support**

Two new log types have been added for Discord's native timeout feature (missing since Discord added timeouts in 2021):
- `MEMBER_TIMEOUT` — logs when a member is timed out, including duration and reason
- `MEMBER_TIMEOUT_REMOVED` — logs when a timeout is removed

Add them to your log channel config:
```yaml
logs:
  config:
    channels:
      "YOUR_MOD_LOG_CHANNEL_ID":
        include:
          - MEMBER_TIMEOUT
          - MEMBER_TIMEOUT_REMOVED
```

**Logs — Configurable New Account Threshold**

The "new account" indicator on member joins (the `:new:` flag) was previously hardcoded to 1 hour. It now accepts an optional `newAccountThresholdMs` parameter, allowing servers to configure a longer window (e.g. 24 hours for stricter servers).

**Help Command — Inline Usage**

`!help <command>` now displays full usage information inline instead of a localhost dashboard URL:

```
!warn
📋 Send a warning to the specified user
📝 Usage: !warn <user> <reason> [-mod] [-notify] [-notify-channel]
🔌 Plugin: mod_actions
```

All moderation, roles, slowmode, and tag commands have been updated with accurate usage strings.

**Slash Command Support**

ALICE now supports Discord slash commands, earning the **Uses Slash Commands** badge on the bot profile. The following commands are available as both `!prefix` and `/slash`:

| Command | Description |
|---|---|
| `/addrole` | Add a role to a member |
| `/removerole` | Remove a role from a member |
| `/slowmode` | Set slowmode for a channel |
| `/slowmode-disable` | Disable slowmode for a channel |
| `/userinfo` | Show information about a user |
| `/nickname` | Set or view a member's nickname |
| `/level` | Show the permission level of a user |
| `/ping` | Test the bot's response latency |
| `/avatar` | Get a user's profile picture |
| `/clean` | Remove recent messages in bulk |

All slash commands respect the same permission levels as their `!prefix` counterparts. To enable slash commands, re-invite the bot with the `applications.commands` scope:
```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot+applications.commands
```

---

## Main Features

- Extensive automoderator (automod)
  - Word filters, spam detection, invite blocking, mention spam, attachment spam, new account alerts
- Detailed moderator action tracking and notes (cases)
  - Attached images now render inline in case embeds
- Customizable server logs across 4 separate log channels (mod actions, messages, members, server)
- Censor with user-friendly removal notifications
- Tags / custom commands
- Reaction roles
- Slash command support + full `!prefix` command support
- Tons of utility commands including granular member search
- Full configuration via a web dashboard
  - Override specific settings and permissions on a per-user, per-channel, or per-permission-level basis
- Bot-managed slowmodes
  - Automatically switches between native slowmodes (≤6h) and bot-enforced slowmodes (longer durations)
- Starboard
- And more!

---

## Usage Documentation

For information on how to use the bot, see [docs/MANAGEMENT.md](docs/MANAGEMENT.md).
For the original project, see: https://zeppelin.gg/

## Development

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for instructions on running the development environment.
For the original project, see: https://zeppelin.gg/

## Production

See [docs/PRODUCTION.md](docs/PRODUCTION.md) for instructions on how to run the bot in production.
For the original project, see: https://zeppelin.gg/
