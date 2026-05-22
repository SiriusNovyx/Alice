import { LoadedGuildPlugin, PluginCommandDefinition } from "vety";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { createChunkedMessage } from "../../../utils.js";
import { utilityCmd } from "../types.js";

export const HelpCmd = utilityCmd({
  trigger: "help",
  description: "Show usage information for one or more commands",
  usage: "!help warn",
  permission: "can_help",

  signature: {
    command: ct.string({ catchAll: true }),
  },

  async run({ message: msg, args, pluginData }) {
    const searchStr = args.command.toLowerCase().trim();

    const matchingCommands: Array<{
      plugin: LoadedGuildPlugin<any>;
      command: PluginCommandDefinition;
    }> = [];

    const guildData = pluginData.getVetyInstance().getLoadedGuild(pluginData.guild.id)!;
    for (const plugin of guildData.loadedPlugins.values()) {
      for (const registeredCommand of plugin.pluginData.messageCommands.getAll()) {
        for (const trigger of registeredCommand.originalTriggers) {
          const strTrigger = typeof trigger === "string" ? trigger : trigger.source;
          if (strTrigger.toLowerCase().startsWith(searchStr)) {
            matchingCommands.push({ plugin, command: registeredCommand });
            break;
          }
        }
      }
    }

    if (matchingCommands.length === 0) {
      void msg.channel.send(`❌ No commands found matching \`${searchStr}\`. Try \`!help warn\` or \`!help ban\`.`);
      return;
    }

    const totalResults   = matchingCommands.length;
    const limitedResults = matchingCommands.slice(0, 5);

    const snippets = limitedResults.map(({ plugin, command }) => {
      const prefix = command.originalPrefix
        ? typeof command.originalPrefix === "string"
          ? command.originalPrefix
          : command.originalPrefix.source
        : "";

      const originalTrigger = command.originalTriggers[0];
      const trigger = originalTrigger
        ? typeof originalTrigger === "string"
          ? originalTrigger
          : originalTrigger.source
        : "";

      const description: string = command.config?.extra?.blueprint?.description ?? "";
      const usage: string       = command.config?.extra?.blueprint?.usage ?? `${prefix}${trigger}`;

      const lines: string[] = [];
      lines.push(`**${prefix}${trigger}**`);
      if (description) lines.push(`📋 ${description}`);
      lines.push(`📝 Usage: \`${usage}\``);
      lines.push(`🔌 Plugin: \`${plugin.blueprint.name}\``);

      return lines.join("\n");
    });

    let message = "";
    if (totalResults > limitedResults.length) {
      message += `Found **${totalResults}** commands — showing first **${limitedResults.length}**. Be more specific to narrow results.\n\n`;
    }
    message += snippets.join("\n\n");

    void createChunkedMessage(msg.channel, message);
  },
});