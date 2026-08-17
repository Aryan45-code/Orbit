import {
  BookOpen, Trophy, Dumbbell, Code2, Home as HomeIcon,
  Plane, Gamepad2, Handshake, Music, ChefHat, Palette, Clapperboard,
  Library, Camera, PawPrint, HeartHandshake,
} from "lucide-react";

export const CATEGORIES = [
  { name: "Study", icon: BookOpen, color: "blue" },
  { name: "Sports", icon: Trophy, color: "emerald" },
  { name: "Fitness", icon: Dumbbell, color: "lime" },
  { name: "Coding & Projects", icon: Code2, color: "cyan" },
  { name: "Roommates", icon: HomeIcon, color: "amber" },
  { name: "Travel", icon: Plane, color: "sky" },
  { name: "Gaming", icon: Gamepad2, color: "pink" },
  { name: "Networking & Social", icon: Handshake, color: "orange" },
  { name: "Music", icon: Music, color: "rose" },
  { name: "Cooking", icon: ChefHat, color: "yellow" },
  { name: "Art & Design", icon: Palette, color: "red" },
  { name: "Movies & TV", icon: Clapperboard, color: "teal" },
  { name: "Books & Reading", icon: Library, color: "green" },
  { name: "Photography", icon: Camera, color: "slate" },
  { name: "Pets & Animals", icon: PawPrint, color: "stone" },
  { name: "Volunteering", icon: HeartHandshake, color: "neutral" },
];

// Category identity only. Full class strings so Tailwind can see them. No purple.
export const COLOR_MAP = {
  blue: { tint: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  emerald: { tint: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  lime: { tint: "bg-lime-50 dark:bg-lime-500/10", text: "text-lime-700 dark:text-lime-400" },
  cyan: { tint: "bg-cyan-50 dark:bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400" },
  amber: { tint: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  sky: { tint: "bg-sky-50 dark:bg-sky-500/10", text: "text-sky-600 dark:text-sky-400" },
  pink: { tint: "bg-pink-50 dark:bg-pink-500/10", text: "text-pink-600 dark:text-pink-400" },
  orange: { tint: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
  rose: { tint: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
  yellow: { tint: "bg-yellow-50 dark:bg-yellow-500/10", text: "text-yellow-700 dark:text-yellow-400" },
  red: { tint: "bg-red-50 dark:bg-red-500/10", text: "text-red-600 dark:text-red-400" },
  teal: { tint: "bg-teal-50 dark:bg-teal-500/10", text: "text-teal-600 dark:text-teal-400" },
  green: { tint: "bg-green-50 dark:bg-green-500/10", text: "text-green-600 dark:text-green-400" },
  slate: { tint: "bg-slate-100 dark:bg-slate-500/10", text: "text-slate-600 dark:text-slate-400" },
  stone: { tint: "bg-stone-100 dark:bg-stone-500/10", text: "text-stone-600 dark:text-stone-400" },
  neutral: { tint: "bg-neutral-100 dark:bg-neutral-500/10", text: "text-neutral-600 dark:text-neutral-400" },
};

export const REPORT_REASONS = [
  "Spam or scam",
  "Harassment or bullying",
  "Inappropriate content",
  "Fake community or impersonation",
  "Something else",
];

export const ONBOARDING_STEPS = ["contact", "profile"];
