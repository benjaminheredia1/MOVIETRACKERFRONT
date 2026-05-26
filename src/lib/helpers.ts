const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function getPosterUrl(path: string | null | undefined, size = "w500"): string {
  if (!path) return "/no-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null | undefined, size = "w1280"): string {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Resolve the best available image for a TMDB result.
 * Movies/TV use poster_path, persons use profile_path.
 */
export function getMediaImage(item: { poster_path?: string; profile_path?: string; backdrop_path?: string }, size = "w500"): string {
  const path = item.poster_path || item.profile_path || item.backdrop_path;
  if (!path) return "/no-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Resolve the display name for any TMDB result type.
 */
export function getMediaName(item: { name?: string; title?: string; original_name?: string }): string {
  return item.name || item.title || item.original_name || "Sin título";
}

/**
 * Resolve the media type label in Spanish.
 */
export function getMediaTypeLabel(mediaType: string): string {
  switch (mediaType) {
    case "tv": return "Serie";
    case "movie": return "Película";
    case "person": return "Persona";
    default: return "Película";
  }
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
