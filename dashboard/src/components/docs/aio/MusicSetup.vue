<template>
  <div>
    <h1>Music</h1>
    <p>
      Lavalink-backed music. Fails soft when <code>LAVALINK_HOST</code> / <code>LAVALINK_PASSWORD</code> are unset.
      Docs:
      <router-link to="/docs/plugins/music">Music plugin</router-link>.
      Edit YAML in
      <router-link to="/dashboard">Dashboard → Configuration</router-link>.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        music:
          config:
            enabled: true
            stay_247: false
          overrides:
            - level: ">=0"
              config:
                can_use: true
    </CodeBlock>
    <p>
      Local Lavalink (optional compose profile):
    </p>
    <CodeBlock code-lang="bash" trim="start">
      docker compose -f docker-compose.development.yml --profile music up -d lavalink
    </CodeBlock>
    <p>Slash group: <code>/music</code>.</p>
    <p><router-link to="/docs/setup-guides/aio-plugins">← AIO plugins overview</router-link></p>
  </div>
</template>

<script lang="ts">
import CodeBlock from "../CodeBlock.vue";
export default { components: { CodeBlock } };
</script>
