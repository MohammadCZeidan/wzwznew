import { describe, expect, it } from "vitest";
import { findDenylistedTerms } from "../api/_lib/serverModeration.js";

describe("findDenylistedTerms (banned-words auto-moderation matcher)", () => {
  const terms = ["scam", "free money"];

  it("returns whole-word matches, case-insensitively", () => {
    expect(findDenylistedTerms("This is a SCAM, avoid it", terms)).toEqual(["scam"]);
    expect(findDenylistedTerms("get FREE money now", terms)).toEqual(["free money"]);
  });

  it("does not match substrings inside larger words", () => {
    // "scampi" / "scams" must not trip the whole-word "scam" term.
    expect(findDenylistedTerms("i love scampi pasta", terms)).toEqual([]);
  });

  it("returns every distinct matched term", () => {
    expect(findDenylistedTerms("scam and free money", terms).sort()).toEqual(["free money", "scam"]);
  });

  it("returns nothing for clean text", () => {
    expect(findDenylistedTerms("a perfectly nice message", terms)).toEqual([]);
  });
});
