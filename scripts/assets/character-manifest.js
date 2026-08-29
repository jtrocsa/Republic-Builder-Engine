// The character cast, as source data for scripts/assets/build-character-sheets.js.
//
// This file is the single place that knows PixelLab ids. Nothing at runtime imports it — the game
// reads the built PNGs through main.js's CHARACTER_SHEETS registry, which is keyed by the same
// `key` strings below. Keeping the ids here (rather than in main.js) means a re-import is a script
// run, not an application edit.
//
// Every character was generated with the parameters in docs/art/CHARACTER-CAST-SPEC.md:
// mode "standard", view "low top-down", 8 rotations, black outline, detailed shading, heroic
// proportions. Director Hale is the style anchor and must not be regenerated.

export const PIXELLAB_TENANT = "14478564-e583-4927-9dc5-cdf7cda9616f";
export const PIXELLAB_CDN = "https://backblaze.pixellab.ai/file/pixellab-characters";

/**
 * The game's facing vocabulary, and how each facing maps onto PixelLab's compass rotations.
 * `main.js` has stored facing as down/up/left/right since long before this import; extending that
 * to four real directions (rather than adopting compass names) keeps one vocabulary in the code.
 */
export const DIRECTIONS = ["down", "up", "left", "right"];
export const COMPASS = { down: "south", up: "north", left: "west", right: "east" };

/**
 * Characters are built into one horizontal strip per direction, columns [stand, walk0 … walkN-1].
 * Column 0 is the direction's static rotation, so a character that stops walking shows a real
 * standing pose for the direction it last travelled.
 */
export const STAND_COLUMN = 1;

