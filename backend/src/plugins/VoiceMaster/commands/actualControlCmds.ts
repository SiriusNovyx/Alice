import { ChannelType } from "discord.js";
import { GuildPluginData } from "vety";
import { GenericCommandSource } from "../../../pluginUtils.js";
import { requireOwnedVoiceChannel } from "../functions/voiceHelpers.js";
import { VoiceMasterPluginType } from "../types.js";

const OWNER_OVERWRITES = {
  ManageChannels: true,
  Connect: true,
  MoveMembers: true,
} as const;

async function withDiscordError(
  pluginData: GuildPluginData<VoiceMasterPluginType>,
  context: GenericCommandSource,
  action: () => Promise<void>,
  successMessage: string,
): Promise<void> {
  try {
    await action();
    await pluginData.state.common.sendSuccessMessage(context, successMessage);
  } catch (err) {
    console.error("[VoiceMaster] control command failed:", err);
    await pluginData.state.common.sendErrorMessage(
      context,
      "Could not update the voice channel. Check bot permissions (Manage Channels).",
    );
  }
}

export async function actualLockCmd(
  pluginData: GuildPluginData<VoiceMasterPluginType>,
  context: GenericCommandSource,
  memberId: string,
): Promise<void> {
  const member = await pluginData.guild.members.fetch(memberId).catch(() => null);
  if (!member) {
    await pluginData.state.common.sendErrorMessage(context, "Could not resolve member.");
    return;
  }

  const owned = await requireOwnedVoiceChannel(pluginData, context, member);
  if (!owned) return;

  await withDiscordError(
    pluginData,
    context,
    async () => {
      await owned.channel.permissionOverwrites.edit(pluginData.guild.id, { Connect: false });
    },
    "Your voice channel has been locked.",
  );
}

export async function actualUnlockCmd(
  pluginData: GuildPluginData<VoiceMasterPluginType>,
  context: GenericCommandSource,
  memberId: string,
): Promise<void> {
  const member = await pluginData.guild.members.fetch(memberId).catch(() => null);
  if (!member) {
    await pluginData.state.common.sendErrorMessage(context, "Could not resolve member.");
    return;
  }

  const owned = await requireOwnedVoiceChannel(pluginData, context, member);
  if (!owned) return;

  await withDiscordError(
    pluginData,
    context,
    async () => {
      await owned.channel.permissionOverwrites.edit(pluginData.guild.id, { Connect: null });
    },
    "Your voice channel has been unlocked.",
  );
}

export async function actualHideCmd(
  pluginData: GuildPluginData<VoiceMasterPluginType>,
  context: GenericCommandSource,
  memberId: string,
): Promise<void> {
  const member = await pluginData.guild.members.fetch(memberId).catch(() => null);
  if (!member) {
    await pluginData.state.common.sendErrorMessage(context, "Could not resolve member.");
    return;
  }

  const owned = await requireOwnedVoiceChannel(pluginData, context, member);
  if (!owned) return;

  await withDiscordError(
    pluginData,
    context,
    async () => {
      await owned.channel.permissionOverwrites.edit(pluginData.guild.id, { ViewChannel: false });
    },
    "Your voice channel is now hidden.",
  );
}

export async function actualUnhideCmd(
  pluginData: GuildPluginData<VoiceMasterPluginType>,
  context: GenericCommandSource,
  memberId: string,
): Promise<void> {
  const member = await pluginData.guild.members.fetch(memberId).catch(() => null);
  if (!member) {
    await pluginData.state.common.sendErrorMessage(context, "Could not resolve member.");
    return;
  }

  const owned = await requireOwnedVoiceChannel(pluginData, context, member);
  if (!owned) return;

  await withDiscordError(
    pluginData,
    context,
    async () => {
      await owned.channel.permissionOverwrites.edit(pluginData.guild.id, { ViewChannel: null });
    },
    "Your voice channel is now visible.",
  );
}

