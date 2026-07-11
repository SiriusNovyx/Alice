import { Channel, ChatInputCommandInteraction, Message, User } from "discord.js";
import { GuildPluginData } from "vety";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { trimMultilineString, ucfirst } from "../../../utils.js";
import { getGuildPrefix } from "../../../utils/getGuildPrefix.js";
import { changeCounterValue } from "../functions/changeCounterValue.js";
import { resetAllCounterValues } from "../functions/resetAllCounterValues.js";
import { setCounterValue } from "../functions/setCounterValue.js";
import { CountersPluginType } from "../types.js";

async function resolveCounterAccess(
  pluginData: GuildPluginData<CountersPluginType>,
  context: Message | ChatInputCommandInteraction,
  counterName: string,
  need: "view" | "edit" | "reset_all",
) {
  const config = isContextInteraction(context)
    ? await pluginData.config.getForInteraction(context)
    : await pluginData.config.getForMessage(context);

  const counter = config.counters[counterName];
  const counterId = pluginData.state.counterIds[counterName];
  if (!counter || !counterId) {
    await pluginData.state.common.sendErrorMessage(context, `Unknown counter: ${counterName}`);
    return null;
  }

  if (need === "view" && counter.can_view === false) {
    await pluginData.state.common.sendErrorMessage(context, `Missing permissions to view this counter's value`);
    return null;
  }
  if (need === "edit" && counter.can_edit === false) {
    await pluginData.state.common.sendErrorMessage(context, `Missing permissions to edit this counter's value`);
    return null;
  }
  if (need === "reset_all" && counter.can_reset_all === false) {
    await pluginData.state.common.sendErrorMessage(
      context,
      `Missing permissions to reset all of this counter's values`,
    );
    return null;
  }

  return { config, counter, counterId };
}

export async function actualCountersListCmd(
  pluginData: GuildPluginData<CountersPluginType>,
  context: Message | ChatInputCommandInteraction,
) {
  const config = isContextInteraction(context)
    ? await pluginData.config.getForInteraction(context)
    : await pluginData.config.getForMessage(context);

  const countersToShow = Object.entries(config.counters).filter(([, c]) => c.can_view !== false);
  if (!countersToShow.length) {
    await pluginData.state.common.sendErrorMessage(context, "No counters are configured for this server");
    return;
  }

  const counterLines = countersToShow.map(([counterName, counter]) => {
    const title = counter.pretty_name ? `**${counter.pretty_name}** (\`${counterName}\`)` : `\`${counterName}\``;

    const types: string[] = [];
    if (counter.per_user) types.push("per user");
    if (counter.per_channel) types.push("per channel");
    const typeInfo = types.length ? types.join(", ") : "global";

    const decayInfo = counter.decay ? `decays ${counter.decay.amount} every ${counter.decay.every}` : null;

    const info = [typeInfo, decayInfo].filter(Boolean);
    return `${title}\n${ucfirst(info.join("; "))}`;
  });

  const hintLines = [`Use \`${getGuildPrefix(pluginData)}counters view <name>\` to view a counter's value`];
  if (config.can_edit) {
    hintLines.push(`Use \`${getGuildPrefix(pluginData)}counters set <name> <value>\` to change a counter's value`);
  }
  if (config.can_reset_all) {
    hintLines.push(`Use \`${getGuildPrefix(pluginData)}counters reset_all <name>\` to reset a counter entirely`);
  }

  const body = trimMultilineString(`
      ${counterLines.join("\n\n")}

      ${hintLines.join("\n")}
    `);

  if (isContextInteraction(context)) {
    await sendContextResponse(context, body, true);
  } else if (context.channel.isSendable()) {
    await context.channel.send(body);
  }
}

export async function actualViewCounterCmd(
  pluginData: GuildPluginData<CountersPluginType>,
  context: Message | ChatInputCommandInteraction,
  counterName: string,
  channel: Channel | null,
  user: User | null,
) {
  const resolved = await resolveCounterAccess(pluginData, context, counterName, "view");
  if (!resolved) return;
  const { counter, counterId } = resolved;

  if (channel && !counter.per_channel) {
    await pluginData.state.common.sendErrorMessage(context, `This counter is not per-channel`);
    return;
  }
  if (user && !counter.per_user) {
    await pluginData.state.common.sendErrorMessage(context, `This counter is not per-user`);
    return;
  }
  if (counter.per_channel && !channel) {
    await pluginData.state.common.sendErrorMessage(context, `This counter requires a channel`);
    return;
  }
  if (counter.per_user && !user) {
    await pluginData.state.common.sendErrorMessage(context, `This counter requires a user`);
    return;
  }

  const value = await pluginData.state.counters.getCurrentValue(counterId, channel?.id ?? null, user?.id ?? null);
  const finalValue = value ?? counter.initial_value;

  const reply = channel && user
    ? `**${counterName}** for <@!${user.id}> in <#${channel.id}> is ${finalValue}`
    : channel
      ? `**${counterName}** in <#${channel.id}> is ${finalValue}`
      : user
        ? `**${counterName}** for <@!${user.id}> is ${finalValue}`
        : `**${counterName}** is ${finalValue}`;

  if (isContextInteraction(context)) {
    await sendContextResponse(context, reply, true);
  } else if (context.channel.isSendable()) {
    await context.channel.send(reply);
  }
}

