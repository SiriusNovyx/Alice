import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { UnknownUser } from "../../../utils.js";
import { formatAvatarEmbed } from "../functions/formatUtilityReplies.js";
import { utilityCmd } from "../types.js";

export const AvatarCmd = utilityCmd({
  trigger: ["avatar", "av"],
  description: "Retrieves a user's profile picture",
  permission: "can_avatar",

  signature: {
    user: ct.resolvedUserLoose({ required: false }),
  },

  async run({ message: msg, args, pluginData }) {
    const user = args.user ?? msg.member ?? msg.author;
    if (!(user instanceof UnknownUser)) {
      await msg.channel.send({ embeds: [formatAvatarEmbed(user)] });
    } else {
      void pluginData.state.common.sendErrorMessage(msg, "Invalid user ID");
    }
  },
});
