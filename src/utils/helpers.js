let SEED_ID = 1;
export const nextId = () => String(SEED_ID++);

export const communityTags = (c) => (c.tags && c.tags.length ? c.tags : [c.category]);

export const interestMatchCount = (c, interests) =>
  interests && interests.length
    ? communityTags(c).filter((t) => interests.includes(t)).length
    : 0;

export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function handleFor(name, id) {
  return `${slugify(name)}-${id}`;
}

// Locali-Tea: every post self-destructs 48h after posting, comments included.
export const TEA_LIFESPAN_MS = 48 * 60 * 60 * 1000;

export function isTeaExpired(createdAt) {
  return Date.now() - createdAt >= TEA_LIFESPAN_MS;
}

export function teaTimeLeft(createdAt) {
  const msLeft = TEA_LIFESPAN_MS - (Date.now() - createdAt);
  if (msLeft <= 0) return "Expired";
  const h = Math.floor(msLeft / (60 * 60 * 1000));
  if (h >= 1) return `${h}h left`;
  const m = Math.max(1, Math.floor(msLeft / (60 * 1000)));
  return `${m}m left`;
}

export function compactCount(n) {
  const v = Number(n) || 0;
  if (v < 1000) return String(v);
  if (v < 10000) return `${(v / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  if (v < 1000000) return `${Math.round(v / 1000)}k`;
  return `${(v / 1000000).toFixed(1).replace(/\.0$/, "")}m`;
}

// Raw filenames break the resulting public storage URL.
export function safeFileName(name) {
  const raw = String(name || "file");
  const dot = raw.lastIndexOf(".");
  const stem = dot > 0 ? raw.slice(0, dot) : raw;
  const ext = dot > 0 ? raw.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const cleanStem = stem.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "file";
  return ext ? `${cleanStem}.${ext}` : cleanStem;
}
