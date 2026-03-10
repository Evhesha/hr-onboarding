"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f7fa,_#e2e8f0_40%,_#f8fafc)] text-slate-900">
      <AppHeader />
      <main className="mx-auto w-full max-w-[1400px] px-3 py-4 md:px-5 md:py-6">{children}</main>
      <footer className="border-t border-white/70 bg-white/70 px-6 py-8 backdrop-blur md:px-20">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-slate-900 transition hover:bg-slate-100">
            <BrainCircuit size={18} />
            <span className="text-sm font-bold tracking-wide">BrainLead</span>
          </Link>
          <div className="flex gap-6">
            <a className="text-xs text-slate-500 hover:text-teal-700" href="#">Privacy</a>
            <a className="text-xs text-slate-500 hover:text-teal-700" href="#">Terms</a>
            <a className="text-xs text-slate-500 hover:text-teal-700" href="#">Contact</a>
          </div>
          <p className="text-xs text-slate-400">© 2026 BrainLead. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
