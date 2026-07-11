import { ChatInputCommandInteraction, Message, SendableChannels } from "discord.js";
import { escapeCodeBlock } from "discord.js";
import moment from "moment-timezone";
import { GuildPluginData } from "vety";
import { clearUpcomingScheduledPost } from "../../../data/loops/upcomingScheduledPostsLoop.js";
import { humanizeDuration } from "../../../humanizeDuration.js";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { createChunkedMessage, DBDateFormat, deactivateMentions, sorter, trimLines } from "../../../utils.js";
import { TimeAndDatePlugin } from "../../TimeAndDate/TimeAndDatePlugin.js";
import { PostPluginType } from "../types.js";
import { postMessage } from "./postMessage.js";

const SCHEDULED_POST_PREVIEW_TEXT_LENGTH = 50;

export async function actualScheduledPostsListCmd(
  pluginData: GuildPluginData<PostPluginType>,
  context: Message | ChatInputCommandInteraction,
) {
  const scheduledPosts = await pluginData.state.scheduledPosts.all();
  if (scheduledPosts.length === 0) {
    if (isContextInteraction(context)) {
      await sendContextResponse(context, "No scheduled posts", true);
    } else if (context.channel.isSendable()) {
      await context.channel.send("No scheduled posts");
    }
    return;
  }

  scheduledPosts.sort(sorter("post_at"));

  let i = 1;
  const postLines = scheduledPosts.map((p) => {
    let previewText = p.content.content || p.content.embeds?.[0]?.description || p.content.embeds?.[0]?.title || "";

    const isTruncated = previewText.length > SCHEDULED_POST_PREVIEW_TEXT_LENGTH;

    previewText = escapeCodeBlock(deactivateMentions(previewText))
      .replace(/\s+/g, " ")
      .slice(0, SCHEDULED_POST_PREVIEW_TEXT_LENGTH);

    const timeAndDate = pluginData.getPlugin(TimeAndDatePlugin);
    const prettyPostAt = timeAndDate
      .inGuildTz(moment.utc(p.post_at!, DBDateFormat))
      .format(timeAndDate.getDateFormat("pretty_datetime"));
    const parts = [`\`#${i++}\` \`[${prettyPostAt}]\` ${previewText}${isTruncated ? "..." : ""}`];
    if (p.attachments.length) parts.push("*(with attachment)*");
    if (p.content.embeds?.length) parts.push("*(embed)*");
    if (p.repeat_until) {
      parts.push(`*(repeated every ${humanizeDuration(p.repeat_interval)} until ${p.repeat_until})*`);
    }
    if (p.repeat_times) {
      parts.push(
        `*(repeated every ${humanizeDuration(p.repeat_interval)}, ${p.repeat_times} more ${
          p.repeat_times === 1 ? "time" : "times"
        })*`,
      );
    }
    parts.push(`*(${p.author_name})*`);

    return parts.join(" ");
  });

  const finalMessage = trimLines(`
      ${postLines.join("\n")}

      Use \`scheduled_posts <num>\` to view a scheduled post in full
      Use \`scheduled_posts delete <num>\` to delete a scheduled post
    `);

  if (isContextInteraction(context)) {
    await sendContextResponse(context, finalMessage, true);
  } else if (context.channel.isSendable()) {
    await createChunkedMessage(context.channel as SendableChannels, finalMessage);
  }
}

export async function actualScheduledPostsShowCmd(
  pluginData: GuildPluginData<PostPluginType>,
  context: Message | ChatInputCommandInteraction,
  num: number,
) {
  const scheduledPosts = await pluginData.state.scheduledPosts.all();
  scheduledPosts.sort(sorter("post_at"));
  const post = scheduledPosts[num - 1];
  if (!post) {
    await pluginData.state.common.sendErrorMessage(context, "Scheduled post not found");
    return;
  }

  const channel = isContextInteraction(context) ? context.channel : context.channel;
  if (!channel?.isTextBased()) {
    await pluginData.state.common.sendErrorMessage(context, "Cannot show post in this channel");
    return;
  }

  await postMessage(pluginData, channel as any, post.content, post.attachments, post.enable_mentions);
  if (isContextInteraction(context)) {
    await pluginData.state.common.sendSuccessMessage(context, "Scheduled post preview posted");
  }
}

export async function actualScheduledPostsDeleteCmd(
  pluginData: GuildPluginData<PostPluginType>,
  context: Message | ChatInputCommandInteraction,
  num: number,
) {
  const scheduledPosts = await pluginData.state.scheduledPosts.all();
  scheduledPosts.sort(sorter("post_at"));
  const post = scheduledPosts[num - 1];
  if (!post) {
    await pluginData.state.common.sendErrorMessage(context, "Scheduled post not found");
    return;
  }

  clearUpcomingScheduledPost(post);
  await pluginData.state.scheduledPosts.delete(post.id);
  await pluginData.state.common.sendSuccessMessage(context, "Scheduled post deleted!");
}
