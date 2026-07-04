// Prices match the request tiers in tokenRequests.REQUEST_PACKAGES ($5–$100),
// so a package card pre-selects the same tier in the Request Tokens modal.
export const PACKAGES = [
  { id: "tokens-50", tokens: 50, price: 5, label: "Starter", highlight: false, accent: "from-sky-500/20 via-blue-500/10 to-transparent", perToken: "10c / token" },
  { id: "tokens-100", tokens: 100, price: 10, label: "Basic", highlight: false, accent: "from-violet-500/20 via-fuchsia-500/10 to-transparent", perToken: "10c / token" },
  { id: "tokens-200", tokens: 200, price: 20, label: "Popular", highlight: false, accent: "from-raw-gold/25 via-amber-500/10 to-transparent", perToken: "10c / token" },
  { id: "tokens-500", tokens: 500, price: 50, label: "Best Value", highlight: true, accent: "from-emerald-500/20 via-teal-500/10 to-transparent", perToken: "10c / token" },
  { id: "tokens-1000", tokens: 1000, price: 100, label: "Power User", highlight: false, accent: "from-rose-500/20 via-pink-500/10 to-transparent", perToken: "10c / token" },
] as const;
