import { GuildPluginData } from "vety";
import { SpamPluginType } from "../types.js";

const MAX_INTERVAL = 300;
// Keep lastHandledMsgIds entries for at most this many ms to prevent unbounded growth
const LAST_HANDLED_EXPIRY_MS = 1000 * MAX_INTERVAL * 2;

export function clearOldRecentActions(pluginData: GuildPluginData<SpamPluginType>) {
  // Clear expired recent actions
  const expiryTimestamp = Date.now() - 1000 * MAX_INTERVAL;
  pluginData.state.recentActions = pluginData.state.recentActions.filter(
    (action) => action.timestamp >= expiryTimestamp,
  );

  // Also prune lastHandledMsgIds entries older than LAST_HANDLED_EXPIRY_MS
  // to prevent the map from growing indefinitely over time
  const now = Date.now();
  for (const [userId, channelMap] of pluginData.state.lastHandledMsgIds.entries()) {
    for (const [channelId, msgId] of channelMap.entries()) {
      // Discord snowflake IDs encode timestamp in the top bits
      const msgTimestamp = (BigInt(msgId) >> 22n) + 1420070400000n;
      if (now - Number(msgTimestamp) > LAST_HANDLED_EXPIRY_MS) {
        channelMap.delete(channelId);
      }
    }
    if (channelMap.size === 0) {
      pluginData.state.lastHandledMsgIds.delete(userId);
    }
  }
}
