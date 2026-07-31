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
    walk: {
      south: "c2f783c8-d434-49a8-a5cd-869710354f68",
      north: "ce92a3f8-cb48-41da-9ec4-fea4f3549660",
      east: "1bf7def1-b035-4c19-ad5d-04fba62c8924",
      west: "6ef031a7-b295-49c8-a308-51931d880664",
    },
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
 * Unit 3 (Philadelphia, 1767) has no PixelLab art — the account holds a 1492 Caribbean and a
 * 1607 Jamestown cast only. Rather than dress John Dickinson as Christopher Columbus, Unit 3's six
 * NPCs keep the placeholder art they already use, rebuilt into the same strip format so the game
 * has exactly one renderer. Each legacy character has only down/side idle+step art, and no north
 * pose at all, which is precisely what it renders today.
 */
export const LEGACY_CHARACTERS = [
  { key: "legacy-scribe", source: "npc-scribe" },
  { key: "legacy-columbus", source: "npc-columbus" },
  { key: "legacy-sailor", source: "npc-spanish-sailor" },
  { key: "legacy-elder", source: "npc-taino-elder" },
  { key: "legacy-fisher", source: "npc-taino-fisher" },
  { key: "legacy-gardener", source: "npc-taino-gardener" },
];

export function rotationUrl(character, compass) {
  return `${PIXELLAB_CDN}/${PIXELLAB_TENANT}/${character.id}/rotations/${compass}.png`;
}

export function frameUrl(character, compass, index) {
  const animation = character.walk[compass];
  return `${PIXELLAB_CDN}/${PIXELLAB_TENANT}/${character.id}/animations/${animation}/${compass}/${index}.png`;
}
