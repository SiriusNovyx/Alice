<template>
  <div>
    <h1>Logs</h1>
    <p>
      Alice's logging system lets you track everything that happens in your server across up to four
      separate log channels. Each channel can be configured to receive only the event types you care about,
      so your mod team always has the context they need.
    </p>
    <p>
      This guide covers how to configure the
      <router-link to="/docs/plugins/logs">Logs plugin</router-link>.
      Please ensure you understand how
      <router-link to="/docs/configuration/plugin-configuration">plugin configuration</router-link>
      and
      <router-link to="/docs/configuration/permissions">plugin permissions</router-link>
      work before reading this guide.
    </p>

    <h2>Basic Setup</h2>
    <p>
      To start logging, add the <code>logs</code> plugin and define at least one channel under <code>channels</code>.
      Each key is a Discord channel ID, and the <code>include</code> list controls which event types are sent there.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        logs:
          config:
            channels:
              "YOUR_LOG_CHANNEL_ID":
                include:
                  - MESSAGE_DELETE
                  - MESSAGE_EDIT
                  - MEMBER_JOIN
                  - MEMBER_LEAVE
    </CodeBlock>

    <h2>Recommended: Four-Channel Setup</h2>
    <p>
      For most servers, splitting logs into four dedicated channels gives your team the clearest view of activity
      without any one channel getting flooded.
    </p>

    <h3>Mod Actions Log</h3>
    <p>
      Records all moderation actions taken by staff. This is your audit trail for bans, kicks, warns, mutes,
      and case history.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        logs:
          config:
            channels:
              "MOD_LOG_CHANNEL_ID":
                include:
                  - MEMBER_WARN
                  - MEMBER_MUTE
                  - MEMBER_UNMUTE
                  - MEMBER_MUTE_EXPIRED
                  - MEMBER_KICK
                  - MEMBER_BAN
                  - MEMBER_UNBAN
                  - MEMBER_FORCEBAN
                  - MEMBER_TIMED_BAN
                  - MEMBER_TIMED_UNBAN
                  - MEMBER_NOTE
                  - MEMBER_TIMEOUT
                  - MEMBER_TIMEOUT_REMOVED
                  - MASSBAN
                  - MASSUNBAN
                  - MASSMUTE
                  - CASE_CREATE
                  - CASE_UPDATE
                  - CASE_DELETE
                  - AUTOMOD_ACTION
    </CodeBlock>

    <h3>Message Log</h3>
    <p>
      Tracks deleted and edited messages. Useful for catching rule-breaking content that gets quickly removed,
      and for reviewing what the censor plugin has filtered.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
              "MESSAGE_LOG_CHANNEL_ID":
                include:
                  - MESSAGE_DELETE
                  - MESSAGE_DELETE_BULK
                  - MESSAGE_EDIT
                  - CENSOR
    </CodeBlock>

    <h3>Member Log</h3>
    <p>
      Tracks who joins and leaves your server, along with role changes, nickname changes, and member
      re-joins following a mute.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
              "MEMBER_LOG_CHANNEL_ID":
                include:
                  - MEMBER_JOIN
                  - MEMBER_LEAVE
                  - MEMBER_JOIN_WITH_PRIOR_RECORDS
                  - MEMBER_ROLE_ADD
                  - MEMBER_ROLE_REMOVE
                  - MEMBER_ROLE_CHANGES
                  - MEMBER_NICK_CHANGE
                  - MEMBER_USERNAME_CHANGE
                  - MEMBER_RESTORE
                  - MEMBER_MUTE_REJOIN
    </CodeBlock>

    <h3>Server Log</h3>
    <p>
      Records structural changes to the server — channel and role creation/deletion, voice activity,
      emoji changes, and bot alerts.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
              "SERVER_LOG_CHANNEL_ID":
                include:
                  - CHANNEL_CREATE
                  - CHANNEL_DELETE
                  - CHANNEL_UPDATE
                  - ROLE_CREATE
                  - ROLE_DELETE
                  - ROLE_UPDATE
                  - VOICE_CHANNEL_JOIN
                  - VOICE_CHANNEL_LEAVE
                  - VOICE_CHANNEL_MOVE
                  - VOICE_CHANNEL_FORCE_MOVE
                  - VOICE_CHANNEL_FORCE_DISCONNECT
                  - EMOJI_CREATE
                  - EMOJI_DELETE
                  - EMOJI_UPDATE
                  - BOT_ALERT
    </CodeBlock>

    <h2>Complete Example</h2>
    <p>
      Here is the full four-channel configuration combined. Replace each <code>*_CHANNEL_ID</code> with
      the real Discord channel ID (right-click the channel → Copy ID, with Developer Mode enabled).
    </p>

    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        logs:
          config:
            channels:

              "MOD_LOG_CHANNEL_ID":
                include:
                  - MEMBER_WARN
                  - MEMBER_MUTE
                  - MEMBER_UNMUTE
                  - MEMBER_MUTE_EXPIRED
                  - MEMBER_KICK
                  - MEMBER_BAN
                  - MEMBER_UNBAN
                  - MEMBER_FORCEBAN
                  - MEMBER_TIMED_BAN
                  - MEMBER_TIMED_UNBAN
                  - MEMBER_NOTE
                  - MEMBER_TIMEOUT
                  - MEMBER_TIMEOUT_REMOVED
                  - MASSBAN
                  - MASSUNBAN
                  - MASSMUTE
                  - CASE_CREATE
                  - CASE_UPDATE
                  - CASE_DELETE
                  - AUTOMOD_ACTION

              "MESSAGE_LOG_CHANNEL_ID":
                include:
                  - MESSAGE_DELETE
                  - MESSAGE_DELETE_BULK
                  - MESSAGE_EDIT
                  - CENSOR

              "MEMBER_LOG_CHANNEL_ID":
                include:
                  - MEMBER_JOIN
                  - MEMBER_LEAVE
                  - MEMBER_JOIN_WITH_PRIOR_RECORDS
                  - MEMBER_ROLE_ADD
                  - MEMBER_ROLE_REMOVE
                  - MEMBER_ROLE_CHANGES
                  - MEMBER_NICK_CHANGE
                  - MEMBER_USERNAME_CHANGE
                  - MEMBER_RESTORE
                  - MEMBER_MUTE_REJOIN

              "SERVER_LOG_CHANNEL_ID":
                include:
                  - CHANNEL_CREATE
                  - CHANNEL_DELETE
                  - CHANNEL_UPDATE
                  - ROLE_CREATE
                  - ROLE_DELETE
                  - ROLE_UPDATE
                  - VOICE_CHANNEL_JOIN
                  - VOICE_CHANNEL_LEAVE
                  - VOICE_CHANNEL_MOVE
                  - VOICE_CHANNEL_FORCE_MOVE
                  - VOICE_CHANNEL_FORCE_DISCONNECT
                  - EMOJI_CREATE
                  - EMOJI_DELETE
                  - EMOJI_UPDATE
                  - BOT_ALERT
    </CodeBlock>

    <h2>Excluding Specific Events</h2>
    <p>
      If you want everything in a channel except a few noisy events, use <code>exclude</code> instead of
      listing every event in <code>include</code>. You cannot use both <code>include</code> and
      <code>exclude</code> on the same channel at the same time.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        logs:
          config:
            channels:
              "LOG_CHANNEL_ID":
                exclude:
                  - VOICE_CHANNEL_JOIN
                  - VOICE_CHANNEL_LEAVE
    </CodeBlock>

    <h2>Ignoring Bots</h2>
    <p>
      By default Alice logs events from all users including bots. To suppress bot activity in a channel,
      add <code>exclude_bots: true</code> to that channel's config.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
              "MESSAGE_LOG_CHANNEL_ID":
                exclude_bots: true
                include:
                  - MESSAGE_DELETE
                  - MESSAGE_EDIT
    </CodeBlock>

    <h2>Missing Permissions Warning</h2>
    <p>
      If Alice lacks permission to post in a configured log channel, it will log a warning to the console
      and temporarily pause logging to that channel for 2 minutes before retrying. Make sure Alice has
      <strong>View Channel</strong>, <strong>Send Messages</strong>, and <strong>Embed Links</strong>
      permissions in every log channel.
    </p>

    <h2>Discord Timeout Logging</h2>
    <p>
      Alice adds support for logging Discord's native timeout feature, which is not included in the
      original Zeppelin. Add these to your mod log channel to track timeouts applied and removed by staff:
    </p>
    <CodeBlock code-lang="yaml" trim="start">
                  - MEMBER_TIMEOUT
                  - MEMBER_TIMEOUT_REMOVED
    </CodeBlock>
  </div>
</template>

<script lang="ts">
import CodeBlock from "./CodeBlock.vue";

export default {
  components: { CodeBlock },
};
</script>
