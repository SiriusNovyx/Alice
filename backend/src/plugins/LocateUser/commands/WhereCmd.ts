import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { locateUserCmd } from "../types.js";
import { actualWhereCmd } from "./actualWhereCmd.js";

export const WhereCmd = locateUserCmd({
  trigger: ["where", "w"],
  description: "Posts an instant invite to the voice channel that `<member>` is in",
  usage: "!w <user>",
  permission: "can_where",

  signature: {
    member: ct.resolvedMember(),
  },

  async run({ message: msg, args, pluginData }) {
    await actualWhereCmd(pluginData, msg, msg.author.id, args.member);
  },
});
