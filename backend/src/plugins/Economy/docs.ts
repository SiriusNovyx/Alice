import { ZeppelinPluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zEconomyConfig } from "./types.js";

export const economyPluginDocs: ZeppelinPluginDocs = {
  type: "stable",
  prettyName: "Economy",
  description: trimPluginDescription(`
    Guild economy with cash/bank/gems, shop, hunt/zoo/battle, marry, and clans.
    MySQL-backed profiles, inventory, creatures, marriages, and clans.
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    economy:
      config:
        enabled: true
        currency_name: coins
        work_min: 50
        work_max: 150
        daily_amount: 500
        hunt_cooldown_seconds: 60
    ~~~
  `),
  configSchema: zEconomyConfig,
};
