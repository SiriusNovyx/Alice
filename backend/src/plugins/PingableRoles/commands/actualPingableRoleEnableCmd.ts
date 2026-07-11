import { ChatInputCommandInteraction, Message, Role } from "discord.js";
import { GuildPluginData } from "vety";
import { PingableRolesPluginType } from "../types.js";

export async function actualPingableRoleEnableCmd(
  pluginData: GuildPluginData<PingableRolesPluginType>,
  context: Message | ChatInputCommandInteraction,
  channelId: string,
  role: Role,
) {
  const existingPingableRole = await pluginData.state.pingableRoles.getByChannelAndRoleId(channelId, role.id);
  if (existingPingableRole) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `**${role.name}** is already set as pingable in <#${channelId}>`,
    );
    return;
  }

  await pluginData.state.pingableRoles.add(channelId, role.id);
  pluginData.state.cache.delete(channelId);

  await pluginData.state.common.sendSuccessMessage(
    context,
    `**${role.name}** has been set as pingable in <#${channelId}>`,
  );
}
