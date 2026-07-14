import { slashOptions } from "vety";
import { utilitySlashCmd } from "../types.js";
import { actualAboutCmd } from "./actualAboutCmd.js";
import { actualHelpCmd } from "./actualHelpCmd.js";
import { actualJumboCmd } from "./actualJumboCmd.js";
import { actualReloadGuildCmd } from "./actualReloadGuildCmd.js";

export const HelpSlashCmd = utilitySlashCmd({
  name: "help",
  configPermission: "can_help",
  description: "Show usage information for commands",
  allowDms: false,

  signature: [slashOptions.string({ name: "command", description: "Command name to look up", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualHelpCmd(pluginData, interaction, options.command);
  },
});

export const AboutSlashCmd = utilitySlashCmd({
  name: "about",
  configPermission: "can_about",
  description: "Show information about Alice's status on the server",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: false });
    await actualAboutCmd(pluginData, interaction);
  },
});

export const JumboSlashCmd = utilitySlashCmd({
  name: "jumbo",
  configPermission: "can_jumbo",
  description: "Make an emoji jumbo",
  allowDms: false,

  signature: [slashOptions.string({ name: "emoji", description: "Emoji to enlarge", required: true })],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: false });
    await actualJumboCmd(pluginData, interaction, options.emoji);
  },
});

export const ReloadGuildSlashCmd = utilitySlashCmd({
  name: "reload_guild",
  configPermission: "can_reload_guild",
  description: "Reload the bot configuration and plugins for this server",
  allowDms: false,

  signature: [],

  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    await actualReloadGuildCmd(pluginData, interaction);
  },
});
