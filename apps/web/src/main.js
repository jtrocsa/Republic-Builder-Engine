import "./styles/global.css";
import { BRAND, UNIT_01, CASE_001_SOURCES, REVIEW } from "./content/unit-01-campaign.js";
import {
  UNIT_02,
  CASE_004_SOURCES,
  CASE_004_LANES,
  UNIT_02_REVIEW,
} from "./content/unit-02-campaign.js";
import { UNIT_03, CASE_007_SOURCES, CASE_007_LANES } from "./content/unit-03-campaign.js";
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
  UNIT_01_ARCHIVE_CHALLENGE_QUESTS,
  UNIT_01_ARCHIVE_EVIDENCE_QUESTS,
} from "./content/quests/unit-01-quests.js";
import {
  UNIT_02_MCQ_QUESTS,
  UNIT_02_SEQUENCING_QUESTS,
  UNIT_02_EVIDENCE_ORGANIZING_QUESTS,
  UNIT_02_SOURCE_ANALYSIS_QUESTS,
  UNIT_02_ARCHIVE_CHALLENGE_QUESTS,
  UNIT_02_INVESTIGATION_EVIDENCE_QUESTS,
  UNIT_02_ARCHIVE_STRONGEST_EVIDENCE_QUESTS,
} from "./content/quests/unit-02-quests.js";
import {
  UNIT_03_MCQ_QUESTS,
  UNIT_03_SEQUENCING_QUESTS,
  UNIT_03_EVIDENCE_ORGANIZING_QUESTS,
  UNIT_03_SOURCE_ANALYSIS_QUESTS,
  UNIT_03_INVESTIGATION_QUESTS,
  UNIT_03_INVESTIGATION_MCQ_QUESTS,
  UNIT_03_ARCHIVE_CHALLENGE_QUESTS,
  UNIT_03_ARCHIVE_SAQ_QUESTS,
  UNIT_03_ARCHIVE_DBQ_QUESTS,
} from "./content/quests/unit-03-quests.js";
import { renderTiledMap, createTilesetImageResolver } from "./engine/tiled-map-loader.js";
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
import hallwayTmjRaw from "./content/maps/hallway.tmj?raw";
import commonCauseTmjRaw from "./content/maps/common-cause-field.tmj?raw";
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

const app = document.querySelector("#app");
const chroniclerPreviewA = new URL("./assets/chronicle-sprites/chronicler-a.png", import.meta.url)
  .href;
