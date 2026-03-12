"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

const learningBlocks = [
  {
    title: "Feedback",
    description: "Build confidence in tough conversations and growth plans.",
    tags: ["Micro-lesson (free)", "Mini quiz (free)"],
    slug: "feedback",
    access: "free",
  },
  {
    title: "Delegation",
    description: "Translate goals into clear ownership without micromanaging.",
    tags: ["Micro-lesson (Premium)", "Mini quiz (Premium)"],
    slug: "delegation",
    access: "premium",
  },
  {
    title: "Conflict Management",
    description: "De-escalate tension and keep teams aligned under pressure.",
    tags: ["Micro-lesson (Premium)", "Mini quiz (Premium)"],
    slug: "conflict-management",
    access: "premium",
  },
  {
    title: "Motivation",
    description: "Sustain energy, autonomy, and accountability in your team.",
    tags: ["Micro-lesson (Premium)", "Mini quiz (Premium)"],
    slug: "motivation",
    access: "premium",
  },
];

export default function LearningPageClient() {
  const { isAuthenticated, user, refreshProfile } = useAuth();
  const searchParams = useSearchParams();
  const [allLoading, setAllLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const purchasedLessons = Array.isArray(user?.purchasedLessons) ? user?.purchasedLessons : [];
  const premiumSlugs = useMemo(
    () => learningBlocks.filter((block) => block.access === "premium").map((block) => block.slug),
    [],
  );
  const allUnlocked = premiumSlugs.every((slug) => purchasedLessons.includes(slug));

  useEffect(() => {
    const status = searchParams.get("purchase");
    const sessionId = searchParams.get("session_id");

    if (!status || !sessionId) {
      return;
    }

    let isCancelled = false;

    if (status === "cancel") {
      setNotice("Payment canceled. You can try again anytime.");
      return;
    }

    if (status !== "success") {
      return;
    }

    setNotice("Confirming payment and unlocking your blocks...");

    void fetch("/api/stripe/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sessionId }),
    })
      .then(async (response) => {
        const payload = (await response.json()) as { error?: string; purchaseType?: string; lessonSlug?: string };
        if (!response.ok) {
          throw new Error(payload.error || "Unable to confirm payment.");
        }
        await refreshProfile();
        if (!isCancelled) {
          setNotice("Payment confirmed. Premium blocks are now unlocked.");
          if (payload.purchaseType === "lesson" && payload.lessonSlug) {
            window.location.href = `/lesson/${payload.lessonSlug}?tab=lessons`;
          }
        }
      })
      .catch((confirmError) => {
        if (isCancelled) return;
        setNotice(
          confirmError instanceof Error ? confirmError.message : "Payment confirmation failed. Please contact support.",
        );
      });

    return () => {
      isCancelled = true;
    };
  }, [refreshProfile, searchParams]);

  const startAllCheckout = async () => {
    if (!isAuthenticated) {
      window.location.href = "/auth";
      return;
    }

    setNotice(null);
    setAllLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: user?.name || "",
          email: user?.email || "",
          purchaseType: "all",
          lessonSlugs: premiumSlugs,
          source: "learning-page",
        }),
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to create Stripe Checkout Session.");
      }

      window.location.href = payload.url;
    } catch (checkoutError) {
      setAllLoading(false);
      setNotice(checkoutError instanceof Error ? checkoutError.message : "Payment start failed.");
    }
  };

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Learning Blocks</p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Four focused modules</h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              The first block is free. Each additional block can be unlocked with a one-time payment.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Back to home <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Unlock all premium blocks for $30</p>
            <p className="text-xs text-slate-600">One-time payment, lifetime access to all premium blocks.</p>
          </div>
          <button
            type="button"
            onClick={() => void startAllCheckout()}
            disabled={allLoading || allUnlocked}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:bg-slate-300"
          >
            {allUnlocked ? "All blocks unlocked" : allLoading ? "Redirecting to Stripe..." : "Pay $30 for all"}
          </button>
        </div>
        {notice && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {notice}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {learningBlocks.map((block) => {
          const isPremium = block.access === "premium";
          const isUnlocked = !isPremium || purchasedLessons.includes(block.slug);
          return (
            <div key={block.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex w-full items-start justify-between gap-3 text-left">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{block.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{block.description}</p>
                </div>
                {isPremium ? (
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                      isUnlocked ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isUnlocked ? "Unlocked" : "Locked"}
                  </span>
                ) : (
                  <span className="rounded-full bg-teal-100 px-2 py-1 text-[11px] font-semibold text-teal-700">
                    Free
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {block.tags.map((tag) => {
                  const isPremium = tag.includes("Premium");
                  return (
                    <span
                      key={tag}
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        isPremium ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
              <div className="mt-5 grid gap-2">
              <Link
                  href={`/lesson/${block.slug}?tab=lessons`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                >
                  Lessons
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href={`/lesson/${block.slug}?tab=test`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                >
                  Test
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href={`/lesson/${block.slug}?tab=playbook`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                >
                  Trainer (coming soon)
                  <ArrowRight size={14} />
                </Link>
              </div>
              {isPremium && !isUnlocked && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!isAuthenticated) {
                      window.location.href = "/auth";
                      return;
                    }
                    try {
                      const response = await fetch("/api/stripe/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          fullName: user?.name || "",
                          email: user?.email || "",
                          purchaseType: "lesson",
                          lessonSlug: block.slug,
                          lessonTitle: block.title,
                          source: "learning-block",
                        }),
                      });

                      const payload = (await response.json()) as { url?: string; error?: string };

                      if (!response.ok || !payload.url) {
                        throw new Error(payload.error || "Unable to create Stripe Checkout Session.");
                      }

                      window.location.href = payload.url;
                    } catch (checkoutError) {
                      setNotice(checkoutError instanceof Error ? checkoutError.message : "Payment start failed.");
                    }
                  }}
                  className="mt-4 w-full rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Unlock this block — $10
                </button>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
