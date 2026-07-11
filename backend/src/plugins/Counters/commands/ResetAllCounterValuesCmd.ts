import { guildPluginMessageCommand } from "vety";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { confirm, trimMultilineString } from "../../../utils.js";
import { CountersPluginType } from "../types.js";
import { actualResetAllCounterValuesCmd } from "./actualCountersCmds.js";

export const ResetAllCounterValuesCmd = guildPluginMessageCommand<CountersPluginType>()({
  trigger: ["counters reset_all"],
  permission: "can_reset_all",

  signature: {
    counterName: ct.string(),
  },

  async run({ pluginData, message, args }) {
    const confirmed = await confirm(message, message.author.id, {
      content: trimMultilineString(`
        Do you want to reset **ALL** values for counter **${args.counterName}**?
        This will reset the counter for **all** users and channels.
        **Note:** This will *not* trigger any triggers or counter triggers.
      `),
    });

    await actualResetAllCounterValuesCmd(pluginData, message, args.counterName, confirmed);
  },
});
