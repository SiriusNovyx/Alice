import { APIEmbed, ChannelType } from "discord.js";
import { slashOptions } from "vety";
import { isValidEmbed, parseSlashDelay } from "../../../utils.js";
import { parseColor } from "../../../utils/parseColor.js";
import { rgbToInt } from "../../../utils/rgbToInt.js";
import { postSlashCmd } from "../types.js";
import { actualEditCmd, actualEditEmbedCmd } from "../util/actualEditCmd.js";
import { actualPostCmd } from "../util/actualPostCmd.js";
import { formatContent } from "../util/formatContent.js";
import {
  actualScheduledPostsDeleteCmd,
  actualScheduledPostsListCmd,
  actualScheduledPostsShowCmd,
} from "../util/actualScheduledPostsCmd.js";

const textChannelTypes = [
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
];

const scheduleOpts = [
  slashOptions.boolean({ name: "enable-mentions", description: "Allow @everyone/@roles/@users", required: false }),
  slashOptions.string({ name: "schedule", description: "When to post (e.g. 2h, tomorrow 3pm)", required: false }),
  slashOptions.string({ name: "repeat", description: "Repeat interval (e.g. 1h)", required: false }),
  slashOptions.string({ name: "repeat-until", description: "Repeat until this time", required: false }),
  slashOptions.integer({ name: "repeat-times", description: "Number of times to repeat", required: false }),
];

function parsePostOpts(options: {
  "enable-mentions"?: boolean | null;
  schedule?: string | null;
  repeat?: string | null;
  "repeat-until"?: string | null;
  "repeat-times"?: number | null;
}):
  | { ok: false; error: string }
  | {
      ok: true;
      "enable-mentions"?: boolean;
      schedule?: string;
      repeat?: number;
      "repeat-until"?: string;
      "repeat-times"?: number;
    } {
  let repeat: number | undefined;
  if (options.repeat) {
    const parsed = parseSlashDelay(options.repeat);
    if (parsed == null) return { ok: false, error: "Invalid repeat interval" };
    repeat = parsed;
  }
  return {
    ok: true,
    "enable-mentions": options["enable-mentions"] ?? undefined,
    schedule: options.schedule ?? undefined,
    repeat,
    "repeat-until": options["repeat-until"] ?? undefined,
    "repeat-times": options["repeat-times"] ?? undefined,
  };
}

export const PostSlashCmd = postSlashCmd({
  name: "post",
  configPermission: "can_post",
  description: "Post a message to a channel",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel to post in",
      channelTypes: textChannelTypes,
      required: true,
    }),
    slashOptions.string({ name: "content", description: "Message content", required: true }),
    ...scheduleOpts,
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const channel = pluginData.guild.channels.cache.get(options.channel.id);
    if (!channel?.isTextBased()) {
      await pluginData.state.common.sendErrorMessage(interaction, "Invalid channel");
      return;
    }

    const parsed = parsePostOpts(options);
    if (!parsed.ok) {
      await pluginData.state.common.sendErrorMessage(interaction, parsed.error);
      return;
    }
    const { ok: _ok, ...opts } = parsed;

    await actualPostCmd(pluginData, interaction, interaction.user, channel as any, { content: options.content }, opts);
  },
});

