# Technical decisions

- Keep admin section grants separate from global user roles, and enforce grants in both database policies and admin routing so section access cannot rely on the interface alone.
- Record content changes through database triggers and limit audit entries to the actor, action, item label, changed field names, and timestamp to provide traceability without storing full content snapshots.
- Route social crawler requests for News through a hosting edge handler to the existing metadata function, while letting ordinary visitors continue through the single-page app, so share URLs remain canonical post URLs.