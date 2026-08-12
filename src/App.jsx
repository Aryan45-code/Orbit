import { useState, useMemo, useCallback } from "react";
import {
  FONT_IMPORT, SEED_COMMUNITIES, CLUBS, MOCK_EVENTS, MOCK_NOTIFICATIONS,
  MOCK_INCOMING_REQUESTS, MOCK_OUTGOING_REQUESTS, MOCK_TEA,
} from "./data/constants.js";
import { communityTrendScore, nextId } from "./utils/helpers.js";
import { TopBar } from "./components/TopBar.jsx";
import { BottomNav } from "./components/BottomNav.jsx";
import { GuestBanner, Toast } from "./components/Common.jsx";
import { SearchOverlay } from "./components/SearchOverlay.jsx";
import { HomeScreen } from "./components/Home.jsx";
import { ExploreScreen } from "./components/Explore.jsx";
import { EventsScreen } from "./components/Events.jsx";
import { CommunityDetail } from "./components/Community.jsx";
import { CreateCommunity } from "./components/CreateCommunity.jsx";
import { DMPanel } from "./components/Chat.jsx";
import { LocaliTeaScreen } from "./components/LocaliTea.jsx";
import { ProfileScreen } from "./components/Profile.jsx";
import { Onboarding } from "./components/Onboarding.jsx";
import { ReportModal } from "./components/ReportModal.jsx";

