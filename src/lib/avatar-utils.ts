export const MAX_AVATAR_BYTES = 200 * 1024;

export const AVATAR_MIME_TO_EXT: Record<string, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isAvatarUrlExpired(url: string | null | undefined): boolean {
  if (!url) return true;

  try {
    const urlObj = new URL(url);
    const expiresParam = urlObj.searchParams.get("e");

    // Static public URLs, including Supabase Storage public assets, should be treated as non-expiring.
    if (!expiresParam) {
      return false;
    }

    const expiresAt = parseInt(expiresParam, 10);
    if (isNaN(expiresAt)) return false;

    return Math.floor(Date.now() / 1000) > expiresAt;
  } catch {
    return false;
  }
}
