"""Generate offline command docs under docs/commands/."""
from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLUGIN_ROOT = ROOT / "backend" / "src" / "plugins"
DOCS = ROOT / "docs"
CMD_DIR = DOCS / "commands"
CMD_DIR.mkdir(exist_ok=True)

GROUPS: dict[str, str] = {
    "Automod": "antiraid",
    "AutoReactions": "auto_reactions",
    "Counters": "counter",
    "LocateUser": "locate",
    "MessageSaver": "message_saver",
    "ModActions": "mod",
    "Mutes": "mutes",
    "PingableRoles": "pingable_role",
    "Post": "post",
    "ReactionRoles": "reaction_roles",
    "Reminders": "remind",
    "RoleButtons": "role_buttons",
    "Roles": "roles",
    "SelfGrantableRoles": "srole",
    "Slowmode": "slowmode",
    "Starboard": "starboard",
    "Tags": "tag",
    "TimeAndDate": "timezone",
    "Utility": "utility",
}

PRETTY: dict[str, str] = {
    "Automod": "Automod",
    "AutoReactions": "Auto reactions",
    "BotControl": "Bot control (staff / mention)",
    "ChannelArchiver": "Channel archiver",
    "ContextMenus": "Context menus",
    "Counters": "Counters",
    "LocateUser": "Locate user",
    "MessageSaver": "Message saver",
    "ModActions": "Mod actions",
    "Mutes": "Mutes",
    "NameHistory": "Name history",
    "PingableRoles": "Pingable roles",
    "Post": "Post",
    "ReactionRoles": "Reaction roles",
    "Reminders": "Reminders",
    "RoleButtons": "Role buttons",
    "Roles": "Roles",
    "SelfGrantableRoles": "Self-grantable roles",
    "Slowmode": "Slowmode",
    "Starboard": "Starboard",
    "Tags": "Tags",
    "TimeAndDate": "Time and date",
    "Utility": "Utility",
}

SLUG: dict[str, str] = {
    "ModActions": "mod-actions",
    "AutoReactions": "auto-reactions",
    "BotControl": "bot-control",
    "ChannelArchiver": "channel-archiver",
    "ContextMenus": "context-menus",
    "LocateUser": "locate-user",
    "MessageSaver": "message-saver",
    "NameHistory": "name-history",
    "PingableRoles": "pingable-roles",
    "ReactionRoles": "reaction-roles",
    "RoleButtons": "role-buttons",
    "SelfGrantableRoles": "self-grantable-roles",
    "TimeAndDate": "time-and-date",
}

# Staff mention commands — richer usage than auto-extract
BOT_CONTROL_USAGE: dict[str, tuple[str, str]] = {
    "allow_server": (
        "@Alice allow_server <serverId> [userId]",
        "Allow a server to use the bot. Optional userId gets Bot manager dashboard access.",
    ),
    "disallow_server": (
        "@Alice disallow_server <serverId>",
        "Remove a server from the allowlist.",
    ),
    "add_dashboard_user": (
        "@Alice add_dashboard_user <serverId> <userId...>",
        "Grant dashboard access for a server.",
    ),
    "remove_dashboard_user": (
        "@Alice remove_dashboard_user <serverId> <userId...>",
        "Revoke dashboard access for a server.",
    ),
    "add_server_from_invite": (
        "@Alice add_server_from_invite <invite> [userId]",
        "Allow a server using an invite code/URL.",
    ),
    "list_dashboard_users": (
        "@Alice list_dashboard_users <serverId>",
        "List users with dashboard access for a server.",
    ),
    "list_dashboard_permissions": (
        "@Alice list_dashboard_permissions <serverId> [userId]",
        "List dashboard permission assignments.",
    ),
    "servers": ("@Alice servers", "List allowed servers."),
    "leave_server": ("@Alice leave_server <serverId>", "Make the bot leave a server."),
    "reload_server": ("@Alice reload_server <serverId>", "Reload a server's config/plugins."),
    "eligible": ("@Alice eligible <serverId>", "Check whether a server is eligible."),
    "channel_to_server": (
        "@Alice channel_to_server <channelId>",
        "Resolve a channel ID to its server.",
    ),
    "bot_reload_global_plugins": (
        "@Alice bot_reload_global_plugins",
        "Reload global plugins (staff).",
    ),
}


