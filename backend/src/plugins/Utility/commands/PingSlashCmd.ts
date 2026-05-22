import { utilitySlashCmd } from "../types.js";

export const PingSlashCmd = utilitySlashCmd({
  name: "ping",
  configPermission: "can_ping",
  description: "Test the bot's ping to the Discord API",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const sent = Date.now();
    await interaction.editReply("Calculating ping...");
    const roundtrip = Date.now() - sent;
    interaction.editReply(
      `**Ping:**\nRoundtrip: **${roundtrip}ms**\nShard latency: **${pluginData.client.ws.ping}ms**`,
    );
  },
});
