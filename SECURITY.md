# Security Policy

Alice is a Discord moderation bot (forked from Zeppelin) with a backend, API, web dashboard, and optional transcript service. We take security reports seriously, especially issues that could affect guild data, permissions, or authentication.

## Supported Versions

Only the latest code on the default branch is supported with security updates.

| Version | Supported |
| ------- | --------- |
| Latest default branch | Yes |
| Older commits / forks | No — please update before reporting |

Self-hosted deployments should pull the latest supported revision and run database migrations before expecting a fix to apply.

## Reporting a Vulnerability

**Do not report security vulnerabilities through public GitHub issues, pull requests, or discussions.**

### Preferred: Discord DM

Contact the maintainer privately on Discord:

1. Join the Alice Discord server: https://discord.gg/PEXqmwnapw
2. Send a friend request to **siriusnovyx4399**
3. Once accepted, DM a private vulnerability report (see below)

Do not post exploit details in public channels or threads.

### Alternative: GitHub private vulnerability reporting

If Discord is unavailable:

1. Open the repository **Security** tab.
2. Choose **Report a vulnerability** (or create a draft security advisory if you are a maintainer).
3. Include as much detail as you can (see below).

Only maintainers can see private vulnerability reports.

### What to include

A useful report typically includes:

- A short summary of the issue
- Affected component(s): bot, API, dashboard, transcript service, Docker/compose, dependencies
- Affected revision (commit hash or approximate date)
- Steps to reproduce, or a minimal proof of concept
- Impact: what an attacker or unauthorized user could do
- Whether the issue requires a privileged Discord role, dashboard login, or network access to the host
- Any suggested fix (optional)

Please avoid testing against production communities or other people's deployments without permission.

## Scope

### In scope

- Authentication and authorization bugs (Discord OAuth, dashboard sessions, permission checks)
- Privilege escalation (including dashboard self-permission changes)
- Injection, XSS, CSRF, SSRF, or unsafe file handling in Alice-owned code
- Secrets exposure in Alice code, default configs, or example env templates
- Privilege or data isolation failures between guilds
- Issues in the Docker/production compose setup that can lead to remote compromise under normal configuration

### Out of scope

- Vulnerabilities in Discord, Discord.js, or other third-party services (report those upstream)
- Dependency advisories with no practical impact on Alice (prefer filing upstream unless you can show a real exploit path here)
- Issues that only appear after intentional insecure configuration (for example exposing databases publicly, sharing bot tokens, or disabling auth controls)
- Denial of service from Discord rate limits or intentionally oversized guild traffic
- Social engineering, physical access, or compromised host/admin accounts

## Response expectations

This is a community project; timelines are best-effort:

- **Acknowledgment:** within a few days when possible
- **Triage / initial assessment:** as soon as maintainers can reproduce and classify the report
- **Fix:** prioritized by severity and real-world impact

If a report is accepted, we will work on a fix and may publish a security advisory after a patch is available. If it is declined, we will explain why (for example: not reproducible, out of scope, or accepted risk).

Reporters can be credited in advisories or release notes unless they prefer to remain anonymous.

## Coordinated disclosure

Please give maintainers reasonable time to investigate and patch before public disclosure. We aim to coordinate disclosure once a fix is ready, or sooner if the risk of withholding details outweighs the benefit.

## Safe handling notes for operators

When deploying Alice:

- Keep bot tokens, OAuth secrets, database credentials, and transcript secrets private
- Do not expose MySQL/Redis ports beyond what you need
- Run migrations from a trusted image/build before starting app services
- Prefer keeping dependencies updated; see the README verification notes for high-severity audit checks
