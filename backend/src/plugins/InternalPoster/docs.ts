import { AlicePluginDocs } from "../../types.js";
import { zInternalPosterConfig } from "./types.js";

export const internalPosterPluginDocs: AlicePluginDocs = {
  prettyName: "Internal poster",
  type: "internal",
  configSchema: zInternalPosterConfig,
};
