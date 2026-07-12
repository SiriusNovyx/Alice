import moment from "moment-timezone";
import { slashOptions } from "vety";
import { closeModmail, replyToUser } from "../functions/modmailFlow.js";
import { modmailSlashCmd } from "../types.js";

export const MmReplySlashCmd = modmailSlashCmd({
  name: "reply",
  configPermission: "can_reply",
  description: "Reply to the user in this modmail thread",
  allowDms: false,
  signature: [slashOptions.string({ name: "message", description: "Reply text", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const result = await replyToUser(pluginData, interaction.channelId!, interaction.user, options.message, false);
    if (result.error) await pluginData.state.common.sendErrorMessage(interaction, result.error);
    else await pluginData.state.common.sendSuccessMessage(interaction, "Reply sent.");
  },
});

export const MmAReplySlashCmd = modmailSlashCmd({
  name: "areply",
  configPermission: "can_reply",
  description: "Anonymous reply to the user",
  allowDms: false,
  signature: [slashOptions.string({ name: "message", description: "Reply text", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const result = await replyToUser(pluginData, interaction.channelId!, interaction.user, options.message, true);
    if (result.error) await pluginData.state.common.sendErrorMessage(interaction, result.error);
    else await pluginData.state.common.sendSuccessMessage(interaction, "Anonymous reply sent.");
  },
});

export const MmCloseSlashCmd = modmailSlashCmd({
  name: "close",
  configPermission: "can_close",
  description: "Close this modmail thread",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.channel;
    if (!channel || !("isTextBased" in channel) || !channel.isTextBased() || channel.isDMBased()) {
      await pluginData.state.common.sendErrorMessage(interaction, "Run this in a modmail channel.");
      return;
    }
    const result = await closeModmail(pluginData, channel as any, interaction.user);
    if ("error" in result) await pluginData.state.common.sendErrorMessage(interaction, result.error);
    else
      await pluginData.state.common.sendSuccessMessage(
        interaction,
        result.archiveUrl ? `Closed. Transcript: ${result.archiveUrl}` : "Closed.",
      );
  },
});

export const MmBlacklistSlashCmd = modmailSlashCmd({
  name: "blacklist",
  configPermission: "can_manage",
  description: "Blacklist a user from modmail",
  allowDms: false,
  signature: [slashOptions.user({ name: "user", description: "User", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await pluginData.state.blacklist.add(options.user.id, moment.utc().format("YYYY-MM-DD HH:mm:ss"));
    await pluginData.state.common.sendSuccessMessage(interaction, `Blacklisted <@${options.user.id}>.`);
  },
});

export const MmUnblacklistSlashCmd = modmailSlashCmd({
  name: "unblacklist",
  configPermission: "can_manage",
  description: "Remove a user from the modmail blacklist",
  allowDms: false,
  signature: [slashOptions.user({ name: "user", description: "User", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await pluginData.state.blacklist.remove(options.user.id);
    await pluginData.state.common.sendSuccessMessage(interaction, `Removed <@${options.user.id}> from blacklist.`);
  },
});

export const MmSnippetListSlashCmd = modmailSlashCmd({
  name: "snippets",
  configPermission: "can_reply",
  description: "List configured modmail snippets",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const snippets = pluginData.config.get().snippets;
    const keys = Object.keys(snippets);
    if (keys.length === 0) {
      await pluginData.state.common.sendErrorMessage(
        interaction,
        "No snippets configured. Add them under `modmail.config.snippets` in YAML.",
      );
      return;
    }
    const lines = keys.map((k) => {
      const body = snippets[k];
      const preview = body.length > 60 ? `${body.slice(0, 60)}…` : body;
      return `\`${k}\` — ${preview}`;
    });
    await pluginData.state.common.sendSuccessMessage(interaction, `**Snippets**\n${lines.join("\n")}`);
  },
});

export const MmSnippetUseSlashCmd = modmailSlashCmd({
  name: "snippet",
  configPermission: "can_reply",
  description: "Send a configured snippet as a reply",
  allowDms: false,
  signature: [slashOptions.string({ name: "name", description: "Snippet name", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const snippets = pluginData.config.get().snippets;
    const entry = Object.entries(snippets).find(([k]) => k.toLowerCase() === options.name.toLowerCase());
    if (!entry) {
      await pluginData.state.common.sendErrorMessage(interaction, `Snippet \`${options.name}\` not found.`);
      return;
    }
    const [key, content] = entry;
    const result = await replyToUser(pluginData, interaction.channelId!, interaction.user, content, false, key);
    if (result.error) await pluginData.state.common.sendErrorMessage(interaction, result.error);
    else await pluginData.state.common.sendSuccessMessage(interaction, `Snippet \`${key}\` sent.`);
  },
});
