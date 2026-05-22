"""
Transcript routes.

POST /t/create    — Alice sends message data, gets back a transcript ID
GET  /t/{id}      — Serves the HTML transcript page
DELETE /t/{id}    — Alice marks an expired transcript for cleanup (optional)
"""

from __future__ import annotations

import hashlib
import html
import os
import re
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse

router = APIRouter(prefix="/t")

# ── Storage ──────────────────────────────────────────────────────────────────
STORE_DIR = Path(os.getenv("TRANSCRIPT_STORE_DIR", "./store/transcripts"))
STORE_DIR.mkdir(parents=True, exist_ok=True)

# ── Auth ──────────────────────────────────────────────────────────────────────
_SECRET = os.getenv("TRANSCRIPT_SECRET", "change-me-in-env")


def _check_auth(authorization: str | None) -> bool:
    if not authorization:
        return False
    token = authorization.removeprefix("Bearer ").strip()
    return secrets.compare_digest(token, _SECRET)


# ── HTML renderer ─────────────────────────────────────────────────────────────

def _render_message(msg: dict[str, Any]) -> str:
    """Render a single message dict to an HTML block."""
    author   = html.escape(str(msg.get("author") or msg.get("username") or "Unknown"))
    user_id  = html.escape(str(msg.get("user_id") or msg.get("author_id") or ""))
    content  = html.escape(str(msg.get("content") or ""))
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
    :root {{
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
    }}
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: var(--bg);
      color: var(--text-1);
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.6;
    }}
    header {{
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
    }}
    .header-left {{ display: flex; flex-direction: column; gap: 4px; }}
    .server-name {{ font-size: 18px; font-weight: 700; color: var(--text-1); }}
    .server-id   {{ font-size: 12px; color: var(--text-3); font-family: monospace; }}
    .header-right {{ display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }}
    .msg-count   {{ font-size: 13px; color: var(--text-2); }}
    .created-at  {{ font-size: 12px; color: var(--text-3); }}
    .expiry      {{ font-size: 12px; color: #f59e0b; }}
    .messages    {{ max-width: 900px; margin: 0 auto; padding: 16px 24px; }}
    .message     {{
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 2px;
      transition: background 0.1s;
    }}
    .message:hover {{ background: var(--surface); }}
    .message-header {{
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 4px;
    }}
    .author    {{ font-weight: 600; color: var(--author); }}
    .user-id   {{ font-size: 11px; color: var(--text-3); font-family: monospace; }}
    .channel   {{ font-size: 11px; color: var(--channel); }}
    .timestamp {{ font-size: 11px; color: var(--ts); margin-left: auto; }}
    .message-content {{ color: var(--text-1); white-space: pre-wrap; word-break: break-word; }}
    .empty     {{ color: var(--text-3); font-style: italic; }}
    .attachment {{ margin-top: 8px; }}
    .attachment img {{
      max-width: 400px;
      max-height: 300px;
      border-radius: 6px;
      border: 1px solid var(--border);
      display: block;
    }}
    .attachment a {{
      color: var(--accent);
      text-decoration: none;
      font-size: 13px;
    }}
    .attachment a:hover {{ text-decoration: underline; }}
    footer {{
      text-align: center;
      padding: 24px;
      color: var(--text-3);
      font-size: 12px;
      border-top: 1px solid var(--border);
      margin-top: 32px;
    }}
    @media (max-width: 600px) {{
      header {{ padding: 16px; }}
      .messages {{ padding: 12px 16px; }}
      .timestamp {{ margin-left: 0; }}
    }}
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

    try:
        body: dict[str, Any] = await request.json()
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Invalid JSON"})

    guild_id   = str(body.get("guild_id")   or "unknown")
    guild_name = str(body.get("guild_name") or "Unknown Server")
    messages   = body.get("messages", [])
    expires_at = body.get("expires_at")

    if not isinstance(messages, list):
        return JSONResponse(status_code=400, content={"error": "'messages' must be a list"})

    created_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    # Generate a stable ID from content hash so duplicate archives don't stack up
    raw        = f"{guild_id}:{len(messages)}:{messages[0] if messages else ''}:{secrets.token_hex(8)}"
    archive_id = hashlib.sha256(raw.encode()).hexdigest()[:16]

    html_content = _render_html(guild_name, guild_id, messages, created_at, expires_at)

    file_path = STORE_DIR / f"{archive_id}.html"
    file_path.write_text(html_content, encoding="utf-8")

    return JSONResponse(status_code=200, content={"id": archive_id, "url": f"/t/{archive_id}"})


def _get_safe_path(archive_id: str) -> Path:
    """
    Validate that archive_id is a safe hexadecimal string and verify
    that the constructed file path lies strictly within the STORE_DIR.
    """
    if not archive_id or not isinstance(archive_id, str) or not re.match(r"^[0-9a-f]{16}$", archive_id):
        raise HTTPException(status_code=404, detail="Transcript not found")

    store_dir_abs = STORE_DIR.resolve()
    file_path = (STORE_DIR / f"{archive_id}.html").resolve()

    if file_path.parent != store_dir_abs:
        raise HTTPException(status_code=404, detail="Transcript not found")

    return file_path


@router.get("/{archive_id}", response_class=HTMLResponse)
async def serve_transcript(archive_id: str):
    """Serve a stored HTML transcript."""
    file_path = _get_safe_path(archive_id)

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Transcript not found or expired")

    return HTMLResponse(content=file_path.read_text(encoding="utf-8"), status_code=200)


@router.delete("/{archive_id}")
async def delete_transcript(
    archive_id: str,
    authorization: str | None = Header(default=None),
):
    """Delete an expired transcript (called by Alice's archive cleanup)."""
    if not _check_auth(authorization):
        return JSONResponse(status_code=401, content={"error": "Unauthorized"})

    try:
        file_path = _get_safe_path(archive_id)
    except HTTPException:
        return JSONResponse(status_code=404, content={"error": "Not found"})

<<<<<<< HEAD
    if file_path.exists():
        file_path.unlink()
=======
    file_path = STORE_DIR / f"{archive_id}.html"
    store_root = STORE_DIR.resolve()
    resolved_path = file_path.resolve()
    try:
        resolved_path.relative_to(store_root)
    except ValueError:
        return JSONResponse(status_code=404, content={"error": "Not found"})

    if resolved_path.exists():
        resolved_path.unlink()
>>>>>>> 94c4153981e7c939da85fe691915726ef3badaa4
        return JSONResponse(status_code=200, content={"deleted": True})
    return JSONResponse(status_code=404, content={"error": "Not found"})
