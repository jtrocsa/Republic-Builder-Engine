# Naming and Placement Guide

## File and folder names

Use lowercase kebab-case only.

Good:

```text
unit-01
case-atlantic-crossroads
source-columbus-letter-1493.json
npc-field-mentor-ada-vale.json
assessment-saq-atlantic-crossroads-01.json
```

Avoid:

```text
Unit 1 Stuff
Final Boston Version
new-assets
primary sources copy
```

## IDs

IDs are permanent once content is referenced by a case, save file, or assessment record.

- Campaign: `chronicle`
- Unit: `unit-01`
- Case: `case-atlantic-crossroads`
- Source: `source-[creator]-[short-title]-[year]`
- NPC: `npc-[role-or-name]`
- Assessment: `assessment-[type]-[case]-[number]`
- Activity: `activity-[case]-[purpose]`

## Where things go

| You are adding... | Put it here |
|---|---|
| A historically sourced text, image, map, law, speech, diary, or data graphic | `content/library/primary-sources/` |
| The original media file for that source | `assets/campaigns/chronicle/documents/` |
| A historical person or fictional Institute role | `content/library/npcs/` |
| A city, region, settlement, battle site, or historical map location | `content/library/locations/` |
| A case-specific dialogue sequence | `content/campaigns/chronicle/.../dialogue/` |
| A case-specific activity | `content/campaigns/chronicle/.../activities/` |
| A case-specific assessment instance | `content/campaigns/chronicle/.../assessments/` |
| A shared assessment format/template | `content/library/assessments/templates/` |
| Shared visual UI assets | `assets/shared/` |
| Chronicle-only art, maps, portraits, or source scans | `assets/campaigns/chronicle/` |

## Source rule

Every primary-source record must include:

- a stable ID
- title
- creator, author, or issuing body
- date or date range
- source type
- historical context
- a complete citation or archival source link
- rights/use notes
- media path or text path
- accessibility description for visual sources
