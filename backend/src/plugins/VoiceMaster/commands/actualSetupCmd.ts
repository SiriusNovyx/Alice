import { ChannelType } from "discord.js";
import { GuildPluginData } from "vety";
import { GenericCommandSource } from "../../../pluginUtils.js";
import { VoiceMasterPluginType } from "../types.js";

export async function actualSetupCmd(
  pluginData: GuildPluginData<VoiceMasterPluginType>,
  context: GenericCommandSource,
  hubChannelId: string,
  categoryId: string | null,
): Promise<void> {
  const hub = pluginData.guild.channels.cache.get(hubChannelId);
  if (!hub || hub.type !== ChannelType.GuildVoice) {
    await pluginData.state.common.sendErrorMessage(context, "Provide a valid voice channel as the join-to-create hub.");
    return;
  }

  if (categoryId) {
    const category = pluginData.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) {
      await pluginData.state.common.sendErrorMessage(context, "Provide a valid category for temporary channels.");
      return;
    }
  }

  await pluginData.state.common.sendSuccessMessage(
    context,
    [
      "VoiceMaster hub configured in YAML-style runtime config is not auto-written.",
      `Set \`hub_channel_id: "${hub.id}"\`${categoryId ? ` and \`category_id: "${categoryId}"\`` : ""}`,
      `then set \`enabled: true\` under the \`voicemaster\` plugin config.`,
      `Hub: <#${hub.id}>`,
    ].join(" "),
  );
}
