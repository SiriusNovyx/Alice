import { removeInviteFromCache } from "../functions/inviteCache.js";
import { trackerEvt } from "../types.js";

export const InviteDeleteEvt = trackerEvt({
  event: "inviteDelete",
  async listener({ pluginData, args: { invite } }) {
    if (!pluginData.config.get().enabled) return;
    await removeInviteFromCache(pluginData, invite.code);
  },
});
