import { slashOptions } from "vety";
import { locateUserSlashCmd } from "../types.js";
import { actualUnfollowCmd } from "./actualUnfollowCmd.js";

export const UnfollowSlashCmd = locateUserSlashCmd({
  name: "unfollow",
  configPermission: "can_alert",
  description: "Delete a voice alert by its list number",
  allowDms: false,

  signature: [slashOptions.number({ name: "num", description: "Alert number from /locate follows", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualUnfollowCmd(pluginData, interaction, interaction.user.id, options.num);
  },
});
