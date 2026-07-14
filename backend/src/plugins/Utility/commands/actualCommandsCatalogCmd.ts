import {
  ActionRowBuilder,
  APIEmbed,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Message,
  MessageComponentInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { GuildPluginData, SlashCommandBlueprint, SlashGroupBlueprint } from "vety";
import { env } from "../../../env.js";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { MINUTES } from "../../../utils.js";
import { UtilityPluginType } from "../types.js";

const COLLECTOR_IDLE = 30 * MINUTES;
const MAX_LINES_PER_PAGE = 18;
const MAX_DESC_LEN = 56;
const EMBED_COLOR = 0x5865f2;

type CatalogEntry = {
  label: string;
  description: string;
};

type SlashEntry = SlashCommandBlueprint<any, any> | SlashGroupBlueprint<any>;

type HelpCategory = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  plugins: string[];
};

/** Help Center categories — shown as a 3-column grid; select a category for command details. */
const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "moderation",
    emoji: "🛡️",
    name: "Moderation",
    description: "Warns, mutes, bans, cases, and enforcement tools.",
    plugins: ["mod_actions", "mutes", "cases", "automod", "censor", "spam", "slowmode", "antinuke"],
  },
  {
    id: "economy",
    emoji: "💰",
    name: "Economy",
    description: "Currency, shops, and virtual economy.",
    plugins: ["economy", "collection"],
  },
  {
    id: "fun",
    emoji: "✨",
    name: "Fun",
    description: "Games, entertainment, and social commands.",
    plugins: ["fun", "social", "music", "nsfw"],
  },
  {
    id: "leveling",
    emoji: "📊",
    name: "Leveling",
    description: "User levels, XP, and progression tracking.",
    plugins: ["leveling"],
  },
  {
    id: "tickets",
    emoji: "🎫",
    name: "Tickets",
    description: "Support tickets and modmail workflows.",
    plugins: ["tickets", "modmail"],
  },
  {
    id: "giveaways",
    emoji: "🎉",
    name: "Giveaways",
    description: "Automated giveaway management.",
    plugins: ["giveaways"],
  },
  {
    id: "welcome",
    emoji: "👋",
    name: "Welcome",
    description: "Member welcome messages and onboarding.",
    plugins: ["welcome_message"],
  },
  {
    id: "community",
    emoji: "👥",
    name: "Community",
    description: "Starboard, tags, posts, reminders, and engagement.",
    plugins: ["starboard", "tags", "post", "reminders", "pingable_roles", "booster_roles"],
  },
  {
    id: "roles",
    emoji: "🎭",
    name: "Roles",
    description: "Reaction roles, role buttons, and self-roles.",
    plugins: ["reaction_roles", "role_buttons", "self_grantable_roles", "roles", "auto_reactions"],
  },
  {
    id: "verify",
    emoji: "✅",
    name: "Verification",
    description: "Member verification and access gating.",
    plugins: ["verify"],
  },
  {
    id: "voice",
    emoji: "🎙️",
    name: "Join to Create",
    description: "Dynamic voice channels and voice utilities.",
    plugins: ["voicemaster", "locate_user", "companion_channels"],
  },
  {
    id: "counters",
    emoji: "🔢",
    name: "Counters",
    description: "Live counters and counter controls.",
    plugins: ["counters"],
  },
  {
    id: "utility",
    emoji: "🔧",
    name: "Utilities",
    description: "Search, info, cleaning, and server tools.",
    plugins: ["utility", "time_and_date", "name_history", "channel_archiver", "message_saver"],
  },
  {
    id: "config",
    emoji: "⚙️",
    name: "Config",
    description: "Logging, persist, aliases, and automation helpers.",
    plugins: ["logs", "persist", "command_aliases", "custom_events", "phisherman", "auto_delete"],
  },
];

function resolvePrefix(originalPrefix: string | RegExp | null | undefined): string {
  if (!originalPrefix) return "";
  return typeof originalPrefix === "string" ? originalPrefix : originalPrefix.source;
}

function resolveTrigger(trigger: string | RegExp | null | undefined): string {
  if (!trigger) return "";
  return typeof trigger === "string" ? trigger : trigger.source;
}

function flattenSlashCommands(entry: SlashEntry, groupPath: string[] = []): CatalogEntry[] {
  if (entry.type === "slash-group") {
    const nextPath = [...groupPath, entry.name];
    const results: CatalogEntry[] = [];
    for (const sub of entry.subcommands) {
      results.push(...flattenSlashCommands(sub, nextPath));
    }
    return results;
  }

  const pathLabel = [...groupPath, entry.name].join(" ");
  return [
    {
      label: `/${pathLabel}`,
      description: entry.description ?? "",
    },
  ];
}

