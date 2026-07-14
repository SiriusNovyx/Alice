import { AlicePluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zModmailConfig } from "./types.js";

export const modmailPluginDocs: AlicePluginDocs = {
  type: "stable",
  prettyName: "Modmail",
  description: trimPluginDescription(`
    User DMs open a staff thread. Reply, anonymous reply, snippets, close with transcript, and blacklist.
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    modmail:
      config:
        enabled: true
        category_id: "123"
        staff_role_ids: ["456"]
        log_channel_id: "789"
        greeting: "Staff will reply here soon."
        snippets:
          hello: "Thanks for contacting us — someone will be with you shortly."
          closed: "This thread is being closed. Feel free to DM again if needed."
    ~~~
  `),
  configSchema: zModmailConfig,
};
