"""
Transcript routes.

POST /t/create    — Alice sends message data, gets back a transcript ID
GET  /t/{id}      — Serves the HTML transcript page
DELETE /t/{id}    — Alice marks an expired transcript for cleanup (optional)
"""

from __future__ import annotations

import asyncio
import hashlib
import html
import json
import os
import re
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse

router = APIRouter(prefix="/t")

# ── Storage ──────────────────────────────────────────────────────────────────
STORE_DIR = Path(os.getenv("TRANSCRIPT_STORE_DIR", "./store/transcripts"))
STORE_DIR.mkdir(parents=True, exist_ok=True)

_ARCHIVE_ID_PATTERN = re.compile(r"^[0-9a-f]{16}$")
_URL_PATTERN = re.compile(r"https?://[^\s<>\"']+")

MAX_MESSAGES = int(os.getenv("TRANSCRIPT_MAX_MESSAGES", "5000"))
MAX_BODY_BYTES = int(os.getenv("TRANSCRIPT_MAX_BODY_BYTES", str(8 * 1024 * 1024)))

# ── Auth ──────────────────────────────────────────────────────────────────────
_SECRET = os.getenv("TRANSCRIPT_SECRET", "change-me-in-env")

# ── CSS (module-level; avoid rebuilding per request) ──────────────────────────
_TRANSCRIPT_CSS = """
    :root {
      --bg:       #0d1117;
      --surface:  #161b22;
      --border:   #30363d;
      --accent:   #6366f1;
      --text-1:   #e6edf3;
      --text-2:   #8b949e;
      --text-3:   #6e7681;
      --author:   #a5b4fc;
      --ts:       #6e7681;
      --channel:  #818cf8;
      --att-bg:   #1c2128;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text-1);
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.6;
    }
    header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 20px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .header-left { display: flex; flex-direction: column; gap: 4px; }
    .server-name { font-size: 18px; font-weight: 700; color: var(--text-1); }
    .server-id   { font-size: 12px; color: var(--text-3); font-family: monospace; }
    .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .msg-count   { font-size: 13px; color: var(--text-2); }
    .created-at  { font-size: 12px; color: var(--text-3); }
    .expiry      { font-size: 12px; color: #f59e0b; }
    .messages    { max-width: 900px; margin: 0 auto; padding: 16px 24px; }
    .message     {
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 2px;
      transition: background 0.1s;
    }
    .message:hover { background: var(--surface); }
    .message-header {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 4px;
    }
    .author    { font-weight: 600; color: var(--author); }
    .user-id   { font-size: 11px; color: var(--text-3); font-family: monospace; }
    .channel   { font-size: 11px; color: var(--channel); }
    .timestamp { font-size: 11px; color: var(--ts); margin-left: auto; }
    .message-content { color: var(--text-1); white-space: pre-wrap; word-break: break-word; }
    .message-content a { color: var(--accent); text-decoration: none; }
    .message-content a:hover { text-decoration: underline; }
    .empty     { color: var(--text-3); font-style: italic; }
    .attachment { margin-top: 8px; }
    .attachment img {
      max-width: 400px;
      max-height: 300px;
      border-radius: 6px;
      border: 1px solid var(--border);
      display: block;
    }
    .attachment a {
      color: var(--accent);
      text-decoration: none;
      font-size: 13px;
    }
    .attachment a:hover { text-decoration: underline; }
    footer {
      text-align: center;
      padding: 24px;
      color: var(--text-3);
      font-size: 12px;
      border-top: 1px solid var(--border);
      margin-top: 32px;
    }
    @media (max-width: 600px) {
      header { padding: 16px; }
      .messages { padding: 12px 16px; }
      .timestamp { margin-left: 0; }
    }
"""


def _check_auth(authorization: str | None) -> bool:
    if not authorization:
        return False
    token = authorization.removeprefix("Bearer ").strip()
    return secrets.compare_digest(token, _SECRET)


def _store_dir() -> Path:
    return STORE_DIR.resolve()


def _validate_archive_id(archive_id: object) -> str:
    if not isinstance(archive_id, str) or not _ARCHIVE_ID_PATTERN.fullmatch(archive_id):
        raise HTTPException(status_code=404, detail="Transcript not found")
    return archive_id


def _path_in_store(file_name: str) -> Path:
    """Resolve a basename under the store dir; reject path traversal."""
    if os.path.basename(file_name) != file_name:
        raise HTTPException(status_code=404, detail="Transcript not found")

    base_dir = _store_dir()
    resolved = Path(os.path.normpath(os.path.join(str(base_dir), file_name))).resolve()
    try:
        resolved.relative_to(base_dir)
    except ValueError:
        raise HTTPException(status_code=404, detail="Transcript not found") from None

    return resolved


