import { ApiPermissions } from "@alicebot/shared/apiPermissions.js";
import { APIEmbed, ChatInputCommandInteraction } from "discord.js";
import { slashOptions } from "vety";
import { AllowedGuild } from "../../../data/entities/AllowedGuild.js";
import { isStaff } from "../../../staff.js";
import { renderUsername, resolveUser } from "../../../utils.js";
import { botControlSlashCmd, botControlSlashGroup } from "../types.js";

async function requireStaff(interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (isStaff(interaction.user.id)) return true;
  await interaction.editReply({ content: "Only Alice staff can use this command." });
  return false;
}

export const DashboardAddUserSlashCmd = botControlSlashCmd({
  name: "add_user",
  description: "Grant dashboard access for a server",
  allowDms: false,
  signature: [
    slashOptions.string({ name: "guild_id", description: "Server ID", required: true }),
    slashOptions.user({ name: "user", description: "User to grant access", required: true }),
  ],

  async run({ pluginData, interaction, options }) {
    await interaction.deferReply({ ephemeral: false });
    if (!(await requireStaff(interaction))) return;

    const guild = await pluginData.state.allowedGuilds.find(options.guild_id);
    if (!guild) {
      await interaction.editReply("Server is not using Alice");
      return;
    }

    const existingAssignment = await pluginData.state.apiPermissionAssignments.getByGuildAndUserId(
      options.guild_id,
      options.user.id,
    );
    if (!existingAssignment) {
      await pluginData.state.apiPermissionAssignments.addUser(options.guild_id, options.user.id, [
        ApiPermissions.EditConfig,
      ]);
    }

    const embed: APIEmbed = {
      title: "Dashboard access granted",
      fields: [
        { name: "Server", value: `**${guild.name}** (\`${guild.id}\`)`, inline: false },
        {
          name: "User",
          value: `<@${options.user.id}> (**${renderUsername(options.user)}**, \`${options.user.id}\`)`,
          inline: false,
        },
        { name: "Permissions", value: ApiPermissions.EditConfig, inline: false },
      ],
    };

    await interaction.editReply({ embeds: [embed], allowedMentions: { parse: [] } });
  },
});

export const DashboardRemoveUserSlashCmd = botControlSlashCmd({
  name: "remove_user",
  description: "Revoke dashboard access for a server",
  allowDms: false,
  signature: [
    slashOptions.string({ name: "guild_id", description: "Server ID", required: true }),
    slashOptions.user({ name: "user", description: "User to revoke access from", required: true }),
  ],

  async run({ pluginData, interaction, options }) {
    await interaction.deferReply({ ephemeral: false });
    if (!(await requireStaff(interaction))) return;

    const guild = await pluginData.state.allowedGuilds.find(options.guild_id);
    if (!guild) {
      await interaction.editReply("Server is not using Alice");
      return;
    }

    const existingAssignment = await pluginData.state.apiPermissionAssignments.getByGuildAndUserId(
      options.guild_id,
      options.user.id,
    );
    if (existingAssignment) {
      await pluginData.state.apiPermissionAssignments.removeUser(options.guild_id, options.user.id);
    }

    const embed: APIEmbed = {
      title: "Dashboard access removed",
      fields: [
        { name: "Server", value: `**${guild.name}** (\`${guild.id}\`)`, inline: false },
        {
          name: "User",
          value: `<@${options.user.id}> (**${renderUsername(options.user)}**, \`${options.user.id}\`)`,
          inline: false,
        },
      ],
    };

    await interaction.editReply({ embeds: [embed], allowedMentions: { parse: [] } });
  },
});

