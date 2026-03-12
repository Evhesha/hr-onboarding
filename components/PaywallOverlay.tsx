import Link from "next/link";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

type PaywallMode = "auth" | "premium";

export function PaywallOverlay({
  lessonTitle,
  lessonId,
  mode,
}: {
  lessonTitle: string;
  lessonId?: string;
  mode: PaywallMode;
}) {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ctaHref = mode === "auth" ? "/auth" : isAuthenticated ? "/premium" : "/auth";
  const ctaLabel = mode === "auth" ? "Sign in or create account" : isAuthenticated ? "Continue to checkout" : "Create account";
  const title = mode === "auth" ? "Members only" : "Upgrade to Premium";
  const description = mode === "auth"
    ? "This lesson is available to signed-in learners only."
    : "This lesson is included with Premium access.";

  const startLessonCheckout = async () => {
    if (!lessonId) return;
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: user?.name || "",
          email: user?.email || "",
          purchaseType: "lesson",
          lessonSlug: lessonId,
          lessonTitle,
          source: "lesson-paywall",
        }),
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to create Stripe Checkout Session.");
      }

      window.location.href = payload.url;
    } catch (checkoutError) {
      setLoading(false);
      setError(checkoutError instanceof Error ? checkoutError.message : "Payment start failed.");
    }
  };

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
        {error && <p className="mt-3 text-xs text-rose-700">{error}</p>}
        {mode === "premium" && isAuthenticated && lessonId ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => void startLessonCheckout()}
              disabled={loading}
              className="inline-flex rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:bg-slate-400"
            >
              {loading ? "Redirecting to Stripe..." : "Unlock this block — $10"}
            </button>
            <Link
              href={ctaHref}
              className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              View Premium options
            </Link>
          </div>
        ) : (
          <Link
            href={ctaHref}
            className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
