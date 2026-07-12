import { ZeppelinPluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zNsfwConfig } from "./types.js";

export const nsfwPluginDocs: ZeppelinPluginDocs = {
  type: "stable",
  prettyName: "Nsfw",
  description: trimPluginDescription(`
    NSFW image commands gated by plugin \`enabled\` **and** Discord channel NSFW flag.
    Categories: hentai, neko, waifu, blowjob, trap.
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    nsfw:
      config:
        enabled: true
    ~~~
  `),
  configSchema: zNsfwConfig,
};
