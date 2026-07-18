import { getLavalinkConfig } from "./lavalink.js";

export type LavalinkPlayerUpdate = {
  track?: { encoded: string | null } | null;
  volume?: number;
  paused?: boolean;
  filters?: Record<string, unknown>;
  voice?: { token: string; endpoint: string; sessionId: string };
};

export type LavalinkTrackEndHandler = (guildId: string, reason: string) => void;

type NodeState = {
  ws: WebSocket | null;
  sessionId: string | null;
  userId: string | null;
  connecting: Promise<string> | null;
  trackEndHandlers: Map<string, LavalinkTrackEndHandler>;
  playerEventWaiters: Map<string, Set<(type: string) => void>>;
};

const node: NodeState = {
  ws: null,
  sessionId: null,
  userId: null,
  connecting: null,
  trackEndHandlers: new Map(),
  playerEventWaiters: new Map(),
};

function restBase(): string {
  const cfg = getLavalinkConfig();
  if (!cfg) throw new Error("Lavalink is not configured.");
  const host = cfg.host.replace(/^https?:\/\//, "");
  return `http://${host}:${cfg.port}`;
}

function wsUrl(): string {
  const cfg = getLavalinkConfig();
  if (!cfg) throw new Error("Lavalink is not configured.");
  const host = cfg.host.replace(/^https?:\/\//, "");
  return `ws://${host}:${cfg.port}/v4/websocket`;
}

function authHeaders(): Record<string, string> {
  const cfg = getLavalinkConfig();
  if (!cfg) throw new Error("Lavalink is not configured.");
  return { Authorization: cfg.password };
}

function handleMessage(raw: string): void {
  let msg: any;
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }
  if (msg.op === "ready" && typeof msg.sessionId === "string") {
    node.sessionId = msg.sessionId;
    return;
  }
  if (msg.op === "event" && typeof msg.guildId === "string" && typeof msg.type === "string") {
    const waiters = node.playerEventWaiters.get(msg.guildId);
    if (waiters?.size) {
      for (const waiter of [...waiters]) waiter(msg.type);
    }
  }
  if (msg.op === "event" && msg.type === "TrackEndEvent" && typeof msg.guildId === "string") {
    const reason = String(msg.reason ?? "");
    const handler = node.trackEndHandlers.get(msg.guildId);
    handler?.(msg.guildId, reason);
  }
}

export function registerTrackEndHandler(guildId: string, handler: LavalinkTrackEndHandler): void {
  node.trackEndHandlers.set(guildId, handler);
}

export function unregisterTrackEndHandler(guildId: string): void {
  node.trackEndHandlers.delete(guildId);
}

/** Wait until Lavalink emits a player event of the given type for this guild. */
export function waitForPlayerEvent(
  guildId: string,
  eventType: string,
  timeoutMs = 8000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const waiters = node.playerEventWaiters.get(guildId) ?? new Set();
    node.playerEventWaiters.set(guildId, waiters);

    const cleanup = () => {
      waiters.delete(onEvent);
      if (waiters.size === 0) node.playerEventWaiters.delete(guildId);
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(`Timed out waiting for Lavalink ${eventType}.`));
    }, timeoutMs);

    const onEvent = (type: string) => {
      if (settled || type !== eventType) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      resolve();
    };

    waiters.add(onEvent);
  });
}

export async function ensureLavalinkSession(userId: string): Promise<string> {
  if (node.sessionId && node.ws && node.ws.readyState === WebSocket.OPEN && node.userId === userId) {
    return node.sessionId;
  }
  if (node.connecting) return node.connecting;

  node.connecting = new Promise<string>((resolve, reject) => {
    const cfg = getLavalinkConfig();
    if (!cfg) {
      node.connecting = null;
      reject(new Error("Lavalink is not configured."));
      return;
    }

    try {
      node.ws?.close();
    } catch {
      // ignore
    }
    node.ws = null;
    node.sessionId = null;
    node.userId = userId;

    const ws = new WebSocket(wsUrl(), {
      headers: {
        Authorization: cfg.password,
        "User-Id": userId,
        "Client-Name": "Alice/music",
      },
    } as any);

    const timeout = setTimeout(() => {
      try {
        ws.close();
      } catch {
        // ignore
      }
      node.connecting = null;
      reject(new Error("Timed out connecting to Lavalink WebSocket."));
    }, 8000);

    ws.addEventListener("open", () => {
      node.ws = ws;
    });

    ws.addEventListener("message", (ev) => {
      const data = typeof ev.data === "string" ? ev.data : String(ev.data);
      handleMessage(data);
      if (node.sessionId) {
        clearTimeout(timeout);
        node.connecting = null;
        resolve(node.sessionId);
      }
    });

    ws.addEventListener("error", () => {
      clearTimeout(timeout);
      node.connecting = null;
      node.ws = null;
      node.sessionId = null;
      reject(new Error("Lavalink WebSocket connection failed."));
    });

    ws.addEventListener("close", () => {
      if (node.ws === ws) {
        node.ws = null;
        node.sessionId = null;
      }
    });
  });

  return node.connecting;
}

export async function updateLavalinkPlayer(
  guildId: string,
  userId: string,
  body: LavalinkPlayerUpdate,
  noReplace = false,
): Promise<void> {
  const sessionId = await ensureLavalinkSession(userId);
  const url =
    `${restBase()}/v4/sessions/${encodeURIComponent(sessionId)}/players/${encodeURIComponent(guildId)}` +
    (noReplace ? "?noReplace=true" : "");
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Lavalink player update failed (HTTP ${res.status})${text ? `: ${text}` : ""}`);
  }
}

export async function destroyLavalinkPlayer(guildId: string, userId: string): Promise<void> {
  let sessionId = node.sessionId;
  if (!sessionId) {
    try {
      sessionId = await ensureLavalinkSession(userId);
    } catch {
      return;
    }
  }
  const url = `${restBase()}/v4/sessions/${encodeURIComponent(sessionId)}/players/${encodeURIComponent(guildId)}`;
  try {
    await fetch(url, {
      method: "DELETE",
      headers: authHeaders(),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // best-effort cleanup
  }
}
