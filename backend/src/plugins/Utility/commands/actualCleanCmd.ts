import {
  ChatInputCommandInteraction,
  GuildBasedChannel,
  GuildMember,
  Message,
  Snowflake,
  TextBasedChannel,
  User,
} from "discord.js";
import { GuildPluginData } from "vety";
import {
  ContextResponse,
  deleteContextResponse,
  isContextMessage,
} from "../../../pluginUtils.js";
import { ModActionsPlugin } from "../../../plugins/ModActions/ModActionsPlugin.js";
import { SECONDS, noop } from "../../../utils.js";
import { cleanMessages } from "../functions/cleanMessages.js";
import { fetchChannelMessagesToClean } from "../functions/fetchChannelMessagesToClean.js";
import { UtilityPluginType } from "../types.js";

const CLEAN_COMMAND_DELETE_DELAY = 10 * SECONDS;

export interface ActualCleanCmdOpts {
  count: number;
  channelId?: string | null;
  userId?: string | null;
  bots?: boolean;
  deletePins?: boolean;
  hasInvites?: boolean;
  match?: RegExp | null;
  toId?: string | null;
  /** `true` = latest case; number = specific case number; omit/null = no update */
  update?: number | true | null;
}

export async function actualCleanCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  author: User,
  authorMember: GuildMember | null,
  opts: ActualCleanCmdOpts,
) {
  const contextChannelId = context.channelId!;
  const targetChannel = opts.channelId
    ? pluginData.guild.channels.cache.get(opts.channelId as Snowflake)
    : context.channel;

  if (!targetChannel?.isTextBased() || targetChannel.isDMBased()) {
    pluginData.state.common.sendErrorMessage(context, "Invalid channel specified");
    return;
  }

  if (targetChannel.id !== contextChannelId) {
    const configForTargetChannel = await pluginData.config.getMatchingConfig({
      userId: author.id,
      member: authorMember ?? undefined,
      channelId: targetChannel.id,
      categoryId: targetChannel.parentId,
    });
    if (configForTargetChannel.can_clean !== true) {
      pluginData.state.common.sendErrorMessage(context, "Missing permissions to use clean on that channel");
      return;
    }
  }

  let cleaningMessage: Message | undefined;
  if (isContextMessage(context) && context.channel.isSendable()) {
    cleaningMessage = await context.channel.send("Cleaning...");
  }

  const fetchMessagesResult = await fetchChannelMessagesToClean(
    pluginData,
    targetChannel as GuildBasedChannel & TextBasedChannel,
    {
      beforeId: context.id,
      count: opts.count,
      authorId: opts.userId ?? undefined,
      includePins: opts.deletePins,
      onlyBotMessages: opts.bots,
      onlyWithInvites: opts.hasInvites,
      upToId: opts.toId ?? undefined,
      matchContent: opts.match ?? undefined,
    },
  );

  if ("error" in fetchMessagesResult) {
    pluginData.state.common.sendErrorMessage(context, fetchMessagesResult.error);
    cleaningMessage?.delete().catch(noop);
    return;
  }

  const { messages: messagesToClean, note } = fetchMessagesResult;

  let responseMsg: ContextResponse | null = null;
  if (messagesToClean.length > 0) {
    const cleanResult = await cleanMessages(
      pluginData,
      targetChannel as GuildBasedChannel & TextBasedChannel,
      messagesToClean,
      author,
    );

    let responseText = `Cleaned ${messagesToClean.length} ${messagesToClean.length === 1 ? "message" : "messages"}`;
    if (note) {
      responseText += ` (${note})`;
    }
    if (targetChannel.id !== contextChannelId) {
      responseText += ` in <#${targetChannel.id}>: ${cleanResult.archiveUrl}`;
    }

    if (opts.update != null) {
      const updateMessage = `Cleaned ${messagesToClean.length} ${
        messagesToClean.length === 1 ? "message" : "messages"
      } in <#${targetChannel.id}>: ${cleanResult.archiveUrl}`;
      const modActions = pluginData.getPlugin(ModActionsPlugin);
      const caseNumber = typeof opts.update === "number" ? opts.update : null;
      await modActions.updateCase(context, caseNumber, updateMessage);
    }

    responseMsg = await pluginData.state.common.sendSuccessMessage(context, responseText);
  } else {
    const responseText = `Found no messages to clean${note ? ` (${note})` : ""}!`;
    responseMsg = await pluginData.state.common.sendErrorMessage(context, responseText);
  }

  cleaningMessage?.delete().catch(noop);

  if (isContextMessage(context) && targetChannel.id === context.channel.id) {
    context.delete().catch(noop);
    setTimeout(() => {
      deleteContextResponse(responseMsg).catch(noop);
      responseMsg?.delete().catch(noop);
    }, CLEAN_COMMAND_DELETE_DELAY);
  }
}
