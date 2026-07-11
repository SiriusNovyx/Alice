import { ChatInputCommandInteraction, escapeBold, GuildMember, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { canActOn, isContextMessage, sendContextResponse } from "../../../pluginUtils.js";
import { UtilityPluginType } from "../types.js";

export type NicknameAction = "view" | "set" | "reset";

export async function actualNicknameCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  modMember: GuildMember,
  targetMember: GuildMember,
  action: NicknameAction,
  nickname?: string | null,
) {
  if (action === "view") {
    const text = !targetMember.nickname
      ? `<@!${targetMember.id}> does not have a nickname`
      : `The nickname of <@!${targetMember.id}> is **${escapeBold(targetMember.nickname)}**`;

    if (isContextMessage(context)) {
      await sendContextResponse(context, text);
    } else {
      await context.editReply(text);
    }
    return;
  }

  const actingOnSelf =
    (isContextMessage(context) ? context.author.id : context.user.id) === targetMember.id;
  if (!actingOnSelf && !canActOn(pluginData, modMember, targetMember)) {
    pluginData.state.common.sendErrorMessage(
      context,
      action === "reset"
        ? "Cannot reset nickname: insufficient permissions"
        : "Cannot change nickname: insufficient permissions",
    );
    return;
  }

  if (action === "reset") {
    if (!targetMember.nickname) {
      pluginData.state.common.sendErrorMessage(context, "User does not have a nickname");
      return;
    }

    try {
      await targetMember.setNickname(null);
    } catch {
      pluginData.state.common.sendErrorMessage(context, "Failed to reset nickname");
      return;
    }

    pluginData.state.common.sendSuccessMessage(context, `The nickname of <@!${targetMember.id}> has been reset`);
    return;
  }

  if (!nickname) {
    pluginData.state.common.sendErrorMessage(context, "Nickname is required");
    return;
  }

  const nicknameLength = [...nickname].length;
  if (nicknameLength < 2 || nicknameLength > 32) {
    pluginData.state.common.sendErrorMessage(context, "Nickname must be between 2 and 32 characters long");
    return;
  }

  const oldNickname = targetMember.nickname || "<none>";

  try {
    await targetMember.setNickname(nickname);
  } catch {
    pluginData.state.common.sendErrorMessage(context, "Failed to change nickname");
    return;
  }

  pluginData.state.common.sendSuccessMessage(
    context,
    `Changed nickname of <@!${targetMember.id}> from **${oldNickname}** to **${nickname}**`,
  );
}
