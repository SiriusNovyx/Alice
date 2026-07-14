import { AlicePluginDocs } from "../../types.js";
import { zRoleManagerConfig } from "./types.js";

export const roleManagerPluginDocs: AlicePluginDocs = {
  prettyName: "Role manager",
  type: "internal",
  configSchema: zRoleManagerConfig,
};
