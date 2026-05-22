<template>
  <div>
    <div class="docs-wip">
      ⚠ This documentation is a work in progress and is being actively updated.
    </div>

    <h1>Introduction</h1>

    <p>
      Alice is a private Discord moderation bot designed for large-scale communities.
      It provides powerful automation, logging, and moderation tools through a fully
      configurable plugin system. Every feature is customizable at the server, channel,
      role, or user level.
    </p>

    <h2>Getting the bot</h2>
    <p>
      Access to Alice is currently private and granted on a case-by-case basis.
      Join the <a href="https://discord.gg/T4BCYpB7yu" target="_blank" rel="noopener noreferrer">official Discord server</a>
      to request access for your community.
    </p>
    <p>
      Alice is fully open-source and can also be self-hosted.
      See the <a href="https://github.com/SiriusNovyx/Alice" target="_blank" rel="noopener noreferrer">GitHub repository</a>
      for self-hosting instructions.
    </p>

    <h2>Configuration</h2>
    <p>
      All Alice configuration is done through the dashboard by editing a YAML config file.
      By default only the server owner has access, but they can grant access to other users
      as they see fit. See
      <router-link to="/docs/configuration/configuration-format">Configuration format</router-link>
      for more details.
    </p>

    <h2>Plugins</h2>
    <p>
      Alice is divided into plugins — grouped functionality that can be enabled, disabled,
      and configured independently. Each plugin has its own configuration options and
      can be overridden on a per-channel, per-role, or per-user basis.
    </p>

    <h2>Commands</h2>
    <p>
      Commands for each plugin are listed on the plugin's documentation page.
      Alice supports both traditional <code>!prefix</code> commands and Discord <code>/slash</code> commands simultaneously.
      The command prefix is customizable per server (default: <code>!</code>).
      Run <code>!help &lt;command&gt;</code> for usage information on any command.
    </p>
  </div>
</template>

<script lang="ts">
export default {};
</script>
