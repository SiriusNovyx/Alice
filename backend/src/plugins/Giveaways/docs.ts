import { ZeppelinPluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zGiveawaysConfig } from "./types.js";

export const giveawaysPluginDocs: ZeppelinPluginDocs = {
  type: "stable",
  prettyName: "Giveaways",
  description: trimPluginDescription(`
    Create timed giveaways with button entry, optional required roles, end, and reroll.
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    giveaways:
      config:
        enabled: true
    ~~~

    Staff (level >=50 by default) can use \`/giveaway start\`, \`end\`, and \`reroll\`.
  `),
  configSchema: zGiveawaysConfig,
};
