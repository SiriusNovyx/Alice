<template>
  <div>
    <h1>Verify</h1>
    <p>
      Button or captcha gate that assigns a verified role.
      Docs:
      <router-link to="/docs/plugins/verify">Verify plugin</router-link>.
      Edit YAML in
      <router-link to="/dashboard">Dashboard → Configuration</router-link>.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        verify:
          config:
            enabled: true
            verified_role_id: "YOUR_VERIFIED_ROLE_ID"
            unverified_role_id: null
            channel_id: "OPTIONAL_VERIFY_CHANNEL_ID"
            mode: button
            captcha_length: 5
            max_attempts: 3
          overrides:
            - level: ">=50"
              config:
                can_setup: true
    </CodeBlock>
    <p>
      <code>mode</code> is <code>button</code> or <code>captcha</code>. Slash group: <code>/verify</code>.
    </p>
    <p><router-link to="/docs/setup-guides/aio-plugins">← AIO plugins overview</router-link></p>
  </div>
</template>

<script lang="ts">
import CodeBlock from "../CodeBlock.vue";
export default { components: { CodeBlock } };
</script>
