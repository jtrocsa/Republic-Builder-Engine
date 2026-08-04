import "./styles/global.css";
import { BRAND, UNIT_01, CASE_001_SOURCES, REVIEW } from "./content/unit-01-campaign.js";
import {
  UNIT_02,
  CASE_004_SOURCES,
  CASE_004_LANES,
  UNIT_02_REVIEW,
} from "./content/unit-02-campaign.js";
import { UNIT_03, CASE_007_SOURCES, CASE_007_LANES } from "./content/unit-03-campaign.js";
import { UNIT_04, CASE_010_SOURCES, CASE_010_LANES } from "./content/unit-04-campaign.js";
import { UNIT_05, CASE_013_SOURCES, CASE_013_LANES } from "./content/unit-05-campaign.js";
import { CED_THEME_LABEL } from "./content/ced-taxonomy.js";
import { skillsForQuestSlots } from "./engine/ced-alignment.js";
import {
  loadProgress,
  saveProgress,
  resetProgress,
  hasSavedProgress,
  hydrateRemoteProgress,
} from "./repositories/progress-repository.js";
import {
  resolveField as resolveTeacherOverride,
  hasOverride as hasTeacherOverride,
  setOverride as setTeacherOverride,
  clearAllOverrides as clearTeacherOverrides,
  initForCurrentUser as initTeacherOverridesForCurrentUser,
  setActiveClassroom as setActiveOverrideClassroom,
} from "./repositories/teacher-override-repository.js";
import { CHRONICLE_OPENING_DEFAULTS } from "./content/chronicle-opening.defaults.js";
import { CHRONICLE_IDENTITY_DEFAULTS } from "./content/chronicle-identity.defaults.js";
import {
  renderQuest,
  gradeQuest,
  questAnsweredAny,
  isQuestComplete,
  questPartialSuccess,
  questHint,
  questSkillOutcomes,
} from "./quest-types/index.js";
import {
  REFLECTION_MIN_LENGTH,
  SKILL_CATEGORIES,
} from "./quest-types/history/evidence-organizing-quest.js";
import { DBQ_MIN_RESPONSE_LENGTH } from "./quest-types/history/dbq-quest.js";
import {
  UNIT_01_MCQ_QUESTS,
  UNIT_01_SEQUENCING_QUESTS,
  UNIT_01_EVIDENCE_ORGANIZING_QUESTS,
  UNIT_01_SOURCE_ANALYSIS_QUESTS,
  UNIT_01_INVESTIGATION_MCQ_QUESTS,
  UNIT_01_INVESTIGATION_SEQUENCING_QUESTS,
  UNIT_01_READER_MCQ_QUESTS,
  UNIT_01_ARCHIVE_CHALLENGE_QUESTS,
  UNIT_01_ARCHIVE_EVIDENCE_QUESTS,
  UNIT_01_ARCHIVE_SAQ_QUESTS,
} from "./content/quests/unit-01-quests.js";
import {
  UNIT_02_MCQ_QUESTS,
  UNIT_02_READER_MCQ_QUESTS,
  UNIT_02_SEQUENCING_QUESTS,
  UNIT_02_EVIDENCE_ORGANIZING_QUESTS,
  UNIT_02_SOURCE_ANALYSIS_QUESTS,
  UNIT_02_ARCHIVE_CHALLENGE_QUESTS,
  UNIT_02_INVESTIGATION_EVIDENCE_QUESTS,
  UNIT_02_ARCHIVE_STRONGEST_EVIDENCE_QUESTS,
  UNIT_02_ARCHIVE_SEQUENCING_QUESTS,
  UNIT_02_ARCHIVE_SAQ_QUESTS,
} from "./content/quests/unit-02-quests.js";
import {
  UNIT_03_MCQ_QUESTS,
  UNIT_03_SEQUENCING_QUESTS,
  UNIT_03_EVIDENCE_ORGANIZING_QUESTS,
  UNIT_03_SOURCE_ANALYSIS_QUESTS,
  UNIT_03_INVESTIGATION_QUESTS,
  UNIT_03_INVESTIGATION_MCQ_QUESTS,
  UNIT_03_ARCHIVE_CHALLENGE_QUESTS,
  UNIT_03_ARCHIVE_MCQ_QUESTS,
  UNIT_03_ARCHIVE_SAQ_QUESTS,
  UNIT_03_ARCHIVE_DBQ_QUESTS,
} from "./content/quests/unit-03-quests.js";
import {
  UNIT_04_MCQ_QUESTS,
  UNIT_04_SEQUENCING_QUESTS,
  UNIT_04_EVIDENCE_ORGANIZING_QUESTS,
  UNIT_04_SOURCE_ANALYSIS_QUESTS,
  UNIT_04_ARCHIVE_SEQUENCING_QUESTS,
  UNIT_04_ARCHIVE_SOURCE_ANALYSIS_QUESTS,
  UNIT_04_ARCHIVE_SAQ_QUESTS,
  UNIT_04_ARCHIVE_DBQ_QUESTS,
} from "./content/quests/unit-04-quests.js";
import {
  UNIT_05_MCQ_QUESTS,
  UNIT_05_SEQUENCING_QUESTS,
  UNIT_05_EVIDENCE_ORGANIZING_QUESTS,
  UNIT_05_SOURCE_ANALYSIS_QUESTS,
  UNIT_05_ARCHIVE_SEQUENCING_QUESTS,
  UNIT_05_ARCHIVE_EVIDENCE_QUESTS,
  UNIT_05_ARCHIVE_SAQ_QUESTS,
  UNIT_05_ARCHIVE_DBQ_QUESTS,
} from "./content/quests/unit-05-quests.js";
import { renderTiledMap, createTilesetImageResolver } from "./engine/tiled-map-loader.js";
// The activity engines (Phase 68, decision log 0051). These four replaced the three
// hand-written activity screens that were each welded to one source id. The registry knows no
// history; everything a mission says lives in content/activities/.
import {
  ACTIVITY_ENGINE_KEYS,
  actOnActivity,
  activityOutcome,
  activitySummary,
  defaultActivityState,
  isActivityComplete,
  isActivityEngine,
  interviewHasAsked,
  renderActivity,
  renderActivityInline,
} from "./engine/activities/index.js";
import { UNIT_01_ACTIVITIES } from "./content/activities/unit-01-activities.js";
import { UNIT_02_ACTIVITIES } from "./content/activities/unit-02-activities.js";
// The Codex's own arithmetic, kept pure and out here: what a filed record looks like, and how two
// of them relate. main.js keeps the wiring and the screen.
import {
  buildCodexEntry,
  codexByUnit,
  codexCrossReferences,
  codexEntries,
  codexSeeAlso,
  codexStats,
} from "./engine/codex-archive.js";
import { createEscortWalk, stepEscort } from "./engine/escort-walk.js";
import { createScene, stepScene, advanceScene, skipScene } from "./engine/cutscene.js";
import { CUTSCENES } from "./content/cutscenes.js";
import { ellipse, rectsOverlap, footBoxFor } from "./engine/geometry.js";
import { landPathD, projectPoint } from "./engine/geo-projection.js";
import landCoastlines from "./content/maps/land-coastlines.json";
import {
  MAP_VIEWS,
  UNIT_MAP_VIEW,
  DEFAULT_MAP_VIEW,
} from "./content/maps/navigation-table-views.js";
import {
  playSfx,
  playQuestSfx,
  toggleAudio,
  updateMusicForScreen,
  isAudioEnabled,
} from "./engine/audio-engine.js";
import {
  DEFAULT_DAILY_ROTATION_TARGET,
  reviewRotationItem,
  selectDailyRotationQueue,
  rotationDateString,
  nextStreakDays,
} from "./engine/spaced-repetition.js";
import riverbendTmjRaw from "./content/maps/riverbend-field.tmj?raw";
import caribbeanTmjRaw from "./content/maps/caribbean-field.tmj?raw";
import archiveRoomTmjRaw from "./content/maps/archive-room.tmj?raw";
import instituteHallTmjRaw from "./content/maps/institute-hall.tmj?raw";
import hallwayTmjRaw from "./content/maps/hallway.tmj?raw";
import commonCauseTmjRaw from "./content/maps/common-cause-field.tmj?raw";
import canalCrossroadsTmjRaw from "./content/maps/canal-crossroads-field.tmj?raw";
import canalPrintShopTmjRaw from "./content/maps/canal-print-shop.tmj?raw";
import canalBoardingHouseTmjRaw from "./content/maps/canal-boarding-house.tmj?raw";
import richmondTmjRaw from "./content/maps/richmond-field.tmj?raw";
import richmondCountingRoomTmjRaw from "./content/maps/richmond-counting-room.tmj?raw";
import richmondHospitalWardTmjRaw from "./content/maps/richmond-hospital-ward.tmj?raw";
// Field collision, generated alongside each .tmj from the same stamps that painted it — see
// scripts/lib/map-builder.js and docs/decision-log/0036. These replace three hand-maintained rect
// arrays that had to be kept in sync with the generators by eye, and that gave every building a
// ground-contact row only, so the player could walk onto roofs.
// The `*_ROADS` companions arrived in Phase 62 and, unlike `*_DOORS`, the running game reads them:
// engine/npc-routing.js costs a road cell a quarter of open ground, which is what sends a routed
// NPC down the high street rather than diagonally across the crop beds.
import {
  CARIBBEAN_FIELD_BLOCKS,
  CARIBBEAN_FIELD_ROADS,
} from "./content/maps/caribbean-field.blocks.js";
import {
  RIVERBEND_FIELD_BLOCKS,
  RIVERBEND_FIELD_ROADS,
} from "./content/maps/riverbend-field.blocks.js";
import {
  COMMON_CAUSE_FIELD_BLOCKS,
  COMMON_CAUSE_FIELD_ROADS,
} from "./content/maps/common-cause-field.blocks.js";
import {
  CANAL_CROSSROADS_FIELD_BLOCKS,
  CANAL_CROSSROADS_FIELD_ROADS,
} from "./content/maps/canal-crossroads-field.blocks.js";
import {
  RICHMOND_FIELD_BLOCKS,
  RICHMOND_FIELD_ROADS,
} from "./content/maps/richmond-field.blocks.js";
// The two rooms that map opens into. No `*_ROADS` companion: a route is pathfound over road cells
// discounted 4:1, and nothing in a twenty-tile room is far enough from anything for a road to mean
// what it means outdoors.
import { CANAL_PRINT_SHOP_BLOCKS } from "./content/maps/canal-print-shop.blocks.js";
import { CANAL_BOARDING_HOUSE_BLOCKS } from "./content/maps/canal-boarding-house.blocks.js";
import { RICHMOND_COUNTING_ROOM_BLOCKS } from "./content/maps/richmond-counting-room.blocks.js";
import { RICHMOND_HOSPITAL_WARD_BLOCKS } from "./content/maps/richmond-hospital-ward.blocks.js";
import { INSTITUTE_HALL_BLOCKS } from "./content/maps/institute-hall.blocks.js";
import { ARCHIVE_ROOM_BLOCKS } from "./content/maps/archive-room.blocks.js";
import { HALLWAY_BLOCKS } from "./content/maps/hallway.blocks.js";
import {
  createStormNavigationGame,
  tickStormNavigationGame,
  steerShip as steerStormShip,
  renderStormNavigationGame,
} from "./mini-games/storm-navigation.js";
import {
  createCargoSortingGame,
  tickCargoSortingGame,
  placeCargo,
  isCargoSortingComplete,
  renderCargoSortingGame,
} from "./mini-games/cargo-sorting.js";
import {
  getSession,
  onAuthStateChange,
  getProfile,
  signInWithPassword,
  signUpTeacher,
  signInWithOAuthGoogle,
  signOut,
  getSelectedClassroomId,
  setSelectedClassroomId,
  getCurrentClassroomId,
} from "./repositories/remote-auth-repository.js";
import {
  createClassroom,
  listMyClassrooms,
  getRoster,
  provisionSlots,
  claimSlot,
  resetStudentPassword,
  resolveStudentEmail,
  createClassroomsWithRoster,
  disableStudentSlot,
  getClassroomProgressSummaries,
} from "./repositories/remote-classroom-repository.js";
import {
  recordSubmission,
  listForClassroom,
  getSubmissionWithGrades,
  recordManualGrade,
  getGradedEvaluationIds,
} from "./repositories/remote-submission-repository.js";
import {
  listClassroomAssignments,
  createAssignment,
  deleteAssignment,
} from "./repositories/remote-assignment-repository.js";
import {
  getClassroomUnitFloor,
  advanceClassroomUnit,
} from "./repositories/remote-classroom-unit-repository.js";
import {
  getUnitSourcePool,
  setSourceInPool,
} from "./repositories/remote-source-pool-repository.js";
import {
  PRIMARY_SOURCE_LIBRARY_UNITS,
  getPrimarySourcesForUnit,
  getVisualSourcesForUnit,
  getPrimarySourceById,
  getVisualSourceById,
} from "./content/primary-source-library/index.js";
import {
  loadSelectionsForResolution,
  resolveSourceSlot,
  resolveQuestSlot,
  resolveQuestSlotWithType,
  questAlternateById,
  listSelectionsForCase,
  setDraftSelection,
  publishCaseSelections,
  resolvedAdditionsForCase,
} from "./repositories/remote-content-selection-repository.js";
import {
  listCustomContentForCase,
  createCustomContent,
  updateCustomContent,
} from "./repositories/remote-custom-content-repository.js";
import {
  buildAuthoredContent,
  defaultAuthoringFields,
  authoringFieldsFromContent,
  slugify,
} from "./engine/custom-content-authoring.js";
import { HIPP_DIMENSIONS } from "./quest-types/history/source-analysis-quest.js";
import { validateJoinCode, validateStudentIdCode, validatePassword } from "./engine/auth-flows.js";
import {
  buildHippEvaluationRequest,
  buildSaqEvaluationRequest,
  buildSaqQuestEvaluationRequest,
  buildDbqEvaluationRequest,
} from "./engine/evaluator-requests.js";
import { evaluateSubmission } from "./engine/evaluator-client.js";
import { spriteDirection, spriteSheetStyle, walkCycleSeconds } from "./engine/sprite-animation.js";
import { createBehaviourState, stepBehaviour } from "./engine/npc-behaviour.js";
import { buildCircuit, createNavGrid, findRoute } from "./engine/npc-routing.js";

const app = document.querySelector("#app");
// Director intro scene reveal cards — lookup keys, not literal paths, so content stays
// data-only (see docs/architecture/art-and-map-style-guide.md's "src is a lookup key"
// convention already established for tileset packs, reused here for reveal images).
const INTRO_REVEAL_IMAGES = {
  codex: new URL("./assets/chronicle-sprites/chronicle-codex.png", import.meta.url).href,
};
// Small inline-SVG line icons for the reveal badge/chip system (revealCardMarkup()) — matches
// the project's existing convention of inline SVG for small UI chrome (e.g. the cursor in
// global.css) rather than new PNG asset files, since no icon assets exist for these concepts.
// Keyed by the reveal's primary label (chips strip any " · descriptor" suffix before lookup).
const DIRECTOR_REVEAL_ICONS = {
  "The Institute": `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7 10 2l7 5"/><path d="M4 7v9M8 7v9M12 7v9M16 7v9"/><path d="M2 16h16"/><path d="M2 7h16"/></svg>`,
  "The Archive": `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="7" width="15" height="10" rx="1.2"/><path d="M2.5 7l1.5-3.5h12L17.5 7"/><path d="M8 11.2h4"/></svg>`,
  Testimony: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5h14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H8l-3.5 3v-3H3a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"/></svg>`,
  Artifacts: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.5h4M8.5 2.5c-.8 2-2 2.6-2 4.6 0 1.6 1 2.4 1 2.4-2.4.6-3.5 2.6-3.5 4.6 0 2.4 2.5 3.4 6 3.4s6-1 6-3.4c0-2-1.1-4-3.5-4.6 0 0 1-.8 1-2.4 0-2-1.2-2.6-2-4.6"/></svg>`,
  Images: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3.5" width="15" height="13" rx="1.2"/><circle cx="7" cy="8" r="1.4"/><path d="M3 15l4.5-4.5 3 3 2.5-3 4 4.5"/></svg>`,
  Laws: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3v14M6 17h8M10 3 4 6M10 3l6 3"/><path d="M4 6 1.5 11a2.7 2.7 0 0 0 5 0L4 6ZM16 6l-2.5 5a2.7 2.7 0 0 0 5 0L16 6Z"/></svg>`,
  Journals: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5c-1.5-1.2-3.5-1.5-6-1.2v10.7c2.5-.3 4.5 0 6 1.2 1.5-1.2 3.5-1.5 6-1.2V3.8c-2.5-.3-4.5 0-6 1.2Z"/><path d="M10 5v10.7"/></svg>`,
};
// Draws one .tmj into up to two stacked canvases: `<baseId>` holds everything below the player
// and `<baseId>Overlay`, when the markup provides it, holds the map's "overlay" layers so tree
// canopies and roof eaves can draw *over* the player. Maps with no overlay layer render exactly
// as before — depth "below" is every layer when none is named "overlay".
function renderTiledMapWithOverlay(baseId, tmj, resolveImage) {
  const canvas = document.getElementById(baseId);
  if (canvas && canvas.dataset.rendered !== "true") {
    renderTiledMap(canvas, tmj, resolveImage, { depth: "below" }).then(() => {
      canvas.dataset.rendered = "true";
    });
  }
  const overlay = document.getElementById(`${baseId}Overlay`);
  if (overlay && overlay.dataset.rendered !== "true") {
    renderTiledMap(overlay, tmj, resolveImage, { depth: "overlay" }).then(() => {
      overlay.dataset.rendered = "true";
    });
  }
}

// Riverbend Tiled tileset proof of concept (see docs/architecture/POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md,
// 2026-07-10 entry) — replaces the static placeholder PNG above with a composited .tmj map.
// Scoped to this one map only; not a project-wide Tiled adoption.
const riverbendTmj = JSON.parse(riverbendTmjRaw);
// Scoped to the exact sheets the .tmj references, not the whole pack folders — see
// docs/architecture/art-and-map-style-guide.md and docs/architecture/tiled-map-import-checklist.md.
// This previously globbed whole pack folders (13-16 unused sheets bundled per pack), the same
// unscoped-glob regression the checklist warns about; Caribbean/Archive already scope by exact file.
const resolveRiverbendTilesetImage = createTilesetImageResolver(
  import.meta.glob("./assets/tilesets/Medieval Fishing Village/tile-B-04.png", {
    eager: true,
    import: "default",
  }),
  // farm/6 supplies the ground blocks, crops, fencing, well and shed. Its trees and farm/7's
  // clapboard housing are no longer drawn from the packs directly: they crossed tile boundaries,
  // so they were repacked onto the grid into derived/ — see derived-objects.manifest.js.
  import.meta.glob("./assets/tilesets/farm/6.png", { eager: true, import: "default" }),
  import.meta.glob("./assets/tilesets/derived/farm-trees.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/derived/farm-buildings.png", {
    eager: true,
    import: "default",
  }),
  // One ground block: the packed earth the settlement's roads are painted in as of Phase 58. Same
  // sheet Philadelphia already globs, so Vite bundles nothing new.
  import.meta.glob("./assets/tilesets/Medieval Fantasy Town/2.png", {
    eager: true,
    import: "default",
  })
);
function renderRiverbendTiledMap() {
  renderTiledMapWithOverlay("riverbendTiledCanvas", riverbendTmj, resolveRiverbendTilesetImage);
}
// Caribbean field (Unit 1) Tiled rebuild — see docs/decision-log/0029-caribbean-tiled-rebuild.md.
// Replaces the earlier CSS-shape-drawn scene with a real tileset composite, generated by
// scripts/generate-caribbean-tmj.js against the Island survival pack (chosen after the prior
// Medieval Harbor prototype was found to lack tropical huts/palms/campfire tiles entirely).
const caribbeanTmj = JSON.parse(caribbeanTmjRaw);
// Scoped to the two sheets the .tmj actually references (tile-B-01/02), not the whole
// "Island survival" folder — that pack has 13 sheets totaling many MB, and an unscoped
// glob bundles every matched file into the production build whether it's drawn or not
// (see docs/architecture/tiled-map-import-checklist.md — this exact regression has been
// caught before).
const resolveCaribbeanTilesetImage = createTilesetImageResolver(
  import.meta.glob("./assets/tilesets/Island survival/tile-B-01.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Island survival/tile-B-02.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Island survival/5.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Medieval harbor/tile-B-04.png", {
    eager: true,
    import: "default",
  }),
  // One ground block: the packed earth the island's tracks are painted in as of Phase 58. Island
  // survival has no full-bleed dirt of its own — see the palette.
  import.meta.glob("./assets/tilesets/Medieval Fantasy Town/2.png", {
    eager: true,
    import: "default",
  })
);
function renderCaribbeanTiledMap() {
  renderTiledMapWithOverlay("caribbeanTiledCanvas", caribbeanTmj, resolveCaribbeanTilesetImage);
}
// Institute Archive Room interior — see docs/decision-log/0030-archive-room-tiled-interior.md and,
// for the Phase 58 MapBuilder rebuild, 0041-archive-room-mapbuilder-rebuild.md. Generated by
// scripts/generate-archive-room-tmj.js against the "Medieval Tavern" pack; collision comes from the
// generated ARCHIVE_ROOM_BLOCKS imported above, not from a hand-measured array, and the room now
// names the same four sheets and the same furniture cells as the Main Hall next door.
const archiveRoomTmj = JSON.parse(archiveRoomTmjRaw);
const resolveArchiveRoomTilesetImage = createTilesetImageResolver(
  import.meta.glob("./assets/tilesets/Medieval Tavern/tile-B-01.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Medieval Tavern/tile-B-03.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Medieval Tavern/tile-B-05.png", {
    eager: true,
    import: "default",
  }),
  // The room has real walls as of Phase 58 — before that its perimeter was implied by furniture runs
  // with the page background beyond them, which is the main reason it did not read as the same
  // building as the Main Hall. Same sheet the hall already globs, so Vite bundles nothing new.
  import.meta.glob("./assets/tilesets/Medieval Tavern/Auto-tile-A4-walls-2.png", {
    eager: true,
    import: "default",
  }),
  // The Institute's seating, generated at the size a stool actually is rather than borrowed from a
  // pack that draws every 1x1 prop 45px tall — see derived-objects.manifest.js and decision log 0045.
  import.meta.glob("./assets/tilesets/derived/institute-furnishings.png", {
    eager: true,
    import: "default",
  })
);
function renderArchiveRoomTiledMap() {
  renderTiledMapWithOverlay(
    "archiveRoomTiledCanvas",
    archiveRoomTmj,
    resolveArchiveRoomTilesetImage
  );
}
// Institute Main Hall interior — see docs/decision-log/0037-institute-hall-tiled-rebuild.md.
// Generated by scripts/generate-institute-hall-tmj.js; collision comes from the generated
// INSTITUTE_HALL_BLOCKS imported above, not from a hand-measured array.
//
// This replaced the one screen in the game that was not built from the tile library: a single
// hand-drawn `chronicle-institute-hub.png` stretched behind percentage-positioned CSS buttons.
// Three of the five sheets are the same files the Archive Room and hallway already glob, so Vite
// bundles no extra art for them; the two additions are the A4 wall surfaces (this room has real
// walls, which the Archive Room does not) and Island survival/5, which supplies the compass-rose
// Navigation Table, the brass compass and the Preservation Case plinth — the palette header records
// why nothing in the Medieval Tavern family could stand in for those three.
const instituteHallTmj = JSON.parse(instituteHallTmjRaw);
const resolveInstituteHallTilesetImage = createTilesetImageResolver(
  import.meta.glob("./assets/tilesets/Medieval Tavern/tile-B-01.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Medieval Tavern/tile-B-03.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Medieval Tavern/tile-B-05.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Medieval Tavern/Auto-tile-A4-walls-2.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Island survival/5.png", {
    eager: true,
    import: "default",
  }),
  // The brass compass, repacked down to 1x1 so it can sit on the Navigation Table — see
  // derived-objects.manifest.js. A sheet named in a palette but missing from this resolver is not a
  // missing tile: createTilesetImageResolver() throws, so renderTiledMap() rejects and the whole map
  // draws as an empty frame. The visual-regression baseline is what caught that — twice now, the
  // second time on the furnishings sheet below.
  import.meta.glob("./assets/tilesets/derived/institute-artifacts.png", {
    eager: true,
    import: "default",
  }),
  // The Institute's seating, generated at the size a stool actually is rather than borrowed from a
  // pack that draws every 1x1 prop 45px tall — see derived-objects.manifest.js and decision log 0045.
  import.meta.glob("./assets/tilesets/derived/institute-furnishings.png", {
    eager: true,
    import: "default",
  })
);
function renderInstituteHallTiledMap() {
  renderTiledMapWithOverlay(
    "instituteHallTiledCanvas",
    instituteHallTmj,
    resolveInstituteHallTilesetImage
  );
}
// The Institute's Entrance Hall — see scripts/generate-hallway-tmj.js. Shares the Main Hall's five
// interior sheets exactly (the glob calls target identical file paths, so Vite bundles no additional
// tileset art) because its north doors open straight into that room and the two have to read as one
// building. Unlike the Main Hall it draws no Island survival props: the Navigation Table and the
// Preservation Case are what make that room the hub, and an entrance hall holding them too would
// blunt the handoff.
const hallwayTmj = JSON.parse(hallwayTmjRaw);
const resolveHallwayTilesetImage = createTilesetImageResolver(
  import.meta.glob("./assets/tilesets/Medieval Tavern/tile-B-01.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Medieval Tavern/tile-B-03.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Medieval Tavern/tile-B-05.png", {
    eager: true,
    import: "default",
  }),
  // Real stone walls, added in Phase 62 when this stopped being a cutscene backdrop whose "walls"
  // were two CSS gradient bands. Same caveat as the Main Hall's resolver above: a sheet named in the
  // palette but missing here makes createTilesetImageResolver() throw, and the map draws as an empty
  // frame rather than failing loudly.
  import.meta.glob("./assets/tilesets/Medieval Tavern/Auto-tile-A4-walls-2.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/derived/institute-furnishings.png", {
    eager: true,
    import: "default",
  })
);
function renderHallwayTiledMap() {
  renderTiledMapWithOverlay("hallwayTiledCanvas", hallwayTmj, resolveHallwayTilesetImage);
}
// Common Cause field (Unit 3) Tiled rebuild — see docs/decision-log/0032-common-cause-tiled-rebuild.md
// and 0036 for the Phase 53 pass that retired the Medieval Fantasy Town building silhouettes.
// Replaces the earlier CSS-drawn scene (commonCauseWorldMarkup()'s old div-per-block approach)
// with a real tileset composite, generated by scripts/generate-common-cause-tmj.js. Buildings now
// come from derived/, where farm/7's painted clapboard and the library's two churches were
// repacked onto the tile grid; the liberty pole, with no existing-pack equivalent, is the one
// PixelLab-generated asset.
const commonCauseTmj = JSON.parse(commonCauseTmjRaw);
const resolveCommonCauseTilesetImage = createTilesetImageResolver(
  import.meta.glob("./assets/tilesets/Medieval Fantasy Town/2.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Medieval Fishing Village/tile-B-04.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Common Cause Philadelphia/liberty-pole.png", {
    eager: true,
    import: "default",
  }),
  // Churchyard fencing and quayside produce; and the library's only period square-rigged hulls
  // for the Delaware waterfront.
  import.meta.glob("./assets/tilesets/farm/6.png", { eager: true, import: "default" }),
  import.meta.glob("./assets/tilesets/Medieval harbor/tile-B-04.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/derived/farm-trees.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/derived/farm-buildings.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/derived/town-civic.png", {
    eager: true,
    import: "default",
  })
);
function renderCommonCauseTiledMap() {
  renderTiledMapWithOverlay(
    "commonCauseTiledCanvas",
    commonCauseTmj,
    resolveCommonCauseTilesetImage
  );
}
// Canal Crossroads (Unit 4) — an Erie Canal boomtown, upstate New York, 1845. Generated by
// scripts/generate-canal-crossroads-tmj.js from canal-crossroads-field.palette.js.
//
// Nine globs for nine sheets, and every one of them has to be here: createTilesetImageResolver()
// throws on a sheet the .tmj names but nothing resolves, renderTiledMap() rejects, and the whole map
// draws as an empty frame. That has happened twice. Five of the nine are already bundled by
// Philadelphia and Riverbend, so they cost nothing beyond the line.
const canalCrossroadsTmj = JSON.parse(canalCrossroadsTmjRaw);
const resolveCanalCrossroadsTilesetImage = createTilesetImageResolver(
  import.meta.glob("./assets/tilesets/Medieval Fantasy Town/2.png", {
    eager: true,
    import: "default",
  }),
  // The water mill and its flume, the timber barn, the hay shed, split-rail fencing, log piles.
  import.meta.glob("./assets/tilesets/Medieval Fantasy Town/3.png", {
    eager: true,
    import: "default",
  }),
  // The canal itself, and the plank crossing over it.
  import.meta.glob("./assets/tilesets/Medieval Fishing Village/tile-B-04.png", {
    eager: true,
    import: "default",
  }),
  // Quay coping, bollards, the loading derricks, cargo, cattails.
  import.meta.glob("./assets/tilesets/19th Centruy European Dock/tile-B-06.png", {
    eager: true,
    import: "default",
  }),
  // The masonry half of the town: the free bank, the print office, Market Street, the terraces.
  import.meta.glob("./assets/tilesets/19th Century European City/tile-B-01.png", {
    eager: true,
    import: "default",
  }),
  // Prop quarry only — the lock gates and the cargo barge, nothing else on the sheet.
  import.meta.glob("./assets/tilesets/Steampunk/1.png", { eager: true, import: "default" }),
  import.meta.glob("./assets/tilesets/derived/farm-trees.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/derived/farm-buildings.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/derived/town-civic.png", {
    eager: true,
    import: "default",
  }),
  // The Reform Square notice board. Adding a sheet to a palette means adding its glob here too —
  // createTilesetImageResolver() throws on a missing one and the whole map renders as an empty
  // frame, which has now happened twice.
  import.meta.glob("./assets/tilesets/derived/canal-works.png", {
    eager: true,
    import: "default",
  })
);
function renderCanalCrossroadsTiledMap() {
  renderTiledMapWithOverlay(
    "canalCrossroadsTiledCanvas",
    canalCrossroadsTmj,
    resolveCanalCrossroadsTilesetImage
  );
}

// The two Canal Crossroads interiors. One resolver serves both: they name four sheets between them
// and three of the four are shared, so a resolver per room would only duplicate globs. Every glob is
// an exact file — never a `/**` — because an unscoped one shipped 117 MB of unused art once already,
// and because createTilesetImageResolver() throws on a missing sheet and the whole room then renders
// as an empty frame. That has happened twice.
//
// Both `19th Century European City` sheets are new to the bundle here; the Dock sheet and
// `derived/canal-works.png` are already carried by the outdoor map above, so they cost nothing.
const canalPrintShopTmj = JSON.parse(canalPrintShopTmjRaw);
const canalBoardingHouseTmj = JSON.parse(canalBoardingHouseTmjRaw);
const resolveCanalInteriorTilesetImage = createTilesetImageResolver(
  // Floors, plaster and brick walls, doors, sash windows, bookcases, the editor's desk and safe.
  import.meta.glob("./assets/tilesets/19th Century European City/tile-B-04.png", {
    eager: true,
    import: "default",
  }),
  // Tables, chairs, dressers, cupboards, the boarding table and the keeper's counter.
  import.meta.glob("./assets/tilesets/19th Century European City/tile-B-02.png", {
    eager: true,
    import: "default",
  }),
  // Barrels, crates and grain sacks — already bundled by the outdoor map.
  import.meta.glob("./assets/tilesets/19th Centruy European Dock/tile-B-06.png", {
    eager: true,
    import: "default",
  }),
  // The commissioned props: press, type case, stove, paper, bed, wash tub, notice board.
  import.meta.glob("./assets/tilesets/derived/canal-works.png", {
    eager: true,
    import: "default",
  })
);
function renderCanalPrintShopTiledMap() {
  renderTiledMapWithOverlay(
    "canalPrintShopTiledCanvas",
    canalPrintShopTmj,
    resolveCanalInteriorTilesetImage
  );
}
function renderCanalBoardingHouseTiledMap() {
  renderTiledMapWithOverlay(
    "canalBoardingHouseTiledCanvas",
    canalBoardingHouseTmj,
    resolveCanalInteriorTilesetImage
  );
}

// Richmond (Unit 5) — "The Fractured Republic", Virginia, 1864. Generated by
// scripts/generate-richmond-tmj.js from richmond-field.palette.js.
//
// Nine globs for nine sheets, and every one of them has to be here: createTilesetImageResolver()
// throws on a sheet the .tmj names but nothing resolves, renderTiledMap() rejects, and the whole map
// draws as an empty frame. That has happened twice. Seven of the nine are already bundled by Canal
// Crossroads and Philadelphia, so they cost nothing beyond the line; the two additions are
// Steampunk/3 and the commissioned derived/civil-war-works.png.
const richmondTmj = JSON.parse(richmondTmjRaw);
const resolveRichmondTilesetImage = createTilesetImageResolver(
  // Every surface on this map: grass, grey cobble, warm cobble, packed earth — the only four terrain
  // blocks in the library verified 0% transparent edge to edge. See the palette's note on `lot`.
  import.meta.glob("./assets/tilesets/Medieval Fantasy Town/2.png", {
    eager: true,
    import: "default",
  }),
  // The James and the canal, the falls, quay coping, the bluff's retaining wall, the derricks, the
  // bridge decking, cargo and bollards.
  import.meta.glob("./assets/tilesets/19th Centruy European Dock/tile-B-06.png", {
    eager: true,
    import: "default",
  }),
  // The masonry city: the Capitol, the churches, the terraces, the government offices, Shockoe's
  // warehouse fronts, the wagons and the square's fountain.
  import.meta.glob("./assets/tilesets/19th Century European City/tile-B-01.png", {
    eager: true,
    import: "default",
  }),
  // Prop quarry only — the cargo barge, and nothing else on the sheet.
  import.meta.glob("./assets/tilesets/Steampunk/1.png", { eager: true, import: "default" }),
  // Prop quarry only — Tredegar's furnace and the depot's locomotive. Its two brick frontages were
  // tried as the ironworks and rejected against the render; see the palette.
  import.meta.glob("./assets/tilesets/Steampunk/3.png", { eager: true, import: "default" }),
  import.meta.glob("./assets/tilesets/derived/farm-trees.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/derived/farm-buildings.png", {
    eager: true,
    import: "default",
  }),
  // The market price board and Capitol Square's.
  import.meta.glob("./assets/tilesets/derived/canal-works.png", {
    eager: true,
    import: "default",
  }),
  // The commission this map was the reason for: wall tent, rampart, abatis, field gun, supply wagon,
  // hospital cot.
  import.meta.glob("./assets/tilesets/derived/civil-war-works.png", {
    eager: true,
    import: "default",
  }),
  // Nine objects repacked off `war ruins` sheets 21 and 22 — the house taken down for the line and
  // its salvage, the chevaux-de-frise, the laboratory on Brown's Island, the woodpile, two stripped
  // trees. Not one of them is bomb damage; see the palette's header note 1 for why an 1864 city
  // that does not burn until 1865 has ruins on it at all.
  import.meta.glob("./assets/tilesets/derived/richmond-ruins.png", {
    eager: true,
    import: "default",
  })
);
function renderRichmondTiledMap() {
  renderTiledMapWithOverlay("richmondTiledCanvas", richmondTmj, resolveRichmondTilesetImage);
}

// Richmond's two rooms. One resolver serves both, as at Canal Crossroads, and every sheet either
// room names is already in the bundle: the two `19th Century European City` interior sheets come in
// with the printing office and the boardinghouse, and derived/civil-war-works.png with the outdoor
// map above. Three globs, zero bytes added.
const richmondCountingRoomTmj = JSON.parse(richmondCountingRoomTmjRaw);
const richmondHospitalWardTmj = JSON.parse(richmondHospitalWardTmjRaw);
const resolveRichmondInteriorTilesetImage = createTilesetImageResolver(
  // Floors, wainscot, whitewash, brick, both doors, sash windows, the trader's and matron's desks,
  // the safe, the ledger presses, the linen presses and the medicine cabinet.
  import.meta.glob("./assets/tilesets/19th Century European City/tile-B-04.png", {
    eager: true,
    import: "default",
  }),
  // The clerks' table, the ward's work table, the bedside tables, the store cupboard and the shelf.
  import.meta.glob("./assets/tilesets/19th Century European City/tile-B-02.png", {
    eager: true,
    import: "default",
  }),
  // The commissioned cot, and nothing else from that sheet in either room.
  import.meta.glob("./assets/tilesets/derived/civil-war-works.png", {
    eager: true,
    import: "default",
  })
);
function renderRichmondCountingRoomTiledMap() {
  renderTiledMapWithOverlay(
    "richmondCountingRoomTiledCanvas",
    richmondCountingRoomTmj,
    resolveRichmondInteriorTilesetImage
  );
}
function renderRichmondHospitalWardTiledMap() {
  renderTiledMapWithOverlay(
    "richmondHospitalWardTiledCanvas",
    richmondHospitalWardTmj,
    resolveRichmondInteriorTilesetImage
  );
}
const waldseemuller = new URL("./assets/documents/source-waldseemuller-1507.jpg", import.meta.url)
  .href;

// Storm Navigation mini-game art (see mini-games/storm-navigation.js) — resolved here, not in
// that module, so the module stays free of Vite/import.meta.url concerns and can be unit-tested
// with plain string fixtures.
const STORM_NAVIGATION_SPRITES = {
  ship: new URL("./assets/mini-games/storm-navigation/ship.svg", import.meta.url).href,
  hazardKinds: {
    rock: new URL("./assets/mini-games/storm-navigation/rock.svg", import.meta.url).href,
    wreckage: new URL("./assets/mini-games/storm-navigation/wreckage.svg", import.meta.url).href,
    whirlpool: new URL("./assets/mini-games/storm-navigation/whirlpool.svg", import.meta.url).href,
  },
  coastline: new URL("./assets/mini-games/storm-navigation/coastline.svg", import.meta.url).href,
  clouds: new URL("./assets/mini-games/storm-navigation/clouds.svg", import.meta.url).href,
};

const recallBeaconBlue = new URL(
  "./assets/chronicle-sprites/field/recall-beacon-blue.png",
  import.meta.url
).href;
// ---- Character sprite sheets --------------------------------------------------------------------
//
// One registry for every animated person in the game: the player's two Chroniclers, the three
// Institute staff, and every field NPC across all three units. It replaced three separate maps
// (`fieldNpcSprites`, `fieldSpriteAssets`, `instituteNpcSprites`) that between them held 45 loose
// PNG paths in three different shapes, resolved by three near-identical functions.
//
// Each entry is four horizontal walk strips plus one still portrait. A strip's columns are
// [standing, walk0 … walkN-1] on the canonical 48x55 canvas — see engine/sprite-animation.js for
// the geometry and scripts/assets/build-character-sheets.js for how PixelLab's exports are
// normalized onto it. `columns` differs per character because PixelLab generated Director Hale
// with a 6-frame walk template and the rest of the cast with an 8-frame one.
//
// Paths are globbed rather than written out as 105 literal `new URL(...)` calls, following the same
// pattern the tileset resolvers above already use. Vite still statically resolves every file.
const characterSheetFiles = {
  ...import.meta.glob("./assets/institute/*-{down,up,left,right,portrait}.png", {
    eager: true,
    import: "default",
  }),
  ...import.meta.glob("./assets/chronicle-sprites/field/*-{down,up,left,right,portrait}.png", {
    eager: true,
    import: "default",
  }),
};
// Every direction of every character is its own file, so a turn repoints background-image at a PNG
// the browser has either never fetched or has discarded the decoded bitmap for. `.character-sprite`
// is an empty span with nothing in it but that background, so it paints *nothing* for the frames
// between the style write and the swap resolving — which is the blink the playtest saw on every
// change of direction, on every character, on both surfaces.
//
// Holding a live Image per URL keeps each resource alive in the memory cache for the session, so
// applyCharacterSprite() is only ever swapping to something already decoded. ~105 files of a few KB
// each, every one of which the game fetches anyway the first time somebody faces that way.
//
// Guarded on `Image` rather than assuming a DOM: several unit tests import this module, and it must
// not throw at load outside a browser. Exported for the same reason `app` is checked elsewhere — the
// array only has to stay referenced for the images to stay alive.
export const CHARACTER_SHEET_PRELOAD =
  typeof Image === "function"
    ? Object.values(characterSheetFiles).map((url) => {
        const image = new Image();
        image.src = url;
        return image;
      })
    : [];
/**
 * One character's strips. `idle` is optional: a character that declares one has a second set of
 * strips holding a breathing cycle, which is what a stationed body plays instead of holding a
 * single frame for as long as the player is in the room. It carries its own column count because
 * the idle template is 4 frames where the walk is 8 — they are separate files precisely so neither
 * has to compromise, and so adding an idle changes nothing about the walk strips already shipped.
 */
function characterSheet(stem, columns, { idleColumns = 0 } = {}) {
  const file = (suffix) => {
    const url = characterSheetFiles[`./assets/${stem}-${suffix}.png`];
    if (!url) throw new Error(`missing character sheet: ${stem}-${suffix}.png`);
    return url;
  };
  const sheet = {
    columns,
    portrait: file("portrait"),
    down: file("down"),
    up: file("up"),
    left: file("left"),
    right: file("right"),
  };
  if (idleColumns) {
    sheet.idleColumns = idleColumns;
    sheet.idle = {
      down: file("idle-down"),
      up: file("idle-up"),
      left: file("idle-left"),
      right: file("idle-right"),
    };
  }
  return sheet;
}
const FIELD = "chronicle-sprites/field";
const CHARACTER_SHEETS = {
  // Institute staff. Director Hale is the cast's style and scale reference — every other body is
  // normalized to his height, and he must not be regenerated (docs/art/CHARACTER-CAST-SPEC.md).
  // `idleColumns: 5` gives each of them a breathing cycle to play while stood at their posts. The
  // Institute staff are the reason this exists: the player stands next to these three at close
  // range in three hub rooms every session, and until now each was a single unmoving frame.
  director: characterSheet("institute/director-rowan-hale", 7, { idleColumns: 5 }),
  amani: characterSheet("institute/researcher-amani-soto", 9, { idleColumns: 5 }),
  julian: characterSheet("institute/professor-julian-park", 9, { idleColumns: 5 }),
  // The Field Liaison, and the fourth body in the Main Hall. `idleColumns: 5` for the same reason
  // the three above have it — she is stationed, and the player stands next to her at close range.
  // The costume is deliberately short-jacketed over a pale shirt: Dr. Soto is already a tall dark
  // full-length coat in this room, and the two read as one silhouette at 48px if Voss wears another.
  // See docs/art/MERIDIAN-VISUAL-IDENTITY.md §6.
  liaison: characterSheet("institute/field-liaison-emery-voss", 9, { idleColumns: 5 }),
  // Player appearances.
  "chronicler-a": characterSheet(`${FIELD}/chronicler-a`, 9),
  "chronicler-b": characterSheet(`${FIELD}/chronicler-b`, 9),
  // Unit 1 · Caribbean, 1492.
  columbus: characterSheet(`${FIELD}/npc-columbus`, 9),
  "spanish-sailor": characterSheet(`${FIELD}/npc-spanish-sailor`, 9),
  "caribbean-man": characterSheet(`${FIELD}/npc-caribbean-man`, 9),
  "caribbean-woman": characterSheet(`${FIELD}/npc-caribbean-woman`, 9),
  "caribbean-child": characterSheet(`${FIELD}/npc-caribbean-child`, 9),
  "spanish-scribe": characterSheet(`${FIELD}/npc-spanish-scribe`, 9),
  // Unit 2 · Riverbend / Jamestown, 1607-1620.
  "jamestown-laborer": characterSheet(`${FIELD}/npc-jamestown-laborer`, 9),
  "jamestown-gentleman": characterSheet(`${FIELD}/npc-jamestown-gentleman`, 9),
  "jamestown-carpenter": characterSheet(`${FIELD}/npc-jamestown-carpenter`, 9),
  "jamestown-settler-woman": characterSheet(`${FIELD}/npc-jamestown-settler-woman`, 9),
  "powhatan-man": characterSheet(`${FIELD}/npc-powhatan-man`, 9),
  "powhatan-woman": characterSheet(`${FIELD}/npc-powhatan-woman`, 9),
  "jamestown-blacksmith": characterSheet(`${FIELD}/npc-jamestown-blacksmith`, 9),
  // Two separate sheets, not one posted twice: the settlement's three watch posts are meant to
  // read as different men, so `soldier` stands at the field gate and the landing and `watchman`
  // on the landward road.
  "jamestown-soldier": characterSheet(`${FIELD}/npc-jamestown-soldier`, 9),
  "jamestown-watchman": characterSheet(`${FIELD}/npc-jamestown-watchman`, 9),
  "jamestown-african-man": characterSheet(`${FIELD}/npc-jamestown-african-man`, 9),
  "jamestown-servant": characterSheet(`${FIELD}/npc-jamestown-servant`, 9),
  // Unit 4 · Canal Crossroads, upstate New York, 1845. Ten columns, not nine: PixelLab's v3 walk
  // keeps its reference frame, so these cycles are 9 frames where the earlier cast's are 8. The
  // column count travels with the character precisely so both can ship unchanged.
  "canal-boat-captain": characterSheet(`${FIELD}/npc-canal-boat-captain`, 9),
  "canal-lock-keeper-woman": characterSheet(`${FIELD}/npc-canal-lock-keeper-woman`, 9, {
    idleColumns: 5,
  }),
  "textile-mill-worker": characterSheet(`${FIELD}/npc-textile-mill-worker`, 9),
  "abolitionist-printer": characterSheet(`${FIELD}/npc-abolitionist-printer`, 9),
  "abolitionist-lecturer": characterSheet(`${FIELD}/npc-abolitionist-lecturer`, 9),
  "market-farmer": characterSheet(`${FIELD}/npc-market-farmer`, 9),
  "haudenosaunee-diplomat": characterSheet(`${FIELD}/npc-haudenosaunee-diplomat`, 9),
  "canal-boardinghouse-keeper": characterSheet(`${FIELD}/npc-canal-boardinghouse-keeper`, 9),
  "canal-irish-laborer": characterSheet(`${FIELD}/npc-canal-irish-laborer`, 9),
  "jacksonian-editor": characterSheet(`${FIELD}/npc-jacksonian-editor`, 9),
  "german-cooper": characterSheet(`${FIELD}/npc-german-cooper`, 9),
  "canal-mule-driver": characterSheet(`${FIELD}/npc-canal-mule-driver`, 9),
  "revival-preacher": characterSheet(`${FIELD}/npc-revival-preacher`, 9),
  // Unit 4 interiors. Four people who exist because two doors opened.
  "canal-journeyman-printer": characterSheet(`${FIELD}/npc-canal-journeyman-printer`, 9),
  "canal-printers-devil": characterSheet(`${FIELD}/npc-canal-printers-devil`, 9),
  "canal-temperance-reformer": characterSheet(`${FIELD}/npc-canal-temperance-reformer`, 9),
  "canal-boat-woman": characterSheet(`${FIELD}/npc-canal-boat-woman`, 9),
  // Unit 5 · Richmond, Virginia, 1864.
  "richmond-dock-laborer": characterSheet(`${FIELD}/npc-richmond-dock-laborer`, 9),
  "slave-trade-clerk": characterSheet(`${FIELD}/npc-slave-trade-clerk`, 9),
  "confederate-official": characterSheet(`${FIELD}/npc-confederate-official`, 9),
  "richmond-hospital-worker": characterSheet(`${FIELD}/npc-richmond-hospital-worker`, 9),
  "richmond-shopkeeper": characterSheet(`${FIELD}/npc-richmond-shopkeeper`, 9),
  "richmond-seamstress": characterSheet(`${FIELD}/npc-richmond-seamstress`, 9),
  "tredegar-ironworker": characterSheet(`${FIELD}/npc-tredegar-ironworker`, 9, { idleColumns: 5 }),
  "confederate-private": characterSheet(`${FIELD}/npc-confederate-private`, 9),
  "richmond-free-black-barber": characterSheet(`${FIELD}/npc-richmond-free-black-barber`, 9),
  "richmond-refugee-woman": characterSheet(`${FIELD}/npc-richmond-refugee-woman`, 9),
  "richmond-relief-society-woman": characterSheet(`${FIELD}/npc-richmond-relief-society-woman`, 9),
  "richmond-government-messenger": characterSheet(`${FIELD}/npc-richmond-government-messenger`, 9),
  // Unit 5 interiors. Three people who exist because two doors opened — and Jane Ferris, who was
  // already here and only moved indoors.
  "richmond-bookkeeper": characterSheet(`${FIELD}/npc-richmond-bookkeeper`, 9),
  "richmond-hired-out-man": characterSheet(`${FIELD}/npc-richmond-hired-out-man`, 9),
  "richmond-ward-nurse": characterSheet(`${FIELD}/npc-richmond-ward-nurse`, 9),
  // Unit 3 · Philadelphia, 1767. No PixelLab art exists for the Revolutionary era, so these six
  // keep the placeholder art Unit 3 already used, rebuilt into the same strip format. Giving them
  // their own keys is the point: without it, upgrading `columbus` to real 1492 art would silently
  // redraw Philadelphia's town crier as Christopher Columbus. Three columns, no north pose — the
  // placeholders never had one, and this reproduces exactly what Unit 3 renders today.
  "legacy-scribe": characterSheet(`${FIELD}/legacy-scribe`, 3),
  "legacy-columbus": characterSheet(`${FIELD}/legacy-columbus`, 3),
  "legacy-sailor": characterSheet(`${FIELD}/legacy-sailor`, 3),
  "legacy-elder": characterSheet(`${FIELD}/legacy-elder`, 3),
  "legacy-fisher": characterSheet(`${FIELD}/legacy-fisher`, 3),
  "legacy-gardener": characterSheet(`${FIELD}/legacy-gardener`, 3),
};
/** The sheet for a character key, falling back to the Director rather than throwing on a typo. */
function sheetFor(key) {
  return CHARACTER_SHEETS[key] || CHARACTER_SHEETS.director;
}
/** The player's character key, from the saved appearance choice. */
function chroniclerKey() {
  return progress.profile.appearance === "b" ? "chronicler-b" : "chronicler-a";
}
// `speed` is a character's ground speed in tiles/second, and it is what stops the legs sliding:
// walkCycleSeconds() turns it into the duration of one full stride, so a walking NPC and a running
// player can share one keyframe and both look like they are pushing the ground. Omit it for the
// cutscene figures, which have no ground speed and keep the CSS fallback.
/** Inline custom properties pointing one sprite element at one direction of one character. */
function characterSpriteStyle(key, facing, speed, { idling = false } = {}) {
  const sheet = sheetFor(key);
  if (idling && sheet.idle) {
    const url = sheet.idle[spriteDirection(facing)];
    return `${spriteSheetStyle(url, sheet.idleColumns)}--sprite-cycle:${IDLE_CYCLE_SECONDS}s;`;
  }
  return spriteSheetStyle(sheet[spriteDirection(facing)], sheet.columns, speed);
}
/**
 * The sprite element itself. Walking state is a class the movement loops toggle.
 *
 * The idle state is resolved here as well as in applyCharacterSprite(), so that a character with a
 * breathing cycle is breathing on the frame it is first painted rather than holding one frame until
 * the next movement tick reaches it.
 */
function characterSpriteMarkup(key, facing, { id = "", walking = false, speed } = {}) {
  const idling = !walking && Boolean(sheetFor(key).idle);
  const classes = `character-sprite${walking ? " is-walking" : ""}${idling ? " is-idling" : ""}`;
  return `<span class="${classes}"${id ? ` id="${id}"` : ""} style="${characterSpriteStyle(key, facing, speed, { idling })}" aria-hidden="true"></span>`;
}
/**
 * Seconds for one breathing cycle. Not derived from ground speed the way a stride is — a standing
 * body is not covering ground — so it is stated once here. Slow enough to read as breathing rather
 * than fidgeting.
 */
const IDLE_CYCLE_SECONDS = 2.4;

/** Repoints an already-rendered sprite element at a different direction, in place. */
function applyCharacterSprite(node, key, facing, walking, speed) {
  if (!node) return;
  const sheet = sheetFor(key);
  // A character that is standing still plays its breathing cycle if it has one, and otherwise
  // holds column 0 exactly as it always did. Both are the same mechanism — a strip whose column 0
  // is a standing pose — so the swap is a sheet URL and a column count, and the stepping keyframe
  // is untouched.
  const idling = !walking && Boolean(sheet.idle);
  const url = idling ? sheet.idle[spriteDirection(facing)] : sheet[spriteDirection(facing)];
  const columns = idling ? sheet.idleColumns : sheet.columns;
  // Only when the sheet actually changes. This runs every tick for every body on screen, and
  // rewriting the custom property with the value it already holds is style work for no visual
  // difference. characterSpriteMarkup() emits the sheet inline but no data-sheet, so the first call
  // after each render() writes it once and then goes quiet.
  if (node.dataset.sheet !== url) {
    node.style.setProperty("--sprite-sheet", `url('${url}')`);
    node.style.setProperty("--sprite-columns", String(columns));
    node.style.setProperty("--sprite-walk-frames", String(columns - 1));
    node.dataset.sheet = url;
  }
  if (idling) node.style.setProperty("--sprite-cycle", `${IDLE_CYCLE_SECONDS}s`);
  else if (speed !== undefined) {
    node.style.setProperty("--sprite-cycle", `${walkCycleSeconds(speed)}s`);
  }
  node.classList.toggle("is-walking", Boolean(walking));
  node.classList.toggle("is-idling", idling);
}

let fieldMovement = { x: 28.0, y: 22.0, facing: "down", moving: false, step: false, queued: null };
let fieldCamera = { x: 0, y: 0 };
// `tile` is the CSS pixel size of one grid cell. It must equal the .tmj tile size (48) or the
// world canvas gets resampled to fit: at the previous value of 40 every field map was drawn at
// 5/6 scale under image-rendering: pixelated, which drops source pixel rows and visibly softens
// the art. Everything else in the field — collision rects, land masks, NPC positions, patrol
// waypoints, source points — is stored in *tile units*, so changing this rescales the whole
// world uniformly without touching a single coordinate.
// Exported for tests/unit/field-map-coordinates.test.js, which cross-checks every hand-written
// field coordinate against the generated .tmj (see CLAUDE.md's "export in place" testing rule).
export const FIELD_GRID = { columns: 56, rows: 36, tile: 48 };
const FIELD_SPEED = 3.65;
const HUB_SPEED = 3.65;
const FIELD_MOVE_KEYS = {
  arrowup: [0, -1],
  w: [0, -1],
  arrowdown: [0, 1],
  s: [0, 1],
  arrowleft: [-1, 0],
  a: [-1, 0],
  arrowright: [1, 0],
  d: [1, 0],
};
const FIELD_NPCS = [
  {
    id: "liaison",
    x: 33.5,
    y: 23.5,
    group: "chronicle",
    name: "Emery Voss",
    // The name, where every other pill on this map is a role ("Community elder", "Scribe"). Those
    // are anonymous period characters the player meets once and has no name for; Voss is the one
    // person out here they already know, and labelling them by their job every time reintroduces
    // somebody who does not need reintroducing.
    label: "Emery Voss",
    sprite: "liaison",
    text: "Walk it before you write it. You will get one account from the Admiral's table and another from the village, and the gap between the two is not a problem to solve — it is the thing you were sent to record.",
  },
  {
    id: "taino-elder",
    x: 30.0,
    y: 13.5,
    group: "taino",
    name: "Taíno community elder",
    label: "Community elder",
    // Two Caribbean characters exist for three Lucayan roles, so one sprite is shared. The
    // gardener and the elder carry it rather than the elder and the canoe worker: they stand
    // eight tiles apart in different contexts (the conuco's north edge, the village centre) and
    // the man's fishing spear belongs with the canoes.
    sprite: "caribbean-woman",
    text: "Our homes, gardens, and canoes do not appear by chance. Families work here each day, and elders listen before a choice is made for the village.",
  },
  {
    id: "taino-gardener",
    x: 22.0,
    y: 10.4,
    group: "taino",
    name: "Taíno gardener",
    label: "Garden worker",
    sprite: "caribbean-woman",
    text: "This ground has been worked by many hands. Cassava and maize feed our families; the garden tells you we know this place well.",
  },
  {
    id: "taino-fisher",
    // Moved to the north-lobe shore beside the village canoe at (39,12)-(41,13). He used to stand
    // at (37.5,17.5) — five tiles from the nearest beach cell and four and a half south of the
    // nearest canoe — while saying "The water is a road to us."
    x: 39.0,
    y: 14.2,
    group: "taino",
    name: "Taíno canoe worker",
    label: "Canoe worker",
    sprite: "caribbean-man",
    text: "The water is a road to us. A good canoe carries food, news, and neighbors farther than a stranger may understand at first glance.",
  },
  {
    id: "spanish-sailor",
    x: 46.5,
    y: 22.5,
    group: "spanish",
    name: "Spanish sailor",
    label: "Spanish sailor",
    sprite: "spanish-sailor",
    text: "We sailed for crown and faith, and every man here hopes the voyage brings reward. That hope shapes what we notice and what we report.",
  },
  {
    id: "columbus",
    x: 11.5,
    y: 15.4,
    group: "spanish",
    name: "Christopher Columbus",
    label: "Columbus",
    sprite: "columbus",
    text: "I must write what will be useful to the sovereigns: harbors, people, riches, and signs that another voyage will be worth their trust.",
  },
  {
    id: "spanish-scribe",
    x: 42.5,
    y: 22.5,
    group: "spanish",
    name: "Spanish scribe",
    label: "Scribe",
    sprite: "spanish-scribe",
    text: "Ink can make a voyage last longer than memory. Still, I choose words for the court, and those choices matter.",
  },
  {
    id: "taino-child",
    x: 28.5,
    y: 17.6,
    group: "taino",
    name: "Taíno child",
    label: "Child",
    sprite: "caribbean-child",
    text: "My grandmother says the strangers ask the same question over and over — where the gold is. Nobody asks me what grows here, and I could tell them.",
  },
];
// What each person is doing. Three kinds, defined in engine/npc-behaviour.js:
//
//   station  stands at a post and looks around — someone whose whole job is to be somewhere
//   route    walks a circuit of `stops`, the way between them pathfound by engine/npc-routing.js
//   wander   a bounded disc around `home`, for someone with no particular errand
//
// A stop is a *place*, not a validated waypoint. The router snaps it to the nearest open cell and
// finds a walk to it, and isFieldNpcBlocked() still gates every individual step, so an authored
// coordinate a few tenths inside a stamp costs nobody anything. That is the property Phase 61
// established when it deleted 21 hand-checked four-waypoint rectangles, and routes keep it.
const FIELD_NPC_BEHAVIOURS = {
  // Down the shore south-east of the arrival point, facing back up at it. A station rather than a
  // route, so a player who walks off first and comes back still finds them.
  //
  // The post matters more than it looks. A stationed body is solid to the player, and the first two
  // tried were both in the way: (26.0,21.5) is two tiles due west of the spawn, which walls off one
  // of the four directions anybody presses first, and (25.5,19.5) sat in the corridor every walk
  // north to the village uses — it took two unrelated e2e specs down and they came back the moment
  // Voss moved. South-east is the one quadrant nothing on this map needs.
  //
  // (31.5,23.5) was clear of all of that and still wrong, for a reason no clearance check looks at:
  // it stood them directly above the palm at overlay tile (31,24). The overlay layer draws over the
  // cast on purpose, so the name pill — which hangs below the feet, into exactly that row — was
  // half-covered by fronds. Two tiles east clears it. **A post has to clear the overlay layer under
  // the pill, not only the collision layer under the feet**; this map has 14 overlay tiles in 2016
  // and Voss found one.
  liaison: { kind: "station", at: { x: 33.5, y: 23.5 }, facing: "up" },
  // The village-observation content describes her as the person others bring decisions to. Someone
  // being consulted stays put.
  "taino-elder": { kind: "station", at: { x: 30.0, y: 13.5 }, facing: "down" },
  // The conuco is a collision rect (20.0,12.0-24.0,14.0) directly south of her. She works its north
  // edge, back and forth along the rows, and cannot enter the bed itself.
  "taino-gardener": {
    kind: "route",
    stops: [
      { x: 22.0, y: 10.4 },
      { x: 20.5, y: 10.5 },
      { x: 23.5, y: 10.5 },
    ],
  },
  // Between the beach beside the village canoe and the shore path south of it.
  "taino-fisher": {
    kind: "route",
    stops: [
      { x: 39.0, y: 14.2 },
      { x: 41.5, y: 16.5 },
    ],
  },
  // Moved south-east off the anchorage track in Phase 62: at (45.5,20.5) with a 1.6 radius his
  // disc reached to within 0.4 tiles of the scribe's walk, close enough that the two were
  // interchangeable to whoever was nearest.
  "spanish-sailor": { kind: "wander", home: { x: 46.5, y: 22.5 }, radius: 1.4 },
  // "I must write what will be useful to the sovereigns" — he is at the cartographer's table
  // writing his account, so he stays at it.
  columbus: { kind: "station", at: { x: 11.5, y: 15.4 }, facing: "down" },
  // Up and down the track behind the anchorage, between the boats and the camp.
  "spanish-scribe": {
    kind: "route",
    stops: [
      { x: 42.5, y: 22.5 },
      { x: 43.5, y: 19.5 },
    ],
  },
  // Playing on the open ground south of the village fire (31.0,16.0-32.0,17.0), off the road
  // junction where the village track meets the island's waist. A small disc, because a child at
  // play stays in sight of the fire rather than running the length of the island.
  "taino-child": { kind: "wander", home: { x: 28.5, y: 17.6 }, radius: 1.2 },
};
// Base walking speed for a field NPC, in tiles per second, against the player's FIELD_SPEED of
// 3.65. The gap is the point: the player travels at a run and the settlement walks, which is what
// makes a village feel inhabited rather than paused. Before Phase 61 NPCs moved at 0.15-0.23
// tiles/s — a twentieth of the player — while their legs cycled eleven times a second, and the
// result was the sliding-on-ice look this replaced.
const FIELD_NPC_SPEED = 1.35;
/**
 * The map's static walkability, as the router needs it.
 *
 * Static is the point: the player and the other NPCs are deliberately excluded, because a route is
 * planned once when a map loads and reused for the visit. Baking in anything that moves would
 * freeze one frame's arrangement of people into a permanent wall. The moving half is still handled
 * — isFieldNpcBlocked() runs on every step — it just is not part of the plan.
 */
export function isFieldGroundStandable(map, x, y) {
  if (!isNpcStandingOnLand(x, y, map)) return false;
  const foot = fieldNpcFootBoxAt(x, y);
  return !map.blocks.some((block) => rectsOverlap(foot, block));
}
/** Where the people who never move are standing — furniture, as far as the router is concerned. */
export function stationedPosts(behaviours) {
  return Object.values(behaviours)
    .filter((behaviour) => behaviour.kind === "station")
    .map((behaviour) => behaviour.at);
}
/** One nav grid per field map, built on first use and kept — the maps never change shape. */
const fieldNavGrids = new Map();
export function fieldNavGridFor(map) {
  if (!fieldNavGrids.has(map.id)) {
    fieldNavGrids.set(
      map.id,
      createNavGrid({
        // The map's own size, not FIELD_GRID's — an interior is a different shape from the 56x36
        // outdoor map it opens off, and routing it on the outdoor grid would plan walks through
        // cells that do not exist in the room.
        columns: (map.grid || FIELD_GRID).columns,
        rows: (map.grid || FIELD_GRID).rows,
        roads: map.roads,
        occupied: stationedPosts(map.behaviours),
        isStandable: (x, y) => isFieldGroundStandable(map, x, y),
      })
    );
  }
  return fieldNavGrids.get(map.id);
}
function buildFieldNpcRuntime(map) {
  const grid = fieldNavGridFor(map);
  return Object.fromEntries(
    map.npcs.map((npc, index) => {
      const behaviour = map.behaviours[npc.id] || { kind: "station", at: { x: npc.x, y: npc.y } };
      return [
        npc.id,
        createBehaviourState({
          ...behaviour,
          waypoints: behaviour.kind === "route" ? buildCircuit(grid, behaviour.stops) : undefined,
          // A few percent either side of the base, so a street of people never falls into step.
          // Derived from the index rather than randomised so a reload looks the same as a reload.
          speed: FIELD_NPC_SPEED * (0.92 + ((index * 7) % 5) * 0.04),
          seed: npc.id,
        }),
      ];
    })
  );
}
// Built on first use rather than at module load, which it was until Phase 62: a runtime now needs
// its map's nav grid and road cells, and FIELD_MAPS is declared further down this file.
let fieldNpcRuntime = null;
let fieldNpcRuntimeMapId = null;
function ensureFieldNpcRuntime() {
  const map = activeFieldMap();
  if (fieldNpcRuntime && fieldNpcRuntimeMapId === map.id) return fieldNpcRuntime;
  fieldNpcRuntime = buildFieldNpcRuntime(map);
  fieldNpcRuntimeMapId = map.id;
  return fieldNpcRuntime;
}
const fieldHeldKeys = new Set();
let fieldMoveFrame = null;
let lastFieldMoveAt = 0;
function fieldNpcState(npc) {
  return ensureFieldNpcRuntime()[npc.id] || { x: npc.x, y: npc.y, walking: false, facing: "down" };
}
function fieldNpcFootBoxAt(x, y) {
  return { x1: x - 0.36, x2: x + 0.36, y1: y + 0.2, y2: y + 0.88 };
}
function isFieldNpcBlocked(id, x, y) {
  const map = activeFieldMap();
  const foot = fieldNpcFootBoxAt(x, y);
  if (!isFieldGroundStandable(map, x, y)) return true;
  const playerFoot = footBoxFor(fieldMovement.x, fieldMovement.y);
  if (rectsOverlap(foot, playerFoot)) return true;
  return map.npcs.some((other) => {
    if (other.id === id) return false;
    const state = fieldNpcState(other);
    return rectsOverlap(foot, fieldNpcFootBoxAt(state.x, state.y));
  });
}
// NPC ticks run on their own interval rather than in the player's requestAnimationFrame loop,
// because that loop only runs while a key is held — the settlement has to keep moving while the
// player stands still reading a source. 33ms, not the 80ms this used to run at: NPCs now cover
// real ground, and at 12.5 ticks a second they visibly stepped from position to position next to
// a player interpolating at 60fps.
const NPC_TICK_MS = 33;
let lastFieldNpcTickAt = 0;
function updateFieldNpcs(now = performance.now()) {
  if (progress.currentScreen !== "field") return;
  const elapsed = lastFieldNpcTickAt ? now - lastFieldNpcTickAt : NPC_TICK_MS;
  lastFieldNpcTickAt = now;
  ensureFieldNpcRuntime();
  // One query for the whole tick. Tripling the tick rate would otherwise have tripled a
  // per-NPC querySelector, and the field maps carry nine of them.
  const nodes = new Map(
    [...document.querySelectorAll("[data-npc]")].map((node) => [node.dataset.npc, node])
  );
  const npcsById = new Map(activeFieldMap().npcs.map((npc) => [npc.id, npc]));
  Object.entries(fieldNpcRuntime).forEach(([id, state]) => {
    // Whoever the player is talking to stands still and keeps facing them. Their wander picks up
    // from wherever they stopped once the conversation closes.
    if (progress.activeFieldNpc === id) state.walking = false;
    else stepBehaviour(state, elapsed, (x, y) => isFieldNpcBlocked(id, x, y));

    const node = nodes.get(id);
    if (!node) return;
    node.style.left = `${(state.x * activeFieldGrid().tile).toFixed(1)}px`;
    node.style.top = `${(state.y * activeFieldGrid().tile).toFixed(1)}px`;
    node.classList.toggle("is-walking-npc", state.walking);
    node.dataset.facing = state.facing;
    const npc = npcsById.get(id);
    if (npc) {
      applyCharacterSprite(
        node.querySelector(".character-sprite"),
        npc.sprite,
        state.facing,
        state.walking,
        state.speed
      );
    }
  });
  updateFieldPlayer();
}
if (app) setInterval(() => updateFieldNpcs(), NPC_TICK_MS);

// Each record is anchored to the person or the object it actually belongs to — see the anchor notes
// above sourceAnchorNpc(). The elder's and Columbus's own dialogue lines already point at their
// records ("elders listen before a choice is made", "I must write what will be useful to the
// sovereigns"), so binding them is wiring, not new content.
const FIELD_SOURCE_POINTS = {
  "taino-context": {
    anchor: { npc: "taino-elder" },
    label: "Village observation",
    kind: "Observe",
  },
  "columbus-letter": { anchor: { npc: "columbus" }, label: "Columbus's account", kind: "Source" },
  // The chart table is real stamped tile art at (10,17)-(13,19) — a world map on wooden rollers —
  // and this point sits on its front edge.
  "waldseemuller-map": {
    x: 11.5,
    y: 17.2,
    anchor: { object: "Cartographer's table" },
    label: "Cartographer's table",
    kind: "Puzzle",
  },
};
// VILLAGE_OBSERVATIONS, MAP_PIECES and MAP_TRAY_ORDER used to live here — the hardcoded content
// of the three welded activity screens. All three are now authored content in
// content/activities/unit-01-activities.js, where the slots, fragments and tray order belong to
// the mission rather than to the engine. See docs/decision-log/0051.

// ---- Unit 2 field: Riverbend Settlement ----
const UNIT2_FIELD_NPCS = [
  {
    id: "liaison",
    x: 24.0,
    y: 17.0,
    group: "chronicle",
    name: "Emery Voss",
    // The name, not the job — same reason as the Caribbean post above.
    label: "Emery Voss",
    sprite: "liaison",
    text: "Everyone here will tell you the settlement is working. Ask them who it is working for — the answer moves depending on whose name is on a contract, and whether they signed it themselves.",
  },
  {
    id: "settlement-minister",
    x: 26.0,
    y: 11.5,
    group: "settlement",
    name: "Settlement minister",
    label: "Minister",
    sprite: "jamestown-gentleman",
    text: "The meetinghouse holds this settlement's promises — read the charter before you judge who benefits from them.",
  },
  {
    id: "indentured-servant",
    x: 44.0,
    y: 16.0,
    group: "settlement",
    name: "Indentured field servant",
    label: "Field servant",
    sprite: "jamestown-servant",
    text: "Seven years I owe for my passage. The rows do not care whose name is on the contract.",
  },
  {
    id: "settlement-burgess",
    x: 30.0,
    y: 10.5,
    group: "settlement",
    name: "Elected burgess",
    label: "Burgess",
    sprite: "jamestown-gentleman",
    text: "We meet, we vote, we send our grievances — self-government grows here because the ocean is wide.",
  },
  {
    id: "settlement-goodwife",
    x: 31.5,
    y: 13.0,
    group: "settlement",
    name: "Goodwife of the settlement",
    label: "Goodwife",
    sprite: "jamestown-settler-woman",
    text: "Count who does the washing, the brewing, the tending — the record books forget us, but the settlement would starve without us.",
  },
  {
    id: "river-fisher",
    x: 19.0,
    y: 23.0,
    group: "settlement",
    name: "River fisher",
    label: "Fisher",
    sprite: "jamestown-laborer",
    text: "The river feeds us and carries the hogsheads away. Everything here moves by water.",
  },
  {
    id: "wharf-clerk",
    x: 21.0,
    y: 20.0,
    group: "settlement",
    name: "Wharf clerk",
    label: "Clerk",
    sprite: "jamestown-gentleman",
    text: "Every cask is entered twice — once for the company, once for the customs man. Ledgers remember what people forget.",
  },
  // Added with the PixelLab cast: a craftsman for the settlement, and two Powhatan people for the
  // country the settlement was built in. The six above are all English, which left the map
  // reading as though nobody lived here first.
  {
    id: "settlement-carpenter",
    // The east corner of the barn, between it and the farmyard stores — the closest thing this
    // map has to a worksite. Riverbend has no timber pile, sawpit, workbench or half-framed
    // building anywhere in its tile palette; see the placement note in the decision log.
    x: 41.0,
    y: 19.0,
    group: "settlement",
    name: "Settlement carpenter",
    label: "Carpenter",
    sprite: "jamestown-carpenter",
    text: "Every board in that barn I cut and set myself. The Company ships us gentlemen who will not dig and adventurers who will not saw — so the frame waits on the handful of us who can.",
  },
  {
    // Placed on the open northwest shore, upriver of the English settlement and well clear of it,
    // at a river landing of their own. The Riverbend map has no Indigenous community zone and one
    // cannot currently be built: `architecture.indigenous.northAmerican` is a registered gap in
    // canonical-palette.js, and reusing Island Survival's Taíno bohíos as generic "Native
    // American" is explicitly forbidden there. So these two stand in open ground with no props of
    // their own, which is a limitation of the tile library, not of the placement.
    id: "powhatan-man",
    x: 11.0,
    y: 7.0,
    group: "powhatan",
    name: "Powhatan man of Tsenacommacah",
    label: "Powhatan man",
    sprite: "powhatan-man",
    text: "Our canoes have carried corn and news between these towns since long before a ship found the mouth of this river. What the strangers call wilderness has a name — Tsenacommacah — and a paramount chief who governs it.",
  },
  {
    id: "powhatan-woman",
    x: 12.0,
    y: 11.5,
    group: "powhatan",
    name: "Powhatan woman of Tsenacommacah",
    label: "Powhatan woman",
    sprite: "powhatan-woman",
    text: "The corn the strangers ate through the winter grew in our fields. Women plant it, tend it, and decide what may be spared. Remember that when you are told the trade ran only one way.",
  },
  // A second wave of the cast: the trades and the watch the settlement plainly had and the map did
  // not show, plus two more people working the crop. Riverbend has four plots and until now one
  // worker, so three of them were painted fields nobody had ever been in.
  {
    id: "settlement-smith",
    // Beside the storage shed (22.0,22.0-24.0,24.0), at the south edge of the village. There is no
    // forge, anvil or bellows tile in any palette this project owns, so he is placed by the
    // structure his work actually sat next to rather than given invented scenery. (This note used to
    // cite `military.civilWar.camp` as the comparable registered gap; that one has since been closed
    // by commissioning derived/civil-war-works.png. A forge has not.)
    x: 25.0,
    y: 23.5,
    group: "settlement",
    name: "Settlement blacksmith",
    label: "Blacksmith",
    sprite: "jamestown-blacksmith",
    text: "Nails, hinges, hoes, and the iron off every barrel that lands — it all comes back to me sooner or later. The Company sent us gold-refiners the first year. We had no gold and no second hoe.",
  },
  {
    id: "settlement-watch-gate",
    // The east end of the high street, beside the gate through the row-22 field fence.
    x: 47.0,
    y: 20.6,
    group: "settlement",
    name: "Watchman at the field gate",
    label: "Watchman",
    sprite: "jamestown-soldier",
    text: "Corn in the ground is worth more than coin here, so somebody stands at the gate while it ripens. Sixteen hours in armour and the muster still counts me a gentleman's man.",
  },
  {
    id: "settlement-watch-road",
    // A tile south of the row-6 road, watching the landward approach to the settlement.
    x: 38.0,
    y: 7.5,
    group: "settlement",
    name: "Watchman on the landward road",
    label: "Watchman",
    sprite: "jamestown-watchman",
    text: "The river we can see coming. The land side we cannot. After the last hard winter the Company ordered a watch kept on this road at all hours, and so it is kept.",
  },
  {
    id: "settlement-watch-wharf",
    // Above the wharf market stall (18.0,19.0-20.0,21.0), overlooking the landing.
    x: 18.5,
    y: 18.0,
    group: "settlement",
    name: "Watchman at the landing",
    label: "Watchman",
    sprite: "jamestown-soldier",
    text: "Every ship that ties up here I see first. Men come off them owing years, and goods come off them owing duty. My work is to know which is which before it walks up the street.",
  },
  {
    id: "angolan-laborer",
    // The north plot, plot(42,7)-(51,13) — maize, fenced off the settlement, entered from its west
    // edge. Confined to his field, which is the point.
    x: 43.5,
    y: 9.0,
    group: "settlement",
    name: "Angolan man of the settlement",
    label: "Field hand",
    sprite: "jamestown-african-man",
    // August 1619: "20. and odd Negroes" landed at Point Comfort from the White Lion and were
    // traded to the colony for provisions. Their status was not the chattel slavery Virginia would
    // codify decades later, and it was not the termed indenture the English servant beside him
    // holds either — the muster rolls simply list them without a term. The line says exactly that
    // much and does not resolve it, because the record does not.
    text: "I was taken from Ndongo, put aboard at Luanda, and taken again off that ship at Point Comfort and traded here for victuals. The Englishman in the next field counts down seven years. Nobody has told me what I am counting down to.",
  },
  {
    id: "field-servant-south",
    // The south plot, plot(42,23)-(51,29) — the kitchen garden, entered by the row-22 gate.
    x: 44.5,
    y: 25.0,
    group: "settlement",
    name: "Indentured kitchen-garden servant",
    label: "Field servant",
    sprite: "jamestown-servant",
    text: "Tobacco pays the Company, so tobacco gets the good ground and the good hands. Cabbage and roots get me. But it is this plot the settlement eats from when the ships are late.",
  },
];
// Riverbend is the map the playtest note was written against, so it is the one authored in most
// detail. Three roads run through the settlement — the high street along row 20, the village spine
// down column 26, and the barn spur down column 40 — and a `route` costs road cells a quarter of
// open ground, so anyone whose stops sit at either end of one of them walks it without being told.
const UNIT2_FIELD_NPC_BEHAVIOURS = {
  // North-west of the arrival point, in the open strip above the dockside stores. Deliberately off
  // the village spine: a station is injected into the nav grid as `occupied`, and the first post
  // tried — (28.5,20), by the spine junction — re-planned the goodwife's route straight through the
  // burgess's ground. A body standing in a corridor moves whoever walks it.
  liaison: { kind: "station", at: { x: 24.0, y: 17.0 }, facing: "right" },
  // At the meetinghouse door, which is what a minister is. He also carries `riverbend-charter`, so
  // a player who was told to find him finds him where they were told.
  "settlement-minister": { kind: "station", at: { x: 26.0, y: 11.5 }, facing: "down" },
  // Working the pumpkin bed, plot(44,16)-(49,18). No road out here and none wanted: he is walking
  // the rows, not going anywhere.
  "indentured-servant": {
    kind: "route",
    stops: [
      { x: 44.0, y: 16.0 },
      { x: 48.5, y: 17.5 },
    ],
  },
  // North-east up the road from the meetinghouse, not south down the spine past it. The spine is
  // the obvious civic beat and it is the one he cannot have: it runs through the minister's post,
  // so a burgess walking it spent half his time blocked against a stationary man and put himself
  // inside interaction reach of him, which means a player who walked to the minister could be
  // answered by the burgess.
  "settlement-burgess": {
    kind: "route",
    stops: [
      { x: 30.0, y: 10.5 },
      { x: 34.5, y: 9.5 },
    ],
  },
  // Her dooryard to the high street and back: the errand the playtest note asked for by name. The
  // route leaves her door across open ground, joins the spine, and follows it down — because the
  // spine is road and the grass either side of it is not.
  "settlement-goodwife": {
    kind: "route",
    stops: [
      { x: 31.5, y: 13.0 },
      { x: 26.5, y: 19.5 },
    ],
  },
  "river-fisher": { kind: "wander", home: { x: 19.0, y: 23.0 }, radius: 1.8 },
  // A short beat east along the high street, bounded on three sides. West of column 20 the street
  // is closed to anyone on foot: the dockside stores stand on row 21 and a 0.88-deep foot box
  // standing on row 20 reaches into them. Below it is the dock, which belongs to the river fisher —
  // a stop down there sat inside his wander disc, which is the Powhatan pair's defect again. And it
  // stops short of the spine junction at column 26, because that is where the goodwife's route ends.
  // He carries `riverbend-ledger` as well, so a short circuit is what a player sent to find him needs.
  "wharf-clerk": {
    kind: "route",
    stops: [
      { x: 21.0, y: 20.0 },
      { x: 24.5, y: 20.5 },
    ],
  },
  // The barn yard at the south end of the spur, and his bench by the farm stores at the north end.
  "settlement-carpenter": {
    kind: "route",
    stops: [
      { x: 41.0, y: 19.0 },
      { x: 40.5, y: 26.5 },
    ],
  },
  // The northwest quadrant is open river shore with nothing built on it, so these two have more
  // room than anyone else in the settlement — and until Phase 62 they used it to walk through each
  // other. Their posts are 2.5 tiles apart and both wandered a 2.4 radius, which is two discs
  // almost entirely on top of one another; once they started moving continually they swapped places
  // routinely, and nearestFieldInteraction() gave a player aiming for one of them the other. The
  // e2e reachability spec caught it as "walked to the woman, the man answered", two runs in three.
  //
  // Separate beats fix it, and the dialogue says what each beat should be. He talks about canoes
  // carrying corn and news between towns, so he works the north bank; she talks about planting and
  // tending the corn itself, so she works the ground south of him. Six tiles apart at the nearest
  // approach, against an interaction reach of 1.45.
  "powhatan-man": {
    kind: "route",
    stops: [
      { x: 11.0, y: 7.0 },
      { x: 14.0, y: 5.5 },
    ],
  },
  "powhatan-woman": {
    kind: "route",
    stops: [
      { x: 12.0, y: 11.5 },
      { x: 14.5, y: 12.5 },
    ],
  },
  // A smith works at his fire, so he stands at it, facing the shed he works out of. His post sits
  // clear of the shed's own door cells (23,24) and (24,24): a station is injected into the nav grid
  // as `occupied`, and standing in a doorway would close that approach to everyone else for good.
  "settlement-smith": { kind: "station", at: { x: 25.0, y: 23.5 }, facing: "left" },
  // Three posts, because a watch is posted — the whole job is being at a particular place. Each one
  // faces what it is there to watch: the gate south of him, the landward road north of him, the
  // river west of him.
  "settlement-watch-gate": { kind: "station", at: { x: 47.0, y: 20.6 }, facing: "down" },
  "settlement-watch-road": { kind: "station", at: { x: 38.0, y: 7.5 }, facing: "up" },
  "settlement-watch-wharf": { kind: "station", at: { x: 18.5, y: 18.0 }, facing: "left" },
  // Both of these walk their own plot and nothing else, the way the indentured servant walks the
  // pumpkin bed. No road is wanted or reachable inside a fenced field, and none is needed: the two
  // stops are the ends of the rows.
  "angolan-laborer": {
    kind: "route",
    stops: [
      { x: 43.5, y: 9.0 },
      { x: 47.5, y: 11.5 },
    ],
  },
  "field-servant-south": {
    kind: "route",
    stops: [
      { x: 44.5, y: 25.0 },
      { x: 48.5, y: 27.5 },
    ],
  },
};
// All three anchored to the person who already talks about them: the minister says "read the charter
// before you judge who benefits", the servant "seven years I owe for my passage", the clerk "ledgers
// remember what people forget."
const UNIT2_FIELD_SOURCE_POINTS = {
  "riverbend-charter": {
    anchor: { npc: "settlement-minister" },
    label: "Company charter",
    kind: "Source",
  },
  "riverbend-letter": {
    anchor: { npc: "indentured-servant" },
    label: "Servant's letter",
    kind: "Source",
  },
  "riverbend-ledger": { anchor: { npc: "wharf-clerk" }, label: "Wharf accounts", kind: "Source" },
};
// The river runs down the western edge and widens south-west into an estuary, so the shoreline
// is a meandering diagonal. There is no far bank and no bridge: everything west of the river is
// open water, which keeps the settlement one connected landmass. The walkable rectangle stops
// short of the map edge so the framing tree line falls outside it — see the note in
// scripts/generate-riverbend-tmj.js, which duplicates this function to paint the same shoreline.
function isRiverbendLand(x, y) {
  if (x < 1.5 || x > 52.5 || y < 5.0 || y > 31.5) return false;
  const eastBank = 8.0 + Math.max(0, y - 12.0) * 0.62 + Math.sin(y * 0.34) * 1.8;
  return x > eastBank;
}

// ---- Unit 3 field: The Common Cause (Revolutionary-era Philadelphia gathering ground) ----
// Tiled rebuild — see docs/decision-log/0032-common-cause-tiled-rebuild.md and
// scripts/generate-common-cause-tmj.js. Collision lives in the generated
// common-cause-field.blocks.js imported at the top of this file; the NPC and source coordinates
// below are the hand-authored half, and the generator's building anchors are chosen around them.
const UNIT3_FIELD_NPCS = [
  // Frozen placeholder roster. No Revolutionary-era characters exist in PixelLab, so rather than
  // dress John Dickinson in Christopher Columbus's real 1492 doublet, these six keep the
  // placeholder art they have always used — rebuilt onto the same sprite-strip canvas as the rest
  // of the cast, under `legacy-*` keys of their own so Unit 1's art can be replaced without
  // reaching them. Replacing this roster needs new art, not new code.
  // Named, because he was demonstrably here: Dickinson wrote the Farmer's Letters in Philadelphia and
  // they were set and printed in this city's newspapers from December 1767. Standing outside the print
  // shop's door, he carries `commoncause-dickinson-letter` — see UNIT3_FIELD_SOURCE_POINTS, and see
  // the note there about which of this case's creators can honestly appear on a Philadelphia map.
  {
    id: "john-dickinson",
    x: 16.0,
    y: 10.5,
    group: "commoncause",
    name: "John Dickinson",
    label: "John Dickinson",
    sprite: "legacy-scribe",
    text: "I publish as a farmer because a farmer may be listened to where a lawyer is only argued with. Read the distinction carefully: Parliament may regulate our trade, and I say so plainly. What it may not do is lay a duty on us for the raising of revenue, without our consent.",
  },
  {
    id: "town-crier",
    x: 29.0,
    y: 13.5,
    group: "commoncause",
    name: "Town crier",
    label: "Town crier",
    sprite: "legacy-columbus",
    text: "Hear ye — Parliament's duties still stand, and talk in every tavern turns to committees, boycotts, and what a colony owes its King. I only carry the news; deciding what to do with it is your affair.",
  },
  {
    id: "militia-recruiter",
    x: 31.0,
    y: 10.0,
    group: "commoncause",
    name: "Militia recruiter",
    label: "Militia recruiter",
    sprite: "legacy-sailor",
    text: "Muster on the green Tuesday next. A man who won't drill now may wish later he had — word from Virginia says even the House of Burgesses is arming its militia.",
  },
  {
    id: "free-tradesman",
    x: 29.0,
    y: 20.0,
    group: "commoncause",
    name: "Free Black tradesman",
    label: "Tradesman",
    sprite: "legacy-elder",
    text: "I read the broadsides same as any freeman here. Strange, to hear talk of chains and slavery from men who'd never let it touch their own thinking on who else wears them.",
  },
  {
    id: "loyalist-merchant",
    x: 27.0,
    y: 26.0,
    group: "commoncause",
    name: "Loyalist merchant",
    label: "Merchant",
    sprite: "legacy-fisher",
    text: "My ledgers balance because the Crown's ships still call at this port. I'll not pretend disorder in the streets is good for trade, whatever cause it claims to serve.",
  },
  {
    id: "farmwife",
    x: 14.0,
    y: 23.0,
    group: "commoncause",
    name: "Farmwife",
    label: "Farmwife",
    sprite: "legacy-gardener",
    text: "My husband's away with the militia and the mending doesn't stop because Parliament's vexed us. Whatever new government they draft, I mean to see it remembers the women keeping the house together.",
  },
];
const UNIT3_FIELD_NPC_BEHAVIOURS = {
  // Outside the print shop's door, where his record is anchored.
  "john-dickinson": { kind: "station", at: { x: 16.0, y: 10.5 }, facing: "down" },
  // Across the market square, which is cobbled wall to wall — a crier carries the news to where
  // people are, and every cell of his route is road.
  "town-crier": {
    kind: "route",
    stops: [
      { x: 29.0, y: 13.5 },
      { x: 22.5, y: 12.5 },
      { x: 34.5, y: 12.5 },
    ],
  },
  // "Muster on the green Tuesday next" — a recruiter stands at the muster point.
  "militia-recruiter": { kind: "station", at: { x: 31.0, y: 10.0 }, facing: "down" },
  "free-tradesman": { kind: "wander", home: { x: 29.0, y: 20.0 }, radius: 1.5 },
  "loyalist-merchant": { kind: "wander", home: { x: 27.0, y: 26.0 }, radius: 1.5 },
  farmwife: { kind: "wander", home: { x: 14.0, y: 23.0 }, radius: 1.6 },
};
// One person, six objects — and that split is a historical constraint, not a design preference.
//
// A record can only be anchored to a person on a map where that person actually was. Dickinson wrote
// and published the Farmer's Letters in Philadelphia, so he stands outside the print shop. The other
// six creators were demonstrably elsewhere: Henry spoke in Richmond, Wheatley and Prince Hall were in
// Boston, Abigail Adams wrote from Braintree, Dunmore proclaimed from Virginia, Pontiac spoke at a
// council near Detroit. Putting them on this map would fake their presence, so their records sit on
// the thing that carried them into Philadelphia instead — a printed broadside on a notice board, a
// petition on the statehouse table, a dispatch on the wharf clerk's table, a letter received at a
// correspondence desk. Which is how a Chronicler would actually have encountered them.
//
// Every `object` anchor's x/y sits on the front edge of a real stamped prop in
// scripts/generate-common-cause-tmj.js. Move one and the other has to move with it.
const UNIT3_FIELD_SOURCE_POINTS = {
  "commoncause-pontiac-speech": {
    x: 6.5,
    y: 15.4,
    anchor: { object: "Frontier dispatch post" },
    label: "Frontier dispatch",
    kind: "Source",
  },
  "commoncause-dickinson-letter": {
    anchor: { npc: "john-dickinson" },
    label: "Farmer's Letters",
    kind: "Source",
  },
  "commoncause-henry-speech": {
    x: 25.0,
    y: 11.2,
    anchor: { object: "Assembly hall notice board" },
    label: "Assembly hall broadside",
    kind: "Source",
  },
  "commoncause-wheatley-poem": {
    x: 49.0,
    y: 9.2,
    anchor: { object: "Churchyard notice board" },
    label: "Printed elegy",
    kind: "Source",
  },
  "commoncause-dunmore-proclamation": {
    x: 33.0,
    y: 27.2,
    anchor: { object: "Wharf dispatch table" },
    label: "Wharf dispatch",
    kind: "Source",
  },
  "commoncause-hall-petition": {
    x: 36.0,
    y: 10.2,
    anchor: { object: "Statehouse petition table" },
    label: "Petition for freedom",
    kind: "Source",
  },
  "commoncause-adams-letter": {
    x: 14.0,
    y: 27.2,
    anchor: { object: "Correspondence desk" },
    label: "Private letter",
    kind: "Source",
  },
};
// A town on the north bank of the Delaware: a rectangle bounded on the south by the river, whose
// waterline meanders slightly so the quay isn't a ruler-straight edge. The other three sides are
// framed by open ground and a tree line. scripts/generate-common-cause-tmj.js duplicates this
// function to paint the same bank — do not deduplicate them.
function commonCauseWaterline(x) {
  return 29.5 + Math.sin(x * 0.12) * 1.1;
}
function isCommonCauseLand(x, y) {
  if (x < 2.5 || x > 53.5 || y < 2.5) return false;
  return y < commonCauseWaterline(x);
}
function commonCauseWorldMarkup() {
  return `<canvas class="field-world-art" id="commonCauseTiledCanvas" role="img" aria-label="Top-down Revolutionary-era Philadelphia town square with a statehouse, print shop, chapel and churchyard, market stalls, liberty pole, well, clapboard housing, and a Delaware waterfront with piers and moored shipping"></canvas><canvas class="field-world-overlay" id="commonCauseTiledCanvasOverlay" aria-hidden="true"></canvas>`;
}

// ---- Unit 4 field: Canal Crossroads (an Erie Canal boomtown, upstate New York, 1845) ----
// See scripts/generate-canal-crossroads-tmj.js, which paints the town these coordinates are chosen
// against. Collision lives in the generated canal-crossroads-field.blocks.js imported at the top of
// this file; the roster below is the hand-authored half.
//
// Thirteen people across six districts. Two rules governed where each one stands, and both were
// learned the expensive way on earlier maps:
//
//   * Nobody stands on a crossing. isFieldBlocked() collides the player against every NPC's foot
//     box, and the lock walk and the plank bridge are 1.62 tiles of walkable lane — one person
//     posted on either would seal the only two ways over the canal.
//   * Two people's ground stays 1.5 tiles apart, measured over a route's whole walked path and not
//     just its stops (decision log 0045). nearestFieldInteraction() answers with whoever is
//     closest, so anything tighter means a player who walks to one is answered by the other.
const UNIT4_FIELD_NPCS = [
  {
    id: "canal-lock-keeper",
    x: 24.5,
    y: 20.2,
    group: "canal",
    name: "Hannah Voorhees",
    label: "Lock keeper",
    sprite: "canal-lock-keeper-woman",
    text: "Sixty feet of chamber and eight of lift, and every boat between Albany and Buffalo waits on me to work it. They are widening the whole line — seventy feet at the surface, seven deep — and when it is done this lock comes out and a bigger one goes in. I will believe that when I see my wages for it.",
  },
  {
    id: "canal-boat-captain",
    x: 28.5,
    y: 13.2,
    group: "canal",
    name: "Captain Elias Rood",
    label: "Boat captain",
    sprite: "canal-boat-captain",
    text: "Before the canal it cost a hundred dollars and three weeks to move a ton of wheat from Buffalo to New York. I do it for under ten, and I do it in eight days. My clearance and my lading are here if you want the figures rather than my word for them.",
  },
  {
    id: "canal-irish-laborer",
    x: 34.5,
    y: 13.2,
    group: "canal",
    name: "Patrick Meehan",
    label: "Canal labourer",
    sprite: "canal-irish-laborer",
    text: "Seventy-five cents a day and a berth in the boardinghouse, and the contractor takes back what he likes for the whiskey ration. I dug the deep cut at Lockport and I will dig the enlargement, because there is nothing behind me in Kilkenny to go back to.",
  },
  {
    id: "canal-mule-driver",
    x: 28.0,
    y: 20.4,
    group: "canal",
    name: "Sam Ostrander",
    label: "Mule driver",
    sprite: "canal-mule-driver",
    text: "Four miles an hour, six hours on and six off, and the team knows the towpath better than I do. Mind the line when a boat passes — it comes up out of the water quick and it will take your legs from under you.",
  },
  {
    id: "textile-mill-worker",
    x: 10.5,
    y: 14.3,
    group: "workshop",
    name: "Lucy Bellamy",
    label: "Mill operative",
    sprite: "textile-mill-worker",
    text: "The bell rings at five and again at seven, and the time book says what I am owed whatever the clock on the wall says. I came down from a farm in Herkimer County to earn my own money, and I will not pretend that is nothing. I will not pretend the piece rate is honest either.",
  },
  {
    id: "german-cooper",
    x: 14.5,
    y: 13.0,
    group: "workshop",
    name: "Konrad Sturm",
    label: "Cooper",
    sprite: "german-cooper",
    text: "Every barrel of flour that leaves this basin leaves in something I made. I came from Württemberg in '39, and my brother writes that half the village is coming after. There is work here for any man who can raise a stave.",
  },
  {
    // Three tiles east of his own door, not on it. He stood at (32.0, 8.3) until the printing
    // office became a room you can walk into: the doorstep marker sits at (32.0, 8.0), and
    // nearestFieldInteraction() answers with whatever is closest, so an NPC a tenth of a tile from
    // a door makes that door unreachable — the player gets Pike every time, from every approach.
    // The same edit was needed at the boardinghouse, and it is the one thing to check first when
    // adding any future interior: a door is an interaction competing with its neighbours.
    id: "jacksonian-editor",
    x: 35.0,
    y: 8.3,
    group: "market",
    name: "Josiah Pike",
    label: "Newspaper editor",
    sprite: "jacksonian-editor",
    text: "General Jackson broke the Monster Bank and the Republic did not fall down. What we have now is a free bank, chartered under our own state law, and if it fails the noteholders are secured against its bonds. That is the difference between a bank and a moneyed aristocracy, and I print it weekly.",
  },
  {
    id: "haudenosaunee-diplomat",
    x: 22.0,
    y: 12.3,
    group: "market",
    name: "Skanawati",
    label: "Onondaga delegate",
    sprite: "haudenosaunee-diplomat",
    text: "This canal was cut through our country. The treaties your state made with us at Fort Stanwix and after were made with men who had no authority to sell, and the Senate of the United States never confirmed them. I am not here to be remembered. I am here about the land, which is a matter still open.",
  },
  {
    id: "market-farmer",
    x: 49.0,
    y: 27.3,
    group: "farm",
    name: "Ezra Tull",
    label: "Farmer",
    sprite: "market-farmer",
    text: "My father grew what we ate and sold what was left over. I grow wheat for New York and buy my flour back at the store, which my father would call madness. The turnpike toll and the canal freight both come out of the same load, and I have learned to reckon them before I plant.",
  },
  {
    id: "revival-preacher",
    x: 44.0,
    y: 7.3,
    group: "reform",
    name: "Elder Aaron Finch",
    label: "Revival preacher",
    sprite: "revival-preacher",
    text: "This whole district has been burnt over with the fire of the Spirit, and I say let it burn again. A soul that is saved is not saved to sit still. It is saved to put down the bottle, to free the slave, and to make this town worthy of what has been given it.",
  },
  {
    id: "abolitionist-lecturer",
    x: 48.0,
    y: 12.3,
    group: "reform",
    name: "Charity Bell",
    label: "Antislavery lecturer",
    sprite: "abolitionist-lecturer",
    text: "I have spoken in twelve towns on this line and been stoned out of four. At Utica in '35 a mob of gentlemen — bankers, a judge — broke up our state convention because they trade with the South and would rather not hear it named. Read the board behind me. Both notices went up the same week.",
  },
  {
    id: "abolitionist-printer",
    x: 52.5,
    y: 8.3,
    group: "reform",
    name: "Marcus Hale",
    label: "Reform printer",
    sprite: "abolitionist-printer",
    text: "One press prints the party sheet and one prints ours, and we set type a hundred feet apart. He calls me a fanatic in print on Thursday and I answer him on Saturday. That is not a quarrel. That is the only argument a republic has.",
  },
];
const UNIT4_FIELD_NPC_BEHAVIOURS = {
  // The lock's foot, on the towpath rather than on the walk itself — see the second rule above.
  "canal-lock-keeper": { kind: "station", at: { x: 24.5, y: 20.2 }, facing: "left" },
  "canal-boat-captain": { kind: "station", at: { x: 28.5, y: 13.2 }, facing: "down" },
  // Hauling between two of the basin's storehouses. The quay is road, so the router keeps him on
  // the stone rather than cutting the corner across the wharf edge.
  "canal-irish-laborer": {
    kind: "route",
    stops: [
      { x: 34.5, y: 13.2 },
      { x: 42.5, y: 13.2 },
    ],
  },
  // The towpath, which is this map's signature motion: a team walking the line the whole time the
  // player is on it.
  "canal-mule-driver": {
    kind: "route",
    stops: [
      { x: 28.0, y: 20.4 },
      { x: 42.0, y: 20.4 },
    ],
  },
  "textile-mill-worker": { kind: "wander", home: { x: 10.5, y: 14.3 }, radius: 1.2 },
  "german-cooper": { kind: "station", at: { x: 14.5, y: 13.0 }, facing: "down" },
  "jacksonian-editor": { kind: "station", at: { x: 35.0, y: 8.3 }, facing: "down" },
  "haudenosaunee-diplomat": { kind: "station", at: { x: 22.0, y: 12.3 }, facing: "down" },
  // The farm lane, tollgate to the quarter — a load going to the canal, which is the whole point of
  // the district.
  // The farm lane, tollgate to the fields. Both stops sit on the lane itself: engine/npc-routing.js
  // costs a road cell a quarter of open ground, so a stop parked a row off the road sends the whole
  // circuit hunting for the cheapest way there — which, the first time this was authored, was north
  // up the turnpike and along the towpath, straight through the mule driver's route.
  "market-farmer": {
    kind: "route",
    stops: [
      { x: 49.0, y: 27.3 },
      { x: 33.0, y: 27.3 },
    ],
  },
  "revival-preacher": { kind: "station", at: { x: 44.0, y: 7.3 }, facing: "down" },
  "abolitionist-lecturer": { kind: "station", at: { x: 48.0, y: 12.3 }, facing: "right" },
  "abolitionist-printer": { kind: "station", at: { x: 52.5, y: 8.3 }, facing: "down" },
};
// Three records. Two are carried by the person whose document it is; the third is on the object,
// because its whole design is that no single person speaks for it — the Reform Square board carries
// a temperance pledge and a tavern-keeper's rebuttal, an antislavery meeting notice and a warning
// against it, all posted the same week. Reform was contested, and a board is what contest looks like.
//
// The object anchor's x/y sits on the front edge of the notice board stamped by the generator. These
// two lists move together or not at all.
const UNIT4_FIELD_SOURCE_POINTS = {
  "canal-toll-receipt": {
    anchor: { npc: "canal-boat-captain" },
    label: "Toll and lading",
    kind: "Source",
  },
  "canal-time-book": {
    anchor: { npc: "textile-mill-worker" },
    label: "Workshop time book",
    kind: "Source",
  },
  "canal-reform-notices": {
    // The commissioned board is one tile wide where the fantasy one it replaced was two, so this
    // moved with it: the marker belongs on the front edge of the stamp at col 49, not half a tile
    // out into the square beside it.
    x: 49.5,
    y: 13.2,
    anchor: { object: "Reform notice board" },
    label: "Reform notices",
    kind: "Source",
  },
};
// A two-row channel cut across the whole map, opening into a four-row basin at cols 28-42 where the
// boats tie up. The south bank never moves — a towpath has to be a straight walk for a mule team —
// so the basin is dug back into the north side only. The lock walk and the plank bridge are the only
// two ways over.
//
// scripts/generate-canal-crossroads-tmj.js duplicates these three functions verbatim to paint the
// same banks the player collides with (decision log 0036). Do not deduplicate them.
const CANAL_CHANNEL_TOP = 16.9;
const CANAL_CHANNEL_BOTTOM = 18.9;
const CANAL_BASIN_DEPTH = 2.0;
const canalClamp01 = (t) => Math.max(0, Math.min(1, t));
function canalNorthBank(x) {
  const opening = Math.min(canalClamp01((x - 26.0) / 2.0), canalClamp01((44.0 - x) / 2.0));
  return CANAL_CHANNEL_TOP - opening * CANAL_BASIN_DEPTH;
}
export function isCanalCrossroadsLand(x, y) {
  if (x < 2.0 || x > 54.0 || y < 1.5 || y > 34.5) return false;
  if (x > 20.85 && x < 23.15) return true;
  if (x > 45.85 && x < 48.15) return true;
  return y < canalNorthBank(x) || y > CANAL_CHANNEL_BOTTOM;
}
function canalCrossroadsWorldMarkup() {
  return `<canvas class="field-world-art" id="canalCrossroadsTiledCanvas" role="img" aria-label="Top-down Erie Canal boomtown: a stone-lined canal with a working lock and a plank bridge, a basin of moored cargo barges and paved wharves, a water-powered flour mill, a market street of brick shopfronts and a free bank, a reform square with a church and meeting hall, terraced immigrant housing, and a farm edge on the turnpike"></canvas><canvas class="field-world-overlay" id="canalCrossroadsTiledCanvasOverlay" aria-hidden="true"></canvas>`;
}

// ---- Canal Crossroads' two interiors -------------------------------------------------------------
//
// Attached to FIELD_MAPS["unit-04"] further down the file, not inline in the literal — see the
// temporal-dead-zone note at the field-interiors block.
//
// Every coordinate below is chosen against the furniture its generator stamps, and each generator's
// header says so in the other direction too. A stamp may be restyled but not moved without
// re-checking these, and the interior suite in tests/unit/field-map-coordinates.test.js flood-fills
// each room from its entry cell to prove nobody is standing inside a wall and the way out is
// reachable from where the player comes in.
//
// **Both rooms open south**, because both buildings front the street from the north side of it.
// Entry sits at y = 11.1 rather than flush against the threshold: footBoxFor() runs 0.78 tiles below
// a character's anchor, the south wall's rect starts at y = 12, and a player spawned any lower than
// 11.22 arrives already blocked — which reads as the room freezing on entry, and shipped once
// already on the Institute's Main Hall.

const UNIT4_PRINT_SHOP_NPCS = [
  {
    id: "canal-journeyman-printer",
    // South of the press, in the open row below it. He is the one who actually pulls the sheets,
    // which is why the job book is his and not the editor's — a journeyman sets what he is paid to
    // set and has no stake in whose politics it is, and that is the whole point of the record.
    x: 2.5,
    y: 5.5,
    group: "market",
    name: "Amos Wheeler",
    label: "Journeyman printer",
    sprite: "canal-journeyman-printer",
    text: "Mr. Pike's paper goes out Thursday and it pays my wages, but it is not what keeps this shop. The job work does — auction bills, canal company schedules, a temperance pledge one week and a tavern-keeper's answer to it the next. I set them all. The order book is on the case there, and it will tell you more about this town than anything printed in the paper.",
  },
  {
    id: "canal-printers-devil",
    x: 8.5,
    y: 5.8,
    group: "market",
    name: "Ned Pryor",
    label: "Printer's devil",
    sprite: "canal-printers-devil",
    text: "I ink the forme and I pull the paper off the tympan and I wash the type at night, and I have three years to run before I am a journeyman. It is longer hours than the mill and it is a trade at the end of it, which the mill is not. Mind your sleeve on the ink.",
  },
];
const UNIT4_PRINT_SHOP_BEHAVIOURS = {
  "canal-journeyman-printer": { kind: "station", at: { x: 2.5, y: 5.5 }, facing: "up" },
  // A small disc in the open cross-aisle between the two compositor's cases, which is where an
  // apprentice fetching type would actually be. Every step is still gated by isFieldNpcBlocked, so
  // the disc overlapping the cases' rects costs him nothing but the cells he cannot enter.
  "canal-printers-devil": { kind: "wander", home: { x: 8.5, y: 5.8 }, radius: 1.2 },
};
const UNIT4_PRINT_SHOP_SOURCE_POINTS = {
  "canal-job-book": {
    anchor: { npc: "canal-journeyman-printer" },
    label: "Job-work order book",
    kind: "Source",
  },
};
function canalPrintShopWorldMarkup() {
  return `<canvas class="field-world-art" id="canalPrintShopTiledCanvas" role="img" aria-label="Interior of an 1845 printing office: an iron hand press against the north wall under sash windows, two sloped compositor's cases of lead type, stacked bundles of printing paper, a cast-iron stove, and the editor's desk on parquet in the east corner with a safe behind it"></canvas><canvas class="field-world-overlay" id="canalPrintShopTiledCanvasOverlay" aria-hidden="true"></canvas>`;
}

const UNIT4_BOARDING_HOUSE_NPCS = [
  {
    id: "canal-boardinghouse-keeper",
    // Moved indoors from the outdoor map, where she stood on her own doorstep at (24.0, 24.2) —
    // a tenth of a tile from where the door marker now is, which would have made her house
    // impossible to enter. Her line was always one delivered inside her own bar.
    x: 18.5,
    y: 9.6,
    group: "quarter",
    name: "Bridget Cavanagh",
    label: "Boardinghouse keeper",
    sprite: "canal-boardinghouse-keeper",
    text: "Fourteen boarders and half of them on the line at any hour, so the beds never cool. The temperance men come to lecture me about the bar. They might ask instead what a woman is to live on when the boats stop in November. The register is on the counter — count the names against the beds before you tell me what I ought to charge.",
  },
  {
    id: "canal-temperance-reformer",
    x: 7.5,
    y: 9.6,
    group: "reform",
    name: "Prudence Wickham",
    label: "Temperance visitor",
    sprite: "canal-temperance-reformer",
    text: "I have signed eleven men in this house and I will come back for the rest. Do not tell me it is only a glass. I have sat with the wives on this lane and I have seen a fortnight's wages go across that counter in a night. The pledge is not a punishment. It is the only thing any of them owns that a contractor cannot take back.",
  },
  {
    id: "canal-boat-woman",
    x: 10.5,
    y: 5.5,
    group: "quarter",
    name: "Margaret Dooley",
    label: "Boat family, takes in washing",
    sprite: "canal-boat-woman",
    text: "We work the boat as a family — my husband at the tiller, my eldest on the towpath with the mules, and me cooking in a cabin you could not stand upright in. When the canal freezes we come ashore, and I take in washing until the ice goes out. Nobody writes that down as work, but it is what feeds us four months of the year.",
  },
];
const UNIT4_BOARDING_HOUSE_BEHAVIOURS = {
  "canal-boardinghouse-keeper": { kind: "station", at: { x: 18.5, y: 9.6 }, facing: "up" },
  "canal-temperance-reformer": { kind: "station", at: { x: 7.5, y: 9.6 }, facing: "up" },
  "canal-boat-woman": { kind: "station", at: { x: 10.5, y: 5.5 }, facing: "up" },
};
const UNIT4_BOARDING_HOUSE_SOURCE_POINTS = {
  "canal-house-register": {
    anchor: { npc: "canal-boardinghouse-keeper" },
    label: "Boardinghouse register",
    kind: "Source",
  },
};
function canalBoardingHouseWorldMarkup() {
  return `<canvas class="field-world-art" id="canalBoardingHouseTiledCanvas" role="img" aria-label="Interior of an 1845 canal boardinghouse: three plain rope beds in a curtained sleeping alcove behind a partition, a flagged kitchen end with a stove, wash tub and crockery dresser, and a common room with two long boarding tables and the keeper's counter"></canvas><canvas class="field-world-overlay" id="canalBoardingHouseTiledCanvasOverlay" aria-hidden="true"></canvas>`;
}

// ---- Unit 5 field: Richmond, Virginia, 1864 ("The Fractured Republic") ----
// See scripts/generate-richmond-tmj.js, which paints the city these coordinates are chosen against.
// Collision lives in the generated richmond-field.blocks.js imported at the top of this file; the
// roster below is the hand-authored half.
//
// **The register rule for this map is binding, and it is not a style preference.** Enslaved and
// impressed people here are named, speak in the first person, say plainly what is being done to them
// and what they intend to do about it. Nobody on this map is scenery. No Confederate speaker is its
// most sympathetic voice — the officials are bureaucrats and the private is unpaid and unfed, and
// both are allowed to be ordinary, which is the point. There is no Confederate battle flag anywhere
// on this map in any form.
//
// Twelve people across six districts, and the two placement rules from the earlier maps still hold:
// nobody stands on a crossing (the two bluff descents are 1.32 tiles of walkable lane and one body
// posted on either would seal half the city off), and two people's ground stays 1.5 tiles apart
// measured over a route's whole walked path (decision log 0045).
const UNIT5_FIELD_NPCS = [
  {
    // Two tiles from the spawn, on Franklin Street: the first person the player meets, and the one
    // who explains the shape of the city. A civilian, deliberately — the most-seen routed character
    // on this map being a soldier is the easy way to fail the brief.
    id: "richmond-government-messenger",
    x: 28.5,
    y: 12.4,
    group: "capitol",
    name: "Wesley Crane",
    label: "Government messenger",
    sprite: "richmond-government-messenger",
    text: "Departmental mail, and I carry it on foot because the horses went to the army in the spring. Capitol Square is uphill behind you and the bureaus with it. Everything below the wall is Tredegar's and the trade's. Mind the descents — there are two in the whole length of that bluff, and if you miss one you will walk half a mile to find the other.",
  },
  {
    id: "confederate-official",
    x: 30.0,
    y: 8.4,
    group: "capitol",
    name: "Josiah Ruffin",
    label: "War Department clerk",
    sprite: "confederate-official",
    text: "Section Six lets me requisition slave labour from any owner in this district, and I do — five hundred at a time, sixty days apiece, for the works and the fortifications. The owners write to complain that we return their people sick, and to claim compensation for the ones who do not come back at all. I answer those letters all morning. The requisition itself is one page.",
  },
  {
    id: "richmond-shopkeeper",
    x: 14.5,
    y: 8.4,
    group: "market",
    name: "Amos Deane",
    label: "Grocer",
    sprite: "richmond-shopkeeper",
    text: "I chalk the price twice a day and I have stopped rubbing out the old one, because people want to see it. Flour was fifty dollars a barrel in January and it is two hundred and fifty now, and my customers are not poorer than they were — the money is. Read the board. It is the only honest thing on this street.",
  },
  {
    id: "richmond-relief-society-woman",
    x: 7.0,
    y: 8.4,
    group: "market",
    name: "Sarah Whitlock",
    label: "Relief society organizer",
    sprite: "richmond-relief-society-woman",
    text: "We sew for the hospitals and we keep the free market on Wednesdays, and I will tell you plainly that it is not enough. Four hundred came to the door last week and we had bread for two hundred. The council voted a relief fund; the fund buys whatever the speculators have left by the time it reaches us.",
  },
  {
    id: "richmond-refugee-woman",
    x: 10.5,
    y: 4.6,
    group: "market",
    name: "Eliza Marsden",
    label: "Refugee from Fredericksburg",
    sprite: "richmond-refugee-woman",
    text: "We came up from Fredericksburg after the town was shelled, with what the three of us could carry. There is not a room to rent in this city at any price, so the church gave us the corner of its yard and the government gave us the tent. My husband is in the Fourth Virginia. There has been no letter since March.",
  },
  {
    id: "richmond-free-black-barber",
    x: 19.0,
    y: 12.4,
    group: "market",
    name: "Wilson Carter",
    label: "Barber",
    sprite: "richmond-free-black-barber",
    text: "I have kept this chair eleven years and I own it outright, and I still carry my register papers in my coat to prove I am free — renewed every year, and paid for every year. The patrol may stop me on Broad Street after nine and ask what business a free man has walking. That is what the word means in this city. I expect to live long enough to see it mean something else.",
  },
  {
    // On the crest above the bluff, at the clothing bureau's door. She is hired out, which is the
    // arrangement most enslaved people in wartime Richmond lived under, and she says so herself.
    id: "richmond-seamstress",
    x: 26.0,
    y: 16.0,
    group: "capitol",
    name: "Charlotte Vaughan",
    label: "Seamstress, Clothing Bureau",
    sprite: "richmond-seamstress",
    text: "My name is Charlotte Vaughan. I am hired out to the Bureau by the woman who owns me, and the wages for my week are paid to her. Fourteen shirts, and the cloth counted out to me and counted back. What is mine is the sewing I do after dark, because nobody has thought to ask for it yet. I am keeping every dollar of it, and I do not intend to be in this city when this is finished.",
  },
  // Jane Ferris used to stand here, on Broad Street outside her own ward door, and Phase 8 moved her
  // inside it — the same move the boardinghouse keeper made at Canal Crossroads and for the same
  // reason. She is a matron; a matron is in her ward. Her line was always one delivered standing over
  // the register, and the register is the record this map anchors to her, which cannot be read from
  // the street. See UNIT5_HOSPITAL_WARD_NPCS.
  {
    id: "confederate-private",
    x: 43.5,
    y: 4.6,
    group: "edge",
    name: "Tom Sackett",
    label: "Private, provost guard",
    sprite: "confederate-private",
    text: "I have been on this road since the fall and I have not been paid since the summer, and what they would pay me in would not buy the shoes I am standing in. They keep me here because I cannot march any more. I look at passes. Everybody's pass is in order and half of them are going somewhere they have no business going, and I let them by, mostly.",
  },
  {
    id: "tredegar-ironworker",
    x: 4.0,
    y: 22.4,
    group: "tredegar",
    name: "Daniel Boyle",
    label: "Puddler, Tredegar",
    sprite: "tredegar-ironworker",
    text: "There are three sorts of men on the books here and we all stand at the same furnace. Mechanics like me, on wages. Slaves hired by the year from their owners, and the owner draws the money at Christmas. And men the government impressed, who are paid nothing at all and cannot walk out. The payroll is on the gate and it lists the three of us together, which is the only place in Virginia we are set down as equals.",
  },
  {
    id: "slave-trade-clerk",
    x: 35.5,
    y: 22.4,
    group: "shockoe",
    name: "Ambrose Kell",
    label: "Clerk, commission house",
    sprite: "slave-trade-clerk",
    text: "The trade is not what it was. The blockade shut the Deep South market and the price in our money means nothing week to week, so there is less selling now and a great deal more hiring out — a year at a time, to the works and to the government. It is the same ledger. I rule the same columns. Mr. Lumpkin's jail is round the corner and it is as full as it ever was.",
  },
  {
    // Impressed, not enslaved-in-place, and the distinction is the district's whole argument: the
    // Confederate state took him from the man who claimed him, over that man's objection.
    id: "richmond-dock-laborer",
    x: 14.5,
    y: 30.4,
    group: "river",
    name: "Peter Gowrie",
    label: "Impressed labourer, Richmond Dock",
    sprite: "richmond-dock-laborer",
    text: "My name is Peter Gowrie. They took me off the Nottoway in February — sixty days, the order said, and it is August. I move government freight off the canal boats and up to the depot and back down again. The paper in my hat is my pass: it says which streets I may walk and what hour I must be off them, and a man stopped without one goes to the cage. I count the boats going west. I know what the guns to the east mean as well as any man on this dock.",
  },
];
const UNIT5_FIELD_NPC_BEHAVIOURS = {
  // Franklin Street, Capitol to the hospital hill — the length of the upper city, which is what
  // makes him the map's signature motion and the reason he is the orienting contact.
  "richmond-government-messenger": {
    kind: "route",
    stops: [
      { x: 28.5, y: 12.4 },
      { x: 49.5, y: 12.4 },
    ],
  },
  "confederate-official": { kind: "station", at: { x: 30.0, y: 8.4 }, facing: "down" },
  "richmond-shopkeeper": { kind: "station", at: { x: 14.5, y: 8.4 }, facing: "right" },
  "richmond-relief-society-woman": { kind: "station", at: { x: 7.0, y: 8.4 }, facing: "down" },
  // A small disc in the churchyard between the well and the terrace behind it, which is where a
  // family living in a tent in that yard would actually be.
  "richmond-refugee-woman": { kind: "wander", home: { x: 10.5, y: 4.6 }, radius: 1.1 },
  "richmond-free-black-barber": { kind: "station", at: { x: 19.0, y: 12.4 }, facing: "down" },
  "richmond-seamstress": { kind: "station", at: { x: 26.0, y: 16.0 }, facing: "down" },
  "confederate-private": { kind: "station", at: { x: 43.5, y: 4.6 }, facing: "down" },
  "tredegar-ironworker": { kind: "station", at: { x: 4.0, y: 22.4 }, facing: "down" },
  // Two and a half tiles east of the counting room's own door rather than on it. A door is an
  // interaction competing with its neighbours, and nearestFieldInteraction() answers with whatever
  // is closest — Canal Crossroads learned that the expensive way when its editor stood a tenth of a
  // tile from the print shop's threshold and made the room unreachable from every approach. Phase 8
  // turns this building into a room; the clerk is already standing clear of where its marker goes.
  "slave-trade-clerk": { kind: "station", at: { x: 35.5, y: 22.4 }, facing: "down" },
  // The dock's working row, canal boats to the derrick. The quay is road, so the router keeps him on
  // the stone rather than cutting the corner over the wharf edge.
  "richmond-dock-laborer": {
    kind: "route",
    stops: [
      { x: 14.5, y: 30.4 },
      { x: 26.5, y: 30.4 },
    ],
  },
};
// Four records, one per district that has a document of its own. Three are carried by the person
// whose paper it is; the fourth is on the market's price board, because its whole design is that no
// single person speaks for it — a price chalked over three times in a month, a ration notice, a call
// for substitutes and a list of deserters, all posted in the same week.
//
// The object anchor's x/y sits on the front edge of the board stamped by the generator. These two
// lists move together or not at all.
const UNIT5_FIELD_SOURCE_POINTS = {
  "richmond-impressment-order": {
    anchor: { npc: "confederate-official" },
    label: "Impressment requisition",
    kind: "Source",
  },
  "richmond-price-board": {
    x: 16.5,
    y: 8.2,
    anchor: { object: "Market price board" },
    label: "Price and ration notices",
    kind: "Source",
  },
  "richmond-tredegar-payroll": {
    anchor: { npc: "tredegar-ironworker" },
    label: "Tredegar payroll",
    kind: "Source",
  },
  "richmond-labor-pass": {
    anchor: { npc: "richmond-dock-laborer" },
    label: "Labourer's pass",
    kind: "Source",
  },
};

// ---- Richmond's two interiors --------------------------------------------------------------------
//
// Attached to FIELD_MAPS["unit-05"] further down the file, not inline in the literal — see the
// temporal-dead-zone note at the field-interiors block.
//
// Both rooms open south, because both buildings front their street from the north side of it, and
// both entries sit at y = 11.1 for the reason the Canal Crossroads block records at length:
// footBoxFor() runs 0.78 tiles below a character's anchor and the south wall's rect starts at y = 12,
// so a player spawned any lower arrives already blocked and the room reads as frozen on entry.
//
// **The register rule is the load-bearing constraint on both of these rooms**, and it is stricter
// here than anywhere else in the game. Nathan Purcell and Delia Marsh are both enslaved. Both are
// named, both speak in the first person, both say plainly what is being done to them and what they
// intend to do about it, and neither is explained by the white person standing across the room from
// them. Nobody in either room is written as scenery. See the decision log, and the two palette
// headers for how the same rule governed the furniture.

const UNIT5_COUNTING_ROOM_NPCS = [
  {
    id: "richmond-bookkeeper",
    // At the west end of the clerks' table, which the generator stamps at (2,7) four columns wide.
    // He stands on its south face, in the open aisle, so a player reading over his shoulder is
    // standing where a caller would stand.
    //
    // y is 9.0 and not 9.4 because a body's collision is its feet: footBoxFor() runs y+0.40 to
    // y+0.78, so at 9.4 he occupies row 10 — which is the rank of waiting chairs — and the interior
    // traversal test says so by name. Every coordinate in this block is chosen against the foot box,
    // not the anchor.
    x: 3.0,
    y: 9.0,
    group: "shockoe",
    name: "Lemuel Cofer",
    label: "Book-keeper",
    sprite: "richmond-bookkeeper",
    text: "Twenty-two years I have kept this book, and I will tell you what has changed in it. It is not the sales — those have all but stopped, there being nowhere south to send anybody with the river shut. It is the hires. Column after column of them, a year at a time, and half of those to the government: the Nitre Bureau, the hospitals, Tredegar. We do not sell people to the Confederacy. We rent them to it. The commission is two and a half per centum either way and the book does not distinguish.",
  },
  {
    id: "richmond-hired-out-man",
    // Beside the three chairs against the west wall, not on one — they run cols 1-3 across rows
    // 10-11, and his foot box sits at col 4, clear of them. He is in the outer office because that
    // is as far into this building as a person being hired is brought.
    x: 4.5,
    y: 10.6,
    group: "shockoe",
    name: "Nathan Purcell",
    label: "Hired to the works",
    sprite: "richmond-hired-out-man",
    text: "My name is Nathan Purcell. I have been stood in this room since first light waiting on a paper that says which works I go to, and the man who owns me is not here — he is in Charlotte County and the letter came instead. There is a wage set on my year and it is paid to him. I know the figure. I asked, and the clerk read it out to me because he did not think it signified. It signifies. I am going to the ironworks, and the ironworks is on the river, and the river runs two ways.",
  },
];
const UNIT5_COUNTING_ROOM_BEHAVIOURS = {
  "richmond-bookkeeper": { kind: "station", at: { x: 3.0, y: 9.0 }, facing: "up" },
  "richmond-hired-out-man": { kind: "station", at: { x: 4.5, y: 10.6 }, facing: "up" },
};
const UNIT5_COUNTING_ROOM_SOURCE_POINTS = {
  "richmond-trader-day-book": {
    anchor: { npc: "richmond-bookkeeper" },
    label: "Commission house day book",
    kind: "Source",
  },
};
function richmondCountingRoomWorldMarkup() {
  return `<canvas class="field-world-art" id="richmondCountingRoomTiledCanvas" role="img" aria-label="Interior of an 1864 Richmond commission house: a panelled office with a long clerks' writing table and three plain chairs against the wall of the outer half, and beyond a change in the floor, the trader's own end with a writing desk, an iron safe, shelves of bound ledgers and a longcase clock"></canvas><canvas class="field-world-overlay" id="richmondCountingRoomTiledCanvasOverlay" aria-hidden="true"></canvas>`;
}

const UNIT5_HOSPITAL_WARD_NPCS = [
  {
    id: "richmond-hospital-worker",
    // At the matron's desk, which the generator stamps at (16,6). She stands on its south face, in
    // the open aisle, with the register within reach — this room's record anchors to her.
    x: 17.0,
    y: 8.4,
    group: "hospital",
    name: "Jane Ferris",
    label: "Hospital matron",
    sprite: "richmond-hospital-worker",
    text: "Chimborazo is a hundred and fifty buildings on this hill and I keep the register for one of them. Name, regiment, date admitted, date discharged — and a last column I will not read out to you. Before the war a lady of this city did not work. The surgeons could not run a ward without us now and they know it, and there will be an argument about that when the men come home.",
  },
  {
    id: "richmond-ward-nurse",
    // At the west end, by the linen press and the medicine cabinet, which is where the work she is
    // describing is actually done.
    x: 4.0,
    y: 8.4,
    group: "hospital",
    name: "Delia Marsh",
    label: "Hired to the hospital",
    sprite: "richmond-ward-nurse",
    text: "Delia Marsh. I am hired to this hospital by the year and I have never seen a dollar of what I am worth to it — that goes to the woman in Hanover County who signed the paper. I do the washing, and the beds, and the feeding of men who cannot feed themselves, and at night I do the watching, because the matron cannot be here at two in the morning and I can. There is nothing in that book about me. Ask her, she will tell you the same. Now. You are the one writing things down that keep. Delia Marsh, hired to this ward, Hanover County. Put that somewhere it will not be lost, because the register will not, and one day somebody is going to want to know who was in this room.",
  },
];
const UNIT5_HOSPITAL_WARD_BEHAVIOURS = {
  "richmond-hospital-worker": { kind: "station", at: { x: 17.0, y: 8.4 }, facing: "up" },
  // A small disc in the open south aisle between the cots and the presses, which is where a woman
  // working a ward would be. Every step is still gated by isFieldNpcBlocked, so the disc overlapping
  // the presses' rects costs her nothing but the cells she cannot enter.
  "richmond-ward-nurse": { kind: "wander", home: { x: 4.0, y: 8.6 }, radius: 1.2 },
};
const UNIT5_HOSPITAL_WARD_SOURCE_POINTS = {
  "richmond-ward-register": {
    anchor: { npc: "richmond-hospital-worker" },
    label: "Ward register page",
    kind: "Source",
  },
};
function richmondHospitalWardWorldMarkup() {
  return `<canvas class="field-world-art" id="richmondHospitalWardTiledCanvas" role="img" aria-label="Interior of a Chimborazo Hospital ward, 1864: a long whitewashed room with sash windows down both walls, two ranks of empty made-up camp cots with a small table between each pair, and in the middle a work table, a linen press, a glazed medicine cabinet and the matron's desk with the ward register open on it"></canvas><canvas class="field-world-overlay" id="richmondHospitalWardTiledCanvasOverlay" aria-hidden="true"></canvas>`;
}
// Two bodies of water and one drawn cliff, and only the water is in here: the bluff is a run of solid
// retaining-wall rects in richmond-field.blocks.js, not a term in this predicate. That is what makes
// it a real constraint rather than a painted one, and it is why the only two ways down the hill are
// the gaps at cols 22-23 and 40-41.
//
// scripts/generate-richmond-tmj.js duplicates these three functions verbatim to paint the same banks
// the player collides with (decision log 0036). Do not deduplicate them.
const RICHMOND_CANAL_TOP = 27.9;
const RICHMOND_CANAL_BOTTOM = 29.9;
function jamesWaterline(x) {
  return 33.4 - Math.sin((x - 4) * 0.075) * 0.8;
}
export function isRichmondLand(x, y) {
  if (x < 2.0 || x > 54.0 || y < 1.5 || y > 34.5) return false;
  // Mayo's Bridge, on the 14th Street line: the road south out of the city, and the only thing that
  // crosses the James. It carries the canal and the dock on its way there, so it is tested first.
  const onMayosBridge = x > 30.85 && x < 33.15;
  if (y > jamesWaterline(x)) return onMayosBridge;
  if (y > RICHMOND_CANAL_TOP && y < RICHMOND_CANAL_BOTTOM) {
    return onMayosBridge || (x > 13.85 && x < 16.15) || (x > 35.85 && x < 38.15);
  }
  return true;
}
function richmondWorldMarkup() {
  return `<canvas class="field-world-art" id="richmondTiledCanvas" role="img" aria-label="Top-down wartime Richmond, Virginia: a government quarter of brick offices around a columned capitol on a green hill, a market street of terraced housing and a price board, a hospital ward with tents beside it, a stone retaining wall dropping to an ironworks with a furnace stack and a warehouse district below, a canal crossed by two footbridges and Mayo's Bridge, a paved dock quay with cranes and cargo, and the rocky falls of the James along the south edge"></canvas><canvas class="field-world-overlay" id="richmondTiledCanvasOverlay" aria-hidden="true"></canvas>`;
}

export const FIELD_MAPS = {
  "unit-01": {
    id: "unit-01",
    spawn: { x: 28.0, y: 22.0 },
    recall: { x: 22.0, y: 24.0 },
    isLand: isCaribbeanLand,
    blocks: CARIBBEAN_FIELD_BLOCKS,
    roads: CARIBBEAN_FIELD_ROADS,
    npcs: FIELD_NPCS,
    behaviours: FIELD_NPC_BEHAVIOURS,
    sourcePoints: FIELD_SOURCE_POINTS,
    musicScene: "island",
    worldMarkup: caribbeanWorldMarkup,
  },
  "unit-02": {
    id: "unit-02",
    spawn: { x: 26.0, y: 18.0 },
    recall: { x: 24.0, y: 19.5 },
    isLand: isRiverbendLand,
    blocks: RIVERBEND_FIELD_BLOCKS,
    roads: RIVERBEND_FIELD_ROADS,
    npcs: UNIT2_FIELD_NPCS,
    behaviours: UNIT2_FIELD_NPC_BEHAVIOURS,
    sourcePoints: UNIT2_FIELD_SOURCE_POINTS,
    musicScene: "settlement",
    worldMarkup: riverbendWorldMarkup,
  },
  "unit-03": {
    id: "unit-03",
    spawn: { x: 28.0, y: 22.0 },
    recall: { x: 24.0, y: 16.0 },
    isLand: isCommonCauseLand,
    blocks: COMMON_CAUSE_FIELD_BLOCKS,
    roads: COMMON_CAUSE_FIELD_ROADS,
    npcs: UNIT3_FIELD_NPCS,
    behaviours: UNIT3_FIELD_NPC_BEHAVIOURS,
    sourcePoints: UNIT3_FIELD_SOURCE_POINTS,
    musicScene: "settlement",
    worldMarkup: commonCauseWorldMarkup,
  },
  "unit-04": {
    id: "unit-04",
    // On the towpath at the lock's foot: the canal, the lock, the basin and the first person the
    // player meets are all inside the opening screen.
    spawn: { x: 26.5, y: 20.6 },
    recall: { x: 28.5, y: 20.6 },
    isLand: isCanalCrossroadsLand,
    blocks: CANAL_CROSSROADS_FIELD_BLOCKS,
    roads: CANAL_CROSSROADS_FIELD_ROADS,
    npcs: UNIT4_FIELD_NPCS,
    behaviours: UNIT4_FIELD_NPC_BEHAVIOURS,
    sourcePoints: UNIT4_FIELD_SOURCE_POINTS,
    musicScene: "settlement",
    worldMarkup: canalCrossroadsWorldMarkup,
  },
  "unit-05": {
    id: "unit-05",
    // On Franklin Street below Capitol Square, at the head of the west bluff descent. The government
    // quarter is uphill, Shockoe and Tredegar are downhill, and which way to go is the first thing
    // this map asks.
    spawn: { x: 26.5, y: 12.6 },
    recall: { x: 24.5, y: 12.6 },
    isLand: isRichmondLand,
    blocks: RICHMOND_FIELD_BLOCKS,
    roads: RICHMOND_FIELD_ROADS,
    npcs: UNIT5_FIELD_NPCS,
    behaviours: UNIT5_FIELD_NPC_BEHAVIOURS,
    sourcePoints: UNIT5_FIELD_SOURCE_POINTS,
    musicScene: "settlement",
    worldMarkup: richmondWorldMarkup,
  },
};
/** The unit's outdoor map, whatever room the player is currently standing in. */
function activeFieldOutdoorMap() {
  const unit = unitForCase(progress.activeCaseId);
  return FIELD_MAPS[unit?.id] || FIELD_MAPS["unit-01"];
}
/**
 * The surface the player is on — the unit's outdoor map, or one of its interiors.
 *
 * An interior is deliberately the *same shape* as an outdoor map: `id`, `grid`, `isLand`, `blocks`,
 * `roads`, `npcs`, `behaviours`, `sourcePoints`, `worldMarkup`. That is what makes this one function
 * the whole switch — isFieldBlocked(), isFieldGroundStandable(), fieldNavGridFor(),
 * buildFieldNpcRuntime(), updateFieldProximityUi() and nearestFieldInteraction() already read a map
 * through this call, so they carried over to interiors without being touched. Mirrors the hub's
 * activeHubGrid()/activeHubBlocks()/activeHubTargets() trio, which solves the same problem for
 * the three Institute rooms.
 */
function activeFieldMap() {
  const outdoor = activeFieldOutdoorMap();
  const room = progress.currentFieldRoom;
  return (room && outdoor.interiors?.[room]) || outdoor;
}
/** Every field surface declares its own size; only the outdoor maps share FIELD_GRID's 56x36. */
function activeFieldGrid() {
  return activeFieldMap().grid || FIELD_GRID;
}
const isInsideFieldInterior = () => activeFieldMap() !== activeFieldOutdoorMap();
/** The interiors of the active unit's map, as a list, each carrying its own id. */
function fieldInteriors() {
  return Object.values(activeFieldOutdoorMap().interiors || {});
}
const activeFieldCaseId = () => progress.activeCaseId || "case-001";

// The Main Hall is a camera room, like the Archive Room: `tile` is what tells hubCharacterStyle() to
// position in pixels and updateHubCamera() to scroll, rather than stretching a painted background to
// fill its box. 23x12 at 48px is 1104x576 — deliberately shorter than the ~596px frame so the camera
// never scrolls vertically and the north wall's pennants are never sliced by the top edge, while
// still wider than it so the hall reads as a hall. See the size note in
// scripts/generate-institute-hall-tmj.js.
export const HUB_GRID = { columns: 23, rows: 12, tile: 48 };
// Generated from the same stamps that painted institute-hall.tmj. This replaced a hand-measured
// rect array describing the retired `chronicle-institute-hub.png`.
export const HUB_BLOCK_RECTS = INSTITUTE_HALL_BLOCKS;
// Every coordinate below is chosen against the furniture the generator stamps, and the generator's
// header names them as load-bearing in the other direction too. Each target sits on the *face* of
// the object it belongs to; the player stands roughly 0.6 tiles clear of it, which is inside
// targetReach() and outside the object's collision rect.
// The Field Liaison's trust ladder. `liaisonTrust` counts missions the player has debriefed, capped
// so the tone can never run off the end of the authored lines — six is every mission the two
// authored units have. The bands are deliberately coarse: trust selects which line plays, never
// which scenes exist and nothing curricular (docs/design/THE-FIELD-LIAISON.md §5).
export const MAX_LIAISON_TRUST = 6;
/** Which of the Liaison's Institute lines a trust score plays. Pure, and exported for tests. */
export function liaisonLine(trust) {
  if (trust >= 3)
    return "You have enough filed that I can stop handing you procedure. So, honestly: a fair amount of what the Institute calls a settled record is only a well-kept one. When the evidence will not close a question, write that it will not — I would rather read that than something tidy.";
  if (trust >= 1)
    return "You are filing. Good. What to watch for now is the distance between what a record says and what it leaves out. The second one is harder to notice and it is usually the more interesting of the two.";
  return "First run is the one people overthink. You are not out there to fix anything — you are out there to come back with a record that holds up. If somebody tells you a thing you cannot check, write down that you could not check it. That counts.";
}
export const HUB_TARGETS = {
  liaison: {
    // The east half of the north cross-aisle (rows 4-5 are open wall to wall), clear of the three
    // hazards THE-FIELD-LIAISON.md §6 names: 2.5 tiles east of the Archive Room approach lane at
    // cols 11-12, five tiles east of Amani's shelf route, and four rows north of both the Director's
    // post and Julian's south-aisle circuit. Close enough to the lane that a player walking up to
    // the Archive Room passes them. Row 4 and not 4.6: the foot box is 0.5 tall, and 4.6 put its
    // last 0.04 across the reading stool stamped at (14,5).
    x: 14.5,
    y: 4.5,
    name: "Emery Voss",
    // No `role`, deliberately, and the only target without one. The other three staff are people
    // the player is being introduced to and whose standing is the point — a Director of Field
    // Studies is being told apart from a Route Historian. Voss is the recurring companion, and
    // captioning them "Field Liaison" every time they speak reintroduces somebody the player
    // already knows. The kicker is omitted rather than blank; "Field Liaison" stays the internal
    // name for the role, in the docs and the `liaison` registry key.
    dialogue: () => liaisonLine(progress.story.liaisonTrust),
  },
  director: {
    // The central opening in front of the foyer entrance — the first thing in front of the player
    // when they walk in, which is what a greeter should be.
    x: 10.0,
    y: 8.6,
    name: "Director Rowan Hale",
    role: "Director of Field Studies",
    dialogue: () =>
      `History does not need another hero. It needs someone willing to follow the evidence. ${progress.completedCases.length ? `You have archived ${progress.completedCases.length} Unit 1 case${progress.completedCases.length === 1 ? "" : "s"}. Read what the record supports before deciding what it means.` : "The Institute needs Chroniclers who can separate a compelling story from evidence that can be examined."}`,
  },
  amani: {
    // Working the record stacks, in the open cross-aisle below them.
    x: 8.0,
    y: 4.8,
    name: "Dr. Amani Soto",
    role: "Archive Researcher",
    dialogue: () =>
      "Context is not an answer key. Start with the record, write what you notice, then compare your reasoning with the Archive notes.",
  },
  julian: {
    // In the south aisle short of the Navigation Table dais, west of the player's approach to it.
    x: 15.5,
    y: 8.9,
    name: "Professor Julian Park",
    role: "Route Historian",
    // Rewritten in Phase 81B. The old line called it "the navigation table" in lower case and
    // treated a route as a destination. Julian is the Route Historian, so he is the one person on
    // the floor who would speak about provenance unprompted — and per canon §8 he *uses* the
    // object-led rule the briefing introduced rather than re-explaining it.
    dialogue: () =>
      `The Navigation Table is ready. ${progress.unlocked.length > 1 ? "More of Unit 1's records are holding a passage now. Read the provenance before you pick one — where a thing has been is the whole of where it can take you." : "The Caribbean record is the only one holding a passage for now."}`,
  },
  trophy: {
    // The display plinth's south face. Its rect is (3,2)-(5,4) and the open cross-aisle starts
    // directly below it, so the player stands at ~(4,4.1) — on the rug, 0.1 from this point.
    x: 4.0,
    y: 4.0,
    // The plinth's own stamp — generate-institute-hall-tmj.js:166, `preservationPlinth` (w2 x h2).
    marker: { col: 3, row: 2, w: 2, h: 2 },
    name: "Preservation Case",
    role: "Unit 1 badge display",
    dialogue: () => {
      const first = progress.completedCases.includes("case-001") || countEvidence("case-001") >= 3;
      return first
        ? "The Caribbean record has been preserved in the Unit 1 badge case."
        : "This case will display preserved records after your first investigation is transmitted through the Codex.";
    },
  },
  table: {
    // The Navigation Table's south face; its rect is (17,6)-(20,8), and targetReach() gives this
    // one a wider 1.65 radius, so the whole open south aisle below the dais is a valid approach —
    // including the cell Recall to Institute now spawns into, at y + 0.6.
    x: 18.5,
    y: 8.0,
    // The table's own stamp — generate-institute-hall-tmj.js:194, `navigationTable` (w3 x h2).
    marker: { col: 17, row: 6, w: 3, h: 2 },
    name: "Chronicle Navigation Table",
    role: "Archive interface",
    // Rewritten in Phase 81B. The old line — "displays teacher-unlocked cases geographically" —
    // was interface documentation rather than an in-world description, and it implied a case is a
    // place you choose. Canon §2 is object-led: the markers are surviving records, and the passage
    // opens onto wherever each one was. That is the reason this prop is a table with things on it.
    dialogue: () =>
      `Each marker is a record that outlasted its moment, set down where it was when it did. Your teacher decides which are open to you. Select one only after you have reviewed the active investigation.`,
    action: "archive",
  },
  archiveDoor: {
    // In the north wall's doorway, immediately above the first walkable row. The north wall rect
    // ends at y=2.0 and the player's foot box starts 0.06 above their anchor, so the closest they
    // can stand is y=2.06 — 0.16 from this target, well inside reach.
    x: 11.5,
    y: 1.9,
    // The two door leaves — generate-institute-hall-tmj.js:152 with DOOR_COLS = [11, 12], stamped
    // at row 0 with the door tile's h2. `labelSide: "below"` because there is no row above row 0:
    // a label above this marker would be clipped by the viewport's top edge.
    marker: { col: 11, row: 0, w: 2, h: 2, labelSide: "below" },
    name: "Archive Room",
    role: "Institute Archive entrance",
    dialogue: () => "",
    action: "enter-archive-room",
  },
};

// The Institute's second walkable room. Generalizes the same
// grid/blocks/targets + movement-engine shape HUB_GRID/HUB_BLOCK_RECTS/
// HUB_TARGETS already prove out for the Main Hall, resolved dynamically via
// activeHubGrid()/activeHubBlocks()/activeHubTargets() below (mirrors how
// FIELD_MAPS/activeFieldMap() already generalize field exploration across
// units). The Main Hall's own constants are left untouched.
// `tile` is what distinguishes a camera room from a fit-to-viewport one: a grid that declares a
// tile size is positioned in pixels and scrolled by updateHubCamera(), while a grid without one
// (the painted Main Hall) keeps the original percentage layout that stretches to fill its box.
// The Archive Room grew from 10x8 to 20x12; at the old size it was scaled up ~1.7x to fill the
// viewport, so its 48px art never drew at its own resolution.
export const ARCHIVE_ROOM_GRID = { columns: 20, rows: 12, tile: 48 };
// Generated from the same stamps that painted archive-room.tmj. This replaced eleven rects
// transcribed by eye from the generator's trailing comments — the last hand-maintained collision
// array in the game, three phases after every other map's was derived from its stamps.
export const ARCHIVE_ROOM_BLOCK_RECTS = ARCHIVE_ROOM_BLOCKS;

// --- field interiors -------------------------------------------------------------------------------
// No map declares an `interiors` block yet; the first are Unit 4's printing office and canal-side
// tavern. The runtime below is complete and was verified end to end (enter, walk, collide, centre
// the camera, reload mid-room, exit) against a scaffold interior that reused archive-room.tmj —
// removed rather than shipped, because a storehouse opening into a copy of the Archive Room is
// incoherent content on a unit students are already playing.
//
// The shape a map attaches, when it has one:
//
//   FIELD_MAPS["unit-04"].interiors = {
//     "canal-print-shop": {
//       id, grid, isLand, blocks, roads, npcs, behaviours, sourcePoints, worldMarkup,
//       entry: { x, y, facing },   // where the player lands inside
//       exit:  { x, y },           // the threshold that puts them back outdoors
//       door:  { x, y, label },    // the doorstep on the OUTDOOR map
//     },
//   };
//
// Two things that are not obvious and cost time to rediscover:
//
// 1. Attach it here, after this line — not inline in the FIELD_MAPS literal above. An interior's
//    grid and blocks are `const`s declared further down the file than FIELD_MAPS, and reading one
//    from an object literal that evaluates earlier is a temporal-dead-zone ReferenceError that takes
//    the app down on boot, not a lint warning. The same hazard is recorded on the field boot guard.
// 2. An interior is deliberately the same shape as an outdoor map, which is what lets
//    activeFieldMap() hand back either one and leave every consumer untouched. Keep it that way.
//
/**
 * An interior's land mask: everywhere inside the room.
 *
 * Every field surface must declare `isLand`, including the ones with no coastline — isFieldBlocked()
 * and isNpcStandingOnLand() both call `map.isLand(...)` unconditionally, so an interior without one
 * throws `map.isLand is not a function` on the first movement frame and the screen falls through to
 * the recovery state. That shipped in the first pass of these two rooms and was caught by the e2e
 * walkthrough rather than by any unit test, because the unit suite checks an interior's traversal
 * through its `blocks` and never calls this.
 *
 * A room needs no shape here beyond "inside the walls": the walls are real collision rects, so the
 * only job left is refusing to leave the grid entirely. Written against the room's own grid rather
 * than FIELD_GRID, which is 56x36 and would let a 20x14 room's mask claim ground it does not have.
 */
const interiorGround = (grid) => (x, y) => x >= 0 && y >= 0 && x <= grid.columns && y <= grid.rows;

// Canal Crossroads' two rooms, the first ever declared. `musicScene` is `settlement` on both, the
// same as the town outside: an interior is a room in that town, not a change of place, and stepping
// through a door should not restart the score.
const CANAL_PRINT_SHOP_GRID = { columns: 20, rows: 14, tile: 48 };
const CANAL_BOARDING_HOUSE_GRID = { columns: 22, rows: 14, tile: 48 };
FIELD_MAPS["unit-04"].interiors = {
  "canal-print-shop": {
    id: "canal-print-shop",
    grid: CANAL_PRINT_SHOP_GRID,
    isLand: interiorGround(CANAL_PRINT_SHOP_GRID),
    blocks: CANAL_PRINT_SHOP_BLOCKS,
    roads: [],
    npcs: UNIT4_PRINT_SHOP_NPCS,
    behaviours: UNIT4_PRINT_SHOP_BEHAVIOURS,
    sourcePoints: UNIT4_PRINT_SHOP_SOURCE_POINTS,
    musicScene: "settlement",
    worldMarkup: canalPrintShopWorldMarkup,
    entry: { x: 10.0, y: 11.1, facing: "up" },
    exit: { x: 10.0, y: 12.1 },
    // The doorstep on Market Street. generate-canal-crossroads-tmj.js stamps the printing office at
    // (31,6) two wide and two tall, so doorCellOf() puts its door cell at (32,8) — the first row of
    // the street. Josiah Pike was moved three tiles east of this point for it to be usable at all.
    door: { x: 32.0, y: 8.0, label: "Printing office" },
  },
  "canal-boarding-house": {
    id: "canal-boarding-house",
    grid: CANAL_BOARDING_HOUSE_GRID,
    isLand: interiorGround(CANAL_BOARDING_HOUSE_GRID),
    blocks: CANAL_BOARDING_HOUSE_BLOCKS,
    roads: [],
    npcs: UNIT4_BOARDING_HOUSE_NPCS,
    behaviours: UNIT4_BOARDING_HOUSE_BEHAVIOURS,
    sourcePoints: UNIT4_BOARDING_HOUSE_SOURCE_POINTS,
    musicScene: "settlement",
    worldMarkup: canalBoardingHouseWorldMarkup,
    entry: { x: 11.0, y: 11.1, facing: "up" },
    exit: { x: 11.0, y: 12.1 },
    // The tavern is stamped at (23,22) two by two, so its door cell is (24,24).
    door: { x: 24.0, y: 24.0, label: "Boardinghouse" },
  },
};

// Richmond's two rooms. `musicScene` is `settlement` on both, matching the city outside them for the
// reason Canal Crossroads recorded: an interior is a room in that place, not a change of place, and
// walking through a door should not restart the score. It is the right call here for a second reason
// — a music sting on entering the counting room would editorialise a room whose entire design is that
// it does not.
const RICHMOND_COUNTING_ROOM_GRID = { columns: 18, rows: 14, tile: 48 };
const RICHMOND_HOSPITAL_WARD_GRID = { columns: 24, rows: 14, tile: 48 };
FIELD_MAPS["unit-05"].interiors = {
  "richmond-counting-room": {
    id: "richmond-counting-room",
    grid: RICHMOND_COUNTING_ROOM_GRID,
    isLand: interiorGround(RICHMOND_COUNTING_ROOM_GRID),
    blocks: RICHMOND_COUNTING_ROOM_BLOCKS,
    roads: [],
    npcs: UNIT5_COUNTING_ROOM_NPCS,
    behaviours: UNIT5_COUNTING_ROOM_BEHAVIOURS,
    sourcePoints: UNIT5_COUNTING_ROOM_SOURCE_POINTS,
    musicScene: "settlement",
    worldMarkup: richmondCountingRoomWorldMarkup,
    entry: { x: 9.0, y: 11.1, facing: "up" },
    exit: { x: 9.0, y: 12.1 },
    // The doorstep on Lower Street. generate-richmond-tmj.js stamps the counting room at (32,20) two
    // wide and two tall, so doorCellOf() puts its door cell at (33,22) — the first row of the street.
    // Ambrose Kell was already standing two and a half tiles east of this point, which is why he did
    // not have to move for it.
    door: { x: 33.0, y: 22.0, label: "Counting room" },
  },
  "richmond-hospital-ward": {
    id: "richmond-hospital-ward",
    grid: RICHMOND_HOSPITAL_WARD_GRID,
    isLand: interiorGround(RICHMOND_HOSPITAL_WARD_GRID),
    blocks: RICHMOND_HOSPITAL_WARD_BLOCKS,
    roads: [],
    npcs: UNIT5_HOSPITAL_WARD_NPCS,
    behaviours: UNIT5_HOSPITAL_WARD_BEHAVIOURS,
    sourcePoints: UNIT5_HOSPITAL_WARD_SOURCE_POINTS,
    musicScene: "settlement",
    worldMarkup: richmondHospitalWardWorldMarkup,
    entry: { x: 12.0, y: 11.1, facing: "up" },
    exit: { x: 12.0, y: 12.1 },
    // The ward is stamped at (38,4) four by four, so its door cell is (40,8) — the first row of Broad
    // Street. Jane Ferris used to stand at (42.5, 8.4), two and a half tiles east of here; she is
    // inside now, and nothing else on that stretch of pavement is within reach of this marker.
    door: { x: 40.0, y: 8.0, label: "Chimborazo ward" },
  },
};

// Both coordinates are chosen against the furniture the generator stamps, and the generator's header
// names them as load-bearing in the other direction too. Each sits on the *face* of its object; the
// player stands roughly 0.6 tiles clear, which is inside targetReach() and outside the rect.
export const ARCHIVE_ROOM_TARGETS = {
  terminal: {
    // The writing desk's south face, on the doorway's own columns at the head of the plank runner.
    // Its rect is (9,2)-(11,4) and the open cross-aisle starts directly below it, so the player
    // stands at ~(10,4.1) after a straight walk north from the door.
    x: 10.0,
    y: 4.0,
    // The desk's own stamp — generate-archive-room-tmj.js:133, `writingDesk` (w2 x h2) at
    // DOOR_COLS[0] = 9.
    marker: { col: 9, row: 2, w: 2, h: 2 },
    name: "Archive Terminal",
    role: "Archive Challenges interface",
    dialogue: () => "Archive Challenges for this unit are still being cataloged. Check back soon.",
    action: "archive-challenges",
  },
  exitDoor: {
    // Centred on the two door leaves in the south wall. The wall rect starts at y=10 and the
    // player's foot box runs 0.44 below their anchor, so the closest they can stand is y=9.56 —
    // 0.54 from this point, well inside reach — and the spawn this door produces on entry
    // (exitDoor.y - 0.6 = 9.5) is inside the open south aisle rather than inside geometry. A past
    // regression froze all movement because the player's very first foot box already read as
    // blocked; the traversal test in tests/unit/field-map-coordinates.test.js now asserts this cell.
    x: 10.0,
    y: 10.1,
    // The two door leaves — generate-archive-room-tmj.js:115 with DOOR_COLS = [9, 10], stamped on
    // the south wall's first row with the door tile's h2. Unlike the Main Hall's north door there
    // is a walkable row above this one, so the label sits above like every other object's.
    marker: { col: 9, row: 10, w: 2, h: 2 },
    name: "Institute Foyer",
    role: "Return to the Main Hall",
    dialogue: () => "",
    action: "leave-archive-room",
  },
};
// The Institute's third walkable room: the Entrance Hall the player arrives in, one room south of
// the Main Hall. Until Phase 62 this was `intro-hallway`, a screen of its own holding a five-second
// scripted walk — two sprites lerped up a fixed track over a 6x10 strip of floor with no walls and
// no collision. It is an ordinary hub room now, and the player's first moment of control, so it
// needs nothing the other two rooms don't already have. See
// docs/decision-log/0046-institute-entrance-hall-and-escort-walk.md.
export const HALLWAY_GRID = { columns: 20, rows: 18, tile: 48 };
// Generated from the same stamps that painted hallway.tmj — the map had no collision at all before,
// because nothing walked in it.
export const HALLWAY_BLOCK_RECTS = HALLWAY_BLOCKS;
// Just inside the entry doors in the south wall (stamped at cols 9-10, rows 16-17), facing up the
// room at the Director. 3.8 tiles short of him, which is about a second at HUB_SPEED — long enough
// to have learned the keys, short enough not to be a hike.
export const HALLWAY_SPAWN = [10.0, 15.3, "up"];
// Where the escort walk ends: dead centre of the Main Hall doorway, one tile inside the north wall.
export const HALLWAY_DOOR_APPROACH = { x: 10.0, y: 2.6 };
export const HALLWAY_TARGETS = {
  director: {
    // On the greeting runner in the open band at rows 10-11, on the spine, so he is the first thing
    // in the room the player walks into. Deliberately no `marker`: he is an NPC, and NPCs carry
    // their name below the sprite rather than a .hub-marker glow on furniture.
    x: 10.0,
    y: 10.4,
    name: "Director Rowan Hale",
    role: "Director of Field Studies",
    // The Entrance Hall's words come from CHRONICLE_OPENING_DEFAULTS.scenes.hallway through the
    // intro typewriter, not from a single-string hub dialogue panel — see the "hallway-brief"
    // branch in interactWithHubTarget().
    dialogue: () => "",
    action: "hallway-brief",
  },
};
export const HALLWAY_NPC_BEHAVIOURS = {
  // Waiting for the player, facing south down the spine at the doors they come through. Stationed
  // rather than wandering for the same reason the Main Hall's Director is: the scene walks the
  // player to him, so he cannot be somewhere else when they arrive.
  director: { kind: "station", at: { x: 10.0, y: 10.4 }, facing: "down" },
};
function activeHubGrid() {
  if (progress.currentHubRoom === "archive") return ARCHIVE_ROOM_GRID;
  if (progress.currentHubRoom === "hallway") return HALLWAY_GRID;
  return HUB_GRID;
}
function activeHubBlocks() {
  if (progress.currentHubRoom === "archive") return ARCHIVE_ROOM_BLOCK_RECTS;
  if (progress.currentHubRoom === "hallway") return HALLWAY_BLOCK_RECTS;
  return HUB_BLOCK_RECTS;
}
function activeHubTargets() {
  if (progress.currentHubRoom === "archive") return ARCHIVE_ROOM_TARGETS;
  if (progress.currentHubRoom === "hallway") return HALLWAY_TARGETS;
  return HUB_TARGETS;
}

// Post-hallway guided tour of the Main Hall (progress.tutorial.step === "tour-<id>" for one of
// these ids, or "tour-intro" for the unhighlighted orientation beat before them). Movement is
// locked for the whole tour — see the three isTutorialTourActive() call sites in the institute
// keydown handler, runHubMovementLoop(), and interactWithHubTarget().
const TUTORIAL_TOUR_STEPS = ["intro", "table", "archiveDoor", "trophy"];
function isTutorialTourActive() {
  return typeof progress.tutorial?.step === "string" && progress.tutorial.step.startsWith("tour-");
}
/**
 * Whether a scripted beat currently owns the hub, so the player's own input has to stand down.
 *
 * One concept, checked at the same three sites the tutorial tour's lock already used — the institute
 * keydown handler, runHubMovementLoop() and interactWithHubTarget(). The Entrance Hall scene added a
 * second reason to lock movement, and two independent locks checked at overlapping subsets of three
 * places is how a screen ends up controllable during half of one cutscene.
 */
function isHubInputLocked() {
  return isTutorialTourActive() || hallwayScene.phase !== "idle" || isHubSceneActive();
}
function currentTourStepId() {
  return isTutorialTourActive() ? progress.tutorial.step.slice("tour-".length) : null;
}
function isTourHighlighted(id) {
  return isTutorialTourActive() && currentTourStepId() === id;
}
// Shared by instituteMainRoomScreen()'s markup and updateHubProximityUi() so a hub target's
// "is-near" gold pulse reflects real proximity OR (during the tour) being the currently
// highlighted step — factored out so the two sites can't drift out of sync with each other.
function isHubTargetNear(id) {
  const targets = activeHubTargets();
  return targetDistance(targets[id], id) <= targetReach(id) || isTourHighlighted(id);
}

// Just inside the foyer entrance in the south wall (the doors are stamped at cols 11-12, rows
// 10-11), facing up the hall. The onboarding hallway walk hands off here.
let instituteMovement = { x: 11.5, y: 9, facing: "up", moving: false, step: false, queued: null };
// Every existing call site means "place the player in the Main Hall" — reset
// the room here so returning to the Institute never strands the player in a
// sub-room at Main-Hall-relative coordinates. The two room-transition call
// sites in interactWithHubTarget() explicitly set currentHubRoom afterward.
/**
 * Places the player in the Main Hall, defaulting to the foyer entrance in the south wall.
 *
 * Call this with no arguments unless you specifically mean somewhere else, and when you do mean
 * somewhere else, derive it from a HUB_TARGETS coordinate. Six call sites used to pass the literals
 * `(7, 9)` and `(16, 9)` — the painted Main Hall's spawn and its Navigation Table approach. The
 * Phase 54 rebuild moved the furniture out from under both: `(7, 9)` now sits inside the
 * "sealed record chest" rect, and this function does not validate, so the player would have arrived
 * from the onboarding hallway (and from every Recall to Institute) unable to move in any direction.
 */
function safeInstituteSpawn(x = 11.5, y = 9, facing = "up") {
  hubHeldKeys.clear();
  stopHubMovementLoop();
  instituteMovement = { x, y, facing, moving: false, step: false, queued: null };
  hubDialogueId = null;
  progress.currentHubRoom = "main";
}
/**
 * Where a Chronotravel run puts the player when it ends — in the open south aisle just below the
 * Navigation Table, facing it.
 *
 * Both recall paths used to arrive at the Archive Room door in the *north* wall, which is the far
 * corner of the hall from the object the player left through, so every return began with the same
 * walk back across the room. Spread as `safeInstituteSpawn(...instituteRecallSpawn())` from both, so
 * the two can't drift apart the way six hardcoded spawn literals did before Phase 57.
 */
function instituteRecallSpawn() {
  return [HUB_TARGETS.table.x, HUB_TARGETS.table.y + 0.6, "up"];
}
/**
 * Puts the player just inside the Entrance Hall's south doors with the scene wound back to the top.
 *
 * The counterpart to safeInstituteSpawn() for the one room that isn't the Main Hall by default. It
 * resets `hallwayScene` as well as the position because both entry points want that: arriving from
 * Registration, and resuming a save that was in this room when it was written.
 */
function enterHallwayRoom() {
  stopHallwayScene();
  hubHeldKeys.clear();
  stopHubMovementLoop();
  const [x, y, facing] = HALLWAY_SPAWN;
  instituteMovement = { x, y, facing, moving: false, step: false, queued: null };
  hubDialogueId = null;
  Object.assign(hallwayNpcRuntime.director, {
    ...HALLWAY_NPC_BEHAVIOURS.director.at,
    facing: HALLWAY_NPC_BEHAVIOURS.director.facing,
    walking: false,
  });
  progress.currentScreen = "institute";
  progress.currentHubRoom = "hallway";
  progress.tutorial.step = "hallway";
}
/** Cancels anything the Entrance Hall scene has in flight. Safe to call when nothing is running. */
function stopHallwayScene() {
  if (hallwayScene.frame) window.cancelAnimationFrame(hallwayScene.frame);
  clearTimeout(hallwayScene.fadeTimer);
  hallwayScene = { phase: "idle", escort: null, frame: null, lastAt: 0, fadeTimer: null };
}
let hubDialogueId = null;
/**
 * The Entrance Hall's one-shot scene, in one object rather than the five separate module lets the
 * retired `intro-hallway` walk kept — so there is a single thing to read and a single thing to reset.
 *
 * `phase` is also the room's input lock (see isHubInputLocked()):
 *   idle     an ordinary walkable hub room. The player has full control.
 *   talking  the Director's briefing is on screen; movement is off and E advances a line.
 *   escort   he is walking to the doors and the player is following him. No input at all.
 *   flicker  the doorway transition is playing over the top of everything.
 *
 * Declared up here beside hubDialogueId, not down with the intro-screen state it replaced, because
 * updateInstituteNpcs() below reads it and a `let` further down the file would be in its TDZ.
 */
let hallwayScene = { phase: "idle", escort: null, frame: null, lastAt: 0, fadeTimer: null };
// What each staff member is doing in the Main Hall — see FIELD_NPC_BEHAVIOURS above and
// engine/npc-behaviour.js for the three kinds.
//
// Nobody wanders in here, and that is the room, not a preference: only two bands of the hall are
// open floor, y 4.06-5.56 (the cross-aisle) and y 8.06-9.56 (the south aisle), so a disc large
// enough to be worth walking spends most of itself against furniture. Both bands are corridors,
// which makes them routes — Amani has the cross-aisle in front of the stacks, Julian the south
// aisle. Only the Director is stationed, and only because the tutorial tour walks the player to him
// and he cannot be elsewhere when it does.
//
// Every post also had to move clear of a reading stool. The stools are `decor` and carry no
// collision — the generator's south aisle deliberately has no solid stamps in it — so before
// Phase 62 Julian's post at (15.2,8.9) put his foot box across the stool at column 14, and the
// playtest screenshot is him standing on it. Moving the people is the fix rather than blocking the
// stools: a 1x1 `base` block covers [row+0.4, row+1], which against this aisle would leave a
// 0.56-tile gap for a 0.5-tile foot box at four columns.
export const HUB_NPC_BEHAVIOURS = {
  // Greeting the player in the open floor in front of the foyer entrance, west of the runner rug.
  // Stationed because the tutorial tour walks the player to him and he cannot be elsewhere.
  director: { kind: "station", at: { x: 9.6, y: 8.6 }, facing: "down" },
  // Working the record stacks: three sections of the shelf run, a stop at each, facing the shelf
  // she is reading rather than the way she walked in. She was a station here until Phase 64 and
  // read as furniture — the playtest note is that an archivist should be working her stacks, not
  // standing in front of them.
  //
  // Row 4 and not 4.6: the foot box is 0.5 tall, so y=4.5 clears the reading stools on row 5
  // entirely, and it is the cell centre findRoute() walks to anyway. And deliberately west of
  // column 11 — cols 11-12 are the Archive Room approach the generator leaves clear, the one lane
  // from the foyer entrance to the door, and now that staff are solid (see isHubBlocked) a body
  // crossing it is a body standing in the room's main artery.
  //
  // `facing` on the behaviour itself, not just the stops, so the first thing she does on a cold load
  // is look at the shelves — createBehaviourState() opens with a settling pause of up to 900ms, and
  // without this she spends it facing the camera.
  //
  // The pause is longer than the 700-1700ms a route stop defaults to, because reading a shelf is
  // meant to read as reading a shelf, and shorter than the first pass's 2600-4600, which measured
  // out at 30% of her time walking — the stops were long enough that she was a station again with
  // an occasional stroll. This lands near half and half.
  amani: {
    kind: "route",
    facing: "up",
    stops: [
      { x: 5.5, y: 4.5, facing: "up", pauseMs: [1500, 2900] },
      { x: 7.5, y: 4.5, facing: "up", pauseMs: [1500, 2900] },
      { x: 9.5, y: 4.5, facing: "up", pauseMs: [1500, 2900] },
    ],
  },
  // Stationed rather than routed: a liaison waiting to see somebody off stands where they can be
  // found. Their sheet declares `idleColumns: 5`, so standing here plays a breathing cycle rather
  // than holding one frame — the same treatment the other three staff in this room get.
  liaison: { kind: "station", at: { x: 14.5, y: 4.5 }, facing: "down" },
  // The south aisle end to end, between the foyer runner and the Navigation Table dais, on row 9
  // rather than row 8 so the circuit passes south of the stools instead of through them.
  julian: {
    kind: "route",
    stops: [
      { x: 11.5, y: 9.4 },
      { x: 18.5, y: 9.4 },
    ],
  },
};
// A shade slower than the field's 1.35: this is an indoor walking pace on a stone floor between
// furniture, not someone crossing a settlement.
const HUB_NPC_SPEED = 1.15;
// The Main Hall's shape never changes, so its nav grid is built once. No `roads` — an interior has
// floors, and with every cell costing the same the router just takes the shortest walk.
export const HUB_NAV_GRID = createNavGrid({
  columns: HUB_GRID.columns,
  rows: HUB_GRID.rows,
  occupied: stationedPosts(HUB_NPC_BEHAVIOURS),
  isStandable: (x, y) => isHubGroundStandable(x, y),
});
const hubNpcRuntime = Object.fromEntries(
  Object.entries(HUB_NPC_BEHAVIOURS).map(([id, behaviour], index) => [
    id,
    createBehaviourState({
      ...behaviour,
      waypoints:
        behaviour.kind === "route" ? buildCircuit(HUB_NAV_GRID, behaviour.stops) : undefined,
      speed: HUB_NPC_SPEED * (0.94 + index * 0.05),
      seed: id,
    }),
  ])
);
// The Entrance Hall's router. No `occupied` posts: the only person in the room is the Director, and
// he is the one being routed — listing his own post as furniture would make his first step
// unreachable from where he is standing.
export const HALLWAY_NAV_GRID = createNavGrid({
  columns: HALLWAY_GRID.columns,
  rows: HALLWAY_GRID.rows,
  isStandable: (x, y) => isHallwayGroundStandable(x, y),
});
const hallwayNpcRuntime = {
  director: createBehaviourState({
    ...HALLWAY_NPC_BEHAVIOURS.director,
    speed: HUB_NPC_SPEED,
    seed: "director",
  }),
};
/** The Archive Room has nobody in it. Hoisted so every empty-room tick shares one object. */
const HUB_NPC_RUNTIME_NONE = {};
/**
 * The behaviour states belonging to whichever hub room the player is standing in.
 *
 * An empty object is the honest way to say "nobody lives here" — it iterates zero times, which is
 * what the `currentHubRoom === "archive"` early return in updateInstituteNpcs() used to hand-code.
 */
function activeHubNpcRuntime() {
  if (progress.currentHubRoom === "hallway") return hallwayNpcRuntime;
  if (progress.currentHubRoom === "archive") return HUB_NPC_RUNTIME_NONE;
  return hubNpcRuntime;
}
const hubHeldKeys = new Set();
let hubMoveFrame = null;
let lastHubMoveAt = 0;
function hubTargetState(id) {
  return activeHubNpcRuntime()[id] || activeHubTargets()[id];
}
// Exported for tests/unit/field-map-coordinates.test.js's reachability flood fill. The hub's foot
// box is NOT footBoxFor() — it is narrower (0.56 vs 0.68) and sits higher relative to the anchor —
// so a room walked with the field box measures gaps the player cannot actually fit through, and
// vice versa. Both hub rooms' assertions used the field box until Phase 58 caught it.
export function hubFootBoxFor(x, y) {
  return { x1: x - 0.28, x2: x + 0.28, y1: y - 0.06, y2: y + 0.44 };
}
function hubRectBlocked(foot) {
  return activeHubBlocks().some((block) => rectsOverlap(foot, block));
}
/**
 * The Main Hall's static walkability, for the router.
 *
 * Pinned to INSTITUTE_HALL_BLOCKS rather than activeHubBlocks(): the three staff exist only in the
 * Main Hall, and the grid is built once at module load, when the player may well be standing in the
 * Archive Room next door. Exported for the coordinate test, which asserts every hub stop lands on
 * open floor.
 */
export function isHubGroundStandable(x, y) {
  if (x < 0.6 || y < 0.8 || x > HUB_GRID.columns - 1.2 || y > HUB_GRID.rows - 1.2) return false;
  const foot = hubFootBoxFor(x, y);
  return !INSTITUTE_HALL_BLOCKS.some((block) => rectsOverlap(foot, block));
}
/**
 * The Entrance Hall's static walkability, for the router — the same shape as the Main Hall's above,
 * pinned to its own room's blocks for the same reason.
 *
 * A `function` declaration, not a `const` arrow: HALLWAY_NAV_GRID is built at module load and calls
 * this during construction, so an arrow declared below it would be in its temporal dead zone.
 */
export function isHallwayGroundStandable(x, y) {
  if (x < 0.6 || y < 0.8 || x > HALLWAY_GRID.columns - 1.2 || y > HALLWAY_GRID.rows - 1.2)
    return false;
  const foot = hubFootBoxFor(x, y);
  return !HALLWAY_BLOCKS.some((block) => rectsOverlap(foot, block));
}
function isHubNpcBlocked(id, x, y) {
  const foot = hubFootBoxFor(x, y);
  const grid = activeHubGrid();
  if (x < 0.6 || y < 0.8 || x > grid.columns - 1.2 || y > grid.rows - 1.2) return true;
  if (hubRectBlocked(foot)) return true;
  if (rectsOverlap(foot, hubFootBoxFor(instituteMovement.x, instituteMovement.y))) return true;
  return Object.entries(activeHubNpcRuntime()).some(
    ([otherId, other]) => otherId !== id && rectsOverlap(foot, hubFootBoxFor(other.x, other.y))
  );
}
let lastHubNpcTickAt = 0;
function updateInstituteNpcs(now = performance.now()) {
  if (progress.currentScreen !== "institute") return;
  const elapsed = lastHubNpcTickAt ? now - lastHubNpcTickAt : NPC_TICK_MS;
  lastHubNpcTickAt = now;
  const nodes = new Map(
    [...document.querySelectorAll("[data-hub-npc]")].map((node) => [node.dataset.hubNpc, node])
  );
  Object.entries(activeHubNpcRuntime()).forEach(([id, state]) => {
    // Standing still while being spoken to, while walking the player through the tutorial tour, and
    // for the whole of the Entrance Hall scene — the Director cannot wander off mid-sentence, and
    // once the escort starts, runHallwayEscort() owns his position. Letting this tick also
    // stepBehaviour() him during the escort would be two loops writing the same coordinates.
    if (
      hubDialogueId === id ||
      (id === "director" && (isTutorialTourActive() || hallwayScene.phase !== "idle"))
    )
      state.walking = false;
    else stepBehaviour(state, elapsed, (x, y) => isHubNpcBlocked(id, x, y));

    const node = nodes.get(id);
    if (!node) return;
    // hubCharacterStyle(), matching instituteNpc()'s markup and updateInstitutePlayer(). This tick
    // used to write percentages of HUB_GRID's column/row count directly, so when the Main Hall
    // became a camera room the NPCs were re-positioned wrong on the very next frame after
    // render — the markup was right and this overwrote it.
    node.style.cssText = hubCharacterStyle(state.x, state.y);
    node.classList.toggle("is-walking-npc", state.walking);
    node.dataset.facing = state.facing;
    applyCharacterSprite(
      node.querySelector(".character-sprite"),
      id,
      state.facing,
      state.walking,
      state.speed
    );
  });
  updateInstitutePlayer();
}
if (app) setInterval(() => updateInstituteNpcs(), NPC_TICK_MS);

export let progress = loadProgress();
// Field dialogue is moment-to-moment UI, not save-state. Clear stale bubbles after reloads.
if (progress.activeFieldNpc) {
  progress.activeFieldNpc = null;
  saveProgress(progress);
}
// instituteMovement (like field movement) is ephemeral, not persisted — it
// always starts at the Main Hall's default spawn. If the player was in the
// Archive Room when they last saved, place them just inside its doorway
// instead, so they don't resume at Main-Hall-relative coordinates in a
// smaller room. Mirrors the positioning interactWithHubTarget() uses when
// entering the Archive Room mid-session.
if (progress.currentScreen === "institute" && progress.currentHubRoom === "archive") {
  instituteMovement = {
    x: ARCHIVE_ROOM_TARGETS.exitDoor.x,
    y: ARCHIVE_ROOM_TARGETS.exitDoor.y - 0.6,
    facing: "up",
    moving: false,
    step: false,
    queued: null,
  };
}
// Phase 62 retired the `intro-hallway` screen: the onboarding corridor is a hub room now. Migrate a
// save written mid-onboarding here, above the VALID_SCREENS check below, which would otherwise see
// an unknown screen and drop the player into the Main Hall having skipped the whole introduction.
if (progress.currentScreen === "intro-hallway") {
  progress.currentScreen = "institute";
  progress.currentHubRoom = "hallway";
  progress.tutorial.step = "hallway";
}
// A save left in the Entrance Hall resumes at its spawn with the scene wound back to the top, rather
// than wherever the player was standing. The scene is fifteen seconds and replaying it costs
// nothing, which buys the removal of a whole failure class: resuming mid-conversation into a room
// with a locked-out player, a Director halfway to the door and a typewriter that will never fire.
if (progress.currentScreen === "institute" && progress.currentHubRoom === "hallway") {
  const [x, y, facing] = HALLWAY_SPAWN;
  instituteMovement = { x, y, facing, moving: false, step: false, queued: null };
}
const VOLATILE_SCREENS = new Set(["source"]);
const VALID_SCREENS = new Set([
  "institute",
  "archive",
  "travel",
  "field",
  // One screen id per activity engine (interview / assembly / discrepancy / trace), spread from
  // the registry so adding a fifth engine cannot forget this list. These replaced the three
  // hand-written screen ids — village-activity, columbus-activity, map-jigsaw — which were each
  // welded to a single source. A save left on one of those now falls through to the check below
  // and resumes in the field, with the record itself untouched in progress.caseEvidence.
  ...ACTIVITY_ENGINE_KEYS,
  "practice-check",
  "mini-games",
  "source",
  "codex",
  "mastery",
  "archive-rotation",
  "reconstruction",
  "upload",
  "return-warp",
  "review",
  "completion",
  "archive-challenges",
  "mission",
  "investigation",
  "intro-welcome",
  "intro-briefing",
  "intro-protocol",
  "identity",
  "intro-registration",
  "join",
  "login",
  "teacher-dashboard",
  "grading",
  "manage-content-case",
]);
if (
  !VALID_SCREENS.has(progress.currentScreen) ||
  VOLATILE_SCREENS.has(progress.currentScreen) ||
  (progress.currentScreen === "travel" && !progress.activeCaseId)
) {
  progress.currentScreen = progress.activeCaseId ? "field" : "institute";
  saveProgress(progress);
}
let sourceOrigin = "field";
let openSourceId = null;
let authorMode = false;
let authorPanelOpen = false;

// --- Real accounts/classrooms (see docs/architecture/PLATFORM-ARCHITECTURE-PROPOSAL.md
// §8 for the long-term data model this is the "Now" slice of). currentProfile
// is populated asynchronously after boot — never awaited here, since
// progress = loadProgress() above must stay synchronous. Odysso (the
// separate marketing site) links directly into "join"/"login" via ?entry=.
let currentProfile = null;
// Dev-only shortcut (see "dev-fake-teacher" click action below) — a single
// fixed, reusable credential so repeated testing signs into the same
// classrooms/roster instead of spawning a fresh account every click. Gated
// behind import.meta.env.DEV; never reachable in the deployed build.
const DEV_FAKE_TEACHER = {
  // Supabase's live signup validator rejects addresses on domains that don't
  // resolve at all (fabricated domains like "chronicle.test" 400 with
  // email_address_invalid), so this uses a real, resolvable mail domain
  // instead — no inbox is expected to exist at this specific address. If the
  // project requires email confirmation, the confirmation link will simply
  // never be delivered (see the needsEmailConfirmation branch below).
  email: "chronicle-dev-teacher@gmail.com",
  password: "DevTeacherPass123!",
  displayName: "Dev Test Teacher",
  schoolName: "Dev Test School",
};
const authUiState = {
  studentTab: "claim",
  teacherTab: "signin",
  error: "",
  info: "",
  pending: false,
  // Teacher signup wizard (step 1: account fields, step 2: bulk classroom/roster setup).
  // signupDraft holds step 1's values so Back/Continue round-trips without re-reading the
  // DOM (step 1's inputs no longer exist once step 2 is showing).
  signupStep: 1,
  signupDraft: null,
  classroomRows: [],
};
let teacherUiState = {
  activeTab: "classrooms",
  classrooms: [],
  selectedClassroomId: null,
  roster: [],
  submissions: [],
  newClassroomName: "",
  lastProvisioned: null,
  lastReissuedPassword: null,
  progressByStudent: {},
  enabledUnitIndex: 0,
  error: "",
  pending: false,
  // Assignments (Phase 50D) — due-date records layered on the existing
  // submissions/evaluations/manual_grades tables; gradedEvaluationIds is a
  // flat Set (not per-assignment) since computeAssignmentReport() cross-
  // references it against teacherUiState.submissions itself. The create-form
  // fields themselves are read straight from the DOM at click time (see
  // "create-assignment"), matching new-classroom-name's existing convention
  // — no controlled-input state needed.
  assignments: [],
  gradedEvaluationIds: new Set(),
  // Sources tab (Teacher Dashboard) — a classroom's curated pool of
  // candidate sources per unit, lazy-loaded per unit the first time its
  // accordion section is opened (also loaded from Manage Content's
  // authoring form — see loadManageContentCaseData()). sourcePoolByUnit:
  // { [unitNumber]: Map<sourceId, sourceKind> } | undefined (not yet
  // loaded).
  sourcePoolByUnit: {},
  // Unit numbers with a getUnitSourcePool() fetch currently in flight — a
  // separate Set rather than a 3rd sentinel value inside sourcePoolByUnit,
  // so every existing `!pool`/`pool === undefined` check there keeps working
  // unchanged; this only exists to let the Manage Content source selector
  // show "Loading sources…" instead of the "empty pool" message while a
  // fetch that might still fill it is still running.
  sourcePoolLoadingUnits: new Set(),
  sourcesExpandedUnit: null,
  // Which pool rows currently have their full source content expanded —
  // keyed by `${kind}:${id}` since text/visual ids aren't guaranteed unique
  // against each other.
  sourcesPreviewKeys: new Set(),
  // Which previews have "Show Full Text" expanded — same key shape as above.
  sourcesFullTextKeys: new Set(),
};
// Manage Content (Teacher Mode's source/MCQ-quest swap editor) state —
// separate from teacherUiState since it's a distinct screen family with its
// own loader/click-handler group, mirroring how gradingUiState is split out.
let contentUiState = {
  selectedCaseId: null,
  // "name" -> "preview" -> "edit"/"replace" -> "published", the guided
  // per-mission wizard (see manageContentCaseScreen()'s dispatch below) —
  // only meaningful for non-map cases; reset to "name" whenever a fresh case
  // is opened ("open-manage-content-case"), left alone across in-place data
  // reloads (loadManageContentCaseData(), e.g. after Save/Publish) so a
  // teacher stays on the step they're working in.
  wizardStep: "name",
  // The case's one official quest slot (its Archive Challenge) — every
  // non-map case has at most one, see officialQuestSlotsForCase()'s doc
  // comment — or null if this case has none yet.
  // {slotKind, currentSlotKind, officialId, officialLabel, draftAltId,
  //  draftAltKind, publishedAltId, latestCustomAltId, previewContent}
  slot: null,
  error: "",
  // Plain-language confirmation for an action that just succeeded (e.g.
  // "Draft saved.") — see feedbackSuccess(). Cleared whenever a new pending
  // action starts, so it can't linger stale across an unrelated save/publish.
  successMessage: "",
  pending: false,
  // Which kind of async action most recently failed, so the command bar's
  // status badge can say "Save failed"/"Publish failed" instead of a single
  // generic error state — set right before persistAuthoringSelection()/
  // publishCaseSelections() run, cleared on success.
  lastActionFailed: null,
  // True once "Save Draft" has succeeded without a publish since — needed
  // because slot.draftAltId/publishedAltId alone can't always tell: editing
  // an already-customized slot further reuses its existing custom_content_
  // items row (see persistAuthoringSelection()'s canReuseExistingCustomRow),
  // so the row's id — and therefore draftAltId — doesn't change even though
  // its content just did. This session-local flag is the accurate signal in
  // that case; reset on a fresh case load (there's no way to recover it from
  // stored data alone once the editor's closed and reopened, since the data
  // model only tracks ids, not per-save content history — see
  // manageContentSlotStatus()'s doc comment).
  draftSavedSincePublish: false,
};
// Which unit's mission list is expanded on the top-level manageContentScreen()
// accordion — a single id (not a Set) so opening one unit always collapses
// whichever was previously open. Transient UI state, never persisted.
let manageContentExpandedUnitId = null;
// In-progress "edit"/"replace" authoring form for the case's one official
// quest slot — null when no form is open. See
// engine/custom-content-authoring.js for the field <-> content-object
// conversion this drives. `previewQuest` (only set once "Preview Changes"/
// "Preview Replacement" has been clicked) holds an ephemeral, never-persisted
// content object built straight from the form's current fields, purely so
// the live in-editor preview can render it — see "preview-authoring-changes"
// in handleManageContentClick().
let manageContentAuthoring = null;
// Ephemeral "Preview as student" session for map (route: "field") cases —
// drops the teacher into the real, walkable field screen instead of a
// bespoke preview card, per CLAUDE.md's standing rule against duplicating
// movement/collision/camera code. Never persisted: entering/exiting only
// ever touches in-memory `progress` fields, restored from `snapshot` on
// exit, and save() below no-ops for the whole session so nothing the
// teacher does while previewing (including real gameplay side effects like
// evidence collection) reaches localStorage or Supabase.
let previewSession = { active: false, snapshot: null };
// Pass 2: Manage Content's three native <dialog>-based overlays (Help drawer,
// unsaved-change warning, read-only full-source viewer) — see
// syncManageContentNativeDialogs()/closeManageContentDialog() below for why
// these are synced imperatively (render() fully replaces app.innerHTML every
// time, so a fresh, always-closed <dialog> node exists after every render;
// only .showModal() actually makes one visible/modal).
let manageContentHelpDrawerOpenFor = null; // a slotKind string ("mcq" etc.), or null
let manageContentViewingFullSourceValue = null; // a "kind:id" pool value, or null
let manageContentFullSourceTriggerSelector = null; // captured at open time, for focus-return on close
// {scenarioKey, onPrimary: fn|null, onSecondary: fn, triggerSelector} or null.
// onPrimary/onSecondary are real closures (never persisted/serialized — this
// is in-memory UI state like previewSession above), so this one dialog stays
// generic across every call site instead of hardcoding a scenario->action
// switch inside the dialog itself. scenarioKey only selects display copy from
// MANAGE_CONTENT_WARNING_SCENARIOS.
let manageContentWarningDialog = null;
// Per-taskId pending/error state for the AI Archive Evaluator calls kicked
// off from sourceReader()/reviewScreen() — see runEvaluation() below.
const evaluatorPendingTaskIds = new Set();
const evaluatorErrors = {};
let gradingUiState = {
  submissionId: null,
  submission: null,
  gradeLabel: "",
  teacherFeedback: "",
  error: "",
};

// Shared async/error-state helper for the teacher screens above
// (teacherUiState/gradingUiState/contentUiState) — every one of their
// loaders/actions only ever needs to stash a human-readable message on
// `.error` on failure and re-render; centralized so each call site doesn't
// hand-roll its own try/catch or `.catch()` for that.
function reportUiError(state, err, fallback) {
  state.error = err?.message || fallback;
}
function catchUiError(state, fallback) {
  return (err) => {
    reportUiError(state, err, fallback);
    render();
  };
}
function feedbackError(state) {
  return state.error
    ? `<p class="feedback error" role="status" aria-live="polite">${esc(state.error)}</p>`
    : "";
}
function feedbackSuccess(state) {
  return state.successMessage
    ? `<p class="feedback success" role="status" aria-live="polite">${esc(state.successMessage)}</p>`
    : "";
}

// --- Chronicle Design System shared markup helpers (Phase 44) ---------
// Thin template-literal builders over the c-* primitives in global.css
// (see docs/architecture/UI-DESIGN-SYSTEM.md). New teacher-screen markup
// should use these instead of hand-rolling button/field/chip HTML;
// existing teacher screens are migrated onto them incrementally. Gameplay
// screens keep their existing hand-written markup — this is a
// teacher-surface primitive set, not a gameplay one.

const BTN_VARIANT_CLASS = {
  primary: "btn-gold",
  secondary: "btn-outline",
  tertiary: "btn-plain",
  danger: "btn-danger",
  dev: "btn-outline btn-dev",
};

// { label, labelHtml: raw HTML in place of the escaped label (e.g. an
//   embedded <span>), action, href: renders an <a> instead of a <button>
//   (opens in a new tab — every current use is an external link),
//   variant: primary|secondary|tertiary|danger|dev, disabled, type,
//   attrs: extra raw HTML attributes (e.g. data-*) }
function btn({
  label,
  labelHtml,
  action,
  href,
  variant = "secondary",
  disabled = false,
  type = "button",
  attrs = "",
}) {
  const variantClass = BTN_VARIANT_CLASS[variant] || variant;
  const content = labelHtml || esc(label);
  if (href) {
    return `<a class="btn ${variantClass}" href="${esc(href)}" target="_blank" rel="noopener noreferrer" ${attrs}>${content}</a>`;
  }
  return `<button class="btn ${variantClass}" data-action="${esc(action)}" type="${esc(type)}" ${disabled ? "disabled" : ""} ${attrs}>${content}</button>`;
}

const CHIP_TONE_CLASS = {
  default: "",
  gold: "c-chip--gold",
  success: "c-chip--success",
  warning: "c-chip--warning",
  error: "c-chip--error",
  muted: "c-chip--muted",
};

// A shared badge/status primitive — status is conveyed by the label text
// plus shape, never by color alone. { label, tone, live: adds
// role="status" aria-live="polite" for dynamically-updating chips. }
function chip({ label, tone = "default", live = false }) {
  const toneClass = CHIP_TONE_CLASS[tone] || "";
  const liveAttrs = live ? ' role="status" aria-live="polite"' : "";
  return `<span class="c-chip ${toneClass}"${liveAttrs}>${esc(label)}</span>`;
}

// A labeled form field with visible label (never placeholder-only),
// required/optional indicator beside the label, muted help text, and an
// error message wired via aria-describedby + aria-invalid rather than
// color alone. { ...as before, plus: placeholder, autocomplete,
//   attrs: extra raw HTML attributes (e.g. min/max/data-*),
//   control: raw HTML rendered in place of the default input/textarea
//     (e.g. passwordFieldMarkup(id, ...)) — still gets the label/help/
//     error wrapper, but fieldMarkup doesn't own the control's markup,
//     select: [{value, label}] renders a <select> instead of an <input> }
function fieldMarkup({
  id,
  label,
  type = "text",
  value = "",
  help,
  required,
  optional,
  error,
  textarea = false,
  rows,
  placeholder,
  autocomplete,
  attrs = "",
  control,
  select,
}) {
  const requirement = required
    ? '<span class="c-label-hint">Required</span>'
    : optional
      ? '<span class="c-label-hint">Optional</span>'
      : "";
  const describedBy = [help && `${id}-help`, error && `${id}-error`].filter(Boolean);
  const describedByAttr = describedBy.length ? ` aria-describedby="${describedBy.join(" ")}"` : "";
  const invalidAttr = error ? ' aria-invalid="true"' : "";
  const placeholderAttr = placeholder ? ` placeholder="${esc(placeholder)}"` : "";
  const autocompleteAttr = autocomplete ? ` autocomplete="${esc(autocomplete)}"` : "";
  const inputControl = control
    ? control
    : select
      ? `<select class="c-select" id="${esc(id)}"${describedByAttr}${invalidAttr} ${attrs}>${select
          .map(
            (opt) =>
              `<option value="${esc(opt.value)}"${opt.value === value ? " selected" : ""}>${esc(opt.label)}</option>`
          )
          .join("")}</select>`
      : textarea
        ? `<textarea class="c-textarea" id="${esc(id)}" ${rows ? `rows="${rows}"` : ""}${placeholderAttr}${autocompleteAttr}${describedByAttr}${invalidAttr} ${attrs}>${esc(value)}</textarea>`
        : `<input class="c-input" id="${esc(id)}" type="${esc(type)}" value="${esc(value)}"${placeholderAttr}${autocompleteAttr}${describedByAttr}${invalidAttr} ${attrs}>`;
  return `<div class="c-field">
<div class="c-field-label-row"><label class="c-label" for="${esc(id)}">${esc(label)}</label>${requirement}</div>
${inputControl}
${help ? `<p class="c-help" id="${esc(id)}-help">${esc(help)}</p>` : ""}
${error ? `<p class="c-error-text" id="${esc(id)}-error" role="alert">${esc(error)}</p>` : ""}
</div>`;
}

function emptyState({ title, body, action }) {
  return `<div class="c-empty">${title ? `<strong>${esc(title)}</strong>` : ""}${body ? `<span>${esc(body)}</span>` : ""}${action ? btn(action) : ""}</div>`;
}

function loadingNote(text) {
  return `<p class="c-loading" role="status" aria-live="polite">${esc(text)}</p>`;
}

// { eyebrow, title, description, status: a chip() options object,
//   actions: an array of btn() options objects, breadcrumb: raw HTML }
function pageHeaderMarkup({ eyebrow, title, description, status, actions = [], breadcrumb = "" }) {
  return `${breadcrumb}<div class="c-page-header">
<div>${eyebrow ? `<p class="c-eyebrow">${esc(eyebrow)}</p>` : ""}<h1 class="c-page-title">${esc(title)}</h1>${description ? `<p class="c-page-description">${esc(description)}</p>` : ""}</div>
<div class="c-page-actions">${status ? chip(status) : ""}${actions.map(btn).join("")}</div>
</div>`;
}

function sectionHeadMarkup({ title, description, actions = [] }) {
  return `<div class="c-section-head">
<div><h2 class="c-section-title">${esc(title)}</h2>${description ? `<p class="c-section-description">${esc(description)}</p>` : ""}</div>
${actions.length ? `<div class="c-toolbar">${actions.map(btn).join("")}</div>` : ""}
</div>`;
}

onAuthStateChange((_event, session) => {
  if (!session) {
    currentProfile = null;
    return;
  }
  getProfile().then((profile) => {
    currentProfile = profile;
    if (profile?.role === "teacher") {
      loadTeacherDashboardData();
    } else {
      hydrateRemoteProgress(progress).then((resolved) => {
        if (resolved) {
          progress = resolved;
          render();
        }
      });
      initTeacherOverridesForCurrentUser().then(() => render());
      hydrateTeacherModeForStudent();
      render();
    }
  });
});
getSession().then((session) => {
  if (!session) return;
  getProfile().then((profile) => {
    currentProfile = profile;
    if (profile?.role === "teacher") {
      loadTeacherDashboardData();
    } else {
      hydrateRemoteProgress(progress).then((resolved) => {
        if (resolved) {
          progress = resolved;
          render();
        }
      });
      initTeacherOverridesForCurrentUser().then(() => render());
      hydrateTeacherModeForStudent();
      render();
    }
  });
});
let showMainMenu = true;
// "root" | "student" — sub-state within the landing screen only; Teacher routes straight
// into the existing "login" screen via open-teacher-login, so it needs no landing sub-state.
let landingMode = "root";

const bootEntryParam = new URLSearchParams(window.location.search).get("entry");
if (bootEntryParam === "join" || bootEntryParam === "teacher-login") {
  showMainMenu = false;
  progress.currentScreen = bootEntryParam === "join" ? "join" : "login";
  saveProgress(progress);
}

// The tour finished, which is what every warp past the Entrance Hall assumes.
const WARP_TOUR_DONE = { tutorial: { step: "complete", completed: true, skipped: false } };
const WARP_CASE_ONE = { activeCaseId: "case-001", selectedCaseId: "case-001" };
/**
 * Dev-only fast travel: `?warp=<name>` boots straight into a named save state.
 *
 * For the part-by-part playtest program (`docs/playtest/PLAYTHROUGH-LEDGER.md`), where a review pass
 * has to start where it starts. Checking anything past Chronotravel otherwise costs the whole intro,
 * the escort, the tour and a case selection first — which means it gets checked once and then never
 * re-checked, and a script nobody re-runs is not coverage.
 *
 * These are the same shapes `tests/e2e/helpers/progress-seed.js` already seeds; this only puts them
 * in reach of a human. Adding one is a line in the table — a warp is a save state, not a code path.
 *
 * Gated on `import.meta.env.DEV`, exactly as the "dev-fake-teacher" shortcut is, and deliberately so:
 * it resets the save, which is not something a student's URL should ever be able to do.
 */
const DEV_WARPS = {
  intro: { currentScreen: "intro-welcome" },
  hall: { currentScreen: "institute", currentHubRoom: "hallway" },
  hub: { currentScreen: "institute", currentHubRoom: "main", ...WARP_TOUR_DONE },
  table: { currentScreen: "archive", ...WARP_TOUR_DONE },
  field: { currentScreen: "field", ...WARP_CASE_ONE, ...WARP_TOUR_DONE },
  // Straight onto the interview's board, past its Mission Instructions. `ensureSourceActivity()`
  // fills in the engine's own default state, so the flag alone is the whole seed.
  mission: {
    currentScreen: "interview",
    activeActivitySourceId: "taino-context",
    sourceActivities: { "taino-context": { briefed: true } },
    ...WARP_CASE_ONE,
    ...WARP_TOUR_DONE,
  },
};
function applyDevWarp() {
  if (!import.meta.env.DEV) return;
  const name = new URLSearchParams(window.location.search).get("warp");
  if (!name) return;
  if (!DEV_WARPS[name]) {
    console.warn(`[warp] no state named "${name}". Try: ${Object.keys(DEV_WARPS).join(", ")}`);
    return;
  }
  // A named state, not a patch over whatever was already saved — a script that quietly starts from
  // last session's leftovers is not exercising the state it claims to.
  progress = resetProgress();
  showMainMenu = false;
  // Both clear held keys and stop the hub movement loop, so a warp cannot land mid-walk.
  if (name === "hall") enterHallwayRoom();
  else safeInstituteSpawn();
  // After the spawn helpers, which write `currentHubRoom` themselves — the warp's own value wins.
  Object.assign(progress, DEV_WARPS[name]);
  // And after the assign, because it reads the active case to find the map to spawn on.
  resetFieldPosition();
  saveProgress(progress);
}
let briefingStep = 0;
let activeTravelTimeout = null;
// Director intro scene (intro-welcome/intro-briefing/intro-protocol) typewriter state.
// introLineIndex tracks position within the current step's body-line array; introSeenSteps
// is runtime-only (not persisted to progress) so a step only ever types out once per session
// — revisiting via "Previous message" shows it fully complete instantly.
let introLineIndex = 0;
let introTypewriterTimer = null;
const introSeenSteps = new Set();
// Set right before the Entrance Hall hands off to the Main Hall so instituteMainRoomScreen() renders
// one frame with the fade overlay at full opacity, then render()'s institute requestAnimationFrame
// block removes .is-active so it transitions back to 0 (a fade-in cut).
let enterMainHallFromBlack = false;
// Ambient decoration on the director intro screens (seal/HUD readouts + drifting phrase layer) —
// purely cosmetic, independent of dialogue/typewriter state, so it gets its own start/stop loop
// (see startDirectorSceneDecor()) rather than piggybacking on the typewriter's per-step timers.
let directorClockInterval = null;
let directorClockStartedAt = 0;
let directorPhraseTimers = [];
// Mini-games (Storm Navigation, Cargo Sorting) are a pacing/reward layer, not
// save-relevant progress — their in-run state lives here, outside `progress`,
// the same way field/hub movement state does. Only Storm Navigation's best
// score is persisted (see progress.miniGameScores).
let activeMiniGame = null; // null | "storm-navigation" | "cargo-sorting"
let stormNavigationState = null;
let cargoSortingState = null;
let miniGameMoveFrame = null;
let miniGameLastTickAt = 0;
// Storm Navigation's continuous steering (see steerShip in mini-games/storm-navigation.js)
// reads held keys/pointer input the same way field/hub movement do (fieldHeldKeys/
// hubHeldKeys above) rather than moving the ship a fixed amount per keypress/click.
const stormHeldKeys = new Set();
const STORM_MOVE_KEYS = {
  arrowleft: -1,
  a: -1,
  arrowright: 1,
  d: 1,
  "storm-pointer-left": -1,
  "storm-pointer-right": 1,
};
let activeStormPointerKey = null;
function stormHeldVector() {
  let direction = 0;
  stormHeldKeys.forEach((key) => {
    const dir = STORM_MOVE_KEYS[key];
    if (dir !== undefined) direction += dir;
  });
  return Math.max(-1, Math.min(1, direction));
}

function sceneForMusic() {
  if (progress.currentScreen === "field")
    // The outdoor map's scene, deliberately, even when the player is inside one of its rooms:
    // stepping through a doorway should not restart the track. An interior declares no musicScene
    // of its own for exactly that reason.
    return progress.activeFieldNpc ? "dialogue" : activeFieldOutdoorMap().musicScene;
  if (
    progress.currentScreen === "institute" ||
    progress.currentScreen === "archive" ||
    // Every activity engine, not just the jigsaw this line used to name: all four are desk work
    // on a record, and they share the Archive's track for the same reason it did.
    isActivityEngine(progress.currentScreen) ||
    progress.currentScreen === "mini-games"
  )
    return "archive";
  if (progress.currentScreen === "upload") return "upload";
  if (progress.currentScreen === "return-warp") return "quiet";
  return "quiet";
}
const UNITS = [UNIT_01, UNIT_02, UNIT_03, UNIT_04, UNIT_05];
const UNIT_SOURCES = {
  "case-001": CASE_001_SOURCES,
  "case-004": CASE_004_SOURCES,
  "case-007": CASE_007_SOURCES,
  "case-010": CASE_010_SOURCES,
  "case-013": CASE_013_SOURCES,
};
const PRACTICE_CHECK_QUESTS = {
  "case-001": {
    mcq: UNIT_01_MCQ_QUESTS,
    sequencing: UNIT_01_SEQUENCING_QUESTS,
    evidenceOrganizing: UNIT_01_EVIDENCE_ORGANIZING_QUESTS,
    hipp: UNIT_01_SOURCE_ANALYSIS_QUESTS,
  },
  "case-004": {
    mcq: UNIT_02_MCQ_QUESTS,
    sequencing: UNIT_02_SEQUENCING_QUESTS,
    evidenceOrganizing: UNIT_02_EVIDENCE_ORGANIZING_QUESTS,
    hipp: UNIT_02_SOURCE_ANALYSIS_QUESTS,
  },
  "case-007": {
    mcq: UNIT_03_MCQ_QUESTS,
    sequencing: UNIT_03_SEQUENCING_QUESTS,
    evidenceOrganizing: UNIT_03_EVIDENCE_ORGANIZING_QUESTS,
    hipp: UNIT_03_SOURCE_ANALYSIS_QUESTS,
  },
  "case-010": {
    mcq: UNIT_04_MCQ_QUESTS,
    sequencing: UNIT_04_SEQUENCING_QUESTS,
    evidenceOrganizing: UNIT_04_EVIDENCE_ORGANIZING_QUESTS,
    hipp: UNIT_04_SOURCE_ANALYSIS_QUESTS,
  },
  "case-013": {
    mcq: UNIT_05_MCQ_QUESTS,
    sequencing: UNIT_05_SEQUENCING_QUESTS,
    evidenceOrganizing: UNIT_05_EVIDENCE_ORGANIZING_QUESTS,
    hipp: UNIT_05_SOURCE_ANALYSIS_QUESTS,
  },
};
// Quest content for both kinds of authored challenge, resolved by
// (questType, questId): a case's own `archiveChallenge` pointer — which
// missionScreen() renders as that case's whole mission — and a unit's
// `archiveChallenges[]`, which archiveChallengesScreen() renders in the Archive
// Room. Grouped by quest type because both mix types freely.
//
// Phase 58 sorted which type belongs where. Missions use the four
// teacher-swappable types (mcq, sequencing, evidence-organizing, hipp); the
// Archive Room holds the AP writing work (saq, dbq) for all three units.
const ARCHIVE_CHALLENGE_QUESTS_BY_TYPE = {
  "evidence-organizing": [
    ...UNIT_02_ARCHIVE_CHALLENGE_QUESTS,
    ...UNIT_01_ARCHIVE_EVIDENCE_QUESTS,
    ...UNIT_03_ARCHIVE_CHALLENGE_QUESTS,
    ...UNIT_05_ARCHIVE_EVIDENCE_QUESTS,
  ],
  sequencing: [
    ...UNIT_01_ARCHIVE_CHALLENGE_QUESTS,
    ...UNIT_02_ARCHIVE_SEQUENCING_QUESTS,
    ...UNIT_04_ARCHIVE_SEQUENCING_QUESTS,
    ...UNIT_05_ARCHIVE_SEQUENCING_QUESTS,
  ],
  mcq: [...UNIT_02_ARCHIVE_STRONGEST_EVIDENCE_QUESTS, ...UNIT_03_ARCHIVE_MCQ_QUESTS],
  saq: [
    ...UNIT_01_ARCHIVE_SAQ_QUESTS,
    ...UNIT_02_ARCHIVE_SAQ_QUESTS,
    ...UNIT_03_ARCHIVE_SAQ_QUESTS,
    ...UNIT_04_ARCHIVE_SAQ_QUESTS,
    ...UNIT_05_ARCHIVE_SAQ_QUESTS,
  ],
  dbq: [
    ...UNIT_03_ARCHIVE_DBQ_QUESTS,
    ...UNIT_04_ARCHIVE_DBQ_QUESTS,
    ...UNIT_05_ARCHIVE_DBQ_QUESTS,
  ],
  // Unit 4's case-012 is the first mission in the game whose quest is a hipp — see the header of
  // content/quests/unit-04-quests.js. Missions resolve through this same table, so the type needed
  // a key here as well as in INVESTIGATION_QUESTS_BY_TYPE below.
  hipp: UNIT_04_ARCHIVE_SOURCE_ANALYSIS_QUESTS,
};
// Returns {questType, quest} rather than just the content — a published
// teacher-authored replacement can be a genuinely different quest type than
// the official slot it replaces (see resolveQuestSlotWithType()'s doc
// comment), so the type actually used to render/grade this challenge has to
// come back from resolution, not stay fixed at the caller's questType.
function archiveChallengeQuestFor(questType, questId) {
  const official = (ARCHIVE_CHALLENGE_QUESTS_BY_TYPE[questType] || []).find(
    (quest) => quest.id === questId
  );
  return official ? resolveQuestSlotWithType(questType, official) : undefined;
}
// Investigation Challenge quest content, resolved by (questType, questId) from a
// source's source.investigationMode/investigationQuestId pointer (source.schema.js).
// Mirrors ARCHIVE_CHALLENGE_QUESTS_BY_TYPE's shape — see that constant's comment.
const INVESTIGATION_QUESTS_BY_TYPE = {
  hipp: UNIT_03_INVESTIGATION_QUESTS,
  mcq: [...UNIT_01_INVESTIGATION_MCQ_QUESTS, ...UNIT_03_INVESTIGATION_MCQ_QUESTS],
  sequencing: UNIT_01_INVESTIGATION_SEQUENCING_QUESTS,
  "evidence-organizing": UNIT_02_INVESTIGATION_EVIDENCE_QUESTS,
};
function investigationQuestFor(questType, questId) {
  return (INVESTIGATION_QUESTS_BY_TYPE[questType] || []).find((quest) => quest.id === questId);
}
// Reader questions: the alternative to sourceReader()'s written "initial reading" for a
// record whose activity has already done the thinking. A source that carries
// readerQuestType/readerQuestIds answers a short set of multiple-choice items instead of
// writing a paragraph, because "file the record" followed by a paragraph box is two endings
// for one activity — see docs/decision-log/0052. Opt-in per source; the other 22 records in
// the game are untouched and keep the Archive Evaluator.
//
// One flat pool per quest type across all units, the same shape as the quest lookups above —
// readerQuestsFor() resolves by id, and ids are globally unique (validate:content enforces it).
const READER_QUESTS_BY_TYPE = {
  mcq: [...UNIT_01_READER_MCQ_QUESTS, ...UNIT_02_READER_MCQ_QUESTS],
};
function readerQuestsFor(source) {
  const questType = source?.readerQuestType;
  const ids = source?.readerQuestIds;
  if (!questType || !Array.isArray(ids)) return [];
  const pool = READER_QUESTS_BY_TYPE[questType] || [];
  return ids
    .map((id) => pool.find((quest) => quest.id === id))
    .filter(Boolean)
    .map((quest) => resolveQuestSlot(questType, quest));
}
// gradeQuest()'s result shape differs by quest type — investigationScreen()/
// archiveChallengesScreen()/practiceCheckScreen() all need one completion/
// answered/hint signal that works across all four without re-deriving it
// per call site; questAnsweredAny/isQuestComplete/questPartialSuccess/
// questHint (from ./quest-types/index.js) are that shared contract — each
// quest-type module now owns its own answered/complete/hint logic instead of
// main.js branching on questType by hand in two places that used to disagree
// (see docs/architecture/FOCUSED-UI-AND-MECHANICS-REUSE-AUDIT.md §3).
const unitById = (id) => UNITS.find((unit) => unit.id === id);
const unitForCase = (caseId) => UNITS.find((unit) => unit.cases.some((c) => c.id === caseId));
const caseById = (id) => {
  for (const unit of UNITS) {
    const found = unit.cases.find((item) => item.id === id);
    if (found) return found;
  }
  return undefined;
};
// Teacher Mode swap resolution: resolveSourceSlot is a no-op whenever no
// classroom customization is active, so official content renders unchanged
// by default — see remote-content-selection-repository.js.
export const sourcesForCase = (caseId) => (UNIT_SOURCES[caseId] || []).map(resolveSourceSlot);
export const sourceById = (id) => {
  const official =
    CASE_001_SOURCES.find((item) => item.id === id) ||
    CASE_004_SOURCES.find((item) => item.id === id) ||
    CASE_007_SOURCES.find((item) => item.id === id) ||
    CASE_010_SOURCES.find((item) => item.id === id) ||
    CASE_013_SOURCES.find((item) => item.id === id);
  return official ? resolveSourceSlot(official) : undefined;
};
// Author Mode unlocks every unit/case for design navigation without touching the save.
const isUnlocked = (id) => authorMode || progress.unlocked.includes(id);
const isComplete = (id) => progress.completedCases.includes(id);
const evidenceFor = (id) => progress.caseEvidence[id] || [];
const hasEvidence = (caseId, sourceId) => evidenceFor(caseId).includes(sourceId);
const countEvidence = (caseId) => evidenceFor(caseId).length;
const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
// Guarded by previewSession so a teacher exploring the real field screen in
// "Preview as student" mode (see manageContentCaseScreen()) never persists
// anything to the teacher's own save — see previewSession's own comment.
const save = () => {
  if (isPreviewingContent()) return;
  saveProgress(progress);
};

// Upserts each of a graded quest's skill-mastery outcomes (see
// quest-types/index.js's questSkillOutcomes()) into progress.skillMastery,
// keyed by outcome.key. Safe to call on every render of a graded quest
// (screens here re-grade on every render — no separate "submit" step,
// per archiveChallengeQuestCard()'s own doc comment) because it's a no-op
// unless an outcome actually changed since last recorded — comparing first
// avoids both double-saving on every unrelated re-render and the
// off-my-own-precedent persistence bug archiveChallengeQuestCard() had for
// unit-level bonus challenges (see that function's own save() comment).
function recordSkillOutcomes(questType, quest, state, result) {
  if (isPreviewingContent() || !quest) return;
  let changed = false;
  questSkillOutcomes(questType, quest, state, result).forEach((outcome) => {
    if (!outcome.skillCategory) return;
    const correct = !!outcome.correct;
    const existing = progress.skillMastery[outcome.key];
    if (
      existing &&
      existing.skillCategory === outcome.skillCategory &&
      existing.correct === correct
    ) {
      return;
    }
    progress.skillMastery[outcome.key] = {
      skillCategory: outcome.skillCategory,
      correct,
      questType,
      updatedAt: new Date().toISOString(),
    };
    changed = true;
  });
  if (changed) save();
}

// Exactly 3 real, distinguishable version labels — deliberately not a 4th
// "current student version": Published *is* the current student version by
// definition (classroom_content_selections.status is a real, DB-enforced,
// RLS-checked draft/published split — see remote-content-selection-
// repository.js — with no further state beyond those two), so a 4th label
// would either silently duplicate "Published version" or fabricate a
// distinction the data model can't back. "Your unsaved edits" is its own
// real, separate state: manageContentAuthoring.previewQuest only exists for
// the "Preview Changes"/"Preview Replacement" path, built straight from the
// open form's current, never-persisted fields (see preview-authoring-changes
// above) — not resolved from either cache.
// Explicit params (rather than reading manageContentAuthoring/previewSession
// directly) so this stays a plain, directly testable function — see
// manageContentSlotStatus()'s doc comment for the same convention, and
// tests/unit/main-content-preview-resolution.test.js.
export function contentPreviewVersionLabel(hasUnsavedPreviewQuest, resolution) {
  if (hasUnsavedPreviewQuest) return "Your unsaved edits";
  return resolution === "published" ? "Published version" : "Draft version";
}

function contentPreviewBannerMarkup() {
  const kase = caseById(contentUiState.selectedCaseId);
  const title = kase ? resolvedCaseTitle(kase) : "";
  const versionLabel = contentPreviewVersionLabel(
    Boolean(manageContentAuthoring?.previewQuest),
    previewSession.resolution
  );
  return `<div class="field-preview-banner" role="status">
<span>Previewing as student${title ? ` — ${esc(title)}` : ""}</span>
<span aria-hidden="true">·</span>
<span class="field-preview-banner-version">${esc(versionLabel)}</span>
<span aria-hidden="true">·</span>
<span>Nothing you do here affects student progress.</span>
<button class="btn btn-outline" data-action="exit-content-preview" type="button">Exit preview</button>
</div>`;
}

function chrome() {
  const previewBanner = isPreviewingContent() ? contentPreviewBannerMarkup() : "";
  return `<header class="chrome"><button class="brand" data-action="home" aria-label="Return to Chronicle Institute"><span class="brand-mark">✦</span><span><small>${esc(BRAND.engine)}</small><strong>${esc(BRAND.campaign)}</strong></span></button><div class="chrome-right"><span class="link-status"><i></i>${esc(BRAND.status)}</span><button class="text-button" data-action="open-main-menu">Menu</button><button class="audio-toggle ${isAudioEnabled() ? "is-on" : ""}" data-action="toggle-audio" aria-label="Toggle Chronicle music">♫ ${isAudioEnabled() ? "Music on" : "Music off"}</button><button class="author-toggle ${authorMode ? "active" : ""}" data-action="author">✦ ${authorMode ? "Author Mode On" : "Author Mode"}</button></div></header>${previewBanner}`;
}

// Stable-key convention for Author Mode content overrides: keyed by the
// content object's own `id` (never a visible title) + a fixed field name.
// See docs/teacher-mode/MINIMAL-LOCAL-OVERRIDES.md.
const AUTHOR_COPY_FIELDS = {
  "unit-title": { contentId: UNIT_01.id, fieldName: "title" },
  "unit-question": { contentId: UNIT_01.id, fieldName: "centralQuestion" },
};

export function resolvedUnitTitle(unit) {
  return resolveTeacherOverride(unit.id, "title", unit.title);
}
export function resolvedUnitCentralQuestion(unit) {
  return resolveTeacherOverride(unit.id, "centralQuestion", unit.centralQuestion);
}

// A case's title is "Case N.NN — Name" for case-001/002/003 only — later
// units drop the numbering (e.g. "The Riverbend Settlement"). The prefix
// (if present) is never editable; only the descriptive name after it is, via
// the same generic teacher-override store unit titles already use.
const CASE_TITLE_PREFIX_RE = /^(Case\s+\d+\.\d+\s*—\s*)/;
function splitCaseTitle(kase) {
  const m = kase.title.match(CASE_TITLE_PREFIX_RE);
  return m
    ? { prefix: m[1], name: kase.title.slice(m[1].length) }
    : { prefix: "", name: kase.title };
}
function resolvedCaseTitle(kase) {
  return splitCaseTitle(kase).prefix + resolvedCaseName(kase);
}
// The mission's *name* on its own — "The Exchange Ledger", not "Case 1.02 — The Exchange Ledger",
// and rename-aware like resolvedCaseTitle(). Phase 59: one mission has one name, and this is it.
// Before, a single mission answered to four strings on one screen — its shortTitle on the map
// marker ("Atlantic Routes"), its title in the route panel, and its mechanic in both the chip and
// the primary button ("Open Atlantic Route Puzzle") — while the teacher's Manage Content wizard
// called it a fifth thing. Student-facing names now all come from here or resolvedCaseTitle();
// `mechanic` survives only as teacher-side help text (caseKindDetail()).
function resolvedCaseName(kase) {
  return resolveTeacherOverride(kase.id, "title", splitCaseTitle(kase).name);
}
// "Case 1.02" — the numbered half, with the trailing em dash trimmed. Empty for a case whose title
// carries no number (units 2 and 3 drop the numbering), so every call site needs a fallback.
function caseNumberLabel(kase) {
  return splitCaseTitle(kase)
    .prefix.replace(/\s*—\s*$/, "")
    .trim();
}

// Per-classroom Navigation Table visibility (Phase 48C) — default visible,
// same string-valued override system title/centralQuestion already use
// rather than a content-authored global default (see unit.schema.js's
// CaseSchema comment for why this has no content field of its own).
function resolvedNavTableVisible(kase) {
  return resolveTeacherOverride(kase.id, "navTableVisible", "true") !== "false";
}

function authorPanel() {
  if (!authorMode || !authorPanelOpen) return "";
  const anyOverride = Object.values(AUTHOR_COPY_FIELDS).some(({ contentId, fieldName }) =>
    hasTeacherOverride(contentId, fieldName)
  );
  return `<aside class="author-panel"><button class="close-author" data-action="close-author-panel" aria-label="Close Author Mode panel">×</button><p class="kicker">Development-only controls</p><h2>Author Mode</h2><p>Adjust front-facing copy without touching route rules, answer keys, historical metadata, or progression.</p><p class="author-note">Design navigation: while Author Mode is on, every unit and case is unlocked on the Navigation Table so you can move between them freely. Your save is not modified. Closing this panel keeps Author Mode on — click the header button again to exit it.</p><label class="author-panel-toggle"><input type="checkbox" data-setting="mini-games" ${progress.settings.miniGamesEnabled ? "checked" : ""}><span>Show Practice Check mini games in the field</span></label><label>Unit title${hasTeacherOverride(UNIT_01.id, "title") ? ' <span class="author-override-flag">edited</span>' : ""}<input data-copy="unit-title" value="${esc(resolvedUnitTitle(UNIT_01))}"></label><label>Unit question${hasTeacherOverride(UNIT_01.id, "centralQuestion") ? ' <span class="author-override-flag">edited</span>' : ""}<textarea data-copy="unit-question">${esc(resolvedUnitCentralQuestion(UNIT_01))}</textarea></label><label>Student name<input data-profile="name" value="${esc(progress.profile.name)}"></label>${anyOverride ? '<button class="text-button" type="button" data-action="reset-author-overrides">Reset content overrides to official text</button>' : ""}<p class="author-note">Content edits save to this browser and are restored on refresh. Exportable content management comes later; the permanent source records live in <code>src/content</code>.</p></aside>`;
}

const STUDENT_SOLO_ITEMS = [
  { action: "start-new-game", label: "Start New Game", variant: "btn-gold", enabled: () => true },
  {
    action: "continue-game",
    label: "Load Save",
    variant: "btn-outline",
    enabled: () => hasSavedProgress(),
    disabledHint: "No saved Chronicle found yet.",
  },
];

function mainMenuItemMarkup(item) {
  const enabled = item.enabled();
  return `<div class="main-menu-item"><button class="btn ${item.variant}" data-action="${item.action}" ${enabled ? "" : "disabled"}>${esc(item.label)}</button>${!enabled && item.disabledHint ? `<p class="kicker">${esc(item.disabledHint)}</p>` : ""}</div>`;
}

function mainMenuScreen() {
  if (landingMode === "student") {
    return `<main class="shell completion-shell landing-shell"><section>
<p class="kicker">${esc(BRAND.engine)}</p>
<h1>${esc(BRAND.campaign)}</h1>
<div class="landing-option-group">
<p class="kicker">Have a classroom code?</p>
<button class="btn btn-gold" data-action="open-join-screen" type="button">Join a Classroom →</button>
</div>
<div class="landing-option-group">
<p class="kicker">Just playing on your own?</p>
<div class="completion-actions">${STUDENT_SOLO_ITEMS.map(mainMenuItemMarkup).join("")}</div>
</div>
<button class="btn btn-outline" data-action="landing-back" type="button">← Back</button>
</section></main>`;
  }
  return `<main class="shell completion-shell landing-shell"><section><p class="kicker">${esc(BRAND.engine)}</p><h1>${esc(BRAND.campaign)}</h1><p>An AP U.S. History Adventure</p><div class="landing-choice-row"><button class="btn btn-gold" data-action="landing-student" type="button">Student</button><button class="btn btn-outline" data-action="open-teacher-login" type="button">Teacher</button></div></section></main>`;
}

// --- Real accounts screens (join/login/teacher-dashboard/grading) ---------
// Additive to the existing screen-routing pattern: each is a normal
// VALID_SCREENS entry rendered by render()'s switch, dispatched by a normal
// CLICK_HANDLER_GROUPS entry (handleAuthScreenClick, below). None of this
// touches movement/collision/camera/dialogue code.

// Reusable show/hide password field. The toggle button mutates the input's `type`
// directly (see handleAuthScreenClick's "toggle-password-visibility" branch) rather than
// going through render(), since these auth fields are uncontrolled inputs read via
// document.getElementById(...).value at submit time — a render() here would wipe
// whatever the user has already typed.
function passwordFieldMarkup(id, placeholder, value = "") {
  return `<div class="password-field"><input class="c-input" id="${esc(id)}" type="password" placeholder="${esc(placeholder)}" value="${esc(value)}" autocomplete="off"><button class="password-toggle" type="button" data-action="toggle-password-visibility" data-target="${esc(id)}" aria-pressed="false">Show</button></div>`;
}

// Quiet pill-style tab switcher for the auth screens (Sign In / Create
// Account, First time / Returning) — reuses .unit-tab's existing look
// (already used by the dashboard's own tab bar) instead of two full
// .btn-gold/.btn-outline buttons competing with the real primary action
// below the form.
function authTabsMarkup(tabs) {
  return `<div class="auth-tabs" role="tablist">${tabs
    .map(
      ({ label, action, selected }) =>
        `<button type="button" class="text-button unit-tab ${selected ? "is-selected" : ""}" role="tab" aria-selected="${selected}" data-action="${esc(action)}">${esc(label)}</button>`
    )
    .join("")}</div>`;
}

function joinScreen() {
  const isClaim = authUiState.studentTab !== "signin";
  return `${chrome()}<main class="shell completion-shell auth-shell c-app"><section>
${pageHeaderMarkup({
  eyebrow: BRAND.engine,
  title: "Join a Classroom",
  description: isClaim
    ? "First time joining? Your teacher gave you a classroom code and a student ID — claim your seat and set a password."
    : "Already claimed your seat? Sign back in with your classroom code, student ID, and password.",
})}
${authTabsMarkup([
  { label: "First time", action: "student-tab-claim", selected: isClaim },
  { label: "Returning", action: "student-tab-signin", selected: !isClaim },
])}
${fieldMarkup({ id: "join-classroom-code", label: "Classroom code", placeholder: "e.g. FOX7K2", autocomplete: "off" })}
${fieldMarkup({ id: "join-student-id", label: "Your student ID", placeholder: "e.g. 07", autocomplete: "off" })}
${isClaim ? fieldMarkup({ id: "join-display-name", label: "Display name", optional: true, placeholder: "How your teacher sees you", autocomplete: "off" }) : ""}
${fieldMarkup({ id: "join-password", label: "Password", control: passwordFieldMarkup("join-password", "••••••••") })}
${feedbackError(authUiState)}
<button class="btn btn-gold" data-action="${isClaim ? "submit-join-claim" : "submit-join-signin"}" type="button" ${authUiState.pending ? "disabled" : ""}>${authUiState.pending ? "Please wait…" : isClaim ? "Claim my seat →" : "Sign in →"}</button>
<button class="back-link" data-action="open-main-menu" type="button">← Back</button>
</section></main>${authorPanel()}`;
}

function loginScreen() {
  const isSignIn = authUiState.teacherTab !== "signup";
  if (isSignIn) {
    return `${chrome()}<main class="shell completion-shell auth-shell c-app"><section>
${pageHeaderMarkup({ eyebrow: BRAND.engine, title: "Teacher Sign In" })}
${authTabsMarkup([
  { label: "Sign In", action: "teacher-tab-signin", selected: true },
  { label: "Create Account", action: "teacher-tab-signup", selected: false },
])}
${fieldMarkup({ id: "teacher-email", label: "Email", type: "email", placeholder: "you@school.edu", autocomplete: "off" })}
${fieldMarkup({ id: "teacher-password", label: "Password", control: passwordFieldMarkup("teacher-password", "••••••••") })}
${authUiState.info ? `<p class="feedback" role="status" aria-live="polite">${esc(authUiState.info)}</p>` : ""}
${feedbackError(authUiState)}
<button class="btn btn-gold" data-action="submit-teacher-signin" type="button" ${authUiState.pending ? "disabled" : ""}>${authUiState.pending ? "Please wait…" : "Sign In →"}</button>
<button class="btn btn-outline" data-action="continue-with-google" type="button" ${authUiState.pending ? "disabled" : ""}>Continue with Google</button>
${import.meta.env.DEV ? btn({ label: "🧪 Dev: Fake Teacher", action: "dev-fake-teacher", variant: "dev", disabled: authUiState.pending }) : ""}
<button class="back-link" data-action="open-main-menu" type="button">← Back</button>
</section></main>${authorPanel()}`;
  }
  if (authUiState.signupStep === 2) {
    const rows = authUiState.classroomRows
      .map(
        (row, i) => `<div class="classroom-setup-row">
${fieldMarkup({
  id: `signup-classroom-row-name-${i}`,
  label: `Classroom ${i + 1} name`,
  value: row.name,
  autocomplete: "off",
  attrs: `data-classroom-row-name data-row-index="${i}"`,
})}
${fieldMarkup({
  id: `signup-classroom-row-count-${i}`,
  label: "Students",
  type: "number",
  value: row.studentCount,
  attrs: `data-classroom-row-count data-row-index="${i}" min="1" max="200"`,
})}
</div>`
      )
      .join("");
    return `${chrome()}<main class="shell completion-shell auth-shell c-app"><section>
${pageHeaderMarkup({
  eyebrow: `${BRAND.engine} · Step 2 of 2`,
  title: "Set Up Classrooms",
  description:
    "Choose how many classrooms to create now — you can always add more later from your dashboard.",
})}
${fieldMarkup({
  id: "signup-classroom-count",
  label: "How many classrooms?",
  type: "number",
  value: authUiState.classroomRows.length,
  attrs: 'data-classroom-count min="1" max="20"',
})}
${rows}
${feedbackError(authUiState)}
<button class="btn btn-gold" data-action="submit-teacher-signup" type="button" ${authUiState.pending ? "disabled" : ""}>${authUiState.pending ? "Please wait…" : "Create Account & Classrooms →"}</button>
<button class="back-link" data-action="teacher-signup-back" type="button">← Back</button>
</section></main>${authorPanel()}`;
  }
  const draft = authUiState.signupDraft;
  return `${chrome()}<main class="shell completion-shell auth-shell c-app"><section>
${pageHeaderMarkup({ eyebrow: `${BRAND.engine} · Step 1 of 2`, title: "Create Teacher Account" })}
${authTabsMarkup([
  { label: "Sign In", action: "teacher-tab-signin", selected: false },
  { label: "Create Account", action: "teacher-tab-signup", selected: true },
])}
${fieldMarkup({ id: "teacher-display-name", label: "Your name", placeholder: "Ms. Rivera", value: draft?.displayName || "", autocomplete: "off" })}
${fieldMarkup({ id: "teacher-school-name", label: "School / organization", placeholder: "e.g. Lincoln High School", value: draft?.schoolName || "", autocomplete: "off" })}
${fieldMarkup({ id: "teacher-email", label: "Email", type: "email", placeholder: "you@school.edu", value: draft?.email || "", autocomplete: "off" })}
${fieldMarkup({ id: "teacher-password", label: "Password", control: passwordFieldMarkup("teacher-password", "••••••••", draft?.password || "") })}
${fieldMarkup({ id: "teacher-confirm-password", label: "Confirm password", control: passwordFieldMarkup("teacher-confirm-password", "••••••••") })}
${authUiState.info ? `<p class="feedback" role="status" aria-live="polite">${esc(authUiState.info)}</p>` : ""}
${feedbackError(authUiState)}
<button class="btn btn-gold" data-action="teacher-signup-continue" type="button" ${authUiState.pending ? "disabled" : ""}>Continue →</button>
<button class="btn btn-outline" data-action="continue-with-google" type="button" ${authUiState.pending ? "disabled" : ""}>Continue with Google</button>
<button class="back-link" data-action="open-main-menu" type="button">← Back</button>
</section></main>${authorPanel()}`;
}

const TEACHER_DASHBOARD_TABS = [
  { id: "classrooms", label: "Classrooms" },
  { id: "assignments", label: "Assignments" },
  { id: "sources", label: "Sources" },
  { id: "units", label: "Units" },
];

// Real tab semantics — was a row of plain buttons with no role/aria-
// selected. Each tab stays individually Tab-key reachable (no roving
// tabindex/arrow-key handling — this app's global keydown handler already
// carries significant gameplay-movement complexity, and standard Tab
// traversal already makes every tab keyboard-operable).
function teacherDashboardTabsMarkup() {
  return `<div class="archive-legend archive-unit-tabs" role="tablist" aria-label="Teacher dashboard sections">${TEACHER_DASHBOARD_TABS.map(
    (tab) => {
      const selected = teacherUiState.activeTab === tab.id;
      return `<button class="text-button unit-tab ${selected ? "is-selected" : ""}" data-action="select-teacher-tab" data-tab="${tab.id}" type="button" role="tab" aria-selected="${selected}" aria-controls="teacher-dashboard-tabpanel">${esc(tab.label)}</button>`;
    }
  ).join("")}</div>`;
}

// Human-readable labels for the raw roster_slots.status enum — was
// rendered verbatim ("claimed"/"unclaimed"/"disabled") straight from the
// database.
const ROSTER_STATUS_LABEL = {
  claimed: { label: "Claimed", tone: "success" },
  unclaimed: { label: "Not yet claimed", tone: "muted" },
  disabled: { label: "Disabled", tone: "error" },
};

function teacherClassroomsTabMarkup() {
  const rosterRows = teacherUiState.roster
    .map((slot) => {
      const summary = slot.auth_user_id
        ? teacherUiState.progressByStudent[slot.auth_user_id]
        : null;
      const progressLabel = summary
        ? `${summary.completedCount} case${summary.completedCount === 1 ? "" : "s"} complete`
        : "Not started";
      const statusInfo = ROSTER_STATUS_LABEL[slot.status] || {
        label: slot.status,
        tone: "default",
      };
      const actions =
        slot.status === "disabled"
          ? "Disabled"
          : [
              slot.status === "claimed"
                ? `<button class="text-button" data-action="reset-student-password" data-roster-slot-id="${esc(slot.id)}" type="button">Reset password</button>`
                : "",
              `<button class="text-button is-danger" data-action="disable-student" data-roster-slot-id="${esc(slot.id)}" type="button">Remove</button>`,
            ]
              .filter(Boolean)
              .join(" · ");
      return `<tr><td>${esc(slot.student_id_code)}</td><td>${esc(slot.display_name || "—")}</td><td>${chip(statusInfo)}</td><td>${chip({ label: progressLabel, tone: "muted" })}</td><td>${actions}</td></tr>`;
    })
    .join("");
  return `
${fieldMarkup({ id: "new-classroom-name", label: "New classroom name", placeholder: "e.g. APUSH Period 4", autocomplete: "off" })}
<button class="btn btn-outline" data-action="create-classroom" type="button">Create classroom</button>
${
  teacherUiState.selectedClassroomId
    ? `${fieldMarkup({ id: "provision-count", label: "Add N students", type: "number", value: 5, attrs: 'min="1" max="200"' })}<button class="btn btn-outline" data-action="provision-roster" type="button">Add roster slots</button>`
    : ""
}
${
  teacherUiState.lastProvisioned
    ? `<p class="feedback success">Added seats: ${teacherUiState.lastProvisioned.map((s) => esc(s.student_id_code)).join(", ")}</p>`
    : ""
}
${
  teacherUiState.lastReissuedPassword
    ? `<p class="feedback success">Temporary password (shown once — write it down now): <strong>${esc(teacherUiState.lastReissuedPassword)}</strong></p>`
    : ""
}
${
  teacherUiState.selectedClassroomId
    ? `<table class="roster-table"><caption class="c-help">Students in this classroom</caption><thead><tr><th scope="col">ID</th><th scope="col">Name</th><th scope="col">Status</th><th scope="col">Progress</th><th scope="col"></th></tr></thead><tbody>${rosterRows}</tbody></table>`
    : `${emptyState({ title: "No students yet", body: "Create a classroom above to add students." })}`
}`;
}

// Readable labels for the two real taskType values (see
// engine/evaluator-requests.js). taskId itself (a source id or
// `saq-{unitId}`) is kept but de-emphasized as secondary metadata rather
// than presented as a primary column — resolving it to a human title would
// need a lookup this pass hasn't verified is safe to add.
const SUBMISSION_TASK_TYPE_LABEL = {
  "hipp-sourcing": "HIPP Sourcing",
  saq: "SAQ",
  dbq: "DBQ",
};

// Task types a teacher can actually assign — deliberately narrower than the
// DB's task_type check constraint (which also allows 'leq'): no real `leq`
// quest type exists in QUEST_TYPES yet (see quest-types/index.js), so
// offering it here would let a teacher create an assignment no submission
// could ever match.
const ASSIGNABLE_TASK_TYPES = ["hipp-sourcing", "saq", "dbq"];

// Pure "class outcome reporting" math (Phase 50D): how many of a classroom's
// claimed students have submitted / been graded against one assignment.
// Deliberately student-deduplicated (a revision submission shouldn't double
// count) rather than a raw submission count, and takes its three inputs
// exactly as teacherUiState already loads them so this needs no Supabase
// round trip of its own — it's a client-side join over data already fetched
// for the Classrooms/Assignments tabs.
export function computeAssignmentReport(assignment, roster, submissions, gradedEvaluationIds) {
  const claimedCount = roster.filter((slot) => slot.status === "claimed").length;
  const matching = submissions.filter(
    (sub) => sub.taskType === assignment.taskType && sub.taskId === assignment.taskId
  );
  const submittedStudentIds = new Set(matching.map((sub) => sub.studentUserId));
  const gradedStudentIds = new Set(
    matching
      .filter((sub) => gradedEvaluationIds.has(sub.evaluationId))
      .map((sub) => sub.studentUserId)
  );
  return {
    claimedCount,
    submittedCount: submittedStudentIds.size,
    gradedCount: gradedStudentIds.size,
  };
}

function assignmentCreateFormMarkup() {
  return `<div class="c-panel assignment-create-form">
${fieldMarkup({ id: "new-assignment-title", label: "Assignment title", placeholder: "e.g. Unit 3 SAQ: Common Cause", autocomplete: "off" })}
${fieldMarkup({
  id: "new-assignment-task-type",
  label: "Assessment type",
  select: ASSIGNABLE_TASK_TYPES.map((value) => ({
    value,
    label: SUBMISSION_TASK_TYPE_LABEL[value] || value,
  })),
})}
${fieldMarkup({ id: "new-assignment-task-id", label: "Task id", placeholder: "e.g. unit-03-archive-common-cause-saq", help: "The quest/source id this assignment tracks — matches the id a student's submission is recorded under.", autocomplete: "off" })}
${fieldMarkup({ id: "new-assignment-due-at", label: "Due date", type: "date" })}
<button class="btn btn-outline" data-action="create-assignment" type="button">Create assignment</button>
</div>`;
}

function assignmentReportRowMarkup(assignment) {
  const report = computeAssignmentReport(
    assignment,
    teacherUiState.roster,
    teacherUiState.submissions,
    teacherUiState.gradedEvaluationIds
  );
  const dueDate = new Date(assignment.dueAt);
  const isOverdue = dueDate.getTime() < Date.now() && report.submittedCount < report.claimedCount;
  return `<tr><td>${esc(assignment.title)}<br><span class="c-help">${esc(SUBMISSION_TASK_TYPE_LABEL[assignment.taskType] || assignment.taskType)} · ${esc(assignment.taskId)}</span></td><td>${chip({ label: dueDate.toLocaleDateString(), tone: isOverdue ? "error" : "muted" })}</td><td>${report.submittedCount}/${report.claimedCount} submitted</td><td>${report.gradedCount}/${report.submittedCount || 0} graded</td><td><button class="text-button is-danger" data-action="delete-assignment" data-assignment-id="${esc(assignment.id)}" type="button">Delete</button></td></tr>`;
}

function teacherAssignmentsTabMarkup() {
  if (!teacherUiState.selectedClassroomId)
    return emptyState({ body: "Select or create a classroom to review its submissions." });
  const assignmentRows = teacherUiState.assignments.map(assignmentReportRowMarkup).join("");
  const assignmentsTable = assignmentRows
    ? `<table class="roster-table"><caption class="c-help">Assignments for this classroom</caption><thead><tr><th scope="col">Assignment</th><th scope="col">Due</th><th scope="col">Submitted</th><th scope="col">Graded</th><th scope="col"></th></tr></thead><tbody>${assignmentRows}</tbody></table>`
    : emptyState({ body: "No assignments yet — create one below." });
  const submissionRows = teacherUiState.submissions
    .map(
      (sub) =>
        `<tr><td>${esc(sub.studentDisplayName)}</td><td>${esc(SUBMISSION_TASK_TYPE_LABEL[sub.taskType] || sub.taskType)}<br><span class="c-help">${esc(sub.taskId)}</span></td><td>${esc(sub.readiness || "—")}</td><td><button class="text-button" data-action="open-grading" data-submission-id="${esc(sub.id)}" type="button">Review →</button></td></tr>`
    )
    .join("");
  const submissionsTable = submissionRows
    ? `<table class="roster-table"><caption class="c-help">Student submissions for this classroom</caption><thead><tr><th scope="col">Student</th><th scope="col">Assessment</th><th scope="col">Readiness</th><th scope="col"></th></tr></thead><tbody>${submissionRows}</tbody></table>`
    : emptyState({ body: "No submissions yet for this classroom." });
  return `${sectionHeadMarkup({ title: "Assignments", description: "Track due dates and see class-wide submission/grading progress at a glance." })}
${assignmentsTable}
${assignmentCreateFormMarkup()}
${sectionHeadMarkup({ title: "Submissions", description: "Every student submission for this classroom, regardless of assignment." })}
${submissionsTable}`;
}

function teacherUnitsTabMarkup() {
  const unitSections = UNITS.map(manageContentUnitSectionMarkup).join("");
  return `
${teacherUiState.selectedClassroomId ? teacherUnitAccessMarkup() : ""}
${sectionHeadMarkup({
  title: "Missions",
  description:
    "Pick a unit to see its missions, then open one to review its intent, preview its content, and swap its practice questions — and, for non-map missions, its sources — for this classroom.",
})}
${unitSections}`;
}

function teacherDashboardScreen() {
  if (!currentProfile || currentProfile.role !== "teacher") {
    return `${chrome()}<main class="c-page c-app">${pageHeaderMarkup({
      eyebrow: BRAND.engine,
      title: "Teacher Dashboard",
      description: "Sign in as a teacher to manage classrooms.",
      actions: [
        { label: "Teacher Sign In →", action: "open-teacher-login", variant: "secondary" },
        { label: "← Back", action: "open-main-menu", variant: "secondary" },
      ],
    })}</main>${authorPanel()}`;
  }
  // Join code is real, useful info (what a teacher hands students to join)
  // but was baked into the button's primary label — now a visually
  // secondary span within the same button, not competing with the name.
  const classroomButtons = teacherUiState.classrooms
    .map((c) =>
      btn({
        labelHtml: `${esc(c.name)}<span class="classroom-switch-code">${esc(c.join_code)}</span>`,
        action: "select-classroom",
        variant: c.id === teacherUiState.selectedClassroomId ? "primary" : "secondary",
        attrs: `data-classroom-id="${esc(c.id)}"`,
      })
    )
    .join("");
  const tabBodies = {
    classrooms: teacherClassroomsTabMarkup,
    assignments: teacherAssignmentsTabMarkup,
    sources: teacherSourcesTabMarkup,
    units: teacherUnitsTabMarkup,
  };
  const activeTabBody = (tabBodies[teacherUiState.activeTab] || teacherClassroomsTabMarkup)();
  return `${chrome()}<main class="c-page c-app">
${pageHeaderMarkup({
  eyebrow: BRAND.engine,
  title: "Teacher Dashboard",
  description: `Signed in as ${currentProfile.displayName}.`,
  actions: [
    { label: "Sign out", action: "teacher-sign-out", variant: "secondary" },
    { label: "← Back", action: "open-main-menu", variant: "secondary" },
  ],
})}
<div class="c-toolbar">${classroomButtons}</div>
${feedbackError(teacherUiState)}
${teacherDashboardTabsMarkup()}
<div id="teacher-dashboard-tabpanel" role="tabpanel" aria-label="${esc(TEACHER_DASHBOARD_TABS.find((t) => t.id === teacherUiState.activeTab)?.label || "Classrooms")}">${activeTabBody}</div>
</main>${authorPanel()}`;
}

// Compact status card, not a shouted banner — was a bare .kicker rendering
// "ALL UNITS ARE ALREADY AVAILABLE." in all-caps via CSS text-transform.
function teacherUnitAccessMarkup() {
  const index = teacherUiState.enabledUnitIndex;
  const currentUnit = UNITS[index];
  const nextUnit = UNITS[index + 1];
  return `${sectionHeadMarkup({ title: "Unit access" })}
<div class="c-panel manage-content-unit-access">
<div class="manage-content-unit-access-row">
<p class="c-help">Students can currently reach <strong>${esc(resolvedUnitTitle(currentUnit))}</strong> and everything before it.</p>
${chip({ label: nextUnit ? `${index + 1} of ${UNITS.length} units open` : "All units open", tone: nextUnit ? "default" : "success" })}
</div>
${nextUnit ? `<button class="btn btn-outline" data-action="advance-classroom-unit" type="button">Advance to ${esc(resolvedUnitTitle(nextUnit))} →</button>` : ""}
</div>`;
}

// --- Teacher Dashboard "Sources" tab ---------------------------------------
// Browsing + curation only in this pass — pre-selecting a source here saves
// it to this classroom's pool (classroom_unit_source_pool) but does not yet
// make it a real mission source-swap choice (that needs per-case
// activityRoute/reconstruction authoring, tracked as a followup). See
// docs/content-guide/primary-source-library.md.

// UNITS[unitNumber - 1] relies on UNITS being ordered/numbered the same way
// primary-source-library's units 1-9 are — true today for all five shipped
// units (Periods 1-5 in both places), and simplest to keep true rather than
// adding a lookup table.
function lockedSourcesForUnitNumber(unitNumber) {
  const unit = UNITS[unitNumber - 1];
  if (!unit) return [];
  return unit.cases.flatMap((c) =>
    (UNIT_SOURCES[c.id] || []).map((source) => ({ source, caseTitle: c.title }))
  );
}

// A printed page and a half of quoted text, roughly — beyond this, showing
// the full document inline would dwarf the rest of the preview, so we link
// out to the original source instead. See sourceFullTextBlockMarkup().
const FULL_TEXT_INLINE_LIMIT = 4000;

// Splits real verbatim source text on blank lines into <p> paragraphs —
// esc() alone doesn't turn "\n\n" into paragraph breaks.
function fullTextParagraphsMarkup(text) {
  return text
    .split(/\n\n+/)
    .map((paragraph) => `<p>${esc(paragraph.trim())}</p>`)
    .join("");
}

function sourceFullTextBlockMarkup(item) {
  const readMoreLink = item.externalUrl
    ? ` <a href="${esc(item.externalUrl)}" target="_blank" rel="noopener noreferrer">Read the full text at the original source ↗</a>`
    : "";
  if (!item.fullText) {
    return `<p class="source-pool-fulltext-note">Full text not yet transcribed.${readMoreLink}</p>`;
  }
  if (item.fullText.length > FULL_TEXT_INLINE_LIMIT) {
    return `<p class="source-pool-fulltext-note">This document is longer than fits here.${readMoreLink}</p>`;
  }
  return `<blockquote class="source-pool-fulltext-quote">${fullTextParagraphsMarkup(item.fullText)}</blockquote>`;
}

// Full-content preview for a Sources-tab pool row — schema-matched to
// apps/web/src/content/schemas/primary-source-library.schema.js (text vs.
// visual entries have different fields), not the gameplay Source schema.
function sourcePoolPreviewMarkup(item, kind) {
  const externalLink = item.externalUrl
    ? btn({ label: "View source ↗", href: item.externalUrl, variant: "secondary" })
    : "";
  if (kind === "text") {
    const key = `${kind}:${item.id}`;
    const fullTextExpanded = teacherUiState.sourcesFullTextKeys.has(key);
    return `<div class="source-pool-preview">
<dl>
<div><dt>APUSH use</dt><dd>${esc(item.apushUse)}</dd></div>
<div><dt>Summary</dt><dd>${esc(item.excerpt)}</dd></div>
</dl>
<button class="btn btn-plain source-pool-fulltext-toggle" data-action="toggle-source-fulltext" data-source-id="${esc(item.id)}" data-source-kind="${kind}" type="button" aria-expanded="${fullTextExpanded}">${fullTextExpanded ? "Hide Full Text ▾" : "Show Full Text ▸"}</button>
${fullTextExpanded ? sourceFullTextBlockMarkup(item) : ""}
<dl>
<div><dt>Citation</dt><dd>${esc(item.citation)}</dd></div>
</dl>
${externalLink}
</div>`;
  }
  return `<div class="source-pool-preview">
<dl>
<div><dt>Description</dt><dd>${esc(item.description)}</dd></div>
<div><dt>Citation</dt><dd>${esc(item.citation)}</dd></div>
</dl>
${externalLink}
</div>`;
}

function sourceRowMarkup(item, kind, unitNumber, inPool) {
  const metaLine = kind === "text" ? `${esc(item.creator)} · ${esc(item.date)}` : "Visual source";
  const key = `${kind}:${item.id}`;
  const previewExpanded = teacherUiState.sourcesPreviewKeys.has(key);
  const toggleLabel = inPool ? "− Remove" : "+ Add";
  return `<li class="source-pool-row c-card ${inPool ? "is-selected" : ""} ${previewExpanded ? "is-expanded" : ""}">
<div class="source-pool-row-main">
<button class="btn ${inPool ? "btn-gold" : "btn-outline"}" data-action="toggle-source-pool" data-unit="${unitNumber}" data-source-id="${esc(item.id)}" data-source-kind="${kind}" type="button">${toggleLabel}</button>
<button class="btn btn-plain" data-action="toggle-source-preview" data-source-id="${esc(item.id)}" data-source-kind="${kind}" type="button" aria-expanded="${previewExpanded}">${previewExpanded ? "View ▾" : "View ▸"}</button>
<span class="source-pool-row-copy"><strong>${esc(item.title)}</strong><span class="kicker">${metaLine}</span></span>
</div>
${previewExpanded ? sourcePoolPreviewMarkup(item, kind) : ""}
</li>`;
}

function sourceRowListMarkup(unitNumber, entries, pool) {
  const rows = entries
    .map(({ item, kind }) => sourceRowMarkup(item, kind, unitNumber, pool.has(item.id)))
    .join("");
  return `<ul class="source-pool-list">${rows}</ul>`;
}

function teacherSourcesUnitSectionMarkup(meta) {
  const unitNumber = meta.unit;
  const isOpen = teacherUiState.sourcesExpandedUnit === unitNumber;
  let body = "";
  if (isOpen) {
    const locked = lockedSourcesForUnitNumber(unitNumber);
    const lockedMarkup = locked.length
      ? `${sectionHeadMarkup({ title: "Locked (official)" })}<ul class="source-pool-list">${locked
          .map(
            ({ source, caseTitle }) =>
              `<li class="source-pool-row">${chip({ label: "Locked", tone: "muted" })}<span class="source-pool-row-copy"><strong>${esc(source.title)}</strong><span class="kicker">Required by ${esc(caseTitle)}</span></span></li>`
          )
          .join("")}</ul>`
      : "";
    const pool = teacherUiState.sourcePoolByUnit[unitNumber];
    let poolSectionsMarkup = "<p>Loading…</p>";
    if (pool !== undefined) {
      const textSources = getPrimarySourcesForUnit(unitNumber).map((item) => ({
        item,
        kind: "text",
      }));
      const visualSources = getVisualSourcesForUnit(unitNumber).map((item) => ({
        item,
        kind: "visual",
      }));
      const allEntries = [...textSources, ...visualSources];
      const added = allEntries.filter(({ item }) => pool.has(item.id));
      const available = allEntries.filter(({ item }) => !pool.has(item.id));
      const missionPoolMarkup = added.length
        ? sourceRowListMarkup(unitNumber, added, pool)
        : `<p class="case-summary-note">No sources added yet — add one from the pool below.</p>`;
      poolSectionsMarkup = `
${sectionHeadMarkup({
  title: `Unit ${unitNumber}: ${meta.label} Mission Pool Sources`,
  description:
    "Mission pool sources are available when you design quests for this unit. Come back to this page anytime to add or remove a source.",
})}
${missionPoolMarkup}
${sectionHeadMarkup({
  title: "Available pool",
  description:
    "Browse every researched source for this unit and add the ones you want available for quest design.",
})}
${sourceRowListMarkup(unitNumber, available, pool)}`;
    }
    body = `<div class="manage-content-unit-body">
${lockedMarkup}
${poolSectionsMarkup}
</div>`;
  }
  return `<details class="manage-content-unit"${isOpen ? " open" : ""}>
<summary class="manage-content-unit-toggle" data-action="toggle-sources-unit" data-unit="${unitNumber}">
<span class="manage-content-unit-heading"><span class="manage-content-unit-number">Unit ${unitNumber}</span><span class="manage-content-unit-title">${esc(meta.label)}</span><span class="kicker">${esc(meta.period)} · ${esc(meta.years)}</span></span>
</summary>
${body}
</details>`;
}

function teacherSourcesTabMarkup() {
  if (!teacherUiState.selectedClassroomId)
    return emptyState({ body: "Select or create a classroom to curate its sources." });
  return `
<p>Review every researched source for each unit, see which ones are already locked into a built mission, and pre-select the ones you want available for this classroom.</p>
${PRIMARY_SOURCE_LIBRARY_UNITS.map(({ meta }) => teacherSourcesUnitSectionMarkup(meta)).join("")}`;
}

function gradingScreen() {
  if (!currentProfile || currentProfile.role !== "teacher") {
    return `${chrome()}<main class="shell completion-shell c-app"><section>${pageHeaderMarkup({
      eyebrow: BRAND.engine,
      title: "Grading",
      description: "Sign in as a teacher to review submissions.",
      actions: [{ label: "Teacher Sign In →", action: "open-teacher-login", variant: "secondary" }],
    })}</section></main>${authorPanel()}`;
  }
  const submission = gradingUiState.submission;
  if (!submission) {
    const body = gradingUiState.error
      ? feedbackError(gradingUiState)
      : loadingNote("Loading submission…");
    return `${chrome()}<main class="shell completion-shell c-app"><section>${pageHeaderMarkup({ eyebrow: BRAND.engine, title: "Grading" })}
${body}
<button class="btn btn-outline" data-action="back-to-teacher-dashboard" type="button">← Back to dashboard</button>
</section></main>${authorPanel()}`;
  }
  const grades =
    submission.grades
      .map(
        (g) =>
          `<article class="manual-grade-entry"><p class="kicker">${esc(new Date(g.created_at).toLocaleString())}</p><h3>${esc(g.grade_label)}</h3>${g.teacher_feedback ? `<p>${esc(g.teacher_feedback)}</p>` : ""}</article>`
      )
      .join("") || emptyState({ body: "No grade entered yet." });
  return `${chrome()}<main class="shell review-shell c-app"><section class="review-copy">
<button class="back-link" data-action="back-to-teacher-dashboard">← Back to dashboard</button>
<p class="kicker">${esc(SUBMISSION_TASK_TYPE_LABEL[submission.taskType] || submission.taskType)}</p>
<h1>${esc(submission.studentDisplayName)}</h1>
${submission.stimulus ? `<blockquote>${esc(submission.stimulus)}</blockquote>` : ""}
<p><b>Prompt:</b> ${esc(submission.prompt)}</p>
</section>
<section class="review-work">
<h2>Student response</h2>
<p class="student-response-text">${esc(submission.studentResponse)}</p>
${archiveFeedbackMarkup(submission.feedback)}
<h2>Manual grade</h2>
${grades}
${fieldMarkup({ id: "grade-label", label: "Grade", placeholder: "e.g. 3/3 or Meets expectations", autocomplete: "off" })}
${fieldMarkup({ id: "grade-teacher-feedback", label: "Feedback to student", optional: true, textarea: true, placeholder: "Additional notes for the student" })}
${feedbackError(gradingUiState)}
<button class="btn btn-gold" data-action="save-manual-grade" type="button">Save grade</button>
</section></main>${authorPanel()}`;
}

// --- Async data loaders for the teacher dashboard/grading screens ---------
async function loadTeacherDashboardData() {
  if (!currentProfile || currentProfile.role !== "teacher") return;
  try {
    teacherUiState.classrooms = await listMyClassrooms();
    let selected = getSelectedClassroomId();
    if (!selected || !teacherUiState.classrooms.some((c) => c.id === selected)) {
      selected = teacherUiState.classrooms[0]?.id || null;
      if (selected) setSelectedClassroomId(selected);
    }
    teacherUiState.selectedClassroomId = selected;
    await loadSelectedClassroomDetails();
    await setActiveOverrideClassroom(selected);
    teacherUiState.error = "";
  } catch (err) {
    reportUiError(teacherUiState, err, "Could not load your classrooms.");
  }
  render();
}

async function loadSelectedClassroomDetails() {
  if (!teacherUiState.selectedClassroomId) {
    teacherUiState.roster = [];
    teacherUiState.submissions = [];
    teacherUiState.progressByStudent = {};
    teacherUiState.enabledUnitIndex = 0;
    teacherUiState.assignments = [];
    teacherUiState.gradedEvaluationIds = new Set();
    return;
  }
  teacherUiState.roster = await getRoster(teacherUiState.selectedClassroomId);
  teacherUiState.submissions = await listForClassroom(teacherUiState.selectedClassroomId);
  teacherUiState.progressByStudent = await getClassroomProgressSummaries(
    teacherUiState.selectedClassroomId
  );
  teacherUiState.enabledUnitIndex = await getClassroomUnitFloor(teacherUiState.selectedClassroomId);
  teacherUiState.assignments = await listClassroomAssignments(teacherUiState.selectedClassroomId);
  teacherUiState.gradedEvaluationIds = await getGradedEvaluationIds(
    teacherUiState.submissions.map((s) => s.evaluationId)
  );
}

async function openGradingScreen(submissionId) {
  gradingUiState = {
    submissionId,
    submission: null,
    gradeLabel: "",
    teacherFeedback: "",
    error: "",
  };
  progress.currentScreen = "grading";
  save();
  render();
  try {
    gradingUiState.submission = await getSubmissionWithGrades(submissionId);
  } catch (err) {
    reportUiError(gradingUiState, err, "Could not load this submission.");
  }
  render();
}

// --- Manage Content (Teacher Mode's per-mission source/quest swap editor) --------
// Listed by Unit → Mission (case) so a teacher sees what kind of mission
// they're about to edit before opening it — see caseKindLabel()/
// caseKindDetail(). Map Missions (case.route === "field") are entirely
// fixed content — geography, NPC/source placement, and Practice Check
// questions alike — so manageContentCaseScreen() shows them as locked with
// no editable slots at all. Every other case is an Activity Mission: its
// questions are editable, plus any generic-schema sources it has
// (UNIT_SOURCES today only covers the 3 map cases, so that path is
// currently a no-op for Activity Missions — see the plan this shipped
// against).
//
// Kept short enough to always render as a single-line chip — the qualifier
// (Archive Challenge only / the specific mechanic) is a separate detail
// line via caseKindDetail(), not crammed into the badge (Phase 47C; the
// combined "Activity Mission — Archive Challenge only" string used to wrap
// to 2-3 lines while "Map Mission" stayed a one-line pill).
function caseKindLabel(kase) {
  return kase.route === "field" ? "Map Mission" : "Activity Mission";
}

// The qualifier caseKindLabel() no longer carries — null for Map Missions,
// which need none. Before Phase 58 an Activity Mission read "Archive Challenge
// only", which was accurate about where it was rendered (one shared list in the
// Archive Room) and useless about what the mission is. Every one of them now has
// its own screen, so the mechanic's name is both true and the more informative
// thing for a teacher to see.
function caseKindDetail(kase) {
  return kase.route === "field" ? null : kase.mechanic;
}

// Renaming is metadata, not editable mission content, so it's offered even
// on a fully locked Map Mission — saves directly on change via
// setTeacherOverride(), same live-save pattern as Author Mode's unit-title
// field (see handleAppChange()'s [data-case-title] branch). The "Case
// N.NN —" prefix, if this case has one, renders as static text and is never
// part of the editable value.
function missionRenameControlMarkup(kase) {
  const { prefix, name } = splitCaseTitle(kase);
  const edited = hasTeacherOverride(kase.id, "title");
  const resolvedName = resolveTeacherOverride(kase.id, "title", name);
  const visible = resolvedNavTableVisible(kase);
  return `<div class="manage-content-rename">
<label>Mission name${edited ? ' <span class="author-override-flag">edited</span>' : ""}
<span class="manage-content-rename-input-row">${prefix ? `<span class="manage-content-rename-prefix">${esc(prefix)}</span>` : ""}<input type="text" data-case-title="${esc(kase.id)}" value="${esc(resolvedName)}"></span>
</label>
<label class="manage-content-visibility-toggle">
<input type="checkbox" data-case-visibility="${esc(kase.id)}" ${visible ? "checked" : ""}>
Show on Navigation Table for this classroom
</label>
</div>`;
}

// QUEST_TYPES keys (renderQuest/gradeQuest, quest-types/index.js — also
// classroom_content_selections.slot_kind for quest slots) vs. the camelCase
// property names PRACTICE_CHECK_QUESTS groups the same 4 types under.
// Deliberately only these 4 — Short Answer Questions (reviewScreen(),
// SaqSchema in review.schema.js) are a separate mechanism entirely, not
// wired into QUEST_TYPES/renderQuest/gradeQuest and not one of Manage
// Content's slot kinds. Adding SAQ authoring here would need a new
// classroom_content_selections slot_kind plus a migration, which is out of
// scope for Phase 3 absent a stronger justification — documented as a known
// limitation, not implemented.
const QUEST_SLOT_TYPES = [
  { questType: "mcq", practiceKey: "mcq" },
  { questType: "sequencing", practiceKey: "sequencing" },
  { questType: "evidence-organizing", practiceKey: "evidenceOrganizing" },
  { questType: "hipp", practiceKey: "hipp" },
];

// Official (unresolved) {questType, quest} pairs a case has editable quest
// content for — Practice Check's 4 arrays plus, if set, the case's single
// case-level Archive Challenge pointer. Deliberately reads
// ARCHIVE_CHALLENGE_QUESTS_BY_TYPE directly rather than going through
// archiveChallengeQuestFor(), which resolves through the active
// classroom's selection cache — the editor needs the true official baseline
// to build officialId/officialLabel from, not whatever is currently swapped.
function officialQuestSlotsForCase(caseId) {
  const questSet = PRACTICE_CHECK_QUESTS[caseId];
  const practiceSlots = questSet
    ? QUEST_SLOT_TYPES.flatMap(({ questType, practiceKey }) =>
        (questSet[practiceKey] || []).map((quest) => ({ questType, quest }))
      )
    : [];
  const challenge = caseById(caseId)?.archiveChallenge;
  const challengeQuest = challenge
    ? (ARCHIVE_CHALLENGE_QUESTS_BY_TYPE[challenge.questType] || []).find(
        (q) => q.id === challenge.questId
      )
    : undefined;
  return challengeQuest
    ? [...practiceSlots, { questType: challenge.questType, quest: challengeQuest }]
    : practiceSlots;
}

// Phase 49D: this case's actual Historical Thinking Skill coverage,
// re-derived from its own official quest content's existing skillCategory
// tags (see engine/ced-alignment.js's doc comment for why this is derived
// rather than a 5th authored field).
function caseHistoricalThinkingSkills(caseId) {
  return skillsForQuestSlots(officialQuestSlotsForCase(caseId), SKILL_CATEGORIES);
}

// Phase 49D: read-only CED alignment chip row for a Manage Content mission
// card — Period/Key Concept/Theme come straight from the case's own
// content-authored case.ced (unit.schema.js's CedAlignmentSchema); the
// Historical Thinking Skill chips are derived, not authored (see
// caseHistoricalThinkingSkills() above).
function cedAlignmentMarkup(kase) {
  if (!kase.ced) return "";
  const periodChip = chip({ label: `Period ${kase.ced.period}`, tone: "muted" });
  const keyConceptChips = kase.ced.keyConcepts
    .map((kc) => chip({ label: `KC ${kc}`, tone: "muted" }))
    .join("");
  const themeChips = kase.ced.themes
    .map((code) => chip({ label: CED_THEME_LABEL[code] || code, tone: "gold" }))
    .join("");
  const skillChips = caseHistoricalThinkingSkills(kase.id)
    .map((skill) => chip({ label: skill }))
    .join("");
  return `<div class="manage-content-ced-row">${periodChip}${keyConceptChips}${themeChips}${skillChips}</div>`;
}

// Canonical display names for the 4 real quest-types/index.js QUEST_TYPES
// keys — every other display string in Manage Content (editor headings,
// the type-picker cards) derives from this single table so "Multiple Choice"
// vs "multiple-choice question" vs "MCQ" can't drift apart again. The stable
// string KEYS themselves (mcq/sequencing/evidence-organizing/hipp) never
// change — see quest-types/index.js's own comment on why evidence-organizing's
// key was kept as-is. (A 5th, unrelated "ledger-record" quasi-type used to
// live here for case-002's bespoke ledger — retired once case-002 was
// migrated onto a real quest type; see docs/architecture/ARCHITECTURE-QUICKREF.md.)
// Small "ⓘ" affordance for extra teacher guidance in Manage Content. Reuses
// the app's existing native-title tooltip convention (see the title= attrs
// already on mcq/sequencing/hipp inputs) instead of introducing new
// JS-driven popover/disclosure state, per CLAUDE.md's near-term-minimal
// architecture note. Keep `text` to plain sentences — title attrs render as
// plain text, no markup.
function helpIconMarkup(text) {
  return `<span class="manage-content-help-icon" tabindex="0" title="${esc(text)}" aria-label="${esc(text)}">ⓘ</span>`;
}
const MANAGE_CONTENT_WIZARD_HELP_TEXT =
  "How this works: Preview shows the mission's current activity exactly as students will see it. From there, choose Keep & Publish to leave it as-is, Edit This Activity to change its wording or answers, or Replace Activity to swap in a different activity type. Nothing changes for students until you publish.";
const MANAGE_CONTENT_HIPP_ARGUMENT_HELP =
  "The specific historical argument or interpretation this HIPP dimension should connect to — e.g. a claim about why the document was written or who it was meant to persuade. Students see this next to the dimension name. A correct answer must explain how this dimension (Historical situation/Intended audience/Purpose/Point of view) supports this exact argument, not just identify it.";
const MANAGE_CONTENT_HIPP_ID_ONLY_HELP =
  "Marks a wrong-answer option that correctly names the right person, place, or context for this dimension but doesn't connect it to the argument above. On the real AP DBQ rubric, identification alone earns zero points — only explaining how or why it shapes the argument counts. Each prompt needs exactly one fully correct option and at least one option like this.";

const QUEST_TYPE_DISPLAY_NAMES = {
  mcq: "Multiple Choice",
  sequencing: "Sequencing",
  "evidence-organizing": "Evidence Organizing",
  hipp: "HIPP Source Analysis",
};
const QUEST_TYPE_DESCRIPTIONS = {
  mcq: "A single question with several answer choices.",
  sequencing: "Arrange records in the order that reflects cause and effect.",
  "evidence-organizing": "Sort sources into the historical-thinking skill each best demonstrates.",
  hipp: "Analyze a document's Historical situation, Intended audience, Purpose, and Point of view.",
};
// Small text glyphs (not photo emoji, to stay in the Cinzel/gold historical-
// adventure register — see CLAUDE.md's visual design language section) shown
// beside each quest type's name atop its configure panel.
const QUEST_TYPE_ICONS = {
  mcq: "◉",
  sequencing: "↕",
  "evidence-organizing": "▤",
  hipp: "◈",
};

// Shared across every quest type's Help drawer — every editable slot here
// *is* the case's one Archive Challenge, so the definition is identical
// regardless of which quest type is currently chosen for it.
const ARCHIVE_CHALLENGE_HELP_TERM = {
  term: "Archive Challenge",
  def: "Chronicle's name for a case's one gradable practice activity, reached from the Institute Archive — this is exactly the activity you're editing here.",
};

// Content for the "Help ?" drawer opened per mission/assessment type (see
// manageContentHelpDrawerMarkup() below) — real APUSH/College-Board
// terminology as the primary label (apushName), Chronicle's own name as a
// secondary parenthetical (chronicleName), never the reverse. keyTerms only
// lists terms actually relevant to that specific type, drawn from the
// glossary already used elsewhere in this app/CLAUDE.md (HIPP,
// Contextualization, Point of view, Historical situation, Archive
// Challenge, Investigation Challenge, Evidence organization, Sequencing) —
// not every term on every card.
const MANAGE_CONTENT_HELP_CONTENT = {
  hipp: {
    apushName: "HIPP Source Analysis",
    chronicleName: "Source Investigation",
    whatStudentsDo:
      "Students read a primary source and answer one question per HIPP dimension, explaining how that dimension shapes the document's argument or reliability — not just identifying facts about it.",
    assesses: "The HIPP source-analysis sourcing skill used across AP DBQ and SAQ sourcing points.",
    whenToUse:
      "Use when the mission's focus is analyzing one source in depth, not checking content recall.",
    whatStudentsSee:
      "The source's text and attribution, followed by one multiple-choice question per HIPP dimension chosen for this document.",
    keyTerms: [
      {
        term: "HIPP",
        def: "A framework for analyzing a primary source's Historical situation, Intended audience, Purpose, and Point of view.",
      },
      {
        term: "Historical situation",
        def: "The circumstances — time, place, events — surrounding when a source was created.",
      },
      {
        term: "Point of view",
        def: "The perspective, background, or position that shapes what a source's author says and leaves out.",
      },
      {
        term: "Investigation Challenge",
        def: "A different, source-attached HIPP activity tied to one specific source's own investigation pointer — not the same as this mission's Archive Challenge, and not currently editable from this screen.",
      },
      ARCHIVE_CHALLENGE_HELP_TERM,
    ],
  },
  mcq: {
    apushName: "Multiple-Choice Question",
    chronicleName: "Multiple Choice",
    whatStudentsDo:
      "Students read a prompt — optionally grounded in a source — and select one correct answer from several choices.",
    assesses:
      "Content knowledge and recall, or, when a source is attached, the ability to connect a source to a specific claim.",
    whenToUse:
      "Use for a quick content check or a single-answer question that doesn't need a multi-part rubric.",
    whatStudentsSee:
      "An optional source excerpt, the question prompt, and answer choices; an explanation appears after answering if one is provided.",
    keyTerms: [ARCHIVE_CHALLENGE_HELP_TERM],
  },
  sequencing: {
    apushName: "Sequencing",
    chronicleName: "Sequencing",
    whatStudentsDo:
      "Students arrange a set of items into the correct causal order, not just chronological order.",
    assesses:
      "Causation and continuity-and-change reasoning — explaining how and why events led to one another, not only when they happened.",
    whenToUse:
      "Use when the historical-thinking point is how events caused each other, not just a list of dates.",
    whatStudentsSee:
      "An optional source excerpt, the prompt, and a set of items students reorder into the sequence they judge correct.",
    keyTerms: [
      {
        term: "Sequencing",
        def: "Arranging events or items in the order that reflects cause and effect, not just chronology.",
      },
      ARCHIVE_CHALLENGE_HELP_TERM,
    ],
  },
  "evidence-organizing": {
    apushName: "Evidence Organization",
    chronicleName: "Evidence Organizing",
    whatStudentsDo:
      "Students sort several source records into categories based on which historical claim each one best supports.",
    assesses:
      "The AP historical-thinking skills — Comparison, Causation, Continuity and Change, Contextualization, and Sourcing — by asking students to identify which one a specific piece of evidence demonstrates.",
    whenToUse:
      "Use when the goal is distinguishing historical-thinking skills across multiple sources, not analyzing one source in depth.",
    whatStudentsSee:
      "A set of evidence cards with source excerpts, sorted into labeled categories, plus a reflection prompt.",
    keyTerms: [
      {
        term: "Evidence organization",
        def: "Sorting pieces of historical evidence by the reasoning skill or claim each one best demonstrates.",
      },
      {
        term: "Contextualization",
        def: "Explaining the broader historical situation surrounding an event, rather than analyzing it in isolation.",
      },
      ARCHIVE_CHALLENGE_HELP_TERM,
    ],
  },
};

// Labeled (not icon-only) so it satisfies "accessible name" for free — see
// helpIconMarkup()'s doc comment for why that single-sentence-tooltip
// affordance isn't sufficient for this 5-section requirement. One per
// quest-type field editor (authoringFieldsMarkup()) and one per type-picker
// card (manageContentAuthoringFormMarkup()), so a teacher can get help
// before or after choosing a type.
function manageContentHelpTriggerMarkup(slotKind) {
  return `<button type="button" class="btn btn-plain manage-content-help-trigger" data-action="open-help-drawer" data-slot-kind="${esc(slotKind)}">Help ?</button>`;
}

// Always rendered (see manageContentCaseScreen()'s doc comment on Pass 2
// dialog plumbing) — content is conditional on manageContentHelpDrawerOpenFor,
// synced open/closed via syncManageContentNativeDialogs(). Definitions are
// plain visible text (a <dl>), not hover-only tooltips, since some of these
// terms (Investigation Challenge vs. Archive Challenge, for instance) matter
// enough that a teacher shouldn't have to discover they're hoverable.
function manageContentHelpDrawerMarkup() {
  const content = manageContentHelpDrawerOpenFor
    ? MANAGE_CONTENT_HELP_CONTENT[manageContentHelpDrawerOpenFor]
    : null;
  const body = content
    ? `<h2 id="manage-content-help-title"><span class="manage-content-help-drawer-apush-name">${esc(content.apushName)}</span><span class="manage-content-help-drawer-chronicle-name">Chronicle mission type: ${esc(content.chronicleName)}</span></h2>
<div class="manage-content-help-drawer-section"><h3>What students do</h3><p>${esc(content.whatStudentsDo)}</p></div>
<div class="manage-content-help-drawer-section"><h3>What this assesses</h3><p>${esc(content.assesses)}</p></div>
<div class="manage-content-help-drawer-section"><h3>When to use it</h3><p>${esc(content.whenToUse)}</p></div>
<div class="manage-content-help-drawer-section"><h3>What students see</h3><p>${esc(content.whatStudentsSee)}</p></div>
<div class="manage-content-help-drawer-section"><h3>Key terms</h3><dl class="manage-content-help-key-terms">${content.keyTerms.map(({ term, def }) => `<dt>${esc(term)}</dt><dd>${esc(def)}</dd>`).join("")}</dl></div>`
    : "";
  return `<dialog id="manage-content-help-dialog" class="manage-content-help-drawer" aria-labelledby="manage-content-help-title">
${body}
<button type="button" class="btn btn-outline" data-action="close-help-drawer">Close</button>
</dialog>`;
}

function manageContentMissionCardMarkup(c) {
  const detail = caseKindDetail(c);
  return `<article class="manage-content-mission-card c-card c-card--interactive">
<div class="manage-content-mission-head"><p class="kicker">${esc(caseNumberLabel(c) || c.shortTitle)}</p>${chip({ label: caseKindLabel(c), tone: "gold" })}</div>
<h3>${esc(resolvedCaseTitle(c))}</h3>
${detail ? `<p class="c-help">${esc(detail)}</p>` : ""}
<p class="case-summary-note">${esc(c.summary)}</p>
${cedAlignmentMarkup(c)}
<button class="btn btn-outline" data-action="open-manage-content-case" data-case-id="${esc(c.id)}" type="button">Edit mission →</button>
</article>`;
}

// Native <details>/<summary> disclosure (Phase 47F unified the Sources tab's
// teacherSourcesUnitSectionMarkup() onto this same pattern — both accordions
// on the Teacher Dashboard now share one "manage-content-unit" markup shape).
// render() fully replaces app.innerHTML on every state change, so the `open`
// attribute below still has to be driven from manageContentExpandedUnitId
// rather than relying on the browser to remember native disclosure state
// across a re-render. handleAppClick() already calls event.preventDefault()
// before dispatching any [data-action] click, which suppresses the browser's
// own click-to-toggle on <summary> so there's no double-toggle race with
// render().
function manageContentUnitSectionMarkup(unit) {
  const isOpen = manageContentExpandedUnitId === unit.id;
  const unitNumber = Number(unit.id.split("-")[1]);
  const body = isOpen
    ? `<div class="manage-content-unit-body">
<p>${esc(unit.description)}</p>
${resolvedUnitCentralQuestion(unit) ? `<p class="manage-content-central-question">${esc(resolvedUnitCentralQuestion(unit))}</p>` : ""}
<div class="manage-content-mission-grid">${unit.cases.map(manageContentMissionCardMarkup).join("")}</div>
</div>`
    : "";
  return `<details class="manage-content-unit"${isOpen ? " open" : ""}>
<summary class="manage-content-unit-toggle" data-action="toggle-manage-content-unit" data-unit-id="${esc(unit.id)}">
<span class="manage-content-unit-heading"><span class="manage-content-unit-number">Unit ${unitNumber}</span><span class="manage-content-unit-title">${esc(resolvedUnitTitle(unit))}</span><span class="kicker">${esc(unit.period)}</span></span>
</summary>
${body}
</details>`;
}

// manageContentScreen() (the old standalone unit/mission listing) was
// folded into the Teacher Dashboard's Units tab (teacherUnitsTabMarkup()) —
// manageContentUnitSectionMarkup()/manageContentMissionCardMarkup() are now
// called from there instead.

// Sources available to select in the current case's authoring forms (HIPP
// document text, evidence-organizing record fields) — drawn from the
// classroom's curated Sources-tab pool for the case's unit
// (classroom_unit_source_pool via teacherUiState.sourcePoolByUnit, the same
// cache the Sources tab itself populates), not the case's own official
// UNIT_SOURCES: those belong to Map Mission cases (route "field"), and
// manageContentCaseScreen() locks all Map Mission content — including
// sources — before the authoring form is ever reachable, so a per-case
// "official sources" list would always render zero options in the one place
// it's used. Selecting one is a one-time copy-in convenience, not a
// persistent link: after copying, the fields are freely editable text and
// never revert or resync if the source's own text changes later.
function currentUnitNumber() {
  const unit = unitForCase(contentUiState.selectedCaseId);
  return unit ? Number(unit.id.split("-")[1]) : null;
}

function poolSourcesForCopy() {
  const unitNumber = currentUnitNumber();
  if (!unitNumber) return [];
  const pool = teacherUiState.sourcePoolByUnit[unitNumber];
  if (!pool) return [];
  const items = [];
  for (const [id, kind] of pool) {
    const item = kind === "visual" ? getVisualSourceById(id) : getPrimarySourceById(id);
    if (item) items.push({ id, kind, item });
  }
  return items;
}

// `inUseValues` (a Set of "kind:id" pool values already picked by *other*
// fields in the same form) only ever has entries for evidence-organizing —
// the one quest type with more than one source-picker row per mission (see
// evidenceOrganizingFieldsMarkup()); every other quest type has exactly one
// source field per mission, so callers simply omit it. This is not
// cross-mission or cross-unit duplicate detection — nothing in the source
// pool tracks usage outside the currently open form, and building that would
// need a new query across every case's saved selections, out of scope here.
// Extracted as its own pure, exported function so the enriched-label format
// can be tested directly against real primary-source-library fixtures
// without needing to stand up teacherUiState.sourcePoolByUnit — see
// tests/unit/main-source-selector.test.js.
export function sourceSelectorOptionLabel(kind, item) {
  return kind === "visual"
    ? `${item.title} (image source)`
    : `${item.title} — ${item.creator}, ${item.date} (text source)`;
}

function sourceSelectorOptionsMarkup(selectedValue, inUseValues = new Set()) {
  return poolSourcesForCopy()
    .map(({ id, kind, item }) => {
      const value = `${kind}:${id}`;
      const inUseSuffix = inUseValues.has(value) ? " — already used in this activity" : "";
      return `<option value="${esc(value)}" ${value === selectedValue ? "selected" : ""}>${esc(sourceSelectorOptionLabel(kind, item) + inUseSuffix)}</option>`;
    })
    .join("");
}

// Maps a picked "Select source" option's value ("text:<id>" or
// "visual:<id>", as built by sourceSelectorOptionsMarkup()) to the
// {label, attribution, excerpt, fullText} fields the HIPP and
// evidence-organizing authoring forms autofill from. Visual sources have no
// creator/date/excerpt/fullText fields, so they map onto citation/description
// instead. `fullText` is only ever present on a text-source library entry
// that's actually been transcribed (primary-source-library.schema.js —
// absent means "not yet transcribed," not "this source has none") — the
// HIPP document-text field prefers it over the short `excerpt` when present,
// see the [data-copy-hipp-source] branch of handleAppChange(). Returns null
// for a value that doesn't resolve to a real pool entry (e.g. the blank
// "— Choose —" option, or a stale id no longer in the catalog).
export function resolvePoolSourceFields(value) {
  const separatorIndex = value.indexOf(":");
  if (separatorIndex < 0) return null;
  const kind = value.slice(0, separatorIndex);
  const id = value.slice(separatorIndex + 1);
  const item = kind === "visual" ? getVisualSourceById(id) : getPrimarySourceById(id);
  if (!item) return null;
  return kind === "visual"
    ? { label: item.title, attribution: item.citation, excerpt: item.description, fullText: null }
    : {
        label: item.title,
        attribution: `${item.creator}, ${item.date}`,
        excerpt: item.excerpt,
        fullText: item.fullText || null,
      };
}

// Shared "Source for this activity" control for the evidence-organizing
// (per-record-row), HIPP, mcq, and sequencing authoring fields — picking an
// option autofills the surrounding fields from the classroom's source pool
// (see poolSourcesForCopy()/the data-copy-*-source branches in
// handleAppChange) and stays freely editable after. Renders an empty-pool
// message (not a blank control) when the pool has no options yet — the
// "Manage sources →" link is how a teacher gets there to add some.
// `fieldKey` is the same stable id (hipp/mcq/sequencing/evidence-N)
// sourceTextToolMarkup() already keys its own state by — reused here purely
// to build stable element ids for aria-describedby, not for any state
// lookup. `selectAttrs` carries whatever data-* attributes the caller's
// specific <select> needs (data-copy-evidence-source plus a row index, or
// just data-copy-hipp-source — HIPP's also carries data-authoring-field so
// the generic syncAuthoringFieldsFromDom() scalar loop keeps it in `fields`
// automatically). `selectedValue` is the pool value ("text:<id>"/
// "visual:<id>") to render as selected, so a picked source's name stays
// visible after the autofill re-renders this control — a blank/`undefined`
// value (never picked, or an existing record that wasn't copied from the
// pool) shows "— Choose —" instead. `requirement` ("required"|"optional") is
// passed explicitly by each of the 4 call sites rather than introspected
// from the quest-type Zod schema at render time (HIPP/evidence-organizing's
// source fields are schema-required; mcq/sequencing's relatedSource is
// schema-optional) — reaching into schema internals from the render layer
// just for a label isn't justified. See sourceSelectorOptionsMarkup()'s doc
// comment for `inUseValues`' scope.
const MANAGE_CONTENT_SOURCE_REQUIREMENT_TEXT = {
  required: "Required — students must examine this source before submitting.",
  optional: "Optional — students may complete without a source.",
};

function sourceSelectorFieldMarkup(fieldKey, selectAttrs, selectedValue, requirement, inUseValues) {
  const pool = poolSourcesForCopy();
  const unitNumber = currentUnitNumber();
  const manageLink = unitNumber
    ? `<button type="button" class="btn btn-plain manage-content-source-picker-link" data-action="go-to-sources-tab" data-unit="${unitNumber}">Manage sources →</button>`
    : "";
  if (!pool.length) {
    const isLoading = unitNumber && teacherUiState.sourcePoolLoadingUnits.has(unitNumber);
    return `<div class="manage-content-source-selector manage-content-empty-state">
<p class="${isLoading ? "manage-content-loading-note" : ""}">${isLoading ? "Loading sources…" : "This unit's source pool is empty. Add sources from the Sources tab before attaching one here."}</p>
${isLoading ? "" : manageLink}
</div>`;
  }
  const copyOptions = sourceSelectorOptionsMarkup(selectedValue, inUseValues);
  const requirementText = MANAGE_CONTENT_SOURCE_REQUIREMENT_TEXT[requirement] || "";
  const requirementId = `manage-content-source-requirement-${esc(fieldKey)}`;
  return `<div class="manage-content-source-selector" data-field-key="${esc(fieldKey)}">
<label class="manage-content-copy-field">Source for this activity<select ${selectAttrs} ${requirementText ? `aria-describedby="${requirementId}"` : ""}><option value="" ${selectedValue ? "" : "selected"}>— Choose —</option>${copyOptions}</select></label>
${requirementText ? `<p id="${requirementId}" class="manage-content-source-requirement" data-requirement="${esc(requirement)}">${esc(requirementText)}</p>` : ""}
${manageLink}
</div>`;
}

// Same heuristic used by both the summary card's "Customized excerpt" badge
// and the source-change guard in handleAppChange() — factored into one
// function so they can't drift apart. This is a heuristic, not a stored
// fact: it can't distinguish "customized by highlighting" from "customized
// by typing" from "genuinely identical to the official excerpt by
// coincidence" — textTools' highlight state is ephemeral/session-only (see
// its own doc comment) and isn't what's persisted, so comparing the saved
// text against what a fresh copy-in would produce right now is the only
// signal actually available.
export function fieldHasCustomizedExcerpt(poolValue, currentText) {
  if (!poolValue) return false;
  const resolved = resolvePoolSourceFields(poolValue);
  if (!resolved) return false;
  const stock = (resolved.fullText || resolved.excerpt || "").trim();
  return (currentText || "").trim() !== stock;
}

// Guards the 4 data-copy-*-source branches in handleAppChange() against
// silently discarding a customized excerpt when a teacher picks a different
// source — the confirmed bug this pass fixes (previously every pick
// unconditionally overwrote the excerpt and wiped highlight state, no
// warning, no check). `oldPoolValue`/`oldExcerptText` describe the field's
// state *before* this pick (the <select>'s DOM value has already changed by
// the time a change event fires, so the caller must capture these from
// manageContentAuthoring.fields — the last-rendered, pre-pick state — not
// re-read them from the DOM). `applyFn` is the exact copy-in this branch
// would otherwise run immediately; deferred behind the warning dialog only
// when there's something genuine to lose, so a first-ever pick (or picking
// the same source again) stays exactly as frictionless as before.
// `selectEl` is the actual <select> that just changed — when deferring, its
// DOM value is reverted back to `oldPoolValue` *before* opening the dialog,
// because openManageContentWarningDialog() itself re-syncs
// manageContentAuthoring.fields from the live DOM (to preserve any unrelated
// unsaved edits elsewhere in the form — see its own doc comment); without
// the revert, that resync would silently commit this unconfirmed pick into
// state anyway, leaving Cancel in a half-applied state (new source, old
// excerpt).
function confirmSourceChangeIfNeeded(selectEl, fieldKey, oldPoolValue, oldExcerptText, applyFn) {
  if (!fieldHasCustomizedExcerpt(oldPoolValue, oldExcerptText)) {
    applyFn();
    return;
  }
  selectEl.value = oldPoolValue || "";
  openManageContentWarningDialog("change-source", {
    onSecondary: applyFn,
    triggerSelector: `.manage-content-source-selector[data-field-key="${CSS.escape(fieldKey)}"] select`,
  });
}

// Sits between the source selector and the highlight tool in all 4
// quest-type field renderers — the "which source, and what will students
// actually see" summary the highlight tool itself doesn't provide. `slot` is
// contentUiState.slot (needed only for the "Restore Standard Version"
// pointer — see below). When no source is picked yet: for an optional field
// (mcq/sequencing), shows a plain-language empty-state message instead of a
// blank gap; for a required field (hipp/evidence-organizing), renders
// nothing — the form's own validation already covers a required field being
// empty, so a second message here would be redundant.
function selectedSourceSummaryCardMarkup(fieldKey, poolValue, currentText, slot, requirement) {
  if (!poolValue) {
    return requirement === "optional"
      ? `<p class="manage-content-empty-state manage-content-source-summary-empty">No source selected yet. Choose one above, or leave this optional field blank.</p>`
      : "";
  }
  const resolved = resolvePoolSourceFields(poolValue);
  if (!resolved) return "";
  const customized = fieldHasCustomizedExcerpt(poolValue, currentText);
  const excerptPreview = (currentText || "").trim() || "(no student text yet)";
  const restoreNote = slot?.latestCustomAltId
    ? `<p class="manage-content-source-summary-restore-note">This activity has a saved custom version. Use Restore Standard Version below to reset everything — source, prompt, and excerpt — back to the official version.</p>`
    : "";
  return `<div class="manage-content-source-summary-card c-card">
<div class="manage-content-source-summary-head">
<strong>${esc(resolved.label)}</strong>
${customized ? `<span class="manage-content-source-summary-customized-badge">✎ Customized excerpt</span>` : ""}
</div>
<dl class="manage-content-source-summary-meta">
<dt>Attribution</dt><dd>${esc(resolved.attribution)}</dd>
</dl>
<p class="manage-content-source-summary-excerpt-label">Current student excerpt</p>
<p class="manage-content-source-summary-excerpt">${esc(excerptPreview)}</p>
${restoreNote}
<div class="manage-content-source-summary-actions">
<button type="button" class="btn btn-plain" data-action="focus-source-selector" data-field-key="${esc(fieldKey)}">Change source</button>
<button type="button" class="btn btn-plain" data-action="focus-source-excerpt" data-field-key="${esc(fieldKey)}">Edit student excerpt</button>
<button type="button" class="btn btn-plain" data-action="view-full-source" data-field-key="${esc(fieldKey)}" data-source-pool-value="${esc(poolValue)}">View full source</button>
</div>
</div>`;
}

// Read-only viewer for a pool source's full record — the existing
// student-facing sourceReader() (see its own doc comment) operates on a
// completely different content shape (case sources, not the primary-source-
// library shape the pool draws from) and isn't reusable here. Reads
// manageContentViewingFullSourceValue directly (module state, same
// convention contentUiState-driven markup functions already use) rather than
// taking it as a param, since it's rendered once per screen regardless of
// which summary card's "View full source" opened it.
function sourceFullTextDialogMarkup() {
  const resolved = manageContentViewingFullSourceValue
    ? resolvePoolSourceFields(manageContentViewingFullSourceValue)
    : null;
  const body = resolved
    ? `<h2 id="manage-content-full-source-title">${esc(resolved.label)}</h2>
<p class="manage-content-source-summary-meta">${esc(resolved.attribution)}</p>
${
  resolved.fullText
    ? `<div class="manage-content-full-source-body">${esc(resolved.fullText)
        .split("\n")
        .filter(Boolean)
        .map((p) => `<p>${p}</p>`)
        .join("")}</div>`
    : `<p class="manage-content-loading-note">Full text not yet transcribed for this source — showing the excerpt instead.</p><div class="manage-content-full-source-body"><p>${esc(resolved.excerpt)}</p></div>`
}`
    : "";
  return `<dialog id="manage-content-full-source-dialog" class="manage-content-full-source-dialog" aria-labelledby="manage-content-full-source-title">
${body}
<button type="button" class="btn btn-outline" data-action="close-full-source-dialog">Close</button>
</dialog>`;
}

// Splits a pool source's full text into sentence-ish chunks so the highlight
// tool (sourceTextToolMarkup() below) can offer them as individually
// toggleable "lines." Deliberately simple (sentence-boundary regex, not a
// real tokenizer) and pure — called fresh every render from the currently
// picked pool source's text, never cached, so a stored `highlighted` index
// array always lines up with the segments it was recorded against as long as
// the underlying pool pick hasn't changed (picking a new/different source
// resets `highlighted`, see the data-copy-*-source branches in
// handleAppChange()).
// Memoized by exact text — sourceTextToolMarkup() re-runs this on every
// render while a teacher is editing any field in the authoring form
// (typing in an unrelated textarea, reordering an answer row, etc.), but a
// given source's full text is static for as long as it stays selected.
// Cache key space is bounded in practice by the primary-source library's
// size (a few dozen entries), so no eviction is needed.
const SEGMENT_CACHE = new Map();
function splitIntoSegments(text) {
  if (!text) return [];
  if (SEGMENT_CACHE.has(text)) return SEGMENT_CACHE.get(text);
  const segments = text.match(/[^.!?]+[.!?]+(\s+|$)/g) || [text];
  SEGMENT_CACHE.set(text, segments);
  return segments;
}

// Renders the shared "highlight full source text into an excerpt, or write
// your own summary instead" tool that sits above a text field a teacher is
// filling in from a picked pool source (HIPP's document text, an
// evidence-organizing record's excerpt, or mcq/sequencing's optional
// relatedSource excerpt). `fieldKey` addresses this tool instance's ephemeral
// state in manageContentAuthoring.textTools (see that field's doc comment).
// `poolValue` is the field's current "Select source" pick (e.g.
// fields.hippSourcePoolValue) — the tool only offers highlighting once a pool
// source is actually picked, same "renders nothing yet" convention
// sourceSelectorFieldMarkup() itself uses. `currentText` is the live value of
// the actual saved field (documentText/excerpt/relatedSourceExcerpt),
// rendered below the tool as "Student text" with a character counter — this
// textarea is what actually gets saved; the tool above it is just a
// convenience for composing its value.
function sourceTextToolMarkup(fieldKey, poolValue, currentText, textareaAttrs) {
  const tool = manageContentAuthoring?.textTools?.[fieldKey] || { mode: "excerpt" };
  const resolved = poolValue ? resolvePoolSourceFields(poolValue) : null;
  const fullText = resolved ? resolved.fullText || resolved.excerpt : "";
  const segments = fullText ? splitIntoSegments(fullText) : [];
  const highlighted = tool.highlighted || [];
  const past = tool.past || [];
  const future = tool.future || [];
  const length = (currentText || "").length;
  const modeTabs = `<div class="manage-content-source-tool-tabs">
<button type="button" class="btn ${tool.mode === "summary" ? "btn-outline" : "btn-gold"}" data-action="set-source-text-mode" data-field-key="${esc(fieldKey)}" data-mode="excerpt">Use Highlighted Excerpt</button>
<button type="button" class="btn ${tool.mode === "summary" ? "btn-gold" : "btn-outline"}" data-action="set-source-text-mode" data-field-key="${esc(fieldKey)}" data-mode="summary">Write Summary Instead</button>
</div>`;
  const highlighter =
    tool.mode !== "summary" && fullText
      ? `<div class="manage-content-source-fulltext">
<div class="manage-content-source-fulltext-head">
<span>Select lines for students</span>
<div class="manage-content-source-fulltext-actions">
<button type="button" class="btn btn-plain" data-action="clear-highlights" data-field-key="${esc(fieldKey)}" ${highlighted.some(Boolean) ? "" : "disabled"}>Clear</button>
<button type="button" class="btn btn-plain" data-action="undo-highlight" data-field-key="${esc(fieldKey)}" ${past.length ? "" : "disabled"}>↺ Undo</button>
<button type="button" class="btn btn-plain" data-action="redo-highlight" data-field-key="${esc(fieldKey)}" ${future.length ? "" : "disabled"}>↻ Redo</button>
</div>
</div>
<p class="manage-content-source-fulltext-body manage-content-source-fulltext-select">${segments
          .map(
            (segment, i) =>
              `<button type="button" class="manage-content-source-segment ${highlighted[i] ? "is-highlighted" : ""}" data-action="toggle-highlight-segment" data-field-key="${esc(fieldKey)}" data-segment-index="${i}" aria-pressed="${highlighted[i] ? "true" : "false"}">${esc(segment)}</button>`
          )
          .join("")}</p>
<button type="button" class="btn btn-gold" data-action="use-highlighted-excerpt" data-field-key="${esc(fieldKey)}" ${highlighted.some(Boolean) ? "" : "disabled"}>Use Highlighted Excerpt →</button>
</div>`
      : "";
  const counter = `<p class="manage-content-char-counter">${length} character${length === 1 ? "" : "s"}</p>`;
  return `<div class="manage-content-source-tool" data-field-key="${esc(fieldKey)}">
${resolved ? modeTabs : ""}
${highlighter}
<label>Student text (what students will see)<textarea ${textareaAttrs} rows="5">${esc(currentText)}</textarea></label>
${counter}
</div>`;
}

// --- Phase 3: guided editor sections (Source & stimulus / Student
// directions / Question / Answer structure), reused across all 4 per-type
// field editors below. Purely a display/collapse convenience over the exact
// same fields/markup each editor already built — no field moves between
// sections changes what gets validated, saved, or previewed.

// Collapsed shows a one-line summary + "Edit" button; expanded shows the
// section's real fields ("body"). `summary` is a plain string built by one
// of the *SectionSummaries() functions below — an empty string means the
// section isn't filled in yet, so it always renders expanded regardless of
// collapsedSections (nothing meaningful to collapse to). `collapsible: false`
// (used for the read-only Student Directions section, which is never worth
// hiding) always renders expanded with no toggle at all. Collapse state
// (manageContentAuthoring.collapsedSections) is ephemeral UI-only state, same
// convention as textTools — collapsing/expanding never discards a field
// value underneath it.
//
// Critical: `body`'s markup is always rendered into the DOM, even while
// collapsed — only hidden via the native `hidden` attribute, never omitted.
// syncAuthoringFieldsFromDom() re-syncs the *entire* form's fields from
// whatever [data-authoring-field]/row elements currently exist in the DOM
// on every add/remove/reorder/toggle action (see handleManageContentClick());
// if a collapsed section's inputs were actually removed from the DOM, that
// resync would silently return a fields object missing (or, for row-list
// fields like `choices`/`sources`, wrongly empty) any value belonging to a
// currently-collapsed section — confirmed as a real bug during manual
// testing before this comment was written. Keeping the markup present and
// merely hidden means its current-state value is always re-embedded in the
// template on every render, so the DOM never diverges from state.
function manageContentEditorSectionMarkup(
  sectionKey,
  title,
  { summary, body, collapsible = true }
) {
  const canCollapse = collapsible && Boolean(summary);
  const collapsed = canCollapse && Boolean(manageContentAuthoring?.collapsedSections?.[sectionKey]);
  const toggleBtn = canCollapse
    ? `<button type="button" class="btn btn-plain manage-content-editor-section-toggle" data-action="toggle-authoring-section" data-section-key="${esc(sectionKey)}">${collapsed ? "Edit" : "Collapse"}</button>`
    : "";
  return `<div class="manage-content-editor-section c-card${collapsed ? " is-collapsed" : ""}" data-section-key="${esc(sectionKey)}" tabindex="-1">
<div class="manage-content-editor-section-head"><span class="manage-content-editor-section-title">${esc(title)}</span>${toggleBtn}</div>
${collapsed ? `<p class="manage-content-editor-section-summary-text">${esc(summary)}</p>` : ""}
<div class="manage-content-editor-section-body"${collapsed ? " hidden" : ""}>${body}</div>
</div>`;
}

function truncateForSummary(text, maxLength = 60) {
  const trimmed = (text || "").trim();
  if (!trimmed) return "";
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1)}…` : trimmed;
}

// Shared by every quest type's optional/required "Source & stimulus"
// summary — reuses fieldHasCustomizedExcerpt()'s existing heuristic so this
// can't describe a source as "customized" by any different rule than the
// summary card/change-guard already use elsewhere in this file.
function relatedSourceSummaryText(label, poolValue, currentText) {
  const trimmedLabel = (label || "").trim();
  if (!trimmedLabel) return "";
  return `${trimmedLabel}, ${fieldHasCustomizedExcerpt(poolValue, currentText) ? "customized excerpt" : "official excerpt"}`;
}

export function mcqSectionSummaries(fields) {
  const choices = fields.choices || [];
  const filled = choices.filter((c) => (c.text || "").trim()).length;
  const hasCorrect = choices.some((c) => c.correct);
  return {
    source: relatedSourceSummaryText(
      fields.relatedSourceLabel,
      fields.mcqSourcePoolValue,
      fields.relatedSourceExcerpt
    ),
    question: truncateForSummary(fields.prompt),
    answers:
      filled >= 2
        ? `${choices.length} choice${choices.length === 1 ? "" : "s"}, ${hasCorrect ? "correct answer selected" : "no correct answer selected yet"}`
        : "",
  };
}

export function sequencingSectionSummaries(fields) {
  const items = fields.items || [];
  const filled = items.filter((i) => (i.label || "").trim()).length;
  return {
    source: relatedSourceSummaryText(
      fields.relatedSourceLabel,
      fields.sequencingSourcePoolValue,
      fields.relatedSourceExcerpt
    ),
    question: truncateForSummary(fields.prompt),
    answers: filled >= 2 ? `${items.length} item${items.length === 1 ? "" : "s"} in order` : "",
  };
}

// No "source" summary — evidence-organizing has no single top-level source
// (see evidenceOrganizingFieldsMarkup()'s doc comment on why its per-record
// source pickers stay inside "Answer structure" instead).
export function evidenceOrganizingSectionSummaries(fields) {
  const slots = fields.slots || [];
  const sources = fields.sources || [];
  const filledSlots = slots.filter((s) => (s.label || "").trim()).length;
  const placed = sources.filter((s) => s.correctSlotId).length;
  return {
    question: truncateForSummary(fields.prompt),
    answers:
      filledSlots >= 2 && sources.length
        ? `${slots.length} slot${slots.length === 1 ? "" : "s"}, ${sources.length} evidence record${sources.length === 1 ? "" : "s"}${placed === sources.length ? ", all placed" : ""}`
        : "",
  };
}

// No "question" summary — HIPP has no single top-level editable prompt (its
// `prompt` is a fixed instruction string built by buildHippContent()); each
// dimension's "argument" lives inside its own prompt block under "Answer
// structure" instead (see hippFieldsMarkup()'s doc comment).
export function hippSectionSummaries(fields) {
  const prompts = fields.hippPrompts || [];
  const filled = prompts.filter((p) => (p.argument || "").trim()).length;
  return {
    source: relatedSourceSummaryText(
      fields.documentAttribution,
      fields.hippSourcePoolValue,
      fields.documentText
    ),
    answers: filled
      ? `${prompts.length} HIPP prompt${prompts.length === 1 ? "" : "s"} (${prompts.map((p) => p.dimension).join(", ")})`
      : "",
  };
}

// Maps a raw auth.errors[] message to which guided section it belongs to,
// purely from its leading field-name token — every message produced by
// custom-content-authoring.js's hand-written checks or Zod's
// issuesToMessages() starts with a bare field name before the first ".",
// "[", or ":" (e.g. "choices: ...", "sources[0].skillCategory: ...",
// "relatedSource.label: ..."). Returns null for anything unrecognized so
// manageContentValidationSummaryMarkup() safely degrades to an unlinked
// item rather than mislinking a message to the wrong section — if
// custom-content-authoring.js's error wording ever changes without
// preserving this leading-token convention, that's the failure mode, not a
// crash.
const VALIDATION_ERROR_SECTION_MAP = {
  mcq: {
    prompt: "question",
    choices: "answers",
    explanation: "answers",
    relatedSource: "source",
    relatedSourceLabel: "source",
    relatedSourceAttribution: "source",
    relatedSourceExcerpt: "source",
  },
  sequencing: {
    prompt: "question",
    items: "answers",
    explanation: "answers",
    relatedSource: "source",
    relatedSourceLabel: "source",
    relatedSourceAttribution: "source",
    relatedSourceExcerpt: "source",
  },
  "evidence-organizing": {
    prompt: "question",
    slots: "answers",
    sources: "answers",
    reflectionPrompt: "answers",
  },
  hipp: {
    document: "source",
    documentText: "source",
    documentAttribution: "source",
    hippPrompts: "answers",
    prompts: "answers",
  },
};
export function sectionForValidationError(slotKind, message) {
  const match = /^([a-zA-Z]+)/.exec(message || "");
  if (!match) return null;
  return VALIDATION_ERROR_SECTION_MAP[slotKind]?.[match[1]] || null;
}

// Replaces the old flat <ul> — each error that resolves to a real section
// (see sectionForValidationError()) renders as a button that expands and
// scrolls/focuses that section (see the "focus-authoring-section" action in
// handleManageContentClick()); anything unresolved renders as plain text.
// Wrapped in a focusable, role="alert" container so failed Save/Publish
// attempts (see focusManageContentValidationSummary()) can move focus here.
function manageContentValidationSummaryMarkup(slotKind, errors) {
  if (!errors?.length) return "";
  const items = errors
    .map((message) => {
      const sectionKey = sectionForValidationError(slotKind, message);
      return sectionKey
        ? `<li><button type="button" class="manage-content-validation-link" data-action="focus-authoring-section" data-section-key="${esc(sectionKey)}">${esc(message)}</button></li>`
        : `<li>${esc(message)}</li>`;
    })
    .join("");
  return `<div id="manage-content-validation-summary" class="manage-content-authoring-errors" tabindex="-1" role="alert">
<ul>${items}</ul>
</div>`;
}

// Moves focus to the validation summary after a failed Save/Publish/Preview
// attempt re-renders it (see persistAuthoringSelection() and the
// "preview-authoring-changes" action) — render() is a synchronous full
// re-render from a template string, so the element exists by the time this
// runs right after it.
function focusManageContentValidationSummary() {
  if (typeof document === "undefined") return;
  document.getElementById("manage-content-validation-summary")?.focus();
}

function mcqFieldsMarkup(fields) {
  const choices = fields.choices || [];
  const rows = choices
    .map(
      (choice, i) => `<div class="manage-content-mcq-row">
<button type="button" class="manage-content-row-move-btn" data-action="move-mcq-choice" data-row-index="${i}" data-direction="-1" ${i === 0 ? "disabled" : ""} title="Move up">↑</button>
<button type="button" class="manage-content-row-move-btn" data-action="move-mcq-choice" data-row-index="${i}" data-direction="1" ${i === choices.length - 1 ? "disabled" : ""} title="Move down">↓</button>
<input type="radio" name="mcq-correct" data-mcq-correct ${choice.correct ? "checked" : ""} title="Mark as the correct choice">
<input type="text" data-mcq-text value="${esc(choice.text)}" placeholder="Choice text">
<button type="button" class="manage-content-row-delete-btn" data-action="remove-mcq-choice" data-row-index="${i}" ${choices.length <= 2 ? "disabled" : ""} title="Remove this choice">×</button>
</div>`
    )
    .join("");
  const summaries = mcqSectionSummaries(fields);
  const sourceBody = `<p class="manage-content-help-text">Not graded — purely context students see above the question, if you want to ground it in a primary source.</p>
${sourceSelectorFieldMarkup("mcq", 'data-copy-mcq-source data-authoring-field="mcqSourcePoolValue"', fields.mcqSourcePoolValue, "optional")}
${selectedSourceSummaryCardMarkup("mcq", fields.mcqSourcePoolValue, fields.relatedSourceExcerpt, contentUiState.slot, "optional")}
<label>Source label<input type="text" data-authoring-field="relatedSourceLabel" value="${esc(fields.relatedSourceLabel)}" placeholder="e.g. Immigration Act (Chinese Exclusion Act), 1882"></label>
<label>Attribution<input type="text" data-authoring-field="relatedSourceAttribution" value="${esc(fields.relatedSourceAttribution)}"></label>
${sourceTextToolMarkup("mcq", fields.mcqSourcePoolValue, fields.relatedSourceExcerpt, 'data-authoring-field="relatedSourceExcerpt"')}`;
  const directionsBody = `<p class="manage-content-help-text manage-content-directions">${esc(questHint("mcq", {}))}</p>`;
  const questionBody = `<label>Prompt<textarea data-authoring-field="prompt" rows="2">${esc(fields.prompt)}</textarea></label>`;
  const answersBody = `<div class="manage-content-field-label">Choices — mark the correct one</div>
<div class="manage-content-row-list" data-authoring-rows="choices">${rows}</div>
<button type="button" class="manage-content-add-row-btn" data-action="add-mcq-choice">+ Add choice</button>
<label>Explanation (optional, shown after answering)<textarea data-authoring-field="explanation" rows="2">${esc(fields.explanation)}</textarea></label>`;
  return [
    manageContentEditorSectionMarkup("source", "Source & stimulus (optional)", {
      summary: summaries.source,
      body: sourceBody,
    }),
    manageContentEditorSectionMarkup("directions", "Student directions", {
      body: directionsBody,
      collapsible: false,
    }),
    manageContentEditorSectionMarkup("question", "Question", {
      summary: summaries.question,
      body: questionBody,
    }),
    manageContentEditorSectionMarkup("answers", "Answer structure", {
      summary: summaries.answers,
      body: answersBody,
    }),
  ].join("");
}

function sequencingFieldsMarkup(fields) {
  const items = fields.items || [];
  const positionOptions = (currentPosition) =>
    items
      .map(
        (_, p) =>
          `<option value="${p}" ${currentPosition === p ? "selected" : ""}>${p + 1}</option>`
      )
      .join("");
  const rows = items
    .map(
      (item, i) => `<div class="manage-content-sequence-row">
<select data-sequence-position-select data-row-index="${i}" title="Position in the correct order">${positionOptions(item.position)}</select>
<input type="text" data-sequence-text value="${esc(item.label)}" placeholder="Item text">
<button type="button" class="manage-content-row-delete-btn" data-action="remove-sequence-item" data-row-index="${i}" ${items.length <= 2 ? "disabled" : ""} title="Remove this item">×</button>
</div>`
    )
    .join("");
  const summaries = sequencingSectionSummaries(fields);
  const sourceBody = `<p class="manage-content-help-text">Not graded — purely context students see above the question, if you want to ground it in a primary source.</p>
${sourceSelectorFieldMarkup("sequencing", 'data-copy-sequencing-source data-authoring-field="sequencingSourcePoolValue"', fields.sequencingSourcePoolValue, "optional")}
${selectedSourceSummaryCardMarkup("sequencing", fields.sequencingSourcePoolValue, fields.relatedSourceExcerpt, contentUiState.slot, "optional")}
<label>Source label<input type="text" data-authoring-field="relatedSourceLabel" value="${esc(fields.relatedSourceLabel)}" placeholder="e.g. Seneca Falls Convention, 1848"></label>
<label>Attribution<input type="text" data-authoring-field="relatedSourceAttribution" value="${esc(fields.relatedSourceAttribution)}"></label>
${sourceTextToolMarkup("sequencing", fields.sequencingSourcePoolValue, fields.relatedSourceExcerpt, 'data-authoring-field="relatedSourceExcerpt"')}`;
  const directionsBody = `<p class="manage-content-help-text manage-content-directions">${esc(questHint("sequencing", {}))}</p>`;
  const questionBody = `<label>Prompt<textarea data-authoring-field="prompt" rows="2">${esc(fields.prompt)}</textarea></label>`;
  const answersBody = `<div class="manage-content-field-label">Items — set each one's position in the correct causal order (not just chronological)</div>
<div class="manage-content-row-list" data-authoring-rows="items">${rows}</div>
<button type="button" class="manage-content-add-row-btn" data-action="add-sequence-item">+ Add item</button>
<label>Explanation (optional)<textarea data-authoring-field="explanation" rows="2">${esc(fields.explanation)}</textarea></label>`;
  return [
    manageContentEditorSectionMarkup("source", "Source & stimulus (optional)", {
      summary: summaries.source,
      body: sourceBody,
    }),
    manageContentEditorSectionMarkup("directions", "Student directions", {
      body: directionsBody,
      collapsible: false,
    }),
    manageContentEditorSectionMarkup("question", "Question", {
      summary: summaries.question,
      body: questionBody,
    }),
    manageContentEditorSectionMarkup("answers", "Answer structure", {
      summary: summaries.answers,
      body: answersBody,
    }),
  ].join("");
}

// Exception to the Source & stimulus -> Student directions -> Question ->
// Answer structure guided-section order the other 3 quest types use: this
// type has no single top-level source. Each evidence record carries its own
// source pick/excerpt/skill/correct-slot as one bundled row, so they all
// stay together under one "Answer structure" section rather than being
// split into an ill-fitting top-level Source section — this also matches
// renderEvidenceOrganizingQuest()'s own real student-facing order (prompt,
// then the evidence-card sources together), so nothing here is less
// source-first than what students actually see.
function evidenceOrganizingFieldsMarkup(fields) {
  const slots = fields.slots || [];
  const sources = fields.sources || [];
  const slotRows = slots
    .map(
      (slot, i) => `<div class="manage-content-evidence-slot-row">
<input type="text" data-slot-label value="${esc(slot.label)}" placeholder="Slot name">
<button type="button" class="manage-content-row-delete-btn" data-action="remove-evidence-slot" data-row-index="${i}" ${slots.length <= 2 ? "disabled" : ""} title="Remove this slot">×</button>
</div>`
    )
    .join("");
  const slotOptions = (currentSlotId) =>
    slots
      .map((slot) => {
        const slotId = slugify(slot.label);
        return `<option value="${esc(slotId)}" ${currentSlotId === slotId ? "selected" : ""}>${esc(slot.label || "(untitled slot)")}</option>`;
      })
      .join("");
  const skillOptions = (currentSkill) =>
    SKILL_CATEGORIES.map(
      (cat) =>
        `<option value="${esc(cat)}" ${currentSkill === cat ? "selected" : ""}>${esc(cat)}</option>`
    ).join("");
  const sourceRows = sources
    .map((source, i) => {
      const inUseValues = new Set(
        sources
          .filter((_, j) => j !== i && sources[j].sourcePoolValue)
          .map((s) => s.sourcePoolValue)
      );
      return `<div class="manage-content-evidence-source-row">
${sourceSelectorFieldMarkup(`evidence-${i}`, `data-copy-evidence-source data-row-index="${i}"`, source.sourcePoolValue, "required", inUseValues)}
${selectedSourceSummaryCardMarkup(`evidence-${i}`, source.sourcePoolValue, source.excerpt, contentUiState.slot, "required")}
<input type="text" data-source-label value="${esc(source.label)}" placeholder="Record label">
<input type="text" data-source-attribution value="${esc(source.attribution)}" placeholder="Attribution">
${sourceTextToolMarkup(`evidence-${i}`, source.sourcePoolValue, source.excerpt, "data-source-excerpt")}
<label class="manage-content-inline-field" title="The College Board historical-thinking skill this record demonstrates — this is graded, not decorative.">Skill<select data-source-skill>${skillOptions(source.skillCategory)}</select></label>
<label class="manage-content-inline-field">Correct slot<select data-source-slot>${slotOptions(source.correctSlotId)}</select></label>
<button type="button" class="manage-content-row-delete-btn" data-action="remove-evidence-source" data-row-index="${i}" ${sources.length <= 1 ? "disabled" : ""} title="Remove this record">×</button>
</div>`;
    })
    .join("");
  const summaries = evidenceOrganizingSectionSummaries(fields);
  const directionsBody = `<p class="manage-content-help-text manage-content-directions">${esc(questHint("evidence-organizing", {}))}</p>`;
  const questionBody = `<label>Prompt<textarea data-authoring-field="prompt" rows="2">${esc(fields.prompt)}</textarea></label>`;
  const answersBody = `<div class="manage-content-field-label">Slots — the categories students sort evidence into</div>
<div class="manage-content-row-list" data-authoring-rows="slots">${slotRows}</div>
<button type="button" class="manage-content-add-row-btn" data-action="add-evidence-slot">+ Add slot</button>
<div class="manage-content-field-label">Evidence records</div>
<p class="manage-content-help-text">Each record needs a "Skill" — the real College Board historical-thinking skill (the four reasoning "Cs" plus Sourcing) this piece of evidence is meant to demonstrate. It's not a label for your own reference: it's the category the activity is actually graded against.</p>
<div class="manage-content-row-list" data-authoring-rows="sources">${sourceRows}</div>
<button type="button" class="manage-content-add-row-btn" data-action="add-evidence-source">+ Add evidence record</button>
<label>Reflection prompt (optional)<textarea data-authoring-field="reflectionPrompt" rows="2">${esc(fields.reflectionPrompt)}</textarea></label>`;
  return [
    manageContentEditorSectionMarkup("directions", "Student directions", {
      body: directionsBody,
      collapsible: false,
    }),
    manageContentEditorSectionMarkup("question", "Question", {
      summary: summaries.question,
      body: questionBody,
    }),
    manageContentEditorSectionMarkup(
      "answers",
      "Answer structure — evidence records (each with its own source)",
      {
        summary: summaries.answers,
        body: answersBody,
      }
    ),
  ].join("");
}

// Exception to the guided-section order the other 3 quest types use: HIPP
// has no single top-level editable prompt text (buildHippContent() sets a
// fixed instruction string) — each dimension's "argument" is itself part of
// that dimension's prompt block, so there's no standalone Question section
// here. Bundling argument+options together under "Answer structure" also
// matches renderSourceAnalysisQuest()'s own real order (document, then each
// dimension's argument+options together).
function hippFieldsMarkup(fields) {
  const prompts = fields.hippPrompts || [];
  const dimensionOptions = (currentDimension) =>
    HIPP_DIMENSIONS.map(
      (d) =>
        `<option value="${esc(d)}" ${currentDimension === d ? "selected" : ""}>${esc(d)}</option>`
    ).join("");
  const promptBlocks = prompts
    .map((prompt, pi) => {
      const options = prompt.options || [];
      const optionRows = options
        .map(
          (option, oi) => `<div class="manage-content-hipp-option-row">
<button type="button" class="manage-content-row-move-btn" data-action="move-hipp-option" data-prompt-index="${pi}" data-row-index="${oi}" data-direction="-1" ${oi === 0 ? "disabled" : ""} title="Move up">↑</button>
<button type="button" class="manage-content-row-move-btn" data-action="move-hipp-option" data-prompt-index="${pi}" data-row-index="${oi}" data-direction="1" ${oi === options.length - 1 ? "disabled" : ""} title="Move down">↓</button>
<input type="radio" name="hipp-correct-${pi}" data-hipp-correct ${option.correct ? "checked" : ""} title="Mark as the correct option">
<label class="manage-content-inline-checkbox"><input type="checkbox" data-hipp-identification ${option.identificationOnly ? "checked" : ""}> Names it, but doesn't explain why</label>${helpIconMarkup(MANAGE_CONTENT_HIPP_ID_ONLY_HELP)}
<input type="text" data-hipp-option-text value="${esc(option.text)}" placeholder="Option text">
<button type="button" class="manage-content-row-delete-btn" data-action="remove-hipp-option" data-prompt-index="${pi}" data-row-index="${oi}" ${options.length <= 3 ? "disabled" : ""} title="Remove this option">×</button>
</div>`
        )
        .join("");
      return `<div class="manage-content-hipp-prompt-block">
<div class="manage-content-hipp-prompt-head">
<select data-hipp-dimension title="HIPP dimension">${dimensionOptions(prompt.dimension)}</select>
<button type="button" class="manage-content-row-delete-btn" data-action="remove-hipp-prompt" data-row-index="${pi}" ${prompts.length <= 1 ? "disabled" : ""} title="Remove this prompt">×</button>
</div>
<label>Argument this dimension connects to${helpIconMarkup(MANAGE_CONTENT_HIPP_ARGUMENT_HELP)}<textarea data-hipp-argument rows="2" placeholder="e.g. Newspapers built broad public support for ratifying the Constitution">${esc(prompt.argument)}</textarea></label>
<div class="manage-content-row-list">${optionRows}</div>
<button type="button" class="manage-content-add-row-btn" data-action="add-hipp-option" data-prompt-index="${pi}" ${options.length >= 6 ? "disabled" : ""}>+ Add option</button>
</div>`;
    })
    .join("");
  const summaries = hippSectionSummaries(fields);
  const sourceBody = `${sourceSelectorFieldMarkup("hipp", 'data-copy-hipp-source data-authoring-field="hippSourcePoolValue"', fields.hippSourcePoolValue, "required")}
${selectedSourceSummaryCardMarkup("hipp", fields.hippSourcePoolValue, fields.documentText, contentUiState.slot, "required")}
${sourceTextToolMarkup("hipp", fields.hippSourcePoolValue, fields.documentText, 'data-authoring-field="documentText"')}
<label>Document attribution<input type="text" data-authoring-field="documentAttribution" value="${esc(fields.documentAttribution)}"></label>`;
  const directionsBody = `<p class="manage-content-help-text manage-content-directions">${esc(questHint("hipp", {}))}</p>`;
  const answersBody = `<div class="manage-content-field-label">HIPP prompts — one per dimension analyzed</div>
<p class="manage-content-help-text">Each prompt needs exactly one fully <strong>correct</strong> option (names the right answer <em>and</em> explains how it shapes the document's argument) and at least one option that <strong>names it, but doesn't explain why</strong> — a wrong answer that correctly identifies the right person/place/context but doesn't connect it to the argument. This mirrors the real AP DBQ rubric rule: identification alone scores zero.</p>
<div class="manage-content-row-list" data-authoring-rows="hippPrompts">${promptBlocks}</div>
<button type="button" class="manage-content-add-row-btn" data-action="add-hipp-prompt" ${prompts.length >= 2 ? "disabled" : ""}>+ Add HIPP prompt</button>`;
  return [
    manageContentEditorSectionMarkup("source", "Source & stimulus", {
      summary: summaries.source,
      body: sourceBody,
    }),
    manageContentEditorSectionMarkup("directions", "Student directions", {
      body: directionsBody,
      collapsible: false,
    }),
    manageContentEditorSectionMarkup("answers", "Answer structure — HIPP prompts", {
      summary: summaries.answers,
      body: answersBody,
    }),
  ].join("");
}

function authoringFieldsMarkup(auth) {
  const { slotKind, fields } = auth;
  const body =
    slotKind === "mcq"
      ? mcqFieldsMarkup(fields)
      : slotKind === "sequencing"
        ? sequencingFieldsMarkup(fields)
        : slotKind === "evidence-organizing"
          ? evidenceOrganizingFieldsMarkup(fields)
          : hippFieldsMarkup(fields);
  return `<div class="manage-content-section-head"><span class="manage-content-section-icon">${esc(QUEST_TYPE_ICONS[slotKind] || "")}</span><span>${esc(QUEST_TYPE_DISPLAY_NAMES[slotKind] || "")}</span>${manageContentHelpTriggerMarkup(slotKind)}</div>${body}`;
}

// Maps a sourceTextToolMarkup() fieldKey to the pool-value and target-text
// getter/setter it drives on a synced `fields` object — the single place
// that knows which flat field each of the highlight tool's four call sites
// (hipp's documentText, an evidence-organizing row's excerpt, mcq/
// sequencing's optional relatedSourceExcerpt) actually reads/writes, so the
// toggle/undo/redo/use-excerpt click handlers stay generic across all of
// them. Returns null for a key with no known target (defensive — every real
// fieldKey the UI renders has one).
function resolveTextToolTarget(fieldKey, fields) {
  if (fieldKey === "hipp") {
    return {
      poolValue: fields.hippSourcePoolValue,
      set: (value) => {
        fields.documentText = value;
      },
    };
  }
  if (fieldKey === "mcq") {
    return {
      poolValue: fields.mcqSourcePoolValue,
      set: (value) => {
        fields.relatedSourceExcerpt = value;
      },
    };
  }
  if (fieldKey === "sequencing") {
    return {
      poolValue: fields.sequencingSourcePoolValue,
      set: (value) => {
        fields.relatedSourceExcerpt = value;
      },
    };
  }
  if (fieldKey.startsWith("evidence-")) {
    const rowIndex = Number(fieldKey.slice("evidence-".length));
    const row = fields.sources?.[rowIndex];
    if (!row) return null;
    return {
      poolValue: row.sourcePoolValue,
      set: (value) => {
        row.excerpt = value;
      },
    };
  }
  return null;
}

// Renders either the 4-card activity-type picker (Replace, before a type is
// chosen) or the field editor for the currently chosen slotKind — no
// Save/Cancel/Preview actions of its own, since those differ between Edit's
// single always-open editor and Replace's type-picker -> editor progression
// (see manageContentWorkspaceStepMarkup(), the caller).
function manageContentAuthoringFormMarkup() {
  const auth = manageContentAuthoring;
  if (!auth) return "";
  if (!auth.slotKind) {
    const typeCards = Object.entries(QUEST_TYPE_DISPLAY_NAMES)
      .map(
        ([key, name]) =>
          `<div class="manage-content-type-card"><button class="manage-content-type-card-pick" data-action="pick-question-type" data-slot-kind="${esc(key)}" type="button"><strong>${esc(name)}</strong><span>${esc(QUEST_TYPE_DESCRIPTIONS[key])}</span></button>${manageContentHelpTriggerMarkup(key)}</div>`
      )
      .join("");
    return `<div class="manage-content-authoring-form manage-content-type-picker">
<div class="manage-content-type-picker-options">${typeCards}</div>
</div>`;
  }
  return `<div class="manage-content-authoring-form">
<div id="manage-content-sources-anchor"></div>
${manageContentValidationSummaryMarkup(auth.slotKind, auth.errors)}
<div data-authoring-form>
${authoringFieldsMarkup(auth)}
</div>
</div>`;
}

// Single source of truth for whether "Preview as student" can show anything
// real: a map case always can (the real field screen); any other non-map
// case only if it has a case-level archiveChallenge (the only thing
// archiveChallengesScreen() actually renders per case, see enterContentPreview()
// below). Deliberately does NOT include addition-slot/hasEditableContent —
// those aren't read by any student-facing screen (see Phase 3 of the
// Manage Content redesign), so a case with only addition-slot content and
// no archiveChallenge has nothing to preview yet, and the button must say so.
function caseIsPreviewable(kase) {
  if (kase.route === "field") return true;
  return Boolean(kase.archiveChallenge);
}

// Pure status-derivation for the command bar's status badge — entirely
// derived from data loadManageContentCaseData() already loaded, plus the
// transient pending/lastActionFailed/draftSavedSincePublish flags set
// around each save/publish action (see save-authoring-draft/
// save-and-publish-authoring/keep-and-publish/restore-standard-version in
// handleManageContentClick()). publishCaseSelections() copies the draft
// row's value into a *separate* published row rather than replacing/
// clearing the draft row (see remote-content-selection-repository.js), so a
// slot whose draft and published ids match has generally been published
// as-is. That id comparison alone has one known blind spot: editing an
// *already*-customized slot further reuses its existing custom_content_
// items row (persistAuthoringSelection()'s canReuseExistingCustomRow)
// rather than creating a new one, so draftAltId doesn't change even though
// the row's content just did — draftSavedSincePublish is the accurate
// signal for that case, since the data model itself keeps no per-save
// content history to detect it from ids alone. Takes these as explicit
// params (rather than reading contentUiState directly) so this stays a
// plain, directly testable function — see tests/unit/
// main-manage-content-navigation.test.js.
export function manageContentSlotStatus(slot, pending, lastActionFailed, draftSavedSincePublish) {
  if (pending) return { key: "saving", label: "Saving…" };
  if (lastActionFailed === "save") return { key: "failed", label: "Save failed" };
  if (lastActionFailed === "publish") return { key: "failed", label: "Publish failed" };
  if (!slot) return { key: "none", label: "No activity yet" };
  if (draftSavedSincePublish)
    return { key: "draft", label: "Draft changes (not yet visible to students)" };
  if (!slot.draftAltId && !slot.publishedAltId)
    return { key: "official", label: "Official version" };
  if (slot.draftAltId === slot.publishedAltId) return { key: "published", label: "Published" };
  return { key: "draft", label: "Draft changes (not yet visible to students)" };
}

function statusBadgeMarkup(key, label) {
  return `<span class="manage-content-status-badge" data-status-key="${esc(key)}" role="status" aria-live="polite">${esc(label)}</span>`;
}

// "Manage Content › Unit N: Title › Case N.NN — Name" — reuses the exact
// same title-resolution helpers (resolvedUnitTitle/resolvedCaseTitle)
// already shown on the mission list so wording never drifts from it. The
// first segment reuses the existing back-to-teacher-dashboard action; the
// other two render as plain text since there's no intermediate "this
// unit's missions" screen to link to.
function manageContentBreadcrumbMarkup(activeCase) {
  const unit = activeCase ? unitForCase(activeCase.id) : null;
  const unitLabel = unit ? `Unit ${Number(unit.id.split("-")[1])}: ${resolvedUnitTitle(unit)}` : "";
  const caseLabel = activeCase ? resolvedCaseTitle(activeCase) : "";
  const segments = [
    `<button type="button" class="text-button" data-action="back-to-teacher-dashboard">Manage Content</button>`,
    unitLabel ? esc(unitLabel) : "",
    caseLabel ? esc(caseLabel) : "",
  ].filter(Boolean);
  return `<nav class="manage-content-breadcrumb" aria-label="Manage Content navigation">${segments.join('<span aria-hidden="true"> › </span>')}</nav>`;
}

// Which action "Preview as student" should trigger from the command bar —
// only Map Missions (route === "field") need it, since they have no other
// preview entry point in the body. Every non-field wizard step already
// surfaces its own contextual preview action right where it's relevant
// ("Preview Standard Mission →" at step 1, the live preview that step 2
// simply *is*, "Preview Changes"/"Preview Replacement" in the edit/replace
// workspace, "Preview Published Mission" on the published step), so a
// second persistent copy in the header would just be a duplicate button
// sitting next to the one that actually matters. Returns null (caller
// hides the button entirely) whenever a preview session is already active
// too — the banner's own "Exit preview" covers that case.
function manageContentPreviewActionForStep(activeCase) {
  if (isPreviewingContent()) return null;
  if (activeCase.route === "field") return "toggle-content-preview";
  return null;
}

// Wraps chrome() + the command bar in one position:fixed header so the bar
// stays visible while scrolling a long authoring form. Deliberately fixed,
// not sticky: this app's shared `html, body { overflow-x: hidden; }` rule
// (added for the hub-shell layout) forces body's computed overflow-y to
// "auto" per the CSS Overflow spec (an axis can't stay visible once the
// other is clipped), which makes body an unintended, non-scrolling sticky
// containing block — position:sticky measurably fails to stick against it.
// position:fixed sidesteps that entirely (same pattern already used by
// .author-panel/.scene-fade elsewhere in this file) at the cost of taking
// the header out of flow — see manage-content-shell's matching padding-top
// override in global.css.
function manageContentFixedHeaderMarkup(activeCase) {
  return `<div class="manage-content-fixed-header">${chrome()}${manageContentCommandBarMarkup(activeCase)}</div>`;
}

// Command bar content for every Manage Content mission-editing screen — the
// one place a teacher can always find where they are (breadcrumb), the
// mission's save/publish status, and the two escape hatches ("Change
// source pool", "Preview as student") that used to only exist buried
// inside specific wizard steps. Composed once here so none of the wizard
// steps or the Map Mission lock view can drift out of sync with each other.
// Rendered inside manageContentFixedHeaderMarkup()'s fixed wrapper above,
// which is what actually keeps it on screen while scrolling.
function manageContentCommandBarMarkup(activeCase) {
  const breadcrumb = manageContentBreadcrumbMarkup(activeCase);
  if (!activeCase) {
    return `<div class="manage-content-command-bar">${breadcrumb}</div>`;
  }
  const unit = unitForCase(activeCase.id);
  const unitNumber = unit ? Number(unit.id.split("-")[1]) : null;
  const sourcePoolButton = unitNumber
    ? `<button type="button" class="btn btn-outline" data-action="go-to-sources-tab" data-unit="${unitNumber}">Change source pool</button>`
    : "";
  const previewAction = manageContentPreviewActionForStep(activeCase);
  const previewButton =
    caseIsPreviewable(activeCase) && previewAction
      ? `<button type="button" class="btn btn-outline" data-action="${previewAction}">Preview as student</button>`
      : "";
  const slot = activeCase.route === "field" ? null : contentUiState.slot;
  const status =
    activeCase.route === "field"
      ? { key: "official", label: "Official version" }
      : manageContentSlotStatus(
          slot,
          contentUiState.pending,
          contentUiState.lastActionFailed,
          contentUiState.draftSavedSincePublish
        );
  return `<div class="manage-content-command-bar">
${breadcrumb}
<div class="manage-content-command-bar-actions">
${sourcePoolButton}
${previewButton}
${statusBadgeMarkup(status.key, status.label)}
</div>
</div>`;
}

// Vertical "Mission / Preview / Edit or Replace / Publish" journey rail —
// a pure status display, never clickable. Earlier versions of this made
// "Sources"/"Questions" secretly-clickable scroll anchors alongside two
// inert stages, with no visual difference between the two — teachers
// mistook the inert stages for buttons. Sources/Questions were never real
// wizard steps anyway (both live inside the single edit/replace workspace
// step's one-page form), so that jump behavior now lives as an obvious
// in-page "Jump to:" link pair inside manageContentWorkspaceStepMarkup()
// instead of pretending to be journey navigation here. Suppressed for Map
// Missions (no wizard exists there) and before case data has loaded.
function manageContentStepIndicatorMarkup(activeCase) {
  if (!activeCase || activeCase.route === "field") return "";
  const step = contentUiState.wizardStep || "name";
  const inWorkspace = step === "edit" || step === "replace";
  const steps = [
    { label: "Mission", current: step === "name", done: step !== "name" },
    { label: "Preview", current: false, done: step !== "name" },
    { label: inWorkspace ? "Editing" : "Edit or Replace", current: inWorkspace, done: false },
    {
      label: "Publish",
      current: step === "preview" || step === "published",
      done: step === "published",
    },
  ];
  const items = steps
    .map(({ label, current, done }) => {
      const cls = `c-step${done ? " is-done" : ""}`;
      const currentAttr = current ? ' aria-current="step"' : "";
      return `<li class="${cls}"${currentAttr}>${done ? "✓ " : ""}${esc(label)}</li>`;
    })
    .join("");
  return `<ol class="manage-content-journey c-steps">${items}</ol>`;
}

function manageContentCaseScreen() {
  if (!currentProfile || currentProfile.role !== "teacher") {
    return `${manageContentFixedHeaderMarkup(null)}<main class="shell manage-content-shell c-app"><section>${pageHeaderMarkup(
      {
        eyebrow: BRAND.engine,
        title: "Manage Content",
        description: "Sign in as a teacher to manage content.",
        actions: [
          { label: "Teacher Sign In →", action: "open-teacher-login", variant: "secondary" },
        ],
      }
    )}</section></main>${authorPanel()}`;
  }
  const activeCase = caseById(contentUiState.selectedCaseId);
  if (!activeCase) {
    return `${manageContentFixedHeaderMarkup(null)}<main class="shell manage-content-shell c-app"><section>${pageHeaderMarkup(
      {
        eyebrow: BRAND.engine,
        title: "Manage Content",
        description: contentUiState.error || "Loading case…",
      }
    )}</section></main>${authorPanel()}`;
  }
  // Map Missions are entirely fixed content — the walkable map, its NPCs/
  // sources, and its Practice Check questions are all locked — so this is
  // the only screen a Map Mission ever shows here: no wizard, no edit/
  // replace controls, just a name field. The command bar's own "Preview as
  // student"/breadcrumb now cover what the old inline "Student Preview"/
  // "Back" buttons used to.
  if (activeCase.route === "field") {
    return `${manageContentFixedHeaderMarkup(activeCase)}<main class="shell manage-content-shell c-app"><section>
${pageHeaderMarkup({ eyebrow: caseNumberLabel(activeCase) || activeCase.shortTitle, title: resolvedCaseTitle(activeCase) })}
${missionRenameControlMarkup(activeCase)}
<p class="locked-note">LOCKED — this mission's map, NPCs, sources, and questions are fixed and can't be edited or replaced.</p>
</section></main>${authorPanel()}${sourceFullTextDialogMarkup()}${manageContentWarningDialogMarkup()}${manageContentHelpDrawerMarkup()}`;
  }
  const step = contentUiState.wizardStep || "name";
  const stepMarkup =
    step === "preview"
      ? manageContentPreviewStepMarkup(activeCase)
      : step === "edit" || step === "replace"
        ? manageContentWorkspaceStepMarkup(activeCase)
        : step === "published"
          ? manageContentPublishedStepMarkup(activeCase)
          : manageContentNameStepMarkup(activeCase);
  return `${manageContentFixedHeaderMarkup(activeCase)}<main class="shell manage-content-shell c-app"><div class="manage-content-layout">
<aside class="manage-content-journey-rail">${manageContentStepIndicatorMarkup(activeCase)}</aside>
<section>
${stepMarkup}
</section>
</div></main>${authorPanel()}${sourceFullTextDialogMarkup()}${manageContentWarningDialogMarkup()}${manageContentHelpDrawerMarkup()}`;
}

// Shared "case number / mission name / description" block every wizard step
// opens with. Navigation (breadcrumb, back-to-dashboard) now lives in the
// command bar above (see manageContentCommandBarMarkup()), so this only
// carries the help icon and mission identity.
function manageContentWizardHeaderMarkup(activeCase) {
  const caseNumber = caseNumberLabel(activeCase);
  return `<div class="manage-content-wizard-header-top">${helpIconMarkup(MANAGE_CONTENT_WIZARD_HELP_TEXT)}</div>
${pageHeaderMarkup({
  eyebrow: caseNumber || activeCase.shortTitle,
  title: resolvedCaseTitle(activeCase),
  description: activeCase.summary,
})}`;
}

// Step 1 — "Mission Overview": the only thing a teacher sees before
// committing to look at this mission's content at all — name (editable) and
// a single "Preview Standard Mission" button. Nothing about editing or
// replacing shows here; that choice only appears after previewing.
function manageContentNameStepMarkup(activeCase) {
  return `${manageContentWizardHeaderMarkup(activeCase)}
${missionRenameControlMarkup(activeCase)}
${feedbackError(contentUiState)}
<button class="btn btn-gold" data-action="wizard-go-preview" type="button">Preview Standard Mission →</button>`;
}

// Step 2 — "Student Preview": the case's one Archive Challenge activity,
// live and fully interactive (see enterContentPreview()'s inline mode —
// grading/save() both no-op while previewSession is active, so nothing a
// teacher does here reaches real student data), followed by the one
// mission-level decision. Map Missions never reach this step — see
// manageContentCaseScreen()'s route === "field" branch above.
function manageContentPreviewStepMarkup(activeCase) {
  const slot = contentUiState.slot;
  const previewBody = slot
    ? `<div class="manage-content-live-preview">${archiveChallengeCard(`Student view — ${QUEST_TYPE_DISPLAY_NAMES[slot.slotKind] || ""}`, slot.slotKind, slot.officialId)}</div>`
    : `<p class="case-summary-note">This mission has no activity configured yet.</p>`;
  return `${manageContentWizardHeaderMarkup(activeCase)}
${previewBody}
${feedbackError(contentUiState)}
<div class="manage-content-wizard-choice">
<p class="manage-content-wizard-choice-prompt">Use this mission?</p>
<div class="manage-content-wizard-choice-actions">
<button class="btn btn-gold" data-action="keep-and-publish" type="button">Keep &amp; Publish</button>
<button class="btn btn-outline" data-action="wizard-go-edit" type="button">Edit This Activity</button>
<button class="btn btn-outline" data-action="wizard-go-replace" type="button">Replace Activity</button>
</div>
</div>
<button class="back-link" data-action="wizard-go-name" type="button">← Back</button>`;
}

// Step 3A — "Published": explicit confirmation after any of the three
// publish paths (Keep & Publish, Edit's Save & Publish, Replace's
// Save & Publish, or Restore Standard Version) — a teacher should never be
// silently dropped back at the case list after publishing.
function manageContentPublishedStepMarkup(activeCase) {
  if (isPreviewingContent()) {
    const slot = contentUiState.slot;
    return `${manageContentWizardHeaderMarkup(activeCase)}
<div class="manage-content-live-preview">${slot ? archiveChallengeCard(`Student view — ${QUEST_TYPE_DISPLAY_NAMES[slot.slotKind] || ""}`, slot.slotKind, slot.officialId) : ""}</div>
<button class="back-link" data-action="exit-content-preview" type="button">← Back</button>`;
  }
  return `${manageContentWizardHeaderMarkup(activeCase)}
<p class="manage-content-published-banner">Published — ${esc(resolvedCaseTitle(activeCase))} is now available to students.</p>
<div class="manage-content-wizard-choice-actions">
<button class="btn btn-gold" data-action="back-to-teacher-dashboard" type="button">Return to Cases</button>
<button class="btn btn-outline" data-action="preview-published-mission" type="button">Preview Published Mission</button>
</div>`;
}

// Steps 3B ("edit") and 3C ("replace") — every non-map mission has exactly
// one official quest slot (its Archive Challenge, see
// officialQuestSlotsForCase()'s doc comment), so both steps work on that
// one slot's single editor: no slot list, no "add new question." "Edit
// This Activity" opens straight into the existing type's editor
// (wizard-go-edit); "Replace Activity" opens the 4-card type picker first
// (wizard-go-replace) and always builds a fresh custom replacement from
// scratch — there is no curated-alternate picker here (a small pool of
// pre-authored alternates per case/slot still exists as content files and
// still resolves correctly if an old published selection points at one, but
// the UI to pick a new one was intentionally removed in the wizard redesign
// this shipped against and is not being restored as part of Phase 3; see
// the Phase 3 plan's "Choose an alternative" limitation note). While
// previewing in-progress changes (see "preview-authoring-changes" in
// handleManageContentClick()), this step shows that ephemeral preview
// instead of the editor.
// One-line summary of whether/how a source is attached for the status bar
// at the bottom of the workspace step — hipp/evidence-organizing always
// carry source text (it's central to those two types), mcq/sequencing's is
// the new optional relatedSource from section B of the facelift plan.
function sourceHandlingStatusLabel(slotKind, fields) {
  if (slotKind === "hipp" || slotKind === "evidence-organizing") return "Full text + excerpt";
  return fields?.relatedSourceExcerpt
    ? "Full text + excerpt (optional)"
    : "Not attached (optional)";
}

function manageContentWorkspaceStepMarkup(activeCase) {
  const isReplace = contentUiState.wizardStep === "replace";
  const slot = contentUiState.slot;
  const auth = manageContentAuthoring;
  if (isPreviewingContent()) {
    return `${manageContentWizardHeaderMarkup(activeCase)}
<div class="manage-content-live-preview">${auth?.previewQuest ? archiveChallengeQuestCard(`Student view — ${QUEST_TYPE_DISPLAY_NAMES[auth.slotKind] || ""}`, auth.slotKind, auth.previewQuest) : ""}</div>
<button class="back-link" data-action="exit-content-preview" type="button">← Back to editing</button>`;
  }
  const typeChosen = Boolean(auth?.slotKind);
  const heading = !typeChosen
    ? "Choose an activity type"
    : `${isReplace ? "Replace with" : "Edit"} ${esc(QUEST_TYPE_DISPLAY_NAMES[auth.slotKind])} Activity`;
  const showRestore = !isReplace && Boolean(slot?.latestCustomAltId);
  return `${manageContentWizardHeaderMarkup(activeCase)}
<h2 class="manage-content-editor-heading">${heading}</h2>
${isReplace && !typeChosen ? "<p>Choose the activity students will complete for this mission.</p>" : ""}
${typeChosen ? `<p class="manage-content-jump-links">Jump to: <button type="button" class="text-button" data-action="focus-manage-content-sources">Sources</button> · <button type="button" class="text-button" data-action="focus-manage-content-questions">Questions</button></p>` : ""}
${manageContentAuthoringFormMarkup()}
${feedbackError(contentUiState)}
${feedbackSuccess(contentUiState)}
${
  typeChosen
    ? `<div id="manage-content-questions-anchor" class="manage-content-authoring-actions">
<button class="btn btn-outline" data-action="preview-authoring-changes" type="button" ${contentUiState.pending ? "disabled" : ""}>${isReplace ? "Preview Replacement" : "Preview Changes"}</button>
<button class="btn btn-outline" data-action="save-authoring-draft" type="button" ${contentUiState.pending ? "disabled" : ""}>Save Draft</button>
<button class="btn btn-gold" data-action="save-and-publish-authoring" type="button" ${contentUiState.pending ? "disabled" : ""}>Publish</button>
</div>
${isReplace ? `<button class="btn btn-plain" data-action="replace-choose-type" type="button">← Back to activity types</button>` : ""}
${showRestore ? `<button class="btn btn-plain" data-action="restore-standard-version" type="button">Restore Standard Version</button>` : ""}
<div class="manage-content-status-bar">
${chip({ label: `Published Mission: ${slot?.publishedAltId ? "Customized" : "Standard"}` })}
${chip({ label: "Student View: Ready" })}
${chip({ label: `Source: ${sourceHandlingStatusLabel(auth.slotKind, auth.fields)}` })}
</div>`
    : ""
}
<button class="btn btn-plain" data-action="cancel-authoring" type="button">Cancel</button>`;
}

async function loadManageContentCaseData(caseId) {
  contentUiState.selectedCaseId = caseId;
  contentUiState.error = "";
  const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
  const kase = caseById(caseId);
  // Map Missions are fully locked — manageContentCaseScreen() never renders
  // slot UI for them, so there's nothing worth a network round-trip for.
  if (kase?.route === "field") {
    render();
    return;
  }
  const unit = unitForCase(caseId);
  const unitNumber = unit ? Number(unit.id.split("-")[1]) : null;
  // Lazy-load this unit's Sources-tab pool (same cache the Sources tab
  // itself populates, teacherUiState.sourcePoolByUnit) so the authoring
  // form's "Select source" picker has real options — fire-and-forget, same
  // pattern as toggle-sources-unit's lazy load, so it doesn't block the
  // slot-list fetch below.
  if (
    unitNumber &&
    teacherUiState.selectedClassroomId &&
    teacherUiState.sourcePoolByUnit[unitNumber] === undefined
  ) {
    teacherUiState.sourcePoolLoadingUnits.add(unitNumber);
    getUnitSourcePool(teacherUiState.selectedClassroomId, unitNumber)
      .then((pool) => {
        teacherUiState.sourcePoolByUnit[unitNumber] = pool;
        teacherUiState.sourcePoolLoadingUnits.delete(unitNumber);
        render();
      })
      .catch((err) => {
        teacherUiState.sourcePoolLoadingUnits.delete(unitNumber);
        catchUiError(teacherUiState, "Could not load this unit's source pool.")(err);
      });
  }
  try {
    const classroomId = teacherUiState.selectedClassroomId;
    const [rows, customItems] = await Promise.all([
      listSelectionsForCase(classroomId, caseId),
      listCustomContentForCase(classroomId, caseId),
    ]);
    const bySlot = {};
    for (const row of rows) {
      const key = `${row.slot_kind}:${row.slot_content_id}`;
      (bySlot[key] ??= {})[row.status] = {
        id: row.alt_content_id,
        kind: row.alt_kind || "curated",
      };
    }
    const customById = new Map(customItems.map((item) => [item.id, item]));
    // Keyed by the replaced official id alone (never type-prefixed) —
    // unlike bySlot's key, a replacement's own item.slot_kind may
    // legitimately differ from the official slot's type it replaces (a
    // teacher swapping in a different quest type — see
    // resolveQuestSlotWithType() in remote-content-selection-repository.js),
    // so it can't be part of the lookup key. Official quest/source ids are
    // globally unique, case-prefixed strings, so this stays unambiguous.
    const customReplacementsBySlot = {};
    for (const item of customItems) {
      if (item.mode !== "replacement") continue;
      (customReplacementsBySlot[item.replaces_official_id] ??= []).push(item);
    }

    const officialSlot = officialQuestSlotsForCase(caseId)[0];
    if (!officialSlot) {
      contentUiState.slot = null;
    } else {
      const { questType, quest } = officialSlot;
      const key = `${questType}:${quest.id}`;
      const draft = bySlot[key]?.draft || null;
      const published = bySlot[key]?.published || null;
      const replacementItems = customReplacementsBySlot[quest.id] || [];
      // Which custom replacement row "Restore Standard Version" un-does when
      // the draft isn't currently pointed at a custom row at all (e.g.
      // already reverted to official) — the most recently saved/updated
      // one, since a slot only ever holds one teacher-built replacement at
      // a time even though old rows aren't deleted on a type change.
      const latestCustomAltId = replacementItems.length
        ? [...replacementItems].sort(
            (a, b) =>
              new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
          )[0].id
        : null;
      const previewContent =
        draft && draft.kind === "custom"
          ? customById.get(draft.id)?.content || quest
          : draft
            ? questAlternateById(questType, draft.id) || quest
            : quest;
      // What this slot is currently authored/rendered as — usually
      // questType (the stable official type), but a custom draft's own
      // slot_kind can genuinely differ (a teacher-authored type-changing
      // replacement — see resolveQuestSlotWithType() in
      // remote-content-selection-repository.js for the student-facing
      // equivalent).
      const currentSlotKind =
        draft && draft.kind === "custom"
          ? customById.get(draft.id)?.slot_kind || questType
          : questType;
      contentUiState.slot = {
        slotKind: questType,
        currentSlotKind,
        officialId: quest.id,
        officialLabel: quest.prompt,
        draftAltId: draft?.id || null,
        draftAltKind: draft?.kind || "curated",
        publishedAltId: published?.id || null,
        latestCustomAltId,
        previewContent,
      };
    }
  } catch (err) {
    reportUiError(contentUiState, err, "Could not load this case's content.");
  }
  render();
  if (typeof window !== "undefined") window.scrollTo(0, scrollY);
}

function currentAuthoringFormEl() {
  return document.querySelector("[data-authoring-form]");
}

// Reads every currently-rendered authoring-form input back into a fresh
// fields object — scalar [data-authoring-field] elements for every slot
// kind, plus each quest type's structured row lists. Must run before any
// add/remove/reorder mutation (which triggers a full re-render from state)
// so sibling rows' already-typed values aren't discarded, and again at Save
// so the persisted content reflects the form's live values.
function syncAuthoringFieldsFromDom(slotKind, formEl) {
  const fields = {};
  formEl.querySelectorAll("[data-authoring-field]").forEach((el) => {
    fields[el.dataset.authoringField] = el.value;
  });
  if (slotKind === "mcq") {
    fields.choices = [
      ...formEl.querySelectorAll('[data-authoring-rows="choices"] .manage-content-mcq-row'),
    ].map((row) => ({
      text: row.querySelector("[data-mcq-text]").value,
      correct: row.querySelector("[data-mcq-correct]").checked,
    }));
  } else if (slotKind === "sequencing") {
    fields.items = [
      ...formEl.querySelectorAll('[data-authoring-rows="items"] .manage-content-sequence-row'),
    ].map((row) => ({
      label: row.querySelector("[data-sequence-text]").value,
      position: Number(row.querySelector("[data-sequence-position-select]").value),
    }));
  } else if (slotKind === "evidence-organizing") {
    fields.slots = [
      ...formEl.querySelectorAll('[data-authoring-rows="slots"] .manage-content-evidence-slot-row'),
    ].map((row) => ({
      label: row.querySelector("[data-slot-label]").value,
    }));
    fields.sources = [
      ...formEl.querySelectorAll(
        '[data-authoring-rows="sources"] .manage-content-evidence-source-row'
      ),
    ].map((row) => ({
      label: row.querySelector("[data-source-label]").value,
      attribution: row.querySelector("[data-source-attribution]").value,
      excerpt: row.querySelector("[data-source-excerpt]").value,
      skillCategory: row.querySelector("[data-source-skill]").value,
      correctSlotId: row.querySelector("[data-source-slot]").value,
      // Which pool source (if any) is picked in this row's "Select source"
      // control — UI-only bookkeeping so the picker keeps showing the
      // chosen source's name after the copy-in re-renders it (see
      // sourceSelectorFieldMarkup()'s doc comment); never part of the saved
      // quest content itself.
      sourcePoolValue: row.querySelector("[data-copy-evidence-source]")?.value || "",
    }));
  } else if (slotKind === "hipp") {
    fields.hippPrompts = [
      ...formEl.querySelectorAll(
        '[data-authoring-rows="hippPrompts"] > .manage-content-hipp-prompt-block'
      ),
    ].map((row) => ({
      dimension: row.querySelector("[data-hipp-dimension]").value,
      argument: row.querySelector("[data-hipp-argument]").value,
      options: [...row.querySelectorAll(".manage-content-hipp-option-row")].map((optionRow) => ({
        text: optionRow.querySelector("[data-hipp-option-text]").value,
        correct: optionRow.querySelector("[data-hipp-correct]").checked,
        identificationOnly: optionRow.querySelector("[data-hipp-identification]").checked,
      })),
    }));
  }
  return fields;
}

// Reorders a sequencing item like a numbered list: pulls the moved row out,
// re-sorts the rest by their existing position, reinserts the moved row at
// the target index, then renumbers everyone 0..n-1 — so a teacher can just
// pick "this is #1" on any row instead of clicking up/down repeatedly.
function reorderSequenceItems(items, movedIndex, targetPosition) {
  const movedItem = items[movedIndex];
  const rest = items.filter((_, i) => i !== movedIndex).sort((a, b) => a.position - b.position);
  const clamped = Math.max(0, Math.min(targetPosition, items.length - 1));
  rest.splice(clamped, 0, movedItem);
  return rest.map((item, i) => ({ ...item, position: i }));
}

// Shared Move Up/Down helper for MCQ choices and HIPP options-per-prompt
// (the two row types the Phase 3 plan adds accessible reordering to —
// sequencing already has reorderSequenceItems()'s position-select, and
// evidence-organizing's order is cosmetic/out of scope). Correctness always
// travels with the row object itself (choice.correct / option.correct), not
// a separately-tracked index, so a plain adjacent-swap is safe for both —
// see buildMcqContent()/buildHippContent() in custom-content-authoring.js,
// which derive `answer`/keep `correct` from the row objects at save time,
// never from array position. Clamps at the array bounds (a no-op past
// either end) rather than wrapping, matching the disabled-button bounds
// already used for the add/remove controls next to it.
export function reorderAuthoringRow(rows, index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= rows.length) return rows;
  const next = [...rows];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

// Validates the open authoring form's current fields and persists them as
// this slot's draft selection (a new or reused custom_content_items
// "replacement" row, then setDraftSelection pointing the slot at it) —
// shared by "save-and-publish-authoring" (which publishes right after) and
// nothing else, since "preview-authoring-changes" builds its ephemeral
// preview straight from the in-memory content instead of persisting
// anything (see manageContentAuthoring.previewQuest's doc comment).
// Returns a Promise resolving once persisted, or null if validation failed
// (errors are already rendered onto the form in that case).
function persistAuthoringSelection() {
  const auth = manageContentAuthoring;
  if (!auth || !auth.slotKind) return null;
  const formEl = currentAuthoringFormEl();
  const fields = syncAuthoringFieldsFromDom(auth.slotKind, formEl);
  const result = buildAuthoredContent(auth.slotKind, fields);
  if (!result.ok) {
    manageContentAuthoring = { ...auth, fields, errors: result.errors };
    render();
    focusManageContentValidationSummary();
    return null;
  }
  const classroomId = teacherUiState.selectedClassroomId;
  const caseId = contentUiState.selectedCaseId;
  // A previously-saved custom row's slot_kind is fixed at creation
  // (updateCustomContent never changes it) — reusing it via update is only
  // safe when the currently-chosen type still matches what it was created
  // as. Picking a genuinely different type (via Replace's type picker)
  // always creates a fresh row instead, even if one already existed for
  // this slot, so its stored slot_kind always matches its content shape.
  const canReuseExistingCustomRow =
    auth.editingCustomId && auth.slotKind === auth.currentSlotKindAtStart;
  const persist = canReuseExistingCustomRow
    ? updateCustomContent(auth.editingCustomId, { content: result.content })
    : createCustomContent({
        classroomId,
        caseId,
        slotKind: auth.slotKind,
        mode: "replacement",
        replacesOfficialId: auth.editingOfficialId,
        content: result.content,
      });
  return persist.then((row) =>
    setDraftSelection(
      classroomId,
      caseId,
      auth.officialSlotKind || auth.slotKind,
      auth.editingOfficialId,
      row.id,
      "custom"
    )
  );
}

// "Save Draft" (Screens 3B/3C) — persists the open form as this slot's draft
// selection without publishing it, so a teacher can save partial work and
// come back to it later. `onSaved` (used by runAfterConfirmingDiscard()'s
// "Save and continue") runs only after the save has actually landed —
// letting a caller navigate away right after a save completes without
// duplicating this function's pending/error handling.
function saveAuthoringDraft(onSaved) {
  const auth = manageContentAuthoring;
  if (!auth?.slotKind) return;
  const caseId = contentUiState.selectedCaseId;
  contentUiState.lastActionFailed = null;
  contentUiState.successMessage = "";
  const persisted = persistAuthoringSelection();
  if (!persisted) return;
  contentUiState.pending = true;
  render();
  persisted
    .then(() => {
      contentUiState.pending = false;
      contentUiState.draftSavedSincePublish = true;
      contentUiState.successMessage = "Draft saved — not yet visible to students.";
      if (manageContentAuthoring) {
        manageContentAuthoring.fieldsAtOpen = manageContentAuthoring.fields;
      }
      return loadManageContentCaseData(caseId);
    })
    .then(() => onSaved?.())
    .catch((err) => {
      contentUiState.pending = false;
      contentUiState.lastActionFailed = "save";
      reportUiError(contentUiState, err, "Could not save this draft.");
      render();
    });
}

// Which resolution ("draft"|"published") each preview-triggering action
// should show — a pure, exported, directly-testable mapping (mirroring
// manageContentSlotStatus()'s pattern) so a caller's label can never drift
// from what enterContentPreview() actually loads. "Preview Published
// Mission" is the fix for a real, confirmed bug: it used to always resolve
// "draft" regardless of its own label, meaning a teacher who published, then
// made further unsaved edits, and then clicked "Preview Published Mission"
// would see those newer edits instead of the actual published content the
// button claims to show. Returns null for actions that don't call
// enterContentPreview() at all (preview-authoring-changes builds its preview
// straight from in-memory form fields — see that branch's own comment).
export function manageContentPreviewResolutionForAction(action) {
  if (action === "preview-published-mission") return "published";
  if (action === "wizard-go-preview" || action === "toggle-content-preview") return "draft";
  return null;
}

// Real "Preview as student" — no bespoke preview markup. Switches the
// resolution cache to `resolution` and, unless `inline` is set, navigates
// into the actual screen a student would land on: the real walkable field
// screen for map missions (fully playable — movement, collision, NPCs,
// Practice Check), or the real Archive Challenges screen for a mission whose
// only editable content is a case-level Archive Challenge. `inline: true`
// (used by the redesigned Manage Content wizard's Screen 2/3A) stays on the
// current screen instead, letting the caller render the same live,
// interactive widget (archiveChallengeCard()) directly inside the wizard —
// exitContentPreview() already handles both cases correctly since it only
// navigates when a snapshot was actually taken. Nothing here is persisted —
// see previewSession's own comment and the save() guard above. `resolution`
// is stored on previewSession so the preview banner can report an accurate
// version label (see contentPreviewVersionLabel()) instead of assuming every
// preview shows draft content.
function enterContentPreview(caseId, { inline = false, resolution = "draft" } = {}) {
  const kase = caseById(caseId);
  if (!kase) return;
  const isMapCase = kase.route === "field";
  if (!caseIsPreviewable(kase)) return;
  loadSelectionsForResolution(teacherUiState.selectedClassroomId, resolution)
    .then(() => {
      if (inline) {
        previewSession = { active: true, snapshot: null, resolution };
        render();
        return;
      }
      previewSession = {
        active: true,
        resolution,
        snapshot: {
          activeCaseId: progress.activeCaseId,
          currentScreen: progress.currentScreen,
          selectedUnitId: progress.selectedUnitId,
          miniGamesEnabled: progress.settings.miniGamesEnabled,
        },
      };
      progress.activeCaseId = caseId;
      progress.settings = { ...progress.settings, miniGamesEnabled: true };
      if (isMapCase) {
        progress.currentScreen = "field";
        resetFieldPosition();
      } else {
        progress.selectedUnitId = unitForCase(caseId)?.id || progress.selectedUnitId;
        // The case's own mission screen as of Phase 58, not the shared Archive Challenges list —
        // a teacher previewing one mission should see that mission, which is the same thing the
        // split gave students.
        progress.currentScreen = "mission";
      }
      render();
    })
    .catch((err) => {
      reportUiError(contentUiState, err, "Could not load the preview.");
      render();
    });
}

function exitContentPreview() {
  const snapshot = previewSession.snapshot;
  previewSession = { active: false, snapshot: null };
  if (snapshot) {
    progress.activeCaseId = snapshot.activeCaseId;
    progress.currentScreen = snapshot.currentScreen;
    progress.selectedUnitId = snapshot.selectedUnitId;
    progress.settings = { ...progress.settings, miniGamesEnabled: snapshot.miniGamesEnabled };
  } else {
    progress.currentScreen = "manage-content-case";
  }
  loadSelectionsForResolution(teacherUiState.selectedClassroomId, "published").then(render);
}

// Shared predicate for the ~6 places that used to read `previewSession.active`
// directly — centralized so every read agrees on what "currently previewing"
// means without each call site reaching into previewSession's internals.
function isPreviewingContent() {
  return previewSession.active;
}

// Shared "escape hatch" guard for the 3 call sites (home, archive-room,
// global Escape) that must exit an active preview instead of performing
// their normal action. Returns whether it handled the click/keypress so
// callers can `if (exitPreviewIfActive()) return ...;`.
function exitPreviewIfActive() {
  if (!isPreviewingContent()) return false;
  exitContentPreview();
  return true;
}

// Maps each Pass 2 <dialog> element's id to the state variable it's driven
// by, for the shared close/native-close handling below.
const MANAGE_CONTENT_DIALOG_IDS = {
  "manage-content-help-dialog": "help",
  "manage-content-warning-dialog": "warning",
  "manage-content-full-source-dialog": "full-source",
};

// The one place any of the three Pass 2 dialogs actually closes — nulls the
// owning state var, re-renders (a fresh, closed <dialog> node replaces the
// modal one, since render() fully replaces app.innerHTML), then restores
// focus to the exact trigger that opened it. Called both by explicit
// close-*-dialog click actions and by the native close/cancel listener below
// (Escape while a <dialog> itself has focus never reaches our own click
// handlers), so both paths always agree on state and focus.
function closeManageContentDialog(kind) {
  let triggerSelector = null;
  if (kind === "help") {
    triggerSelector = manageContentHelpDrawerOpenFor
      ? `[data-action="open-help-drawer"][data-slot-kind="${CSS.escape(manageContentHelpDrawerOpenFor)}"]`
      : null;
    manageContentHelpDrawerOpenFor = null;
  } else if (kind === "warning") {
    triggerSelector = manageContentWarningDialog?.triggerSelector || null;
    manageContentWarningDialog = null;
  } else if (kind === "full-source") {
    triggerSelector = manageContentFullSourceTriggerSelector;
    manageContentViewingFullSourceValue = null;
    manageContentFullSourceTriggerSelector = null;
  }
  render();
  if (triggerSelector) document.querySelector(triggerSelector)?.focus();
}

// <dialog>'s "close"/"cancel" events don't bubble, so this can't be caught by
// the app's one delegated click listener — registered on document with
// {capture:true} instead (see the one-time listener setup near the bottom of
// this file). Fires for every native dialog close (Escape, or a future
// browser affordance), including ones our own click handlers already
// initiated (which null the state before render() ever lets the old modal
// node close) — the "state already null" guard here makes it a no-op for
// those, so this only actually does anything for a close our own code never
// saw coming.
function handleManageContentDialogNativeClose(event) {
  const kind = MANAGE_CONTENT_DIALOG_IDS[event.target?.id];
  if (!kind) return;
  if (kind === "help" && !manageContentHelpDrawerOpenFor) return;
  if (kind === "warning" && !manageContentWarningDialog) return;
  if (kind === "full-source" && !manageContentViewingFullSourceValue) return;
  closeManageContentDialog(kind);
}

// Called once at the tail of render() (see app.innerHTML assignment below).
// A fresh <dialog> node from a just-replaced app.innerHTML is always closed
// (the markup never sets the `open` attribute — see this file's Pass 2
// dialog-plumbing note), so "should be open" is the only direction that ever
// needs action here; a "should be closed" dialog is already exactly that by
// construction. Guarding on `!dialog.open` just avoids a throw from calling
// showModal() twice on the same node in the rare case this runs more than
// once against one render pass.
function syncManageContentNativeDialogs() {
  for (const [id, kind] of Object.entries(MANAGE_CONTENT_DIALOG_IDS)) {
    const dialog = document.getElementById(id);
    if (!dialog || dialog.open) continue;
    const shouldBeOpen =
      kind === "help"
        ? Boolean(manageContentHelpDrawerOpenFor)
        : kind === "warning"
          ? Boolean(manageContentWarningDialog)
          : Boolean(manageContentViewingFullSourceValue);
    if (shouldBeOpen) dialog.showModal();
  }
}

// Display copy only — the actual behavior for each scenario lives in the
// onPrimary/onSecondary closures a caller passes to
// openManageContentWarningDialog(), not here, so this dialog stays generic
// across every call site instead of hardcoding a scenario->action switch.
// `primaryLabel` is null for scenarios with nothing meaningful to "save"
// (e.g. a source pick that hasn't been applied yet) — those render only the
// secondary (discard) action plus Cancel.
const MANAGE_CONTENT_WARNING_SCENARIOS = {
  "leave-editor": {
    message: "You have unsaved changes to this activity. What would you like to do?",
    primaryLabel: "Save and continue",
    secondaryLabel: "Continue without saving",
  },
  "change-source": {
    message:
      "Choosing a different source will replace your customized excerpt with the new source's excerpt. Your current excerpt will be lost.",
    primaryLabel: null,
    secondaryLabel: "Replace source anyway",
  },
  "restore-standard-version": {
    message:
      "This will remove your customized activity and reset it to the official version — including your source, prompt, and excerpt. This can't be undone.",
    primaryLabel: null,
    secondaryLabel: "Restore standard version",
  },
};

// The one place any of Pass 2's unsaved-work warnings actually opens —
// scenarioKey selects display copy only (see the table above); onPrimary/
// onSecondary are real closures the caller supplies (never persisted, plain
// in-memory UI state like previewSession), so this dialog never needs to
// know what any specific call site actually does. triggerSelector is
// whatever CSS selector uniquely identifies the button that opened it, for
// focus-return on Cancel/native-close (see closeManageContentDialog()).
function openManageContentWarningDialog(
  scenarioKey,
  { onPrimary = null, onSecondary, triggerSelector }
) {
  // render() rebuilds the open authoring form's markup straight from
  // manageContentAuthoring.fields — but a field a teacher just typed into
  // only lives in the DOM until something calls syncAuthoringFieldsFromDom()
  // (this app deliberately doesn't sync on every keystroke, to avoid
  // clobbering cursor position/focus mid-typing). Sync now, before the
  // render below that opens this dialog, or an about-to-be-lost edit would
  // already be gone by the time any of this dialog's own actions ran.
  const auth = manageContentAuthoring;
  if (auth?.slotKind) {
    const formEl = currentAuthoringFormEl();
    if (formEl) auth.fields = syncAuthoringFieldsFromDom(auth.slotKind, formEl);
  }
  manageContentWarningDialog = { scenarioKey, onPrimary, onSecondary, triggerSelector };
  render();
}

function manageContentWarningDialogMarkup() {
  const dialog = manageContentWarningDialog;
  const scenario = dialog ? MANAGE_CONTENT_WARNING_SCENARIOS[dialog.scenarioKey] : null;
  const body = scenario
    ? `<h2 id="manage-content-warning-title">Unsaved changes</h2>
<p>${esc(scenario.message)}</p>
<div class="manage-content-warning-dialog-actions">
${scenario.primaryLabel ? `<button type="button" class="btn btn-outline" data-action="warning-dialog-primary">${esc(scenario.primaryLabel)}</button>` : ""}
<button type="button" class="btn btn-gold" data-action="warning-dialog-secondary">${esc(scenario.secondaryLabel)}</button>
<button type="button" class="btn btn-plain" data-action="close-warning-dialog">Cancel</button>
</div>`
    : "";
  return `<dialog id="manage-content-warning-dialog" class="manage-content-warning-dialog" role="alertdialog" aria-labelledby="manage-content-warning-title">
${body}
</dialog>`;
}

// Whether the currently open "edit"/"replace" authoring form has changes
// that haven't been saved yet — compares its live values against a snapshot
// captured once when the form was opened or last saved
// (manageContentAuthoring.fieldsAtOpen, see wizard-go-edit/pick-question-type/
// save-authoring-draft below), so navigation actions can warn before
// silently discarding them (see runAfterConfirmingDiscard()). Only
// meaningful once a slot kind has actually been chosen — the bare
// type-picker step has nothing to lose yet.
function manageContentAuthoringIsDirty() {
  const auth = manageContentAuthoring;
  if (!auth?.slotKind || !auth.fieldsAtOpen) return false;
  const formEl = currentAuthoringFormEl();
  const liveFields = formEl ? syncAuthoringFieldsFromDom(auth.slotKind, formEl) : auth.fields;
  return JSON.stringify(liveFields) !== JSON.stringify(auth.fieldsAtOpen);
}

// Gate for the two navigation actions that could otherwise silently discard
// an open, unsaved authoring form (go-to-sources-tab, back-to-teacher-
// dashboard) — runs `navigateFn` immediately when there's nothing to lose
// (the common case), or opens the styled warning dialog first when
// manageContentAuthoringIsDirty(), whose "Save and continue" persists via
// saveAuthoringDraft() before navigating and whose "Continue without saving"
// navigates straight away. Replaces the previous window.confirm()-based
// confirmDiscardChanges() — a native confirm() can't render custom button
// labels/copy, which the styled dialog needs.
function runAfterConfirmingDiscard(navigateFn, triggerSelector) {
  if (!manageContentAuthoringIsDirty()) {
    navigateFn();
    return;
  }
  openManageContentWarningDialog("leave-editor", {
    onPrimary: () => saveAuthoringDraft(navigateFn),
    onSecondary: navigateFn,
    triggerSelector,
  });
}

// Closing the tab/reloading can't show a custom dialog — browsers ignore any
// text passed here and show their own native prompt — so this stays on the
// plain native mechanism rather than trying to route through
// requestUnsavedChangesDecision(). Only fires when there's genuinely
// something to lose, same guard confirmDiscardChanges() uses.
function handleWindowBeforeUnload(event) {
  if (progress.currentScreen !== "manage-content-case") return;
  if (!manageContentAuthoringIsDirty()) return;
  event.preventDefault();
  event.returnValue = "";
}

// The actual "Restore Standard Version" work — pulled out of the
// restore-standard-version click branch so it can run either immediately
// (no custom content to lose) or deferred behind the warning dialog's
// "Restore standard version" confirmation (see that click branch below).
// Reverts the *entire* custom content item this slot points at (source,
// prompt, choices, excerpt together) — there is no finer-grained per-field
// restore in the data model, see selectedSourceSummaryCardMarkup()'s doc
// comment.
function performRestoreStandardVersion() {
  previewSession = { active: false, snapshot: null };
  const slot = contentUiState.slot;
  if (!slot) return;
  const classroomId = teacherUiState.selectedClassroomId;
  const caseId = contentUiState.selectedCaseId;
  contentUiState.lastActionFailed = null;
  contentUiState.pending = true;
  render();
  setDraftSelection(classroomId, caseId, slot.slotKind, slot.officialId, null, "curated")
    .then(() =>
      publishCaseSelections(classroomId, caseId, [
        { slotKind: slot.slotKind, slotContentId: slot.officialId },
      ])
    )
    .then(() => loadSelectionsForResolution(classroomId, "published"))
    .then(() => {
      contentUiState.pending = false;
      contentUiState.draftSavedSincePublish = false;
      manageContentAuthoring = null;
      contentUiState.wizardStep = "published";
      return loadManageContentCaseData(caseId);
    })
    .catch((err) => {
      contentUiState.pending = false;
      contentUiState.lastActionFailed = "publish";
      reportUiError(contentUiState, err, "Could not restore the standard version.");
      render();
    });
}

function handleManageContentClick(target, action) {
  if (action === "focus-manage-content-sources" || action === "focus-manage-content-questions") {
    const id =
      action === "focus-manage-content-sources"
        ? "manage-content-sources-anchor"
        : "manage-content-questions-anchor";
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  }
  // The selected-source summary card's "Change source"/"Edit student
  // excerpt" actions aren't separate screens/state — they just move focus to
  // the existing controls already rendered just above/below the card, keyed
  // by the same fieldKey convention sourceTextToolMarkup() uses.
  if (action === "focus-source-selector") {
    document
      .querySelector(
        `.manage-content-source-selector[data-field-key="${CSS.escape(target.dataset.fieldKey)}"] select`
      )
      ?.focus();
    return true;
  }
  if (action === "focus-source-excerpt") {
    document
      .querySelector(
        `.manage-content-source-tool[data-field-key="${CSS.escape(target.dataset.fieldKey)}"] textarea`
      )
      ?.focus();
    return true;
  }
  if (action === "view-full-source") {
    manageContentViewingFullSourceValue = target.dataset.sourcePoolValue || null;
    manageContentFullSourceTriggerSelector = `[data-action="view-full-source"][data-field-key="${CSS.escape(target.dataset.fieldKey)}"]`;
    render();
    return true;
  }
  if (action === "close-full-source-dialog") {
    closeManageContentDialog("full-source");
    return true;
  }
  if (action === "open-help-drawer") {
    manageContentHelpDrawerOpenFor = target.dataset.slotKind || null;
    render();
    return true;
  }
  if (action === "close-help-drawer") {
    closeManageContentDialog("help");
    return true;
  }
  // The warning dialog's own 3 actions — see openManageContentWarningDialog()
  // for why onPrimary/onSecondary are plain closures rather than a
  // scenario->behavior switch living here. Cancel goes through
  // closeManageContentDialog() (state null + refocus the trigger); primary/
  // secondary intentionally don't refocus the trigger, since their callbacks
  // typically navigate/persist somewhere else — refocusing a now-irrelevant
  // button would be confusing, consistent with how every other navigation
  // action in this app already behaves.
  if (action === "warning-dialog-primary" || action === "warning-dialog-secondary") {
    const dialog = manageContentWarningDialog;
    manageContentWarningDialog = null;
    render();
    if (action === "warning-dialog-primary") dialog?.onPrimary?.();
    else dialog?.onSecondary?.();
    return true;
  }
  if (action === "close-warning-dialog") {
    closeManageContentDialog("warning");
    return true;
  }
  if (action === "go-to-sources-tab") {
    const unitNumber = Number(target.dataset.unit);
    runAfterConfirmingDiscard(() => {
      teacherUiState.activeTab = "sources";
      teacherUiState.sourcesExpandedUnit = unitNumber;
      progress.currentScreen = "teacher-dashboard";
      save();
      render();
      if (
        teacherUiState.selectedClassroomId &&
        teacherUiState.sourcePoolByUnit[unitNumber] === undefined
      ) {
        getUnitSourcePool(teacherUiState.selectedClassroomId, unitNumber)
          .then((pool) => {
            teacherUiState.sourcePoolByUnit[unitNumber] = pool;
            render();
          })
          .catch(catchUiError(teacherUiState, "Could not load this unit's source pool."));
      }
    }, '[data-action="go-to-sources-tab"]');
    return true;
  }
  if (action === "toggle-manage-content-unit") {
    const unitId = target.dataset.unitId;
    manageContentExpandedUnitId = manageContentExpandedUnitId === unitId ? null : unitId;
    render();
    return true;
  }
  if (action === "open-manage-content-case") {
    contentUiState = {
      selectedCaseId: target.dataset.caseId,
      wizardStep: "name",
      slot: null,
      error: "",
      successMessage: "",
      pending: false,
      lastActionFailed: null,
      draftSavedSincePublish: false,
    };
    manageContentAuthoring = null;
    previewSession = { active: false, snapshot: null };
    progress.currentScreen = "manage-content-case";
    save();
    render();
    loadManageContentCaseData(target.dataset.caseId);
    return true;
  }
  if (action === "wizard-go-name") {
    contentUiState.wizardStep = "name";
    previewSession = { active: false, snapshot: null };
    render();
    return true;
  }
  if (action === "wizard-go-preview") {
    contentUiState.wizardStep = "preview";
    manageContentAuthoring = null;
    enterContentPreview(contentUiState.selectedCaseId, {
      inline: true,
      resolution: manageContentPreviewResolutionForAction(action),
    });
    return true;
  }
  // "Edit This Activity" — opens straight into this mission's one official
  // slot's editor, pre-filled from its current content (official, or a
  // teacher's own draft replacement if one exists) — there's no card list
  // to click into anymore, since a mission has exactly one activity.
  if (action === "wizard-go-edit") {
    contentUiState.wizardStep = "edit";
    previewSession = { active: false, snapshot: null };
    const slot = contentUiState.slot;
    manageContentAuthoring = slot
      ? {
          formMode: "edit",
          slotKind: slot.currentSlotKind || slot.slotKind,
          officialSlotKind: slot.slotKind,
          currentSlotKindAtStart: slot.currentSlotKind || slot.slotKind,
          originalPreviewContent: slot.previewContent,
          editingCustomId: slot.draftAltKind === "custom" ? slot.draftAltId : null,
          editingOfficialId: slot.officialId,
          fields: authoringFieldsFromContent(
            slot.currentSlotKind || slot.slotKind,
            slot.previewContent
          ),
          errors: [],
          previewQuest: null,
          textTools: {},
        }
      : null;
    if (manageContentAuthoring) manageContentAuthoring.fieldsAtOpen = manageContentAuthoring.fields;
    render();
    return true;
  }
  // "Replace Activity" — opens the 4-card type picker for this mission's
  // one official slot (slotKind stays null until "pick-question-type").
  if (action === "wizard-go-replace") {
    contentUiState.wizardStep = "replace";
    previewSession = { active: false, snapshot: null };
    const slot = contentUiState.slot;
    manageContentAuthoring = slot
      ? {
          formMode: "replace",
          slotKind: null,
          officialSlotKind: slot.slotKind,
          currentSlotKindAtStart: slot.currentSlotKind || slot.slotKind,
          originalPreviewContent: slot.previewContent,
          editingCustomId: slot.draftAltKind === "custom" ? slot.draftAltId : null,
          editingOfficialId: slot.officialId,
          fields: {},
          errors: [],
          previewQuest: null,
          textTools: {},
        }
      : null;
    render();
    return true;
  }
  if (action === "replace-choose-type") {
    if (manageContentAuthoring) {
      manageContentAuthoring = {
        ...manageContentAuthoring,
        slotKind: null,
        fields: {},
        errors: [],
        previewQuest: null,
        textTools: {},
      };
    }
    render();
    return true;
  }
  // "Keep & Publish" (Screen 2) — publishes the STANDARD mission regardless
  // of any leftover unpublished draft: clears the slot's draft selection
  // back to official first, then publishes that (a cleared draft makes
  // publishCaseSelections() delete the published row entirely, i.e. revert
  // to official — see remote-content-selection-repository.js).
  if (action === "keep-and-publish") {
    previewSession = { active: false, snapshot: null };
    const slot = contentUiState.slot;
    const classroomId = teacherUiState.selectedClassroomId;
    const caseId = contentUiState.selectedCaseId;
    contentUiState.lastActionFailed = null;
    contentUiState.pending = true;
    render();
    const clearDraft = slot?.draftAltId
      ? setDraftSelection(classroomId, caseId, slot.slotKind, slot.officialId, null, "curated")
      : Promise.resolve();
    clearDraft
      .then(() =>
        publishCaseSelections(
          classroomId,
          caseId,
          slot ? [{ slotKind: slot.slotKind, slotContentId: slot.officialId }] : []
        )
      )
      .then(() => loadSelectionsForResolution(classroomId, "published"))
      .then(() => {
        contentUiState.pending = false;
        contentUiState.draftSavedSincePublish = false;
        contentUiState.wizardStep = "published";
        return loadManageContentCaseData(caseId);
      })
      .catch((err) => {
        contentUiState.pending = false;
        contentUiState.lastActionFailed = "publish";
        reportUiError(contentUiState, err, "Could not publish this mission.");
        render();
      });
    return true;
  }
  // "Restore Standard Version" (Screen 3B, only shown once a custom version
  // exists) — a complete, one-click revert: clears the draft back to
  // official and publishes immediately, same as Keep & Publish, so a
  // teacher is never left with an inconsistent unpublished state.
  if (action === "restore-standard-version") {
    if (!contentUiState.slot) return true;
    openManageContentWarningDialog("restore-standard-version", {
      onSecondary: performRestoreStandardVersion,
      triggerSelector: '[data-action="restore-standard-version"]',
    });
    return true;
  }
  // "Save Draft" (Screens 3B/3C) — persists the open form as this slot's
  // draft selection without publishing it, so a teacher can save partial
  // work and come back to it later. Uses the exact same
  // persistAuthoringSelection() as "Publish" below — only the
  // publishCaseSelections()/wizardStep-advance step is skipped, and the
  // teacher stays on the same editor instead of moving to Screen 3A.
  if (action === "save-authoring-draft") {
    saveAuthoringDraft();
    return true;
  }
  // "Publish" (Screens 3B/3C) — persists the open form as this slot's draft
  // replacement, then immediately publishes it, same as before "Save Draft"
  // existed as a separate step.
  if (action === "save-and-publish-authoring") {
    const auth = manageContentAuthoring;
    if (!auth?.slotKind) return true;
    const classroomId = teacherUiState.selectedClassroomId;
    const caseId = contentUiState.selectedCaseId;
    const slotKind = auth.officialSlotKind || auth.slotKind;
    const officialId = auth.editingOfficialId;
    contentUiState.lastActionFailed = null;
    const persisted = persistAuthoringSelection();
    if (!persisted) return true;
    contentUiState.pending = true;
    render();
    persisted
      .then(() =>
        publishCaseSelections(classroomId, caseId, [{ slotKind, slotContentId: officialId }])
      )
      .then(() => loadSelectionsForResolution(classroomId, "published"))
      .then(() => {
        contentUiState.pending = false;
        contentUiState.draftSavedSincePublish = false;
        manageContentAuthoring = null;
        contentUiState.wizardStep = "published";
        return loadManageContentCaseData(caseId);
      })
      .catch((err) => {
        contentUiState.pending = false;
        contentUiState.lastActionFailed = "publish";
        reportUiError(contentUiState, err, "Could not save and publish this activity.");
        render();
      });
    return true;
  }
  // "Preview Changes"/"Preview Replacement" (Screens 3B/3C) — builds an
  // ephemeral content object straight from the form's current fields (never
  // persisted — see manageContentAuthoring.previewQuest's doc comment) and
  // renders it live via the shared previewSession mechanism, so Cancel
  // afterward can never leave a stray draft behind.
  if (action === "preview-authoring-changes") {
    const auth = manageContentAuthoring;
    if (!auth?.slotKind) return true;
    const formEl = currentAuthoringFormEl();
    const fields = syncAuthoringFieldsFromDom(auth.slotKind, formEl);
    const result = buildAuthoredContent(auth.slotKind, fields);
    if (!result.ok) {
      manageContentAuthoring = { ...auth, fields, errors: result.errors };
      render();
      focusManageContentValidationSummary();
      return true;
    }
    manageContentAuthoring = { ...auth, fields, errors: [], previewQuest: result.content };
    previewSession = { active: true, snapshot: null };
    render();
    return true;
  }
  if (action === "preview-published-mission") {
    enterContentPreview(contentUiState.selectedCaseId, {
      inline: true,
      resolution: manageContentPreviewResolutionForAction(action),
    });
    return true;
  }
  if (action === "toggle-content-preview") {
    enterContentPreview(contentUiState.selectedCaseId, {
      resolution: manageContentPreviewResolutionForAction(action),
    });
    return true;
  }
  if (action === "exit-content-preview") {
    exitContentPreview();
    return true;
  }
  if (action === "pick-question-type") {
    if (!manageContentAuthoring) return true;
    const slotKind = target.dataset.slotKind;
    const auth = manageContentAuthoring;
    // Picking the type the slot is CURRENTLY authored as re-uses its
    // current content as a starting point; any other choice is a genuinely
    // different type and starts blank.
    const fields =
      slotKind === auth.currentSlotKindAtStart && auth.originalPreviewContent
        ? authoringFieldsFromContent(slotKind, auth.originalPreviewContent)
        : defaultAuthoringFields(slotKind);
    manageContentAuthoring = {
      ...auth,
      slotKind,
      fields,
      fieldsAtOpen: fields,
      errors: [],
      textTools: {},
    };
    render();
    return true;
  }
  // The highlight/excerpt tool (sourceTextToolMarkup()) — six actions
  // sharing one shape: sync the form's current values first (so an in-
  // progress edit elsewhere in the form isn't lost), mutate the relevant
  // manageContentAuthoring.textTools[fieldKey] undo/redo stack, re-render.
  // Purely ephemeral UI state — see manageContentAuthoring.textTools's own
  // doc comment at its "edit"/"replace"/pick-question-type reset sites.
  if (
    action === "toggle-highlight-segment" ||
    action === "clear-highlights" ||
    action === "undo-highlight" ||
    action === "redo-highlight"
  ) {
    const auth = manageContentAuthoring;
    if (!auth) return true;
    const fields = syncAuthoringFieldsFromDom(auth.slotKind, currentAuthoringFormEl());
    const fieldKey = target.dataset.fieldKey;
    const textTools = { ...(auth.textTools || {}) };
    const tool = textTools[fieldKey] || { mode: "excerpt", highlighted: [], past: [], future: [] };
    if (action === "toggle-highlight-segment") {
      const segmentIndex = Number(target.dataset.segmentIndex);
      const highlighted = [...(tool.highlighted || [])];
      highlighted[segmentIndex] = !highlighted[segmentIndex];
      textTools[fieldKey] = {
        ...tool,
        highlighted,
        past: [...(tool.past || []), tool.highlighted || []],
        future: [],
      };
    } else if (action === "clear-highlights") {
      textTools[fieldKey] = {
        ...tool,
        highlighted: [],
        past: [...(tool.past || []), tool.highlighted || []],
        future: [],
      };
    } else if (action === "undo-highlight" && tool.past?.length) {
      const past = [...tool.past];
      const previous = past.pop();
      textTools[fieldKey] = {
        ...tool,
        highlighted: previous,
        past,
        future: [tool.highlighted || [], ...(tool.future || [])],
      };
    } else if (action === "redo-highlight" && tool.future?.length) {
      const future = [...tool.future];
      const next = future.shift();
      textTools[fieldKey] = {
        ...tool,
        highlighted: next,
        past: [...(tool.past || []), tool.highlighted || []],
        future,
      };
    }
    manageContentAuthoring = { ...auth, fields, textTools };
    render();
    return true;
  }
  if (action === "set-source-text-mode") {
    const auth = manageContentAuthoring;
    if (!auth) return true;
    const fields = syncAuthoringFieldsFromDom(auth.slotKind, currentAuthoringFormEl());
    const fieldKey = target.dataset.fieldKey;
    const textTools = { ...(auth.textTools || {}) };
    const tool = textTools[fieldKey] || { highlighted: [], past: [], future: [] };
    textTools[fieldKey] = { ...tool, mode: target.dataset.mode };
    manageContentAuthoring = { ...auth, fields, textTools };
    render();
    return true;
  }
  if (action === "use-highlighted-excerpt") {
    const auth = manageContentAuthoring;
    if (!auth) return true;
    const fields = syncAuthoringFieldsFromDom(auth.slotKind, currentAuthoringFormEl());
    const fieldKey = target.dataset.fieldKey;
    const tool = auth.textTools?.[fieldKey];
    const fieldTarget = resolveTextToolTarget(fieldKey, fields);
    if (tool && fieldTarget) {
      const resolved = fieldTarget.poolValue
        ? resolvePoolSourceFields(fieldTarget.poolValue)
        : null;
      const fullText = resolved ? resolved.fullText || resolved.excerpt : "";
      const segments = fullText ? splitIntoSegments(fullText) : [];
      const excerpt = segments
        .filter((_, i) => tool.highlighted?.[i])
        .join(" ")
        .trim();
      if (excerpt) fieldTarget.set(excerpt);
    }
    manageContentAuthoring = { ...auth, fields };
    render();
    return true;
  }
  // Cancel discards the open editor (any unsaved fields, and the ephemeral
  // previewQuest if one was built) without persisting anything, and returns
  // to Screen 2.
  if (action === "cancel-authoring") {
    manageContentAuthoring = null;
    contentUiState.wizardStep = "preview";
    render();
    return true;
  }
  // Collapse/expand one of the guided editor sections (Source/Directions/
  // Question/Answers) — see manageContentEditorSectionMarkup(). Purely
  // ephemeral UI state; syncs the form's current values first so toggling a
  // section never discards an in-progress edit elsewhere in the form.
  if (action === "toggle-authoring-section") {
    const auth = manageContentAuthoring;
    if (!auth) return true;
    const sectionKey = target.dataset.sectionKey;
    const formEl = currentAuthoringFormEl();
    const fields =
      formEl && auth.slotKind ? syncAuthoringFieldsFromDom(auth.slotKind, formEl) : auth.fields;
    const collapsedSections = {
      ...(auth.collapsedSections || {}),
      [sectionKey]: !auth.collapsedSections?.[sectionKey],
    };
    manageContentAuthoring = { ...auth, fields, collapsedSections };
    render();
    return true;
  }
  // A validation-error link (manageContentValidationSummaryMarkup()) —
  // expands the section the error belongs to (if collapsed) and moves
  // focus/scroll there, satisfying "move focus to the problem" without
  // touching validation logic itself.
  if (action === "focus-authoring-section") {
    const auth = manageContentAuthoring;
    const sectionKey = target.dataset.sectionKey;
    if (auth && sectionKey && auth.collapsedSections?.[sectionKey]) {
      manageContentAuthoring = {
        ...auth,
        collapsedSections: { ...auth.collapsedSections, [sectionKey]: false },
      };
    }
    render();
    if (typeof document !== "undefined" && sectionKey) {
      const sectionEl = document.querySelector(
        `.manage-content-editor-section[data-section-key="${sectionKey}"]`
      );
      sectionEl?.scrollIntoView({ block: "center" });
      sectionEl?.focus?.();
    }
    return true;
  }
  if (action === "add-mcq-choice") {
    const fields = syncAuthoringFieldsFromDom("mcq", currentAuthoringFormEl());
    fields.choices.push({ text: "", correct: false });
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
    return true;
  }
  if (action === "remove-mcq-choice") {
    const fields = syncAuthoringFieldsFromDom("mcq", currentAuthoringFormEl());
    const index = Number(target.dataset.rowIndex);
    if (fields.choices.length > 2) {
      const removedWasCorrect = fields.choices[index].correct;
      fields.choices.splice(index, 1);
      if (removedWasCorrect && !fields.choices.some((c) => c.correct))
        fields.choices[0].correct = true;
    }
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
    return true;
  }
  if (action === "move-mcq-choice") {
    const fields = syncAuthoringFieldsFromDom("mcq", currentAuthoringFormEl());
    fields.choices = reorderAuthoringRow(
      fields.choices,
      Number(target.dataset.rowIndex),
      Number(target.dataset.direction)
    );
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
    return true;
  }
  if (action === "add-sequence-item") {
    const fields = syncAuthoringFieldsFromDom("sequencing", currentAuthoringFormEl());
    fields.items.push({ label: "", position: fields.items.length });
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
    return true;
  }
  if (action === "remove-sequence-item") {
    const fields = syncAuthoringFieldsFromDom("sequencing", currentAuthoringFormEl());
    const index = Number(target.dataset.rowIndex);
    if (fields.items.length > 2) {
      fields.items.splice(index, 1);
      fields.items = fields.items
        .sort((a, b) => a.position - b.position)
        .map((item, i) => ({ ...item, position: i }));
    }
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
    return true;
  }
  if (action === "add-evidence-slot") {
    const fields = syncAuthoringFieldsFromDom("evidence-organizing", currentAuthoringFormEl());
    fields.slots.push({ label: "" });
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
    return true;
  }
  if (action === "remove-evidence-slot") {
    const fields = syncAuthoringFieldsFromDom("evidence-organizing", currentAuthoringFormEl());
    const index = Number(target.dataset.rowIndex);
    if (fields.slots.length > 2) {
      const removedSlotId = slugify(fields.slots[index].label);
      fields.slots.splice(index, 1);
      const fallbackSlotId = slugify(fields.slots[0].label);
      fields.sources = fields.sources.map((source) =>
        source.correctSlotId === removedSlotId
          ? { ...source, correctSlotId: fallbackSlotId }
          : source
      );
    }
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
    return true;
  }
  if (action === "add-evidence-source") {
    const fields = syncAuthoringFieldsFromDom("evidence-organizing", currentAuthoringFormEl());
    fields.sources.push({
      label: "",
      attribution: "",
      excerpt: "",
      skillCategory: SKILL_CATEGORIES[0],
      correctSlotId: fields.slots[0] ? slugify(fields.slots[0].label) : "",
      sourcePoolValue: "",
    });
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
    return true;
  }
  if (action === "remove-evidence-source") {
    const fields = syncAuthoringFieldsFromDom("evidence-organizing", currentAuthoringFormEl());
    const index = Number(target.dataset.rowIndex);
    if (fields.sources.length > 1) fields.sources.splice(index, 1);
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
    return true;
  }
  if (action === "add-hipp-prompt") {
    const fields = syncAuthoringFieldsFromDom("hipp", currentAuthoringFormEl());
    if (fields.hippPrompts.length < 2) {
      fields.hippPrompts.push({
        dimension: HIPP_DIMENSIONS[0],
        argument: "",
        options: [
          { text: "", correct: true, identificationOnly: false },
          { text: "", correct: false, identificationOnly: true },
          { text: "", correct: false, identificationOnly: false },
        ],
      });
    }
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
    return true;
  }
  if (action === "remove-hipp-prompt") {
    const fields = syncAuthoringFieldsFromDom("hipp", currentAuthoringFormEl());
    const index = Number(target.dataset.rowIndex);
    if (fields.hippPrompts.length > 1) fields.hippPrompts.splice(index, 1);
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
    return true;
  }
  if (action === "add-hipp-option") {
    const fields = syncAuthoringFieldsFromDom("hipp", currentAuthoringFormEl());
    const promptIndex = Number(target.dataset.promptIndex);
    if (fields.hippPrompts[promptIndex].options.length < 6) {
      fields.hippPrompts[promptIndex].options.push({
        text: "",
        correct: false,
        identificationOnly: false,
      });
    }
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
    return true;
  }
  if (action === "remove-hipp-option") {
    const fields = syncAuthoringFieldsFromDom("hipp", currentAuthoringFormEl());
    const promptIndex = Number(target.dataset.promptIndex);
    const optionIndex = Number(target.dataset.rowIndex);
    const options = fields.hippPrompts[promptIndex].options;
    if (options.length > 3) options.splice(optionIndex, 1);
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
    return true;
  }
  if (action === "move-hipp-option") {
    const fields = syncAuthoringFieldsFromDom("hipp", currentAuthoringFormEl());
    const promptIndex = Number(target.dataset.promptIndex);
    fields.hippPrompts[promptIndex].options = reorderAuthoringRow(
      fields.hippPrompts[promptIndex].options,
      Number(target.dataset.rowIndex),
      Number(target.dataset.direction)
    );
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
    return true;
  }
  return false;
}

// Static, content-free background layer (letterhead rule lines + pillar glows) evoking an
// Institute Archive records room. Built once since it has no dynamic data. No text/word content
// here — the contextual reveal system (badges/chips/Codex image, see revealCardMarkup()) and the
// ambient phrase layer (see AMBIENT_HISTORY_PHRASES) are the only word-level content, so nothing
// else appears in the backdrop unrelated to the current line.
const DIRECTOR_SCENE_BACKDROP = `<div class="director-scene__backdrop" aria-hidden="true"><div class="director-scene__ledger"></div><span class="director-scene__pillar director-scene__pillar--1"></span><span class="director-scene__pillar director-scene__pillar--2"></span><span class="director-scene__pillar director-scene__pillar--3"></span></div>`;

// Decorative-only markup for the director stage: a technical-instrument seal behind the character,
// corner HUD brackets, and monospace data readouts.
// The record readout lives in the stage's top-left corner, which is exactly where
// intro-protocol's .director-extra-content cards panel renders — kept as a separate fragment
// (see directorSceneMarkup()) so it can be omitted whenever extraContent is present instead of
// overlapping the panel's own text.
const DIRECTOR_STAGE_DECOR_RECORD_READOUT = `<span class="director-scene__readout director-scene__readout--record" aria-hidden="true">REC. 07734 · SER. AR-1</span>`;
const DIRECTOR_STAGE_DECOR = `<div class="director-scene__seal-wrap" aria-hidden="true"><svg class="director-scene__seal" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46"></circle><circle cx="50" cy="50" r="40"></circle><line x1="50" y1="4" x2="50" y2="10" transform="rotate(0 50 50)"></line><line x1="50" y1="4" x2="50" y2="10" transform="rotate(45 50 50)"></line><line x1="50" y1="4" x2="50" y2="10" transform="rotate(90 50 50)"></line><line x1="50" y1="4" x2="50" y2="10" transform="rotate(135 50 50)"></line><line x1="50" y1="4" x2="50" y2="10" transform="rotate(180 50 50)"></line><line x1="50" y1="4" x2="50" y2="10" transform="rotate(225 50 50)"></line><line x1="50" y1="4" x2="50" y2="10" transform="rotate(270 50 50)"></line><line x1="50" y1="4" x2="50" y2="10" transform="rotate(315 50 50)"></line></svg></div><span class="director-scene__bracket director-scene__bracket--tl" aria-hidden="true"></span><span class="director-scene__bracket director-scene__bracket--tr" aria-hidden="true"></span><span class="director-scene__bracket director-scene__bracket--bl" aria-hidden="true"></span><span class="director-scene__bracket director-scene__bracket--br" aria-hidden="true"></span><span class="director-scene__readout director-scene__readout--status" aria-hidden="true">LINK VERIFIED</span><span class="director-scene__readout director-scene__readout--timer" id="directorArchiveClock" aria-hidden="true">00:00</span>`;

// 30 short APUSH-timeline phrases for the ambient drifting-text layer on the director intro
// screens (see startDirectorSceneDecor()). Purely decorative flavor text, never gameplay content.
const AMBIENT_HISTORY_PHRASES = [
  "1607 · Jamestown",
  "Columbian Exchange",
  "1620 · Plymouth",
  "Bacon's Rebellion",
  "Middle Passage",
  "Salutary Neglect",
  "1754 · French and Indian War",
  "1776 · Declaration of Independence",
  "Common Sense",
  "Articles of Confederation",
  "1787 · Constitutional Convention",
  "Federalists v. Anti-Federalists",
  "1803 · Louisiana Purchase",
  "Marbury v. Madison",
  "Indian Removal Act",
  "Manifest Destiny",
  "1848 · Seneca Falls",
  "Missouri Compromise",
  "1861 · Fort Sumter",
  "Emancipation Proclamation",
  "1877 · End of Reconstruction",
  "Gilded Age",
  "Populist Movement",
  "1898 · Spanish-American War",
  "Progressive Era",
  "1929 · Stock Market Crash",
  "New Deal",
  "1941 · Pearl Harbor",
  "Cold War Containment",
  "1963 · March on Washington",
];

// Continuous, dialogue-independent decoration loop for the director intro screens: a running
// archive-clock readout plus a layer of faintly drifting historical phrases. Started/stopped
// purely based on which screen is current (see the render() wiring near startMiniGameLoop()) —
// never paused/reset by dialogue advancing, matching the "runs continuously" requirement.
function startDirectorSceneDecor() {
  const layer = document.getElementById("directorPhraseLayer");
  const clock = document.getElementById("directorArchiveClock");
  if (!layer || !clock) return;
  directorClockStartedAt = performance.now();
  directorClockInterval = setInterval(() => {
    const elapsed = Math.floor((performance.now() - directorClockStartedAt) / 1000);
    clock.textContent = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  }, 1000);
  if (prefersReducedMotion()) return;
  const slotCount = 6 + Math.floor(Math.random() * 5);
  for (let i = 0; i < slotCount; i++) scheduleNextPhrase(layer, 200 + Math.random() * 3000);
}

function stopDirectorSceneDecor() {
  clearInterval(directorClockInterval);
  directorClockInterval = null;
  directorPhraseTimers.forEach(clearTimeout);
  directorPhraseTimers = [];
}

function scheduleNextPhrase(layer, delayMs) {
  directorPhraseTimers.push(setTimeout(() => spawnPhrase(layer), delayMs));
}

// Rejection-sampled random point (as % of the phrase layer's box, which shares .director-scene's
// full coordinate space — see the phrase-layer placement note in directorSceneMarkup()) that
// avoids the character sprite, the bottom dialogue bar, and intro-protocol's cards panel. The
// panel rectangle is excluded unconditionally on all three screens so one algorithm covers all of
// them rather than threading an "extra content present" flag through.
function pickSafeZonePoint() {
  for (let attempt = 0; attempt < 20; attempt++) {
    const x = 6 + Math.random() * 88;
    const y = Math.random() * 100;
    const inSprite = x > 32 && x < 68 && y > 42 && y < 94;
    const inBar = y > 80;
    const inProtocolPanel = x < 44 && y > 12 && y < 58;
    if (!inSprite && !inBar && !inProtocolPanel) return { x, y };
  }
  return { x: 8, y: 20 };
}

function spawnPhrase(layer) {
  if (!document.body.contains(layer)) return;
  const text = AMBIENT_HISTORY_PHRASES[Math.floor(Math.random() * AMBIENT_HISTORY_PHRASES.length)];
  const { x, y } = pickSafeZonePoint();
  const fadeIn = 2000 + Math.random() * 2000;
  const hold = 2000 + Math.random() * 3000;
  const fadeOut = 2000 + Math.random() * 2000;
  const targetOpacity = (0.13 + Math.random() * 0.15).toFixed(2);
  const el = document.createElement("span");
  el.className = "director-scene__phrase";
  el.textContent = text;
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  el.style.fontSize = `${11 + Math.random() * 3}px`;
  el.style.transitionDuration = `${fadeIn}ms`;
  layer.appendChild(el);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = targetOpacity;
    });
  });
  const fadeOutId = setTimeout(() => {
    el.style.transitionDuration = `${fadeOut}ms`;
    el.style.opacity = "0";
    const removeId = setTimeout(() => {
      el.remove();
      scheduleNextPhrase(layer, 1000 + Math.random() * 3000);
    }, fadeOut);
    directorPhraseTimers.push(removeId);
  }, fadeIn + hold);
  directorPhraseTimers.push(fadeOutId);
}

// Director intro scene — full-bleed Pokémon-"meet the Professor"-style presentation shared by
// intro-welcome/intro-briefing/intro-protocol: the backdrop/sprite fill the whole stage below the
// chrome bar, and the dialogue box + buttons are a bar anchored to the bottom edge rather than a
// small card floating mid-page. Markup always renders an empty text/rail shell;
// startIntroTypewriter() (called via requestAnimationFrame right after this HTML is injected, see
// render()) is the single source of truth for filling it in, whether that's typing a fresh line or
// instantly restoring a previously-seen step. Keeping that logic in one place avoids the markup and
// the JS state machine silently drifting out of sync.
function directorSceneMarkup({ eyebrow, title, buttonsHtml, extraContent = "" }) {
  const stage = `<img class="director-scene__sprite" src="${CHARACTER_SHEETS.director.portrait}" alt="Director Rowan Hale" draggable="false">`;
  // The record readout is omitted whenever extraContent is present (intro-protocol only) since
  // that panel occupies the same top-left corner — see DIRECTOR_STAGE_DECOR_RECORD_READOUT.
  const stageDecor =
    DIRECTOR_STAGE_DECOR + (extraContent ? "" : DIRECTOR_STAGE_DECOR_RECORD_READOUT);
  // The phrase layer is a top-level scene sibling (not nested in .director-scene__stage) so its
  // inset:0 box shares the same coordinate space as .director-extra-content and the bottom bar —
  // pickSafeZonePoint() needs to reason about the sprite and the dialogue box together.
  const phraseLayer = `<div class="director-scene__phrase-layer" id="directorPhraseLayer" aria-hidden="true"></div>`;
  // The reveal rail lives here, directly above the dialogue box it's illustrating, rather than
  // floating in the stage's top-right corner — see docs decision to anchor reveals to what's
  // being said instead of parking them in a disconnected corner.
  return `<section class="director-scene">${DIRECTOR_SCENE_BACKDROP}${phraseLayer}<div class="director-scene__head"><p class="kicker">${esc(eyebrow)}</p><h1>${esc(title)}</h1></div><div class="director-scene__stage">${stageDecor}${stage}</div><div class="director-extra-content" hidden>${extraContent}</div><div class="director-scene__bar"><div class="director-reveal-rail" id="directorRevealRail"></div><div class="director-dialogue-box" data-action="director-dialogue-click" role="button" tabindex="0" aria-label="Director Rowan Hale speaking — click to continue"><p class="director-dialogue-box__name">Director Rowan Hale</p><p class="director-dialogue-box__text" id="directorLineText"></p><span class="director-continue-indicator" id="directorContinueIndicator" hidden>▼</span></div><div class="completion-actions" id="directorSceneActions">${buttonsHtml}</div></div></section>`;
}

function introWelcomeScreen() {
  const s = CHRONICLE_OPENING_DEFAULTS.scenes.welcome;
  const buttons = `<button class="btn btn-gold director-continue-button" data-action="intro-advance" data-next="intro-briefing">${esc(s.action)} →</button>`;
  return `${chrome()}<main class="director-stage">${directorSceneMarkup({ eyebrow: s.eyebrow, title: s.title, buttonsHtml: buttons })}</main>`;
}

function introBriefingScreen() {
  const entries = CHRONICLE_OPENING_DEFAULTS.directorBriefing.entries;
  const entry = entries[briefingStep];
  const buttons = `<button class="btn btn-outline director-back-button" data-action="briefing-back">${esc(entry.secondary)}</button><button class="btn btn-gold director-continue-button" data-action="briefing-next">${esc(entry.action)} →</button>`;
  return `${chrome()}<main class="director-stage">${directorSceneMarkup({ eyebrow: entry.eyebrow, title: entry.title, buttonsHtml: buttons })}</main>`;
}

function introProtocolScreen() {
  const oath = CHRONICLE_OPENING_DEFAULTS.scenes.oath;
  const protocol = CHRONICLE_OPENING_DEFAULTS.protocol;
  const assignment = CHRONICLE_OPENING_DEFAULTS.assignment;
  const buttons = `<button class="btn btn-gold director-continue-button" data-action="intro-advance" data-next="identity">${esc(oath.action)} →</button>`;
  const extraContent = `<div class="completion-stats">${protocol.map((p) => `<span><b>${esc(p.number)}</b> ${esc(p.title)} — ${esc(p.body)}</span>`).join("")}</div><div class="completion-stats"><span class="kicker">${esc(assignment.kicker)}</span><span>${esc(assignment.unit)}</span><span>${esc(assignment.title)}</span></div><p>${esc(assignment.description)}</p>`;
  return `${chrome()}<main class="director-stage">${directorSceneMarkup({ eyebrow: oath.eyebrow, title: oath.title, buttonsHtml: buttons, extraContent })}</main>`;
}

// Resolves the {stepKey, lines} for whichever intro beat is currently active.
// stepKey is unique per step (director-briefing steps are keyed by index) so introSeenSteps
// tracks "has this exact beat been typed out before" independent of screen navigation.
function currentIntroLines() {
  if (progress.currentScreen === "intro-welcome") {
    return { stepKey: "intro-welcome", lines: CHRONICLE_OPENING_DEFAULTS.scenes.welcome.body };
  }
  if (progress.currentScreen === "intro-briefing") {
    return {
      stepKey: `intro-briefing-${briefingStep}`,
      lines: CHRONICLE_OPENING_DEFAULTS.directorBriefing.entries[briefingStep].body,
    };
  }
  if (progress.currentScreen === "intro-protocol") {
    return { stepKey: "intro-protocol", lines: CHRONICLE_OPENING_DEFAULTS.scenes.oath.body };
  }
  // The Entrance Hall's conversation is the one beat that isn't a screen of its own — it is spoken
  // in-world, in a walkable hub room, so it keys off the scene phase instead. Everything else about
  // it is identical, which is the point: the typewriter, the continue indicator and tap-to-skip all
  // come for free rather than being rebuilt inside a hub dialogue panel.
  if (hallwayScene.phase === "talking") {
    // The only content line in this file that interpolates player state — scoped to this one
    // branch since nothing else here has a reason to reference progress.profile.name.
    const name = progress.profile.name || "Chronicler";
    return {
      stepKey: "intro-hallway",
      lines: CHRONICLE_OPENING_DEFAULTS.scenes.hallway.body.map((line) => ({
        ...line,
        text: line.text.replace("{{chroniclerName}}", name),
      })),
    };
  }
  return null;
}

// "image" reveals get the full cinematic artifact-reveal treatment (light gather → rise →
// settle, see the artifact-* keyframes in global.css, including their own
// prefers-reduced-motion override) rather than the plain 320ms pop the "chips"/"badge" reveal
// types still use — named generically (not Codex-specific) so this same treatment can be reused
// for future artifact/tool reveals, per the intro reveal rail's existing type-keyed pattern.
function revealCardMarkup(reveal) {
  if (reveal.type === "chips") {
    return `<div class="director-reveal-card director-reveal-card--chips">${reveal.items
      .map((item, index) => {
        const [primary, descriptor] = item.split(" · ");
        const icon = DIRECTOR_REVEAL_ICONS[primary] || "";
        return `<span class="director-reveal-chip" style="animation-delay:${index * 240}ms"><span class="director-reveal-chip__icon" aria-hidden="true">${icon}</span><span class="director-reveal-chip__label">${esc(primary)}${descriptor ? `<em>${esc(descriptor)}</em>` : ""}</span></span>`;
      })
      .join("")}</div>`;
  }
  if (reveal.type === "image") {
    const src = INTRO_REVEAL_IMAGES[reveal.src] || "";
    return `<div class="director-reveal-card director-reveal-card--image artifact-reveal"><span class="artifact-reveal__glow" aria-hidden="true"></span><img class="artifact-reveal__art" src="${src}" alt="${esc(reveal.label)}"><span class="artifact-reveal__label">${esc(reveal.label)}</span></div>`;
  }
  const icon = DIRECTOR_REVEAL_ICONS[reveal.label];
  return `<div class="director-reveal-card director-reveal-card--badge"><span class="director-reveal-badge">${icon || esc(reveal.icon || "✦")}</span><span class="director-reveal-badge__text"><span>${esc(reveal.label)}</span>${reveal.sublabel ? `<em>${esc(reveal.sublabel)}</em>` : ""}</span></div>`;
}

function completeCurrentIntroStep(step) {
  introSeenSteps.add(step.stepKey);
  document.getElementById("directorContinueIndicator")?.removeAttribute("hidden");
  document.querySelector(".director-extra-content")?.removeAttribute("hidden");
}

// Shared by both the dialogue box click and the always-active Continue button, so the two
// controls behave identically: skip the typewriter if mid-line, else advance to the next line.
// Returns true if it handled something; false once the current step's last line is already
// fully revealed, meaning the caller should move on to the next screen instead.
function advanceIntroDialogue() {
  const step = currentIntroLines();
  if (!step) return false;
  if (introTypewriterTimer) {
    clearTimeout(introTypewriterTimer);
    introTypewriterTimer = null;
    const textEl = document.getElementById("directorLineText");
    if (textEl) textEl.textContent = step.lines[introLineIndex].text;
    if (introLineIndex === step.lines.length - 1) {
      completeCurrentIntroStep(step);
    } else {
      document.getElementById("directorContinueIndicator")?.removeAttribute("hidden");
    }
    return true;
  }
  if (introLineIndex < step.lines.length - 1) {
    introLineIndex += 1;
    startIntroTypewriter();
    return true;
  }
  return false;
}

// True when the OS/browser requests reduced motion. Checked live (not cached) since a user can
// toggle this mid-session. Reused by both the intro typewriter and the Codex cinematic reveal.
function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

// Faster than HUB_NPC_SPEED's indoor amble (1.15), which is too slow to read as leading anyone, and
// slower than the player's own 3.65, which would read as a jog. walkCycleSeconds() turns this into a
// 0.5s stride for both bodies, so nobody skates — see the ground-speed invariant in CLAUDE.md.
const HALLWAY_ESCORT_SPEED = 2.2;
// A little over one tile: close enough to read as following, far enough that the two sprites never
// overlap into a single blob.
const ESCORT_GAP = 1.15;
/**
 * Ends the Director's briefing and starts the walk to the Main Hall doors.
 *
 * The follower is `instituteMovement` itself, which is the one choice that makes the rest of this
 * free: updateHubCamera() is already a pure function of that object, so the camera pans up the room
 * behind the player with no new code and CLAUDE.md's camera invariant untouched. The leader is the
 * Director's own behaviour state, so instituteNpc()'s markup and updateInstituteNpcs()'s DOM patch
 * keep drawing him exactly as they already did.
 */
function startHallwayEscort() {
  const director = hallwayNpcRuntime.director;
  hallwayScene.phase = "escort";
  hallwayScene.escort = createEscortWalk({
    waypoints: findRoute(HALLWAY_NAV_GRID, director, HALLWAY_DOOR_APPROACH) || [],
    speed: HALLWAY_ESCORT_SPEED,
    gap: ESCORT_GAP,
    leader: director,
    follower: instituteMovement,
  });
  hallwayScene.lastAt = performance.now();
  render();
  hallwayScene.frame = window.requestAnimationFrame(runHallwayEscort);
}
// Self-terminating rAF in the same shape as runHubMovementLoop(), including its elapsed clamp, and
// patching the DOM directly rather than re-rendering per frame.
function runHallwayEscort(now) {
  if (hallwayScene.phase !== "escort") {
    hallwayScene.frame = null;
    return;
  }
  const elapsed = Math.min(48, Math.max(0, now - hallwayScene.lastAt || 16));
  hallwayScene.lastAt = now;
  const { leaderDone } = stepEscort(hallwayScene.escort, elapsed);

  const director = hallwayNpcRuntime.director;
  const node = document.querySelector('[data-hub-npc="director"]');
  if (node) {
    node.style.cssText = hubCharacterStyle(director.x, director.y);
    node.classList.toggle("is-walking-npc", director.walking);
    node.dataset.facing = director.facing;
    applyCharacterSprite(
      node.querySelector(".character-sprite"),
      "director",
      director.facing,
      director.walking,
      HALLWAY_ESCORT_SPEED
    );
  }
  updateInstitutePlayer(HALLWAY_ESCORT_SPEED);

  // Cut on leaderDone rather than waiting for the follower to close up: the Director steps through
  // the doors and the screen starts pulsing while the player is still a step behind him, which is
  // what it should look like. The loop keeps running underneath, so the follower catches up beneath
  // the black rather than freezing mid-stride.
  if (leaderDone) completeHallwayEscort();
  hallwayScene.frame = window.requestAnimationFrame(runHallwayEscort);
}

// How long the doorway flicker runs. Must match @keyframes doorway-flicker in global.css — this is
// only the backstop for reduced motion, where there is no animation to listen to.
const DOORWAY_FLICKER_MS = 900;
// Fires once the Director reaches the Main Hall doors: plays the doorway flicker over the top of the
// room, then cuts to the Main Hall with the tour's first (unhighlighted) beat active.
// safeInstituteSpawn() is the same spawn point every other route into that room uses.
function completeHallwayEscort() {
  if (hallwayScene.phase === "flicker") return;
  hallwayScene.phase = "flicker";
  const fade = document.getElementById("sceneFade");
  fade?.classList.add("scene-fade--doorway");
  // Idempotent, because two things race to call it: the animation's own end event and the timeout
  // below. Whichever arrives first does the work; the other finds the room already changed.
  const enterMainHall = () => {
    if (progress.currentHubRoom !== "hallway") return;
    stopHallwayScene();
    safeInstituteSpawn();
    progress.tutorial.step = "tour-intro";
    enterMainHallFromBlack = true;
    save();
    render();
  };
  // animationend is the primary hook: the keyframes end held at full black, so it fires at exactly
  // the moment the screen is covered — no magic delay duplicated between the CSS and here, and no
  // chance of swapping rooms during one of the transparent beats between pulses. The timeout is the
  // backstop for reduced motion, where there is no animation and no animationend to wait for.
  if (fade && !prefersReducedMotion())
    fade.addEventListener("animationend", enterMainHall, { once: true });
  clearTimeout(hallwayScene.fadeTimer);
  hallwayScene.fadeTimer = setTimeout(
    enterMainHall,
    prefersReducedMotion() ? 60 : DOORWAY_FLICKER_MS + 120
  );
}

// --- The scripted-scene runner ----------------------------------------------------------------
//
// One host for every scene in content/cutscenes.js, driving the pure interpreter in
// engine/cutscene.js. `hallwayScene` above predates it and is the one scene still on its own
// bespoke phases; folding the Entrance Hall onto this runner is the remaining half of Phase 81C,
// and until that lands the two are kept apart by `isHubInputLocked()` checking both rather than by
// either one knowing about the other.
//
// The rule this obeys, from CUTSCENE-AND-DIALOGUE-CONVENTIONS.md §1: **a scripted beat moves
// characters, never the screen.** Every command writes to the objects the ordinary loops already
// read — an NPC's behaviour runtime, and `instituteMovement` itself — so updateHubCamera() stays a
// pure function of player position and there is no camera code path here at all. It is the same
// trick the Entrance Hall escort uses, which is why `moveActor` can reuse createEscortWalk()
// untouched.
const SCENE_WALK_SPEED = 2.2;
const BLANK_HUB_SCENE = {
  id: null,
  state: null,
  frame: null,
  lastAt: 0,
  escort: null,
  followsPlayer: false,
  typeTimer: null,
  speaker: null,
  line: "",
  highlight: null,
};
let hubScene = { ...BLANK_HUB_SCENE };

/** Whether an authored scene currently owns the hub. One of `isHubInputLocked()`'s three terms. */
function isHubSceneActive() {
  return Boolean(hubScene.state) && !hubScene.state.done;
}

/**
 * Cancels anything the runner has in flight. Safe to call when nothing is running.
 *
 * §4's teardown rule 4: a scene that forgets its rAF handle or its timer leaves a loop running
 * against a screen that is gone. Both are cancelled here, and this is the only place that resets
 * the object, so there is one thing to read and one thing to call.
 */
function stopHubScene() {
  if (hubScene.frame) window.cancelAnimationFrame(hubScene.frame);
  clearTimeout(hubScene.typeTimer);
  hubScene = { ...BLANK_HUB_SCENE };
}

/** The live body a command's `actor` id names. `"player"` is the player's own movement state. */
function sceneActor(id) {
  return id === "player" ? instituteMovement : activeHubNpcRuntime()[id];
}

/**
 * The impure half. Every handler writes world or save state and nothing else — the DOM is patched
 * by the frame loop below, so the interpreter never re-enters render().
 */
function hubSceneEffects() {
  return {
    moveActor(command) {
      const leader = sceneActor(command.actor);
      if (!leader) return;
      hubScene.followsPlayer = command.follower === "player";
      hubScene.escort = createEscortWalk({
        waypoints: findRoute(HUB_NAV_GRID, leader, command.to) || [],
        speed: SCENE_WALK_SPEED,
        gap: ESCORT_GAP,
        leader,
        // A walk with nobody in tow still needs a follower object to write into, so it gets a
        // throwaway rather than a branch inside stepEscort().
        follower: hubScene.followsPlayer ? instituteMovement : { ...leader },
      });
    },
    // Skip's fast-forward. Lands the actor exactly where the walk would have left them, which is
    // what makes a skipped scene and a watched one leave the same room behind.
    snapActor(command) {
      const actor = sceneActor(command.actor);
      if (!actor) return;
      actor.x = command.to.x;
      actor.y = command.to.y;
      actor.walking = false;
      if (hubScene.followsPlayer) instituteMovement.moving = false;
      hubScene.escort = null;
    },
    isMoveDone: () => !hubScene.escort || hubScene.escort.done,
    turnActor(command) {
      const actor = sceneActor(command.actor);
      if (actor) actor.facing = command.facing;
    },
    say(command, fast) {
      hubScene.speaker = command.speaker;
      hubScene.line = command.line;
      typeHubSceneLine(command.line, fast);
    },
    highlightObject(command) {
      hubScene.highlight = command.off ? null : command.target;
    },
    playSound(command) {
      playSfx(command.cue);
    },
    // §4 rule 6: written *before* control returns, so a reload on the last frame of a scene cannot
    // replay a scene the player has already finished. The interpreter guarantees the ordering; this
    // just has to actually persist.
    setFlag(command) {
      progress.story.flags[command.flag] = command.value ?? true;
      save();
    },
    returnControl() {
      hubScene.speaker = null;
      hubScene.line = "";
      hubScene.highlight = null;
      hubScene.escort = null;
    },
    fade() {
      document.getElementById("sceneFade")?.classList.add("scene-fade--doorway");
    },
  };
}

/**
 * Starts an authored scene, if it exists and has not already been seen.
 *
 * Returns whether it started, so a caller that wanted a scene and did not get one can carry on to
 * whatever it would otherwise have done.
 */
function startHubScene(id) {
  const scene = CUTSCENES[id];
  if (!scene || isHubSceneActive()) return false;
  stopHubScene();
  hubScene.id = id;
  hubScene.state = createScene(scene);
  hubScene.lastAt = performance.now();
  hubHeldKeys.clear();
  stopHubMovementLoop();
  instituteMovement.moving = false;
  render();
  hubScene.frame = window.requestAnimationFrame(runHubSceneFrame);
  return true;
}

// Self-terminating rAF in the same shape as runHallwayEscort() and runHubMovementLoop(), including
// the elapsed clamp, and patching the DOM directly rather than re-rendering per frame.
function runHubSceneFrame(now) {
  if (!hubScene.state) {
    hubScene.frame = null;
    return;
  }
  const elapsed = Math.min(48, Math.max(0, now - hubScene.lastAt || 16));
  hubScene.lastAt = now;

  if (hubScene.escort && !hubScene.escort.done) {
    stepEscort(hubScene.escort, elapsed);
    if (hubScene.followsPlayer) updateInstitutePlayer(SCENE_WALK_SPEED);
  }
  stepScene(hubScene.state, elapsed, hubSceneEffects());
  paintHubSceneFrame();

  if (hubScene.state.done) {
    finishHubScene();
    return;
  }
  hubScene.frame = window.requestAnimationFrame(runHubSceneFrame);
}

/** Pushes this frame's actor positions and highlight onto the DOM the last render() put up. */
function paintHubSceneFrame() {
  const runtime = activeHubNpcRuntime();
  for (const [id, body] of Object.entries(runtime)) {
    const node = document.querySelector(`[data-hub-npc="${id}"]`);
    if (!node) continue;
    node.style.cssText = hubCharacterStyle(body.x, body.y);
    node.classList.toggle("is-walking-npc", Boolean(body.walking));
    node.dataset.facing = body.facing;
    applyCharacterSprite(
      node.querySelector(".character-sprite"),
      id,
      body.facing,
      Boolean(body.walking),
      SCENE_WALK_SPEED
    );
  }
  document
    .querySelectorAll(".hub-marker")
    .forEach((marker) =>
      marker.classList.toggle("is-scene-lit", marker.dataset.target === hubScene.highlight)
    );
}

/**
 * The single teardown, run by natural completion and by skip alike.
 *
 * §4 is explicit that two teardown paths is how a skipped scene leaves the player frozen, so skip
 * does not have its own version of this — `skipHubScene()` fast-forwards the interpreter and then
 * lands here.
 */
function finishHubScene() {
  const runtime = activeHubNpcRuntime();
  // Rule 3: no actor is left mid-route. An escort leaves `walking` true on whoever it was moving.
  for (const body of Object.values(runtime)) body.walking = false;
  instituteMovement.moving = false;
  document.getElementById("sceneFade")?.classList.remove("scene-fade--doorway");
  stopHubScene();
  save();
  // Rule 2: the "Press E" prompt is restored by the same render that removes the dialogue bar, so
  // there is never a frame offering an interaction that is already happening.
  render();
}

/** Player input during a scene. Releases a line; a walk and a fade are not skippable this way. */
function advanceHubScene() {
  if (!isHubSceneActive()) return;
  // A part-typed line completes on the first press and advances on the second, matching the intro
  // typewriter's tap-to-skip rather than inventing a second convention for the same gesture.
  if (hubScene.typeTimer) {
    clearTimeout(hubScene.typeTimer);
    hubScene.typeTimer = null;
    const textEl = document.getElementById("hubSceneLine");
    if (textEl) textEl.textContent = hubScene.line;
    document.getElementById("hubSceneIndicator")?.removeAttribute("hidden");
    return;
  }
  advanceScene(hubScene.state);
}

/** Escape, or the skip control. Runs the rest of the scene in fast-forward, then the one teardown. */
function skipHubScene() {
  if (!isHubSceneActive()) return;
  clearTimeout(hubScene.typeTimer);
  hubScene.typeTimer = null;
  skipScene(hubScene.state, hubSceneEffects());
  finishHubScene();
}

// One line, typed into the bar the hub scene renders. A slimmer sibling of startIntroTypewriter():
// the interpreter owns the line cursor here, so this types a string and says when it is done rather
// than walking an array and tracking which steps have been seen.
function typeHubSceneLine(text, instant) {
  clearTimeout(hubScene.typeTimer);
  hubScene.typeTimer = null;
  const textEl = document.getElementById("hubSceneLine");
  const nameEl = document.getElementById("hubSceneName");
  if (nameEl) nameEl.textContent = characterDisplayName(hubScene.speaker);
  if (!textEl) return;
  document.getElementById("hubSceneIndicator")?.setAttribute("hidden", "");
  if (instant || prefersReducedMotion()) {
    textEl.textContent = text;
    document.getElementById("hubSceneIndicator")?.removeAttribute("hidden");
    return;
  }
  textEl.textContent = "";
  let charIndex = 0;
  const typeNextChar = () => {
    charIndex += 1;
    textEl.textContent = text.slice(0, charIndex);
    if (charIndex >= text.length) {
      hubScene.typeTimer = null;
      document.getElementById("hubSceneIndicator")?.removeAttribute("hidden");
      return;
    }
    const pause = INTRO_PAUSE_AFTER[text[charIndex - 1]] || 1;
    hubScene.typeTimer = setTimeout(typeNextChar, INTRO_TYPE_MS * pause);
  };
  hubScene.typeTimer = setTimeout(typeNextChar, INTRO_TYPE_MS);
}

/** The in-world speech bar a scene speaks through. Empty markup when no scene is running. */
function hubSceneDialogueMarkup() {
  if (!isHubSceneActive()) return "";
  const name = characterDisplayName(hubScene.speaker);
  return `<div class="hallway-dialogue" data-action="hub-scene-click" role="button" tabindex="0" aria-label="${esc(name)} speaking — click to continue"><p class="hallway-dialogue__name" id="hubSceneName">${esc(name)}</p><p class="director-dialogue-box__text" id="hubSceneLine"></p><span class="director-continue-indicator" id="hubSceneIndicator" hidden>▼</span><button class="btn btn-outline hub-scene-skip" data-action="hub-scene-skip" type="button">Skip scene</button></div>`;
}

/** A character's player-facing name, from whichever table knows them. */
function characterDisplayName(id) {
  if (!id) return "";
  if (id === "player") return progress.profile.name || "Chronicler";
  return activeHubTargets()[id]?.name || CHARACTER_SHEETS[id]?.name || "";
}

// Base per-character delay for the intro typewriter, plus extra hold time (as a multiple of
// INTRO_TYPE_MS) after punctuation so a line reads with natural rhythm instead of a flat scroll.
// Kept as named constants (not inlined) so a future progress.settings.textSpeed can scale them.
const INTRO_TYPE_MS = 30;
const INTRO_PAUSE_AFTER = { ".": 5, "!": 5, "?": 5, ",": 2 };

// Fills in the empty shell directorSceneMarkup() rendered, using the setTimeout +
// direct-DOM-patch convention already established by updateInstituteNpcs/updateFieldNpcs
// (main.js) rather than re-running render() per character. setTimeout (not setInterval) is used
// so each character's delay can vary for the punctuation-pause effect below.
function startIntroTypewriter() {
  clearTimeout(introTypewriterTimer);
  introTypewriterTimer = null;
  const step = currentIntroLines();
  const textEl = document.getElementById("directorLineText");
  const railEl = document.getElementById("directorRevealRail");
  if (!step || !textEl || !railEl) return;

  if (introSeenSteps.has(step.stepKey)) {
    introLineIndex = step.lines.length - 1;
    textEl.textContent = step.lines[introLineIndex].text;
    railEl.innerHTML = step.lines
      .filter((line) => line.reveal)
      .map((line) => revealCardMarkup(line.reveal))
      .join("");
    completeCurrentIntroStep(step);
    return;
  }

  if (introLineIndex === 0) railEl.innerHTML = "";
  const line = step.lines[introLineIndex];
  textEl.textContent = "";
  document.getElementById("directorContinueIndicator")?.setAttribute("hidden", "");
  if (line.reveal) {
    railEl.insertAdjacentHTML("beforeend", revealCardMarkup(line.reveal));
    if (line.reveal.type === "image") playSfx("codex-reveal");
  }

  const finishLine = () => {
    if (introLineIndex === step.lines.length - 1) {
      completeCurrentIntroStep(step);
    } else {
      document.getElementById("directorContinueIndicator")?.removeAttribute("hidden");
    }
  };

  if (prefersReducedMotion()) {
    textEl.textContent = line.text;
    finishLine();
    return;
  }

  let charIndex = 0;
  const typeNextChar = () => {
    charIndex += 1;
    textEl.textContent = line.text.slice(0, charIndex);
    if (charIndex >= line.text.length) {
      introTypewriterTimer = null;
      finishLine();
      return;
    }
    const pause = INTRO_PAUSE_AFTER[line.text[charIndex - 1]] || 1;
    introTypewriterTimer = setTimeout(typeNextChar, INTRO_TYPE_MS * pause);
  };
  introTypewriterTimer = setTimeout(typeNextChar, INTRO_TYPE_MS);
}

function identityScreen() {
  const c = CHRONICLE_IDENTITY_DEFAULTS.identity;
  const isA = progress.profile.appearance !== "b";
  return `${chrome()}<main class="shell completion-shell"><section><p class="kicker">${esc(c.eyebrow)}</p><h1>${esc(c.title)}</h1><p>${esc(c.subtitle)}</p><p>${esc(c.appearanceLabel)}</p><div class="completion-actions chronicler-choices">${["a", "b"].map((key) => `<button class="btn chronicler-choice ${(key === "a") === isA ? "btn-gold" : "btn-outline"}" data-action="set-appearance" data-value="${key}" aria-pressed="${(key === "a") === isA}"><img src="${CHARACTER_SHEETS[`chronicler-${key}`].portrait}" alt="" height="84"><b>Chronicler ${key.toUpperCase()}</b></button>`).join("")}</div><p>${esc(c.appearanceHelp)}</p><label>${esc(c.nameLabel)}<input data-profile="name" maxlength="14" value="${esc(progress.profile.name)}" placeholder="${esc(c.namePlaceholder)}"></label><p>${esc(c.nameHelp)}</p><p class="feedback" id="identityFeedback"></p><div class="completion-actions"><button class="btn btn-outline" data-action="intro-advance" data-next="intro-protocol">${esc(c.back)}</button><button class="btn btn-gold" data-action="confirm-identity">${esc(c.confirm)} →</button></div></section></main>`;
}

function introRegistrationScreen() {
  const r = CHRONICLE_IDENTITY_DEFAULTS.registration;
  return `${chrome()}<main class="shell completion-shell"><section><p class="kicker">${esc(r.eyebrow)}</p><h1>${esc(r.title)}</h1><p class="subtitle">${esc(r.subtitle)}</p><p><b>${esc(r.profileLabel)}:</b> ${esc(progress.profile.name)} · <b>${esc(r.assignmentLabel)}:</b> ${esc(r.assignment)}</p><p>${esc(r.codexLabel)} — ${esc(r.codexBody)}</p><div class="completion-actions"><button class="btn btn-outline" data-action="intro-advance" data-next="identity">${esc(r.back)}</button><button class="btn btn-gold" data-action="intro-advance" data-next="hallway">${esc(r.enter)} →</button></div></section></main>`;
}

const UNIT_BADGES = {
  "unit-01": [
    {
      id: "case-001",
      label: "Caribbean",
      title: "Caribbean Field Badge",
      icon: "✦",
      description: "Village life, Columbus account, and Waldseemüller map record preserved.",
    },
    {
      id: "case-002",
      label: "Atlantic",
      title: "Atlantic Exchange Badge",
      icon: "⌁",
      description: "Exchange route record will appear after the Atlantic case is archived.",
    },
    {
      id: "case-003",
      label: "Hispaniola",
      title: "Hispaniola Empire Badge",
      icon: "◆",
      description:
        "Empire and resistance record will appear after the Hispaniola case is archived.",
    },
  ],
  "unit-02": [
    {
      id: "case-004",
      label: "Riverbend",
      title: "Riverbend Field Badge",
      icon: "⚑",
      description:
        "Company charter, indentured servant's letter, and wharf accounts preserved from the settlement.",
    },
    {
      id: "case-005",
      label: "Atlantic Circuit",
      title: "Triangle Ledger Badge",
      icon: "▲",
      description: "Atlantic trade circuit charted and its records validated.",
    },
    {
      id: "case-006",
      label: "Regions",
      title: "Charter & Compact Badge",
      icon: "❖",
      description: "Colonial regions display restored with founding records.",
    },
  ],
};
export function badgeRecordsForUnit(unit) {
  return (UNIT_BADGES[unit.id] || []).map((badge) => ({
    ...badge,
    earned:
      badge.id === "case-001"
        ? progress.completedCases.includes("case-001") || countEvidence("case-001") >= 3
        : progress.completedCases.includes(badge.id),
  }));
}

function unitOneBadgeCaseMarkup() {
  // Renders the full Preservation Case (all units), keeping the historical name
  // so the hub's trophy call site stays untouched.
  const sections = UNITS.map((unit) => {
    const badges = badgeRecordsForUnit(unit);
    return `<h3 class="badge-case-unit-title">${esc(unit.period)}</h3><div class="badge-case-grid">${badges.map((badge) => `<section class="badge-card ${badge.earned ? "is-earned" : "is-locked"}"><div class="badge-medallion"><span>${badge.earned ? badge.icon : "○"}</span></div><div><b>${esc(badge.title)}</b><small>${badge.earned ? "Preserved" : "Locked"}</small><p>${esc(badge.description)}</p></div></section>`).join("")}</div>`;
  }).join("");
  return `<div class="preservation-case" role="dialog" aria-modal="true" aria-labelledby="preservationCaseTitle"><article><button class="hub-dialogue__close" data-action="hub-dialogue-close" aria-label="Close preservation case">×</button><p class="kicker">Preservation Case</p><h2 id="preservationCaseTitle">Chronicle Badge Case</h2><p class="preservation-case__subtitle">Badges are preserved here after each field area is completed and transmitted through the Codex.</p>${sections}<button class="btn btn-outline preservation-case__mastery-link" data-action="open-mastery">Skill Mastery Record →</button><button class="btn btn-outline preservation-case__mastery-link" data-action="open-archive-rotation">The Archive Rotation →</button></article></div>`;
}

// Where a character stands in the active hub room: pixels inside #hubWorld, which updateHubCamera()
// then translates. Both hub rooms are camera rooms as of Phase 54 — the percentage branch that used
// to live here existed only for the Main Hall while it was a stretched background PNG, and keeping
// it would leave a trap where a new room that forgot to declare a `tile` silently laid itself out
// in percentages against a box of a different shape.
//
// The anchor is (x, y) exactly — the same point hubFootBoxFor() tests collision against, with the
// remaining offset down to the feet applied once in CSS as `--cast-foot`. It did not used to be.
// Until Phase 61 this shifted the character half a tile right and roughly half a tile down, and
// `--cast-foot: 33.5px` pushed it down another 0.7, so the Institute drew everyone 0.50 tiles right
// and 1.02 tiles below where the game believed they were standing. Nobody noticed for a long time
// because the error was identical for the player and all three staff — they looked consistent with
// each other, and merely wrong about the room. What gave it away was Prof. Park appearing to stand
// on the south wall while collision correctly held him a tile clear of it.
function hubCharacterStyle(x, y) {
  const grid = activeHubGrid();
  return `left:${(x * grid.tile).toFixed(1)}px;top:${(y * grid.tile).toFixed(1)}px;`;
}
function institutePositionStyle() {
  return hubCharacterStyle(instituteMovement.x, instituteMovement.y);
}
// An interactable object's marker covers the object's own painted tiles: tile column C spans pixels
// [C*tile, (C+1)*tile), so a target's `marker` rect (taken straight from the generator stamp that
// painted the thing) lands exactly on the art. Unlike hubCharacterStyle() this positions a rect by
// its own edges rather than a single point, so it takes no half-tile centring bias either way.
function hubMarkerStyle(marker) {
  const { tile } = activeHubGrid();
  return `left:${marker.col * tile}px;top:${marker.row * tile}px;width:${marker.w * tile}px;height:${marker.h * tile}px;`;
}
// Every interactable *object* in either hub room, in one shape (Phase 59). The Institute used to
// carry three unrelated treatments for the same idea — a `✦` medallion for the Navigation Table, the
// same class with a `▤` for the Archive Room door, and a separate teal `▣` pill with a `!` badge for
// the Preservation Case — spread across ~14 layered !important CSS blocks. Now the object's own
// footprint glows and a label pill names it from above; proximity is carried by the near-state
// pulse and the "Press E · …" prompt, so no glyphs or badges are needed. NPCs keep their own
// treatment (name below the sprite): a person is not a piece of furniture.
function hubObjectMarker(targetId, label, ariaLabel) {
  const target = activeHubTargets()[targetId];
  const side = target.marker.labelSide === "below" ? "below" : "above";
  return `<button class="hub-marker hub-marker--label-${side} ${isHubTargetNear(targetId) ? "is-near" : ""}" style="${hubMarkerStyle(target.marker)}" data-action="hub-interact" data-target="${targetId}" data-hub-target="${targetId}" aria-label="${esc(ariaLabel)}"><b>${esc(label)}</b></button>`;
}
// Mirrors updateFieldPlayer()'s camera exactly: a pure function of player position, recomputed
// every tick from the live viewport size and clamped to the world's edges, integer-rounded so
// text stays crisp. Nothing here may scroll the document or move toward a clicked element —
// see CLAUDE.md's camera invariant.
function updateHubCamera() {
  const grid = activeHubGrid();
  const world = document.getElementById("hubWorld");
  if (!world || !world.parentElement) return;
  const viewport = world.parentElement.getBoundingClientRect();
  const worldWidth = grid.columns * grid.tile;
  const worldHeight = grid.rows * grid.tile;
  const px = instituteMovement.x * grid.tile;
  const py = instituteMovement.y * grid.tile;
  const minX = Math.min(0, viewport.width - worldWidth);
  const minY = Math.min(0, viewport.height - worldHeight);
  const camX = Math.round(Math.max(minX, Math.min(0, viewport.width / 2 - px)));
  const camY = Math.round(Math.max(minY, Math.min(0, viewport.height / 2 - py)));
  world.style.transform = `translate(${camX}px, ${camY}px)`;
}
function targetDistance(target, id = null) {
  const state = id ? hubTargetState(id) : target;
  return Math.hypot(instituteMovement.x - state.x, instituteMovement.y - state.y);
}
function targetReach(id) {
  return id === "table" ? 1.65 : 1.1;
}
function nearestHubTarget() {
  return (
    Object.entries(activeHubTargets()).find(
      ([id, target]) => targetDistance(target, id) <= targetReach(id)
    ) || null
  );
}
/**
 * @param {number} [speed] the player's current ground speed in tiles/second, which sets the walk
 *   cycle. Defaults to HUB_SPEED — pass the escort's slower pace while it owns the player, or the
 *   legs run 66% faster than the feet travel, which is exactly the skating CLAUDE.md's invariant
 *   is about.
 */
function updateInstitutePlayer(speed = HUB_SPEED) {
  const player = document.getElementById("institutePlayer");
  const sprite = document.getElementById("institutePlayerSprite");
  const prompt = document.getElementById("hubInteractPrompt");
  if (!player || !sprite) return;
  player.style.cssText = institutePositionStyle();
  player.dataset.facing = instituteMovement.facing;
  applyCharacterSprite(
    sprite,
    chroniclerKey(),
    instituteMovement.facing,
    instituteMovement.moving,
    speed
  );
  updateHubCamera();
  // No "Press E" while a scripted beat owns the room: the Director stays well inside reach for the
  // whole conversation and the whole escort, so without this the prompt hangs on screen offering an
  // interaction that is already happening.
  const nearby = isHubInputLocked() ? null : nearestHubTarget();
  if (prompt) {
    prompt.hidden = !nearby;
    prompt.textContent = nearby ? `Press E · ${nearby[1].name}` : "";
  }
  updateHubProximityUi();
}
function updateHubProximityUi() {
  const targets = activeHubTargets();
  Object.keys(targets).forEach((id) => {
    // One selector for every kind of target, now that objects and NPCs both carry a data attribute
    // naming themselves. This used to branch on `id === "trophy"` / `id === "table"` and query bare
    // classes, which only picked the right node because of DOM order — the Archive Room door and the
    // Navigation Table shared a class, so `.hub-table` silently meant "whichever came first".
    const node = document.querySelector(`[data-hub-npc="${id}"], [data-hub-target="${id}"]`);
    if (node) node.classList.toggle("is-near", isHubTargetNear(id));
  });
}
/**
 * Whether a step from `here` to `next` runs into one of `bodies` — the other people in the room.
 *
 * The whole subtlety is the second clause. A body the walker is ALREADY standing inside does not
 * block, or an overlap would be permanent: every direction out of it overlaps too, so the walker is
 * boxed in for good. Two things in this game produce an overlap without ever consulting a collision
 * test — safeInstituteSpawn()'s default (11.5, 9) lands 0.4 tiles off one of Julian's stops, and the
 * Entrance Hall escort parks the player a stride behind the Director — and both need the way out.
 *
 * Exported and taking its rects rather than reading module state, per CLAUDE.md's export-in-place
 * rule: isHubBlocked() below is the half that knows about the room, and this is the half worth
 * asserting on.
 *
 * @param {{x1:number,y1:number,x2:number,y2:number}} next  foot box of the step being considered
 * @param {{x1:number,y1:number,x2:number,y2:number}} here  foot box where the walker is standing
 * @param {{x1:number,y1:number,x2:number,y2:number}[]} bodies
 */
export function isBlockedByBody(next, here, bodies) {
  return bodies.some((body) => rectsOverlap(next, body) && !rectsOverlap(here, body));
}
function isHubBlocked(x, y) {
  const grid = activeHubGrid();
  const edge = x < 0.6 || y < 0.8 || x > grid.columns - 1.2 || y > grid.rows - 1.2;
  if (edge) return true;
  const foot = hubFootBoxFor(x, y);
  if (hubRectBlocked(foot)) return true;
  // Staff are solid, the same way field NPCs are in isFieldBlocked(). Both directions hold now:
  // isHubNpcBlocked() has always refused to walk an NPC through the player, and until Phase 64 this
  // side did not reciprocate, so the player walked through Prof. Park.
  return isBlockedByBody(
    foot,
    hubFootBoxFor(instituteMovement.x, instituteMovement.y),
    Object.values(activeHubNpcRuntime()).map((npc) => hubFootBoxFor(npc.x, npc.y))
  );
}
function hubHeldVector() {
  let dx = 0;
  let dy = 0;
  hubHeldKeys.forEach((key) => {
    const move = FIELD_MOVE_KEYS[key];
    if (!move) return;
    dx += move[0];
    dy += move[1];
  });
  if (dx && dy) {
    const scale = Math.SQRT1_2;
    dx *= scale;
    dy *= scale;
  }
  return [dx, dy];
}
function startHubMovementLoop() {
  if (hubMoveFrame) return;
  lastHubMoveAt = performance.now();
  hubMoveFrame = window.requestAnimationFrame(runHubMovementLoop);
}
function stopHubMovementLoop() {
  if (hubMoveFrame) window.cancelAnimationFrame(hubMoveFrame);
  hubMoveFrame = null;
  lastHubMoveAt = 0;
}
function runHubMovementLoop(now) {
  if (progress.currentScreen !== "institute" || isHubInputLocked()) {
    hubHeldKeys.clear();
    instituteMovement.moving = false;
    stopHubMovementLoop();
    return;
  }
  const [dx, dy] = hubHeldVector();
  if (!dx && !dy) {
    instituteMovement.moving = false;
    updateInstitutePlayer();
    stopHubMovementLoop();
    return;
  }
  const elapsed = Math.min(48, Math.max(0, now - lastHubMoveAt || 16));
  lastHubMoveAt = now;
  const distance = HUB_SPEED * (elapsed / 1000);
  instituteMovement.facing =
    Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
  const nextX = Number((instituteMovement.x + dx * distance).toFixed(3));
  const nextY = Number((instituteMovement.y + dy * distance).toFixed(3));
  let moved = false;
  if (!isHubBlocked(nextX, nextY)) {
    instituteMovement.x = nextX;
    instituteMovement.y = nextY;
    moved = true;
  } else {
    const slideX = Number((instituteMovement.x + dx * distance).toFixed(3));
    const slideY = Number((instituteMovement.y + dy * distance).toFixed(3));
    if (dx && !isHubBlocked(slideX, instituteMovement.y)) {
      instituteMovement.x = slideX;
      moved = true;
    }
    if (dy && !isHubBlocked(instituteMovement.x, slideY)) {
      instituteMovement.y = slideY;
      moved = true;
    }
  }
  instituteMovement.moving = moved;
  if (moved) instituteMovement.step = !instituteMovement.step;
  updateInstitutePlayer();
  hubMoveFrame = window.requestAnimationFrame(runHubMovementLoop);
}
function interactWithHubTarget(id) {
  if (isHubInputLocked()) return;
  const target = activeHubTargets()[id];
  if (!target) return;
  if (targetDistance(target, id) > targetReach(id)) {
    progress.hubNotice = `Move closer to interact with ${target.name}.`;
    save();
    updateInstitutePlayer();
    return;
  }
  if (target.action === "archive") {
    playSfx("secure");
    progress.currentScreen = "archive";
    save();
    render();
    return;
  }
  if (target.action === "enter-archive-room") {
    playSfx("secure");
    safeInstituteSpawn(
      ARCHIVE_ROOM_TARGETS.exitDoor.x,
      ARCHIVE_ROOM_TARGETS.exitDoor.y - 0.6,
      "up"
    );
    progress.currentHubRoom = "archive";
    save();
    render();
    return;
  }
  if (target.action === "leave-archive-room") {
    playSfx("secure");
    safeInstituteSpawn(HUB_TARGETS.archiveDoor.x, HUB_TARGETS.archiveDoor.y + 0.6, "down");
    save();
    render();
    return;
  }
  if (target.action === "archive-challenges") {
    playSfx("secure");
    progress.currentScreen = "archive-challenges";
    save();
    render();
    return;
  }
  if (target.action === "hallway-brief") {
    playSfx("dialogue");
    hallwayScene.phase = "talking";
    introLineIndex = 0;
    hubHeldKeys.clear();
    stopHubMovementLoop();
    instituteMovement.moving = false;
    // Turn to face each other rather than leaving whichever way they were walking.
    instituteMovement.facing = "up";
    hallwayNpcRuntime.director.facing = "down";
    render();
    return;
  }
  playSfx(id === "trophy" ? "archive-receive" : "dialogue");
  hubDialogueId = id;
  render();
}
function instituteNpc(targetId, label) {
  const target = activeHubTargets()[targetId];
  const state = hubTargetState(targetId);
  const runtime = activeHubNpcRuntime();
  const isNear = !isHubInputLocked() && targetDistance(target, targetId) <= targetReach(targetId);
  const walking = Boolean(runtime[targetId]?.walking);
  // hubCharacterStyle() rather than the percentage math this used to inline: the Main Hall became a
  // camera room in Phase 54, and a hardcoded percentage would have placed all three NPCs wrong the
  // moment HUB_GRID gained a `tile`.
  return `<button class="hub-npc hub-npc--${targetId} ${isNear ? "is-near" : ""} ${walking ? "is-walking-npc" : ""}" data-facing="${esc(state.facing || "down")}" style="${hubCharacterStyle(state.x, state.y)}" data-action="hub-interact" data-target="${targetId}" data-hub-npc="${targetId}" aria-label="Speak with ${esc(target.name)}"><span class="cast-shadow"></span>${characterSpriteMarkup(targetId, state.facing || "down", { walking, speed: runtime[targetId]?.speed })}<span>${esc(label)}</span>${isNear ? "<i>!</i>" : ""}</button>`;
}
function instituteScreen() {
  if (progress.currentHubRoom === "archive") return archiveRoomScreen();
  if (progress.currentHubRoom === "hallway") return instituteHallwayScreen();
  return instituteMainRoomScreen();
}
/**
 * The Entrance Hall: the first room the player walks into, and the first thing they control.
 *
 * Deliberately the same shell as the other two rooms, down to `#instituteMap` and `#hubWorld`, so
 * the doorway flicker cuts to the Main Hall without the page geometry moving underneath it. What
 * differs is what belongs to an entrance rather than a hub: one NPC, no object markers, no Codex
 * button (there is nothing in it yet) and no reset link (a footgun to put in front of someone who
 * has been playing for ninety seconds).
 */
function instituteHallwayScreen() {
  const nearby = isHubInputLocked() ? null : nearestHubTarget();
  // One objective and one control legend, not three restatements of the same sentence. The controls
  // line stays a sibling of the card rather than a third <span> inside it: `.archive-badges span`
  // outranks `.hub-controls`, and folding it in would erase the muted styling that tells the player
  // which of the two lines is the thing to do and which is the key to press.
  //
  // The card is a sibling of `.hub-intro` below, not a child of it as it is in the other two rooms.
  // Nested, `.hub-intro p:not(.kicker)` outranked both `.hub-sidepanel .role` and `.hub-controls`,
  // so the card's two quiet lines were silently rendered at intro-body size.
  const sidePanel = `<aside class="hub-sidepanel hub-sidepanel--left"><p class="kicker">Institute status</p><h2>${esc(progress.profile.name || "Chronicler")}</h2><p class="role">Orientation · Unit 1</p><div class="archive-badges archive-badges--compact"><b>First steps</b><span>Walk to Director Hale and press E to speak with him.</span></div><p class="hub-controls">Arrow keys / WASD to move · E or click to interact</p></aside>`;
  const worldStyle = `width:${HALLWAY_GRID.columns * HALLWAY_GRID.tile}px;height:${HALLWAY_GRID.rows * HALLWAY_GRID.tile}px`;
  // The typewriter bar is the same rail the director-stage intro screens use — #directorLineText,
  // #directorContinueIndicator and #directorRevealRail all have to be here by those exact ids, since
  // startIntroTypewriter() writes into them and returns early without the rail. The Entrance Hall
  // authors no reveals, so the rail stays empty; the briefing's own reveals are untouched, in their
  // own screen.
  const dialogue =
    hallwayScene.phase === "talking"
      ? `<div class="hallway-dialogue" data-action="hallway-dialogue-click" role="button" tabindex="0" aria-label="Director Rowan Hale speaking — click to continue"><div class="director-reveal-rail" id="directorRevealRail" hidden></div><p class="hallway-dialogue__name">Director Rowan Hale</p><p class="director-dialogue-box__text" id="directorLineText"></p><span class="director-continue-indicator" id="directorContinueIndicator" hidden>▼</span></div>`
      : "";
  // The dialogue sits in `.hub-column` alongside `.hub-intro`, not inside it: `.hub-intro
  // p:not(.kicker)` is a descendant selector that outranks `.director-dialogue-box__text`, so nesting
  // the bar would quietly restyle the typewriter it is built around. One wrapper keeps the Director's
  // speech directly under the status card and off the fold, without touching the map's grid column.
  return `${chrome()}<main class="hub-shell hub-shell--status-left"><div class="hub-column"><section class="hub-intro"><p class="kicker">Present day · Chronicle Institute</p><h1>Entrance Hall</h1><p class="hub-subtitle">Where every recovered record comes in.</p><div class="hub-meta"><span>Chronicle Institute · Orientation · Your first day.</span></div></section>${sidePanel}${dialogue}</div><section class="institute-map institute-map--hallway" id="instituteMap" aria-label="Playable Chronicle Institute entrance hall"><div class="hub-world" id="hubWorld" style="${worldStyle}"><canvas class="field-world-art" id="hallwayTiledCanvas" role="img" aria-label="Top-down stone entrance hall: record cabinets and pigeonhole racks down both long walls, an intake bench and a reading table in the middle, and double doors at the far end leading into the Institute's main hall"></canvas><canvas class="field-world-overlay" id="hallwayTiledCanvasOverlay" aria-hidden="true"></canvas>${instituteNpc("director", "Director Hale")}<div class="hub-player" id="institutePlayer" data-facing="${instituteMovement.facing}" style="${institutePositionStyle()}" aria-label="${esc(progress.profile.name || "Chronicler")}"><span class="cast-shadow"></span>${characterSpriteMarkup(chroniclerKey(), instituteMovement.facing, { id: "institutePlayerSprite", walking: instituteMovement.moving, speed: HUB_SPEED })}</div></div><div class="hub-interact-prompt" id="hubInteractPrompt" ${nearby ? "" : "hidden"}>${nearby ? `Press E · ${esc(nearby[1].name)}` : ""}</div></section></main><div class="scene-fade" id="sceneFade"></div>`;
}
// Caption panel for the post-hallway guided tour — reuses the existing .hub-dialogue panel
// structure/styling (the same markup hubDialogueId's dialogue renders) rather than inventing new
// UI, but with a "Next"/"Got it" advance button instead of a close button, since the tour has no
// way to dismiss early.
function tourCalloutMarkup() {
  const stepId = currentTourStepId();
  const content = CHRONICLE_OPENING_DEFAULTS.tour[stepId];
  if (!content) return "";
  return `<div class="hub-dialogue hub-dialogue--tour" role="dialog" aria-modal="true" aria-labelledby="tourCalloutTitle"><article><div class="hub-dialogue__portrait"><img src="${CHARACTER_SHEETS.director.portrait}" alt=""></div><div><p class="kicker">${esc(content.role)}</p><h2 id="tourCalloutTitle">${esc(content.name)}</h2><p>${esc(content.body)}</p><button class="btn btn-gold" data-action="tutorial-tour-next">${esc(content.cta)}</button></div></article></div>`;
}
function instituteMainRoomScreen() {
  const nearby = nearestHubTarget();
  const dialogue = hubDialogueId ? HUB_TARGETS[hubDialogueId] : null;
  const status =
    progress.hubNotice ||
    (progress.completedCases.length
      ? `${progress.completedCases.length}/3 Unit 1 cases archived.`
      : "Your first active route awaits at the Navigation Table.");
  const sidePanel = `<aside class="hub-sidepanel hub-sidepanel--left"><p class="kicker">Institute status</p><h2>${esc(progress.profile.name || "Chronicler")}</h2><p class="role">Active researcher · Unit 1</p><div class="hub-progress"><span><b>${progress.completedCases.length}</b> / 3 cases archived</span><span><b>${countEvidence("case-001")}</b> evidence records secured</span></div><div class="archive-badges archive-badges--compact"><b>Badge case</b><span>Walk to the Preservation Case on its plinth in the west alcove to view Unit 1 badges.</span></div><div class="hub-actions"><button class="btn btn-outline" data-action="codex" data-origin="hub">Open Codex <b>${countEvidence("case-001")}</b></button><button class="text-button" data-action="reset">Reset Unit 1 demo</button></div><p class="hub-controls">Move: Arrow keys / WASD<br>Interact: E or click when close</p></aside>`;
  // Same `.hub-world` + camera structure as archiveRoomScreen(): everything that lives in world
  // space goes inside the translated div, and the interact prompt stays outside it so it can't be
  // scrolled off screen. Two canvases, because the hall's greenery is stamped `base` and its
  // foliage draws from the map's overlay layer, above the player.
  const worldStyle = `width:${HUB_GRID.columns * HUB_GRID.tile}px;height:${HUB_GRID.rows * HUB_GRID.tile}px`;
  return `${chrome()}<main class="hub-shell hub-shell--status-left"><section class="hub-intro"><p class="kicker">Present day · Chronicle Institute</p><h1>Institute Archive</h1><p class="hub-subtitle">A living home base for every investigation.</p><p>Walk through the Institute with arrow keys or WASD. Speak with the Director and researchers, inspect preserved records, then approach the Navigation Table to open the map.</p><div class="hub-meta"><span>Unit 1 · ${esc(resolvedUnitTitle(UNIT_01))}</span><span>${esc(status)}</span></div>${sidePanel}</section>${hubSceneDialogueMarkup()}<section class="institute-map institute-map--main-hall" id="instituteMap" aria-label="Playable Chronicle Institute interior"><div class="hub-world" id="hubWorld" style="${worldStyle}"><canvas class="field-world-art" id="instituteHallTiledCanvas" role="img" aria-label="Top-down wood-panelled Institute hall: a Preservation Case plinth and founding stela in the west alcove, record shelving along the north wall, two transcription tables in the middle, and a compass-rose Navigation Table on the east dais"></canvas><canvas class="field-world-overlay" id="instituteHallTiledCanvasOverlay" aria-hidden="true"></canvas>${instituteNpc("director", "Director Hale")}${instituteNpc("amani", "Dr. Soto")}${instituteNpc("julian", "Prof. Park")}${instituteNpc("liaison", "Emery Voss")}${hubObjectMarker("trophy", "Preservation Case", "Open Unit 1 preservation case")}${hubObjectMarker("table", "Navigation Table", "Open Chronicle Navigation Table")}${hubObjectMarker("archiveDoor", "Archive Room", "Enter the Archive Room")}<div class="hub-player" id="institutePlayer" data-facing="${instituteMovement.facing}" style="${institutePositionStyle()}" aria-label="${esc(progress.profile.name || "Chronicler")}"><span class="cast-shadow"></span>${characterSpriteMarkup(chroniclerKey(), instituteMovement.facing, { id: "institutePlayerSprite", walking: instituteMovement.moving, speed: HUB_SPEED })}</div></div><div class="hub-interact-prompt" id="hubInteractPrompt" ${nearby ? "" : "hidden"}>${nearby ? `Press E · ${esc(nearby[1].name)}` : ""}</div></section>${dialogue ? (hubDialogueId === "trophy" ? unitOneBadgeCaseMarkup() : `<div class="hub-dialogue" role="dialog" aria-modal="true" aria-labelledby="hubDialogueTitle"><article><button class="hub-dialogue__close" data-action="hub-dialogue-close" aria-label="Close dialogue">×</button><div class="hub-dialogue__portrait"><img src="${sheetFor(hubDialogueId).portrait}" alt=""></div><div>${dialogue.role ? `<p class="kicker">${esc(dialogue.role)}</p>` : ""}<h2 id="hubDialogueTitle">${esc(dialogue.name)}</h2><p>${esc(dialogue.dialogue())}</p>${hubDialogueId === "director" ? '<p class="hub-dialogue__quote">“History does not need another hero. It needs someone willing to follow the evidence.”</p>' : ""}${hubDialogueId === "julian" ? '<button class="btn btn-gold" data-action="hub-open-table">Open Navigation Table →</button>' : ""}</div></article></div>`) : ""}${isTutorialTourActive() ? tourCalloutMarkup() : ""}</main>${authorPanel()}${enterMainHallFromBlack ? '<div class="scene-fade is-active" id="sceneFade"></div>' : ""}`;
}

// How much of a unit's written work is on file. Counts a challenge whose *retired* predecessor was
// completed on this save (archiveChallengeSatisfied()) as filed, so an old save's status line agrees
// with the cards archiveChallengesScreen() renders as already restored.
function unitArchiveChallengeProgress(unit) {
  const challenges = unit?.archiveChallenges || [];
  const filed = challenges.filter(
    (challenge) =>
      progress.archiveChallenges[challenge.questId]?.status === "complete" ||
      archiveChallengeSatisfied(challenge.questId, progress.archiveChallenges)
  ).length;
  return { filed, total: challenges.length };
}
function archiveRoomScreen() {
  const nearby = nearestHubTarget();
  const unit = unitById(progress.selectedUnitId) || UNIT_01;
  const unitNumber = UNITS.findIndex((u) => u.id === unit.id) + 1;
  const { filed, total } = unitArchiveChallengeProgress(unit);
  const evidenceSecured = unit.cases.reduce((n, c) => n + countEvidence(c.id), 0);
  const status = total
    ? `${filed}/${total} Archive Challenges filed for this unit.`
    : "Archive Challenges for this unit are still being cataloged.";
  // The Archive Room gets the Main Hall's status panel, in the same markup so it inherits the same
  // styling (Phase 59). Two reasons: the room had no status readout at all — the one room whose
  // whole purpose is filing written work could not tell you how much of it you had filed — and its
  // left column was four lines against the Main Hall's fifteen, so walking between the two rooms
  // changed the page height enough to toggle the scrollbar and slide the centred layout sideways.
  const sidePanel = `<aside class="hub-sidepanel hub-sidepanel--left"><p class="kicker">Archive status</p><h2>${esc(progress.profile.name || "Chronicler")}</h2><p class="role">Archive desk · Unit ${unitNumber}</p><div class="hub-progress"><span><b>${filed}</b> / ${total} Archive Challenges filed</span><span><b>${evidenceSecured}</b> evidence records secured</span></div><div class="archive-badges archive-badges--compact"><b>Written work</b><span>Approach the Archive Terminal at the north end of the room to compose this unit's Archive Challenges.</span></div><div class="hub-actions"><button class="btn btn-outline" data-action="codex" data-origin="hub">Open Codex <b>${evidenceSecured}</b></button></div><p class="hub-controls">Move: Arrow keys / WASD<br>Interact: E or click when close</p></aside>`;
  const worldStyle = `width:${ARCHIVE_ROOM_GRID.columns * ARCHIVE_ROOM_GRID.tile}px;height:${ARCHIVE_ROOM_GRID.rows * ARCHIVE_ROOM_GRID.tile}px`;
  return `${chrome()}<main class="hub-shell hub-shell--status-left"><section class="hub-intro"><p class="kicker">Chronicle Institute · Archive Room</p><h1>Institute Archive</h1><p class="hub-subtitle">Where recovered records are organized, restored, and preserved.</p><p>Approach the Archive Terminal to review Archive Challenges for the active unit. Walk back through the doorway to return to the Main Hall.</p><div class="hub-meta"><span>Unit ${unitNumber} · ${esc(resolvedUnitTitle(unit))}</span><span>${esc(status)}</span></div>${sidePanel}</section><section class="institute-map institute-map--archive-room" id="archiveRoomMap" aria-label="Playable Chronicle Institute Archive Room"><div class="hub-world" id="hubWorld" style="${worldStyle}"><canvas class="field-world-art" id="archiveRoomTiledCanvas" role="img" aria-label="Top-down wood-panelled archive room: record shelving and pigeonhole racks along the north wall, a lit hearth in the west nook, two long reading tables, and the Archive Terminal writing desk at the east end"></canvas><canvas class="field-world-overlay" id="archiveRoomTiledCanvasOverlay" aria-hidden="true"></canvas>${hubObjectMarker("terminal", "Archive Terminal", "Open Archive Terminal")}${hubObjectMarker("exitDoor", "Leave Archive", "Leave the Archive Room")}<div class="hub-player" id="institutePlayer" data-facing="${instituteMovement.facing}" style="${institutePositionStyle()}" aria-label="${esc(progress.profile.name || "Chronicler")}"><span class="cast-shadow"></span>${characterSpriteMarkup(chroniclerKey(), instituteMovement.facing, { id: "institutePlayerSprite", walking: instituteMovement.moving, speed: HUB_SPEED })}</div></div><div class="hub-interact-prompt" id="hubInteractPrompt" ${nearby ? "" : "hidden"}>${nearby ? `Press E · ${esc(nearby[1].name)}` : ""}</div></section></main>${authorPanel()}`;
}

// Shared render/grade/completion-tracking core for one Archive Challenge
// card, used for case-level challenges (case.archiveChallenge — completing
// one unlocks the next case, same as the bespoke screen it replaced, e.g.
// regionsScreen()), unit-level bonus challenges (unit.archiveChallenges[] —
// not tied to any case, so there's nothing to unlock via onComplete), and
// teacher-added addition-slot questions (no official questId to look up —
// see resolvedAdditionsForCase() in remote-content-selection-repository.js).
// A case-level challenge already in progress.completedCases from before its
// migration is shown as complete without replay, preserving old-save
// completion (alreadyComplete). archiveChallengeCard()/
// archiveChallengeAdditionCard() below are thin wrappers that resolve the
// quest object this core needs.
function archiveChallengeQuestCard(
  kicker,
  questType,
  quest,
  { alreadyComplete = false, onComplete } = {}
) {
  if (!quest) return "";
  const questId = quest.id;
  const state = progress.questResponses[questId] || {};
  const result = alreadyComplete ? { complete: true } : gradeQuest(questType, quest, state);
  if (!alreadyComplete) recordSkillOutcomes(questType, quest, state, result);
  const complete = alreadyComplete || isQuestComplete(questType, result);
  if (complete && progress.archiveChallenges[questId]?.status !== "complete") {
    progress.archiveChallenges[questId] = {
      status: "complete",
      completedAt: new Date().toISOString(),
    };
    if (!alreadyComplete) playSfx("upload");
    onComplete?.();
    // Case-level challenges get re-saved as a side effect of onComplete's
    // unlockNext() (which calls save() itself) — but a unit-level bonus
    // challenge (unit.archiveChallenges[], no onComplete) has nothing else to
    // trigger a save after this mutation, so the completion above would
    // otherwise only ever exist in memory, never actually persisted.
    save();
  }
  if (alreadyComplete) {
    return `<div class="quest-practice-item archive-challenge-item" data-quest-status="correct"><p class="kicker">${esc(kicker)}</p><p class="quest-prompt">${esc(quest.prompt)}</p><p class="activity-feedback success" role="status" aria-live="polite">Archive Challenge complete — this collection has already been restored and preserved.</p></div>`;
  }
  const feedback = complete
    ? `<p class="activity-feedback success" role="status" aria-live="polite">Archive Challenge complete — case record preserved.</p>`
    : `<p class="activity-feedback${questPartialSuccess(questType, result) ? " success" : ""}" role="status" aria-live="polite">${questHint(questType, result)}</p>`;
  const status = complete
    ? "correct"
    : questAnsweredAny(questType, state)
      ? "in-progress"
      : "unanswered";
  // SAQ/DBQ's "complete" only means "submitted" (see saq-quest.js/dbq-
  // quest.js's module doc comments) — the AI Archive Evaluator round trip is
  // a separate, optional step composed here rather than inside
  // renderQuest/gradeQuest, the same way sourceReader()/reviewScreen() layer
  // their own evaluator sections around their own bespoke content. Both
  // written-response types share one taskId convention and one evaluator
  // button — only the request-builder call differs (Phase 49E generalized
  // this from a saq-only block to also cover dbq).
  const isWrittenResponseType = questType === "saq" || questType === "dbq";
  const writtenTaskId = isWrittenResponseType ? `${questType}-quest-${quest.id}` : null;
  const existingWrittenSubmission = writtenTaskId ? progress.submissions[writtenTaskId] : null;
  const writtenEvaluatorSection =
    isWrittenResponseType && complete
      ? `<section class="archive-evaluator"><button class="btn btn-outline" data-action="evaluate-written-quest" data-quest-type="${esc(questType)}" data-quest="${esc(quest.id)}" ${evaluatorPendingTaskIds.has(writtenTaskId) ? "disabled" : ""}>${evaluatorPendingTaskIds.has(writtenTaskId) ? "Consulting the Archive Evaluator…" : existingWrittenSubmission ? "Get feedback on my revision →" : "Get Archive Evaluator feedback →"}</button>${evaluatorErrors[writtenTaskId] ? `<p class="feedback error">${esc(evaluatorErrors[writtenTaskId])}</p>` : ""}${archiveFeedbackMarkup(existingWrittenSubmission?.feedback?.payload)}</section>`
      : "";
  return `<div class="quest-practice-item archive-challenge-item" data-quest-status="${status}"><p class="kicker">${esc(kicker)}</p>${renderQuest(questType, quest, state)}${feedback}${writtenEvaluatorSection}</div>`;
}

function archiveChallengeCard(kicker, questType, questId, opts) {
  const resolved = archiveChallengeQuestFor(questType, questId);
  return archiveChallengeQuestCard(kicker, resolved?.questType || questType, resolved?.quest, opts);
}

// A teacher-added question with no official counterpart — already the full
// resolved content (no questId lookup needed), so it skips straight to the
// shared core.
function archiveChallengeAdditionCard(kicker, addition) {
  return archiveChallengeQuestCard(kicker, addition.slotKind, addition.content);
}
// One non-map mission: the active case's own quest, framed by that case's own title, central
// question and mechanic name.
//
// This is what `route: "mission"` dispatches to, and it is the whole point of the Phase 58 split.
// Before it, all six non-map cases carried `route: "archive-challenges"` and Chronotravel landed every
// one of them on archiveChallengesScreen() below, which renders **every** case's challenge in a single
// list merely reordered to put the traveled-to case first. Six missions, one screen, same heading and
// same list each time — the reported "it opens the same quest no matter what" — and five of the six
// happened to be the same quest type on top of that.
//
// Grading, completion, unlockNext(), skill outcomes and the teacher content-selection path are all
// unchanged: this reuses archiveChallengeCard() exactly as the list did, so a mission is the same
// quest it always was, shown on its own.
function missionScreen() {
  const kase = caseById(progress.activeCaseId) || caseById(progress.selectedCaseId);
  if (!kase?.archiveChallenge) {
    // A save resumed on "mission" with no active case, or pointed at a map case. Neither is
    // reachable through the Navigation Table; recover rather than render an empty board.
    progress.currentScreen = "archive";
    save();
    return archiveScreen();
  }
  const unit = unitForCase(kase.id) || UNIT_01;
  const card = archiveChallengeCard(
    // Not escaped here: archiveChallengeQuestCard() escapes the kicker itself.
    resolvedCaseTitle(kase),
    kase.archiveChallenge.questType,
    kase.archiveChallenge.questId,
    {
      alreadyComplete: progress.completedCases.includes(kase.id),
      onComplete: () => unlockNext(kase.id),
    }
  );
  // Teacher-added extra questions for *this* case only. On the shared list these were pooled from
  // every case in the unit, which is another way the same screen looked identical from six doors.
  const additions = resolvedAdditionsForCase(kase.id)
    .map((addition) =>
      archiveChallengeAdditionCard(`${resolvedCaseName(kase)} · Added question`, addition)
    )
    .join("");
  // Case number in the kicker, mission name in the h1 — the same eyebrow/title split the teacher's
  // Manage Content wizard header uses, so both sides of the app frame a mission identically. It
  // also stops `.activity-copy h1` from rendering "Case 1.02 — The Exchange Ledger" at ~55px in a
  // ~350px column, which wrapped the heading across five lines.
  const missionKicker = [caseNumberLabel(kase), unit.period].filter(Boolean).join(" · ");
  return `${chrome()}<main class="shell activity-shell activity-shell--wide quest-practice-shell mission-shell"><section class="activity-copy"><button class="back-link" data-action="archive">← Navigation Table</button><p class="kicker">${esc(missionKicker)}</p><h1>${esc(resolvedCaseName(kase))}</h1><p class="mission-question">${esc(kase.question)}</p><p>${esc(kase.summary)}</p><p class="mission-meta"><span>${esc(kase.location)}</span><span>${esc(kase.date)}</span></p></section><section class="activity-board quest-practice-board">${card}${additions}</section></main>${authorPanel()}`;
}

// Archive Challenges for the active unit, reached from the Archive Terminal in the Archive Room.
//
// As of Phase 58 this is the unit's **AP writing work** — SAQ and DBQ (`unit.archiveChallenges[]`) —
// and nothing else. It used to also render every non-map case's own mission quest, because those
// cases' route pointed here; they have missionScreen() above now. What is left is the group that
// genuinely belongs in the Archive Room: extended written responses a Chronicler composes at a desk
// from records already secured in the field, not a mission with a place and a date.
//
// Follows the same live-graded renderQuest/gradeQuest pattern practiceCheckScreen() already uses (no
// separate "submit" step — response state is graded on every render).
function archiveChallengesScreen() {
  const unit = unitById(progress.selectedUnitId) || UNIT_01;
  const cards = (unit.archiveChallenges || [])
    .map((challenge) =>
      archiveChallengeCard(
        `${resolvedUnitTitle(unit)} · Archive Challenge`,
        challenge.questType,
        challenge.questId,
        {
          // Shown as already restored, not re-asked, when this challenge's
          // retired predecessor was completed on this save — see
          // RETIRED_ARCHIVE_CHALLENGE_IDS.
          alreadyComplete:
            progress.archiveChallenges[challenge.questId]?.status !== "complete" &&
            archiveChallengeSatisfied(challenge.questId, progress.archiveChallenges),
        }
      )
    )
    .join("");
  return `${chrome()}<main class="shell activity-shell quest-practice-shell archive-challenges-shell"><section class="activity-copy"><button class="back-link" data-action="archive-room">← Return to Archive Terminal</button><p class="kicker">${esc(resolvedUnitTitle(unit))} · Institute Archive</p><h1>Archive Challenges</h1><p>The unit's extended written work, composed here at the Archive from records you have already secured in the field. Completing a unit's Archive Challenges is required to fully archive it.</p></section><section class="activity-board quest-practice-board">${cards || '<p class="bank-empty">Archive Challenges for this unit are still being cataloged. Check back soon.</p>'}</section></main>${authorPanel()}`;
}

// Investigation Challenge gate for the source currently opened from the field (openSourceId),
// reached only when sourceEntryScreen() finds source.investigationMode set and not yet
// complete. Same live-graded renderQuest/gradeQuest pattern as archiveChallengesScreen() —
// no separate "submit" step. Completing it (gradeQuest(...).complete) reveals a "Source
// Unlocked" button that continues into the normal sourceReader() worksheet; state lives in
// the existing progress.questResponses bucket, so leaving and resuming later just re-grades
// the same saved selections.
function investigationScreen() {
  const source = sourceById(openSourceId);
  if (!source?.investigationMode) {
    progress.currentScreen = "field";
    save();
    return `${chrome()}<main class="shell"><section class="empty-state"><p class="kicker">Investigation reset</p><h1>Investigation Challenge unavailable.</h1><p>The app recovered from a reload while an Investigation Challenge was open. Return to the field and approach the record again.</p><button class="btn btn-gold" data-action="field">Back to field →</button></section></main>`;
  }
  const { investigationMode: questType, investigationQuestId: questId } = source;
  const quest = investigationQuestFor(questType, questId);
  const state = progress.questResponses[questId] || {};
  const result = quest ? gradeQuest(questType, quest, state) : {};
  if (quest) recordSkillOutcomes(questType, quest, state, result);
  const complete = quest ? isQuestComplete(questType, result) : false;
  const answeredAny = questAnsweredAny(questType, state);
  const status = !answeredAny ? "unanswered" : complete ? "correct" : "in-progress";
  const feedback = complete
    ? `<p class="activity-feedback success" role="status" aria-live="polite">Investigation complete — this record is ready to open.</p>`
    : `<p class="activity-feedback${questPartialSuccess(questType, result) ? " success" : ""}" role="status" aria-live="polite">${questHint(questType, result)}</p>`;
  return `${chrome()}<main class="shell activity-shell quest-practice-shell investigation-shell"><section class="activity-copy"><button class="back-link" data-action="field">← Back to field</button><p class="kicker">${esc(source.type)} · Investigation Challenge</p><h1>Begin Investigation</h1><p>Predict this record's sourcing before you open its full worksheet.</p></section><section class="activity-board quest-practice-board">${quest ? `<div class="quest-practice-item" data-quest-status="${status}">${renderQuest(questType, quest, state)}${feedback}</div>` : '<p class="bank-empty">This record\'s Investigation Challenge is still being cataloged.</p>'}${complete ? `<button class="btn btn-gold" data-action="investigation-continue" data-source="${source.id}">Source Unlocked · Continue →</button>` : ""}</section></main>${authorPanel()}`;
}

// Fixed SVG coordinate space for the Navigation Table map — roughly matches
// .atlas-table's ~1.58:1 CSS aspect-ratio. Case markers/labels/route-thread are
// projected into this same space (as percentages) so they always line up with
// the coastline regardless of which unit's MAP_VIEWS bounds is active.
const NAV_TABLE_VIEWPORT = { width: 1000, height: 620 };

function xyToPercent(xy, viewport) {
  return { left: `${(xy.x / viewport.width) * 100}%`, top: `${(xy.y / viewport.height) * 100}%` };
}

// Two cases can legitimately share (near-)identical real-world coordinates —
// e.g. Common Cause and Founding Debate are both Philadelphia — which would
// otherwise stack their markers exactly on top of each other and make the
// bottom one unclickable. This nudges only such coincident markers apart in
// pixel space, purely for map legibility; it never touches mapPosition itself,
// so the underlying geography stays accurate.
//
// It also decides which side of its dot each marker's label hangs on. Since Phase 59 a marker is
// labelled with its mission's name ("The Atlantic Crossroads", not "Caribbean"), and those labels
// are wide enough that two markers far enough apart to be distinct dots — Caribbean and Hispaniola,
// ~75 units — can still have overlapping labels. Markers are walked left to right and each one takes
// the slot below its dot unless a label already sits there, in which case it goes above.
function declutterMarkerPositions(cases, bounds, viewport) {
  const CLUSTER_RADIUS = 30;
  const SPREAD_RADIUS = 20;
  // Roughly a label pill's own footprint in NAV_TABLE_VIEWPORT units.
  const LABEL_GAP_X = 140;
  const LABEL_GAP_Y = 80;
  const projected = cases.map((c) => ({
    id: c.id,
    ...projectPoint([c.mapPosition.lon, c.mapPosition.lat], bounds, viewport),
  }));
  const positions = new Map();
  const placed = new Set();
  for (const p of projected) {
    if (placed.has(p.id)) continue;
    const cluster = projected.filter(
      (q) => !placed.has(q.id) && Math.hypot(q.x - p.x, q.y - p.y) < CLUSTER_RADIUS
    );
    cluster.forEach((q) => placed.add(q.id));
    if (cluster.length === 1) {
      positions.set(p.id, { x: p.x, y: p.y });
      continue;
    }
    const cx = cluster.reduce((sum, q) => sum + q.x, 0) / cluster.length;
    const cy = cluster.reduce((sum, q) => sum + q.y, 0) / cluster.length;
    cluster.forEach((q, i) => {
      const angle = (i / cluster.length) * Math.PI * 2 - Math.PI / 2;
      positions.set(q.id, {
        x: cx + Math.cos(angle) * SPREAD_RADIUS,
        y: cy + Math.sin(angle) * SPREAD_RADIUS,
      });
    });
  }
  const below = [];
  [...positions.entries()]
    .sort(([, a], [, b]) => a.x - b.x)
    .forEach(([id, xy]) => {
      const taken = below.some(
        (q) => Math.abs(q.x - xy.x) < LABEL_GAP_X && Math.abs(q.y - xy.y) < LABEL_GAP_Y
      );
      positions.set(id, { ...xy, labelSide: taken ? "above" : "below" });
      if (!taken) below.push(xy);
    });
  return positions;
}

function atlasSvgMarkup(view, viewport, ariaLabel) {
  const landD = landPathD(landCoastlines.rings, view.bounds, viewport);
  return `<svg class="atlas-svg" viewBox="0 0 ${viewport.width} ${viewport.height}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(ariaLabel)}"><rect class="atlas-ocean" width="${viewport.width}" height="${viewport.height}" /><path class="atlas-land" d="${landD}" /></svg>`;
}

function caseMarker(c, xy, viewport) {
  const state = isComplete(c.id) ? "complete" : isUnlocked(c.id) ? "available" : "locked";
  const { left, top } = xyToPercent(xy, viewport);
  // Locked markers stay clickable (Phase 48B) — select-case has no unlock
  // gate, so clicking one reads its details/unlock reason in the route panel
  // instead of doing nothing. aria-disabled (not disabled) keeps that
  // reachable for assistive tech while still announcing the locked state.
  const label = state === "locked" ? `${resolvedCaseTitle(c)} — locked` : resolvedCaseTitle(c);
  // The marker's visible label is the mission's own name, not its shortTitle: the map already says
  // where you are (MAP_VIEWS labels the ocean and the sea), so a second geographic word here only
  // gave the mission a competing name — and shortTitle is not rename-aware, so a teacher who
  // renamed a mission saw the old word on the map.
  return `<button class="route-marker route-marker--${state} route-marker--label-${xy.labelSide === "above" ? "above" : "below"} ${progress.selectedCaseId === c.id ? "is-selected" : ""}" style="left:${left};top:${top}" data-action="select-case" data-case="${c.id}" ${state === "locked" ? 'aria-disabled="true"' : ""} aria-label="${esc(label)}"><span>${state === "complete" ? "✓" : "✦"}</span><b>${esc(resolvedCaseName(c))}</b></button>`;
}

// Quests a save may hold a completion for that no unit points at any more, and
// the current challenge each one counts as having satisfied.
//
// Phase 58 replaced Unit 1's and Unit 2's unit-level Archive Challenges with real
// SAQs (the Archive Room is the AP writing work now; the four teacher-swappable
// types belong to the Nav Table's missions). unitArchiveChallengesComplete()
// matches on questId, so without this a student who had finished the old ones
// mid-unit would open the app to a re-locked Archive Review and no explanation.
// Honouring the retired id is the right trade: they did the work that was in
// front of them, and re-locking a completed unit to make a content change tidy is
// the app breaking its promise, not the student's problem.
//
// A student who has *not* finished them simply does the new SAQ. Nothing here
// grants credit for work never done.
export const RETIRED_ARCHIVE_CHALLENGE_IDS = {
  "unit-01-archive-claim-and-evidence-builder": "unit-01-archive-atlantic-world-saq",
  "unit-02-archive-strongest-evidence-coerced-labor": "unit-02-archive-colonial-crossroads-saq",
  "unit-02-archive-strongest-evidence-mercantile-policy": "unit-02-archive-colonial-crossroads-saq",
  // Case 1.09's mission, re-typed from evidence-organizing to mcq and re-keyed
  // off the unit-level id it had borrowed since Phase 48D. Case-level
  // completions live in progress.completedCases, not here, so this entry only
  // matters if a save recorded the challenge without the case — which
  // archiveChallengeQuestCard() can do when a quest is completed outside its
  // case's own unlock path.
  "unit-03-archive-appeal-form-comparison": "case-009-mission-appeal-form-comparison",
  "case-005-archive-triangle-cargo": "case-005-mission-triangle-circuit-order",
};

/**
 * Has this challenge been completed, counting a retired predecessor as having
 * satisfied it? Exported for tests/unit/retired-archive-challenges.test.js.
 */
export function archiveChallengeSatisfied(questId, archiveChallenges) {
  if (archiveChallenges[questId]?.status === "complete") return true;
  return Object.entries(RETIRED_ARCHIVE_CHALLENGE_IDS).some(
    ([retiredId, replacementId]) =>
      replacementId === questId && archiveChallenges[retiredId]?.status === "complete"
  );
}

// Whether every unit-level Archive Challenge (unit.archiveChallenges[] — the
// unit's own written work, not tied to any one case) is complete. Case-level
// challenges (case.archiveChallenge, rendered by missionScreen()) already gate
// unit completion for free via isComplete(), since completing one writes to
// progress.completedCases the same as any other case.
const unitArchiveChallengesComplete = (unit) =>
  (unit.archiveChallenges || []).every((challenge) =>
    archiveChallengeSatisfied(challenge.questId, progress.archiveChallenges)
  );

const unitReadyForReview = (unit) =>
  unit.cases.every((c) => isComplete(c.id)) && unitArchiveChallengesComplete(unit);

function unitTabs(selectedUnit) {
  return `<div class="archive-legend archive-unit-tabs">${UNITS.map((unit) => {
    const unlockedInUnit = unit.cases.some((c) => isUnlocked(c.id));
    return `<button class="text-button unit-tab ${unit.id === selectedUnit.id ? "is-selected" : ""}" data-action="select-unit" data-unit="${unit.id}" ${unlockedInUnit ? "" : "disabled"}>${esc(unit.period)}${unlockedInUnit ? "" : " · Locked"}</button>`;
  }).join("")}</div>`;
}

function archiveScreen() {
  const selectedUnit = unitById(progress.selectedUnitId) || UNIT_01;
  const selected =
    (caseById(progress.selectedCaseId)?.id &&
    unitForCase(progress.selectedCaseId)?.id === selectedUnit.id
      ? caseById(progress.selectedCaseId)
      : null) || selectedUnit.cases[0];
  const availability = isComplete(selected.id)
    ? "Case archived"
    : isUnlocked(selected.id)
      ? "Teacher unlocked"
      : "Teacher locked";
  const routeHint =
    selected.route === "field"
      ? `${countEvidence(selected.id)}/${sourcesForCase(selected.id).length || 3} evidence records secured`
      : selected.question;
  // A non-map mission's call to action is the mission's own name. It used to be the mission's
  // `mechanic` ("Open Atlantic Route Puzzle") — better than the generic "Open Archive Challenge"
  // all six shared while they landed on one list, but it made the button a third name for a mission
  // whose heading right above it already said "Case 1.02 — The Exchange Ledger".
  const chronotravelLabel =
    selected.route === "field" ? "Initiate Chronotravel" : `Open ${resolvedCaseName(selected)}`;
  const lockedReasonMarkup = isUnlocked(selected.id)
    ? ""
    : `<p class="route-locked-reason">${esc(lockedReasonForCase(selected))}</p>`;
  const view = MAP_VIEWS[UNIT_MAP_VIEW[selectedUnit.id]] || MAP_VIEWS[DEFAULT_MAP_VIEW];
  const viewport = NAV_TABLE_VIEWPORT;
  const labelsMarkup = view.labels
    .map((l) => {
      const { x, y } = projectPoint([l.lon, l.lat], view.bounds, viewport);
      return `<div class="atlas-label" style="left:${(x / viewport.width) * 100}%;top:${(y / viewport.height) * 100}%">${esc(l.text)}</div>`;
    })
    .join("");
  // Every case shows by default as of Phase 48A (locked ones render greyed
  // out via caseMarker()'s own state check); Phase 48C adds a per-classroom
  // opt-out on top of that default via resolvedNavTableVisible().
  const visibleCases = selectedUnit.cases.filter((c) => resolvedNavTableVisible(c));
  const markerPositions = declutterMarkerPositions(visibleCases, view.bounds, viewport);
  const threadXY =
    markerPositions.get(selected.id) ||
    projectPoint([selected.mapPosition.lon, selected.mapPosition.lat], view.bounds, viewport);
  const { left: threadLeft, top: threadTop } = xyToPercent(threadXY, viewport);
  return `${chrome()}<main class="shell archive-layout"><section class="archive-copy"><button class="back-link" data-action="home">← Institute foyer</button><p class="kicker">The Archive</p><h1>Chronicle Navigation Table</h1><p>Teacher-unlocked cases appear as markers on the map. Select a marker to inspect its route; the full details stay in the route panel so the map itself remains readable.</p><p class="archive-central-question"><b>Guiding question:</b> ${esc(resolvedUnitCentralQuestion(selectedUnit))}</p>${unitTabs(selectedUnit)}<div class="archive-legend"><span class="legend-active">✦ Available</span><span class="legend-complete">✓ Archived</span><span class="legend-locked">○ Teacher locked</span></div></section><section class="atlas-table" aria-label="${esc(resolvedUnitTitle(selectedUnit))} navigation map">${atlasSvgMarkup(view, viewport, "Coastline map of the case's historical setting")}${labelsMarkup}${visibleCases.map((c) => caseMarker(c, markerPositions.get(c.id), viewport)).join("")}<div class="route-thread route-thread--active" style="left:${threadLeft};top:${threadTop}"></div></section><aside class="route-panel"><p class="kicker">${esc(availability)}</p><span class="case-date">${esc(selected.date)}</span><h2>${esc(resolvedCaseTitle(selected))}</h2><p>${esc(selected.summary)}</p><div class="route-meta"><span>${esc(selected.location)}</span><span>${isComplete(selected.id) ? "Archived" : "In progress"}</span></div><button class="btn btn-gold" data-action="travel" data-case="${selected.id}" ${!isUnlocked(selected.id) ? "disabled" : ""}>${esc(chronotravelLabel)} <span>→</span></button>${lockedReasonMarkup}<p class="route-hint">${esc(routeHint)}</p><button class="btn btn-outline" data-action="mini-games">Try a Mini-Game →</button>${unitReadyForReview(selectedUnit) ? `<button class="btn btn-outline" data-action="review">Begin ${esc(selectedUnit.period)} Archive Review →</button>` : ""}</aside></main>${authorPanel()}`;
}

// Mini-games (Storm Navigation, Cargo Sorting) are a pacing/reward break reached from the
// Institute Archive's Navigation Table, not tied to any case's unlock status or rubric
// grading — see apps/web/src/mini-games/*.js for the pure logic modules this screen wires in.
function renderMiniGameStage() {
  if (activeMiniGame === "storm-navigation" && stormNavigationState) {
    return renderStormNavigationGame(
      stormNavigationState,
      progress.miniGameScores.stormNavigationBest,
      STORM_NAVIGATION_SPRITES
    );
  }
  if (activeMiniGame === "cargo-sorting" && cargoSortingState) {
    const complete =
      cargoSortingState.running && isCargoSortingComplete(cargoSortingState)
        ? `<p class="mini-game-complete">All cargo sorted! Keep going or stop the clock whenever you like.</p>`
        : "";
    const restart = cargoSortingState.running
      ? ""
      : `<button type="button" class="btn btn-outline mini-game-restart-btn" data-cargo-restart>Sort Again ↻</button>`;
    return `${renderCargoSortingGame(cargoSortingState)}${complete}${restart}`;
  }
  return "";
}
function updateMiniGameUi() {
  const container = document.getElementById("miniGameContainer");
  if (container) container.innerHTML = renderMiniGameStage();
}
function startMiniGameLoop() {
  if (miniGameMoveFrame) return;
  miniGameLastTickAt = performance.now();
  miniGameMoveFrame = window.requestAnimationFrame(runMiniGameLoop);
}
function stopMiniGameLoop() {
  if (miniGameMoveFrame) window.cancelAnimationFrame(miniGameMoveFrame);
  miniGameMoveFrame = null;
  miniGameLastTickAt = 0;
}
function runMiniGameLoop(now) {
  if (progress.currentScreen !== "mini-games" || !activeMiniGame) {
    stormHeldKeys.clear();
    stopMiniGameLoop();
    return;
  }
  const elapsed = Math.min(48, Math.max(0, now - miniGameLastTickAt || 16));
  miniGameLastTickAt = now;
  let redraw = false;
  if (activeMiniGame === "storm-navigation" && stormNavigationState?.running) {
    stormNavigationState = steerStormShip(stormNavigationState, stormHeldVector(), elapsed);
    stormNavigationState = tickStormNavigationGame(stormNavigationState, elapsed);
    if (!stormNavigationState.running) {
      if (stormNavigationState.hazardsDodged > progress.miniGameScores.stormNavigationBest) {
        progress.miniGameScores.stormNavigationBest = stormNavigationState.hazardsDodged;
        save();
      }
    }
    redraw = true;
  }
  if (activeMiniGame === "cargo-sorting" && cargoSortingState?.running) {
    // Cargo Sorting's own UI only shows a whole-second countdown, but its cards/holds are
    // drag targets — redrawing every animation frame (like Storm Navigation's moving hazards
    // need) would destroy and recreate those DOM nodes ~30-60x/sec, aborting any drag gesture
    // that takes longer than one frame. Only redraw when the displayed second actually changes
    // (or the run ends), which is both correct for a text countdown and leaves a stable window
    // for a real drag to complete.
    const prevSeconds = Math.ceil(cargoSortingState.remainingMs / 1000);
    cargoSortingState = tickCargoSortingGame(cargoSortingState, elapsed);
    const nextSeconds = Math.ceil(cargoSortingState.remainingMs / 1000);
    if (nextSeconds !== prevSeconds || !cargoSortingState.running) redraw = true;
  }
  if (redraw) updateMiniGameUi();
  miniGameMoveFrame = window.requestAnimationFrame(runMiniGameLoop);
}
function miniGamesScreen() {
  const best = progress.miniGameScores.stormNavigationBest;
  let body;
  if (activeMiniGame) {
    if (activeMiniGame === "storm-navigation" && !stormNavigationState) {
      stormNavigationState = createStormNavigationGame();
    }
    if (activeMiniGame === "cargo-sorting" && !cargoSortingState) {
      cargoSortingState = createCargoSortingGame();
    }
    body = `<div class="mini-game-stage" id="miniGameContainer">${renderMiniGameStage()}</div><button class="text-button" data-action="mini-game-back">← Choose a different mini-game</button>`;
  } else {
    body = `<div class="mini-game-select"><article class="mini-game-card" data-action="mini-game-open" data-mini-game="storm-navigation"><h3>⛵ Storm Navigation</h3><p>Steer the ship and dodge storm hazards for as long as you can. Endless — see how high a score you can post.</p><span class="mini-game-best">Best: ${best} dodged</span></article><article class="mini-game-card" data-action="mini-game-open" data-mini-game="cargo-sorting"><h3>📦 Cargo Sorting</h3><p>Sort Caribbean trade goods into the correct ship hold before the 90-second timer runs out.</p></article></div>`;
  }
  return `${chrome()}<main class="shell mini-games-shell"><section class="mini-games-copy"><button class="back-link" data-action="archive">← Navigation Table</button><p class="kicker">Institute Archive · Pacing break</p><h1>Mini-Games</h1><p>A short arcade break between cases — not scored, not required for any badge.</p></section>${body}</main>${authorPanel()}`;
}

function travelScreen() {
  const active = caseById(progress.activeCaseId);
  return `${chrome()}<main class="chronotravel-screen chronotravel-screen--warp"><section class="return-warp-vortex chronotravel-vortex" aria-label="Chronotraveling to ${esc(resolvedCaseName(active))}"><div class="return-warp-tunnel chronotravel-tunnel"><i></i><i></i><i></i><i></i><span>✦</span><b>${esc(resolvedCaseName(active))}<small>${esc(active.date)}</small></b></div></section><section class="travel-copy"><p class="kicker">Chronotravel sequence</p><h1>Route in motion.</h1><p>The Archive is following the selected point through the recall tunnel. The signal will resolve into its historical setting; the Codex will remain synchronized with this case.</p><div class="travel-progress"><span></span></div><p class="travel-status">Do not alter the moment. Follow the evidence.</p><button class="btn btn-outline" data-action="skip-travel">Skip transition</button></section></main>`;
}

function fieldWorldStyle() {
  const grid = activeFieldGrid();
  return `width:${grid.columns * grid.tile}px;height:${grid.rows * grid.tile}px;transform:translate(${fieldCamera.x}px, ${fieldCamera.y}px)`;
}

function fieldPositionStyle() {
  const grid = activeFieldGrid();
  return `left:${(fieldMovement.x * grid.tile).toFixed(1)}px;top:${(fieldMovement.y * grid.tile).toFixed(1)}px;`;
}
export { ellipse, rectsOverlap, footBoxFor };
// Five overlapping ellipses, not four: the extra lobes give the island an irregular coastline
// (northwest cove, north village lobe, southeast point, south spit) instead of the smooth oval
// the old mask degenerated into once the main ellipse grew large enough to swallow the others.
// scripts/generate-caribbean-tmj.js duplicates this function verbatim to paint the coastline —
// do NOT deduplicate them; the duplication is what makes a drift between the painted shore and
// the collidable shore a visible code-review diff.
export function isCaribbeanLand(x, y) {
  const mainBeach = ellipse(x, y, 28.0, 19.5, 17.0, 10.0);
  const westCove = ellipse(x, y, 12.5, 17.0, 8.0, 6.6);
  const eastPoint = ellipse(x, y, 45.0, 21.5, 8.6, 7.4);
  const northVillage = ellipse(x, y, 31.5, 10.0, 10.0, 6.2);
  const southSpit = ellipse(x, y, 22.0, 29.0, 7.0, 4.4);
  return mainBeach || westCove || eastPoint || northVillage || southSpit;
}
// `map` is a parameter rather than a call to activeFieldMap() because the nav grid for a map is
// built before the player travels to it — the router asks "is this cell standable on unit-02?"
// while unit-01 is still the active map.
function isNpcStandingOnLand(x, y, map = activeFieldMap()) {
  const foot = { x1: x - 0.3, x2: x + 0.3, y1: y + 0.36, y2: y + 0.86 };
  const checks = [
    [foot.x1, foot.y1],
    [foot.x2, foot.y1],
    [foot.x1, foot.y2],
    [foot.x2, foot.y2],
    [(foot.x1 + foot.x2) / 2, foot.y2],
  ];
  return checks.every(([px, py]) => map.isLand(px, py));
}
function npcFootBox(npc) {
  const state = fieldNpcState(npc);
  return { x1: state.x - 0.42, x2: state.x + 0.42, y1: state.y + 0.2, y2: state.y + 0.92 };
}
function isFieldBlocked(x, y) {
  const grid = activeFieldGrid();
  if (x < 1.2 || y < 0.9 || x > grid.columns - 1.2 || y > grid.rows - 1.0) return true;
  const foot = footBoxFor(x, y);
  const landChecks = [
    [foot.x1, foot.y1],
    [foot.x2, foot.y1],
    [foot.x1, foot.y2],
    [foot.x2, foot.y2],
    [(foot.x1 + foot.x2) / 2, foot.y2],
  ];
  const map = activeFieldMap();
  if (!landChecks.every(([px, py]) => map.isLand(px, py))) return true;
  if (map.blocks.some((block) => rectsOverlap(foot, block))) return true;
  return map.npcs.some((npc) => rectsOverlap(foot, npcFootBox(npc)));
}
function updateFieldPlayer() {
  const player = document.getElementById("caseFieldPlayer");
  const sprite = document.getElementById("caseFieldPlayerSprite");
  const world = document.getElementById("caribbeanWorld");
  if (!player || !sprite) return;
  player.style.cssText = fieldPositionStyle();
  player.dataset.facing = fieldMovement.facing;
  applyCharacterSprite(
    sprite,
    chroniclerKey(),
    fieldMovement.facing,
    fieldMovement.moving,
    FIELD_SPEED
  );
  if (world) {
    const viewport = world.parentElement.getBoundingClientRect();
    const grid = activeFieldGrid();
    const worldWidth = grid.columns * grid.tile;
    const worldHeight = grid.rows * grid.tile;
    const px = fieldMovement.x * grid.tile;
    const py = fieldMovement.y * grid.tile;
    // A surface smaller than the frame is centred in it rather than pinned to the top-left, which
    // is what the follow-and-clamp below degenerates to once the world stops being bigger than the
    // viewport. Interiors are small enough to hit this on both axes; the outdoor maps never do.
    // Still a pure function of player position — for a small room it is simply a constant one.
    const camX =
      worldWidth <= viewport.width
        ? Math.round((viewport.width - worldWidth) / 2)
        : Math.round(Math.max(viewport.width - worldWidth, Math.min(0, viewport.width / 2 - px)));
    const camY =
      worldHeight <= viewport.height
        ? Math.round((viewport.height - worldHeight) / 2)
        : Math.round(
            Math.max(viewport.height - worldHeight, Math.min(0, viewport.height / 2 - py))
          );
    fieldCamera = { x: camX, y: camY };
    world.style.transform = `translate(${camX}px, ${camY}px)`;
  }
  updateFieldProximityUi();
}
function updateFieldProximityUi() {
  const map = activeFieldMap();
  map.npcs.forEach((npc) => {
    const node = document.querySelector(`[data-npc="${npc.id}"]`);
    if (node) node.classList.toggle("is-near", isNearFieldNpc(npc));
  });
  sourcesForCase(activeFieldCaseId()).forEach((source) => {
    // Keyed by `data-source`, not the old `signal-N` positional class — a class that existed only to
    // be queried, and that silently pointed at the wrong marker whenever a source was skipped.
    const node = document.querySelector(`.source-signal--world[data-source="${source.id}"]`);
    if (!node) return;
    node.classList.toggle("is-near", isNearFieldSource(source.id));
    // An object-anchored marker never moves, but nothing stops a future point from anchoring to
    // something that does, and re-writing an unchanged style is free.
    node.style.cssText = sourcePointStyle(source.id);
  });
  // Doorsteps get the same proximity treatment as people and records — the label stays hidden until
  // the player is within the reach that would actually let them walk through.
  if (isInsideFieldInterior()) {
    const room = activeFieldMap();
    const exit = document.querySelector(".field-door--exit");
    if (exit) exit.classList.toggle("is-near", fieldDistanceTo(room.exit.x, room.exit.y) <= 1.45);
    return;
  }
  fieldInteriors().forEach((room) => {
    const node = document.querySelector(`.field-door[data-interior="${room.id}"]`);
    if (node) node.classList.toggle("is-near", fieldDistanceTo(room.door.x, room.door.y) <= 1.45);
  });
}
function fieldHeldVector() {
  let dx = 0;
  let dy = 0;
  fieldHeldKeys.forEach((key) => {
    const move = FIELD_MOVE_KEYS[key];
    if (!move) return;
    dx += move[0];
    dy += move[1];
  });
  if (dx && dy) {
    const scale = Math.SQRT1_2;
    dx *= scale;
    dy *= scale;
  }
  return [dx, dy];
}
function startFieldMovementLoop() {
  if (fieldMoveFrame) return;
  lastFieldMoveAt = performance.now();
  fieldMoveFrame = window.requestAnimationFrame(runFieldMovementLoop);
}
function stopFieldMovementLoop() {
  if (fieldMoveFrame) window.cancelAnimationFrame(fieldMoveFrame);
  fieldMoveFrame = null;
  lastFieldMoveAt = 0;
}
function runFieldMovementLoop(now) {
  if (progress.currentScreen !== "field") {
    fieldHeldKeys.clear();
    fieldMovement.moving = false;
    stopFieldMovementLoop();
    return;
  }
  const [dx, dy] = fieldHeldVector();
  if (!dx && !dy) {
    fieldMovement.moving = false;
    updateFieldPlayer();
    stopFieldMovementLoop();
    return;
  }
  const elapsed = Math.min(48, Math.max(0, now - lastFieldMoveAt || 16));
  lastFieldMoveAt = now;
  const distance = FIELD_SPEED * (elapsed / 1000);
  fieldMovement.facing =
    Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
  const nextX = Number((fieldMovement.x + dx * distance).toFixed(3));
  const nextY = Number((fieldMovement.y + dy * distance).toFixed(3));
  let moved = false;
  if (!isFieldBlocked(nextX, nextY)) {
    fieldMovement.x = nextX;
    fieldMovement.y = nextY;
    moved = true;
  } else {
    const slideX = Number((fieldMovement.x + dx * distance).toFixed(3));
    const slideY = Number((fieldMovement.y + dy * distance).toFixed(3));
    if (dx && !isFieldBlocked(slideX, fieldMovement.y)) {
      fieldMovement.x = slideX;
      moved = true;
    }
    if (dy && !isFieldBlocked(fieldMovement.x, slideY)) {
      fieldMovement.y = slideY;
      moved = true;
    }
  }
  if (moved && progress.activeFieldNpc) progress.activeFieldNpc = null;
  fieldMovement.moving = moved;
  if (moved) fieldMovement.step = !fieldMovement.step;
  updateFieldPlayer();
  fieldMoveFrame = window.requestAnimationFrame(runFieldMovementLoop);
}
// Every unit's activities in one flat lookup keyed by source id, the same shape as the quest
// lookups above. A source with no entry here falls through to sourceReader() exactly as the 18
// remaining sources in Units 3-5 still do.
const ACTIVITIES_BY_SOURCE = { ...UNIT_01_ACTIVITIES, ...UNIT_02_ACTIVITIES };

function activityFor(sourceId) {
  return ACTIVITIES_BY_SOURCE[sourceId] || null;
}

// Assets an activity's content refers to by opaque key. The engines never name a path: Vite needs
// `new URL(..., import.meta.url)` at the call site, and engine/activities/ has to stay liftable
// into another subject's pack.
const ACTIVITY_IMAGES = { "waldseemuller-1507": waldseemuller };

function ensureSourceActivity(sourceId) {
  progress.sourceActivities ??= {};
  // `briefed`: whether the Mission Instructions screen has been cleared for this record. Absent on
  // any save written before Phase 71, which reads as falsy and shows the screen once — the intended
  // migration, since it is new UI nobody has seen.
  // `debriefed` is the twin of `briefed` at the other end of the mission, and absent on any save
  // written before Phase 74 for the same reason and with the same result: it reads falsy, so the
  // screen shows once.
  const entry = (progress.sourceActivities[sourceId] ??= {
    state: null,
    completed: false,
    briefed: false,
    debriefed: false,
  });
  const activity = activityFor(sourceId);
  // Also the migration path off the three retired screens: their saves carry
  // {observed, choice, placed} and no `state`, so an activity in flight restarts here. Secured
  // evidence lives in progress.caseEvidence and is not touched by any of this.
  if (activity && (!entry.state || typeof entry.state !== "object")) {
    entry.state = defaultActivityState(activity.kind);
  }
  return entry;
}

// The tokens a DISCREPANCY observation's `requires` is matched against: every question this player
// actually put to somebody, in any interview they have run. This is the whole cause-and-effect
// mechanism — two students audit the same letter holding different evidence because they asked
// different people, without one atom of the record changing.
function interviewTokens() {
  const tokens = [];
  Object.entries(progress.sourceActivities || {}).forEach(([sourceId, entry]) => {
    if (activityFor(sourceId)?.kind !== "interview") return;
    // `logged`, not `asked`: an answer the player heard and walked away from is not
    // something they are carrying. The log button in the dialogue bubble is the whole
    // point of the distinction, and this is the one place it pays out.
    Object.entries(entry?.state?.logged || {}).forEach(([speakerId, questions]) => {
      (Array.isArray(questions) ? questions : []).forEach((questionId) => {
        tokens.push(`asked:${speakerId}:${questionId}`);
      });
    });
  });
  return tokens;
}

// What each engine needs from the running game that it cannot know itself. Kept as plain data so
// render() stays a pure function of (content, state, data).
function activityContext(activity) {
  if (activity.kind === "assembly") return { images: ACTIVITY_IMAGES };
  if (activity.kind === "discrepancy") return { holds: interviewTokens() };
  return {};
}

function sourceActivityRoute(sourceId) {
  const route = sourceById(sourceId)?.activityRoute;
  // An activityRoute naming an engine we hold no content for degrades to the reader rather than to
  // an empty activity screen. validate-content.js checks the two agree for shipped content, so
  // this only catches a swapped-in source that brought a route but no activity with it.
  if (route && isActivityEngine(route) && !activityFor(sourceId)) return "source";
  return route || "source";
}
// Investigation Challenge gate: a source with investigationMode set must have its
// gating quest graded complete before sourceEntryScreen() will route into sourceReader().
function sourceInvestigationComplete(source) {
  if (!source?.investigationMode) return true;
  const quest = investigationQuestFor(source.investigationMode, source.investigationQuestId);
  if (!quest) return true;
  const state = progress.questResponses[source.investigationQuestId] || {};
  return isQuestComplete(
    source.investigationMode,
    gradeQuest(source.investigationMode, quest, state)
  );
}
// Shared destination-screen resolver for a not-yet-secured source, used by both the
// click ("start-source-activity") and keyboard (field "E" interact) entry points so
// they can't drift out of sync on Investigation Challenge gating.
function sourceEntryScreen(sourceId) {
  const source = sourceById(sourceId);
  if (source?.investigationMode && !sourceInvestigationComplete(source)) return "investigation";
  return sourceActivityRoute(sourceId);
}
// ---- source anchors -----------------------------------------------------------------------------
// A source point says where a record is, and — as of Phase 56 — *what it is attached to*. Before
// that, every record was a floating card on the ground: a 42px box captioned "Source" sitting in the
// middle of a plaza, with nothing in the world under it. Now a point declares one of two anchors:
//
//   { npc: "<npc id>" }         the record is held by a person you go and talk to. Its marker rides
//                               on that NPC every frame, so it follows them around their patrol, and
//                               there is no separate world button at all.
//   { object: "<name>" }        the record sits on a real stamped prop — a notice board, a
//                               cartographer's table, a petition table. Keeps explicit x/y, which
//                               the map generator places that prop at.
//
// A point with no anchor still works and still renders a world marker; nothing forces the migration.

/** The NPC carrying this source on the active map, or null. */
function sourceAnchorNpc(sourceId) {
  const anchorId = activeFieldMap().sourcePoints[sourceId]?.anchor?.npc;
  if (!anchorId) return null;
  return activeFieldMap().npcs.find((npc) => npc.id === anchorId) || null;
}
/** The source this NPC is carrying for the active case, or null. Inverse of sourceAnchorNpc(). */
function npcAnchoredSource(npcId) {
  const points = activeFieldMap().sourcePoints;
  return (
    sourcesForCase(activeFieldCaseId()).find(
      (source) => points[source.id]?.anchor?.npc === npcId
    ) || null
  );
}
/**
 * Where a source is, right now, in field grid units.
 *
 * For an NPC anchor this is read from the live patrol state rather than from the content file, which
 * is the whole reason the anchor is an id and not a copied coordinate: the marker has to move with
 * the person.
 */
function sourcePointPosition(sourceId) {
  const point = activeFieldMap().sourcePoints[sourceId];
  const npc = sourceAnchorNpc(sourceId);
  if (npc) {
    const state = fieldNpcState(npc);
    return { x: state.x, y: state.y };
  }
  return { x: point?.x ?? 10, y: point?.y ?? 10 };
}
function sourcePointStyle(sourceId) {
  const { x, y } = sourcePointPosition(sourceId);
  return `left:${(x * activeFieldGrid().tile).toFixed(1)}px;top:${(y * activeFieldGrid().tile).toFixed(1)}px`;
}

function fieldDistanceTo(x, y) {
  return Math.hypot(fieldMovement.x - x, fieldMovement.y - y);
}
function isNearFieldNpc(npc) {
  const state = fieldNpcState(npc);
  return fieldDistanceTo(state.x, state.y) <= 1.45;
}
function isNearFieldSource(sourceId) {
  if (!activeFieldMap().sourcePoints[sourceId]) return false;
  const { x, y } = sourcePointPosition(sourceId);
  // An NPC-anchored record uses the NPC's own reach, so "close enough to read the record" and "close
  // enough to talk to the person holding it" can never disagree by a fraction of a tile.
  const reach = sourceAnchorNpc(sourceId) ? 1.45 : 1.55;
  return fieldDistanceTo(x, y) <= reach;
}
function nearestFieldInteraction() {
  const map = activeFieldMap();
  const npcs = map.npcs
    .map((npc) => {
      const state = fieldNpcState(npc);
      return {
        type: "npc",
        id: npc.id,
        label: npc.name,
        distance: fieldDistanceTo(state.x, state.y),
      };
    })
    .filter((item) => item.distance <= 1.45);
  const sources = sourcesForCase(activeFieldCaseId())
    .map((source) => {
      const point = map.sourcePoints[source.id];
      // An NPC-anchored source is reached by talking to its NPC, which is already in the list above.
      // Leaving it here too would make the prompt flicker between the person and the record they are
      // holding as the patrol moves and the two distances trade places.
      if (!point || point.anchor?.npc) return null;
      const { x, y } = sourcePointPosition(source.id);
      return { type: "source", id: source.id, label: point.label, distance: fieldDistanceTo(x, y) };
    })
    .filter(Boolean)
    .filter((item) => item.distance <= 1.55);
  // Doors are a third kind of interaction, sorted into the same nearest-wins list at the same reach
  // as a person — so standing between a doorstep and the NPC beside it gives you whichever you are
  // actually closer to, rather than the door always winning because it was checked first.
  const doors = isInsideFieldInterior()
    ? [
        {
          type: "exit",
          id: map.id,
          label: "the way out",
          distance: fieldDistanceTo(map.exit.x, map.exit.y),
        },
      ]
    : fieldInteriors().map((room) => ({
        type: "door",
        id: room.id,
        label: room.door.label,
        distance: fieldDistanceTo(room.door.x, room.door.y),
      }));
  return (
    [...npcs, ...sources, ...doors.filter((item) => item.distance <= 1.45)].sort(
      (a, b) => a.distance - b.distance
    )[0] || null
  );
}
/**
 * Step into one of the active map's interiors, remembering where to put the player back.
 *
 * The return position is captured here rather than derived from the door on the way out, so a
 * player who walks in from the north is put back on the north side of the doorstep.
 */
function enterFieldInterior(interiorId) {
  const room = activeFieldOutdoorMap().interiors?.[interiorId];
  if (!room) return;
  progress.fieldReturn = { x: fieldMovement.x, y: fieldMovement.y, facing: fieldMovement.facing };
  progress.currentFieldRoom = interiorId;
  progress.activeFieldNpc = null;
  progress.fieldNotice = "";
  fieldMovement.x = room.entry.x;
  fieldMovement.y = room.entry.y;
  fieldMovement.facing = room.entry.facing || "up";
  fieldMovement.moving = false;
  fieldHeldKeys.clear();
  playSfx("dialogue");
  save();
  render();
}
function exitFieldInterior() {
  const room = activeFieldMap();
  const back = progress.fieldReturn;
  progress.currentFieldRoom = null;
  progress.fieldReturn = null;
  progress.activeFieldNpc = null;
  progress.fieldNotice = "";
  // Falling back to the doorstep covers a save written before this room existed, or a hand-edited
  // one — never leave the player at whatever coordinate the interior happened to end on, which on
  // a 56x36 outdoor map could be inside a wall or out at sea.
  fieldMovement.x = back?.x ?? room.door?.x ?? activeFieldOutdoorMap().spawn.x;
  fieldMovement.y = back?.y ?? room.door?.y ?? activeFieldOutdoorMap().spawn.y;
  fieldMovement.facing = back?.facing || "down";
  fieldMovement.moving = false;
  fieldHeldKeys.clear();
  save();
  render();
}
function fieldTooFarNotice(label) {
  progress.fieldNotice = `Move closer to interact with ${label}.`;
  // Deliberately leaves the dialogue open. This used to null `activeFieldNpc`, so being a tenth of
  // a tile short both told the player to move closer *and* shut the bubble that was offering the
  // record — the instruction and the thing it referred to disappeared in the same frame. Taking one
  // step then meant re-opening the conversation, which is why a near-miss read as a dead button.
  save();
  const notice = document.getElementById("fieldNotice");
  // This path patches the DOM instead of re-rendering, so it has to reveal the line itself — the
  // notice ships hidden now that it has no standing text to show.
  if (notice) {
    notice.textContent = progress.fieldNotice;
    notice.hidden = false;
  }
}
/**
 * Whether a record can be pursued yet: `"secured"`, `"available"`, or `"locked"`.
 *
 * The rule used to live inline inside `fieldSourceSignal()` as an early `return ""`, so it was the
 * marker's private business — and Phase 56's objective tracker would have had to re-derive it and
 * could then disagree with the world about what is locked. One function, two readers.
 *
 * Since Phase 70 the gate is **content, not a case-id literal**. A source may declare
 * `requiresSourceId`, naming a record of its own case that must be secured first; until then it is
 * locked. Case 1.01's two later records carry it (nothing but the village is reachable until the
 * village has been observed) and so does Riverbend's Frethorne letter, whose DISCREPANCY builds its
 * evidence column out of the charter interview's logged answers and opens empty without it.
 *
 * This replaced a literal `caseId === "case-001"` branch. Adding a second hard-coded case id here
 * was the alternative, and it is one of the engine/content-boundary violations CLAUDE.md names —
 * so the second consumer paid to make it data instead. See decision log 0053.
 *
 * Exported for tests/unit, per CLAUDE.md's export-in-place rule.
 */
export function sourceAvailability(caseId, sourceId, evidence = hasEvidence) {
  if (evidence(caseId, sourceId)) return "secured";
  const requires = sourceById(sourceId)?.requiresSourceId;
  // A record naming itself would lock its own key and strand the case, which is the one failure
  // mode this shape has that the old literal did not.
  if (requires && requires !== sourceId) {
    return evidence(caseId, requires) ? "available" : "locked";
  }
  return "available";
}
function fieldSourceSignal(source) {
  const caseId = activeFieldCaseId();
  const availability = sourceAvailability(caseId, source.id);
  if (availability === "locked") return "";
  // A record that is not on this surface draws nothing here. Since Phase 66 a case's records can be
  // spread across an outdoor map and its interiors — Unit 4 keeps three in the town and one behind
  // each of two doors — and `sources` is the whole case's list on every surface, because the
  // objective tracker is a unit checklist rather than a per-room one. Without this guard,
  // sourcePointPosition()'s `?? 10` fallback stacked every off-surface record as a live ✦ marker at
  // tile (10,10) of whatever room the player was standing in: three phantom markers in the middle of
  // each interior, and two more out in the workshop district of the town.
  //
  // nearestFieldInteraction() has always had the equivalent guard, so `E` never offered one of
  // these — which is exactly why it took a screenshot to notice.
  const point = activeFieldMap().sourcePoints[source.id];
  if (!point) return "";
  // An NPC-anchored record has no world marker of its own: the star rides on the NPC's own button
  // (see fieldNpcButton), so the record and the person holding it are one thing to walk up to.
  if (sourceAnchorNpc(source.id)) return "";
  const secured = availability === "secured";
  const action = secured ? "open-source" : "start-source-activity";
  const near = isNearFieldSource(source.id);
  // One glyph, and the label only when the player is close. This was a 42px captioned card that
  // always read "Source" under a large box — legible, but it put a UI element on the grass instead of
  // marking a thing in the world. `data-source` is the proximity-update handle; the old `signal-N`
  // class existed only to be queried and is gone.
  return `<button class="source-signal source-signal--world ${secured ? "is-secured" : ""} ${near ? "is-near" : ""}" style="${sourcePointStyle(source.id)}" data-action="${action}" data-source="${source.id}" data-origin="field" aria-label="${secured ? "Reopen" : "Examine"} ${esc(point.label)}"><i>${secured ? "✓" : "✦"}</i><small>${esc(point.label)}</small></button>`;
}
/**
 * One row per record: what it is, where it is, and which of the three states it is in.
 *
 * Exported for tests/unit. Kept separate from the markup so the ordering and the state derivation can
 * be asserted without a DOM — and so the tracker and the world markers read the same
 * `sourceAvailability()` rather than each deciding what "locked" means.
 */
export function fieldObjectives(caseId, sources, points, npcNameFor, evidence = hasEvidence) {
  return sources.map((source) => {
    const point = points[source.id] || {};
    const availability = sourceAvailability(caseId, source.id, evidence);
    // What the player should go and look for. A record on a person is named by the person, because
    // that is the thing they can actually spot across the map; a record on an object is named by the
    // object. Neither is the source's own long historical title, which is what the Codex is for.
    const where = point.anchor?.npc
      ? npcNameFor(point.anchor.npc) || point.label
      : point.anchor?.object || point.label || source.title;
    return { id: source.id, label: point.label || source.title, where, availability };
  });
}
function fieldObjectiveTracker() {
  const caseId = activeFieldCaseId();
  // Every surface of this unit's map, not the one the player happens to be standing on. The
  // checklist is deliberately the same six rows wherever you are — it is what tells a player there
  // is anything behind a door at all — so it has to be able to name a person who is in another
  // room. Read off the active surface alone, `points[source.id]` came back empty for every record
  // that lives elsewhere and `where` fell all the way through to `source.title`, which is the one
  // outcome fieldObjectives()'s own comment rules out: standing in the Chimborazo ward, a player
  // was told to go and find "Ward Register, Chimborazo Hospital" rather than Jane Ferris, who was
  // four tiles away. Unit 4 shipped with the same defect across two surfaces; Richmond has three.
  const points = Object.assign({}, ...fieldSurfaces().map((surface) => surface.sourcePoints || {}));
  const rows = fieldObjectives(caseId, sourcesForCase(caseId), points, fieldNpcName);
  if (rows.length === 0) return "";
  const secured = rows.filter((row) => row.availability === "secured").length;
  const collapsed = progress.settings?.trackerCollapsed === true;
  const glyph = { secured: "✓", available: "✦", locked: "·" };
  const tracked = trackedFieldActivity();
  const items = rows
    .map((row) => {
      // A record you have not opened names the person carrying it, because that is what you can spot
      // across the map. The one you have open names the mission instead: you already know where it
      // came from, and what you want back from the panel now is what you are holding. This is why
      // there is no longer a second block underneath repeating the same name as a heading.
      const inFlight = tracked?.source.id === row.id;
      const where =
        row.availability === "locked"
          ? "Not yet available"
          : inFlight
            ? tracked.activity.title
            : row.where;
      // The glyph carries the state visually and is hidden from assistive tech, so the state goes in
      // the row's own accessible name instead — a screen reader announcing "✓" tells nobody anything.
      return `<li class="field-tracker__row is-${row.availability}${inFlight ? " is-tracked" : ""}" aria-label="${esc(row.availability)} — ${esc(where)}"><i aria-hidden="true">${glyph[row.availability]}</i><span>${esc(where)}</span></li>`;
    })
    .join("");
  // Absolutely positioned inside `.field-viewport` but OUTSIDE `.caribbean-world`, which is the
  // element updateFieldPlayer() translates. Anything inside that div scrolls with the camera; this has
  // to stay pinned to the frame. It also must never focus or scroll anything — see CLAUDE.md's camera
  // invariant, which several past regressions came from violating.
  return `<aside class="field-tracker ${collapsed ? "is-collapsed" : ""}" aria-label="Mission tracker"><button class="field-tracker__toggle" data-action="field-tracker-toggle" aria-expanded="${!collapsed}"><i aria-hidden="true">${collapsed ? "▸" : "▾"}</i><b>Mission Tracker</b><em>${secured}/${rows.length}</em></button><div class="field-tracker__body"><p class="field-tracker__key">✦ go here · ✓ secured · · locked</p><ul>${items}</ul>${fieldTrackerMissionBlock(tracked)}</div></aside>`;
}

/**
 * How far along the mission in flight is, and the way back into it.
 *
 * This exists because the first playtest of the INTERVIEW had a player walking back across
 * the island to the elder repeatedly, purely to re-read which questions they had already
 * put to people — the notebook was only reachable through the record that opened it. The
 * button is a plain screen change; it must not focus or scroll anything, for the same
 * reason the panel around it is positioned the way it is.
 *
 * It used to open with the mission's name as a heading, which the record list above was already
 * printing on the in-flight row — the same name twice in a 232px panel. The row keeps it.
 */
function fieldTrackerMissionBlock(tracked) {
  if (!tracked) return "";
  const { source, activity, state, complete: done } = tracked;
  const summary = activitySummary(activity.kind, activity, state);
  const line = done
    ? `<p class="field-tracker__progress is-done">✓ Filed — your Field Notebook is still here</p>`
    : summary
      ? `<p class="field-tracker__progress"><span>${esc(summary.label)}</span><b>${summary.done}/${summary.total}</b></p>`
      : "";
  // A bar only where there is something to fill. TRACE declares no summary() — a chain is not a
  // count — so it gets its row and its button and nothing in between, which is the honest answer
  // rather than a gap to fill.
  const bar = summary ? fieldTrackerBar(done ? summary.total : summary.done, summary.total) : "";
  return `<div class="field-tracker__mission">${line}${bar}<button class="field-tracker__open" data-action="open-activity-notebook" data-source="${esc(source.id)}">Open the Field Notebook →</button></div>`;
}

/**
 * The mission's progress, as a bar.
 *
 * CSS rather than a generated asset: this sits in a 232px panel that narrows to 200px under
 * 1400px, so a bitmap bar would have to be sliced or accept blurring, and the tracker is UI chrome
 * in the blue/gold material rather than part of the pixel-art world.
 */
function fieldTrackerBar(done, total) {
  const filled = total > 0 ? Math.max(0, Math.min(100, Math.round((done / total) * 100))) : 0;
  return `<div class="field-tracker__bar" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${total}"><i style="width:${filled}%"></i></div>`;
}
function fieldNpcButton(npc) {
  const active = progress.activeFieldNpc === npc.id;
  const near = isNearFieldNpc(npc);
  const state = fieldNpcState(npc);
  const walking = state.walking;
  // The record badge: the same ✦/✓ the world markers use, hovering over the head of whoever is
  // carrying a record. This is the "go and find Patrick Henry" signal — you can see across the map
  // which people you still need to talk to.
  const carried = npcAnchoredSource(npc.id);
  const availability = carried ? sourceAvailability(activeFieldCaseId(), carried.id) : null;
  const badge =
    availability && availability !== "locked"
      ? `<em class="npc-source-badge ${availability === "secured" ? "is-secured" : ""}" aria-hidden="true">${availability === "secured" ? "✓" : "✦"}</em>`
      : "";
  const label = carried ? `${npc.name} — carries a record` : `Talk with ${npc.name}`;
  return `<button class="field-npc field-npc--${esc(npc.group)} field-npc--${esc(npc.id)} ${active ? "is-talking" : ""} ${near ? "is-near" : ""} ${walking ? "is-walking-npc" : ""} ${carried ? "has-record" : ""}" data-facing="${esc(state.facing || "down")}" style="left:${(state.x * activeFieldGrid().tile).toFixed(1)}px;top:${(state.y * activeFieldGrid().tile).toFixed(1)}px" data-action="field-talk" data-npc="${esc(npc.id)}" aria-label="${esc(label)}"><span class="cast-shadow"></span>${characterSpriteMarkup(npc.sprite, state.facing || "down", { walking, speed: state.speed })}<span>${esc(npc.label)}</span>${badge}</button>`;
}
function fieldDialogueBubble() {
  const npc = activeFieldMap().npcs.find((item) => item.id === progress.activeFieldNpc);
  if (!npc) return "";
  const state = fieldNpcState(npc);
  const grid = activeFieldGrid();
  const x = state.x * grid.tile;
  const interview = fieldInterviewPanel(npc.id);
  // The ambient line is what tells you a person is worth asking, so it stays — until they have
  // actually answered something, at which point it has done its job and the answer takes its place.
  // Keeping both stacked a name, three lines of ambient text, an answer and four question chips
  // into one bubble, which is taller than the field viewport can show above *or* below a speaker.
  const line = interview.answering ? "" : `<p>${esc(npc.text)}</p>`;
  // Rendered above the speaker; placeFieldDialogueBubble() may flip it under them after layout, if
  // it does not fit. The speaker's own grid y travels on the element so that pass can recompute
  // both positions without re-deriving anything.
  const y = (state.y - 1.18) * grid.tile;
  const edgeClass =
    x < 260
      ? " field-speech-bubble--left-edge"
      : x > grid.columns * grid.tile - 300
        ? " field-speech-bubble--right-edge"
        : "";
  // A record-carrying NPC speaks first and hands the record over second. Routing straight to the
  // source on `E` would skip the line entirely; the two-step keeps the person a person.
  const carried = npcAnchoredSource(npc.id);
  const availability = carried ? sourceAvailability(activeFieldCaseId(), carried.id) : null;
  const point = carried ? activeFieldMap().sourcePoints[carried.id] : null;
  const record =
    availability === "available"
      ? `<button class="btn btn-gold field-speech-bubble__record" data-action="start-source-activity" data-source="${carried.id}" data-origin="field">Examine ${esc(point.label)} →</button>`
      : availability === "secured"
        ? `<button class="btn btn-outline field-speech-bubble__record" data-action="open-source" data-source="${carried.id}" data-origin="field">✓ ${esc(point.label)} — reopen</button>`
        : "";
  // Everything but the close button and the tail lives in one scrollable child, so a bubble taller
  // than the room beside its speaker scrolls inside itself instead of being cut off by the frame.
  // It has to be a child rather than `overflow` on the aside: the tail is an ::after hanging 12px
  // outside the box, and an overflowing aside clips it off.
  return `<aside class="field-speech-bubble${edgeClass}" data-speaker-y="${state.y.toFixed(3)}" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px" aria-live="polite"><button class="field-speech-bubble__close" data-action="field-dialogue-close" aria-label="Close dialogue">×</button><div class="field-speech-bubble__scroll"><b>${esc(npc.name)}</b>${line}${interview.markup}${record}</div></aside>`;
}

/**
 * An INTERVIEW is put to people where they stand, so its question chips render inside the field
 * dialogue bubble rather than on a screen. This is the only consumer of the registry's optional
 * renderInline slot.
 *
 * The NPC's own standing line stays above the chips deliberately — it is the thing that tells a
 * player this person is worth asking, and replacing it with a question menu would turn the cast
 * back into buttons.
 */
function fieldInterviewPanel(npcId) {
  const live = liveFieldInterview();
  if (!live) return { markup: "", answering: false };
  const markup = renderActivityInline("interview", live.activity, live.state, npcId);
  if (!markup) return { markup: "", answering: false };
  return {
    // Wrapped with the source id so handleActivityAction() can resolve which activity this chip
    // belongs to without the engine — which knows nothing about sources — having to emit it.
    markup: `<div class="field-interview-panel" data-activity-source="${esc(live.source.id)}">${markup}</div>`,
    answering: interviewHasAsked(live.activity, live.state, npcId),
  };
}

/**
 * The interview the player currently has open on this map, if any: an interview activity on one of
 * this case's sources whose state has actually been created — which happens when they open the
 * record that briefs the questions, and not before. Until then the cast has nothing to be asked.
 */
/**
 * Puts the dialogue bubble on whichever side of its speaker has more room, and caps it to that room.
 *
 * Two things went wrong here before, and both were only findable by measuring. The first version
 * estimated the bubble's height and never fired. The second measured, but wrote a class whose
 * `transform` was being beaten by an `!important` further down global.css — so the flip was applied,
 * did nothing, and the bubble simply stayed above the speaker for a whole phase. That override is
 * gone; if a flip ever silently stops working again, check the cascade before the arithmetic.
 *
 * "More room" is decided from the two tail anchors rather than from the bubble's own rect, because
 * the rect on one side tells you nothing about the other. When neither side can hold it — an
 * interview answer plus a log button plus four chips is roughly triple a standing line — the cap
 * plus `.field-speech-bubble__scroll` lets it scroll inside itself, which is the only outcome that
 * survives a speaker standing anywhere on any map.
 *
 * The world scrolls under a fixed frame, so all of this is measured against the field viewport's
 * box, not the page's. Reads layout and writes one class, one `top` and one `max-height`; it never
 * touches fieldCamera, which stays a pure function of player position. Safe to run once per render
 * because the bubble is only created by a render, and moving closes it.
 */
function placeFieldDialogueBubble() {
  const bubble = document.querySelector(".field-speech-bubble");
  const viewport = document.getElementById("caseFieldMap");
  const world = document.getElementById("caribbeanWorld");
  if (!bubble || !viewport || !world) return;
  const speakerY = Number.parseFloat(bubble.dataset.speakerY);
  if (!Number.isFinite(speakerY)) return;
  const tile = activeFieldGrid().tile;
  const MARGIN = 8;
  const frame = viewport.getBoundingClientRect();
  const worldTop = world.getBoundingClientRect().top;
  // Where the tail would touch on each side, in screen coordinates.
  const roomAbove = worldTop + (speakerY - 1.18) * tile - frame.top - MARGIN;
  const roomBelow = frame.bottom - (worldTop + (speakerY + 0.95) * tile) - MARGIN;
  const flip = roomBelow > roomAbove;
  bubble.classList.toggle("field-speech-bubble--below", flip);
  bubble.style.top = `${((speakerY + (flip ? 0.95 : -1.18)) * tile).toFixed(1)}px`;
  // A floor of 120px so a speaker jammed against the frame still gets a readable, scrollable bubble
  // rather than a sliver.
  bubble.style.maxHeight = `${Math.max(120, Math.round(flip ? roomBelow : roomAbove))}px`;
}

/** Display name for an NPC id, across every surface of the active unit's map. */
/**
 * Every surface of the active unit's map — outdoors, plus each interior it opens into.
 *
 * Deliberately not "the surface the player is standing on": a record can be anchored to someone in
 * another room, and both the Mission Tracker and the Mission Instructions screen have to be able to
 * name that person from wherever the player happens to be.
 */
function fieldSurfaces() {
  return [activeFieldOutdoorMap(), ...fieldInteriors()];
}
function fieldNpcById(npcId) {
  if (!npcId) return null;
  for (const surface of fieldSurfaces()) {
    const npc = (surface.npcs || []).find((candidate) => candidate.id === npcId);
    if (npc) return npc;
  }
  return null;
}
function fieldNpcName(npcId) {
  return fieldNpcById(npcId)?.name || "";
}
/** The person carrying a record, if it is on a person at all rather than on an object. */
function sourceAnchorNpcId(sourceId) {
  for (const surface of fieldSurfaces()) {
    const npcId = surface.sourcePoints?.[sourceId]?.anchor?.npc;
    if (npcId) return npcId;
  }
  return null;
}

function liveFieldInterview() {
  for (const source of sourcesForCase(activeFieldCaseId())) {
    const activity = activityFor(source.id);
    if (activity?.kind !== "interview") continue;
    const state = progress.sourceActivities?.[source.id]?.state;
    if (!state?.asked) continue;
    // A filed interview is over, and the cast stops offering questions. Without this,
    // Columbus was still holding out four question chips long after the record they
    // belonged to had been closed and secured — the first thing the playtest caught.
    if (isActivityComplete(activity.kind, activity, state)) continue;
    return { source, activity, state };
  }
  return null;
}

/**
 * Which of a case's started activities the tracker is about, given the record the player
 * currently has open.
 *
 * Three tiers, and the reason there are three is that `progress.activeActivitySourceId` is
 * deliberately nulled when a mission is filed ("open-activity-source" and "mission-debriefed"),
 * so "whatever is open" is only an answer some of the time:
 *
 * 1. **The open record wins.** This is the whole point — it is what `activityScreen()` and
 *    `handleActivityAction()` already resolve on, and it survives "Back to the field", so the
 *    tracker keeps naming the mission the player walked out of.
 * 2. **Otherwise the first unfinished one**, which is where a player who just filed something
 *    still has work.
 * 3. **Otherwise the last one**, not the first: with everything filed, the useful notebook is the
 *    one they were most recently in. This tier is why the function keeps reporting a *finished*
 *    activity at all — re-reading a filed notebook is most of what the tracker's button is for.
 *
 * Pure and exported so the ordering can be tested without a map, a save or a DOM: reading the
 * first entry with any state at all (which is what this did before) pinned the panel to a case's
 * first record for the rest of the case, and nothing caught it.
 */
export function pickTrackedActivity(entries, activeId) {
  if (entries.length === 0) return null;
  return (
    entries.find((entry) => entry.source.id === activeId) ||
    entries.find((entry) => !entry.complete) ||
    entries[entries.length - 1]
  );
}

/**
 * The activity this case has in flight, for the Mission Tracker: every source of the active case
 * whose activity state has actually been created, resolved by pickTrackedActivity() above.
 */
function trackedFieldActivity() {
  const entries = [];
  for (const source of sourcesForCase(activeFieldCaseId())) {
    const activity = activityFor(source.id);
    if (!activity) continue;
    const state = progress.sourceActivities?.[source.id]?.state;
    if (!state || typeof state !== "object") continue;
    entries.push({
      source,
      activity,
      state,
      complete: isActivityComplete(activity.kind, activity, state),
    });
  }
  return pickTrackedActivity(entries, progress.activeActivitySourceId);
}
function recallBeacon() {
  // Outdoors only. Recalling to the Archive from inside a building would strand the return
  // position in a room the player is no longer standing in; they step outside first.
  if (isInsideFieldInterior()) return "";
  const recall = activeFieldOutdoorMap().recall;
  const grid = activeFieldGrid();
  return `<button class="recall-beacon" style="left:${(recall.x * grid.tile).toFixed(1)}px;top:${(recall.y * grid.tile).toFixed(1)}px" data-action="field-recall" aria-label="Recall to Archive room"><img src="${recallBeaconBlue}" alt=""><span>Recall to Archive</span></button>`;
}
/**
 * The doorstep markers on the outdoor map, and the threshold marker inside a room.
 *
 * Same visual language as the recall beacon and the record signals — a labelled world button the
 * player walks to. Interaction is proximity-gated through nearestFieldInteraction() exactly like an
 * NPC or a record, so clicking one from across the map moves nobody.
 */
function fieldDoorMarkers() {
  const grid = activeFieldGrid();
  if (isInsideFieldInterior()) {
    const room = activeFieldMap();
    return `<button class="field-door field-door--exit" style="left:${(room.exit.x * grid.tile).toFixed(1)}px;top:${(room.exit.y * grid.tile).toFixed(1)}px" data-action="field-exit-interior" aria-label="Step back outside"><i aria-hidden="true">↩</i><span>Step outside</span></button>`;
  }
  return fieldInteriors()
    .map(
      (room) =>
        `<button class="field-door" style="left:${(room.door.x * grid.tile).toFixed(1)}px;top:${(room.door.y * grid.tile).toFixed(1)}px" data-action="field-enter-interior" data-interior="${esc(room.id)}" aria-label="Enter ${esc(room.door.label)}"><i aria-hidden="true">⌂</i><span>${esc(room.door.label)}</span></button>`
    )
    .join("");
}
function caribbeanWorldMarkup() {
  // The cartographer's table and the Spanish ships used to be CSS-drawn <div>s layered over the
  // tile canvas, because Island survival's only ship art is a wrecked hull — the wrong story
  // beat for first contact. Both are now real tile art: intact three-masted hulls come from
  // Medieval harbor/tile-B-04 and the chart table from Island survival/5. That also removes a
  // latent bug — those divs were positioned in absolute pixels tuned to the old 40px tile size,
  // so they silently drifted away from their collision rects when the tile scale was corrected.
  return `<canvas class="field-world-art" id="caribbeanTiledCanvas" role="img" aria-label="Top-down tropical island shoreline with a Taíno village, conuco garden, a Spanish landing camp, and three ships anchored offshore (Island survival tileset)"></canvas><canvas class="field-world-overlay" id="caribbeanTiledCanvasOverlay" aria-hidden="true"></canvas>`;
}
function riverbendWorldMarkup() {
  return `<canvas class="field-world-art" id="riverbendTiledCanvas" role="img" aria-label="Top-down colonial river settlement with a meetinghouse, clapboard dwellings, a barn, fenced crop plots, and a wharf on the river estuary"></canvas><canvas class="field-world-overlay" id="riverbendTiledCanvasOverlay" aria-hidden="true"></canvas>`;
}
// An interior's worldMarkup follows the same two-canvas pattern as the maps above, and must use its
// OWN canvas ids even if it draws a .tmj another surface also draws: renderTiledMapWithOverlay()
// guards on `dataset.rendered`, so a shared id makes one surface's painted canvas count as proof the
// other was painted too, and the second room renders as an empty frame.
// Each map's briefing copy. There used to be a `defaultNotice` here too — a standing sentence printed
// into #fieldNotice on arrival, which restated the `intro` right below it and then sat there for the
// rest of the case. The notice is a status line, so it now says nothing until the game does.
const FIELD_COPY = {
  "unit-01": {
    intro:
      "You are the only Chronicler in the field. Start in the village, gather observations, then follow the shoreline toward the Spanish camp and map fragments as the record opens.",
    progressHint:
      "Complete the village investigation, Columbus source encounter, and map reconstruction.",
  },
  "unit-02": {
    intro:
      "You arrive at a young river settlement. Speak with its people, then secure the charter, the servant's letter, and the wharf accounts before the record destabilizes.",
    progressHint: "Secure the charter, the servant's letter, and the wharf accounts.",
  },
  "unit-03": {
    intro:
      "You arrive on a Philadelphia gathering ground threaded with news from the frontier, the press, the assembly, and the wharf. Walk the square, speak with its people, then gather all seven records before the record destabilizes.",
    progressHint:
      "Secure the frontier speech, the farmer's letters, the liberty speech, the elegy, the proclamation, the petition, and the private letter.",
  },
  "unit-04": {
    intro:
      "You arrive on the towpath of a canal town that did not exist twenty years ago. Walk the line and speak with the people the canal brought here. Three records are out in the town — a boat's toll receipt, a workshop's time book, and the notices on the Reform Square board — and two more are behind doors: the printing office on Market Street, and the boardinghouse in the quarter below the towpath.",
    progressHint:
      "Five records: the toll receipt, the workshop time book, the reform notices, the printer's order book, and the boardinghouse register.",
  },
  "unit-05": {
    intro:
      "You arrive on Franklin Street, in a capital under siege conditions and swollen to three times the people it was built for. The government quarter is uphill; the ironworks, the warehouse district and the dock are down the bluff behind you. Four records are out in the city — a War Department requisition, the market's price board, the Tredegar payroll, and a labourer's pass at the dock — and two more are behind doors: the commission house on Franklin Street, and a Chimborazo ward on the hill.",
    progressHint:
      "Six records: the impressment requisition, the price and ration notices, the Tredegar payroll, the labourer's pass, the commission house day book, and the ward register.",
  },
};
function fieldScreen() {
  const map = activeFieldMap();
  const caseId = activeFieldCaseId();
  const activeCase = caseById(caseId);
  const sources = sourcesForCase(caseId);
  // Keyed on the outdoor map, not the active surface. Keyed on `map.id` this missed on every
  // interior id and silently fell back to Unit 1's briefing — a student who walked into a building
  // in the Chesapeake was told to follow the Caribbean shoreline.
  const copy = FIELD_COPY[activeFieldOutdoorMap().id] || FIELD_COPY["unit-01"];
  const allSecured = sources.length > 0 && countEvidence(caseId) === sources.length;
  const fieldNotice = progress.fieldNotice;
  // Most cases already carry the date inside `location` ("Caribbean · 1493", "Philadelphia,
  // Pennsylvania · 1763–1783"), and appending `date` unconditionally printed it twice on every one
  // of them — "Caribbean · 1493 · 1493" has been on the Unit 1 field screen since it shipped. Two
  // of Unit 2's cases carry a placeless location with no date ("The Atlantic circuit"), which is why
  // the append exists at all, so this keeps it for those and drops it where it would repeat.
  const kicker = activeCase.location.includes(activeCase.date)
    ? activeCase.location
    : `${activeCase.location} · ${activeCase.date}`;
  return `${chrome()}<main class="shell case-field case-field--living"><section class="field-intro"><button class="back-link" data-action="home">← Recall to Institute</button><p class="kicker">${esc(kicker)}</p><h1>${esc(resolvedCaseTitle(activeCase))}</h1><p class="field-question">${esc(activeCase.question)}</p><p>${esc(copy.intro)}</p><p class="field-legend">Look for a <b>✦</b> — over a person's head or on the object holding a record. The checklist on the map tracks all of them.</p><p class="field-notice" id="fieldNotice" ${fieldNotice ? "" : "hidden"}>${esc(fieldNotice)}</p></section><section class="field-viewport field-scene--interactive" id="caseFieldMap"><div class="caribbean-world field-world--${map.id}" id="caribbeanWorld" style="${fieldWorldStyle()}">${map.worldMarkup()}${recallBeacon()}${fieldDoorMarkers()}${map.npcs.map(fieldNpcButton).join("")}${sources.map(fieldSourceSignal).join("")}${fieldDialogueBubble()}<div class="case-field-player" id="caseFieldPlayer" data-facing="${fieldMovement.facing}" style="${fieldPositionStyle()}" aria-label="${esc(progress.profile.name || "Chronicler")}"><span class="cast-shadow"></span>${characterSpriteMarkup(chroniclerKey(), fieldMovement.facing, { id: "caseFieldPlayerSprite", walking: fieldMovement.moving, speed: FIELD_SPEED })}</div></div>${fieldObjectiveTracker()}</section><aside class="field-channel"><p class="kicker">Codex field link</p><h2>Evidence Channel</h2><p class="role">Archive connection · portable</p><p>Institute staff remain in the Archive. In the field, your Codex preserves source readings, observation notes, and the final transmission back to the Navigation Table.</p><button class="btn btn-outline" data-action="codex" data-origin="field">Open Codex <b>${countEvidence(caseId)}</b></button>${PRACTICE_CHECK_QUESTS[caseId] && progress.settings.miniGamesEnabled ? `<button class="btn btn-outline btn-outline--practice" data-action="practice-check">Practice Check →</button>` : ""}${caseId === "case-001" ? `<button class="text-button field-reset-button" data-action="reset-case-001">Reset Case 1.01 demo</button>` : ""}${allSecured ? `<button class="btn btn-gold" data-action="reconstruction">Open Reconstruction Table →</button>` : `<p class="channel-progress">${esc(copy.progressHint)}</p>`}</aside></main>`;
}

// Human-facing name for each engine, used in the activity screen's eyebrow. The engine keys
// themselves are machine strings (screen ids, content's `activityRoute`); these are what a
// student reads.
const ACTIVITY_ENGINE_LABELS = {
  interview: "The Interview",
  assembly: "The Reconstruction",
  discrepancy: "The Audit",
  trace: "The Trace",
};

// One mark per engine, so an activity says what kind of thing it is before a student reads a word
// of it. Inline SVG rather than PNG assets, matching DIRECTOR_REVEAL_ICONS above and the cursor in
// global.css — the project's established convention for small UI chrome, and the reason there is no
// icon-asset pipeline to add four files to.
const ACTIVITY_ENGINE_ICONS = {
  // Two people talking: what one says depends on what you asked.
  interview: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 3.6h8.4a1 1 0 0 1 1 1v4.3a1 1 0 0 1-1 1H6L3.3 12V9.9h-.8a1 1 0 0 1-1-1V4.6a1 1 0 0 1 1-1Z"/><path d="M14.3 7.4h2.9a1.1 1.1 0 0 1 1.1 1.1v4.4a1.1 1.1 0 0 1-1.1 1.1h-.5v2.3l-2.6-2.3h-1.6a1.1 1.1 0 0 1-1.1-1.1v-1.1"/></svg>`,
  // Three pieces placed, one slot still open.
  assembly: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2.6" width="6.6" height="6.6" rx="1"/><rect x="2" y="11" width="6.6" height="6.6" rx="1"/><rect x="11.4" y="11" width="6.6" height="6.6" rx="1"/><rect x="11.4" y="2.6" width="6.6" height="6.6" rx="1" stroke-dasharray="2 2"/></svg>`,
  // Two columns of the same account, one of them short.
  discrepancy: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.4" y="2.6" width="15.2" height="14.8" rx="1.2"/><path d="M10 2.6v14.8"/><path d="M4.8 6.9h3M4.8 10.4h3M4.8 13.9h3"/><path d="M12.4 6.9h2.9M12.4 10.4h1.5"/></svg>`,
  // One thing, followed through the places it passes.
  trace: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="3.9" cy="14.6" r="1.9"/><circle cx="10" cy="5.7" r="1.9"/><circle cx="16.1" cy="13.1" r="1.9"/><path d="M5 13 8.8 7.4M11.3 7.1l3.6 4.4"/></svg>`,
};

// One host screen for every activity engine — the screen id *is* the engine key. Which record the
// activity is about comes from progress.activeActivitySourceId, persisted for exactly this
// reason: the three screens this replaced only survived a reload by hardcoding one source apiece
// (mapJigsawScreen() opened, literally, with sourceById("waldseemuller-map")).
function activityScreen(kind) {
  const sourceId = progress.activeActivitySourceId || openSourceId;
  const source = sourceId ? sourceById(sourceId) : null;
  const activity = source ? activityFor(source.id) : null;
  // A save can outlive its content — a teacher swapping the source out of a slot, or a screen id
  // that no longer matches the activity behind it. Land in the field rather than throwing into
  // render()'s recovery path, which resets the whole case.
  if (!source || !activity || activity.kind !== kind) {
    progress.currentScreen = "field";
    save();
    return `${chrome()}<main class="shell"><section class="empty-state"><h1>Nothing open</h1><p>That activity is no longer in your hands. Walk back to the record to pick it up again.</p><button class="btn btn-gold" data-action="field">Back to the field →</button></section></main>`;
  }
  // Restores the module-local id after a reload, so the source reader this hands off to still
  // knows what it is opening.
  openSourceId = source.id;
  const entry = ensureSourceActivity(source.id);
  // The instructions are a moment before they are a reference. Cleared once per record and then
  // never again — the copy column below keeps the same steps for the rest of the mission, which is
  // what makes clearing this screen safe. An activity with no `howItWorks` has nothing to show and
  // goes straight to its board.
  if (activity.howItWorks && !entry.briefed)
    return missionInstructionsScreen(kind, source, activity);
  const complete = isActivityComplete(kind, activity, entry.state);
  // The third state, and the mirror of the first: the mission opens on the person who handed it
  // over and closes on what it turned out to establish. Shown the moment the closer lands, which is
  // why the filed option's own `why` is reprinted there — a player moved off the board instantly
  // would otherwise never read it.
  if (complete && activity.debrief && !entry.debriefed)
    return missionDebriefScreen(kind, source, activity, entry);
  const kicker = activityKicker(kind);
  const board = renderActivity(kind, activity, entry.state, activityContext(activity));
  // The line that starts the activity, in the voice of whoever says it. Rendered by the host rather
  // than the engine because it belongs in the copy column, which the engine has no view of.
  const briefing = activity.briefing
    ? `<blockquote class="activity-briefing"><p>${esc(activity.briefing.line)}</p><cite>${esc(fieldNpcName(activity.briefing.speaker))}</cite></blockquote>`
    : "";
  // How the thing is played, and the words it plays with. Both are host-rendered for the
  // same reason as the briefing: they belong in the copy column, which no engine has a view
  // of. Both are optional, and an activity that omits them renders exactly as before.
  const howItWorks = activity.howItWorks
    ? `<section class="activity-howto"><h2>How this works</h2><ol>${activity.howItWorks.steps
        .map((step) => `<li>${esc(step)}</li>`)
        .join(
          ""
        )}</ol>${activity.howItWorks.note ? `<p class="activity-howto__note">${esc(activity.howItWorks.note)}</p>` : ""}</section>`
    : "";
  const terms = activity.terms
    ? `<section class="activity-terms"><h2>Words in this record</h2><dl>${activity.terms
        .map((word) => `<dt>${esc(word.term)}</dt><dd>${esc(word.definition)}</dd>`)
        .join("")}</dl></section>`
    : "";
  const footer = complete
    ? `<p class="activity-feedback success">Record stabilized.</p><button class="btn btn-gold" data-action="open-activity-source" data-source="${esc(source.id)}">Open ${esc(source.title)} →</button>`
    : "";
  // The board and the footer share the shell's right-hand column, so they are wrapped rather than
  // being two more children of a two-column grid.
  return `${chrome()}<main class="shell activity-shell activity-shell--${esc(kind)}" data-activity-source="${esc(source.id)}"><section class="activity-copy"><button class="back-link" data-action="field">← Back to the field</button><p class="kicker kicker--activity">${kicker}</p><h1>${esc(activity.title)}</h1>${activityVariantLine(activity)}<p>${esc(activity.intro)}</p>${briefing}${howItWorks}${terms}</section><div class="activity-stage">${board}${footer ? `<section class="activity-footer">${footer}</section>` : ""}</div></main>`;
}

/**
 * Who is handing this record over.
 *
 * Three tiers, in order, and none of them invents content: whoever the activity's `briefing` names;
 * failing that, whoever is carrying the record on the map; failing that, nobody — a record found on
 * a shore has no giver and the screen says so rather than borrowing someone.
 */
function missionGiver(source, activity, { speaker = null, line = "" } = {}) {
  // An explicit speaker wins — the debrief may be heard by somebody other than whoever handed the
  // record over, and content says so by naming them.
  const named = fieldNpcById(speaker);
  if (named) return { npc: named, line };
  const spoken = fieldNpcById(activity.briefing?.speaker);
  if (spoken) return { npc: spoken, line: line || activity.briefing.line };
  const carrier = fieldNpcById(sourceAnchorNpcId(source.id));
  return carrier ? { npc: carrier, line } : null;
}

// The eyebrow every state of the activity screen shares: the engine's mark, the case number and the
// engine's own name. "Case 1.01 · The Interview".
function activityKicker(kind) {
  const activeCase = caseById(activeFieldCaseId());
  return `${ACTIVITY_ENGINE_ICONS[kind] || ""}<span>${esc(
    [activeCase ? caseNumberLabel(activeCase) : "", ACTIVITY_ENGINE_LABELS[kind]]
      .filter(Boolean)
      .join(" · ")
  )}</span>`;
}

// The mission's shape inside its engine family, under the title rather than in the eyebrow.
//
// It went in the kicker first and wrapped mid-phrase in the activity board's 370px copy column —
// "Case 1.01 · The Interview · Ask" / "the Right Question" — because that column is half the width
// of the one Mission Instructions and the Debrief use. A story title with its form named beneath it
// is also the shape the brief asked for.
function activityVariantLine(activity) {
  return activity?.variant ? `<p class="activity-variant">${esc(activity.variant)}</p>` : "";
}

// The four historical-fiction categories, in the order a student should read them: what is real
// first, then what was reconstructed around it, then what Chronicle invented outright, then what
// nobody has settled. Labels are student-facing and fixed here rather than in content, because the
// whole value of the policy is that it reads identically in every mission.
const HISTORICAL_RECORD_BANDS = [
  ["documented", "Documented"],
  ["reconstructed", "Plausible reconstruction"],
  ["fiction", "Chronicle fiction"],
  ["debated", "Still debated"],
];

/**
 * Mission Debrief — the screen a finished record closes on, once.
 *
 * Beat 7 of the mission rhythm, and host-rendered for the same reason the briefing and the glossary
 * are: it needs the giver's portrait, the case number and the route onward to the source reader,
 * none of which an engine has a view of.
 *
 * Deliberately not a new screen id, exactly as Mission Instructions is not — this is the third
 * state of the activity screen, gated on `debriefed`. See decision log 0054 §1 for the same
 * argument made at the other end of the mission.
 */
function missionDebriefScreen(kind, source, activity, entry) {
  const giver = missionGiver(source, activity, {
    speaker: activity.debrief.speaker,
    line: activity.debrief.line,
  });
  const plate = giver
    ? `<figure class="mission-brief__giver"><img class="mission-brief__portrait" src="${sheetFor(giver.npc.sprite).portrait}" alt=""><figcaption><b>${esc(giver.npc.name)}</b>${giver.npc.label ? `<span>${esc(giver.npc.label)}</span>` : ""}</figcaption><blockquote><p>${esc(activity.debrief.line)}</p></blockquote></figure>`
    : `<figure class="mission-brief__giver is-record"><div class="mission-brief__mark" aria-hidden="true">${ACTIVITY_ENGINE_ICONS[kind] || ""}</div><figcaption><b>${esc(source.title)}</b></figcaption><blockquote><p>${esc(activity.debrief.line)}</p></blockquote></figure>`;

  // The conclusion the player actually filed, in their own result's words. Without this the closer's
  // `why` is written and never read: the debrief opens the instant the closer lands.
  const filed = activity.closer.options.find((option) => option.id === entry.state?.filed);
  const conclusion = filed
    ? `<section class="mission-debrief__filed"><h2>What you filed</h2><p class="mission-debrief__conclusion">${esc(filed.text)}</p><p>${esc(filed.why)}</p></section>`
    : "";

  const unresolved = [
    activity.debrief.remains,
    ...(Array.isArray(activity.openQuestions) ? activity.openQuestions : []),
  ].filter(Boolean);

  const record = activity.historicalRecord
    ? `<section class="mission-debrief__record"><h2>The historical record</h2><p class="mission-debrief__record-note">Chronicle takes real liberties. Here is which is which.</p><dl>${HISTORICAL_RECORD_BANDS.map(
        ([key, label]) => {
          const lines = activity.historicalRecord[key];
          if (!Array.isArray(lines) || !lines.length) return "";
          return `<dt class="is-${key}">${esc(label)}</dt><dd><ul>${lines
            .map((line) => `<li>${esc(line)}</li>`)
            .join("")}</ul></dd>`;
        }
      ).join("")}</dl></section>`
    : "";

  // The three records of a case turning out to be one story. Gated on the whole case being filed
  // rather than on this being "the last" mission — a player who finishes in a different order still
  // gets it, wherever they actually ended.
  const arc =
    activity.arcClose && caseArcFiled(source.id)
      ? `<section class="mission-debrief__arc"><h2>What the three records make together</h2><blockquote><p>${esc(activity.arcClose.line)}</p>${activity.arcClose.speaker ? `<cite>${esc(fieldNpcName(activity.arcClose.speaker))}</cite>` : ""}</blockquote><p>${esc(activity.arcClose.established)}</p></section>`
      : "";

  // Something on the record that should not be there. Last on the screen on purpose: it is the one
  // thing the mission does not resolve, and it should be the note the player leaves on.
  const anomaly = activity.anomaly
    ? `<section class="mission-debrief__anomaly"><h2>Flagged for the Institute</h2><p class="mission-debrief__noticed">${esc(activity.anomaly.noticed)}</p><p>${esc(activity.anomaly.note)}</p></section>`
    : "";

  const onward = `<button class="btn btn-gold mission-brief__begin" data-action="mission-debriefed" data-source="${esc(source.id)}">Open ${esc(source.title)} →</button>`;

  return `${chrome()}<main class="shell mission-brief mission-debrief" data-activity-source="${esc(source.id)}"><section class="mission-brief__from">${plate}${onward}</section><section class="mission-brief__body"><button class="back-link" data-action="field">← Back to the field</button><p class="kicker kicker--activity">${activityKicker(kind)}</p><h1>${esc(activity.title)}</h1>${activityVariantLine(activity)}${activity.missionQuestion ? `<p class="mission-brief__question">${esc(activity.missionQuestion)}</p>` : ""}${conclusion}<section class="mission-debrief__found"><h2>What the evidence supports</h2><p>${esc(activity.debrief.established)}</p></section><section class="mission-debrief__open"><h2>What it cannot settle</h2><ul>${unresolved
    .map((line) => `<li>${esc(line)}</li>`)
    .join("")}</ul></section>${arc}${record}${anomaly}</section></main>`;
}

/**
 * Whether every mission on this record's case is now in the Codex.
 *
 * The gate on an arc close. Reads `progress.codex` rather than `sourceActivities`, so it means
 * "filed with a conclusion the evidence could carry" and not merely "the screen was visited" — the
 * same bar the Codex itself uses (decision log `0058`). A case with only one activity is trivially
 * complete, which is correct: an arc of one is a mission, and it simply has no `arcClose` to show.
 */
function caseArcFiled(sourceId) {
  const caseId = caseIdForSource(sourceId);
  if (!caseId) return false;
  const activities = sourcesForCase(caseId)
    .map((source) => activityFor(source.id))
    .filter(Boolean);
  if (!activities.length) return false;
  return activities.every((activity) => !!progress.codex?.[activity.id]);
}

/**
 * Mission Instructions — the screen a record opens on, once.
 *
 * Phase 69 answered "have an instruction screen explaining the quest" (decision log `0052` §10) with
 * a panel in the activity's copy column, beside the board the panel was meant to explain. A player
 * already looking at the board does not read it. This is the same content given its own beat, framed
 * as the hand-off it always was in fiction: the person who gave you the job, their portrait, and what
 * they want done.
 *
 * Deliberately *not* a new screen id. The engine keys already double as `VALID_SCREENS` entries and
 * as content's `activityRoute`, so a fifth id here would be a save-compatibility change to buy
 * nothing — this is a state of the activity screen, the same way the Entrance Hall is a room and not
 * a screen. `briefed` lives on the per-source activity entry beside `state` and `completed`.
 */
function missionInstructionsScreen(kind, source, activity) {
  const kicker = activityKicker(kind);
  const giver = missionGiver(source, activity);
  // The portrait is the character's own committed `-portrait.png` — characterSheet() builds one for
  // every member of the cast and throws at boot if a file is missing, so this can never 404.
  const plate = giver
    ? `<figure class="mission-brief__giver"><img class="mission-brief__portrait" src="${sheetFor(giver.npc.sprite).portrait}" alt=""><figcaption><b>${esc(giver.npc.name)}</b>${giver.npc.label ? `<span>${esc(giver.npc.label)}</span>` : ""}</figcaption>${giver.line ? `<blockquote><p>${esc(giver.line)}</p></blockquote>` : ""}</figure>`
    : `<figure class="mission-brief__giver is-record"><div class="mission-brief__mark" aria-hidden="true">${ACTIVITY_ENGINE_ICONS[kind] || ""}</div><figcaption><b>${esc(source.title)}</b><span>Nobody handed you this one</span></figcaption></figure>`;
  const steps = activity.howItWorks.steps.map((step) => `<li>${esc(step)}</li>`).join("");
  const note = activity.howItWorks.note
    ? `<p class="mission-brief__note">${esc(activity.howItWorks.note)}</p>`
    : "";
  const terms = activity.terms
    ? `<section class="mission-brief__terms"><h2>Words in this record</h2><dl>${activity.terms
        .map((word) => `<dt>${esc(word.term)}</dt><dd>${esc(word.definition)}</dd>`)
        .join("")}</dl></section>`
    : "";
  // The button lives in the giver's column, not under the instructions. Two reasons, and the first
  // is the binding one: on the 1366x768 Chromebook this game is built for, a heading, an intro,
  // three steps and a glossary put anything below them off the bottom of the screen, and a
  // click-to-continue control a player has to scroll to find is a screen that looks stuck. The
  // second is that it reads correctly there — you accept the job from the person offering it.
  const begin = `<button class="btn btn-gold mission-brief__begin" data-action="mission-briefed" data-source="${esc(source.id)}">Begin the mission →</button>`;
  return `${chrome()}<main class="shell mission-brief" data-activity-source="${esc(source.id)}"><section class="mission-brief__from">${plate}${begin}</section><section class="mission-brief__body"><button class="back-link" data-action="field">← Back to the field</button><p class="kicker kicker--activity">${kicker}</p><h1>${esc(activity.title)}</h1>${activityVariantLine(activity)}<p class="mission-brief__intro">${esc(activity.intro)}</p>${activity.missionQuestion ? `<p class="mission-brief__question">${esc(activity.missionQuestion)}</p>` : ""}${activity.thinkingMove ? `<p class="mission-brief__move"><b>What this asks of you</b> ${esc(activity.thinkingMove)}</p>` : ""}<section class="mission-brief__steps"><h2>Mission Instructions</h2><ol>${steps}</ol>${note}</section>${terms}</section></main>`;
}

// One dispatch point for every control an engine renders. Deliberately on its own
// `data-activity-action` attribute rather than main.js's global `data-action`: the engines use
// short generic verbs (place, file, select, log) that would have to be globally unique across
// every screen in the game if they shared that namespace.
function handleActivityAction(control, overrides = {}) {
  const sourceId =
    control.closest("[data-activity-source]")?.dataset.activitySource ||
    progress.activeActivitySourceId ||
    openSourceId;
  const activity = sourceId ? activityFor(sourceId) : null;
  if (!activity) return;
  const entry = ensureSourceActivity(sourceId);
  // `overrides` is how the drop handler says "place" over a slot button whose own verb is "lift".
  const data = { ...control.dataset, ...overrides };
  const next = actOnActivity(activity.kind, activity, entry.state, {
    type: data.activityAction,
    speaker: data.speaker,
    question: data.question,
    board: data.board,
    slot: data.slot,
    fragment: data.fragment,
    claim: data.claim,
    verdict: data.verdict,
    gap: data.gap,
    leg: data.leg,
    effect: data.effect,
    support: data.support,
    option: data.option,
    finding: data.finding,
  });
  // Every engine's reducer returns the state object unchanged for an action it refuses (out of
  // range, gated, unknown). Re-rendering on those would flicker the screen and, on the field,
  // close the dialogue bubble the player is reading.
  if (next === entry.state) return;
  entry.state = next;
  recordActivityOutcomes(activity, entry.state, sourceId);
  playQuestSfx(sourceId);
  save();
  render();
}

// The activity twin of recordSkillOutcomes(). Activities report the same
// { key, skillCategory, correct } shape quest types do, so the mastery record needs no new
// concepts — only a second door into it.
//
// Also the one place a finished mission reaches the Codex. It was already the single consumer of
// activityOutcome(), which is why the filing hangs here rather than off the closer: one call site,
// and every path that can complete an activity already runs through it.
function recordActivityOutcomes(activity, state, sourceId) {
  if (isPreviewingContent()) return;
  const outcome = activityOutcome(activity.kind, activity, state);
  outcome.skillOutcomes.forEach((skillOutcome) => {
    if (!skillOutcome.skillCategory) return;
    const correct = !!skillOutcome.correct;
    const existing = progress.skillMastery[skillOutcome.key];
    if (
      existing &&
      existing.skillCategory === skillOutcome.skillCategory &&
      existing.correct === correct
    ) {
      return;
    }
    progress.skillMastery[skillOutcome.key] = {
      skillCategory: skillOutcome.skillCategory,
      correct,
      questType: activity.kind,
      updatedAt: new Date().toISOString(),
    };
  });
  fileToCodex(activity, state, sourceId, outcome);
}

/**
 * File a finished mission into the Codex.
 *
 * Gated on `isActivityComplete`, which for every engine means the closer is both *correct* and
 * *supported* — the conclusion the record will bear, argued from evidence the player is actually
 * carrying. That is what "what you can defend" means as a condition rather than a slogan.
 *
 * Deliberately never unfiles. Completion is an event: a player who afterwards reopens the mission
 * and releases a notebook entry has not un-established what they established, and watching a record
 * vanish from the Archive would teach the opposite. Re-completing refreshes the snapshot but keeps
 * the original `filedAt`, so the archive stays in the order things happened.
 *
 * An activity with no `codexFiling` files nothing. Every screen below reads `progress.codex`, so an
 * unauthored mission is simply absent rather than a half-entry with no catalogue line.
 *
 * @returns {boolean} whether anything changed — backfillCodex() needs to know before it saves.
 */
function fileToCodex(activity, state, sourceId, outcome = null) {
  if (!activity?.codexFiling || !sourceId) return false;
  if (!isActivityComplete(activity.kind, activity, state)) return false;
  const result = outcome || activityOutcome(activity.kind, activity, state);
  const source = sourceById(sourceId);
  const kase = caseById(caseIdForSource(sourceId));
  const unit = kase ? unitForCase(kase.id) : null;
  const filed = activity.closer.options.find((option) => option.id === state?.filed);
  const entry = buildCodexEntry({
    activityId: activity.id,
    kind: activity.kind,
    variant: activity.variant,
    title: activity.title,
    missionQuestion: activity.missionQuestion,
    summary: activity.codexFiling.summary,
    sourceId,
    sourceTitle: source?.title,
    caseId: kase?.id,
    caseLabel: kase ? caseNumberLabel(kase) || resolvedCaseName(kase) : "",
    unitId: unit?.id,
    unitLabel: unit ? resolvedUnitTitle(unit) : "",
    conclusion: filed?.text,
    why: filed?.why,
    supported: true,
    // The kept subset, not everything the mission surfaced. A record's evidence is what the player
    // chose to stand behind — for an activity with no notebook cap that is all of it, which is the
    // correct reading of "kept everything" rather than a special case.
    evidence: (result.evidence || []).map((finding) => ({
      id: finding.id,
      text: finding.text,
      from: finding.from || "",
    })),
    openQuestions: [
      activity.debrief?.remains,
      ...(Array.isArray(activity.openQuestions) ? activity.openQuestions : []),
    ].filter(Boolean),
    tags: activity.codexFiling.tags,
    seeAlso: activity.codexFiling.seeAlso,
    filedAt: progress.codex?.[activity.id]?.filedAt || new Date().toISOString(),
  });
  if (!entry) return false;
  progress.codex ??= {};
  const before = JSON.stringify(progress.codex[activity.id] || null);
  progress.codex[activity.id] = entry;
  return before !== JSON.stringify(entry);
}

/**
 * Which case a source belongs to.
 *
 * Not `activeFieldCaseId()`: the backfill runs at boot with whatever case happens to be active, and
 * a Codex that stamped every Riverbend record "Case 1.01" would be worse than no label at all.
 */
function caseIdForSource(sourceId) {
  for (const [caseId, sources] of Object.entries(UNIT_SOURCES)) {
    if (sources.some((source) => source.id === sourceId)) return caseId;
  }
  return null;
}

/**
 * Make an existing save whole.
 *
 * The Codex is new, and every player who has already finished a mission finished it into a key that
 * did not exist. This walks what they have and files what qualifies, once, at boot. It is not a
 * migration in the schema sense — nothing is rewritten, and re-running it is a no-op — so it stays
 * in place rather than being versioned behind a flag.
 */
function backfillCodex() {
  if (isPreviewingContent()) return;
  let changed = false;
  Object.entries(ACTIVITIES_BY_SOURCE).forEach(([sourceId, activity]) => {
    const state = progress.sourceActivities?.[sourceId]?.state;
    if (!state) return;
    if (fileToCodex(activity, state, sourceId)) changed = true;
  });
  // Only save on a real change. An unconditional write here would bump `lastSavedAt` on every boot,
  // which is the field progress-repository.js resolves remote-vs-local conflicts with — a save that
  // is newer for no reason wins against a genuinely newer one from another device.
  if (changed) save();
}

function practiceCheckScreen() {
  let overallTotal = 0;
  let overallComplete = 0;

  const caseId = activeFieldCaseId();
  const activeCase = caseById(caseId);
  const questSet = PRACTICE_CHECK_QUESTS[caseId];

  const mcqQuests = questSet.mcq.map((quest) => resolveQuestSlot("mcq", quest));
  const answeredCount = mcqQuests.filter(
    (quest) => progress.questResponses[quest.id]?.selected !== undefined
  ).length;
  const mcqCards = mcqQuests
    .map((quest) => {
      const state = progress.questResponses[quest.id] || {};
      const result = gradeQuest("mcq", quest, state);
      recordSkillOutcomes("mcq", quest, state, result);
      const answered = questAnsweredAny("mcq", state);
      const correct = isQuestComplete("mcq", result);
      overallTotal += 1;
      if (answered) overallComplete += 1;
      const status = !answered ? "unanswered" : correct ? "correct" : "incorrect";
      const feedback = answered
        ? `<p class="activity-feedback ${correct ? "success" : "error"}" role="status" aria-live="polite">${
            correct ? "Correct." : "Not quite."
          } ${esc(quest.explanation || "")}</p>`
        : "";
      return `<div class="quest-practice-item" data-quest-status="${status}">${renderQuest("mcq", quest, state)}${feedback}</div>`;
    })
    .join("");

  const sequencingCards = questSet.sequencing
    .map((quest) => resolveQuestSlot("sequencing", quest))
    .map((quest) => {
      const state = progress.questResponses[quest.id] || {};
      const result = gradeQuest("sequencing", quest, state);
      recordSkillOutcomes("sequencing", quest, state, result);
      const answered = questAnsweredAny("sequencing", state);
      const correct = isQuestComplete("sequencing", result);
      overallTotal += 1;
      if (answered) overallComplete += 1;
      const status = !answered ? "unanswered" : correct ? "correct" : "incorrect";
      const feedback = answered
        ? `<p class="activity-feedback ${correct ? "success" : "error"}" role="status" aria-live="polite">${
            correct ? "Correct order." : "Not quite the strongest order yet."
          } ${esc(quest.explanation || "")}</p>`
        : `<p class="activity-feedback" role="status" aria-live="polite">Drag the entries into order (or use the ↑/↓ buttons), then check your sequence.</p>`;
      return `<div class="quest-practice-item" data-quest-status="${status}">${renderQuest("sequencing", quest, state)}${feedback}</div>`;
    })
    .join("");

  const evidenceCards = questSet.evidenceOrganizing
    .map((quest) => resolveQuestSlot("evidence-organizing", quest))
    .map((quest) => {
      const state = progress.questResponses[quest.id] || {};
      const result = gradeQuest("evidence-organizing", quest, state);
      recordSkillOutcomes("evidence-organizing", quest, state, result);
      const answered = questAnsweredAny("evidence-organizing", state);
      const complete = isQuestComplete("evidence-organizing", result);
      overallTotal += 1;
      if (complete) overallComplete += 1;
      const status = complete ? "correct" : answered ? "in-progress" : "unanswered";
      const feedback = result.allPlacedCorrectly
        ? `<p class="activity-feedback success" role="status" aria-live="polite">All records matched to the right skill.${
            result.reflectionOk
              ? ""
              : " Add a reflection of at least a sentence to complete this practice."
          }</p>`
        : `<p class="activity-feedback" role="status" aria-live="polite">Drag each record into the historical-thinking skill it best demonstrates (or use the "Place in" menu on each card).</p>`;
      return `<div class="quest-practice-item" data-quest-status="${status}">${renderQuest("evidence-organizing", quest, state)}${feedback}</div>`;
    })
    .join("");

  const hippCards = questSet.hipp
    .map((quest) => resolveQuestSlot("hipp", quest))
    .map((quest) => {
      const state = progress.questResponses[quest.id] || {};
      const result = gradeQuest("hipp", quest, state);
      recordSkillOutcomes("hipp", quest, state, result);
      const answeredAny = questAnsweredAny("hipp", state);
      const complete = isQuestComplete("hipp", result);
      overallTotal += 1;
      if (complete) overallComplete += 1;
      const status = !answeredAny
        ? "unanswered"
        : complete
          ? "correct"
          : result.pointsEarned > 0
            ? "partial"
            : "incorrect";
      const feedbackClass =
        status === "correct" ? "success" : status === "partial" ? "partial" : "error";
      const feedback = answeredAny
        ? `<p class="activity-feedback ${feedbackClass}" role="status" aria-live="polite">${result.pointsEarned}/${result.pointsPossible} HIPP points earned.</p>`
        : `<p class="activity-feedback" role="status" aria-live="polite">Choose the option that explains how or why this HIPP element shapes the source's argument — not just names it.</p>`;
      return `<div class="quest-practice-item" data-quest-status="${status}">${renderQuest("hipp", quest, state)}${feedback}</div>`;
    })
    .join("");

  return `${chrome()}<main class="shell activity-shell quest-practice-shell"><section class="activity-copy"><button class="back-link" data-action="field">← Back to ${esc(activeCase.shortTitle)} field</button><p class="kicker">${esc(resolvedCaseTitle(activeCase))} interaction · test features</p><h1>Sourcing Practice Check</h1><p>Practice questions grounded in ${esc(resolvedCaseTitle(activeCase))}'s own record, covering all four quest types now available in Chronicle. This is practice only — it does not affect your Preservation Case progress, and you can retry as many times as you like.</p><p class="quest-practice-summary">${overallComplete}/${overallTotal} practice items complete</p></section><section class="activity-board quest-practice-board"><h2 class="quest-section-heading">Multiple choice</h2>${mcqCards}<p class="activity-feedback">${answeredCount}/${mcqQuests.length} answered</p><h2 class="quest-section-heading">Sequencing</h2>${sequencingCards}<h2 class="quest-section-heading">Evidence organizing</h2>${evidenceCards}<h2 class="quest-section-heading">HIPP source analysis</h2>${hippCards}</section></main>`;
}

/**
 * The document itself: a masthead carrying what the record *is*, then the record.
 *
 * The masthead is read off the source, which is the whole point of this shape. Until Phase 58 each
 * branch hardcoded its own caption and footer, and `visual: "context"` covers **9 of the 13 sources**
 * — including Patrick Henry's speech to the Second Virginia Convention, Dickinson's Farmer's Letters
 * and Pontiac's council speech. All nine were captioned "Secondary context record" and footed
 * "Background evidence, not a Taíno-authored primary source", which is true of exactly one of them.
 * Every source already carries a `type` that says what it is ("Primary source · speech"), so the
 * caption is now correct by construction rather than by branch.
 *
 * `visual` keeps its real job: choosing the *presentation* — a transcript set as a blockquote, a prose
 * excerpt, or an image figure — and asserts nothing about what kind of source this is.
 *
 * Exported for tests/unit/source-visual.test.js.
 */
export function sourceVisual(source) {
  const masthead =
    `<header class="document-masthead"><span>${esc(source.type)}</span>` +
    `<dl><div><dt>Creator</dt><dd>${esc(source.creator)}</dd></div>` +
    `<div><dt>Date</dt><dd>${esc(source.date)}</dd></div>` +
    `<div><dt>Record</dt><dd>${esc(source.record)}</dd></div></dl></header>`;
  if (source.visual === "map") {
    // The figcaption is about the local copy rather than about the source, so it stays hardcoded —
    // it is a statement about this app, not a claim about the document.
    return `<figure class="document-image">${masthead}<img src="${waldseemuller}" alt="Local course copy of Martin Waldseemüller’s 1507 world map"><figcaption>Local course copy of a Library of Congress scan. Zoom is intentionally preserved in the reader; students do not need to leave Chronicle to view it.</figcaption></figure>`;
  }
  const body =
    source.visual === "letter"
      ? `<blockquote>${esc(source.excerpt)}</blockquote>`
      : `<p>${esc(source.excerpt)}</p>`;
  return `<div class="document-paper">${masthead}${body}</div>`;
}

const READINESS_LABELS = {
  ready_to_revise: "Ready to revise",
  on_track: "On track",
  needs_fresh_attempt: "Try a fresh attempt",
};

// Renders one Archive Evaluator response — reused by sourceReader(),
// reviewScreen(), and gradingScreen() so a teacher sees exactly the feedback
// the student saw.
function archiveFeedbackMarkup(feedbackPayload) {
  if (!feedbackPayload) return "";
  const items = feedbackPayload.elements
    ? feedbackPayload.elements.map(
        (el) =>
          `<article class="archive-feedback-item"><h3>${esc(el.element.replaceAll("_", " "))}</h3><p>${esc(el.mirror)}</p>${el.gap ? `<p class="archive-feedback-gap">${esc(el.gap)}</p>` : ""}</article>`
      )
    : (feedbackPayload.rows || []).map(
        (row) =>
          `<article class="archive-feedback-item"><h3>${esc(row.row.replaceAll("-", " "))} — ${esc(row.met)}</h3><p>${esc(row.mirror)}</p>${row.gap ? `<p class="archive-feedback-gap">${esc(row.gap)}</p>` : ""}</article>`
      );
  const readinessLabel = READINESS_LABELS[feedbackPayload.readiness] || feedbackPayload.readiness;
  return `<section class="archive-feedback"><h2>Archive Evaluator feedback</h2>${items.join("")}<p class="archive-feedback-forward"><b>Forward:</b> ${esc(feedbackPayload.forward)}</p><p class="archive-feedback-readiness">${esc(readinessLabel)}</p></section>`;
}

// Kicks off one POST /api/evaluate call. Fire-and-forget from the click
// handler's perspective (per the async convention this feature introduces —
// main.js has no prior async handlers): sets a pending flag, renders
// immediately to show a loading state, then renders again on
// success/failure. Stores the result at progress.submissions[taskId] — the
// exact shape api/_lib/rubrics.js's own header comment anticipates — and
// mirrors it to the backend (no-op if signed out/offline).
async function runEvaluation(taskId, requestBody) {
  evaluatorPendingTaskIds.add(taskId);
  delete evaluatorErrors[taskId];
  render();
  try {
    const { feedback, model } = await evaluateSubmission(requestBody);
    progress.submissions[taskId] = {
      taskType: requestBody.taskType,
      prompt: requestBody.prompt,
      studentResponse: requestBody.studentResponse,
      feedback: { payload: feedback, model },
      isRevision: requestBody.isRevision,
      requestedAt: Date.now(),
    };
    save();
    // Guarded the same as save() above — a teacher who submits a real
    // source reading while previewing a map mission (see previewSession's
    // own comment) must not create a real submissions/evaluations row
    // against their classroom.
    if (isPreviewingContent()) return;
    getCurrentClassroomId().then((classroomId) => {
      if (!classroomId) return;
      recordSubmission({
        classroomId,
        taskType: requestBody.taskType,
        taskId,
        prompt: requestBody.prompt,
        stimulus: requestBody.stimulus,
        sourceMetadata: requestBody.sourceMetadata,
        elementsAsked: requestBody.elementsAsked,
        studentResponse: requestBody.studentResponse,
        isRevision: requestBody.isRevision,
        feedback,
        model,
      }).catch((err) => console.error("recordSubmission failed", err));
    });
  } catch (err) {
    evaluatorErrors[taskId] = err.message || "The Archive Evaluator could not respond. Try again.";
  } finally {
    evaluatorPendingTaskIds.delete(taskId);
    render();
  }
}

function sourceReader() {
  const source = sourceById(openSourceId);
  if (!source) {
    progress.currentScreen = sourceOrigin === "codex" ? "codex" : "field";
    save();
    return `${chrome()}<main class="shell"><section class="empty-state"><p class="kicker">Codex reader reset</p><h1>Source reader restored.</h1><p>The app recovered from a reload while a source reader was open. Return to the field and open the source again.</p><button class="btn btn-gold" data-action="field">Back to field →</button></section></main>`;
  }
  const response = progress.responses[source.id] || "";
  const readerQuests = readerQuestsFor(source);
  // Answering the set is what "revealed" means on a question-based record, exactly as
  // submitting a written reading is on a prose one — both unlock Institute Context and
  // "Secure in Codex". Written at render time, which is the same convention
  // investigationScreen()'s recordSkillOutcomes() and ensureTodaysRotationQueue() already use.
  if (readerQuests.length) {
    const allCorrect = readerQuests.every((quest) => {
      const state = progress.questResponses[quest.id] || {};
      recordSkillOutcomes(
        source.readerQuestType,
        quest,
        state,
        gradeQuest(source.readerQuestType, quest, state)
      );
      return isQuestComplete(
        source.readerQuestType,
        gradeQuest(source.readerQuestType, quest, state)
      );
    });
    if (allCorrect && !progress.revealedContexts.includes(source.id)) {
      progress.revealedContexts.push(source.id);
      save();
    }
  }
  const revealed = progress.revealedContexts.includes(source.id);
  const secured = hasEvidence(activeFieldCaseId(), source.id);
  const existingSubmission = progress.submissions[source.id];
  const evaluatorSection =
    revealed && !readerQuests.length
      ? `<section class="archive-evaluator"><button class="btn btn-outline" data-action="evaluate-source" data-source="${source.id}" ${evaluatorPendingTaskIds.has(source.id) ? "disabled" : ""}>${evaluatorPendingTaskIds.has(source.id) ? "Consulting the Archive Evaluator…" : existingSubmission ? "Get feedback on my revision →" : "Get Archive Evaluator feedback →"}</button>${evaluatorErrors[source.id] ? `<p class="feedback error">${esc(evaluatorErrors[source.id])}</p>` : ""}${archiveFeedbackMarkup(existingSubmission?.feedback?.payload)}</section>`
      : "";
  // Same `.quest-practice-item[data-quest-status]` wrapper the Investigation Challenge and
  // Practice Check use, so these need no styling of their own.
  const promptSection = readerQuests.length
    ? `<section class="reader-questions quest-practice-board"><h2>Chronicler prompt</h2><p>${esc(source.prompt)}</p>${readerQuests
        .map((quest) => {
          const state = progress.questResponses[quest.id] || {};
          const result = gradeQuest(source.readerQuestType, quest, state);
          const complete = isQuestComplete(source.readerQuestType, result);
          const status = !questAnsweredAny(source.readerQuestType, state)
            ? "unanswered"
            : complete
              ? "correct"
              : "in-progress";
          return `<div class="quest-practice-item" data-quest-status="${status}">${renderQuest(source.readerQuestType, quest, state)}<p class="activity-feedback${complete ? " success" : ""}" role="status" aria-live="polite">${esc(questHint(source.readerQuestType, result))}</p></div>`;
        })
        .join("")}</section>`
    : `<section class="reader-prompt"><h2>Chronicler prompt</h2><p>${esc(source.prompt)}</p><label class="response-label">Your initial reading<textarea id="sourceResponse" placeholder="Write your evidence-based interpretation before opening Institute Context…">${esc(response)}</textarea></label><button class="btn btn-gold" data-action="submit-source" data-source="${source.id}">Submit initial reading →</button></section>`;
  const sealedNote = readerQuests.length
    ? "Answer both questions correctly first. The context note will then fill in what the record itself cannot tell you."
    : "Submit a source-based interpretation first. The context note will then help you compare your thinking with the record.";
  return `${chrome()}<main class="reader-shell"><section class="reader-art">${sourceVisual(source)}</section><section class="reader-copy"><div class="reader-nav"><button class="back-link" data-action="return-source">← Back to ${sourceOrigin === "codex" ? "Codex" : "field"}</button><button class="codex-button" data-action="codex" data-origin="source">Codex <b>${countEvidence(activeFieldCaseId())}</b></button></div><p class="kicker">${esc(source.type)}</p><h1>${esc(source.title)}</h1>${promptSection}${revealed ? `<section class="reader-context"><h2>Institute Context</h2><p>${esc(source.feedback)}</p></section>` : `<section class="context-locked"><span>✦</span><div><b>Institute Context sealed</b><p>${esc(sealedNote)}</p></div></section>`}${evaluatorSection}<p class="citation">${esc(source.citation)}</p><a class="source-link" href="${esc(source.externalUrl)}" target="_blank" rel="noreferrer">View original archive record ↗</a><button class="btn ${secured ? "btn-complete" : "btn-outline"}" data-action="secure-source" data-source="${source.id}" ${!revealed ? "disabled" : ""}>${secured ? "Filed in the Codex ✓" : "File in the Codex →"}</button></section></main>`;
}

/**
 * The Codex — three sections, and only the first of them belongs to the case you are standing in.
 *
 * Until Phase 75 this whole screen was the first section: the sources you had secured on the
 * current case, described in its own copy as "temporary records," gone the moment you left. That is
 * a satchel, and the narrative copy has always promised the Archive's memory instead. The other two
 * sections are that promise: every mission you closed with a defensible conclusion, kept
 * permanently, and the threads that run between them.
 *
 * Kept as the `codex` screen id with both existing entry points untouched — this is the same screen
 * doing more, not a new one.
 */
function codexScreen() {
  const codexCaseId = activeFieldCaseId();
  const satchel = sourcesForCase(codexCaseId)
    .map((source) => {
      const secured = hasEvidence(codexCaseId, source.id);
      // h3, not h2: the satchel is a section of this screen now rather than the whole of it, and its
      // cards sit under the section's own heading.
      return `<article class="codex-entry ${secured ? "" : "locked"}"><span>${esc(source.type)}</span><h3>${esc(source.title)}</h3><p>${secured ? esc(progress.responses[source.id] || "Evidence record secured.") : "Secure this record in the field to add it to the Codex."}</p>${secured ? `<button class="text-button" data-action="open-source" data-source="${source.id}" data-origin="codex">Open record →</button>` : ""}</article>`;
    })
    .join("");

  const entries = codexEntries(progress.codex);
  const stats = codexStats(entries);
  const tally = entries.length
    ? `<p class="codex-tally"><b>${stats.records}</b> ${stats.records === 1 ? "record" : "records"} filed · <b>${stats.units}</b> ${stats.units === 1 ? "unit" : "units"} · <b>${stats.threads}</b> ${stats.threads === 1 ? "thread" : "threads"}</p>`
    : "";

  const filed = entries.length
    ? codexByUnit(entries)
        .map(
          (group) =>
            `<section class="codex-unit"><h3>${esc(group.unitLabel || "Unfiled")}</h3>${group.entries
              .map((entry) => codexRecordMarkup(entry, entries))
              .join("")}</section>`
        )
        .join("")
    : `<p class="codex-empty">Nothing filed yet. Close a mission with a conclusion your evidence can carry, and it is preserved here for the rest of the course.</p>`;

  const threads = codexCrossReferences(entries);
  const crossRefs = threads.length
    ? `<div class="codex-threads">${threads
        .map(
          (thread) =>
            `<article class="codex-thread${thread.spansUnits ? " spans-units" : ""}"><h3>${esc(thread.tag)}</h3>${thread.spansUnits ? `<p class="codex-thread__span">Across ${new Set(thread.entries.map((entry) => entry.unitId)).size} units</p>` : ""}<ul>${thread.entries
              .map(
                (entry) =>
                  `<li><b>${esc(entry.title)}</b>${entry.caseLabel ? `<span>${esc(entry.caseLabel)}</span>` : ""}</li>`
              )
              .join("")}</ul></article>`
        )
        .join("")}</div>`
    : `<p class="codex-empty">${
        entries.length
          ? "One record cannot cross-reference itself. File a second and the Archive will start showing you where your investigations meet."
          : "The Archive cross-references your filed records against each other. There is nothing to compare yet."
      }</p>`;

  return `${chrome()}<main class="shell codex-shell"><section class="codex-head"><button class="back-link" data-action="return-codex">← Return</button><p class="kicker">Chronicle Codex</p><h1>The Codex</h1><p>What you can defend. Records you file stay here — across every case, for the whole course.</p>${tally}</section><section class="codex-section"><h2>This case</h2><p class="codex-section__note">Sources you secured in the field. Your initial reading stays attached to each one.</p><div class="codex-grid">${satchel}</div></section><section class="codex-section"><h2>Filed records</h2><p class="codex-section__note">Missions you closed with a conclusion your evidence could carry.</p>${filed}</section><section class="codex-section"><h2>Cross-references</h2><p class="codex-section__note">Where two of your filed records turn out to be about the same question.</p>${crossRefs}</section></main>`;
}

/** One filed record, as it reads in the Archive. */
function codexRecordMarkup(entry, entries) {
  const eyebrow = [entry.caseLabel, ACTIVITY_ENGINE_LABELS[entry.kind]].filter(Boolean).join(" · ");
  const evidence = entry.evidence.length
    ? `<div class="codex-record__evidence"><h4>What you kept</h4><ul>${entry.evidence
        .map(
          (finding) =>
            `<li>${esc(finding.text)}${finding.from ? `<cite>${esc(finding.from)}</cite>` : ""}</li>`
        )
        .join("")}</ul></div>`
    : "";
  const open = entry.openQuestions.length
    ? `<div class="codex-record__open"><h4>Still open</h4><ul>${entry.openQuestions
        .map((line) => `<li>${esc(line)}</li>`)
        .join("")}</ul></div>`
    : "";
  const tags = entry.tags.length
    ? `<ul class="codex-record__tags">${entry.tags.map((tag) => `<li>${esc(tag)}</li>`).join("")}</ul>`
    : "";
  // Only pointers the player can actually follow. codexSeeAlso() drops anything not yet filed, so
  // this line appears the moment both ends of a connection exist and never before.
  const related = codexSeeAlso(entry, entries);
  const seeAlso = related.length
    ? `<p class="codex-record__see-also"><b>See also</b> ${related.map((other) => esc(other.title)).join(" · ")}</p>`
    : "";
  return `<article class="codex-record">${eyebrow ? `<p class="codex-record__eyebrow">${ACTIVITY_ENGINE_ICONS[entry.kind] || ""}<span>${esc(eyebrow)}</span></p>` : ""}<h4 class="codex-record__title">${esc(entry.title)}</h4>${entry.missionQuestion ? `<p class="codex-record__question">${esc(entry.missionQuestion)}</p>` : ""}<p class="codex-record__summary">${esc(entry.summary)}</p>${entry.conclusion ? `<p class="codex-record__conclusion"><b>You filed</b> ${esc(entry.conclusion)}</p>` : ""}${evidence}${open}${tags}${seeAlso}</article>`;
}

// Aggregates progress.skillMastery (one upserted entry per graded quest
// item — see recordSkillOutcomes()) into per-category totals, in
// SKILL_CATEGORIES' own fixed order so the record screen's row order never
// shuffles as new entries are added.
function skillMasterySummary() {
  return SKILL_CATEGORIES.map((category) => {
    const entries = Object.values(progress.skillMastery).filter(
      (entry) => entry.skillCategory === category
    );
    return {
      category,
      attempted: entries.length,
      correct: entries.filter((entry) => entry.correct).length,
    };
  });
}

function masteryScreen() {
  const summary = skillMasterySummary();
  const totalAttempted = summary.reduce((sum, row) => sum + row.attempted, 0);
  const rows = summary
    .map(({ category, attempted, correct }) => {
      const pct = attempted ? Math.round((correct / attempted) * 100) : 0;
      return `<div class="mastery-row" data-mastery-category="${esc(category)}"><div class="mastery-row-head"><b>${esc(category)}</b><span>${attempted ? `${correct}/${attempted} correct` : "Not yet practiced"}</span></div><div class="mastery-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(category)} mastery"><div class="mastery-bar-fill" style="width:${pct}%"></div></div></div>`;
    })
    .join("");
  return `${chrome()}<main class="shell mastery-shell"><section class="activity-copy"><button class="back-link" data-action="home">← Return to Institute</button><p class="kicker">Institute Archive · Chronicler record</p><h1>Skill Mastery Record</h1><p>Every graded record you restore is tagged to the historical-thinking skill it exercises — Archive Challenges and Sourcing Practice Check items both count. This tracks how you're doing at each skill, not just which cases are complete.</p></section><section class="activity-board mastery-board">${totalAttempted ? rows : '<p class="bank-empty">No graded records yet. Complete an Archive Challenge or a Sourcing Practice Check to start building your skill mastery record.</p>'}</section></main>`;
}

// Phase 49C ("The Archive Rotation") item bank: every mcq/sequencing/hipp
// practice item from a unit the player has already unlocked. Deliberately
// excludes evidence-organizing (multi-part placement, no single binary
// correct/incorrect signal a Leitner box can key off of) and saq ("complete"
// means submitted, not graded — see saq-quest.js) — see PHASES-46-50.md's
// Phase 49C entry. Teacher-swapped content resolves the same way Practice
// Check's own item lists do (resolveQuestSlot), so a classroom override is
// reflected here too.
function rotationItemPool() {
  const items = [];
  Object.entries(PRACTICE_CHECK_QUESTS).forEach(([caseId, questSet]) => {
    if (!isUnlocked(caseId)) return;
    ["mcq", "sequencing", "hipp"].forEach((questType) => {
      (questSet[questType] || []).forEach((quest) => {
        const resolved = resolveQuestSlot(questType, quest);
        items.push({ key: `${questType}::${resolved.id}`, questType, quest: resolved });
      });
    });
  });
  return items;
}

// Regenerates progress.archiveRotation.queue once per UTC day from whatever
// is currently due (or, failing that, unseen) in the pool — idempotent
// within the same day, mirroring the render-time-side-effect convention
// recordSkillOutcomes()/sourceReader() already use elsewhere in this file.
function ensureTodaysRotationQueue() {
  const pool = rotationItemPool();
  const today = rotationDateString(Date.now());
  if (progress.archiveRotation.queueDate !== today) {
    progress.archiveRotation.queue = selectDailyRotationQueue(
      pool.map((item) => item.key),
      progress.archiveRotation.itemStates,
      Date.now(),
      DEFAULT_DAILY_ROTATION_TARGET
    );
    progress.archiveRotation.queueDate = today;
    progress.archiveRotation.position = 0;
    save();
  }
  return pool;
}

function archiveRotationScreen() {
  const pool = ensureTodaysRotationQueue();
  const rotation = progress.archiveRotation;
  const total = rotation.queue.length;
  const streakLine =
    rotation.streakDays > 0
      ? `<p class="quest-practice-summary">Current streak: ${rotation.streakDays} day${rotation.streakDays === 1 ? "" : "s"}</p>`
      : "";
  const header = `<button class="back-link" data-action="home">← Return to Institute</button><p class="kicker">Institute Archive · Chronicler record</p><h1>The Archive Rotation</h1>`;

  if (!total) {
    return `${chrome()}<main class="shell mastery-shell"><section class="activity-copy">${header}<p>A short daily review pulled from records you've already secured. Explore a field mission's Sourcing Practice Check first to build up today's rotation.</p></section><section class="activity-board mastery-board"><p class="bank-empty">Nothing to review yet.</p></section></main>`;
  }
  if (rotation.position >= total) {
    return `${chrome()}<main class="shell mastery-shell"><section class="activity-copy">${header}<p>Today's rotation is complete — come back tomorrow for a new set.</p>${streakLine}</section><section class="activity-board mastery-board"><p class="bank-empty">${total}/${total} reviewed today.</p></section></main>`;
  }

  const key = rotation.queue[rotation.position];
  const item = pool.find((entry) => entry.key === key);
  if (!item) {
    // A previously-scheduled item can disappear from the pool (content edit,
    // teacher swap, or a case getting re-locked) between when it was queued
    // and today — skip it rather than render a broken card.
    rotation.position += 1;
    save();
    return archiveRotationScreen();
  }
  const state = progress.questResponses[item.quest.id] || {};
  const result = gradeQuest(item.questType, item.quest, state);
  recordSkillOutcomes(item.questType, item.quest, state, result);
  const answered = questAnsweredAny(item.questType, state);
  const correct = isQuestComplete(item.questType, result);
  const feedback = answered
    ? `<p class="activity-feedback ${correct ? "success" : "error"}" role="status" aria-live="polite">${
        correct ? "Correct." : "Not quite — review, then move on when ready."
      }</p>`
    : "";
  return `${chrome()}<main class="shell mastery-shell"><section class="activity-copy">${header}<p>A short daily review, not a graded assessment — reviewing here never affects your Preservation Case progress.</p><p class="quest-practice-summary">Item ${rotation.position + 1}/${total}</p>${streakLine}</section><section class="activity-board mastery-board"><div class="quest-practice-item">${renderQuest(item.questType, item.quest, state)}${feedback}</div><button class="btn btn-gold" type="button" data-action="rotation-next" data-rotation-quest-type="${esc(item.questType)}" data-rotation-quest-id="${esc(item.quest.id)}" ${answered ? "" : "disabled"}>${rotation.position + 1 === total ? "Finish rotation →" : "Next →"}</button></section></main>`;
}

const RECONSTRUCTION_LANES = {
  "case-001": [
    {
      id: "precontact",
      label: "Before contact",
      hint: "Established societies and conditions before European arrival.",
    },
    {
      id: "encounter",
      label: "Early encounter",
      hint: "A source created during or immediately after contact.",
    },
    {
      id: "knowledge",
      label: "Changing geographic knowledge",
      hint: "A later record showing transformed European knowledge.",
    },
  ],
  "case-004": CASE_004_LANES.map((lane) => ({
    ...lane,
    hint: {
      founding: "A record of how land and settlement rights were granted.",
      labor: "A firsthand account of the work and conditions bound labor actually involved.",
      exchange: "A record of the goods and economy the settlement's labor sustained.",
    }[lane.id],
  })),
  "case-007": CASE_007_LANES.map((lane) => ({
    ...lane,
    hint: {
      "empire-and-frontier": "A record of imperial competition or frontier conflict over land.",
      "protest-and-rhetoric": "A record of colonists organizing or arguing against British policy.",
      "revolution-and-its-promises":
        "A record of the Revolution's ideals being invoked, extended, or denied once war began.",
    }[lane.id],
  })),
  // Unit 4's lanes are arguments rather than topics, so their hints have to say what a record is
  // being read *as* — every one of the five could be filed in two of these, and choosing is the
  // interpretive work the case is asking for.
  "case-010": CASE_010_LANES.map((lane) => ({
    ...lane,
    hint: {
      "what-the-canal-gave":
        "A record of what cheap transport and a reachable market made possible.",
      "what-it-cost-to-work":
        "A record of what the new economy demanded from the people whose labour ran it.",
      "what-people-did-about-it":
        "A record of someone organizing, arguing, or profiting in response to the change.",
    }[lane.id],
  })),
  // Unit 5's lanes ask what a *document* is doing rather than what a topic is, which suits a
  // district whose evidence is almost entirely administrative — a requisition, a payroll, a price
  // board, a day book, a register and a pass are all forms designed to be filed and forgotten.
  "case-013": CASE_013_LANES.map((lane) => ({
    ...lane,
    hint: {
      "what-the-government-took":
        "A record of the Confederate state requiring labour, material or service from people who could not refuse.",
      "what-the-market-did":
        "A record of what wartime scarcity and a failing currency did to prices, wages and trade.",
      "who-the-record-counted":
        "A record that defines a person by what a bureaucracy wrote down — and raises the question of who is missing from it.",
    }[lane.id],
  })),
};
function reconstructionScreen() {
  const caseId = activeFieldCaseId();
  const activeCase = caseById(caseId);
  const lanes = RECONSTRUCTION_LANES[caseId] || RECONSTRUCTION_LANES["case-001"];
  const sources = sourcesForCase(caseId);
  const selections = progress.reconstruction;
  return `${chrome()}<main class="shell puzzle-shell"><section class="puzzle-copy"><button class="back-link" data-action="field">← Return to field</button><p class="kicker">${esc(activeCase.shortTitle)} · Signature activity</p><h1>Record Reconstruction</h1><p>Place each record where it most directly belongs. The purpose is not to create one tidy narrative—it is to distinguish the different kinds of evidence.</p><div class="puzzle-lanes">${lanes.map((lane) => `<div><b>${esc(lane.label)}</b><span>${esc(lane.hint)}</span></div>`).join("")}</div></section><section class="reconstruction-board">${sources.map((source) => `<article><span>${esc(source.type)}</span><h2>${esc(source.title)}</h2><p>${esc(source.excerpt)}</p><label>Place record<select data-reconstruction="${source.id}"><option value="">Choose a lane</option>${lanes.map((lane) => `<option value="${lane.id}" ${selections[source.id] === lane.id ? "selected" : ""}>${esc(lane.label)}</option>`).join("")}</select></label></article>`).join("")}<button class="btn btn-gold board-submit" data-action="check-reconstruction">Test reconstruction →</button><p id="reconstructionFeedback" class="feedback"></p></section></main>`;
}

function ensureActivityState(caseId, defaults) {
  progress.activityState[caseId] ??= structuredClone(defaults);
  Object.keys(defaults).forEach((key) => {
    if (!(key in progress.activityState[caseId]))
      progress.activityState[caseId][key] = structuredClone(defaults[key]);
  });
  return progress.activityState[caseId];
}

function uploadScreen() {
  const active = caseById(progress.pendingUploadCaseId || progress.activeCaseId || "case-001");
  return `${chrome()}<main class="upload-shell"><section class="upload-core"><p class="kicker">Archive connection secure</p><h1>Field record transmitting.</h1><p>Your Codex is relaying the completed ${esc(active.shortTitle)} record to the Chronicle Institute. The Archive will preserve your evidence, notes, and completed investigation before the next route opens.</p><div class="upload-beam"><div class="upload-codex">✦</div><i></i><i></i><i></i><div class="upload-archive">⌁</div></div><div class="upload-status"><span>Codex encrypted</span><span>Evidence verified</span><span>Record archived</span></div><button class="btn btn-gold" data-action="return-archive">Case archived — Return to Institute →</button></section></main>`;
}

function returnWarpScreen() {
  return `${chrome()}<main class="return-warp-shell"><section class="return-warp-vortex" aria-label="Returning to the Chronicle Institute"><div class="return-warp-tunnel"><i></i><i></i><i></i><i></i><span>✦</span></div></section><section class="return-warp-copy"><p class="kicker">Archive recall sequence</p><h1>Returning to Institute.</h1><p>The Codex has locked the archived case record. The recall beacon is pulling your signal back to the Institute floor.</p><div class="travel-progress"><span></span></div><p class="travel-status">Temporal return in progress.</p></section></main>`;
}

const UNIT_REVIEWS = { "unit-01": REVIEW, "unit-02": UNIT_02_REVIEW };
function reviewStateFor(unitId) {
  // Unit 1's review answers stay in their legacy home so existing saves keep working.
  if (unitId === "unit-01") return progress.review;
  return ensureActivityState(`review-${unitId}`, { answers: {}, saq: {} });
}
function reviewScreen() {
  const unit = unitById(progress.selectedUnitId) || UNIT_01;
  const review = UNIT_REVIEWS[unit.id] || REVIEW;
  const state = reviewStateFor(unit.id);
  const answers = state.answers || {};
  const saq = state.saq || {};
  const saqTaskId = `saq-${unit.id}`;
  const saqComplete = review.saq.prompts.every((_, index) => (saq[index] || "").trim().length > 0);
  const existingSaqSubmission = progress.submissions[saqTaskId];
  const saqEvaluatorSection = saqComplete
    ? `<section class="archive-evaluator"><button class="btn btn-outline" data-action="evaluate-saq" ${evaluatorPendingTaskIds.has(saqTaskId) ? "disabled" : ""}>${evaluatorPendingTaskIds.has(saqTaskId) ? "Consulting the Archive Evaluator…" : existingSaqSubmission ? "Get feedback on my revision →" : "Get Archive Evaluator feedback →"}</button>${evaluatorErrors[saqTaskId] ? `<p class="feedback error">${esc(evaluatorErrors[saqTaskId])}</p>` : ""}${archiveFeedbackMarkup(existingSaqSubmission?.feedback?.payload)}</section>`
    : "";
  return `${chrome()}<main class="shell review-shell"><section class="review-copy"><button class="back-link" data-action="archive">← Archive map</button><p class="kicker">${esc(unit.period)} Archive Review</p><h1>${esc(resolvedUnitTitle(unit))}</h1><p>Practice with AP-style historical thinking: source analysis, causation, and evidence-based explanation.</p><div class="rubric-note"><b>Structured SAQ practice · ${review.saq.prompts.length} points total</b><p>${esc(review.saq.rubric)}</p></div></section><section class="review-work"><div class="mcq-block"><h2>Multiple-choice checkpoint</h2>${review.mcq.map((q, qi) => `<article><p><b>${qi + 1}.</b> ${esc(q.prompt)}</p>${q.choices.map((choice, ci) => `<label class="choice"><input type="radio" name="mcq-${qi}" data-mcq="${qi}" value="${ci}" ${String(answers[qi]) === String(ci) ? "checked" : ""}><span class="choice-badge" aria-hidden="true">${String.fromCharCode(65 + ci)}</span><span class="choice-text">${esc(choice)}</span></label>`).join("")}</article>`).join("")}</div><div class="saq-block"><h2>Short Answer Question</h2><blockquote>${esc(review.saq.stimulus)}</blockquote>${review.saq.prompts.map((prompt, index) => `<label>${esc(prompt)}<textarea data-saq="${index}" placeholder="Write an evidence-based response…">${esc(saq[index] || "")}</textarea></label>`).join("")}${saqEvaluatorSection}</div><button class="btn btn-gold" data-action="submit-review">Submit Archive Review →</button><p class="feedback" id="reviewFeedback"></p></section></main>`;
}

function completionScreen() {
  const unit = unitById(progress.selectedUnitId) || UNIT_01;
  const review = UNIT_REVIEWS[unit.id] || REVIEW;
  const state = reviewStateFor(unit.id);
  const correct = review.mcq.filter(
    (q, index) => Number((state.answers || {})[index]) === q.answer
  ).length;
  const saqCount = Object.values(state.saq || {}).filter((v) => String(v).trim().length > 0).length;
  const casesDone = unit.cases.filter((c) => progress.completedCases.includes(c.id)).length;
  return `${chrome()}<main class="shell completion-shell"><section><p class="kicker">Unit record complete</p><h1>${esc(resolvedUnitTitle(unit))} archived.</h1><p>Your Codex now preserves this investigation. The Institute has logged your sources, practice responses, and completed case records.</p><div class="completion-stats"><span>Cases archived: ${casesDone}/${unit.cases.length}</span><span>MCQ checkpoint: ${correct}/${review.mcq.length}</span><span>SAQ responses drafted: ${saqCount}/${review.saq.prompts.length}</span></div><div class="completion-actions"><button class="btn btn-gold" data-action="home">Return to Institute →</button><button class="btn btn-outline" data-action="review">Review unit work</button></div></section></main>`;
}

function render() {
  if (showMainMenu) {
    app.innerHTML = mainMenuScreen();
    return;
  }
  clearTimeout(activeTravelTimeout);
  clearTimeout(introTypewriterTimer);
  introTypewriterTimer = null;
  // Leaving the Entrance Hall mid-scene (refresh, reset, a stray render() call) must not leave an
  // orphaned escort loop or flicker timeout running against DOM nodes this render is about to
  // replace. Re-entering the room is what starts it again, from the top.
  if (progress.currentHubRoom !== "hallway") stopHallwayScene();
  let html;
  try {
    // Any registered activity engine renders through the one host screen, and the screen id *is*
    // the engine key. Resolved into a sentinel ahead of the switch because a `case` label can't be
    // computed — this way adding a fifth engine needs no edit here at all.
    const activityEngine = isActivityEngine(progress.currentScreen) ? progress.currentScreen : null;
    switch (activityEngine ? "activity" : progress.currentScreen) {
      case "activity":
        html = activityScreen(activityEngine);
        break;
      case "intro-welcome":
        html = introWelcomeScreen();
        break;
      case "intro-briefing":
        html = introBriefingScreen();
        break;
      case "intro-protocol":
        html = introProtocolScreen();
        break;
      case "identity":
        html = identityScreen();
        break;
      case "intro-registration":
        html = introRegistrationScreen();
        break;
      case "archive":
        html = archiveScreen();
        break;
      case "mini-games":
        html = miniGamesScreen();
        break;
      case "travel":
        html = travelScreen();
        activeTravelTimeout = setTimeout(() => {
          const c = caseById(progress.activeCaseId);
          progress.currentScreen = c?.route || "archive";
          save();
          render();
        }, 2500);
        break;
      case "field":
        html = fieldScreen();
        break;
      case "practice-check":
        if (!progress.settings.miniGamesEnabled || !PRACTICE_CHECK_QUESTS[activeFieldCaseId()]) {
          progress.currentScreen = "field";
          save();
          render();
          return;
        }
        html = practiceCheckScreen();
        break;
      case "source":
        html = sourceReader();
        break;
      case "codex":
        html = codexScreen();
        break;
      case "mastery":
        html = masteryScreen();
        break;
      case "archive-rotation":
        html = archiveRotationScreen();
        break;
      case "reconstruction":
        html = reconstructionScreen();
        break;
      case "archive-challenges":
        html = archiveChallengesScreen();
        break;
      case "mission":
        html = missionScreen();
        break;
      case "investigation":
        html = investigationScreen();
        break;
      case "upload":
        html = uploadScreen();
        break;
      case "return-warp":
        html = returnWarpScreen();
        activeTravelTimeout = setTimeout(() => {
          progress.currentScreen = "institute";
          save();
          render();
        }, 2500);
        break;
      case "review":
        html = reviewScreen();
        break;
      case "completion":
        html = completionScreen();
        break;
      case "join":
        html = joinScreen();
        break;
      case "login":
        html = loginScreen();
        break;
      case "teacher-dashboard":
        html = teacherDashboardScreen();
        break;
      case "grading":
        html = gradingScreen();
        break;
      case "manage-content-case":
        html = manageContentCaseScreen();
        break;
      default:
        html = instituteScreen();
    }
  } catch (error) {
    console.error("Chronicle render recovery", error);
    progress.currentScreen = "institute";
    progress.activeCaseId = null;
    progress.hubNotice =
      "The Archive display recovered from a render issue. Use Reset Unit 1 demo if you want to retest the full flow.";
    save();
    html = `${chrome()}<main class="shell"><section class="empty-state"><p class="kicker">Chronicle recovery</p><h1>Archive display restored.</h1><p>The screen recovered instead of staying blank. Return to the Institute and continue testing.</p><button class="btn btn-gold" data-action="home">Return to Institute →</button><button class="btn btn-outline" data-action="reset-case-001">Reset Case 1.01 demo</button></section></main>${authorPanel()}`;
  }
  app.innerHTML = html;
  syncManageContentNativeDialogs();
  if (currentIntroLines()) window.requestAnimationFrame(startIntroTypewriter);
  if (progress.currentScreen === "field")
    window.requestAnimationFrame(() => {
      updateFieldPlayer();
      updateFieldNpcs();
      placeFieldDialogueBubble();
      // Keyed off the active *surface* id, so an interior paints its own canvases rather than the
      // outdoor map's. This is still the one genuinely hard-coded per-map switch in the field
      // runtime — a new map or room adds a line here.
      if (activeFieldMap().id === "unit-02") renderRiverbendTiledMap();
      if (activeFieldMap().id === "unit-01") renderCaribbeanTiledMap();
      if (activeFieldMap().id === "unit-03") renderCommonCauseTiledMap();
      if (activeFieldMap().id === "unit-04") renderCanalCrossroadsTiledMap();
      if (activeFieldMap().id === "unit-05") renderRichmondTiledMap();
      if (activeFieldMap().id === "canal-print-shop") renderCanalPrintShopTiledMap();
      if (activeFieldMap().id === "canal-boarding-house") renderCanalBoardingHouseTiledMap();
      if (activeFieldMap().id === "richmond-counting-room") renderRichmondCountingRoomTiledMap();
      if (activeFieldMap().id === "richmond-hospital-ward") renderRichmondHospitalWardTiledMap();
    });
  if (progress.currentScreen === "institute") {
    window.requestAnimationFrame(() => {
      updateInstitutePlayer();
      updateInstituteNpcs();
      if (progress.currentHubRoom === "archive") renderArchiveRoomTiledMap();
      else if (progress.currentHubRoom === "hallway") renderHallwayTiledMap();
      else renderInstituteHallTiledMap();
    });
    // The Main Hall's first render right after the Entrance Hall's doorway flicker includes the fade
    // div at full opacity for one frame (see instituteMainRoomScreen()); dropping .is-active a frame
    // later lets its CSS transition read as a fade-in rather than a hard cut.
    if (enterMainHallFromBlack) {
      enterMainHallFromBlack = false;
      window.requestAnimationFrame(() => {
        document.getElementById("sceneFade")?.classList.remove("is-active");
      });
    }
  }
  if (progress.currentScreen === "mini-games") {
    window.requestAnimationFrame(startMiniGameLoop);
  } else {
    stopMiniGameLoop();
  }
  if (["intro-welcome", "intro-briefing", "intro-protocol"].includes(progress.currentScreen)) {
    window.requestAnimationFrame(startDirectorSceneDecor);
  } else {
    stopDirectorSceneDecor();
  }
  updateMusicForScreen(sceneForMusic());
}

export function unlockNext(caseId) {
  const unit = unitForCase(caseId) || UNIT_01;
  const index = unit.cases.findIndex((c) => c.id === caseId);
  if (!progress.completedCases.includes(caseId)) progress.completedCases.push(caseId);
  const next = unit.cases[index + 1];
  if (next && !progress.unlocked.includes(next.id)) progress.unlocked.push(next.id);
  save();
}

// Explains why a locked case's Chronotravel button is disabled, in the route
// panel — mirrors unlockNext()'s own array-index logic rather than
// introducing a second notion of "what unlocks what" (Phase 48B). A case at
// index 0 of its unit can only be locked because the unit itself isn't open
// yet (see hydrateClassroomUnitFloor()); any later case is locked because its
// immediate predecessor isn't complete.
function lockedReasonForCase(kase) {
  const unit = unitForCase(kase.id);
  const index = unit ? unit.cases.findIndex((c) => c.id === kase.id) : -1;
  const prior = index > 0 ? unit.cases[index - 1] : null;
  return prior
    ? `Complete ${resolvedCaseName(prior)} to unlock this mission.`
    : "Your teacher hasn't opened this unit yet.";
}

function unlockNextUnit(unitId) {
  const index = UNITS.findIndex((unit) => unit.id === unitId);
  const nextUnit = UNITS[index + 1];
  const firstCase = nextUnit?.cases[0];
  if (firstCase && !progress.unlocked.includes(firstCase.id)) progress.unlocked.push(firstCase.id);
}

// Teacher Mode's "advance to next unit" is an early-access floor, never a
// ceiling: it additively unions every enabled unit's first case into
// progress.unlocked, exactly like unlockNextUnit() already does for a
// student who finishes a unit review — so a student who's unlocked further
// via normal play is never demoted by a classroom's floor being behind them.
function hydrateClassroomUnitFloor(enabledUnitIndex) {
  let changed = false;
  for (let i = 0; i <= enabledUnitIndex && i < UNITS.length; i += 1) {
    const firstCase = UNITS[i].cases[0];
    if (firstCase && !progress.unlocked.includes(firstCase.id)) {
      progress.unlocked.push(firstCase.id);
      changed = true;
    }
  }
  if (changed) save();
}

// Pulls the signed-in student's classroom-scoped Teacher Mode state
// (published source/quest selections + the unit-access floor) once per
// sign-in/boot, mirroring hydrateRemoteProgress's call pattern. A no-op for
// signed-out play or a student not in any classroom.
function hydrateTeacherModeForStudent() {
  getCurrentClassroomId().then((classroomId) => {
    if (!classroomId) return;
    Promise.all([
      loadSelectionsForResolution(classroomId, "published"),
      getClassroomUnitFloor(classroomId),
    ])
      .then(([, enabledUnitIndex]) => {
        hydrateClassroomUnitFloor(enabledUnitIndex);
        render();
      })
      .catch((err) => {
        // Non-fatal: matches hydrateRemoteProgress's own swallow-and-continue behavior.
        // Lets a signed-in session keep working normally before
        // supabase/migrations/0006_teacher_mode.sql has been applied to the
        // live project (its tables don't exist yet), instead of surfacing an
        // unhandled rejection to every student's console.
        console.error("hydrateTeacherModeForStudent failed", err);
      });
  });
}

/**
 * Re-seed `fieldMovement`, which is runtime-only and so has to be rebuilt on every boot.
 *
 * `keepRoom` is the boot guard's, and only the boot guard's. Arriving at a case — by Chronotravel,
 * by recall, by a reset, by a new game — always lands the player outdoors, so clearing the room is
 * the default; leaving a stale one set would spawn them at an outdoor coordinate inside a 20x14
 * room. A reload is the opposite case: the player was standing in a room a moment ago and expects
 * to still be in it, exactly as `currentHubRoom` already survives a reload for the Institute's
 * three rooms. Hence one flag rather than two functions — the position and the room have to be
 * decided together or they disagree.
 */
function resetFieldPosition({ keepRoom = false } = {}) {
  if (!keepRoom) {
    progress.currentFieldRoom = null;
    progress.fieldReturn = null;
  }
  const surface = activeFieldMap();
  const spawn = surface.entry || surface.spawn;
  fieldMovement = {
    x: spawn.x,
    y: spawn.y,
    facing: "down",
    moving: false,
    step: false,
    queued: null,
  };
}
// The field-side twin of the Archive Room boot guard further up this file, and the bug was live until
// Phase 56. `fieldMovement`'s module-level default is Unit 1's spawn (28,22) — the only map whose
// spawn that is — and resetFieldPosition() runs on Chronotravel, on recall and on case reset, but not
// on boot. So a student who reloaded the page mid-investigation in Unit 2 or Unit 3 resumed at
// Unit 1's coordinates on a different map, where nothing guarantees that cell is even walkable.
//
// It has to run *here* rather than beside the Archive Room guard: activeFieldMap() reaches
// unitForCase(), which is a `const` arrow declared several hundred lines below that point, so calling
// it up there is a temporal-dead-zone ReferenceError that takes the whole app down on boot.
if (progress.currentScreen === "field" && progress.activeCaseId) {
  // keepRoom: a reload is the one path that resumes an interior rather than arriving at a map. The
  // saved room is preserved and the player re-seeded at that room's own entry, so reloading inside a
  // building puts them back inside it — matching what currentHubRoom already does for the Institute.
  resetFieldPosition({ keepRoom: true });
  // Same reasoning as goToCase()'s: this guard puts the player back at the surface's entry point, so
  // whatever the notice was answering happened somewhere they are no longer standing.
  progress.fieldNotice = "";
}

function resetCaseOneDemo() {
  const profile = progress.profile;
  progress = resetProgress();
  progress.profile = profile;
  progress.currentScreen = "field";
  progress.activeCaseId = "case-001";
  progress.selectedCaseId = "case-001";
  progress.fieldNotice =
    "Case 1.01 reset. Start near the village, collect observations, then follow the evidence toward the Spanish camp and map fragments.";
  progress.sourceActivities = {};
  progress.caseEvidence = { "case-001": [] };
  progress.responses = {};
  progress.revealedContexts = [];
  progress.reconstruction = {};
  progress.completedCases = [];
  progress.unlocked = ["case-001"];
  resetFieldPosition();
  save();
}

function goToCase(caseId) {
  playSfx("chrono");
  progress.activeCaseId = caseId;
  progress.selectedUnitId = unitForCase(caseId)?.id || progress.selectedUnitId;
  if (caseById(caseId)?.route === "field") {
    resetFieldPosition();
    // The notice answers something the player just did, so it must not outlive the visit that
    // produced it — it is saved with the rest of progress, and arriving to a stale "Move closer to
    // interact with the burgess." would be the only thing the line ever said.
    progress.fieldNotice = "";
  }
  progress.currentScreen = "travel";
  save();
  render();
}

function showFeedback(id, message, type = "success") {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message;
    el.className = `feedback ${type}`;
  }
}

// Quest response state mutators — shared by the drag/drop handlers and their
// keyboard-operable equivalents (moved out of the audio block, where they'd been
// wedged by mistake; not audio logic).
function applySequenceOrder(questId, order) {
  progress.questResponses[questId] = { ...progress.questResponses[questId], order };
  playQuestSfx(questId);
  save();
  render();
}

// Resolves a sequencing quest's `items` by id across every place a
// sequencing quest can live: Practice Check's per-case content (the only
// source this used to check, before Archive/Investigation Challenges also
// started reusing the sequencing quest type — case-003's Archive Challenge
// and waldseemuller-map's Investigation Challenge are the first two quests
// that need this fallback), plus ARCHIVE_CHALLENGE_QUESTS_BY_TYPE and
// INVESTIGATION_QUESTS_BY_TYPE's "sequencing" buckets.
function sequencingQuestItemsFor(questId) {
  const practiceQuest = Object.values(PRACTICE_CHECK_QUESTS)
    .flatMap((set) => set.sequencing || [])
    .find((quest) => quest.id === questId);
  return (
    practiceQuest?.items ||
    archiveChallengeQuestFor("sequencing", questId)?.quest?.items ||
    investigationQuestFor("sequencing", questId)?.items ||
    []
  );
}
function applySequenceMove(questId, itemId, direction) {
  const list = sequencingQuestItemsFor(questId);
  const currentOrder =
    progress.questResponses[questId]?.order &&
    progress.questResponses[questId].order.length === list.length
      ? progress.questResponses[questId].order
      : list.map((item) => item.id);
  const index = currentOrder.indexOf(itemId);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || targetIndex < 0 || targetIndex >= currentOrder.length) return;
  const reordered = [...currentOrder];
  [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
  applySequenceOrder(questId, reordered);
}

function applyEvidencePlacement(questId, sourceId, slotId) {
  // Slots accept many sources (renderEvidenceOrganizingQuest groups every source
  // whose placement matches a given slot id, not just one) — only this source's own
  // placement changes here. An eviction loop that cleared any other occupant of
  // slotId used to live here; it silently broke every quest with more sources than
  // slots (a 2-sources-per-region case like case-006's Archive Challenge), since it
  // was never exercised by case-004's coincidentally 1:1 source-to-slot content.
  const state = progress.questResponses[questId] || {};
  const placements = { ...(state.placements || {}) };
  if (slotId) {
    placements[sourceId] = slotId;
  } else {
    delete placements[sourceId];
  }
  progress.questResponses[questId] = { ...state, placements };
  playQuestSfx(questId);
  save();
  render();
}

// Event listeners and the initial render() are gated on `app` existing so importing
// this module for unit tests (no #app element in the test DOM) does not boot the game.
function handleAppMousedown(event) {
  if (
    progress.currentScreen === "field" &&
    event.target.closest(".field-npc,.source-signal--world,.recall-beacon,.recall-cove")
  )
    event.preventDefault();
}

// handleAppClick's ~50 actions are grouped by screen/feature area into named handler
// functions (each returns true iff it matched and handled the action) so the top-level
// dispatcher stays a thin loop. Every `action` string is checked in exactly one group
// below (verified: no action string appears in more than one group), so this grouping is
// pure code motion — the only behavior-preserving addition is an explicit `return true;`
// on the handful of branches that used to fall through to the end of one giant function
// (harmless there since no later branch could ever also match the same action string).
function handleChromeClick(target, action) {
  if (action === "toggle-audio") {
    toggleAudio(sceneForMusic());
    render();
    return true;
  }
  if (action === "open-main-menu") {
    // Same escape-hatch guard "home"/"archive-room" below already use —
    // without it, a teacher opening the menu mid-preview would see the
    // "Previewing as student" banner vanish (mainMenuScreen() doesn't render
    // chrome() at all) while previewSession stayed active underneath.
    if (exitPreviewIfActive()) return true;
    showMainMenu = true;
    landingMode = "root";
    render();
    return true;
  }
  if (action === "home") {
    // Safety net: a teacher previewing a map mission can also leave via the
    // field screen's own "Recall to Institute" control, not just the
    // preview banner's "Exit preview" — either must cleanly end the
    // ephemeral preview session (see previewSession's own comment) rather
    // than stranding it active on the real institute screen.
    if (exitPreviewIfActive()) return true;
    progress.activeFieldNpc = null;
    safeInstituteSpawn();
    progress.currentScreen = "institute";
    save();
    render();
    return true;
  }
  if (action === "archive-room") {
    if (exitPreviewIfActive()) return true;
    // Unlike "home", deliberately does not touch currentHubRoom/spawn position —
    // this only returns from the archive-challenges screen back into whichever
    // room the player was already standing in (always "archive" in practice,
    // since the Terminal is the only entry point into this screen).
    progress.currentScreen = "institute";
    hubDialogueId = null;
    save();
    render();
    return true;
  }
  if (action === "close-author-panel") {
    authorPanelOpen = false;
    render();
    return true;
  }
  if (action === "reset-author-overrides") {
    clearTeacherOverrides(UNIT_01.id);
    render();
    return true;
  }
  if (action === "author") {
    if (!authorMode) {
      authorMode = true;
      authorPanelOpen = true;
    } else if (!authorPanelOpen) {
      authorPanelOpen = true;
    } else {
      authorMode = false;
      authorPanelOpen = false;
    }
    render();
    return true;
  }
  return false;
}

function handleLandingClick(target, action) {
  if (action === "landing-student") {
    landingMode = "student";
    render();
    return true;
  }
  if (action === "landing-back") {
    landingMode = "root";
    render();
    return true;
  }
  return false;
}

function handleOnboardingClick(target, action) {
  if (action === "start-new-game") {
    progress = resetProgress();
    resetFieldPosition();
    progress.currentScreen = "intro-welcome";
    briefingStep = 0;
    introLineIndex = 0;
    introSeenSteps.clear();
    save();
    showMainMenu = false;
    render();
    return true;
  }
  if (action === "continue-game") {
    if (!hasSavedProgress()) return true;
    showMainMenu = false;
    render();
    return true;
  }
  if (action === "intro-advance") {
    if (advanceIntroDialogue()) return true;
    const next = target.dataset.next;
    if (next === "intro-briefing") briefingStep = 0;
    if (next === "institute") safeInstituteSpawn();
    introLineIndex = 0;
    // The Entrance Hall is a hub room rather than a screen, so it is the one destination here that
    // needs a room set as well as a screen — enterHallwayRoom() does both, plus the spawn.
    if (next === "hallway") enterHallwayRoom();
    else progress.currentScreen = next;
    save();
    render();
    return true;
  }
  if (action === "hallway-dialogue-click") {
    // Mirrors the keydown path in handleWindowKeydown(): skip the typing if mid-line, advance to the
    // next beat, and once the last one is fully revealed, set off.
    if (!advanceIntroDialogue()) startHallwayEscort();
    return true;
  }
  if (action === "briefing-next") {
    if (advanceIntroDialogue()) return true;
    const entries = CHRONICLE_OPENING_DEFAULTS.directorBriefing.entries;
    introLineIndex = 0;
    if (briefingStep < entries.length - 1) {
      briefingStep += 1;
      render();
    } else {
      progress.currentScreen = "intro-protocol";
      save();
      render();
    }
    return true;
  }
  if (action === "briefing-back") {
    introLineIndex = 0;
    if (briefingStep > 0) {
      briefingStep -= 1;
      render();
    } else {
      progress.currentScreen = "intro-welcome";
      save();
      render();
    }
    return true;
  }
  if (action === "director-dialogue-click") {
    if (advanceIntroDialogue()) return true;
    // Current step's last line is already fully revealed — clicking the dialogue box should do
    // exactly what the Continue button does, so delegate to it rather than duplicating each
    // screen's transition logic here.
    const continueButton = document.querySelector(".director-continue-button");
    if (continueButton) return handleOnboardingClick(continueButton, continueButton.dataset.action);
    return true;
  }
  if (action === "set-appearance") {
    progress.profile.appearance = target.dataset.value === "b" ? "b" : "a";
    save();
    render();
    return true;
  }
  if (action === "confirm-identity") {
    if (!(progress.profile.name || "").trim()) {
      showFeedback(
        "identityFeedback",
        "Enter the name the Archive should use before confirming your identity.",
        "error"
      );
      return true;
    }
    progress.currentScreen = "intro-registration";
    save();
    render();
    return true;
  }
  return false;
}

function handleHubClick(target, action) {
  if (action === "tutorial-tour-next") {
    const idx = TUTORIAL_TOUR_STEPS.indexOf(currentTourStepId());
    if (idx > -1 && idx < TUTORIAL_TOUR_STEPS.length - 1) {
      progress.tutorial.step = `tour-${TUTORIAL_TOUR_STEPS[idx + 1]}`;
    } else {
      progress.tutorial = { step: "complete", completed: true, skipped: false };
      save();
      // Scene A hands straight off the tour's last beat. THE-FIELD-LIAISON.md §4 puts Voss's debut
      // strictly after the Director has finished — introducing them earlier flattens the contrast
      // the character exists to create. startHubScene() renders, so this returns rather than
      // falling through to a second render of the same frame.
      if (!progress.story.flags.metLiaison && startHubScene("liaison-intro")) return true;
    }
    save();
    render();
    return true;
  }
  if (action === "hub-scene-click") {
    advanceHubScene();
    return true;
  }
  if (action === "hub-scene-skip") {
    skipHubScene();
    return true;
  }
  if (action === "hub-open-table") {
    playSfx("secure");
    progress.hubNotice = "Navigation Table opened. Select a teacher-unlocked route.";
    progress.currentScreen = "archive";
    save();
    render();
    return true;
  }
  if (action === "hub-interact") {
    interactWithHubTarget(target.dataset.target);
    return true;
  }
  if (action === "hub-dialogue-close") {
    hubDialogueId = null;
    render();
    return true;
  }
  if (action === "archive") {
    progress.currentScreen = "archive";
    save();
    render();
    return true;
  }
  if (action === "mini-games") {
    activeMiniGame = null;
    progress.currentScreen = "mini-games";
    save();
    render();
    return true;
  }
  if (action === "mini-game-open") {
    activeMiniGame = target.dataset.miniGame;
    render();
    return true;
  }
  if (action === "mini-game-back") {
    activeMiniGame = null;
    stormNavigationState = null;
    cargoSortingState = null;
    stormHeldKeys.clear();
    render();
    return true;
  }
  if (action === "reset-case-001") {
    resetCaseOneDemo();
    render();
    return true;
  }
  if (action === "reset") {
    progress = resetProgress();
    resetFieldPosition();
    render();
    return true;
  }
  if (action === "select-case") {
    progress.selectedCaseId = target.dataset.case;
    save();
    render();
    return true;
  }
  if (action === "select-unit") {
    const unit = unitById(target.dataset.unit);
    if (!unit) return true;
    progress.selectedUnitId = unit.id;
    if (unitForCase(progress.selectedCaseId)?.id !== unit.id)
      progress.selectedCaseId = unit.cases[0].id;
    save();
    render();
    return true;
  }
  if (action === "travel") {
    goToCase(target.dataset.case);
    return true;
  }
  if (action === "skip-travel") {
    const c = caseById(progress.activeCaseId);
    progress.currentScreen = c?.route || "archive";
    save();
    render();
    return true;
  }
  return false;
}

function handleFieldClick(target, action) {
  if (action === "field-dialogue-close") {
    progress.activeFieldNpc = null;
    save();
    render();
    return true;
  }
  if (action === "field-talk") {
    const npc = activeFieldMap().npcs.find((item) => item.id === target.dataset.npc);
    if (npc) {
      if (!isNearFieldNpc(npc)) {
        fieldTooFarNotice(npc.name);
        return true;
      }
      progress.activeFieldNpc = progress.activeFieldNpc === npc.id ? null : npc.id;
      if (progress.activeFieldNpc) playSfx("dialogue");
      save();
      render();
    }
    return true;
  }
  if (action === "field-tracker-toggle") {
    // Persisted, so a student who collapses it does not have to collapse it again on every screen
    // change. Re-rendering the whole field screen is what every other field action does, and the
    // camera is a pure function of position, so nothing moves as a result.
    progress.settings = {
      ...progress.settings,
      trackerCollapsed: !progress.settings?.trackerCollapsed,
    };
    save();
    render();
    return true;
  }
  if (action === "field-enter-interior") {
    const interiorId = target.dataset.interior;
    const room = activeFieldOutdoorMap().interiors?.[interiorId];
    // Proximity-gated exactly like field-talk: a click on a doorstep across the map is a "move
    // closer" notice, never a teleport-and-enter.
    if (!room) return true;
    if (fieldDistanceTo(room.door.x, room.door.y) > 1.45) {
      fieldTooFarNotice(room.door.label);
      return true;
    }
    enterFieldInterior(interiorId);
    return true;
  }
  if (action === "field-exit-interior") {
    const room = activeFieldMap();
    if (fieldDistanceTo(room.exit.x, room.exit.y) > 1.45) {
      fieldTooFarNotice("the way out");
      return true;
    }
    exitFieldInterior();
    return true;
  }
  if (action === "field-recall") {
    progress.activeFieldNpc = null;
    progress.hubNotice = "Temporal recall complete. You rematerialized at the Navigation Table.";
    safeInstituteSpawn(...instituteRecallSpawn());
    progress.currentScreen = "institute";
    save();
    render();
    return true;
  }
  if (action === "start-source-activity") {
    // Closing the dialogue is what *succeeding* does, so it happens once every guard below has
    // passed. Nulling it up here closed the bubble on the two refusal paths as well, which is how
    // "too far" and "not yet available" both came out looking like the button had eaten the click.
    openSourceId = target.dataset.source;
    if (!isNearFieldSource(openSourceId)) {
      fieldTooFarNotice((activeFieldMap().sourcePoints[openSourceId] || {}).label || "this record");
      return true;
    }
    if (
      activeFieldCaseId() === "case-001" &&
      openSourceId !== "taino-context" &&
      !hasEvidence("case-001", "taino-context")
    ) {
      progress.fieldNotice =
        "The Spanish camp and map fragments will make more sense after the village record is stabilized.";
      save();
      render();
      return true;
    }
    progress.activeFieldNpc = null;
    sourceOrigin = "field";
    ensureSourceActivity(openSourceId);
    // Persisted alongside the module-local id so a reload inside an activity resumes in the right
    // one. openSourceId cannot do that job by itself — it dies with the page.
    progress.activeActivitySourceId = openSourceId;
    playQuestSfx(openSourceId);
    progress.currentScreen = sourceEntryScreen(openSourceId);
    save();
    render();
    return true;
  }
  if (action === "open-activity-source") {
    playQuestSfx(target.dataset.source);
    openSourceId = target.dataset.source;
    sourceOrigin = "field";
    ensureSourceActivity(openSourceId).completed = true;
    progress.activeActivitySourceId = null;
    progress.currentScreen = "source";
    save();
    render();
    return true;
  }
  // Clearing the Mission Instructions screen. A plain `data-action`, deliberately not a
  // `data-activity-action`: that attribute is matched first and dispatches into the engine's own
  // reducer, which knows nothing about a host-side gate and would refuse the verb.
  if (action === "mission-briefed") {
    const sourceId = target.dataset.source;
    if (!activityFor(sourceId)) return true;
    ensureSourceActivity(sourceId).briefed = true;
    save();
    render();
    return true;
  }
  // The other end of the same pattern: clearing the Debrief. It also carries the player onward to
  // the record itself, which is where the board's completion footer used to send them — the debrief
  // has taken that footer's place, so it has to take its exit too.
  if (action === "mission-debriefed") {
    const sourceId = target.dataset.source;
    if (!activityFor(sourceId)) return true;
    const entry = ensureSourceActivity(sourceId);
    // The one place `liaisonTrust` moves. `debriefed` already makes this a one-shot per record, so
    // re-reading a debrief cannot farm it, and the clamp keeps the tone inside the authored bands.
    if (!entry.debriefed)
      progress.story.liaisonTrust = Math.min(progress.story.liaisonTrust + 1, MAX_LIAISON_TRUST);
    entry.debriefed = true;
    // Then exactly what "open-activity-source" does. The debrief has replaced the board's
    // completion footer, so it has to carry the player the same way onward — into the record
    // itself, with the activity closed behind them.
    entry.completed = true;
    playQuestSfx(sourceId);
    openSourceId = sourceId;
    sourceOrigin = "field";
    progress.activeActivitySourceId = null;
    progress.currentScreen = "source";
    save();
    render();
    return true;
  }
  // The Mission Tracker's way back into an activity already in flight. Unlike
  // "start-source-activity" it skips sourceEntryScreen() and goes straight to the engine's
  // own screen: the Investigation Challenge gate is a gate on *opening* a record, and this
  // is a record already open.
  if (action === "open-activity-notebook") {
    const sourceId = target.dataset.source;
    const activity = activityFor(sourceId);
    if (!activity) return true;
    openSourceId = sourceId;
    sourceOrigin = "field";
    ensureSourceActivity(sourceId);
    progress.activeActivitySourceId = sourceId;
    progress.currentScreen = activity.kind;
    save();
    render();
    return true;
  }
  if (action === "field") {
    progress.currentScreen = "field";
    save();
    render();
    return true;
  }
  // "observe-village" and "columbus-choose" used to live here — the two bespoke actions of two
  // welded activity screens. Activity controls now go through handleActivityAction() on their own
  // data-activity-action attribute, so their verbs no longer have to be unique across every screen
  // in the game.
  return false;
}

function handleSourceReaderClick(target, action) {
  if (action === "investigation-continue") {
    openSourceId = target.dataset.source;
    sourceOrigin = "field";
    // Re-resolve via sourceEntryScreen() rather than hardcoding "source": a
    // source can carry both investigationMode and an activityRoute (e.g.
    // taino-context's interview, waldseemuller-map's assembly) — the
    // Investigation Challenge gates entry, it doesn't replace the activity
    // that source still has waiting behind it.
    progress.activeActivitySourceId = openSourceId;
    progress.currentScreen = sourceEntryScreen(openSourceId);
    save();
    render();
    return true;
  }
  if (action === "open-source") {
    openSourceId = target.dataset.source;
    if ((target.dataset.origin || "field") === "field" && !isNearFieldSource(openSourceId)) {
      fieldTooFarNotice((activeFieldMap().sourcePoints[openSourceId] || {}).label || "this record");
      return true;
    }
    // After the guard, for the same reason as "start-source-activity" above.
    progress.activeFieldNpc = null;
    sourceOrigin = target.dataset.origin || "field";
    progress.currentScreen = "source";
    save();
    render();
    return true;
  }
  if (action === "return-source") {
    progress.currentScreen = sourceOrigin === "codex" ? "codex" : "field";
    save();
    render();
    return true;
  }
  if (action === "codex") {
    progress.activeFieldNpc = null;
    sourceOrigin = target.dataset.origin || "field";
    progress.currentScreen = "codex";
    save();
    render();
    return true;
  }
  if (action === "return-codex") {
    progress.currentScreen =
      sourceOrigin === "source" ? "source" : sourceOrigin === "hub" ? "institute" : "field";
    save();
    render();
    return true;
  }
  if (action === "open-mastery") {
    // Reached from the Preservation Case dialog — clear its hub-dialogue
    // state (matching hub-dialogue-close) so returning to the Institute
    // afterward doesn't reopen a stale dialogue on top of a screen change.
    hubDialogueId = null;
    progress.currentScreen = "mastery";
    save();
    render();
    return true;
  }
  if (action === "open-archive-rotation") {
    hubDialogueId = null;
    progress.currentScreen = "archive-rotation";
    save();
    render();
    return true;
  }
  if (action === "rotation-next") {
    const questType = target.dataset.rotationQuestType;
    const questId = target.dataset.rotationQuestId;
    const key = `${questType}::${questId}`;
    const item = rotationItemPool().find((entry) => entry.key === key);
    const rotation = progress.archiveRotation;
    if (item) {
      const state = progress.questResponses[questId] || {};
      const result = gradeQuest(questType, item.quest, state);
      const correct = isQuestComplete(questType, result);
      const now = Date.now();
      rotation.itemStates[key] = reviewRotationItem(rotation.itemStates[key], correct, now);
      rotation.position += 1;
      if (rotation.position >= rotation.queue.length) {
        const today = rotationDateString(now);
        rotation.streakDays = nextStreakDays(
          rotation.lastCompletedDate,
          today,
          rotation.streakDays
        );
        rotation.lastCompletedDate = today;
      }
    } else {
      rotation.position += 1;
    }
    save();
    render();
    return true;
  }
  if (action === "submit-source") {
    const source = sourceById(target.dataset.source);
    const value = document.getElementById("sourceResponse")?.value.trim() || "";
    if (value.length < 15) {
      alert("Write a brief evidence-based interpretation before opening Institute Context.");
      return true;
    }
    progress.responses[source.id] = value;
    if (!progress.revealedContexts.includes(source.id)) progress.revealedContexts.push(source.id);
    save();
    render();
    return true;
  }
  if (action === "secure-source") {
    const id = target.dataset.source;
    const caseId = activeFieldCaseId();
    playSfx("secure");
    if (!progress.revealedContexts.includes(id)) return true;
    const list = progress.caseEvidence[caseId] || [];
    if (!list.includes(id)) list.push(id);
    progress.caseEvidence[caseId] = list;
    if (id === "taino-context")
      progress.fieldNotice =
        "Village record secured. The shoreline records are now readable: follow the coast toward the Spanish camp and map fragments.";
    sourceOrigin = "field";
    progress.currentScreen = "field";
    save();
    render();
    return true;
  }
  return false;
}

function handlePuzzleScreenClick(target, action) {
  if (action === "sequence-move") {
    applySequenceMove(
      target.dataset.sequenceQuest,
      target.dataset.sequenceItem,
      target.dataset.direction
    );
    return true;
  }
  if (action === "reconstruction") {
    progress.currentScreen = "reconstruction";
    save();
    render();
    return true;
  }
  if (action === "check-reconstruction") {
    document.querySelectorAll("[data-reconstruction]").forEach((s) => {
      progress.reconstruction[s.dataset.reconstruction] = s.value;
    });
    const reconstructionCaseId = activeFieldCaseId();
    const correct = sourcesForCase(reconstructionCaseId).every(
      (s) => progress.reconstruction[s.id] === s.reconstruction
    );
    save();
    if (correct) {
      playSfx("upload");
      unlockNext(reconstructionCaseId);
      progress.pendingUploadCaseId = reconstructionCaseId;
      progress.currentScreen = "upload";
      save();
      render();
    } else
      showFeedback(
        "reconstructionFeedback",
        "Revisit the source type and date. Each record belongs in a different evidentiary lane.",
        "error"
      );
    return true;
  }
  return false;
}

function handleReviewClick(target, action) {
  if (action === "practice-check") {
    progress.currentScreen = "practice-check";
    save();
    render();
    return true;
  }
  if (action === "return-archive") {
    playSfx("return-warp");
    progress.pendingUploadCaseId = null;
    progress.activeCaseId = null;
    progress.hubNotice =
      "Field record received. The Archive has preserved your Codex transmission.";
    safeInstituteSpawn(...instituteRecallSpawn());
    progress.currentScreen = "return-warp";
    save();
    render();
    return true;
  }
  if (action === "review") {
    progress.currentScreen = "review";
    save();
    render();
    return true;
  }
  if (action === "submit-review") {
    const reviewUnitId = progress.selectedUnitId || "unit-01";
    const reviewData = UNIT_REVIEWS[reviewUnitId] || REVIEW;
    const reviewState = reviewStateFor(reviewUnitId);
    document.querySelectorAll("[data-mcq]:checked").forEach((i) => {
      reviewState.answers[i.dataset.mcq] = Number(i.value);
    });
    document.querySelectorAll("[data-saq]").forEach((t) => {
      reviewState.saq[t.dataset.saq] = t.value.trim();
    });
    const filled = Object.values(reviewState.saq).filter((v) => v.length > 0).length;
    save();
    const reviewUnit = unitById(reviewUnitId);
    if (filled !== reviewData.saq.prompts.length) {
      showFeedback(
        "reviewFeedback",
        "Draft a response for every SAQ part before submitting the archive record.",
        "error"
      );
    } else if (reviewUnit && !unitReadyForReview(reviewUnit)) {
      showFeedback(
        "reviewFeedback",
        "Complete every case and Archive Challenge in this unit before submitting the Archive Review.",
        "error"
      );
    } else {
      if (reviewUnitId === "unit-01") progress.unitComplete = true;
      if (!progress.completedUnits.includes(reviewUnitId))
        progress.completedUnits.push(reviewUnitId);
      unlockNextUnit(reviewUnitId);
      progress.currentScreen = "completion";
      save();
      render();
    }
    return true;
  }
  return false;
}

function handleAuthScreenClick(target, action) {
  if (action === "open-join-screen") {
    progress.currentScreen = "join";
    showMainMenu = false;
    authUiState.error = "";
    authUiState.info = "";
    save();
    render();
    return true;
  }
  if (action === "open-teacher-login") {
    progress.currentScreen = "login";
    showMainMenu = false;
    authUiState.error = "";
    authUiState.info = "";
    save();
    render();
    return true;
  }
  if (action === "student-tab-claim" || action === "student-tab-signin") {
    authUiState.studentTab = action === "student-tab-claim" ? "claim" : "signin";
    authUiState.error = "";
    authUiState.info = "";
    render();
    return true;
  }
  if (action === "teacher-tab-signin" || action === "teacher-tab-signup") {
    authUiState.teacherTab = action === "teacher-tab-signin" ? "signin" : "signup";
    authUiState.error = "";
    authUiState.info = "";
    authUiState.signupStep = 1;
    authUiState.signupDraft = null;
    authUiState.classroomRows = [];
    render();
    return true;
  }
  if (action === "toggle-password-visibility") {
    const input = document.getElementById(target.dataset.target);
    if (input) {
      input.type = input.type === "password" ? "text" : "password";
      target.textContent = input.type === "password" ? "Show" : "Hide";
      target.setAttribute("aria-pressed", input.type === "text" ? "true" : "false");
    }
    // Deliberately no render() — these are uncontrolled inputs; re-rendering would wipe
    // whatever the user has already typed.
    return true;
  }
  if (action === "continue-with-google") {
    authUiState.pending = true;
    authUiState.error = "";
    authUiState.info = "";
    render();
    signInWithOAuthGoogle()
      .catch((err) => {
        authUiState.error = err.message || "Google sign-in isn't available yet.";
      })
      .finally(() => {
        authUiState.pending = false;
        render();
      });
    return true;
  }
  if (action === "submit-join-claim") {
    const joinCode = document.getElementById("join-classroom-code")?.value.trim() || "";
    const studentIdCode = document.getElementById("join-student-id")?.value.trim() || "";
    const displayName = document.getElementById("join-display-name")?.value.trim() || "";
    const password = document.getElementById("join-password")?.value || "";
    if (!validateJoinCode(joinCode) || !validateStudentIdCode(studentIdCode)) {
      authUiState.error = "Enter your classroom code and student ID.";
      render();
      return true;
    }
    if (!validatePassword(password)) {
      authUiState.error = "Password must be at least 8 characters.";
      render();
      return true;
    }
    authUiState.pending = true;
    authUiState.error = "";
    authUiState.info = "";
    render();
    claimSlot({ joinCode, studentIdCode, password, displayName })
      .then(({ email }) => signInWithPassword(email, password))
      .then(() => {
        progress.currentScreen = "institute";
        save();
      })
      .catch((err) => {
        authUiState.error = err.message || "Could not claim this seat.";
      })
      .finally(() => {
        authUiState.pending = false;
        render();
      });
    return true;
  }
  if (action === "submit-join-signin") {
    const joinCode = document.getElementById("join-classroom-code")?.value.trim() || "";
    const studentIdCode = document.getElementById("join-student-id")?.value.trim() || "";
    const password = document.getElementById("join-password")?.value || "";
    if (!validateJoinCode(joinCode) || !validateStudentIdCode(studentIdCode) || !password) {
      authUiState.error = "Enter your classroom code, student ID, and password.";
      render();
      return true;
    }
    authUiState.pending = true;
    authUiState.error = "";
    authUiState.info = "";
    render();
    resolveStudentEmail({ joinCode, studentIdCode })
      .then(({ email }) => signInWithPassword(email, password))
      .then(() => {
        progress.currentScreen = "institute";
        save();
      })
      .catch((err) => {
        authUiState.error = err.message || "Could not sign in.";
      })
      .finally(() => {
        authUiState.pending = false;
        render();
      });
    return true;
  }
  if (action === "submit-teacher-signin") {
    const email = document.getElementById("teacher-email")?.value.trim() || "";
    const password = document.getElementById("teacher-password")?.value || "";
    if (!email || !password) {
      authUiState.error = "Enter your email and password.";
      render();
      return true;
    }
    authUiState.pending = true;
    authUiState.error = "";
    authUiState.info = "";
    render();
    signInWithPassword(email, password)
      .then(() => getProfile())
      .then((profile) => {
        currentProfile = profile;
        progress.currentScreen = "teacher-dashboard";
        save();
        return loadTeacherDashboardData();
      })
      .catch((err) => {
        authUiState.error = err.message || "Could not sign in.";
      })
      .finally(() => {
        authUiState.pending = false;
        render();
      });
    return true;
  }
  if (action === "dev-fake-teacher" && import.meta.env.DEV) {
    authUiState.pending = true;
    authUiState.error = "";
    authUiState.info = "";
    render();
    const enterDashboard = () =>
      getProfile().then((profile) => {
        currentProfile = profile;
        progress.currentScreen = "teacher-dashboard";
        save();
        return loadTeacherDashboardData();
      });
    signInWithPassword(DEV_FAKE_TEACHER.email, DEV_FAKE_TEACHER.password)
      .then(enterDashboard)
      .catch(() =>
        signUpTeacher(
          DEV_FAKE_TEACHER.email,
          DEV_FAKE_TEACHER.password,
          DEV_FAKE_TEACHER.displayName,
          DEV_FAKE_TEACHER.schoolName
        ).then(({ needsEmailConfirmation }) => {
          if (needsEmailConfirmation) {
            authUiState.info =
              'This Supabase project requires email confirmation. In the Supabase dashboard, go to Authentication → Users, find chronicle-dev-teacher@gmail.com, and confirm it manually (or disable "Confirm email" under Authentication → Providers → Email for local dev). Then click this button again.';
            return null;
          }
          return enterDashboard();
        })
      )
      .catch((err) => {
        authUiState.error = err.message || "Could not create the dev teacher account.";
      })
      .finally(() => {
        authUiState.pending = false;
        render();
      });
    return true;
  }
  if (action === "teacher-signup-continue") {
    const displayName = document.getElementById("teacher-display-name")?.value.trim() || "";
    const schoolName = document.getElementById("teacher-school-name")?.value.trim() || "";
    const email = document.getElementById("teacher-email")?.value.trim() || "";
    const password = document.getElementById("teacher-password")?.value || "";
    const confirmPassword = document.getElementById("teacher-confirm-password")?.value || "";
    if (!email || !validatePassword(password)) {
      authUiState.error = "Enter a valid email and a password of at least 8 characters.";
      render();
      return true;
    }
    if (!schoolName) {
      authUiState.error = "Enter your school or organization name.";
      render();
      return true;
    }
    if (password !== confirmPassword) {
      authUiState.error = "Passwords don't match.";
      render();
      return true;
    }
    authUiState.error = "";
    authUiState.signupDraft = { displayName, schoolName, email, password };
    if (authUiState.classroomRows.length === 0) {
      authUiState.classroomRows = [{ name: "Classroom 1", studentCount: 5 }];
    }
    authUiState.signupStep = 2;
    render();
    return true;
  }
  if (action === "teacher-signup-back") {
    authUiState.signupStep = 1;
    authUiState.error = "";
    render();
    return true;
  }
  if (action === "submit-teacher-signup") {
    const draft = authUiState.signupDraft;
    if (!draft) {
      authUiState.signupStep = 1;
      render();
      return true;
    }
    const rows = authUiState.classroomRows;
    if (rows.length === 0 || rows.some((row) => !row.name.trim() || row.studentCount < 1)) {
      authUiState.error = "Give each classroom a name and at least 1 student.";
      render();
      return true;
    }
    authUiState.pending = true;
    authUiState.error = "";
    authUiState.info = "";
    render();
    signUpTeacher(draft.email, draft.password, draft.displayName, draft.schoolName)
      .then(({ needsEmailConfirmation }) => {
        if (needsEmailConfirmation) {
          // No session yet, so the classroom-creation calls below (RLS-gated on auth.uid())
          // can't run. Defer classroom setup to the teacher's first sign-in — they add
          // classrooms from the dashboard the same way teachers already do today.
          authUiState.teacherTab = "signin";
          authUiState.signupStep = 1;
          authUiState.signupDraft = null;
          authUiState.classroomRows = [];
          authUiState.info =
            "Account created — check your email to confirm it, then sign in and add your classrooms.";
          return null;
        }
        return createClassroomsWithRoster(rows).then((results) => {
          const failures = results.filter((r) => !r.ok);
          return getProfile().then((profile) => {
            currentProfile = profile;
            progress.currentScreen = "teacher-dashboard";
            save();
            return loadTeacherDashboardData().then(() => {
              if (failures.length > 0) {
                teacherUiState.error = `Some classrooms could not be created: ${failures.map((f) => f.name).join(", ")}.`;
              }
            });
          });
        });
      })
      .catch((err) => {
        authUiState.error = err.message || "Could not create your account.";
      })
      .finally(() => {
        authUiState.pending = false;
        render();
      });
    return true;
  }
  if (action === "select-classroom") {
    teacherUiState.selectedClassroomId = target.dataset.classroomId;
    setSelectedClassroomId(target.dataset.classroomId);
    teacherUiState.lastProvisioned = null;
    teacherUiState.lastReissuedPassword = null;
    render();
    Promise.all([
      loadSelectedClassroomDetails(),
      setActiveOverrideClassroom(target.dataset.classroomId),
    ])
      .catch((err) => reportUiError(teacherUiState, err, "Could not load this classroom."))
      .finally(() => render());
    return true;
  }
  if (action === "create-classroom") {
    const name = document.getElementById("new-classroom-name")?.value.trim() || "";
    if (!name) {
      teacherUiState.error = "Enter a classroom name.";
      render();
      return true;
    }
    teacherUiState.error = "";
    createClassroom(name)
      .then((classroom) => {
        teacherUiState.selectedClassroomId = classroom.id;
        setSelectedClassroomId(classroom.id);
        return loadTeacherDashboardData();
      })
      .catch(catchUiError(teacherUiState, "Could not create classroom."));
    return true;
  }
  if (action === "provision-roster") {
    const count = Number(document.getElementById("provision-count")?.value || 0);
    if (!teacherUiState.selectedClassroomId || !Number.isInteger(count) || count < 1) {
      teacherUiState.error = "Enter how many students to add.";
      render();
      return true;
    }
    teacherUiState.error = "";
    provisionSlots(teacherUiState.selectedClassroomId, { count })
      .then(({ slots }) => {
        teacherUiState.lastProvisioned = slots;
        return loadSelectedClassroomDetails();
      })
      .then(() => render())
      .catch(catchUiError(teacherUiState, "Could not add roster slots."));
    return true;
  }
  if (action === "reset-student-password") {
    const rosterSlotId = target.dataset.rosterSlotId;
    teacherUiState.error = "";
    resetStudentPassword(rosterSlotId)
      .then((tempPassword) => {
        teacherUiState.lastReissuedPassword = tempPassword;
        render();
      })
      .catch(catchUiError(teacherUiState, "Could not reset this student's password."));
    return true;
  }
  if (action === "disable-student") {
    const rosterSlotId = target.dataset.rosterSlotId;
    teacherUiState.error = "";
    disableStudentSlot(rosterSlotId)
      .then(() => loadSelectedClassroomDetails())
      .then(() => render())
      .catch(catchUiError(teacherUiState, "Could not remove this student."));
    return true;
  }
  if (action === "create-assignment") {
    if (!teacherUiState.selectedClassroomId) return true;
    const title = document.getElementById("new-assignment-title")?.value.trim() || "";
    const taskType = document.getElementById("new-assignment-task-type")?.value || "";
    const taskId = document.getElementById("new-assignment-task-id")?.value.trim() || "";
    const dueAtInput = document.getElementById("new-assignment-due-at")?.value || "";
    if (!title || !taskId || !dueAtInput || !ASSIGNABLE_TASK_TYPES.includes(taskType)) {
      teacherUiState.error = "Enter a title, task id, and due date.";
      render();
      return true;
    }
    teacherUiState.error = "";
    // <input type="date"> yields "YYYY-MM-DD" with no time-of-day — treated
    // as end-of-day local time so "due 2026-08-01" doesn't read as already
    // overdue the moment it's created.
    const dueAt = new Date(`${dueAtInput}T23:59:59`).toISOString();
    createAssignment(teacherUiState.selectedClassroomId, { title, taskType, taskId, dueAt })
      .then(() => loadSelectedClassroomDetails())
      .then(() => render())
      .catch(catchUiError(teacherUiState, "Could not create this assignment."));
    return true;
  }
  if (action === "delete-assignment") {
    const assignmentId = target.dataset.assignmentId;
    teacherUiState.error = "";
    deleteAssignment(assignmentId)
      .then(() => loadSelectedClassroomDetails())
      .then(() => render())
      .catch(catchUiError(teacherUiState, "Could not delete this assignment."));
    return true;
  }
  if (action === "advance-classroom-unit") {
    if (!teacherUiState.selectedClassroomId) return true;
    teacherUiState.error = "";
    advanceClassroomUnit(teacherUiState.selectedClassroomId, UNITS.length - 1)
      .then((newIndex) => {
        teacherUiState.enabledUnitIndex = newIndex;
        render();
      })
      .catch(catchUiError(teacherUiState, "Could not advance the unit."));
    return true;
  }
  if (action === "select-teacher-tab") {
    teacherUiState.activeTab = target.dataset.tab;
    render();
    return true;
  }
  if (action === "toggle-sources-unit") {
    const unitNumber = Number(target.dataset.unit);
    const wasOpen = teacherUiState.sourcesExpandedUnit === unitNumber;
    teacherUiState.sourcesExpandedUnit = wasOpen ? null : unitNumber;
    render();
    if (
      !wasOpen &&
      teacherUiState.selectedClassroomId &&
      teacherUiState.sourcePoolByUnit[unitNumber] === undefined
    ) {
      getUnitSourcePool(teacherUiState.selectedClassroomId, unitNumber)
        .then((ids) => {
          teacherUiState.sourcePoolByUnit[unitNumber] = ids;
          render();
        })
        .catch(catchUiError(teacherUiState, "Could not load this unit's source pool."));
    }
    return true;
  }
  if (action === "toggle-source-pool") {
    const unitNumber = Number(target.dataset.unit);
    const sourceId = target.dataset.sourceId;
    const sourceKind = target.dataset.sourceKind;
    const pool = teacherUiState.sourcePoolByUnit[unitNumber];
    if (!teacherUiState.selectedClassroomId || !pool) return true;
    const nowSelected = !pool.has(sourceId);
    teacherUiState.error = "";
    setSourceInPool(
      teacherUiState.selectedClassroomId,
      unitNumber,
      sourceId,
      sourceKind,
      nowSelected
    )
      .then(() => {
        if (nowSelected) pool.set(sourceId, sourceKind);
        else pool.delete(sourceId);
        render();
      })
      .catch(catchUiError(teacherUiState, "Could not update this source's pool status."));
    return true;
  }
  if (action === "toggle-source-preview") {
    const sourceId = target.dataset.sourceId;
    const sourceKind = target.dataset.sourceKind;
    const key = `${sourceKind}:${sourceId}`;
    if (teacherUiState.sourcesPreviewKeys.has(key)) teacherUiState.sourcesPreviewKeys.delete(key);
    else teacherUiState.sourcesPreviewKeys.add(key);
    render();
    return true;
  }
  if (action === "toggle-source-fulltext") {
    const sourceId = target.dataset.sourceId;
    const sourceKind = target.dataset.sourceKind;
    const key = `${sourceKind}:${sourceId}`;
    if (teacherUiState.sourcesFullTextKeys.has(key)) teacherUiState.sourcesFullTextKeys.delete(key);
    else teacherUiState.sourcesFullTextKeys.add(key);
    render();
    return true;
  }
  if (action === "teacher-sign-out") {
    signOut().then(() => {
      currentProfile = null;
      teacherUiState = {
        activeTab: "classrooms",
        classrooms: [],
        selectedClassroomId: null,
        roster: [],
        submissions: [],
        newClassroomName: "",
        lastProvisioned: null,
        lastReissuedPassword: null,
        progressByStudent: {},
        enabledUnitIndex: 0,
        error: "",
        pending: false,
        assignments: [],
        gradedEvaluationIds: new Set(),
        sourcePoolByUnit: {},
        sourcesExpandedUnit: null,
      };
      contentUiState = {
        selectedCaseId: null,
        wizardStep: "name",
        slots: [],
        additionSlots: [],
        error: "",
        pending: false,
      };
      previewSession = { active: false, snapshot: null };
      authUiState.signupStep = 1;
      authUiState.signupDraft = null;
      authUiState.classroomRows = [];
      progress.currentScreen = "institute";
      save();
      render();
    });
    return true;
  }
  return false;
}

function handleGradingScreenClick(target, action) {
  if (action === "open-grading") {
    openGradingScreen(target.dataset.submissionId);
    return true;
  }
  if (action === "back-to-teacher-dashboard") {
    // Manage Content's per-case editor uses this same action (its own
    // standalone list screen was folded into the dashboard's Units tab —
    // see teacherUnitsTabMarkup()) — restore whichever tab makes sense for
    // the screen we're leaving, since progress.currentScreen still holds
    // that value at this point. Warn first if an open authoring form would
    // otherwise be silently discarded (open-manage-content-case always
    // resets it on next entry) — see runAfterConfirmingDiscard().
    runAfterConfirmingDiscard(() => {
      // Also clears a still-active inline preview (Screen 2's "Keep &
      // Publish"/"Return to Cases" can reach this action while
      // previewSession.active is true) so the preview banner and save()'s
      // no-op guard don't leak onto the dashboard. Unlike exitContentPreview(),
      // this used to skip re-pointing the resolution cache back at
      // "published" — leaving it stuck on "draft" until something else
      // happened to reload it — so mirror that same call here too.
      const wasPreviewing = isPreviewingContent();
      previewSession = { active: false, snapshot: null };
      teacherUiState.activeTab =
        progress.currentScreen === "manage-content-case" ? "units" : "assignments";
      progress.currentScreen = "teacher-dashboard";
      save();
      render();
      if (wasPreviewing) {
        loadSelectionsForResolution(teacherUiState.selectedClassroomId, "published");
      }
    }, '[data-action="back-to-teacher-dashboard"]');
    return true;
  }
  if (action === "save-manual-grade") {
    const gradeLabel = document.getElementById("grade-label")?.value.trim() || "";
    const teacherFeedback = document.getElementById("grade-teacher-feedback")?.value.trim() || "";
    if (!gradeLabel || !gradingUiState.submission?.evaluationId) {
      gradingUiState.error = "Enter a grade before saving.";
      render();
      return true;
    }
    gradingUiState.error = "";
    recordManualGrade(gradingUiState.submission.evaluationId, gradeLabel, teacherFeedback)
      .then(() => getSubmissionWithGrades(gradingUiState.submissionId))
      .then((submission) => {
        gradingUiState.submission = submission;
        render();
      })
      .catch(catchUiError(gradingUiState, "Could not save this grade."));
    return true;
  }
  return false;
}

function handleEvaluatorClick(target, action) {
  if (action === "evaluate-source") {
    const source = sourceById(target.dataset.source);
    if (!source) return true;
    const studentResponse = progress.responses[source.id] || "";
    const prior = progress.submissions[source.id];
    runEvaluation(source.id, buildHippEvaluationRequest(source, studentResponse, prior));
    return true;
  }
  if (action === "evaluate-saq") {
    const unit = unitById(progress.selectedUnitId) || UNIT_01;
    const review = UNIT_REVIEWS[unit.id] || REVIEW;
    const state = reviewStateFor(unit.id);
    const taskId = `saq-${unit.id}`;
    const prior = progress.submissions[taskId];
    runEvaluation(taskId, buildSaqEvaluationRequest(unit, review, state.saq || {}, prior));
    return true;
  }
  if (action === "evaluate-written-quest") {
    const questType = target.dataset.questType;
    const questId = target.dataset.quest;
    const resolved = archiveChallengeQuestFor(questType, questId);
    if (!resolved?.quest) return true;
    const state = progress.questResponses[questId] || {};
    const taskId = `${questType}-quest-${questId}`;
    const prior = progress.submissions[taskId];
    const request =
      questType === "dbq"
        ? buildDbqEvaluationRequest(resolved.quest, state.response || "", prior)
        : buildSaqQuestEvaluationRequest(resolved.quest, state.responses || {}, prior);
    runEvaluation(taskId, request);
    return true;
  }
  return false;
}

const CLICK_HANDLER_GROUPS = [
  handleChromeClick,
  handleLandingClick,
  handleOnboardingClick,
  handleHubClick,
  handleFieldClick,
  handleSourceReaderClick,
  handlePuzzleScreenClick,
  handleReviewClick,
  handleAuthScreenClick,
  handleGradingScreenClick,
  handleManageContentClick,
  handleEvaluatorClick,
];

function handleAppClick(event) {
  // Mini-game controls (Storm Navigation's restart, Cargo Sorting's wrapper restart) use
  // their own module-authored data attributes rather than data-action, mirroring how
  // drag-and-drop already has its own delegated listeners apart from the action dispatch
  // below. Storm Navigation's Port/Starboard buttons are handled as held pointer input (see
  // handleAppPointerdown/handleAppPointerup) rather than a click, so the on-screen buttons
  // glide continuously the same way a held keyboard key does.
  const restartControl = event.target.closest("[data-storm-restart], [data-cargo-restart]");
  if (restartControl) {
    event.preventDefault();
    if (restartControl.hasAttribute("data-storm-restart")) {
      stormNavigationState = createStormNavigationGame();
    }
    if (restartControl.hasAttribute("data-cargo-restart")) {
      cargoSortingState = createCargoSortingGame();
    }
    updateMiniGameUi();
    return;
  }
  // Activity-engine controls, on their own attribute for the same reason the drag listeners are
  // separate: the engines use short generic verbs (place, file, select, log) that would otherwise
  // have to be unique across every data-action in the game. Checked before that dispatch because
  // INTERVIEW's question chips render inside the field dialogue bubble, on the field screen.
  const activityControl = event.target.closest("[data-activity-action]");
  if (activityControl) {
    event.preventDefault();
    activityControl.blur?.();
    handleActivityAction(activityControl);
    return;
  }
  const target = event.target.closest("[data-action]");
  if (!target) {
    // Click-away dismissal for the field dialogue — but only for a click that actually landed
    // outside the bubble. `closest("[data-action]")` is null for everything in it that is not a
    // control: the speaker's name, the line itself, the padding, and the few pixels around the
    // record button. Without the second test, a click that missed a control by a pixel did not
    // merely do nothing — it destroyed the thing the player was reading, which reads as the button
    // being broken rather than as a miss, because the bubble and the answer vanish together.
    if (
      progress.currentScreen === "field" &&
      progress.activeFieldNpc &&
      !event.target.closest(".field-speech-bubble")
    ) {
      progress.activeFieldNpc = null;
      save();
      render();
    }
    return;
  }
  event.preventDefault();
  target.blur?.();
  document.activeElement?.blur?.();
  const action = target.dataset.action;
  for (const handler of CLICK_HANDLER_GROUPS) {
    if (handler(target, action)) return;
  }
}

async function handleAppChange(event) {
  const field = event.target;
  if (field.matches("[data-profile]")) {
    progress.profile[field.dataset.profile] = field.value;
    save();
  } else if (field.matches("[data-setting]")) {
    if (field.dataset.setting === "mini-games") {
      progress.settings.miniGamesEnabled = field.checked;
      save();
      render();
    }
  } else if (field.matches("[data-copy]")) {
    const mapping = AUTHOR_COPY_FIELDS[field.dataset.copy];
    if (mapping) {
      await setTeacherOverride(mapping.contentId, mapping.fieldName, field.value);
      render();
    }
  } else if (field.matches("[data-case-title]")) {
    await setTeacherOverride(field.dataset.caseTitle, "title", field.value);
    render();
  } else if (field.matches("[data-case-visibility]")) {
    await setTeacherOverride(
      field.dataset.caseVisibility,
      "navTableVisible",
      field.checked ? "true" : "false"
    );
    render();
  } else if (field.matches("[data-sequence-position-select]")) {
    const formEl = field.closest("[data-authoring-form]");
    const fields = syncAuthoringFieldsFromDom("sequencing", formEl);
    const rowIndex = Number(field.dataset.rowIndex);
    const targetPosition = Number(field.value);
    fields.items = reorderSequenceItems(fields.items, rowIndex, targetPosition);
    manageContentAuthoring = { ...manageContentAuthoring, fields };
    render();
  } else if (field.matches("[data-copy-hipp-source]")) {
    // One-time copy-in, not a persistent link — see poolSourcesForCopy()'s
    // doc comment. Fields stay freely editable after this fires. Prefers
    // the source's real transcribed fullText over the short excerpt when
    // one exists — see resolvePoolSourceFields()'s doc comment. Guarded by
    // confirmSourceChangeIfNeeded() so a customized excerpt isn't silently
    // discarded — see that function's doc comment.
    const picked = field.value && resolvePoolSourceFields(field.value);
    if (picked) {
      const formEl = field.closest("[data-authoring-form]");
      const fields = syncAuthoringFieldsFromDom("hipp", formEl);
      const oldPoolValue = manageContentAuthoring.fields.hippSourcePoolValue;
      confirmSourceChangeIfNeeded(field, "hipp", oldPoolValue, fields.documentText, () => {
        fields.documentText = picked.fullText || picked.excerpt;
        fields.documentAttribution = picked.attribution;
        manageContentAuthoring = {
          ...manageContentAuthoring,
          fields,
          textTools: { ...manageContentAuthoring.textTools, hipp: undefined },
        };
        render();
      });
    }
  } else if (field.matches("[data-copy-evidence-source]")) {
    const picked = field.value && resolvePoolSourceFields(field.value);
    if (picked) {
      const formEl = field.closest("[data-authoring-form]");
      const fields = syncAuthoringFieldsFromDom("evidence-organizing", formEl);
      const rowIndex = Number(field.dataset.rowIndex);
      const oldPoolValue = manageContentAuthoring.fields.sources[rowIndex]?.sourcePoolValue;
      confirmSourceChangeIfNeeded(
        field,
        `evidence-${rowIndex}`,
        oldPoolValue,
        fields.sources[rowIndex].excerpt,
        () => {
          fields.sources[rowIndex] = {
            ...fields.sources[rowIndex],
            label: picked.label,
            attribution: picked.attribution,
            excerpt: picked.excerpt,
          };
          manageContentAuthoring = {
            ...manageContentAuthoring,
            fields,
            textTools: { ...manageContentAuthoring.textTools, [`evidence-${rowIndex}`]: undefined },
          };
          render();
        }
      );
    }
  } else if (field.matches("[data-copy-mcq-source]")) {
    const picked = field.value && resolvePoolSourceFields(field.value);
    if (picked) {
      const formEl = field.closest("[data-authoring-form]");
      const fields = syncAuthoringFieldsFromDom("mcq", formEl);
      const oldPoolValue = manageContentAuthoring.fields.mcqSourcePoolValue;
      confirmSourceChangeIfNeeded(field, "mcq", oldPoolValue, fields.relatedSourceExcerpt, () => {
        fields.relatedSourceLabel = picked.label;
        fields.relatedSourceAttribution = picked.attribution;
        fields.relatedSourceExcerpt = picked.excerpt;
        manageContentAuthoring = {
          ...manageContentAuthoring,
          fields,
          textTools: { ...manageContentAuthoring.textTools, mcq: undefined },
        };
        render();
      });
    }
  } else if (field.matches("[data-copy-sequencing-source]")) {
    const picked = field.value && resolvePoolSourceFields(field.value);
    if (picked) {
      const formEl = field.closest("[data-authoring-form]");
      const fields = syncAuthoringFieldsFromDom("sequencing", formEl);
      const oldPoolValue = manageContentAuthoring.fields.sequencingSourcePoolValue;
      confirmSourceChangeIfNeeded(
        field,
        "sequencing",
        oldPoolValue,
        fields.relatedSourceExcerpt,
        () => {
          fields.relatedSourceLabel = picked.label;
          fields.relatedSourceAttribution = picked.attribution;
          fields.relatedSourceExcerpt = picked.excerpt;
          manageContentAuthoring = {
            ...manageContentAuthoring,
            fields,
            textTools: { ...manageContentAuthoring.textTools, sequencing: undefined },
          };
          render();
        }
      );
    }
  } else if (field.matches("[data-mcq-quest]")) {
    const questId = field.dataset.mcqQuest;
    progress.questResponses[questId] = { selected: field.value };
    playQuestSfx(questId);
    save();
    render();
  } else if (field.matches("[data-hipp-option]")) {
    const promptId = field.closest("[data-hipp-prompt]")?.dataset.hippPrompt;
    const questId = field.closest("[data-quest-id]")?.dataset.questId;
    if (!questId || !promptId) return;
    const state = progress.questResponses[questId] || {};
    progress.questResponses[questId] = {
      ...state,
      selected: { ...(state.selected || {}), [promptId]: field.value },
    };
    playQuestSfx(questId);
    save();
    render();
  } else if (field.matches("[data-saq-quest]")) {
    const questId = field.dataset.saqQuest;
    const index = field.dataset.saqIndex;
    if (!questId || index === undefined) return;
    const state = progress.questResponses[questId] || {};
    progress.questResponses[questId] = {
      ...state,
      responses: { ...(state.responses || {}), [index]: field.value },
    };
    playQuestSfx(questId);
    save();
    render();
  } else if (field.matches("[data-dbq-response]")) {
    const questId = field.dataset.dbqResponse;
    progress.questResponses[questId] = { response: field.value };
    playQuestSfx(questId);
    save();
    render();
  } else if (field.matches("[data-evidence-reflection]")) {
    const questId = field.dataset.evidenceReflection;
    const state = progress.questResponses[questId] || {};
    progress.questResponses[questId] = { ...state, reflection: field.value };
    save();
    render();
  } else if (field.matches("[data-sequence-reflection]")) {
    const questId = field.dataset.sequenceReflection;
    const state = progress.questResponses[questId] || {};
    progress.questResponses[questId] = { ...state, reflection: field.value };
    save();
    render();
  } else if (field.matches("[data-classroom-count]")) {
    const count = Math.min(20, Math.max(1, Number(field.value) || 1));
    const rows = authUiState.classroomRows;
    if (count > rows.length) {
      for (let i = rows.length; i < count; i += 1) {
        rows.push({ name: `Classroom ${i + 1}`, studentCount: 5 });
      }
    } else if (count < rows.length) {
      rows.length = count;
    }
    render();
  } else if (field.matches("[data-classroom-row-name]")) {
    const row = authUiState.classroomRows[Number(field.dataset.rowIndex)];
    if (row) row.name = field.value;
  } else if (field.matches("[data-classroom-row-count]")) {
    const row = authUiState.classroomRows[Number(field.dataset.rowIndex)];
    if (row) row.studentCount = Math.min(200, Math.max(1, Number(field.value) || 1));
  } else if (field.matches("[data-evidence-select]")) {
    const sourceId = field.dataset.evidenceSelect;
    const questId = field.dataset.questId;
    if (!questId) return;
    applyEvidencePlacement(questId, sourceId, field.value || null);
  }
}

function handleAppInput(event) {
  const field = event.target;
  if (field.matches("[data-evidence-reflection]")) {
    const questId = field.dataset.evidenceReflection;
    const counter = app.querySelector(
      `[data-evidence-reflection-counter="${CSS.escape(questId)}"]`
    );
    if (counter) {
      counter.textContent = `${field.value.trim().length}/${REFLECTION_MIN_LENGTH} characters`;
    }
  } else if (field.matches("[data-sequence-reflection]")) {
    const questId = field.dataset.sequenceReflection;
    const counter = app.querySelector(
      `[data-sequence-reflection-counter="${CSS.escape(questId)}"]`
    );
    if (counter) {
      counter.textContent = `${field.value.trim().length}/${REFLECTION_MIN_LENGTH} characters`;
    }
  } else if (field.matches("[data-dbq-response]")) {
    const questId = field.dataset.dbqResponse;
    const counter = app.querySelector(`[data-dbq-response-counter="${CSS.escape(questId)}"]`);
    if (counter) {
      counter.textContent = `${field.value.trim().length}/${DBQ_MIN_RESPONSE_LENGTH} characters`;
    }
  }
}

function handleAppDragstart(event) {
  // Drag is an accelerator over ASSEMBLY's select-then-place path, not the only way in: the same
  // fragment buttons work from a keyboard, which the ten-piece jigsaw this replaced never did.
  const activityFragment = event.target.closest("[data-activity-fragment]");
  if (activityFragment) {
    event.dataTransfer.setData("text/activity-fragment", activityFragment.dataset.activityFragment);
    event.dataTransfer.effectAllowed = "move";
    return;
  }
  // Cargo Sorting mini-game — named "cargo" independently of Case 1.05's
  // now-retired triangle-trade leg-drop feature (data-cargo-card/
  // "text/cargo-card"), which used the same word for an unrelated mechanic.
  const cargoGood = event.target.closest("[data-cargo-good]");
  if (cargoGood) {
    event.dataTransfer.setData("text/mini-cargo-good", cargoGood.dataset.cargoGood);
    event.dataTransfer.effectAllowed = "move";
    return;
  }
  const sequenceItem = event.target.closest("[data-sequence-item]");
  if (sequenceItem) {
    event.dataTransfer.setData("text/sequence-item", sequenceItem.dataset.sequenceItem);
    event.dataTransfer.effectAllowed = "move";
    return;
  }
  const evidenceSource = event.target.closest("[data-evidence-source]");
  if (evidenceSource) {
    event.dataTransfer.setData("text/evidence-source", evidenceSource.dataset.evidenceSource);
    event.dataTransfer.effectAllowed = "move";
  }
}

function handleAppDragover(event) {
  const activitySlot = event.target.closest("[data-activity-slot]");
  const sequenceItem = event.target.closest("[data-sequence-item]");
  const evidenceSlot = event.target.closest("[data-evidence-slot]");
  const cargoHold = event.target.closest("[data-cargo-hold]");
  const dropTarget = activitySlot || sequenceItem || evidenceSlot || cargoHold;
  if (dropTarget) {
    event.preventDefault();
    dropTarget.classList.add("is-over");
  }
}

function handleAppDragleave(event) {
  event.target.closest("[data-activity-slot]")?.classList.remove("is-over");
  event.target.closest("[data-sequence-item]")?.classList.remove("is-over");
  event.target.closest("[data-evidence-slot]")?.classList.remove("is-over");
  event.target.closest("[data-cargo-hold]")?.classList.remove("is-over");
}

function handleAppDrop(event) {
  const cargoHold = event.target.closest("[data-cargo-hold]");
  if (cargoHold) {
    event.preventDefault();
    cargoHold.classList.remove("is-over");
    const goodId = event.dataTransfer.getData("text/mini-cargo-good");
    if (!goodId || !cargoSortingState) return;
    cargoSortingState = placeCargo(cargoSortingState, goodId, cargoHold.dataset.cargoHold);
    updateMiniGameUi();
    return;
  }
  const sequenceItem = event.target.closest("[data-sequence-item]");
  if (sequenceItem) {
    event.preventDefault();
    sequenceItem.classList.remove("is-over");
    const sourceItemId = event.dataTransfer.getData("text/sequence-item");
    const targetItemId = sequenceItem.dataset.sequenceItem;
    const questId = sequenceItem.closest("[data-quest-id]")?.dataset.questId;
    const list = sequenceItem.closest(".quest-sequence-list");
    if (!sourceItemId || sourceItemId === targetItemId || !questId || !list) return;
    // Scoped to the <li> itself, not "[data-sequence-item]" alone — each
    // item's ↑/↓ move buttons also carry data-sequence-item (for their own
    // click handler), so the unscoped selector triples every id and
    // produces a corrupted order that can never satisfy
    // order.length === quest.items.length.
    const currentOrder = Array.from(
      list.querySelectorAll("li.sequence-item[data-sequence-item]")
    ).map((el) => el.dataset.sequenceItem);
    const withoutSource = currentOrder.filter((id) => id !== sourceItemId);
    const targetIndex = withoutSource.indexOf(targetItemId);
    withoutSource.splice(targetIndex, 0, sourceItemId);
    applySequenceOrder(questId, withoutSource);
    return;
  }
  const evidenceSlot = event.target.closest("[data-evidence-slot]");
  if (evidenceSlot) {
    event.preventDefault();
    evidenceSlot.classList.remove("is-over");
    const sourceId = event.dataTransfer.getData("text/evidence-source");
    const questId = evidenceSlot.closest("[data-quest-id]")?.dataset.questId;
    if (!sourceId || !questId) return;
    applyEvidencePlacement(questId, sourceId, evidenceSlot.dataset.evidenceSlot);
    return;
  }
  const activitySlot = event.target.closest("[data-activity-slot]");
  if (activitySlot) {
    event.preventDefault();
    activitySlot.classList.remove("is-over");
    const fragmentId = event.dataTransfer.getData("text/activity-fragment");
    if (!fragmentId) return;
    // A filled slot's own button says "lift"; a drop onto it means "place", so the verb is
    // overridden here rather than encoded twice in the markup. The board comes from the slot, so
    // a fragment dragged across boards simply doesn't resolve and the reducer no-ops.
    handleActivityAction(activitySlot, { activityAction: "place", fragment: fragmentId });
  }
}

// Global Escape dismissal for the app's own overlay surfaces (field/hub dialogue
// bubbles, the teacher "Preview as student" banner). A native <dialog> (e.g.
// Manage Content's delete-confirmation, Phase 30) already closes itself on Escape
// via the browser's own close-watcher, so this only needs to cover the surfaces
// that aren't a real <dialog> element.
function handleEscapeDismiss() {
  if (document.querySelector("dialog[open]")) return;
  // Above the rest, because a scene owns the room while it runs and there is nothing else on
  // screen for Escape to mean. This is the only place Escape can skip a scene from: the global
  // handler returns as soon as it has dealt with the key, so a branch in the institute keydown
  // block below would never be reached.
  if (isHubSceneActive()) {
    skipHubScene();
    return;
  }
  if (exitPreviewIfActive()) return;
  if (progress.currentScreen === "field" && progress.activeFieldNpc) {
    progress.activeFieldNpc = null;
    save();
    render();
    return;
  }
  if (hubDialogueId) {
    hubDialogueId = null;
    render();
  }
}

function handleWindowKeydown(event) {
  const key = event.key.toLowerCase();
  if (key === "escape") {
    handleEscapeDismiss();
    return;
  }
  const moves = {
    arrowup: [0, -1],
    w: [0, -1],
    arrowdown: [0, 1],
    s: [0, 1],
    arrowleft: [-1, 0],
    a: [-1, 0],
    arrowright: [1, 0],
    d: [1, 0],
  };
  if (progress.currentScreen === "mini-games" && activeMiniGame === "storm-navigation") {
    // Held-key continuous steering (see stormHeldVector/steerShip) — add to the held set on
    // keydown, remove on keyup (handleWindowKeyup below), same pattern as fieldHeldKeys/
    // hubHeldKeys. Key-repeat re-adding an already-present entry is harmless.
    if (STORM_MOVE_KEYS[key] !== undefined && stormNavigationState?.running) {
      event.preventDefault();
      stormHeldKeys.add(key);
      return;
    }
    if (
      (key === "enter" || key === " ") &&
      !event.repeat &&
      stormNavigationState &&
      !stormNavigationState.running
    ) {
      event.preventDefault();
      stormNavigationState = createStormNavigationGame();
      updateMiniGameUi();
      return;
    }
    return;
  }
  if (
    progress.currentScreen === "intro-welcome" ||
    progress.currentScreen === "intro-briefing" ||
    progress.currentScreen === "intro-protocol"
  ) {
    // Mirrors the click/tap advance on .director-dialogue-box (data-action="director-dialogue-click")
    // so keyboard users get the same skip-then-advance behavior — no separate implementation.
    if ((key === "enter" || key === " ") && !event.repeat) {
      event.preventDefault();
      handleOnboardingClick(null, "director-dialogue-click");
    }
    return;
  }
  if (progress.currentScreen === "institute") {
    // Above the generic E-to-interact block below, and returning unconditionally, because the
    // Director never leaves reach during his own briefing: falling through would re-enter
    // interactWithHubTarget("director") on every advance, reset introLineIndex to 0, and loop the
    // first line forever.
    if (hallwayScene.phase === "talking") {
      if (key === "e" || key === "enter" || key === " ") {
        event.preventDefault();
        if (!advanceIntroDialogue()) startHallwayEscort();
      }
      return;
    }
    // Above isHubInputLocked() and returning unconditionally, for the same reason the branch above
    // is: a scene owns the room while it runs, and falling through would let E re-enter
    // interactWithHubTarget() on whoever the player happens to be standing next to.
    if (isHubSceneActive()) {
      if (key === "e" || key === "enter" || key === " ") {
        event.preventDefault();
        advanceHubScene();
      }
      // Escape is not handled here — handleWindowKeydown() takes it before this block is reached,
      // and skipping lives there with the rest of the global dismissals.
      return;
    }
    if (isHubInputLocked()) return;
    if (key === "e" || key === "enter") {
      const nearby = nearestHubTarget();
      if (nearby) {
        event.preventDefault();
        interactWithHubTarget(nearby[0]);
      }
      return;
    }
    if (FIELD_MOVE_KEYS[key]) {
      event.preventDefault();
      hubHeldKeys.add(key);
      startHubMovementLoop();
    }
    return;
  }
  if (progress.currentScreen === "field") {
    if (key === "e" || key === "enter") {
      const nearby = nearestFieldInteraction();
      if (nearby) {
        event.preventDefault();
        if (nearby.type === "npc") {
          const npc = activeFieldMap().npcs.find((item) => item.id === nearby.id);
          progress.activeFieldNpc = progress.activeFieldNpc === npc.id ? null : npc.id;
          if (progress.activeFieldNpc) playSfx("dialogue");
          save();
          render();
        }
        if (nearby.type === "door") enterFieldInterior(nearby.id);
        if (nearby.type === "exit") exitFieldInterior();
        if (nearby.type === "source") {
          progress.activeFieldNpc = null;
          openSourceId = nearby.id;
          if (
            activeFieldCaseId() === "case-001" &&
            openSourceId !== "taino-context" &&
            !hasEvidence("case-001", "taino-context")
          ) {
            progress.fieldNotice =
              "The Spanish camp and map fragments will make more sense after the village record is stabilized.";
            save();
            render();
            return;
          }
          sourceOrigin = "field";
          ensureSourceActivity(openSourceId);
          progress.activeActivitySourceId = openSourceId;
          playQuestSfx(openSourceId);
          progress.currentScreen = hasEvidence(activeFieldCaseId(), openSourceId)
            ? "source"
            : sourceEntryScreen(openSourceId);
          save();
          render();
        }
      }
      return;
    }
    if (FIELD_MOVE_KEYS[key]) {
      event.preventDefault();
      fieldHeldKeys.add(key);
      startFieldMovementLoop();
    }
  }
}

function handleWindowKeyup(event) {
  const key = event.key.toLowerCase();
  if (STORM_MOVE_KEYS[key] !== undefined) stormHeldKeys.delete(key);
  if (!FIELD_MOVE_KEYS[key]) return;
  fieldHeldKeys.delete(key);
  hubHeldKeys.delete(key);
}

function handleWindowBlur() {
  fieldHeldKeys.clear();
  hubHeldKeys.clear();
  stormHeldKeys.clear();
  activeStormPointerKey = null;
  fieldMovement.moving = false;
  instituteMovement.moving = false;
  stopFieldMovementLoop();
  stopHubMovementLoop();
  updateFieldPlayer();
  updateInstitutePlayer();
}

// Storm Navigation's Port/Starboard buttons drive the same held-key continuous steering as
// the keyboard (stormHeldVector/steerShip) rather than a one-shot click, so touch/mouse
// players get the same glide feel. Listening for pointerup/pointercancel on window (not app)
// means dragging off the button before releasing still correctly stops steering.
function handleAppPointerdown(event) {
  const stormMove = event.target.closest("[data-storm-move]");
  if (!stormMove || activeMiniGame !== "storm-navigation" || !stormNavigationState) return;
  event.preventDefault();
  activeStormPointerKey =
    Number(stormMove.dataset.stormMove) < 0 ? "storm-pointer-left" : "storm-pointer-right";
  stormHeldKeys.add(activeStormPointerKey);
}
function handleAppPointerup() {
  if (!activeStormPointerKey) return;
  stormHeldKeys.delete(activeStormPointerKey);
  activeStormPointerKey = null;
}

if (app) {
  app.addEventListener("mousedown", handleAppMousedown);
  app.addEventListener("click", handleAppClick);
  app.addEventListener("change", handleAppChange);
  app.addEventListener("input", handleAppInput);
  app.addEventListener("dragstart", handleAppDragstart);
  app.addEventListener("dragover", handleAppDragover);
  app.addEventListener("dragleave", handleAppDragleave);
  app.addEventListener("drop", handleAppDrop);
  app.addEventListener("pointerdown", handleAppPointerdown);
  window.addEventListener("pointerup", handleAppPointerup);
  window.addEventListener("pointercancel", handleAppPointerup);
  window.addEventListener("keydown", handleWindowKeydown);
  window.addEventListener("keyup", handleWindowKeyup);
  window.addEventListener("blur", handleWindowBlur);
  // <dialog>'s close/cancel events don't bubble, so they can't reach the
  // delegated app.addEventListener("click", ...) above — capture-phase
  // document listeners instead (see handleManageContentDialogNativeClose()'s
  // doc comment for why this only matters for closes our own code didn't
  // already see, e.g. Escape while a dialog itself has focus).
  document.addEventListener("close", handleManageContentDialogNativeClose, true);
  document.addEventListener("cancel", handleManageContentDialogNativeClose, true);
  window.addEventListener("beforeunload", handleWindowBeforeUnload);

  // Applied here rather than beside the `?entry=` block it sits next to, because a warp calls
  // resetFieldPosition() and the hub spawn helpers, which read movement state declared much further
  // down this file — running it from up there is the same temporal-dead-zone throw a field interior
  // gets for being attached inside the FIELD_MAPS literal.
  applyDevWarp();
  // Before the first render, so a player who finished missions before the Codex existed opens it
  // to their own work rather than to an empty archive. A no-op on every boot after the first.
  backfillCodex();
  render();
}
