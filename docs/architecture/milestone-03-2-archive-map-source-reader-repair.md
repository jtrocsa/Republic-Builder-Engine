# Milestone 3.2 — Archive Map & Source Reader Repair

## Design decisions

1. **Two intentional art modes**
   - The Chronicle Institute, Archive navigation table, and Codex use a scholarly archive visual language.
   - Historical field exploration uses a top-down pixel-art visual language.
   - The chronotravel transition is the visual bridge between them.

2. **Geographic navigation table**
   - The navigation table uses a locally bundled Atlantic-world map generated from Natural Earth low-resolution land geometry.
   - Markers are positioned at recognizable approximate locations: Caribbean, Chesapeake, and Philadelphia.
   - The map is a navigation instrument, not a historical source.

3. **Response-first source workflow**
   - Students read source material and submit an evidence-based note before the Institute Context is revealed.
   - The Institute Context is feedback and framing, not an answer provided before the student thinks.
   - A source cannot be secured in the Codex until a response is written.

4. **Local visual-source asset rule**
   - Important visual sources belong in `apps/web/src/assets/documents/` for the current Vite app.
   - Source metadata and citations remain in `apps/web/src/content/`.
   - The Waldseemüller map is included locally as a course copy of a Library of Congress image.
