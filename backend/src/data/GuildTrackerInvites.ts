import { Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository.js";
import { dataSource } from "./dataSource.js";
import { TrackerInvite } from "./entities/TrackerInvite.js";
import { TrackerInviteCache } from "./entities/TrackerInviteCache.js";

export class GuildTrackerInvites extends BaseGuildRepository {
  private invites: Repository<TrackerInvite>;
  private cache: Repository<TrackerInviteCache>;

  constructor(guildId: string) {
    super(guildId);
    this.invites = dataSource.getRepository(TrackerInvite);
    this.cache = dataSource.getRepository(TrackerInviteCache);
  }

  findByInvited(invitedId: string): Promise<TrackerInvite | null> {
    return this.invites.findOne({ where: { guild_id: this.guildId, invited_id: invitedId } });
  }

  findByInviter(inviterId: string): Promise<TrackerInvite[]> {
    return this.invites.find({ where: { guild_id: this.guildId, inviter_id: inviterId } });
  }

  async recordJoin(data: {
    inviter_id: string;
    invited_id: string;
    joined_at: string;
    fake?: boolean;
  }): Promise<void> {
    await this.invites
      .createQueryBuilder()
      .insert()
      .into(TrackerInvite)
      .values({
        guild_id: this.guildId,
        inviter_id: data.inviter_id,
        invited_id: data.invited_id,
        joined_at: data.joined_at,
        fake: data.fake ?? false,
        has_left: false,
      })
      .orIgnore()
      .execute();
  }

  async markLeft(invitedId: string): Promise<void> {
    await this.invites.update(
      { guild_id: this.guildId, invited_id: invitedId },
      { has_left: true },
    );
  }

  async markFake(invitedId: string, fake = true): Promise<void> {
    await this.invites.update(
      { guild_id: this.guildId, invited_id: invitedId },
      { fake },
    );
  }

  async countForInviter(inviterId: string): Promise<{ total: number; fake: number; left: number }> {
    const rows = await this.findByInviter(inviterId);
    let fake = 0;
    let left = 0;
    for (const row of rows) {
      if (row.fake) fake++;
      if (row.has_left) left++;
    }
    return { total: rows.length, fake, left };
  }

  listCache(): Promise<TrackerInviteCache[]> {
    return this.cache.find({ where: { guild_id: this.guildId } });
  }

  async upsertCache(code: string, inviterId: string | null, uses: number): Promise<void> {
    await this.cache
      .createQueryBuilder()
      .insert()
      .into(TrackerInviteCache)
      .values({
        guild_id: this.guildId,
        code,
        inviter_id: inviterId,
        uses,
      })
      .orUpdate({
        conflict_target: ["guild_id", "code"],
        overwrite: ["inviter_id", "uses"],
      })
      .execute();
  }

  async replaceCache(entries: Array<{ code: string; inviter_id: string | null; uses: number }>): Promise<void> {
    await this.cache.delete({ guild_id: this.guildId });
    if (entries.length === 0) return;
    await this.cache.insert(
      entries.map((e) => ({
        guild_id: this.guildId,
        code: e.code,
        inviter_id: e.inviter_id,
        uses: e.uses,
      })),
    );
  }

  async clearCache(): Promise<void> {
    await this.cache.delete({ guild_id: this.guildId });
  }
}
