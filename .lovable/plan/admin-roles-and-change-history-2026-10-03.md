# Admin roles and change history

## Build
- Let full admins assign individual content-section access to existing users without granting full administrator privileges.
- Enforce assigned access in both the admin navigation/routes and database write policies; retain full-admin access to every section.
- Record content creates, edits, and removals with the acting user, section, item, changed fields, and timestamp.
- Show the persistent change history in the admin dashboard timeline, including the person and time for each change.

## Technical details
- Keep global roles in `user_roles` and section grants in a separate table; only full admins can assign grants.
- Use database authorization functions and row-level policies for editor permissions, not client-only checks.
- Use database triggers for content audit events so edits from every existing editor path are captured consistently.
- Restrict audit history to full admins and do not store full before/after content snapshots.
