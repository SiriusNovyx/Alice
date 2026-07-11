import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { mutesCmd } from "../types.js";
import { actualMutesListCmd } from "./actualMutesListCmd.js";

export const MutesCmd = mutesCmd({
  trigger: "mutes",
  permission: "can_view_list",

  signature: {
    age: ct.delay({
      option: true,
      shortcut: "a",
    }),

    left: ct.switchOption({ def: false, shortcut: "l" }),
    manual: ct.switchOption({ def: false, shortcut: "m" }),
    export: ct.switchOption({ def: false, shortcut: "e" }),
  },

  async run({ pluginData, message: msg, args }) {
    await actualMutesListCmd(pluginData, msg, msg.author.id, {
      age: args.age,
      left: args.left,
      manual: args.manual,
      export: args.export,
    });
  },
});
