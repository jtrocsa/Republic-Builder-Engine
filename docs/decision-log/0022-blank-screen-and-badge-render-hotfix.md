# Decision Log 0022 — Blank Screen and Badge Render Hotfix

## Context

After Milestone 3.4.9, returning to the Chronicle Institute could show only the background grid. The failure came from the Institute screen calling the badge shelf markup before that renderer existed.

## Decision

Add the missing `unitOneBadgeMarkup()` renderer and keep it scoped to Unit 1 preserved records. The shelf shows three badges: Caribbean, Atlantic, and Hispaniola. Earned badges light up as their cases are archived or, for the first route, once the first case evidence set is complete.

## Additional protection

The main render function now catches display errors and shows a recovery screen instead of leaving the app blank. This is not a substitute for fixing real errors, but it gives the tester a visible path back to the Institute during development.

## Result

The Institute Archive should load normally again, and future render regressions should be easier to diagnose during local testing.
