import { AlicePluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zTicketsConfig } from "./types.js";

export const ticketsPluginDocs: AlicePluginDocs = {
  type: "stable",
  prettyName: "Tickets",
  description: trimPluginDescription(`
    Support ticket panels with category select menus, staff claim/add/remove/close,
    and HTML or plain-text transcripts via GuildArchives / transcript-service.
  `),
  configurationGuide: trimPluginDescription(`
    ### Basic setup
    ~~~yml
    tickets:
      config:
        enabled: true
        parent_category_id: "123456789012345678"
        support_role_ids: ["123456789012345679"]
        log_channel_id: "123456789012345680"
        categories:
          support:
            name: Support
            description: General help
            emoji: "🎫"
          report:
            name: Report
            description: Report a user
            emoji: "🚨"
    ~~~

    Then run \`!ticket-panel\` or \`/ticket panel\` in the channel where the panel should appear.

    Grant \`can_manage: true\` to support staff (via level overrides or role overrides) so they can claim, add/remove users, and close tickets.
  `),
  configSchema: zTicketsConfig,
};
