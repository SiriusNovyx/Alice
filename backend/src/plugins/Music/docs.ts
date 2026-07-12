import { ZeppelinPluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zMusicConfig } from "./types.js";

export const musicPluginDocs: ZeppelinPluginDocs = {
  type: "stable",
  prettyName: "Music",
  description: trimPluginDescription(`
    Lavalink-backed music: play/queue/skip/pause/volume/filters/247.
    Soft-fails when Lavalink is missing or unreachable.
    Set \`LAVALINK_HOST\`, \`LAVALINK_PORT\`, and \`LAVALINK_PASSWORD\`.
    Dev: \`docker compose --profile music up lavalink\`.
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    music:
      config:
        enabled: true
        stay_247: false
        default_volume: 100
    ~~~
  `),
  configSchema: zMusicConfig,
};
