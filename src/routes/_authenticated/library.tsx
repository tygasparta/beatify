import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Heart, ListMusic, Music2, Podcast, Search as SearchIcon } from "lucide-react";
import { TrackRow } from "@/components/track-row";
import { demoTracks } from "@/lib/mock-data";
import { usePlayer } from "@/lib/player";

export const Route = createFileRoute("/_authenticated/library")({
  component: LibraryPage,
});

const tabs = ["All", "Playlists", "Albums", "Songs", "Podcasts"] as const;

function LibraryPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const { play } = usePlayer();

  const rows = [
    { icon: Heart, name: "Liked Songs", meta: "312 songs", tint: "from-primary to-primary-glow" },
    { icon: ListMusic, name: "My Playlist", meta: "45 songs", tint: "from-indigo-500 to-purple-700" },
    { icon: Music2, name: "Zim Hits", meta: "80 songs", tint: "from-rose-500 to-red-700" },
    { icon: ListMusic, name: "Chill Vibes", meta: "60 songs", tint: "from-cyan-500 to-blue-700" },
    { icon: Download, name: "Downloaded Music", meta: "120 songs", tint: "from-emerald-500 to-teal-700" },
    { icon: Podcast, name: "Podcasts", meta: "15 episodes", tint: "from-amber-500 to-orange-700" },
  ];

  return (
    <div className="px-5 pt-14">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Library</h1>
        <SearchIcon className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="scrollbar-none -mx-5 mb-6 flex gap-2 overflow-x-auto px-5">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-muted-foreground ring-1 ring-border"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.name}
              onClick={() => play(demoTracks[0], demoTracks)}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/5"
            >
              <div className={`grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br ${r.tint} shadow-card`}>
                <Icon className="h-6 w-6 text-white" fill="currentColor" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.meta}</div>
              </div>
            </button>
          );
        })}
      </div>

      <h2 className="mb-3 mt-8 text-base font-bold">Recently played</h2>
      <div className="space-y-1">
        {demoTracks.slice(0, 6).map((t) => (
          <TrackRow key={t.id} track={t} queue={demoTracks} showDuration />
        ))}
      </div>
    </div>
  );
}
