import { ChatInputCommandInteraction, GuildMember, Message, Role, User } from "discord.js";
import { GuildPluginData } from "vety";
import { clearExpiringTempRole } from "../../../data/loops/expiringTempRolesLoop.js";
import { canActOn } from "../../../pluginUtils.js";
import { verboseUserMention } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../../RoleManager/RoleManagerPlugin.js";
import { RolesPluginType } from "../types.js";

export async function actualRemoveRoleCmd(
  pluginData: GuildPluginData<RolesPluginType>,
  context: Message | ChatInputCommandInteraction,
  modMember: GuildMember,
  modUser: User,
  member: GuildMember,
  role: Role,
) {
  if (!canActOn(pluginData, modMember, member, true)) {
    pluginData.state.common.sendErrorMessage(
      context,
      "Cannot remove roles from this user: insufficient permissions",
    );
    return;
  }

  const existingTempRole = await pluginData.state.tempRoles.findExistingTempRoleForUserIdAndRoleId(member.id, role.id);
  if (existingTempRole) {
    clearExpiringTempRole(existingTempRole);
    await pluginData.state.tempRoles.clear(member.id, role.id);
  }

  if (!member.roles.cache.has(role.id)) {
    if (existingTempRole) {
      pluginData.state.common.sendSuccessMessage(
        context,
        `Cleared timed role record for **${role.name}** on ${verboseUserMention(member.user)}!`,
      );
      return;
    }
    pluginData.state.common.sendErrorMessage(context, "Member doesn't have that role");
    return;
  }

  await pluginData.getPlugin(RoleManagerPlugin).removeRole(member.id, role.id);

  pluginData.getPlugin(LogsPlugin).logMemberRoleRemove({
    mod: modUser,
    member,
    roles: [role],
  });

  pluginData.state.common.sendSuccessMessage(
    context,
    `Removed role **${role.name}** from ${verboseUserMention(member.user)}!`,
  );
}
