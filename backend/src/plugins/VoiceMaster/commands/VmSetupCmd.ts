import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { voiceMasterCmd } from "../types.js";
import { actualSetupCmd } from "./actualSetupCmd.js";

export const VmSetupCmd = voiceMasterCmd({
  trigger: ["vm-setup", "voicemaster-setup"],
  usage: "!vm-setup <hub-channel-id> [category-id]",
  permission: "can_setup",

  signature: {
    hubChannelId: ct.anyId(),
    categoryId: ct.anyId({ required: false }),
  },

  async run({ message: msg, args, pluginData }) {
    await actualSetupCmd(pluginData, msg, args.hubChannelId, args.categoryId ?? null);
  },
});
