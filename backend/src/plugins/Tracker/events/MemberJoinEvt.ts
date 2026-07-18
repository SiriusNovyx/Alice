import moment from "moment-timezone";
import { DAYS, DBDateFormat } from "../../../utils.js";
import { refreshInviteCache } from "../functions/inviteCache.js";
import { trackerEvt } from "../types.js";

const FAKE_ACCOUNT_AGE_MS = 7 * DAYS;

export const MemberJoinEvt = trackerEvt({
  event: "guildMemberAdd",
  async listener({ pluginData, args: { member } }) {
    if (!pluginData.config.get().enabled) return;
    if (member.user.bot) return;

    const previousUses = new Map(pluginData.state.inviteUses);

    let invites;
    try {
      invites = await pluginData.guild.invites.fetch();
    } catch {
      return;
    }

    let inviterId: string | null = null;
    for (const inv of invites.values()) {
      const prev = previousUses.get(inv.code) ?? 0;
      if ((inv.uses ?? 0) > prev) {
        inviterId = inv.inviter?.id ?? null;
        break;
      }
    }

    // Refresh cache after comparison
    const entries = [...invites.values()].map((inv) => ({
      code: inv.code,
      inviter_id: inv.inviter?.id ?? null,
      uses: inv.uses ?? 0,
    }));
    pluginData.state.inviteUses.clear();
    for (const entry of entries) {
      pluginData.state.inviteUses.set(entry.code, entry.uses);
    }
    await pluginData.state.invites.replaceCache(entries).catch(() => undefined);

    if (!inviterId) {
      // Vanity / unknown — keep cache warm for next join
      if (pluginData.state.inviteUses.size === 0) {
        await refreshInviteCache(pluginData);
      }
      return;
    }

    const fake = Date.now() - member.user.createdTimestamp < FAKE_ACCOUNT_AGE_MS;
    await pluginData.state.invites.recordJoin({
      inviter_id: inviterId,
      invited_id: member.id,
      joined_at: moment.utc().format(DBDateFormat),
      fake,
    });
  },
});
