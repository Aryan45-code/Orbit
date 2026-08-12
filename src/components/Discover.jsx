import React from "react";
import { Calendar, Clock, MapPin, Orbit as OrbitIcon } from "lucide-react";
import { MOCK_EVENTS, MOCK_ADS } from "../data/constants.js";
import { distanceKm } from "../utils/helpers.js";
import { OrbitWatermark } from "./Common.jsx";
import { AdCard, OrbitLeaderboard } from "./Home.jsx";

export function DiscoverScreen({ subTab, setSubTab, leaderboard, communities }) {
  return (
    <div className="relative flex-1 overflow-y-auto no-scrollbar pb-6">
      <OrbitWatermark />
      <div className="relative z-10">
        <div className="flex gap-1.5 px-4 pt-4 pb-3">
          <button onClick={() => setSubTab("events")} className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl border ${subTab === "events" ? "bg-zinc-50 text-zinc-900 border-zinc-50" : "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>
            <Calendar size={14} />Events
          </button>
          <button onClick={() => setSubTab("orbit")} className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl border ${subTab === "orbit" ? "bg-zinc-50 text-zinc-900 border-zinc-50" : "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>
            <OrbitIcon size={14} />Orbit
          </button>
        </div>
        {subTab === "events" && (
          <>
            <div className="px-4">
              <p className="font-bold text-zinc-50 text-lg flex items-center gap-1.5"><Calendar size={17} className="text-blue-400" />Events nearby</p>
              <p className="text-xs text-zinc-500 mt-0.5">Events happening around you.</p>
            </div>
            <div className="px-4 pt-4 space-y-2.5">
              {MOCK_EVENTS.map((e, i) => (
                <React.Fragment key={e.id}>
                  <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-3.5">
                    <p className="font-semibold text-zinc-100 text-sm">{e.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><Clock size={12} />{e.when}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} />{e.where}</span>
                      <span className="mono">{distanceKm(e.dx, e.dy).toFixed(1)} km</span>
                    </div>
                  </div>
                  {i === 1 && <AdCard ad={MOCK_ADS[1]} />}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
        {subTab === "orbit" && (
          <>
            <div className="px-4">
              <p className="font-bold text-zinc-50 text-lg flex items-center gap-1.5"><OrbitIcon size={17} className="text-blue-400" />Community Orbit</p>
              <p className="text-xs text-zinc-500 mt-0.5">Live rankings based on activity, not just popularity.</p>
            </div>
            <div className="pt-4">
              <OrbitLeaderboard leaderboard={leaderboard} communities={communities} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
