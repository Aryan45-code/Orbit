
// Preview-mode sample data. Only loads when no Supabase credentials are present.
const HOUR = 60 * 60 * 1000;

let seq = 0;
const id = (prefix) => `${prefix}-${++seq}`;

export const DEMO_USER = {
  id: "demo-user",
  name: "Aarav",
  bio: "3rd year CSE. Chasing deadlines and decent filter coffee.",
  verified: true,
  interests: ["Coding & Projects", "Study", "Music"],
};

const community = (name, category, desc, members, extra = {}) => ({
  id: id("c"),
  name,
  category,
  tags: [category],
  desc,
  members,
  creatorId: extra.mine ? DEMO_USER.id : `someone-${name.length}`,
  official: !!extra.official,
  handle: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  avatarUrl: null,
});

export const DEMO_CLUBS = [
  community("Manipal Coding Club", "Coding & Projects", "Official competitive programming and dev club — weekly contests, workshops and hiring drives.", 340, { official: true }),
  community("Robotics & Automation Society", "Coding & Projects", "Builds bots for inter-college competitions. Open to all years.", 145, { official: true }),
  community("Manipal Sports Council", "Sports", "Governs every inter-branch and inter-college fixture on campus.", 520, { official: true }),
  community("E-Cell Manipal Jaipur", "Networking & Social", "Entrepreneurship cell — pitch nights, founder talks, incubation support.", 275, { official: true }),
  community("Music Society", "Music", "Official band. Auditions every semester, performs at all campus fests.", 98, { official: true }),
  community("Photography Club", "Photography", "Covers every fest, sports day and convocation on campus.", 156, { official: true }),
  community("Literary & Debating Society", "Books & Reading", "Debates, MUNs and creative writing circles.", 112, { official: true }),
  community("NSS Manipal Jaipur", "Volunteering", "National Service Scheme unit — outreach and volunteering drives.", 260, { official: true }),
];

export const DEMO_COMMUNITIES = [
  community("DSA Grinders — 6AM Batch", "Study", "Daily LeetCode before 8AM lectures. No excuses, no snoozing.", 42, { mine: true }),
  community("Sem 3 Notes Exchange", "Study", "Scanned notes, previous year papers and last-minute doubt clearing.", 118),
  community("Library 2nd Floor Regulars", "Study", "Quiet study squad that camps the window seats every evening.", 9),
  community("Sunday Football League", "Sports", "5-a-side on the back ground, every Sunday 6PM. Bring your own jersey.", 63),
  community("Badminton Court Bookings", "Sports", "Coordinate slots for the indoor court so we stop double-booking.", 31),
  community("5AM Running Club", "Fitness", "Morning loop before the sun's up. Slow runners very welcome.", 21),
  community("Hostel Gym Buddies", "Fitness", "Spotting partners and split routines for the hostel gym.", 34),
  community("Open Source Saturdays", "Coding & Projects", "Weekly hack session — pick an issue, pair up, ship a PR.", 47),
  community("CTF Practice Squad", "Coding & Projects", "Weekend CTFs, writeups and forensics challenge breakdowns.", 19),
  community("Valorant Ranked Squad", "Gaming", "Looking for a 5-stack. Diamond+ preferred but not required.", 29),
  community("Board Game Nights", "Gaming", "Catan, Codenames and chai every Friday in the common room.", 33),
  community("Sunday Jam Session", "Music", "Bring an instrument or just your voice. Open jam every Sunday.", 24, { mine: true }),
  community("Weeknight Dinner Club", "Cooking", "Rotating potluck — someone hosts, everyone brings a dish.", 36),
  community("Sketchbook Sundays", "Art & Design", "Bring a sketchbook, sit, draw together. No pressure.", 20),
  community("Friday Movie Nights", "Movies & TV", "Cult classics, one pick each week, popcorn provided.", 41),
  community("Golden Hour Photo Walks", "Photography", "Weekly walk chasing the best light. All skill levels welcome.", 26),
  community("Monthly Book Club", "Books & Reading", "One book a month, one evening of discussion and snacks.", 32),
  community("Weekend Cleanup Crew", "Volunteering", "Campus and lake cleanups. Gloves and bags provided.", 22),
];

export const DEMO_ALL_GROUPS = [...DEMO_CLUBS, ...DEMO_COMMUNITIES];

export const DEMO_JOINED_IDS = [
  DEMO_COMMUNITIES[0].id,
  DEMO_COMMUNITIES[7].id,
  DEMO_COMMUNITIES[11].id,
  DEMO_CLUBS[0].id,
];

export const DEMO_EVENTS = [
  { id: id("e"), title: "Inter-branch Football Final", category: "Sports", tags: ["Sports"], desc: "The final showdown of this semester's inter-branch league. Come cheer or come play.", when: "Tomorrow, 5:00 PM", where: "Back Ground", capacity: 200, linkedCommunityId: null },
  { id: id("e"), title: "Hackathon Kickoff", category: "Coding & Projects", tags: ["Coding & Projects"], desc: "24-hour build sprint, teams of up to 4, prizes for the top 3 projects.", when: "Sat, 10:00 AM", where: "CS Block Lab 2", capacity: 120, linkedCommunityId: null },
  { id: id("e"), title: "Open Mic Night", category: "Music", tags: ["Music"], desc: "Sign up to perform or just show up and listen — poetry, music, comedy, all welcome.", when: "Fri, 8:00 PM", where: "Amphitheatre", capacity: 150, linkedCommunityId: null },
  { id: id("e"), title: "Career Fair — Cyber & Cloud", category: "Networking & Social", tags: ["Networking & Social"], desc: "Recruiters from cybersecurity and cloud companies. Bring your resume.", when: "Mon, 11:00 AM", where: "Convention Centre", capacity: 400, linkedCommunityId: null },
];

