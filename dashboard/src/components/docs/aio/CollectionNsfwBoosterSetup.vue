<template>
  <div>
    <h1>Collection, Nsfw &amp; BoosterRoles</h1>
    <p>
      Remaining AIO parity plugins. Docs:
      <router-link to="/docs/plugins/collection">Collection</router-link>,
      <router-link to="/docs/plugins/nsfw">Nsfw</router-link>,
      <router-link to="/docs/plugins/booster_roles">BoosterRoles</router-link>.
      Edit YAML in
      <router-link to="/dashboard">Dashboard → Configuration</router-link>.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        collection:
          config:
            enabled: true
            pool:
              - common_orb
              - rare_gem
              - epic_relic
              - legendary_crown
        nsfw:
          config:
            enabled: true
            can_use: true
        booster_roles:
          config:
            enabled: true
            booster_role_id: "OPTIONAL_BOOSTER_ROLE_ID"
            max_name_length: 32
          overrides:
            - level: ">=0"
              config:
                can_use: true
            - level: ">=100"
              config:
                can_manage: true
    </CodeBlock>
    <p>
      Nsfw commands only run in NSFW channels. Collection uses slash group
      <code>/collection</code>; BoosterRoles uses <code>/boosterrole</code>.
    </p>
    <p><router-link to="/docs/setup-guides/aio-plugins">← AIO plugins overview</router-link></p>
  </div>
</template>

<script lang="ts">
import CodeBlock from "../CodeBlock.vue";
export default { components: { CodeBlock } };
</script>
