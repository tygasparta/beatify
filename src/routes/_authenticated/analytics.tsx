import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { demoTracks } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const tabs = ["Overview", "Songs", "Audience", "Revenue"];
  const points = [3, 4, 3.5, 4.5, 5, 4.8, 5.5, 6, 5.8, 6.5, 7, 7.5];
  const max = Math.max(...points);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * 100} ${100 - (p / max) * 90}`)
    .join(" ");

  return (
    <div className="px-5 pt-14">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full bg-surface">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Analytics Overview</h1>
          <p className="text-xs text-muted-foreground">May 1 – May 31, 2026</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-none">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground ring-1 ring-border"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2.5">
        <Stat label="Streams" value="125.6K" delta="+12.5%" />
        <Stat label="Listeners" value="87.4K" delta="+8.7%" />
        <Stat label="Earnings" value="$1,245" delta="+15.3%" />
      </div>

      <div className="mb-6 rounded-2xl bg-surface p-4">
        <div className="mb-3 text-sm font-semibold">Streams Over Time</div>
        <svg viewBox="0 0 100 100" className="h-40 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="oklch(0.635 0.22 26)" stopOpacity="0.4" />
              <stop offset="1" stopColor="oklch(0.635 0.22 26)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path} L 100 100 L 0 100 Z`} fill="url(#g)" />
          <path d={path} fill="none" stroke="oklch(0.635 0.22 26)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>May 1</span><span>May 8</span><span>May 15</span><span>May 22</span><span>May 31</span>
        </div>
      </div>

      <h2 className="mb-3 text-base font-bold">Top Songs</h2>
      <div className="space-y-1">
        {demoTracks.slice(0, 5).map((t, i) => (
          <div key={t.id} className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="w-4 text-sm text-muted-foreground">{i + 1}</span>
            <img src={t.cover} alt="" className="h-10 w-10 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{t.title}</div>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{(50 - i * 8).toFixed(1)}K</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-2xl bg-surface p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
      <div className="text-[10px] font-semibold text-emerald-400">{delta}</div>
    </div>
  );
}
