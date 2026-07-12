<template>
  <div>
    <h1>AIO plugins</h1>
    <p>
      Alice includes a suite of community AIO plugins inspired by Vermeil, implemented as native
      Vety guild plugins with TypeORM/MySQL. Enable each plugin in your guild YAML config via the
      <router-link to="/dashboard">dashboard config editor</router-link>
      (YAML remains the source of truth). From a server card, open
      <strong>AIO</strong> for quick links, or use the setup guides below.
    </p>
    <p>
      Please ensure you understand
      <router-link to="/docs/configuration/plugin-configuration">plugin configuration</router-link>
      and
      <router-link to="/docs/configuration/permissions">permissions</router-link>
      before enabling these modules.
    </p>

    <h2>Community</h2>
    <ul>
      <li>
        <router-link to="/docs/setup-guides/voicemaster">VoiceMaster setup</router-link>
        ·
        <router-link to="/docs/plugins/voicemaster">docs</router-link>
        — join-to-create temporary voice channels
      </li>
      <li>
        <router-link to="/docs/setup-guides/tickets">Tickets setup</router-link>
        ·
        <router-link to="/docs/plugins/tickets">docs</router-link>
        — panels, claim/close, HTML transcripts
      </li>
      <li>
        <router-link to="/docs/setup-guides/giveaways">Giveaways setup</router-link>
        ·
        <router-link to="/docs/plugins/giveaways">docs</router-link>
        — timed giveaways with button entry
      </li>
    </ul>

    <h3>VoiceMaster + Tickets starter</h3>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        voicemaster:
          config:
            enabled: true
            hub_channel_id: "YOUR_HUB_VOICE_CHANNEL_ID"
            category_id: "OPTIONAL_CATEGORY_ID"
            default_name: "{user}'s Channel"
            default_limit: 0
        tickets:
          config:
            enabled: true
            parent_category_id: "YOUR_TICKET_CATEGORY_ID"
            log_channel_id: "OPTIONAL_LOG_CHANNEL_ID"
            categories:
              support:
                name: Support
                description: General help
    </CodeBlock>

    <h3>Giveaways</h3>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        giveaways:
          config:
            enabled: true
    </CodeBlock>

    <h2>Engagement</h2>
    <ul>
      <li>
        <router-link to="/docs/setup-guides/leveling">Leveling setup</router-link>
        ·
        <router-link to="/docs/plugins/leveling">docs</router-link>
      </li>
      <li>
        <router-link to="/docs/setup-guides/verify">Verify setup</router-link>
        ·
        <router-link to="/docs/plugins/verify">docs</router-link>
      </li>
      <li>
        <router-link to="/docs/setup-guides/fun-social">Fun &amp; Social setup</router-link>
        ·
        <router-link to="/docs/plugins/fun">Fun</router-link>
        /
        <router-link to="/docs/plugins/social">Social</router-link>
      </li>
    </ul>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        leveling:
          config:
            enabled: true
            min_xp: 15
            max_xp: 25
            cooldown_seconds: 60
        verify:
          config:
            enabled: true
            verified_role_id: "YOUR_VERIFIED_ROLE_ID"
        fun:
          config:
            enabled: true
        social:
          config:
            enabled: true
    </CodeBlock>

    <h2>Support &amp; security</h2>
    <ul>
      <li>
        <router-link to="/docs/setup-guides/modmail">Modmail setup</router-link>
        ·
        <router-link to="/docs/plugins/modmail">docs</router-link>
      </li>
      <li>
        <router-link to="/docs/setup-guides/antinuke">AntiNuke setup</router-link>
        ·
        <router-link to="/docs/plugins/antinuke">docs</router-link>
        — complements Automod; does not replace it
      </li>
    </ul>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        modmail:
          config:
            enabled: true
            category_id: "YOUR_MODMAIL_CATEGORY_ID"
            staff_role_ids:
              - "YOUR_STAFF_ROLE_ID"
        antinuke:
          config:
            enabled: true
            quarantine_role_id: "OPTIONAL_QUARANTINE_ROLE_ID"
            window_seconds: 10
    </CodeBlock>

    <h2>Heavy systems</h2>
    <ul>
      <li>
        <router-link to="/docs/setup-guides/economy">Economy setup</router-link>
        ·
        <router-link to="/docs/plugins/economy">docs</router-link>
      </li>
      <li>
        <router-link to="/docs/setup-guides/music">Music setup</router-link>
        ·
        <router-link to="/docs/plugins/music">docs</router-link>
      </li>
      <li>
        <router-link to="/docs/setup-guides/collection-nsfw-booster">Collection / Nsfw / BoosterRoles</router-link>
      </li>
    </ul>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        economy:
          config:
            enabled: true
            currency_name: coins
        music:
          config:
            enabled: true
        collection:
          config:
            enabled: true
        nsfw:
          config:
            enabled: true
        booster_roles:
          config:
            enabled: true
            booster_role_id: "OPTIONAL_BOOSTER_ROLE_ID"
    </CodeBlock>

    <h2>Music / Lavalink</h2>
    <p>
      Music fails soft when <code>LAVALINK_HOST</code> / <code>LAVALINK_PASSWORD</code> are unset.
      For local development, start the optional compose profile:
    </p>
    <CodeBlock code-lang="bash" trim="start">
      docker compose -f docker-compose.development.yml --profile music up -d lavalink
    </CodeBlock>

    <h2>Where to edit config</h2>
    <p>
      Open
      <router-link to="/dashboard">Dashboard → your guild → Configuration</router-link>
      (or the <strong>AIO</strong> link on a server card) and paste the YAML blocks above under
      <code>plugins:</code>. Plugin pages under
      <strong>Plugins</strong> in the docs sidebar list every config key from the Zod schema.
    </p>
  </div>
</template>

<script lang="ts">
import CodeBlock from "./CodeBlock.vue";

export default {
  components: { CodeBlock },
};
</script>
