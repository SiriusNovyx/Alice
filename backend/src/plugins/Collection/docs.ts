import { AlicePluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zCollectionConfig } from "./types.js";

export const collectionPluginDocs: AlicePluginDocs = {
  type: "stable",
  prettyName: "Collection",
  description: trimPluginDescription(`
    Weighted gacha pulls with roll limits, inventory, give, and trade.
    Configure \`pool\` item keys/weights in YAML.
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    collection:
      config:
        enabled: true
        rolls_per_reset: 10
        reset_hours: 24
        pool:
          - key: common_orb
            weight: 50
            rarity: common
          - key: legendary_crown
            weight: 5
            rarity: legendary
    ~~~
  `),
  configSchema: zCollectionConfig,
};