export default function App() {
  const [stage, setStage] = useState("onboarding");
  const [user, setUser] = useState({ name: "", verified: false, interests: [] });
  const [communities, setCommunities] = useState(SEED_COMMUNITIES);
  const [clubs] = useState(CLUBS);
  const [events] = useState(MOCK_EVENTS);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const [eventCommunityMap, setEventCommunityMap] = useState({}); // eventId -> communityId
  const [joinedIds, setJoinedIds] = useState([]);
  const [sparkedIds, setSparkedIds] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [filterCat, setFilterCat] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [incoming, setIncoming] = useState(MOCK_INCOMING_REQUESTS);
  const [outgoing, setOutgoing] = useState(MOCK_OUTGOING_REQUESTS);
  const [toastMsg, setToastMsg] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [teaOpen, setTeaOpen] = useState(false);
  const [teaPosts, setTeaPosts] = useState(MOCK_TEA);
  const [myTeaVotes, setMyTeaVotes] = useState({}); // teaId -> "true" | "cap"
  const [exploreTab, setExploreTab] = useState("clubs");

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  }, []);
  const markNotificationsRead = useCallback(() => {
    setNotifications((ns) => ns.map((n) => (n.unread ? { ...n, unread: false } : n)));
  }, []);

  // All communities and clubs share the same shape, so most screens work
  // across both — Explore is the only place that splits them by sub-tab.
  const allGroups = useMemo(() => [...communities, ...clubs], [communities, clubs]);
  const joinedCommunities = useMemo(() => allGroups.filter((c) => joinedIds.includes(c.id)), [allGroups, joinedIds]);
  const topTrendingIds = useMemo(() => (
    [...communities].sort((a, b) => communityTrendScore(b) - communityTrendScore(a)).slice(0, 3).map((c) => c.id)
  ), [communities]);
  const handleBlocked = () => showToast("Verify your account first — head to Profile");

  const handleJoinToggle = (id) => {
    const isJoined = joinedIds.includes(id);
    const delta = isJoined ? -1 : 1;
    setJoinedIds((ids) => (isJoined ? ids.filter((x) => x !== id) : [...ids, id]));
    setCommunities((cs) => cs.map((c) => (c.id === id ? { ...c, members: c.members + delta } : c)));
    setSelectedCommunity((sc) => (sc && sc.id === id ? { ...sc, members: sc.members + delta } : sc));
    showToast(isJoined ? "Left" : "Joined");
  };

  const handleSpark = (id) => {
    setSparkedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const handleCreate = ({ name, category, desc }) => {
    const newC = { id: nextId(), name, category, tags: [category], desc: desc || "No description yet.", members: 1, lastActive: 0, creator: "You", official: false };
    setCommunities((cs) => [newC, ...cs]);
    setJoinedIds((ids) => [...ids, newC.id]);
    showToast("Community created");
    setShowCreate(false);
    setActiveTab("home");
  };

  const handleUpdateCommunity = (id, updates) => {
    setCommunities((cs) => cs.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    setSelectedCommunity((sc) => (sc && sc.id === id ? { ...sc, ...updates } : sc));
    showToast("Updated");
  };

  const handleDeleteCommunity = (id) => {
    setCommunities((cs) => cs.filter((c) => c.id !== id));
    setJoinedIds((ids) => ids.filter((x) => x !== id));
    setSelectedCommunity(null);
    showToast("Deleted");
  };

  const handleReportSubmit = (reason) => {
    console.log("Report submitted", { target: reportTarget, reason });
    setReportTarget(null);
    setSelectedCommunity(null);
    showToast("Report submitted for review");
  };

  // Registering for an event is the access gate to its community — this
  // creates (once) and joins the linked community in one step, not two.
  const handleRegisterEvent = (event) => {
    let communityId = eventCommunityMap[event.id];
    if (!communityId) {
      const eventCommunity = {
        id: nextId(), name: `${event.title} — Event Group`, category: event.category,
        tags: event.tags, desc: `Coordination space for ${event.title}. Registered attendees only.`,
        members: 1, lastActive: 0, creator: "EventSystem", official: false,
      };
      communityId = eventCommunity.id;
      setCommunities((cs) => [eventCommunity, ...cs]);
      setEventCommunityMap((m) => ({ ...m, [event.id]: communityId }));
    } else {
      setCommunities((cs) => cs.map((c) => (c.id === communityId ? { ...c, members: c.members + 1 } : c)));
    }
    setRegisteredEventIds((ids) => [...ids, event.id]);
    setJoinedIds((ids) => [...ids, communityId]);
    showToast(`Registered for ${event.title}`);
  };

  // Locali-Tea: anonymous, campus-only, self-destructs 48h after posting.
  // Expired posts are filtered client-side (see isTeaExpired in LocaliTea.jsx);
  // we don't bother pruning teaPosts state itself since expired ones just
  // never render again.
  const handlePostTea = (text) => {
    const newTea = { id: nextId(), text, trueCount: 0, capCount: 0, comments: [], createdAt: Date.now() };
    setTeaPosts((ts) => [newTea, ...ts]);
    showToast("Posted anonymously — gone in 48h");
  };

  const handleValidateTea = (id, vote) => {
    setMyTeaVotes((votes) => {
      const prev = votes[id];
      if (prev === vote) return votes; // already voted this way, no-op
      setTeaPosts((ts) => ts.map((t) => {
        if (t.id !== id) return t;
        let { trueCount, capCount } = t;
        if (prev === "true") trueCount -= 1;
        if (prev === "cap") capCount -= 1;
        if (vote === "true") trueCount += 1;
        if (vote === "cap") capCount += 1;
        return { ...t, trueCount, capCount };
      }));
      return { ...votes, [id]: vote };
    });
  };

  const handleCommentTea = (id, text) => {
    setTeaPosts((ts) => ts.map((t) => (
      t.id === id ? { ...t, comments: [...t.comments, { who: "Anonymous", text, time: "now" }] } : t
    )));
  };

  const handleOpenEventCommunity = (event) => {
    const communityId = eventCommunityMap[event.id];
    const community = communities.find((c) => c.id === communityId);
    if (community) {
      setSelectedCommunity(community);
    }
  };

  // Verify / log in / log out all route back to the initial onboarding page,
  // where the real verification flow lives — no more instant fake-verify.
  const goToInitialPage = () => {
    setUser({ name: "", verified: false, interests: [] });
    setStage("onboarding");
  };

  if (stage === "onboarding") {
    return (
      <div className="w-full h-dvh max-w-none sm:max-w-sm sm:h-[calc(100dvh-2rem)] mx-auto bg-zinc-950 sm:my-4 sm:rounded-3xl sm:border sm:border-zinc-800 sm:shadow-2xl sm:shadow-black/50 overflow-hidden relative flex flex-col animate-fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{FONT_IMPORT}</style>
        <Onboarding
          onDone={(name, interests) => { setUser({ name, verified: true, interests }); setStage("app"); }}
          onGuest={() => { setUser({ name: "Guest", verified: false, interests: [] }); setStage("app"); }}
        />
      </div>
    );
  }

  const showingSubPage = !!selectedCommunity || showCreate || searchOpen || messagesOpen || teaOpen;
  const goToTab = (tab) => {
    setSelectedCommunity(null);
    setShowCreate(false);
    setSearchOpen(false);
    setMessagesOpen(false);
    setTeaOpen(false);
    setActiveTab(tab);
  };

  return (
    <div className="w-full h-dvh max-w-none sm:max-w-sm sm:h-[calc(100dvh-2rem)] mx-auto bg-zinc-950 sm:my-4 sm:rounded-3xl sm:border sm:border-zinc-800 sm:shadow-2xl sm:shadow-black/50 overflow-hidden relative flex flex-col animate-fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      {!showingSubPage && (
        <TopBar notifOpen={notifOpen} setNotifOpen={setNotifOpen} notifications={notifications} markRead={markNotificationsRead}
          onTeaClick={() => { if (!user.verified) { handleBlocked(); return; } setTeaOpen(true); }}
          onSearchClick={() => setSearchOpen(true)}
          onMessagesClick={() => { if (!user.verified) { handleBlocked(); return; } setMessagesOpen(true); }}
          unreadMessages={incoming.length} />
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
        />
      ) : showCreate ? (
        <CreateCommunity onCreate={handleCreate} onClose={() => setShowCreate(false)} verified={user.verified} onBlocked={handleBlocked} onVerifyNow={goToInitialPage} />
      ) : searchOpen ? (
        <SearchOverlay communities={allGroups} onOpen={setSelectedCommunity} onClose={() => setSearchOpen(false)} />
      ) : messagesOpen ? (
        <DMPanel
          onClose={() => setMessagesOpen(false)}
          incoming={incoming} setIncoming={setIncoming}
          outgoing={outgoing} setOutgoing={setOutgoing}
          toast={showToast}
        />
      ) : teaOpen ? (
        <LocaliTeaScreen
          teaPosts={teaPosts} onClose={() => setTeaOpen(false)}
          verified={user.verified} onBlocked={handleBlocked}
          onPost={handlePostTea} onValidate={handleValidateTea} onComment={handleCommentTea}
          onReport={(label) => setReportTarget(label)}
          myVotes={myTeaVotes}
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
          events={events} registeredEventIds={registeredEventIds} interests={user.interests}
          onRegister={(e) => { if (!user.verified) { handleBlocked(); return; } handleRegisterEvent(e); }}
          onOpenCommunity={handleOpenEventCommunity}
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
