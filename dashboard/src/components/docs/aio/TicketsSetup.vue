<template>
  <div>
    <h1>Tickets</h1>
    <p>
      Support ticket panels with category select menus, staff claim/add/remove/close, and HTML or
      plain-text transcripts via GuildArchives / transcript-service.
    </p>
    <p>
      Full option reference:
      <router-link to="/docs/plugins/tickets">Tickets plugin docs</router-link>.
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
      Create a parent category for ticket channels and optional log channel, then configure categories
      (max 25). Post a panel with <code>!ticket-panel</code> or <code>/ticket panel</code>.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        tickets:
          config:
            enabled: true
            parent_category_id: "YOUR_TICKET_CATEGORY_ID"
            support_role_ids:
              - "YOUR_SUPPORT_ROLE_ID"
            log_channel_id: "OPTIONAL_LOG_CHANNEL_ID"
            panel_title: Tickets
            panel_description: Select a category below to open a ticket.
            channel_name: "ticket-{user}"
            max_open_per_user: 1
            categories:
              support:
                name: Support
                description: General help
                emoji: "🎫"
              report:
                name: Report
                description: Report a user
                emoji: "🚨"
    </CodeBlock>

    <h2>Staff permissions</h2>
    <p>
      Grant <code>can_manage: true</code> to support staff so they can claim, add/remove users, and close tickets:
    </p>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        tickets:
          config:
            enabled: true
            can_manage: false
          overrides:
            - level: ">=50"
              config:
                can_manage: true
    </CodeBlock>

    <h2>Config keys</h2>
    <ul>
      <li><code>parent_category_id</code> — Discord category for new ticket channels</li>
      <li><code>support_role_ids</code> — roles pinged / allowed into tickets</li>
      <li><code>log_channel_id</code> — optional close / transcript log</li>
      <li><code>categories</code> — map of category key → name, description, emoji, optional per-category category_id / staff_role_ids</li>
      <li><code>panel_title</code> / <code>panel_description</code> — panel embed text</li>
      <li><code>channel_name</code> — template for ticket channel names</li>
      <li><code>max_open_per_user</code> — open ticket limit (1–10)</li>
      <li><code>can_manage</code> / <code>can_use</code> — permission flags</li>
    </ul>

    <h2>Commands</h2>
    <p>Slash group: <code>/ticket</code>.</p>
    <table class="docs-cmd-table">
      <thead>
        <tr>
          <th>Action</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Panel</td>
          <td><code>!ticket-panel</code> / <code>/ticket panel</code> — post the open panel</td>
        </tr>
        <tr>
          <td>Claim / close</td>
          <td>Staff claim and close; close archives via transcript-service when available</td>
        </tr>
        <tr>
          <td>Add / remove</td>
          <td>Add or remove members from an open ticket</td>
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
