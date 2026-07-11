import { ChatInputCommandInteraction, Message, Role, Snowflake, User } from "discord.js";
import { GuildPluginData } from "vety";
import { GenericCommandSource } from "../../../pluginUtils.js";
import { memberRolesLock } from "../../../utils/lockNameHelpers.js";
import { SelfGrantableRolesPluginType } from "../types.js";
import { findMatchingRoles } from "../util/findMatchingRoles.js";
import { getApplyingEntries } from "../util/getApplyingEntries.js";
import { normalizeRoleNames } from "../util/normalizeRoleNames.js";
import { splitRoleNames } from "../util/splitRoleNames.js";

export async function actualRoleAddCmd(
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

    const hasUnknownRoles = matchedRoleIds.length !== roleNames.length;

    const rolesToAdd: Map<string, Role> = Array.from(matchedRoleIds.values())
      .map((id) => pluginData.guild.roles.cache.get(id as Snowflake)!)
      .filter(Boolean)
      .reduce((map, role) => {
        map.set(role.id, role);
        return map;
      }, new Map());

    if (!rolesToAdd.size) {
      await pluginData.state.common.sendErrorMessage(
        context,
        `<@!${author.id}> Unknown ${roleNamesInput.length === 1 ? "role" : "roles"}`,
        {
          users: [author.id],
        },
      );
      return;
    }

    const authorMember = await pluginData.guild.members.fetch(authorMemberId);

    const newRoleIds = new Set([...rolesToAdd.keys(), ...authorMember.roles.cache.keys()]);

    const skipped: Set<Role> = new Set();
    const removed: Set<Role> = new Set();

    for (const entry of applyingEntries) {
      if (entry.max_roles === 0) continue;

      let foundRoles = 0;

      for (const roleId of newRoleIds) {
        if (entry.roles[roleId]) {
          if (foundRoles < entry.max_roles) {
            foundRoles++;
          } else {
            newRoleIds.delete(roleId);
            rolesToAdd.delete(roleId);

            if (authorMember.roles.cache.has(roleId as Snowflake)) {
              removed.add(pluginData.guild.roles.cache.get(roleId as Snowflake)!);
            } else {
              skipped.add(pluginData.guild.roles.cache.get(roleId as Snowflake)!);
            }
          }
        }
      }
    }

    try {
      await authorMember.edit({
        roles: Array.from(newRoleIds) as Snowflake[],
      });
    } catch {
      await pluginData.state.common.sendErrorMessage(
        context,
        `<@!${author.id}> Got an error while trying to grant you the roles`,
        {
          users: [author.id],
        },
      );
      return;
    }

    const mentionRoles = pluginData.config.get().mention_roles;
    const addedRolesStr = Array.from(rolesToAdd.values()).map((r) => (mentionRoles ? `<@&${r.id}>` : `**${r.name}**`));
    const addedRolesWord = rolesToAdd.size === 1 ? "role" : "roles";

    const messageParts: string[] = [];
    messageParts.push(`Granted you the ${addedRolesStr.join(", ")} ${addedRolesWord}`);

    if (skipped.size || removed.size) {
      const skippedRolesStr = skipped.size
        ? "skipped " +
          Array.from(skipped.values())
            .map((r) => (mentionRoles ? `<@&${r.id}>` : `**${r.name}**`))
            .join(",")
        : null;
      const removedRolesStr = removed.size
        ? "removed " + Array.from(removed.values()).map((r) => (mentionRoles ? `<@&${r.id}>` : `**${r.name}**`))
        : null;

      const skippedRemovedStr = [skippedRolesStr, removedRolesStr].filter(Boolean).join(" and ");

      messageParts.push(`${skippedRemovedStr} due to role limits`);
    }

    if (hasUnknownRoles) {
      messageParts.push("couldn't recognize some of the roles");
    }

    await pluginData.state.common.sendSuccessMessage(context, `<@!${author.id}> ${messageParts.join("; ")}`, {
      users: [author.id],
    });
  } finally {
    lock.unlock();
  }
}
