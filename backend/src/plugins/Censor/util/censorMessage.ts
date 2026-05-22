import { GuildTextBasedChannel, Snowflake } from "discord.js";
import { GuildPluginData } from "vety";
import { LogType } from "../../../data/LogType.js";
import { SavedMessage } from "../../../data/entities/SavedMessage.js";
import { resolveUser } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { CensorPluginType } from "../types.js";

function formatNotifyMessage(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

export async function censorMessage(
  pluginData: GuildPluginData<CensorPluginType>,
  savedMessage: SavedMessage,
  reason: string,
) {
  pluginData.state.serverLogs.ignoreLog(LogType.MESSAGE_DELETE, savedMessage.id);

  try {
    const resolvedChannel = pluginData.guild.channels.resolve(savedMessage.channel_id as Snowflake);
    if (resolvedChannel?.isTextBased()) await resolvedChannel.messages.delete(savedMessage.id as Snowflake);
  } catch {
    return;
  }

  const user = await resolveUser(pluginData.client, savedMessage.user_id, "Censor:censorMessage");
  const channel = pluginData.guild.channels.resolve(savedMessage.channel_id as Snowflake)! as GuildTextBasedChannel;

  // Get notification config for this channel
  const config = await pluginData.config.getMatchingConfig({ channelId: savedMessage.channel_id as Snowflake });

  if (config.notify_user) {
    const templateVars = {
      guildName: pluginData.guild.name,
      reason,
      userMention: `<@${savedMessage.user_id}>`,
      channelMention: `<#${savedMessage.channel_id}>`,
    };

    const notifyChannel = config.notify_channel
      ? pluginData.guild.channels.resolve(config.notify_channel as Snowflake)
      : null;

    if (notifyChannel?.isTextBased()) {
      // Send notice in the configured channel (e.g. a #bot-notices channel)
      const msg = formatNotifyMessage(config.notify_channel_message, templateVars);
      await notifyChannel.send(msg).catch(() => null);
    } else if ("createDM" in user) {
      // Fall back to DMing the user
      const msg = formatNotifyMessage(config.notify_message, templateVars);
      const dm = await user.createDM().catch(() => null);
      if (dm) await dm.send(msg).catch(() => null);
    }
  }

  pluginData.getPlugin(LogsPlugin).logCensor({
    user,
    channel,
    reason,
    message: savedMessage,
  });
}