import { MoreVertical, Pause, Play } from "lucide-react";
import { usePlayer } from "@/lib/player";
import { fmt, type Track } from "@/lib/mock-data";

export function TrackRow({
  track,
  queue,
  index,
  showDuration = false,
}: {
  track: Track;
  queue: Track[];
  index?: number;
  showDuration?: boolean;
}) {
  const { current, isPlaying, play, toggle } = usePlayer();
  const isCurrent = current?.id === track.id;

  return (
    <button
      onClick={() => (isCurrent ? toggle() : play(track, queue))}
      className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/5"
    >
      {typeof index === "number" && (
        <span className="w-5 text-center text-sm font-medium text-muted-foreground">{index + 1}</span>
      )}
      <div className="relative">
        <img src={track.cover} alt="" className="h-11 w-11 rounded-lg object-cover" />
        {isCurrent && (
          <div className="absolute inset-0 grid place-items-center rounded-lg bg-black/50">
            {isPlaying ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4" fill="currentColor" />}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm font-semibold ${isCurrent ? "text-primary" : ""}`}>{track.title}</div>
        <div className="truncate text-xs text-muted-foreground">{track.artist}</div>
      </div>
      {track.plays && !showDuration && (
        <span className="text-xs text-muted-foreground">{track.plays}</span>
      )}
      {showDuration && (
        <span className="text-xs text-muted-foreground">{fmt(track.duration)}</span>
      )}
      <span className="grid h-8 w-8 place-items-center text-muted-foreground opacity-0 transition group-hover:opacity-100">
        <MoreVertical className="h-4 w-4" />
      </span>
    </button>
  );
}
