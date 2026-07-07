# 0004 — Director Briefing and Field Protocol

**Status:** Accepted for the first Chronicle vertical slice

## Decision

The Chronicle Institute opening now reveals its story in stages rather than presenting all lore on the title screen.

1. The **title screen** establishes identity and mystery: a 1491 archive signal reports a detected record drift.
2. The **Director’s briefing** explains the stakes through four short, readable transmissions:
   - the record is changing;
   - the past survives in fragments;
   - Chroniclers protect evidence rather than become heroes;
   - the student must follow the evidence.
3. The **Field Protocol** expresses the student role in three memorable, APUSH-aligned verbs:
   - **Observe:** Enter the moment. Leave history untouched.
   - **Source:** Interrogate the record: creator, audience, purpose.
   - **Report:** Return with evidence. Preserve what can be proven.

## Non-interference rule

Chronicle’s time-travel frame never permits students to rewrite real history. The game places students in historical settings to investigate context and evidence; it does not permit alternate historical outcomes.

## Character presentation

The Director receives a distinct stylized portrait so the Institute has a recognizable human voice during orientation. A future character-art pass may replace the vector portrait with a production illustration without changing story or UI structure.

## Authoring rule

All Director briefing and field-protocol copy remains in `apps/web/src/content/chronicle-opening.defaults.js`, editable through the existing development-only Author Mode. Draft edits auto-save locally after a short pause and can be exported as JSON.
