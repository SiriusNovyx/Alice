import { GuildPluginData } from "vety";
import { TempRole } from "../../../data/entities/TempRole.js";
import { clearExpiringTempRole } from "../../../data/loops/expiringTempRolesLoop.js";
import { logger } from "../../../logger.js";
import { UnknownRole } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { RoleManagerPlugin } from "../../RoleManager/RoleManagerPlugin.js";
import { RolesPluginType } from "../types.js";

export async function clearTempRole(pluginData: GuildPluginData<RolesPluginType>, tempRole: TempRole) {
  clearExpiringTempRole(tempRole);

  const member = await pluginData.guild.members.fetch(tempRole.user_id).catch(() => null);

  if (!member) {
    await pluginData.state.tempRoles.clear(tempRole.user_id, tempRole.role_id);
    return;
  }

  const role = pluginData.guild.roles.cache.get(tempRole.role_id);

  if (member.roles.cache.has(tempRole.role_id)) {
    try {
      await pluginData.getPlugin(RoleManagerPlugin).removeRole(tempRole.user_id, tempRole.role_id);
    } catch (e) {
      pluginData.getPlugin(LogsPlugin).logBotAlert({
        body: `Encountered an error trying to automatically remove role ${tempRole.role_id} from ${tempRole.user_id} after temp role timeout`,
      });
      logger.warn(
        `Error automatically removing role ${tempRole.role_id} from ${tempRole.user_id} (temp role timeout): ${e}`,
      );
      return;
    }
  }

  await pluginData.state.tempRoles.clear(tempRole.user_id, tempRole.role_id);

  pluginData.getPlugin(LogsPlugin).logMemberTimedRoleRemove({
    mod: null,
    member,
    roles: role ? [role] : [new UnknownRole({ id: tempRole.role_id, name: tempRole.role_id })],
    reason: "",
  });
}
