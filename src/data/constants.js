import {
  BookOpen, Trophy, Dumbbell, Code2, Home as HomeIcon,
  Plane, Gamepad2, Handshake, Music, ChefHat, Palette, Clapperboard,
  Library, Camera, PawPrint, HeartHandshake,
} from "lucide-react";
import { nextId } from "../utils/helpers.js";

export const CATEGORIES = [
  { name: "Study", icon: BookOpen, color: "indigo" },
  { name: "Sports", icon: Trophy, color: "rose" },
  { name: "Fitness", icon: Dumbbell, color: "emerald" },
  { name: "Coding & Projects", icon: Code2, color: "violet" },
  { name: "Roommates", icon: HomeIcon, color: "amber" },
  { name: "Travel", icon: Plane, color: "sky" },
  { name: "Gaming", icon: Gamepad2, color: "fuchsia" },
  { name: "Networking & Social", icon: Handshake, color: "orange" },
  { name: "Music", icon: Music, color: "pink" },
  { name: "Cooking", icon: ChefHat, color: "yellow" },
  { name: "Art & Design", icon: Palette, color: "purple" },
  { name: "Movies & TV", icon: Clapperboard, color: "red" },
  { name: "Books & Reading", icon: Library, color: "teal" },
  { name: "Photography", icon: Camera, color: "cyan" },
  { name: "Pets & Animals", icon: PawPrint, color: "lime" },
  { name: "Volunteering", icon: HeartHandshake, color: "stone" },
];

// Dark-surface tint system: full-saturation "grad" reserved for banners/rings only.
// Everything else stays low-opacity tints on a near-black base — color highlights
// specific things (live status, category, brand), it never becomes the chrome.
export const COLOR_MAP = {
  indigo: { tint: "bg-indigo-500/10", text: "text-indigo-300", ringc: "ring-indigo-400/30", grad: "from-indigo-500 to-violet-600" },
  rose: { tint: "bg-rose-500/10", text: "text-rose-300", ringc: "ring-rose-400/30", grad: "from-rose-500 to-pink-600" },
  emerald: { tint: "bg-emerald-500/10", text: "text-emerald-300", ringc: "ring-emerald-400/30", grad: "from-emerald-500 to-teal-600" },
  violet: { tint: "bg-violet-500/10", text: "text-violet-300", ringc: "ring-violet-400/30", grad: "from-violet-500 to-purple-600" },
  amber: { tint: "bg-amber-500/10", text: "text-amber-300", ringc: "ring-amber-400/30", grad: "from-amber-500 to-orange-600" },
  sky: { tint: "bg-sky-500/10", text: "text-sky-300", ringc: "ring-sky-400/30", grad: "from-sky-500 to-violet-600" },
  fuchsia: { tint: "bg-fuchsia-500/10", text: "text-fuchsia-300", ringc: "ring-fuchsia-400/30", grad: "from-fuchsia-500 to-pink-600" },
  orange: { tint: "bg-orange-500/10", text: "text-orange-300", ringc: "ring-orange-400/30", grad: "from-orange-500 to-red-600" },
  pink: { tint: "bg-pink-500/10", text: "text-pink-300", ringc: "ring-pink-400/30", grad: "from-pink-500 to-rose-600" },
  yellow: { tint: "bg-yellow-500/10", text: "text-yellow-300", ringc: "ring-yellow-400/30", grad: "from-yellow-500 to-amber-600" },
  purple: { tint: "bg-purple-500/10", text: "text-purple-300", ringc: "ring-purple-400/30", grad: "from-purple-500 to-violet-600" },
  red: { tint: "bg-red-500/10", text: "text-red-300", ringc: "ring-red-400/30", grad: "from-red-500 to-rose-600" },
  teal: { tint: "bg-teal-500/10", text: "text-teal-300", ringc: "ring-teal-400/30", grad: "from-teal-500 to-emerald-600" },
  cyan: { tint: "bg-cyan-500/10", text: "text-cyan-300", ringc: "ring-cyan-400/30", grad: "from-cyan-500 to-sky-600" },
  lime: { tint: "bg-lime-500/10", text: "text-lime-300", ringc: "ring-lime-400/30", grad: "from-lime-500 to-emerald-600" },
  stone: { tint: "bg-stone-500/10", text: "text-stone-300", ringc: "ring-stone-400/30", grad: "from-stone-500 to-zinc-600" },
};

