import { slashOptions } from "vety";
import { parseSlashDelay } from "../../../utils.js";
import { mutesSlashCmd } from "../types.js";
import { actualMutesListCmd } from "./actualMutesListCmd.js";

export const MutesListSlashCmd = mutesSlashCmd({
  name: "list",
  configPermission: "can_view_list",
  description: "List active mutes",
  allowDms: false,

  signature: [
    slashOptions.string({ name: "age", description: "Only mutes older than this duration", required: false }),
    slashOptions.boolean({ name: "left", description: "Only show mutes for users who left", required: false }),
    slashOptions.boolean({ name: "manual", description: "Show manual mutes only", required: false }),
    slashOptions.boolean({ name: "export", description: "Export mutes to an archive link", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    let age: number | undefined;
    if (options.age) {
      const parsed = parseSlashDelay(options.age);
      if (parsed === null) {
        await pluginData.state.common.sendErrorMessage(interaction, `Could not convert ${options.age} to a delay`);
        return;
      }
      age = parsed;
    }

    await actualMutesListCmd(pluginData, interaction, interaction.user.id, {
      age,
      left: options.left ?? false,
      manual: options.manual || false,
      export: options.export || false,
    });
  },
});
