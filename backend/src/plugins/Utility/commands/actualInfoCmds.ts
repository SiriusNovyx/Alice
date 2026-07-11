import { ChatInputCommandInteraction, Message, Role, Snowflake } from "discord.js";
import { GuildPluginData } from "vety";
import { getChannelId, getRoleId } from "vety/helpers";
import {
  isContextInteraction,
  resolveMessageMember,
} from "../../../pluginUtils.js";
import { isValidSnowflake, noop, parseInviteCodeInput, resolveInvite, resolveUser } from "../../../utils.js";
import { canReadChannel } from "../../../utils/canReadChannel.js";
import { resolveMessageTarget } from "../../../utils/resolveMessageTarget.js";
import { getChannelInfoEmbed } from "../functions/getChannelInfoEmbed.js";
import { getCustomEmojiId } from "../functions/getCustomEmojiId.js";
import { getEmojiInfoEmbed } from "../functions/getEmojiInfoEmbed.js";
import { getGuildPreview } from "../functions/getGuildPreview.js";
import { getInviteInfoEmbed } from "../functions/getInviteInfoEmbed.js";
import { getMessageInfoEmbed } from "../functions/getMessageInfoEmbed.js";
import { getRoleInfoEmbed } from "../functions/getRoleInfoEmbed.js";
import { getServerInfoEmbed } from "../functions/getServerInfoEmbed.js";
import { getSnowflakeInfoEmbed } from "../functions/getSnowflakeInfoEmbed.js";
import { getUserInfoEmbed } from "../functions/getUserInfoEmbed.js";
import { sendInfoEmbed } from "../functions/sendInfoEmbed.js";
import { UtilityPluginType } from "../types.js";

export async function actualInfoCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  value: string,
  compact: boolean,
) {
  const member = isContextInteraction(context)
    ? await pluginData.guild.members.fetch(context.user.id).catch(() => null)
    : await resolveMessageMember(context as Message<true>);

  const userCfg = await pluginData.config.getMatchingConfig({
    member: member ?? undefined,
    channelId: context.channelId!,
    message: isContextInteraction(context) ? undefined : context,
  });

  // 1. Channel
  if (userCfg.can_channelinfo) {
    const channelId = getChannelId(value);
    const channel = channelId && pluginData.guild.channels.cache.get(channelId as Snowflake);
    if (channel) {
      const embed = await getChannelInfoEmbed(pluginData, channelId!);
      if (embed) {
        await sendInfoEmbed(context, embed);
        return;
      }
    }
  }

  // 2. Server
  if (userCfg.can_server) {
    const guild = await pluginData.client.guilds.fetch(value as Snowflake).catch(noop);
    if (guild) {
      const embed = await getServerInfoEmbed(pluginData, value);
      if (embed) {
        await sendInfoEmbed(context, embed);
        return;
      }
    }
  }

  // 3. User
  if (userCfg.can_userinfo) {
    const user = await resolveUser(pluginData.client, value, "Utility:InfoCmd");
    if (user && userCfg.can_userinfo) {
      const embed = await getUserInfoEmbed(pluginData, user.id, Boolean(compact));
      if (embed) {
        await sendInfoEmbed(context, embed);
        return;
      }
    }
  }

  // 4. Message
  if (userCfg.can_messageinfo) {
    const messageTarget = await resolveMessageTarget(pluginData, value);
    if (messageTarget && member && canReadChannel(messageTarget.channel, member)) {
      const embed = await getMessageInfoEmbed(pluginData, messageTarget.channel.id, messageTarget.messageId);
      if (embed) {
        await sendInfoEmbed(context, embed);
        return;
      }
    }
  }

  // 5. Invite
  if (userCfg.can_inviteinfo) {
    const inviteCode = parseInviteCodeInput(value) ?? value;
    if (inviteCode) {
      const invite = await resolveInvite(pluginData.client, inviteCode, true);
      if (invite) {
        const embed = await getInviteInfoEmbed(pluginData, inviteCode);
        if (embed) {
          await sendInfoEmbed(context, embed);
          return;
        }
      }
    }
  }

  // 6. Server again (fallback for discovery servers)
  if (userCfg.can_server) {
    const serverPreview = await getGuildPreview(pluginData.client, value).catch(() => null);
    if (serverPreview) {
      const embed = await getServerInfoEmbed(pluginData, value);
      if (embed) {
        await sendInfoEmbed(context, embed);
        return;
      }
    }
  }

  // 7. Role
  if (userCfg.can_roleinfo) {
    const roleId = getRoleId(value);
    const role = roleId && pluginData.guild.roles.cache.get(roleId as Snowflake);
    if (role) {
      const embed = await getRoleInfoEmbed(pluginData, role);
      await sendInfoEmbed(context, embed);
      return;
    }
  }

  // 8. Emoji
  if (userCfg.can_emojiinfo) {
    const emojiId = getCustomEmojiId(value);
    if (emojiId) {
      const embed = await getEmojiInfoEmbed(pluginData, emojiId);
      if (embed) {
        await sendInfoEmbed(context, embed);
        return;
      }
    }
  }

  // 9. Arbitrary ID
  if (isValidSnowflake(value) && userCfg.can_snowflake) {
    const embed = await getSnowflakeInfoEmbed(value, true);
    await sendInfoEmbed(context, embed);
    return;
  }

  await pluginData.state.common.sendErrorMessage(
    context,
    "Could not find anything with that value or you are lacking permission for the snowflake type",
  );
}

