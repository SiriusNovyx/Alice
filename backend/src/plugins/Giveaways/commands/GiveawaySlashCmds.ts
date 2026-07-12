import { slashOptions } from "vety";
import { giveawaysSlashCmd } from "../types.js";
import { actualEndCmd, actualListCmd, actualRerollCmd, actualStartCmd } from "./actualGiveawayCmds.js";

export const GwStartSlashCmd = giveawaysSlashCmd({
  name: "start",
  configPermission: "can_manage",
  description: "Start a giveaway in this channel",
  allowDms: false,
  signature: [
    slashOptions.string({ name: "prize", description: "Prize", required: true }),
    slashOptions.string({ name: "duration", description: "e.g. 1h, 30m, 2d", required: true }),
    slashOptions.integer({ name: "winners", description: "Number of winners", required: false }),
    slashOptions.role({ name: "required_role", description: "Required role to enter", required: false }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualStartCmd(
      pluginData,
      interaction,
      interaction.user.id,
      interaction.channelId!,
      options.prize,
      options.duration,
      options.winners ?? 1,
      options.required_role ? [options.required_role.id] : [],
    );
  },
});

export const GwEndSlashCmd = giveawaysSlashCmd({
  name: "end",
  configPermission: "can_manage",
  description: "End a giveaway early",
  allowDms: false,
  signature: [slashOptions.string({ name: "message_id", description: "Giveaway message ID", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualEndCmd(pluginData, interaction, options.message_id);
  },
});

export const GwRerollSlashCmd = giveawaysSlashCmd({
  name: "reroll",
  configPermission: "can_manage",
  description: "Reroll winners for an ended giveaway",
  allowDms: false,
  signature: [
    slashOptions.string({ name: "message_id", description: "Giveaway message ID", required: true }),
    slashOptions.integer({ name: "count", description: "How many to redraw", required: false }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualRerollCmd(pluginData, interaction, options.message_id, options.count ?? null);
  },
});

export const GwListSlashCmd = giveawaysSlashCmd({
  name: "list",
  configPermission: "can_manage",
  description: "List active giveaways",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualListCmd(pluginData, interaction);
  },
});
