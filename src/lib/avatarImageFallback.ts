export function pngFallbackForAvatarWebp(src: string | undefined): string | null {
  const match = src?.match(/^\/avatars\/(\d+)\.webp$/);
  return match ? `/avatars/${match[1]}.png` : null;
}

export function tryAvatarPngFallback(img: HTMLImageElement, src: string | undefined): boolean {
  const fallback = pngFallbackForAvatarWebp(src);
  if (!fallback || img.src === new URL(fallback, window.location.origin).href) return false;
  img.src = fallback;
  return true;
}
