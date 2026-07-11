import { slashOptions } from "vety";
import { roleButtonsSlashCmd } from "../types.js";
import { actualResetButtonsCmd } from "./actualResetButtonsCmd.js";

export const ResetButtonsSlashCmd = roleButtonsSlashCmd({
  name: "reset",
  configPermission: "can_reset",
  description: "Forget and re-apply a set of role buttons",
  allowDms: false,

  signature: [slashOptions.string({ name: "name", description: "Config name of the role buttons set", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualResetButtonsCmd(pluginData, interaction, options.name);
  },
});
