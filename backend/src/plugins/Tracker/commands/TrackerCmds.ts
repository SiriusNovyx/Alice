import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { trackerCmd } from "../types.js";
import {
  actualBlacklistAddCmd,
  actualBlacklistListCmd,
  actualBlacklistRemoveCmd,
  actualInvitesCmd,
  actualMessagesCmd,
  actualOverviewCmd,
} from "./actualTrackerCmds.js";

export const TrackerOverviewCmd = trackerCmd({
  trigger: ["tracker", "trackeroverview"],
  usage: "!tracker",
  permission: "can_manage",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualOverviewCmd(pluginData, msg);
  },
});

export const TrackerMessagesCmd = trackerCmd({
  trigger: ["messages", "msg", "msgs"],
  usage: "!messages [user]",
  permission: "can_check",
  signature: {
    user: ct.resolvedUser({ required: false }),
  },
  async run({ message: msg, args, pluginData }) {
    const user = args.user ?? msg.author;
    const member = await pluginData.guild.members.fetch(user.id).catch(() => null);
    await actualMessagesCmd(pluginData, msg, user, member);
  },
});

export const TrackerInvitesCmd = trackerCmd({
  trigger: ["invites", "invitestats"],
  usage: "!invites [user]",
  permission: "can_check",
  signature: {
    user: ct.resolvedUser({ required: false }),
  },
  async run({ message: msg, args, pluginData }) {
    const user = args.user ?? msg.author;
    await actualInvitesCmd(pluginData, msg, user);
  },
});

export const TrackerBlacklistAddCmd = trackerCmd({
  trigger: ["blacklistchannel", "blch"],
  usage: "!blacklistchannel [channel]",
  permission: "can_manage",
  signature: {
    channel: ct.textChannel({ option: true }),
  },
  async run({ message: msg, args, pluginData }) {
    const channel = args.channel ?? msg.channel;
    if (!channel.isTextBased() || channel.isDMBased()) return;
    await actualBlacklistAddCmd(pluginData, msg, channel);
  },
});

export const TrackerBlacklistRemoveCmd = trackerCmd({
  trigger: ["unblacklistchannel", "ublch"],
  usage: "!unblacklistchannel [channel]",
  permission: "can_manage",
  signature: {
    channel: ct.textChannel({ option: true }),
  },
  async run({ message: msg, args, pluginData }) {
    const channel = args.channel ?? msg.channel;
    if (!channel.isTextBased() || channel.isDMBased()) return;
    await actualBlacklistRemoveCmd(pluginData, msg, channel);
  },
});

export const TrackerBlacklistListCmd = trackerCmd({
  trigger: ["blacklistedchannels", "blchlist"],
  usage: "!blacklistedchannels",
  permission: "can_manage",
  signature: {},
  async run({ message: msg, pluginData }) {
    await actualBlacklistListCmd(pluginData, msg);
  },
});
