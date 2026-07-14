import { AlicePluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zFunConfig } from "./types.js";

export const funPluginDocs: AlicePluginDocs = {
  type: "stable",
  prettyName: "Fun",
  description: trimPluginDescription(`
    Lightweight fun commands: 8ball, coinflip, dice, choose, plus cat/dog/meme/joke/fact API wrappers.
    Slash commands under \`/fun\`.
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    fun:
      config:
        enabled: true
    ~~~
  `),
  configSchema: zFunConfig,
};
