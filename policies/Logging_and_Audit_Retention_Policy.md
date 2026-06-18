# Logging & Audit Retention Policy (SOC2 / HIPAA)

Purpose:
- Ensure sufficient logging to detect, investigate, and provide audit evidence for PHI access.

Log Types:
- Authentication and authorization events (login, MFA, token issuance).
- Access to PHI (read/write/delete).
- Administrative/privileged actions.
- System changes and deployments.
- Security alerts and IDS/IPS events.

Retention & Protection:
- Retain audit logs for minimum 6 years (HIPAA best practice for audit trails); configurable per legal needs.
- Logs must be immutable or append-only; stored in a protected SIEM or centralized log store.
- Access to logs is RBAC-limited and logged.

Integrity & Monitoring:
- Use cryptographic integrity checks or WORM storage for critical logs.
- Regular automated alerting on suspicious patterns and monthly manual review of privileged access.
- Quarterly log review summaries and annual evidence pack for auditors.

Incidents:
- Preserve relevant logs immediately on suspected incidents; segregate for forensic analysis.