import { ChatInputCommandInteraction, GuildMember, Message, Role, User } from "discord.js";
import { GuildPluginData } from "vety";
import { logger } from "../../../logger.js";
import { canActOn, sendContextResponse } from "../../../pluginUtils.js";
import { resolveMember, successMessage } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../../RoleManager/RoleManagerPlugin.js";
import { RolesPluginType } from "../types.js";

export async function actualMassAddRoleCmd(
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
        "Cannot add roles to 1 or more specified members: insufficient permissions",
      );
      return;
    }
  }

  const membersWithoutTheRole = members.filter((m) => !m.roles.cache.has(role.id));
  let assigned = 0;
  const failed: string[] = [];
  const alreadyHadRole = members.length - membersWithoutTheRole.length;

  await sendContextResponse(
    context,
    `Adding role **${role.name}** to ${membersWithoutTheRole.length} ${
      membersWithoutTheRole.length === 1 ? "member" : "members"
    }...`,
    true,
  );

  for (const member of membersWithoutTheRole) {
    try {
      await pluginData.getPlugin(RoleManagerPlugin).addRole(member.id, role.id);
      pluginData.getPlugin(LogsPlugin).logMemberRoleAdd({
        member,
        roles: [role],
        mod: modUser,
        reason: "",
      });
      assigned++;
    } catch (e) {
      logger.warn(`Error when adding role via massaddrole: ${e.message}`);
      failed.push(member.id);
    }
  }

  let resultMessage = `Added role **${role.name}** to ${assigned} ${assigned === 1 ? "member" : "members"}!`;
  if (alreadyHadRole) {
    resultMessage += ` ${alreadyHadRole} ${alreadyHadRole === 1 ? "member" : "members"} already had the role.`;
  }
  if (failed.length) {
    resultMessage += `\nFailed to add the role to the following members: ${failed.join(", ")}`;
  }
  if (unknownMembers.length) {
    resultMessage += `\nUnknown members: ${unknownMembers.join(", ")}`;
  }

  await sendContextResponse(context, successMessage(resultMessage), true);
}
