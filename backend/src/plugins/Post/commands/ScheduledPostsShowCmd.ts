import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { postCmd } from "../types.js";
import { actualScheduledPostsShowCmd } from "../util/actualScheduledPostsCmd.js";

export const ScheduledPostsShowCmd = postCmd({
  trigger: ["scheduled_posts", "scheduled_posts show"],
  permission: "can_post",

  signature: {
    num: ct.number(),
  },

  async run({ message: msg, args, pluginData }) {
    await actualScheduledPostsShowCmd(pluginData, msg, args.num);
  },
});
