# Source Asset Contract

## Student-facing source requirements

Every source record must provide, inside the game:

- a readable excerpt, transcription, or locally bundled image/scan;
- title, creator, date, source type, provenance, and citation;
- a student prompt that appears before explanatory feedback;
- an optional external archive link for verification, never as the only way to access evidence.

## Local source files

For the current Vite app, store binary visual assets here:

```text
apps/web/src/assets/documents/
```

Use lower-case kebab-case names, for example:

```text
source-waldseemuller-map-1507.jpg
source-columbus-letter-1493-page-01.jpg
```

Each asset should have a corresponding source record in:

```text
apps/web/src/content/
```

## This pack

- `source-waldseemuller-map-1507.jpg` is a locally bundled course copy of the Library of Congress scan.
- The source record retains the Library of Congress citation and original catalog link.
- Natural Earth data was used only for the present-day navigation-table map, not as historical evidence.
