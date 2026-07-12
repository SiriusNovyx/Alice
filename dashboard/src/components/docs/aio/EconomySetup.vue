<template>
  <div>
    <h1>Economy</h1>
    <p>
      Guild economy: work, crime, daily, gamble, bank.
      Docs:
      <router-link to="/docs/plugins/economy">Economy plugin</router-link>.
      Edit YAML in
      <router-link to="/dashboard">Dashboard → Configuration</router-link>.
    </p>
    <CodeBlock code-lang="yaml" trim="start">
      plugins:
        economy:
          config:
            enabled: true
            currency_name: coins
            work_min: 50
            work_max: 150
            work_cooldown_seconds: 3600
            crime_min: 100
            crime_max: 400
            crime_fail_chance: 0.4
            crime_cooldown_seconds: 7200
            daily_amount: 500
            gamble_min: 10
            gamble_max_pct: 0.5
          overrides:
            - level: ">=0"
              config:
                can_use: true
            - level: ">=100"
              config:
                can_manage: true
    </CodeBlock>
    <p>Slash group: <code>/economy</code>.</p>
    <p><router-link to="/docs/setup-guides/aio-plugins">← AIO plugins overview</router-link></p>
  </div>
</template>

<script lang="ts">
import CodeBlock from "../CodeBlock.vue";
export default { components: { CodeBlock } };
</script>
