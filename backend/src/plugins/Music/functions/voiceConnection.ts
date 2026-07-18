import {
  GatewayOpcodes,
  Status,
  type GatewayVoiceServerUpdateDispatchData,
  type GatewayVoiceStateUpdateDispatchData,
  type Guild,
  type InternalDiscordGatewayAdapterImplementerMethods,
} from "discord.js";

export type DiscordVoiceCredentials = {
  token: string;
  endpoint: string;
  sessionId: string;
};

export type JoinVoiceResult = {
  credentials: DiscordVoiceCredentials;
  reused: boolean;
};

type GuildVoiceHandle = {
  adapter: InternalDiscordGatewayAdapterImplementerMethods;
  channelId: string | null;
  credentials: DiscordVoiceCredentials | null;
  onCredentialsUpdate: ((creds: DiscordVoiceCredentials) => void) | null;
};

const handles = new Map<string, GuildVoiceHandle>();

function credsEqual(a: DiscordVoiceCredentials | null, b: DiscordVoiceCredentials): boolean {
  return Boolean(
    a && a.token === b.token && a.endpoint === b.endpoint && a.sessionId === b.sessionId,
  );
}

function waitForCredentials(
  guild: Guild,
  channelId: string,
  timeoutMs = 10000,
): Promise<DiscordVoiceCredentials> {
  return new Promise((resolve, reject) => {
    let server: GatewayVoiceServerUpdateDispatchData | undefined;
    let state: GatewayVoiceStateUpdateDispatchData | undefined;
    let settled = false;

    const finish = (err?: Error, creds?: DiscordVoiceCredentials) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) reject(err);
      else if (creds) resolve(creds);
    };

    const applyCredentials = (creds: DiscordVoiceCredentials) => {
      const handle = handles.get(guild.id);
      if (!handle) return;
      const changed = !credsEqual(handle.credentials, creds);
      handle.credentials = creds;
      if (settled && changed) {
        handle.onCredentialsUpdate?.(creds);
      }
      if (!settled) finish(undefined, creds);
    };

    const tryResolve = () => {
      if (server?.token && server.endpoint && state?.session_id) {
        applyCredentials({
          token: server.token,
          endpoint: server.endpoint,
          sessionId: state.session_id,
        });
      }
    };

    const adapter = guild.voiceAdapterCreator({
      onVoiceServerUpdate(data) {
        server = data;
        tryResolve();
      },
      onVoiceStateUpdate(data) {
        state = data;
        tryResolve();
      },
      destroy() {
        handles.delete(guild.id);
      },
    });

    handles.set(guild.id, {
      adapter,
      channelId,
      credentials: null,
      onCredentialsUpdate: null,
    });

    const sent = adapter.sendPayload({
      op: GatewayOpcodes.VoiceStateUpdate,
      d: {
        guild_id: guild.id,
        channel_id: channelId,
        self_mute: false,
        self_deaf: true,
      },
    });

    if (!sent) {
      adapter.destroy();
      finish(new Error("Discord gateway is not ready to join voice."));
      return;
    }

    const timer = setTimeout(() => {
      try {
        adapter.destroy();
      } catch {
        // ignore
      }
      handles.delete(guild.id);
      finish(new Error("Timed out waiting for Discord voice credentials."));
    }, timeoutMs);
  });
}

/** Join (or move to) a voice channel and return Discord voice credentials for Lavalink. */
export async function joinVoiceChannel(
  guild: Guild,
  channelId: string,
): Promise<JoinVoiceResult> {
  const existing = handles.get(guild.id);
  if (existing?.channelId === channelId && existing.credentials) {
    const me = guild.members.me ?? guild.members.cache.get(guild.client.user!.id);
    if (me?.voice.channelId === channelId) {
      return { credentials: existing.credentials, reused: true };
    }
  }
  if (existing) {
    try {
      existing.adapter.destroy();
    } catch {
      // ignore
    }
    handles.delete(guild.id);
  }
  const credentials = await waitForCredentials(guild, channelId);
  return { credentials, reused: false };
}

/** Keep Lavalink voice credentials in sync when Discord rotates endpoint/token. */
export function setVoiceCredentialsListener(
  guildId: string,
  listener: ((creds: DiscordVoiceCredentials) => void) | null,
): void {
  const handle = handles.get(guildId);
  if (handle) handle.onCredentialsUpdate = listener;
}

export function leaveVoiceChannel(guild: Guild): void {
  const handle = handles.get(guild.id);
  if (handle) {
    handle.onCredentialsUpdate = null;
    handle.adapter.sendPayload({
      op: GatewayOpcodes.VoiceStateUpdate,
      d: {
        guild_id: guild.id,
        channel_id: null,
        self_mute: false,
        self_deaf: false,
      },
    });
    handle.adapter.destroy();
    handles.delete(guild.id);
  } else if (guild.shard.status === Status.Ready) {
    guild.shard.send({
      op: GatewayOpcodes.VoiceStateUpdate,
      d: {
        guild_id: guild.id,
        channel_id: null,
        self_mute: false,
        self_deaf: false,
      },
    });
  }
}

export function getConnectedVoiceChannelId(guildId: string): string | null {
  return handles.get(guildId)?.channelId ?? null;
}