export async function actualAddCounterCmd(
  pluginData: GuildPluginData<CountersPluginType>,
  context: Message | ChatInputCommandInteraction,
  counterName: string,
  amount: number,
  channel: Channel | null,
  user: User | null,
) {
  const resolved = await resolveCounterAccess(pluginData, context, counterName, "edit");
  if (!resolved) return;
  const { counter, counterId } = resolved;

  if (channel && !counter.per_channel) {
    await pluginData.state.common.sendErrorMessage(context, `This counter is not per-channel`);
    return;
  }
  if (user && !counter.per_user) {
    await pluginData.state.common.sendErrorMessage(context, `This counter is not per-user`);
    return;
  }
  if (counter.per_channel && !channel) {
    await pluginData.state.common.sendErrorMessage(context, `This counter requires a channel`);
    return;
  }
  if (counter.per_user && !user) {
    await pluginData.state.common.sendErrorMessage(context, `This counter requires a user`);
    return;
  }

  await changeCounterValue(pluginData, counterName, channel?.id ?? null, user?.id ?? null, amount);
  const newValue = await pluginData.state.counters.getCurrentValue(counterId, channel?.id ?? null, user?.id ?? null);

  const reply =
    channel && user
      ? `Added ${amount} to **${counterName}** for <@!${user.id}> in <#${channel.id}>. The value is now ${newValue}.`
      : channel
        ? `Added ${amount} to **${counterName}** in <#${channel.id}>. The value is now ${newValue}.`
        : user
          ? `Added ${amount} to **${counterName}** for <@!${user.id}>. The value is now ${newValue}.`
          : `Added ${amount} to **${counterName}**. The value is now ${newValue}.`;

  if (isContextInteraction(context)) {
    await sendContextResponse(context, reply, true);
  } else if (context.channel.isSendable()) {
    await context.channel.send(reply);
  }
}

export async function actualSetCounterCmd(
  pluginData: GuildPluginData<CountersPluginType>,
  context: Message | ChatInputCommandInteraction,
  counterName: string,
  value: number,
  channel: Channel | null,
  user: User | null,
) {
  const resolved = await resolveCounterAccess(pluginData, context, counterName, "edit");
  if (!resolved) return;
  const { counter } = resolved;

  if (channel && !counter.per_channel) {
    await pluginData.state.common.sendErrorMessage(context, `This counter is not per-channel`);
    return;
  }
  if (user && !counter.per_user) {
    await pluginData.state.common.sendErrorMessage(context, `This counter is not per-user`);
    return;
  }
  if (counter.per_channel && !channel) {
    await pluginData.state.common.sendErrorMessage(context, `This counter requires a channel`);
    return;
  }
  if (counter.per_user && !user) {
    await pluginData.state.common.sendErrorMessage(context, `This counter requires a user`);
    return;
  }
  if (value < 0) {
    await pluginData.state.common.sendErrorMessage(context, "Cannot set counter value below 0");
    return;
  }

  await setCounterValue(pluginData, counterName, channel?.id ?? null, user?.id ?? null, value);

  const reply =
    channel && user
      ? `Set **${counterName}** for <@!${user.id}> in <#${channel.id}> to ${value}`
      : channel
        ? `Set **${counterName}** in <#${channel.id}> to ${value}`
        : user
          ? `Set **${counterName}** for <@!${user.id}> to ${value}`
          : `Set **${counterName}** to ${value}`;

  if (isContextInteraction(context)) {
    await sendContextResponse(context, reply, true);
  } else if (context.channel.isSendable()) {
    await context.channel.send(reply);
  }
}

export async function actualResetCounterCmd(
  pluginData: GuildPluginData<CountersPluginType>,
  context: Message | ChatInputCommandInteraction,
  counterName: string,
  channel: Channel | null,
  user: User | null,
) {
  const resolved = await resolveCounterAccess(pluginData, context, counterName, "edit");
  if (!resolved) return;
  const { counter } = resolved;

  if (channel && !counter.per_channel) {
    await pluginData.state.common.sendErrorMessage(context, `This counter is not per-channel`);
    return;
  }
  if (user && !counter.per_user) {
    await pluginData.state.common.sendErrorMessage(context, `This counter is not per-user`);
    return;
  }
  if (counter.per_channel && !channel) {
    await pluginData.state.common.sendErrorMessage(context, `This counter requires a channel`);
    return;
  }
  if (counter.per_user && !user) {
    await pluginData.state.common.sendErrorMessage(context, `This counter requires a user`);
    return;
  }

  await setCounterValue(pluginData, counterName, channel?.id ?? null, user?.id ?? null, counter.initial_value);

  const reply =
    channel && user
      ? `Reset **${counterName}** for <@!${user.id}> in <#${channel.id}>`
      : channel
        ? `Reset **${counterName}** in <#${channel.id}>`
        : user
          ? `Reset **${counterName}** for <@!${user.id}>`
          : `Reset **${counterName}**`;

  if (isContextInteraction(context)) {
    await sendContextResponse(context, reply, true);
  } else if (context.channel.isSendable()) {
    await context.channel.send(reply);
  }
}

export async function actualResetAllCounterValuesCmd(
  pluginData: GuildPluginData<CountersPluginType>,
  context: Message | ChatInputCommandInteraction,
  counterName: string,
  confirmed: boolean,
) {
  const resolved = await resolveCounterAccess(pluginData, context, counterName, "reset_all");
  if (!resolved) return;

  if (!confirmed) {
    await pluginData.state.common.sendErrorMessage(
      context,
      "Cancelled — re-run with confirm=true to reset all values",
    );
    return;
  }

  if (isContextInteraction(context)) {
    await context.editReply(
      `Resetting counter **${counterName}**. This might take a while. Please don't reload the config.`,
    );
  }

  await resetAllCounterValues(pluginData, counterName);

  await pluginData.state.common.sendSuccessMessage(
    context,
    `All counter values for **${counterName}** have been reset`,
  );

  pluginData.getVetyInstance().reloadGuild(pluginData.guild.id);
}
