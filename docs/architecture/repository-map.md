# Repository Map

```text
republic-builder-engine/
├── apps/
│   └── web/                         # The deployable browser application
│       └── src/
│           ├── app/                 # App shell, routes, bootstrapping
│           ├── engine/              # Reusable game systems; no APUSH facts
│           ├── features/            # Screen- or interaction-specific UI
│           └── styles/              # Shared visual rules
├── content/
│   ├── campaigns/                   # Campaign-specific historical content
│   │   └── chronicle/
│   │       └── units/
│   │           └── unit-01/
│   │               └── cases/
│   │                   └── case-atlantic-crossroads/
│   └── library/                     # Canonical reusable historical records
│       ├── primary-sources/
│       ├── npcs/
│       ├── locations/
│       └── assessments/templates/
├── assets/
│   ├── shared/                      # UI, icons, fonts, shared sound, characters
│   └── campaigns/chronicle/         # Campaign-specific maps, portraits, art
├── data/
│   ├── schemas/                     # JSON shape definitions and examples
│   └── sample-saves/                # Non-student test data
├── docs/
│   ├── architecture/
│   ├── content-guide/
│   ├── vertical-slice/
│   └── decision-log/
├── scripts/                         # Import, validation, build helpers
└── tests/                           # Automated checks when systems mature
```

## Non-negotiable boundary

- Put reusable code in `apps/web/src/engine/`.
- Put reusable UI for a named experience in `apps/web/src/features/`.
- Put all historical facts, primary-source metadata, case prompts, and dialogue in `content/`.
- Put media files in `assets/`, never beside JavaScript unless they are generated temporary build files.

## Content reference rule

A case references shared records by ID. It does not copy them.

Example:

```json
{
  "evidenceIds": [
    "source-columbus-letter-1493",
    "source-delas-casas-1542"
  ]
}
```

This keeps one authoritative citation and one editable record for every source.
