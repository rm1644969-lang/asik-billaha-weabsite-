/**
 * Extracts and normalizes any YouTube input (full <iframe> embed HTML,
 * youtube.com/watch?v=..., youtu.be/..., or direct /embed/... URL)
 * into a clean YouTube embed URL.
 */
export function normalizeYouTubeEmbedUrl(input?: string): string {
  const fallback = "https://www.youtube.com/embed/U2JBcFAO7mE?si=9Pxpka_XfFtBmDGF";
  if (!input || !input.trim()) return fallback;

  let raw = input.trim();

  // 1. If admin pasted a full <iframe ... src="..."> snippet, extract src
  const iframeSrcMatch = raw.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    raw = iframeSrcMatch[1].trim();
  }

  // 2. Already an embed URL
  if (raw.includes("youtube.com/embed/") || raw.includes("youtube-nocookie.com/embed/")) {
    return raw;
  }

  // 3. Standard watch?v=VIDEO_ID
  const watchMatch = raw.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // 4. Short youtu.be/VIDEO_ID
  const shortMatch = raw.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  // 5. Shorts youtube.com/shorts/VIDEO_ID
  const shortsMatch = raw.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  return raw;
}
