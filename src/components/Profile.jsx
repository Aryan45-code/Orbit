import { useState } from "react";
import {
  BadgeCheck, Menu, LogOut, LogIn, ShieldCheck, Grid3x3, Users2, Camera, X, Settings,
} from "lucide-react";
import { CATEGORIES, COLOR_MAP } from "../data/constants.js";
import { useClickOutside } from "../utils/hooks.js";
import { Avatar, ThemeSegment, btnSecondary } from "./Common.jsx";
import { CommunityMark } from "./Home.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { compactCount } from "../utils/helpers.js";

export function ProfileScreen({
  user,
  joinedCommunities,
  createdCommunities,
  onSaveProfile,
  onVerifyGuest,
  onLogout,
  onOpenCommunity,
  themeMode,
  setThemeMode,
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(user.name);
  const [draftBio, setDraftBio] = useState(user.bio || "");
  const [saving, setSaving] = useState(false);
  const [gridTab, setGridTab] = useState("posts");
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const interests = user.interests || [];
  const settingsMenuRef = useClickOutside(menuOpen, () => setMenuOpen(false));

  const startEditing = () => {
    setDraftName(user.name);
    setDraftBio(user.bio || "");
    setEditing(true);
  };

  const saveProfile = async () => {
    const name = draftName.trim();
    if (!name) return;
    setSaving(true);
    await onSaveProfile({ name, bio: draftBio.trim() });
    setSaving(false);
    setEditing(false);
  };

  const stats = [
    { n: joinedCommunities.length, l: "joined" },
    { n: createdCommunities.length, l: "created" },
    { n: interests.length, l: "interests" },
  ];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
      <div
        className="flex items-center justify-between px-4 pb-2"
        style={{ paddingTop: "max(0.875rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <h1 className="font-semibold text-fg text-base truncate">
            {user.name || "Your profile"}
          </h1>
          {user.verified && <BadgeCheck size={15} className="text-accent shrink-0" />}
        </div>
        <div ref={settingsMenuRef} className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="w-8 h-8 flex items-center justify-center text-fg active:opacity-50"
          >
            <Menu size={22} strokeWidth={1.9} />
          </button>
          {menuOpen && (
            <div className="animate-rise-in absolute right-0 top-10 w-48 bg-surface border border-line rounded-xl shadow-xl shadow-black/10 dark:shadow-black/60 z-40 overflow-hidden">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setSettingsOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-fg active:bg-surface-2"
              >
                <Settings size={16} className="text-fg-muted" />
                Appearance
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-fg active:bg-surface-2 border-t border-line"
              >
                {user.verified ? (
                  <LogOut size={16} className="text-fg-muted" />
                ) : (
                  <LogIn size={16} className="text-fg-muted" />
                )}
                {user.verified ? "Log out" : "Log in"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-7 px-4 pt-3">
        <Avatar label={(user.name || "?")[0]} size={80} ring={user.verified} />
        <div className="flex-1 flex justify-around text-center">
          {stats.map(({ n, l }) => (
            <div key={l}>
              <p className="text-[17px] font-semibold text-fg mono leading-tight">{n}</p>
              <p className="text-[13px] text-fg mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {editing ? (
          <div className="space-y-2">
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              className="w-full bg-surface-2 border border-line text-fg placeholder-fg-subtle rounded-lg px-3 py-2.5 text-sm outline-none focus:border-line-strong transition-colors"
            />
            <textarea
              value={draftBio}
              onChange={(e) => setDraftBio(e.target.value)}
              placeholder="Bio"
              rows={2}
              maxLength={160}
              className="w-full bg-surface-2 border border-line text-fg placeholder-fg-subtle rounded-lg px-3 py-2.5 text-sm outline-none focus:border-line-strong transition-colors resize-none"
            />
            <div className="flex gap-2 pt-1">
              <button onClick={() => setEditing(false)} className={`${btnSecondary} flex-1 py-2`}>
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={!draftName.trim() || saving}
                className="flex-1 py-2 rounded-lg bg-accent text-accent-fg text-sm font-semibold disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {user.bio && (
              <p className="text-sm text-fg leading-snug whitespace-pre-line">{user.bio}</p>
            )}
            {interests.length > 0 && (
              <p className="text-sm text-accent mt-1 leading-snug">
                {interests.map((i) => `#${i.replace(/[^a-zA-Z0-9]/g, "")}`).join(" ")}
              </p>
            )}
            {!user.verified && (
              <button
                onClick={onVerifyGuest}
                className="flex items-center gap-1.5 text-[13px] text-accent font-semibold mt-2"
              >
                <ShieldCheck size={13} />
                Not verified — tap to verify
              </button>
            )}
            {user.verified && (
              <button onClick={startEditing} className={`${btnSecondary} w-full mt-4 py-1.5`}>
                Edit profile
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex border-t border-line mt-5">
        {[
          { key: "posts", label: "Posts", icon: Grid3x3 },
          { key: "communities", label: "Communities", icon: Users2 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            aria-label={label}
            onClick={() => setGridTab(key)}
            className={`flex-1 flex items-center justify-center py-3 border-b-2 -mb-px transition-colors ${
              gridTab === key ? "border-fg text-fg" : "border-transparent text-fg-subtle"
            }`}
          >
            <Icon size={22} strokeWidth={1.9} />
          </button>
        ))}
      </div>

      {gridTab === "posts" && (
        <EmptyState
          icon={Camera}
          title="Profile posts aren't live yet"
          subtitle="Photos and videos on your own profile are still being built. For now, post inside the communities you've joined."
        />
      )}

      {gridTab === "communities" &&
        (joinedCommunities.length === 0 ? (
          <EmptyState
            icon={Users2}
            title="No communities yet"
            subtitle="Join a club or community and it'll show up here."
          />
        ) : (
          <div className="grid grid-cols-3 gap-0.5 mt-0.5">
            {joinedCommunities.map((c) => {
              const cat = CATEGORIES.find((x) => x.name === c.category) || CATEGORIES[0];
              const cm = COLOR_MAP[cat.color];
              return (
                <button
                  key={c.id}
                  onClick={() => onOpenCommunity?.(c)}
                  className={`${cm.tint} aspect-square p-3 flex flex-col items-center justify-center gap-2 active:opacity-70 transition-opacity`}
                >
                  <CommunityMark community={c} size={40} />
                  <p className="text-[11px] font-medium text-fg leading-tight line-clamp-2 text-center">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-fg-subtle">{compactCount(c.members)}</p>
                </button>
              );
            })}
          </div>
        ))}

      {settingsOpen && (
        <div
          className="absolute inset-0 bg-black/40 dark:bg-black/70 z-[70] flex items-end animate-fade-in"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Appearance"
            className="animate-rise-in w-full bg-surface border-t border-line rounded-t-2xl p-5"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-fg">Appearance</p>
              <button onClick={() => setSettingsOpen(false)} aria-label="Close">
                <X size={20} className="text-fg" />
              </button>
            </div>
            <p className="text-[13px] text-fg-muted mb-4">
              System follows your phone's light/dark setting.
            </p>
            <ThemeSegment mode={themeMode} setMode={setThemeMode} />
          </div>
        </div>
      )}
    </div>
  );
}
