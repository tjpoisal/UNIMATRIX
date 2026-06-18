# Incident Response Policy (SOC2 / HIPAA)

Purpose:
- Ensure timely detection, containment, eradication, recovery, and reporting of security incidents and PHI breaches.

Scope:
- All systems, personnel, third parties processing PHI.

Incident Response Team (IRT):
- Roles: Incident Lead, Technical Lead, Communications, Legal/Compliance, HR, Executive Sponsor.
- RACI for key tasks.

Incident Lifecycle:
1. Detection & Triage: log alerts, validate incidents, assign severity.
2. Containment: short-term containment to stop data loss; document steps.
3. Eradication: remove root cause (patch, revoke keys).
4. Recovery: restore systems from known-good sources; validate.
5. Post-Incident Review: timeline, root cause, corrective actions, evidence capture.

Severity Levels & SLA:
- Critical (PHI-exfiltration or service outage): respond within 1 hour.
- High: respond within 4 hours.
- Medium/Low: respond within 24-72 hours.

Notifications:
- Internal stakeholder notifications per severity.
- HIPAA breach notifications: follow Breach Notification Rule timelines; notify OCR and affected individuals when required.
- Preserve evidence; coordinate with Legal before public statements.

Testing & Training:
- Run tabletop exercises biannually; update playbooks after incidents.

Retention & Evidence:
- Keep incident records, timelines, artifacts, and remediation evidence for audit (min 6 years recommended).