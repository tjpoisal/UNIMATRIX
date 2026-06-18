# Data Classification & Retention Policy (SOC2 / HIPAA)

Classification Levels:
- Public: no restrictions.
- Internal: business use; non-sensitive.
- Confidential: proprietary, internal-only.
- PHI (Protected Health Information): HIPAA-protected.

Handling Requirements:
- PHI must be minimized, accessed on least-privilege basis.
- PHI in transit: TLS 1.2+ or approved secure channel.
- PHI at rest: strong encryption (AES-256 recommended) using managed KMS.
- No PHI in logs, debug output, or public repos.
- Use pseudonymization where possible.

Retention Schedule (examples; adjust to legal/regulatory needs):
- PHI clinical records: as required by law (commonly 6+ years) — retain securely.
- Authentication logs & audit trails: retain 6 years.
- General business records: per company retention schedule.

Disposition:
- Secure deletion or cryptographic erasure at end of retention; document disposal.
- Data minimization: purge unneeded PHI monthly where feasible.

Review:
- Policy reviewed annually and after laws/requirements change.