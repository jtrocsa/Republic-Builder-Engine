import { describe, it, expect } from "vitest";
import { BrandSchema, UnitSchema } from "../../apps/web/src/content/schemas/unit.schema.js";
import { buildSourcesSchema } from "../../apps/web/src/content/schemas/source.schema.js";
import { ExchangeRecordsSchema } from "../../apps/web/src/content/schemas/exchange-record.schema.js";
import {
  EmpireEvidenceListSchema,
  buildEmpireConnectionsSchema,
} from "../../apps/web/src/content/schemas/empire.schema.js";
import { ReviewSchema } from "../../apps/web/src/content/schemas/review.schema.js";
import {
  TriangleLegsSchema,
  buildTriangleCargoSchema,
  RegionRecordsSchema,
  buildRegionEvidenceSchema,
} from "../../apps/web/src/content/schemas/unit02-activities.schema.js";

const validCase = {
  id: "case-001",
  shortTitle: "Caribbean",
  title: "Case 1.01 — The Atlantic Crossroads",
  date: "1493",
  mapPosition: { left: "28.5%", top: "64.5%" },
  location: "Caribbean · 1493",
  question: "How did early contact begin to reshape societies?",
  mechanic: "Record Reconstruction",
  route: "field",
  summary: "Establish what existed before contact.",
};

const validUnit = {
  id: "unit-01",
  title: "The Atlantic World",
  period: "1491–1607",
  description: "Investigate the Atlantic world after 1492.",
  centralQuestion: "How did contact reshape societies?",
  cases: [validCase],
};

const validSource = {
  id: "taino-context",
  type: "Secondary context",
  title: "The Caribbean—Island Society",
  creator: "Library of Congress",
  date: "1991",
  record: "1492: An Ongoing Voyage",
  visual: "context",
  activityRoute: "village-activity",
  excerpt: "Villages were governed by chieftains.",
  prompt: "What does this establish about Caribbean societies?",
  feedback: "Useful context, not a Taíno-authored primary source.",
  citation: "Library of Congress exhibition text.",
  externalUrl: "https://www.loc.gov/exhibits/1492/america.html",
  reconstruction: "precontact",
};

describe("UnitSchema (normal / boundary / invalid cases)", () => {
  it("accepts a valid unit with one well-formed case (normal case)", () => {
    expect(UnitSchema.safeParse(validUnit).success).toBe(true);
  });

  it("rejects a case missing its required id (missing required ID)", () => {
    const broken = { ...validUnit, cases: [{ ...validCase, id: "" }] };
    const result = UnitSchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((issue) => issue.message.includes("case.id"))).toBe(true);
  });

  it("rejects two cases sharing the same id (duplicate ID)", () => {
    const broken = { ...validUnit, cases: [validCase, { ...validCase }] };
    const result = UnitSchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((issue) => issue.message.includes("Duplicate case id"))).toBe(
      true
    );
  });

  it("rejects a case with an unrecognized route (invalid/missing data)", () => {
    const broken = { ...validUnit, cases: [{ ...validCase, route: "not-a-real-route" }] };
    expect(UnitSchema.safeParse(broken).success).toBe(false);
  });

  it("defaults navigationTableVisible to true and archiveChallenge to null when omitted (normal case)", () => {
    const result = UnitSchema.safeParse(validUnit);
    expect(result.success).toBe(true);
    expect(result.data.cases[0].navigationTableVisible).toBe(true);
    expect(result.data.cases[0].archiveChallenge).toBeNull();
  });

  it("accepts a case relocated to the Archive Room (normal case)", () => {
    const relocated = {
      ...validUnit,
      cases: [
        {
          ...validCase,
          route: "regions",
          navigationTableVisible: false,
          archiveChallenge: { questType: "evidence-organizing", questId: "unit-02-charter-compact" },
        },
      ],
    };
    const result = UnitSchema.safeParse(relocated);
    expect(result.success).toBe(true);
    expect(result.data.cases[0].navigationTableVisible).toBe(false);
    expect(result.data.cases[0].archiveChallenge).toEqual({
      questType: "evidence-organizing",
      questId: "unit-02-charter-compact",
    });
  });

  it("rejects an archiveChallenge missing questId (invalid/missing data)", () => {
    const broken = {
      ...validUnit,
      cases: [{ ...validCase, archiveChallenge: { questType: "mcq", questId: "" } }],
    };
    expect(UnitSchema.safeParse(broken).success).toBe(false);
  });
});

