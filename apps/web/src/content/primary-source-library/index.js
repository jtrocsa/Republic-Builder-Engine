/**
 * Aggregates the syllabus-wide primary source reference library (Units 1-9)
 * into flat, lookup-ready collections. See
 * docs/content-guide/primary-source-library.md for what this is and how to
 * use it — this module is not imported by main.js; it exists so a future
 * case/quest author (or a later engine integration) has one place to pull
 * researched sources from, rather than re-researching them per case.
 */

import {
  UNIT_01_SOURCE_LIBRARY_META,
  UNIT_01_SOURCES,
  UNIT_01_VISUAL_SOURCES,
} from "./unit-01-source-library.js";
import {
  UNIT_02_SOURCE_LIBRARY_META,
  UNIT_02_SOURCES,
  UNIT_02_VISUAL_SOURCES,
} from "./unit-02-source-library.js";
import {
  UNIT_03_SOURCE_LIBRARY_META,
  UNIT_03_SOURCES,
  UNIT_03_VISUAL_SOURCES,
} from "./unit-03-source-library.js";
import {
  UNIT_04_SOURCE_LIBRARY_META,
  UNIT_04_SOURCES,
  UNIT_04_VISUAL_SOURCES,
} from "./unit-04-source-library.js";
import {
  UNIT_05_SOURCE_LIBRARY_META,
  UNIT_05_SOURCES,
  UNIT_05_VISUAL_SOURCES,
} from "./unit-05-source-library.js";
import {
  UNIT_06_SOURCE_LIBRARY_META,
  UNIT_06_SOURCES,
  UNIT_06_VISUAL_SOURCES,
} from "./unit-06-source-library.js";
import {
  UNIT_07_SOURCE_LIBRARY_META,
  UNIT_07_SOURCES,
  UNIT_07_VISUAL_SOURCES,
} from "./unit-07-source-library.js";
import {
  UNIT_08_SOURCE_LIBRARY_META,
  UNIT_08_SOURCES,
  UNIT_08_VISUAL_SOURCES,
} from "./unit-08-source-library.js";
import {
  UNIT_09_SOURCE_LIBRARY_META,
  UNIT_09_SOURCES,
  UNIT_09_VISUAL_SOURCES,
} from "./unit-09-source-library.js";

export const PRIMARY_SOURCE_LIBRARY_UNITS = [
  {
    meta: UNIT_01_SOURCE_LIBRARY_META,
    sources: UNIT_01_SOURCES,
    visualSources: UNIT_01_VISUAL_SOURCES,
  },
  {
    meta: UNIT_02_SOURCE_LIBRARY_META,
    sources: UNIT_02_SOURCES,
    visualSources: UNIT_02_VISUAL_SOURCES,
  },
  {
    meta: UNIT_03_SOURCE_LIBRARY_META,
    sources: UNIT_03_SOURCES,
    visualSources: UNIT_03_VISUAL_SOURCES,
  },
  {
    meta: UNIT_04_SOURCE_LIBRARY_META,
    sources: UNIT_04_SOURCES,
    visualSources: UNIT_04_VISUAL_SOURCES,
  },
  {
    meta: UNIT_05_SOURCE_LIBRARY_META,
    sources: UNIT_05_SOURCES,
    visualSources: UNIT_05_VISUAL_SOURCES,
  },
  {
    meta: UNIT_06_SOURCE_LIBRARY_META,
    sources: UNIT_06_SOURCES,
    visualSources: UNIT_06_VISUAL_SOURCES,
  },
  {
    meta: UNIT_07_SOURCE_LIBRARY_META,
    sources: UNIT_07_SOURCES,
    visualSources: UNIT_07_VISUAL_SOURCES,
  },
  {
    meta: UNIT_08_SOURCE_LIBRARY_META,
    sources: UNIT_08_SOURCES,
    visualSources: UNIT_08_VISUAL_SOURCES,
  },
  {
    meta: UNIT_09_SOURCE_LIBRARY_META,
    sources: UNIT_09_SOURCES,
    visualSources: UNIT_09_VISUAL_SOURCES,
  },
];

export const ALL_PRIMARY_SOURCES = PRIMARY_SOURCE_LIBRARY_UNITS.flatMap((unit) => unit.sources);
export const ALL_VISUAL_SOURCES = PRIMARY_SOURCE_LIBRARY_UNITS.flatMap(
  (unit) => unit.visualSources
);

const SOURCE_BY_ID = new Map(ALL_PRIMARY_SOURCES.map((source) => [source.id, source]));
const VISUAL_SOURCE_BY_ID = new Map(ALL_VISUAL_SOURCES.map((source) => [source.id, source]));

export function getPrimarySourceById(id) {
  return SOURCE_BY_ID.get(id);
}

export function getVisualSourceById(id) {
  return VISUAL_SOURCE_BY_ID.get(id);
}

export function getPrimarySourcesForUnit(unit) {
  return ALL_PRIMARY_SOURCES.filter((source) => source.unit === unit);
}

export function getVisualSourcesForUnit(unit) {
  return ALL_VISUAL_SOURCES.filter((source) => source.unit === unit);
}
