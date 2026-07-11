import { guildPluginMessageCommand } from "vety";
import { CountersPluginType } from "../types.js";
import { actualCountersListCmd } from "./actualCountersCmds.js";

export const CountersListCmd = guildPluginMessageCommand<CountersPluginType>()({
  trigger: ["counters list", "counter list", "counters"],
  permission: "can_view",

  signature: {},

  async run({ pluginData, message }) {
    await actualCountersListCmd(pluginData, message);
  },
});
