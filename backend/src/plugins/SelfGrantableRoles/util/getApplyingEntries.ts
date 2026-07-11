import { GuildPluginData } from "vety";
import { GenericCommandSource, getConfigForContext, isContextMessage } from "../../../pluginUtils.js";
import { SelfGrantableRolesPluginType, TSelfGrantableRoleEntry } from "../types.js";

export async function getApplyingEntries(
  pluginData: GuildPluginData<SelfGrantableRolesPluginType>,
  context: GenericCommandSource,
): Promise<TSelfGrantableRoleEntry[]> {
  const config = await getConfigForContext(pluginData.config, context);
  const userId = isContextMessage(context) ? context.author.id : context.user.id;
  return Object.entries(config.entries)
    .filter(
      ([k, e]) => e.can_use && !(!e.can_ignore_cooldown && pluginData.state.cooldowns.isOnCooldown(`${k}:${userId}`)),
    )
    .map((pair) => pair[1]);
}
