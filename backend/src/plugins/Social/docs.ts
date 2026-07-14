import { AlicePluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zSocialConfig } from "./types.js";

export const socialPluginDocs: AlicePluginDocs = {
  type: "stable",
  prettyName: "Social",
  description: trimPluginDescription(`
    Social interaction commands with SFW GIF wrappers (hug, pat, slap, kiss, poke, and more).
    Slash under \`/social\`. No database.
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    social:
      config:
        enabled: true
    ~~~
  `),
  configSchema: zSocialConfig,
};
