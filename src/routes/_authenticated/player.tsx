import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown, Download, Heart, MessageSquare, MoreHorizontal,
  Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Sliders, Share2, X,
} from "lucide-react";
import { useState } from "react";
import { usePlayer } from "@/lib/player";
import { fmt } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/player")({
  component: PlayerPage,
});

function PlayerPage() {
  const navigate = useNavigate();
  const { current, isPlaying, toggle, next, prev, seek, progress, currentTime, duration } = usePlayer();
  const [showLyrics, setShowLyrics] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!current) {
    return (
      <div className="mx-auto grid min-h-screen max-w-[520px] place-items-center bg-background px-6 text-center">
        <div>
          <p className="text-lg font-semibold">Nothing is playing</p>
          <button
            onClick={() => navigate({ to: "/home" })}
            className="mt-4 rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Discover music
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[520px] flex-col bg-background bg-gradient-hero px-5 pb-6 pt-14">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate({ to: "/home" })} className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/5">
          <ChevronDown className="h-6 w-6" />
        </button>
        <div className="text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Playing from<br />
          <span className="text-sm text-foreground">Top Songs Zimbabwe</span>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/5">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl shadow-glow">
        <img src={current.cover} alt="" className="h-full w-full object-cover" />
      </div>

      <div className="mt-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">{current.title}</h1>
          <p className="truncate text-sm text-muted-foreground">{current.artist}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className={`grid h-10 w-10 place-items-center rounded-full transition ${
              liked ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Waveform / progress */}
      <div className="mt-6">
        <button
          className="relative h-8 w-full"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            seek((e.clientX - r.left) / r.width);
          }}
        >
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-end gap-[3px]">
            {Array.from({ length: 60 }).map((_, i) => {
              const h = 30 + Math.sin(i * 0.7) * 40 + (i % 3) * 12;
              const active = i / 60 < progress;
              return (
                <span
                  key={i}
                  className={`w-[3px] rounded-full ${active ? "bg-primary" : "bg-white/15"}`}
                  style={{ height: `${Math.min(90, Math.abs(h))}%` }}
                />
              );
            })}
          </div>
        </button>
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration || current.duration)}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:text-foreground">
          <Shuffle className="h-5 w-5" />
        </button>
        <button onClick={prev} className="grid h-12 w-12 place-items-center">
          <SkipBack className="h-7 w-7" fill="currentColor" />
        </button>
        <button
          onClick={toggle}
          className="grid h-16 w-16 place-items-center rounded-full bg-white text-black shadow-glow"
        >
          {isPlaying ? <Pause className="h-7 w-7" fill="currentColor" /> : <Play className="h-7 w-7 pl-0.5" fill="currentColor" />}
        </button>
        <button onClick={next} className="grid h-12 w-12 place-items-center">
          <SkipForward className="h-7 w-7" fill="currentColor" />
        </button>
        <button className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:text-foreground">
          <Repeat className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <IconChip><Heart className="h-4 w-4" /></IconChip>
        <IconChip><Download className="h-4 w-4" /></IconChip>
        <IconChip onClick={() => setShowLyrics(true)}><MessageSquare className="h-4 w-4" /></IconChip>
        <IconChip><Sliders className="h-4 w-4" /></IconChip>
        <IconChip><Share2 className="h-4 w-4" /></IconChip>
      </div>

      {showLyrics && (
        <div className="mt-6 rounded-2xl bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold">LYRICS</span>
            <button onClick={() => setShowLyrics(false)}><X className="h-4 w-4" /></button>
          </div>
          <p className="text-sm text-muted-foreground">
            Lyrics coming soon…
          </p>
        </div>
      )}
    </div>
  );
}

function IconChip({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 text-foreground/80 shadow-card ring-1 ring-border transition hover:text-foreground"
    >
      {children}
    </button>
  );
}
