import { ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { utilitySlashCmd } from "../types.js";
import {
  actualChannelInfoCmd,
  actualEmojiInfoCmd,
  actualInfoCmd,
  actualInviteInfoCmd,
  actualMessageInfoCmd,
  actualRoleInfoCmd,
  actualServerInfoCmd,
  actualSnowflakeInfoCmd,
} from "./actualInfoCmds.js";

export const ServerInfoSlashCmd = utilitySlashCmd({
  name: "serverinfo",
  configPermission: "can_server",
  description: "Show server information",
  allowDms: false,

  signature: [
    slashOptions.string({ name: "server-id", description: "Server ID (defaults to this server)", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: false });
    await actualServerInfoCmd(pluginData, interaction, options["server-id"] || pluginData.guild.id);
  },
});

export const InfoSlashCmd = utilitySlashCmd({
  name: "info",
  configPermission: "can_info",
  description: "Show information about a user, channel, role, invite, emoji, or ID",
  allowDms: false,

  signature: [
    slashOptions.string({ name: "value", description: "Thing to look up (defaults to yourself)", required: false }),
    slashOptions.boolean({ name: "compact", description: "Compact user info", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: false });
    await actualInfoCmd(pluginData, interaction, options.value || interaction.user.id, options.compact ?? false);
  },
});

/**
 * Typed info lookups consolidated under one subcommand to stay under Discord's
 * 25-option limit on `/utility` (invite/channel/message/snowflake/role/emoji).
 */
export const LookupSlashCmd = utilitySlashCmd({
  name: "lookup",
  configPermission: "can_info",
  description: "Look up invite, channel, message, snowflake, role, or emoji info",
  allowDms: false,

  signature: [
    slashOptions.string({
      name: "type",
      description: "What to look up",
      required: true,
      choices: [
        { name: "invite", value: "invite" },
        { name: "channel", value: "channel" },
        { name: "message", value: "message" },
        { name: "snowflake", value: "snowflake" },
        { name: "role", value: "role" },
        { name: "emoji", value: "emoji" },
      ],
    }),
    slashOptions.string({ name: "value", description: "Invite code, message ID, snowflake, or emoji", required: false }),
    slashOptions.channel({
      name: "channel",
      description: "Channel (for channel/message lookup)",
      channelTypes: [
        ChannelType.GuildText,
        ChannelType.GuildAnnouncement,
        ChannelType.GuildVoice,
        ChannelType.GuildCategory,
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.GuildForum,
      ],
      required: false,
    }),
    slashOptions.role({ name: "role", description: "Role (for role lookup)", required: false }),
    slashOptions.string({
      name: "message-id",
      description: "Message ID (for message lookup; uses channel option)",
      required: false,
    }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: false });

    const type = options.type;
    const config = await pluginData.config.getForInteraction(interaction);

    if (type === "invite") {
      if (!config.can_inviteinfo) {
        await pluginData.state.common.sendErrorMessage(interaction, "Missing permission for invite info");
        return;
      }
      if (!options.value) {
        await pluginData.state.common.sendErrorMessage(interaction, "Provide an invite code in value");
        return;
      }
      await actualInviteInfoCmd(pluginData, interaction, options.value);
      return;
    }

    if (type === "channel") {
      if (!config.can_channelinfo) {
        await pluginData.state.common.sendErrorMessage(interaction, "Missing permission for channel info");
        return;
      }
      await actualChannelInfoCmd(pluginData, interaction, options.channel?.id ?? interaction.channelId);
      return;
    }

    if (type === "message") {
      if (!config.can_messageinfo) {
        await pluginData.state.common.sendErrorMessage(interaction, "Missing permission for message info");
        return;
      }
      const channelId = options.channel?.id ?? interaction.channelId!;
      if (!options["message-id"]) {
        await pluginData.state.common.sendErrorMessage(interaction, "Provide message-id");
        return;
      }
      await actualMessageInfoCmd(pluginData, interaction, channelId, options["message-id"]);
      return;
    }

    if (type === "snowflake") {
      if (!config.can_snowflake) {
        await pluginData.state.common.sendErrorMessage(interaction, "Missing permission for snowflake info");
        return;
      }
      if (!options.value) {
        await pluginData.state.common.sendErrorMessage(interaction, "Provide a snowflake in value");
        return;
      }
      await actualSnowflakeInfoCmd(interaction, options.value);
      return;
    }

    if (type === "role") {
      if (!config.can_roleinfo) {
        await pluginData.state.common.sendErrorMessage(interaction, "Missing permission for role info");
        return;
      }
      if (!options.role) {
        await pluginData.state.common.sendErrorMessage(interaction, "Provide a role");
        return;
      }
      const role = pluginData.guild.roles.cache.get(options.role.id);
      if (!role) {
        await pluginData.state.common.sendErrorMessage(interaction, "Role not found");
        return;
      }
      await actualRoleInfoCmd(pluginData, interaction, role);
      return;
    }

    if (type === "emoji") {
      if (!config.can_emojiinfo) {
        await pluginData.state.common.sendErrorMessage(interaction, "Missing permission for emoji info");
        return;
      }
      if (!options.value) {
        await pluginData.state.common.sendErrorMessage(interaction, "Provide an emoji in value");
        return;
      }
      await actualEmojiInfoCmd(pluginData, interaction, options.value);
    }
  },
});