export const DEMO_TEA = [
  { id: id("t"), category: "tea", text: "Heard the CS block canteen is getting a new vendor next month — apparently way better than the current one.", trueCount: 14, capCount: 2, reactions: {}, commentCount: 2, createdAt: Date.now() - 2 * HOUR,
    comments: [
      { id: id("tc"), who: "Anonymous", text: "Please let this be true, current food is rough", time: "" },
      { id: id("tc"), who: "Anonymous", text: "Can confirm, saw the renovation notice on the board", time: "" },
    ] },
  { id: id("t"), category: "tea", text: "A certain professor in the E&C dept gives bonus marks if you catch his coding mistakes on the board.", trueCount: 31, capCount: 5, reactions: {}, commentCount: 1, createdAt: Date.now() - 6 * HOUR,
    comments: [{ id: id("tc"), who: "Anonymous", text: "Tried this last week, got +2", time: "" }] },
  { id: id("t"), category: "tea", text: "Rumour is the fest dates got pushed by a week because of exam clashes.", trueCount: 0, capCount: 0, reactions: {}, commentCount: 0, createdAt: Date.now() - 20 * HOUR, comments: [] },
  { id: id("t"), category: "confession", text: "I've been pretending to understand pointers for two entire semesters and it is far too late to ask now.", trueCount: 0, capCount: 0, reactions: { "😂": 23, "❤️": 4 }, commentCount: 1, createdAt: Date.now() - 4 * HOUR,
    comments: [{ id: id("tc"), who: "Anonymous", text: "you and the entire batch honestly", time: "" }] },
  { id: id("t"), category: "confession", text: "Genuinely only joined three clubs for the certificates and I feel bad about it every single day.", trueCount: 0, capCount: 0, reactions: { "😮": 7, "🔥": 2 }, commentCount: 0, createdAt: Date.now() - 30 * HOUR, comments: [] },
];

const NAMES = ["Meher", "Priyanshu", "Simran", "Kabir", "Rehan", "Ishita", "Devika", "Naina", "Rohan", "Tanvi", "Ananya", "Kunal"];

function pick(seed, n) {
  return Array.from({ length: n }, (_, i) => NAMES[(seed + i * 3) % NAMES.length]);
}

const seedOf = (communityId) =>
  communityId.split("").reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 0) >>> 0;

export function demoMembersFor(communityId, memberCount) {
  const seed = seedOf(communityId);
  const shown = Math.min(memberCount, 8);
  return [
    { userId: DEMO_USER.id, name: DEMO_USER.name, interests: DEMO_USER.interests, joinedAt: new Date(Date.now() - 9 * HOUR).toISOString() },
    ...pick(seed, shown).map((name, i) => ({
      userId: `${communityId}-m${i}`,
      name,
      interests: i % 3 === 0 ? ["Coding & Projects"] : i % 3 === 1 ? ["Music"] : ["Sports"],
      joinedAt: new Date(Date.now() - (i + 1) * 11 * HOUR).toISOString(),
    })),
  ];
}

export function demoPostsFor(communityId) {
  const seed = seedOf(communityId);
  const [a, b, c] = pick(seed, 3);
  return [
    { id: `${communityId}-p1`, who: a, authorId: `${communityId}-m0`, text: "Anyone up for a session tomorrow evening? Booking the room at 6.", time: "2h ago", imageUrl: null, sparks: 7, pinned: true },
    { id: `${communityId}-p2`, who: b, authorId: `${communityId}-m1`, text: "Shared the notes from last week in the drive folder, link's in the chat.", time: "5h ago", imageUrl: null, sparks: 12, pinned: false },
    { id: `${communityId}-p3`, who: c, authorId: `${communityId}-m2`, text: "Turnout was great yesterday. Same time next week?", time: "1d ago", imageUrl: null, sparks: 3, pinned: false },
  ];
}

export function demoMessagesFor(communityId) {
  const seed = seedOf(communityId);
  const [a, b] = pick(seed, 2);
  return [
    { id: `${communityId}-m1`, who: a, authorId: `${communityId}-m0`, text: "morning everyone", time: "3h ago", imageUrl: null, pinned: false },
    { id: `${communityId}-m2`, who: b, authorId: `${communityId}-m1`, text: "is the room booked for tomorrow?", time: "3h ago", imageUrl: null, pinned: false },
    { id: `${communityId}-m3`, who: a, authorId: `${communityId}-m0`, text: "yes, 6pm, second floor", time: "2h ago", imageUrl: null, pinned: true },
    { id: `${communityId}-m4`, who: DEMO_USER.name, authorId: DEMO_USER.id, text: "perfect, see you all there", time: "1h ago", imageUrl: null, pinned: false },
  ];
}
