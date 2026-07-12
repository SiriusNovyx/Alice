import { ZeppelinPluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zLevelingConfig } from "./types.js";

export const levelingPluginDocs: ZeppelinPluginDocs = {
  type: "stable",
  prettyName: "Leveling",
  description: trimPluginDescription(`
    Award XP for messages with cooldowns, multipliers, role rewards, and a leaderboard.
    Slash commands live under \`/level\`.
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    leveling:
      config:
        enabled: true
        min_xp: 15
        max_xp: 25
        cooldown_seconds: 60
        role_rewards:
          - level: 5
            role_id: "123456789012345678"
    ~~~
  `),
  configSchema: zLevelingConfig,
};
