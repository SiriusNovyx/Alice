import { slashOptions } from "vety";
import { timeAndDateSlashCmd } from "../types.js";
import { actualSetTimezoneCmd } from "./actualSetTimezoneCmd.js";

export const SetTimezoneSlashCmd = timeAndDateSlashCmd({
  name: "set",
  configPermission: "can_set_timezone",
  description: "Set your personal timezone",
  allowDms: false,

  signature: [slashOptions.string({ name: "timezone", description: "Timezone location e.g. America/New_York", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualSetTimezoneCmd(pluginData, interaction, interaction.user.id, options.timezone);
  },
});
