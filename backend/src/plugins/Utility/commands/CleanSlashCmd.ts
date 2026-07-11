import { ChannelType, GuildMember, Snowflake } from "discord.js";
import { slashOptions } from "vety";
import { inputPatternToRegExp, InvalidRegexError } from "../../../utils.js";
import { utilitySlashCmd } from "../types.js";
import { actualCleanCmd } from "./actualCleanCmd.js";

export const CleanSlashCmd = utilitySlashCmd({
  name: "clean",
  configPermission: "can_clean",
  description: "Remove a number of recent messages",
  allowDms: false,

  signature: [
    slashOptions.integer({ name: "count", description: "Number of messages to delete (max 100)", required: true }),
    slashOptions.user({ name: "user", description: "Only delete messages from this user", required: false }),
    slashOptions.channel({
      name: "channel",
      description: "The channel to clean (defaults to current channel)",
      channelTypes: [
        ChannelType.GuildText,
        ChannelType.GuildAnnouncement,
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
      ],
      required: false,
    }),
    slashOptions.boolean({ name: "bots", description: "Only delete bot messages", required: false }),
    slashOptions.boolean({ name: "delete-pins", description: "Also delete pinned messages", required: false }),
    slashOptions.boolean({ name: "has-invites", description: "Only delete messages containing invites", required: false }),
    slashOptions.string({ name: "match", description: "Only delete messages matching this pattern", required: false }),
    slashOptions.string({ name: "to-id", description: "Clean up to (and including) this message ID", required: false }),
    slashOptions.boolean({ name: "update", description: "Add a note to your latest mod case", required: false }),
    slashOptions.integer({
      name: "update-case",
      description: "Add a note to a specific mod case number",
      required: false,
    }),
  ],

  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });

    let match: RegExp | null = null;
    if (options.match) {
      try {
        match = inputPatternToRegExp(options.match);
      } catch (e) {
        const message = e instanceof InvalidRegexError ? e.message : "Invalid match pattern";
        pluginData.state.common.sendErrorMessage(interaction, `Could not parse RegExp: \`${message}\``);
        return;
      }
    }

    let update: number | true | null = null;
    if (options["update-case"] != null) {
      update = options["update-case"];
    } else if (options.update) {
      update = true;
    }

    const modMember = interaction.member as GuildMember | null;

    await actualCleanCmd(pluginData, interaction, interaction.user, modMember, {
      count: Math.min(options.count, 100),
      channelId: options.channel?.id as Snowflake | undefined,
      userId: options.user?.id,
      bots: options.bots ?? false,
      deletePins: options["delete-pins"] ?? false,
      hasInvites: options["has-invites"] ?? false,
      match,
      toId: options["to-id"],
      update,
    });
  },
});
