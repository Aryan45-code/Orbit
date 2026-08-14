import { useState, useMemo, useCallback, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { FONT_IMPORT } from "./data/constants.js";
import { communityTrendScore, slugify } from "./utils/helpers.js";
import { supabase } from "./lib/supabaseClient.js";
import { TopBar } from "./components/TopBar.jsx";
import { BottomNav } from "./components/BottomNav.jsx";
import { GuestBanner, Toast, Logo } from "./components/Common.jsx";
import { SearchOverlay } from "./components/SearchOverlay.jsx";
import { HomeScreen } from "./components/Home.jsx";
import { ExploreScreen } from "./components/Explore.jsx";
import { EventsScreen } from "./components/Events.jsx";
import { CommunityDetail } from "./components/Community.jsx";
import { CreateCommunity } from "./components/CreateCommunity.jsx";
import { LocaliTeaScreen } from "./components/LocaliTea.jsx";
import { ProfileScreen } from "./components/Profile.jsx";
import { Onboarding } from "./components/Onboarding.jsx";
import { ReportModal } from "./components/ReportModal.jsx";
// ReviewPrompt.jsx is kept in the repo (not deleted) but intentionally not
// wired up — the exit review prompt was removed per product decision.

// ---- Supabase row -> app-shape mappers -------------------------------
// The app's components were built against the original mock shape
// ({ members, creator, lastActive, desc, ... }); rather than touching every
// component, live Supabase rows get converted to that exact shape here so
// Home/Explore/Community/Events etc. don't know or care where the data
// actually came from.
function mapCommunityRow(row) {
  const lastActive = Math.max(0, Math.floor((Date.now() - new Date(row.last_active_at).getTime()) / 60000));
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    tags: row.tags && row.tags.length ? row.tags : [row.category],
    desc: row.description,
    members: row.member_count,
    creator: row.creator_label,
    creatorId: row.creator_id,
    official: row.official,
    handle: row.handle,
    lastActive,
  };
}
function mapEventRow(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    tags: row.tags && row.tags.length ? row.tags : [row.category],
    desc: row.description,
    when: row.event_when,
    where: row.event_where,
    capacity: row.capacity,
    linkedCommunityId: row.linked_community_id,
  };
}
function mapTeaRow(row) {
  return {
    id: row.id,
    text: row.text,
    category: row.category || "tea", // "tea" | "confession"
    trueCount: row.true_count,
    capCount: row.cap_count,
    reactions: row.reactions || {},
    commentCount: row.comment_count,
    comments: null, // lazy-loaded per post when opened — see loadTeaComments()
    createdAt: new Date(row.created_at).getTime(),
  };
}
function mapTeaCommentRow(row) {
  return { id: row.id, who: "Anonymous", text: row.text, time: "" };
}

