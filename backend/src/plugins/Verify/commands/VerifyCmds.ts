import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { verifyCmd } from "../types.js";
import { actualSetupPanelCmd, actualSubmitCmd } from "./actualVerifyCmds.js";

export const VerifySetupCmd = verifyCmd({
  trigger: ["verifypanel", "verify-setup"],
  usage: "!verifypanel <channel>",
  permission: "can_setup",
  signature: {
    channel: ct.guildTextBasedChannel(),
  },
  async run({ message: msg, args, pluginData }) {
    await actualSetupPanelCmd(pluginData, msg, args.channel.id);
  },
});

export const VerifySubmitCmd = verifyCmd({
  trigger: ["verify"],
  usage: "!verify <code>",
  permission: "can_submit",
  signature: {
    code: ct.string(),
  },
  async run({ message: msg, args, pluginData }) {
    if (!msg.member) return;
    await actualSubmitCmd(pluginData, msg, msg.member, args.code);
  },
});
