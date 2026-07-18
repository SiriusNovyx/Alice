import { AlicePluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zBotProfileConfig } from "./types.js";

export const botProfilePluginDocs: AlicePluginDocs = {
  type: "stable",
  prettyName: "Bot profile (CustomBot)",
  description: trimPluginDescription(`
    Per-guild custom bot nickname, avatar, banner, and bio.
    **Available to all servers** — no premium, slots, or expiry.
    Banner requires Discord Boost Level 2 (platform limit, not an Alice gate).
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    bot_profile:
      config:
        enabled: true
    ~~~

    Commands (Manage Server):
    - \`!custombot\` / \`!botprofile\` / \`!cb\` — open the settings panel
    - \`/custombot\` — same panel via slash

    Use the panel buttons to set nickname, avatar URL, banner URL, or bio.
    Reset clears the saved config and Discord profile fields for this server.
  `),
  configSchema: zBotProfileConfig,
};
