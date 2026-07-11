import {
  ChatInputCommandInteraction,
  GuildTextBasedChannel,
  Message,
  User,
} from "discord.js";
import { GuildPluginData } from "vety";
import moment from "moment-timezone";
import { registerUpcomingScheduledPost } from "../../../data/loops/upcomingScheduledPostsLoop.js";
import { humanizeDuration } from "../../../humanizeDuration.js";
import { isContextMessage } from "../../../pluginUtils.js";
import { DBDateFormat, MINUTES, StrictMessageContent, renderUsername } from "../../../utils.js";
import { LogsPlugin } from "../../Logs/LogsPlugin.js";
import { TimeAndDatePlugin } from "../../TimeAndDate/TimeAndDatePlugin.js";
import { PostPluginType } from "../types.js";
import { parseScheduleTime } from "./parseScheduleTime.js";
import { postMessage } from "./postMessage.js";

const MIN_REPEAT_TIME = 5 * MINUTES;
const MAX_REPEAT_TIME = Math.pow(2, 32);
const MAX_REPEAT_UNTIL = moment.utc().add(100, "years");

export async function actualPostCmd(
  pluginData: GuildPluginData<PostPluginType>,
  context: Message | ChatInputCommandInteraction,
  author: User,
  targetChannel: GuildTextBasedChannel,
  content: StrictMessageContent,
  opts: {
    "enable-mentions"?: boolean;
    schedule?: string;
    repeat?: number;
    "repeat-until"?: string;
    "repeat-times"?: number;
  } = {},
) {
  if (!targetChannel.isSendable()) {
    await pluginData.state.common.sendErrorMessage(context, "Specified channel is not a sendable channel");
    return;
  }

  const attachments = isContextMessage(context) ? [...context.attachments.values()] : [];

  if (content == null && attachments.length === 0) {
    await pluginData.state.common.sendErrorMessage(context, "Message content or attachment required");
    return;
  }

  if (opts.repeat) {
    if (opts.repeat < MIN_REPEAT_TIME) {
      await pluginData.state.common.sendErrorMessage(
        context,
        `Minimum time for -repeat is ${humanizeDuration(MIN_REPEAT_TIME)}`,
      );
      return;
    }
    if (opts.repeat > MAX_REPEAT_TIME) {
      await pluginData.state.common.sendErrorMessage(
        context,
        `Max time for -repeat is ${humanizeDuration(MAX_REPEAT_TIME)}`,
      );
      return;
    }
  }

  let postAt;
  if (opts.schedule) {
    postAt = await parseScheduleTime(pluginData, author.id, opts.schedule);
    if (!postAt) {
      await pluginData.state.common.sendErrorMessage(context, "Invalid schedule time");
      return;
    }
  } else if (opts.repeat) {
    postAt = moment.utc().add(opts.repeat, "ms");
  }

  let repeatUntil: moment.Moment | null = null;
  let repeatTimes: number | null = null;
  let repeatDetailsStr: string | null = null;

  if (opts["repeat-until"]) {
    repeatUntil = await parseScheduleTime(pluginData, author.id, opts["repeat-until"]);

    if (!repeatUntil) {
      await pluginData.state.common.sendErrorMessage(context, "Invalid time specified for -repeat-until");
      return;
    }
    if (repeatUntil.isBefore(moment.utc())) {
      await pluginData.state.common.sendErrorMessage(context, "You can't set -repeat-until in the past");
      return;
    }
    if (repeatUntil.isAfter(MAX_REPEAT_UNTIL)) {
      await pluginData.state.common.sendErrorMessage(
        context,
        "Unfortunately, -repeat-until can only be at most 100 years into the future. Maybe 99 years would be enough?",
      );
      return;
    }
  } else if (opts["repeat-times"]) {
    repeatTimes = opts["repeat-times"];
    if (repeatTimes <= 0) {
      await pluginData.state.common.sendErrorMessage(context, "-repeat-times must be 1 or more");
      return;
    }
  }

  if (repeatUntil && repeatTimes) {
    await pluginData.state.common.sendErrorMessage(
      context,
      "You can only use one of -repeat-until or -repeat-times at once",
    );
    return;
  }

  if (opts.repeat && !repeatUntil && !repeatTimes) {
    await pluginData.state.common.sendErrorMessage(
      context,
      "You must specify -repeat-until or -repeat-times for repeated messages",
    );
    return;
  }

  if (opts.repeat) {
    repeatDetailsStr = repeatUntil
      ? `every ${humanizeDuration(opts.repeat)} until ${repeatUntil.format(DBDateFormat)}`
      : `every ${humanizeDuration(opts.repeat)}, ${repeatTimes} times in total`;
  }

  const timeAndDate = pluginData.getPlugin(TimeAndDatePlugin);

  if (postAt) {
    if (postAt < moment.utc()) {
      await pluginData.state.common.sendErrorMessage(context, "Post can't be scheduled to be posted in the past");
      return;
    }

    const post = await pluginData.state.scheduledPosts.create({
      author_id: author.id,
      author_name: renderUsername(author),
      channel_id: targetChannel.id,
      content,
      attachments,
      post_at: postAt.clone().tz("Etc/UTC").format(DBDateFormat),
      enable_mentions: opts["enable-mentions"],
      repeat_interval: opts.repeat,
      repeat_until: repeatUntil ? repeatUntil.clone().tz("Etc/UTC").format(DBDateFormat) : null,
      repeat_times: repeatTimes ?? null,
    });
    registerUpcomingScheduledPost(post);

    if (opts.repeat) {
      pluginData.getPlugin(LogsPlugin).logScheduledRepeatedMessage({
        author,
        channel: targetChannel,
        datetime: postAt.format(timeAndDate.getDateFormat("pretty_datetime")),
        date: postAt.format(timeAndDate.getDateFormat("date")),
        time: postAt.format(timeAndDate.getDateFormat("time")),
        repeatInterval: humanizeDuration(opts.repeat),
        repeatDetails: repeatDetailsStr!,
      });
    } else {
      pluginData.getPlugin(LogsPlugin).logScheduledMessage({
        author,
        channel: targetChannel,
        datetime: postAt.format(timeAndDate.getDateFormat("pretty_datetime")),
        date: postAt.format(timeAndDate.getDateFormat("date")),
        time: postAt.format(timeAndDate.getDateFormat("time")),
      });
    }
  }

  if (!opts.schedule) {
    await postMessage(pluginData, targetChannel, content, attachments, opts["enable-mentions"]);
  }

  if (opts.repeat) {
    pluginData.getPlugin(LogsPlugin).logRepeatedMessage({
      author,
      channel: targetChannel,
      datetime: postAt.format(timeAndDate.getDateFormat("pretty_datetime")),
      date: postAt.format(timeAndDate.getDateFormat("date")),
      time: postAt.format(timeAndDate.getDateFormat("time")),
      repeatInterval: humanizeDuration(opts.repeat),
      repeatDetails: repeatDetailsStr ?? "",
    });
  }

  let successMessage = opts.schedule
    ? `Message scheduled to be posted in <#${targetChannel.id}> on ${postAt.format(
        timeAndDate.getDateFormat("pretty_datetime"),
      )}`
    : `Message posted in <#${targetChannel.id}>`;

  if (opts.repeat) {
    successMessage += `. Message will be automatically reposted every ${humanizeDuration(opts.repeat)}`;

    if (repeatUntil) {
      successMessage += ` until ${repeatUntil.format(timeAndDate.getDateFormat("pretty_datetime"))}`;
    } else if (repeatTimes) {
      successMessage += `, ${repeatTimes} times in total`;
    }

    successMessage += ".";
  }

  if (targetChannel.id !== context.channelId || opts.schedule || opts.repeat) {
    await pluginData.state.common.sendSuccessMessage(context, successMessage);
  } else if (!isContextMessage(context)) {
    await pluginData.state.common.sendSuccessMessage(context, successMessage);
  }
}
