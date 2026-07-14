import { ChatInputCommandInteraction, Message, SendableChannels } from "discord.js";
import { GuildPluginData, LoadedGuildPlugin, PluginCommandDefinition } from "vety";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { chunkMessageLines, createChunkedMessage } from "../../../utils.js";
import { UtilityPluginType } from "../types.js";

type HelpHit =
  | {
      kind: "message";
      plugin: LoadedGuildPlugin<any>;
      command: PluginCommandDefinition;
    }
  | {
      kind: "slash";
      plugin: LoadedGuildPlugin<any>;
      label: string;
      description: string;
      permission: string;
    };

function resolvePrefix(originalPrefix: string | RegExp | null | undefined): string {
  if (!originalPrefix) return "";
  return typeof originalPrefix === "string" ? originalPrefix : originalPrefix.source;
}

function resolveTrigger(trigger: string | RegExp | null | undefined): string {
  if (!trigger) return "";
  return typeof trigger === "string" ? trigger : trigger.source;
}

function flattenSlash(
  entry: any,
  groupPath: string[] = [],
): Array<{ label: string; description: string; permission: string }> {
  if (entry?.type === "slash-group" || entry?.subcommands?.length) {
    const nextPath = [...groupPath, entry.name];
    const results: Array<{ label: string; description: string; permission: string }> = [];
    for (const sub of entry.subcommands ?? []) {
      results.push(...flattenSlash(sub, nextPath));
    }
    return results;
  }

  const label = `/${[...groupPath, entry.name].join(" ")}`;
  return [
    {
      label,
      description: entry.description ?? "",
      permission: entry.configPermission ?? entry.permission ?? "",
    },
  ];
}

export async function actualHelpCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  commandSearch: string,
) {
  const searchStr = commandSearch.toLowerCase().trim();
  const matchingCommands: HelpHit[] = [];

  const guildData = pluginData.getVetyInstance().getLoadedGuild(pluginData.guild.id)!;
  for (const plugin of guildData.loadedPlugins.values()) {
    if (plugin.onlyLoadedAsDependency) continue;

    for (const registeredCommand of plugin.pluginData.messageCommands.getAll()) {
      let matched = false;
      for (const trigger of registeredCommand.originalTriggers) {
        const strTrigger = typeof trigger === "string" ? trigger : trigger.source;
        if (strTrigger.toLowerCase().includes(searchStr)) {
          matchingCommands.push({ kind: "message", plugin, command: registeredCommand });
          matched = true;
          break;
        }
      }
      if (matched) continue;

      const description: string = registeredCommand.config?.extra?.blueprint?.description ?? "";
      if (description.toLowerCase().includes(searchStr)) {
        matchingCommands.push({ kind: "message", plugin, command: registeredCommand });
      }
    }

    for (const slashEntry of plugin.pluginData.slashCommands.getAll()) {
      for (const flat of flattenSlash(slashEntry)) {
        const haystack = `${flat.label} ${flat.description}`.toLowerCase();
        if (haystack.includes(searchStr)) {
          matchingCommands.push({
            kind: "slash",
            plugin,
            label: flat.label,
            description: flat.description,
            permission: flat.permission,
          });
        }
      }
    }
  }

  if (matchingCommands.length === 0) {
    const err =
      `❌ No commands found matching \`${searchStr}\`.\n` +
      `Try a shorter name, or run \`/commands\` / \`commands\` for the full compact list.`;
    if (isContextInteraction(context)) {
      await sendContextResponse(context, err, true);
    } else if (context.channel.isSendable()) {
      await context.channel.send(err);
    }
    return;
  }

  const totalResults = matchingCommands.length;
  const limitedResults = matchingCommands.slice(0, 8);

  const snippets = limitedResults.map((hit) => {
    if (hit.kind === "message") {
      const { plugin, command } = hit;
      const prefix = resolvePrefix(command.originalPrefix);
      const trigger = resolveTrigger(command.originalTriggers[0]);
      const description: string = command.config?.extra?.blueprint?.description ?? "";
      const usage: string = command.config?.extra?.blueprint?.usage ?? `${prefix}${trigger}`;

      const lines: string[] = [];
      lines.push(`**${prefix}${trigger}**`);
      lines.push(`📋 ${description || "_No description set_"}`);
      lines.push(`📝 Usage: \`${usage}\``);
      lines.push(`🔌 Plugin: \`${plugin.blueprint.name}\``);
      return lines.join("\n");
    }

    const lines: string[] = [];
    lines.push(`**${hit.label}**`);
    lines.push(`📋 ${hit.description || "_No description set_"}`);
    if (hit.permission) lines.push(`🔐 Permission: \`${hit.permission}\``);
    lines.push(`🔌 Plugin: \`${hit.plugin.blueprint.name}\``);
    return lines.join("\n");
  });

  let message = "";
  if (totalResults > limitedResults.length) {
    message += `Found **${totalResults}** commands — showing first **${limitedResults.length}**. Be more specific, or use \`/commands\`.\n\n`;
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
