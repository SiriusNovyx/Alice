import { ChatInputCommandInteraction, GuildMember, Message, Role, User } from "discord.js";
import { GuildPluginData } from "vety";
import { logger } from "../../../logger.js";
import { canActOn, sendContextResponse } from "../../../pluginUtils.js";
import { resolveMember, successMessage } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../../RoleManager/RoleManagerPlugin.js";
import { RolesPluginType } from "../types.js";

export async function actualMassRemoveRoleCmd(
  pluginData: GuildPluginData<RolesPluginType>,
  context: Message | ChatInputCommandInteraction,
  modMember: GuildMember,
  modUser: User,
  role: Role,
  memberIds: string[],
) {
  await sendContextResponse(context, "Resolving members...", true);

  const members: GuildMember[] = [];
  const unknownMembers: string[] = [];
  for (const memberId of memberIds) {
    if (!memberId) continue;
    const member = await resolveMember(pluginData.client, pluginData.guild, memberId);
    if (member) members.push(member);
    else unknownMembers.push(memberId);
  }

  for (const member of members) {
    if (!canActOn(pluginData, modMember, member, true)) {
      pluginData.state.common.sendErrorMessage(
        context,
        "Cannot remove roles from 1 or more specified members: insufficient permissions",
      );
      return;
    }
  }

  const membersWithTheRole = members.filter((m) => m.roles.cache.has(role.id));
  let assigned = 0;
  const failed: string[] = [];
  const didNotHaveRole = members.length - membersWithTheRole.length;

  await sendContextResponse(
    context,
    `Removing role **${role.name}** from ${membersWithTheRole.length} ${
      membersWithTheRole.length === 1 ? "member" : "members"
    }...`,
    true,
  );

  for (const member of membersWithTheRole) {
    try {
      await pluginData.getPlugin(RoleManagerPlugin).removeRole(member.id, role.id);
      pluginData.getPlugin(LogsPlugin).logMemberRoleRemove({
        member,
        roles: [role],
        mod: modUser,
      });
      assigned++;
    } catch (e) {
      logger.warn(`Error when removing role via massremoverole: ${e.message}`);
      failed.push(member.id);
    }
  }

  let resultMessage = `Removed role **${role.name}** from ${assigned} ${assigned === 1 ? "member" : "members"}!`;
  if (didNotHaveRole) {
    resultMessage += ` ${didNotHaveRole} ${didNotHaveRole === 1 ? "member" : "members"} didn't have the role.`;
  }
  if (failed.length) {
    resultMessage += `\nFailed to remove the role from the following members: ${failed.join(", ")}`;
  }
  if (unknownMembers.length) {
    resultMessage += `\nUnknown members: ${unknownMembers.join(", ")}`;
  }

  await sendContextResponse(context, successMessage(resultMessage), true);
}
