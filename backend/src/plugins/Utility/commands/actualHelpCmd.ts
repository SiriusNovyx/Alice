import { ChatInputCommandInteraction, Message, SendableChannels } from "discord.js";
import { GuildPluginData, LoadedGuildPlugin, PluginCommandDefinition } from "vety";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { chunkMessageLines, createChunkedMessage } from "../../../utils.js";
import { UtilityPluginType } from "../types.js";

export async function actualHelpCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  commandSearch: string,
) {
  const searchStr = commandSearch.toLowerCase().trim();

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
    const err = `❌ No commands found matching \`${searchStr}\`. Try \`!help warn\` or \`!help ban\`.`;
    if (isContextInteraction(context)) {
      await sendContextResponse(context, err, true);
    } else if (context.channel.isSendable()) {
      await context.channel.send(err);
    }
    return;
  }

  const totalResults = matchingCommands.length;
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
    const usage: string = command.config?.extra?.blueprint?.usage ?? `${prefix}${trigger}`;

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

  if (isContextInteraction(context)) {
    const chunks = chunkMessageLines(message);
    await sendContextResponse(context, chunks[0]!, true);
    for (const chunk of chunks.slice(1)) {
      await context.followUp({ content: chunk, ephemeral: true });
    }
  } else if (context.channel.isSendable()) {
    await createChunkedMessage(context.channel as SendableChannels, message);
  }
}
