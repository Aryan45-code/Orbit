import { useState, useMemo } from "react";
import {
  BadgeCheck, Settings, LogOut, LogIn, ShieldCheck, Grid3x3, LayoutGrid,
} from "lucide-react";
import { CATEGORIES, COLOR_MAP, MOCK_SIMILAR_PEOPLE } from "../data/constants.js";
import { useClickOutside } from "../utils/hooks.js";
import { OrbitWatermark, Avatar } from "./Common.jsx";
import { OrbitHero } from "./Home.jsx";

export function ProfileScreen({ user, joinedCommunities, onEditName, onVerifyGuest, onLogout, orbitScore, rankInfo, onViewLeaderboard }) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(user.name);
  const [bio, setBio] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [gridTab, setGridTab] = useState("joined");
  const [menuOpen, setMenuOpen] = useState(false);
  const createdCommunities = joinedCommunities.filter((c) => c.creator === "You");
  const shown = gridTab === "joined" ? joinedCommunities : createdCommunities;
  const interests = user.interests || [];
  const similarPeople = useMemo(() => (
    MOCK_SIMILAR_PEOPLE
      .map((p) => ({ ...p, overlap: p.shared.filter((s) => interests.includes(s)) }))
      .filter((p) => p.overlap.length > 0)
      .sort((a, b) => b.overlap.length - a.overlap.length)
  ), [interests]);
  const settingsMenuRef = useClickOutside(menuOpen, () => setMenuOpen(false));
  return (
    <div className="relative flex-1 overflow-y-auto no-scrollbar pb-6">
      <OrbitWatermark />
      <div className="relative z-10">
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-1.5">
          <p className="font-bold text-zinc-50 text-base">{user.name}</p>
          {user.verified && <BadgeCheck size={15} className="text-blue-400" />}
        </div>
        <div ref={settingsMenuRef} className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-900">
            <Settings size={19} className="text-zinc-300" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-44 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl shadow-black/50 z-40 overflow-hidden">
              <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"><Settings size={15} className="text-zinc-500" />App preferences</button>
              {user.verified ? (
                <button onClick={() => { setMenuOpen(false); onLogout(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-rose-400 hover:bg-zinc-800"><LogOut size={15} />Log out</button>
              ) : (
                <button onClick={() => { setMenuOpen(false); onLogout(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-blue-400 hover:bg-zinc-800"><LogIn size={15} />Log in</button>
              )}
            </div>
          )}
        </div>
      </div>
      <OrbitHero score={orbitScore} rankInfo={rankInfo} onViewLeaderboard={onViewLeaderboard} />
      <div className="flex items-center gap-6 px-5 pt-4">
        <Avatar label={user.name[0]} size={76} ring={user.verified} />
        <div className="flex-1 grid grid-cols-3 gap-1 text-center">
          <div>
            <p className="text-base font-bold text-zinc-50 mono">{joinedCommunities.length}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Joined</p>
          </div>
          <div>
            <p className="text-base font-bold text-zinc-50 mono">{createdCommunities.length}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Created</p>
          </div>
          <div>
            <p className="text-base font-bold text-zinc-50 mono">{interests.length}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Interests</p>
          </div>
        </div>
      </div>
      <div className="px-5 pt-3.5">
        {editing ? (
          <div className="space-y-2 mb-3">
            <input value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="Your name" className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            <textarea value={draftBio} onChange={(e) => setDraftBio(e.target.value)} placeholder="Short bio — what are you looking for nearby?" rows={2} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            <button onClick={() => { onEditName(draftName); setBio(draftBio); setEditing(false); }} className="text-xs text-blue-400 font-medium">Save</button>
          </div>
        ) : (
          <>
            {!user.verified && (
              <button onClick={onVerifyGuest} className="flex items-center gap-1 text-xs text-amber-400 font-medium mb-2.5"><ShieldCheck size={13} />Not verified — tap to verify</button>
            )}
            {bio && <p className="text-sm text-zinc-300 leading-snug mb-3">{bio}</p>}
            {interests.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Your vibe</p>
                <div className="flex gap-1.5 flex-wrap">
                  {interests.map((name) => {
                    const cat = CATEGORIES.find((x) => x.name === name);
                    const cm = COLOR_MAP[cat.color];
                    return (
                      <span key={name} className={`${cm.tint} ${cm.text} text-[11px] px-2 py-1 rounded-full font-medium flex items-center gap-1`}>
                        <cat.icon size={11} />{name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            <button onClick={() => { setDraftBio(bio); setEditing(true); }} className="w-full py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm font-medium">Edit profile</button>
          </>
        )}
      </div>
      {similarPeople.length > 0 && (
        <div className="px-5 pt-5">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">People like you — based on your interests</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {similarPeople.map((p) => (
              <div key={p.id} className="w-28 shrink-0 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
                <Avatar label={p.name[0]} size={40} />
                <p className="text-xs font-medium text-zinc-200 mt-2 truncate">{p.name}</p>
                <p className="text-[10px] text-blue-400 mt-0.5">{p.overlap.length} shared {p.overlap.length === 1 ? "interest" : "interests"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex border-t border-zinc-900 mt-5">
        <button onClick={() => setGridTab("joined")} className={`flex-1 flex items-center justify-center py-3 border-b-2 ${gridTab === "joined" ? "border-zinc-50 text-zinc-50" : "border-transparent text-zinc-600"}`}>
          <Grid3x3 size={17} />
        </button>
        <button onClick={() => setGridTab("created")} className={`flex-1 flex items-center justify-center py-3 border-b-2 ${gridTab === "created" ? "border-zinc-50 text-zinc-50" : "border-transparent text-zinc-600"}`}>
          <LayoutGrid size={17} />
        </button>
      </div>
      {shown.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-10">{gridTab === "joined" ? "You haven't joined any communities yet." : "You haven't created any communities yet."}</p>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 mt-0.5">
          {shown.map((c) => {
            const cat = CATEGORIES.find((x) => x.name === c.category);
            const cm = COLOR_MAP[cat.color];
            return (
              <div key={c.id} className={`aspect-square p-2 flex flex-col justify-between bg-gradient-to-br ${cm.grad}`}>
                <cat.icon size={15} className="text-white/90" />
                <p className="text-[10px] font-semibold text-white leading-tight line-clamp-2">{c.name}</p>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
