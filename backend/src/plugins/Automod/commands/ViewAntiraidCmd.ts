import { automodMsgCmd } from "../types.js";
import { actualViewAntiraidCmd } from "./actualViewAntiraidCmd.js";

export const ViewAntiraidCmd = automodMsgCmd({
  // Longer trigger first so `!antiraid view` is not stolen by SetAntiraidCmd as level "view".
  trigger: ["antiraid view", "antiraid"],
  // Allow set permission too: staff with can_set_antiraid should always be able to read the level.
  permission: null,
  config: {
    preFilters: [
      async (_cmd, context) => {
        const config = await context.pluginData.config.getForMessage(context.message);
        return Boolean(config.can_view_antiraid || config.can_set_antiraid);
      },
    ],
  },

  async run({ pluginData, message }) {
    await actualViewAntiraidCmd(pluginData, message);
  },
});
