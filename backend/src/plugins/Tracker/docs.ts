import { AlicePluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zTrackerConfig } from "./types.js";

export const trackerPluginDocs: AlicePluginDocs = {
  type: "stable",
  prettyName: "Tracker",
  description: trimPluginDescription(`
    Track per-user message counts (total + daily) and invite join attribution.
    Supports channel blacklists for message counting. Fake invites are flagged when
    the joining account is under 7 days old; leavers are marked when members leave.
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    tracker:
      config:
        enabled: true
    ~~~

    Admin commands require \`can_manage\` (default: permission level ≥50).
    Requires the bot to have **Manage Guild** (or view invites) for invite tracking.
  `),
  configSchema: zTrackerConfig,
};
