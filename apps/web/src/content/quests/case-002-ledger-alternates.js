// Curated pool of teacher-selectable alternates for Case 1.02's Exchange
// Ledger records (apps/web/src/content/unit-01-campaign.js's EXCHANGE_RECORDS,
// rendered by exchangeLedgerScreen() in main.js) — Teacher Mode's "swap a
// record" picker, generalized to the ledger-record slot kind the same way
// case-001-hipp-alternates.js generalized it to HIPP. Each entry's `quest`
// object is validated against ExchangeRecordSchema
// (apps/web/src/content/schemas/exchange-record.schema.js). `replacesQuestId`
// must match a real EXCHANGE_RECORDS id.
//
// Named `replacesQuestId`/`quest` (not `replacesRecordId`/`record`) even
// though the value is ExchangeRecordSchema-shaped, not quest-schema-shaped —
// this lets it plug into remote-content-selection-repository.js's existing
// generic alternate-pool machinery (QUEST_ALTERNATE_ENTRIES_BY_TYPE,
// groupAlternativesBySlot) with zero special-casing, the same way "hipp"
// and "evidence-organizing" already do.
//
// Proof-of-pipeline seed (one alternate for one slot) — extending coverage
// to the other three records, or to Case 1.08's Founding Debate ledger, is
// pure content work once wired the same way.
//
// This alternate reuses the exact same verified excerpt and citation as the
// official "maize" record (José de Acosta, 1590) rather than introducing a
// new quoted primary source, but asks a different question about it — a
// sourcing/reasoning prompt (why the record is still valid evidence for a
// pre-contact claim despite being written decades after contact) instead of
// the official record's more basic "which claim is supported" question.
export const CASE_002_LEDGER_ALTERNATES = [
  {
    replacesQuestId: "maize",
    quest: {
      id: "case-002-maize-alt-sourcing",
      label: "Maize",
      icon: "🌽",
      sourceTitle: "José de Acosta, Natural and Moral History of the Indies",
      sourceMeta: "Spanish Jesuit observer · 1590 · primary-source excerpt",
      excerpt:
        "“The principal grain of the Indies is maize … whereof the Indians make their bread.”",
      sourceNote:
        "Acosta wrote after contact, but his wording identifies maize as a staple cultivated in the Americas rather than a European introduction.",
      question:
        "Acosta wrote this nearly a century after 1492. Why can it still support a claim about maize before contact?",
      choices: [
        "Because Acosta describes maize as already the Indians' staple grain rather than something the Spanish introduced — his wording still points to a pre-contact origin, even from decades later.",
        "Because Acosta personally witnessed the first maize harvest in 1492.",
        "Because any Spanish-authored record automatically proves European origin for what it describes.",
        "Because the record's date is unknown, so it cannot support any claim about timing.",
      ],
      answer: 0,
      citation:
        "José de Acosta, The Natural and Moral History of the Indies (1590), public-domain English translation; wording varies by translation.",
    },
  },
];
