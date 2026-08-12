import { useState } from "react";
import {
  ArrowLeft, Send, Plus, X, Check, UserPlus, MessageCircle, Inbox,
} from "lucide-react";
import { MOCK_SUGGESTED_PEOPLE, MOCK_INDIVIDUAL_CHATS } from "../data/constants.js";
import { nextId } from "../utils/helpers.js";
import { useClickOutside } from "../utils/hooks.js";
import { Avatar } from "./Common.jsx";
import { EmptyState } from "./EmptyState.jsx";

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
            <div className={`px-3.5 py-2 rounded-2xl text-sm max-w-[75%] ${m.from === "me" ? "bg-violet-500 text-white" : "bg-zinc-800 text-zinc-200"}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-900">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message" className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-full px-4 py-2 text-sm outline-none focus:border-violet-500" />
        <button onClick={send} className="w-9 h-9 rounded-full bg-violet-500 text-white flex items-center justify-center"><Send size={15} /></button>
      </div>
    </div>
  );
}

export function PeoplePicker({ onPick, onClose }) {
  return (
    <div className="absolute inset-0 bg-black/60 z-[60] flex items-end" onClick={onClose}>
      <div className="bg-zinc-950 w-full rounded-t-3xl max-h-[80%] overflow-y-auto no-scrollbar border-t border-zinc-800" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <p className="font-bold text-zinc-50">New message</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-900"><X size={18} className="text-zinc-400" /></button>
        </div>
        <p className="text-xs text-zinc-500 px-5 pb-2">Suggested — people from communities and clubs you're in</p>
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

// Direct messages + chat requests panel, opened from the top-bar message
// icon. Community/club chat lives inside each community's own detail page
// now (see Community.jsx), so this panel only handles person-to-person DMs.
export function DMPanel({ onClose, incoming, setIncoming, outgoing, setOutgoing, toast }) {
  const [tab, setTab] = useState("requests");
  const [openThread, setOpenThread] = useState(null);
  const [individualChats, setIndividualChats] = useState(MOCK_INDIVIDUAL_CHATS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const menuRef = useClickOutside(menuOpen, () => setMenuOpen(false));

  if (openThread) {
    return (
      <div className="relative flex-1 bg-zinc-950 flex flex-col min-h-0">
        <ChatThread key={openThread} contact={openThread} onBack={() => setOpenThread(null)} />
      </div>
    );
  }

  const startIndividualChat = (name) => {
    setIndividualChats((cs) => cs.some((c) => c.name === name) ? cs : [{ id: nextId(), name, lastMsg: "Say hi 👋", time: "now", unread: false }, ...cs]);
    setPickerOpen(false);
    setOpenThread(name);
  };

  return (
    <div className="relative flex-1 bg-zinc-950 flex flex-col min-h-0">
      <div className="relative z-10 flex flex-col min-h-0 flex-1">
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
          <button onClick={onClose} className="shrink-0"><ArrowLeft size={19} className="text-zinc-300" /></button>
          <p className="font-bold text-zinc-50 flex-1">Messages</p>
          <div ref={menuRef} className="relative shrink-0">
            <button aria-label="New message" onClick={() => setMenuOpen((v) => !v)} className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center">
              <Plus size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl shadow-black/50 z-40 overflow-hidden">
                <button onClick={() => { setMenuOpen(false); setPickerOpen(true); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"><MessageCircle size={15} className="text-zinc-500" />New message</button>
                <button onClick={() => { setMenuOpen(false); setTab("requests"); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"><UserPlus size={15} className="text-zinc-500" />View requests</button>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 px-4 pb-2">
          <button onClick={() => setTab("requests")} className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl border ${tab === "requests" ? "bg-zinc-50 text-zinc-900 border-zinc-50" : "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>
            <UserPlus size={14} />Requests
            {incoming.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
          </button>
          <button onClick={() => setTab("individual")} className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl border ${tab === "individual" ? "bg-zinc-50 text-zinc-900 border-zinc-50" : "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>
            <MessageCircle size={14} />Direct
          </button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {tab === "requests" && (
            <div className="px-4 pt-2 space-y-5">
              <div>
                {incoming.length > 0 && <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><Inbox size={12} />Waiting for your approval</p>}
                <div className="space-y-2">
                  {incoming.length === 0 && outgoing.length === 0 && (
                    <EmptyState icon={Inbox} title="No chat requests" subtitle="Requests to message you will show up here." />
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
            <div className="px-4 pt-2 space-y-2">
              {individualChats.length === 0 && <EmptyState icon={MessageCircle} title="No messages yet" subtitle="Tap + to start a direct message." />}
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
                  {c.unread && <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
        {pickerOpen && <PeoplePicker onPick={startIndividualChat} onClose={() => setPickerOpen(false)} />}
      </div>
    </div>
  );
}
