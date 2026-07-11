import { ChatInputCommandInteraction, GuildMember, Message, Role, User } from "discord.js";
import { GuildPluginData } from "vety";
import { registerExpiringTempRole } from "../../../data/loops/expiringTempRolesLoop.js";
import { humanizeDuration } from "../../../humanizeDuration.js";
import { canActOn } from "../../../pluginUtils.js";
import { verboseUserMention } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../../RoleManager/RoleManagerPlugin.js";
import { RolesPluginType } from "../types.js";

export async function actualAddTempRoleCmd(
  pluginData: GuildPluginData<RolesPluginType>,
  context: Message | ChatInputCommandInteraction,
  modMember: GuildMember,
  modUser: User,
  member: GuildMember,
  role: Role,
  timeMs: number,
  reason?: string | null,
) {
  if (!canActOn(pluginData, modMember, member, true)) {
    pluginData.state.common.sendErrorMessage(context, "Cannot add roles to this user: insufficient permissions");
    return;
  }

  const existingTempRole = await pluginData.state.tempRoles.findExistingTempRoleForUserIdAndRoleId(member.id, role.id);

  let tempRole;
  let updatedExisting = false;
  if (existingTempRole) {
    await pluginData.state.tempRoles.updateExpiryTime(member.id, role.id, timeMs, modUser.id);
    tempRole = (await pluginData.state.tempRoles.findExistingTempRoleForUserIdAndRoleId(member.id, role.id))!;
    updatedExisting = true;
  } else {
    tempRole = await pluginData.state.tempRoles.addTempRole(member.id, role.id, timeMs, modUser.id);
  }

  if (!member.roles.cache.has(role.id)) {
    await pluginData.getPlugin(RoleManagerPlugin).addRole(member.id, role.id);
  }

  registerExpiringTempRole(tempRole);

  pluginData.getPlugin(LogsPlugin).logMemberTimedRoleAdd({
    mod: modUser,
    member,
    roles: [role],
    time: humanizeDuration(timeMs),
    reason: reason ?? "",
  });

  const durationText = humanizeDuration(timeMs);
  if (updatedExisting) {
    pluginData.state.common.sendSuccessMessage(
      context,
      `Updated timed role **${role.name}** on ${verboseUserMention(member.user)} to **${durationText}**!`,
    );
  } else {
    pluginData.state.common.sendSuccessMessage(
      context,
      `Added role **${role.name}** to ${verboseUserMention(member.user)} for **${durationText}**!`,
    );
  }
}
