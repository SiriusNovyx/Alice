import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { utilityCmd } from "../types.js";
import { actualSnowflakeInfoCmd } from "./actualInfoCmds.js";

export const SnowflakeInfoCmd = utilityCmd({
  trigger: ["snowflake", "snowflakeinfo"],
  description: "Show information about a snowflake ID",
  usage: "!snowflake <id>",
  permission: "can_snowflake",

  signature: {
    id: ct.anyId(),
  },

  async run({ message, args }) {
    await actualSnowflakeInfoCmd(message, args.id);
  },
});
