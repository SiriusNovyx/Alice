import moment from "moment-timezone";
import { slashOptions } from "vety";
import { commandTypeHelpers as ct } from "../../../commandTypes.js";
import { boosterRolesCmd, boosterRolesEvt, boosterRolesSlashCmd } from "../types.js";

function isBooster(
  member: { premiumSince: Date | null; roles: { cache: { has: (id: string) => boolean } } },
  boosterRoleId: string | null,
): boolean {
  if (member.premiumSince) return true;
  if (boosterRoleId && member.roles.cache.has(boosterRoleId)) return true;
  return false;
}

function parseColor(raw: string): number | null {
  const hex = raw.replace("#", "");
  const color = Number.parseInt(hex, 16);
  return Number.isNaN(color) ? null : color;
}

export const BoosterCreateCmd = boosterRolesCmd({
  trigger: ["boosterrole", "brole"],
  usage: "!boosterrole <name> <hex>",
  permission: "can_use",
  signature: {
    name: ct.string(),
    color: ct.string(),
  },
  async run({ message: msg, args, pluginData }) {
    if (!msg.member) return;
    const config = pluginData.config.get();
    if (!config.enabled) {
      await pluginData.state.common.sendErrorMessage(msg, "Booster roles are disabled.");
      return;
    }
    if (!isBooster(msg.member, config.booster_role_id)) {
      await pluginData.state.common.sendErrorMessage(msg, "Only boosters can create a personal role.");
      return;
    }
    const existing = await pluginData.state.boosterRoles.findByUser(msg.author.id);
    if (existing) {
      await pluginData.state.common.sendErrorMessage(msg, "You already have a booster role. Delete it first.");
      return;
    }
    const color = parseColor(args.color);
    if (color == null) {
      await pluginData.state.common.sendErrorMessage(msg, "Provide a valid hex color (e.g. `#ff8800`).");
      return;
    }
    const name = args.name.slice(0, config.max_name_length);
    const role = await pluginData.guild.roles.create({
      name,
      color,
      reason: `Booster role for ${msg.author.tag}`,
    });
    await msg.member.roles.add(role);
    await pluginData.state.boosterRoles.create(msg.author.id, role.id, moment.utc().format("YYYY-MM-DD HH:mm:ss"));
    await pluginData.state.common.sendSuccessMessage(msg, `Created ${role}.`);
  },
});

export const BoosterRenameCmd = boosterRolesCmd({
  trigger: ["boosterrole-name", "brole-name"],
  usage: "!boosterrole-name <name>",
  permission: "can_use",
  signature: { name: ct.string({ catchAll: true }) },
  async run({ message: msg, args, pluginData }) {
    const config = pluginData.config.get();
    if (!config.enabled) {
      await pluginData.state.common.sendErrorMessage(msg, "Booster roles are disabled.");
      return;
    }
    const existing = await pluginData.state.boosterRoles.findByUser(msg.author.id);
    if (!existing) {
      await pluginData.state.common.sendErrorMessage(msg, "You do not have a booster role.");
      return;
    }
    const role = await pluginData.guild.roles.fetch(existing.role_id).catch(() => null);
    if (!role) {
      await pluginData.state.boosterRoles.delete(msg.author.id);
      await pluginData.state.common.sendErrorMessage(msg, "Role missing; record cleared. Create a new one.");
      return;
    }
    await role.setName(args.name.slice(0, config.max_name_length));
    await pluginData.state.common.sendSuccessMessage(msg, `Renamed to **${role.name}**.`);
  },
});

export const BoosterColorCmd = boosterRolesCmd({
  trigger: ["boosterrole-color", "brole-color"],
  usage: "!boosterrole-color <hex>",
  permission: "can_use",
  signature: { color: ct.string() },
  async run({ message: msg, args, pluginData }) {
    if (!pluginData.config.get().enabled) {
      await pluginData.state.common.sendErrorMessage(msg, "Booster roles are disabled.");
      return;
    }
    const existing = await pluginData.state.boosterRoles.findByUser(msg.author.id);
    if (!existing) {
      await pluginData.state.common.sendErrorMessage(msg, "You do not have a booster role.");
      return;
    }
    const color = parseColor(args.color);
    if (color == null) {
      await pluginData.state.common.sendErrorMessage(msg, "Invalid hex color.");
      return;
    }
    const role = await pluginData.guild.roles.fetch(existing.role_id).catch(() => null);
    if (!role) {
      await pluginData.state.boosterRoles.delete(msg.author.id);
      await pluginData.state.common.sendErrorMessage(msg, "Role missing; record cleared.");
      return;
    }
    await role.setColor(color);
    await pluginData.state.common.sendSuccessMessage(msg, `Updated color for ${role}.`);
  },
});

export const BoosterDeleteCmd = boosterRolesCmd({
  trigger: ["boosterrole-delete", "brole-delete"],
  usage: "!boosterrole-delete",
  permission: "can_use",
  signature: {},
  async run({ message: msg, pluginData }) {
    const existing = await pluginData.state.boosterRoles.findByUser(msg.author.id);
    if (!existing) {
      await pluginData.state.common.sendErrorMessage(msg, "You do not have a booster role.");
      return;
    }
    await pluginData.guild.roles.delete(existing.role_id).catch(() => null);
    await pluginData.state.boosterRoles.delete(msg.author.id);
    await pluginData.state.common.sendSuccessMessage(msg, "Booster role deleted.");
  },
});