def _transcript_path_for_id(validated_id: str) -> Path:
    """Map a validated archive ID to a file inside the transcript store."""
    return _path_in_store(f"{validated_id}.html")


def _meta_path_for_id(validated_id: str) -> Path:
    return _path_in_store(f"{validated_id}.meta.json")


def _delete_transcript(validated_id: str) -> bool:
    file_path = _transcript_path_for_id(validated_id)
    meta_path = _meta_path_for_id(validated_id)
    deleted = False
    if file_path.is_file():
        file_path.unlink()
        deleted = True
    if meta_path.is_file():
        meta_path.unlink()
        deleted = True
    return deleted


def _content_hash_id(guild_id: str, messages: list[dict[str, Any]]) -> str:
    """Stable ID from guild + message fingerprint (ids / timestamps / content lengths)."""
    parts: list[str] = [guild_id]
    for msg in messages:
        msg_id = str(msg.get("id") or msg.get("message_id") or "")
        ts = str(msg.get("timestamp") or msg.get("posted_at") or "")
        content = str(msg.get("content") or "")
        parts.append(f"{msg_id}:{ts}:{len(content)}")
    raw = "|".join(parts)
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def _write_transcript_files(
    archive_id: str,
    html_content: str,
    expires_at: str | None,
) -> None:
    file_path = _transcript_path_for_id(archive_id)
    file_path.write_text(html_content, encoding="utf-8")
    if expires_at:
        meta_path = _meta_path_for_id(archive_id)
        meta_path.write_text(
            json.dumps({"expires_at": expires_at}, separators=(",", ":")),
            encoding="utf-8",
        )


def cleanup_expired_transcripts() -> int:
    """Delete expired .html + .meta.json pairs. Returns number of transcripts removed."""
    removed = 0
    now = datetime.now(timezone.utc)
    store = _store_dir()
    if not store.is_dir():
        return 0

    for meta_path in store.glob("*.meta.json"):
        stem = meta_path.name.removesuffix(".meta.json")
        if not _ARCHIVE_ID_PATTERN.fullmatch(stem):
            continue
        try:
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
            expires_raw = meta.get("expires_at")
            if not expires_raw:
                continue
            expires_at = datetime.fromisoformat(str(expires_raw).replace("Z", "+00:00"))
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at > now:
                continue
        except (OSError, json.JSONDecodeError, ValueError, TypeError):
            continue

        if _delete_transcript(stem):
            removed += 1

    return removed


# ── HTML renderer ─────────────────────────────────────────────────────────────

def _linkify(escaped_text: str) -> str:
    """Wrap http(s) URLs in <a> tags. Input must already be html.escape'd."""
    return _URL_PATTERN.sub(
        lambda m: f'<a href="{m.group(0)}" target="_blank" rel="noopener noreferrer">{m.group(0)}</a>',
        escaped_text,
    )


def _render_message(msg: dict[str, Any]) -> str:
    """Render a single message dict to an HTML block."""
    author   = html.escape(str(msg.get("author") or msg.get("username") or "Unknown"))
    user_id  = html.escape(str(msg.get("user_id") or msg.get("author_id") or ""))
    content  = _linkify(html.escape(str(msg.get("content") or "")))
    ts_raw   = msg.get("timestamp") or msg.get("posted_at") or ""
    channel  = html.escape(str(msg.get("channel") or msg.get("channel_id") or ""))

    # Format timestamp
    try:
        if isinstance(ts_raw, (int, float)):
            ts = datetime.fromtimestamp(ts_raw / 1000, tz=timezone.utc)
        else:
            ts = datetime.fromisoformat(str(ts_raw).replace("Z", "+00:00"))
        ts_str = ts.strftime("%Y-%m-%d %H:%M:%S UTC")
    except Exception:
        ts_str = html.escape(str(ts_raw))

    # Attachments
    attachments_html = ""
    for att in msg.get("attachments", []):
        url  = html.escape(str(att.get("url") or att.get("proxy_url") or ""))
        name = html.escape(str(att.get("filename") or att.get("name") or "attachment"))
        if url.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".webp")):
            attachments_html += f'<div class="attachment"><img src="{url}" alt="{name}" loading="lazy"/></div>'
        else:
            attachments_html += f'<div class="attachment"><a href="{url}" target="_blank">📎 {name}</a></div>'

    channel_badge = f'<span class="channel">#{channel}</span>' if channel else ""

    return f"""
<div class="message">
  <div class="message-header">
    <span class="author">{author}</span>
    <span class="user-id">({user_id})</span>
    {channel_badge}
    <span class="timestamp">{ts_str}</span>
  </div>
  <div class="message-content">{content or '<em class="empty">[no content]</em>'}</div>
  {attachments_html}
</div>"""


