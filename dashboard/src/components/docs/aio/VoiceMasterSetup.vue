<template>
  <div>
    <h1>VoiceMaster</h1>
    <p>
      Join-to-create temporary voice channels. Members join a hub voice channel and get their own room;
      owners can lock, hide, rename, limit, claim, and transfer.
    </p>
    <p>
      Full option reference:
      <router-link to="/docs/plugins/voicemaster">VoiceMaster plugin docs</router-link>.
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
    <p>
      Create a hub voice channel (and optionally a category for temp rooms), then add the plugin under
      <code>plugins</code>:
    </p>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        voicemaster:
          config:
            enabled: true
            hub_channel_id: "YOUR_HUB_VOICE_CHANNEL_ID"
            category_id: "OPTIONAL_CATEGORY_ID"
            default_name: "{user}'s Channel"
            default_limit: 0
    </CodeBlock>
    <p>
      Use <code>!vm-setup</code> or <code>/voicemaster setup</code> to validate channel IDs and print a YAML snippet.
      Staff at level ≥50 get <code>can_setup</code> by default.
    </p>

    <h2>Config keys</h2>
    <ul>
      <li><code>enabled</code> — turn the plugin on</li>
      <li><code>hub_channel_id</code> — voice channel members join to spawn a room</li>
      <li><code>category_id</code> — optional category for temporary channels</li>
      <li><code>default_name</code> — name template (<code>{user}</code> = member display name)</li>
      <li><code>default_limit</code> — user limit (0 = unlimited)</li>
      <li><code>can_control</code> / <code>can_setup</code> — permission flags (override by level/role)</li>
    </ul>

    <h2>Owner controls</h2>
    <p>Prefix and slash commands (slash group <code>/voicemaster</code>):</p>
    <table class="docs-cmd-table">
      <thead>
        <tr>
          <th>Action</th>
          <th>Prefix</th>
          <th>Slash</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Setup / validate</td>
          <td><code>!vm-setup</code></td>
          <td><code>/voicemaster setup</code></td>
        </tr>
        <tr>
          <td>Lock / unlock</td>
          <td><code>!vm-lock</code> / <code>!vm-unlock</code></td>
          <td><code>/voicemaster lock</code> / <code>unlock</code></td>
        </tr>
        <tr>
          <td>Hide / unhide</td>
          <td><code>!vm-hide</code> / <code>!vm-unhide</code></td>
          <td><code>/voicemaster hide</code> / <code>unhide</code></td>
        </tr>
        <tr>
          <td>Rename</td>
          <td><code>!vm-rename &lt;name&gt;</code></td>
          <td><code>/voicemaster rename</code></td>
        </tr>
        <tr>
          <td>User limit</td>
          <td><code>!vm-limit &lt;n&gt;</code></td>
          <td><code>/voicemaster limit</code></td>
        </tr>
        <tr>
          <td>Claim / transfer</td>
          <td><code>!vm-claim</code> / <code>!vm-transfer</code></td>
          <td><code>/voicemaster claim</code> / <code>transfer</code></td>
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
