import { slashOptions } from "vety";
import { archiveSearch, displaySearch, SearchType } from "../search.js";
import { utilitySlashCmd } from "../types.js";

export const SearchSlashCmd = utilitySlashCmd({
  name: "search",
  configPermission: "can_search",
  description: "Search server members",
  allowDms: false,

  signature: [
    slashOptions.string({ name: "query", description: "Search query", required: false }),
    slashOptions.integer({ name: "page", description: "Page number", required: false }),
    slashOptions.string({ name: "role", description: "Filter by role name or ID", required: false }),
    slashOptions.boolean({ name: "voice", description: "Only members in voice", required: false }),
    slashOptions.boolean({ name: "bot", description: "Only bots", required: false }),
    slashOptions.string({ name: "sort", description: "Sort method", required: false }),
    slashOptions.boolean({ name: "case-sensitive", description: "Case-sensitive search", required: false }),
    slashOptions.boolean({ name: "export", description: "Export results to an archive", required: false }),
    slashOptions.boolean({ name: "ids", description: "Show IDs only", required: false }),
    slashOptions.boolean({ name: "regex", description: "Treat query as regex", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const args = {
      query: options.query ?? "",
      page: options.page,
      role: options.role,
      voice: options.voice ?? false,
      bot: options.bot ?? false,
      sort: options.sort,
      "case-sensitive": options["case-sensitive"] ?? false,
      export: options.export ?? false,
      ids: options.ids,
      regex: options.regex ?? false,
    };

    if (args.export) {
      await archiveSearch(pluginData, args as any, SearchType.MemberSearch, interaction);
    } else {
      await displaySearch(pluginData, args as any, SearchType.MemberSearch, interaction);
    }
  },
});
