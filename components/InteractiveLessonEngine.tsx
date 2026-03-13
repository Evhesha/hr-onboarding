"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, StepBack, StepForward } from "lucide-react";
import type { Lesson } from "@/constants/lessons";
import { LessonScreenRenderer } from "@/components/LessonScreenRenderer";
import { PaywallOverlay } from "@/components/PaywallOverlay";
import { useAuth } from "@/app/context/AuthContext";
import { fetchLessonProgress, saveLessonProgress } from "@/lib/lessonProgress";

type Props = {
  lesson: Lesson;
  nextLesson?: {
    id: string;
    shortTitle: string;
  } | null;
};

export function InteractiveLessonEngine({ lesson, nextLesson = null }: Props) {
  const { isAuthenticated, isSubscribed, user, refreshProfile } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "test" ? "test" : "lessons";
  const handledSessionRef = useRef<string | null>(null);
  const requiresAuth = Boolean(lesson.requiresAuth);
  const purchasedLessons = Array.isArray(user?.purchasedLessons) ? user?.purchasedLessons : [];
  const hasLessonAccess = lesson.premium ? purchasedLessons.includes(lesson.id) : true;
  const tabRequiresAuth = activeTab === "test";
  const lockMode = lesson.premium
    ? "premium"
    : tabRequiresAuth
      ? "auth"
      : requiresAuth
        ? "auth"
        : "none";
  const locked =
    lockMode === "premium"
      ? !isSubscribed && !hasLessonAccess
      : lockMode === "auth"
        ? !isAuthenticated
        : false;
  const filteredScreens = useMemo(
    () => lesson.screens.filter((screen) => (screen.tab ?? "lessons") === activeTab),
    [activeTab, lesson.screens],
  );
  const totalSteps = Math.max(1, filteredScreens.length);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);
  const effectiveStep = currentStep;
  const effectiveLoaded = isLoaded;

  useEffect(() => {
    const purchaseStatus = searchParams.get("purchase");
    const sessionId = searchParams.get("session_id");

    if (!purchaseStatus || !sessionId) {
      return;
    }

    if (handledSessionRef.current === sessionId) {
      return;
    }

    handledSessionRef.current = sessionId;

    if (purchaseStatus === "cancel") {
      setPurchaseNotice("Payment canceled. You can try again anytime.");
      return;
    }

    if (purchaseStatus !== "success") {
      return;
    }

    let isCancelled = false;
    setPurchaseNotice("Confirming payment and unlocking this block...");

    void fetch("/api/stripe/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sessionId }),
    })
      .then(async (response) => {
        const payload = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(payload.error || "Unable to confirm payment.");
        }
        await refreshProfile();
        if (!isCancelled) {
          setPurchaseNotice("Payment confirmed. This block is now unlocked.");
        }
      })
      .catch((confirmError) => {
        if (isCancelled) return;
        setPurchaseNotice(
          confirmError instanceof Error ? confirmError.message : "Payment confirmation failed. Please contact support.",
        );
      });

    return () => {
      isCancelled = true;
    };
  }, [refreshProfile, searchParams]);

  useEffect(() => {
    let isCancelled = false;

    fetchLessonProgress(lesson.id, isAuthenticated)
      .then((progress) => {
        if (isCancelled) return;
        const step = progress?.currentStep ?? 0;
        setCurrentStep(Math.max(1, Math.min(totalSteps, step || 1)));
      })
      .catch(() => {
        if (isCancelled) return;
        setCurrentStep(1);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoaded(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, lesson.id, totalSteps]);

  useEffect(() => {
    if (!isLoaded || locked) {
      return;
    }

    void saveLessonProgress(lesson.id, currentStep, totalSteps, isAuthenticated).catch((error) => {
      console.error("Failed to persist lesson progress:", error);
    });
  }, [currentStep, isAuthenticated, isLoaded, lesson.id, locked, totalSteps]);

  const activeScreen = useMemo(
    () => filteredScreens[Math.max(0, Math.min(filteredScreens.length - 1, effectiveStep - 1))],
    [filteredScreens, effectiveStep],
  );
  const isCompleted = effectiveStep === totalSteps;

  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-900 p-6 text-white">
        <p className="mb-1 text-xs uppercase tracking-[0.16em] text-cyan-200">Interactive lesson engine</p>
        <h1 className="text-3xl font-black">{lesson.title}</h1>
        <p className="mt-2 text-sm text-cyan-100">{lesson.subtitle}</p>
      </header>

      {purchaseNotice && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {purchaseNotice}
        </div>
      )}

      <div className="relative">
        <div className={`space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:p-6 ${locked ? "blur-sm" : ""}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">Step {effectiveStep} / {totalSteps}</p>
            {lockMode !== "none" && (
              <p className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
                <Lock size={12} /> {lockMode === "premium" ? "Premium lesson" : "Members lesson"}
              </p>
            )}
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
              style={{ width: `${(effectiveStep / totalSteps) * 100}%` }}
            />
          </div>

          {activeScreen ? (
            <div key={activeScreen.id} className="animate-fade-slide rounded-3xl border border-slate-200 bg-white p-4 md:p-6">
              <LessonScreenRenderer screen={activeScreen} />
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No content for the selected tab.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep((value) => Math.max(1, value - 1))}
              disabled={effectiveStep === 1 || !effectiveLoaded}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <StepBack size={16} /> Previous
            </button>

            {isCompleted ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Link
                  href="/learning"
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  To learning
                </Link>
                {nextLesson ? (
                  <Link
                    href={`/lesson/${nextLesson.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Следующий урок
                    <StepForward size={16} />
                  </Link>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep((value) => Math.min(totalSteps, value + 1))}
                disabled={!effectiveLoaded}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                Next <StepForward size={16} />
              </button>
            )}
          </div>
        </div>

        {locked && (
          <PaywallOverlay
            lessonTitle={lesson.shortTitle}
            lessonId={lesson.id}
            mode={lockMode === "premium" ? "premium" : "auth"}
          />
        )}
      </div>
    </section>
  );
}
