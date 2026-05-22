import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { TemplateParseError, parseTemplate } from "../../../templateFormatter.js";
import { tagsCmd } from "../types.js";

export const TagCreateCmd = tagsCmd({
  trigger: "tag",
  usage: "!tag <name> <content>",
  permission: "can_create",

  signature: {
    tag: ct.string(),
    body: ct.string({ catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
<<<<<<< HEAD
    // Validate tag name: no spaces, max 50 chars, only alphanumeric/hyphen/underscore
    if (args.tag.length > 50) {
      void pluginData.state.common.sendErrorMessage(msg, "Tag name must be 50 characters or less");
      return;
    }
    if (!/^[a-z0-9_-]+$/i.test(args.tag)) {
      void pluginData.state.common.sendErrorMessage(
        msg,
        "Tag name can only contain letters, numbers, hyphens, and underscores (no spaces)",
      );
      return;
    }

=======
>>>>>>> a0a54da391085c24c9e28ad6ab2874adc81600a7
    try {
      parseTemplate(args.body);
    } catch (e) {
      if (e instanceof TemplateParseError) {
        void pluginData.state.common.sendErrorMessage(msg, `Invalid tag syntax: ${e.message}`);
        return;
      } else {
        throw e;
      }
    }

    await pluginData.state.tags.createOrUpdate(args.tag, args.body, msg.author.id);

    const prefix = pluginData.config.get().prefix;
    void pluginData.state.common.sendSuccessMessage(msg, `Tag set! Use it with: \`${prefix}${args.tag}\``);
  },
});