export const SEED_COMMUNITIES = [
  { name: "DSA Grinders — 6AM Batch", category: "Study", tags: ["Study", "Coding & Projects"], desc: "Daily LeetCode + GFG problems before 8AM lectures. No excuses, no snoozing.", dx: 0.3, dy: -0.4, members: 42, lastActive: 4 },
  { name: "Sem 3 Notes Exchange", category: "Study", tags: ["Study"], desc: "Scanned notes, previous year papers, and last-minute doubt-clearing before exams.", dx: -0.8, dy: 0.2, members: 118, lastActive: 22 },
  { name: "Library 2nd Floor Regulars", category: "Study", tags: ["Study"], desc: "Quiet study squad that camps the window seats every evening.", dx: 0.1, dy: 0.1, members: 9, lastActive: 2 },
  { name: "Sunday Football League", category: "Sports", tags: ["Sports", "Networking & Social"], desc: "5-a-side on the back ground, every Sunday 6PM. Bring your own jersey.", dx: 1.2, dy: 0.6, members: 63, lastActive: 15 },
  { name: "Badminton Court Bookings", category: "Sports", tags: ["Sports"], desc: "Coordinate slots for the indoor court so we stop double-booking.", dx: -0.5, dy: -1.1, members: 31, lastActive: 40 },
  { name: "Cricket Nets Practice", category: "Sports", tags: ["Sports"], desc: "Evening net practice, all skill levels, extra kit available.", dx: 2.1, dy: -0.3, members: 27, lastActive: 95 },
  { name: "5AM Running Club", category: "Fitness", tags: ["Fitness"], desc: "Morning loop before the sun's up. Slow runners very welcome.", dx: 0.4, dy: 0.5, members: 21, lastActive: 8 },
  { name: "Hostel Gym Buddies", category: "Fitness", tags: ["Fitness"], desc: "Spotting partners and split routines for the hostel gym.", dx: -0.2, dy: 0.8, members: 34, lastActive: 30 },
  { name: "Yoga on the Lawn", category: "Fitness", tags: ["Fitness"], desc: "Sunset yoga sessions, mats shared, all levels.", dx: 3.4, dy: 1.2, members: 12, lastActive: 210 },
  { name: "Open Source Saturdays", category: "Coding & Projects", tags: ["Coding & Projects"], desc: "Weekly hack session — pick an issue, pair up, ship a PR.", dx: 0.6, dy: -0.2, members: 47, lastActive: 6 },
  { name: "CTF Practice Squad", category: "Coding & Projects", tags: ["Coding & Projects"], desc: "Weekend CTFs, writeups, and forensics challenge breakdowns.", dx: -0.3, dy: -0.6, members: 19, lastActive: 12 },
  { name: "Local App Builders", category: "Coding & Projects", tags: ["Coding & Projects", "Networking & Social"], desc: "People building real products together — demo day every month.", dx: 0.9, dy: 0.3, members: 25, lastActive: 3 },
  { name: "2BHK Near Gate 3", category: "Roommates", tags: ["Roommates"], desc: "Looking for one more roommate for next semester, rent split 3 ways.", dx: 1.6, dy: -0.8, members: 4, lastActive: 55 },
  { name: "PG Shifting Help", category: "Roommates", tags: ["Roommates"], desc: "Coordinate shifting, shared autos, and furniture hand-me-downs.", dx: -1.1, dy: 0.4, members: 16, lastActive: 140 },
  { name: "Weekend Hill Station Trips", category: "Travel", tags: ["Travel", "Networking & Social"], desc: "Planning short 2-day trips, splitting cabs and stays.", dx: 2.8, dy: -1.4, members: 38, lastActive: 70 },
  { name: "Backpacking on a Budget", category: "Travel", tags: ["Travel"], desc: "Tips, group bookings and cheap hostel finds for the next long weekend.", dx: -2.2, dy: 0.9, members: 22, lastActive: 300 },
  { name: "Valorant Ranked Squad", category: "Gaming", tags: ["Gaming"], desc: "Looking for a 5-stack, Diamond+ preferred but not required.", dx: 0.2, dy: -0.9, members: 29, lastActive: 5 },
  { name: "Board Game Nights", category: "Gaming", tags: ["Gaming", "Networking & Social"], desc: "Catan, Codenames, and chai every Friday in the common room.", dx: -0.6, dy: -0.3, members: 33, lastActive: 18 },
  { name: "Newcomers Meetup Circle", category: "Networking & Social", tags: ["Networking & Social"], desc: "Casual hangouts for anyone new around here to make friends.", dx: 0.7, dy: 0.7, members: 51, lastActive: 9 },
  { name: "Local Founders Circle", category: "Networking & Social", tags: ["Networking & Social", "Coding & Projects"], desc: "Peer support for people building something on the side.", dx: -0.4, dy: -0.1, members: 14, lastActive: 26 },
  { name: "Sunday Jam Session", category: "Music", tags: ["Music"], desc: "Bring an instrument or just your voice — open jam every Sunday evening.", dx: 0.5, dy: -0.5, members: 24, lastActive: 11 },
  { name: "Vinyl & Coffee Club", category: "Music", tags: ["Music", "Networking & Social"], desc: "Record swaps, playlist swaps, and way too much coffee.", dx: -0.9, dy: 0.3, members: 17, lastActive: 45 },
  { name: "Weeknight Dinner Club", category: "Cooking", tags: ["Cooking"], desc: "Rotating potluck — someone hosts, everyone brings a dish.", dx: 0.8, dy: 0.4, members: 36, lastActive: 7 },
  { name: "Sourdough Starters Anonymous", category: "Cooking", tags: ["Cooking"], desc: "Sharing starters, troubleshooting crumb, and swapping loaves.", dx: -1.4, dy: -0.7, members: 13, lastActive: 60 },
  { name: "Sketchbook Sundays", category: "Art & Design", tags: ["Art & Design"], desc: "Bring a sketchbook, sit, draw together, no pressure.", dx: 0.3, dy: 0.9, members: 20, lastActive: 14 },
  { name: "Street Art & Murals Walk", category: "Art & Design", tags: ["Art & Design", "Travel"], desc: "Monthly walking tour of the best murals around town.", dx: -0.6, dy: 1.1, members: 15, lastActive: 88 },
  { name: "Friday Movie Nights", category: "Movies & TV", tags: ["Movies & TV"], desc: "Cult classics, one pick each week, popcorn provided.", dx: 0.4, dy: -0.2, members: 41, lastActive: 5 },
  { name: "Watch Party — New Releases", category: "Movies & TV", tags: ["Movies & TV", "Networking & Social"], desc: "Coordinating group watch parties for the latest drops.", dx: -0.2, dy: -1.0, members: 28, lastActive: 20 },
  { name: "Monthly Book Club", category: "Books & Reading", tags: ["Books & Reading"], desc: "One book a month, one evening of discussion and snacks.", dx: 1.0, dy: 0.2, members: 32, lastActive: 30 },
  { name: "Secondhand Bookswap", category: "Books & Reading", tags: ["Books & Reading"], desc: "Bring a book, take a book — no money involved.", dx: -0.7, dy: 0.6, members: 19, lastActive: 100 },
  { name: "Golden Hour Photo Walks", category: "Photography", tags: ["Photography"], desc: "Weekly walk chasing the best light, all skill levels welcome.", dx: 0.6, dy: -0.6, members: 26, lastActive: 9 },
  { name: "Street Photography Crew", category: "Photography", tags: ["Photography", "Art & Design"], desc: "Candid, unposed, real life — feedback swaps every weekend.", dx: -1.0, dy: -0.4, members: 18, lastActive: 35 },
  { name: "Dog Park Regulars", category: "Pets & Animals", tags: ["Pets & Animals"], desc: "Coordinating meetup times at the park so the dogs have friends too.", dx: 0.2, dy: 0.7, members: 30, lastActive: 6 },
  { name: "Foster & Rescue Network", category: "Pets & Animals", tags: ["Pets & Animals", "Networking & Social"], desc: "Connecting fosters, adopters, and vet recommendations nearby.", dx: -0.5, dy: -0.8, members: 12, lastActive: 50 },
  { name: "Weekend Cleanup Crew", category: "Volunteering", tags: ["Volunteering"], desc: "Park and beach cleanups, gloves and bags provided.", dx: 0.9, dy: -0.3, members: 22, lastActive: 16 },
  { name: "Tutoring for Local Kids", category: "Volunteering", tags: ["Volunteering", "Study"], desc: "A couple hours a week helping neighborhood kids with homework.", dx: -0.3, dy: 0.5, members: 16, lastActive: 40 },
].map((c) => ({ ...c, id: nextId(), creator: "Seed", official: false }));

