import { env } from "./env.js";

/**
 * Alice staff have full access to the dashboard
 */
export function isStaff(userId: string) {
  return (env.STAFF ?? []).includes(userId);
}
