import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft, Settings, Crown, Heart, Search, Pin, Camera, Flag, X,
  Trash2, QrCode, BadgeCheck, Sticker, Loader2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { CATEGORIES, COLOR_MAP } from "../data/constants.js";
import { handleFor, compactCount, safeFileName } from "../utils/helpers.js";
import { Avatar, btnPrimary, btnSecondary } from "./Common.jsx";
import { CommunityMark } from "./Home.jsx";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";
import { demoMembersFor, demoPostsFor, demoMessagesFor } from "../data/demoData.js";

// See the DEMO note in App.jsx — local sample data when no backend is configured.
const DEMO = !isSupabaseConfigured || import.meta.env.VITE_PREVIEW === "1";

const field =
  "w-full bg-surface-2 border border-line text-fg placeholder-fg-subtle rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors";

export function CommunitySettings({ c, onSave, onDelete, onClose }) {
  const [name, setName] = useState(c.name);
  const [desc, setDesc] = useState(c.desc);
  const [category, setCategory] = useState(c.category);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(c.avatarUrl || null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const pickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!name.trim()) return;
    const updates = {
      name: name.trim(),
      desc: desc.trim() || "No description yet.",
      category,
      tags: [category],
    };
    if (avatarFile) {
      setSavingAvatar(true);
      const path = `${c.id}/${Date.now()}-${safeFileName(avatarFile.name)}`;
      const { error: upErr } = await supabase.storage
        .from("community-avatars")
        .upload(path, avatarFile, { upsert: true });
      if (!upErr) {
        const { data: pub } = supabase.storage.from("community-avatars").getPublicUrl(path);
        if (pub?.publicUrl) updates.avatarUrl = pub.publicUrl;
      }
      setSavingAvatar(false);
    }
    onSave(updates);
  };

  return (
    <div
      className="absolute inset-0 bg-black/50 dark:bg-black/70 z-[70] flex items-end animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Community settings"
        className="animate-rise-in w-full bg-surface border-t border-line rounded-t-3xl max-h-[85%] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
          <div className="flex items-center justify-between mb-5">
            <p className="font-semibold text-fg">Community settings</p>
            <button onClick={onClose} aria-label="Close">
              <X size={18} className="text-fg-subtle" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-2 border border-line flex items-center justify-center shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <Camera size={20} className="text-fg-subtle" />
              )}
            </div>
            <label className="text-sm text-accent font-medium cursor-pointer">
              {avatarPreview ? "Change photo" : "Add a photo"}
              <input type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
            </label>
          </div>

          <div className="space-y-3 mb-5">
            <div>
              <label className="text-xs text-fg-muted mb-1.5 block">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                className={field}
              />
            </div>
            <div>
              <label className="text-xs text-fg-muted mb-1.5 block">Description</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                maxLength={800}
                className={`${field} resize-none`}
              />
            </div>
            <div>
              <label className="text-xs text-fg-muted mb-1.5 block">Category</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className={`text-xs px-3.5 py-2 rounded-full shrink-0 font-medium transition-colors ${
                      category === cat.name
                        ? "bg-inverse text-inverse-fg"
                        : "bg-surface-2 text-fg-muted"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={save}
            disabled={!name.trim() || savingAvatar}
            className="w-full py-3 rounded-xl bg-accent disabled:bg-surface-2 text-accent-fg disabled:text-fg-subtle text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {savingAvatar && <Loader2 size={14} className="animate-spin" />}
            {savingAvatar ? "Uploading…" : "Save changes"}
          </button>

          <div className="mt-5 pt-5 border-t border-line">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full py-2.5 text-sm text-rose-600 dark:text-rose-400 font-medium"
              >
                Delete community
              </button>
            ) : (
              <div className="border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/5 rounded-xl p-4">
                <p className="text-xs text-rose-700 dark:text-rose-300 mb-3 leading-relaxed">
                  This deletes the community for everyone. It can't be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2.5 rounded-lg bg-surface border border-line text-fg text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onDelete}
                    className="flex-1 py-2.5 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                  >
                    Yes, delete
                  </button>
                </div>
              </div>
            )}
          </div>
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
    imageUrl: row.image_url,
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
    imageUrl: row.image_url,
    pinned: row.pinned,
  };
}

export function CommunityDetail({
  c, joined, onJoinToggle, onClose, onReport, verified, onBlocked,
  onUpdate, onDelete, interests, authUserId, myName,
}) {
  const cat = CATEGORIES.find((x) => x.name === c.category) || CATEGORIES[0];
  const cm = COLOR_MAP[cat.color];
  const Icon = cat.icon;
  const isAdmin = !!authUserId && c.creatorId === authUserId;

  const [tab, setTab] = useState("posts");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [postImageFile, setPostImageFile] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [postingImage, setPostingImage] = useState(false);
  // DB handle, not a recomputed one — the QR must resolve.
  const handle = c.handle || handleFor(c.name, c.id);
  const [chatDraft, setChatDraft] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [memberQuery, setMemberQuery] = useState("");
  const [postSparkIds, setPostSparkIds] = useState([]);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]); // [{ userId, name, interests, joinedAt }]
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const [stickers, setStickers] = useState([]);
  const [stickersLoaded, setStickersLoaded] = useState(false);
  const [uploadingSticker, setUploadingSticker] = useState(false);
  const chatScrollRef = useRef(null);

  // Realtime payloads have no profiles join, so authors arrive as "Someone".
  const nameCacheRef = useRef(new Map());
  const resolveAuthorName = useCallback(async (authorId) => {
    if (!authorId) return "Someone";
    const cached = nameCacheRef.current.get(authorId);
    if (cached) return cached;
    const { data } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", authorId)
      .single();
    const resolved = data?.name || "Someone";
    nameCacheRef.current.set(authorId, resolved);
    return resolved;
  }, []);

  useEffect(() => {
    if (DEMO) {
      setPosts(demoPostsFor(c.id));
      setChatMessages(demoMessagesFor(c.id));
      setMembers(demoMembersFor(c.id, c.members));
      return;
    }
    let cancelled = false;

    // Stale JWT scopes the request as anon and returns [] with a 200, wiping real data.
    const ready = supabase.auth.getSession();

    const loadMembers = async () => {
      const { data } = await supabase
        .from("community_members")
        .select("user_id, joined_at, profiles(name, interests)")
        .eq("community_id", c.id)
        .order("joined_at", { ascending: true });
      if (!cancelled && data) {
        data.forEach((r) => {
          if (r.profiles?.name) nameCacheRef.current.set(r.user_id, r.profiles.name);
        });
        setMembers(
          data.map((r) => ({
            userId: r.user_id,
            name: r.profiles?.name || "Someone",
            interests: r.profiles?.interests || [],
            joinedAt: r.joined_at,
          }))
        );
      }
    };

    ready.then(() => {
      if (cancelled) return;

      (async () => {
        const { data } = await supabase
          .from("community_posts")
          .select("id, text, image_url, spark_count, pinned, created_at, author_id, profiles(name)")
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
          .select("id, text, image_url, created_at, author_id, pinned, profiles(name)")
          .eq("community_id", c.id)
          .order("created_at", { ascending: true });
        if (!cancelled && data) setChatMessages(data.map(mapMessageRow));
      })();

      loadMembers();
    });

    const channel = supabase
      .channel(`community-${c.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_posts", filter: `community_id=eq.${c.id}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setPosts((ps) => ps.filter((p) => p.id !== payload.old.id));
            return;
          }
          const mappedPost = mapPostRow(payload.new);
          setPosts((ps) => {
            const exists = ps.some((p) => p.id === mappedPost.id);
            return exists
              ? ps.map((p) => (p.id === mappedPost.id ? { ...p, ...mappedPost, who: p.who } : p))
              : [mappedPost, ...ps];
          });
          if (payload.eventType === "INSERT" && payload.new.author_id !== authUserId) {
            resolveAuthorName(payload.new.author_id).then((who) => {
              if (!cancelled) {
                setPosts((ps) => ps.map((p) => (p.id === mappedPost.id ? { ...p, who } : p)));
              }
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_messages", filter: `community_id=eq.${c.id}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setChatMessages((ms) => ms.filter((m) => m.id !== payload.old.id));
            return;
          }
          const mappedMsg = mapMessageRow(payload.new);
          setChatMessages((ms) => {
            const exists = ms.some((m) => m.id === mappedMsg.id);
            return exists
              ? ms.map((m) => (m.id === mappedMsg.id ? { ...m, ...mappedMsg, who: m.who } : m))
              : [...ms, mappedMsg];
          });
          if (payload.eventType === "INSERT" && payload.new.author_id !== authUserId) {
            resolveAuthorName(payload.new.author_id).then((who) => {
              if (!cancelled) {
                setChatMessages((ms) =>
                  ms.map((m) => (m.id === mappedMsg.id ? { ...m, who } : m))
                );
              }
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_members", filter: `community_id=eq.${c.id}` },
        () => loadMembers()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.id]);

  // Pin chat to newest. scrollTop, not scrollIntoView, which drags the page scroller.
  useEffect(() => {
    const el = chatScrollRef.current;
    if (tab === "chat" && el) el.scrollTop = el.scrollHeight;
  }, [chatMessages, tab]);

  const total = members.length || c.members;

  const filteredMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    const list = members.map((m) => ({
      ...m,
      role: m.userId === c.creatorId ? "Creator" : "Member",
    }));
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
    const file = postImageFile;
    // An image on its own is a valid post; only block when there's neither.
    if ((!t && !file) || !authUserId) return;
    setDraft("");
    setPostImageFile(null);
    setPostImagePreview(null);

    if (DEMO) {
      setPosts((ps) => [
        { id: `demo-p-${Date.now()}`, who: myName || "You", authorId: authUserId,
          text: t, time: "now", imageUrl: file ? URL.createObjectURL(file) : null,
          sparks: 0, pinned: false },
        ...ps,
      ]);
      return;
    }

    let imageUrl = null;
    if (file) {
      setPostingImage(true);
      const path = `${authUserId}/${Date.now()}-${safeFileName(file.name)}`;
      const { error: upErr } = await supabase.storage.from("community-media").upload(path, file);
      if (!upErr) {
        const { data: pub } = supabase.storage.from("community-media").getPublicUrl(path);
        imageUrl = pub?.publicUrl || null;
      }
      setPostingImage(false);
    }

    const { data, error } = await supabase
      .from("community_posts")
      .insert({ community_id: c.id, author_id: authUserId, text: t, image_url: imageUrl })
      .select("id, text, image_url, spark_count, pinned, created_at, author_id")
      .single();
    if (!error && data) {
      setPosts((ps) => [{ ...mapPostRow(data), who: myName || "You" }, ...ps]);
    }
  };

  const deletePost = async (post) => {
    if (!(post.authorId === authUserId || isAdmin)) return;
    const prev = posts;
    setPosts((ps) => ps.filter((p) => p.id !== post.id));
    if (DEMO) return;
    const { error } = await supabase.from("community_posts").delete().eq("id", post.id);
    if (error) setPosts(prev);
  };

  const deleteMessage = async (message) => {
    if (!(message.authorId === authUserId || isAdmin)) return;
    const prev = chatMessages;
    setChatMessages((ms) => ms.filter((m) => m.id !== message.id));
    if (DEMO) return;
    const { error } = await supabase.from("community_messages").delete().eq("id", message.id);
    if (error) setChatMessages(prev);
  };

  const loadStickers = async () => {
    if (DEMO) {
      setStickers([]);
      setStickersLoaded(true);
      return;
    }
    const { data } = await supabase
      .from("stickers")
      .select("id, image_url")
      .order("created_at", { ascending: false });
    setStickers(data || []);
    setStickersLoaded(true);
  };

  const uploadSticker = async (file) => {
    if (!authUserId || !file) return;
    setUploadingSticker(true);
    const path = `${authUserId}/${Date.now()}-${safeFileName(file.name)}`;
    const { error: upErr } = await supabase.storage.from("stickers").upload(path, file);
    if (!upErr) {
      const { data: pub } = supabase.storage.from("stickers").getPublicUrl(path);
      if (pub?.publicUrl) {
        const { data, error } = await supabase
          .from("stickers")
          .insert({ uploader_id: authUserId, image_url: pub.publicUrl })
          .select("id, image_url")
          .single();
        if (!error && data) setStickers((s) => [data, ...s]);
      }
    }
    setUploadingSticker(false);
  };

  const sendSticker = async (sticker) => {
    if (!authUserId) return;
    setStickerPickerOpen(false);
    const { data, error } = await supabase
      .from("community_messages")
      .insert({ community_id: c.id, author_id: authUserId, text: "", image_url: sticker.image_url })
      .select("id, text, image_url, created_at, author_id")
      .single();
    if (!error && data) {
      setChatMessages((ms) => [...ms, { ...mapMessageRow(data), who: myName || "You" }]);
    }
  };

  const togglePostSpark = async (id) => {
    if (!authUserId) return;
    const already = postSparkIds.includes(id);
    setPostSparkIds((ids) => (already ? ids.filter((x) => x !== id) : [...ids, id]));
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, sparks: p.sparks + (already ? -1 : 1) } : p)));
    if (DEMO) return;
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
    if (DEMO) {
      const next = !post.pinned;
      setPosts((ps) =>
        ps.map((p) =>
          p.id === post.id ? { ...p, pinned: next } : { ...p, pinned: false }
        )
      );
      return;
    }
    if (currentlyPinned && currentlyPinned.id !== post.id) {
      await supabase.from("community_posts").update({ pinned: false }).eq("id", currentlyPinned.id);
    }
    const nextPinned = !post.pinned;
    await supabase.from("community_posts").update({ pinned: nextPinned }).eq("id", post.id);
    setPosts((ps) =>
      ps.map((p) =>
        p.id === post.id
          ? { ...p, pinned: nextPinned }
          : currentlyPinned && p.id === currentlyPinned.id
            ? { ...p, pinned: false }
            : p
      )
    );
  };

  const togglePinMessage = async (message) => {
    const currentlyPinned = chatMessages.find((m) => m.pinned);
    if (DEMO) {
      const next = !message.pinned;
      setChatMessages((ms) =>
        ms.map((m) =>
          m.id === message.id ? { ...m, pinned: next } : { ...m, pinned: false }
        )
      );
      return;
    }
    if (currentlyPinned && currentlyPinned.id !== message.id) {
      await supabase.from("community_messages").update({ pinned: false }).eq("id", currentlyPinned.id);
    }
    const nextPinned = !message.pinned;
    await supabase.from("community_messages").update({ pinned: nextPinned }).eq("id", message.id);
    setChatMessages((ms) =>
      ms.map((m) =>
        m.id === message.id
          ? { ...m, pinned: nextPinned }
          : currentlyPinned && m.id === currentlyPinned.id
            ? { ...m, pinned: false }
            : m
      )
    );
  };

  const removeMember = async (member) => {
    if (!isAdmin) return;
    const prev = members;
    setMembers((ms) => ms.filter((m) => m.userId !== member.userId));
    if (DEMO) return;
    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", c.id)
      .eq("user_id", member.userId);
    if (error) setMembers(prev);
  };

  const sendChat = async () => {
    const t = chatDraft.trim();
    if (!t || !authUserId) return;
    setChatDraft("");
    if (DEMO) {
      setChatMessages((ms) => [
        ...ms,
        { id: `demo-m-${Date.now()}`, who: myName || "You", authorId: authUserId,
          text: t, time: "now", imageUrl: null, pinned: false },
      ]);
      return;
    }
    const { data, error } = await supabase
      .from("community_messages")
      .insert({ community_id: c.id, author_id: authUserId, text: t })
      .select("id, text, image_url, created_at, author_id")
      .single();
    if (!error && data) {
      setChatMessages((ms) => [...ms, { ...mapMessageRow(data), who: myName || "You" }]);
    }
  };

  // IG's underline tab strip — the label carries the state, no boxed segments.
  const tabClass = (isOn) =>
    `flex-1 text-sm font-semibold py-3 border-b-2 -mb-px transition-colors ${
      isOn ? "border-fg text-fg" : "border-transparent text-fg-subtle"
    }`;

  const pinnedMessage = chatMessages.find((m) => m.pinned);
  const kind = c.official ? "club" : "community";
  const iconBtn = "w-8 h-8 flex items-center justify-center text-fg active:opacity-50";

  return (
    <div className="flex-1 bg-canvas flex flex-col min-h-0">
      <div className="flex flex-col min-h-0 overflow-y-auto no-scrollbar flex-1 pb-28">
        <div
          className="flex items-center gap-3 px-4 pb-3 border-b border-line shrink-0"
          style={{ paddingTop: "max(0.875rem, env(safe-area-inset-top))" }}
        >
          <button onClick={onClose} aria-label="Back" className={`${iconBtn} -ml-1.5`}>
            <ArrowLeft size={22} strokeWidth={1.9} />
          </button>
          <p className="flex-1 min-w-0 text-base font-semibold text-fg truncate">{c.name}</p>
          {isAdmin ? (
            <button onClick={() => setSettingsOpen(true)} aria-label="Settings" className={iconBtn}>
              <Settings size={20} strokeWidth={1.9} />
            </button>
          ) : (
            <button onClick={onReport} aria-label="Report" className={iconBtn}>
              <Flag size={19} strokeWidth={1.9} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-7 px-4 pt-4">
          <CommunityMark community={c} size={80} />
          <div className="flex-1 flex justify-around text-center">
            <div>
              <p className="text-[17px] font-semibold text-fg mono leading-tight">
                {compactCount(total)}
              </p>
              <p className="text-[13px] text-fg mt-0.5">members</p>
            </div>
            <div>
              <p className="text-[17px] font-semibold text-fg mono leading-tight">
                {compactCount(posts.length)}
              </p>
              <p className="text-[13px] text-fg mt-0.5">posts</p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-fg">{c.name}</p>
            {c.official && <BadgeCheck size={14} className="text-accent shrink-0" />}
            {isAdmin && (
              <span className="inline-flex items-center gap-1 text-[13px] text-fg-subtle">
                <Crown size={11} />
                you created this
              </span>
            )}
          </div>
          <p className="text-[13px] text-fg-subtle">{c.category}</p>
          <p className="text-sm text-fg mt-1 leading-snug">{c.desc}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[13px] text-fg-subtle mono">@{handle}</span>
            <button
              onClick={() => setQrOpen(true)}
              className="flex items-center gap-1 text-[13px] text-accent font-semibold"
            >
              <QrCode size={13} />
              QR
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                if (!verified) {
                  onBlocked();
                  return;
                }
                onJoinToggle(c.id);
              }}
              className={`${joined ? btnSecondary : btnPrimary} flex-1 py-1.5`}
            >
              {joined ? "Joined" : "Join"}
            </button>
            <button onClick={() => setTab("chat")} className={`${btnSecondary} flex-1 py-1.5`}>
              Message
            </button>
          </div>

          {faceStack.length > 0 && (
            <button onClick={() => setTab("members")} className="flex items-center gap-2 mt-4">
              <div className="flex -space-x-2">
                {faceStack.map((m, i) => (
                  <div key={m.userId || i} className="ring-2 ring-canvas rounded-full">
                    <Avatar label={m.name[0]} size={22} color={cat.color} />
                  </div>
                ))}
              </div>
              <span className="text-[13px] text-fg-subtle truncate">
                Joined by {faceStack[0].name}
                {extraCount > 0 && ` and ${compactCount(extraCount)} others`}
              </span>
            </button>
          )}

          {matchedMembers.length > 0 && (
            <p className="text-[13px] text-fg-subtle mt-2 leading-snug">
              <span className="text-fg font-semibold">{matchedMembers[0].name}</span> shares your
              interest in {matchedMembers[0].overlap.join(", ")}
              {matchedMembers.length > 1 && ` · +${matchedMembers.length - 1} more here`}
            </p>
          )}
        </div>

        <div className="flex border-t border-line mt-5 px-4">
          <button onClick={() => setTab("posts")} className={tabClass(tab === "posts")}>
            Posts
          </button>
          <button onClick={() => setTab("chat")} className={tabClass(tab === "chat")}>
            Chat
          </button>
          <button onClick={() => setTab("members")} className={tabClass(tab === "members")}>
            Members
          </button>
        </div>

        {tab === "chat" && (
          <div className="flex flex-col h-[55vh] min-h-[320px]">
            {pinnedMessage && (
              <div className="flex items-start gap-2 px-4 py-2.5 border-b border-line bg-surface-2">
                <Pin size={12} className="text-fg-subtle mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-fg-subtle font-semibold">
                    Pinned · {pinnedMessage.who}
                  </p>
                  <p className="text-[13px] text-fg truncate">{pinnedMessage.text}</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => togglePinMessage(pinnedMessage)}
                    className="text-[11px] text-accent font-semibold shrink-0"
                  >
                    Unpin
                  </button>
                )}
              </div>
            )}

            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-3"
            >
              {!authUserId ? (
                <p className="text-[13px] text-fg-muted text-center py-6">
                  Chat is only visible to verified students.
                </p>
              ) : !joined ? (
                <p className="text-[13px] text-fg-muted text-center py-6">
                  Join this {kind} to send messages — you can still read along.
                </p>
              ) : null}
              {chatMessages.map((m) => {
                const mine = m.authorId === authUserId;
                return (
                  <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                    {!mine && <Avatar label={m.who[0]} size={28} color={cat.color} />}
                    <div className={`max-w-[75%] min-w-0 flex flex-col ${mine ? "items-end" : ""}`}>
                      {!mine && <p className="text-[11px] text-fg-subtle mb-0.5 px-1">{m.who}</p>}
                      {m.text && (
                        <p
                          className={`text-sm px-3 py-2 rounded-2xl leading-snug break-words ${
                            mine ? "bg-accent text-accent-fg" : "bg-surface-3 text-fg"
                          }`}
                        >
                          {m.text}
                        </p>
                      )}
                      {m.imageUrl && (
                        <img
                          src={m.imageUrl}
                          alt=""
                          loading="lazy"
                          className="mt-1 max-h-32 max-w-[160px] rounded-xl object-contain"
                        />
                      )}
                      <div className="flex items-center gap-2 mt-0.5 px-1">
                        <p className="text-[11px] text-fg-subtle mono">{m.time}</p>
                        {isAdmin && (
                          <button
                            onClick={() => togglePinMessage(m)}
                            className="text-[11px] text-fg-subtle active:opacity-50"
                          >
                            {m.pinned ? "Unpin" : "Pin"}
                          </button>
                        )}
                        {(mine || isAdmin) && (
                          <button
                            onClick={() => deleteMessage(m)}
                            aria-label="Delete message"
                            className="text-fg-subtle active:opacity-50"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {stickerPickerOpen && (
              <div className="border-t border-line px-4 py-3">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[11px] font-semibold text-fg-subtle uppercase tracking-wide">
                    Stickers
                  </p>
                  <label className="text-[13px] text-accent font-semibold flex items-center gap-1 cursor-pointer">
                    {uploadingSticker ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Camera size={12} />
                    )}
                    Add one
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingSticker}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadSticker(f);
                      }}
                    />
                  </label>
                </div>
                {!stickersLoaded ? (
                  <p className="text-[13px] text-fg-subtle py-3 text-center">Loading…</p>
                ) : stickers.length === 0 ? (
                  <p className="text-[13px] text-fg-subtle py-3 text-center">
                    No stickers yet — add the first one.
                  </p>
                ) : (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {stickers.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => sendSticker(st)}
                        className="w-14 h-14 rounded-xl bg-surface-2 overflow-hidden shrink-0 active:scale-90 transition-transform"
                      >
                        <img
                          src={st.image_url}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {joined && (
              <div className="flex items-center gap-2 px-4 py-3 border-t border-line">
                <button
                  onClick={() => {
                    setStickerPickerOpen((v) => !v);
                    if (!stickersLoaded) loadStickers();
                  }}
                  aria-label="Stickers"
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    stickerPickerOpen ? "text-accent" : "text-fg-muted"
                  }`}
                >
                  <Sticker size={20} strokeWidth={1.9} />
                </button>
                <input
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendChat();
                  }}
                  placeholder="Message…"
                  maxLength={1000}
                  className="flex-1 min-w-0 bg-transparent border border-line text-fg placeholder-fg-subtle rounded-full px-4 py-2 text-sm outline-none focus:border-line-strong transition-colors"
                />
                <button
                  onClick={sendChat}
                  disabled={!chatDraft.trim()}
                  className="text-sm font-semibold text-accent disabled:opacity-40 shrink-0 px-1"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "posts" && (
          <div className="pt-3">
            {joined && (
              <div className="px-4 pb-4 border-b border-line">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Share something with the community…"
                  rows={2}
                  maxLength={2000}
                  className="w-full bg-transparent text-fg placeholder-fg-subtle text-sm outline-none resize-none"
                />
                {postImagePreview && (
                  <div className="relative mt-2 mb-1 w-fit">
                    <img src={postImagePreview} alt="" className="h-24 rounded-lg object-cover" />
                    <button
                      onClick={() => {
                        setPostImageFile(null);
                        setPostImagePreview(null);
                      }}
                      aria-label="Remove image"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-fg text-canvas flex items-center justify-center"
                    >
                      <X size={11} />
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between mt-1">
                  <label className="w-9 h-9 flex items-center justify-center cursor-pointer text-fg-muted">
                    <Camera size={20} strokeWidth={1.9} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setPostImageFile(file);
                        setPostImagePreview(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                  <button
                    disabled={(!draft.trim() && !postImageFile) || postingImage}
                    onClick={() => handlePost()}
                    className="text-sm font-semibold text-accent disabled:opacity-40 flex items-center gap-1.5 px-1"
                  >
                    {postingImage && <Loader2 size={12} className="animate-spin" />}
                    {postingImage ? "Posting…" : "Post"}
                  </button>
                </div>
              </div>
            )}

            {!authUserId ? (
              <p className="text-[13px] text-fg-muted text-center py-10 leading-relaxed">
                Posts are only visible to verified students.
                <br />
                Verify your account to read along.
              </p>
            ) : orderedPosts.length === 0 ? (
              <p className="text-[13px] text-fg-muted text-center py-10">
                No posts yet{joined ? " — start the conversation." : "."}
              </p>
            ) : null}

            {orderedPosts.map((p) => {
              const postSparked = postSparkIds.includes(p.id);
              return (
                <article key={p.id} className="border-b border-line py-3">
                  {p.pinned && (
                    <p className="text-[11px] text-fg-subtle font-semibold flex items-center gap-1 px-4 pb-1.5">
                      <Pin size={10} />
                      Pinned
                    </p>
                  )}
                  <div className="flex items-center gap-2.5 px-4">
                    <Avatar
                      label={p.who[0]}
                      size={32}
                      color={cat.color}
                      ring={p.authorId === c.creatorId}
                    />
                    <p className="text-sm font-semibold text-fg flex-1 min-w-0 truncate">{p.who}</p>
                    <p className="text-[13px] text-fg-subtle mono shrink-0">{p.time}</p>
                  </div>

                  {p.text && <p className="text-sm text-fg px-4 mt-2 leading-relaxed">{p.text}</p>}
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt=""
                      loading="lazy"
                      className="w-full max-h-80 object-cover mt-2"
                    />
                  )}

                  <div className="flex items-center gap-4 px-4 mt-2.5">
                    <button
                      onClick={() => togglePostSpark(p.id)}
                      aria-label={postSparked ? "Remove like" : "Like"}
                      className="flex items-center gap-1.5 active:opacity-50 transition-opacity"
                    >
                      <Heart
                        size={20}
                        strokeWidth={1.9}
                        className={postSparked ? "text-rose-500" : "text-fg"}
                        fill={postSparked ? "currentColor" : "none"}
                      />
                      <span className="text-[13px] font-semibold text-fg mono">{p.sparks || 0}</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => togglePin(p)}
                        className="text-[13px] text-fg-subtle active:opacity-50"
                      >
                        {p.pinned ? "Unpin" : "Pin"}
                      </button>
                    )}
                    {(p.authorId === authUserId || isAdmin) && (
                      <button
                        onClick={() => deletePost(p)}
                        aria-label="Delete post"
                        className="text-fg-subtle active:opacity-50 ml-auto"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {tab === "members" && (
          <div className="pt-3">
            {!memberQuery && recentlyJoined.length > 0 && (
              <div className="pb-3 border-b border-line">
                <p className="text-sm font-semibold text-fg px-4 mb-3">Recently joined</p>
                <div className="flex gap-4 overflow-x-auto no-scrollbar px-4">
                  {recentlyJoined.map((m) => (
                    <div key={m.userId} className="flex flex-col items-center gap-1.5 w-16 shrink-0">
                      <Avatar label={m.name[0]} size={56} color={cat.color} />
                      <p className="text-[11px] text-fg truncate w-full text-center">{m.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-4 py-3">
              <div className="flex items-center gap-2 bg-surface-3 rounded-lg px-3 py-2">
                <Search size={16} className="text-fg-subtle shrink-0" />
                <input
                  value={memberQuery}
                  onChange={(e) => setMemberQuery(e.target.value)}
                  placeholder="Search members"
                  className="flex-1 min-w-0 bg-transparent text-fg placeholder-fg-subtle text-sm outline-none"
                />
              </div>
            </div>

            {filteredMembers.map((m) => {
              const overlap = interests
                ? (m.interests || []).filter((x) => interests.includes(x))
                : [];
              return (
                <div key={m.userId} className="flex items-center gap-3 px-4 py-2">
                  <Avatar label={m.name[0]} size={44} color={cat.color} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-fg truncate">{m.name}</p>
                    <p className="text-[13px] text-fg-subtle flex items-center gap-1 truncate">
                      {m.role === "Creator" && <Crown size={11} className="shrink-0" />}
                      {m.role}
                      {overlap.length > 0 && ` · shares ${overlap.join(", ")}`}
                    </p>
                  </div>
                  {isAdmin && m.role !== "Creator" && (
                    <button
                      onClick={() => removeMember(m)}
                      className={`${btnSecondary} shrink-0 text-[13px]`}
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
            {filteredMembers.length === 0 && (
              <p className="text-[13px] text-fg-muted text-center py-8">
                {!authUserId
                  ? "The member list is only visible to verified students."
                  : memberQuery
                    ? `No members match "${memberQuery}".`
                    : "No members yet."}
              </p>
            )}
          </div>
        )}
      </div>

      {settingsOpen && (
        <CommunitySettings
          c={c}
          onClose={() => setSettingsOpen(false)}
          onSave={(updates) => {
            onUpdate(c.id, updates);
            setSettingsOpen(false);
          }}
          onDelete={() => onDelete(c.id)}
        />
      )}

      {qrOpen && (
        <div
          className="absolute inset-0 bg-black/50 dark:bg-black/75 z-[60] flex items-center justify-center px-8 animate-fade-in"
          onClick={() => setQrOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="animate-rise-in bg-surface border border-line rounded-2xl w-full max-w-xs p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold text-fg mb-1">{c.name}</p>
            <p className="text-[13px] text-fg-subtle mb-5 mono">@{handle}</p>
            <div className="bg-white rounded-xl p-4 inline-block">
              <QRCodeSVG
                value={`https://orbit.app/${c.official ? "club" : "c"}/${handle}`}
                size={180}
              />
            </div>
            <p className="text-[13px] text-fg-muted mt-5">Scan to open this {kind} on Orbit</p>
            <button onClick={() => setQrOpen(false)} className={`${btnSecondary} w-full mt-4 py-2`}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