export const CHARACTERS = [
  // ---- Chronicle Institute -------------------------------------------------------------------
  {
    key: "director",
    stem: "institute/director-rowan-hale",
    name: "Director Hale",
    // The canonical body height for the whole cast is measured off this character. He is also the
    // only one PixelLab generated with the 6-frame `walk` template rather than 8-frame
    // `v3:walking`, which is why frame counts are per-character everywhere downstream.
    reference: true,
    id: "ddc5c73c-ba31-4f17-8622-5d1f376872dd",
    frames: 6,
    // A stationed character used to be one frozen frame, held for as long as the player stood in
    // the room. `breathing-idle` is the only template that suits a person standing still: the
    // action templates (pushing, pull-heavy-object) re-pose the body into a platformer lunge that
    // leaves the 48x56 canvas entirely and loses the costume with it. Adding an animation does not
    // regenerate the character, so the "do not regenerate the Director" rule is untouched.
    idleGroup: "director-idle",
    idleFrames: 4,
    walk: {
      south: "2266e6e8-c031-4254-8424-fa3839d02293",
      north: "6f94928a-6fe2-4fc2-b7ae-c06ee183104c",
      east: "506a72ef-cbab-4665-802c-e76196b77b26",
      west: "a9ffdda0-3e5b-4dd3-9493-06a3266f166d",
    },
  },
  {
    key: "amani",
    stem: "institute/researcher-amani-soto",
    name: "Female Professor",
    id: "1f8768e1-3913-47c0-bb5e-4de6a0e879f6",
    frames: 8,
    idleGroup: "amani-idle",
    idleFrames: 4,
    walk: {
      south: "04c9c990-e889-4184-9aef-284e973d3da6",
      north: "99603c90-1e4a-4fd2-a59c-322ece55a430",
      east: "933f93aa-ff91-4032-818e-ef8d6231012c",
      west: "0680ab97-0b02-4bef-88d6-32957223851d",
    },
  },
  {
    key: "julian",
    stem: "institute/professor-julian-park",
    name: "Male Professor",
    id: "1b8194bc-fa5f-4bbd-949c-e81068ed18e2",
    frames: 8,
    idleGroup: "julian-idle",
    idleFrames: 4,
    walk: {
      south: "c2f783c8-d434-49a8-a5cd-869710354f68",
      north: "ce92a3f8-cb48-41da-9ec4-fea4f3549660",
      east: "1bf7def1-b035-4c19-ad5d-04fba62c8924",
      west: "6ef031a7-b295-49c8-a308-51931d880664",
    },
  },

  // The Field Liaison, Emery Voss. Generated in Phase 80b against the fifth Meridian concept plate
  // — see docs/art/MERIDIAN-VISUAL-IDENTITY.md §6 for the costume and the prompt that produced it.
  //
  // No `walk` map, unlike the three staff above: this one came in through the bulk archive path
  // (`walkGroup`/`idleGroup` name the animation groups in metadata.json), which needs only the
  // character id. That is the newer of the two routes build-character-sheets.js supports and the
  // one the Unit 4/5 cast uses.
  //
  // Two abandoned creates are recorded here so neither is mistakenly adopted later. Both were the
  // same failure — the costume, not the pipeline. 28a13d53-f098-44bc-9e83-c9fdaa2f9156 dropped the
  // coat entirely (three garment layers is more than 45 pixels of body can hold), and
  // e9ecca13-f6e8-454f-92c3-14515e060f57 produced a full-length coat that read as Dr. Soto's
  // silhouette from across the Main Hall.
  //
  // `state` is the folder inside the character's download archive. It was not needed until Phase 88
  // gave Voss a second costume in the same archive — see the entry below — and it is named on both
  // of hers rather than only the new one, so neither depends on which order PixelLab lists them in.
  {
    key: "liaison",
    stem: "institute/field-liaison-emery-voss",
    name: "Emery Voss",
    id: "d7ba9b23-1096-4e05-b24b-5fd33c4dc82f",
    state: "Idle",
    frames: 8,
    walkGroup: "walking",
    idleGroup: "breathing-idle",
    idleFrames: 4,
  },

  // The same woman with her coat turned — MERIDIAN-VISUAL-IDENTITY.md §6's "two states, two sheet
  // keys", generated in Phase 88 when Unit 6's reveal finally needed it. `main.js`'s `sheetFor()`
  // resolves `liaison` to this key once `sawMeridianMark` is set, so nothing else in the game knows
  // she has two.
  //
  // **Made with `create_character_state`, not `create_character`, and that is the whole story of
  // getting it right.** A fresh create from §6's revealed prompt — same size, view, outline,
  // shading, detail and proportions as the shipped Voss — produced a different person: hair down,
  // no navy coat, no mark. §6 predicted exactly that ("two characters who happen to share a
  // haircut") and prescribed designing the revealed version first, which is not executable against
  // a text-to-sprite generator. A *state* is: it takes the existing character and applies one edit
  // across all eight rotations, so the face, the bun, the boots and the silhouette are the same
  // pixels. The abandoned create was
  // 353d883b-1fa8-4fc1-983c-bf49d13425c2 and is deleted; do not re-run that route.
  {
    key: "liaison-meridian",
    stem: "institute/field-liaison-emery-voss-meridian",
    name: "Emery Voss",
    id: "d3e4aaf2-1f6f-4a5f-8680-2d2f24b5367a",
    state: "Revealed",
    frames: 8,
    walkGroup: "walking",
    idleGroup: "breathing-idle",
    idleFrames: 4,
  },

  // ---- Player --------------------------------------------------------------------------------
  {
    key: "chronicler-a",
    stem: "chronicle-sprites/field/chronicler-a",
    name: "Chronicler A",
    portraitScale: 2,
    id: "1072c2ca-436e-4992-9f92-36d09cb315d3",
    frames: 8,
    walk: {
      south: "b26522ba-42c9-4ca8-9c3c-1e1a911569e2",
      north: "d8e03f8c-f0d7-4bd8-bd73-b1a41d263eff",
      east: "ac985ac5-3b92-446b-ac63-6b28874ad741",
      west: "78afda47-ef04-4b41-b50d-5933251f0224",
    },
  },
  {
    key: "chronicler-b",
    stem: "chronicle-sprites/field/chronicler-b",
    name: "Chronicler B",
    portraitScale: 2,
    id: "09d935bd-2bc6-4259-939b-cf2a0bc4096b",
    frames: 8,
    walk: {
      south: "eb4f5bc0-c330-4192-b406-dc5790d8f56f",
      north: "f7976e10-4c1e-40fd-98b7-c632bcdc8868",
      east: "fd164d81-3155-4ffe-b6e3-f4f995b2c921",
      west: "5a667580-f02a-41c0-a499-e289d7185e06",
    },
  },

  // ---- Unit 1 · Caribbean, 1492 ---------------------------------------------------------------
  {
    key: "columbus",
    stem: "chronicle-sprites/field/npc-columbus",
    name: "Christopher Columbus",
    id: "60cc1b49-0ca7-4ce5-b7db-89fb12e7aa91",
    frames: 8,
    walk: {
      south: "9f92dc1c-a4a7-44db-9863-845fb7986b9e",
      north: "281b0b86-6945-45be-9662-0ef7d6825b93",
      east: "3c5a6e54-a292-4ff2-8467-0d1812acae2c",
      west: "43255cda-1559-42e5-949f-bb81703f4dd3",
    },
  },
  {
    key: "spanish-sailor",
    stem: "chronicle-sprites/field/npc-spanish-sailor",
    name: "Spanish Sailor",
    id: "077d3c1f-c78a-4fbf-a271-0d911de1c7cf",
    frames: 8,
    walk: {
      south: "225646fc-60f2-4aba-adfa-1d485fc8bfc5",
      north: "b21bf418-2ffc-40d0-8013-28a65dde9f09",
      east: "777ce554-a70f-4b8a-bc7e-f0b1bf3ab455",
      west: "f41331aa-9bab-4301-a201-3e5ffbb658fd",
    },
  },
  {
    key: "caribbean-man",
    stem: "chronicle-sprites/field/npc-caribbean-man",
    name: "Caribbean Man",
    id: "66239da0-c9d8-4717-866b-9be4737f80b3",
    frames: 8,
    walk: {
      south: "c9eace38-26aa-490c-805f-ca09eafdfe50",
      north: "45efec1f-2ead-4399-a657-f06fa98b4ff0",
      east: "d30df7c7-943c-412b-92d2-2556ae0b44f7",
      west: "479103b0-c2d8-403e-9c5e-203a1360b295",
    },
  },
  {
    key: "caribbean-woman",
    stem: "chronicle-sprites/field/npc-caribbean-woman",
    name: "Caribbean Woman",
    id: "ca64c22f-2996-4c15-a07a-6c896dd77523",
    frames: 8,
    walk: {
      south: "d5071fbd-477b-49b0-963b-0fb8b1d38e5f",
      north: "86f4472b-505f-4c2b-8fd0-dec039fd91f0",
      east: "1a7fd342-f94f-472b-9715-7191827da849",
      west: "d934a31c-f279-44f0-8128-fcb128b69868",
    },
  },
  {
    key: "caribbean-child",
    stem: "chronicle-sprites/field/npc-caribbean-child",
    name: "Caribbean child",
    id: "f5e6c82e-ad35-4245-b26f-7ae1d32d7068",
    frames: 8,
    walk: {
      south: "6a275021-0962-4782-9b52-7668632bb09c",
      north: "0d87d376-15bc-4962-9b69-01ca1b25a54a",
      east: "a20f132c-3cf6-4b59-b4f7-e76a1636b52d",
      west: "db48465b-de72-41ac-b06d-291a1e4eb24f",
    },
  },
  {
    key: "spanish-scribe",
    stem: "chronicle-sprites/field/npc-spanish-scribe",
    name: "Spanish expedition scribe and notary",
    id: "f53ae8f0-f970-4ada-b8e5-ac257c6c6a2a",
    frames: 8,
    walk: {
      south: "a8ca3830-333a-47d0-af74-5ebaab613235",
      north: "5eb8d502-9579-4aa9-96ab-94e257146ebd",
      east: "565b73c6-eb28-4843-809c-921c26affe3a",
      west: "ae27e13a-55b4-4083-b1c9-fa4f65d43a8f",
    },
  },

  // ---- Unit 2 · Riverbend / Jamestown, 1607-1620 ----------------------------------------------
  {
    key: "jamestown-laborer",
    stem: "chronicle-sprites/field/npc-jamestown-laborer",
    name: "Jamestown Laborer",
    id: "6998ae52-6cb5-457b-aaf6-b440c0297bb2",
    frames: 8,
    walk: {
      south: "ebe7c5b2-0fbc-4eb0-b5c2-edbf23af12e1",
      north: "7e8b1249-8bf7-442b-9e9a-666044748d7c",
      east: "88360005-a648-4f33-b3f9-a472406991c4",
      west: "70e655f3-b422-4eec-b654-0e0508df3186",
    },
  },
  {
    key: "jamestown-gentleman",
    stem: "chronicle-sprites/field/npc-jamestown-gentleman",
    name: "Jamestown Gentleman",
    id: "a36210d1-08ef-430e-8dfa-6d7e7af6e845",
    frames: 8,
    walk: {
      south: "f8feccea-d4a3-4a58-aa57-3c00a14b721d",
      north: "75c7bfc8-9a8f-4454-8580-4bc9548b337f",
      east: "c7dad576-744a-40bb-a62e-25c98a38934f",
      west: "46b98a59-960e-4a69-afe0-8518aa842a4d",
    },
  },
  {
    key: "jamestown-carpenter",
    stem: "chronicle-sprites/field/npc-jamestown-carpenter",
    // PixelLab stores this one as "Jamestown Capenter" — the misspelling is theirs, kept here only
    // so the id above can be traced back to the entry in the account listing.
    name: "Jamestown Capenter",
    id: "f60475e6-ca2b-4370-bc8a-e7d157e06072",
    frames: 8,
    walk: {
      south: "870b9828-4956-4c6e-b7e9-4a7e3b01ee6a",
      north: "02b76d6c-a4c3-4ad5-afdd-334cd71aefab",
      east: "00d4cbc8-3660-4f98-b2cd-98990ce05ca8",
      west: "615e8fe4-0a53-4cd4-81a3-a180859224a2",
    },
  },
  {
    key: "jamestown-settler-woman",
    stem: "chronicle-sprites/field/npc-jamestown-settler-woman",
    name: "English settler woman at Jamestown",
    id: "5bbe8a62-f719-4bd0-9345-007c0a6f8e2f",
    frames: 8,
    walk: {
      south: "7a9c7573-e948-48d9-a351-f22258f2dac9",
      north: "c613cdf8-e0c3-4805-b2ac-c026164295ae",
      east: "0c664cc1-6d86-4f65-88f1-d5eb62884996",
      west: "ae0c0a49-0ae7-4e5a-9d1d-b1bb92583000",
    },
  },
  {
    key: "powhatan-man",
    stem: "chronicle-sprites/field/npc-powhatan-man",
    name: "Adult Powhatan man",
    id: "a9f4810b-5a01-46a3-b72d-ee17d4f1d539",
    frames: 8,
    walk: {
      south: "2bff077f-7eec-458a-931a-3ce177cf5ebb",
      north: "42aa7dd9-04b3-44e6-a86f-7f4973565e88",
      east: "0dbcdf5d-5331-4454-98e0-24c8875f7078",
      west: "539100cc-d064-4a18-8a63-538f8c9c6db3",
    },
  },
  {
    key: "powhatan-woman",
    stem: "chronicle-sprites/field/npc-powhatan-woman",
    name: "Adult Powhatan woman",
    id: "262d9b26-32bf-456b-ad26-0ff72bc1c54f",
    frames: 8,
    // The one incomplete asset in the account: PixelLab generated south, north and east walk
    // cycles but not west. Her static west *rotation* does exist, so the build uses that as the
    // standing column and mirrors the east walk frames for the moving columns — baked into the
    // file, so nothing mirrors at runtime. Regenerating the missing direction costs a generation
    // and the subscription quota is exhausted; see docs/art/CHARACTER-CAST-SPEC.md.
    mirrorWestFromEast: true,
    walk: {
      south: "eda811b8-aadb-4ad3-932d-110939c650c7",
      north: "c9061f4a-198f-4f3e-8f86-f9968d665517",
      east: "acac3f2b-200b-40ef-a96b-618abd689df4",
      west: null,
    },
  },
  {
    key: "jamestown-blacksmith",
    stem: "chronicle-sprites/field/npc-jamestown-blacksmith",
    name: "English blacksmith working at Jamestown",
    id: "171e79bf-af0c-4cda-bbd6-99890040ab35",
    frames: 8,
    walk: {
      south: "af288099-33c4-401e-a0f1-40ff280a335f",
      north: "82278b14-bcfb-4a26-a419-51baea1ef0f8",
      east: "3ddf8ad0-c890-44f6-985d-5c2393d94b21",
      west: "147a1459-857f-44ba-9b55-abcaf5895651",
    },
  },
  // The two below are separate PixelLab characters that happen to carry the same prompt text as
  // their account name. They are told apart by id, and by which of the settlement's three watch
  // posts they stand at; `soldier` is the one in fuller kit, `watchman` the plainer one.
  {
    key: "jamestown-soldier",
    stem: "chronicle-sprites/field/npc-jamestown-soldier",
    name: "English soldier or settlement watchman",
    id: "cd27a499-b04a-4461-afa0-6ef74ce1cd86",
    frames: 8,
    walk: {
      south: "1bea9d90-be7f-4e73-b10d-6507e90788b1",
      north: "b23f751a-6063-4298-9294-c235b7049011",
      east: "ea0005c9-c882-45d6-b4bc-7b48f0375126",
      west: "5948d1de-18ad-4dc0-9677-a44749a85405",
    },
  },
  {
    key: "jamestown-watchman",
    stem: "chronicle-sprites/field/npc-jamestown-watchman",
    name: "English soldier or settlement watchman",
    id: "028177a6-e08c-4d74-bc47-0001330b840b",
    frames: 8,
    walk: {
      south: "cef00162-2677-405f-b454-7eb53469da63",
      north: "d589a782-64fb-48ec-b7f7-98ed57c1855a",
      east: "7a33924b-d927-459a-af74-fd116a8615da",
      west: "8f835dc2-0a69-4083-afdb-b60cca50c651",
    },
  },
  {
    key: "jamestown-african-man",
    stem: "chronicle-sprites/field/npc-jamestown-african-man",
    name: "African man living at Jamestown",
    id: "73e6740f-1a5a-462d-aa4a-c7029bc32b57",
    frames: 8,
    walk: {
      south: "9c0ed909-6d05-44b5-b433-860af8b599c0",
      north: "3adbc734-d940-4747-aac8-ecd65a879b0c",
      east: "38b4deb9-ae7b-43e0-b804-f7aa01e8919f",
      west: "b2744d0b-e805-4506-898a-c40838aef933",
    },
  },
  {
    key: "jamestown-servant",
    stem: "chronicle-sprites/field/npc-jamestown-servant",
    name: "English indentured laborer Jamestown",
    id: "998d5242-4377-431c-9d66-0a8ac6e77faa",
    frames: 8,
    walk: {
      south: "70c9efd6-b2b7-47dc-9dc9-c8a11df9312f",
      north: "d898f1e6-d327-40c1-aa74-829373b650df",
      east: "550959ef-3189-4fa4-9b6c-a6a2885ad862",
      west: "541289f5-e612-4bf1-89b5-88d21577147e",
    },
  },

  // ---- Unit 4 · Canal Crossroads, upstate New York, 1845 --------------------------------------
  //
  // Everything from here down carries no `walk` ids, and that is not an omission. PixelLab stopped
  // surfacing a per-direction animation UUID, so this cast was downloaded through the bulk
  // character endpoint instead, which needs only the id above it — see fetchBulk(). All four
  // directions are real generated art; nothing below is mirrored.
  {
    key: "canal-boat-captain",
    stem: "chronicle-sprites/field/npc-canal-boat-captain",
    name: "Erie Canal Boat Captain",
    id: "b623b8f7-8a29-4562-9c20-ec6620dc7afa",
    frames: 8,
    walkGroup: "canal-boat-captain-walk8",
  },
  {
    key: "canal-lock-keeper-woman",
    stem: "chronicle-sprites/field/npc-canal-lock-keeper-woman",
    name: "Canal Lock Keeper Woman",
    id: "860097b6-2513-45b6-b0ee-d9c50ee2e60f",
    frames: 8,
    walkGroup: "canal-lock-keeper-woman-walk8",
    idleGroup: "canal-lock-keeper-woman-idle",
    idleFrames: 4,
  },
  {
    key: "textile-mill-worker",
    stem: "chronicle-sprites/field/npc-textile-mill-worker",
    name: "Young Textile Mill Worker",
    id: "493bc0bf-a466-4593-814f-9c9e09892003",
    frames: 8,
    walkGroup: "textile-mill-worker-walk8",
  },
  {
    key: "abolitionist-printer",
    stem: "chronicle-sprites/field/npc-abolitionist-printer",
    name: "Free Black Abolitionist Printer",
    id: "d04a1e5a-5e5c-4a4f-a50d-cc269ebd5f4b",
    frames: 8,
    walkGroup: "abolitionist-printer-walk8",
  },
  {
    key: "abolitionist-lecturer",
    stem: "chronicle-sprites/field/npc-abolitionist-lecturer",
    name: "Woman Abolitionist Lecturer",
    id: "8bc14095-8a36-422d-a032-0488172f8f4f",
    frames: 8,
    walkGroup: "abolitionist-lecturer-walk8",
  },
  {
    key: "market-farmer",
    stem: "chronicle-sprites/field/npc-market-farmer",
    name: "Market-Oriented Family Farmer",
    id: "b4bd2a0b-cfdd-49d1-8d4b-320fb60fb8e5",
    frames: 8,
    walkGroup: "market-farmer-walk8",
  },
  {
    key: "haudenosaunee-diplomat",
    stem: "chronicle-sprites/field/npc-haudenosaunee-diplomat",
    name: "Haudenosaunee Community Diplomat",
    // The Erie Canal was cut through Haudenosaunee homelands and Oneida and Onondaga land cessions
    // were under active pressure into the 1840s, so an upstate New York map without this character
    // has a hole in it. The first generation had to be thrown away: the long trade shirt rendered
    // in the south view only and the other three showed bare arms and shoulders, which is the
    // generic-tribal depiction the art brief prohibits. This one covers arms and shoulders in all
    // four rotations. `-walk`, not `-walk8`: animated before the naming convention settled.
    id: "313727be-ec52-4fd6-bce7-a9abb5d3ef14",
    frames: 8,
    walkGroup: "haudenosaunee-diplomat-walk",
  },
  {
    key: "canal-boardinghouse-keeper",
    stem: "chronicle-sprites/field/npc-canal-boardinghouse-keeper",
    name: "Irish Canal Boardinghouse Keeper",
    id: "24d8cf84-6749-4f3b-9a80-b7f822be66ff",
    frames: 8,
    walkGroup: "canal-boardinghouse-keeper-walk8",
  },
  {
    key: "canal-irish-laborer",
    stem: "chronicle-sprites/field/npc-canal-irish-laborer",
    name: "Irish Canal Laborer",
    // Regenerated without the shovel. The first attempt's shovel appeared in the south view only
    // and slid hip-to-shoulder mid-walk, shedding detached fragments beside the head. He is the
    // map's most-walked character, so a flickering prop would be on screen constantly. Held props
    // are the single least reliable thing PixelLab renders across rotations — the same run lost a
    // newspaper and a leather apron the same way — so the working rule is to describe the person
    // and let the map's own stamped props carry the trade.
    id: "b7f6be31-c467-4894-958b-36285800f044",
    frames: 8,
    walkGroup: "canal-irish-laborer-walk8",
  },
  {
    key: "jacksonian-editor",
    stem: "chronicle-sprites/field/npc-jacksonian-editor",
    name: "Jacksonian Newspaper Editor",
    id: "919495a9-7a61-444f-8249-fbc7ce753cb1",
    frames: 8,
    walkGroup: "jacksonian-editor-walk8",
  },
  {
    key: "german-cooper",
    stem: "chronicle-sprites/field/npc-german-cooper",
    name: "German Immigrant Cooper",
    id: "0f7a91fe-5c16-477f-847f-9473d696c21e",
    frames: 8,
    walkGroup: "german-cooper-walk8",
  },
  {
    key: "revival-preacher",
    stem: "chronicle-sprites/field/npc-revival-preacher",
    name: "Second Great Awakening Preacher",
    // Regenerated for height, not costume. The first attempt's rotations disagreed with each other —
    // a 40px body facing south against 42-43 facing the other three — and the build normalizes a
    // character by one scale factor taken from its tallest pose, so no single number could bring the
    // short one up without overshooting the rest. Asking for "standing tall at full height with long
    // legs and a long torso" produced 42/45/45/44, which the shared canvas can hold.
    id: "ddf2953a-2f9b-4ff7-a2a0-4c74532d965d",
    frames: 8,
    walkGroup: "revival-preacher-walk8",
  },
  {
    key: "canal-mule-driver",
    stem: "chronicle-sprites/field/npc-canal-mule-driver",
    name: "Canal Towpath Mule Driver",
    // A hoggee, roughly fifteen. Generated as a youth rather than a child on purpose: the build
    // normalizes every body to the same 45px height, so a child would come out adult-sized anyway,
    // and a teenager is both historically right for the job and honest about what the art can show.
    id: "6c0c5163-abea-4a5b-a677-65ce68533ae6",
    frames: 8,
    walkGroup: "canal-mule-driver-walk8",
  },

  // ---- Unit 4 interiors · the printing office and the boardinghouse (Phase 66) -----------------
  //
  // Four characters who exist because two rooms opened. None of them carries a prop: the Phase 2 run
  // report found that a shovel, a newspaper and an apron all failed to survive rotation, so every
  // description below is clothing and build only.
  //
  // No `idleGroup` on any of them, deliberately. Breathing idles are a partial rollout — five of the
  // twenty-nine characters have one — and the two people already stationed in these rooms, Josiah
  // Pike and Bridget Cavanagh, do not. One breathing person in a room of three still is worse than
  // three still people, so these match their neighbours rather than the ceiling.
  {
    key: "canal-journeyman-printer",
    stem: "chronicle-sprites/field/npc-canal-journeyman-printer",
    name: "Canal Journeyman Printer",
    id: "36e81c42-4650-4205-bc3e-1416fa5afc2b",
    frames: 8,
    walkGroup: "printer-walk",
  },
  {
    key: "canal-printers-devil",
    stem: "chronicle-sprites/field/npc-canal-printers-devil",
    name: "Canal Printer's Devil",
    // Thirteen, and generated as a boy rather than a youth even though the build normalizes every
    // body to the same 45px height. The costume is what carries the age here — a short jacket and
    // loose trousers rather than a man's waistcoat — since the silhouette cannot.
    id: "5fe54441-c6c2-4494-bfad-ec8d97b39f81",
    frames: 8,
    walkGroup: "devil-walk",
  },
  {
    key: "canal-temperance-reformer",
    stem: "chronicle-sprites/field/npc-canal-temperance-reformer",
    name: "Canal Temperance Reformer",
    id: "13d162bc-03ef-41ef-8848-9fa04f95f30c",
    frames: 8,
    walkGroup: "reformer-walk",
  },
  {
    key: "canal-boat-woman",
    stem: "chronicle-sprites/field/npc-canal-boat-woman",
    name: "Canal Boat Family Woman",
    id: "a97fba23-e0a7-4d0c-a240-a023e00eea9e",
    frames: 8,
    walkGroup: "boatwoman-walk",
  },

  // ---- Unit 5 · Richmond, Virginia, 1864 -------------------------------------------------------
  {
    key: "richmond-dock-laborer",
    stem: "chronicle-sprites/field/npc-richmond-dock-laborer",
    name: "Enslaved Richmond Dock Laborer",
    id: "70cc40cd-e372-4107-933c-5e7cd316e619",
    frames: 8,
    walkGroup: "richmond-dock-laborer-walk8",
  },
  {
    key: "slave-trade-clerk",
    stem: "chronicle-sprites/field/npc-slave-trade-clerk",
    name: "Richmond Slave-Trading Office Clerk",
    id: "d83cb6b3-a5f9-460a-a0e2-05c63e20a4dc",
    frames: 8,
    walkGroup: "slave-trade-clerk-walk8",
  },
  {
    key: "confederate-official",
    stem: "chronicle-sprites/field/npc-confederate-official",
    name: "Secessionist Politician and Confederate Clerk",
    id: "6d8b7c02-ada2-40e2-913c-8e9337289ec4",
    frames: 8,
    walkGroup: "confederate-official-walk8",
  },
  {
    key: "richmond-hospital-worker",
    stem: "chronicle-sprites/field/npc-richmond-hospital-worker",
    name: "Richmond Wartime Hospital Worker",
    id: "7fc555bc-10a7-45aa-ba75-1e1d6a2e1163",
    frames: 8,
    walkGroup: "richmond-hospital-worker-walk8",
  },
  {
    key: "richmond-shopkeeper",
    stem: "chronicle-sprites/field/npc-richmond-shopkeeper",
    name: "White Richmond Shopkeeper",
    id: "f40422bb-542c-47f0-869b-2596ca769875",
    frames: 8,
    walkGroup: "richmond-shopkeeper-walk8",
  },
  {
    key: "richmond-seamstress",
    stem: "chronicle-sprites/field/npc-richmond-seamstress",
    name: "Enslaved Richmond Seamstress",
    // Regenerated: the first attempt's north rotation was not a back view — it still faced camera
    // with eyes visible, which is the north/south substitution failure mode. Describing the apron
    // as tied behind her with the ties hanging is what gave the model a reason to draw a real back.
    id: "c8372f10-927d-45ed-8248-2f618901432e",
    frames: 8,
    walkGroup: "richmond-seamstress-walk8",
  },
  {
    key: "richmond-refugee-woman",
    stem: "chronicle-sprites/field/npc-richmond-refugee-woman",
    name: "Richmond Wartime Refugee Woman",
    // Regenerated because the first attempt came out in what read as bib overalls with divided
    // legs — 20th-century workwear on an 1864 map. "Ankle-length skirt" was not enough on its own;
    // spelling out that it falls in a single unbroken cone from the waist to the shoes, with no
    // trousers and no divided legs, is what produced a skirt. Worth remembering for the next dress.
    id: "985e17e7-ef53-4e81-8533-b5b456dc78a4",
    frames: 8,
    walkGroup: "richmond-refugee-woman-walk8",
  },
  {
    key: "richmond-free-black-barber",
    stem: "chronicle-sprites/field/npc-richmond-free-black-barber",
    name: "Free Black Richmond Barber",
    id: "e2224526-4097-41b9-8e85-b7a79fe147e2",
    frames: 8,
    walkGroup: "richmond-free-black-barber-walk8",
  },
  {
    key: "richmond-relief-society-woman",
    stem: "chronicle-sprites/field/npc-richmond-relief-society-woman",
    name: "Richmond Relief Society Organizer",
    id: "d7cc2155-39c4-494a-9d16-42c2202774cc",
    frames: 8,
    walkGroup: "richmond-relief-society-woman-walk8",
  },
  {
    key: "tredegar-ironworker",
    stem: "chronicle-sprites/field/npc-tredegar-ironworker",
    name: "Tredegar Ironworks Laborer",
    // Regenerated for distinctness, not for accuracy: the first attempt's soot-marked leather apron
    // did not render and its shirt came out light, leaving him confusable with
    // `richmond-dock-laborer` — two characters posted on the same map a few hundred tiles apart.
    // This one wears the apron chest-to-knee over a dark shirt and reads as a different trade.
    id: "6fa5fb61-03c9-4cc6-9e0b-4d5f3d2780b5",
    frames: 8,
    walkGroup: "tredegar-ironworker-walk8",
    idleGroup: "tredegar-ironworker-idle",
    idleFrames: 4,
  },
  {
    key: "confederate-private",
    stem: "chronicle-sprites/field/npc-confederate-private",
    name: "Confederate Infantry Private",
    // Underfed, patched, and carrying nothing: the map must not romanticize the Confederacy, and
    // the cheapest way to fail that is a clean uniform and a heroic pose. The first attempt also
    // shed detached fragments and an out-of-palette element at the hand where its musket sat.
    id: "ed1b5b3c-39ce-4bfe-b91b-1fd7a1fe324a",
    frames: 8,
    walkGroup: "confederate-private-walk8",
  },
  {
    key: "richmond-government-messenger",
    stem: "chronicle-sprites/field/npc-richmond-government-messenger",
    name: "Richmond Government Messenger",
    // Civilian, deliberately: no insignia, belt, or weapon. The map must not romanticize the
    // Confederacy, and its most-seen routed character being a soldier is the easy way to fail that.
    id: "78c5dd6e-8a65-49a7-a262-3ffe6d635be6",
    frames: 8,
    walkGroup: "richmond-government-messenger-walk8",
  },

  // ---- Unit 5 interiors · the counting room and the Chimborazo ward (Phase 67) ------------------
  //
  // Three characters, not four: Jane Ferris was already in the cast and only walked indoors, because
  // a matron belongs in her ward and her line was always delivered standing over the register.
  //
  // No props on any of them, per the Phase 2 run report's finding that a shovel, a newspaper and an
  // apron all failed to survive rotation. No `idleGroup` either, matching their neighbours rather
  // than the ceiling — the same call the Unit 4 interiors made and for the same reason.
  {
    key: "richmond-bookkeeper",
    stem: "chronicle-sprites/field/npc-richmond-bookkeeper",
    name: "Richmond Commission House Book-keeper",
    // Deliberately not sinister. The whole design of the counting room is that it is an ordinary
    // well-kept commercial office, and the man who keeps its books has to look like what he is: an
    // elderly clerk in a shabby tailcoat and spectacles who has done the same job for twenty-two
    // years. A theatrical villain here would let a student off the hook.
    id: "a15633ec-55b6-4074-bf43-0222ec95fd30",
    frames: 8,
    walkGroup: "bookkeeper-walk8",
  },
  {
    key: "richmond-hired-out-man",
    stem: "chronicle-sprites/field/npc-richmond-hired-out-man",
    name: "Richmond Man Hired Out to the Works",
    // Three rolls, and the two rejected ones are worth recording because they are the same failure
    // from opposite ends. "Coarse brown homespun shirt" returned a collared work shirt with two
    // chest pockets and a leather belt — 20th-century workwear, the same defect that sent
    // `richmond-refugee-woman` back in bib overalls. "Loose collarless pullover shirt" returned a
    // sleeveless singlet, which is worse: on this character, in this room, bare arms are precisely
    // the exploitative image the brief bars. What worked was describing coverage rather than cut —
    // "a long sleeved shirt that covers both arms to the wrist and buttons at the throat."
    id: "d657e021-6ead-4df9-8223-d891a4d1edf9",
    frames: 8,
    walkGroup: "hired-out-man-walk8",
  },
  {
    key: "richmond-ward-nurse",
    stem: "chronicle-sprites/field/npc-richmond-ward-nurse",
    name: "Richmond Hospital Ward Nurse",
    // Chimborazo's nursing, laundry and cooking were done in large part by enslaved and free Black
    // women, many of them hired to the hospital by the year with the wage paid to whoever owned
    // them. It is one of the least-carried facts about Confederate hospitals and this map's ward
    // exists partly to carry it. Dark calico, long white apron, headwrap; first roll, no re-rolls.
    id: "bca54bcf-f040-4b1d-97fd-a151cbe8ec81",
    frames: 8,
    walkGroup: "ward-nurse-walk8",
  },
  // ---- Unit 3 · Philadelphia, 1767 (generated last, Phase 82) --------------------------------
  //
  // The last map to get real art, and it went last for a reason worth keeping: Phase 60's import
  // covered 1492 and 1607 and Phase 65's covered 1845 and 1864, so Philadelphia sat between two
  // imports on borrowed Caribbean sheets for twenty phases. It was never blocked on anything but a
  // decision to spend.
  //
  // Two pairs on this map stand close enough to be read in one glance, so colour does the
  // separating: the crier's route passes the recruiter's muster point (crimson against navy), and
  // the tradesman wanders four tiles from Voss's post (white shirtsleeves under a long red
  // waistcoat against her cream sleeves under dark leather). Neither pair shares a hat either.
  // That is Phase 80b's rule applied — check a new character against whoever stands *nearest*
  // them, not against the cast list.
  {
    key: "john-dickinson",
    stem: "chronicle-sprites/field/npc-john-dickinson",
    name: "Philadelphia Farmer Lawyer",
    // The only named historical figure on the map, and the costume is the mission's own subject:
    // he was a wealthy lawyer with a Delaware estate who signed himself "A Farmer" in print. So
    // the sprite is a gentleman — dark coat, buff waistcoat, white breeches and stockings, hair
    // tied back and no wig — because the gap between how he dressed and how he signed is what
    // "A Public Position" is about.
    id: "6b5733e2-ede3-4941-a343-afa3bfc0fb24",
    frames: 8,
    walkGroup: "dickinson-walk",
  },
  {
    key: "town-crier",
    stem: "chronicle-sprites/field/npc-town-crier",
    name: "Philadelphia Town Crier",
    // The brief asked for a small hand bell at his hip and the generator dropped it, which is the
    // right outcome rather than a miss: a held prop at this scale exceeds the canvas, and
    // canonicalCanvas() clips rather than resizes. The crimson coat and black tricorne carry him.
    id: "e61780ec-e933-466a-93e8-5db72a12f0a3",
    frames: 8,
    walkGroup: "crier-walk",
  },
  {
    key: "militia-recruiter",
    stem: "chronicle-sprites/field/npc-militia-recruiter",
    name: "Philadelphia Militia Recruiter",
    // Explicitly no weapon in the brief. A shouldered musket is the single most obvious prop for
    // this character and it is exactly the kind that leaves the 48x56 canvas — the white cross
    // belt does the same job of saying "under arms" and costs nothing.
    id: "680dd328-1187-4eae-abcf-24536fb782e2",
    frames: 8,
    walkGroup: "recruiter-walk",
  },
  {
    key: "free-tradesman",
    stem: "chronicle-sprites/field/npc-free-tradesman",
    name: "Philadelphia Free Tradesman",
    // A thigh-length red waistcoat over white shirtsleeves with a wide tan leather apron. The
    // waistcoat came back longer than the brief implied and that is period-correct for the 1770s
    // rather than a miss; the apron's wide block at the waist is what separates his silhouette
    // from Voss's four tiles away.
    id: "671d5178-1027-45ec-809e-82aeb57ba817",
    frames: 8,
    walkGroup: "tradesman-walk",
  },
  {
    key: "loyalist-merchant",
    stem: "chronicle-sprites/field/npc-loyalist-merchant",
    name: "Philadelphia Loyalist Merchant",
    // Plum rather than the teal the first draft of this brief carried: teal is Meridian's accent
    // colour (MERIDIAN-VISUAL-IDENTITY.md §3) and putting it on a period character in a unit where
    // Voss already stands is exactly the kind of quiet collision that is impossible to unpick
    // later. Powdered grey hair is the other half of his read at distance.
    id: "69673fc9-987b-45c9-93a9-80c434d8a9ad",
    frames: 8,
    walkGroup: "merchant-walk",
  },
  {
    key: "farmwife",
    stem: "chronicle-sprites/field/npc-farmwife",
    name: "Philadelphia Farmwife",
    // Short gown, petticoat, white apron and linen cap. She is the only skirted silhouette on this
    // map, which does the separating work colour does for the men — and the white apron and cap
    // read from every facing, including the back view, where most of this cast goes dark.
    id: "b88d7aa9-5bbf-413b-be3d-bacf4d5b2d08",
    frames: 8,
    walkGroup: "farmwife-walk",
  },

  // ---- Unit 6 · Cottonwood Junction, Kansas, 1873 (Phase 85) ------------------------------------
  //
  // Eleven, which is the largest single import since Phase 60, because this map has more distinct
  // economic positions on it than any that came before: a company town has a seller, a registrar,
  // a speculator, a surveyor, three kinds of hired labour, a claimant, a clerk, and the people
  // whose land is being sold out from under them. The cast IS the argument.
  //
  // No props on any of them. The Phase 2 run report established that a shovel, a newspaper and an
  // apron all fail to survive rotation, and the 48x56 canvas clips rather than resizes — so a
  // surveyor's chain and a teamster's whip were excluded from the briefs rather than ordered and
  // lost. Costume carries the trade instead, which at 45px of body is the stronger signal anyway.
  //
  // No `idleGroup` either, matching every other field cast. Voss is still the only character in
  // the game that declares one.
  {
    key: "railroad-land-agent",
    stem: "chronicle-sprites/field/npc-railroad-land-agent",
    name: "Railroad land agent",
    // Brown frock coat, gold waistcoat, wide-brim brown hat. He sells the railroad's grant land,
    // and he is one of three men on this map who do their work with paper — the trio that has to
    // separate at a glance, because all three have business at the land office. He is the one
    // wearing a hat, and the only one in brown.
    id: "bf937f72-ad9f-4d56-be99-bbb9c8fa2428",
    frames: 8,
    walkGroup: "land-agent-walk",
  },
  {
    key: "land-office-register",
    stem: "chronicle-sprites/field/npc-land-office-register",
    name: "Land office register",
    // Black frock coat, grey hair, bare-headed, elderly. The federal registrar: he does not sell
    // anything, he records who is entitled to what. Second of the three paper men, separated from
    // the land agent by having no hat and from the promoter by being the darkest figure on the map.
    // Deliberately not sinister, on the same reasoning as `richmond-bookkeeper` — the mission is
    // that an ordinary clerk executing an ordinary procedure is what a removal looks like from the
    // inside, and a theatrical villain here would let a student off the hook.
    id: "1faef98a-18ac-49f6-b0f5-5f82cba2c5b0",
    frames: 8,
    walkGroup: "register-walk",
  },
  {
    key: "townsite-promoter",
    stem: "chronicle-sprites/field/npc-townsite-promoter",
    name: "Town-site promoter",
    // Cream suit, black bowler, red cravat. Third paper man and the only light-coloured figure in
    // the cast, which is what separates him from the other two across a street. He is also the
    // only one selling something that does not exist yet — the town — and the suit is the point:
    // he is dressed better than anybody here and does none of the work.
    // Built at scale 0.938, one of two in the whole cast; the bowler is what costs him the pixels.
    id: "5af81aee-b2e5-4bd5-b457-79ae8e81b94a",
    frames: 8,
    walkGroup: "promoter-walk",
  },
  {
    key: "deputy-surveyor",
    stem: "chronicle-sprites/field/npc-deputy-surveyor",
    name: "Deputy surveyor",
    // Tan field clothing and a wide tan hat — the one paper man who works outdoors, which is why
    // he is dressed like the labourers and not like the other three. He runs the section lines,
    // and his survey is the map's spine: the instrument that made the reservation sellable.
    // No chain and no staff. See the note on props above.
    id: "af435e95-9a90-468a-b7d2-0d59967af7e9",
    frames: 8,
    walkGroup: "surveyor-walk",
  },
  {
    key: "telegraph-operator",
    stem: "chronicle-sprites/field/npc-telegraph-operator",
    name: "Telegraph operator",
    // White shirt, oxblood waistcoat, charcoal trousers, dark hat.
    //
    // **Regenerated, and the reason is Meridian.** The first roll came back 40% dark teal by pixel
    // count — cap, waistcoat and trousers — and teal is Meridian's reserved accent
    // (docs/art/MERIDIAN-VISUAL-IDENTITY.md §3). Phase 82 caught the same collision in a brief and
    // changed a merchant's coat from teal to plum before it was generated; this one got through to
    // the art because the brief never said the word. It matters more here than it did there: §5 of
    // THE-MAP-PROGRAM.md puts Meridian's first visible operation on this map, so a period character
    // wearing the frame's reserved colour is arguing against the reveal from inside it.
    //
    // The replacement brief said bare-headed three times and the generator gave him a hat anyway.
    // Kept, because the blocking defect was the colour and the hat costs nothing: he works in the
    // telegraph office interior, where the only person he is ever seen beside is whoever else is in
    // that room. `track-grader` is the one he would collide with in a line-up, and they never share
    // a surface.
    id: "43b11f42-e257-4ee6-8d60-4f4bb7ed4815",
    frames: 8,
    walkGroup: "operator-walk",
  },
  {
    key: "track-grader",
    stem: "chronicle-sprites/field/npc-track-grader",
    name: "Track grader",
    // White shirt, suspenders, dark flat cap, grey trousers. Graders moved the earth the track was
    // laid on, and the camp they live in is Irish, German and Black — Civil War veterans and
    // immigrant labour, per the brief. He is the cheapest silhouette in the cast on purpose: no
    // coat, no waistcoat, nothing but shirt and braces, which is what separates him from every
    // other man here at a distance.
    id: "92fbb401-ee74-4f63-8f6c-9c10d6ab9592",
    frames: 8,
    walkGroup: "grader-walk",
  },
  {
    key: "freight-teamster",
    stem: "chronicle-sprites/field/npc-freight-teamster",
    name: "Freight teamster",
    // Brown wide-brim hat, dark waistcoat, maroon shirt, brown trousers. He hauls what the railroad
    // brings, and he is the character the map uses to show that the line does not go everywhere —
    // freight comes off the platform and onto a wagon, and somebody is paid differently for each leg.
    id: "b4a3d242-d0d2-4a46-aac3-bf67329decc8",
    frames: 8,
    walkGroup: "teamster-walk",
  },
  {
    key: "texas-drover",
    stem: "chronicle-sprites/field/npc-texas-drover",
    name: "Texas drover",
    // Tan hat, red shirt, blue neckerchief. Up the trail with the cattle, which is the industry
    // the land sale was for. Shares a red torso with `kanza-man` and nothing else: the hat is the
    // separator, and the two of them are at opposite ends of the map by construction — pens on
    // one side of the line, village on the other.
    id: "c4fde8ea-16f3-4cb8-b4c2-db191b2783ae",
    frames: 8,
    walkGroup: "drover-walk",
  },
  {
    key: "homesteader-woman",
    stem: "chronicle-sprites/field/npc-homesteader-woman",
    name: "Homesteader woman",
    // Mid-blue dress and bonnet. One of two skirted silhouettes in this cast, and the pair has to
    // be designed against rather than assumed apart: she is #385192 with a bonnet where
    // `kanza-woman` is #2a334e bare-headed, so value and headwear do the work colour alone would
    // not. **They must not be posted within sight of each other**, which the map's composition
    // gives for free — the claim is on one side of the track and the village on the other.
    id: "748e1f28-fb88-4ca2-84eb-261b989c412d",
    frames: 8,
    walkGroup: "homesteader-walk",
  },
  {
    key: "kanza-man",
    stem: "chronicle-sprites/field/npc-kanza-man",
    name: "Kanza man",
    // Red trade-cloth coat over dark blue trousers, bare-headed. The red is not a liberty: red and
    // blue wool stroud were the staple of the prairie trade and were worn as outer garments, so
    // this is a man in the cloth his people bought, not a costume.
    //
    // He and `kanza-woman` are on this map in June 1873 in the middle of being removed, not after
    // — THE-MAP-PROGRAM.md §5 is explicit that the Indigenous presence here is current and
    // organised, named and speaking first, on the same register rule Unit 5 applies to enslaved and
    // impressed people. Two characters is thin for that and is the floor rather than the intent;
    // the village itself carries the rest through `derived/indigenous-village.png`.
    id: "7552d378-6271-4fe5-9bf0-2983164f3573",
    frames: 8,
    walkGroup: "kanza-man-walk",
  },
  {
    key: "kanza-woman",
    stem: "chronicle-sprites/field/npc-kanza-woman",
    name: "Kanza woman",
    // Dark navy dress, belted, bare-headed. See the note on `homesteader-woman` for why those two
    // are the pair this cast had to separate, and the note on `kanza-man` for the register both of
    // them speak in.
    id: "534b1b28-4883-4c83-937d-f77863934733",
    frames: 8,
    walkGroup: "kanza-woman-walk",
  },
  // ---- Unit 6 interiors · the land office and the telegraph office (Phase 86) --------------------
  //
  // Two, and only two, because Elias Fenn and Rufus Ply were already in the cast and only moved
  // indoors. Each of these is an economic position the outdoor map has no room for, and each is
  // seen beside exactly one other person, which is what both costume briefs were written against.
  {
    key: "land-buyer-agent",
    stem: "chronicle-sprites/field/npc-land-buyer-agent",
    name: "Land buyer agent 2",
    // Oatmeal linen duster over a dark maroon waistcoat, charcoal trousers, brown flat-crowned hat,
    // full dark beard. He shares the land office with the register and nobody else, so the whole
    // brief was written against that one man: Fenn is elderly, grey-haired, bare-headed and in
    // black, and this is a bearded man in a pale coat and a hat. Nothing else had to be avoided.
    //
    // **Generated twice, and the reason is Meridian again.** The first roll came back a dark
    // blue-green frock coat and matching hat — 44% inside the teal hue band by pixel count on the
    // south rotation and 68% on the east — against a brief that had already said 'absolutely no
    // teal, turquoise or cyan.' That is the second time this pack has drifted into the frame's
    // reserved accent (see `telegraph-operator`, Phase 85), and the first time it did so against a
    // brief that named the colour. Saying it in the negative is evidently not enough: the second
    // brief named the coat's colour positively, twice, and banned green as well. Scanned to zero
    // teal and zero green across all four cardinal rotations before it was accepted, and the
    // failed character was deleted rather than left in the account.
    id: "dc6fe8e8-2ede-404d-8e8f-cc9c9bcbfb69",
    frames: 8,
    walkGroup: "buyer-walk",
  },
  {
    key: "stock-commission-man",
    stem: "chronicle-sprites/field/npc-stock-commission-man",
    name: "Stock commission man",
    // Navy sack coat, buff waistcoat, cream straw boater, fawn trousers, clean-shaven. He shares
    // the telegraph office with the operator, who is white shirt, oxblood waistcoat, charcoal
    // trousers and a dark hat — so navy against oxblood and straw against dark is the whole
    // separation, and it is the same distance apart at 45px of body as it is on a colour wheel.
    // Right first time.
    id: "feabb5ca-9f88-43ce-8b8f-fbc4ca5dfecd",
    frames: 8,
    walkGroup: "broker-walk",
  },

  // ---- Unit 7 · the immigrant port. Ellis Island, 17 April 1907 (Phase 89B) ---------------------
  //
  // Fourteen, the largest single import since Phase 60's fifteen, and the composition is the
  // argument. Unit 6's cast was economic positions on a map about who owns land; this one is
  // **positions relative to a question** — who asks it, who answers it, who carries it between two
  // languages, who writes down what was said, who decides, who appeals, who is paid while it
  // happens, who waits at the gate, and who is being described in a vocabulary they did not choose.
  //
  // Seven of the fourteen carry one of `unit-07-campaign.js`'s seven records, so every record on
  // this map has a body standing somewhere on it. Three of those seven are the slate fixed in
  // THE-MAP-PROGRAM.md §2 before any of this existed: the inspector's manifest page (INTERVIEW),
  // the surgeon's inspection card (ASSEMBLY), the board clerk's minute (TRACE).
  //
  // **Half the cast stands indoors**, which is the highest interior share of any map so far and is
  // the station stating its own shape: the wharf is where you wait, the reception hall is where you
  // are sorted. Seven on the wharf plus Voss, five in the inspection hall, two in the board of
  // special inquiry room.
  //
  // No props on anybody, per the standing finding restated at Unit 6: a shovel, a newspaper and an
  // apron all fail to survive rotation, and the 48x56 canvas clips rather than resizes. That costs
  // more here than anywhere before, because this is a map about paper and not one person on it can
  // be drawn holding a sheet of it. Costume carries the office instead.
  //
  // **Zero teal across all fourteen, on all four cardinals, first roll.** Three phases running had
  // lost a character to Meridian's reserved accent — Phase 82 caught it in a brief, Phases 85 and
  // 86 caught it in the art — so every brief here banned teal, turquoise, cyan and blue-green by
  // name *and* named its own garment colour positively wherever that garment was blue. Four of
  // these people wear navy. The highest reading in the cast is 0.0%.
  //
  // One character was generated three times and none of it was about colour: see
  // `port-steerage-woman`.

  // The wharf: the ferry slip, the canopy, and the ground people stand on before the building.
  {
    key: "port-ships-purser",
    stem: "chronicle-sprites/field/npc-port-ships-purser",
    name: "Steamship purser",
    // Mid-blue double-breasted reefer, two rows of brass buttons, gold rings at the cuff, matching
    // peaked cap, grey beard, heavy build. **He filled in the manifest**, at Hamburg or Naples or
    // Bremen, weeks ago, from what people told a clerk at an emigration office — which is why what
    // happens at the inspector's desk is a re-reading rather than an interview. He also holds what
    // the boarding division left with him at quarantine in the Lower Bay.
    id: "0a0d188f-9d1a-4f37-bd17-f9a772448ec4",
    frames: 8,
    walkGroup: "purser-walk",
  },
  {
    key: "port-steamship-agent",
    stem: "chronicle-sprites/field/npc-port-steamship-agent",
    name: "Steamship line shore agent",
    // Knee-length grey overcoat over a dark suit, black bowler, full ginger moustache. The line's
    // man ashore. The first inspection most people on this wharf ever had was his company's, in
    // Europe, conducted by a firm that pays the return passage of anybody rejected here — which is
    // the whole reason it was thorough. Bulk and a hat: the two things that separate him from the
    // waiting relative, who is the other civilian man in a dark suit out here.
    id: "1185679e-dba3-4155-bff3-1f554a471075",
    frames: 8,
    walkGroup: "agent-walk",
  },
  {
    key: "port-steerage-man",
    stem: "chronicle-sprites/field/npc-port-steerage-man",
    name: "Steerage labourer",
    // Brown corduroy jacket, collarless cream shirt, rust waistcoat, soft brown flat cap,
    // twenty-two. He is column 21 of the manifest with no right answer available: an offer of work
    // waiting for him is contract labour and excludable, and no work waiting for him is likely to
    // become a public charge and excludable. Nothing about him is a costume choice — that is what a
    // man travelling in steerage to look for work was wearing.
    id: "ee3a9bf3-c9cc-49f0-b6c0-8a09c77cf951",
    frames: 8,
    walkGroup: "steerage-man-walk",
  },
  {
    key: "port-steerage-woman",
    stem: "chronicle-sprites/field/npc-port-steerage-woman",
    name: "Steerage mother v3",
    // Rust-orange blouse, cream apron, long dark navy skirt to the ankles, brown hair pinned back.
    //
    // **Generated three times, and none of it was about colour.** The first brief asked for "a
    // rust-red headscarf tied under the chin" over "a heavy dark navy blue ankle-length skirt" and
    // returned a woman with loose bright red hair, no scarf at all, and navy *trousers* — the
    // colour adjective had migrated to the hair and the garment had been silently swapped. The
    // second tried to force both by emphasis and negation ("completely covered ... so that no hair
    // shows at all", "a skirt, not trousers") and reproduced the same two failures with better
    // colours. That is the lesson the teal briefs taught, arrived at from the other side: **a
    // negation is not an instruction.** The third dropped every emphasis and simply reused the
    // sentence structure that had already worked on `port-steerage-elder` two rolls earlier — and
    // the skirt landed. Copy a brief that worked before rewriting one that did not.
    //
    // **The headscarf never landed, and it was dropped rather than chased into a fourth roll.**
    // Three attempts is where the cost of a head covering on 45 pixels of body stops being worth
    // paying, and the costume is better without one: the elder two entries up is this map's covered
    // head, and two headscarves on one wharf were always the weaker separation. Bare-headed with
    // the hair pinned back is period-ordinary at this station and reads as a working woman at
    // distance, which is the whole requirement. Both failures were deleted rather than left in the
    // account.
    id: "cae91686-5d08-42f1-b1f5-a8974378fa4d",
    frames: 8,
    walkGroup: "steerage-woman-walk",
  },
  {
    key: "port-steerage-elder",
    stem: "chronicle-sprites/field/npc-port-steerage-elder",
    name: "Elderly steerage passenger",
    // Black headscarf, black skirt, heavy pale grey shawl, stooped, late sixties. The
    // likely-to-become-a-public-charge clause with a face on it: she is old, she has no trade, she
    // has no money of her own, and she is travelling to a son who sent for her. She satisfies every
    // test for exclusion and none for wrongdoing, and that distinction is exactly what the clause
    // was written broadly enough to blur. **The only covered head in the cast**, which is what
    // separates her from the younger steerage woman at a distance — grey and black against rust and
    // navy, a generation between them, and one of them wearing a scarf.
    id: "50809f7f-e090-4c61-a0ae-e06c6541b84c",
    frames: 8,
    walkGroup: "elder-walk",
  },
  {
    key: "port-aid-society-agent",
    stem: "chronicle-sprites/field/npc-port-aid-society-agent",
    name: "Immigrant aid society agent",
    // Deep plum tailored walking suit, wide plum hat. Immigrant aid societies worked the island on
    // a permit and could appeal a board's decision — **the only person here who can contest the
    // paperwork, and who does it with more paperwork.** She is the most saturated figure in the
    // cast on purpose: she is the one adult on the wharf who is neither an official, a company man,
    // nor an arrival, and nothing else about that position would show at 45 pixels.
    id: "76a2c057-136c-4bee-8c6e-690dd9af72b7",
    frames: 8,
    walkGroup: "aid-agent-walk",
  },
  {
    key: "port-waiting-relative",
    stem: "chronicle-sprites/field/npc-port-waiting-relative",
    name: "Waiting relative",
    // Cheap black sack suit, dark red tie, bare-headed, thirty. Four years in the country, back at
    // the gate for a cousin. **Bare-headed is the separation** — every other man on this wharf is
    // wearing something on his head — and it is also the characterisation: he has been standing
    // here since the morning boat. He is where the coached answer comes from, which is the reason
    // boards of special inquiry existed at all.
    id: "7aeea41b-cd76-46ef-93c9-ebd30e66a1c1",
    frames: 8,
    walkGroup: "relative-walk",
  },

  // The inspection hall: the line, the desks, and the two hundred feet of floor between them.
  {
    key: "port-immigrant-inspector",
    stem: "chronicle-sprites/field/npc-port-immigrant-inspector",
    name: "Port immigration inspector",
    // Dark navy sack coat buttoned high on a row of small brass buttons, navy trousers, navy peaked
    // cap with a brass badge, clean-shaven, under thirty. The registry desk: he reads a traveller
    // the answers a purser wrote down for them in Europe and asks them to agree to it, at roughly
    // two minutes a person. **The only covered head in the inspection hall**, which is the whole
    // separation from the surgeon standing near him — both are in navy, and one of them has no coat.
    id: "a6d6cc49-df57-43fb-b20e-550e1f7ca595",
    frames: 8,
    walkGroup: "inspector-walk",
  },
  {
    key: "port-line-surgeon",
    stem: "chronicle-sprites/field/npc-port-line-surgeon",
    name: "Marine hospital line surgeon",
    // White shirt with the sleeves rolled above the elbow, navy waistcoat and trousers,
    // bare-headed, dark beard. Public Health and Marine-Hospital Service — its name from 1902 to
    // 1912, which is why the record says so too. The six-second examination is a man working with
    // his hands at speed in a moving line, and no coat, no cap and bare forearms are that stated in
    // costume rather than in a prop he could not have held.
    id: "350b7386-9150-43a7-8e85-7b1a3ed8feaa",
    frames: 8,
    walkGroup: "surgeon-walk",
  },
  {
    key: "port-interpreter",
    stem: "chronicle-sprites/field/npc-port-interpreter",
    name: "Bureau interpreter",
    // Olive-green sack suit, dark tie, bare-headed, slight, twenty-five. **No uniform and no badge,
    // and that is the character**: every question at that desk and every answer to it passes
    // through a man with authority over neither. He is also the one holding the circular that
    // instructs an officer to enter the race his own observation indicates rather than the one the
    // traveller claims — about a claim he will have just finished translating.
    id: "a10002c6-1fd5-4570-ad5d-fc881cb2c283",
    frames: 8,
    walkGroup: "interpreter-walk",
  },
  {
    key: "port-station-matron",
    stem: "chronicle-sprites/field/npc-port-station-matron",
    name: "Immigrant station matron",
    // Charcoal skirt, high-necked white shirtwaist, fitted dark maroon jacket, grey-streaked hair
    // pinned up. The one official on this map whose work is people rather than paper: detained
    // women and children were hers, day and night, and she is the reason a nineteen-year-old held
    // for a hearing is not simply left on a bench. The maroon jacket rather than a cream upper body
    // is deliberate — she is a woman with her hair up in dark clothing, which is the exact
    // silhouette Phase 80b had to separate Voss from Dr Soto on. They do not share a surface here,
    // and the colour means it would not matter if they did.
    id: "57d50df4-f0a0-4b63-93a8-22aec6000407",
    frames: 8,
    walkGroup: "matron-walk",
  },
  {
    key: "port-exchange-clerk",
    stem: "chronicle-sprites/field/npc-port-exchange-clerk",
    name: "Money exchange clerk",
    // White shirt, black sleeve garters, mustard-gold waistcoat, black bow tie, charcoal trousers,
    // bare-headed. The money exchange, the ticket office and the food concession were **private
    // franchises operating on federal property**, and the commissioner's daily statement counts
    // their takings in a column beside the head tax. He is where the money in this building goes,
    // and the reason that statement is worth reading twice.
    id: "78bfe924-1826-4d61-951a-57351dfff126",
    frames: 8,
    walkGroup: "exchange-walk",
  },

  // The board of special inquiry room: a closed door off the registry floor, and two people behind
  // it. The three sitting inspectors are the room's argument and are deliberately not drawn — a
  // hearing that fits in a name pill is a hearing a player thinks they have met.
  {
    key: "port-board-clerk",
    stem: "chronicle-sprites/field/npc-port-board-clerk",
    name: "Board of inquiry clerk",
    // Bald, small round wire spectacles, white shirt, black sleeve garters, slate-grey waistcoat.
    // He types the minute, which is the only part of the hearing that outlives it. **Shirtsleeves
    // and a waistcoat, same as the exchange clerk** — and they never share a surface, one being in
    // this room and the other on the registry floor, which is the same allowance Unit 6 made for
    // its telegraph operator and track grader. Mustard against slate and a full head of hair
    // against none is the separation if they ever did.
    id: "f277c1d7-c076-4c6a-b9ab-0eae501c6e2c",
    frames: 8,
    walkGroup: "board-clerk-walk",
  },
  {
    key: "port-detained-woman",
    stem: "chronicle-sprites/field/npc-port-detained-woman",
    name: "Detained steerage passenger",
    // Dark brown ankle-length travelling dress, cream shawl, hair in a single pinned braid,
    // nineteen. She stands in front of three inspectors and a stenographer while they decide
    // whether she is likely to become a public charge. **Not distressed and not defiant in the
    // art**, deliberately, and for the same reason `land-office-register` is not sinister — a
    // hearing that looks like a melodrama lets a student conclude it was an unusually wicked one,
    // and the whole finding is that it was the ordinary one, held four hundred times a day.
    id: "aa48336b-a45d-440e-823c-020578d94a40",
    frames: 8,
    walkGroup: "detained-walk",
  },
  // ---- Unit 8 · Fairmeadow, Pennsylvania, August 1957 (Phase 97) ---------------------------------
  //
  // Eight, and **all eight are outdoors** — the exact inverse of Unit 7, where half the cast worked
  // behind doors. That is the two places stating their own shapes: at an immigrant station you are
  // sorted indoors and the wharf is where you wait, and in a subdivision every decision is taken in
  // an office nobody is invited into and the street is all there is to walk.
  //
  // Unit 7's cast was positions relative to a question. This one is **positions relative to a line
  // nobody can see**: two people who wrote it (the appraiser, the township secretary), two it was
  // written about (the veteran, the borough resident), two who live inside it without having been
  // told (the householder, the committee man), one building it (the foreman), and one selling
  // inside it (the shopkeeper, on the wrong side).
  //
  // Five of `unit-08-campaign.js`'s seven records are carried by five of these eight, so the map's
  // interview has a body for every question it can ask. The other two records are on a card table
  // and a desk, and land with the two rooms.
  //
  // **The person the map is about is on it.** The loan file is deliberately silent on the
  // applicant — its own feedback says the document "establishes the mechanism precisely and
  // establishes nothing at all about the applicant" — and that silence is the finding. It is also
  // exactly why he cannot be absent from the map: a unit about a house refused to a Black veteran,
  // drawn without one, turns a mechanism that ran on real people into a diagram. The paper says
  // nothing; he says the thing the paper could not hold. That is the same structure the steerage
  // passengers give Ellis Island.
  //
  // No props, per the standing finding from Unit 6 onward: a clipboard, a handbill and a shop
  // ledger would all have failed rotation, and the 48x56 canvas clips rather than resizes. Costume
  // carries the office, which on this map means a straw fedora, a shop apron and a cloth cap doing
  // the work three held objects would have done.
  //
  // **Zero teal across all eight, on all four cardinals, first roll — and no re-rolls at all.**
  // Every brief banned teal, turquoise, cyan and blue-green by name and named its own garment
  // colour positively where that garment was blue or green, which is the rule Phase 89B arrived at
  // after three phases had each lost a character to Meridian's reserved accent. Two people here
  // wear navy and olive and both were named as such.
  {
    key: "suburb-appraiser",
    stem: "chronicle-sprites/field/npc-suburb-appraiser",
    name: "Fee appraiser",
    // White short-sleeved shirt, narrow maroon tie, charcoal trousers, pale straw fedora with a
    // dark band, wire spectacles. **He is the only person on this map who has seen both sides of it
    // written down**, and the costume is deliberately the least remarkable thing in the cast: a
    // contractor in shirtsleeves on a hot afternoon. The hat and the tie are what separate him from
    // the veteran, who is the other man out here in a white short-sleeved shirt.
    id: "4d95dc46-9a72-4b48-9169-4d162bf44d65",
    frames: 8,
    walkGroup: "appraiser-walk",
  },
  {
    key: "suburb-veteran",
    stem: "chronicle-sprites/field/npc-suburb-veteran",
    name: "Applicant, file 4,118",
    // Black man of about thirty-two, white short-sleeved shirt, olive-drab work trousers,
    // bareheaded, squared shoulders. Nine years at one plant and an unused entitlement, declined at
    // step five on somebody else's opinion of a neighbourhood. **Upright and unhurried in the art,
    // deliberately** — the same rule `port-detained-woman` runs under and for the same reason: a
    // figure drawn as a victim lets a student conclude this was an unusually cruel case, and the
    // whole finding is that it was the ordinary one, decided by a committee in a morning.
    id: "f3f153ae-1fae-421d-ac04-3cfde4303930",
    frames: 8,
    walkGroup: "veteran-walk",
  },
  {
    key: "suburb-householder",
    stem: "chronicle-sprites/field/npc-suburb-householder",
    name: "Fairmeadow householder",
    // Pale butter-yellow shirtwaist dress with a narrow white belt and a full skirt, short dark
    // hair set in a wave, flat white shoes. First section, settled 1953, and the deed with all six
    // restrictions on it is in a tin box in her kitchen. She is not concealing anything and has
    // never been asked.
    id: "b8894d4c-0598-401b-82ff-19f2524d40d2",
    frames: 8,
    walkGroup: "householder-walk",
  },
  {
    key: "suburb-committee-man",
    stem: "chronicle-sprites/field/npc-suburb-committee-man",
    name: "Citizens' committee man",
    // Red-and-cream check short-sleeved shirt, tan khaki trousers, thinning sandy hair, no hat. He
    // put the handbill through every letter slot in the section this morning and will tell you so.
    // The loudest shirt in the cast on the man whose document is the most careful, which is the
    // joke the costume is making and the only one on this map.
    id: "20d7a790-95d2-4759-b322-890aa7506e31",
    frames: 8,
    walkGroup: "committee-walk",
  },
  {
    key: "suburb-township-clerk",
    stem: "chronicle-sprites/field/npc-suburb-township-clerk",
    name: "Township secretary",
    // Navy blue skirt suit over a white blouse, grey hair pinned back, round spectacles. Twenty-two
    // years secretary to the board of supervisors, and the ordinance that sets a minimum lot at
    // forty thousand square feet went up on her board the day it was advertised. **The suit is navy
    // and the brief said so twice** — the reserved-accent rule, and the reason it is stated
    // positively rather than only as a ban.
    id: "43a761c2-192b-4c1c-9b29-580462d1efa5",
    frames: 8,
    walkGroup: "clerk-walk",
  },
  {
    key: "suburb-borough-woman",
    stem: "chronicle-sprites/field/npc-suburb-borough-woman",
    name: "Broad Street resident",
    // Dark plum housecoat open over a printed cotton dress, white apron, grey hair in a bun. Her
    // grandfather laid the brick in the pavement she is standing on and the appraisal gives her
    // block fifteen years. **She is the counterweight the whole southern half of the map exists
    // for**: without somebody standing on the rated-down ground, the rating is an abstraction.
    id: "5f054f3e-66fc-469f-a4f3-53c9908c7764",
    frames: 8,
    walkGroup: "boroughwoman-walk",
  },
  {
    key: "suburb-borough-shopkeeper",
    stem: "chronicle-sprites/field/npc-suburb-borough-shopkeeper",
    name: "Broad Street shopkeeper",
    // Long tan shop apron over a white shirt with the sleeves rolled, dark trousers, bald with a
    // fringe of grey. Four doors from the building & loan his father opened beside in 1926, and
    // three men on his street can no longer borrow to repair a shopfront. The apron is doing the
    // work a held ledger would have done and cannot.
    id: "74a7f3d1-8685-41c1-8484-b33412d7bfd1",
    frames: 8,
    walkGroup: "shopkeeper-walk",
  },
  {
    key: "suburb-road-foreman",
    stem: "chronicle-sprites/field/npc-suburb-road-foreman",
    name: "Highway foreman",
    // Olive-drab twill work shirt and trousers, wide brown belt, grey herringbone cloth cap,
    // sunburnt. He is building the boundary, and he is the only person on this map who knows the
    // date it starts to matter: when the southbound is surfaced the road everybody crosses at comes
    // out and the nearest way over goes in three miles east.
    id: "b827ef8f-3ad4-4714-bea5-9490c990c267",
    frames: 8,
    walkGroup: "foreman-walk",
  },
];

