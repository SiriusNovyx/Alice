import { ChatInputCommandInteraction, Message, Snowflake, User } from "discord.js";
import { GuildPluginData } from "vety";
import { GenericCommandSource } from "../../../pluginUtils.js";
import { memberRolesLock } from "../../../utils/lockNameHelpers.js";
import { SelfGrantableRolesPluginType } from "../types.js";
import { findMatchingRoles } from "../util/findMatchingRoles.js";
import { getApplyingEntries } from "../util/getApplyingEntries.js";
import { normalizeRoleNames } from "../util/normalizeRoleNames.js";
import { splitRoleNames } from "../util/splitRoleNames.js";

export async function actualRoleRemoveCmd(
  pluginData: GuildPluginData<SelfGrantableRolesPluginType>,
  context: Message | ChatInputCommandInteraction,
  author: User,
  authorMemberId: string,
  roleNamesInput: string[],
) {
  const lock = await pluginData.locks.acquire(memberRolesLock(author));

  try {
    const applyingEntries = await getApplyingEntries(pluginData, context as GenericCommandSource);
    if (applyingEntries.length === 0) {
      return;
    }

    const roleNames = normalizeRoleNames(splitRoleNames(roleNamesInput));
    const matchedRoleIds = findMatchingRoles(roleNames, applyingEntries);

    const rolesToRemove = Array.from(matchedRoleIds.values()).map(
      (id) => pluginData.guild.roles.cache.get(id as Snowflake)!,
    );
    const roleIdsToRemove = rolesToRemove.map((r) => r.id);

    const authorMember = await pluginData.guild.members.fetch(authorMemberId);

    if (rolesToRemove.length) {
      const newRoleIds = authorMember.roles.cache.filter((role) => !roleIdsToRemove.includes(role.id));

      try {
        await authorMember.edit({
          roles: newRoleIds,
        });

        const removedRolesStr = rolesToRemove.map((r) => `**${r.name}**`);
        const removedRolesWord = rolesToRemove.length === 1 ? "role" : "roles";

        if (rolesToRemove.length !== roleNames.length) {
          await pluginData.state.common.sendSuccessMessage(
            context,
            `<@!${author.id}> Removed ${removedRolesStr.join(", ")} ${removedRolesWord};` +
              ` couldn't recognize the other roles you mentioned`,
            { users: [author.id] },
          );
        } else {
          await pluginData.state.common.sendSuccessMessage(
            context,
            `<@!${author.id}> Removed ${removedRolesStr.join(", ")} ${removedRolesWord}`,
            {
              users: [author.id],
            },
          );
        }
      } catch {
        await pluginData.state.common.sendErrorMessage(
          context,
          `<@!${author.id}> Got an error while trying to remove the roles`,
          {
            users: [author.id],
          },
        );
      }
    } else {
      await pluginData.state.common.sendErrorMessage(
        context,
        `<@!${author.id}> Unknown ${roleNamesInput.length === 1 ? "role" : "roles"}`,
        {
          users: [author.id],
        },
      );
    }
  } finally {
    lock.unlock();
  }
}
