import { slashOptions } from "vety";
import { automodSlashCmd } from "../types.js";
import { actualSetAntiraidCmd } from "./actualSetAntiraidCmd.js";

export const SetAntiraidSlashCmd = automodSlashCmd({
  name: "set",
  configPermission: "can_set_antiraid",
  description: "Set the anti-raid level",
  allowDms: false,

  signature: [slashOptions.string({ name: "level", description: "Anti-raid level", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualSetAntiraidCmd(pluginData, interaction, interaction.user, options.level);
  },
});