describe("BrandSchema", () => {
  it("requires all three brand fields to be present (normal case)", () => {
    expect(BrandSchema.safeParse({ engine: "e", campaign: "c", status: "s" }).success).toBe(true);
    expect(BrandSchema.safeParse({ engine: "", campaign: "c", status: "s" }).success).toBe(false);
  });
});

describe("source schema (buildSourcesSchema)", () => {
  it("accepts a valid source list with no reconstruction-id constraint (normal case)", () => {
    const schema = buildSourcesSchema({});
    expect(schema.safeParse([validSource]).success).toBe(true);
  });

  it("rejects a source with a malformed externalUrl (invalid/missing data)", () => {
    const schema = buildSourcesSchema({});
    const broken = [{ ...validSource, externalUrl: "not a url" }];
    expect(schema.safeParse(broken).success).toBe(false);
  });

  it("rejects two sources sharing the same id (duplicate ID)", () => {
    const schema = buildSourcesSchema({});
    const broken = [validSource, { ...validSource }];
    const result = schema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((issue) => issue.message.includes("Duplicate source id"))).toBe(
      true
    );
  });

  it("constrains reconstruction to a known lane id when reconstructionIds is given (boundary case)", () => {
    const schema = buildSourcesSchema({ reconstructionIds: ["founding", "labor", "exchange"] });
    expect(schema.safeParse([{ ...validSource, reconstruction: "founding" }]).success).toBe(true);
    expect(schema.safeParse([{ ...validSource, reconstruction: "precontact" }]).success).toBe(
      false
    );
  });

  it("defaults investigationMode/investigationQuestId to null when omitted (normal case)", () => {
    const schema = buildSourcesSchema({});
    const result = schema.safeParse([validSource]);
    expect(result.success).toBe(true);
    expect(result.data[0].investigationMode).toBeNull();
    expect(result.data[0].investigationQuestId).toBeNull();
  });

  it("accepts a source gated by an Investigation Challenge (normal case)", () => {
    const schema = buildSourcesSchema({});
    const gated = {
      ...validSource,
      activityRoute: null,
      investigationMode: "mcq",
      investigationQuestId: "unit-02-riverbend-letter-prediction",
    };
    const result = schema.safeParse([gated]);
    expect(result.success).toBe(true);
    expect(result.data[0].investigationMode).toBe("mcq");
  });
});

describe("ExchangeRecordsSchema", () => {
  const validRecord = {
    id: "maize",
    label: "Maize",
    icon: "🌽",
    sourceTitle: "Natural and Moral History of the Indies",
    sourceMeta: "1590 · primary-source excerpt",
    excerpt: "The principal grain of the Indies is maize.",
    sourceNote: "Identifies maize as an American crop.",
    question: "Which claim is best supported?",
    choices: ["A", "B", "C", "D"],
    answer: 0,
    citation: "José de Acosta, 1590.",
  };

  it("accepts a valid exchange record (normal case)", () => {
    expect(ExchangeRecordsSchema.safeParse([validRecord]).success).toBe(true);
  });

  it("accepts an answer index on the last valid choice (boundary case)", () => {
    expect(ExchangeRecordsSchema.safeParse([{ ...validRecord, answer: 3 }]).success).toBe(true);
  });

  it("rejects an answer index equal to choices.length (invalid answer index)", () => {
    const result = ExchangeRecordsSchema.safeParse([{ ...validRecord, answer: 4 }]);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((issue) => issue.message.includes("out of range"))).toBe(true);
  });
});

