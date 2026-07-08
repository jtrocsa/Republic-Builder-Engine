# Decision 0017 — 3.4.3 Hotfix Runtime Guard

The first 3.4.3 pack could white-screen when the app reloaded while a volatile source reader state was stored in localStorage. This hotfix normalizes volatile screens on boot and adds a safe source-reader fallback, while preserving the 3.4.3 interaction-depth work.
