<template>
  <div>
    <h1>Fun &amp; Social</h1>
    <p>
      Light entertainment commands (Fun) and social/GIF-style interactions (Social).
      Docs:
      <router-link to="/docs/plugins/fun">Fun</router-link>
      /
      <router-link to="/docs/plugins/social">Social</router-link>.
      Edit YAML in
      <router-link to="/dashboard">Dashboard → Configuration</router-link>.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        fun:
          config:
            enabled: true
            can_use: true
        social:
          config:
            enabled: true
            can_use: true
    </CodeBlock>
    <p>Slash groups: <code>/fun</code>, <code>/social</code>.</p>
    <p><router-link to="/docs/setup-guides/aio-plugins">← AIO plugins overview</router-link></p>
  </div>
</template>

<script lang="ts">
import CodeBlock from "../CodeBlock.vue";
export default { components: { CodeBlock } };
</script>
