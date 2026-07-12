<template>
  <div>
    <h1>Giveaways</h1>
    <p>
      Timed giveaways with button entry, optional required roles, end, and reroll.
    </p>
    <p>
      Full option reference:
      <router-link to="/docs/plugins/giveaways">Giveaways plugin docs</router-link>.
      Edit guild YAML in
      <router-link to="/dashboard">Dashboard → Configuration</router-link>
      (YAML is the source of truth).
    </p>
    <p>
      Please ensure you understand
      <router-link to="/docs/configuration/plugin-configuration">plugin configuration</router-link>
      and
      <router-link to="/docs/configuration/permissions">permissions</router-link>
      before enabling this plugin.
    </p>

    <h2>Basic setup</h2>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        giveaways:
          config:
            enabled: true
            can_manage: false
            can_enter: true
          overrides:
            - level: ">=50"
              config:
                can_manage: true
    </CodeBlock>
    <p>
      Staff with <code>can_manage</code> can use <code>/giveaway start</code>, <code>end</code>, and <code>reroll</code>.
      Members with <code>can_enter</code> (default true) can press the entry button.
    </p>

    <h2>Config keys</h2>
    <ul>
      <li><code>enabled</code> — turn the plugin on</li>
      <li><code>can_manage</code> — create / end / reroll giveaways</li>
      <li><code>can_enter</code> — allow button entry</li>
    </ul>
    <p>
      Prize, duration, winner count, and role requirements are set per giveaway when starting a giveaway
      (not as static guild config keys).
    </p>

    <h2>Commands</h2>
    <table class="docs-cmd-table">
      <thead>
        <tr>
          <th>Action</th>
          <th>Slash</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Start</td>
          <td><code>/giveaway start</code></td>
        </tr>
        <tr>
          <td>End early</td>
          <td><code>/giveaway end</code></td>
        </tr>
        <tr>
          <td>Reroll winners</td>
          <td><code>/giveaway reroll</code></td>
        </tr>
      </tbody>
    </table>

    <p>
      More AIO modules:
      <router-link to="/docs/setup-guides/aio-plugins">AIO plugins overview</router-link>.
    </p>
  </div>
</template>

<script lang="ts">
import CodeBlock from "../CodeBlock.vue";

export default {
  components: { CodeBlock },
};
</script>