export async function actualServerInfoCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  serverId: string,
) {
  const embed = await getServerInfoEmbed(pluginData, serverId);
  if (!embed) {
    await pluginData.state.common.sendErrorMessage(context, "Could not find information for that server");
    return;
  }
  await sendInfoEmbed(context, embed);
}

export async function actualInviteInfoCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  inviteCode: string,
) {
  const embed = await getInviteInfoEmbed(pluginData, parseInviteCodeInput(inviteCode) ?? inviteCode);
  if (!embed) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown invite");
    return;
  }
  await sendInfoEmbed(context, embed);
}

export async function actualChannelInfoCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  channelId?: string | null,
) {
  const id = channelId ?? context.channelId;
  if (!id) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown channel");
    return;
  }
  const embed = await getChannelInfoEmbed(pluginData, id);
  if (!embed) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown channel");
    return;
  }
  await sendInfoEmbed(context, embed);
}

export async function actualMessageInfoCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  channelId: string,
  messageId: string,
) {
  const member = isContextInteraction(context)
    ? await pluginData.guild.members.fetch(context.user.id).catch(() => null)
    : await resolveMessageMember(context as Message<true>);

  const channel = pluginData.guild.channels.cache.get(channelId as Snowflake);
  if (!channel?.isTextBased() || !member || !canReadChannel(channel, member)) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown message");
    return;
  }

  const embed = await getMessageInfoEmbed(pluginData, channelId, messageId);
  if (!embed) {
    await pluginData.state.common.sendErrorMessage(context, "Unknown message");
    return;
  }
  await sendInfoEmbed(context, embed);
}

export async function actualSnowflakeInfoCmd(
  context: Message | ChatInputCommandInteraction,
  id: string,
) {
  const embed = await getSnowflakeInfoEmbed(id, false);
  await sendInfoEmbed(context, embed);
}

export async function actualRoleInfoCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  role: Role,
) {
  const embed = await getRoleInfoEmbed(pluginData, role);
  await sendInfoEmbed(context, embed);
}

export async function actualEmojiInfoCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  emoji: string,
) {
  const emojiId = getCustomEmojiId(emoji);
  if (!emojiId) {
    await pluginData.state.common.sendErrorMessage(context, "Emoji not found");
    return;
  }

  const embed = await getEmojiInfoEmbed(pluginData, emojiId);
  if (!embed) {
    await pluginData.state.common.sendErrorMessage(context, "Emoji not found");
    return;
  }
  await sendInfoEmbed(context, embed);
}