export const DashboardListUsersSlashCmd = botControlSlashCmd({
  name: "list_users",
  configPermission: "can_list_dashboard_perms",
  description: "List users with dashboard access for a server",
  allowDms: false,
  signature: [slashOptions.string({ name: "guild_id", description: "Server ID", required: true })],

  async run({ pluginData, interaction, options }) {
    await interaction.deferReply({ ephemeral: false });

    const guild = await pluginData.state.allowedGuilds.find(options.guild_id);
    if (!guild) {
      await interaction.editReply("Server is not using Alice");
      return;
    }

    const dashboardUsers = await pluginData.state.apiPermissionAssignments.getByGuildId(guild.id);
    const users = await Promise.all(
      dashboardUsers.map(async (perm) => ({
        user: await resolveUser(pluginData.client, perm.target_id, "BotControl:DashboardListUsersSlashCmd"),
        permission: perm,
      })),
    );

    const lines =
      users.length === 0
        ? ["_No users have dashboard access._"]
        : users.map(
            ({ user, permission }) =>
              `<@${user.id}> (**${renderUsername(user)}**, \`${user.id}\`): ${permission.permissions.join(", ")}`,
          );

    const embed: APIEmbed = {
      title: `Dashboard users — ${guild.name}`,
      description: lines.join("\n"),
      footer: { text: `${users.length} user(s)` },
    };

    await interaction.editReply({ embeds: [embed], allowedMentions: { parse: [] } });
  },
});

export const DashboardListPermsSlashCmd = botControlSlashCmd({
  name: "list_perms",
  configPermission: "can_list_dashboard_perms",
  description: "List dashboard permission assignments for a server and/or user",
  allowDms: false,
  signature: [
    slashOptions.string({ name: "guild_id", description: "Server ID", required: false }),
    slashOptions.user({ name: "user", description: "User to look up", required: false }),
  ],

  async run({ pluginData, interaction, options }) {
    await interaction.deferReply({ ephemeral: false });

    if (!options.user && !options.guild_id) {
      await interaction.editReply("Must specify at least guild_id, user, or both.");
      return;
    }

    let guild: AllowedGuild | null = null;
    if (options.guild_id) {
      guild = await pluginData.state.allowedGuilds.find(options.guild_id);
      if (!guild) {
        await interaction.editReply("Server is not using Alice");
        return;
      }
    }

    const lines: string[] = [];

    if (options.user) {
      const assignments = await pluginData.state.apiPermissionAssignments.getByUserId(options.user.id);
      if (assignments.length === 0) {
        await interaction.editReply("The user has no assigned permissions.");
        return;
      }

      const userInfo = `**${renderUsername(options.user)}** (\`${options.user.id}\`)`;
      for (const assignment of assignments) {
        if (guild != null && assignment.guild_id !== options.guild_id) continue;
        const assignmentGuild = await pluginData.state.allowedGuilds.find(assignment.guild_id);
        const guildName = assignmentGuild?.name ?? "Unknown";
        lines.push(
          `${userInfo} on **${guildName}** (\`${assignment.guild_id}\`):\n${assignment.permissions.join(", ")}`,
        );
      }

      if (lines.length === 0) {
        await interaction.editReply(`The user ${userInfo} has no assigned permissions on the specified server.`);
        return;
      }
    } else if (guild) {
      const assignments = await pluginData.state.apiPermissionAssignments.getByGuildId(guild.id);
      if (assignments.length === 0) {
        await interaction.editReply(`The server **${guild.name}** has no assigned permissions.`);
        return;
      }

      for (const assignment of assignments) {
        const user = await resolveUser(
          pluginData.client,
          assignment.target_id,
          "BotControl:DashboardListPermsSlashCmd",
        );
        lines.push(`**${renderUsername(user)}** (\`${assignment.target_id}\`): ${assignment.permissions.join(", ")}`);
      }
    }

    const embed: APIEmbed = {
      title: "Dashboard permissions",
      description: lines.join("\n\n"),
    };

    await interaction.editReply({ embeds: [embed], allowedMentions: { parse: [] } });
  },
});

export const DashboardSlashGroup = botControlSlashGroup({
  name: "dashboard",
  description: "Staff tools for web dashboard access",
  defaultMemberPermissions: "0",
  subcommands: [
    DashboardAddUserSlashCmd,
    DashboardRemoveUserSlashCmd,
    DashboardListUsersSlashCmd,
    DashboardListPermsSlashCmd,
  ],
});
