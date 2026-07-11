import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { resolveMessageMember } from "../../../pluginUtils.js";
import { tagsCmd } from "../types.js";
import { actualTagEvalCmd } from "./actualTagEvalCmd.js";

export const TagEvalCmd = tagsCmd({
  trigger: "tag eval",
  permission: "can_create",

  signature: {
    body: ct.string({ catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
    const authorMember = await resolveMessageMember(msg);
    await actualTagEvalCmd(pluginData, msg, msg.author, authorMember, args.body);
  },
});