export default function App() {
  const [loadingSession, setLoadingSession] = useState(true);
  const [stage, setStage] = useState("onboarding");
  const [authUser, setAuthUser] = useState(null); // { id, email } from Supabase, or null
  const [user, setUser] = useState({ name: "", verified: false, interests: [] });

  // Live data (Supabase) — core flow: auth, communities/clubs, join/leave, events.
  const [dbCommunities, setDbCommunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [joinedIds, setJoinedIds] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);

  // Still mock/local for this first build — see App architecture notes.
  const [sparkedIds, setSparkedIds] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [filterCat, setFilterCat] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [teaOpen, setTeaOpen] = useState(false);
  const [teaPosts, setTeaPosts] = useState([]); // real, Supabase-backed — see fetchTea()
  const [myTeaVotes, setMyTeaVotes] = useState({}); // Tea tab: postId -> "true" | "cap"
  const [myTeaReactions, setMyTeaReactions] = useState({}); // Confessions tab: postId -> emoji
  const [exploreTab, setExploreTab] = useState("clubs");

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  }, []);

  const fetchMyJoins = useCallback(async (userId) => {
    const { data } = await supabase.from("community_members").select("community_id").eq("user_id", userId);
    if (data) setJoinedIds(data.map((r) => r.community_id));
  }, []);
  const fetchMyRegistrations = useCallback(async (userId) => {
    const { data } = await supabase.from("event_registrations").select("event_id").eq("user_id", userId);
    if (data) setRegisteredEventIds(data.map((r) => r.event_id));
  }, []);

  // Communities + events are public-readable (RLS allows anon), so they load
  // immediately on mount regardless of auth state — guests see the real feed too.
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("communities").select("*").order("created_at", { ascending: false });
      if (!error && data) setDbCommunities(data.map(mapCommunityRow));
    })();
    (async () => {
      const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: true });
      if (!error && data) setEvents(data.map(mapEventRow));
    })();
  }, []);

  // Realtime: member counts / new communities update live for everyone in
  // the app without a manual refresh (e.g. someone else joining a community
  // you're looking at right now).
  useEffect(() => {
    const channel = supabase
      .channel("communities-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "communities" }, (payload) => {
        setDbCommunities((cs) => {
          if (payload.eventType === "DELETE") return cs.filter((c) => c.id !== payload.old.id);
          const mapped = mapCommunityRow(payload.new);
          return cs.some((c) => c.id === mapped.id)
            ? cs.map((c) => (c.id === mapped.id ? mapped : c))
            : [mapped, ...cs];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Session bootstrap — returning users with a valid Supabase session skip
  // onboarding entirely, matching "no repeated re-verification."
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted && session) {
        const { data: profile } = await supabase.from("profiles").select("name, interests").eq("id", session.user.id).single();
        setAuthUser({ id: session.user.id, email: session.user.email });
        setUser({ name: profile?.name || "", verified: true, interests: profile?.interests || [] });
        setStage("app");
        fetchMyJoins(session.user.id);
        fetchMyRegistrations(session.user.id);
      }
      if (mounted) setLoadingSession(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session ? { id: session.user.id, email: session.user.email } : null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [fetchMyJoins, fetchMyRegistrations]);

  // Android hardware back button: close whatever overlay is open first (same
  // as tapping its own back/close button), and exit once nothing is open.
  // No-op on web/dev, only runs inside the APK. (No exit review prompt —
  // deliberately removed per product call; ReviewPrompt.jsx + app_reviews
  // stay in the repo if this gets re-added later.)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listenerPromise = CapacitorApp.addListener("backButton", () => {
      if (stage !== "app") { CapacitorApp.exitApp(); return; }
      if (selectedCommunity) { setSelectedCommunity(null); return; }
      if (showCreate) { setShowCreate(false); return; }
      if (searchOpen) { setSearchOpen(false); return; }
      if (teaOpen) { setTeaOpen(false); return; }
      if (reportTarget) { setReportTarget(null); return; }
      if (notifOpen) { setNotifOpen(false); return; }
      CapacitorApp.exitApp();
    });
    return () => { listenerPromise.then((l) => l.remove()); };
  }, [stage, selectedCommunity, showCreate, searchOpen, teaOpen, reportTarget, notifOpen]);

  // All communities and clubs share the same shape, so most screens work
  // across both — Explore is the only place that splits them by sub-tab.
  const communities = useMemo(() => dbCommunities.filter((c) => !c.official), [dbCommunities]);
  const clubs = useMemo(() => dbCommunities.filter((c) => c.official), [dbCommunities]);
  const allGroups = dbCommunities;
  const joinedCommunities = useMemo(() => allGroups.filter((c) => joinedIds.includes(c.id)), [allGroups, joinedIds]);
  const topTrendingIds = useMemo(() => (
    [...communities].sort((a, b) => communityTrendScore(b) - communityTrendScore(a)).slice(0, 3).map((c) => c.id)
  ), [communities]);
  // Derived, not stored — always in sync with events, no separate map to
  // keep updated by hand (the old mock version kept this as its own state).
  const eventCommunityMap = useMemo(() => (
    Object.fromEntries(events.filter((e) => e.linkedCommunityId).map((e) => [e.id, e.linkedCommunityId]))
  ), [events]);

  const handleBlocked = () => showToast("Verify your account first — head to Profile");

  const handleJoinToggle = async (id) => {
    const isJoined = joinedIds.includes(id);
    const delta = isJoined ? -1 : 1;
    setJoinedIds((ids) => (isJoined ? ids.filter((x) => x !== id) : [...ids, id]));
    setDbCommunities((cs) => cs.map((c) => (c.id === id ? { ...c, members: c.members + delta } : c)));
    setSelectedCommunity((sc) => (sc && sc.id === id ? { ...sc, members: sc.members + delta } : sc));
    showToast(isJoined ? "Left" : "Joined");

    if (!authUser) return;
    const { error } = isJoined
      ? await supabase.from("community_members").delete().eq("community_id", id).eq("user_id", authUser.id)
      : await supabase.from("community_members").insert({ community_id: id, user_id: authUser.id });
    if (error) {
      setJoinedIds((ids) => (isJoined ? [...ids, id] : ids.filter((x) => x !== id)));
      setDbCommunities((cs) => cs.map((c) => (c.id === id ? { ...c, members: c.members - delta } : c)));
      showToast("Something went wrong — try again");
    }
  };

  const handleSpark = (id) => {
    setSparkedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const handleCreate = async ({ name, category, desc }) => {
    if (!authUser) { handleBlocked(); return; }
    const handle = `${slugify(name)}-${Math.random().toString(36).slice(2, 8)}`;
    const { data, error } = await supabase
      .from("communities")
      .insert({
        name, category, tags: [category], description: desc || "No description yet.",
        member_count: 0, creator_id: authUser.id, creator_label: "You", official: false, handle,
      })
      .select()
      .single();
    if (error || !data) { showToast("Couldn't create — try again"); return; }
    const mapped = mapCommunityRow(data);
    setDbCommunities((cs) => [{ ...mapped, members: 1 }, ...cs]);
    setJoinedIds((ids) => [...ids, mapped.id]);
    await supabase.from("community_members").insert({ community_id: mapped.id, user_id: authUser.id });
    showToast("Community created");
    setShowCreate(false);
    setActiveTab("home");
  };

  const handleUpdateCommunity = async (id, updates) => {
    setDbCommunities((cs) => cs.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    setSelectedCommunity((sc) => (sc && sc.id === id ? { ...sc, ...updates } : sc));
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.desc !== undefined) dbUpdates.description = updates.desc;
    const { error } = await supabase.from("communities").update(dbUpdates).eq("id", id);
    showToast(error ? "Update failed" : "Updated");
  };

  const handleDeleteCommunity = async (id) => {
    setDbCommunities((cs) => cs.filter((c) => c.id !== id));
    setJoinedIds((ids) => ids.filter((x) => x !== id));
    setSelectedCommunity(null);
    const { error } = await supabase.from("communities").delete().eq("id", id);
    showToast(error ? "Delete failed — refresh and retry" : "Deleted");
  };

  const handleReportSubmit = (reason) => {
    console.log("Report submitted", { target: reportTarget, reason });
    setReportTarget(null);
    setSelectedCommunity(null);
    showToast("Report submitted for review");
  };

  // Registering for an event is the access gate to its community — the
  // register_for_event() RPC (supabase/schema.sql) creates the linked
  // community on the first registration (or reuses it) and joins the caller,
  // atomically, server-side.
  const handleRegisterEvent = async (event) => {
    if (!authUser) { handleBlocked(); return; }
    const { data: communityId, error } = await supabase.rpc("register_for_event", { p_event_id: event.id });
    if (error || !communityId) { showToast("Registration failed — try again"); return; }

    setRegisteredEventIds((ids) => [...ids, event.id]);
    setJoinedIds((ids) => (ids.includes(communityId) ? ids : [...ids, communityId]));
    setEvents((es) => es.map((e) => (e.id === event.id ? { ...e, linkedCommunityId: communityId } : e)));

    if (!dbCommunities.some((c) => c.id === communityId)) {
      const { data: row } = await supabase.from("communities").select("*").eq("id", communityId).single();
      if (row) setDbCommunities((cs) => [mapCommunityRow(row), ...cs]);
    }
    showToast(`Registered for ${event.title}`);
  };

  // Locali-Tea: anonymous, 48h self-expiring — real Supabase data (posts,
  // votes, comments), just not realtime-subscribed (see schema_tea.sql for
  // why: postgres_changes would leak author_id over the wire, breaking the
  // anonymity the whole feature is built on). Refetches on open instead.
  const fetchTea = useCallback(async () => {
    const { data } = await supabase
      .from("tea_posts")
      .select("id, text, category, true_count, cap_count, reactions, comment_count, created_at")
      .order("created_at", { ascending: false });
    if (data) setTeaPosts((prev) => {
      const byId = new Map(prev.map((t) => [t.id, t]));
      return data.map((row) => {
        const mapped = mapTeaRow(row);
        const existing = byId.get(row.id);
        return existing ? { ...mapped, comments: existing.comments } : mapped;
      });
    });
    if (authUser) {
      const { data: votes } = await supabase.from("tea_votes").select("post_id, vote").eq("user_id", authUser.id);
      if (votes) setMyTeaVotes(Object.fromEntries(votes.map((v) => [v.post_id, v.vote])));
      const { data: reactions } = await supabase.from("tea_reactions").select("post_id, emoji").eq("user_id", authUser.id);
      if (reactions) setMyTeaReactions(Object.fromEntries(reactions.map((r) => [r.post_id, r.emoji])));
    }
  }, [authUser]);

  useEffect(() => {
    if (teaOpen) fetchTea();
  }, [teaOpen, fetchTea]);

  const loadTeaComments = async (postId) => {
    const { data } = await supabase
      .from("tea_comments")
      .select("id, text, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setTeaPosts((ts) => ts.map((t) => (t.id === postId ? { ...t, comments: (data || []).map(mapTeaCommentRow) } : t)));
  };

  const handlePostTea = async (text, category = "tea") => {
    if (!authUser) { handleBlocked(); return; }
    const { data, error } = await supabase
      .from("tea_posts")
      .insert({ author_id: authUser.id, text, category })
      .select("id, text, category, true_count, cap_count, reactions, comment_count, created_at")
      .single();
    if (!error && data) {
      setTeaPosts((ts) => [{ ...mapTeaRow(data), comments: [] }, ...ts]);
      showToast("Posted anonymously — gone in 48h");
    } else {
      showToast("Couldn't post — try again");
    }
  };

  // Confessions tab: emoji reactions, one per user per post, changeable —
  // tapping the same emoji again removes it (same toggle pattern as sparks).
  const handleReactTea = async (id, emoji) => {
    if (!authUser) { handleBlocked(); return; }
    const prev = myTeaReactions[id];
    if (prev === emoji) {
      setMyTeaReactions((rs) => { const next = { ...rs }; delete next[id]; return next; });
      setTeaPosts((ts) => ts.map((t) => (t.id === id ? { ...t, reactions: { ...t.reactions, [emoji]: Math.max(0, (t.reactions?.[emoji] || 0) - 1) } } : t)));
      const { error } = await supabase.from("tea_reactions").delete().eq("post_id", id).eq("user_id", authUser.id);
      if (error) fetchTea();
      return;
    }
    setMyTeaReactions((rs) => ({ ...rs, [id]: emoji }));
    setTeaPosts((ts) => ts.map((t) => {
      if (t.id !== id) return t;
      const next = { ...t.reactions };
      if (prev) next[prev] = Math.max(0, (next[prev] || 0) - 1);
      next[emoji] = (next[emoji] || 0) + 1;
      return { ...t, reactions: next };
    }));
    const { error } = prev
      ? await supabase.from("tea_reactions").update({ emoji }).eq("post_id", id).eq("user_id", authUser.id)
      : await supabase.from("tea_reactions").insert({ post_id: id, user_id: authUser.id, emoji });
    if (error) fetchTea();
  };

  const handleValidateTea = async (id, vote) => {
    if (!authUser) { handleBlocked(); return; }
    const prev = myTeaVotes[id];
    if (prev === vote) return;
    setMyTeaVotes((votes) => ({ ...votes, [id]: vote }));
    setTeaPosts((ts) => ts.map((t) => {
      if (t.id !== id) return t;
      let { trueCount, capCount } = t;
      if (prev === "true") trueCount -= 1;
      if (prev === "cap") capCount -= 1;
      if (vote === "true") trueCount += 1;
      if (vote === "cap") capCount += 1;
      return { ...t, trueCount, capCount };
    }));
    const { error } = prev
      ? await supabase.from("tea_votes").update({ vote }).eq("post_id", id).eq("user_id", authUser.id)
      : await supabase.from("tea_votes").insert({ post_id: id, user_id: authUser.id, vote });
    if (error) fetchTea(); // out of sync — just re-pull the truth
  };

  const handleCommentTea = async (id, text) => {
    if (!authUser) { handleBlocked(); return; }
    const { data, error } = await supabase
      .from("tea_comments")
      .insert({ post_id: id, author_id: authUser.id, text })
      .select("id, text, created_at")
      .single();
    if (!error && data) {
      setTeaPosts((ts) => ts.map((t) => (
        t.id === id ? { ...t, comments: [...(t.comments || []), mapTeaCommentRow(data)], commentCount: (t.commentCount || 0) + 1 } : t
      )));
    }
  };

  const handleOpenEventCommunity = (event) => {
    const communityId = eventCommunityMap[event.id];
    const community = dbCommunities.find((c) => c.id === communityId);
    if (community) setSelectedCommunity(community);
  };

  // Verify / log in / log out all route back to the initial onboarding page.
  const goToInitialPage = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setUser({ name: "", verified: false, interests: [] });
    setJoinedIds([]);
    setRegisteredEventIds([]);
    setStage("onboarding");
  };

  const shellClass = "w-full h-dvh max-w-none sm:max-w-sm sm:h-[calc(100dvh-2rem)] mx-auto bg-zinc-950 sm:my-4 sm:rounded-3xl sm:border sm:border-zinc-800 sm:shadow-2xl sm:shadow-black/50 overflow-hidden relative flex flex-col animate-fade-in";

  if (loadingSession) {
    return (
      <div className={shellClass} style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{FONT_IMPORT}</style>
        <div className="flex-1 flex items-center justify-center">
          <Logo size="text-2xl" />
        </div>
      </div>
    );
  }

  if (stage === "onboarding") {
    return (
      <div className={shellClass} style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{FONT_IMPORT}</style>
        <Onboarding
          onDone={async (name, interests) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              setAuthUser({ id: session.user.id, email: session.user.email });
              setUser({ name, verified: true, interests });
              fetchMyJoins(session.user.id);
              fetchMyRegistrations(session.user.id);
            }
            setStage("app");
          }}
          onGuest={() => { setUser({ name: "Guest", verified: false, interests: [] }); setStage("app"); }}
        />
      </div>
    );
  }

  const showingSubPage = !!selectedCommunity || showCreate || searchOpen || teaOpen;
  const goToTab = (tab) => {
    setSelectedCommunity(null);
    setShowCreate(false);
    setSearchOpen(false);
    setTeaOpen(false);
    setActiveTab(tab);
  };

  return (
    <div className={shellClass} style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      {!showingSubPage && (
        <TopBar notifOpen={notifOpen} setNotifOpen={setNotifOpen}
          onTeaClick={() => { if (!user.verified) { handleBlocked(); return; } setTeaOpen(true); }}
          onSearchClick={() => setSearchOpen(true)}
          onMessagesClick={() => showToast("DMs — coming soon")} />
      )}
      {!showingSubPage && !user.verified && <GuestBanner onVerify={goToInitialPage} />}
      {selectedCommunity ? (
        <CommunityDetail
          key={selectedCommunity.id}
          c={selectedCommunity} joined={joinedIds.includes(selectedCommunity.id)}
          onJoinToggle={handleJoinToggle} onClose={() => setSelectedCommunity(null)}
          onReport={() => setReportTarget(selectedCommunity.name)}
          verified={user.verified} onBlocked={handleBlocked}
          sparked={sparkedIds.includes(selectedCommunity.id)} onSpark={handleSpark}
          onUpdate={handleUpdateCommunity} onDelete={handleDeleteCommunity}
          trendRank={topTrendingIds.includes(selectedCommunity.id) ? topTrendingIds.indexOf(selectedCommunity.id) + 1 : null}
          interests={user.interests}
          authUserId={authUser?.id} myName={user.name}
        />
      ) : showCreate ? (
        <CreateCommunity onCreate={handleCreate} onClose={() => setShowCreate(false)} verified={user.verified} onBlocked={handleBlocked} onVerifyNow={goToInitialPage} />
      ) : searchOpen ? (
        <SearchOverlay communities={allGroups} onOpen={setSelectedCommunity} onClose={() => setSearchOpen(false)} />
      ) : teaOpen ? (
        <LocaliTeaScreen
          teaPosts={teaPosts} onClose={() => setTeaOpen(false)}
          verified={user.verified} onBlocked={handleBlocked}
          onPost={handlePostTea} onValidate={handleValidateTea} onComment={handleCommentTea}
          onReport={(label) => setReportTarget(label)}
          myVotes={myTeaVotes} onOpenPost={loadTeaComments}
          onReact={handleReactTea} myReactions={myTeaReactions}
        />
      ) : activeTab === "home" ? (
        <HomeScreen
          communities={communities} joinedIds={joinedIds}
          onOpen={setSelectedCommunity} filterCat={filterCat} setFilterCat={setFilterCat}
          sparkedIds={sparkedIds} onSpark={handleSpark} interests={user.interests}
          onCreateClick={() => { if (!user.verified) { handleBlocked(); return; } setShowCreate(true); }}
        />
      ) : activeTab === "explore" ? (
        <ExploreScreen subTab={exploreTab} setSubTab={setExploreTab} clubs={clubs} communities={communities} onOpen={setSelectedCommunity} />
      ) : activeTab === "events" ? (
        <EventsScreen
          events={events} interests={user.interests}
          onComingSoon={() => showToast("Registration — coming soon")}
        />
      ) : activeTab === "profile" ? (
        <ProfileScreen
          user={user} joinedCommunities={joinedCommunities}
          onEditName={(n) => setUser((u) => ({ ...u, name: n }))}
          onVerifyGuest={goToInitialPage}
          onLogout={goToInitialPage}
        />
      ) : null}
      <BottomNav active={activeTab} setActive={goToTab} />
      {reportTarget && (
        <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} onSubmit={handleReportSubmit} />
      )}
      <Toast message={toastMsg} />
    </div>
  );
}