const chroniclerPreviewB = new URL("./assets/chronicle-sprites/chronicler-b.png", import.meta.url)
  .href;
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
// Scoped to the exact three sheets the .tmj references (tile-B-04, 1.png, farm/3.png),
// not the whole pack folders — see docs/architecture/art-and-map-style-guide.md and
// docs/architecture/tiled-map-import-checklist.md. This previously globbed whole pack
// folders (13-16 unused sheets bundled per pack), the same unscoped-glob regression the
// checklist warns about; Caribbean/Archive already scope by exact file.
const resolveRiverbendTilesetImage = createTilesetImageResolver(
  import.meta.glob("./assets/tilesets/Medieval Fishing Village/tile-B-04.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Medieval Fantasy Town/1.png", {
    eager: true,
    import: "default",
  }),
  // farm/6 (ground, crops, trees, fencing, well) and farm/7 (clapboard houses and barns) replaced
  // farm/3 in the 56x36 rebuild — see the palette for why.
  import.meta.glob("./assets/tilesets/farm/6.png", { eager: true, import: "default" }),
  import.meta.glob("./assets/tilesets/farm/7.png", { eager: true, import: "default" })
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
  })
);
function renderCaribbeanTiledMap() {
  renderTiledMapWithOverlay("caribbeanTiledCanvas", caribbeanTmj, resolveCaribbeanTilesetImage);
}
// Institute Archive Room interior — see docs/decision-log/0030-archive-room-tiled-interior.md.
// Generated by scripts/generate-archive-room-tmj.js against the "Medieval Tavern" pack (same
// 48px/16-column tile family as Riverbend/Caribbean above). ARCHIVE_ROOM_BLOCK_RECTS below is
// hand-measured to match this art's shelving/table placement.
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
  })
);
function renderArchiveRoomTiledMap() {
  const canvas = document.getElementById("archiveRoomTiledCanvas");
  if (!canvas || canvas.dataset.rendered === "true") return;
  renderTiledMap(canvas, archiveRoomTmj, resolveArchiveRoomTilesetImage).then(() => {
    canvas.dataset.rendered = "true";
  });
}
// Onboarding hallway corridor — see scripts/generate-hallway-tmj.js. Reuses the exact same three
// Medieval Tavern sheets as the Archive Room above (the glob calls target identical file paths,
// so Vite doesn't bundle any additional tileset sheets) for visual continuity between the two
// Institute interiors. This is a scripted cutscene (runHallwayWalk() in main.js drives the sprite
// positions directly), so unlike Archive Room there's no HALLWAY_GRID/BLOCK_RECTS/TARGETS —
// no player movement or collision happens here.
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
  })
);
function renderHallwayTiledMap() {
  const canvas = document.getElementById("hallwayTiledCanvas");
  if (!canvas || canvas.dataset.rendered === "true") return;
  renderTiledMap(canvas, hallwayTmj, resolveHallwayTilesetImage).then(() => {
    canvas.dataset.rendered = "true";
  });
}
// Common Cause field (Unit 3) Tiled rebuild — see docs/decision-log/0032-common-cause-tiled-rebuild.md.
// Replaces the earlier CSS-drawn scene (commonCauseWorldMarkup()'s old div-per-block approach)
// with a real tileset composite, generated by scripts/generate-common-cause-tmj.js. Building art
// is drawn from the existing Medieval Fantasy Town / Medieval Fishing Village packs (no new
// custom sheet, per art-and-map-style-guide.md's preference for reusing the existing art family);
// the liberty pole, with no existing-pack equivalent, is the one PixelLab-generated asset.
const commonCauseTmj = JSON.parse(commonCauseTmjRaw);
const resolveCommonCauseTilesetImage = createTilesetImageResolver(
  import.meta.glob("./assets/tilesets/Medieval Fantasy Town/1.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Medieval Fantasy Town/2.png", {
    eager: true,
    import: "default",
  }),
  import.meta.glob("./assets/tilesets/Medieval Fantasy Town/5.png", {
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
  // Added in the 56x36 rebuild: clapboard housing, churchyard fencing/trees, and the library's
  // only period square-rigged hulls for the Delaware waterfront.
  import.meta.glob("./assets/tilesets/farm/7.png", { eager: true, import: "default" }),
  import.meta.glob("./assets/tilesets/farm/6.png", { eager: true, import: "default" }),
  import.meta.glob("./assets/tilesets/Medieval harbor/tile-B-04.png", {
    eager: true,
    import: "default",
  })
);
function renderCommonCauseTiledMap() {
  renderTiledMapWithOverlay("commonCauseTiledCanvas", commonCauseTmj, resolveCommonCauseTilesetImage);
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
const fieldNpcSprites = {
  "taino-elder": new URL("./assets/chronicle-sprites/field/npc-taino-elder.png", import.meta.url)
    .href,
  "taino-gardener": new URL(
    "./assets/chronicle-sprites/field/npc-taino-gardener.png",
    import.meta.url
  ).href,
  "taino-fisher": new URL("./assets/chronicle-sprites/field/npc-taino-fisher.png", import.meta.url)
    .href,
  "spanish-sailor": new URL(
    "./assets/chronicle-sprites/field/npc-spanish-sailor.png",
    import.meta.url
  ).href,
  columbus: new URL("./assets/chronicle-sprites/field/npc-columbus.png", import.meta.url).href,
  "spanish-scribe": new URL("./assets/chronicle-sprites/field/npc-scribe.png", import.meta.url)
    .href,
  "taino-elder-step": new URL(
    "./assets/chronicle-sprites/field/npc-taino-elder-step.png",
    import.meta.url
  ).href,
  "taino-gardener-step": new URL(
    "./assets/chronicle-sprites/field/npc-taino-gardener-step.png",
    import.meta.url
  ).href,
  "taino-fisher-step": new URL(
    "./assets/chronicle-sprites/field/npc-taino-fisher-step.png",
    import.meta.url
  ).href,
  "spanish-sailor-step": new URL(
    "./assets/chronicle-sprites/field/npc-spanish-sailor-step.png",
    import.meta.url
  ).href,
  "columbus-step": new URL(
    "./assets/chronicle-sprites/field/npc-columbus-step.png",
    import.meta.url
  ).href,
  "spanish-scribe-step": new URL(
    "./assets/chronicle-sprites/field/npc-scribe-step.png",
    import.meta.url
  ).href,
  "taino-elder-side": new URL(
    "./assets/chronicle-sprites/field/npc-taino-elder-side.png",
    import.meta.url
  ).href,
  "taino-gardener-side": new URL(
    "./assets/chronicle-sprites/field/npc-taino-gardener-side.png",
    import.meta.url
  ).href,
  "taino-fisher-side": new URL(
    "./assets/chronicle-sprites/field/npc-taino-fisher-side.png",
    import.meta.url
  ).href,
  "spanish-sailor-side": new URL(
    "./assets/chronicle-sprites/field/npc-spanish-sailor-side.png",
    import.meta.url
  ).href,
  "columbus-side": new URL(
    "./assets/chronicle-sprites/field/npc-columbus-side.png",
    import.meta.url
  ).href,
  "spanish-scribe-side": new URL(
    "./assets/chronicle-sprites/field/npc-scribe-side.png",
    import.meta.url
  ).href,
  "taino-elder-side-step": new URL(
    "./assets/chronicle-sprites/field/npc-taino-elder-side-step.png",
    import.meta.url
  ).href,
  "taino-gardener-side-step": new URL(
    "./assets/chronicle-sprites/field/npc-taino-gardener-side-step.png",
    import.meta.url
  ).href,
  "taino-fisher-side-step": new URL(
    "./assets/chronicle-sprites/field/npc-taino-fisher-side-step.png",
    import.meta.url
  ).href,
  "spanish-sailor-side-step": new URL(
    "./assets/chronicle-sprites/field/npc-spanish-sailor-side-step.png",
    import.meta.url
  ).href,
  "columbus-side-step": new URL(
    "./assets/chronicle-sprites/field/npc-columbus-side-step.png",
    import.meta.url
  ).href,
  "spanish-scribe-side-step": new URL(
    "./assets/chronicle-sprites/field/npc-scribe-side-step.png",
    import.meta.url
  ).href,
};

const fieldSpriteAssets = {
  a: {
    down: {
      idle: new URL("./assets/chronicle-sprites/field/chronicler-a-down-idle.png", import.meta.url)
        .href,
      step: new URL("./assets/chronicle-sprites/field/chronicler-a-down-step.png", import.meta.url)
        .href,
    },
    up: {
      idle: new URL("./assets/chronicle-sprites/field/chronicler-a-up-idle.png", import.meta.url)
        .href,
      step: new URL("./assets/chronicle-sprites/field/chronicler-a-up-step.png", import.meta.url)
        .href,
    },
    side: {
      idle: new URL("./assets/chronicle-sprites/field/chronicler-a-side-idle.png", import.meta.url)
        .href,
      step: new URL("./assets/chronicle-sprites/field/chronicler-a-side-step.png", import.meta.url)
        .href,
    },
  },
  b: {
    down: {
      idle: new URL("./assets/chronicle-sprites/field/chronicler-b-down-idle.png", import.meta.url)
        .href,
      step: new URL("./assets/chronicle-sprites/field/chronicler-b-down-step.png", import.meta.url)
        .href,
    },
    up: {
      idle: new URL("./assets/chronicle-sprites/field/chronicler-b-up-idle.png", import.meta.url)
        .href,
      step: new URL("./assets/chronicle-sprites/field/chronicler-b-up-step.png", import.meta.url)
        .href,
    },
    side: {
      idle: new URL("./assets/chronicle-sprites/field/chronicler-b-side-idle.png", import.meta.url)
        .href,
      step: new URL("./assets/chronicle-sprites/field/chronicler-b-side-step.png", import.meta.url)
        .href,
    },
  },
};
const instituteHubBackground = new URL(
  "./assets/institute/chronicle-institute-hub.png",
  import.meta.url
).href;
const instituteNpcSprites = {
  director: new URL("./assets/institute/director-rowan-hale.png", import.meta.url).href,
  amani: new URL("./assets/institute/researcher-amani-soto.png", import.meta.url).href,
  julian: new URL("./assets/institute/professor-julian-park.png", import.meta.url).href,
  "director-side": new URL("./assets/institute/director-rowan-hale-side.png", import.meta.url).href,
  "amani-side": new URL("./assets/institute/researcher-amani-soto-side.png", import.meta.url).href,
  "julian-side": new URL("./assets/institute/professor-julian-park-side.png", import.meta.url).href,
  "director-side-step": new URL(
    "./assets/institute/director-rowan-hale-side-step.png",
    import.meta.url
  ).href,
  "amani-side-step": new URL(
    "./assets/institute/researcher-amani-soto-side-step.png",
    import.meta.url
  ).href,
  "julian-side-step": new URL(
    "./assets/institute/professor-julian-park-side-step.png",
    import.meta.url
  ).href,
};

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
// Feet collide with bases, not decorative overlap (Pokémon-style physics layer), so each rect
// covers only the object's ground-contact row — the roof of a hut or the crown of a palm is
// walk-behind. Every anchor here matches a stamp in scripts/generate-caribbean-tmj.js and is
// cross-checked by tests/unit/field-map-coordinates.test.js.
const FIELD_BLOCKS = [
  // Taíno village, north lobe.
  { x1: 29.0, y1: 6.6, x2: 31.0, y2: 8.0, kind: "principal dwelling" },
  { x1: 25.0, y1: 8.6, x2: 27.0, y2: 10.0, kind: "bohio one" },
  { x1: 34.0, y1: 7.6, x2: 36.0, y2: 9.0, kind: "bohio two" },
  { x1: 37.0, y1: 10.6, x2: 39.0, y2: 12.0, kind: "bohio three" },
  { x1: 24.0, y1: 11.6, x2: 26.0, y2: 13.0, kind: "bohio four" },
  { x1: 31.0, y1: 10.6, x2: 33.0, y2: 12.0, kind: "work canopy" },
  { x1: 35.0, y1: 12.6, x2: 37.0, y2: 14.0, kind: "drying rack" },
  { x1: 20.0, y1: 12.0, x2: 24.0, y2: 14.0, kind: "conuco garden" },
  { x1: 33.0, y1: 15.3, x2: 34.0, y2: 16.0, kind: "village canoe" },
  { x1: 20.0, y1: 16.3, x2: 21.0, y2: 17.0, kind: "second canoe" },
  { x1: 31.0, y1: 16.3, x2: 32.0, y2: 17.0, kind: "village fire" },
  // Columbus's landing, northwest cove.
  { x1: 10.0, y1: 17.6, x2: 13.0, y2: 19.0, kind: "cartographer table" },
  { x1: 14.0, y1: 16.6, x2: 16.0, y2: 18.0, kind: "chart scrolls" },
  { x1: 8.0, y1: 20.6, x2: 10.0, y2: 22.0, kind: "beached anchor" },
  { x1: 6.0, y1: 13.6, x2: 7.0, y2: 15.0, kind: "ship's boat" },
  { x1: 9.0, y1: 15.3, x2: 11.0, y2: 16.0, kind: "landed stores" },
  // Spanish camp, southeast point.
  { x1: 44.0, y1: 21.3, x2: 45.0, y2: 22.0, kind: "command tent" },
  { x1: 47.0, y1: 22.3, x2: 48.0, y2: 23.0, kind: "second tent" },
  { x1: 45.0, y1: 23.3, x2: 46.0, y2: 24.0, kind: "camp fire" },
  { x1: 42.0, y1: 24.3, x2: 44.0, y2: 25.0, kind: "supply crates" },
  // Palms — trunk base only; the crown one row above is walk-behind.
  { x1: 16.0, y1: 15.4, x2: 17.0, y2: 16.0, kind: "palm" },
  { x1: 20.0, y1: 23.4, x2: 21.0, y2: 24.0, kind: "palm" },
  { x1: 34.0, y1: 16.4, x2: 35.0, y2: 17.0, kind: "palm" },
  { x1: 42.0, y1: 17.4, x2: 43.0, y2: 18.0, kind: "palm" },
  { x1: 25.0, y1: 27.4, x2: 26.0, y2: 28.0, kind: "palm" },
  { x1: 19.0, y1: 30.4, x2: 20.0, y2: 31.0, kind: "palm" },
  { x1: 48.0, y1: 19.4, x2: 49.0, y2: 20.0, kind: "palm" },
  { x1: 11.0, y1: 22.4, x2: 12.0, y2: 23.0, kind: "palm" },
  { x1: 37.0, y1: 7.4, x2: 38.0, y2: 8.0, kind: "palm" },
  { x1: 31.0, y1: 25.4, x2: 32.0, y2: 26.0, kind: "palm" },
  { x1: 8.0, y1: 18.4, x2: 9.0, y2: 19.0, kind: "palm" },
];
const FIELD_NPCS = [
  {
    id: "taino-elder",
    x: 30.0,
    y: 13.5,
    group: "taino",
    name: "Taíno community elder",
    label: "Community elder",
    sprite: "taino-elder",
    text: "Our homes, gardens, and canoes do not appear by chance. Families work here each day, and elders listen before a choice is made for the village.",
  },
  {
    id: "taino-gardener",
    x: 22.0,
    y: 10.4,
    group: "taino",
    name: "Taíno gardener",
    label: "Garden worker",
    sprite: "taino-gardener",
    text: "This ground has been worked by many hands. Cassava and maize feed our families; the garden tells you we know this place well.",
  },
  {
    id: "taino-fisher",
    x: 37.5,
    y: 17.5,
    group: "taino",
    name: "Taíno canoe worker",
    label: "Canoe worker",
    sprite: "taino-fisher",
    text: "The water is a road to us. A good canoe carries food, news, and neighbors farther than a stranger may understand at first glance.",
  },
  {
    id: "spanish-sailor",
    x: 45.5,
    y: 20.5,
    group: "spanish",
    name: "Spanish sailor",
    label: "Spanish sailor",
    sprite: "spanish-sailor",
    text: "We sailed for crown and faith, and every man here hopes the voyage brings reward. That hope shapes what we notice and what we report.",
  },
  {
    id: "columbus",
    x: 11.5,
    y: 16.0,
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
];
const FIELD_NPC_PATROLS = {
  "taino-elder": [
    { x: 30.0, y: 13.5 },
    { x: 29.2, y: 13.8 },
    { x: 29.8, y: 14.6 },
    { x: 30.6, y: 14.2 },
  ],
  // Paces the north edge of the conuco garden without stepping into it — the garden is a
  // collision rect (20.0,12.0-24.0,14.0), so every waypoint stays clear of y=12.0.
  "taino-gardener": [
    { x: 22.0, y: 10.4 },
    { x: 22.9, y: 10.3 },
    { x: 23.2, y: 10.9 },
    { x: 21.7, y: 10.9 },
  ],
  "taino-fisher": [
    { x: 37.5, y: 17.5 },
    { x: 36.5, y: 17.4 },
    { x: 36.1, y: 18.2 },
    { x: 37.3, y: 18.3 },
  ],
  "spanish-sailor": [
    { x: 45.5, y: 20.5 },
    { x: 46.2, y: 20.5 },
    { x: 46.3, y: 19.9 },
    { x: 45.7, y: 19.6 },
  ],
  columbus: [
    { x: 11.5, y: 16.0 },
    { x: 12.2, y: 16.0 },
    { x: 11.9, y: 16.7 },
    { x: 11.1, y: 16.6 },
  ],
  "spanish-scribe": [
    { x: 42.5, y: 22.5 },
    { x: 43.1, y: 22.1 },
    { x: 43.0, y: 22.9 },
    { x: 42.3, y: 22.9 },
  ],
};
function buildFieldNpcRuntime(npcs, patrols) {
  return Object.fromEntries(
    npcs.map((npc, index) => {
      const path = patrols[npc.id] || [{ x: npc.x, y: npc.y }];
      return [
        npc.id,
        {
          path,
          index: 0,
          x: path[0].x,
          y: path[0].y,
          nextTick: 900 + index * 260,
          speed: 0.012 + (index % 3) * 0.003,
          walking: false,
          facing: "down",
        },
      ];
    })
  );
}
let fieldNpcRuntime = buildFieldNpcRuntime(FIELD_NPCS, FIELD_NPC_PATROLS);
let fieldNpcRuntimeMapId = "unit-01";
function ensureFieldNpcRuntime() {
  const map = activeFieldMap();
  if (fieldNpcRuntimeMapId !== map.id) {
    fieldNpcRuntime = buildFieldNpcRuntime(map.npcs, map.patrols);
    fieldNpcRuntimeMapId = map.id;
  }
  return fieldNpcRuntime;
}
const fieldHeldKeys = new Set();
let fieldMoveFrame = null;
let lastFieldMoveAt = 0;
function fieldNpcState(npc) {
  return fieldNpcRuntime[npc.id] || { x: npc.x, y: npc.y, walking: false, facing: "down" };
}
function fieldNpcFrameUrls(npc, facing = "down") {
  const side = facing === "left" || facing === "right";
  const baseKey = side ? `${npc.sprite}-side` : npc.sprite;
  const idle =
    fieldNpcSprites[baseKey] || fieldNpcSprites[npc.sprite] || fieldNpcSprites["taino-elder"];
  const step = fieldNpcSprites[`${baseKey}-step`] || fieldNpcSprites[`${npc.sprite}-step`] || idle;
  return { idle, step };
}
function hubNpcSpriteUrl(id, facing = "down", walking = false) {
  const side = facing === "left" || facing === "right";
  if (side)
    return (
      instituteNpcSprites[`${id}-side${walking ? "-step" : ""}`] ||
      instituteNpcSprites[`${id}-side`] ||
      instituteNpcSprites[id]
    );
  return instituteNpcSprites[id];
}
function fieldNpcFootBoxAt(x, y) {
  return { x1: x - 0.36, x2: x + 0.36, y1: y + 0.2, y2: y + 0.88 };
}
function isFieldNpcBlocked(id, x, y) {
  const map = activeFieldMap();
  const foot = fieldNpcFootBoxAt(x, y);
  if (!isNpcStandingOnLand(x, y)) return true;
  if (map.blocks.some((block) => rectsOverlap(foot, block))) return true;
  const playerFoot = footBoxFor(fieldMovement.x, fieldMovement.y);
  if (rectsOverlap(foot, playerFoot)) return true;
  return map.npcs.some((other) => {
    if (other.id === id) return false;
    const state = fieldNpcState(other);
    return rectsOverlap(foot, fieldNpcFootBoxAt(state.x, state.y));
  });
}
function updateFieldNpcs() {
  if (progress.currentScreen !== "field") return;
  ensureFieldNpcRuntime();
  Object.entries(fieldNpcRuntime).forEach(([id, state], index) => {
    if (progress.activeFieldNpc === id) {
      state.walking = false;
      const node = document.querySelector(`[data-npc="${id}"]`);
      if (node) {
        node.style.left = `${(state.x * FIELD_GRID.tile).toFixed(1)}px`;
        node.style.top = `${(state.y * FIELD_GRID.tile).toFixed(1)}px`;
        node.classList.toggle("is-walking-npc", false);
        node.dataset.facing = state.facing;
        const npc = activeFieldMap().npcs.find((item) => item.id === id);
        if (npc) {
          const frames = fieldNpcFrameUrls(npc, state.facing);
          node.querySelector(".npc-frame--idle")?.setAttribute("src", frames.idle);
          node.querySelector(".npc-frame--step")?.setAttribute("src", frames.step);
        }
      }
      return;
    }
    state.nextTick -= 80;
    const targetIndex = (state.index + 1) % state.path.length;
    const target = state.path[targetIndex];
    const dx = target.x - state.x;
    const dy = target.y - state.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 0.035) {
      state.x = target.x;
      state.y = target.y;
      state.walking = false;
      if (state.nextTick <= 0) {
        state.index = targetIndex;
        state.nextTick = 1050 + index * 190 + Math.random() * 900;
      }
    } else if (state.nextTick <= 0) {
      const nextX = state.x + (dx / distance) * state.speed;
      const nextY = state.y + (dy / distance) * state.speed;
      if (!isFieldNpcBlocked(id, nextX, nextY)) {
        state.x = nextX;
        state.y = nextY;
        state.walking = true;
        state.facing =
          Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
      } else {
        state.walking = false;
        state.index = targetIndex;
        state.nextTick = 900 + index * 170 + Math.random() * 700;
      }
    }
    const node = document.querySelector(`[data-npc="${id}"]`);
    if (node) {
      node.style.left = `${(state.x * FIELD_GRID.tile).toFixed(1)}px`;
      node.style.top = `${(state.y * FIELD_GRID.tile).toFixed(1)}px`;
      node.classList.toggle("is-walking-npc", state.walking);
      node.dataset.facing = state.facing;
      const npc = activeFieldMap().npcs.find((item) => item.id === id);
      if (npc) {
        const frames = fieldNpcFrameUrls(npc, state.facing);
        node.querySelector(".npc-frame--idle")?.setAttribute("src", frames.idle);
        node.querySelector(".npc-frame--step")?.setAttribute("src", frames.step);
      }
    }
  });
  updateFieldPlayer();
}
if (app) setInterval(updateFieldNpcs, 80);

const FIELD_SOURCE_POINTS = {
  "taino-context": { x: 27.0, y: 11.0, label: "Village investigation", kind: "Observe" },
  "columbus-letter": { x: 12.6, y: 14.6, label: "Columbus account", kind: "Source" },
  "waldseemuller-map": { x: 11.5, y: 17.2, label: "Cartographer table", kind: "Puzzle" },
};
const VILLAGE_OBSERVATIONS = [
  {
    id: "elder",
    title: "Community elder",
    scene:
      "The elder listens while two villagers point toward a shoreline path and a garden worker. Decisions appear to move through a recognized leader, not a random crowd.",
    note: "Leadership and social organization existed before Europeans arrived.",
  },
  {
    id: "bohio",
    title: "Bohío homes",
    scene:
      "Rounded houses, shared work areas, and stored goods show that this is an occupied community with family life and repeated daily routines.",
    note: "Homes and settlement patterns contradict the idea of an empty island.",
  },
  {
    id: "garden",
    title: "Garden and canoe work",
    scene:
      "A garden worker and canoe worker move between cultivated land and the shore, connecting food, travel, labor, and local exchange.",
    note: "Food production and shoreline activity show skill, work, and exchange.",
  },
];
const MAP_PIECES = [
  { id: "p1", label: "Map piece", col: 0, row: 0 },
  { id: "p2", label: "Map piece", col: 1, row: 0 },
  { id: "p3", label: "Map piece", col: 2, row: 0 },
  { id: "p4", label: "Map piece", col: 3, row: 0 },
  { id: "p5", label: "Map piece", col: 4, row: 0 },
  { id: "p6", label: "Map piece", col: 0, row: 1 },
  { id: "p7", label: "Map piece", col: 1, row: 1 },
  { id: "p8", label: "Map piece", col: 2, row: 1 },
  { id: "p9", label: "Map piece", col: 3, row: 1 },
  { id: "p10", label: "Map piece", col: 4, row: 1 },
];
const MAP_TRAY_ORDER = ["p7", "p2", "p10", "p4", "p1", "p9", "p3", "p6", "p5", "p8"];

// ---- Unit 2 field: Riverbend Settlement (placeholder data, same engine) ----
// Bases only, matching the stamps in scripts/generate-riverbend-tmj.js. The crop plots carry no
// rect on purpose — the rows are ground-and-prop art the player walks through, as on a real farm.
const UNIT2_FIELD_BLOCKS = [
  { x1: 24.0, y1: 8.6, x2: 28.0, y2: 10.0, kind: "meetinghouse" },
  { x1: 20.0, y1: 12.6, x2: 22.0, y2: 14.0, kind: "dwelling one" },
  { x1: 31.0, y1: 6.6, x2: 33.0, y2: 8.0, kind: "dwelling two" },
  { x1: 34.0, y1: 11.6, x2: 36.0, y2: 13.0, kind: "dwelling three" },
  { x1: 21.0, y1: 16.6, x2: 23.0, y2: 18.0, kind: "dwelling four" },
  { x1: 29.0, y1: 15.6, x2: 31.0, y2: 17.0, kind: "dwelling five" },
  { x1: 37.0, y1: 17.6, x2: 40.0, y2: 19.0, kind: "barn" },
  { x1: 28.0, y1: 12.6, x2: 30.0, y2: 14.0, kind: "well" },
  { x1: 22.0, y1: 22.6, x2: 24.0, y2: 24.0, kind: "storage shed" },
  { x1: 45.0, y1: 9.6, x2: 46.0, y2: 11.0, kind: "scarecrow" },
  { x1: 18.0, y1: 20.6, x2: 20.0, y2: 21.0, kind: "wharf market stall" },
  // Shade trees standing inside the settlement — trunk row only; the canopy is on the map's
  // overlay layer and draws over the player.
  { x1: 33.0, y1: 21.4, x2: 35.0, y2: 22.0, kind: "shade tree" },
  { x1: 24.0, y1: 30.4, x2: 27.0, y2: 31.0, kind: "shade tree" },
  { x1: 36.0, y1: 9.4, x2: 39.0, y2: 10.0, kind: "shade tree" },
];
const UNIT2_FIELD_NPCS = [
  // Placeholder roster: sprites reuse Unit 1 art until Unit 2 sprites exist.
  {
    id: "settlement-minister",
    x: 26.0,
    y: 11.5,
    group: "settlement",
    name: "Settlement minister",
    label: "Minister",
    sprite: "spanish-scribe",
    text: "The meetinghouse holds this settlement's promises — read the charter before you judge who benefits from them.",
  },
  {
    id: "indentured-servant",
    x: 44.0,
    y: 16.0,
    group: "settlement",
    name: "Indentured field servant",
    label: "Field servant",
    sprite: "taino-gardener",
    text: "Seven years I owe for my passage. The rows do not care whose name is on the contract.",
  },
  {
    id: "settlement-burgess",
    x: 30.0,
    y: 10.5,
    group: "settlement",
    name: "Elected burgess",
    label: "Burgess",
    sprite: "columbus",
    text: "We meet, we vote, we send our grievances — self-government grows here because the ocean is wide.",
  },
  {
    id: "settlement-goodwife",
    x: 31.5,
    y: 13.0,
    group: "settlement",
    name: "Goodwife of the settlement",
    label: "Goodwife",
    sprite: "taino-elder",
    text: "Count who does the washing, the brewing, the tending — the record books forget us, but the settlement would starve without us.",
  },
  {
    id: "river-fisher",
    x: 19.0,
    y: 23.0,
    group: "settlement",
    name: "River fisher",
    label: "Fisher",
    sprite: "taino-fisher",
    text: "The river feeds us and carries the hogsheads away. Everything here moves by water.",
  },
  {
    id: "wharf-clerk",
    x: 21.0,
    y: 20.0,
    group: "settlement",
    name: "Wharf clerk",
    label: "Clerk",
    sprite: "spanish-sailor",
    text: "Every cask is entered twice — once for the company, once for the customs man. Ledgers remember what people forget.",
  },
];
const UNIT2_FIELD_NPC_PATROLS = {
  "settlement-minister": [
    { x: 26.0, y: 11.5 },
    { x: 26.8, y: 11.3 },
    { x: 27.0, y: 12.0 },
    { x: 25.7, y: 12.1 },
  ],
  "indentured-servant": [
    { x: 44.0, y: 16.0 },
    { x: 44.9, y: 15.8 },
    { x: 45.1, y: 16.6 },
    { x: 43.7, y: 16.7 },
  ],
  "settlement-burgess": [
    { x: 30.0, y: 10.5 },
    { x: 30.9, y: 10.3 },
    { x: 31.1, y: 11.0 },
    { x: 29.8, y: 11.1 },
  ],
  "settlement-goodwife": [
    { x: 31.5, y: 13.0 },
    { x: 32.3, y: 12.8 },
    { x: 32.5, y: 13.6 },
    { x: 31.2, y: 13.7 },
  ],
  "river-fisher": [
    { x: 19.0, y: 23.0 },
    { x: 19.8, y: 22.7 },
    { x: 20.1, y: 23.5 },
    { x: 18.8, y: 23.6 },
  ],
  "wharf-clerk": [
    { x: 21.0, y: 20.0 },
    { x: 21.8, y: 19.8 },
    { x: 22.0, y: 20.4 },
    { x: 20.8, y: 20.5 },
  ],
};
const UNIT2_FIELD_SOURCE_POINTS = {
  "riverbend-charter": { x: 26.0, y: 11.0, label: "Company charter", kind: "Source" },
  "riverbend-letter": { x: 44.0, y: 15.5, label: "Servant's letter", kind: "Source" },
  "riverbend-ledger": { x: 20.5, y: 22.0, label: "Wharf accounts", kind: "Source" },
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
// scripts/generate-common-cause-tmj.js. UNIT3_FIELD_BLOCKS below is the source of truth for
// collision; the generator script's stamp() anchors are kept in sync with it manually, the
// same convention scripts/generate-caribbean-tmj.js established for case-001.
const UNIT3_FIELD_BLOCKS = [
  // Civic buildings ringing the square.
  { x1: 25.0, y1: 6.6, x2: 29.0, y2: 8.0, kind: "assembly hall" },
  { x1: 25.0, y1: 8.2, x2: 29.0, y2: 9.0, kind: "statehouse steps" },
  { x1: 45.0, y1: 8.0, x2: 47.0, y2: 9.0, kind: "chapel" },
  { x1: 14.0, y1: 7.6, x2: 18.0, y2: 9.0, kind: "print shop" },
  { x1: 38.0, y1: 7.6, x2: 42.0, y2: 9.0, kind: "merchant townhouse" },
  { x1: 5.0, y1: 14.0, x2: 7.0, y2: 15.0, kind: "frontier dispatch post" },
  { x1: 9.0, y1: 24.6, x2: 13.0, y2: 26.0, kind: "family residence" },
  { x1: 38.0, y1: 25.6, x2: 41.0, y2: 27.0, kind: "warehouse" },
  // The square.
  { x1: 27.0, y1: 13.0, x2: 28.0, y2: 14.0, kind: "liberty pole" },
  { x1: 26.0, y1: 16.6, x2: 28.0, y2: 18.0, kind: "town well" },
  { x1: 30.0, y1: 20.0, x2: 34.0, y2: 21.0, kind: "market stalls" },
  { x1: 34.0, y1: 19.6, x2: 36.0, y2: 21.0, kind: "awning stall" },
  { x1: 22.0, y1: 19.6, x2: 24.0, y2: 21.0, kind: "awning stall two" },
  { x1: 21.0, y1: 27.0, x2: 25.0, y2: 28.0, kind: "wharf" },
  // Clapboard housing.
  { x1: 9.0, y1: 6.6, x2: 11.0, y2: 8.0, kind: "dwelling" },
  { x1: 9.0, y1: 17.6, x2: 11.0, y2: 19.0, kind: "dwelling" },
  { x1: 12.0, y1: 12.6, x2: 14.0, y2: 14.0, kind: "dwelling" },
  { x1: 17.0, y1: 12.6, x2: 19.0, y2: 14.0, kind: "dwelling" },
  { x1: 17.0, y1: 19.6, x2: 19.0, y2: 21.0, kind: "dwelling" },
  { x1: 15.0, y1: 25.6, x2: 17.0, y2: 27.0, kind: "dwelling" },
  { x1: 5.0, y1: 22.6, x2: 7.0, y2: 24.0, kind: "dwelling" },
  { x1: 37.0, y1: 11.6, x2: 39.0, y2: 13.0, kind: "dwelling" },
  { x1: 43.0, y1: 12.6, x2: 45.0, y2: 14.0, kind: "dwelling" },
  { x1: 43.0, y1: 18.6, x2: 45.0, y2: 20.0, kind: "dwelling" },
  { x1: 48.0, y1: 8.6, x2: 50.0, y2: 10.0, kind: "dwelling" },
  { x1: 48.0, y1: 20.6, x2: 50.0, y2: 22.0, kind: "dwelling" },
  { x1: 50.0, y1: 13.6, x2: 52.0, y2: 15.0, kind: "dwelling" },
  { x1: 44.0, y1: 25.6, x2: 46.0, y2: 27.0, kind: "dwelling" },
  // Shade trees — trunk row only; the canopy is on the map's overlay layer.
  { x1: 11.0, y1: 5.4, x2: 14.0, y2: 6.0, kind: "shade tree" },
  { x1: 20.0, y1: 5.4, x2: 22.0, y2: 6.0, kind: "shade tree" },
  { x1: 33.0, y1: 4.4, x2: 36.0, y2: 5.0, kind: "shade tree" },
  { x1: 18.0, y1: 26.4, x2: 21.0, y2: 27.0, kind: "shade tree" },
  { x1: 46.0, y1: 17.4, x2: 48.0, y2: 18.0, kind: "shade tree" },
];
const UNIT3_FIELD_NPCS = [
  // Placeholder roster: sprites reuse Unit 1 field art, same as Unit 2's roster above —
  // no Revolutionary-era sprite sheets exist yet.
  {
    id: "printer-apprentice",
    x: 16.0,
    y: 10.5,
    group: "commoncause",
    name: "Printer's apprentice",
    label: "Printer's apprentice",
    sprite: "spanish-scribe",
    text: "Type must be set backward, letter by letter, until the words print true. Master Dickinson's letters go out under a farmer's name — safer for a press, and no less read for it.",
  },
  {
    id: "town-crier",
    x: 29.0,
    y: 13.5,
    group: "commoncause",
    name: "Town crier",
    label: "Town crier",
    sprite: "columbus",
    text: "Hear ye — Parliament's duties still stand, and talk in every tavern turns to committees, boycotts, and what a colony owes its King. I only carry the news; deciding what to do with it is your affair.",
  },
  {
    id: "militia-recruiter",
    x: 31.0,
    y: 10.0,
    group: "commoncause",
    name: "Militia recruiter",
    label: "Militia recruiter",
    sprite: "spanish-sailor",
    text: "Muster on the green Tuesday next. A man who won't drill now may wish later he had — word from Virginia says even the House of Burgesses is arming its militia.",
  },
  {
    id: "free-tradesman",
    x: 29.0,
    y: 20.0,
    group: "commoncause",
    name: "Free Black tradesman",
    label: "Tradesman",
    sprite: "taino-elder",
    text: "I read the broadsides same as any freeman here. Strange, to hear talk of chains and slavery from men who'd never let it touch their own thinking on who else wears them.",
  },
  {
    id: "loyalist-merchant",
    x: 27.0,
    y: 26.0,
    group: "commoncause",
    name: "Loyalist merchant",
    label: "Merchant",
    sprite: "taino-fisher",
    text: "My ledgers balance because the Crown's ships still call at this port. I'll not pretend disorder in the streets is good for trade, whatever cause it claims to serve.",
  },
  {
    id: "farmwife",
    x: 14.0,
    y: 23.0,
    group: "commoncause",
    name: "Farmwife",
    label: "Farmwife",
    sprite: "taino-gardener",
    text: "My husband's away with the militia and the mending doesn't stop because Parliament's vexed us. Whatever new government they draft, I mean to see it remembers the women keeping the house together.",
  },
];
const UNIT3_FIELD_NPC_PATROLS = {
  "printer-apprentice": [
    { x: 16.0, y: 10.5 },
    { x: 16.7, y: 10.3 },
    { x: 17.0, y: 10.9 },
    { x: 15.7, y: 11.0 },
  ],
  "town-crier": [
    { x: 29.0, y: 13.5 },
    { x: 29.8, y: 13.3 },
    { x: 30.1, y: 14.1 },
    { x: 28.8, y: 14.2 },
  ],
  "militia-recruiter": [
    { x: 31.0, y: 10.0 },
    { x: 31.7, y: 9.8 },
    { x: 31.9, y: 10.5 },
    { x: 30.7, y: 10.6 },
  ],
  "free-tradesman": [
    { x: 29.0, y: 20.0 },
    { x: 29.4, y: 19.7 },
    { x: 29.3, y: 20.5 },
    { x: 28.6, y: 20.4 },
  ],
  "loyalist-merchant": [
    { x: 27.0, y: 26.0 },
    { x: 27.6, y: 25.7 },
    { x: 27.9, y: 26.4 },
    { x: 26.6, y: 26.5 },
  ],
  farmwife: [
    { x: 14.0, y: 23.0 },
    { x: 14.7, y: 22.7 },
    { x: 15.0, y: 23.4 },
    { x: 13.6, y: 23.5 },
  ],
};
const UNIT3_FIELD_SOURCE_POINTS = {
  "commoncause-pontiac-speech": { x: 7.5, y: 15.5, label: "Frontier dispatch", kind: "Source" },
  "commoncause-dickinson-letter": { x: 16.0, y: 9.6, label: "Print shop broadside", kind: "Source" },
  "commoncause-henry-speech": { x: 30.0, y: 7.0, label: "Assembly hall speech", kind: "Source" },
  "commoncause-wheatley-poem": { x: 46.0, y: 9.8, label: "Chapel elegy", kind: "Source" },
  "commoncause-dunmore-proclamation": { x: 33.0, y: 26.5, label: "Wharf dispatch", kind: "Source" },
  "commoncause-hall-petition": { x: 27.0, y: 9.6, label: "Statehouse petition", kind: "Source" },
  "commoncause-adams-letter": { x: 14.0, y: 25.0, label: "Home correspondence", kind: "Source" },
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

export const FIELD_MAPS = {
  "unit-01": {
    id: "unit-01",
    spawn: { x: 28.0, y: 22.0 },
    recall: { x: 22.0, y: 24.0 },
    isLand: isCaribbeanLand,
    blocks: FIELD_BLOCKS,
    npcs: FIELD_NPCS,
    patrols: FIELD_NPC_PATROLS,
    sourcePoints: FIELD_SOURCE_POINTS,
    musicScene: "island",
    worldMarkup: caribbeanWorldMarkup,
  },
  "unit-02": {
    id: "unit-02",
    spawn: { x: 26.0, y: 18.0 },
    recall: { x: 24.0, y: 19.5 },
    isLand: isRiverbendLand,
    blocks: UNIT2_FIELD_BLOCKS,
    npcs: UNIT2_FIELD_NPCS,
    patrols: UNIT2_FIELD_NPC_PATROLS,
    sourcePoints: UNIT2_FIELD_SOURCE_POINTS,
    musicScene: "settlement",
    worldMarkup: riverbendWorldMarkup,
  },
  "unit-03": {
    id: "unit-03",
    spawn: { x: 28.0, y: 22.0 },
    recall: { x: 24.0, y: 16.0 },
    isLand: isCommonCauseLand,
    blocks: UNIT3_FIELD_BLOCKS,
    npcs: UNIT3_FIELD_NPCS,
    patrols: UNIT3_FIELD_NPC_PATROLS,
    sourcePoints: UNIT3_FIELD_SOURCE_POINTS,
    musicScene: "settlement",
    worldMarkup: commonCauseWorldMarkup,
  },
};
function activeFieldMap() {
  const unit = unitForCase(progress.activeCaseId);
  return FIELD_MAPS[unit?.id] || FIELD_MAPS["unit-01"];
}
const activeFieldCaseId = () => progress.activeCaseId || "case-001";

const HUB_GRID = { columns: 18, rows: 12 };
const HUB_BLOCK_RECTS = [
  // Collision is intentionally a little smaller than the art so the Archive feels walkable.
  // These rectangles protect furniture while leaving generous Pokémon-style aisles.
  { x1: 0.9, y1: 1.15, x2: 2.45, y2: 5.4, kind: "left bookshelf" },
  { x1: 5.15, y1: 1.15, x2: 6.45, y2: 5.35, kind: "middle bookshelf" },
  { x1: 10.75, y1: 1.1, x2: 12.4, y2: 4.55, kind: "right bookshelf" },
  { x1: 13.55, y1: 1.1, x2: 15.15, y2: 1.9, kind: "wall record cabinet" },
  // Large desks and tables. The lower edge of the Navigation Table is reachable from the aisle.
  { x1: 1.85, y1: 6.95, x2: 5.35, y2: 9.45, kind: "research desk" },
  { x1: 8.55, y1: 5.15, x2: 9.1, y2: 8.2, kind: "center archive pillar" },
  { x1: 10.35, y1: 7.1, x2: 15.25, y2: 9.15, kind: "navigation table" },
  { x1: 14.25, y1: 5.05, x2: 15.85, y2: 5.75, kind: "equipment console" },
];
const HUB_TARGETS = {
  director: {
    x: 3.8,
    y: 4.2,
    name: "Director Rowan Hale",
    role: "Director of Field Studies",
    dialogue: () =>
      `History does not need another hero. It needs someone willing to follow the evidence. ${progress.completedCases.length ? `You have archived ${progress.completedCases.length} Unit 1 case${progress.completedCases.length === 1 ? "" : "s"}. Read what the record supports before deciding what it means.` : "The Institute needs Chroniclers who can separate a compelling story from evidence that can be examined."}`,
  },
  amani: {
    x: 4.6,
    y: 6.0,
    name: "Dr. Amani Soto",
    role: "Archive Researcher",
    dialogue: () =>
      "Context is not an answer key. Start with the record, write what you notice, then compare your reasoning with the Archive notes.",
  },
  julian: {
    x: 12.9,
    y: 6.1,
    name: "Professor Julian Park",
    role: "Route Historian",
    dialogue: () =>
      `The navigation table is ready. ${progress.unlocked.length > 1 ? "New Unit 1 routes are now available for review." : "The Caribbean route is the only active route for now."}`,
  },
  trophy: {
    x: 1.7,
    y: 1.0,
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
    x: 13.0,
    y: 9.55,
    name: "Chronicle Navigation Table",
    role: "Archive interface",
    dialogue: () =>
      `The table displays teacher-unlocked cases geographically. Select a route only after you have reviewed the active investigation.`,
    action: "archive",
  },
  archiveDoor: {
    x: 14.3,
    y: 2.3,
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
// Hand-measured against the tile art generated by scripts/generate-archive-room-tmj.js —
// collision is intentionally a little smaller than the drawn furniture for game-feel, the same
// convention as docs/decision-log/0026-archive-pathing-cursor-audio.md.
export const ARCHIVE_ROOM_BLOCK_RECTS = [
  { x1: 0.0, y1: 1.05, x2: 8.0, y2: 2.0, kind: "north shelving, west run" },
  { x1: 12.0, y1: 1.05, x2: 20.0, y2: 2.0, kind: "north shelving, east run" },
  { x1: 0.0, y1: 10.2, x2: 8.0, y2: 12.0, kind: "south chests, west run" },
  { x1: 14.0, y1: 10.2, x2: 20.0, y2: 12.0, kind: "south chests, east run" },
  { x1: 16.0, y1: 5.0, x2: 18.0, y2: 7.0, kind: "archive record shelving" },
  { x1: 18.0, y1: 5.0, x2: 20.0, y2: 7.0, kind: "archive record rack" },
  { x1: 16.0, y1: 9.0, x2: 18.0, y2: 11.0, kind: "record canisters" },
  { x1: 4.1, y1: 5.1, x2: 7.9, y2: 6.9, kind: "reading table" },
  { x1: 0.0, y1: 4.6, x2: 2.0, y2: 6.0, kind: "hearth" },
  { x1: 13.0, y1: 7.6, x2: 15.0, y2: 9.0, kind: "writing desk" },
  { x1: 13.0, y1: 3.6, x2: 15.0, y2: 5.0, kind: "round table" },
];
export const ARCHIVE_ROOM_TARGETS = {
  terminal: {
    x: 15.5,
    y: 6.0,
    name: "Archive Terminal",
    role: "Archive Challenges interface",
    dialogue: () => "Archive Challenges for this unit are still being cataloged. Check back soon.",
    action: "archive-challenges",
  },
  exitDoor: {
    // Centred in the gap between the two south chest runs, so the spawn point this door
    // produces on entry (exitDoor.y - 0.6) is never inside geometry — a past regression froze
    // all movement because the player's very first foot-box already read as blocked.
    x: 10.0,
    y: 10.2,
    name: "Institute Foyer",
    role: "Return to the Main Hall",
    dialogue: () => "",
    action: "leave-archive-room",
  },
};
function activeHubGrid() {
  return progress.currentHubRoom === "archive" ? ARCHIVE_ROOM_GRID : HUB_GRID;
}
function activeHubBlocks() {
  return progress.currentHubRoom === "archive" ? ARCHIVE_ROOM_BLOCK_RECTS : HUB_BLOCK_RECTS;
}
function activeHubTargets() {
  return progress.currentHubRoom === "archive" ? ARCHIVE_ROOM_TARGETS : HUB_TARGETS;
}

// Post-hallway guided tour of the Main Hall (progress.tutorial.step === "tour-<id>" for one of
// these ids, or "tour-intro" for the unhighlighted orientation beat before them). Movement is
// locked for the whole tour — see the three isTutorialTourActive() call sites in the institute
// keydown handler, runHubMovementLoop(), and interactWithHubTarget().
const TUTORIAL_TOUR_STEPS = ["intro", "table", "archiveDoor", "trophy"];
function isTutorialTourActive() {
  return typeof progress.tutorial?.step === "string" && progress.tutorial.step.startsWith("tour-");
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

let instituteMovement = { x: 7, y: 9, facing: "up", moving: false, step: false, queued: null };
// Every existing call site means "place the player in the Main Hall" — reset
// the room here so returning to the Institute never strands the player in a
// sub-room at Main-Hall-relative coordinates. The two room-transition call
// sites in interactWithHubTarget() explicitly set currentHubRoom afterward.
function safeInstituteSpawn(x = 7, y = 9, facing = "up") {
  hubHeldKeys.clear();
  stopHubMovementLoop();
  instituteMovement = { x, y, facing, moving: false, step: false, queued: null };
  hubDialogueId = null;
  progress.currentHubRoom = "main";
}
let hubDialogueId = null;
const HUB_NPC_PATROLS = {
  director: [
    { x: 3.8, y: 4.2 },
    { x: 4.4, y: 4.2 },
    { x: 4.4, y: 5.05 },
    { x: 3.7, y: 5.05 },
  ],
  amani: [
    { x: 4.6, y: 6.0 },
    { x: 5.2, y: 6.0 },
    { x: 5.2, y: 6.35 },
    { x: 4.6, y: 6.35 },
  ],
  julian: [
    { x: 12.8, y: 6.0 },
    { x: 13.6, y: 6.0 },
    { x: 13.6, y: 6.35 },
    { x: 12.8, y: 6.35 },
  ],
};
const hubNpcRuntime = Object.fromEntries(
  Object.entries(HUB_NPC_PATROLS).map(([id, path], index) => [
    id,
    {
      path,
      index: 0,
      x: path[0].x,
      y: path[0].y,
      nextTick: 950 + index * 420,
      speed: 0.08,
      walking: false,
      facing: "down",
    },
  ])
);
const hubHeldKeys = new Set();
let hubMoveFrame = null;
let lastHubMoveAt = 0;
function hubTargetState(id) {
  return hubNpcRuntime[id] || activeHubTargets()[id];
}
function hubFootBoxFor(x, y) {
  return { x1: x - 0.28, x2: x + 0.28, y1: y - 0.06, y2: y + 0.44 };
}
function hubRectBlocked(foot) {
  return activeHubBlocks().some((block) => rectsOverlap(foot, block));
}
function isHubNpcBlocked(id, x, y) {
  const foot = hubFootBoxFor(x, y);
  const grid = activeHubGrid();
  if (x < 0.6 || y < 0.8 || x > grid.columns - 1.2 || y > grid.rows - 1.2) return true;
  if (hubRectBlocked(foot)) return true;
  if (rectsOverlap(foot, hubFootBoxFor(instituteMovement.x, instituteMovement.y))) return true;
  return Object.entries(hubNpcRuntime).some(
    ([otherId, other]) => otherId !== id && rectsOverlap(foot, hubFootBoxFor(other.x, other.y))
  );
}
function updateInstituteNpcs() {
  if (progress.currentScreen !== "institute") return;
  // Director/Amani/Julian only exist and patrol in the Main Hall; skip their
  // tick while the player is in the Archive Room, but still update the
  // player sprite/position below (that has to run in every room).
  if (progress.currentHubRoom === "archive") {
    updateInstitutePlayer();
    return;
  }
  Object.entries(hubNpcRuntime).forEach(([id, state], index) => {
    if (hubDialogueId === id || (id === "director" && isTutorialTourActive())) {
      state.walking = false;
      const node = document.querySelector(`[data-hub-npc="${id}"]`);
      if (node) {
        node.style.left = `${(((state.x + 0.5) / HUB_GRID.columns) * 100).toFixed(3)}%`;
        node.style.top = `${(((state.y + 0.51) / HUB_GRID.rows) * 100).toFixed(3)}%`;
        node.classList.toggle("is-walking-npc", false);
        node.dataset.facing = state.facing;
        node.querySelector("img")?.setAttribute("src", hubNpcSpriteUrl(id, state.facing, false));
      }
      return;
    }
    state.nextTick -= 120;
    const targetIndex = (state.index + 1) % state.path.length;
    const target = state.path[targetIndex];
    const dx = target.x - state.x;
    const dy = target.y - state.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 0.045) {
      state.x = target.x;
      state.y = target.y;
      state.walking = false;
      if (state.nextTick <= 0) {
        state.index = targetIndex;
        state.nextTick = 1300 + index * 310 + Math.random() * 900;
      }
    } else if (state.nextTick <= 0) {
      const nextX = state.x + (dx / distance) * Math.min(state.speed, distance);
      const nextY = state.y + (dy / distance) * Math.min(state.speed, distance);
      if (!isHubNpcBlocked(id, nextX, nextY)) {
        state.x = nextX;
        state.y = nextY;
        state.walking = true;
        state.facing =
          Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
      } else {
        state.walking = false;
        state.index = targetIndex;
        state.nextTick = 950 + index * 240 + Math.random() * 700;
      }
    }
    const node = document.querySelector(`[data-hub-npc="${id}"]`);
    if (node) {
      node.style.left = `${(((state.x + 0.5) / HUB_GRID.columns) * 100).toFixed(3)}%`;
      node.style.top = `${(((state.y + 0.51) / HUB_GRID.rows) * 100).toFixed(3)}%`;
      node.classList.toggle("is-walking-npc", state.walking);
      node.dataset.facing = state.facing;
      node
        .querySelector("img")
        ?.setAttribute("src", hubNpcSpriteUrl(id, state.facing, state.walking));
    }
  });
  updateInstitutePlayer();
}
if (app) setInterval(updateInstituteNpcs, 120);

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
const VOLATILE_SCREENS = new Set(["source"]);
const VALID_SCREENS = new Set([
  "institute",
  "archive",
  "travel",
  "field",
  "village-activity",
  "columbus-activity",
  "map-jigsaw",
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
  "investigation",
  "intro-welcome",
  "intro-briefing",
  "intro-protocol",
  "identity",
  "intro-registration",
  "intro-hallway",
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
let briefingStep = 0;
let activeTravelTimeout = null;
// Director intro scene (intro-welcome/intro-briefing/intro-protocol) typewriter state.
// introLineIndex tracks position within the current step's body-line array; introSeenSteps
// is runtime-only (not persisted to progress) so a step only ever types out once per session
// — revisiting via "Previous message" shows it fully complete instantly.
let introLineIndex = 0;
let introTypewriterTimer = null;
const introSeenSteps = new Set();
// intro-hallway scripted walk (Director leads the newly-created Chronicler from the
// registration screen into the Main Hall) — runtime-only state for the bespoke
// requestAnimationFrame walk loop and the fade-to-black that follows it.
let hallwayWalkFrame = null;
let hallwayWalkStartedAt = null;
let hallwayWalkDone = false;
let hallwayFadeTimer = null;
// Set right before the hallway walk hands off to the Main Hall so instituteMainRoomScreen()
// renders one frame with the fade overlay at full opacity, then render()'s institute
// requestAnimationFrame block removes .is-active so it transitions back to 0 (a fade-in cut).
let hallwayFadeToInstitute = false;
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
    return progress.activeFieldNpc ? "dialogue" : activeFieldMap().musicScene;
  if (
    progress.currentScreen === "institute" ||
    progress.currentScreen === "archive" ||
    progress.currentScreen === "map-jigsaw" ||
    progress.currentScreen === "mini-games"
  )
    return "archive";
  if (progress.currentScreen === "upload") return "upload";
  if (progress.currentScreen === "return-warp") return "quiet";
  return "quiet";
}
const UNITS = [UNIT_01, UNIT_02, UNIT_03];
const UNIT_SOURCES = {
  "case-001": CASE_001_SOURCES,
  "case-004": CASE_004_SOURCES,
  "case-007": CASE_007_SOURCES,
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
};
// Archive Challenge quest content, resolved by (questType, questId) from
// either a case's case.archiveChallenge pointer or a unit's
// unit.archiveChallenges[] bonus entries (unit.schema.js), grouped by quest
// type since a unit's Archive Challenges can mix types (case-003 uses
// sequencing; case-005/case-006 and the unit-01/unit-03 bonus challenges use
// evidence-organizing; the unit-02 bonus challenges use mcq).
const ARCHIVE_CHALLENGE_QUESTS_BY_TYPE = {
  "evidence-organizing": [
    ...UNIT_02_ARCHIVE_CHALLENGE_QUESTS,
    ...UNIT_01_ARCHIVE_EVIDENCE_QUESTS,
    ...UNIT_03_ARCHIVE_CHALLENGE_QUESTS,
  ],
  sequencing: UNIT_01_ARCHIVE_CHALLENGE_QUESTS,
  mcq: UNIT_02_ARCHIVE_STRONGEST_EVIDENCE_QUESTS,
  saq: UNIT_03_ARCHIVE_SAQ_QUESTS,
  dbq: UNIT_03_ARCHIVE_DBQ_QUESTS,
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
    CASE_007_SOURCES.find((item) => item.id === id);
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
    if (existing && existing.skillCategory === outcome.skillCategory && existing.correct === correct) {
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
  const { prefix, name } = splitCaseTitle(kase);
  return prefix + resolveTeacherOverride(kase.id, "title", name);
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
  description: "Choose how many classrooms to create now — you can always add more later from your dashboard.",
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

// UNITS[unitNumber - 1] relies on UNITS = [UNIT_01, UNIT_02, UNIT_03] being
// ordered/numbered the same way primary-source-library's units 1-9 are —
// true today (Period 1/2/3 both places), and simplest to keep true rather
// than adding a lookup table for 3 entries.
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
        description: "Browse every researched source for this unit and add the ones you want available for quest design.",
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
// which need none.
function caseKindDetail(kase) {
  if (kase.route === "field") return null;
  if (kase.route === "archive-challenges") return "Archive Challenge only";
  return kase.mechanic;
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
    assesses:
      "The HIPP source-analysis sourcing skill used across AP DBQ and SAQ sourcing points.",
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
<div class="manage-content-mission-head"><p class="kicker">${esc(c.shortTitle)}</p>${chip({ label: caseKindLabel(c), tone: "gold" })}</div>
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
function manageContentEditorSectionMarkup(sectionKey, title, { summary, body, collapsible = true }) {
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
        sources.filter((_, j) => j !== i && sources[j].sourcePoolValue).map((s) => s.sourcePoolValue)
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
    manageContentEditorSectionMarkup("answers", "Answer structure — evidence records (each with its own source)", {
      summary: summaries.answers,
      body: answersBody,
    }),
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
  if (draftSavedSincePublish) return { key: "draft", label: "Draft changes (not yet visible to students)" };
  if (!slot.draftAltId && !slot.publishedAltId) return { key: "official", label: "Official version" };
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
    { label: "Publish", current: step === "preview" || step === "published", done: step === "published" },
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
    return `${manageContentFixedHeaderMarkup(null)}<main class="shell manage-content-shell c-app"><section>${pageHeaderMarkup({
      eyebrow: BRAND.engine,
      title: "Manage Content",
      description: "Sign in as a teacher to manage content.",
      actions: [{ label: "Teacher Sign In →", action: "open-teacher-login", variant: "secondary" }],
    })}</section></main>${authorPanel()}`;
  }
  const activeCase = caseById(contentUiState.selectedCaseId);
  if (!activeCase) {
    return `${manageContentFixedHeaderMarkup(null)}<main class="shell manage-content-shell c-app"><section>${pageHeaderMarkup({
      eyebrow: BRAND.engine,
      title: "Manage Content",
      description: contentUiState.error || "Loading case…",
    })}</section></main>${authorPanel()}`;
  }
  // Map Missions are entirely fixed content — the walkable map, its NPCs/
  // sources, and its Practice Check questions are all locked — so this is
  // the only screen a Map Mission ever shows here: no wizard, no edit/
  // replace controls, just a name field. The command bar's own "Preview as
  // student"/breadcrumb now cover what the old inline "Student Preview"/
  // "Back" buttons used to.
  if (activeCase.route === "field") {
    return `${manageContentFixedHeaderMarkup(activeCase)}<main class="shell manage-content-shell c-app"><section>
${pageHeaderMarkup({ eyebrow: activeCase.shortTitle, title: resolvedCaseTitle(activeCase) })}
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
  const caseNumber = splitCaseTitle(activeCase)
    .prefix.replace(/\s*—\s*$/, "")
    .trim();
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
  return fields?.relatedSourceExcerpt ? "Full text + excerpt (optional)" : "Not attached (optional)";
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
  loadSelectionsForResolution(teacherUiState.selectedClassroomId, resolution).then(() => {
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
      progress.currentScreen = "archive-challenges";
    }
    render();
  }).catch((err) => {
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
function openManageContentWarningDialog(scenarioKey, { onPrimary = null, onSecondary, triggerSelector }) {
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
      .querySelector(`.manage-content-source-selector[data-field-key="${CSS.escape(target.dataset.fieldKey)}"] select`)
      ?.focus();
    return true;
  }
  if (action === "focus-source-excerpt") {
    document
      .querySelector(`.manage-content-source-tool[data-field-key="${CSS.escape(target.dataset.fieldKey)}"] textarea`)
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
    manageContentAuthoring = { ...auth, slotKind, fields, fieldsAtOpen: fields, errors: [], textTools: {} };
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
      const resolved = fieldTarget.poolValue ? resolvePoolSourceFields(fieldTarget.poolValue) : null;
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
    const fields = formEl && auth.slotKind ? syncAuthoringFieldsFromDom(auth.slotKind, formEl) : auth.fields;
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

// Decorative-only markup for the default (sprite) stage: a technical-instrument seal behind the
// character, corner HUD brackets, and monospace data readouts. Deliberately not rendered on
// intro-hallway, whose custom stageHtml (a Tiled corridor) has its own frame language and none of
// this geometry — see the usingDefaultStage gate in directorSceneMarkup().
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
function directorSceneMarkup({ eyebrow, title, buttonsHtml, extraContent = "", stageHtml = "" }) {
  // The default sprite stage gets the seal/HUD/phrase-layer decoration; a custom stageHtml (e.g.
  // intro-hallway's Tiled corridor) has its own frame language and none of that geometry applies.
  const usingDefaultStage = !stageHtml;
  const stage =
    stageHtml ||
    `<img class="director-scene__sprite" src="${instituteNpcSprites.director}" alt="Director Rowan Hale" draggable="false">`;
  // The record readout is omitted whenever extraContent is present (intro-protocol only) since
  // that panel occupies the same top-left corner — see DIRECTOR_STAGE_DECOR_RECORD_READOUT.
  const stageDecor = usingDefaultStage
    ? DIRECTOR_STAGE_DECOR + (extraContent ? "" : DIRECTOR_STAGE_DECOR_RECORD_READOUT)
    : "";
  // The phrase layer is a top-level scene sibling (not nested in .director-scene__stage) so its
  // inset:0 box shares the same coordinate space as .director-extra-content and the bottom bar —
  // pickSafeZonePoint() needs to reason about the sprite and the dialogue box together.
  const phraseLayer = usingDefaultStage
    ? `<div class="director-scene__phrase-layer" id="directorPhraseLayer" aria-hidden="true"></div>`
    : "";
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

// The scripted walk from Registration into the Main Hall — reuses directorSceneMarkup()'s
// bottom dialogue bar (typewriter, Continue indicator, reveal rail) wholesale via its stageHtml
// override, swapping in a real Tiled-rendered corridor (renderHallwayTiledMap(), same
// renderTiledMap()/createTilesetImageResolver() pattern the Archive Room uses, see
// docs/decision-log/0030-archive-room-tiled-interior.md) plus a small door-art overlay cropped
// from the existing institute hub background, framing the same door the player emerges at.
// Two sprite divs are animated by runHallwayWalk(). No Continue/back buttons — the walk itself
// drives the transition into the Main Hall once it completes (see completeHallwayWalk()), so
// buttonsHtml is intentionally empty.
function introHallwayScreen() {
  const stageHtml = `<div class="hallway-viewport"><div class="hallway-scaler" id="hallwayScaler"><canvas class="field-world-art" id="hallwayTiledCanvas" role="img" aria-label="A corridor lined with archive record shelving and torches, leading to a door"></canvas><div class="hallway-door" aria-hidden="true" style="background-image:url(${instituteHubBackground})"></div></div><div class="hallway-sprite hallway-sprite--player" id="hallwayPlayerSprite" style="left:53%;top:86%"><img src="${fieldSpriteAssets[progress.profile.appearance === "b" ? "b" : "a"].up.idle}" alt=""></div><div class="hallway-sprite hallway-sprite--director" id="hallwayDirectorSprite" style="left:45%;top:76%"><img src="${instituteNpcSprites.director}" alt=""></div></div>`;
  return `${chrome()}<main class="director-stage">${directorSceneMarkup({
    eyebrow: "Chronicle Institute · Orientation",
    title: "Welcome to the Institute.",
    buttonsHtml: "",
    stageHtml,
  })}</main><div class="scene-fade" id="sceneFade"></div>`;
}

// Resolves the {stepKey, lines} for whichever intro screen/step is currently active.
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
  if (progress.currentScreen === "intro-hallway") {
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

const HALLWAY_WALK_MS = 5000;
// Bespoke requestAnimationFrame walk for intro-hallway, following the same direct-DOM-patch
// convention updateInstituteNpcs()/runHubMovementLoop() already use rather than re-rendering
// per frame. Not a general cutscene engine — this is deliberately one-off, one-shot animation
// code for this single scripted moment (see docs/tour-plan.md "Explicitly not building").
function runHallwayWalk(now) {
  if (progress.currentScreen !== "intro-hallway" || hallwayWalkDone) {
    hallwayWalkFrame = null;
    return;
  }
  if (!hallwayWalkStartedAt) hallwayWalkStartedAt = now;
  const reduced = prefersReducedMotion();
  const duration = reduced ? 1 : HALLWAY_WALK_MS;
  const elapsed = now - hallwayWalkStartedAt;
  const t = Math.min(1, elapsed / duration);
  const playerEl = document.getElementById("hallwayPlayerSprite");
  const directorEl = document.getElementById("hallwayDirectorSprite");
  const scalerEl = document.getElementById("hallwayScaler");
  // Scale the corridor art (tile canvas + door overlay together) up as the walk progresses — a
  // dolly-forward, not just the sprites sliding over static art — so it reads as advancing down
  // the corridor toward the door. Origin pinned to the door (top-center of the portrait corridor)
  // so the door frames tighter rather than sliding out of view, replacing the old
  // background-size-driven crop zoom now that the art is a canvas, not a background-image.
  if (scalerEl) scalerEl.style.transform = `scale(${1 + t * 0.35})`;
  // Director leads (higher/further along), player follows a step behind and to one side —
  // a fixed horizontal/vertical offset the whole walk so the two sprites read as single-file
  // "follow me" rather than converging into an overlapping blob by the time they reach the door.
  if (playerEl) {
    playerEl.style.left = "53%";
    playerEl.style.top = `${86 - t * 44}%`;
    const img = playerEl.querySelector("img");
    const appearance = progress.profile.appearance === "b" ? "b" : "a";
    const frame = reduced || Math.floor(elapsed / 220) % 2 === 0 ? "idle" : "step";
    if (img) img.src = fieldSpriteAssets[appearance].up[frame];
  }
  if (directorEl) {
    directorEl.style.left = "45%";
    directorEl.style.top = `${76 - t * 44}%`;
  }
  if (t >= 1) {
    hallwayWalkDone = true;
    hallwayWalkFrame = null;
    completeHallwayWalk();
    return;
  }
  hallwayWalkFrame = window.requestAnimationFrame(runHallwayWalk);
}

// Fires once the walk reaches the door: fades to black, holds briefly, then cuts to the Main
// Hall with the tour's first (unhighlighted) beat active. safeInstituteSpawn(7, 9, "up") is the
// same spawn point the old direct "Enter Institute" → institute jump used.
function completeHallwayWalk() {
  document.getElementById("sceneFade")?.classList.add("is-active");
  const holdMs = prefersReducedMotion() ? 60 : 420;
  clearTimeout(hallwayFadeTimer);
  hallwayFadeTimer = setTimeout(() => {
    safeInstituteSpawn(7, 9, "up");
    progress.currentScreen = "institute";
    progress.tutorial.step = "tour-intro";
    hallwayFadeToInstitute = true;
    save();
    render();
  }, holdMs);
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
  return `${chrome()}<main class="shell completion-shell"><section><p class="kicker">${esc(c.eyebrow)}</p><h1>${esc(c.title)}</h1><p>${esc(c.subtitle)}</p><p>${esc(c.appearanceLabel)}</p><div class="completion-actions"><button class="btn ${isA ? "btn-gold" : "btn-outline"}" data-action="set-appearance" data-value="a"><img src="${chroniclerPreviewA}" alt="Appearance one" height="64"></button><button class="btn ${!isA ? "btn-gold" : "btn-outline"}" data-action="set-appearance" data-value="b"><img src="${chroniclerPreviewB}" alt="Appearance two" height="64"></button></div><p>${esc(c.appearanceHelp)}</p><label>${esc(c.nameLabel)}<input data-profile="name" maxlength="14" value="${esc(progress.profile.name)}" placeholder="${esc(c.namePlaceholder)}"></label><p>${esc(c.nameHelp)}</p><p class="feedback" id="identityFeedback"></p><div class="completion-actions"><button class="btn btn-outline" data-action="intro-advance" data-next="intro-protocol">${esc(c.back)}</button><button class="btn btn-gold" data-action="confirm-identity">${esc(c.confirm)} →</button></div></section></main>`;
}

function introRegistrationScreen() {
  const r = CHRONICLE_IDENTITY_DEFAULTS.registration;
  return `${chrome()}<main class="shell completion-shell"><section><p class="kicker">${esc(r.eyebrow)}</p><h1>${esc(r.title)}</h1><p class="subtitle">${esc(r.subtitle)}</p><p><b>${esc(r.profileLabel)}:</b> ${esc(progress.profile.name)} · <b>${esc(r.assignmentLabel)}:</b> ${esc(r.assignment)}</p><p>${esc(r.codexLabel)} — ${esc(r.codexBody)}</p><div class="completion-actions"><button class="btn btn-outline" data-action="intro-advance" data-next="identity">${esc(r.back)}</button><button class="btn btn-gold" data-action="intro-advance" data-next="intro-hallway">${esc(r.enter)} →</button></div></section></main>`;
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

// Position of a point in the active hub room. Camera rooms (those whose grid declares a `tile`)
// are laid out in pixels inside #hubWorld, which updateHubCamera() then translates; the painted
// Main Hall keeps percentage positioning against a box that stretches to fit.
function hubPointStyle(x, y, yBias = 0.5) {
  const grid = activeHubGrid();
  if (grid.tile) {
    return `left:${((x + 0.5) * grid.tile).toFixed(1)}px;top:${((y + yBias) * grid.tile).toFixed(1)}px;`;
  }
  return `left:${(((x + 0.5) / grid.columns) * 100).toFixed(3)}%;top:${(((y + yBias) / grid.rows) * 100).toFixed(3)}%;`;
}
function institutePositionStyle() {
  return hubPointStyle(instituteMovement.x, instituteMovement.y, 0.54);
}
// Mirrors updateFieldPlayer()'s camera exactly: a pure function of player position, recomputed
// every tick from the live viewport size and clamped to the world's edges, integer-rounded so
// text stays crisp. Nothing here may scroll the document or move toward a clicked element —
// see CLAUDE.md's camera invariant.
function updateHubCamera() {
  const grid = activeHubGrid();
  if (!grid.tile) return;
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
function instituteSpriteUrl() {
  const appearance = progress.profile.appearance === "b" ? "b" : "a";
  const direction =
    instituteMovement.facing === "left" || instituteMovement.facing === "right"
      ? "side"
      : instituteMovement.facing;
  return fieldSpriteAssets[appearance][direction][instituteMovement.moving ? "step" : "idle"];
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
function updateInstitutePlayer() {
  const player = document.getElementById("institutePlayer");
  const sprite = document.getElementById("institutePlayerSprite");
  const prompt = document.getElementById("hubInteractPrompt");
  if (!player || !sprite) return;
  player.style.cssText = institutePositionStyle();
  player.dataset.facing = instituteMovement.facing;
  player.classList.toggle("is-walking", instituteMovement.moving);
  sprite.src = instituteSpriteUrl();
  updateHubCamera();
  const nearby = nearestHubTarget();
  if (prompt) {
    prompt.hidden = !nearby;
    prompt.textContent = nearby ? `Press E · ${nearby[1].name}` : "";
  }
  updateHubProximityUi();
}
function updateHubProximityUi() {
  const targets = activeHubTargets();
  Object.keys(targets).forEach((id) => {
    const selector =
      id === "trophy"
        ? ".hub-trophy"
        : id === "table"
          ? ".hub-table"
          : `[data-hub-npc="${id}"], [data-hub-target="${id}"]`;
    const node = document.querySelector(selector);
    if (node) node.classList.toggle("is-near", isHubTargetNear(id));
  });
}
function isHubBlocked(x, y) {
  const grid = activeHubGrid();
  const edge = x < 0.6 || y < 0.8 || x > grid.columns - 1.2 || y > grid.rows - 1.2;
  if (edge) return true;
  const foot = hubFootBoxFor(x, y);
  if (hubRectBlocked(foot)) return true;
  // NPCs should feel alive, but they should not make the Archive feel stuck or maze-like.
  return false;
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
  if (progress.currentScreen !== "institute" || isTutorialTourActive()) {
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
  if (isTutorialTourActive()) return;
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
  playSfx(id === "trophy" ? "archive-receive" : "dialogue");
  hubDialogueId = id;
  render();
}
function instituteNpc(targetId, sprite, label) {
  const target = activeHubTargets()[targetId];
  const state = hubTargetState(targetId);
  const isNear = targetDistance(target, targetId) <= targetReach(targetId);
  const walking = Boolean(hubNpcRuntime[targetId]?.walking);
  const spriteUrl = hubNpcSpriteUrl(targetId, state.facing || "down", walking) || sprite;
  const grid = activeHubGrid();
  return `<button class="hub-npc hub-npc--${targetId} ${isNear ? "is-near" : ""} ${walking ? "is-walking-npc" : ""}" data-facing="${esc(state.facing || "down")}" style="left:${(((state.x + 0.5) / grid.columns) * 100).toFixed(3)}%;top:${(((state.y + 0.51) / grid.rows) * 100).toFixed(3)}%" data-action="hub-interact" data-target="${targetId}" data-hub-npc="${targetId}" aria-label="Speak with ${esc(target.name)}"><img src="${spriteUrl}" alt=""><span>${esc(label)}</span>${isNear ? "<i>!</i>" : ""}</button>`;
}
function instituteScreen() {
  return progress.currentHubRoom === "archive" ? archiveRoomScreen() : instituteMainRoomScreen();
}
// Caption panel for the post-hallway guided tour — reuses the existing .hub-dialogue panel
// structure/styling (the same markup hubDialogueId's dialogue renders) rather than inventing new
// UI, but with a "Next"/"Got it" advance button instead of a close button, since the tour has no
// way to dismiss early.
function tourCalloutMarkup() {
  const stepId = currentTourStepId();
  const content = CHRONICLE_OPENING_DEFAULTS.tour[stepId];
  if (!content) return "";
  return `<div class="hub-dialogue hub-dialogue--tour" role="dialog" aria-modal="true" aria-labelledby="tourCalloutTitle"><article><div class="hub-dialogue__portrait"><img src="${instituteNpcSprites.director}" alt=""></div><div><p class="kicker">${esc(content.role)}</p><h2 id="tourCalloutTitle">${esc(content.name)}</h2><p>${esc(content.body)}</p><button class="btn btn-gold" data-action="tutorial-tour-next">${esc(content.cta)}</button></div></article></div>`;
}
function instituteMainRoomScreen() {
  const nearby = nearestHubTarget();
  const dialogue = hubDialogueId ? HUB_TARGETS[hubDialogueId] : null;
  const status =
    progress.hubNotice ||
    (progress.completedCases.length
      ? `${progress.completedCases.length}/3 Unit 1 cases archived.`
      : "Your first active route awaits at the Navigation Table.");
  const sidePanel = `<aside class="hub-sidepanel hub-sidepanel--left"><p class="kicker">Institute status</p><h2>${esc(progress.profile.name || "Chronicler")}</h2><p class="role">Active researcher · Unit 1</p><div class="hub-progress"><span><b>${progress.completedCases.length}</b> / 3 cases archived</span><span><b>${countEvidence("case-001")}</b> evidence records secured</span></div><div class="archive-badges archive-badges--compact"><b>Badge case</b><span>Walk to the Preservation Case on the upper bookshelf to view Unit 1 badges.</span></div><div class="hub-actions"><button class="btn btn-outline" data-action="codex" data-origin="hub">Open Codex <b>${countEvidence("case-001")}</b></button><button class="text-button" data-action="reset">Reset Unit 1 demo</button></div><p class="hub-controls">Move: Arrow keys / WASD<br>Interact: E or click when close</p></aside>`;
  return `${chrome()}<main class="hub-shell hub-shell--status-left"><section class="hub-intro"><p class="kicker">Present day · Chronicle Institute</p><h1>Institute Archive</h1><p class="hub-subtitle">A living home base for every investigation.</p><p>Walk through the Institute with arrow keys or WASD. Speak with the Director and researchers, inspect preserved records, then approach the Navigation Table to open the map.</p><div class="hub-meta"><span>Unit 1 · ${esc(resolvedUnitTitle(UNIT_01))}</span><span>${esc(status)}</span></div>${sidePanel}</section><section class="institute-map" id="instituteMap" aria-label="Playable Chronicle Institute interior"><img class="institute-map__art" src="${instituteHubBackground}" alt="Top-down interior of the Chronicle Institute showing a foyer and Archive room">${instituteNpc("director", instituteNpcSprites.director, "Director Hale")}${instituteNpc("amani", instituteNpcSprites.amani, "Dr. Soto")}${instituteNpc("julian", instituteNpcSprites.julian, "Prof. Park")}<button class="hub-trophy ${isHubTargetNear("trophy") ? "is-near" : ""}" style="left:${(((HUB_TARGETS.trophy.x + 0.5) / HUB_GRID.columns) * 100).toFixed(3)}%;top:${(((HUB_TARGETS.trophy.y + 0.5) / HUB_GRID.rows) * 100).toFixed(3)}%" data-action="hub-interact" data-target="trophy" aria-label="Open Unit 1 preservation case"><span>▣</span><b>Preservation Case</b>${isHubTargetNear("trophy") ? "<i>!</i>" : ""}</button><button class="hub-table ${isHubTargetNear("table") ? "is-near" : ""}" style="left:${(((HUB_TARGETS.table.x + 0.5) / HUB_GRID.columns) * 100).toFixed(3)}%;top:${(((HUB_TARGETS.table.y + 0.5) / HUB_GRID.rows) * 100).toFixed(3)}%" data-action="hub-interact" data-target="table" aria-label="Open Chronicle Navigation Table"><span>✦</span><b>Navigation Table</b></button><button class="hub-table hub-archive-door ${isHubTargetNear("archiveDoor") ? "is-near" : ""}" style="left:${(((HUB_TARGETS.archiveDoor.x + 0.5) / HUB_GRID.columns) * 100).toFixed(3)}%;top:${(((HUB_TARGETS.archiveDoor.y + 0.5) / HUB_GRID.rows) * 100).toFixed(3)}%" data-action="hub-interact" data-target="archiveDoor" data-hub-target="archiveDoor" aria-label="Enter the Archive Room"><span>▤</span><b>Archive Room</b></button><div class="hub-player" id="institutePlayer" data-facing="${instituteMovement.facing}" style="${institutePositionStyle()}"><span></span><img id="institutePlayerSprite" src="${instituteSpriteUrl()}" alt="${esc(progress.profile.name || "Chronicler")}"></div><div class="hub-interact-prompt" id="hubInteractPrompt" ${nearby ? "" : "hidden"}>${nearby ? `Press E · ${esc(nearby[1].name)}` : ""}</div></section>${dialogue ? (hubDialogueId === "trophy" ? unitOneBadgeCaseMarkup() : `<div class="hub-dialogue" role="dialog" aria-modal="true" aria-labelledby="hubDialogueTitle"><article><button class="hub-dialogue__close" data-action="hub-dialogue-close" aria-label="Close dialogue">×</button><div class="hub-dialogue__portrait"><img src="${instituteNpcSprites[hubDialogueId]}" alt=""></div><div><p class="kicker">${esc(dialogue.role)}</p><h2 id="hubDialogueTitle">${esc(dialogue.name)}</h2><p>${esc(dialogue.dialogue())}</p>${hubDialogueId === "director" ? '<p class="hub-dialogue__quote">“History does not need another hero. It needs someone willing to follow the evidence.”</p>' : ""}${hubDialogueId === "julian" ? '<button class="btn btn-gold" data-action="hub-open-table">Open Navigation Table →</button>' : ""}</div></article></div>`) : ""}${isTutorialTourActive() ? tourCalloutMarkup() : ""}</main>${authorPanel()}${hallwayFadeToInstitute ? '<div class="scene-fade is-active" id="sceneFade"></div>' : ""}`;
}

function archiveRoomScreen() {
  const targets = ARCHIVE_ROOM_TARGETS;
  const nearby = nearestHubTarget();
  const near = (id) => targetDistance(targets[id], id) <= targetReach(id);
  const pos = (target) => hubPointStyle(target.x, target.y);
  const worldStyle = `width:${ARCHIVE_ROOM_GRID.columns * ARCHIVE_ROOM_GRID.tile}px;height:${ARCHIVE_ROOM_GRID.rows * ARCHIVE_ROOM_GRID.tile}px`;
  return `${chrome()}<main class="hub-shell hub-shell--status-left"><section class="hub-intro"><p class="kicker">Chronicle Institute · Archive Room</p><h1>Institute Archive</h1><p class="hub-subtitle">Where recovered records are organized, restored, and preserved.</p><p>Approach the Archive Terminal to review Archive Challenges for the active unit. Walk back through the doorway to return to the Main Hall.</p></section><section class="institute-map institute-map--archive-room" id="archiveRoomMap" aria-label="Playable Chronicle Institute Archive Room"><div class="hub-world" id="hubWorld" style="${worldStyle}"><canvas class="field-world-art" id="archiveRoomTiledCanvas" role="img" aria-label="Top-down archive hall with shelving along both walls, a long reading table, a hearth, and a records alcove with a writing desk (Medieval Tavern tileset)"></canvas><button class="hub-table ${near("terminal") ? "is-near" : ""}" style="${pos(targets.terminal)}" data-action="hub-interact" data-target="terminal" data-hub-target="terminal" aria-label="Open Archive Terminal"><span>▤</span><b>Archive Terminal</b></button><button class="hub-table ${near("exitDoor") ? "is-near" : ""}" style="${pos(targets.exitDoor)}" data-action="hub-interact" data-target="exitDoor" data-hub-target="exitDoor" aria-label="Leave the Archive Room"><span>⤴</span><b>Leave Archive</b></button><div class="hub-player" id="institutePlayer" data-facing="${instituteMovement.facing}" style="${institutePositionStyle()}"><span></span><img id="institutePlayerSprite" src="${instituteSpriteUrl()}" alt="${esc(progress.profile.name || "Chronicler")}"></div></div><div class="hub-interact-prompt" id="hubInteractPrompt" ${nearby ? "" : "hidden"}>${nearby ? `Press E · ${esc(nearby[1].name)}` : ""}</div></section></main>${authorPanel()}`;
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
// Archive Challenges list for the active unit, reached from the Archive Terminal.
// Follows the same live-graded renderQuest/gradeQuest pattern practiceCheckScreen()
// already uses (no separate "submit" step — placement/reflection state is graded on
// every render). Renders two kinds of cards: case-level challenges (relocating an
// existing case's activity — completing one is real case progress) and unit-level
// bonus challenges (unit.archiveChallenges[], not tied to any case — bonus content
// that's still required for unit completion via unitArchiveChallengesComplete()).
function archiveChallengesScreen() {
  const unit = unitById(progress.selectedUnitId) || UNIT_01;
  // Chronotravel to an Archive Challenge mission (goToCase() -> travelScreen())
  // lands here — the traveled-to case's card leads the list instead of
  // sitting wherever its authored position falls, so the mission the student
  // just selected is the first thing they see (Phase 48A). No-op reorder for
  // any other entry point (e.g. direct from the Archive Terminal) where
  // activeCaseId doesn't belong to this unit.
  const orderedCases =
    unitForCase(progress.activeCaseId)?.id === unit.id
      ? [...unit.cases].sort((a, b) =>
          a.id === progress.activeCaseId ? -1 : b.id === progress.activeCaseId ? 1 : 0
        )
      : unit.cases;
  const caseCards = orderedCases
    .filter((c) => c.archiveChallenge)
    .map((c) =>
      archiveChallengeCard(
        `${c.shortTitle} · Archive Challenge`,
        c.archiveChallenge.questType,
        c.archiveChallenge.questId,
        {
          alreadyComplete: progress.completedCases.includes(c.id),
          onComplete: () => unlockNext(c.id),
        }
      )
    );
  const bonusCards = (unit.archiveChallenges || []).map((challenge) =>
    archiveChallengeCard(
      `${resolvedUnitTitle(unit)} · Bonus Archive Challenge`,
      challenge.questType,
      challenge.questId
    )
  );
  const additionCards = unit.cases.flatMap((c) =>
    resolvedAdditionsForCase(c.id).map((addition) =>
      archiveChallengeAdditionCard(`${c.shortTitle} · Archive Challenge`, addition)
    )
  );
  const cards = [...caseCards, ...bonusCards, ...additionCards].join("");
  return `${chrome()}<main class="shell activity-shell quest-practice-shell archive-challenges-shell"><section class="activity-copy"><button class="back-link" data-action="archive-room">← Return to Archive Terminal</button><p class="kicker">${esc(resolvedUnitTitle(unit))} · Institute Archive</p><h1>Archive Challenges</h1><p>Restore each unit's damaged record display using evidence secured in the field. Completing a unit's Archive Challenges preserves its case record and is required to fully archive the unit.</p></section><section class="activity-board quest-practice-board">${cards || '<p class="bank-empty">Archive Challenges for this unit are still being cataloged. Check back soon.</p>'}</section></main>${authorPanel()}`;
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
function declutterMarkerPositions(cases, bounds, viewport) {
  const CLUSTER_RADIUS = 30;
  const SPREAD_RADIUS = 20;
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
  return `<button class="route-marker route-marker--${state} ${progress.selectedCaseId === c.id ? "is-selected" : ""}" style="left:${left};top:${top}" data-action="select-case" data-case="${c.id}" ${state === "locked" ? 'aria-disabled="true"' : ""} aria-label="${esc(label)}"><span>${state === "complete" ? "✓" : "✦"}</span><b>${esc(c.shortTitle)}</b></button>`;
}

// Whether every unit-level Archive Challenge (unit.archiveChallenges[] — bonus
// content not tied to relocating one case) is complete. Case-level Archive
// Challenges (case.archiveChallenge) already gate unit completion for free
// via isComplete(), since completing one writes to progress.completedCases
// the same as any other case.
const unitArchiveChallengesComplete = (unit) =>
  (unit.archiveChallenges || []).every(
    (challenge) => progress.archiveChallenges[challenge.questId]?.status === "complete"
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
  const chronotravelLabel =
    selected.route === "field" ? "Initiate Chronotravel" : "Open Archive Challenge";
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
  return `${chrome()}<main class="shell archive-layout"><section class="archive-copy"><button class="back-link" data-action="home">← Institute foyer</button><p class="kicker">The Archive</p><h1>Chronicle Navigation Table</h1><p>Teacher-unlocked cases appear as markers on the map. Select a marker to inspect its route; the full details stay in the route panel so the map itself remains readable.</p><p class="archive-central-question"><b>Guiding question:</b> ${esc(resolvedUnitCentralQuestion(selectedUnit))}</p>${unitTabs(selectedUnit)}<div class="archive-legend"><span class="legend-active">✦ Available</span><span class="legend-complete">✓ Archived</span><span class="legend-locked">○ Teacher locked</span></div></section><section class="atlas-table" aria-label="${esc(resolvedUnitTitle(selectedUnit))} navigation map">${atlasSvgMarkup(view, viewport, "Coastline map of the case's historical setting")}${labelsMarkup}${visibleCases.map((c) => caseMarker(c, markerPositions.get(c.id), viewport)).join("")}<div class="route-thread route-thread--active" style="left:${threadLeft};top:${threadTop}"></div></section><aside class="route-panel"><p class="kicker">${esc(availability)}</p><span class="case-date">${esc(selected.date)}</span><h2>${esc(selected.title)}</h2><p>${esc(selected.summary)}</p><div class="route-meta"><span>${esc(selected.location)}</span><span>${esc(selected.mechanic)}</span><span>${isComplete(selected.id) ? "Archived" : "In progress"}</span></div><button class="btn btn-gold" data-action="travel" data-case="${selected.id}" ${!isUnlocked(selected.id) ? "disabled" : ""}>${esc(chronotravelLabel)} <span>→</span></button>${lockedReasonMarkup}<p class="route-hint">${esc(routeHint)}</p><button class="btn btn-outline" data-action="mini-games">Try a Mini-Game →</button>${unitReadyForReview(selectedUnit) ? `<button class="btn btn-outline" data-action="review">Begin ${esc(selectedUnit.period)} Archive Review →</button>` : ""}</aside></main>${authorPanel()}`;
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
  return `${chrome()}<main class="chronotravel-screen chronotravel-screen--warp"><section class="return-warp-vortex chronotravel-vortex" aria-label="Chronotraveling to ${esc(active.shortTitle)}"><div class="return-warp-tunnel chronotravel-tunnel"><i></i><i></i><i></i><i></i><span>✦</span><b>${esc(active.shortTitle)}<small>${esc(active.date)}</small></b></div></section><section class="travel-copy"><p class="kicker">Chronotravel sequence</p><h1>Route in motion.</h1><p>The Archive is following the selected point through the recall tunnel. The signal will resolve into its historical setting; the Codex will remain synchronized with this case.</p><div class="travel-progress"><span></span></div><p class="travel-status">Do not alter the moment. Follow the evidence.</p><button class="btn btn-outline" data-action="skip-travel">Skip transition</button></section></main>`;
}

function fieldWorldStyle() {
  return `width:${FIELD_GRID.columns * FIELD_GRID.tile}px;height:${FIELD_GRID.rows * FIELD_GRID.tile}px;transform:translate(${fieldCamera.x}px, ${fieldCamera.y}px)`;
}

function fieldPositionStyle() {
  return `left:${(fieldMovement.x * FIELD_GRID.tile).toFixed(1)}px;top:${(fieldMovement.y * FIELD_GRID.tile).toFixed(1)}px;`;
}
function fieldSpriteUrl() {
  const appearance = progress.profile.appearance === "b" ? "b" : "a";
  const direction =
    fieldMovement.facing === "left" || fieldMovement.facing === "right"
      ? "side"
      : fieldMovement.facing;
  return fieldSpriteAssets[appearance][direction][fieldMovement.moving ? "step" : "idle"];
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
function isNpcStandingOnLand(x, y) {
  const foot = { x1: x - 0.3, x2: x + 0.3, y1: y + 0.36, y2: y + 0.86 };
  const checks = [
    [foot.x1, foot.y1],
    [foot.x2, foot.y1],
    [foot.x1, foot.y2],
    [foot.x2, foot.y2],
    [(foot.x1 + foot.x2) / 2, foot.y2],
  ];
  return checks.every(([px, py]) => activeFieldMap().isLand(px, py));
}
function npcFootBox(npc) {
  const state = fieldNpcState(npc);
  return { x1: state.x - 0.42, x2: state.x + 0.42, y1: state.y + 0.2, y2: state.y + 0.92 };
}
function isFieldBlocked(x, y) {
  if (x < 1.2 || y < 0.9 || x > FIELD_GRID.columns - 1.2 || y > FIELD_GRID.rows - 1.0) return true;
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
  player.classList.toggle("is-walking", fieldMovement.moving);
  sprite.src = fieldSpriteUrl();
  if (world) {
    const viewport = world.parentElement.getBoundingClientRect();
    const worldWidth = FIELD_GRID.columns * FIELD_GRID.tile;
    const worldHeight = FIELD_GRID.rows * FIELD_GRID.tile;
    const px = fieldMovement.x * FIELD_GRID.tile;
    const py = fieldMovement.y * FIELD_GRID.tile;
    const minX = Math.min(0, viewport.width - worldWidth);
    const minY = Math.min(0, viewport.height - worldHeight);
    const camX = Math.round(Math.max(minX, Math.min(0, viewport.width / 2 - px)));
    const camY = Math.round(Math.max(minY, Math.min(0, viewport.height / 2 - py)));
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
  sourcesForCase(activeFieldCaseId()).forEach((source, index) => {
    const node = document.querySelector(`.source-signal--world.signal-${index + 1}`);
    if (node) node.classList.toggle("is-near", isNearFieldSource(source.id));
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
function ensureSourceActivity(sourceId) {
  progress.sourceActivities ??= {};
  progress.sourceActivities[sourceId] ??= {
    observed: [],
    choice: null,
    placed: {},
    completed: false,
  };
  return progress.sourceActivities[sourceId];
}
function sourceActivityRoute(sourceId) {
  return sourceById(sourceId)?.activityRoute || "source";
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
function sourcePointStyle(sourceId) {
  const point = activeFieldMap().sourcePoints[sourceId] || { x: 10, y: 10 };
  return `left:${(point.x * FIELD_GRID.tile).toFixed(1)}px;top:${(point.y * FIELD_GRID.tile).toFixed(1)}px`;
}

function fieldDistanceTo(x, y) {
  return Math.hypot(fieldMovement.x - x, fieldMovement.y - y);
}
function isNearFieldNpc(npc) {
  const state = fieldNpcState(npc);
  return fieldDistanceTo(state.x, state.y) <= 1.45;
}
function isNearFieldSource(sourceId) {
  const point = activeFieldMap().sourcePoints[sourceId];
  return point ? fieldDistanceTo(point.x, point.y) <= 1.55 : false;
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
      return point
        ? {
            type: "source",
            id: source.id,
            label: point.label,
            distance: fieldDistanceTo(point.x, point.y),
          }
        : null;
    })
    .filter(Boolean)
    .filter((item) => item.distance <= 1.55);
  return [...npcs, ...sources].sort((a, b) => a.distance - b.distance)[0] || null;
}
function fieldTooFarNotice(label) {
  progress.fieldNotice = `Move closer to interact with ${label}.`;
  progress.activeFieldNpc = null;
  save();
  const notice = document.getElementById("fieldNotice");
  if (notice) notice.textContent = progress.fieldNotice;
}
function fieldSourceSignal(source, index) {
  const caseId = activeFieldCaseId();
  const secured = hasEvidence(caseId, source.id);
  if (caseId === "case-001") {
    const villageComplete = hasEvidence("case-001", "taino-context");
    if (source.id !== "taino-context" && !villageComplete) return "";
  }
  const point = activeFieldMap().sourcePoints[source.id] || {
    label: source.title,
    kind: source.type,
  };
  const action = secured ? "open-source" : "start-source-activity";
  const near = isNearFieldSource(source.id);
  return `<button class="source-signal source-signal--world ${secured ? "is-secured" : ""} ${near ? "is-near" : ""} signal-${index + 1}" style="${sourcePointStyle(source.id)}" data-action="${action}" data-source="${source.id}" data-origin="field"><i>${secured ? "✓" : "✦"}</i><b>${esc(point.kind)}</b><small>${esc(point.label)}</small></button>`;
}
function fieldNpcButton(npc) {
  const active = progress.activeFieldNpc === npc.id;
  const near = isNearFieldNpc(npc);
  const state = fieldNpcState(npc);
  const walking = state.walking;
  const frames = fieldNpcFrameUrls(npc, state.facing || "down");
  return `<button class="field-npc field-npc--${esc(npc.group)} field-npc--${esc(npc.id)} ${active ? "is-talking" : ""} ${near ? "is-near" : ""} ${walking ? "is-walking-npc" : ""}" data-facing="${esc(state.facing || "down")}" style="left:${(state.x * FIELD_GRID.tile).toFixed(1)}px;top:${(state.y * FIELD_GRID.tile).toFixed(1)}px" data-action="field-talk" data-npc="${esc(npc.id)}" aria-label="Talk with ${esc(npc.name)}"><img class="npc-frame npc-frame--idle" src="${frames.idle}" alt=""><img class="npc-frame npc-frame--step" src="${frames.step}" alt=""><span>${esc(npc.label)}</span></button>`;
}
function fieldDialogueBubble() {
  const npc = activeFieldMap().npcs.find((item) => item.id === progress.activeFieldNpc);
  if (!npc) return "";
  const state = fieldNpcState(npc);
  const x = state.x * FIELD_GRID.tile;
  const y = (state.y - 1.18) * FIELD_GRID.tile;
  const edgeClass =
    x < 260
      ? " field-speech-bubble--left-edge"
      : x > FIELD_GRID.columns * FIELD_GRID.tile - 300
        ? " field-speech-bubble--right-edge"
        : "";
  return `<aside class="field-speech-bubble${edgeClass}" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px" aria-live="polite"><button class="field-speech-bubble__close" data-action="field-dialogue-close" aria-label="Close dialogue">×</button><b>${esc(npc.name)}</b><p>${esc(npc.text)}</p></aside>`;
}
function recallBeacon() {
  const recall = activeFieldMap().recall;
  return `<button class="recall-beacon" style="left:${(recall.x * FIELD_GRID.tile).toFixed(1)}px;top:${(recall.y * FIELD_GRID.tile).toFixed(1)}px" data-action="field-recall" aria-label="Recall to Archive room"><img src="${recallBeaconBlue}" alt=""><span>Recall to Archive</span></button>`;
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
const FIELD_COPY = {
  "unit-01": {
    intro:
      "You are the only Chronicler in the field. Start in the village, gather observations, then follow the shoreline toward the Spanish camp and map fragments as the record opens.",
    defaultNotice:
      "The Chronometer places you near the village first. Talk with people, observe the settlement, then compare what you learn with written records.",
    progressHint:
      "Complete the village investigation, Columbus source encounter, and map reconstruction.",
  },
  "unit-02": {
    intro:
      "You arrive at a young river settlement. Speak with its people, then secure the charter, the servant's letter, and the wharf accounts before the record destabilizes.",
    defaultNotice:
      "The Chronometer places you on the settlement green. The wharf accounts sit across the river bridge.",
    progressHint: "Secure the charter, the servant's letter, and the wharf accounts.",
  },
  "unit-03": {
    intro:
      "You arrive on a Philadelphia gathering ground threaded with news from the frontier, the press, the assembly, and the wharf. Walk the square, speak with its people, then gather all seven records before the record destabilizes.",
    defaultNotice:
      "The Chronometer places you near the town well. The print shop, assembly hall, chapel, statehouse steps, wharf, frontier dispatch post, and family residence each hold a record.",
    progressHint:
      "Secure the frontier speech, the farmer's letters, the liberty speech, the elegy, the proclamation, the petition, and the private letter.",
  },
};
function fieldScreen() {
  const map = activeFieldMap();
  const caseId = activeFieldCaseId();
  const activeCase = caseById(caseId);
  const sources = sourcesForCase(caseId);
  const copy = FIELD_COPY[map.id] || FIELD_COPY["unit-01"];
  const allSecured = sources.length > 0 && countEvidence(caseId) === sources.length;
  const fieldNotice = progress.fieldNotice || copy.defaultNotice;
  const kicker = `${activeCase.location} · ${activeCase.date}`;
  return `${chrome()}<main class="shell case-field case-field--living"><section class="field-intro"><button class="back-link" data-action="home">← Recall to Institute</button><p class="kicker">${esc(kicker)}</p><h1>${esc(resolvedCaseTitle(activeCase))}</h1><p class="field-question">${esc(activeCase.question)}</p><p>${esc(copy.intro)}</p><p class="field-notice" id="fieldNotice">${esc(fieldNotice)}</p></section><section class="field-viewport field-scene--interactive" id="caseFieldMap"><div class="caribbean-world field-world--${map.id}" id="caribbeanWorld" style="${fieldWorldStyle()}">${map.worldMarkup()}${recallBeacon()}${map.npcs.map(fieldNpcButton).join("")}${sources.map(fieldSourceSignal).join("")}${fieldDialogueBubble()}<div class="case-field-player" id="caseFieldPlayer" data-facing="${fieldMovement.facing}" style="${fieldPositionStyle()}"><span></span><img id="caseFieldPlayerSprite" src="${fieldSpriteUrl()}" alt="${esc(progress.profile.name || "Chronicler")}"></div></div></section><aside class="field-channel"><p class="kicker">Codex field link</p><h2>Evidence Channel</h2><p class="role">Archive connection · portable</p><p>Institute staff remain in the Archive. In the field, your Codex preserves source readings, observation notes, and the final transmission back to the Navigation Table.</p><button class="btn btn-outline" data-action="codex" data-origin="field">Open Codex <b>${countEvidence(caseId)}</b></button>${PRACTICE_CHECK_QUESTS[caseId] && progress.settings.miniGamesEnabled ? `<button class="btn btn-outline btn-outline--practice" data-action="practice-check">Practice Check →</button>` : ""}${caseId === "case-001" ? `<button class="text-button field-reset-button" data-action="reset-case-001">Reset Case 1.01 demo</button>` : ""}${allSecured ? `<button class="btn btn-gold" data-action="reconstruction">Open Reconstruction Table →</button>` : `<p class="channel-progress">${esc(copy.progressHint)}</p>`}</aside></main>`;
}

function villageSceneMarkup(active, observed) {
  const isElder = active.id === "elder";
  const isBohio = active.id === "bohio";
  const figures = isElder
    ? `<img src="${fieldNpcSprites["taino-elder"]}" alt="" class="scene-person scene-person--elder"><img src="${fieldNpcSprites["taino-fisher"]}" alt="" class="scene-person scene-person--listener scene-person--left"><img src="${fieldNpcSprites["taino-gardener"]}" alt="" class="scene-person scene-person--listener scene-person--right">`
    : isBohio
      ? `<div class="scene-bohio scene-bohio--large"><span></span></div><div class="scene-bohio scene-bohio--small"><span></span></div><img src="${fieldNpcSprites["taino-elder"]}" alt="" class="scene-person scene-person--family scene-person--one"><img src="${fieldNpcSprites["taino-fisher"]}" alt="" class="scene-person scene-person--family scene-person--two">`
      : `<div class="scene-garden-rows"></div><div class="scene-canoe-close"></div><img src="${fieldNpcSprites["taino-gardener"]}" alt="" class="scene-person scene-person--worker"><img src="${fieldNpcSprites["taino-fisher"]}" alt="" class="scene-person scene-person--canoe">`;
  return `<div class="village-scene village-scene--focused village-scene--${esc(active.id)}"><div class="scene-sunpatch"></div>${figures}<div class="scene-dialogue"><b>${esc(active.title)}</b><p>${esc(active.scene)}</p><span>${esc(active.note)}</span></div></div>`;
}

function villageActivityScreen() {
  const source = sourceById("taino-context");
  const activity = ensureSourceActivity(source.id);
  const observed = new Set(activity.observed || []);
  const activeId =
    activity.activeObservation ||
    VILLAGE_OBSERVATIONS.find((item) => !observed.has(item.id))?.id ||
    VILLAGE_OBSERVATIONS[0].id;
  const active =
    VILLAGE_OBSERVATIONS.find((item) => item.id === activeId) || VILLAGE_OBSERVATIONS[0];
  const complete = VILLAGE_OBSERVATIONS.every((item) => observed.has(item.id));
  const cards = VILLAGE_OBSERVATIONS.map(
    (item) =>
      `<button class="investigation-card ${observed.has(item.id) ? "is-complete" : ""} ${active.id === item.id ? "is-active" : ""}" data-action="observe-village" data-observe="${item.id}"><b>${esc(item.title)}</b><span>${esc(item.scene)}</span><i>${observed.has(item.id) ? "Observation saved ✓" : "Investigate scene"}</i></button>`
  ).join("");
  return `${chrome()}<main class="shell activity-shell village-investigation-shell"><section class="activity-copy"><button class="back-link" data-action="field">← Back to Caribbean field</button><p class="kicker">Case 1.01 interaction</p><h1>Village Investigation</h1><p>The island is already inhabited. Gather three field observations from the village, then compare your notes with the context record.</p><div class="activity-rule"><b>Goal:</b> investigate each scene, preserve the observations, then open the context record and write your own interpretation.</div></section><section class="activity-board village-board">${villageSceneMarkup(active, observed)}<div class="investigation-grid">${cards}</div>${complete ? `<p class="activity-feedback success">Village record stabilized. You observed leadership, settlement, cultivated work, and shoreline activity before opening the secondary context note.</p><button class="btn btn-gold" data-action="open-activity-source" data-source="${source.id}">Open context record →</button>` : `<p class="activity-feedback">${observed.size}/3 field scenes investigated. Select a scene card to preserve what you observed.</p>`}</section></main>`;
}

function columbusActivityScreen() {
  const source = sourceById("columbus-letter");
  const activity = ensureSourceActivity(source.id);
  const selected = activity.choice;
  const choiceText =
    selected === "audience"
      ? "Correct. POV is shaped by audience and purpose: Columbus emphasizes what would matter to Spanish sponsors and officials."
      : selected
        ? "Reconsider the speaker’s audience and purpose. A primary source is evidence, but it is not automatically neutral."
        : "";
  return `${chrome()}<main class="shell activity-shell spanish-encounter-shell"><section class="activity-copy"><button class="back-link" data-action="field">← Back to Caribbean field</button><p class="kicker">Case 1.01 interaction</p><h1>Spanish Camp Source Encounter</h1><p>The dialogue below is dramatized and historically grounded. Use it to think about point of view before opening the actual letter excerpt.</p><div class="camp-dialogue quote-dialogue"><img src="${fieldNpcSprites.columbus}" alt=""><div><b>Christopher Columbus</b><p>“The sovereigns will want to know what this voyage can bring them: land, souls, trade, and another crossing.”</p></div></div><div class="camp-dialogue quote-dialogue"><img src="${fieldNpcSprites["spanish-scribe"]}" alt=""><div><b>Spanish scribe</b><p>“Then the account must persuade as well as record. We write for the court, not only for ourselves.”</p></div></div></section><section class="activity-board"><h2>POV checkpoint</h2><p>Which statement best explains how point of view should shape a Chronicler’s reading of Columbus’s 1493 letter?</p><div class="choice-stack"><label><input type="radio" name="columbus-choice" data-action="columbus-choose" value="audience" ${selected === "audience" ? "checked" : ""}> Columbus’s claims should be read alongside his audience and purpose because he was reporting to Spanish officials whose support mattered.</label><label><input type="radio" name="columbus-choice" data-action="columbus-choose" value="neutral" ${selected === "neutral" ? "checked" : ""}> The letter should be treated as neutral because firsthand accounts do not contain assumptions or motives.</label><label><input type="radio" name="columbus-choice" data-action="columbus-choose" value="taino" ${selected === "taino" ? "checked" : ""}> The letter mainly reveals the point of view of Taíno communities because it records their exact words.</label><label><input type="radio" name="columbus-choice" data-action="columbus-choose" value="map" ${selected === "map" ? "checked" : ""}> The letter is best used as a map source because it shows later European geographic labeling.</label></div>${choiceText ? `<p class="activity-feedback ${selected === "audience" ? "success" : "error"}">${esc(choiceText)}</p>` : ""}${selected === "audience" ? `<button class="btn btn-gold" data-action="open-activity-source" data-source="${source.id}">Open Columbus letter →</button>` : ""}</section></main>`;
}

function mapJigsawScreen() {
  const source = sourceById("waldseemuller-map");
  const activity = ensureSourceActivity(source.id);
  activity.placed ??= {};
  const complete = MAP_PIECES.every((piece) => activity.placed[piece.id] === piece.id);
  const placedIds = new Set(Object.values(activity.placed));
  const slots = MAP_PIECES.map((piece) => {
    const placed = activity.placed[piece.id];
    const pieceInfo = MAP_PIECES.find((p) => p.id === placed);
    return `<div class="map-slot map-slot--${piece.id} ${placed ? "has-piece" : ""}" data-map-slot="${piece.id}">${pieceInfo ? `<div class="map-piece map-piece--${pieceInfo.id}" draggable="true" data-map-piece="${pieceInfo.id}"><span>${esc(pieceInfo.label)}</span></div>` : `<span></span>`}</div>`;
  }).join("");
  const trayPieces = MAP_TRAY_ORDER.map((id) => MAP_PIECES.find((piece) => piece.id === id))
    .filter(Boolean)
    .filter((piece) => !placedIds.has(piece.id));
  const tray = trayPieces
    .map(
      (piece) =>
        `<div class="map-piece map-piece--${piece.id}" draggable="true" data-map-piece="${piece.id}"><span>${esc(piece.label)}</span></div>`
    )
    .join("");
  return `${chrome()}<main class="shell activity-shell activity-shell--wide"><section class="activity-copy"><button class="back-link" data-action="field">← Back to Caribbean field</button><p class="kicker">Case 1.01 interaction</p><h1>Map Puzzle</h1><p>Rebuild the Waldseemüller world map. The outside stays straight, while the inner seam lines show how the pieces connect.</p><div class="activity-rule"><b>Goal:</b> reconstruct the map, then decide what kind of historical evidence this visual source can and cannot provide.</div></section><section class="activity-board jigsaw-board jigsaw-board--ten"><div class="jigsaw-grid jigsaw-grid--ten">${slots}</div><div class="piece-tray piece-tray--ten">${tray || "<p>All fragments placed.</p>"}</div>${complete ? `<p class="activity-feedback success">Map reconstructed. This source is useful for changing European geographic knowledge, not for direct evidence of Taíno daily life.</p><button class="btn btn-gold" data-action="open-activity-source" data-source="${source.id}">Open map source →</button>` : `<p class="activity-feedback">Drag the upright map pieces into the board. Match the image, straight outer border, and inner puzzle seams.</p>`}</section></main>`;
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

function sourceVisual(source) {
  if (source.visual === "letter")
    return `<div class="document-paper"><span>Primary-source transcript · ${esc(source.date)}</span><blockquote>${esc(source.excerpt)}</blockquote><small>Textual record. Read for perspective, audience, purpose, and language.</small></div>`;
  if (source.visual === "context")
    return `<div class="document-paper document-paper--context"><span>Secondary context record</span><p>${esc(source.excerpt)}</p><small>Background evidence, not a Taíno-authored primary source.</small></div>`;
  return `<figure class="document-image"><img src="${waldseemuller}" alt="Local course copy of Martin Waldseemüller’s 1507 world map"><figcaption>Local course copy of a Library of Congress scan. Zoom is intentionally preserved in the reader; students do not need to leave Chronicle to view it.</figcaption></figure>`;
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
  const revealed = progress.revealedContexts.includes(source.id);
  const secured = hasEvidence(activeFieldCaseId(), source.id);
  const existingSubmission = progress.submissions[source.id];
  const evaluatorSection = revealed
    ? `<section class="archive-evaluator"><button class="btn btn-outline" data-action="evaluate-source" data-source="${source.id}" ${evaluatorPendingTaskIds.has(source.id) ? "disabled" : ""}>${evaluatorPendingTaskIds.has(source.id) ? "Consulting the Archive Evaluator…" : existingSubmission ? "Get feedback on my revision →" : "Get Archive Evaluator feedback →"}</button>${evaluatorErrors[source.id] ? `<p class="feedback error">${esc(evaluatorErrors[source.id])}</p>` : ""}${archiveFeedbackMarkup(existingSubmission?.feedback?.payload)}</section>`
    : "";
  return `${chrome()}<main class="reader-shell"><section class="reader-art">${sourceVisual(source)}</section><section class="reader-copy"><div class="reader-nav"><button class="back-link" data-action="return-source">← Back to ${sourceOrigin === "codex" ? "Codex" : "field"}</button><button class="codex-button" data-action="codex" data-origin="source">Codex <b>${countEvidence(activeFieldCaseId())}</b></button></div><p class="kicker">${esc(source.type)}</p><h1>${esc(source.title)}</h1><dl><div><dt>Creator</dt><dd>${esc(source.creator)}</dd></div><div><dt>Date</dt><dd>${esc(source.date)}</dd></div><div><dt>Record</dt><dd>${esc(source.record)}</dd></div></dl><section class="reader-prompt"><h2>Chronicler prompt</h2><p>${esc(source.prompt)}</p><label class="response-label">Your initial reading<textarea id="sourceResponse" placeholder="Write your evidence-based interpretation before opening Institute Context…">${esc(response)}</textarea></label><button class="btn btn-gold" data-action="submit-source" data-source="${source.id}">Submit initial reading →</button></section>${revealed ? `<section class="reader-context"><h2>Institute Context</h2><p>${esc(source.feedback)}</p></section>` : `<section class="context-locked"><span>✦</span><div><b>Institute Context sealed</b><p>Submit a source-based interpretation first. The context note will then help you compare your thinking with the record.</p></div></section>`}${evaluatorSection}<p class="citation">${esc(source.citation)}</p><a class="source-link" href="${esc(source.externalUrl)}" target="_blank" rel="noreferrer">View original archive record ↗</a><button class="btn ${secured ? "btn-complete" : "btn-outline"}" data-action="secure-source" data-source="${source.id}" ${!revealed ? "disabled" : ""}>${secured ? "Secured in Codex ✓" : "Secure in Codex →"}</button></section></main>`;
}

function codexScreen() {
  const codexCaseId = activeFieldCaseId();
  const entries = sourcesForCase(codexCaseId)
    .map((source) => {
      const secured = hasEvidence(codexCaseId, source.id);
      return `<article class="codex-entry ${secured ? "" : "locked"}"><span>${esc(source.type)}</span><h2>${esc(source.title)}</h2><p>${secured ? esc(progress.responses[source.id] || "Evidence record secured.") : "Secure this record in the field to add it to the Codex."}</p>${secured ? `<button class="text-button" data-action="open-source" data-source="${source.id}" data-origin="codex">Open record →</button>` : ""}</article>`;
    })
    .join("");
  return `${chrome()}<main class="shell codex-shell"><section class="codex-head"><button class="back-link" data-action="return-codex">← Return</button><p class="kicker">Chronicle Codex</p><h1>Evidence Satchel</h1><p>Temporary records for the current case. Your initial notes stay attached to the evidence you secured.</p></section><section class="codex-grid">${entries}</section></main>`;
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
  return `${chrome()}<main class="shell review-shell"><section class="review-copy"><button class="back-link" data-action="archive">← Archive map</button><p class="kicker">${esc(unit.period)} Archive Review</p><h1>${esc(resolvedUnitTitle(unit))}</h1><p>Practice with AP-style historical thinking: source analysis, causation, and evidence-based explanation.</p><div class="rubric-note"><b>Structured SAQ practice · ${review.saq.prompts.length} points total</b><p>${esc(review.saq.rubric)}</p></div></section><section class="review-work"><div class="mcq-block"><h2>Multiple-choice checkpoint</h2>${review.mcq.map((q, qi) => `<article><p><b>${qi + 1}.</b> ${esc(q.prompt)}</p>${q.choices.map((choice, ci) => `<label class="choice"><input type="radio" name="mcq-${qi}" data-mcq="${qi}" value="${ci}" ${String(answers[qi]) === String(ci) ? "checked" : ""}><span>${String.fromCharCode(65 + ci)}</span>${esc(choice)}</label>`).join("")}</article>`).join("")}</div><div class="saq-block"><h2>Short Answer Question</h2><blockquote>${esc(review.saq.stimulus)}</blockquote>${review.saq.prompts.map((prompt, index) => `<label>${esc(prompt)}<textarea data-saq="${index}" placeholder="Write an evidence-based response…">${esc(saq[index] || "")}</textarea></label>`).join("")}${saqEvaluatorSection}</div><button class="btn btn-gold" data-action="submit-review">Submit Archive Review →</button><p class="feedback" id="reviewFeedback"></p></section></main>`;
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
  // Navigating away from intro-hallway mid-walk (refresh, reset, a stray render() call) must not
  // leave an orphaned rAF loop or fade timeout running against DOM nodes this render is about to
  // replace.
  window.cancelAnimationFrame(hallwayWalkFrame);
  hallwayWalkFrame = null;
  clearTimeout(hallwayFadeTimer);
  hallwayFadeTimer = null;
  let html;
  try {
    switch (progress.currentScreen) {
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
      case "intro-hallway":
        html = introHallwayScreen();
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
      case "village-activity":
        html = villageActivityScreen();
        break;
      case "columbus-activity":
        html = columbusActivityScreen();
        break;
      case "map-jigsaw":
        html = mapJigsawScreen();
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
      if (activeFieldMap().id === "unit-02") renderRiverbendTiledMap();
      if (activeFieldMap().id === "unit-01") renderCaribbeanTiledMap();
      if (activeFieldMap().id === "unit-03") renderCommonCauseTiledMap();
    });
  if (progress.currentScreen === "intro-hallway") {
    hallwayWalkStartedAt = null;
    hallwayWalkDone = false;
    hallwayWalkFrame = window.requestAnimationFrame(runHallwayWalk);
    renderHallwayTiledMap();
  }
  if (progress.currentScreen === "institute") {
    window.requestAnimationFrame(() => {
      updateInstitutePlayer();
      updateInstituteNpcs();
      if (progress.currentHubRoom === "archive") renderArchiveRoomTiledMap();
    });
    // The Main Hall's first render right after the hallway walk includes the fade div at full
    // opacity for one frame (see instituteMainRoomScreen()); dropping .is-active a frame later
    // lets its CSS transition read as a fade-in rather than a hard cut.
    if (hallwayFadeToInstitute) {
      hallwayFadeToInstitute = false;
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
    ? `Complete ${prior.shortTitle} to unlock this mission.`
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

function resetFieldPosition() {
  const spawn = activeFieldMap().spawn;
  fieldMovement = {
    x: spawn.x,
    y: spawn.y,
    facing: "down",
    moving: false,
    step: false,
    queued: null,
  };
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
  if (caseById(caseId)?.route === "field") resetFieldPosition();
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
    safeInstituteSpawn(7, 9, "up");
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
    if (next === "institute") safeInstituteSpawn(7, 9, "up");
    if (next === "intro-hallway") {
      progress.tutorial.step = "hallway";
      hallwayWalkStartedAt = null;
      hallwayWalkDone = false;
    }
    introLineIndex = 0;
    progress.currentScreen = next;
    save();
    render();
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
    }
    save();
    render();
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
  if (action === "field-recall") {
    progress.activeFieldNpc = null;
    progress.hubNotice = "Temporal recall complete. You returned through the Archive room beacon.";
    safeInstituteSpawn(16, 9, "left");
    progress.currentScreen = "institute";
    save();
    render();
    return true;
  }
  if (action === "start-source-activity") {
    progress.activeFieldNpc = null;
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
    sourceOrigin = "field";
    ensureSourceActivity(openSourceId);
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
    progress.currentScreen = "source";
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
  if (action === "observe-village") {
    playQuestSfx("taino-context");
    const a = ensureSourceActivity("taino-context");
    a.observed ??= [];
    a.activeObservation = target.dataset.observe;
    if (!a.observed.includes(target.dataset.observe)) a.observed.push(target.dataset.observe);
    save();
    render();
    return true;
  }
  if (action === "columbus-choose") {
    playQuestSfx("columbus-letter");
    const a = ensureSourceActivity("columbus-letter");
    a.choice = target.value;
    save();
    render();
    return true;
  }
  return false;
}

function handleSourceReaderClick(target, action) {
  if (action === "investigation-continue") {
    openSourceId = target.dataset.source;
    sourceOrigin = "field";
    // Re-resolve via sourceEntryScreen() rather than hardcoding "source": a
    // source can carry both investigationMode and a bespoke activityRoute
    // (e.g. taino-context's village-activity, waldseemuller-map's map-jigsaw)
    // — the Investigation Challenge gates entry, it doesn't replace the
    // bespoke mini-game that source still has.
    progress.currentScreen = sourceEntryScreen(openSourceId);
    save();
    render();
    return true;
  }
  if (action === "open-source") {
    progress.activeFieldNpc = null;
    openSourceId = target.dataset.source;
    if ((target.dataset.origin || "field") === "field" && !isNearFieldSource(openSourceId)) {
      fieldTooFarNotice((activeFieldMap().sourcePoints[openSourceId] || {}).label || "this record");
      return true;
    }
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
        rotation.streakDays = nextStreakDays(rotation.lastCompletedDate, today, rotation.streakDays);
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
    safeInstituteSpawn(16, 9, "left");
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
  const target = event.target.closest("[data-action]");
  if (!target) {
    if (progress.currentScreen === "field" && progress.activeFieldNpc) {
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
    await setTeacherOverride(field.dataset.caseVisibility, "navTableVisible", field.checked ? "true" : "false");
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
      confirmSourceChangeIfNeeded(field, "sequencing", oldPoolValue, fields.relatedSourceExcerpt, () => {
        fields.relatedSourceLabel = picked.label;
        fields.relatedSourceAttribution = picked.attribution;
        fields.relatedSourceExcerpt = picked.excerpt;
        manageContentAuthoring = {
          ...manageContentAuthoring,
          fields,
          textTools: { ...manageContentAuthoring.textTools, sequencing: undefined },
        };
        render();
      });
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
  const mapPiece = event.target.closest("[data-map-piece]");
  if (mapPiece) {
    event.dataTransfer.setData("text/map-piece", mapPiece.dataset.mapPiece);
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
  const mapSlot = event.target.closest("[data-map-slot]");
  const sequenceItem = event.target.closest("[data-sequence-item]");
  const evidenceSlot = event.target.closest("[data-evidence-slot]");
  const cargoHold = event.target.closest("[data-cargo-hold]");
  const dropTarget = mapSlot || sequenceItem || evidenceSlot || cargoHold;
  if (dropTarget) {
    event.preventDefault();
    dropTarget.classList.add("is-over");
  }
}

function handleAppDragleave(event) {
  event.target.closest("[data-map-slot]")?.classList.remove("is-over");
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
  const mapSlot = event.target.closest("[data-map-slot]");
  if (mapSlot) {
    event.preventDefault();
    const pieceId = event.dataTransfer.getData("text/map-piece");
    if (!pieceId) return;
    const a = ensureSourceActivity("waldseemuller-map");
    a.placed ??= {};
    Object.keys(a.placed).forEach((slot) => {
      if (a.placed[slot] === pieceId) delete a.placed[slot];
    });
    a.placed[mapSlot.dataset.mapSlot] = pieceId;
    save();
    render();
  }
}

// Global Escape dismissal for the app's own overlay surfaces (field/hub dialogue
// bubbles, the teacher "Preview as student" banner). A native <dialog> (e.g.
// Manage Content's delete-confirmation, Phase 30) already closes itself on Escape
// via the browser's own close-watcher, so this only needs to cover the surfaces
// that aren't a real <dialog> element.
function handleEscapeDismiss() {
  if (document.querySelector("dialog[open]")) return;
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
    if (isTutorialTourActive()) return;
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

  render();
}