/**
 * Generated PixelLab characters that are deliberately not built yet, recorded here so the ids
 * survive.
 *
 * They exist in the account and their frames sit in `reports/pixellab-staging/`, which is
 * gitignored — so without this list the only record of them would be outside version control.
 * Nothing reads it; promoting one means moving its entry up into CHARACTERS with a `stem`.
 *
 *   usct-soldier             31a79b8d-5d16-453d-ba20-7ea101430d4f
 *   freedwoman-teacher       828def1c-4f4f-497b-8f8b-2e867b03fff0
 *   freedmens-bureau-agent   861166e4-d2b9-4ca6-b502-64ca9017d500
 *   reconstruction-delegate  50a52920-4323-419c-8c90-0beb0c062ed1
 *
 * The four above are Reconstruction-era people and cannot stand in Richmond in 1864 without
 * breaking the wartime map's own historical-state rule. They belong to Unit 5's Reconstruction
 * mission, which renders no field sprites, so they wait there rather than shipping unused.
 *
 *   british-line-infantry-private  c05ac60c-a508-451f-9dcf-afad0d28c850
 *
 * A 1770s redcoat, and a real upgrade over Unit 3's placeholder cast — but its south walk has 8
 * frames where the other three have 9, which this file's single `frames` count cannot express.
 * Out of scope for Units 4 and 5; left for whoever revisits Philadelphia.
 */

/**
 * `LEGACY_CHARACTERS` lived here until Phase 82. It rebuilt six Unit 1 placeholder sprites into
 * Unit 3's strip format under `legacy-*` keys of their own — the point being that upgrading
 * `columbus` would not silently redraw Philadelphia's town crier as Christopher Columbus. Those
 * six now have real Revolutionary-era art in `CHARACTERS` above, so the shim and its whole
 * separate build path (`buildLegacy()`) are gone rather than left behind as a second way to make
 * a sprite sheet.
 */

export function rotationUrl(character, compass) {
  return `${PIXELLAB_CDN}/${PIXELLAB_TENANT}/${character.id}/rotations/${compass}.png`;
}

export function frameUrl(character, compass, index) {
  const animation = character.walk[compass];
  return `${PIXELLAB_CDN}/${PIXELLAB_TENANT}/${character.id}/animations/${animation}/${compass}/${index}.png`;
}
