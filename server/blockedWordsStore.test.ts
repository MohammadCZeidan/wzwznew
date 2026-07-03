import { describe, expect, it } from "vitest";
import {
  __resetBlockedTermsCache,
  listBlockedTermsCached,
  mapBlockedWord,
  normalizeBlockedWord,
} from "../api/_lib/blockedWordsStore.js";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("blocked words store helpers", () => {
  it("normalizes admin-entered blocked words before persistence", () => {
    expect(normalizeBlockedWord("  AdminTerm  ")).toBe("adminterm");
    expect(normalizeBlockedWord("")).toBe("");
    expect(normalizeBlockedWord(null)).toBe("");
  });

  it("maps Supabase rows to API records", () => {
    expect(
      mapBlockedWord({
        id: "word-1",
        term: "adminterm",
        normalized_term: "adminterm",
        created_at: "2026-06-26T10:00:00.000Z",
        created_by: "admin-1",
      }),
    ).toEqual({
      id: "word-1",
      term: "adminterm",
      normalizedTerm: "adminterm",
      createdAt: "2026-06-26T10:00:00.000Z",
      createdBy: "admin-1",
    });
  });
});

describe("listBlockedTermsCached", () => {
  it("serves repeat calls within the TTL without re-querying", async () => {
    __resetBlockedTermsCache();
    let queries = 0;
    const fakeSupabase = {
      from: () => ({
        select: () => ({
          order: async () => {
            queries += 1;
            return {
              data: [
                { id: "1", term: "bad", normalized_term: "bad", created_at: "", created_by: null },
              ],
              error: null,
            };
          },
        }),
      }),
    } as unknown as SupabaseClient;

    expect(await listBlockedTermsCached(fakeSupabase)).toEqual(["bad"]);
    expect(await listBlockedTermsCached(fakeSupabase)).toEqual(["bad"]);
    expect(queries).toBe(1);
  });
});
