<template>
  <div>
    <div class="docs-wip">
      This documentation is a work in progress and is being actively updated.
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
      Alice supports both traditional prefix commands (default <code>!</code>) and Discord slash commands.
      Commands for each plugin are listed on that plugin’s documentation page.
      Run <code>!help &lt;command&gt;</code> for usage on any prefix command.
    </p>

    <h3>Slash command groups</h3>
    <p>
      Most slash commands are nested under a plugin group. Common groups include:
    </p>
    <table class="docs-cmd-table">
      <thead>
        <tr>
          <th>Group</th>
          <th>Plugin</th>
          <th>Examples</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>/mod</code></td>
          <td><router-link to="/docs/plugins/mod_actions">Mod actions</router-link></td>
          <td>warn, mute, kick, ban, case, note…</td>
        </tr>
        <tr>
          <td><code>/mutes</code></td>
          <td><router-link to="/docs/plugins/mutes">Mutes</router-link></td>
          <td>list, clear helpers</td>
        </tr>
        <tr>
          <td><code>/roles</code></td>
          <td><router-link to="/docs/plugins/roles">Roles</router-link></td>
          <td>add, remove, temprole, untemprole, massadd, massremove</td>
        </tr>
        <tr>
          <td><code>/utility</code></td>
          <td><router-link to="/docs/plugins/utility">Utility</router-link></td>
          <td>user, server, clean, search, nickname…</td>
        </tr>
        <tr>
          <td><code>/slowmode</code></td>
          <td><router-link to="/docs/plugins/slowmode">Slowmode</router-link></td>
          <td>set, disable</td>
        </tr>
        <tr>
          <td><code>/remind</code></td>
          <td><router-link to="/docs/plugins/reminders">Reminders</router-link></td>
          <td>create / manage reminders</td>
        </tr>
        <tr>
          <td><code>/tag</code></td>
          <td><router-link to="/docs/plugins/tags">Tags</router-link></td>
          <td>create, edit, use tags</td>
        </tr>
        <tr>
          <td><code>/locate</code></td>
          <td><router-link to="/docs/plugins/locate_user">Locate user</router-link></td>
          <td>where, follow, unfollow</td>
        </tr>
        <tr>
          <td><code>/timezone</code></td>
          <td><router-link to="/docs/plugins/time_and_date">Time and date</router-link></td>
          <td>set / view timezone</td>
        </tr>
        <tr>
          <td><code>/srole</code></td>
          <td><router-link to="/docs/plugins/self_grantable_roles">Self-grantable roles</router-link></td>
          <td>self-assignable roles</td>
        </tr>
        <tr>
          <td><code>/antiraid</code></td>
          <td><router-link to="/docs/plugins/automod">Automod</router-link></td>
          <td>view / set / clear antiraid level</td>
        </tr>
        <tr>
          <td><code>/post</code></td>
          <td><router-link to="/docs/plugins/post">Post</router-link></td>
          <td>post / schedule messages</td>
        </tr>
        <tr>
          <td><code>/counter</code></td>
          <td><router-link to="/docs/plugins/counters">Counters</router-link></td>
          <td>view, set, reset counters</td>
        </tr>
      </tbody>
    </table>
    <p>
      Other groups exist for plugins such as <code>/names</code>, <code>/starboard</code>,
      <code>/auto_reactions</code>, <code>/reaction_roles</code>, <code>/pingable_role</code>,
      <code>/message_saver</code>, and <code>/role_buttons</code>. See each plugin page for details.
    </p>
  </div>
</template>

<script lang="ts">
export default {};
</script>
