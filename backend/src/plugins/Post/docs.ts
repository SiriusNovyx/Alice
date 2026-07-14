import { AlicePluginDocs } from "../../types.js";
import { zPostConfig } from "./types.js";

export const postPluginDocs: AlicePluginDocs = {
  prettyName: "Post",
  description: "Post and schedule messages. Slash commands live under `/post`.",
  configSchema: zPostConfig,
  type: "stable",
};
