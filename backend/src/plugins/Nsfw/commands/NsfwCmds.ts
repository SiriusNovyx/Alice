import { slashOptions } from "vety";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { actualNsfwImage, requireNsfwChannel } from "../functions/nsfwFetch.js";
import { nsfwCmd, nsfwSlashCmd } from "../types.js";

export const NsfwCheckCmd = nsfwCmd({
  trigger: ["nsfw-check"],
  usage: "!nsfw-check",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    if (!(await requireNsfwChannel(pluginData, msg, msg.channel as any))) return;
    await pluginData.state.common.sendSuccessMessage(msg, "This channel is marked NSFW. Commands may run here.");
  },
});

export const NsfwImageCmd = nsfwCmd({
  trigger: ["nsfw"],
  usage: "!nsfw <hentai|neko|waifu|blowjob|trap>",
  permission: "can_use",
  signature: { category: ct.string() },
  async run({ message: msg, args, pluginData }) {
    await actualNsfwImage(pluginData, msg, msg.channel as any, args.category);
  },
});

export const NsfwCheckSlashCmd = nsfwSlashCmd({
  name: "check",
  configPermission: "can_use",
  description: "Verify this channel allows NSFW plugin commands",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    if (!(await requireNsfwChannel(pluginData, interaction, interaction.channel as any))) return;
    await pluginData.state.common.sendSuccessMessage(interaction, "NSFW channel OK.");
  },
});

export const NsfwImageSlashCmd = nsfwSlashCmd({
  name: "image",
  configPermission: "can_use",
  description: "Fetch an NSFW image (NSFW channels only)",
  allowDms: false,
  signature: [
    slashOptions.string({
      name: "category",
      description: "hentai|neko|waifu|blowjob|trap",
      required: true,
    }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply();
    await actualNsfwImage(pluginData, interaction, interaction.channel as any, options.category);
  },
});
