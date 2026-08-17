import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { slugify } from "./utils/helpers.js";
import { useTheme } from "./utils/theme.js";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient.js";
import { TopBar } from "./components/TopBar.jsx";
import { BottomNav } from "./components/BottomNav.jsx";
import { GuestBanner, PreviewBanner, Toast, Logo } from "./components/Common.jsx";
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
import {
  DEMO_USER, DEMO_ALL_GROUPS, DEMO_EVENTS, DEMO_TEA, DEMO_JOINED_IDS,
} from "./data/demoData.js";

function mapCommunityRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    tags: row.tags && row.tags.length ? row.tags : [row.category],
    desc: row.description,
    members: row.member_count,
    creatorId: row.creator_id,
    official: row.official,
    handle: row.handle,
    avatarUrl: row.avatar_url,
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

// author_id is never selectable, so "is this mine?" is tracked locally at post time.
function loadIdSet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveIdSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* private mode / storage disabled */
  }
}

// No credentials, or VITE_PREVIEW=1: run on local sample data, skip every request.
export const DEMO = !isSupabaseConfigured || import.meta.env.VITE_PREVIEW === "1";

export default function App() {
  const { mode: themeMode, setMode: setThemeMode } = useTheme();

  const [loadingSession, setLoadingSession] = useState(!DEMO);
  const [loadingCommunities, setLoadingCommunities] = useState(!DEMO);
  const [stage, setStage] = useState(DEMO ? "app" : "onboarding");
  const [authUser, setAuthUser] = useState(
    DEMO ? { id: DEMO_USER.id, email: "demo@orbit.app" } : null
  );
  const [user, setUser] = useState(
    DEMO ? DEMO_USER : { name: "", bio: "", verified: false, interests: [] }
  );

  const [dbCommunities, setDbCommunities] = useState(DEMO ? DEMO_ALL_GROUPS : []);
  const [events, setEvents] = useState(DEMO ? DEMO_EVENTS : []);
  const [joinedIds, setJoinedIds] = useState(DEMO ? DEMO_JOINED_IDS : []);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);

  const [activeTab, setActiveTab] = useState("home");
  const [filterCat, setFilterCat] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [teaOpen, setTeaOpen] = useState(false);
  const [teaPosts, setTeaPosts] = useState(DEMO ? DEMO_TEA : []);
  const [myTeaVotes, setMyTeaVotes] = useState({}); // postId -> "true" | "cap"
  const [myTeaReactions, setMyTeaReactions] = useState({}); // postId -> emoji
  const [myTeaPostIds, setMyTeaPostIds] = useState(() => loadIdSet("orbit_my_tea_post_ids"));
  const [myTeaCommentIds, setMyTeaCommentIds] = useState(() => loadIdSet("orbit_my_tea_comment_ids"));
  const [exploreTab, setExploreTab] = useState("clubs");

  // One shared timer, else an earlier toast clears a later one.
  const toastTimerRef = useRef(null);
  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(""), 2200);
  }, []);
  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const fetchMyJoins = useCallback(async (userId) => {
    await supabase.auth.getSession();
    const { data } = await supabase
      .from("community_members")
      .select("community_id")
      .eq("user_id", userId);
    if (data) setJoinedIds(data.map((r) => r.community_id));
  }, []);

  const fetchMyRegistrations = useCallback(async (userId) => {
    await supabase.auth.getSession();
    const { data } = await supabase
      .from("event_registrations")
      .select("event_id")
      .eq("user_id", userId);
    if (data) setRegisteredEventIds(data.map((r) => r.event_id));
  }, []);

  useEffect(() => {
    if (DEMO) return;
    (async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setDbCommunities(data.map(mapCommunityRow));
      setLoadingCommunities(false);
    })();
    (async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data) setEvents(data.map(mapEventRow));
    })();
  }, []);

  useEffect(() => {
    if (DEMO) return;
    const channel = supabase
      .channel("communities-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "communities" },
        (payload) => {
          setDbCommunities((cs) => {
            if (payload.eventType === "DELETE") return cs.filter((c) => c.id !== payload.old.id);
            const mapped = mapCommunityRow(payload.new);
            return cs.some((c) => c.id === mapped.id)
              ? cs.map((c) => (c.id === mapped.id ? mapped : c))
              : [mapped, ...cs];
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Session bootstrap — returning users with a valid session skip onboarding.
  useEffect(() => {
    if (DEMO) return;
    let mounted = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (mounted && session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, bio, interests")
          .eq("id", session.user.id)
          .single();
        setAuthUser({ id: session.user.id, email: session.user.email });
        setUser({
          name: profile?.name || "",
          bio: profile?.bio || "",
          verified: true,
          interests: profile?.interests || [],
        });
        setStage("app");
        fetchMyJoins(session.user.id);
        fetchMyRegistrations(session.user.id);
      }
      if (mounted) setLoadingSession(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session ? { id: session.user.id, email: session.user.email } : null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [fetchMyJoins, fetchMyRegistrations]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listenerPromise = CapacitorApp.addListener("backButton", () => {
      if (stage !== "app") {
        CapacitorApp.exitApp();
        return;
      }
      if (selectedCommunity) return setSelectedCommunity(null);
      if (showCreate) return setShowCreate(false);
      if (searchOpen) return setSearchOpen(false);
      if (teaOpen) return setTeaOpen(false);
      if (reportTarget) return setReportTarget(null);
      if (notifOpen) return setNotifOpen(false);
      CapacitorApp.exitApp();
    });
    return () => {
      listenerPromise.then((l) => l.remove());
    };
  }, [stage, selectedCommunity, showCreate, searchOpen, teaOpen, reportTarget, notifOpen]);

  // Communities and clubs share one table — `official` is the only split.
  const communities = useMemo(() => dbCommunities.filter((c) => !c.official), [dbCommunities]);
  const clubs = useMemo(() => dbCommunities.filter((c) => c.official), [dbCommunities]);
  const allGroups = dbCommunities;

  const isTeaModerator =
    !!authUser && dbCommunities.some((c) => c.handle === "orbit" && c.creatorId === authUser.id);

  const joinedCommunities = useMemo(
    () => allGroups.filter((c) => joinedIds.includes(c.id)),
    [allGroups, joinedIds]
  );

  // creator_id, not creator_label — the label is the literal "You" on every row.
  const createdCommunities = useMemo(
    () => (authUser ? allGroups.filter((c) => c.creatorId === authUser.id) : []),
    [allGroups, authUser]
  );

  const handleBlocked = () => showToast("Verify your account first — head to Profile");

  const handleJoinToggle = async (id) => {
    if (!authUser) {
      handleBlocked();
      return;
    }
    const isJoined = joinedIds.includes(id);
    const delta = isJoined ? -1 : 1;
    setJoinedIds((ids) => (isJoined ? ids.filter((x) => x !== id) : [...ids, id]));
    setDbCommunities((cs) =>
      cs.map((c) => (c.id === id ? { ...c, members: c.members + delta } : c))
    );
    setSelectedCommunity((sc) => (sc && sc.id === id ? { ...sc, members: sc.members + delta } : sc));
    showToast(isJoined ? "Left" : "Joined");

    if (DEMO) return;
    const { error } = isJoined
      ? await supabase.from("community_members").delete().eq("community_id", id).eq("user_id", authUser.id)
      : await supabase.from("community_members").insert({ community_id: id, user_id: authUser.id });
    if (error) {
      setJoinedIds((ids) => (isJoined ? [...ids, id] : ids.filter((x) => x !== id)));
      setDbCommunities((cs) =>
        cs.map((c) => (c.id === id ? { ...c, members: c.members - delta } : c))
      );
      setSelectedCommunity((sc) =>
        sc && sc.id === id ? { ...sc, members: sc.members - delta } : sc
      );
      showToast("Something went wrong — try again");
    }
  };

  const handleCreate = async ({ name, category, desc }) => {
    if (!authUser) {
      handleBlocked();
      return;
    }
    // official/member_count omitted: no INSERT grant on them (schema_backend_fixes §2).
    const handle = `${slugify(name)}-${Math.random().toString(36).slice(2, 8)}`;
    if (DEMO) {
      const local = {
        id: `demo-${handle}`, name, category, tags: [category],
        desc: desc || "No description yet.", members: 1,
        creatorId: authUser.id, official: false, handle, avatarUrl: null,
      };
      setDbCommunities((cs) => [local, ...cs]);
      setJoinedIds((ids) => [...ids, local.id]);
      showToast("Community created");
      setShowCreate(false);
      setActiveTab("home");
      return;
    }
    const { data, error } = await supabase
      .from("communities")
      .insert({
        name,
        category,
        tags: [category],
        description: desc || "No description yet.",
        creator_id: authUser.id,
        creator_label: user.name || "A student",
        handle,
      })
      .select()
      .single();
    if (error || !data) {
      showToast("Couldn't create — try again");
      return;
    }
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
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (DEMO) return showToast("Updated");
    const { error } = await supabase.from("communities").update(dbUpdates).eq("id", id);
    showToast(error ? "Update failed" : "Updated");
  };

  const handleDeleteCommunity = async (id) => {
    setDbCommunities((cs) => cs.filter((c) => c.id !== id));
    setJoinedIds((ids) => ids.filter((x) => x !== id));
    setSelectedCommunity(null);
    if (DEMO) return showToast("Deleted");
    const { error } = await supabase.from("communities").delete().eq("id", id);
    showToast(error ? "Delete failed — refresh and retry" : "Deleted");
  };

  const handleSaveProfile = async ({ name, bio }) => {
    if (!authUser) return;
    const prev = user;
    setUser((u) => ({ ...u, name, bio }));
    if (DEMO) return showToast("Profile updated");
    const { error } = await supabase.from("profiles").update({ name, bio }).eq("id", authUser.id);
    if (error) {
      setUser(prev);
      showToast("Couldn't save — try again");
      return;
    }
    showToast("Profile updated");
  };

  const handleReportSubmit = async (reason) => {
    const target = reportTarget;
    setReportTarget(null);
    showToast("Report submitted for review");
    if (DEMO || !authUser) return;
    await supabase.from("reports").insert({
      reporter_id: authUser.id,
      target: String(target),
      reason,
    });
  };

  const handleRegisterEvent = async (event) => {
    if (!authUser) {
      handleBlocked();
      return;
    }
    const { data: communityId, error } = await supabase.rpc("register_for_event", {
      p_event_id: event.id,
    });
    if (error || !communityId) {
      showToast("Registration failed — try again");
      return;
    }
    setRegisteredEventIds((ids) => [...ids, event.id]);
    setJoinedIds((ids) => (ids.includes(communityId) ? ids : [...ids, communityId]));
    setEvents((es) =>
      es.map((e) => (e.id === event.id ? { ...e, linkedCommunityId: communityId } : e))
    );
    if (!dbCommunities.some((c) => c.id === communityId)) {
      const { data: row } = await supabase
        .from("communities")
        .select("*")
        .eq("id", communityId)
        .single();
      if (row) setDbCommunities((cs) => [mapCommunityRow(row), ...cs]);
    }
    showToast(`Registered for ${event.title}`);
  };

  const fetchTea = useCallback(async () => {
    if (DEMO) return;
    await supabase.auth.getSession();
    const { data } = await supabase
      .from("tea_posts")
      .select("id, text, category, true_count, cap_count, reactions, comment_count, created_at")
      .order("created_at", { ascending: false });
    if (data) {
      setTeaPosts((prev) => {
        const byId = new Map(prev.map((t) => [t.id, t]));
        return data.map((row) => {
          const mapped = mapTeaRow(row);
          const existing = byId.get(row.id);
          return existing ? { ...mapped, comments: existing.comments } : mapped;
        });
      });
    }
    if (authUser) {
      const { data: votes } = await supabase
        .from("tea_votes")
        .select("post_id, vote")
        .eq("user_id", authUser.id);
      if (votes) setMyTeaVotes(Object.fromEntries(votes.map((v) => [v.post_id, v.vote])));
      const { data: reactions } = await supabase
        .from("tea_reactions")
        .select("post_id, emoji")
        .eq("user_id", authUser.id);
      if (reactions) setMyTeaReactions(Object.fromEntries(reactions.map((r) => [r.post_id, r.emoji])));
    }
  }, [authUser]);

  useEffect(() => {
    if (teaOpen) fetchTea();
  }, [teaOpen, fetchTea]);

  const loadTeaComments = async (postId) => {
    if (DEMO) return;
    const { data } = await supabase
      .from("tea_comments")
      .select("id, text, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setTeaPosts((ts) =>
      ts.map((t) => (t.id === postId ? { ...t, comments: (data || []).map(mapTeaCommentRow) } : t))
    );
  };

  const handlePostTea = async (text, category = "tea") => {
    if (!authUser) {
      handleBlocked();
      return;
    }
    if (DEMO) {
      const local = {
        id: `demo-tea-${Date.now()}`, text, category,
        trueCount: 0, capCount: 0, reactions: {}, commentCount: 0,
        comments: [], createdAt: Date.now(),
      };
      setTeaPosts((ts) => [local, ...ts]);
      setMyTeaPostIds((ids) => new Set(ids).add(local.id));
      showToast("Posted anonymously — gone in 48h");
      return;
    }
    const { data, error } = await supabase
      .from("tea_posts")
      .insert({ author_id: authUser.id, text, category })
      .select("id, text, category, true_count, cap_count, reactions, comment_count, created_at")
      .single();
    if (!error && data) {
      setTeaPosts((ts) => [{ ...mapTeaRow(data), comments: [] }, ...ts]);
      setMyTeaPostIds((ids) => {
        const next = new Set(ids);
        next.add(data.id);
        saveIdSet("orbit_my_tea_post_ids", next);
        return next;
      });
      showToast("Posted anonymously — gone in 48h");
    } else {
      showToast("Couldn't post — try again");
    }
  };

  const handleDeleteTea = async (id) => {
    const prevPosts = teaPosts;
    setTeaPosts((ts) => ts.filter((t) => t.id !== id));
    if (DEMO) return;
    const { error } = await supabase.from("tea_posts").delete().eq("id", id);
    if (error) {
      setTeaPosts(prevPosts);
      showToast("Couldn't delete — try again");
    } else {
      setMyTeaPostIds((ids) => {
        const next = new Set(ids);
        next.delete(id);
        saveIdSet("orbit_my_tea_post_ids", next);
        return next;
      });
    }
  };

  const handleDeleteTeaComment = async (postId, commentId) => {
    setTeaPosts((ts) =>
      ts.map((t) =>
        t.id === postId
          ? {
              ...t,
              comments: (t.comments || []).filter((c) => c.id !== commentId),
              commentCount: Math.max(0, (t.commentCount || 1) - 1),
            }
          : t
      )
    );
    if (DEMO) return;
    const { error } = await supabase.from("tea_comments").delete().eq("id", commentId);
    if (error) {
      loadTeaComments(postId); // out of sync — re-pull the truth
    } else {
      setMyTeaCommentIds((ids) => {
        const next = new Set(ids);
        next.delete(commentId);
        saveIdSet("orbit_my_tea_comment_ids", next);
        return next;
      });
    }
  };

  const handleReactTea = async (id, emoji) => {
    if (!authUser) {
      handleBlocked();
      return;
    }
    const prev = myTeaReactions[id];
    if (prev === emoji) {
      setMyTeaReactions((rs) => {
        const next = { ...rs };
        delete next[id];
        return next;
      });
      setTeaPosts((ts) =>
        ts.map((t) =>
          t.id === id
            ? {
                ...t,
                reactions: { ...t.reactions, [emoji]: Math.max(0, (t.reactions?.[emoji] || 0) - 1) },
              }
            : t
        )
      );
      if (DEMO) return;
      const { error } = await supabase
        .from("tea_reactions")
        .delete()
        .eq("post_id", id)
        .eq("user_id", authUser.id);
      if (error) fetchTea();
      return;
    }
    setMyTeaReactions((rs) => ({ ...rs, [id]: emoji }));
    setTeaPosts((ts) =>
      ts.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t.reactions };
        if (prev) next[prev] = Math.max(0, (next[prev] || 0) - 1);
        next[emoji] = (next[emoji] || 0) + 1;
        return { ...t, reactions: next };
      })
    );
    if (DEMO) return;
    const { error } = prev
      ? await supabase.from("tea_reactions").update({ emoji }).eq("post_id", id).eq("user_id", authUser.id)
      : await supabase.from("tea_reactions").insert({ post_id: id, user_id: authUser.id, emoji });
    if (error) fetchTea();
  };

  const handleValidateTea = async (id, vote) => {
    if (!authUser) {
      handleBlocked();
      return;
    }
    const prev = myTeaVotes[id];
    if (prev === vote) return;
    setMyTeaVotes((votes) => ({ ...votes, [id]: vote }));
    setTeaPosts((ts) =>
      ts.map((t) => {
        if (t.id !== id) return t;
        let { trueCount, capCount } = t;
        if (prev === "true") trueCount -= 1;
        if (prev === "cap") capCount -= 1;
        if (vote === "true") trueCount += 1;
        if (vote === "cap") capCount += 1;
        return { ...t, trueCount, capCount };
      })
    );
    if (DEMO) return;
    const { error } = prev
      ? await supabase.from("tea_votes").update({ vote }).eq("post_id", id).eq("user_id", authUser.id)
      : await supabase.from("tea_votes").insert({ post_id: id, user_id: authUser.id, vote });
    if (error) fetchTea();
  };

  const handleCommentTea = async (id, text) => {
    if (!authUser) {
      handleBlocked();
      return;
    }
    if (DEMO) {
      const local = { id: `demo-tc-${Date.now()}`, who: "Anonymous", text, time: "" };
      setTeaPosts((ts) =>
        ts.map((t) =>
          t.id === id
            ? { ...t, comments: [...(t.comments || []), local], commentCount: (t.commentCount || 0) + 1 }
            : t
        )
      );
      setMyTeaCommentIds((ids) => new Set(ids).add(local.id));
      return;
    }
    const { data, error } = await supabase
      .from("tea_comments")
      .insert({ post_id: id, author_id: authUser.id, text })
      .select("id, text, created_at")
      .single();
    if (!error && data) {
      setTeaPosts((ts) =>
        ts.map((t) =>
          t.id === id
            ? {
                ...t,
                comments: [...(t.comments || []), mapTeaCommentRow(data)],
                commentCount: (t.commentCount || 0) + 1,
              }
            : t
        )
      );
      setMyTeaCommentIds((ids) => {
        const next = new Set(ids);
        next.add(data.id);
        saveIdSet("orbit_my_tea_comment_ids", next);
        return next;
      });
    }
  };

  // Verify / log in / log out all route back to the initial onboarding page.
  const goToInitialPage = async () => {
    if (!DEMO) await supabase.auth.signOut();
    setAuthUser(null);
    setUser({ name: "", bio: "", verified: false, interests: [] });
    setJoinedIds([]);
    setRegisteredEventIds([]);
    setStage("onboarding");
  };

  const shellClass =
    "w-full h-dvh max-w-none sm:max-w-sm sm:h-[calc(100dvh-2rem)] mx-auto bg-canvas text-fg sm:my-4 sm:rounded-3xl sm:border sm:border-line sm:shadow-2xl sm:shadow-black/10 dark:sm:shadow-black/50 overflow-hidden relative flex flex-col";

  if (loadingSession) {
    return (
      <div className={shellClass} style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="flex-1 flex items-center justify-center">
          <Logo size="text-2xl" />
        </div>
      </div>
    );
  }

  if (stage === "onboarding") {
    return (
      <div className={shellClass} style={{ fontFamily: "'Inter', sans-serif" }}>
        <Onboarding
          onDone={async (name, interests) => {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            if (session) {
              setAuthUser({ id: session.user.id, email: session.user.email });
              setUser({ name, bio: "", verified: true, interests });
              fetchMyJoins(session.user.id);
              fetchMyRegistrations(session.user.id);
            }
            setStage("app");
          }}
          onGuest={() => {
            setUser({ name: "Guest", bio: "", verified: false, interests: [] });
            setStage("app");
          }}
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
      {!showingSubPage && activeTab !== "profile" && (
        <TopBar
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          onTeaClick={() => {
            if (!user.verified) {
              handleBlocked();
              return;
            }
            setTeaOpen(true);
          }}
          onSearchClick={() => setSearchOpen(true)}
          onMessagesClick={() => showToast("DMs — coming soon")}
        />
      )}
      {!showingSubPage && DEMO && <PreviewBanner />}
      {!showingSubPage && !user.verified && <GuestBanner onVerify={goToInitialPage} />}

      {selectedCommunity ? (
        <CommunityDetail
          key={selectedCommunity.id}
          c={selectedCommunity}
          joined={joinedIds.includes(selectedCommunity.id)}
          onJoinToggle={handleJoinToggle}
          onClose={() => setSelectedCommunity(null)}
          onReport={() => setReportTarget(selectedCommunity.name)}
          verified={user.verified}
          onBlocked={handleBlocked}
          onUpdate={handleUpdateCommunity}
          onDelete={handleDeleteCommunity}
          interests={user.interests}
          authUserId={authUser?.id}
          myName={user.name}
        />
      ) : showCreate ? (
        <CreateCommunity
          onCreate={handleCreate}
          onClose={() => setShowCreate(false)}
          verified={user.verified}
          onBlocked={handleBlocked}
          onVerifyNow={goToInitialPage}
        />
      ) : searchOpen ? (
        <SearchOverlay
          communities={allGroups}
          onOpen={setSelectedCommunity}
          onClose={() => setSearchOpen(false)}
        />
      ) : teaOpen ? (
        <LocaliTeaScreen
          teaPosts={teaPosts}
          onClose={() => setTeaOpen(false)}
          verified={user.verified}
          onBlocked={handleBlocked}
          onPost={handlePostTea}
          onValidate={handleValidateTea}
          onComment={handleCommentTea}
          onReport={(label) => setReportTarget(label)}
          myVotes={myTeaVotes}
          onOpenPost={loadTeaComments}
          onReact={handleReactTea}
          myReactions={myTeaReactions}
          myPostIds={myTeaPostIds}
          myCommentIds={myTeaCommentIds}
          canModerate={isTeaModerator}
          onDeletePost={handleDeleteTea}
          onDeleteComment={handleDeleteTeaComment}
        />
      ) : activeTab === "home" ? (
        <HomeScreen
          communities={communities}
          joinedIds={joinedIds}
          onOpen={setSelectedCommunity}
          onJoinToggle={handleJoinToggle}
          filterCat={filterCat}
          setFilterCat={setFilterCat}
          interests={user.interests}
          loading={loadingCommunities}
          onCreateClick={() => {
            if (!user.verified) {
              handleBlocked();
              return;
            }
            setShowCreate(true);
          }}
        />
      ) : activeTab === "explore" ? (
        <ExploreScreen
          subTab={exploreTab}
          setSubTab={setExploreTab}
          clubs={clubs}
          communities={communities}
          joinedIds={joinedIds}
          onOpen={setSelectedCommunity}
          onJoinToggle={handleJoinToggle}
        />
      ) : activeTab === "events" ? (
        <EventsScreen
          events={events}
          interests={user.interests}
          onComingSoon={() => showToast("Registration — coming soon")}
        />
      ) : activeTab === "profile" ? (
        <ProfileScreen
          user={user}
          joinedCommunities={joinedCommunities}
          createdCommunities={createdCommunities}
          onOpenCommunity={setSelectedCommunity}
          onSaveProfile={handleSaveProfile}
          onVerifyGuest={goToInitialPage}
          onLogout={goToInitialPage}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
        />
      ) : null}

      <BottomNav active={activeTab} setActive={goToTab} />

      {reportTarget && (
        <ReportModal
          target={reportTarget}
          onClose={() => setReportTarget(null)}
          onSubmit={handleReportSubmit}
        />
      )}
      <Toast message={toastMsg} />
    </div>
  );
}
