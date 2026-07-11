import { GuildChannel, TextChannel } from "discord.js";
import { humanizeDuration } from "../../../humanizeDuration.js";
import { slowmodeSlashCmd } from "../types.js";

export const SlowmodeListSlashCmd = slowmodeSlashCmd({
  name: "list",
  configPermission: "can_manage",
  description: "List active slowmodes in the server",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    const channels = pluginData.guild.channels;
    const slowmodes: Array<{ channel: GuildChannel; seconds: number; native: boolean }> = [];

    for (const channel of channels.cache.values()) {
      if (!(channel instanceof TextChannel)) continue;

      const botSlowmode = await pluginData.state.slowmodes.getChannelSlowmode(channel.id);
      if (botSlowmode) {
        slowmodes.push({ channel, seconds: botSlowmode.slowmode_seconds, native: false });
        continue;
      }

      if (channel.rateLimitPerUser) {
        slowmodes.push({ channel, seconds: channel.rateLimitPerUser, native: true });
        continue;
      }
    }

    if (!slowmodes.length) {
      pluginData.state.common.sendErrorMessage(interaction, "No active slowmodes!");
      return;
    }

    const lines = slowmodes.map((slowmode) => {
      const humanized = humanizeDuration(slowmode.seconds * 1000);
      const type = slowmode.native ? "native slowmode" : "bot slowmode";
      return `<#${slowmode.channel.id}> **${humanized}** ${type}`;
    });

    // Discord message limit; truncate if needed
    let content = lines.join("\n");
    if (content.length > 1900) {
      content = content.slice(0, 1900) + "\n…";
    }

    await interaction.editReply(content);
  },
});
