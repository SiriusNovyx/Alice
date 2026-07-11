// tslint:disable:no-console

import moment from "moment-timezone";
import { lazyMemoize, MINUTES, SECONDS } from "../../utils.js";
import { TempRole } from "../entities/TempRole.js";
import { emitGuildEvent, hasGuildEventListener } from "../GuildEvents.js";
import { TempRoles } from "../TempRoles.js";
import Timeout = NodeJS.Timeout;

const LOOP_INTERVAL = 15 * MINUTES;
const MAX_TRIES_PER_SERVER = 3;
const getTempRolesRepository = lazyMemoize(() => new TempRoles());
const timeouts = new Map<string, Timeout>();

function tempRoleToKey(tempRole: TempRole) {
  return `${tempRole.guild_id}/${tempRole.user_id}/${tempRole.role_id}`;
}

async function broadcastExpiredTempRole(guildId: string, userId: string, roleId: string, tries = 0): Promise<void> {
  const tempRole = await getTempRolesRepository().findTempRole(guildId, userId, roleId);
  if (!tempRole) {
    // Temp role was already cleared
    return;
  }
  if (!tempRole.expires_at || moment(tempRole.expires_at).diff(moment()) > 10 * SECONDS) {
    // Duration was changed and it's no longer expiring now
    return;
  }

  if (!hasGuildEventListener(tempRole.guild_id, "expiredTempRole")) {
    if (tries < MAX_TRIES_PER_SERVER) {
      timeouts.set(
        tempRoleToKey(tempRole),
        setTimeout(() => broadcastExpiredTempRole(guildId, userId, roleId, tries + 1), 1 * MINUTES),
      );
    }
    return;
  }
  console.log(
    `[EXPIRING TEMP ROLES LOOP] Broadcasting expired temp role: ${tempRole.guild_id}/${tempRole.user_id}/${tempRole.role_id}`,
  );
  emitGuildEvent(tempRole.guild_id, "expiredTempRole", [tempRole]);
}

export async function runExpiringTempRolesLoop() {
  console.log("[EXPIRING TEMP ROLES LOOP] Clearing old timeouts");
  for (const timeout of timeouts.values()) {
    clearTimeout(timeout);
  }

  console.log("[EXPIRING TEMP ROLES LOOP] Setting timeouts for expiring temp roles");
  const expiringTempRoles = await getTempRolesRepository().getSoonExpiringTempRoles(LOOP_INTERVAL);
  for (const tempRole of expiringTempRoles) {
    const remaining = Math.max(0, moment.utc(tempRole.expires_at!).diff(moment.utc()));
    timeouts.set(
      tempRoleToKey(tempRole),
      setTimeout(
        () => broadcastExpiredTempRole(tempRole.guild_id, tempRole.user_id, tempRole.role_id),
        remaining,
      ),
    );
  }

  console.log("[EXPIRING TEMP ROLES LOOP] Scheduling next loop");
  setTimeout(() => runExpiringTempRolesLoop(), LOOP_INTERVAL);
}

export function registerExpiringTempRole(tempRole: TempRole) {
  clearExpiringTempRole(tempRole);

  console.log("[EXPIRING TEMP ROLES LOOP] Registering new expiring temp role");
  const remaining = Math.max(0, moment.utc(tempRole.expires_at).diff(moment.utc()));
  if (remaining > LOOP_INTERVAL) {
    return;
  }

  timeouts.set(
    tempRoleToKey(tempRole),
    setTimeout(
      () => broadcastExpiredTempRole(tempRole.guild_id, tempRole.user_id, tempRole.role_id),
      remaining,
    ),
  );
}

export function clearExpiringTempRole(tempRole: TempRole) {
  console.log("[EXPIRING TEMP ROLES LOOP] Clearing expiring temp role");
  if (timeouts.has(tempRoleToKey(tempRole))) {
    clearTimeout(timeouts.get(tempRoleToKey(tempRole))!);
  }
}
