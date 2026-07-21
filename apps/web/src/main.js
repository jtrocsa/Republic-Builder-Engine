import "./styles/global.css";
import {
  BRAND,
  UNIT_01,
  CASE_001_SOURCES,
  EXCHANGE_RECORDS,
  EMPIRE_EVIDENCE,
  REVIEW,
} from "./content/unit-01-campaign.js";
import {
  UNIT_02,
  CASE_004_SOURCES,
  CASE_004_LANES,
  TRIANGLE_LEGS,
  TRIANGLE_CARGO,
  UNIT_02_REVIEW,
} from "./content/unit-02-campaign.js";
import {
  UNIT_03,
  CASE_007_SOURCES,
  CASE_007_LANES,
  FOUNDING_RECORDS,
} from "./content/unit-03-campaign.js";
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
import { renderQuest, gradeQuest } from "./quest-types/index.js";
import { REFLECTION_MIN_LENGTH } from "./quest-types/history/evidence-organizing-quest.js";
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
} from "./repositories/remote-submission-repository.js";
import {
  getClassroomUnitFloor,
  advanceClassroomUnit,
} from "./repositories/remote-classroom-unit-repository.js";
import {
  loadSelectionsForResolution,
  resolveSourceSlot,
  resolveMcqQuestSlot,
  alternativesForSourceSlot,
  alternativesForMcqSlot,
  listSelectionsForCase,
  setDraftSelection,
  publishCaseSelections,
} from "./repositories/remote-content-selection-repository.js";
import { validateJoinCode, validateStudentIdCode, validatePassword } from "./engine/auth-flows.js";
import {
  buildHippEvaluationRequest,
  buildSaqEvaluationRequest,
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
  import.meta.glob("./assets/tilesets/farm/3.png", { eager: true, import: "default" })
);
function renderRiverbendTiledMap() {
  const canvas = document.getElementById("riverbendTiledCanvas");
  if (!canvas || canvas.dataset.rendered === "true") return;
  renderTiledMap(canvas, riverbendTmj, resolveRiverbendTilesetImage).then(() => {
    canvas.dataset.rendered = "true";
  });
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
  })
);
function renderCaribbeanTiledMap() {
  const canvas = document.getElementById("caribbeanTiledCanvas");
  if (!canvas || canvas.dataset.rendered === "true") return;
  renderTiledMap(canvas, caribbeanTmj, resolveCaribbeanTilesetImage).then(() => {
    canvas.dataset.rendered = "true";
  });
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
  })
);
function renderCommonCauseTiledMap() {
  const canvas = document.getElementById("commonCauseTiledCanvas");
  if (!canvas || canvas.dataset.rendered === "true") return;
  renderTiledMap(canvas, commonCauseTmj, resolveCommonCauseTilesetImage).then(() => {
    canvas.dataset.rendered = "true";
  });
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

let fieldMovement = { x: 20.0, y: 12.0, facing: "down", moving: false, step: false, queued: null };
let fieldCamera = { x: 0, y: 0 };
const FIELD_GRID = { columns: 40, rows: 24, tile: 40 };
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
const FIELD_BLOCKS = [
  // The field uses a Pokémon-style physics layer: feet collide with bases, not decorative overlap.
  { x1: 2.9, y1: 7.2, x2: 9.9, y2: 9.7, kind: "ship hull" },
  { x1: 7.2, y1: 10.4, x2: 10.1, y2: 11.9, kind: "cartographer table" },
  { x1: 17.6, y1: 5.1, x2: 22.8, y2: 7.8, kind: "garden" },
  { x1: 22.6, y1: 8.0, x2: 26.3, y2: 10.8, kind: "bohio one" },
  { x1: 26.5, y1: 8.7, x2: 30.3, y2: 11.4, kind: "bohio two" },
  { x1: 24.1, y1: 11.3, x2: 27.9, y2: 14.2, kind: "bohio three" },
  { x1: 28.6, y1: 13.1, x2: 32.2, y2: 14.2, kind: "canoe" },
  { x1: 31.2, y1: 14.4, x2: 32.8, y2: 15.8, kind: "campfire" },
  { x1: 33.1, y1: 15.0, x2: 35.4, y2: 16.7, kind: "crate" },
  { x1: 31.6, y1: 16.5, x2: 35.4, y2: 19.2, kind: "tent" },
  { x1: 12.7, y1: 16.4, x2: 15.4, y2: 20.3, kind: "southwest palm" },
  { x1: 13.2, y1: 6.5, x2: 15.3, y2: 9.9, kind: "north palm" },
  { x1: 15.1, y1: 7.1, x2: 17.5, y2: 10.4, kind: "inland palm" },
  { x1: 34.0, y1: 10.8, x2: 36.0, y2: 14.5, kind: "east palm" },
];
const FIELD_NPCS = [
  {
    id: "taino-elder",
    x: 22.0,
    y: 10.9,
    group: "taino",
    name: "Taíno community elder",
    label: "Community elder",
    sprite: "taino-elder",
    text: "Our homes, gardens, and canoes do not appear by chance. Families work here each day, and elders listen before a choice is made for the village.",
  },
  {
    id: "taino-gardener",
    x: 20.9,
    y: 8.5,
    group: "taino",
    name: "Taíno gardener",
    label: "Garden worker",
    sprite: "taino-gardener",
    text: "This ground has been worked by many hands. Cassava and maize feed our families; the garden tells you we know this place well.",
  },
  {
    id: "taino-fisher",
    x: 30.4,
    y: 15.1,
    group: "taino",
    name: "Taíno canoe worker",
    label: "Canoe worker",
    sprite: "taino-fisher",
    text: "The water is a road to us. A good canoe carries food, news, and neighbors farther than a stranger may understand at first glance.",
  },
  {
    id: "spanish-sailor",
    x: 36.0,
    y: 15.8,
    group: "spanish",
    name: "Spanish sailor",
    label: "Spanish sailor",
    sprite: "spanish-sailor",
    text: "We sailed for crown and faith, and every man here hopes the voyage brings reward. That hope shapes what we notice and what we report.",
  },
  {
    id: "columbus",
    x: 5.8,
    y: 10.3,
    group: "spanish",
    name: "Christopher Columbus",
    label: "Columbus",
    sprite: "columbus",
    text: "I must write what will be useful to the sovereigns: harbors, people, riches, and signs that another voyage will be worth their trust.",
  },
  {
    id: "spanish-scribe",
    x: 29.8,
    y: 17.6,
    group: "spanish",
    name: "Spanish scribe",
    label: "Scribe",
    sprite: "spanish-scribe",
    text: "Ink can make a voyage last longer than memory. Still, I choose words for the court, and those choices matter.",
  },
];
const FIELD_NPC_PATROLS = {
  "taino-elder": [
    { x: 22.0, y: 10.9 },
    { x: 21.2, y: 11.2 },
    { x: 21.8, y: 12.0 },
    { x: 22.5, y: 11.7 },
  ],
  "taino-gardener": [
    { x: 20.9, y: 8.5 },
    { x: 21.8, y: 8.3 },
    { x: 22.2, y: 9.0 },
    { x: 20.7, y: 9.1 },
  ],
  "taino-fisher": [
    { x: 30.4, y: 15.1 },
    { x: 29.4, y: 15.0 },
    { x: 29.0, y: 15.8 },
    { x: 30.2, y: 15.9 },
  ],
  "spanish-sailor": [
    { x: 36.0, y: 15.8 },
    { x: 36.7, y: 15.8 },
    { x: 36.8, y: 16.4 },
    { x: 36.2, y: 16.9 },
  ],
  columbus: [
    { x: 5.8, y: 10.3 },
    { x: 6.5, y: 10.3 },
    { x: 6.2, y: 11.0 },
    { x: 5.4, y: 10.9 },
  ],
  "spanish-scribe": [
    { x: 29.8, y: 17.6 },
    { x: 30.4, y: 17.2 },
    { x: 30.3, y: 18.0 },
    { x: 29.6, y: 18.0 },
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
  "taino-context": { x: 22.6, y: 10.2, label: "Village investigation", kind: "Observe" },
  "columbus-letter": { x: 5.2, y: 9.8, label: "Columbus account", kind: "Source" },
  "waldseemuller-map": { x: 8.4, y: 12.15, label: "Cartographer table", kind: "Puzzle" },
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
const UNIT2_FIELD_BLOCKS = [
  { x1: 6.0, y1: 4.0, x2: 11.0, y2: 7.5, kind: "meetinghouse" },
  { x1: 14.0, y1: 5.0, x2: 17.5, y2: 7.6, kind: "dwelling one" },
  { x1: 22.5, y1: 5.5, x2: 26.0, y2: 8.0, kind: "dwelling two" },
  { x1: 19.5, y1: 10.2, x2: 21.0, y2: 11.4, kind: "well" },
  { x1: 5.5, y1: 14.5, x2: 12.0, y2: 18.0, kind: "tobacco rows" },
  { x1: 34.5, y1: 12.8, x2: 36.5, y2: 14.6, kind: "wharf crates" },
];
const UNIT2_FIELD_NPCS = [
  // Placeholder roster: sprites reuse Unit 1 art until Unit 2 sprites exist.
  {
    id: "settlement-minister",
    x: 9.4,
    y: 9.0,
    group: "settlement",
    name: "Settlement minister",
    label: "Minister",
    sprite: "spanish-scribe",
    text: "The meetinghouse holds this settlement's promises — read the charter before you judge who benefits from them.",
  },
  {
    id: "indentured-servant",
    x: 8.2,
    y: 13.4,
    group: "settlement",
    name: "Indentured field servant",
    label: "Field servant",
    sprite: "taino-gardener",
    text: "Seven years I owe for my passage. The rows do not care whose name is on the contract.",
  },
  {
    id: "settlement-burgess",
    x: 16.0,
    y: 9.2,
    group: "settlement",
    name: "Elected burgess",
    label: "Burgess",
    sprite: "columbus",
    text: "We meet, we vote, we send our grievances — self-government grows here because the ocean is wide.",
  },
  {
    id: "settlement-goodwife",
    x: 24.0,
    y: 9.6,
    group: "settlement",
    name: "Goodwife of the settlement",
    label: "Goodwife",
    sprite: "taino-elder",
    text: "Count who does the washing, the brewing, the tending — the record books forget us, but the settlement would starve without us.",
  },
  {
    id: "river-fisher",
    x: 28.0,
    y: 16.0,
    group: "settlement",
    name: "River fisher",
    label: "Fisher",
    sprite: "taino-fisher",
    text: "The river feeds us and carries the hogsheads away. Everything here moves by water.",
  },
  {
    id: "wharf-clerk",
    x: 34.8,
    y: 15.6,
    group: "settlement",
    name: "Wharf clerk",
    label: "Clerk",
    sprite: "spanish-sailor",
    text: "Every cask is entered twice — once for the company, once for the customs man. Ledgers remember what people forget.",
  },
];
const UNIT2_FIELD_NPC_PATROLS = {
  "settlement-minister": [
    { x: 9.4, y: 9.0 },
    { x: 10.2, y: 8.6 },
    { x: 10.6, y: 9.4 },
    { x: 9.0, y: 9.6 },
  ],
  "indentured-servant": [
    { x: 8.2, y: 13.4 },
    { x: 9.4, y: 13.6 },
    { x: 9.0, y: 14.1 },
    { x: 7.8, y: 13.9 },
  ],
  "settlement-burgess": [
    { x: 16.0, y: 9.2 },
    { x: 17.0, y: 9.0 },
    { x: 17.3, y: 9.8 },
    { x: 16.2, y: 10.0 },
  ],
  "settlement-goodwife": [
    { x: 24.0, y: 9.6 },
    { x: 24.9, y: 9.3 },
    { x: 25.2, y: 10.1 },
    { x: 23.8, y: 10.3 },
  ],
  "river-fisher": [
    { x: 28.0, y: 16.0 },
    { x: 28.8, y: 15.7 },
    { x: 29.1, y: 16.5 },
    { x: 27.7, y: 16.7 },
  ],
  "wharf-clerk": [
    { x: 34.8, y: 15.6 },
    { x: 35.6, y: 15.4 },
    { x: 35.9, y: 16.2 },
    { x: 34.9, y: 16.4 },
  ],
};
const UNIT2_FIELD_SOURCE_POINTS = {
  "riverbend-charter": { x: 12.2, y: 6.4, label: "Company charter", kind: "Source" },
  "riverbend-letter": { x: 13.0, y: 16.2, label: "Servant's letter", kind: "Source" },
  "riverbend-ledger": { x: 35.4, y: 11.9, label: "Wharf accounts", kind: "Source" },
};
function isRiverbendLand(x, y) {
  // Rectangular clearing framed by the painted tree line; a river runs north-south
  // on the east side with one bridge crossing.
  if (x < 2.2 || x > 37.8 || y < 2.2 || y > 21.8) return false;
  const inRiver = x > 29.5 && x < 33.5;
  const onBridge = y > 11.0 && y < 13.2;
  return !inRiver || onBridge;
}

// ---- Unit 3 field: The Common Cause (Revolutionary-era Philadelphia gathering ground) ----
// Tiled rebuild — see docs/decision-log/0032-common-cause-tiled-rebuild.md and
// scripts/generate-common-cause-tmj.js. UNIT3_FIELD_BLOCKS below is the source of truth for
// collision; the generator script's stamp() anchors are kept in sync with it manually, the
// same convention scripts/generate-caribbean-tmj.js established for case-001.
const UNIT3_FIELD_BLOCKS = [
  { x1: 5.0, y1: 6.0, x2: 9.5, y2: 9.0, kind: "print shop" },
  { x1: 16.0, y1: 3.5, x2: 23.0, y2: 7.0, kind: "assembly hall" },
  { x1: 21.0, y1: 8.2, x2: 24.0, y2: 9.4, kind: "statehouse steps" },
  { x1: 27.0, y1: 5.0, x2: 31.0, y2: 8.0, kind: "chapel" },
  { x1: 13.0, y1: 13.0, x2: 16.0, y2: 14.5, kind: "market stalls" },
  { x1: 18.7, y1: 11.0, x2: 20.3, y2: 12.0, kind: "town well" },
  { x1: 19.3, y1: 9.0, x2: 20.7, y2: 10.0, kind: "liberty pole" },
  { x1: 33.0, y1: 15.0, x2: 37.0, y2: 18.0, kind: "wharf" },
  { x1: 3.0, y1: 15.0, x2: 6.5, y2: 17.5, kind: "frontier dispatch post" },
  { x1: 9.0, y1: 17.0, x2: 13.0, y2: 20.0, kind: "family residence" },
];
const UNIT3_FIELD_NPCS = [
  // Placeholder roster: sprites reuse Unit 1 field art, same as Unit 2's roster above —
  // no Revolutionary-era sprite sheets exist yet.
  {
    id: "printer-apprentice",
    x: 6.3,
    y: 9.7,
    group: "commoncause",
    name: "Printer's apprentice",
    label: "Printer's apprentice",
    sprite: "spanish-scribe",
    text: "Type must be set backward, letter by letter, until the words print true. Master Dickinson's letters go out under a farmer's name — safer for a press, and no less read for it.",
  },
  {
    id: "town-crier",
    x: 19.5,
    y: 13.0,
    group: "commoncause",
    name: "Town crier",
    label: "Town crier",
    sprite: "columbus",
    text: "Hear ye — Parliament's duties still stand, and talk in every tavern turns to committees, boycotts, and what a colony owes its King. I only carry the news; deciding what to do with it is your affair.",
  },
  {
    id: "militia-recruiter",
    x: 15.5,
    y: 8.3,
    group: "commoncause",
    name: "Militia recruiter",
    label: "Militia recruiter",
    sprite: "spanish-sailor",
    text: "Muster on the green Tuesday next. A man who won't drill now may wish later he had — word from Virginia says even the House of Burgesses is arming its militia.",
  },
  {
    id: "free-tradesman",
    x: 25.0,
    y: 10.5,
    group: "commoncause",
    name: "Free Black tradesman",
    label: "Tradesman",
    sprite: "taino-elder",
    text: "I read the broadsides same as any freeman here. Strange, to hear talk of chains and slavery from men who'd never let it touch their own thinking on who else wears them.",
  },
  {
    id: "loyalist-merchant",
    x: 32.0,
    y: 16.5,
    group: "commoncause",
    name: "Loyalist merchant",
    label: "Merchant",
    sprite: "taino-fisher",
    text: "My ledgers balance because the Crown's ships still call at this port. I'll not pretend disorder in the streets is good for trade, whatever cause it claims to serve.",
  },
  {
    id: "farmwife",
    x: 10.0,
    y: 15.8,
    group: "commoncause",
    name: "Farmwife",
    label: "Farmwife",
    sprite: "taino-gardener",
    text: "My husband's away with the militia and the mending doesn't stop because Parliament's vexed us. Whatever new government they draft, I mean to see it remembers the women keeping the house together.",
  },
];
const UNIT3_FIELD_NPC_PATROLS = {
  "printer-apprentice": [
    { x: 6.3, y: 9.7 },
    { x: 7.0, y: 9.5 },
    { x: 7.3, y: 10.0 },
    { x: 6.6, y: 10.2 },
  ],
  "town-crier": [
    { x: 19.5, y: 13.0 },
    { x: 20.3, y: 12.8 },
    { x: 20.6, y: 13.6 },
    { x: 19.2, y: 13.8 },
  ],
  "militia-recruiter": [
    { x: 15.5, y: 8.3 },
    { x: 16.2, y: 8.0 },
    { x: 16.4, y: 8.7 },
    { x: 15.2, y: 8.8 },
  ],
  "free-tradesman": [
    { x: 25.0, y: 10.5 },
    { x: 25.7, y: 10.2 },
    { x: 26.0, y: 11.0 },
    { x: 24.6, y: 11.2 },
  ],
  "loyalist-merchant": [
    { x: 32.0, y: 16.5 },
    { x: 32.6, y: 16.2 },
    { x: 32.9, y: 17.0 },
    { x: 31.6, y: 17.2 },
  ],
  farmwife: [
    { x: 10.0, y: 15.8 },
    { x: 10.7, y: 15.5 },
    { x: 11.0, y: 16.3 },
    { x: 9.6, y: 16.5 },
  ],
};
const UNIT3_FIELD_SOURCE_POINTS = {
  "commoncause-pontiac-speech": { x: 5.0, y: 18.1, label: "Frontier dispatch", kind: "Source" },
  "commoncause-dickinson-letter": { x: 8.6, y: 9.6, label: "Print shop broadside", kind: "Source" },
  "commoncause-henry-speech": { x: 19.5, y: 7.6, label: "Assembly hall speech", kind: "Source" },
  "commoncause-wheatley-poem": { x: 29.0, y: 8.6, label: "Chapel elegy", kind: "Source" },
  "commoncause-dunmore-proclamation": { x: 36.0, y: 18.7, label: "Wharf dispatch", kind: "Source" },
  "commoncause-hall-petition": { x: 22.5, y: 9.9, label: "Statehouse petition", kind: "Source" },
  "commoncause-adams-letter": { x: 11.0, y: 20.6, label: "Home correspondence", kind: "Source" },
};
function isCommonCauseLand(x, y) {
  // A rectangular town gathering ground framed by a painted tree line, same simple
  // shape as Riverbend's clearing — no water crossing needed for this setting.
  return x > 2.2 && x < 37.8 && y > 2.2 && y < 21.8;
}
function commonCauseWorldMarkup() {
  return `<canvas class="field-world-art" id="commonCauseTiledCanvas" role="img" aria-label="Top-down Revolutionary-era Philadelphia gathering ground with a print shop, assembly hall, chapel, market, liberty pole, wharf, frontier dispatch post, and a family residence"></canvas>`;
}

const FIELD_MAPS = {
  "unit-01": {
    id: "unit-01",
    spawn: { x: 20.0, y: 12.0 },
    recall: { x: 10.5, y: 13.5 },
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
    spawn: { x: 20.0, y: 12.0 },
    recall: { x: 17.0, y: 12.4 },
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
    spawn: { x: 20.0, y: 16.0 },
    recall: { x: 24.0, y: 17.5 },
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
const ARCHIVE_ROOM_GRID = { columns: 10, rows: 8 };
// Hand-measured against the tile art generated by scripts/generate-archive-room-tmj.js
// (record shelf + record rack anchored at grid (3,1)-(7,3); reading table anchored at
// (1,5)-(5,7)) — collision intentionally a little smaller than the drawn furniture for
// game-feel, same convention as docs/decision-log/0026-archive-pathing-cursor-audio.md.
const ARCHIVE_ROOM_BLOCK_RECTS = [
  { x1: 3.1, y1: 1.05, x2: 6.9, y2: 2.85, kind: "archive record shelving" },
  // x2 kept below 4.6 (not 4.85, the table art's true right edge) so the exitDoor's spawn
  // point at (5.0, 6.1) — 0.28 foot-box radius reaches x=4.72 — never spawns inside geometry,
  // which froze all movement (the player's very first foot-box already read as blocked).
  { x1: 1.15, y1: 5.1, x2: 4.6, y2: 6.7, kind: "reading table" },
];
const ARCHIVE_ROOM_TARGETS = {
  terminal: {
    x: 5.0,
    y: 3.7,
    name: "Archive Terminal",
    role: "Archive Challenges interface",
    dialogue: () => "Archive Challenges for this unit are still being cataloged. Check back soon.",
    action: "archive-challenges",
  },
  exitDoor: {
    x: 5.0,
    y: 6.7,
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
  "reconstruction",
  "ledger",
  "ledger-success",
  "founding",
  "empire",
  "upload",
  "return-warp",
  "review",
  "completion",
  "triangle",
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
  "manage-content",
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
};
// Manage Content (Teacher Mode's source/MCQ-quest swap editor) state —
// separate from teacherUiState since it's a distinct screen family with its
// own loader/click-handler group, mirroring how gradingUiState is split out.
let contentUiState = {
  selectedCaseId: null,
  slots: [], // [{slotKind, officialId, officialLabel, draftAltId, publishedAltId, alternatives: [{id,label}]}]
  previewing: false,
  error: "",
  pending: false,
};
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
};
function archiveChallengeQuestFor(questType, questId) {
  return (ARCHIVE_CHALLENGE_QUESTS_BY_TYPE[questType] || []).find((quest) => quest.id === questId);
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
// gradeQuest()'s result shape differs by quest type: evidence-organizing
// ({allPlacedCorrectly, reflectionOk, complete}) and hipp ({results,
// pointsEarned, pointsPossible, complete}) both carry a `complete` field,
// but mcq and sequencing only return {answered, correct} — no `complete`.
// investigationScreen()/archiveChallengesScreen() need one completion
// signal that works across all four, since case-003's Archive Challenge
// (sequencing) and taino-context/waldseemuller-map/dickinson-letter's
// Investigation Challenges (mcq/sequencing) were the first quests of those
// types ever reached through either screen.
function isChallengeQuestComplete(questType, result) {
  return questType === "mcq" || questType === "sequencing" ? !!result.correct : !!result.complete;
}
// Same cross-type problem for "has the player started answering yet":
// mcq/hipp state lives in state.selected, sequencing in state.order,
// evidence-organizing in state.placements.
function challengeQuestAnsweredAny(questType, state) {
  if (questType === "sequencing") return Array.isArray(state.order) && state.order.length > 0;
  if (questType === "evidence-organizing") return Object.keys(state.placements || {}).length > 0;
  return Object.keys(state.selected || {}).length > 0;
}
// True when the incomplete-state hint below represents a partial-success
// state (all placements correct, only the reflection missing) rather than a
// plain not-yet-answered instruction — callers use this to keep the old
// "success"-styled feedback for that specific evidence-organizing state.
function challengeQuestPartialSuccess(questType, result) {
  return questType === "evidence-organizing" && !!result.allPlacedCorrectly && !result.reflectionOk;
}
function challengeQuestHint(questType, result) {
  if (questType === "evidence-organizing") {
    return challengeQuestPartialSuccess(questType, result)
      ? "All records restored to the right slot. Add a reflection of at least a sentence to complete this challenge."
      : 'Drag each record into the slot it belongs in (or use the "Place in" menu on each card).';
  }
  if (questType === "sequencing")
    return "Use the ↑/↓ buttons (or drag) to arrange the records in order.";
  if (questType === "hipp")
    return "Choose the option that explains how or why this shapes the source's argument, not just names it.";
  return "Choose the option that best explains why, not just the option that names the correct answer.";
}
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
const save = () => saveProgress(progress);

function chrome() {
  return `<header class="chrome"><button class="brand" data-action="home" aria-label="Return to Chronicle Institute"><span class="brand-mark">✦</span><span><small>${esc(BRAND.engine)}</small><strong>${esc(BRAND.campaign)}</strong></span></button><div class="chrome-right"><span class="link-status"><i></i>${esc(BRAND.status)}</span><button class="text-button" data-action="open-main-menu">Menu</button><button class="audio-toggle ${isAudioEnabled() ? "is-on" : ""}" data-action="toggle-audio" aria-label="Toggle Chronicle music">♫ ${isAudioEnabled() ? "Music on" : "Music off"}</button><button class="author-toggle ${authorMode ? "active" : ""}" data-action="author">✦ ${authorMode ? "Author Mode On" : "Author Mode"}</button></div></header>`;
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
  return `<div class="password-field"><input id="${esc(id)}" type="password" placeholder="${esc(placeholder)}" value="${esc(value)}" autocomplete="off"><button class="password-toggle" type="button" data-action="toggle-password-visibility" data-target="${esc(id)}" aria-pressed="false">Show</button></div>`;
}

function joinScreen() {
  const isClaim = authUiState.studentTab !== "signin";
  return `${chrome()}<main class="shell completion-shell"><section>
<p class="kicker">${esc(BRAND.engine)}</p>
<h1>Join a Classroom</h1>
<p>${
    isClaim
      ? "First time joining? Your teacher gave you a classroom code and a student ID — claim your seat and set a password."
      : "Already claimed your seat? Sign back in with your classroom code, student ID, and password."
  }</p>
<div class="completion-actions">
<button class="btn ${isClaim ? "btn-gold" : "btn-outline"}" data-action="student-tab-claim" type="button">First time</button>
<button class="btn ${!isClaim ? "btn-gold" : "btn-outline"}" data-action="student-tab-signin" type="button">Returning</button>
</div>
<label>Classroom code<input id="join-classroom-code" placeholder="e.g. FOX7K2" autocomplete="off"></label>
<label>Your student ID<input id="join-student-id" placeholder="e.g. 07" autocomplete="off"></label>
${isClaim ? `<label>Display name (optional)<input id="join-display-name" placeholder="How your teacher sees you" autocomplete="off"></label>` : ""}
<label>Password${passwordFieldMarkup("join-password", "••••••••")}</label>
${authUiState.error ? `<p class="feedback error">${esc(authUiState.error)}</p>` : ""}
<button class="btn btn-gold" data-action="${isClaim ? "submit-join-claim" : "submit-join-signin"}" type="button" ${authUiState.pending ? "disabled" : ""}>${authUiState.pending ? "Please wait…" : isClaim ? "Claim my seat →" : "Sign in →"}</button>
<button class="btn btn-outline" data-action="open-main-menu" type="button">← Back</button>
</section></main>${authorPanel()}`;
}

function loginScreen() {
  const isSignIn = authUiState.teacherTab !== "signup";
  if (isSignIn) {
    return `${chrome()}<main class="shell completion-shell"><section>
<p class="kicker">${esc(BRAND.engine)}</p>
<h1>Teacher Sign In</h1>
<div class="completion-actions">
<button class="btn btn-gold" data-action="teacher-tab-signin" type="button">Sign In</button>
<button class="btn btn-outline" data-action="teacher-tab-signup" type="button">Create Account</button>
</div>
<label>Email<input id="teacher-email" type="email" placeholder="you@school.edu" autocomplete="off"></label>
<label>Password${passwordFieldMarkup("teacher-password", "••••••••")}</label>
${authUiState.info ? `<p class="feedback">${esc(authUiState.info)}</p>` : ""}
${authUiState.error ? `<p class="feedback error">${esc(authUiState.error)}</p>` : ""}
<button class="btn btn-gold" data-action="submit-teacher-signin" type="button" ${authUiState.pending ? "disabled" : ""}>${authUiState.pending ? "Please wait…" : "Sign In →"}</button>
<button class="btn btn-outline" data-action="continue-with-google" type="button" ${authUiState.pending ? "disabled" : ""}>Continue with Google</button>
${import.meta.env.DEV ? `<button class="btn btn-outline" data-action="dev-fake-teacher" type="button" ${authUiState.pending ? "disabled" : ""}>🧪 Dev: Fake Teacher</button>` : ""}
<button class="btn btn-outline" data-action="open-main-menu" type="button">← Back</button>
</section></main>${authorPanel()}`;
  }
  if (authUiState.signupStep === 2) {
    const rows = authUiState.classroomRows
      .map(
        (row, i) => `<div class="classroom-setup-row">
<label>Classroom ${i + 1} name<input data-classroom-row-name data-row-index="${i}" value="${esc(row.name)}" autocomplete="off"></label>
<label>Students<input data-classroom-row-count data-row-index="${i}" type="number" min="1" max="200" value="${row.studentCount}"></label>
</div>`
      )
      .join("");
    return `${chrome()}<main class="shell completion-shell"><section>
<p class="kicker">${esc(BRAND.engine)} · Step 2 of 2</p>
<h1>Set Up Classrooms</h1>
<p>Choose how many classrooms to create now — you can always add more later from your dashboard.</p>
<label>How many classrooms?<input id="signup-classroom-count" data-classroom-count type="number" min="1" max="20" value="${authUiState.classroomRows.length}"></label>
${rows}
${authUiState.error ? `<p class="feedback error">${esc(authUiState.error)}</p>` : ""}
<button class="btn btn-gold" data-action="submit-teacher-signup" type="button" ${authUiState.pending ? "disabled" : ""}>${authUiState.pending ? "Please wait…" : "Create Account & Classrooms →"}</button>
<button class="btn btn-outline" data-action="teacher-signup-back" type="button">← Back</button>
</section></main>${authorPanel()}`;
  }
  const draft = authUiState.signupDraft;
  return `${chrome()}<main class="shell completion-shell"><section>
<p class="kicker">${esc(BRAND.engine)} · Step 1 of 2</p>
<h1>Create Teacher Account</h1>
<div class="completion-actions">
<button class="btn btn-outline" data-action="teacher-tab-signin" type="button">Sign In</button>
<button class="btn btn-gold" data-action="teacher-tab-signup" type="button">Create Account</button>
</div>
<label>Your name<input id="teacher-display-name" placeholder="Ms. Rivera" value="${esc(draft?.displayName || "")}" autocomplete="off"></label>
<label>School / organization<input id="teacher-school-name" placeholder="e.g. Lincoln High School" value="${esc(draft?.schoolName || "")}" autocomplete="off"></label>
<label>Email<input id="teacher-email" type="email" placeholder="you@school.edu" value="${esc(draft?.email || "")}" autocomplete="off"></label>
<label>Password${passwordFieldMarkup("teacher-password", "••••••••", draft?.password || "")}</label>
<label>Confirm password${passwordFieldMarkup("teacher-confirm-password", "••••••••")}</label>
${authUiState.info ? `<p class="feedback">${esc(authUiState.info)}</p>` : ""}
${authUiState.error ? `<p class="feedback error">${esc(authUiState.error)}</p>` : ""}
<button class="btn btn-gold" data-action="teacher-signup-continue" type="button" ${authUiState.pending ? "disabled" : ""}>Continue →</button>
<button class="btn btn-outline" data-action="continue-with-google" type="button" ${authUiState.pending ? "disabled" : ""}>Continue with Google</button>
<button class="btn btn-outline" data-action="open-main-menu" type="button">← Back</button>
</section></main>${authorPanel()}`;
}

function teacherDashboardScreen() {
  if (!currentProfile || currentProfile.role !== "teacher") {
    return `${chrome()}<main class="shell completion-shell"><section><p class="kicker">${esc(BRAND.engine)}</p><h1>Teacher Dashboard</h1><p>Sign in as a teacher to manage classrooms.</p><button class="btn btn-outline" data-action="open-teacher-login" type="button">Teacher Sign In →</button><button class="btn btn-outline" data-action="open-main-menu" type="button">← Back</button></section></main>${authorPanel()}`;
  }
  const classroomButtons = teacherUiState.classrooms
    .map(
      (c) =>
        `<button class="btn ${c.id === teacherUiState.selectedClassroomId ? "btn-gold" : "btn-outline"}" data-action="select-classroom" data-classroom-id="${esc(c.id)}" type="button">${esc(c.name)} (${esc(c.join_code)})</button>`
    )
    .join("");
  const rosterRows = teacherUiState.roster
    .map((slot) => {
      const summary = slot.auth_user_id ? teacherUiState.progressByStudent[slot.auth_user_id] : null;
      const progressLabel = summary
        ? `${summary.completedCount} case${summary.completedCount === 1 ? "" : "s"} complete`
        : "Not started";
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
      return `<tr><td>${esc(slot.student_id_code)}</td><td>${esc(slot.display_name || "—")}</td><td>${esc(slot.status)}</td><td><span class="roster-progress-pill">${esc(progressLabel)}</span></td><td>${actions}</td></tr>`;
    })
    .join("");
  const submissionRows = teacherUiState.submissions
    .map(
      (sub) =>
        `<tr><td>${esc(sub.studentDisplayName)}</td><td>${esc(sub.taskType)}</td><td>${esc(sub.taskId)}</td><td>${esc(sub.readiness || "—")}</td><td><button class="text-button" data-action="open-grading" data-submission-id="${esc(sub.id)}" type="button">Review →</button></td></tr>`
    )
    .join("");
  return `${chrome()}<main class="shell completion-shell"><section>
<p class="kicker">${esc(BRAND.engine)}</p>
<h1>Teacher Dashboard</h1>
<p>Signed in as ${esc(currentProfile.displayName)}.</p>
<div class="completion-actions">${classroomButtons}</div>
<label>New classroom name<input id="new-classroom-name" placeholder="e.g. APUSH Period 4" autocomplete="off"></label>
<button class="btn btn-outline" data-action="create-classroom" type="button">Create classroom</button>
${
  teacherUiState.selectedClassroomId
    ? `<label>Add N students<input id="provision-count" type="number" min="1" max="200" value="5"></label><button class="btn btn-outline" data-action="provision-roster" type="button">Add roster slots</button>`
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
${teacherUiState.error ? `<p class="feedback error">${esc(teacherUiState.error)}</p>` : ""}
${
  teacherUiState.selectedClassroomId
    ? `<table class="roster-table"><thead><tr><th>ID</th><th>Name</th><th>Status</th><th>Progress</th><th></th></tr></thead><tbody>${rosterRows}</tbody></table>`
    : ""
}
${
  teacherUiState.selectedClassroomId
    ? `<h2>Submissions to review</h2>${submissionRows ? `<table class="roster-table"><thead><tr><th>Student</th><th>Type</th><th>Task</th><th>Readiness</th><th></th></tr></thead><tbody>${submissionRows}</tbody></table>` : "<p>No submissions yet for this classroom.</p>"}`
    : ""
}
${teacherUiState.selectedClassroomId ? teacherUnitAccessMarkup() : ""}
${
  teacherUiState.selectedClassroomId
    ? `<button class="btn btn-outline" data-action="open-manage-content" type="button">Manage Content →</button>`
    : ""
}
<button class="btn btn-outline" data-action="teacher-sign-out" type="button">Sign out</button>
<button class="btn btn-outline" data-action="open-main-menu" type="button">← Back</button>
</section></main>${authorPanel()}`;
}

function teacherUnitAccessMarkup() {
  const index = teacherUiState.enabledUnitIndex;
  const currentUnit = UNITS[index];
  const nextUnit = UNITS[index + 1];
  return `<h2>Unit access</h2>
<p>Students can currently reach: <strong>${esc(resolvedUnitTitle(currentUnit))}</strong> and everything before it.</p>
${
  nextUnit
    ? `<button class="btn btn-outline" data-action="advance-classroom-unit" type="button">Advance to ${esc(resolvedUnitTitle(nextUnit))} →</button>`
    : `<p class="kicker">All units are already available.</p>`
}`;
}

function gradingScreen() {
  if (!currentProfile || currentProfile.role !== "teacher") {
    return `${chrome()}<main class="shell completion-shell"><section><p class="kicker">${esc(BRAND.engine)}</p><h1>Grading</h1><p>Sign in as a teacher to review submissions.</p><button class="btn btn-outline" data-action="open-teacher-login" type="button">Teacher Sign In →</button></section></main>${authorPanel()}`;
  }
  const submission = gradingUiState.submission;
  if (!submission) {
    return `${chrome()}<main class="shell completion-shell"><section><p class="kicker">${esc(BRAND.engine)}</p><h1>Grading</h1><p>${gradingUiState.error ? esc(gradingUiState.error) : "Loading submission…"}</p><button class="btn btn-outline" data-action="back-to-teacher-dashboard" type="button">← Back to dashboard</button></section></main>${authorPanel()}`;
  }
  const grades =
    submission.grades
      .map(
        (g) =>
          `<article class="manual-grade-entry"><p class="kicker">${esc(new Date(g.created_at).toLocaleString())}</p><h3>${esc(g.grade_label)}</h3>${g.teacher_feedback ? `<p>${esc(g.teacher_feedback)}</p>` : ""}</article>`
      )
      .join("") || "<p>No grade entered yet.</p>";
  return `${chrome()}<main class="shell review-shell"><section class="review-copy">
<button class="back-link" data-action="back-to-teacher-dashboard">← Back to dashboard</button>
<p class="kicker">${esc(submission.taskType)} · ${esc(submission.taskId)}</p>
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
<label>Grade<input id="grade-label" placeholder="e.g. 3/3 or Meets expectations" autocomplete="off"></label>
<label>Feedback to student (optional)<textarea id="grade-teacher-feedback" placeholder="Additional notes for the student"></textarea></label>
${gradingUiState.error ? `<p class="feedback error">${esc(gradingUiState.error)}</p>` : ""}
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
    teacherUiState.error = err.message || "Could not load your classrooms.";
  }
  render();
}

async function loadSelectedClassroomDetails() {
  if (!teacherUiState.selectedClassroomId) {
    teacherUiState.roster = [];
    teacherUiState.submissions = [];
    teacherUiState.progressByStudent = {};
    teacherUiState.enabledUnitIndex = 0;
    return;
  }
  teacherUiState.roster = await getRoster(teacherUiState.selectedClassroomId);
  teacherUiState.submissions = await listForClassroom(teacherUiState.selectedClassroomId);
  teacherUiState.progressByStudent = await getClassroomProgressSummaries(
    teacherUiState.selectedClassroomId
  );
  teacherUiState.enabledUnitIndex = await getClassroomUnitFloor(teacherUiState.selectedClassroomId);
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
    gradingUiState.error = err.message || "Could not load this submission.";
  }
  render();
}

// --- Manage Content (Teacher Mode's source/MCQ-quest swap editor) --------
// Cases with a curated swap pool today — proof-of-pipeline scope is Case
// 1.01 only (see apps/web/src/content/case-001-source-alternates.js), but
// this stays a general filter (any case with a source/mcq array) so adding
// more cases' alternates later needs no main.js change.
function manageableCases() {
  return UNITS.flatMap((unit) => unit.cases).filter((c) => UNIT_SOURCES[c.id] || PRACTICE_CHECK_QUESTS[c.id]?.mcq);
}

function manageContentScreen() {
  if (!currentProfile || currentProfile.role !== "teacher") {
    return `${chrome()}<main class="shell completion-shell"><section><p class="kicker">${esc(BRAND.engine)}</p><h1>Manage Content</h1><p>Sign in as a teacher to manage content.</p><button class="btn btn-outline" data-action="open-teacher-login" type="button">Teacher Sign In →</button></section></main>${authorPanel()}`;
  }
  const caseRows = manageableCases()
    .map(
      (c) =>
        `<tr><td>${esc(c.shortTitle)}</td><td>${esc(c.title)}</td><td><button class="text-button" data-action="open-manage-content-case" data-case-id="${esc(c.id)}" type="button">Edit sources &amp; quests →</button></td></tr>`
    )
    .join("");
  return `${chrome()}<main class="shell completion-shell"><section>
<button class="back-link" data-action="back-to-teacher-dashboard">← Back to dashboard</button>
<p class="kicker">${esc(BRAND.engine)}</p>
<h1>Manage Content</h1>
<p>Pick a case to review or swap its primary sources and practice-check questions for this classroom.</p>
<table class="roster-table"><thead><tr><th>Case</th><th>Title</th><th></th></tr></thead><tbody>${caseRows}</tbody></table>
</section></main>${authorPanel()}`;
}

function manageContentCaseScreen() {
  if (!currentProfile || currentProfile.role !== "teacher") {
    return `${chrome()}<main class="shell completion-shell"><section><p class="kicker">${esc(BRAND.engine)}</p><h1>Manage Content</h1><p>Sign in as a teacher to manage content.</p><button class="btn btn-outline" data-action="open-teacher-login" type="button">Teacher Sign In →</button></section></main>${authorPanel()}`;
  }
  const activeCase = caseById(contentUiState.selectedCaseId);
  if (!activeCase) {
    return `${chrome()}<main class="shell completion-shell"><section><p class="kicker">${esc(BRAND.engine)}</p><h1>Manage Content</h1><p>${contentUiState.error ? esc(contentUiState.error) : "Loading case…"}</p><button class="btn btn-outline" data-action="back-to-manage-content" type="button">← All cases</button></section></main>${authorPanel()}`;
  }
  const slotRows = contentUiState.slots
    .map((slot) => {
      const altOptions = [
        `<option value="" ${!slot.draftAltId ? "selected" : ""}>Official — ${esc(slot.officialLabel)}</option>`,
        ...slot.alternatives.map(
          (alt) =>
            `<option value="${esc(alt.id)}" ${slot.draftAltId === alt.id ? "selected" : ""}>${esc(alt.label)}</option>`
        ),
      ].join("");
      const publishedLabel = slot.publishedAltId
        ? slot.alternatives.find((a) => a.id === slot.publishedAltId)?.label || slot.publishedAltId
        : "Official";
      return `<tr>
<td>${slot.slotKind === "source" ? "Source" : "MCQ"}: ${esc(slot.officialLabel)}</td>
<td><select data-content-alternate-slot-kind="${esc(slot.slotKind)}" data-content-alternate-slot-id="${esc(slot.officialId)}">${altOptions}</select></td>
<td>Currently published: ${esc(publishedLabel)}</td>
</tr>`;
    })
    .join("");
  const hasUnpublishedDraft = contentUiState.slots.some((s) => s.draftAltId !== s.publishedAltId);
  return `${chrome()}<main class="shell completion-shell"><section>
<button class="back-link" data-action="back-to-manage-content">← All cases</button>
<p class="kicker">${esc(activeCase.shortTitle)}</p>
<h1>${esc(activeCase.title)}</h1>
${contentUiState.slots.length ? `<table class="roster-table"><thead><tr><th>Slot</th><th>Selection (draft)</th><th>Live status</th></tr></thead><tbody>${slotRows}</tbody></table>` : "<p>This case has no swappable sources or quests yet.</p>"}
${contentUiState.error ? `<p class="feedback error">${esc(contentUiState.error)}</p>` : ""}
<button class="btn btn-gold" data-action="publish-case-content" type="button" ${hasUnpublishedDraft ? "" : "disabled"}>Publish to students</button>
<button class="btn btn-outline" data-action="toggle-content-preview" type="button">${contentUiState.previewing ? "Exit preview" : "Preview as student →"}</button>
${contentUiState.previewing ? manageContentPreviewMarkup() : ""}
</section></main>${authorPanel()}`;
}

// Read-only recap reusing the same resolved-content fields sourceReader()/renderQuest()
// show a student, so a teacher's Preview reflects exactly what publishing would produce.
// Resolution mode is switched to "draft" by the toggle-content-preview handler while this
// is showing, and back to "published" the moment it's turned off — see
// remote-content-selection-repository.js's loadSelectionsForResolution.
function manageContentPreviewMarkup() {
  const caseId = contentUiState.selectedCaseId;
  const sourceCards = sourcesForCase(caseId)
    .map(
      (source) =>
        `<article class="quest-practice-item"><p class="kicker">${esc(source.type)}</p><h3>${esc(source.title)}</h3><p>${esc(source.excerpt)}</p></article>`
    )
    .join("");
  const questSet = PRACTICE_CHECK_QUESTS[caseId];
  const mcqCards = (questSet?.mcq || [])
    .map(resolveMcqQuestSlot)
    .map((quest) => `<div class="quest-practice-item">${renderQuest("mcq", quest, {})}</div>`)
    .join("");
  return `<div class="activity-rule"><b>Preview:</b> this shows your draft selections exactly as a student would see them once published.</div>
${sourceCards ? `<h3>Sources</h3>${sourceCards}` : ""}
${mcqCards ? `<h3>Practice Check questions</h3>${mcqCards}` : ""}`;
}

async function loadManageContentCaseData(caseId) {
  contentUiState.selectedCaseId = caseId;
  contentUiState.error = "";
  try {
    const rows = await listSelectionsForCase(teacherUiState.selectedClassroomId, caseId);
    const bySlot = {};
    for (const row of rows) {
      const key = `${row.slot_kind}:${row.slot_content_id}`;
      (bySlot[key] ??= {})[row.status] = row.alt_content_id;
    }
    const sourceSlots = (UNIT_SOURCES[caseId] || []).map((source) => {
      const key = `source:${source.id}`;
      return {
        slotKind: "source",
        officialId: source.id,
        officialLabel: source.title,
        draftAltId: bySlot[key]?.draft || null,
        publishedAltId: bySlot[key]?.published || null,
        alternatives: alternativesForSourceSlot(source.id),
      };
    });
    const mcqSlots = (PRACTICE_CHECK_QUESTS[caseId]?.mcq || []).map((quest) => {
      const key = `mcq-quest:${quest.id}`;
      return {
        slotKind: "mcq-quest",
        officialId: quest.id,
        officialLabel: quest.prompt,
        draftAltId: bySlot[key]?.draft || null,
        publishedAltId: bySlot[key]?.published || null,
        alternatives: alternativesForMcqSlot(quest.id),
      };
    });
    contentUiState.slots = [...sourceSlots, ...mcqSlots];
  } catch (err) {
    contentUiState.error = err.message || "Could not load this case's content.";
  }
  render();
}

function handleManageContentClick(target, action) {
  if (action === "open-manage-content-case") {
    contentUiState = { selectedCaseId: target.dataset.caseId, slots: [], previewing: false, error: "", pending: false };
    progress.currentScreen = "manage-content-case";
    save();
    render();
    loadManageContentCaseData(target.dataset.caseId);
    return true;
  }
  if (action === "back-to-manage-content") {
    progress.currentScreen = "manage-content";
    contentUiState.previewing = false;
    save();
    render();
    return true;
  }
  if (action === "publish-case-content") {
    const slotIds = contentUiState.slots.map((s) => ({ slotKind: s.slotKind, slotContentId: s.officialId }));
    publishCaseSelections(teacherUiState.selectedClassroomId, contentUiState.selectedCaseId, slotIds)
      .then(() => loadSelectionsForResolution(teacherUiState.selectedClassroomId, "published"))
      .then(() => loadManageContentCaseData(contentUiState.selectedCaseId))
      .catch((err) => {
        contentUiState.error = err.message || "Could not publish these changes.";
        render();
      });
    return true;
  }
  if (action === "toggle-content-preview") {
    contentUiState.previewing = !contentUiState.previewing;
    loadSelectionsForResolution(
      teacherUiState.selectedClassroomId,
      contentUiState.previewing ? "draft" : "published"
    ).then(render);
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
  return `<div class="preservation-case" role="dialog" aria-modal="true" aria-labelledby="preservationCaseTitle"><article><button class="hub-dialogue__close" data-action="hub-dialogue-close" aria-label="Close preservation case">×</button><p class="kicker">Preservation Case</p><h2 id="preservationCaseTitle">Chronicle Badge Case</h2><p class="preservation-case__subtitle">Badges are preserved here after each field area is completed and transmitted through the Codex.</p>${sections}</article></div>`;
}

function institutePositionStyle() {
  const grid = activeHubGrid();
  return `left:${(((instituteMovement.x + 0.5) / grid.columns) * 100).toFixed(3)}%;top:${(((instituteMovement.y + 0.54) / grid.rows) * 100).toFixed(3)}%;`;
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
  const pos = (target) =>
    `left:${(((target.x + 0.5) / ARCHIVE_ROOM_GRID.columns) * 100).toFixed(3)}%;top:${(((target.y + 0.5) / ARCHIVE_ROOM_GRID.rows) * 100).toFixed(3)}%`;
  return `${chrome()}<main class="hub-shell hub-shell--status-left"><section class="hub-intro"><p class="kicker">Chronicle Institute · Archive Room</p><h1>Institute Archive</h1><p class="hub-subtitle">Where recovered records are organized, restored, and preserved.</p><p>Approach the Archive Terminal to review Archive Challenges for the active unit. Walk back through the doorway to return to the Main Hall.</p></section><section class="institute-map institute-map--archive-room" id="archiveRoomMap" aria-label="Playable Chronicle Institute Archive Room"><canvas class="field-world-art" id="archiveRoomTiledCanvas" role="img" aria-label="Top-down archive records room with a record shelf, a wine-rack-style record cabinet, and a reading table (Medieval Tavern tileset)"></canvas><button class="hub-table ${near("terminal") ? "is-near" : ""}" style="${pos(targets.terminal)}" data-action="hub-interact" data-target="terminal" data-hub-target="terminal" aria-label="Open Archive Terminal"><span>▤</span><b>Archive Terminal</b></button><button class="hub-table ${near("exitDoor") ? "is-near" : ""}" style="${pos(targets.exitDoor)}" data-action="hub-interact" data-target="exitDoor" data-hub-target="exitDoor" aria-label="Leave the Archive Room"><span>⤴</span><b>Leave Archive</b></button><div class="hub-player" id="institutePlayer" data-facing="${instituteMovement.facing}" style="${institutePositionStyle()}"><span></span><img id="institutePlayerSprite" src="${instituteSpriteUrl()}" alt="${esc(progress.profile.name || "Chronicler")}"></div><div class="hub-interact-prompt" id="hubInteractPrompt" ${nearby ? "" : "hidden"}>${nearby ? `Press E · ${esc(nearby[1].name)}` : ""}</div></section></main>${authorPanel()}`;
}

// Shared card renderer for one Archive Challenge, used for both case-level
// challenges (case.archiveChallenge — completing one unlocks the next case,
// same as the bespoke screen it replaced, e.g. regionsScreen()) and
// unit-level bonus challenges (unit.archiveChallenges[] — not tied to any
// case, so there's nothing to unlock via onComplete). A case-level challenge
// already in progress.completedCases from before its migration is shown as
// complete without replay, preserving old-save completion (alreadyComplete).
function archiveChallengeCard(
  kicker,
  questType,
  questId,
  { alreadyComplete = false, onComplete } = {}
) {
  const quest = archiveChallengeQuestFor(questType, questId);
  if (!quest) return "";
  const state = progress.questResponses[questId] || {};
  const result = alreadyComplete ? { complete: true } : gradeQuest(questType, quest, state);
  const complete = alreadyComplete || isChallengeQuestComplete(questType, result);
  if (complete && progress.archiveChallenges[questId]?.status !== "complete") {
    progress.archiveChallenges[questId] = {
      status: "complete",
      completedAt: new Date().toISOString(),
    };
    if (!alreadyComplete) playSfx("upload");
    onComplete?.();
  }
  if (alreadyComplete) {
    return `<div class="quest-practice-item archive-challenge-item" data-quest-status="correct"><p class="kicker">${esc(kicker)}</p><p class="quest-prompt">${esc(quest.prompt)}</p><p class="activity-feedback success" role="status" aria-live="polite">Archive Challenge complete — this collection has already been restored and preserved.</p></div>`;
  }
  const feedback = complete
    ? `<p class="activity-feedback success" role="status" aria-live="polite">Archive Challenge complete — case record preserved.</p>`
    : `<p class="activity-feedback${challengeQuestPartialSuccess(questType, result) ? " success" : ""}" role="status" aria-live="polite">${challengeQuestHint(questType, result)}</p>`;
  const status = complete
    ? "correct"
    : challengeQuestAnsweredAny(questType, state)
      ? "in-progress"
      : "unanswered";
  return `<div class="quest-practice-item archive-challenge-item" data-quest-status="${status}"><p class="kicker">${esc(kicker)}</p>${renderQuest(questType, quest, state)}${feedback}</div>`;
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
  const caseCards = unit.cases
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
  const cards = [...caseCards, ...bonusCards].join("");
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
  const complete = quest ? isChallengeQuestComplete(questType, result) : false;
  const answeredAny = challengeQuestAnsweredAny(questType, state);
  const status = !answeredAny ? "unanswered" : complete ? "correct" : "in-progress";
  const feedback = complete
    ? `<p class="activity-feedback success" role="status" aria-live="polite">Investigation complete — this record is ready to open.</p>`
    : `<p class="activity-feedback${challengeQuestPartialSuccess(questType, result) ? " success" : ""}" role="status" aria-live="polite">${challengeQuestHint(questType, result)}</p>`;
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
  return `<button class="route-marker route-marker--${state} ${progress.selectedCaseId === c.id ? "is-selected" : ""}" style="left:${left};top:${top}" data-action="select-case" data-case="${c.id}" ${state === "locked" ? "disabled" : ""} aria-label="${esc(c.title)}"><span>${state === "complete" ? "✓" : "✦"}</span><b>${esc(c.shortTitle)}</b></button>`;
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
  const view = MAP_VIEWS[UNIT_MAP_VIEW[selectedUnit.id]] || MAP_VIEWS[DEFAULT_MAP_VIEW];
  const viewport = NAV_TABLE_VIEWPORT;
  const labelsMarkup = view.labels
    .map((l) => {
      const { x, y } = projectPoint([l.lon, l.lat], view.bounds, viewport);
      return `<div class="atlas-label" style="left:${(x / viewport.width) * 100}%;top:${(y / viewport.height) * 100}%">${esc(l.text)}</div>`;
    })
    .join("");
  const visibleCases = selectedUnit.cases.filter((c) => c.navigationTableVisible !== false);
  const markerPositions = declutterMarkerPositions(visibleCases, view.bounds, viewport);
  const threadXY =
    markerPositions.get(selected.id) ||
    projectPoint([selected.mapPosition.lon, selected.mapPosition.lat], view.bounds, viewport);
  const { left: threadLeft, top: threadTop } = xyToPercent(threadXY, viewport);
  return `${chrome()}<main class="shell archive-layout"><section class="archive-copy"><button class="back-link" data-action="home">← Institute foyer</button><p class="kicker">The Archive</p><h1>Chronicle Navigation Table</h1><p>Teacher-unlocked cases appear as markers on the map. Select a marker to inspect its route; the full details stay in the route panel so the map itself remains readable.</p><p class="archive-central-question"><b>Guiding question:</b> ${esc(resolvedUnitCentralQuestion(selectedUnit))}</p>${unitTabs(selectedUnit)}<div class="archive-legend"><span class="legend-active">✦ Available</span><span class="legend-complete">✓ Archived</span><span class="legend-locked">○ Teacher locked</span></div></section><section class="atlas-table" aria-label="${esc(resolvedUnitTitle(selectedUnit))} navigation map">${atlasSvgMarkup(view, viewport, "Coastline map of the case's historical setting")}${labelsMarkup}${visibleCases.map((c) => caseMarker(c, markerPositions.get(c.id), viewport)).join("")}<div class="route-thread route-thread--active" style="left:${threadLeft};top:${threadTop}"></div></section><aside class="route-panel"><p class="kicker">${esc(availability)}</p><span class="case-date">${esc(selected.date)}</span><h2>${esc(selected.title)}</h2><p>${esc(selected.summary)}</p><div class="route-meta"><span>${esc(selected.location)}</span><span>${esc(selected.mechanic)}</span><span>${isComplete(selected.id) ? "Archived" : "In progress"}</span></div><button class="btn btn-gold" data-action="travel" data-case="${selected.id}" ${!isUnlocked(selected.id) ? "disabled" : ""}>Initiate Chronotravel <span>→</span></button><p class="route-hint">${esc(routeHint)}</p><button class="btn btn-outline" data-action="mini-games">Try a Mini-Game →</button>${unitReadyForReview(selectedUnit) ? `<button class="btn btn-outline" data-action="review">Begin ${esc(selectedUnit.period)} Archive Review →</button>` : ""}</aside></main>${authorPanel()}`;
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
export function isCaribbeanLand(x, y) {
  const mainBeach = ellipse(x, y, 20, 12.5, 17.5, 9.4);
  const westCove = ellipse(x, y, 8.2, 12.8, 6.2, 5.9);
  const eastPoint = ellipse(x, y, 31.7, 13.1, 7.4, 6.8);
  const northVillage = ellipse(x, y, 23.2, 8.6, 7.1, 5.8);
  return mainBeach || westCove || eastPoint || northVillage;
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
  return isChallengeQuestComplete(
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
  // Cartographer table and the Spanish ship stay CSS-drawn overlays on top of the tile
  // canvas: the table is interactive UI dressing and the ship is a narrative abstraction
  // (an arriving, intact caravel) that the survival-themed tileset has no equivalent for
  // (its only ship art is a wrecked hull, wrong story beat for first contact).
  return `<canvas class="field-world-art" id="caribbeanTiledCanvas" role="img" aria-label="Top-down tropical island shoreline with a Taíno village, garden, and a Spanish landing camp (Island survival tileset)"></canvas><div class="cartographer-table"><span></span><b>Cartographer</b></div><div class="spanish-ship"><span class="mast"></span><span class="sail sail-one"></span><span class="sail sail-two"></span><b>✚</b></div><div class="ship-shadow"></div>`;
}
function riverbendWorldMarkup() {
  return `<canvas class="field-world-art" id="riverbendTiledCanvas" role="img" aria-label="Top-down colonial river settlement with a meetinghouse, dwellings, tobacco field, and a bridge across the river (Tiled tileset proof of concept)"></canvas>`;
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
  return `${chrome()}<main class="shell case-field case-field--living"><section class="field-intro"><button class="back-link" data-action="home">← Recall to Institute</button><p class="kicker">${esc(kicker)}</p><h1>${esc(activeCase.title)}</h1><p class="field-question">${esc(activeCase.question)}</p><p>${esc(copy.intro)}</p><p class="field-notice" id="fieldNotice">${esc(fieldNotice)}</p></section><section class="field-viewport field-scene--interactive" id="caseFieldMap"><div class="caribbean-world field-world--${map.id}" id="caribbeanWorld" style="${fieldWorldStyle()}">${map.worldMarkup()}${recallBeacon()}${map.npcs.map(fieldNpcButton).join("")}${sources.map(fieldSourceSignal).join("")}${fieldDialogueBubble()}<div class="case-field-player" id="caseFieldPlayer" data-facing="${fieldMovement.facing}" style="${fieldPositionStyle()}"><span></span><img id="caseFieldPlayerSprite" src="${fieldSpriteUrl()}" alt="${esc(progress.profile.name || "Chronicler")}"></div></div></section><aside class="field-channel"><p class="kicker">Codex field link</p><h2>Evidence Channel</h2><p class="role">Archive connection · portable</p><p>Institute staff remain in the Archive. In the field, your Codex preserves source readings, observation notes, and the final transmission back to the Navigation Table.</p><button class="btn btn-outline" data-action="codex" data-origin="field">Open Codex <b>${countEvidence(caseId)}</b></button>${PRACTICE_CHECK_QUESTS[caseId] && progress.settings.miniGamesEnabled ? `<button class="btn btn-outline btn-outline--practice" data-action="practice-check">Practice Check →</button>` : ""}${caseId === "case-001" ? `<button class="text-button field-reset-button" data-action="reset-case-001">Reset Case 1.01 demo</button>` : ""}${allSecured ? `<button class="btn btn-gold" data-action="reconstruction">Open Reconstruction Table →</button>` : `<p class="channel-progress">${esc(copy.progressHint)}</p>`}</aside></main>`;
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

  const mcqQuests = questSet.mcq.map(resolveMcqQuestSlot);
  const answeredCount = mcqQuests.filter(
    (quest) => progress.questResponses[quest.id]?.selected !== undefined
  ).length;
  const mcqCards = mcqQuests
    .map((quest) => {
      const state = progress.questResponses[quest.id] || {};
      const result = gradeQuest("mcq", quest, state);
      overallTotal += 1;
      if (result.answered) overallComplete += 1;
      const status = !result.answered ? "unanswered" : result.correct ? "correct" : "incorrect";
      const feedback = result.answered
        ? `<p class="activity-feedback ${result.correct ? "success" : "error"}" role="status" aria-live="polite">${
            result.correct ? "Correct." : "Not quite."
          } ${esc(quest.explanation || "")}</p>`
        : "";
      return `<div class="quest-practice-item" data-quest-status="${status}">${renderQuest("mcq", quest, state)}${feedback}</div>`;
    })
    .join("");

  const sequencingCards = questSet.sequencing
    .map((quest) => {
      const state = progress.questResponses[quest.id] || {};
      const result = gradeQuest("sequencing", quest, state);
      overallTotal += 1;
      if (result.answered) overallComplete += 1;
      const status = !result.answered ? "unanswered" : result.correct ? "correct" : "incorrect";
      const feedback = result.answered
        ? `<p class="activity-feedback ${result.correct ? "success" : "error"}" role="status" aria-live="polite">${
            result.correct ? "Correct order." : "Not quite the strongest order yet."
          } ${esc(quest.explanation || "")}</p>`
        : `<p class="activity-feedback" role="status" aria-live="polite">Drag the entries into order (or use the ↑/↓ buttons), then check your sequence.</p>`;
      return `<div class="quest-practice-item" data-quest-status="${status}">${renderQuest("sequencing", quest, state)}${feedback}</div>`;
    })
    .join("");

  const evidenceCards = questSet.evidenceOrganizing
    .map((quest) => {
      const state = progress.questResponses[quest.id] || {};
      const result = gradeQuest("evidence-organizing", quest, state);
      overallTotal += 1;
      if (result.complete) overallComplete += 1;
      const anyPlaced = Object.keys(state.placements || {}).length > 0;
      const status = result.complete ? "correct" : anyPlaced ? "in-progress" : "unanswered";
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
    .map((quest) => {
      const state = progress.questResponses[quest.id] || {};
      const result = gradeQuest("hipp", quest, state);
      overallTotal += 1;
      if (result.complete) overallComplete += 1;
      const answeredAny = Object.keys(state.selected || {}).length > 0;
      const status = !answeredAny
        ? "unanswered"
        : result.complete
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

  return `${chrome()}<main class="shell activity-shell quest-practice-shell"><section class="activity-copy"><button class="back-link" data-action="field">← Back to ${esc(activeCase.shortTitle)} field</button><p class="kicker">${esc(activeCase.title)} interaction · test features</p><h1>Sourcing Practice Check</h1><p>Practice questions grounded in ${esc(activeCase.title)}'s own record, covering all four quest types now available in Chronicle. This is practice only — it does not affect your Preservation Case progress, and you can retry as many times as you like.</p><p class="quest-practice-summary">${overallComplete}/${overallTotal} practice items complete</p></section><section class="activity-board quest-practice-board"><h2 class="quest-section-heading">Multiple choice</h2>${mcqCards}<p class="activity-feedback">${answeredCount}/${mcqQuests.length} answered</p><h2 class="quest-section-heading">Sequencing</h2>${sequencingCards}<h2 class="quest-section-heading">Evidence organizing</h2>${evidenceCards}<h2 class="quest-section-heading">HIPP source analysis</h2>${hippCards}</section></main>`;
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

function triangleCargoChip(cargo) {
  return `<article class="system-card cargo-card" draggable="true" data-cargo-card="${cargo.id}"><span>${esc(cargo.sourceMeta)}</span><h3>${cargo.icon} ${esc(cargo.label)}</h3><p>${esc(cargo.sourceTitle)}</p></article>`;
}

function triangleScreen() {
  const state = ensureActivityState("case-005", { placements: {}, answers: {}, charted: false });
  const activeCase = caseById("case-005");
  const placements = state.placements || {};
  const placedIds = new Set(Object.keys(placements));
  const tray = TRIANGLE_CARGO.filter((cargo) => !placedIds.has(cargo.id));
  const legs = TRIANGLE_LEGS.map((leg) => {
    const cargoHere = TRIANGLE_CARGO.filter((cargo) => placements[cargo.id] === leg.id);
    return `<div class="leg-drop ${cargoHere.length ? "is-filled" : ""}" data-leg-drop="${leg.id}"><header><b>${esc(leg.label)}</b><span>${esc(leg.fromLabel)} → ${esc(leg.toLabel)}</span><p>${esc(leg.description)}</p></header>${cargoHere.map(triangleCargoChip).join("") || "<i>Drop cargo records here</i>"}</div>`;
  }).join("");
  const mcqPhase = state.charted
    ? `<section class="triangle-mcq"><h2>Record checkpoints</h2><p>The circuit is charted. Each record now opens its consequence — answer the evidence question attached to each.</p>${TRIANGLE_CARGO.map(
        (cargo) =>
          `<article class="ledger-card ledger-card--source"><header><div class="ledger-icon">${cargo.icon}</div><div><p class="kicker">${esc(cargo.label)}</p><h2>${esc(cargo.sourceTitle)}</h2><span>${esc(cargo.sourceMeta)}</span></div></header><blockquote>${esc(cargo.consequence)}</blockquote><fieldset><legend>${esc(cargo.question)}</legend>${cargo.choices.map((choice, ci) => `<label class="ledger-choice"><input type="radio" name="triangle-${cargo.id}" data-triangle-question="${cargo.id}" value="${ci}" ${String((state.answers || {})[cargo.id]) === String(ci) ? "checked" : ""}><span>${String.fromCharCode(65 + ci)}</span>${esc(choice)}</label>`).join("")}</fieldset><small>${esc(cargo.citation)}</small></article>`
      ).join(
        ""
      )}<button class="btn btn-gold" data-action="check-triangle-mcq">Validate the circuit record →</button><p class="feedback" id="triangleMcqFeedback"></p></section>`
    : "";
  return `${chrome()}<main class="shell triangle-shell"><section class="triangle-copy"><button class="back-link" data-action="archive">← Archive map</button><p class="kicker">${esc(activeCase.shortTitle)} · The Atlantic circuit</p><h1>${esc(activeCase.title)}</h1><p>${esc(activeCase.question)}</p><p>Read each cargo record, then drag it onto the leg of the triangular trade that carried it. The Middle Passage records are testimony — the Archive preserves them as human accounts, not cargo lists.</p><div class="evidence-bank"><div class="bank-heading"><h2>Cargo records</h2><button class="text-button" data-action="clear-triangle">Reset chart</button></div><div class="bank-cards">${tray.map(triangleCargoChip).join("") || '<p class="bank-empty">All records are on the chart.</p>'}</div></div></section><section class="triangle-board"><div class="triangle-legs">${legs}</div>${state.charted ? "" : `<button class="btn btn-gold" data-action="check-triangle">Chart the circuit →</button><p class="feedback" id="triangleFeedback"></p>`}${mcqPhase}</section></main>`;
}

function exchangeLedgerScreen() {
  const answers = progress.exchangeLedger.answers || {};
  const allAnswered = EXCHANGE_RECORDS.every((record) => answers[record.id] !== undefined);
  return `${chrome()}<main class="shell ledger-shell ledger-shell--source-driven"><section class="ledger-copy"><button class="back-link" data-action="archive">← Archive map</button><p class="kicker">Case 1.02 · Atlantic routes</p><h1>The Exchange Ledger</h1><p>${esc(caseById("case-002").question)}</p><p>Every entry begins with a record. Read the short source card, then answer one evidence-based question. Each question tests a different historical claim—there is no shared answer bank to eliminate.</p><div class="atlantic-mini">${atlasSvgMarkup(MAP_VIEWS["atlantic-wide"], NAV_TABLE_VIEWPORT, "Atlantic map used for Exchange Ledger")}<div class="ledger-route"></div></div></section><section class="ledger-list ledger-list--sources">${EXCHANGE_RECORDS.map((record, index) => `<article class="ledger-card ledger-card--source"><header><div class="ledger-icon">${record.icon}</div><div><p class="kicker">${esc(record.label)} · Record ${index + 1}</p><h2>${esc(record.sourceTitle)}</h2><span>${esc(record.sourceMeta)}</span></div></header><blockquote>${esc(record.excerpt)}</blockquote><p class="source-note">${esc(record.sourceNote)}</p><fieldset><legend>${esc(record.question)}</legend>${record.choices.map((choice, ci) => `<label class="ledger-choice"><input type="radio" name="ledger-${record.id}" data-ledger-question="${record.id}" value="${ci}" ${String(answers[record.id]) === String(ci) ? "checked" : ""}><span>${String.fromCharCode(65 + ci)}</span>${esc(choice)}</label>`).join("")}</fieldset><small>${esc(record.citation)}</small></article>`).join("")}<button class="btn btn-gold" data-action="check-ledger" ${allAnswered ? "" : ""}>Validate Evidence Ledger →</button><p class="feedback" id="ledgerFeedback"></p></section></main>`;
}

function ledgerSuccessScreen() {
  return `${chrome()}<main class="ledger-success-shell"><section class="ledger-success-core" aria-live="polite"><p class="kicker">Evidence ledger verified</p><div class="ledger-success-orbit" aria-hidden="true"><i></i><i></i><i></i><span>✓</span></div><h1>Correct record match.</h1><p>Your source interpretations held together. The Archive has confirmed the ledger and is opening a secure transmission channel.</p><div class="ledger-success-steps"><span>Sources read</span><span>Claims checked</span><span>Route verified</span></div></section></main>`;
}

function foundingScreen() {
  const activeCase = caseById("case-008");
  const answers = progress.foundingLedger.answers || {};
  return `${chrome()}<main class="shell ledger-shell ledger-shell--source-driven"><section class="ledger-copy"><button class="back-link" data-action="archive">← Archive map</button><p class="kicker">${esc(activeCase.shortTitle)} · ${esc(activeCase.date)}</p><h1>${esc(activeCase.title)}</h1><p>${esc(activeCase.question)}</p><p>Every entry begins with a record. Read the short source card, then answer one evidence-based question. Each question tests a different historical claim—there is no shared answer bank to eliminate.</p></section><section class="ledger-list ledger-list--sources">${FOUNDING_RECORDS.map(
    (record, index) =>
      `<article class="ledger-card ledger-card--source"><header><div class="ledger-icon">${record.icon}</div><div><p class="kicker">${esc(record.label)} · Record ${index + 1}</p><h2>${esc(record.sourceTitle)}</h2><span>${esc(record.sourceMeta)}</span></div></header><blockquote>${esc(record.excerpt)}</blockquote><p class="source-note">${esc(record.sourceNote)}</p><fieldset><legend>${esc(record.question)}</legend>${record.choices.map((choice, ci) => `<label class="ledger-choice"><input type="radio" name="founding-${record.id}" data-founding-question="${record.id}" value="${ci}" ${String(answers[record.id]) === String(ci) ? "checked" : ""}><span>${String.fromCharCode(65 + ci)}</span>${esc(choice)}</label>`).join("")}</fieldset><small>${esc(record.citation)}</small></article>`
  ).join(
    ""
  )}<button class="btn btn-gold" data-action="check-founding">Validate Founding Ledger →</button><p class="feedback" id="foundingFeedback"></p></section></main>`;
}

function empireScreen() {
  const order = progress.empireOrder || [];
  const byId = Object.fromEntries(EMPIRE_EVIDENCE.map((card) => [card.id, card]));
  const remaining = EMPIRE_EVIDENCE.filter((card) => !order.includes(card.id));
  const slots = Array.from({ length: EMPIRE_EVIDENCE.length }, (_, index) => {
    const card = byId[order[index]];
    return `<div class="system-slot ${card ? "is-filled" : ""}" data-drop-index="${index}">${card ? `<article class="system-card" draggable="true" data-empire-card="${card.id}"><span>${esc(card.source)}</span><h3>${esc(card.label)}</h3><p>${esc(card.detail)}</p></article>` : `<span>Drop a record here</span>`}</div>${index < EMPIRE_EVIDENCE.length - 1 ? '<i class="system-arrow">→</i>' : ""}`;
  }).join("");
  return `${chrome()}<main class="shell empire-shell empire-shell--drag"><section class="empire-copy"><button class="back-link" data-action="archive">← Archive map</button><p class="kicker">Case 1.03 · Spanish Caribbean</p><h1>Empire’s Foundations</h1><p>${esc(caseById("case-003").question)}</p><p>Move the evidence records into a defensible order. Each connection should show how conquest, labor, forced migration, hierarchy, resistance, and cultural interaction shaped colonial society.</p><div class="empire-prompt"><b>Chronicler reflection</b><textarea id="empireReflection" placeholder="Explain one connection using evidence from two records…">${esc(progress.responses["empire-reflection"] || "")}</textarea></div></section><section class="empire-board empire-board--drag"><div class="evidence-bank"><div class="bank-heading"><h2>Evidence records</h2><button class="text-button" data-action="clear-empire">Reset layout</button></div><div class="bank-cards">${remaining.map((card) => `<article class="system-card" draggable="true" data-empire-card="${card.id}"><span>${esc(card.source)}</span><h3>${esc(card.label)}</h3><p>${esc(card.detail)}</p></article>`).join("") || '<p class="bank-empty">All records are on the system table. Drag any card to a new position to revise it.</p>'}</div></div><section class="system-table"><div class="system-table__head"><h2>Build the colonial system</h2><p>Drag records into the sequence. The arrows represent a claim you can defend, not a claim that history was simple.</p></div><div class="system-track">${slots}</div><button class="btn btn-gold" data-action="check-empire">Submit system to Archive →</button><p class="feedback" id="empireFeedback"></p></section></section></main>`;
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
      case "reconstruction":
        html = reconstructionScreen();
        break;
      case "ledger":
        html = exchangeLedgerScreen();
        break;
      case "ledger-success":
        html = ledgerSuccessScreen();
        activeTravelTimeout = setTimeout(() => {
          progress.currentScreen = "upload";
          save();
          render();
        }, 2300);
        break;
      case "founding":
        html = foundingScreen();
        break;
      case "empire":
        html = empireScreen();
        break;
      case "triangle":
        html = triangleScreen();
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
      case "manage-content":
        html = manageContentScreen();
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
    Promise.all([loadSelectionsForResolution(classroomId, "published"), getClassroomUnitFloor(classroomId)])
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
    archiveChallengeQuestFor("sequencing", questId)?.items ||
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
    showMainMenu = true;
    landingMode = "root";
    render();
    return true;
  }
  if (action === "home") {
    progress.activeFieldNpc = null;
    safeInstituteSpawn(7, 9, "up");
    progress.currentScreen = "institute";
    save();
    render();
    return true;
  }
  if (action === "archive-room") {
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
  if (action === "clear-empire") {
    progress.empireOrder = [];
    save();
    render();
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
  if (action === "check-ledger") {
    progress.exchangeLedger.answers ??= {};
    document.querySelectorAll("[data-ledger-question]:checked").forEach((s) => {
      progress.exchangeLedger.answers[s.dataset.ledgerQuestion] = Number(s.value);
    });
    const unanswered = EXCHANGE_RECORDS.filter(
      (r) => progress.exchangeLedger.answers[r.id] === undefined
    );
    if (unanswered.length) {
      save();
      showFeedback(
        "ledgerFeedback",
        "Read and answer every source record before validating the Ledger.",
        "error"
      );
      return true;
    }
    const correct = EXCHANGE_RECORDS.every(
      (r) => progress.exchangeLedger.answers[r.id] === r.answer
    );
    save();
    if (correct) {
      playSfx("secure");
      unlockNext("case-002");
      progress.pendingUploadCaseId = "case-002";
      progress.currentScreen = "ledger-success";
      save();
      render();
    } else
      showFeedback(
        "ledgerFeedback",
        "At least one interpretation needs revision. Re-read the source language and test what claim the evidence supports—not just where an item moved.",
        "error"
      );
    return true;
  }
  if (action === "check-founding") {
    progress.foundingLedger.answers ??= {};
    document.querySelectorAll("[data-founding-question]:checked").forEach((s) => {
      progress.foundingLedger.answers[s.dataset.foundingQuestion] = Number(s.value);
    });
    const unanswered = FOUNDING_RECORDS.filter(
      (r) => progress.foundingLedger.answers[r.id] === undefined
    );
    if (unanswered.length) {
      save();
      showFeedback(
        "foundingFeedback",
        "Read and answer every source record before validating the Ledger.",
        "error"
      );
      return true;
    }
    const correct = FOUNDING_RECORDS.every(
      (r) => progress.foundingLedger.answers[r.id] === r.answer
    );
    save();
    if (correct) {
      playSfx("secure");
      unlockNext("case-008");
      progress.pendingUploadCaseId = "case-008";
      progress.currentScreen = "ledger-success";
      save();
      render();
    } else
      showFeedback(
        "foundingFeedback",
        "At least one interpretation needs revision. Re-read the source language and test what claim the evidence supports—not just where an item moved.",
        "error"
      );
    return true;
  }
  if (action === "clear-triangle") {
    progress.activityState["case-005"] = { placements: {}, answers: {}, charted: false };
    save();
    render();
    return true;
  }
  if (action === "check-triangle") {
    const state = ensureActivityState("case-005", { placements: {}, answers: {}, charted: false });
    const allPlaced = TRIANGLE_CARGO.every((cargo) => state.placements[cargo.id]);
    if (!allPlaced) {
      showFeedback(
        "triangleFeedback",
        "Every cargo record needs a leg before the circuit can be charted.",
        "error"
      );
      return true;
    }
    const correct = TRIANGLE_CARGO.every((cargo) => state.placements[cargo.id] === cargo.leg);
    if (correct) {
      playSfx("secure");
      state.charted = true;
      save();
      render();
    } else
      showFeedback(
        "triangleFeedback",
        "At least one record sits on the wrong leg. Re-read what each record actually carried and where that leg began.",
        "error"
      );
    return true;
  }
  if (action === "check-triangle-mcq") {
    const state = ensureActivityState("case-005", { placements: {}, answers: {}, charted: false });
    document.querySelectorAll("[data-triangle-question]:checked").forEach((input) => {
      state.answers[input.dataset.triangleQuestion] = Number(input.value);
    });
    const unanswered = TRIANGLE_CARGO.filter((cargo) => state.answers[cargo.id] === undefined);
    if (unanswered.length) {
      save();
      showFeedback(
        "triangleMcqFeedback",
        "Answer the evidence question attached to every record before validating.",
        "error"
      );
      return true;
    }
    const correct = TRIANGLE_CARGO.every((cargo) => state.answers[cargo.id] === cargo.answer);
    save();
    if (correct) {
      playSfx("upload");
      unlockNext("case-005");
      progress.pendingUploadCaseId = "case-005";
      progress.currentScreen = "upload";
      save();
      render();
    } else
      showFeedback(
        "triangleMcqFeedback",
        "At least one interpretation needs revision. Re-read the record before answering again.",
        "error"
      );
    return true;
  }
  if (action === "check-empire") {
    const reflection = document.getElementById("empireReflection")?.value.trim() || "";
    progress.responses["empire-reflection"] = reflection;
    const expected = ["claim", "encomienda", "slavery", "hierarchy", "resistance", "exchange"];
    const correct = JSON.stringify(progress.empireOrder || []) === JSON.stringify(expected);
    save();
    if (correct && reflection.length >= 20) {
      playSfx("upload");
      unlockNext("case-003");
      progress.pendingUploadCaseId = "case-003";
      progress.currentScreen = "upload";
      save();
      render();
    } else
      showFeedback(
        "empireFeedback",
        "Arrange all six evidence records into a defensible sequence, then write a reflection using evidence from at least two cards.",
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
              "This Supabase project requires email confirmation. In the Supabase dashboard, go to Authentication → Users, find chronicle-dev-teacher@gmail.com, and confirm it manually (or disable \"Confirm email\" under Authentication → Providers → Email for local dev). Then click this button again.";
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
          authUiState.info = "Account created — check your email to confirm it, then sign in and add your classrooms.";
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
      .catch((err) => {
        teacherUiState.error = err.message || "Could not load this classroom.";
      })
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
      .catch((err) => {
        teacherUiState.error = err.message || "Could not create classroom.";
        render();
      });
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
      .catch((err) => {
        teacherUiState.error = err.message || "Could not add roster slots.";
        render();
      });
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
      .catch((err) => {
        teacherUiState.error = err.message || "Could not reset this student's password.";
        render();
      });
    return true;
  }
  if (action === "disable-student") {
    const rosterSlotId = target.dataset.rosterSlotId;
    teacherUiState.error = "";
    disableStudentSlot(rosterSlotId)
      .then(() => loadSelectedClassroomDetails())
      .then(() => render())
      .catch((err) => {
        teacherUiState.error = err.message || "Could not remove this student.";
        render();
      });
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
      .catch((err) => {
        teacherUiState.error = err.message || "Could not advance the unit.";
        render();
      });
    return true;
  }
  if (action === "open-manage-content") {
    progress.currentScreen = "manage-content";
    save();
    render();
    return true;
  }
  if (action === "teacher-sign-out") {
    signOut().then(() => {
      currentProfile = null;
      teacherUiState = {
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
      };
      contentUiState = { selectedCaseId: null, slots: [], previewing: false, error: "", pending: false };
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
    progress.currentScreen = "teacher-dashboard";
    save();
    render();
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
      .catch((err) => {
        gradingUiState.error = err.message || "Could not save this grade.";
        render();
      });
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

function handleAppChange(event) {
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
      setTeacherOverride(mapping.contentId, mapping.fieldName, field.value);
      render();
    }
  } else if (field.matches("[data-content-alternate-slot-kind]")) {
    const slotKind = field.dataset.contentAlternateSlotKind;
    const slotId = field.dataset.contentAlternateSlotId;
    contentUiState.error = "";
    setDraftSelection(
      teacherUiState.selectedClassroomId,
      contentUiState.selectedCaseId,
      slotKind,
      slotId,
      field.value || null
    )
      .then(() => loadManageContentCaseData(contentUiState.selectedCaseId))
      .catch((err) => {
        contentUiState.error = err.message || "Could not save this selection.";
        render();
      });
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
  } else if (field.matches("[data-evidence-reflection]")) {
    const questId = field.dataset.evidenceReflection;
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
  }
}

function handleAppDragstart(event) {
  const mapPiece = event.target.closest("[data-map-piece]");
  if (mapPiece) {
    event.dataTransfer.setData("text/map-piece", mapPiece.dataset.mapPiece);
    event.dataTransfer.effectAllowed = "move";
    return;
  }
  const cargo = event.target.closest("[data-cargo-card]");
  if (cargo) {
    event.dataTransfer.setData("text/cargo-card", cargo.dataset.cargoCard);
    event.dataTransfer.effectAllowed = "move";
    return;
  }
  // Cargo Sorting mini-game — distinct data attribute and dataTransfer type from the
  // data-cargo-card/"text/cargo-card" pair above (Case 1.05's unrelated triangle-trade
  // leg-drop feature), even though both happen to use the word "cargo".
  const cargoGood = event.target.closest("[data-cargo-good]");
  if (cargoGood) {
    event.dataTransfer.setData("text/mini-cargo-good", cargoGood.dataset.cargoGood);
    event.dataTransfer.effectAllowed = "move";
    return;
  }
  const card = event.target.closest("[data-empire-card]");
  if (card) {
    event.dataTransfer.setData("text/plain", card.dataset.empireCard);
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
  const zone = event.target.closest("[data-drop-index]");
  const legDrop = event.target.closest("[data-leg-drop]");
  const sequenceItem = event.target.closest("[data-sequence-item]");
  const evidenceSlot = event.target.closest("[data-evidence-slot]");
  const cargoHold = event.target.closest("[data-cargo-hold]");
  const dropTarget = mapSlot || zone || legDrop || sequenceItem || evidenceSlot || cargoHold;
  if (dropTarget) {
    event.preventDefault();
    dropTarget.classList.add("is-over");
  }
}

function handleAppDragleave(event) {
  event.target.closest("[data-drop-index]")?.classList.remove("is-over");
  event.target.closest("[data-map-slot]")?.classList.remove("is-over");
  event.target.closest("[data-leg-drop]")?.classList.remove("is-over");
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
    return;
  }
  const legDrop = event.target.closest("[data-leg-drop]");
  if (legDrop) {
    event.preventDefault();
    legDrop.classList.remove("is-over");
    const cargoId = event.dataTransfer.getData("text/cargo-card");
    if (!cargoId) return;
    const state = ensureActivityState("case-005", { placements: {}, answers: {}, charted: false });
    state.placements[cargoId] = legDrop.dataset.legDrop;
    save();
    render();
    return;
  }
  const zone = event.target.closest("[data-drop-index]");
  if (!zone) return;
  event.preventDefault();
  const cardId = event.dataTransfer.getData("text/plain");
  if (!cardId) return;
  const index = Number(zone.dataset.dropIndex);
  const next = (progress.empireOrder || []).filter((id) => id !== cardId);
  next.splice(index, 0, cardId);
  progress.empireOrder = next.slice(0, EMPIRE_EVIDENCE.length);
  save();
  render();
}

function handleWindowKeydown(event) {
  const key = event.key.toLowerCase();
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

  render();
}
