import {
  ChannelType,
  GuildMember,
  OverwriteResolvable,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import moment from "moment-timezone";
import { GuildPluginData } from "vety";
import { Ticket } from "../../../data/entities/Ticket.js";
import { TicketsPluginType, TTicketCategory } from "../types.js";

export async function openTicket(
  pluginData: GuildPluginData<TicketsPluginType>,
  member: GuildMember,
  categoryKey: string,
  category: TTicketCategory,
): Promise<{ ticket: Ticket; channel: TextChannel } | { error: string }> {
  const config = pluginData.config.get();
  if (!config.enabled) {
    return { error: "Tickets are disabled." };
  }

  const openCount = await pluginData.state.tickets.countOpenByOpener(member.id);
  if (openCount >= config.max_open_per_user) {
    const open = await pluginData.state.tickets.findOpenByOpener(member.id);
    return {
      error: open
        ? `You already have the maximum number of open tickets (${config.max_open_per_user}). Example: <#${open.channel_id}>`
        : `You already have the maximum number of open tickets (${config.max_open_per_user}).`,
    };
  }

  const parentId = category.category_id ?? config.parent_category_id ?? undefined;
  const channelName = config.channel_name
    .replaceAll("{user}", member.user.username)
    .replaceAll("{id}", member.id)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 90)
    .toLowerCase();

  const staffRoleIds = [...new Set([...config.support_role_ids, ...category.staff_role_ids])];
  const overwrites: OverwriteResolvable[] = [
    {
      id: pluginData.guild.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: member.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    {
      id: pluginData.client.user!.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    ...staffRoleIds.map((roleId) => ({
      id: roleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
      ],
    })),
  ];

  const channel = await pluginData.guild.channels.create({
    name: channelName || `ticket-${member.user.username}`.slice(0, 100),
    type: ChannelType.GuildText,
    parent: parentId,
    topic: `Ticket for ${member.user.tag} (${member.id}) · ${category.name}`,
    permissionOverwrites: overwrites,
    reason: `Ticket opened by ${member.user.tag}`,
  });

  const ticket = await pluginData.state.tickets.create({
    channel_id: channel.id,
    opener_id: member.id,
    category_key: categoryKey,
    created_at: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
  });

  await channel.send({
    content: `${member} ${staffRoleIds.map((id) => `<@&${id}>`).join(" ")}`.trim(),
    embeds: [
      {
        title: category.name,
        description: `Ticket opened by ${member}. Staff can claim, add users, or close when done.`,
        color: 0x5865f2,
        fields: [
          { name: "Category", value: categoryKey, inline: true },
          { name: "Opener", value: `${member} (\`${member.id}\`)`, inline: true },
        ],
      },
    ],
  });

  return { ticket, channel };
}
