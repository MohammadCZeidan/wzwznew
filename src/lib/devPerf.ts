const isDev = import.meta.env.DEV;
const activeRealtimeSubscriptions = new Map<string, number>();

export function markAppBootStart(): number {
  return isDev && typeof performance !== "undefined" ? performance.now() : 0;
}

export function logAppBoot(startTime: number): void {
  if (!isDev || !startTime || typeof performance === "undefined") return;
  requestAnimationFrame(() => {
    console.info("[perf] app boot", { ms: Math.round(performance.now() - startTime) });
  });
}

export function logRouteLoad(pathname: string, startTime: number): void {
  if (!isDev || !startTime || typeof performance === "undefined") return;
  requestAnimationFrame(() => {
    console.info("[perf] route load", {
      route: pathname,
      ms: Math.round(performance.now() - startTime),
    });
  });
}

export async function timeSupabaseQuery<T>(
  label: string,
  query: PromiseLike<T>,
  details: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  if (!isDev || typeof performance === "undefined") return query;
  const start = performance.now();
  try {
    const result = await query;
    console.info("[perf] supabase query", {
      label,
      ms: Math.round(performance.now() - start),
      ...details,
    });
    return result;
  } catch (error) {
    console.info("[perf] supabase query", {
      label,
      ms: Math.round(performance.now() - start),
      ok: false,
      ...details,
    });
    throw error;
  }
}

export function trackDevRealtimeSubscription(name: string): () => void {
  if (!isDev) return () => undefined;
  const count = (activeRealtimeSubscriptions.get(name) ?? 0) + 1;
  activeRealtimeSubscriptions.set(name, count);
  if (count > 1) {
    console.warn("[perf] duplicate realtime subscription", { channel: name, active: count });
  }
  return () => {
    const next = Math.max(0, (activeRealtimeSubscriptions.get(name) ?? 1) - 1);
    if (next === 0) {
      activeRealtimeSubscriptions.delete(name);
    } else {
      activeRealtimeSubscriptions.set(name, next);
    }
  };
}
