<template>
  <div>
    <h1>Modmail</h1>
    <p>
      User DMs open a staff thread; reply, close, and archive transcripts.
      Docs:
      <router-link to="/docs/plugins/modmail">Modmail plugin</router-link>.
      Edit YAML in
      <router-link to="/dashboard">Dashboard → Configuration</router-link>.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        modmail:
          config:
            enabled: true
            category_id: "YOUR_MODMAIL_CATEGORY_ID"
            staff_role_ids:
              - "YOUR_STAFF_ROLE_ID"
            log_channel_id: null
            greeting: Your message has been forwarded to the staff team.
          overrides:
            - level: ">=50"
              config:
                can_reply: true
                can_close: true
            - level: ">=100"
              config:
                can_manage: true
    </CodeBlock>
    <p>Slash group: <code>/modmail</code>.</p>
    <p><router-link to="/docs/setup-guides/aio-plugins">← AIO plugins overview</router-link></p>
  </div>
</template>

<script lang="ts">
import CodeBlock from "../CodeBlock.vue";
export default { components: { CodeBlock } };
</script>
