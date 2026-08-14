import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft, Settings, TrendingUp, Crown, Flame, Search, Pin, Send,
  Image as ImageIcon, Camera, Flag, Check, X, Trash2, QrCode, BadgeCheck,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { CATEGORIES, COLOR_MAP } from "../data/constants.js";
import { baseSparks, handleFor } from "../utils/helpers.js";
import { Avatar } from "./Common.jsx";
import { supabase } from "../lib/supabaseClient.js";

export function CommunitySettings({ c, onSave, onDelete, onClose }) {
  const [name, setName] = useState(c.name);
  const [desc, setDesc] = useState(c.desc);
  const [category, setCategory] = useState(c.category);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const save = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), desc: desc.trim() || "No description yet.", category, tags: [category] });
  };
  return (
    <div className="absolute inset-0 bg-black/60 z-[70] flex items-end" onClick={onClose}>
      <div className="bg-zinc-950 w-full rounded-t-3xl max-h-[92%] overflow-y-auto no-scrollbar border-t border-zinc-800" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <p className="font-bold text-zinc-50">Community settings</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-900"><X size={18} className="text-zinc-400" /></button>
        </div>
        <div className="px-5 pb-6">
          <p className="text-xs text-zinc-500 mb-1.5">Name</p>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); }}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl px-3.5 py-2.5 text-sm mb-4 outline-none focus:border-violet-500"
          />
          <p className="text-xs text-zinc-500 mb-1.5">Description</p>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl px-3.5 py-2.5 text-sm mb-4 outline-none focus:border-violet-500" />
          <p className="text-xs text-zinc-500 mb-1.5">Category</p>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {CATEGORIES.map((cat) => {
              const cm = COLOR_MAP[cat.color];
              const selected = category === cat.name;
              const Icon = cat.icon;
              return (
                <button key={cat.name} onClick={() => setCategory(cat.name)} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left border ${selected ? "border-violet-500 ring-1 ring-violet-500/30 bg-violet-500/5" : "border-zinc-800 bg-zinc-900"}`}>
                  <div className={`${cm.tint} ${cm.text} w-7 h-7 rounded-lg flex items-center justify-center shrink-0`}><Icon size={14} /></div>
                  <p className="text-xs font-medium text-zinc-200 leading-tight">{cat.name}</p>
                  {selected && <Check size={13} className="text-violet-400 ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
          <button
            disabled={!name.trim()}
            onClick={save}
            className="w-full py-2.5 rounded-xl bg-violet-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 text-sm font-semibold mb-3"
          >
            Save changes
          </button>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 text-sm font-semibold flex items-center justify-center gap-1.5">
              <Trash2 size={14} />Delete community
            </button>
          ) : (
            <div className="border border-rose-500/30 bg-rose-500/5 rounded-xl p-3.5">
              <p className="text-xs text-rose-300 mb-2.5">This deletes the community for everyone. This can't be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">Cancel</button>
                <button onClick={onDelete} className="flex-1 py-2 rounded-lg bg-rose-500 text-white text-xs font-semibold">Yes, delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

function mapPostRow(row) {
  return {
    id: row.id,
    who: row.profiles?.name || "Someone",
    authorId: row.author_id,
    text: row.text,
    time: timeAgo(row.created_at),
    hasImage: row.has_image,
    sparks: row.spark_count,
    pinned: row.pinned,
  };
}

function mapMessageRow(row) {
  return {
    id: row.id,
    who: row.profiles?.name || "Someone",
    authorId: row.author_id,
    text: row.text,
    time: timeAgo(row.created_at),
  };
}

export function CommunityDetail({ c, joined, onJoinToggle, onClose, onReport, verified, onBlocked, sparked, onSpark, onUpdate, onDelete, trendRank, interests, authUserId, myName }) {
  const cat = CATEGORIES.find((x) => x.name === c.category);
  const cm = COLOR_MAP[cat.color];
  const Icon = cat.icon;
  const sparks = baseSparks(c) + (sparked ? 1 : 0);
  const isAdmin = !!authUserId && c.creatorId === authUserId;
  const isLive = c.lastActive <= 10;
  const [tab, setTab] = useState("posts");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [attaching, setAttaching] = useState(false);
  const handle = useMemo(() => handleFor(c.name, c.id), [c.name, c.id]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [memberQuery, setMemberQuery] = useState("");
  const [postSparkIds, setPostSparkIds] = useState([]);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]); // [{ userId, name, interests, joinedAt }]

  // Real fetch + realtime, scoped to this one community. App.jsx re-mounts
  // this component (key={selectedCommunity.id}) on every community switch,
  // so a plain mount-time effect is enough — no need to watch c.id changing.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("community_posts")
        .select("id, text, has_image, spark_count, pinned, created_at, author_id, profiles(name)")
        .eq("community_id", c.id)
        .order("created_at", { ascending: false });
      if (!cancelled && data) setPosts(data.map(mapPostRow));

      if (authUserId) {
        const { data: myRows } = await supabase
          .from("community_post_sparks")
          .select("post_id")
          .eq("user_id", authUserId);
        if (!cancelled && myRows) setPostSparkIds(myRows.map((r) => r.post_id));
      }
    })();

    (async () => {
      const { data } = await supabase
        .from("community_messages")
        .select("id, text, created_at, author_id, profiles(name)")
        .eq("community_id", c.id)
        .order("created_at", { ascending: true });
      if (!cancelled && data) setChatMessages(data.map(mapMessageRow));
    })();

    (async () => {
      const { data } = await supabase
        .from("community_members")
        .select("user_id, joined_at, profiles(name, interests)")
        .eq("community_id", c.id)
        .order("joined_at", { ascending: true });
      if (!cancelled && data) {
        setMembers(
          data.map((r) => ({
            userId: r.user_id,
            name: r.profiles?.name || "Someone",
            interests: r.profiles?.interests || [],
            joinedAt: r.joined_at,
          }))
        );
      }
    })();

    const channel = supabase
      .channel(`community-${c.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts", filter: `community_id=eq.${c.id}` }, (payload) => {
        if (payload.eventType === "DELETE") {
          setPosts((ps) => ps.filter((p) => p.id !== payload.old.id));
          return;
        }
        setPosts((ps) => {
          const mapped = mapPostRow(payload.new);
          const exists = ps.some((p) => p.id === mapped.id);
          return exists ? ps.map((p) => (p.id === mapped.id ? { ...p, ...mapped, who: p.who } : p)) : [mapped, ...ps];
        });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_messages", filter: `community_id=eq.${c.id}` }, (payload) => {
        setChatMessages((ms) => (ms.some((m) => m.id === payload.new.id) ? ms : [...ms, mapMessageRow(payload.new)]));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "community_members", filter: `community_id=eq.${c.id}` }, async () => {
        const { data } = await supabase
          .from("community_members")
          .select("user_id, joined_at, profiles(name, interests)")
          .eq("community_id", c.id)
          .order("joined_at", { ascending: true });
        if (!cancelled && data) {
          setMembers(
            data.map((r) => ({
              userId: r.user_id,
              name: r.profiles?.name || "Someone",
              interests: r.profiles?.interests || [],
              joinedAt: r.joined_at,
            }))
          );
        }
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.id]);

  const total = members.length || c.members;
  const filteredMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    const list = members.map((m) => ({ ...m, role: m.userId === c.creatorId ? "Creator" : "Member" }));
    return q ? list.filter((m) => m.name.toLowerCase().includes(q)) : list;
  }, [memberQuery, members, c.creatorId]);
  const recentlyJoined = useMemo(
    () => [...members].sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt)).slice(0, 4),
    [members]
  );
  const matchedMembers = useMemo(() => {
    if (!interests || interests.length === 0) return [];
    return members
      .filter((m) => m.userId !== authUserId)
      .map((m) => ({ ...m, overlap: (m.interests || []).filter((s) => interests.includes(s)) }))
      .filter((m) => m.overlap.length > 0);
  }, [members, interests, authUserId]);
  const faceStack = members.slice(0, 5);
  const extraCount = Math.max(0, total - faceStack.length);
  const orderedPosts = useMemo(() => {
    const pinned = posts.filter((p) => p.pinned);
    const rest = posts.filter((p) => !p.pinned);
    return [...pinned, ...rest];
  }, [posts]);

  const handlePost = async (text) => {
    const t = (text ?? draft).trim();
    if (!t || !authUserId) return;
    setDraft("");
    setAttaching(false);
    const { data, error } = await supabase
      .from("community_posts")
      .insert({ community_id: c.id, author_id: authUserId, text: t, has_image: attaching })
      .select("id, text, has_image, spark_count, pinned, created_at, author_id")
      .single();
    if (!error && data) {
      setPosts((ps) => [{ ...mapPostRow(data), who: myName || "You" }, ...ps]);
    }
  };

  const togglePostSpark = async (id) => {
    if (!authUserId) return;
    const already = postSparkIds.includes(id);
    setPostSparkIds((ids) => (already ? ids.filter((x) => x !== id) : [...ids, id]));
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, sparks: p.sparks + (already ? -1 : 1) } : p)));
    const { error } = already
      ? await supabase.from("community_post_sparks").delete().eq("post_id", id).eq("user_id", authUserId)
      : await supabase.from("community_post_sparks").insert({ post_id: id, user_id: authUserId });
    if (error) {
      setPostSparkIds((ids) => (already ? [...ids, id] : ids.filter((x) => x !== id)));
      setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, sparks: p.sparks + (already ? 1 : -1) } : p)));
    }
  };

  const togglePin = async (post) => {
    const currentlyPinned = posts.find((p) => p.pinned);
    if (currentlyPinned && currentlyPinned.id !== post.id) {
      await supabase.from("community_posts").update({ pinned: false }).eq("id", currentlyPinned.id);
    }
    const nextPinned = !post.pinned;
    await supabase.from("community_posts").update({ pinned: nextPinned }).eq("id", post.id);
    setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, pinned: nextPinned } : currentlyPinned && p.id === currentlyPinned.id ? { ...p, pinned: false } : p)));
  };

  const sendChat = async () => {
    const t = chatDraft.trim();
    if (!t || !authUserId) return;
    setChatDraft("");
    const { data, error } = await supabase
      .from("community_messages")
      .insert({ community_id: c.id, author_id: authUserId, text: t })
      .select("id, text, created_at, author_id")
      .single();
    if (!error && data) {
      setChatMessages((ms) => [...ms, { ...mapMessageRow(data), who: myName || "You" }]);
    }
  };

  return (
    <div className="relative flex-1 bg-zinc-950 flex flex-col min-h-0">
      <div className="relative z-10 flex flex-col min-h-0 overflow-y-auto no-scrollbar flex-1">
        <div className="flex items-center justify-between px-4 pt-4 pb-1 shrink-0">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-900"><ArrowLeft size={18} className="text-zinc-300" /></button>
          <div className="flex items-center gap-1.5">
            {trendRank && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2.5 py-1.5 rounded-full">
                <TrendingUp size={11} />#{trendRank} Trending
              </span>
            )}
            {isAdmin ? (
              <button onClick={() => setSettingsOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-900"><Settings size={15} className="text-zinc-300" /></button>
            ) : (
              <button onClick={onReport} className="text-xs text-zinc-400 hover:bg-zinc-900 px-2.5 py-1.5 rounded-full flex items-center gap-1"><Flag size={12} />Report</button>
            )}
          </div>
        </div>
        <div className="px-5 pt-3">
          <div className="mb-1 flex items-end justify-between">
            <div className="relative w-[72px] h-[72px] rounded-3xl flex items-center justify-center shrink-0">
              <div className={`${cm.tint} ${cm.text} w-full h-full rounded-[18px] flex items-center justify-center`}>
                <Icon size={28} />
              </div>
              {isLive && (
                <span className="absolute -bottom-1 -right-1.5 flex items-center gap-1 bg-emerald-400 text-zinc-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-4 ring-zinc-950">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />LIVE
                </span>
              )}
            </div>
            <button
              onClick={() => { if (!verified) { onBlocked(); return; } onJoinToggle(c.id); }}
              className={`mb-1 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0 ${joined ? "bg-zinc-800 text-zinc-300 border border-zinc-700" : "bg-violet-500 text-white"}`}
            >
              {joined ? "Joined ✓" : "Join"}
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2 mt-3 flex-wrap">
            <div className={`${cm.tint} ${cm.text} inline-flex px-2.5 py-1 rounded-full text-xs font-medium`}>{c.category}</div>
            {c.official && <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300"><BadgeCheck size={11} />Official club</div>}
            {isAdmin && <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300"><Crown size={11} />You created this</div>}
          </div>
          <h2 className="text-lg font-bold text-zinc-50">{c.name}</h2>
          <p className="text-sm text-zinc-400 mt-1.5">{c.desc}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
            <span className="mono text-zinc-400">@{handle}</span>
            <button onClick={() => setQrOpen(true)} className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200">
              <QrCode size={13} />QR
            </button>
            <button onClick={() => onSpark(c.id)} className={`flex items-center gap-1.5 mono px-2 py-1 rounded-full active:scale-90 transition-transform ${sparked ? "bg-orange-500/10 text-orange-400" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}>
              <Flame size={13} fill={sparked ? "currentColor" : "none"} />{sparks} interested
            </button>
          </div>
          <button onClick={() => setTab("members")} className="flex items-center gap-2.5 mt-4">
            <div className="flex -space-x-2.5">
              {faceStack.map((m, i) => (
                <div key={m.userId || i} className="ring-2 ring-zinc-950 rounded-full">
                  <Avatar label={m.name[0]} size={30} color={cat.color} />
                </div>
              ))}
              {extraCount > 0 && (
                <div className="ring-2 ring-zinc-950 rounded-full bg-zinc-800 w-[30px] h-[30px] flex items-center justify-center">
                  <span className="text-[9px] font-semibold text-zinc-300">+{extraCount}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-zinc-500"><span className="text-zinc-300 font-medium mono">{total}</span> members</span>
          </button>
          {matchedMembers.length > 0 && (
            <div className="mt-3 flex items-center gap-2 bg-violet-500/5 border border-violet-500/20 rounded-xl px-3 py-2">
              <Avatar label={matchedMembers[0].name[0]} size={26} />
              <p className="text-[11px] text-violet-300 leading-snug">
                <span className="font-semibold">{matchedMembers[0].name}</span> shares your interest in {matchedMembers[0].overlap.join(", ")}
                {matchedMembers.length > 1 && <> · +{matchedMembers.length - 1} more here</>}
              </p>
            </div>
          )}
          <div className="flex gap-1.5 mt-5">
            <button onClick={() => setTab("posts")} className={`flex-1 text-xs font-medium py-2 rounded-xl border ${tab === "posts" ? "bg-zinc-50 text-zinc-900 border-zinc-50" : "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>Posts</button>
            <button onClick={() => setTab("chat")} className={`flex-1 text-xs font-medium py-2 rounded-xl border ${tab === "chat" ? "bg-zinc-50 text-zinc-900 border-zinc-50" : "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>Chat</button>
            <button onClick={() => setTab("members")} className={`flex-1 text-xs font-medium py-2 rounded-xl border ${tab === "members" ? "bg-zinc-50 text-zinc-900 border-zinc-50" : "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>Members · {total}</button>
          </div>
        </div>
        {tab === "chat" && (
          <div className="flex flex-col h-[420px]">
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-3 space-y-2.5">
              {!joined && (
                <p className="text-xs text-zinc-500 text-center py-6">Join this {c.official ? "club" : "community"} to send messages — you can still read along.</p>
              )}
              {chatMessages.map((m) => (
                <div key={m.id} className="flex gap-2.5">
                  <Avatar label={m.who[0]} size={30} color={cat.color} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300"><span className="font-medium text-zinc-100">{m.who}</span></p>
                    <p className="text-sm text-zinc-300">{m.text}</p>
                    <p className="text-[11px] text-zinc-500 mono mt-0.5">{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            {joined && (
              <div className="flex items-center gap-2 px-5 py-3 border-t border-zinc-900">
                <input
                  value={chatDraft} onChange={(e) => setChatDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" || !chatDraft.trim()) return;
                    sendChat();
                  }}
                  placeholder="Message the group"
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-full px-4 py-2 text-sm outline-none focus:border-violet-500"
                />
                <button
                  onClick={sendChat}
                  className="w-9 h-9 rounded-full bg-violet-500 text-white flex items-center justify-center shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            )}
          </div>
        )}
        {tab === "posts" && (
          <div className="px-5 pt-4 pb-6">
            {joined && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  {["👍", "🔥", "😂", "🙌", "❤️"].map((emoji) => (
                    <button key={emoji} onClick={() => handlePost(emoji)} className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-sm active:scale-90 transition-transform">
                      {emoji}
                    </button>
                  ))}
                </div>
                <textarea
                  value={draft} onChange={(e) => setDraft(e.target.value)}
                  placeholder="Share something with the community..."
                  rows={2}
                  className="w-full bg-transparent text-zinc-100 placeholder-zinc-600 text-sm outline-none resize-none"
                />
                {attaching && (
                  <div className="flex items-center gap-2 mt-1.5 mb-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 w-fit">
                    <ImageIcon size={13} className="text-zinc-500" />
                    <span className="text-[11px] text-zinc-500">Photo attached</span>
                    <button onClick={() => setAttaching(false)}><X size={12} className="text-zinc-600" /></button>
                  </div>
                )}
                <div className="flex items-center justify-between mt-1.5">
                  <button onClick={() => setAttaching((v) => !v)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${attaching ? "bg-violet-500/15 text-violet-400" : "text-zinc-500 hover:bg-zinc-800"}`}>
                    <Camera size={16} />
                  </button>
                  <button disabled={!draft.trim()} onClick={() => handlePost()} className="px-4 py-1.5 rounded-lg bg-violet-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 text-xs font-semibold">Post</button>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {orderedPosts.map((p) => {
                const isPinned = p.pinned;
                const postSparked = postSparkIds.includes(p.id);
                return (
                  <div key={p.id} className={`flex gap-2.5 ${isPinned ? `${cm.tint} border border-zinc-800/60 -mx-2 px-3 py-2.5 rounded-xl` : ""}`}>
                    <Avatar label={p.who[0]} size={32} color={cat.color} ring={p.authorId === c.creatorId} />
                    <div className="flex-1 min-w-0">
                      {isPinned && <p className={`text-[10px] ${cm.text} font-semibold flex items-center gap-1 mb-0.5`}><Pin size={10} />Pinned</p>}
                      <p className="text-sm text-zinc-300"><span className="font-medium text-zinc-100">{p.who}</span> {p.text}</p>
                      {p.hasImage && (
                        <div className="mt-1.5 h-24 w-full max-w-[220px] rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <ImageIcon size={18} className="text-zinc-700" />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-[11px] text-zinc-500 mono">{p.time}</p>
                        <button onClick={() => togglePostSpark(p.id)} className={`flex items-center gap-1 text-[11px] mono active:scale-90 transition-transform ${postSparked ? "text-orange-400" : "text-zinc-500 hover:text-orange-400"}`}>
                          <Flame size={11} fill={postSparked ? "currentColor" : "none"} />{p.sparks || 0}
                        </button>
                        {isAdmin && (
                          <button onClick={() => togglePin(p)} className="text-[11px] text-zinc-500 hover:text-violet-400 flex items-center gap-0.5">
                            <Pin size={11} />{isPinned ? "Unpin" : "Pin"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab === "members" && (
          <div className="px-5 pt-4 pb-6">
            {!memberQuery && recentlyJoined.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  Recently joined
                </p>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {recentlyJoined.map((m) => (
                    <div key={m.userId} className="flex flex-col items-center gap-1 w-14 shrink-0">
                      <Avatar label={m.name[0]} size={40} color={cat.color} />
                      <p className="text-[10px] text-zinc-400 truncate w-full text-center">{m.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 mb-4">
              <Search size={14} className="text-zinc-500 shrink-0" />
              <input value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} placeholder="Search members" className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-600 text-sm outline-none" />
            </div>
            <div className="space-y-1">
              {filteredMembers.map((m) => {
                const overlap = interests ? (m.interests || []).filter((s) => interests.includes(s)) : [];
                return (
                  <div key={m.userId} className="flex items-center gap-3 py-2">
                    <Avatar label={m.name[0]} size={36} color={cat.color} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{m.name}</p>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                        {m.role === "Creator" && <Crown size={10} className="text-amber-400" />}{m.role}
                        {overlap.length > 0 && <span className="text-violet-400">· shares {overlap.join(", ")}</span>}
                      </p>
                    </div>
                    {isAdmin && m.role !== "Creator" && (
                      <button className="text-[11px] text-zinc-500 hover:text-rose-400 shrink-0">Remove</button>
                    )}
                  </div>
                );
              })}
              {filteredMembers.length === 0 && <p className="text-sm text-zinc-500 text-center py-8">No members match "{memberQuery}".</p>}
            </div>
          </div>
        )}
      {settingsOpen && (
        <CommunitySettings
          c={c}
          onClose={() => setSettingsOpen(false)}
          onSave={(updates) => { onUpdate(c.id, updates); setSettingsOpen(false); }}
          onDelete={() => onDelete(c.id)}
        />
      )}
      {qrOpen && (
        <div className="absolute inset-0 bg-black/60 z-[60] flex items-center justify-center px-6" onClick={() => setQrOpen(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xs p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold text-zinc-100 mb-1">{c.name}</p>
            <p className="text-xs text-zinc-500 mb-4">@{handle}</p>
            <div className="bg-white rounded-xl p-4 inline-block">
              <QRCodeSVG value={`https://orbit.app/${c.official ? "club" : "c"}/${handle}`} size={180} />
            </div>
            <p className="text-[11px] text-zinc-500 mt-4">Scan to open this {c.official ? "club" : "community"} on Orbit</p>
            <button onClick={() => setQrOpen(false)} className="w-full mt-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-sm font-medium">Close</button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
