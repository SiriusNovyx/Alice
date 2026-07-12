<template>
  <div>
    <h1>Leveling</h1>
    <p>
      Message XP with cooldown, level-up messages, role rewards, and multipliers.
      Docs:
      <router-link to="/docs/plugins/leveling">Leveling plugin</router-link>.
      Edit YAML in
      <router-link to="/dashboard">Dashboard → Configuration</router-link>.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        leveling:
          config:
            enabled: true
            min_xp: 15
            max_xp: 25
            cooldown_seconds: 60
            level_up_message: "GG {user}, you reached level **{level}**!"
            level_up_channel_id: null
            excluded_channels: []
            excluded_roles: []
            role_rewards:
              - level: 5
                role_id: "YOUR_ROLE_ID"
            multipliers:
              - type: role
                target_id: "BOOSTER_ROLE_ID"
                multiplier: 1.5
            stack_multipliers: true
          overrides:
            - level: ">=50"
              config:
                can_manage: true
    </CodeBlock>
    <p>
      Slash group: <code>/level</code>. Keys: <code>min_xp</code>, <code>max_xp</code>,
      <code>cooldown_seconds</code>, <code>level_up_message</code>, <code>level_up_channel_id</code>,
      <code>excluded_channels</code>, <code>excluded_roles</code>, <code>role_rewards</code>,
      <code>multipliers</code>, <code>stack_multipliers</code>, <code>can_manage</code>, <code>can_check</code>.
    </p>
    <p><router-link to="/docs/setup-guides/aio-plugins">← AIO plugins overview</router-link></p>
  </div>
</template>

<script lang="ts">
import CodeBlock from "../CodeBlock.vue";
export default { components: { CodeBlock } };
</script>
