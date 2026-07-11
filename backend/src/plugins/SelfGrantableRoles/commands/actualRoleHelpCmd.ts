import { ChatInputCommandInteraction, Message } from "discord.js";
import { GuildPluginData } from "vety";
import { asSingleLine, trimLines } from "../../../utils.js";
import { GenericCommandSource, isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { SelfGrantableRolesPluginType } from "../types.js";
import { getApplyingEntries } from "../util/getApplyingEntries.js";

export async function actualRoleHelpCmd(
  pluginData: GuildPluginData<SelfGrantableRolesPluginType>,
  context: Message | ChatInputCommandInteraction,
) {
  const applyingEntries = await getApplyingEntries(pluginData, context as GenericCommandSource);
  if (applyingEntries.length === 0) {
    if (isContextInteraction(context)) {
      await pluginData.state.common.sendErrorMessage(context, "No self-grantable roles available to you here");
    }
    return;
  }

  const allPrimaryAliases: string[] = [];
  for (const entry of applyingEntries) {
    for (const aliases of Object.values(entry.roles)) {
      if (aliases[0]) {
        allPrimaryAliases.push(aliases[0]);
      }
    }
  }

  const prefix = pluginData.fullConfig.prefix;
  const [firstRole, secondRole] = allPrimaryAliases;

  const help1 = asSingleLine(`
      To give yourself a role, type e.g. \`${prefix}role ${firstRole}\` where **${firstRole}** is the role you want.
      ${secondRole ? `You can also add multiple roles at once, e.g. \`${prefix}role ${firstRole} ${secondRole}\`` : ""}
    `);

  const help2 = asSingleLine(`
      To remove a role, type \`${prefix}role remove ${firstRole}\`,
      again replacing **${firstRole}** with the role you want to remove.
    `);

  const helpMessage = trimLines(`
      ${help1}

      ${help2}

      **Roles available to you:**
      ${allPrimaryAliases.join(", ")}
    `);

  const helpEmbed = {
    title: "How to get roles",
    description: helpMessage,
    color: parseInt("42bff4", 16),
  };

  if (isContextInteraction(context)) {
    await sendContextResponse(context, { embeds: [helpEmbed] }, true);
  } else if (context.channel.isSendable()) {
    await context.channel.send({ embeds: [helpEmbed] });
  }
}
