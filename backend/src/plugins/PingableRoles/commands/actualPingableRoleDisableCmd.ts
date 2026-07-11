import { ChatInputCommandInteraction, Message, Role } from "discord.js";
import { GuildPluginData } from "vety";
import { PingableRolesPluginType } from "../types.js";

export async function actualPingableRoleDisableCmd(
  pluginData: GuildPluginData<PingableRolesPluginType>,
  context: Message | ChatInputCommandInteraction,
  channelId: string,
  role: Role,
) {
  const pingableRole = await pluginData.state.pingableRoles.getByChannelAndRoleId(channelId, role.id);
  if (!pingableRole) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `**${role.name}** is not set as pingable in <#${channelId}>`,
    );
    return;
  }

  await pluginData.state.pingableRoles.delete(channelId, role.id);
  pluginData.state.cache.delete(channelId);

  await pluginData.state.common.sendSuccessMessage(
    context,
    `**${role.name}** is no longer set as pingable in <#${channelId}>`,
  );
}