// Official college clubs — institutional, not student-started. Kept as a
// separate array from SEED_COMMUNITIES so Explore can list them under their
// own "Clubs" sub-tab, but they share the same shape (name/category/desc/
// members) so CommunityDetail can render either without a fork in the code.
export const CLUBS = [
  { name: "Manipal Coding Club", category: "Coding & Projects", tags: ["Coding & Projects"], desc: "Official competitive programming and dev club — weekly contests, workshops, and hiring drives.", members: 340, lastActive: 3 },
  { name: "Robotics & Automation Society", category: "Coding & Projects", tags: ["Coding & Projects"], desc: "Builds bots for inter-college competitions; open to all years.", members: 145, lastActive: 20 },
  { name: "Manipal Sports Council", category: "Sports", tags: ["Sports"], desc: "Governs all inter-branch and inter-college sporting fixtures on campus.", members: 520, lastActive: 5 },
  { name: "Fitness & Wellness Club", category: "Fitness", tags: ["Fitness"], desc: "Official gym batches, nutrition talks, and campus fitness challenges.", members: 210, lastActive: 12 },
  { name: "E-Cell Manipal Jaipur", category: "Networking & Social", tags: ["Networking & Social", "Coding & Projects"], desc: "Entrepreneurship cell — pitch nights, founder talks, incubation support.", members: 275, lastActive: 8 },
  { name: "Music Society", category: "Music", tags: ["Music"], desc: "Official band, auditions every semester, performs at all campus fests.", members: 98, lastActive: 15 },
  { name: "Dramatics & Theatre Club", category: "Art & Design", tags: ["Art & Design"], desc: "Stage productions, street plays, and annual theatre fest.", members: 87, lastActive: 30 },
  { name: "Photography Club", category: "Photography", tags: ["Photography"], desc: "Official campus photography — covers every fest, sport day, and convocation.", members: 156, lastActive: 6 },
  { name: "Literary & Debating Society", category: "Books & Reading", tags: ["Books & Reading", "Networking & Social"], desc: "Debates, MUNs, and creative writing circles.", members: 112, lastActive: 25 },
  { name: "NSS Manipal Jaipur", category: "Volunteering", tags: ["Volunteering"], desc: "National Service Scheme unit — official volunteering and outreach drives.", members: 260, lastActive: 18 },
].map((c) => ({ ...c, id: nextId(), creator: "College", official: true }));