def extract_triggers(text: str) -> list[list[str]]:
    out: list[list[str]] = []
    for m in re.finditer(r"trigger:\s*(\[[^\]]*\]|\"[^\"]+\"|'[^']+')", text):
        raw = m.group(1)
        if raw.startswith("["):
            out.append([s.strip().strip("\"'") for s in re.findall(r"[\"']([^\"']+)[\"']", raw)])
        else:
            out.append([raw.strip("\"'")])
    return out


def extract_field_blocks(text: str, field: str) -> list[str]:
    """Extract string values; supports apostrophes inside double-quoted strings."""
    out: list[str] = []
    for m in re.finditer(
        rf"{field}:\s*(?:\"((?:\\.|[^\"\\])*)\"|'((?:\\.|[^'\\])*)')",
        text,
    ):
        out.append(m.group(1) if m.group(1) is not None else m.group(2))
    return out


def reparse_slash_file(path: Path) -> list[dict[str, str]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    cmds: list[dict[str, str]] = []
    parts = re.split(r"export const \w+\s*=\s*\w+\(", text)
    for part in parts[1:]:
        nm = re.search(r"name:\s*[\"']([a-z0-9_\-]+)[\"']", part)
        if not nm:
            continue
        desc = re.search(
            r"description:\s*(?:\"((?:\\.|[^\"\\])*)\"|'((?:\\.|[^'\\])*)')",
            part,
        )
        perm = re.search(r"(?:configPermission|permission):\s*[\"']([^\"']+)[\"']", part)
        desc_val = ""
        if desc:
            desc_val = desc.group(1) if desc.group(1) is not None else (desc.group(2) or "")
        cmds.append(
            {
                "name": nm.group(1),
                "desc": desc_val,
                "perm": perm.group(1) if perm else "",
            }
        )
    return cmds


def esc(s: str) -> str:
    return s.replace("|", "\\|")


rows_by_plugin: dict[str, dict[str, list]] = defaultdict(
    lambda: {"prefix": [], "slash": [], "context": []}
)

for p in sorted(PLUGIN_ROOT.rglob("*Cmd.ts")):
    if p.name.startswith("actual") or "util" in p.parts:
        continue
    text = p.read_text(encoding="utf-8", errors="replace")
    plugin = p.relative_to(PLUGIN_ROOT).parts[0]
    usages = extract_field_blocks(text, "usage")
    descs = extract_field_blocks(text, "description")
    perms = re.findall(r"(?:permission|configPermission):\s*[\"']([^\"']*)[\"']", text)

    if "Ctx" in p.name:
        m = re.search(r"name:\s*[\"']([^\"']+)[\"']", text)
        rows_by_plugin[plugin]["context"].append(
            {"name": m.group(1) if m else p.stem, "desc": "", "perm": ""}
        )
        continue

    if "Slash" in p.name:
        continue

    triggers = extract_triggers(text)
    for i, trs in enumerate(triggers):
        rows_by_plugin[plugin]["prefix"].append(
            {
                "name": trs[0] if trs else "",
                "aliases": trs[1:] if len(trs) > 1 else [],
                "usage": usages[i] if i < len(usages) else "",
                "desc": descs[i] if i < len(descs) else "",
                "perm": perms[i] if i < len(perms) else "",
            }
        )

for plugin_dir in PLUGIN_ROOT.iterdir():
    if not plugin_dir.is_dir():
        continue
    plugin = plugin_dir.name
    collected: list[dict[str, str]] = []
    for sf in list(plugin_dir.rglob("*SlashCmd*.ts")) + list(plugin_dir.rglob("*SlashCmds.ts")):
        if sf.name.startswith("actual"):
            continue
        collected.extend(reparse_slash_file(sf))
    seen: set[str] = set()
    clean: list[dict[str, str]] = []
    for c in collected:
        if c["name"] in seen:
            continue
        seen.add(c["name"])
        clean.append(c)
    if clean:
        rows_by_plugin[plugin]["slash"] = clean

# Enrich BotControl
for c in rows_by_plugin["BotControl"]["prefix"]:
    extra = BOT_CONTROL_USAGE.get(c["name"])
    if extra:
        c["usage"], c["desc"] = extra

index_rows: list[tuple[str, str, str | None]] = []

for plugin in sorted(rows_by_plugin.keys()):
    data = rows_by_plugin[plugin]
    if not any(data.values()):
        continue
    slug = SLUG.get(plugin, plugin.lower())
    title = PRETTY.get(plugin, plugin)
    group = GROUPS.get(plugin)
    lines: list[str] = [
        f"# {title}",
        "",
        "> Offline fallback docs for when the dashboard website is unavailable.",
        f"> Source plugin: `backend/src/plugins/{plugin}`",
        "",
        "[← All commands](../COMMANDS.md)",
        "",
    ]
    if group:
        lines.append(f"**Slash group:** `/{group}`")
        lines.append("")
    if plugin == "BotControl":
        lines.append(
            "These commands are run by **mentioning the bot** in a channel it can see "
            "(not with the server prefix). Example: `@Alice allow_server <id>`."
        )
        lines.append("")
    lines.append(
        "Syntax: `<required>` · `[optional]` · Prefix defaults to `!` (server-configurable)."
    )
    lines.append("")

    if data["prefix"]:
        heading = "## Mention commands (staff)" if plugin == "BotControl" else "## Prefix commands"
        lines.append(heading)
        lines.append("")
        lines.append("| Command | Usage | Description | Permission |")
        lines.append("|---|---|---|---|")
        for c in sorted(data["prefix"], key=lambda x: x["name"]):
            aliases = (
                f" (aliases: {', '.join('`' + a + '`' for a in c['aliases'])})"
                if c.get("aliases")
                else ""
            )
            if plugin == "BotControl":
                cmd_label = f"`@Alice {c['name']}`"
                usage = c["usage"] or f"@Alice {c['name']}"
            else:
                cmd_label = f"`!{c['name']}`"
                usage = c["usage"] or (f"!{c['name']}" if c["name"] else "")
            desc = c["desc"] or ""
            perm = c["perm"] or "—"
            lines.append(
                f"| {cmd_label}{aliases} | `{esc(usage)}` | {esc(desc)} | `{perm}` |"
            )
        lines.append("")

    if data["slash"]:
        lines.append("## Slash commands")
        lines.append("")
        lines.append("| Slash | Description | Permission |")
        lines.append("|---|---|---|")
        for c in sorted(data["slash"], key=lambda x: x["name"]):
            slash = f"/{group} {c['name']}" if group else f"/{c['name']}"
            perm = c["perm"] or "—"
            lines.append(f"| `{slash}` | {esc(c['desc'] or '')} | `{perm}` |")
        lines.append("")

    if data["context"]:
        lines.append("## Context menu commands")
        lines.append("")
        lines.append("Right-click a user or message → **Apps**:")
        lines.append("")
        lines.append("| Name |")
        lines.append("|---|")
        for c in data["context"]:
            lines.append(f"| {c['name']} |")
        lines.append("")

    lines.extend(
        [
            "---",
            "",
            "In Discord, run `!help <command>` for live usage for any prefix command.",
            "",
        ]
    )
    (CMD_DIR / f"{slug}.md").write_text("\n".join(lines), encoding="utf-8")
    index_rows.append((title, slug, group))
    print(f"wrote {slug}.md")

idx: list[str] = [
    "# Alice — Command Reference",
    "",
    "Offline fallback documentation for bot commands when the local dashboard docs site is down or unreachable.",
    "",
    "The interactive docs live in the dashboard at `/docs`. Prefer those when available; use these markdown files otherwise.",
    "",
    "## How to use commands",
    "",
    "- **Prefix commands** use the server prefix (default `!`). Example: `!warn @user reason`",
    "- **Slash commands** are Discord native. Most live under a plugin group (e.g. `/mod warn`).",
    "- **Staff / bot-control** commands are run by **mentioning the bot**: `@Alice allow_server <id>`",
    "- **Context menus** appear when you right-click a user or message (Apps).",
    "- Run `!help <command>` in Discord for live usage text.",
    "",
    "## Syntax legend",
    "",
    "| Notation | Meaning |",
    "|---|---|",
    "| `<this>` | Required argument |",
    "| `[this]` | Optional argument |",
    "| `[-flag]` | Optional flag |",
    "",
    "## Plugins",
    "",
    "| Plugin | Slash group | Docs |",
    "|---|---|---|",
]
for title, slug, group in sorted(index_rows, key=lambda x: x[0].lower()):
    g = f"`/{group}`" if group else "—"
    idx.append(f"| {title} | {g} | [commands/{slug}.md](./commands/{slug}.md) |")

idx.extend(
    [
        "",
        "## Related",
        "",
        "- [MANAGEMENT.md](./MANAGEMENT.md) — setup, allowlist, dashboard",
        "- [PRODUCTION.md](./PRODUCTION.md) — self-host / Docker",
        "- [DEVELOPMENT.md](./DEVELOPMENT.md) — local development",
        "",
    ]
)
(DOCS / "COMMANDS.md").write_text("\n".join(idx), encoding="utf-8")
print(f"wrote COMMANDS.md ({len(index_rows)} plugins)")
