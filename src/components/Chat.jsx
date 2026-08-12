import { useState } from "react";
import {
  ArrowLeft, Send, Plus, X, Check, ShieldCheck, UserPlus, MessageCircle, Users, Inbox,
} from "lucide-react";
import { MOCK_SUGGESTED_PEOPLE, MOCK_INDIVIDUAL_CHATS } from "../data/constants.js";
import { nextId } from "../utils/helpers.js";
import { useClickOutside } from "../utils/hooks.js";
import { OrbitWatermark, Avatar } from "./Common.jsx";

export function ChatThread({ contact, onBack }) {
  const [messages, setMessages] = useState([
    { from: "them", text: "Hey! Saw you joined recently — welcome." },
    { from: "me", text: "Thanks! Excited to be here." },
  ]);
  const [draft, setDraft] = useState("");
  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { from: "me", text: draft.trim() }]);
    setDraft("");
  };
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-900">
        <button onClick={onBack}><ArrowLeft size={18} className="text-zinc-400" /></button>
        <Avatar label={contact[0]} size={32} />
        <p className="font-medium text-zinc-100 text-sm">{contact}</p>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-2.5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`px-3.5 py-2 rounded-2xl text-sm max-w-[75%] ${m.from === "me" ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-200"}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-900">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message" className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500" />
        <button onClick={send} className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center"><Send size={15} /></button>
      </div>
    </div>
  );
}

export function PeoplePicker({ onPick, onClose }) {
  return (
    <div className="absolute inset-0 bg-black/60 z-[60] flex items-end" onClick={onClose}>
      <div className="bg-zinc-950 w-full rounded-t-3xl max-h-[80%] overflow-y-auto no-scrollbar border-t border-zinc-800" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <p className="font-bold text-zinc-50">New individual chat</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-900"><X size={18} className="text-zinc-400" /></button>
        </div>
        <p className="text-xs text-zinc-500 px-5 pb-2">Suggested — people from communities you're in</p>
        <div className="px-2 pb-5">
          {MOCK_SUGGESTED_PEOPLE.map((p) => (
            <button key={p.id} onClick={() => onPick(p.name)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-900 rounded-xl">
              <Avatar label={p.name[0]} size={38} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-200">{p.name}</p>
                <p className="text-xs text-zinc-500 truncate">{p.context}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatScreen({ tab, setTab, verified, onBlocked, onVerifyNow, joinedCommunities, incoming, setIncoming, outgoing, setOutgoing, toast }) {
  const [openThread, setOpenThread] = useState(null);
  const [individualChats, setIndividualChats] = useState(MOCK_INDIVIDUAL_CHATS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  if (!verified) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-8">
        <OrbitWatermark />
        <div className="relative z-10 flex flex-col items-center">
          <ShieldCheck size={30} className="text-zinc-700 mb-3" />
          <p className="font-semibold text-zinc-200">Verify your account to chat</p>
          <p className="text-sm text-zinc-500 mt-1.5">Messaging is only available to verified members.</p>
          <button onClick={onVerifyNow} className="mt-4 text-sm text-blue-400 font-medium">Verify now</button>
        </div>
      </div>
    );
  }
  if (openThread) return <ChatThread key={openThread} contact={openThread} onBack={() => setOpenThread(null)} />;
  const startIndividualChat = (name) => {
    setIndividualChats((cs) => cs.some((c) => c.name === name) ? cs : [{ id: nextId(), name, lastMsg: "Say hi 👋", time: "now", unread: false }, ...cs]);
    setPickerOpen(false);
    setOpenThread(name);
  };
  const chatMenuRef = useClickOutside(menuOpen, () => setMenuOpen(false));
  const tabs = [
    { key: "requests", label: "Requests", icon: UserPlus },
    { key: "individual", label: "Direct", icon: MessageCircle },
    { key: "community", label: "Community", icon: Users },
  ];
  return (
    <div className="relative flex-1 overflow-y-auto no-scrollbar pb-4">
      <OrbitWatermark />
      <div className="relative z-10">
      <div className="flex items-center gap-1.5 px-4 pt-4">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl border ${tab === t.key ? "bg-zinc-50 text-zinc-900 border-zinc-50" : "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>
              <Icon size={14} />{t.label}
              {t.key === "requests" && incoming.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
            </button>
          );
        })}
        <div ref={chatMenuRef} className="relative shrink-0">
          <button aria-label="New chat" onClick={() => setMenuOpen((v) => !v)} className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
            <Plus size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl shadow-black/50 z-40 overflow-hidden">
              <button onClick={() => { setMenuOpen(false); setPickerOpen(true); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"><MessageCircle size={15} className="text-zinc-500" />New individual chat</button>
              <button onClick={() => { setMenuOpen(false); setTab("community"); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"><Users size={15} className="text-zinc-500" />Browse community chats</button>
              <button onClick={() => { setMenuOpen(false); setTab("requests"); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"><UserPlus size={15} className="text-zinc-500" />View requests</button>
            </div>
          )}
        </div>
      </div>
      {tab === "requests" && (
        <div className="px-4 pt-4 space-y-5">
          <div>
            {incoming.length > 0 && <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><Inbox size={12} />Waiting for your approval</p>}
            <div className="space-y-2">
              {incoming.length === 0 && outgoing.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-10">No chat requests right now.</p>
              )}
              {incoming.map((r) => (
                <div key={r.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-3.5 flex items-center gap-3">
                  <Avatar label={r.name[0]} size={38} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200">{r.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{r.context}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => { setIncoming((l) => l.filter((x) => x.id !== r.id)); toast(`Chat approved with ${r.name}`); }} className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><Check size={15} /></button>
                    <button onClick={() => setIncoming((l) => l.filter((x) => x.id !== r.id))} className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center"><X size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {outgoing.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Sent by you</p>
              <div className="space-y-2">
                {outgoing.map((o) => (
                  <div key={o.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-3.5 flex items-center gap-3">
                    <Avatar label={o.name[0]} size={38} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200">{o.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{o.context}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-amber-400 font-medium">Pending</span>
                      <button
                        onClick={() => { setOutgoing((l) => l.filter((x) => x.id !== o.id)); toast(`Request to ${o.name} cancelled`); }}
                        className="text-[11px] text-zinc-500 hover:text-rose-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {tab === "individual" && (
        <div className="px-4 pt-4 space-y-2">
          {individualChats.length === 0 && <p className="text-sm text-zinc-500 text-center py-10">No individual chats yet. Tap + to start one.</p>}
          {individualChats.map((c) => (
            <button key={c.id} onClick={() => setOpenThread(c.name)} className="w-full bg-zinc-900 rounded-2xl border border-zinc-800 p-3.5 flex items-center gap-3 text-left">
              <Avatar label={c.name[0]} size={38} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-200 truncate">{c.name}</p>
                  <span className="text-[10px] text-zinc-500 shrink-0 mono">{c.time}</span>
                </div>
                <p className={`text-xs truncate ${c.unread ? "text-zinc-200 font-medium" : "text-zinc-500"}`}>{c.lastMsg}</p>
              </div>
              {c.unread && <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />}
            </button>
          ))}
        </div>
      )}
      {tab === "community" && (
        <div className="px-4 pt-4 space-y-2">
          {joinedCommunities.length === 0 && <p className="text-sm text-zinc-500 text-center py-10">Join a community to see its group chat here.</p>}
          {joinedCommunities.map((c) => (
            <button key={c.id} onClick={() => setOpenThread(c.name)} className="w-full bg-zinc-900 rounded-2xl border border-zinc-800 p-3.5 flex items-center gap-3 text-left">
              <Avatar label={c.name[0]} size={38} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">{c.name}</p>
                <p className="text-xs text-zinc-500 truncate">Tap to open group chat</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {pickerOpen && <PeoplePicker onPick={startIndividualChat} onClose={() => setPickerOpen(false)} />}
      </div>
    </div>
  );
}
