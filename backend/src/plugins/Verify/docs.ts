import { ZeppelinPluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zVerifyConfig } from "./types.js";

export const verifyPluginDocs: ZeppelinPluginDocs = {
  type: "stable",
  prettyName: "Verify",
  description: trimPluginDescription(`
    Gate new members behind a one-click button or an image captcha (modal or \`/verify submit\`).
    Optionally DM a captcha on join. Slash commands live under \`/verify\`.
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    verify:
      config:
        enabled: true
        verified_role_id: "123"
        unverified_role_id: "456"
        mode: "captcha" # or button
        challenge_on_join: true
        kick_on_fail: false
    ~~~
  `),
  configSchema: zVerifyConfig,
};
