const SAFE_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "img.vietqr.io",
  "example.com",
  "localhost",
  "127.0.0.1",
]);

export const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1700&q=80";

export function toSafeImageUrl(source: string | null | undefined, fallback = DEFAULT_FALLBACK_IMAGE): string {
  if (!source) {
    return fallback;
  }

  const trimmed = source.trim();
  if (!trimmed) {
    return fallback;
  }

  try {
    const url = new URL(trimmed);
    if ((url.protocol === "http:" || url.protocol === "https:") && SAFE_IMAGE_HOSTS.has(url.hostname)) {
      return trimmed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}