import moment from "moment-timezone";
import { GuildMember, GuildTextBasedChannel, User } from "discord.js";
import { GuildPluginData } from "vety";
import { GenericCommandSource, sendContextResponse } from "../../../pluginUtils.js";
import { DBDateFormat } from "../../../utils.js";
import { errorPanel, infoPanel, successPanel } from "../../../utils/xeonStylePanels.js";
import { TrackerPluginType } from "../types.js";

function todayUtc(): string {
  return moment.utc().format("YYYY-MM-DD");
}

export async function actualOverviewCmd(
  pluginData: GuildPluginData<TrackerPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  if (!pluginData.config.get().enabled) {
    await sendContextResponse(
      context,
      errorPanel({
        title: "Tracker disabled",
        body: "Set `tracker.config.enabled: true` in the guild config.",
      }),
    );
    return;
  }

  const date = todayUtc();
  const [trackedUsers, totalMessages, todayMessages, blacklistCount] = await Promise.all([
    pluginData.state.messages.countUsers(),
    pluginData.state.messages.sumTotals(),
    pluginData.state.messages.sumDaily(date),
    pluginData.state.blacklist.count(),
  ]);

  await sendContextResponse(
    context,
    infoPanel({
      title: "Tracker Overview",
      body: [
        `**Tracked users:** \`${trackedUsers}\``,
        `**Total messages:** \`${totalMessages}\``,
        `**Today's messages:** \`${todayMessages}\``,
        `**Blacklisted channels:** \`${blacklistCount}\``,
      ].join("\n"),
      footer: "Message counts respect the channel blacklist.",
      thumbnailUrl: pluginData.client.user?.displayAvatarURL() || undefined,
    }),
  );
}

export async function actualMessagesCmd(
  pluginData: GuildPluginData<TrackerPluginType>,
  context: GenericCommandSource,
  user: User,
  member: GuildMember | null,
): Promise<void> {
  if (!pluginData.config.get().enabled) {
    await sendContextResponse(
      context,
      errorPanel({
        title: "Tracker disabled",
        body: "Set `tracker.config.enabled: true` in the guild config.",
      }),
    );
    return;
  }

  const date = todayUtc();
  const [totalRow, dailyRow] = await Promise.all([
    pluginData.state.messages.findTotal(user.id),
    pluginData.state.messages.findDaily(user.id, date),
  ]);
  const total = totalRow?.count ?? 0;
  const today = dailyRow?.count ?? 0;

  let days = 1;
  if (member?.joinedAt) {
    days = Math.max(1, moment.utc().diff(moment.utc(member.joinedAt), "days"));
  }
  const avg = total / days;

  await sendContextResponse(
    context,
    infoPanel({
      title: "Message Tracker",
      body: [
        `**User:** <@${user.id}>`,
        `**Total messages:** \`${total}\``,
        `**Today's messages:** \`${today}\``,
        `**Avg. daily:** \`${avg.toFixed(2)}\``,
      ].join("\n"),
      thumbnailUrl: user.displayAvatarURL() || undefined,
    }),
  );
}

export async function actualInvitesCmd(
  pluginData: GuildPluginData<TrackerPluginType>,
  context: GenericCommandSource,
  user: User,
): Promise<void> {
  if (!pluginData.config.get().enabled) {
    await sendContextResponse(
      context,
      errorPanel({
        title: "Tracker disabled",
        body: "Set `tracker.config.enabled: true` in the guild config.",
      }),
    );
    return;
  }

  const rows = await pluginData.state.invites.findByInviter(user.id);
  const counts = await pluginData.state.invites.countForInviter(user.id);
  const today = todayUtc();
  const todayInvites = rows.filter((row) => moment.utc(row.joined_at, DBDateFormat).format("YYYY-MM-DD") === today)
    .length;

  const recent = rows
    .slice(-5)
    .map((row) => {
      const m = pluginData.guild.members.cache.get(row.invited_id);
      return m ? m.user.username : row.invited_id;
    })
    .join(", ");

  const body = [
    `**User:** <@${user.id}>`,
    `**Total invites:** \`${counts.total}\``,
    `**Fake invites:** \`${counts.fake}\``,
    `**Left:** \`${counts.left}\``,
    `**Today's invites:** \`${todayInvites}\``,
  ];
  if (recent) {
    body.push(`**Recently invited:** ${recent}`);
  }

  await sendContextResponse(
    context,
    infoPanel({
      title: "Invite Tracker",
      body: body.join("\n"),
      footer: "Fake = joining account younger than 7 days.",
      thumbnailUrl: user.displayAvatarURL() || undefined,
    }),
  );
}

export async function actualBlacklistAddCmd(
  pluginData: GuildPluginData<TrackerPluginType>,
  context: GenericCommandSource,
  channel: GuildTextBasedChannel,
): Promise<void> {
  await pluginData.state.blacklist.add(channel.id, moment.utc().format(DBDateFormat));
  await sendContextResponse(
    context,
    successPanel({
      title: "Channel blacklisted",
      body: `Messages in <#${channel.id}> will no longer be counted.`,
    }),
  );
}

export async function actualBlacklistRemoveCmd(
  pluginData: GuildPluginData<TrackerPluginType>,
  context: GenericCommandSource,
  channel: GuildTextBasedChannel,
): Promise<void> {
  await pluginData.state.blacklist.remove(channel.id);
  await sendContextResponse(
    context,
    successPanel({
      title: "Channel unblacklisted",
      body: `Messages in <#${channel.id}> will be counted again.`,
    }),
  );
}

export async function actualBlacklistListCmd(
  pluginData: GuildPluginData<TrackerPluginType>,
  context: GenericCommandSource,
): Promise<void> {
  const rows = await pluginData.state.blacklist.list();
  const body =
    rows.length === 0
      ? "No channels are blacklisted."
      : rows.map((row) => `• <#${row.channel_id}>`).join("\n");

  await sendContextResponse(
    context,
    infoPanel({
      title: "Blacklisted Channels",
      body,
      footer: `Total: ${rows.length}`,
    }),
  );
}
