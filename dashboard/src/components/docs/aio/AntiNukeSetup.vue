<template>
  <div>
    <h1>AntiNuke</h1>
    <p>
      Audit-log rate limits with quarantine / panic. Complements Automod — does not replace it.
      Docs:
      <router-link to="/docs/plugins/antinuke">AntiNuke plugin</router-link>.
      Edit YAML in
      <router-link to="/dashboard">Dashboard → Configuration</router-link>.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        antinuke:
          config:
            enabled: true
            quarantine_role_id: "OPTIONAL_QUARANTINE_ROLE_ID"
            log_channel_id: null
            whitelist_user_ids: []
            whitelist_role_ids: []
            channel_limit: 3
            role_limit: 3
            ban_limit: 3
            kick_limit: 5
            window_seconds: 15
            panic_mode: false
          overrides:
            - level: ">=100"
              config:
                can_manage: true
    </CodeBlock>
    <p>Slash group: <code>/antinuke</code>.</p>
    <p><router-link to="/docs/setup-guides/aio-plugins">← AIO plugins overview</router-link></p>
  </div>
</template>

<script lang="ts">
import CodeBlock from "../CodeBlock.vue";
export default { components: { CodeBlock } };
</script>
