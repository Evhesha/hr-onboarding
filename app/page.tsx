"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

const COOKIE_NAME = "assessment_results";

type StoredResults = {
  updatedAt: string;
  latestTestId: string;
  results: Record<string, { score: number; completedAt: string }>;
};

const readResultsCookie = (): StoredResults | null => {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!raw) return null;
  const value = raw.split("=").slice(1).join("=");
  try {
    return JSON.parse(decodeURIComponent(value)) as StoredResults;
  } catch {
    return null;
  }
};

const competencies = [
  { label: "Feedback", level: "Low", tone: "text-rose-600", chip: "bg-rose-100 text-rose-700" },
  { label: "Delegation", level: "Medium", tone: "text-slate-700", chip: "bg-slate-100 text-slate-700" },
  { label: "Conflict Navigation", level: "Medium", tone: "text-slate-700", chip: "bg-slate-100 text-slate-700" },
  { label: "Motivation", level: "High", tone: "text-emerald-700", chip: "bg-emerald-100 text-emerald-700" },
];

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

const premiumLessonSlugs = learningBlocks
  .filter((block) => block.access === "premium")
  .map((block) => block.slug);

const assessmentLabels: Record<string, string> = {
  feedback: "Feedback",
  delegation: "Delegation",
  motivation: "Motivation",
  conflict: "Conflict",
};

export default function HomePage() {
  const [latestResult, setLatestResult] = useState<{ score: number; completedAt: string; testId: string } | null>(null);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumError, setPremiumError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const saved = readResultsCookie();
    if (!saved?.latestTestId) return;
    const result = saved.results?.[saved.latestTestId];
    if (result) setLatestResult({ ...result, testId: saved.latestTestId });
  }, []);

  const startAllCheckout = async () => {
    if (!isAuthenticated) {
      window.location.href = "/auth";
      return;
    }

    setPremiumError(null);
    setPremiumLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: user?.name || "",
          email: user?.email || "",
          purchaseType: "all",
          lessonSlugs: premiumLessonSlugs,
          source: "home-premium-cta",
        }),
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to create Stripe Checkout Session.");
      }

      window.location.href = payload.url;
    } catch (checkoutError) {
      setPremiumLoading(false);
      setPremiumError(checkoutError instanceof Error ? checkoutError.message : "Payment start failed.");
    }
  };

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur md:p-10">
        <div className="pointer-events-none absolute -right-24 top-6 h-60 w-60 rounded-full bg-gradient-to-br from-teal-200 via-sky-200 to-slate-200 opacity-80 blur-2xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-gradient-to-br from-slate-100 via-teal-100 to-sky-100 opacity-90 blur-2xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
              <Sparkles size={14} /> BrainLead
            </p>
            <div>
              <h1 className="font-display text-3xl font-semibold text-slate-900 md:text-5xl">
                The Future of Leadership Development
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
              Master Leadership Through AI-Powered Practice. Empower your managers to lead people, teams, and processes with confidence. Educational platform for leaders in charge of people, teams, and processes.
              Featuring courses, assessments, AI-driven roleplay, and an AI mentor.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#assessment"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Start the assessment <ArrowRight size={16} />
              </Link>
              <Link
                href="#curriculum"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Explore the curriculum
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Personalization Preview</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">4-competency snapshot</h2>
            <p className="mt-2 text-sm text-slate-600">
              A fast readiness check focused on the daily behaviors of effective managers.
            </p>
            <div className="mt-5 grid gap-2 text-sm">
              {competencies.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="font-medium text-slate-800">{item.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.chip}`}>{item.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="assessment" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Assessment</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl">Personalize your onboarding path</h2>
          <p className="mt-3 text-sm text-slate-600 md:text-base">
            The assessment is free and takes under 7 minutes. It highlights which leadership habits need reinforcement
            and routes you into the right micro-lessons.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-700">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1">
              <CheckCircle2 size={16} className="text-teal-600" /> 20 questions
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
              <CheckCircle2 size={16} className="text-slate-500" /> Instant results
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
              <CheckCircle2 size={16} className="text-slate-500" /> Free snapshot
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Take the assessment <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              See sample questions
            </button>
          </div>
          {latestResult ? (
            <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50/60 px-4 py-3 text-sm text-teal-800">
              Last assessment: {latestResult.score}/10 • {new Date(latestResult.completedAt).toLocaleString()}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Take the free test to personalize your learning path.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Free Result</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Competency petals</h3>
              <p className="mt-2 text-sm text-slate-600">
                The lowest petal is highlighted to focus the first training sprint.
              </p>
            </div>
            <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
              {latestResult
                ? `Latest: ${assessmentLabels[latestResult.testId] ?? latestResult.testId} ${latestResult.score}/10`
                : "Low: Feedback"}
            </span>
          </div>

          <div className="mt-6 flex items-center gap-6">
            <div
              className="relative h-40 w-40 rounded-full border border-slate-200"
              style={{
                background:
                  "conic-gradient(#14b8a6 0deg 72deg, #0ea5e9 72deg 144deg, #cbd5f5 144deg 216deg, #94a3b8 216deg 288deg, #fda4af 288deg 360deg)",
              }}
            >
              <div className="absolute inset-5 rounded-full bg-white shadow-inner" />
              <div className="absolute inset-0 rounded-full ring-2 ring-rose-300 ring-offset-2 ring-offset-white" />
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              {competencies.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-800">{item.label}</span>
                  <span className={`text-xs font-semibold ${item.tone}`}>{item.level}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Want the deep dive? Unlock a paid report with strengths, blind spots, and a personalized coaching plan.
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Free Path</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">Go straight to learning</h3>
          <p className="mt-2 text-sm text-slate-600">
            Start with the low-competency module and build momentum with quick wins.
          </p>
          <Link
            href="/learning"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Start learning <ArrowRight size={16} />
          </Link>
        </div>
        <div className="rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-slate-50 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Premium Path</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">Unlock strengths + blind spots</h3>
          <p className="mt-2 text-sm text-slate-600">
            Get a detailed competency report, tailored practice sprints, and manager coaching prompts.
          </p>
          <button
            type="button"
            onClick={() => void startAllCheckout()}
            disabled={premiumLoading}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:bg-slate-300"
          >
            {premiumLoading ? "Redirecting to Stripe..." : "View premium insights"} <ArrowRight size={16} />
          </button>
          {premiumError && (
            <p className="mt-3 text-sm text-rose-600">{premiumError}</p>
          )}
        </div>
      </section>

    </div>
  );
}
