import Link from "next/link";
import { Lock } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

type PaywallMode = "auth" | "premium";

export function PaywallOverlay({ lessonTitle, mode }: { lessonTitle: string; mode: PaywallMode }) {
  const { isAuthenticated } = useAuth();
  const ctaHref = mode === "auth" ? "/auth" : isAuthenticated ? "/premium" : "/auth";
  const ctaLabel = mode === "auth" ? "Sign in or create account" : isAuthenticated ? "Continue to checkout" : "Create account";
  const title = mode === "auth" ? "Members only" : "Upgrade to Premium";
  const description = mode === "auth"
    ? "This lesson is available to signed-in learners only."
    : "This lesson is included with Premium access.";

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-slate-900/35 p-4">
      <div className="max-w-md rounded-2xl border border-white/30 bg-white/95 p-6 text-center shadow-2xl backdrop-blur">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Lock size={22} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">
          Lesson <span className="font-semibold">{lessonTitle}</span>. {description}
        </p>
        {mode === "premium" && !isAuthenticated && (
          <p className="mt-1 text-xs text-slate-500">Create an account first, then upgrade to Premium.</p>
        )}
        <Link
          href={ctaHref}
          className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
