# Security Policy

## Supported Versions

Unimatrix is in active development. Security updates are applied to the `main` branch and tagged releases.

| Version | Supported |
| ------- | --------- |
| main    | ✅        |
| < 0.2   | ❌        |

## Reporting a Vulnerability

**Please report security vulnerabilities privately.**

- **Preferred**: [GitHub Security Advisories](https://github.com/tjpoisal/UNIMATRIX/security/advisories/new)
- **Email**: security@unimatrix.app
- Do not open public issues for vulnerabilities.

We aim to acknowledge reports within 48 hours and release fixes for critical issues within 7 days (or per coordinated disclosure timeline).

When reporting, please include:
- Description of the vulnerability and potential impact
- Steps to reproduce
- Affected versions or commit hash
- Suggested fix (optional)

After triage we will:
- Confirm or decline the report (with reasoning if declined)
- Develop a patch (using a private fork/branch when appropriate)
- Credit reporters unless anonymity is requested
- Publish a security advisory and release notes

## Key Security Controls

- Application-layer AES-256-GCM encryption for memories (scrypt KDF)
- Prompt injection detection on ingestion
- PII and API key redaction before indexing or sending to LLMs
- MCP tokens are bcrypt-hashed; raw tokens are never stored
- Clerk JWT authentication for MCP tool endpoints
- Postgres Row Level Security + application-level user context guards
- Global rate limiting (60 req/min/IP on API routes)
- Dependabot + CI (type checking, linting, build)

Implementation details live in `packages/server/src/security/` and `packages/server/src/auth/`.

## Scope

**In scope**: Authentication bypass, prompt injection, SQL injection, cryptographic flaws, data leakage, remote code execution, and privilege escalation in Unimatrix code.

**Out of scope**: Vulnerabilities in transitive dependencies (tracked by Dependabot), user misconfiguration of environment variables or API keys, and social engineering attacks.

Thank you for helping keep Unimatrix secure.
