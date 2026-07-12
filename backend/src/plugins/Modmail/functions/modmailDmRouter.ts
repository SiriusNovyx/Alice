import {
  ActionRowBuilder,
  Message,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { GuildPluginData } from "vety";
import { ModmailPluginType } from "../types.js";
import { relayUserMessage } from "./modmailFlow.js";

/**
 * Coordinates DM handling across guild plugin instances so a single user DM
 * does not open threads in every guild that has modmail enabled.
 */
const registered = new Map<string, GuildPluginData<ModmailPluginType>>();
let listenerAttached = false;
let sharedClient: GuildPluginData<ModmailPluginType>["client"] | null = null;

const handlingUsers = new Set<string>();

async function onDmMessage(message: Message): Promise<void> {
  if (message.author.bot || message.guild) return;
  if (!message.content && message.attachments.size === 0) return;
  if (handlingUsers.has(message.author.id)) return;
  handlingUsers.add(message.author.id);

  try {
    const eligible: GuildPluginData<ModmailPluginType>[] = [];

    for (const pluginData of registered.values()) {
      const config = pluginData.config.get();
      if (!config.enabled || !config.category_id) continue;

      if (await pluginData.state.blacklist.isBlacklisted(message.author.id)) continue;

      const member = await pluginData.guild.members.fetch(message.author.id).catch(() => null);
      if (!member) continue;

      eligible.push(pluginData);
    }

    if (eligible.length === 0) return;

    // Prefer a guild that already has an open thread for this user
    for (const pluginData of eligible) {
      const open = await pluginData.state.threads.findOpenByUser(message.author.id);
      if (open) {
        await relayUserMessage(pluginData, message);
        return;
      }
    }

    if (eligible.length === 1) {
      await relayUserMessage(eligible[0], message);
      return;
    }

    const options = eligible.slice(0, 25).map((pd) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(pd.guild.name.slice(0, 100))
        .setDescription(`Contact staff in ${pd.guild.name}`.slice(0, 100))
        .setValue(pd.guild.id),
    );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("mm_guild_select")
        .setPlaceholder("Select a server…")
        .addOptions(options),
    );

    const prompt = await message.author
      .send({
        content:
          "You are in multiple servers with modmail enabled. Select which server to contact — your message will be forwarded there.",
        components: [row],
      })
      .catch(() => null);

    if (!prompt) return;

    const interaction = await prompt
      .awaitMessageComponent({
        filter: (i) => i.user.id === message.author.id && i.customId === "mm_guild_select",
        time: 60_000,
      })
      .catch(() => null);

    await prompt.edit({ components: [] }).catch(() => null);
    if (!interaction || !interaction.isStringSelectMenu()) {
      await message.author.send("Server selection timed out. DM again to retry.").catch(() => null);
      return;
    }

    await interaction.deferUpdate().catch(() => null);
    const selected = eligible.find((pd) => pd.guild.id === interaction.values[0]);
    if (selected) {
      await relayUserMessage(selected, message);
    }
  } finally {
    handlingUsers.delete(message.author.id);
  }
}

export function registerModmailGuild(pluginData: GuildPluginData<ModmailPluginType>): void {
  registered.set(pluginData.guild.id, pluginData);
  sharedClient = pluginData.client;

  if (!listenerAttached) {
    listenerAttached = true;
    pluginData.client.on("messageCreate", onDmMessage);
  }
}

export function unregisterModmailGuild(guildId: string): void {
  registered.delete(guildId);
  if (registered.size === 0 && listenerAttached && sharedClient) {
    sharedClient.off("messageCreate", onDmMessage);
    listenerAttached = false;
    sharedClient = null;
  }
}