describe("empire evidence + connections", () => {
  const evidence = [
    { id: "claim", label: "Claim", source: "s", detail: "d" },
    { id: "encomienda", label: "Encomienda", source: "s", detail: "d" },
  ];

  it("accepts a valid evidence list (normal case)", () => {
    expect(EmpireEvidenceListSchema.safeParse(evidence).success).toBe(true);
  });

  it("accepts a connection whose from/to both reference real evidence ids (normal case)", () => {
    const schema = buildEmpireConnectionsSchema(evidence.map((card) => card.id));
    expect(schema.safeParse([{ from: "claim", to: "encomienda", clue: "c" }]).success).toBe(true);
  });

  it("rejects a connection referencing a nonexistent evidence id (missing referenced source)", () => {
    const schema = buildEmpireConnectionsSchema(evidence.map((card) => card.id));
    const result = schema.safeParse([{ from: "claim", to: "does-not-exist", clue: "c" }]);
    expect(result.success).toBe(false);
    expect(
      result.error.issues.some((issue) =>
        issue.message.includes("does not match any EMPIRE_EVIDENCE id")
      )
    ).toBe(true);
  });
});

describe("ReviewSchema (saq rubric total)", () => {
  const validMcq = {
    prompt: "Which is true?",
    choices: ["A", "B"],
    answer: 0,
    explanation: "Because A.",
  };

  it("accepts a rubric whose stated point total matches prompts.length (normal case)", () => {
    const review = {
      mcq: [validMcq],
      saq: {
        stimulus: "stimulus",
        prompts: ["A.", "B.", "C."],
        rubric: "SAQ practice rubric: 3 points total.",
      },
    };
    expect(ReviewSchema.safeParse(review).success).toBe(true);
  });

  it("rejects a rubric whose stated point total does not match prompts.length (incorrect rubric total)", () => {
    const review = {
      mcq: [validMcq],
      saq: {
        stimulus: "stimulus",
        prompts: ["A.", "B.", "C."],
        rubric: "SAQ practice rubric: 2 points total.",
      },
    };
    const result = ReviewSchema.safeParse(review);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((issue) => issue.message.includes("points total"))).toBe(true);
  });

  it("skips the rubric-total check when the rubric has no explicit numeric total (boundary case)", () => {
    const review = {
      mcq: [validMcq],
      saq: {
        stimulus: "stimulus",
        prompts: ["A.", "B.", "C."],
        rubric: "Placeholder rubric: one point per part.",
      },
    };
    expect(ReviewSchema.safeParse(review).success).toBe(true);
  });

  it("rejects an mcq answer index that is out of range (invalid answer index)", () => {
    const review = {
      mcq: [{ ...validMcq, answer: 5 }],
      saq: { stimulus: "s", prompts: ["A."], rubric: "1 point total." },
    };
    expect(ReviewSchema.safeParse(review).success).toBe(false);
  });
});

describe("unit-02 activity cross-references", () => {
  const legs = [
    { id: "outbound", label: "Outbound", fromLabel: "A", toLabel: "B", description: "d" },
  ];
  const validCargo = {
    id: "cloth",
    label: "Cloth",
    icon: "🧵",
    leg: "outbound",
    sourceTitle: "s",
    sourceMeta: "m",
    consequence: "c",
    question: "q?",
    choices: ["A", "B"],
    answer: 0,
    citation: "c",
  };

  it("accepts valid legs and cargo referencing a real leg id (normal case)", () => {
    expect(TriangleLegsSchema.safeParse(legs).success).toBe(true);
    const schema = buildTriangleCargoSchema(legs.map((leg) => leg.id));
    expect(schema.safeParse([validCargo]).success).toBe(true);
  });

  it("rejects cargo referencing a leg id that doesn't exist (missing referenced quest)", () => {
    const schema = buildTriangleCargoSchema(legs.map((leg) => leg.id));
    expect(schema.safeParse([{ ...validCargo, leg: "no-such-leg" }]).success).toBe(false);
  });

  const regions = [{ id: "new-england", label: "New England", summary: "s" }];
  const validRegionEvidence = {
    id: "town-covenant",
    label: "l",
    source: "s",
    detail: "d",
    region: "new-england",
  };

  it("accepts region evidence referencing a real region id (normal case)", () => {
    expect(RegionRecordsSchema.safeParse(regions).success).toBe(true);
    const schema = buildRegionEvidenceSchema(regions.map((region) => region.id));
    expect(schema.safeParse([validRegionEvidence]).success).toBe(true);
  });

  it("rejects region evidence referencing a region id that doesn't exist (missing referenced quest)", () => {
    const schema = buildRegionEvidenceSchema(regions.map((region) => region.id));
    expect(schema.safeParse([{ ...validRegionEvidence, region: "atlantis" }]).success).toBe(false);
  });
});
