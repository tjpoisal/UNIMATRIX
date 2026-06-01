# Security Policy

## Supported Versions

Unimatrix is in active development (v0.x). Security updates will be applied to the `main` branch and tagged releases.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < 0.2   | :x:                |

## Reporting a Vulnerability

**Please report security vulnerabilities privately.**

- **Preferred**: Use GitHub Security Advisories (https://github.com/tjpoisal/UNIMATRIX/security/advisories/new)
- **Email**: (if configured) security@unimatrix.app or via repo owner contact
- **Do not** open public issues for vulns.

We will acknowledge receipt within 48 hours, and aim to release fixes for critical issues within 7 days (or coordinated disclosure timeline).

Include:
- Description of the vulnerability and impact
- Steps to reproduce
- Affected versions / commit
- Suggested fix (optional)

After triage we will:
- Confirm or decline (with reason)
- Work on patch (private fork/branch if needed)
- Credit reporters (unless anonymity requested)
- Publish advisory + release notes

## Key Security Controls in This Project

- Application-layer AES-256-GCM encryption for memories (scrypt KDF)
- Input sanitization + prompt injection detection
- PII / API key redaction before indexing/LLM
- Clerk JWT + short-lived MCP tokens (bcrypt hashed, no plaintext storage post-fix)
- Postgres RLS + app-level user context guards
- Global rate limiting (60 req/min/IP on API)
- Dependabot + CI type/lint/build checks

See `packages/server/src/security/` for implementation.

## Scope

In scope: auth bypass, injection (prompt/SQL), crypto flaws, data leaks, RCE, privilege escalation in our code.

Out of scope: transitive dep vulns already tracked by Dependabot, user misconfig of env keys, social engineering.

Thank you for helping keep Unimatrix secure.
