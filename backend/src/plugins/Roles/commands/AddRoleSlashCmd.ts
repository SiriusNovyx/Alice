import { GuildMember } from "discord.js";
import { slashOptions } from "vety";
import { canActOn } from "../../../pluginUtils.js";
import { verboseUserMention } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../../RoleManager/RoleManagerPlugin.js";
import { rolesSlashCmd } from "../types.js";

export const AddRoleSlashCmd = rolesSlashCmd({
  name: "addrole",
  configPermission: "can_assign",
  description: "Add a role to the specified member",
  allowDms: false,

  signature: [
    slashOptions.user({ name: "member", description: "The member to add the role to", required: true }),
    slashOptions.role({ name: "role", description: "The role to add", required: true }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const member = await pluginData.guild.members.fetch(options.member.id).catch(() => null);
    if (!member) {
      pluginData.state.common.sendErrorMessage(interaction, "Member not found");
      return;
    }

    const config = await pluginData.config.getMatchingConfig({
      member: interaction.member as GuildMember,
      channelId: interaction.channelId,
    });
    if (!config.assignable_roles.includes(options.role.id)) {
      pluginData.state.common.sendErrorMessage(interaction, "You cannot assign that role");
      return;
    }

    if (!canActOn(pluginData, interaction.member as GuildMember, member, true)) {
      pluginData.state.common.sendErrorMessage(interaction, "Cannot add roles to this user: insufficient permissions");
      return;
    }

    if (member.roles.cache.has(options.role.id)) {
      pluginData.state.common.sendErrorMessage(interaction, "Member already has that role");
      return;
    }

    await pluginData.getPlugin(RoleManagerPlugin).addRole(member.id, options.role.id);
    pluginData.getPlugin(LogsPlugin).logMemberRoleAdd({ mod: interaction.user, member, roles: [options.role] });
    pluginData.state.common.sendSuccessMessage(
      interaction,
      `Added role **${options.role.name}** to ${verboseUserMention(member.user)}!`,
    );
  },
});
