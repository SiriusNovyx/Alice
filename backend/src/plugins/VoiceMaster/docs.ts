import { ZeppelinPluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zVoiceMasterConfig } from "./types.js";

export const voiceMasterPluginDocs: ZeppelinPluginDocs = {
  type: "stable",
  prettyName: "VoiceMaster",
  description: trimPluginDescription(`
    Join-to-create temporary voice channels. Users join a hub channel and get their own room.
    Owners can lock, hide, rename, limit, claim, and transfer. Slash commands live under \`/voicemaster\`.
  `),
  configurationGuide: trimPluginDescription(`
    ### Basic setup
    Create a voice channel users will join to spawn a temporary room, then enable the plugin:

    ~~~yml
    voicemaster:
      config:
        enabled: true
        hub_channel_id: "123456789012345678"
        category_id: "123456789012345679"
        default_name: "{user}'s Channel"
        default_limit: 0
    ~~~

    Use \`!vm-setup\` or \`/voicemaster setup\` to validate channel IDs and print the YAML snippet.
  `),
  configSchema: zVoiceMasterConfig,
};
