import { useState, useMemo, useCallback, useEffect } from "react";
import {
  FONT_IMPORT, SEED_COMMUNITIES, MOCK_NOTIFICATIONS,
  MOCK_INCOMING_REQUESTS, MOCK_OUTGOING_REQUESTS,
} from "./data/constants.js";
import { distanceKm, computeOrbitScore, communityTrendScore, buildOrbitLeaderboard, nextId } from "./utils/helpers.js";
import { TopBar } from "./components/TopBar.jsx";
import { BottomNav } from "./components/BottomNav.jsx";
import { GuestBanner, Toast } from "./components/Common.jsx";
import { SearchOverlay } from "./components/SearchOverlay.jsx";
import { HomeScreen } from "./components/Home.jsx";
import { NearbyScreen } from "./components/Nearby.jsx";
import { DiscoverScreen } from "./components/Discover.jsx";
import { CommunityDetail } from "./components/Community.jsx";
import { CreateCommunity } from "./components/CreateCommunity.jsx";
import { ChatScreen } from "./components/Chat.jsx";
import { ProfileScreen } from "./components/Profile.jsx";
import { Onboarding } from "./components/Onboarding.jsx";
import { ReportModal } from "./components/ReportModal.jsx";

export default function App() {
  const [stage, setStage] = useState("onboarding");
  const [user, setUser] = useState({ name: "", verified: false, interests: [] });
  const [communities, setCommunities] = useState(SEED_COMMUNITIES);
  const [joinedIds, setJoinedIds] = useState([]);
  const [sparkedIds, setSparkedIds] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [radius, setRadius] = useState(1.5);
  const [auto, setAuto] = useState(true);
  const [filterCat, setFilterCat] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [chatTab, setChatTab] = useState("requests");
  const [incoming, setIncoming] = useState(MOCK_INCOMING_REQUESTS);
  const [outgoing, setOutgoing] = useState(MOCK_OUTGOING_REQUESTS);
  const [toastMsg, setToastMsg] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [exploreTab, setExploreTab] = useState("events");

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  }, []);
  const markNotificationsRead = useCallback(() => {
    setNotifications((ns) => ns.map((n) => (n.unread ? { ...n, unread: false } : n)));
  }, []);

  // Adaptive radius: auto-expand while fewer than 5 communities are in range, up to 5km.
  useEffect(() => {
    if (!auto) return;
    const count = communities.filter((c) => distanceKm(c.dx, c.dy) <= radius).length;
    if (count < 5 && radius < 5) {
      const t = setTimeout(() => setRadius((r) => Math.min(5, r + 1)), 250);
      return () => clearTimeout(t);
    }
  }, [auto, radius, communities]);

  const joinedCommunities = useMemo(() => communities.filter((c) => joinedIds.includes(c.id)), [communities, joinedIds]);
  const topTrendingIds = useMemo(() => (
    [...communities].sort((a, b) => communityTrendScore(b) - communityTrendScore(a)).slice(0, 3).map((c) => c.id)
  ), [communities]);
  const orbitScore = useMemo(() => {
    const createdCount = joinedCommunities.filter((c) => c.creator === "You").length;
    return computeOrbitScore({ joinedCount: joinedIds.length, createdCount, sparksGiven: sparkedIds.length });
  }, [joinedCommunities, joinedIds, sparkedIds]);
  const orbitLeaderboard = useMemo(() => buildOrbitLeaderboard(orbitScore, user.name), [orbitScore, user.name]);
  const myOrbitRank = orbitLeaderboard.find((p) => p.isYou);

  const handleBlocked = () => showToast("Verify your account first — head to Profile");

  const handleJoinToggle = (id) => {
    const isJoined = joinedIds.includes(id);
    const delta = isJoined ? -1 : 1;
    setJoinedIds((ids) => (isJoined ? ids.filter((x) => x !== id) : [...ids, id]));
    setCommunities((cs) => cs.map((c) => (c.id === id ? { ...c, members: c.members + delta } : c)));
    setSelectedCommunity((sc) => (sc && sc.id === id ? { ...sc, members: sc.members + delta } : sc));
    showToast(isJoined ? "Left community" : "Joined community");
  };

  const handleSpark = (id) => {
    setSparkedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const handleCreate = ({ name, category, desc, dx, dy }) => {
    const newC = { id: nextId(), name, category, tags: [category], desc: desc || "No description yet.", dx, dy, members: 1, lastActive: 0, creator: "You" };
    setCommunities((cs) => [newC, ...cs]);
    setJoinedIds((ids) => [...ids, newC.id]);
    showToast("Community created");
    setShowCreate(false);
    setActiveTab("home");
  };

  const handleUpdateCommunity = (id, updates) => {
    setCommunities((cs) => cs.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    setSelectedCommunity((sc) => (sc && sc.id === id ? { ...sc, ...updates } : sc));
    showToast("Community updated");
  };

  const handleDeleteCommunity = (id) => {
    setCommunities((cs) => cs.filter((c) => c.id !== id));
    setJoinedIds((ids) => ids.filter((x) => x !== id));
    setSelectedCommunity(null);
    showToast("Community deleted");
  };

  const handleReportSubmit = () => {
    setReportTarget(null);
    setSelectedCommunity(null);
    showToast("Report submitted for review");
  };

  // Verify / log in / log out all route back to the initial onboarding page,
  // where the real verification flow lives — no more instant fake-verify.
  const goToInitialPage = () => {
    setUser({ name: "", verified: false, interests: [] });
    setStage("onboarding");
  };

  if (stage === "onboarding") {
    return (
      <div className="w-full max-w-sm mx-auto bg-zinc-950 sm:rounded-3xl overflow-hidden relative flex flex-col" style={{ height: "100dvh", fontFamily: "'Inter', sans-serif" }}>
        <style>{FONT_IMPORT}</style>
        <Onboarding
          onDone={(name, interests) => { setUser({ name, verified: true, interests }); setStage("app"); }}
          onGuest={() => { setUser({ name: "Guest", verified: false, interests: [] }); setStage("app"); }}
        />
      </div>
    );
  }

  const showingSubPage = !!selectedCommunity || showCreate || searchOpen;
  const goToTab = (tab) => {
    setSelectedCommunity(null);
    setShowCreate(false);
    setSearchOpen(false);
    setActiveTab(tab);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-zinc-950 sm:rounded-3xl overflow-hidden relative flex flex-col" style={{ height: "100dvh", fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      {!showingSubPage && (
        <TopBar notifOpen={notifOpen} setNotifOpen={setNotifOpen} notifications={notifications} markRead={markNotificationsRead}
          onCreateClick={() => { if (!user.verified) { handleBlocked(); return; } setShowCreate(true); }}
          onSearchClick={() => setSearchOpen(true)} />
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
        <SearchOverlay communities={communities} onOpen={setSelectedCommunity} onClose={() => setSearchOpen(false)} />
      ) : activeTab === "home" ? (
        <HomeScreen
          communities={communities} radius={radius} setRadius={(r) => { setAuto(false); setRadius(r); }}
          auto={auto} setAuto={setAuto} joinedIds={joinedIds}
          onOpen={setSelectedCommunity} filterCat={filterCat} setFilterCat={setFilterCat}
          sparkedIds={sparkedIds} onSpark={handleSpark} interests={user.interests}
          onCreateClick={() => { if (!user.verified) { handleBlocked(); return; } setShowCreate(true); }}
        />
      ) : activeTab === "nearby" ? (
        <NearbyScreen communities={communities} radius={radius} />
      ) : activeTab === "chat" ? (
        <ChatScreen
          tab={chatTab} setTab={setChatTab} verified={user.verified} onBlocked={handleBlocked} onVerifyNow={goToInitialPage}
          joinedCommunities={joinedCommunities} incoming={incoming} setIncoming={setIncoming}
          outgoing={outgoing} setOutgoing={setOutgoing} toast={showToast}
        />
      ) : activeTab === "discover" ? (
        <DiscoverScreen subTab={exploreTab} setSubTab={setExploreTab} leaderboard={orbitLeaderboard} communities={communities} />
      ) : activeTab === "profile" ? (
        <ProfileScreen
          user={user} joinedCommunities={joinedCommunities}
          onEditName={(n) => setUser((u) => ({ ...u, name: n }))}
          onVerifyGuest={goToInitialPage}
          onLogout={goToInitialPage}
          orbitScore={orbitScore} rankInfo={myOrbitRank}
          onViewLeaderboard={() => { setExploreTab("orbit"); goToTab("discover"); }}
        />
      ) : null}
      <BottomNav active={activeTab} setActive={goToTab} unreadChat={incoming.length} />
      {reportTarget && (
        <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} onSubmit={handleReportSubmit} />
      )}
      <Toast message={toastMsg} />
    </div>
  );
}
