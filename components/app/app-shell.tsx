"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudio } from "@/components/studio/app-context";
import { cn } from "@/lib/utils";
import { AccountPill } from "./account-pill";
import { APP_NAME, NAV } from "./nav";
import { Onboarding } from "./onboarding";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { keyLoaded, keySource } = useStudio();
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 bg-np-bg-1 px-3 sm:gap-4 sm:px-4">
        <Link href="/" className="font-display text-[17px] font-semibold tracking-tight">
          {APP_NAME}
        </Link>
        <nav className="flex min-w-0 flex-1 items-center gap-0.5 sm:justify-center sm:gap-1" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              aria-label={n.label}
              className={cn(
                "flex h-9 items-center gap-2 rounded-np-md px-2 text-sm font-medium text-np-text-secondary transition-colors duration-150 hover:bg-np-bg-3 hover:text-np-text-primary sm:px-3",
                isActive(n.href) && "bg-np-accent-soft text-np-accent-text hover:bg-np-accent-soft hover:text-np-accent-text",
              )}
            >
              <n.icon className="size-4 shrink-0" aria-hidden />
              <span className="hidden md:inline">{n.label}</span>
            </Link>
          ))}
        </nav>
        {keySource && <AccountPill />}
      </header>
      {/* Pages render while the key status loads; onboarding replaces them only when no key is set. */}
      {keyLoaded && !keySource ? <Onboarding /> : <div className="flex min-h-0 flex-1 flex-col">{children}</div>}
    </div>
  );
}