function collectPluginCommandMap(pluginData: GuildPluginData<UtilityPluginType>): Map<string, CatalogEntry[]> {
  const guildData = pluginData.getVetyInstance().getLoadedGuild(pluginData.guild.id)!;
  const byPlugin = new Map<string, CatalogEntry[]>();

  for (const plugin of guildData.loadedPlugins.values()) {
    if (plugin.onlyLoadedAsDependency) continue;

    const entries: CatalogEntry[] = [];

    for (const command of plugin.pluginData.messageCommands.getAll()) {
      const prefix = resolvePrefix(command.originalPrefix);
      const trigger = resolveTrigger(command.originalTriggers[0]);
      if (!trigger) continue;
      entries.push({
        label: `${prefix}${trigger}`,
        description: command.config?.extra?.blueprint?.description ?? "",
      });
    }

    for (const slashEntry of plugin.pluginData.slashCommands.getAll()) {
      entries.push(...flattenSlashCommands(slashEntry));
    }

    if (entries.length === 0) continue;
    entries.sort((a, b) => a.label.localeCompare(b.label));
    byPlugin.set(plugin.blueprint.name, entries);
  }

  return byPlugin;
}

function categoriesWithCommands(byPlugin: Map<string, CatalogEntry[]>): HelpCategory[] {
  return HELP_CATEGORIES.filter((cat) => cat.plugins.some((p) => (byPlugin.get(p)?.length ?? 0) > 0));
}

function entriesForCategory(cat: HelpCategory, byPlugin: Map<string, CatalogEntry[]>): CatalogEntry[] {
  const entries: CatalogEntry[] = [];
  for (const pluginName of cat.plugins) {
    const list = byPlugin.get(pluginName);
    if (list) entries.push(...list);
  }
  entries.sort((a, b) => a.label.localeCompare(b.label));
  return entries;
}

function truncateDesc(description: string): string {
  const trimmed = description.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  if (trimmed.length <= MAX_DESC_LEN) return trimmed;
  return `${trimmed.slice(0, MAX_DESC_LEN - 1)}…`;
}

function formatEntryLine(entry: CatalogEntry): string {
  const desc = truncateDesc(entry.description);
  return desc ? `\`${entry.label}\` — ${desc}` : `\`${entry.label}\``;
}

function chunkEntries(entries: CatalogEntry[]): string[] {
  const pages: string[] = [];
  let lines: string[] = [];

  for (const entry of entries) {
    const line = formatEntryLine(entry);
    if (lines.length >= MAX_LINES_PER_PAGE) {
      pages.push(lines.join("\n"));
      lines = [];
    }
    // Keep under Discord description limit (~4096); stay conservative
    const next = [...lines, line].join("\n");
    if (next.length > 3800 && lines.length > 0) {
      pages.push(lines.join("\n"));
      lines = [line];
    } else {
      lines.push(line);
    }
  }

  if (lines.length > 0) pages.push(lines.join("\n"));
  if (pages.length === 0) pages.push("_No commands in this category._");
  return pages;
}

function buildHomeEmbed(botName: string, categories: HelpCategory[]): APIEmbed {
  return {
    color: EMBED_COLOR,
    title: `🤖 ${botName} Help Center`,
    description: "Your all-in-one Discord companion for moderation, economy, fun, and server management.",
    fields: categories.map((cat) => ({
      name: `${cat.emoji} ${cat.name}`,
      value: cat.description,
      inline: true,
    })),
    footer: { text: "Made with ❤️ • Select a category below to view commands" },
    timestamp: new Date().toISOString(),
  };
}

function buildCategoryEmbed(
  botName: string,
  cat: HelpCategory,
  pageText: string,
  pageIndex: number,
  pageCount: number,
  commandCount: number,
): APIEmbed {
  return {
    color: EMBED_COLOR,
    title: `${cat.emoji} ${cat.name}`,
    description: `${cat.description}\n\n${pageText}`,
    footer: {
      text: `${botName} • Page ${pageIndex + 1}/${pageCount} · ${commandCount} command(s)`,
    },
    timestamp: new Date().toISOString(),
  };
}

function linkButtonsRow(): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>();
  const dashboardUrl = env.DASHBOARD_URL.replace(/\/$/, "");

  row.addComponents(
    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Dashboard").setURL(dashboardUrl),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Documentation")
      .setURL(`${dashboardUrl}/docs`),
  );

  return row;
}

function categorySelectRow(idMod: string, categories: HelpCategory[]): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`commandsCat:${idMod}`)
      .setPlaceholder("Select to view the commands")
      .addOptions(
        categories.slice(0, 25).map((cat) => ({
          label: cat.name,
          description: cat.description.slice(0, 100),
          value: cat.id,
          emoji: cat.emoji,
        })),
      ),
  );
}

function navRow(
  idMod: string,
  pageIndex: number,
  pageCount: number,
  showPager: boolean,
): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setLabel("Home")
      .setCustomId(`commandsHome:${idMod}`),
  );

  if (showPager) {
    row.addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("⬅")
        .setCustomId(`commandsPrev:${idMod}`)
        .setDisabled(pageIndex <= 0),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("➡")
        .setCustomId(`commandsNext:${idMod}`)
        .setDisabled(pageIndex >= pageCount - 1),
    );
  }

  return row;
}

