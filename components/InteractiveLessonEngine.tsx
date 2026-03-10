"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  const { isAuthenticated, isSubscribed } = useAuth();
  const requiresAuth = Boolean(lesson.requiresAuth);
  const lockMode = lesson.premium ? "premium" : requiresAuth ? "auth" : "none";
  const locked = lockMode === "premium" ? !isSubscribed : lockMode === "auth" ? !isAuthenticated : false;
  const totalSteps = Math.max(1, lesson.screens.length);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const effectiveStep = currentStep;
  const effectiveLoaded = isLoaded;

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
    () => lesson.screens[Math.max(0, Math.min(lesson.screens.length - 1, effectiveStep - 1))],
    [lesson.screens, effectiveStep],
  );
  const isCompleted = effectiveStep === totalSteps;

  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-900 p-6 text-white">
        <p className="mb-1 text-xs uppercase tracking-[0.16em] text-cyan-200">Interactive lesson engine</p>
        <h1 className="text-3xl font-black">{lesson.title}</h1>
        <p className="mt-2 text-sm text-cyan-100">{lesson.subtitle}</p>
      </header>

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

          <div key={activeScreen.id} className="animate-fade-slide rounded-3xl border border-slate-200 bg-white p-4 md:p-6">
            <LessonScreenRenderer screen={activeScreen} />
          </div>

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
                  href="/"
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  На dashboard
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

        {locked && <PaywallOverlay lessonTitle={lesson.shortTitle} mode={lockMode === "premium" ? "premium" : "auth"} />}
      </div>
    </section>
  );
}
