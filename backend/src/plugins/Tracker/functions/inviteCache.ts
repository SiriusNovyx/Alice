import { GuildPluginData } from "vety";
import { TrackerPluginType } from "../types.js";

/** Fetch guild invites into memory + DB cache. No-op if the bot lacks permission. */
export async function refreshInviteCache(pluginData: GuildPluginData<TrackerPluginType>): Promise<void> {
  try {
    const invites = await pluginData.guild.invites.fetch();
    const entries = [...invites.values()].map((inv) => ({
      code: inv.code,
      inviter_id: inv.inviter?.id ?? null,
      uses: inv.uses ?? 0,
    }));

    pluginData.state.inviteUses.clear();
    for (const entry of entries) {
      pluginData.state.inviteUses.set(entry.code, entry.uses);
    }
    await pluginData.state.invites.replaceCache(entries);
  } catch {
    // Missing Manage Guild / Vanity URL permission — invite tracking stays best-effort
  }
}

export async function upsertInviteInCache(
  pluginData: GuildPluginData<TrackerPluginType>,
  code: string,
  inviterId: string | null,
  uses: number,
): Promise<void> {
  pluginData.state.inviteUses.set(code, uses);
  await pluginData.state.invites.upsertCache(code, inviterId, uses);
}

export async function removeInviteFromCache(
  pluginData: GuildPluginData<TrackerPluginType>,
  code: string,
): Promise<void> {
  pluginData.state.inviteUses.delete(code);
  const remaining = (await pluginData.state.invites.listCache())
    .filter((row) => row.code !== code)
    .map((row) => ({
      code: row.code,
      inviter_id: row.inviter_id,
      uses: row.uses,
    }));
  await pluginData.state.invites.replaceCache(remaining);
}
