# Access Control Policy (SOC2 / HIPAA)

Purpose:
- Define access control principles to protect systems and PHI.

Scope:
- All systems, applications, data stores, and personnel with repo access.

Principles:
- Least Privilege: Access assigned per role and justified business need.
- Role-Based Access Control (RBAC) with documented role definitions.
- Multi-Factor Authentication (MFA) required for all privileged and remote access.
- Strong password policies (min length, rotation, no reuse) or use of SSO.
- Privileged access requests follow documented approval workflow and are time-limited.
- Account provisioning/deprovisioning: HR-triggered on hire/termination; review within 24 hours.
- Periodic access reviews: quarterly for privileged accounts, annual for general access.
- Logging of all access events; logs retained and protected (see Logging & Retention).
- Separation of duties where possible.
- No hard-coded credentials in source; secrets stored in approved secret manager.
- Exceptions documented, approved, and time-limited.

Responsibilities:
- IAM Owner: maintain policy and enforce reviews.
- Managers: approve role assignments.
- Security Team: audit and remediate violations.

Change & Review:
- Policy review frequency: annual or after major change.