export const MOCK_EVENTS = [
  { title: "Inter-branch Football Final", when: "Tomorrow, 5:00 PM", where: "Back Ground", category: "Sports", tags: ["Sports"], capacity: 200, desc: "The final showdown of this semester's inter-branch league. Come cheer or come play." },
  { title: "Open Mic Night", when: "Fri, 8:00 PM", where: "Amphitheatre", category: "Music", tags: ["Music", "Art & Design"], capacity: 150, desc: "Sign up to perform or just show up and listen — poetry, music, comedy, all welcome." },
  { title: "Hackathon Kickoff", when: "Sat, 10:00 AM", where: "CS Block Lab 2", category: "Coding & Projects", tags: ["Coding & Projects"], capacity: 120, desc: "24-hour build sprint, teams of up to 4, prizes for top 3 projects." },
  { title: "Career Fair — Cyber & Cloud", when: "Mon, 11:00 AM", where: "Convention Centre", category: "Coding & Projects", tags: ["Coding & Projects", "Networking & Social"], capacity: 400, desc: "Recruiters from cybersecurity and cloud companies — bring your resume." },
].map((e) => ({ ...e, id: nextId() }));

export const MOCK_INCOMING_REQUESTS = [
  { id: "r1", name: "Ananya", context: "wants to chat about Open Source Saturdays" },
  { id: "r2", name: "Rehan", context: "wants to chat about DSA Grinders — 6AM Batch" },
];

