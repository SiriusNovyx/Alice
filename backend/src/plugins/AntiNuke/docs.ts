import { AlicePluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zAntiNukeConfig } from "./types.js";

export const antiNukePluginDocs: AlicePluginDocs = {
  type: "stable",
  prettyName: "AntiNuke",
  description: trimPluginDescription(`
    Audit-log driven mass-action protection: channel/role/ban/kick rate limits,
    quarantine role, whitelist, and panic mode (strip dangerous perms + lock sends).
    Complements Automod — does not replace it and does not inspect messages.
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    antinuke:
      config:
        enabled: true
        quarantine_role_id: "123"
        log_channel_id: "789"
        whitelist_user_ids: ["456"]
        channel_limit: 3
        role_limit: 3
        ban_limit: 3
        kick_limit: 5
        window_seconds: 15
        auto_panic_on_violation: false
    ~~~
  `),
  configSchema: zAntiNukeConfig,
};
