# Case 1.01 — The Atlantic Crossroads

> Repaired by the Prompt 5 documentation-housekeeping pass. This file was previously a verbatim placeholder stub ("Recovered placeholder file restored...") with no real content. What follows is drawn from the repo's own existing, real documentation (`docs/content-guide/atlantic-crossroads-source-notes.md`, `docs/content-guide/unit-01-source-and-activity-records.md`, `docs/content-guide/source-asset-contract.md`, `CLAUDE.md`'s terminology section) and `docs/architecture/CURRENT-REPOSITORY-AUDIT.md` — nothing below is newly invented.

Case 1.01 is the current, playable vertical slice of Chronicle: Unit 1, Period 1 (1491–1607), covering the Columbian Exchange. It's the only fully playable case today — Atlantic and Hispaniola are defined as locked/future badge areas (see `unitOneBadgeRecords()` in `apps/web/src/main.js`), not yet built.

## Narrative frame

The player is a "Chronicler" recruited by the Chronicle Institute, using "Chronotravel" to visit the Caribbean at first contact, gather evidence from NPCs and primary sources, and transmit records back to the Institute Archive to earn the **Caribbean** badge.

## Student-facing sources

Per `docs/content-guide/unit-01-source-and-activity-records.md`, three sources are live in `apps/web/src/content/unit-01-campaign.js` (`CASE_001_SOURCES`):

1. **The Caribbean — Island Society** — Library of Congress exhibition context, secondary source. Establishes that Taíno communities in the Greater Antilles had established societies before European contact (agriculture, craft traditions, community life, canoe travel), sourced from the National Park Service's "St. John History Timeline" and the Library of Congress's "Columbus and the Taíno" exhibition.
2. **Letter Reporting on the First Voyage** — Christopher Columbus to Rafael Sánchez, 1493, primary-source excerpt. Students are asked to identify the account's European-expedition perspective and its royal audience, not to take it as a transparent account of Indigenous life.
3. **Universalis cosmographia** — Martin Waldseemüller, 1507, primary-source map. Locally bundled at `apps/web/src/assets/documents/source-waldseemuller-1507.jpg` (the only primary-source scan asset in the project today). Accompanied by a Library of Congress exhibit note that the 1494 printed edition's woodcuts were adapted from Mediterranean settings — used to teach that historical images require sourcing before being treated as literal depictions.

## Editorial principle

The case does not treat a European written account as a transparent account of Indigenous life. It pairs the account with contextual evidence (source 1) and makes source perspective explicit — this is a deliberate HIPP-skill design choice, not an incidental content gap.

## Source-asset contract

Every source record must provide, in-game: a readable excerpt/transcription/locally-bundled scan; title, creator, date, source type, provenance, and citation; a student prompt shown _before_ explanatory feedback; and an optional external archive link for verification only, never as the sole access path. Interpretive visuals are always labeled as interpretive, never presented as primary sources.

## APUSH alignment

Unit 1 covers Indigenous societies before European contact, European exploration, the Columbian Exchange, labor/slavery/caste in the Spanish colonial system, and cultural interactions among Europeans, Native Americans, and Africans — aligned to the College Board AP U.S. History Course and Exam Description, Unit 1 / Period 1 framework.

## Current implementation status

Per `docs/architecture/CURRENT-REPOSITORY-AUDIT.md`: Case 1.01 is fully playable end-to-end (field exploration, NPC dialogue, source reading, the map-jigsaw puzzle, the exchange ledger, badge award). It is the only case built to this depth — Unit 2 ("Riverbend Settlement") exists and is reachable in the running app but is explicitly placeholder content (structural mirror, ~90 literal `"Placeholder"` strings), not a second real case.
