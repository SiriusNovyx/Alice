<template>
  <div class="pp-root">
    <Title title="Alice — Privacy Policy" />

    <div class="pp-bg-grid" aria-hidden="true"></div>

    <div class="pp-inner">
      <router-link class="pp-back" to="/">← Back to Home</router-link>

      <header class="pp-header">
        <div class="pp-header-badge">Legal</div>
        <h1 class="pp-title">Privacy Policy</h1>
        <p class="pp-date">Last updated: April 2026 · Alice Moderation Bot</p>
      </header>

      <div class="pp-card">
        <h2 class="pp-card-title"><span class="pp-card-icon" aria-hidden="true">📋</span> Overview</h2>
        <p class="pp-text">
          Alice is a Discord moderation bot that helps server staff manage communities
          through moderation tools, logging, and automation. This policy explains what
          data we collect, why we collect it, and how it is handled.
        </p>
        <div class="pp-callout">
          Alice only collects data necessary for its core moderation features.
          We do not sell or share your data with third parties.
        </div>
      </div>

      <div class="pp-card">
        <h2 class="pp-card-title"><span class="pp-card-icon" aria-hidden="true">💾</span> Data We Store</h2>
        <p class="pp-text">When Alice is active in a server, the following categories of data may be stored. The exact categories depend on how the server has configured the bot.</p>
        <ul class="pp-list">
          <li><span class="pp-list-arrow" aria-hidden="true">▸</span>Recent messages (used for automod and moderation features)</li>
          <li><span class="pp-list-arrow" aria-hidden="true">▸</span>Usernames, display names, and nickname history</li>
          <li><span class="pp-list-arrow" aria-hidden="true">▸</span>Role assignments and permission levels</li>
          <li><span class="pp-list-arrow" aria-hidden="true">▸</span>Moderation logs, cases, notes, and action history</li>
          <li><span class="pp-list-arrow" aria-hidden="true">▸</span>Server configuration data set by administrators</li>
          <li><span class="pp-list-arrow" aria-hidden="true">▸</span>Archived bulk-deleted messages (when log plugin is enabled)</li>
        </ul>
      </div>

      <div class="pp-card">
        <h2 class="pp-card-title"><span class="pp-card-icon" aria-hidden="true">🌐</span> Dashboard Data</h2>
        <p class="pp-text">When you log into the Alice dashboard via Discord OAuth2, the following data is stored:</p>
        <ul class="pp-list">
          <li><span class="pp-list-arrow" aria-hidden="true">▸</span>Basic Discord profile information (username, user ID, avatar)</li>
          <li><span class="pp-list-arrow" aria-hidden="true">▸</span>Login timestamp for session management</li>
          <li><span class="pp-list-arrow" aria-hidden="true">▸</span>IP address of the login (used for security audit purposes only)</li>
        </ul>
      </div>

      <div class="pp-card">
        <h2 class="pp-card-title"><span class="pp-card-icon" aria-hidden="true">⏱️</span> Data Retention</h2>
        <div class="pp-table-wrap">
          <table class="pp-table">
            <thead>
              <tr>
                <th>Data Type</th>
                <th>Retention Period</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Recent messages</td>
                <td><span class="pp-badge pp-badge--green">24 hours</span></td>
                <td>Automod, bulk deletion</td>
              </tr>
              <tr>
                <td>Deleted messages</td>
                <td><span class="pp-badge pp-badge--green">5 min after deletion</span></td>
                <td>Brief audit window</td>
              </tr>
              <tr>
                <td>Username / nickname history</td>
                <td><span class="pp-badge pp-badge--blue">30 days</span></td>
                <td>Name history tracking</td>
              </tr>
              <tr>
                <td>Message archives</td>
                <td><span class="pp-badge pp-badge--blue">30 days</span></td>
                <td>Bulk delete logs</td>
              </tr>
              <tr>
                <td>Moderation cases</td>
                <td><span class="pp-badge pp-badge--purple">Until removed</span></td>
                <td>Infraction records</td>
              </tr>
              <tr>
                <td>Server configuration</td>
                <td><span class="pp-badge pp-badge--purple">Until removed</span></td>
                <td>Bot operation</td>
              </tr>
              <tr>
                <td>Dashboard sessions</td>
                <td><span class="pp-badge pp-badge--blue">7 days</span></td>
                <td>Authentication</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="pp-card">
        <h2 class="pp-card-title"><span class="pp-card-icon" aria-hidden="true">👤</span> Your Rights</h2>
        <p class="pp-text">You have the right to:</p>
        <ul class="pp-list">
          <li><span class="pp-list-arrow" aria-hidden="true">▸</span>Request access to personal data stored about you</li>
          <li><span class="pp-list-arrow" aria-hidden="true">▸</span>Request deletion of your personal data</li>
          <li><span class="pp-list-arrow" aria-hidden="true">▸</span>Ask questions about how your data is used</li>
        </ul>
        <div class="pp-callout">
          To exercise these rights, contact us via our
          <a href="https://discord.gg/T4BCYpB7yu" target="_blank" rel="noopener noreferrer">Discord server</a>
          or open an issue on
          <a href="https://github.com/SiriusNovyx/Alice" target="_blank" rel="noopener noreferrer">GitHub</a>.
        </div>
      </div>

      <div class="pp-card">
        <h2 class="pp-card-title"><span class="pp-card-icon" aria-hidden="true">🔒</span> Security</h2>
        <p class="pp-text">
          Alice is self-hosted and all data is stored on servers controlled by the instance owner.
          All dashboard communication is encrypted via HTTPS/TLS.
          Discord OAuth2 is used for authentication — we never see or store your Discord password.
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Title from "./Title.vue";
export default {
  components: { Title },
};
</script>

<style>
@import "../style/privacy-policy.css";
</style>
