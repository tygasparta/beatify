import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Library, Upload, User } from "lucide-react";
import type { ReactNode } from "react";
import { MiniPlayer } from "./mini-player";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Library", icon: Library },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Hide chrome on the full-screen player
  const isPlayer = pathname === "/player";

  if (isPlayer) return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-screen max-w-[520px] flex-col bg-background">
      <main className="flex-1 pb-[152px]">{children}</main>
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[520px]">
        <MiniPlayer />
        <nav className="border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <ul className="grid grid-cols-5">
            {tabs.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || pathname.startsWith(to + "/");
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