def _render_html(
    guild_name: str,
    guild_id: str,
    messages: list[dict[str, Any]],
    created_at: str,
    expires_at: str | None,
) -> str:
    """Render the full HTML page."""
    guild_safe   = html.escape(guild_name)
    guild_id_s   = html.escape(guild_id)
    count        = len(messages)
    expiry_note  = f"<p class='expiry'>⏱ Expires: {html.escape(expires_at)}</p>" if expires_at else ""
    messages_html = "\n".join(_render_message(m) for m in messages)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Transcript — {guild_safe}</title>
  <style>
{_TRANSCRIPT_CSS}
  </style>
</head>
<body>
  <header>
    <div class="header-left">
      <span class="server-name">📋 {guild_safe}</span>
      <span class="server-id">Server ID: {guild_id_s}</span>
    </div>
    <div class="header-right">
      <span class="msg-count">{count} message{'s' if count != 1 else ''}</span>
      <span class="created-at">Created: {html.escape(created_at)}</span>
      {expiry_note}
    </div>
  </header>
  <div class="messages">
    {messages_html if messages_html.strip() else '<p style="color:var(--text-3);padding:32px 0;">No messages in this archive.</p>'}
  </div>
  <footer>Alice Transcript Service · Generated {html.escape(created_at)}</footer>
</body>
</html>"""


def _render_and_write(
    archive_id: str,
    guild_name: str,
    guild_id: str,
    messages: list[dict[str, Any]],
    created_at: str,
    expires_at: str | None,
) -> None:
    html_content = _render_html(guild_name, guild_id, messages, created_at, expires_at)
    _write_transcript_files(archive_id, html_content, expires_at)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/create")
async def create_transcript(
    request: Request,
    authorization: str | None = Header(default=None),
):
    """
    Alice sends a JSON body:
    {
      "guild_id":   "123456789",
      "guild_name": "My Server",
      "messages":   [ { author, user_id, content, timestamp, channel, attachments? }, ... ],
      "expires_at": "2026-05-25T00:00:00Z"   (optional ISO string)
    }
    Returns: { "id": "abc123", "url": "/t/abc123" }
    """
    if not _check_auth(authorization):
        return JSONResponse(status_code=401, content={"error": "Unauthorized"})

    content_length = request.headers.get("content-length")
    if content_length is not None:
        try:
            if int(content_length) > MAX_BODY_BYTES:
                return JSONResponse(
                    status_code=413,
                    content={"error": f"Request body exceeds {MAX_BODY_BYTES} bytes"},
                )
        except ValueError:
            pass

    raw_body = await request.body()
    if len(raw_body) > MAX_BODY_BYTES:
        return JSONResponse(
            status_code=413,
            content={"error": f"Request body exceeds {MAX_BODY_BYTES} bytes"},
        )

    try:
        body: dict[str, Any] = json.loads(raw_body)
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Invalid JSON"})

    guild_id   = str(body.get("guild_id")   or "unknown")
    guild_name = str(body.get("guild_name") or "Unknown Server")
    messages   = body.get("messages", [])
    expires_at = body.get("expires_at")
    expires_at_str: str | None = str(expires_at) if expires_at else None

    if not isinstance(messages, list):
        return JSONResponse(status_code=400, content={"error": "'messages' must be a list"})

    if len(messages) > MAX_MESSAGES:
        return JSONResponse(
            status_code=413,
            content={"error": f"Too many messages (max {MAX_MESSAGES})"},
        )

    archive_id = _content_hash_id(guild_id, messages)
    file_path = _transcript_path_for_id(archive_id)

    if file_path.is_file():
        return JSONResponse(status_code=200, content={"id": archive_id, "url": f"/t/{archive_id}"})

    created_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    await asyncio.to_thread(
        _render_and_write,
        archive_id,
        guild_name,
        guild_id,
        messages,
        created_at,
        expires_at_str,
    )

    return JSONResponse(status_code=200, content={"id": archive_id, "url": f"/t/{archive_id}"})


@router.get("/{archive_id}")
async def serve_transcript(archive_id: str):
    """Serve a stored HTML transcript via FileResponse (streamed from disk)."""
    validated_id = _validate_archive_id(archive_id)
    file_path = _transcript_path_for_id(validated_id)
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Transcript not found or expired")

    return FileResponse(
        path=file_path,
        media_type="text/html; charset=utf-8",
        headers={"Cache-Control": "public, max-age=3600"},
    )


@router.delete("/{archive_id}")
async def delete_transcript(
    archive_id: str,
    authorization: str | None = Header(default=None),
):
    """Delete an expired transcript (called by Alice's archive cleanup)."""
    if not _check_auth(authorization):
        return JSONResponse(status_code=401, content={"error": "Unauthorized"})

    validated_id = _validate_archive_id(archive_id)
    if _delete_transcript(validated_id):
        return JSONResponse(status_code=200, content={"deleted": True})
    return JSONResponse(status_code=404, content={"error": "Not found"})