export const MOCK_OUTGOING_REQUESTS = [
  { id: "o1", name: "Kabir", context: "re: Cricket Nets Practice", status: "pending" },
  { id: "o2", name: "Simran", context: "re: Weekend Hill Station Trips", status: "pending" },
];

export const MOCK_NOTIFICATIONS = [
  { id: "n1", text: "3 new members joined Open Source Saturdays", time: "6m ago", unread: true },
  { id: "n2", text: "Ananya wants to start a chat with you", time: "12m ago", unread: true },
  { id: "n3", text: "Your report on a Roommates post was reviewed", time: "2h ago", unread: false },
  { id: "n4", text: "DSA Grinders — 6AM Batch is active right now", time: "4h ago", unread: false },
];

export const MOCK_INDIVIDUAL_CHATS = [
  { id: "i1", name: "Meher", lastMsg: "See you at the library later!", time: "10m ago", unread: true },
  { id: "i2", name: "Aarav", lastMsg: "Thanks for the notes 🙌", time: "2h ago", unread: false },
  { id: "i3", name: "Priyanshu", lastMsg: "Let's play this weekend", time: "1d ago", unread: false },
];

export const MOCK_SUGGESTED_PEOPLE = [
  { id: "p1", name: "Kabir", context: "Also in Cricket Nets Practice" },
  { id: "p2", name: "Simran", context: "Also in Weekend Hill Station Trips" },
  { id: "p3", name: "Rehan", context: "Also in DSA Grinders — 6AM Batch" },
  { id: "p4", name: "Ishita", context: "Also in Board Game Nights" },
];

export const MOCK_ADS = [
  { id: "ad1", title: "Neighborhood Book Fair — 20% off this week", subtitle: "This weekend, Convention Centre", cta: "View details", color: "amber" },
  { id: "ad2", title: "Late-night chai & Maggi combo", subtitle: "Canteen 2, open till 1AM during exams", cta: "See offer", color: "orange" },
];

export const MOCK_SIMILAR_PEOPLE = [
  { id: "s1", name: "Devika", shared: ["Study", "Coding & Projects"] },
  { id: "s2", name: "Yashwin", shared: ["Sports", "Fitness"] },
  { id: "s3", name: "Naina", shared: ["Travel", "Networking & Social"] },
];

// Locali-Tea: anonymous, ephemeral (48h) posts + discussion. createdAt is
// computed relative to "now" so the seed data always looks fresh regardless
// of when the app is opened.
export const MOCK_TEA = [
  { text: "Heard the CS block canteen is getting a new vendor next month — apparently way better than the current one.", hoursAgo: 2, trueCount: 14, capCount: 2, comments: [
    { who: "Anonymous", text: "Please let this be true, current food is rough", time: "1h ago" },
    { who: "Anonymous", text: "Can confirm, saw the renovation notice on the board", time: "40m ago" },
  ] },
  { text: "A certain professor in the E&C dept gives bonus marks if you catch his coding mistakes on the board 👀", hoursAgo: 6, trueCount: 31, capCount: 5, comments: [
    { who: "Anonymous", text: "Tried this last week, got +2 lol", time: "3h ago" },
  ] },
  { text: "Rumor is the fest dates got pushed by a week because of exam clashes.", hoursAgo: 20, trueCount: 9, capCount: 11, comments: [] },
  { text: "Someone said the gym is finally getting new equipment after 2 years of complaints.", hoursAgo: 30, trueCount: 22, capCount: 3, comments: [
    { who: "Anonymous", text: "Saw boxes being unloaded near the sports complex yesterday", time: "10h ago" },
  ] },
].map((t) => ({ ...t, id: nextId(), createdAt: Date.now() - t.hoursAgo * 60 * 60 * 1000 }));

export const REPORT_REASONS = ["Spam or scam", "Harassment or bullying", "Inappropriate content", "Fake community or impersonation", "Something else"];

export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@500;600&display=swap'); .no-scrollbar{scrollbar-width:none;-ms-overflow-style:none;} .no-scrollbar::-webkit-scrollbar{display:none;width:0;height:0} .mono{font-family:'JetBrains Mono',monospace;}`;

export const ONBOARDING_STEPS = ["contact", "otp", "profile"];