export async function actualCommandsCatalogCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
) {
  const byPlugin = collectPluginCommandMap(pluginData);
  const categories = categoriesWithCommands(byPlugin);
  const botName = pluginData.client.user?.username ?? "Alice";
  const authorId = isContextInteraction(context) ? context.user.id : context.author.id;
  const isSlash = isContextInteraction(context);

  if (categories.length === 0) {
    const empty = { embeds: [{ color: EMBED_COLOR, title: `🤖 ${botName} Help Center`, description: "No command categories available." }] };
    if (isSlash) {
      await sendContextResponse(context, empty, false);
    } else if (context.channel.isSendable()) {
      await context.channel.send(empty);
    }
    return;
  }

  const pendingIdMod = `pending:${Date.now()}`;
  const homeEmbed = buildHomeEmbed(botName, categories);
  const initialComponents = [linkButtonsRow(), categorySelectRow(pendingIdMod, categories)];

  let replyMsg: Message;
  if (isSlash) {
    replyMsg = await sendContextResponse(
      context,
      { embeds: [homeEmbed], components: initialComponents },
      false,
    );
  } else if (context.channel.isSendable()) {
    replyMsg = await context.channel.send({ embeds: [homeEmbed], components: initialComponents });
  } else {
    return;
  }

  const idMod = `${replyMsg.id}:${Date.now()}`;

  // Refresh select customId with stable idMod after we have the message id
  if (isSlash) {
    replyMsg = await (context as ChatInputCommandInteraction).editReply({
      embeds: [homeEmbed],
      components: [linkButtonsRow(), categorySelectRow(idMod, categories)],
    });
  } else {
    replyMsg = await replyMsg.edit({
      embeds: [homeEmbed],
      components: [linkButtonsRow(), categorySelectRow(idMod, categories)],
    });
  }

  type ViewState =
    | { view: "home" }
    | { view: "category"; categoryId: string; pageIndex: number };

  let state: ViewState = { view: "home" };

  const buildCategoryPayload = (categoryId: string, pageIndex: number) => {
    const cat = categories.find((c) => c.id === categoryId)!;
    const entries = entriesForCategory(cat, byPlugin);
    const pages = chunkEntries(entries);
    const safePage = Math.max(0, Math.min(pageIndex, pages.length - 1));
    return {
      embeds: [buildCategoryEmbed(botName, cat, pages[safePage]!, safePage, pages.length, entries.length)],
      components: [
        navRow(idMod, safePage, pages.length, pages.length > 1),
        categorySelectRow(idMod, categories),
      ],
      pageCount: pages.length,
      pageIndex: safePage,
    };
  };

  const collector = replyMsg.createMessageComponentCollector({ time: COLLECTOR_IDLE });

  collector.on("collect", async (interaction: MessageComponentInteraction) => {
    if (interaction.user.id !== authorId) {
      await interaction
        .reply({ content: "You are not permitted to use these controls.", ephemeral: true })
        .catch(() => undefined);
      return;
    }

    collector.resetTimer();

    if (interaction.isStringSelectMenu() && interaction.customId === `commandsCat:${idMod}`) {
      const categoryId = (interaction as StringSelectMenuInteraction).values[0]!;
      state = { view: "category", categoryId, pageIndex: 0 };
      const payload = buildCategoryPayload(categoryId, 0);
      await interaction.update({ embeds: payload.embeds, components: payload.components }).catch(() => undefined);
      return;
    }

    if (!interaction.isButton()) return;

    if (interaction.customId === `commandsHome:${idMod}`) {
      state = { view: "home" };
      await interaction
        .update({
          embeds: [homeEmbed],
          components: [linkButtonsRow(), categorySelectRow(idMod, categories)],
        })
        .catch(() => undefined);
      return;
    }

    if (state.view !== "category") {
      await interaction.deferUpdate().catch(() => undefined);
      return;
    }

    if (interaction.customId === `commandsPrev:${idMod}` && state.pageIndex > 0) {
      state = { ...state, pageIndex: state.pageIndex - 1 };
    } else if (interaction.customId === `commandsNext:${idMod}`) {
      const preview = buildCategoryPayload(state.categoryId, state.pageIndex);
      if (state.pageIndex < preview.pageCount - 1) {
        state = { ...state, pageIndex: state.pageIndex + 1 };
      }
    }

    const payload = buildCategoryPayload(state.categoryId, state.pageIndex);
    state = { view: "category", categoryId: state.categoryId, pageIndex: payload.pageIndex };
    await interaction.update({ embeds: payload.embeds, components: payload.components }).catch(() => undefined);
  });

  collector.on("end", async () => {
    try {
      if (isSlash) {
        await (context as ChatInputCommandInteraction).deleteReply();
      } else {
        await replyMsg.delete();
      }
    } catch {
      // ignore
    }
  });
}
