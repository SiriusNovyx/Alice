import { Message, Snowflake } from "discord.js";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { resolveMessageMember } from "../../../pluginUtils.js";
import { utilityCmd } from "../types.js";
import { actualCleanCmd } from "./actualCleanCmd.js";

const opts = {
  user: ct.userId({ option: true, shortcut: "u" }),
  channel: ct.channelId({ option: true, shortcut: "c" }),
  bots: ct.switchOption({ def: false, shortcut: "b" }),
  "delete-pins": ct.switchOption({ def: false, shortcut: "p" }),
  "has-invites": ct.switchOption({ def: false, shortcut: "i" }),
  match: ct.regex({ option: true, shortcut: "m" }),
  "to-id": ct.anyId({ option: true, shortcut: "id" }),
};

export const CleanCmd = utilityCmd({
  trigger: ["clean", "clear"],
  description: "Remove a number of recent messages",
  usage: "!clean <count>",
  permission: "can_clean",

  signature: [
    {
      count: ct.number(),
      update: ct.number({ option: true, shortcut: "up" }),

      ...opts,
    },
    {
      count: ct.number(),
      update: ct.switchOption({ def: false, shortcut: "up" }),

      ...opts,
    },
  ],

  async run({ message: msg, args, pluginData }) {
    const authorMember = await resolveMessageMember(msg);

    let update: number | true | null = null;
    if (typeof args.update === "number") {
      update = args.update;
    } else if (args.update) {
      update = true;
    }

    await actualCleanCmd(pluginData, msg as Message, msg.author, authorMember, {
      count: args.count,
      channelId: args.channel as Snowflake | undefined,
      userId: args.user,
      bots: args.bots,
      deletePins: args["delete-pins"],
      hasInvites: args["has-invites"],
      match: args.match,
      toId: args["to-id"],
      update,
    });
  },
});