export const PostEmbedSlashCmd = postSlashCmd({
  name: "post_embed",
  configPermission: "can_post",
  description: "Post an embed to a channel",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel to post in",
      channelTypes: textChannelTypes,
      required: true,
    }),
    slashOptions.string({ name: "content", description: "Embed description (or raw JSON with raw=true)", required: false }),
    slashOptions.string({ name: "title", description: "Embed title", required: false }),
    slashOptions.string({ name: "color", description: "Embed color (hex or name)", required: false }),
    slashOptions.boolean({ name: "raw", description: "Treat content as raw embed JSON", required: false }),
    ...scheduleOpts.filter((o) => (o as any).name !== "enable-mentions"),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const channel = pluginData.guild.channels.cache.get(options.channel.id);
    if (!channel?.isTextBased()) {
      await pluginData.state.common.sendErrorMessage(interaction, "Invalid channel");
      return;
    }

    if (!options.title && !options.content) {
      await pluginData.state.common.sendErrorMessage(interaction, "Title or content required");
      return;
    }

    let color: number | null = null;
    if (options.color) {
      const colorRgb = parseColor(options.color);
      if (colorRgb) {
        color = rgbToInt(colorRgb);
      } else {
        await pluginData.state.common.sendErrorMessage(interaction, "Invalid color specified");
        return;
      }
    }

    let embed: APIEmbed = {};
    if (options.title) embed.title = options.title;
    if (color) embed.color = color;

    if (options.content) {
      if (options.raw) {
        let parsed;
        try {
          parsed = JSON.parse(options.content);
        } catch (e: any) {
          await pluginData.state.common.sendErrorMessage(interaction, `Syntax error in embed JSON: ${e.message}`);
          return;
        }
        if (!isValidEmbed(parsed)) {
          await pluginData.state.common.sendErrorMessage(interaction, "Embed is not valid");
          return;
        }
        embed = Object.assign({}, embed, parsed);
      } else {
        embed.description = formatContent(options.content);
      }
    }

    const parsed = parsePostOpts(options);
    if (!parsed.ok) {
      await pluginData.state.common.sendErrorMessage(interaction, parsed.error);
      return;
    }
    const { ok: _ok, ...opts } = parsed;

    await actualPostCmd(pluginData, interaction, interaction.user, channel as any, { embeds: [embed] }, opts);
  },
});

export const EditSlashCmd = postSlashCmd({
  name: "edit",
  configPermission: "can_post",
  description: "Edit a bot-posted message",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel containing the message",
      channelTypes: textChannelTypes,
      required: true,
    }),
    slashOptions.string({ name: "message-id", description: "Message ID to edit", required: true }),
    slashOptions.string({ name: "content", description: "New message content", required: true }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualEditCmd(pluginData, interaction, options.channel.id, options["message-id"], options.content);
  },
});

export const EditEmbedSlashCmd = postSlashCmd({
  name: "edit_embed",
  configPermission: "can_post",
  description: "Edit a bot-posted embed",
  allowDms: false,

  signature: [
    slashOptions.channel({
      name: "channel",
      description: "Channel containing the message",
      channelTypes: textChannelTypes,
      required: true,
    }),
    slashOptions.string({ name: "message-id", description: "Message ID to edit", required: true }),
    slashOptions.string({ name: "content", description: "Embed description (or raw JSON)", required: false }),
    slashOptions.string({ name: "title", description: "Embed title", required: false }),
    slashOptions.string({ name: "color", description: "Embed color", required: false }),
    slashOptions.boolean({ name: "raw", description: "Treat content as raw embed JSON", required: false }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualEditEmbedCmd(pluginData, interaction, options.channel.id, options["message-id"], {
      title: options.title,
      content: options.content,
      color: options.color,
      raw: options.raw ?? false,
    });
  },
});

export const ScheduledPostsListSlashCmd = postSlashCmd({
  name: "scheduled_list",
  configPermission: "can_post",
  description: "List scheduled posts",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualScheduledPostsListCmd(pluginData, interaction);
  },
});

export const ScheduledPostsShowSlashCmd = postSlashCmd({
  name: "scheduled_show",
  configPermission: "can_post",
  description: "Show a scheduled post by number",
  allowDms: false,

  signature: [slashOptions.integer({ name: "num", description: "Scheduled post number from the list", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualScheduledPostsShowCmd(pluginData, interaction, options.num);
  },
});

export const ScheduledPostsDeleteSlashCmd = postSlashCmd({
  name: "scheduled_delete",
  configPermission: "can_post",
  description: "Delete a scheduled post by number",
  allowDms: false,

  signature: [slashOptions.integer({ name: "num", description: "Scheduled post number from the list", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualScheduledPostsDeleteCmd(pluginData, interaction, options.num);
  },
});
