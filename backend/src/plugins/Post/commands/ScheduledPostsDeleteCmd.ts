import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { postCmd } from "../types.js";
import { actualScheduledPostsDeleteCmd } from "../util/actualScheduledPostsCmd.js";

export const ScheduledPostsDeleteCmd = postCmd({
  trigger: ["scheduled_posts delete", "scheduled_posts d"],
  permission: "can_post",

  signature: {
    num: ct.number(),
  },

  async run({ message: msg, args, pluginData }) {
    await actualScheduledPostsDeleteCmd(pluginData, msg, args.num);
  },
});
