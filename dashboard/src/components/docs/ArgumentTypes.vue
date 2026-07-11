<template>
  <div>
    <h1>Argument Types</h1>
    <p>
      This page details the different argument types available for commands.
    </p>

    <h2 id="string">string</h2>
    <p>
      Any text
    </p>

    <h2 id="number">number</h2>
    <p>
      Any number
    </p>

    <h2 id="user">user</h2>
    <p>
      Anything that uniquely identifies a user. This includes:
    </p>
    <ul>
      <li>User ID <code>108552944961454080</code></li>
      <li>User mention <code>@Dark#1010</code></li>
      <li>Loose user mention <code>Dark#1010</code></li>
    </ul>

    <h2 id="userId">userId</h2>
    <p>
      A valid user ID, e.g. <code>108552944961454080</code>
    </p>

    <h2 id="channel">channel</h2>
    <p>
      Anything that uniquely identifies a channel. This includes:
    </p>
    <ul>
      <li>Channel ID <code>473087035574321152</code></li>
      <li>Channel mention <code>#my-channel</code></li>
    </ul>

    <h2 id="channelId">channelId</h2>
    <p>
      A valid channel ID, e.g. <code>473087035574321152</code>
    </p>

    <h2 id="role">role</h2>
    <p>
      Anything that uniquely identifies a role. This includes:
    </p>
    <ul>
      <li>Role ID <code class="inline-code">473085927053590538</code></li>
      <li>Role mention <code>@MyRole</code></li>
    </ul>

    <h2 id="member">member</h2>
    <p>
      Anything that uniquely identifies a member currently on the server. This includes:
    </p>
    <ul>
      <li>User ID <code>108552944961454080</code></li>
      <li>User Mention <code>@Dark#1010</code></li>
      <li>Loose user mention <code>Dark#1010</code></li>
    </ul>

    <h2 id="resolvedMember">resolvedMember</h2>
    <p>
      See <code>member</code> above
    </p>

    <h2 id="delay">delay</h2>
    <p>
      A delay is used to specify an amount of time. It uses simple letters to specify time durations.<br>
      For example, <code>2d15h27m3s</code> would be 2 days, 15 hours, 27 minutes and 3 seconds.
    </p>
    <p>
      Note that the delay should always be written as 1 word, without spaces!
    </p>

    <Expandable>
      <template v-slot:title>Additional information</template>
      <template v-slot:content>
        Durations:
        <ul>
          <li>
            <code>w</code> Week
          </li>
          <li>
            <code>d</code> Day
          </li>
          <li>
            <code>h</code> Hour
          </li>
          <li>
            <code>m</code> Minute
          </li>
          <li>
            <code>s</code> Seconds
          </li>
        </ul>
      </template>
    </Expandable>

    <h2 id="timed-roles">Timed roles (<code>temprole</code>)</h2>
    <p>
      The <router-link to="/docs/plugins/roles">Roles</router-link> plugin can assign roles for a limited duration.
      Slash commands live under <code>/roles</code> (<code>temprole</code>, <code>untemprole</code>, plus add/remove/mass variants).
    </p>
    <p>
      Prefix usage places the <strong>duration before the role</strong> so multi-word role names work with catch-all parsing:
    </p>
    <ul>
      <li><code>!temprole &lt;user&gt; &lt;duration&gt; &lt;role&gt; [-reason]</code> — e.g. <code>!temprole @User 1d Event Staff</code></li>
      <li><code>!untemprole &lt;user&gt; &lt;role&gt;</code></li>
      <li><code>!addrole &lt;user&gt; &lt;role&gt; [-reason]</code> — permanent add (role name may contain spaces)</li>
      <li><code>!removerole &lt;user&gt; &lt;role&gt;</code></li>
    </ul>
    <p>
      Equivalent slash forms: <code>/roles temprole</code>, <code>/roles untemprole</code>, <code>/roles add</code>, <code>/roles remove</code>.
    </p>
  </div>
</template>

<script>
  import CodeBlock from "./CodeBlock.vue";
  import Expandable from "../Expandable.vue";

  export default {
    components: {
      CodeBlock,
      Expandable,
    },
  };
</script>
