import { slashOptions } from "vety";
import { archiveSearch, displaySearch, SearchType } from "../search.js";
import { utilitySlashCmd } from "../types.js";

export const BanSearchSlashCmd = utilitySlashCmd({
  name: "bansearch",
  configPermission: "can_search",
  description: "Search banned users",
  allowDms: false,

  signature: [
    slashOptions.string({ name: "query", description: "Search query", required: true }),
    slashOptions.integer({ name: "page", description: "Page number", required: false }),
    slashOptions.string({ name: "sort", description: "Sort method", required: false }),
    slashOptions.boolean({ name: "case-sensitive", description: "Case-sensitive search", required: false }),
    slashOptions.boolean({ name: "export", description: "Export results to an archive", required: false }),
    slashOptions.boolean({ name: "ids", description: "Show IDs only", required: false }),
    slashOptions.boolean({ name: "regex", description: "Treat query as regex", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const args = {
      query: options.query,
      page: options.page,
      sort: options.sort,
      "case-sensitive": options["case-sensitive"] ?? false,
      export: options.export ?? false,
      ids: options.ids,
      regex: options.regex ?? false,
    };

    if (args.export) {
      await archiveSearch(pluginData, args as any, SearchType.BanSearch, interaction);
    } else {
      await displaySearch(pluginData, args as any, SearchType.BanSearch, interaction);
    }
  },
});
