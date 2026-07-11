import { ChatInputCommandInteraction, Message, Role } from "discord.js";
import { GuildPluginData } from "vety";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { chunkArray, sorter, trimLines } from "../../../utils.js";
import { refreshMembersIfNeeded } from "../refreshMembers.js";
import { UtilityPluginType } from "../types.js";

export async function actualRolesCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  opts: { search?: string | null; counts?: boolean; sort?: string | null },
) {
  const { guild } = pluginData;

  let roles: Role[] = Array.from(guild.roles.cache.values());
  let sort = opts.sort ?? undefined;

  if (opts.search) {
    const searchStr = opts.search.toLowerCase();
    roles = roles.filter((r) => r.name.toLowerCase().includes(searchStr) || r.id === searchStr);
  }

  let roleCounts: Map<string, number> | null = null;
  if (opts.counts) {
    await refreshMembersIfNeeded(guild);

    roleCounts = new Map<string, number>(guild.roles.cache.map((r) => [r.id, 0]));

    for (const member of guild.members.cache.values()) {
      for (const id of member.roles.cache.keys()) {
        roleCounts.set(id, (roleCounts.get(id) ?? 0) + 1);
      }
    }

    roleCounts.set(guild.id, guild.memberCount);

    if (!sort) sort = "-memberCount";
  }

  if (!sort) sort = "name";

  let sortDir: "ASC" | "DESC" = "ASC";
  if (sort[0] === "-") {
    sort = sort.slice(1);
    sortDir = "DESC";
  }

  if (sort === "position" || sort === "order") {
    roles.sort(sorter("position", sortDir));
  } else if (sort === "memberCount" && opts.counts) {
    roles.sort((first, second) => roleCounts!.get(second.id)! - roleCounts!.get(first.id)!);
  } else if (sort === "name") {
    roles.sort(sorter((r) => r.name.toLowerCase(), sortDir));
  } else {
    await pluginData.state.common.sendErrorMessage(context, "Unknown sorting method");
    return;
  }

  const longestId = roles.reduce((longest, role) => Math.max(longest, role.id.length), 0);
  const chunks = chunkArray(roles, 20);

  for (const [i, chunk] of chunks.entries()) {
    const roleLines = chunk.map((role) => {
      const paddedId = role.id.padEnd(longestId, " ");
      let line = `${paddedId} ${role.name}`;
      const memberCount = roleCounts?.get(role.id);
      if (memberCount !== undefined) {
        line += ` (${memberCount} ${memberCount === 1 ? "member" : "members"})`;
      }
      return line;
    });

    const codeBlock = "```py\n" + roleLines.join("\n") + "```";
    const content =
      i === 0
        ? trimLines(`
          ${opts.search ? "Total roles found" : "Total roles"}: ${roles.length}
          ${codeBlock}
        `)
        : codeBlock;

    if (isContextInteraction(context)) {
      if (i === 0) {
        await sendContextResponse(context, content, true);
      } else {
        await context.followUp({ content, ephemeral: true });
      }
    } else if (context.channel.isSendable()) {
      await context.channel.send(content);
    }
  }
}
