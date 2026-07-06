import { Link } from "@tanstack/react-router";
import { Pause, Play, SkipForward } from "lucide-react";
import { usePlayer } from "@/lib/player";

export function MiniPlayer() {
  const { current, isPlaying, toggle, next, progress } = usePlayer();
  if (!current) return null;

  return (
    <div className="mx-3 mb-2 overflow-hidden rounded-2xl bg-surface-2 shadow-card ring-1 ring-border">
      <Link to="/player" className="flex items-center gap-3 p-2.5">
        <img
          src={current.cover}
          alt=""
          className="h-11 w-11 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{current.title}</div>
          <div className="truncate text-xs text-muted-foreground">{current.artist}</div>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); toggle(); }}
          className="grid h-10 w-10 place-items-center rounded-full text-foreground hover:bg-white/5"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
        </button>
        <button
          onClick={(e) => { e.preventDefault(); next(); }}
          className="grid h-10 w-10 place-items-center rounded-full text-foreground hover:bg-white/5"
          aria-label="Next"
        >
          <SkipForward className="h-5 w-5" fill="currentColor" />
        </button>
      </Link>
      <div className="h-0.5 bg-white/5">
        <div className="h-full bg-gradient-primary transition-all" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
