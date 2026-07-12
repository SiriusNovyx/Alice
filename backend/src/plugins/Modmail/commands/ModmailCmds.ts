import moment from "moment-timezone";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { closeModmail, replyToUser } from "../functions/modmailFlow.js";
import { modmailCmd } from "../types.js";

export const MmReplyCmd = modmailCmd({
  trigger: ["mmreply", "mreply"],
  usage: "!mmreply <message>",
  permission: "can_reply",
  signature: { message: ct.string({ catchAll: true }) },
  async run({ message: msg, args, pluginData }) {
    const result = await replyToUser(pluginData, msg.channel.id, msg.author, args.message, false);
    if (result.error) await pluginData.state.common.sendErrorMessage(msg, result.error);
    else await msg.delete().catch(() => null);
  },
});

export const MmAReplyCmd = modmailCmd({
  trigger: ["mmareply", "areply"],
  usage: "!mmareply <message>",
  permission: "can_reply",
  signature: { message: ct.string({ catchAll: true }) },
  async run({ message: msg, args, pluginData }) {
    const result = await replyToUser(pluginData, msg.channel.id, msg.author, args.message, true);
    if (result.error) await pluginData.state.common.sendErrorMessage(msg, result.error);
    else await msg.delete().catch(() => null);
  },
});

export const MmCloseCmd = modmailCmd({
  trigger: ["mmclose", "modmail-close"],
  usage: "!mmclose",
  permission: "can_close",
  signature: {},
  async run({ message: msg, pluginData }) {
    if (!msg.channel.isTextBased() || msg.channel.isDMBased()) return;
    const result = await closeModmail(pluginData, msg.channel as any, msg.author);
    if ("error" in result) await pluginData.state.common.sendErrorMessage(msg, result.error);
    else
      await pluginData.state.common.sendSuccessMessage(
        msg,
        result.archiveUrl ? `Closed. Transcript: ${result.archiveUrl}` : "Closed.",
      );
  },
});

export const MmBlacklistCmd = modmailCmd({
  trigger: ["mmblacklist"],
  usage: "!mmblacklist <user>",
  permission: "can_manage",
  signature: { user: ct.user() },
  async run({ message: msg, args, pluginData }) {
    await pluginData.state.blacklist.add(args.user.id, moment.utc().format("YYYY-MM-DD HH:mm:ss"));
    await pluginData.state.common.sendSuccessMessage(msg, `Blacklisted <@${args.user.id}>.`);
  },
});

export const MmUnblacklistCmd = modmailCmd({
  trigger: ["mmunblacklist"],
  usage: "!mmunblacklist <user>",
  permission: "can_manage",
  signature: { user: ct.user() },
  async run({ message: msg, args, pluginData }) {
    await pluginData.state.blacklist.remove(args.user.id);
    await pluginData.state.common.sendSuccessMessage(msg, `Removed <@${args.user.id}> from blacklist.`);
  },
});

export const MmSnippetListCmd = modmailCmd({
  trigger: ["mmsniplist", "mmsnippet-list"],
  usage: "!mmsniplist",
  permission: "can_reply",
  signature: {},
  async run({ message: msg, pluginData }) {
    const snippets = pluginData.config.get().snippets;
    const keys = Object.keys(snippets);
    if (keys.length === 0) {
      await pluginData.state.common.sendErrorMessage(
        msg,
        "No snippets configured. Add them under `modmail.config.snippets` in YAML.",
      );
      return;
    }
    const lines = keys.map((k) => {
      const body = snippets[k];
      const preview = body.length > 60 ? `${body.slice(0, 60)}…` : body;
      return `\`${k}\` — ${preview}`;
    });
    await pluginData.state.common.sendSuccessMessage(msg, `**Snippets**\n${lines.join("\n")}`);
  },
});

export const MmSnippetUseCmd = modmailCmd({
  trigger: ["mmsnippet", "mmsnip"],
  usage: "!mmsnippet <name>",
  permission: "can_reply",
  signature: { name: ct.string() },
  async run({ message: msg, args, pluginData }) {
    const snippets = pluginData.config.get().snippets;
    const entry = Object.entries(snippets).find(([k]) => k.toLowerCase() === args.name.toLowerCase());
    if (!entry) {
      await pluginData.state.common.sendErrorMessage(msg, `Snippet \`${args.name}\` not found.`);
      return;
    }
    const [key, content] = entry;
    const result = await replyToUser(pluginData, msg.channel.id, msg.author, content, false, key);
    if (result.error) await pluginData.state.common.sendErrorMessage(msg, result.error);
    else await msg.delete().catch(() => null);
  },
});