export const BoosterCreateSlashCmd = boosterRolesSlashCmd({
  name: "create",
  configPermission: "can_use",
  description: "Create your booster color role",
  allowDms: false,
  signature: [
    slashOptions.string({ name: "name", description: "Role name", required: true }),
    slashOptions.string({ name: "color", description: "Hex color", required: true }),
  ],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const config = pluginData.config.get();
    if (!config.enabled) {
      await pluginData.state.common.sendErrorMessage(interaction, "Booster roles are disabled.");
      return;
    }
    const member = await pluginData.guild.members.fetch(interaction.user.id);
    if (!isBooster(member, config.booster_role_id)) {
      await pluginData.state.common.sendErrorMessage(interaction, "Only boosters can create a personal role.");
      return;
    }
    const existing = await pluginData.state.boosterRoles.findByUser(interaction.user.id);
    if (existing) {
      await pluginData.state.common.sendErrorMessage(interaction, "You already have a booster role.");
      return;
    }
    const color = parseColor(options.color);
    if (color == null) {
      await pluginData.state.common.sendErrorMessage(interaction, "Invalid hex color.");
      return;
    }
    const role = await pluginData.guild.roles.create({
      name: options.name.slice(0, config.max_name_length),
      color,
      reason: `Booster role for ${interaction.user.tag}`,
    });
    await member.roles.add(role);
    await pluginData.state.boosterRoles.create(
      interaction.user.id,
      role.id,
      moment.utc().format("YYYY-MM-DD HH:mm:ss"),
    );
    await pluginData.state.common.sendSuccessMessage(interaction, `Created ${role}.`);
  },
});

export const BoosterNameSlashCmd = boosterRolesSlashCmd({
  name: "name",
  configPermission: "can_use",
  description: "Rename your booster role",
  allowDms: false,
  signature: [slashOptions.string({ name: "name", description: "New name", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const config = pluginData.config.get();
    if (!config.enabled) {
      await pluginData.state.common.sendErrorMessage(interaction, "Booster roles are disabled.");
      return;
    }
    const existing = await pluginData.state.boosterRoles.findByUser(interaction.user.id);
    if (!existing) {
      await pluginData.state.common.sendErrorMessage(interaction, "You do not have a booster role.");
      return;
    }
    const role = await pluginData.guild.roles.fetch(existing.role_id).catch(() => null);
    if (!role) {
      await pluginData.state.boosterRoles.delete(interaction.user.id);
      await pluginData.state.common.sendErrorMessage(interaction, "Role missing; record cleared.");
      return;
    }
    await role.setName(options.name.slice(0, config.max_name_length));
    await pluginData.state.common.sendSuccessMessage(interaction, `Renamed to **${role.name}**.`);
  },
});

export const BoosterColorSlashCmd = boosterRolesSlashCmd({
  name: "color",
  configPermission: "can_use",
  description: "Recolor your booster role",
  allowDms: false,
  signature: [slashOptions.string({ name: "color", description: "Hex color", required: true })],
  async run({ interaction, options, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    if (!pluginData.config.get().enabled) {
      await pluginData.state.common.sendErrorMessage(interaction, "Booster roles are disabled.");
      return;
    }
    const existing = await pluginData.state.boosterRoles.findByUser(interaction.user.id);
    if (!existing) {
      await pluginData.state.common.sendErrorMessage(interaction, "You do not have a booster role.");
      return;
    }
    const color = parseColor(options.color);
    if (color == null) {
      await pluginData.state.common.sendErrorMessage(interaction, "Invalid hex color.");
      return;
    }
    const role = await pluginData.guild.roles.fetch(existing.role_id).catch(() => null);
    if (!role) {
      await pluginData.state.boosterRoles.delete(interaction.user.id);
      await pluginData.state.common.sendErrorMessage(interaction, "Role missing; record cleared.");
      return;
    }
    await role.setColor(color);
    await pluginData.state.common.sendSuccessMessage(interaction, `Updated color for ${role}.`);
  },
});

export const BoosterDeleteSlashCmd = boosterRolesSlashCmd({
  name: "delete",
  configPermission: "can_use",
  description: "Delete your booster role",
  allowDms: false,
  signature: [],
  async run({ interaction, pluginData }) {
    await interaction.deferReply({ ephemeral: true });
    const existing = await pluginData.state.boosterRoles.findByUser(interaction.user.id);
    if (!existing) {
      await pluginData.state.common.sendErrorMessage(interaction, "You do not have a booster role.");
      return;
    }
    await pluginData.guild.roles.delete(existing.role_id).catch(() => null);
    await pluginData.state.boosterRoles.delete(interaction.user.id);
    await pluginData.state.common.sendSuccessMessage(interaction, "Booster role deleted.");
  },
});

export const BoosterMemberUpdateEvt = boosterRolesEvt({
  event: "guildMemberUpdate",
  async listener({ pluginData, args: { oldMember, newMember } }) {
    const config = pluginData.config.get();
    if (!config.enabled) return;
    const wasBooster =
      Boolean(oldMember.premiumSince) ||
      (config.booster_role_id ? oldMember.roles.cache.has(config.booster_role_id) : false);
    const isNow = isBooster(newMember, config.booster_role_id);
    if (wasBooster && !isNow) {
      const existing = await pluginData.state.boosterRoles.findByUser(newMember.id);
      if (existing) {
        await pluginData.guild.roles.delete(existing.role_id).catch(() => null);
        await pluginData.state.boosterRoles.delete(newMember.id);
      }
    }
  },
});
