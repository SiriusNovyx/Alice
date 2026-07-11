import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { isOwner } from "../../../pluginUtils.js";
import { channelArchiverCmd } from "../types.js";
import { actualArchiveChannelCmd } from "./actualArchiveChannelCmd.js";

export const ArchiveChannelCmd = channelArchiverCmd({
  trigger: "archive_channel",
  permission: null,

  config: {
    preFilters: [
      (command, context) => {
        return isOwner(context.pluginData, context.message.author.id);
      },
    ],
  },

  signature: {
    channel: ct.textChannel(),

    "attachment-channel": ct.textChannel({ option: true }),
    messages: ct.number({ option: true }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualArchiveChannelCmd(
      pluginData,
      msg,
      msg.author.id,
      args.channel,
      args["attachment-channel"] ?? null,
      args.messages ?? null,
    );
  },
});
