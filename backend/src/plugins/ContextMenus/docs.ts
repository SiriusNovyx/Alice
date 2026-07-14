import { AlicePluginDocs } from "../../types.js";
import { zContextMenusConfig } from "./types.js";

export const contextMenuPluginDocs: AlicePluginDocs = {
  type: "stable",
  configSchema: zContextMenusConfig,

  prettyName: "Context menu",
};
