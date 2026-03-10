"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Languages,
  Lock,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import type { Lesson } from "@/constants/lessons";
import { fetchAllLessonProgress, progressToPercent, type LessonProgressRecord } from "@/lib/lessonProgress";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isSubscribed, logout } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgressRecord>>({});

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  useEffect(() => {
    let isCancelled = false;

    fetch("/api/lessons", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Не удалось загрузить уроки");
        }
        return response.json() as Promise<Lesson[]>;
      })
      .then((data) => {
        if (isCancelled) return;
        setLessons(data);
      })
      .catch(() => {
        if (isCancelled) return;
        setLessons([]);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    if (!isAuthenticated) return () => { isCancelled = true; };

    fetchAllLessonProgress()
      .then((progress) => {
        if (isCancelled) return;
        setProgressMap(progress);
      })
      .catch(() => {
        if (isCancelled) return;
        setProgressMap({});
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  const lessonStats = useMemo(() => {
    const records = lessons.map((lesson) => {
      const progress = progressMap[lesson.id];
      const currentStep = progress?.currentStep ?? 0;
      const isCompleted = Boolean(progress?.isCompleted);
      const percent = progressToPercent(currentStep, isCompleted, lesson.screens.length);
      return {
        currentStep,
        isCompleted,
        percent,
      };
    });

    const completed = records.filter((item) => item.isCompleted);
    const inProgress = records.filter((item) => item.currentStep > 0 && !item.isCompleted);
    const totalPercent =
      records.length > 0
        ? Math.round(records.reduce((acc, item) => acc + item.percent, 0) / records.length)
        : 0;

    return { completed, inProgress, totalPercent };
  }, [lessons, progressMap]);

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-[radial-gradient(circle_at_top,#dbeafe,transparent_24%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_55%,#eef4ff_100%)] text-slate-900">
        <main className="mx-auto w-full max-w-4xl px-4 py-8">
          <section className="rounded-[28px] border border-white/80 bg-white/85 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <h1 className="text-2xl font-bold">Profile unavailable</h1>
            <p className="mt-2 text-slate-600">Sign in or create an account to access your settings.</p>
            <div className="mt-6 flex gap-3">
              <Link href="/auth" className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
                Sign in
              </Link>
              <Link href="/auth" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                Create account
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[radial-gradient(circle_at_top,#dbeafe,transparent_20%),radial-gradient(circle_at_90%_20%,#cffafe,transparent_24%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_45%,#eef4ff_100%)] text-slate-900">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
        <section className="mb-6 overflow-hidden rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-cyan-100 via-white to-blue-200 text-3xl font-black text-slate-900 shadow-inner ring-1 ring-white/80">
                {user.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() ?? "")
                  .join("") || "AS"}
              </div>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                  <UserRound size={12} /> Account
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">{user.name}</h1>
                  <p className="mt-1 text-base text-slate-500">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${isSubscribed ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                    {isSubscribed ? "Premium active" : "Free plan"}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full lg:max-w-sm">
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Summary</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="bg-white/70 px-4 py-1">
                  Lessons completed: <span className="font-bold text-slate-900">{lessonStats.completed.length}</span>
                </li>
                <li className=" bg-white/70 px-4 py-1">
                  In progress: <span className="font-bold text-slate-900">{lessonStats.inProgress.length}</span>
                </li>
                <li className="bg-white/70 px-4 py-1">
                  Average progress: <span className="font-bold text-slate-900">{lessonStats.totalPercent}%</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-6 md:grid-cols-2">
          <article className="rounded-[30px] border border-white/80 bg-white/85 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.07)] backdrop-blur">
            <div className="mb-5 flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" size={20} />
              <h2 className="text-xl font-black">Subscription</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">Status</span>
                <span className={`font-bold ${isSubscribed ? "text-emerald-700" : "text-slate-700"}`}>{isSubscribed ? "Active" : "Inactive"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">Plan</span>
                <span className="font-bold text-slate-900">{isSubscribed ? "Premium" : "Free"}</span>
              </div>
            </div>

            {!isSubscribed && (
              <Link
                href="/premium"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Upgrade to Premium
              </Link>
            )}
          </article>

          <article className="rounded-[30px] border border-white/80 bg-white/85 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.07)] backdrop-blur">
            <div className="mb-5 flex items-center gap-2">
              <Settings className="text-teal-700" size={20} />
              <h2 className="text-xl font-black">Settings</h2>
            </div>

            <div className="space-y-2">
              <button className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50">
                <span className="inline-flex items-center gap-3 text-sm font-medium"><Lock size={16} className="text-slate-400" />Profile settings</span>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
              <button className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50">
                <span className="inline-flex items-center gap-3 text-sm font-medium"><Languages size={16} className="text-slate-400" /> Interface language</span>
                <span className="text-sm text-slate-400">English</span>
              </button>
              <button onClick={handleLogout} className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-red-600 transition hover:bg-red-50">
                <span className="inline-flex items-center gap-3 text-sm font-bold"><LogOut size={16} /> Sign out</span>
              </button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