export async function actualRenameCmd(
  pluginData: GuildPluginData<VoiceMasterPluginType>,
  context: GenericCommandSource,
  memberId: string,
  name: string,
): Promise<void> {
  const trimmed = name?.trim() ?? "";
  if (!trimmed || trimmed.length > 100) {
    await pluginData.state.common.sendErrorMessage(context, "Name must be between 1 and 100 characters.");
    return;
  }

  const member = await pluginData.guild.members.fetch(memberId).catch(() => null);
  if (!member) {
    await pluginData.state.common.sendErrorMessage(context, "Could not resolve member.");
    return;
  }

  const owned = await requireOwnedVoiceChannel(pluginData, context, member);
  if (!owned) return;

  await withDiscordError(
    pluginData,
    context,
    async () => {
      await owned.channel.setName(trimmed);
    },
    `Channel renamed to **${trimmed}**.`,
  );
}

export async function actualLimitCmd(
  pluginData: GuildPluginData<VoiceMasterPluginType>,
  context: GenericCommandSource,
  memberId: string,
  limit: number,
): Promise<void> {
  if (limit < 0 || limit > 99) {
    await pluginData.state.common.sendErrorMessage(context, "Limit must be between 0 and 99 (0 = unlimited).");
    return;
  }

  const member = await pluginData.guild.members.fetch(memberId).catch(() => null);
  if (!member) {
    await pluginData.state.common.sendErrorMessage(context, "Could not resolve member.");
    return;
  }

  const owned = await requireOwnedVoiceChannel(pluginData, context, member);
  if (!owned) return;

  await withDiscordError(
    pluginData,
    context,
    async () => {
      await owned.channel.setUserLimit(limit);
    },
    `Channel limit set to **${limit === 0 ? "Unlimited" : limit}**.`,
  );
}

export async function actualClaimCmd(
  pluginData: GuildPluginData<VoiceMasterPluginType>,
  context: GenericCommandSource,
  memberId: string,
): Promise<void> {
  const member = await pluginData.guild.members.fetch(memberId).catch(() => null);
  if (!member?.voice.channel || member.voice.channel.type !== ChannelType.GuildVoice) {
    await pluginData.state.common.sendErrorMessage(context, "You must be in a temporary voice channel to claim it.");
    return;
  }

  const record = await pluginData.state.voiceChannels.findByChannelId(member.voice.channel.id);
  if (!record) {
    await pluginData.state.common.sendErrorMessage(context, "This is not a VoiceMaster channel.");
    return;
  }

  if (member.voice.channel.members.has(record.owner_id)) {
    await pluginData.state.common.sendErrorMessage(context, "The owner is still in the channel.");
    return;
  }

  const oldOwnerId = record.owner_id;
  const channel = member.voice.channel;

  await withDiscordError(
    pluginData,
    context,
    async () => {
      await pluginData.state.voiceChannels.setOwner(channel.id, member.id);
      await channel.permissionOverwrites.edit(member.id, OWNER_OVERWRITES);
      if (oldOwnerId !== member.id) {
        await channel.permissionOverwrites.delete(oldOwnerId).catch(() => null);
      }
    },
    "You are now the owner of this voice channel.",
  );
}

export async function actualTransferCmd(
  pluginData: GuildPluginData<VoiceMasterPluginType>,
  context: GenericCommandSource,
  memberId: string,
  targetUserId: string,
): Promise<void> {
  if (targetUserId === memberId) {
    await pluginData.state.common.sendErrorMessage(context, "You already own this channel.");
    return;
  }

  const member = await pluginData.guild.members.fetch(memberId).catch(() => null);
  if (!member) {
    await pluginData.state.common.sendErrorMessage(context, "Could not resolve member.");
    return;
  }

  const owned = await requireOwnedVoiceChannel(pluginData, context, member);
  if (!owned) return;

  const target = await pluginData.guild.members.fetch(targetUserId).catch(() => null);
  if (!target || target.user.bot) {
    await pluginData.state.common.sendErrorMessage(context, "Provide a valid non-bot member to transfer to.");
    return;
  }

  await withDiscordError(
    pluginData,
    context,
    async () => {
      await pluginData.state.voiceChannels.setOwner(owned.channel.id, target.id);
      await owned.channel.permissionOverwrites.edit(target.id, OWNER_OVERWRITES);
      await owned.channel.permissionOverwrites.delete(member.id).catch(() => null);
    },
    `Ownership transferred to **${target.user.username}**.`,
  );
}
