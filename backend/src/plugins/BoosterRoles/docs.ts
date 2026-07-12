import { ZeppelinPluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zBoosterRolesConfig } from "./types.js";

export const boosterRolesPluginDocs: ZeppelinPluginDocs = {
  type: "stable",
  prettyName: "BoosterRoles",
  description: trimPluginDescription(`
    Let server boosters create a personal color role. Cleaned up when boosting ends.
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    booster_roles:
      config:
        enabled: true
        booster_role_id: "123456789012345678"
        max_name_length: 32
    ~~~
  `),
  configSchema: zBoosterRolesConfig,
};
