import { env } from "../../../env.js";
import { getGuildPrefix } from "../../../utils/getGuildPrefix.js";
import { infoPanel, linkRow } from "../../../utils/xeonStylePanels.js";
import { utilityEvt } from "../types.js";

function botInviteUrl(): string {
  return `https://discord.com/oauth2/authorize?client_id=${env.CLIENT_ID}&permissions=8&scope=bot+applications.commands`;
}

function supportUrl(): string {
  return env.DASHBOARD_URL.replace(/\/$/, "");
}

export const MentionReplyEvt = utilityEvt({
  event: "messageCreate",

  async listener({ pluginData, args: { message } }) {
    if (!message.inGuild() || message.author.bot || !pluginData.client.user) {
      return;
    }

    const botId = pluginData.client.user.id;
    const stripped = message.content.trim();
    if (stripped !== `<@${botId}>` && stripped !== `<@!${botId}>`) {
      return;
    }

    if (!message.channel.isSendable()) {
      return;
    }

    const prefix = getGuildPrefix(pluginData);
    const botName = pluginData.client.user.username;

    const panel = infoPanel({
      title: `Hey, I'm ${botName}`,
      body: [
        `**Server prefix:** \`${prefix}\``,
        `**Get started:** Run \`${prefix}help\` to discover features`,
        `**Dashboard:** Manage the bot at [the dashboard](${supportUrl()})`,
      ].join("\n"),
      footer: "Alice is free for all servers — no premium paywall.",
      thumbnailUrl: pluginData.client.user.displayAvatarURL() || undefined,
      components: [linkRow(botInviteUrl(), supportUrl())],
    });

    try {
      await message.channel.send(panel);
    } catch {
      // Missing Send Messages / Embed Links — ignore
    }
  },
});
