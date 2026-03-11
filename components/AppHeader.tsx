"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, Home, UserRound } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

const navItems = [
  { href: "/", label: "Main", icon: Home },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function AppHeader() {
  const pathname = usePathname();
  const { isAuthenticated, isSubscribed, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-3 py-3 md:px-5">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-teal-700 text-white shadow-sm">
            <BrainCircuit size={16} />
          </span>
          <span className="text-sm font-semibold tracking-[0.12em]">BrainLead</span>
        </Link>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <Link
              href="/profile"
              className={`inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-semibold transition ${
                pathname === "/profile"
                  ? "border-teal-200 bg-teal-50 text-teal-900"
                  : "text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-900"
              }`}
            >
              <span className="max-w-[140px] truncate">{user.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isSubscribed ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-700"
                }`}
              >
                {isSubscribed ? "Premium" : "Free"}
              </span>
            </Link>
          ) : (
            <Link
              href="/auth"
              className={`inline-flex items-center rounded-full border border-transparent px-3 py-2 text-sm font-semibold transition ${
                pathname === "/auth"
                  ? "border-teal-200 bg-teal-50 text-teal-900"
                  : "text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-900"
              }`}
            >
              Sign in
            </Link>
          )}

          <div className="hidden h-6 w-px bg-slate-200/80 md:block" />

          <nav className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 p-1 shadow-sm">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-teal-100 text-teal-900 shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
