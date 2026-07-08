import { describe, expect, it } from "vitest";
import { DEFAULT_AVATAR_CATALOG } from "@/lib/avatarCatalog";
import { RANK_TIER_PRICING } from "@/lib/avatarRarity";
import { getAvatarRank, SLUG_AVATAR_RANKS } from "@/lib/avatarRank";

describe("avatar rank pricing", () => {
  it("matches the published token ladder", () => {
    expect(Object.fromEntries(
      Object.entries(RANK_TIER_PRICING).map(([rank, config]) => [rank, config.price]),
    )).toEqual({
      "1": 10,
      "2": 30,
      "3": 40,
      "4": 60,
      "5": 120,
      "6": 240,
      "7": 480,
      "8": 1000,
      "9": 2000,
      "10": 4000,
      "11": 10000,
      "12": 20000,
    });
  });

  it("prices known R2 shop avatars at 30 tokens", () => {
    const names = ["Neon Lynx", "Teal Siren", "Aqua Phantom", "Teal Ghost", "Blue Cipher", "Cyan Relic"];
    const offenders = names
      .map((name) => {
        const avatar = DEFAULT_AVATAR_CATALOG.find((item) => item.name === name);
        if (!avatar) return `${name}: missing from catalog`;

        const rank = getAvatarRank(avatar);
        const price = RANK_TIER_PRICING[rank]?.price;
        return rank === 2 && price === 30 ? null : `${name}: R${rank}, ${price ?? "missing"} tokens`;
      })
      .filter((message): message is string => message !== null);

    expect(offenders, `R2 shop avatar price drift: ${offenders.join("; ")}`).toEqual([]);
  });

  it("prices known R3 shop avatars at 40 tokens", () => {
    const names = ["Quartz Reaper", "Green Relic", "Lime Warden", "Night Prism"];
    const offenders = names
      .map((name) => {
        const avatar = DEFAULT_AVATAR_CATALOG.find((item) => item.name === name);
        if (!avatar) return `${name}: missing from catalog`;

        const rank = getAvatarRank(avatar);
        const price = RANK_TIER_PRICING[rank]?.price;
        return rank === 3 && price === 40 ? null : `${name}: R${rank}, ${price ?? "missing"} tokens`;
      })
      .filter((message): message is string => message !== null);

    expect(offenders, `R3 shop avatar price drift: ${offenders.join("; ")}`).toEqual([]);
  });

  it("prices known R4 shop avatars at 60 tokens", () => {
    const names = ["Crimson Muse", "Void Runner", "Orange Vortex"];
    const offenders = names
      .map((name) => {
        const avatar = DEFAULT_AVATAR_CATALOG.find((item) => item.name === name);
        if (!avatar) return `${name}: missing from catalog`;

        const rank = getAvatarRank(avatar);
        const price = RANK_TIER_PRICING[rank]?.price;
        return rank === 4 && price === 60 ? null : `${name}: R${rank}, ${price ?? "missing"} tokens`;
      })
      .filter((message): message is string => message !== null);

    expect(offenders, `R4 shop avatar price drift: ${offenders.join("; ")}`).toEqual([]);
  });

  it("prices known R5 shop avatars at 120 tokens", () => {
    const names = [
      "Violet Mask",
      "Violet Fang",
      "Ivory Glitch",
      "Purple Hex",
      "Purple Oracle",
      "Lilac Runner",
      "Indigo Circuit",
      "Magenta Shade",
      "Lavender Prism",
    ];
    const offenders = names
      .map((name) => {
        const avatar = DEFAULT_AVATAR_CATALOG.find((item) => item.name === name);
        if (!avatar) return `${name}: missing from catalog`;

        const rank = getAvatarRank(avatar);
        const price = RANK_TIER_PRICING[rank]?.price;
        return rank === 5 && price === 120 ? null : `${name}: R${rank}, ${price ?? "missing"} tokens`;
      })
      .filter((message): message is string => message !== null);

    expect(offenders, `R5 shop avatar price drift: ${offenders.join("; ")}`).toEqual([]);
  });

  it("prices known R6 shop avatars at 240 tokens", () => {
    const names = ["Black Comet", "Ruby Signal"];
    const offenders = names
      .map((name) => {
        const avatar = DEFAULT_AVATAR_CATALOG.find((item) => item.name === name);
        if (!avatar) return `${name}: missing from catalog`;

        const rank = getAvatarRank(avatar);
        const price = RANK_TIER_PRICING[rank]?.price;
        return rank === 6 && price === 240 ? null : `${name}: R${rank}, ${price ?? "missing"} tokens`;
      })
      .filter((message): message is string => message !== null);

    const redFiferRank = SLUG_AVATAR_RANKS["blu-fifer"];
    const redFiferPrice = redFiferRank ? RANK_TIER_PRICING[redFiferRank]?.price : undefined;
    if (redFiferRank !== 6 || redFiferPrice !== 240) {
      offenders.push(`Red Fifer: R${redFiferRank ?? "missing"}, ${redFiferPrice ?? "missing"} tokens`);
    }

    expect(offenders, `R6 shop avatar price drift: ${offenders.join("; ")}`).toEqual([]);
  });

  it("prices known R7 shop avatars at 480 tokens", () => {
    const names = ["Pink Circuit", "Pink Nova", "Crimson Echo"];
    const offenders = names
      .map((name) => {
        const avatar = DEFAULT_AVATAR_CATALOG.find((item) => item.name === name);
        if (!avatar) return `${name}: missing from catalog`;

        const rank = getAvatarRank(avatar);
        const price = RANK_TIER_PRICING[rank]?.price;
        return rank === 7 && price === 480 ? null : `${name}: R${rank}, ${price ?? "missing"} tokens`;
      })
      .filter((message): message is string => message !== null);

    expect(offenders, `R7 shop avatar price drift: ${offenders.join("; ")}`).toEqual([]);
  });

  it("prices known R8 shop avatars at 1000 tokens", () => {
    const names = ["Rose Warden", "Bronze Herald", "Gold Warden", "Pearl Siren", "Blush Monarch"];
    const offenders = names
      .map((name) => {
        const avatar = DEFAULT_AVATAR_CATALOG.find((item) => item.name === name);
        if (!avatar) return `${name}: missing from catalog`;

        const rank = getAvatarRank(avatar);
        const price = RANK_TIER_PRICING[rank]?.price;
        return rank === 8 && price === 1000 ? null : `${name}: R${rank}, ${price ?? "missing"} tokens`;
      })
      .filter((message): message is string => message !== null);

    expect(offenders, `R8 shop avatar price drift: ${offenders.join("; ")}`).toEqual([]);
  });

  it("prices known R9 shop avatars at 2000 tokens", () => {
    const names = ["Gold Specter", "Glass Monarch", "Ember Core"];
    const offenders = names
      .map((name) => {
        const avatar = DEFAULT_AVATAR_CATALOG.find((item) => item.name === name);
        if (!avatar) return `${name}: missing from catalog`;

        const rank = getAvatarRank(avatar);
        const price = RANK_TIER_PRICING[rank]?.price;
        return rank === 9 && price === 2000 ? null : `${name}: R${rank}, ${price ?? "missing"} tokens`;
      })
      .filter((message): message is string => message !== null);

    expect(offenders, `R9 shop avatar price drift: ${offenders.join("; ")}`).toEqual([]);
  });
});
