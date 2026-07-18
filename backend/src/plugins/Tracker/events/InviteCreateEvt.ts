import { upsertInviteInCache } from "../functions/inviteCache.js";
import { trackerEvt } from "../types.js";

export const InviteCreateEvt = trackerEvt({
  event: "inviteCreate",
  async listener({ pluginData, args: { invite } }) {
    if (!pluginData.config.get().enabled) return;
    await upsertInviteInCache(pluginData, invite.code, invite.inviter?.id ?? null, invite.uses ?? 0);
  },
});
