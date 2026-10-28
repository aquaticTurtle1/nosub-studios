"use client";

import { AudioLines, Clapperboard, History, Image as ImageIcon, KeyRound, RefreshCw, Sparkles, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import { useStudio } from "./app-context";
import { ErrorText } from "./error-text";
import { KeyDialog } from "./key-dialog";

export const CATEGORIES: { id: Category; label: string; icon: typeof ImageIcon }[] = [
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "video", label: "Video", icon: Clapperboard },
  { id: "audio", label: "Audio", icon: AudioLines },
  { id: "tools", label: "Tools", icon: Wrench },
];

export function Sidebar() {
  const { keySource, keyLoaded, credits, category, setCategory, refreshCredits } = useStudio();
  const [keyOpen, setKeyOpen] = useState(false);
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 border-b bg-sidebar p-4 md:h-dvh md:w-60 md:border-r md:border-b-0">
      <div className="flex items-center gap-2 font-semibold tracking-tight">
        <Sparkles className="size-4" /> Kie.ai Studio
      </div>

      <nav className="flex gap-1 md:flex-col">
        <NavLink href="/" active={pathname === "/"} icon={<Sparkles className="size-4" />}>
          Studio
        </NavLink>
        <NavLink href="/history" active={pathname.startsWith("/history")} icon={<History className="size-4" />}>
          History
        </NavLink>
      </nav>

      <section className="grid gap-1">
        <div className="px-1 text-xs font-medium text-muted-foreground uppercase">Category</div>
        <div className="grid grid-cols-4 gap-1 md:grid-cols-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent",
                category === c.id && "bg-sidebar-accent font-medium",
              )}
            >
              <c.icon className="size-4" />
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-auto grid gap-2 rounded-lg border bg-background p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase">API key</span>
          {keySource && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              {keySource === "env" ? "from .env.local" : "saved (cookie)"}
            </span>
          )}
        </div>
        {!keyLoaded ? (
          <div className="text-muted-foreground">Checking…</div>
        ) : keySource ? (
          <Button size="sm" variant="outline" onClick={() => setKeyOpen(true)}>
            <KeyRound /> Manage API key
          </Button>
        ) : (
          <Button size="sm" onClick={() => setKeyOpen(true)}>
            <KeyRound /> Connect API key
          </Button>
        )}

        {keySource && (
          <div className="grid gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">Credits</span>
              <button
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                onClick={() => void refreshCredits()}
                disabled={credits.loading}
                aria-label="Refresh balance"
                title="Refresh balance"
              >
                <RefreshCw className={cn("size-3.5", credits.loading && "animate-spin")} />
              </button>
            </div>
            {credits.balance !== null ? (
              <div className="text-xl font-semibold tabular-nums">
                {credits.balance.toLocaleString()}
                <span className="ml-1 text-xs font-normal text-muted-foreground">≈ ${(credits.balance * 0.005).toFixed(2)}</span>
              </div>
            ) : credits.error ? (
              <ErrorText error={credits.error} />
            ) : (
              <div className="text-muted-foreground">—</div>
            )}
          </div>
        )}
      </section>
      <KeyDialog open={keyOpen} onOpenChange={setKeyOpen} />
    </aside>
  );
}

function NavLink({ href, active, icon, children }: { href: string; active: boolean; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent",
        active && "bg-sidebar-accent font-medium",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
