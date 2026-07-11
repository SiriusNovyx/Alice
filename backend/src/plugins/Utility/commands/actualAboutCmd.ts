import { APIEmbed, ChatInputCommandInteraction, GuildChannel, Message } from "discord.js";
import { shuffle } from "lodash-es";
import moment from "moment-timezone";
import { accessSync, readFileSync } from "node:fs";
import { GuildPluginData } from "vety";
import { rootDir } from "../../../paths.js";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { getBotStartTime } from "../../../uptime.js";
import { resolveMember, sorter } from "../../../utils.js";
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

export async function actualAboutCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
) {
  const timeAndDate = pluginData.getPlugin(TimeAndDatePlugin);
  const botStartTime = getBotStartTime();
  const buildTimeMoment = buildTime ? moment.utc(buildTime, "YYYY-MM-DDTHH:mm:ss[Z]") : null;

  const basicInfoRows = [
    ["Bot start time", `<t:${Math.floor(botStartTime / 1000)}:R>`],
    ["Last config reload", `<t:${Math.floor(pluginData.state.lastReload / 1000)}:R>`],
    ["Last bot update", buildTimeMoment ? `<t:${Math.floor(buildTimeMoment.unix())}:f>` : "Unknown"],
    ["Version", commitHash?.slice(0, 7) || "Unknown"],
    ["API latency", `${pluginData.client.ws.ping}ms`],
    ["Server timezone", timeAndDate.getGuildTz()],
  ];

  const loadedPlugins = Array.from(
    pluginData.getVetyInstance().getLoadedGuild(pluginData.guild.id)!.loadedPlugins.keys(),
  );
  loadedPlugins.sort();

  const aboutEmbed: APIEmbed = {
    title: `About ${pluginData.client.user!.username}`,
    fields: [
      {
        name: "Status",
        value: basicInfoRows.map(([label, value]) => `${label}: **${value}**`).join("\n"),
      },
      {
        name: `Loaded plugins on this server (${loadedPlugins.length})`,
        value: loadedPlugins.join(", "),
      },
    ],
  };

  const supporters = await pluginData.state.supporters.getAll();
  const shuffledSupporters = shuffle(supporters);

  if (supporters.length) {
    const formattedSupporters = shuffledSupporters
      .map((s, i) => (i % 2 === 0 ? `**${s.name}**` : `__${s.name}__`))
      .join(" ");

    aboutEmbed.fields!.push({
      name: "Zeppelin supporters 🎉",
      value: "These amazing people have supported Zeppelin development:\n\n" + formattedSupporters,
      inline: false,
    });
  }

  const channel =
    isContextInteraction(context) ? context.channel : context.channel;
  const botMember = await resolveMember(pluginData.client, pluginData.guild, pluginData.client.user!.id);
  let botRoles =
    botMember?.roles.cache.map((r) => (channel as GuildChannel | null)?.guild.roles.cache.get(r.id)!) || [];
  botRoles = botRoles.filter((r) => !!r);
  botRoles = botRoles.filter((r) => r.color);
  botRoles.sort(sorter("position", "DESC"));
  if (botRoles.length) {
    aboutEmbed.color = botRoles[0].color;
  }

  if (pluginData.client.user!.displayAvatarURL()) {
    aboutEmbed.thumbnail = { url: pluginData.client.user!.displayAvatarURL()! };
  }

  if (isContextInteraction(context)) {
    await sendContextResponse(context, { embeds: [aboutEmbed] }, false);
  } else if (context.channel.isSendable()) {
    await context.channel.send({ embeds: [aboutEmbed] });
  }
}
