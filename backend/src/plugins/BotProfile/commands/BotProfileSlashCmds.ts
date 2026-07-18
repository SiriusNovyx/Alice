import { PermissionFlagsBits } from "discord.js";
import { botProfileSlashCmd } from "../types.js";
import { actualCustomBotCmd } from "./actualBotProfileCmds.js";

export const CustomBotSlashCmd = botProfileSlashCmd({
  name: "custombot",
  configPermission: "can_manage",
  description: "Customize the bot nickname, avatar, banner, and bio for this server",
  defaultMemberPermissions: PermissionFlagsBits.ManageGuild.toString(),
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: false });
    await actualCustomBotCmd(pluginData, interaction, interaction.user.id);
  },
});
