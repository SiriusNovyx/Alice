import { ChatInputCommandInteraction, Message, SendableChannels, Snowflake } from "discord.js";
import { disableCodeBlocks } from "vety/helpers";
import { GuildPluginData } from "vety";
import { MAX_NICKNAME_ENTRIES_PER_USER } from "../../../data/GuildNicknameHistory.js";
import { MAX_USERNAME_ENTRIES_PER_USER } from "../../../data/UsernameHistory.js";
import { NICKNAME_RETENTION_PERIOD } from "../../../data/cleanup/nicknames.js";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { DAYS, chunkMessageLines, createChunkedMessage, renderUsername } from "../../../utils.js";
import { NameHistoryPluginType } from "../types.js";

export async function actualNamesCmd(
  pluginData: GuildPluginData<NameHistoryPluginType>,
  context: Message | ChatInputCommandInteraction,
  userId: string,
) {
  const nicknames = await pluginData.state.nicknameHistory.getByUserId(userId);
  const usernames = await pluginData.state.usernameHistory.getByUserId(userId);

  if (nicknames.length === 0 && usernames.length === 0) {
    await pluginData.state.common.sendErrorMessage(context, "No name history found");
    return;
  }

  const nicknameRows = nicknames.map(
    (r) => `\`[${r.timestamp}]\` ${r.nickname ? `**${disableCodeBlocks(r.nickname)}**` : "*None*"}`,
  );
  const usernameRows = usernames.map((r) => `\`[${r.timestamp}]\` **${disableCodeBlocks(r.username)}**`);

  const user = await pluginData.client.users.fetch(userId as Snowflake).catch(() => null);
  const currentUsername = user ? renderUsername(user) : userId;

  const nicknameDays = Math.round(NICKNAME_RETENTION_PERIOD / DAYS);
  const usernameDays = Math.round(NICKNAME_RETENTION_PERIOD / DAYS);

  let message = `Name history for **${currentUsername}**:`;
  if (nicknameRows.length) {
    message += `\n\n__Last ${MAX_NICKNAME_ENTRIES_PER_USER} nicknames within ${nicknameDays} days:__\n${nicknameRows.join(
      "\n",
    )}`;
  }
  if (usernameRows.length) {
    message += `\n\n__Last ${MAX_USERNAME_ENTRIES_PER_USER} usernames within ${usernameDays} days:__\n${usernameRows.join(
      "\n",
    )}`;
  }

  if (isContextInteraction(context)) {
    const chunks = chunkMessageLines(message);
    await sendContextResponse(context, chunks[0]!, true);
    for (const chunk of chunks.slice(1)) {
      await context.followUp({ content: chunk, ephemeral: true });
    }
  } else if ((context as Message).channel.isSendable()) {
    await createChunkedMessage((context as Message).channel as SendableChannels, message);
  }
}
