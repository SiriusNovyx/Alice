import { ChatInputCommandInteraction, EmbedBuilder, GuildChannel, Message } from "discord.js";
import { shuffle } from "lodash-es";
import moment from "moment-timezone";
import { accessSync, readFileSync } from "node:fs";
import { GuildPluginData } from "vety";
import { env } from "../../../env.js";
import { rootDir } from "../../../paths.js";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { getBotStartTime } from "../../../uptime.js";
import { resolveMember, sorter } from "../../../utils.js";
import { infoPanel, linkRow } from "../../../utils/xeonStylePanels.js";
import { TimeAndDatePlugin } from "../../TimeAndDate/TimeAndDatePlugin.js";
import { UtilityPluginType } from "../types.js";

let commitHash: string | null = null;
try {
  accessSync(`${rootDir}/.commit-hash`);
  commitHash = readFileSync(`${rootDir}/.commit-hash`, "utf-8").trim();
} catch {}

let buildTime: string | null = null;
try {
  accessSync(`${rootDir}/.build-time`);
  buildTime = readFileSync(`${rootDir}/.build-time`, "utf-8").trim();
} catch {}

function botInviteUrl(): string {
  return `https://discord.com/oauth2/authorize?client_id=${env.CLIENT_ID}&permissions=8&scope=bot+applications.commands`;
}

function supportUrl(): string {
  return env.DASHBOARD_URL.replace(/\/$/, "");
}

export async function actualAboutCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
) {
  const timeAndDate = pluginData.getPlugin(TimeAndDatePlugin);
  const botStartTime = getBotStartTime();
  const buildTimeMoment = buildTime ? moment.utc(buildTime, "YYYY-MM-DDTHH:mm:ss[Z]") : null;
  const guildCount = pluginData.client.guilds.cache.size;

  const statusLines = [
    `**Uptime:** <t:${Math.floor(botStartTime / 1000)}:R>`,
    `**Servers:** ${guildCount}`,
    `**API latency:** ${pluginData.client.ws.ping}ms`,
    `**Last config reload:** <t:${Math.floor(pluginData.state.lastReload / 1000)}:R>`,
    `**Last bot update:** ${buildTimeMoment ? `<t:${Math.floor(buildTimeMoment.unix())}:f>` : "Unknown"}`,
    `**Version:** ${commitHash?.slice(0, 7) || "Unknown"}`,
    `**Server timezone:** ${timeAndDate.getGuildTz()}`,
  ];

  const loadedPlugins = Array.from(
    pluginData.getVetyInstance().getLoadedGuild(pluginData.guild.id)!.loadedPlugins.keys(),
  );
  loadedPlugins.sort();

  const panel = infoPanel({
    title: `About ${pluginData.client.user!.username}`,
    body: statusLines.join("\n"),
    footer: "Alice is free for all servers — no premium paywall.",
    thumbnailUrl: pluginData.client.user!.displayAvatarURL() || undefined,
    components: [linkRow(botInviteUrl(), supportUrl())],
  });

  const embed = EmbedBuilder.from(panel.embeds![0]!).addFields({
    name: `Loaded plugins on this server (${loadedPlugins.length})`,
    value: loadedPlugins.join(", ") || "_None_",
  });

  const supporters = await pluginData.state.supporters.getAll();
  if (supporters.length) {
    const shuffledSupporters = shuffle(supporters);
    const formattedSupporters = shuffledSupporters
      .map((s, i) => (i % 2 === 0 ? `**${s.name}**` : `__${s.name}__`))
      .join(" ");

    embed.addFields({
      name: "Alice supporters 🎉",
      value: "These amazing people have supported Alice development:\n\n" + formattedSupporters,
      inline: false,
    });
  }

  const channel = isContextInteraction(context) ? context.channel : context.channel;
  const botMember = await resolveMember(pluginData.client, pluginData.guild, pluginData.client.user!.id);
  let botRoles =
    botMember?.roles.cache.map((r) => (channel as GuildChannel | null)?.guild.roles.cache.get(r.id)!) || [];
  botRoles = botRoles.filter((r) => !!r);
  botRoles = botRoles.filter((r) => r.color);
  botRoles.sort(sorter("position", "DESC"));
  if (botRoles.length) {
    embed.setColor(botRoles[0].color);
  }

  const payload = { ...panel, embeds: [embed] };

  if (isContextInteraction(context)) {
    await sendContextResponse(context, payload, false);
  } else if (context.channel.isSendable()) {
    await context.channel.send(payload);
  }
}
