import { ChatInputCommandInteraction, GuildMember, Message, Role, User } from "discord.js";
import { GuildPluginData } from "vety";
import { clearExpiringTempRole } from "../../../data/loops/expiringTempRolesLoop.js";
import { canActOn } from "../../../pluginUtils.js";
import { verboseUserMention } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../../RoleManager/RoleManagerPlugin.js";
import { RolesPluginType } from "../types.js";

export async function actualRemoveTempRoleCmd(
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
  if (!existingTempRole) {
    pluginData.state.common.sendErrorMessage(context, "That member does not have an active timed role for that role");
    return;
  }

  clearExpiringTempRole(existingTempRole);

  if (member.roles.cache.has(role.id)) {
    await pluginData.getPlugin(RoleManagerPlugin).removeRole(member.id, role.id);
  }

  await pluginData.state.tempRoles.clear(member.id, role.id);

  pluginData.getPlugin(LogsPlugin).logMemberTimedRoleRemove({
    mod: modUser,
    member,
    roles: [role],
    reason: "",
  });

  pluginData.state.common.sendSuccessMessage(
    context,
    `Removed timed role **${role.name}** from ${verboseUserMention(member.user)}!`,
  );
}
