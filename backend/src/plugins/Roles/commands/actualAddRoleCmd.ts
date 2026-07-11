import { ChatInputCommandInteraction, GuildMember, Message, Role, User } from "discord.js";
import { GuildPluginData } from "vety";
import { clearExpiringTempRole } from "../../../data/loops/expiringTempRolesLoop.js";
import { canActOn } from "../../../pluginUtils.js";
import { verboseUserMention } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../../RoleManager/RoleManagerPlugin.js";
import { RolesPluginType } from "../types.js";

export async function actualAddRoleCmd(
  pluginData: GuildPluginData<RolesPluginType>,
  context: Message | ChatInputCommandInteraction,
  modMember: GuildMember,
  modUser: User,
  member: GuildMember,
  role: Role,
  reason?: string | null,
) {
  if (!canActOn(pluginData, modMember, member, true)) {
    pluginData.state.common.sendErrorMessage(context, "Cannot add roles to this user: insufficient permissions");
    return;
  }

  const existingTempRole = await pluginData.state.tempRoles.findExistingTempRoleForUserIdAndRoleId(member.id, role.id);
  if (existingTempRole) {
    clearExpiringTempRole(existingTempRole);
    await pluginData.state.tempRoles.clear(member.id, role.id);
  }

  if (member.roles.cache.has(role.id)) {
    if (existingTempRole) {
      pluginData.state.common.sendSuccessMessage(
        context,
        `Converted timed role **${role.name}** on ${verboseUserMention(member.user)} to a permanent role!`,
      );
      return;
    }
    pluginData.state.common.sendErrorMessage(context, "Member already has that role");
    return;
  }

  await pluginData.getPlugin(RoleManagerPlugin).addRole(member.id, role.id);

  pluginData.getPlugin(LogsPlugin).logMemberRoleAdd({
    mod: modUser,
    member,
    roles: [role],
    reason: reason ?? "",
  });

  pluginData.state.common.sendSuccessMessage(
    context,
    `Added role **${role.name}** to ${verboseUserMention(member.user)}!`,
  );
}
