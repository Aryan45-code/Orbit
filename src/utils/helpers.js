// Core id generator — kept in one place since both seed data and
// runtime-created communities/posts/chats need a shared counter.
let SEED_ID = 1;
export const nextId = () => String(SEED_ID++);

export const NAME_POOL = [
  "Aarav", "Meher", "Priyanshu", "Simran", "Kabir", "Rehan", "Ishita", "Devika",
  "Yashwin", "Naina", "Aisha", "Rohan", "Tanvi", "Vihaan", "Ananya", "Kunal",
  "Diya", "Arjun", "Sneha", "Rudra", "Zara", "Krish", "Myra", "Advait",
];

export const MOCK_ORBIT_LEADERS = [
  { name: "Devika", score: 385 },
  { name: "Yashwin", score: 310 },
  { name: "Naina", score: 265 },
  { name: "Aarav", score: 230 },
  { name: "Meher", score: 195 },
  { name: "Priyanshu", score: 170 },
  { name: "Kabir", score: 140 },
  { name: "Simran", score: 118 },
  { name: "Rehan", score: 95 },
  { name: "Ishita", score: 60 },
];

export const communityTags = (c) => (c.tags && c.tags.length ? c.tags : [c.category]);

export const interestMatchCount = (c, interests) =>
  interests && interests.length ? communityTags(c).filter((t) => interests.includes(t)).length : 0;

export const distanceKm = (dx, dy) => Math.sqrt(dx * dx + dy * dy);

export const baseSparks = (c) => Math.max(2, Math.round(c.members * 0.55));

// Orbit — Orbit's community status system. Rewards building & showing up,
// not just being popular, so it stays healthy rather than a pure vanity metric.
export function computeOrbitScore({ joinedCount, createdCount, sparksGiven }) {
  return 40 + joinedCount * 15 + createdCount * 45 + sparksGiven * 3;
}

export function orbitTitle(score) {
  if (score >= 320) return "Community Legend";
  if (score >= 200) return "Rising Star";
  if (score >= 100) return "Connector";
  return "Newcomer";
}

export function communityTrendScore(c) {
  return c.members * 0.4 + baseSparks(c) * 2 - c.lastActive * 0.6;
}

export function buildOrbitLeaderboard(myScore, myName) {
  const list = [...MOCK_ORBIT_LEADERS, { name: myName || "You", score: myScore, isYou: true }];
  return list.sort((a, b) => b.score - a.score).map((p, i) => ({ ...p, rank: i + 1, total: list.length }));
}

export const timeAgo = (mins) => {
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export function genMembers(c) {
  const total = Math.max(1, c.members);
  const creatorName = c.creator === "You" ? "You" : NAME_POOL[c.id % NAME_POOL.length];
  const others = [];
  for (let i = 0; i < Math.min(total - 1, 24); i++) {
    const base = NAME_POOL[(c.id + i * 3) % NAME_POOL.length];
    others.push(i >= NAME_POOL.length ? `${base} ${i}` : base);
  }
  return { creatorName, others, total };
}
