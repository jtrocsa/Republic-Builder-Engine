import { describe, it, expect } from "vitest";
import { resolvePoolSourceFields } from "../../apps/web/src/main.js";

// resolvePoolSourceFields() maps a Manage Content authoring form's "Select
// source" pick (drawn from the classroom's curated Sources-tab pool, see
// poolSourcesForCopy()) into the {label, attribution, excerpt} triad both
// the evidence-organizing and HIPP forms autofill from. Uses real primary-
// source-library entries rather than fabricated fixtures, matching this
// repo's convention of testing against real cited content.
describe("resolvePoolSourceFields", () => {
  it("maps a text source's creator/date/excerpt", () => {
    expect(resolvePoolSourceFields("text:u01-columbus-first-voyage-letter")).toEqual({
      label: "Letter announcing the first voyage",
      attribution: "Christopher Columbus, 1492-1493",
      excerpt:
        "Writing to his Spanish patrons after landfall in the Caribbean, Columbus describes the islands as fertile and their inhabitants as unarmed, generous, and easily converted or put to use — framing the voyage as both a religious triumph and a commercial opportunity for the Crown.",
    });
  });

  it("maps a visual source's citation/description instead of creator/date/excerpt", () => {
    expect(resolvePoolSourceFields("visual:u01-visual-tenochtitlan-maps")).toEqual({
      label: "Aztec or Tenochtitlan maps",
      attribution:
        "Various — e.g. the 1524 Nuremberg map of Tenochtitlan attributed to Hernán Cortés's expedition.",
      excerpt:
        "Contemporary or reconstructed maps of Tenochtitlan's island causeway-and-canal layout, used to illustrate the scale and sophistication of Aztec urban planning before and during the Spanish conquest.",
    });
  });

  it("returns null for an id that doesn't resolve to a real catalog entry", () => {
    expect(resolvePoolSourceFields("text:not-a-real-source-id")).toBeNull();
  });

  it("returns null for a value with no kind prefix", () => {
    expect(resolvePoolSourceFields("u01-columbus-first-voyage-letter")).toBeNull();
  });
});
