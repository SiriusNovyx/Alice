import { postCmd } from "../types.js";
import { actualScheduledPostsListCmd } from "../util/actualScheduledPostsCmd.js";

export const ScheduledPostsListCmd = postCmd({
  trigger: ["scheduled_posts", "scheduled_posts list"],
  permission: "can_post",

  async run({ message: msg, pluginData }) {
    await actualScheduledPostsListCmd(pluginData, msg);
  },
});
