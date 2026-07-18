import { trackerEvt } from "../types.js";

export const MemberLeaveEvt = trackerEvt({
  event: "guildMemberRemove",
  async listener({ pluginData, args: { member } }) {
    if (!pluginData.config.get().enabled) return;
    await pluginData.state.invites.markLeft(member.id);
  },
});
