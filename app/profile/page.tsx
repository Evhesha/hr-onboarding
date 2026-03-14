"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
  const { user, isAuthenticated, isSubscribed, logout, refreshProfile } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgressRecord>>({});
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/auth");
    } finally {
      setIsLoggingOut(false);
    }
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

  useEffect(() => {
    if (!isProfileModalOpen || !user) return;
    setProfileName(user.name ?? "");
    setNewPassword("");
    setConfirmPassword("");
    setProfileError(null);
    setProfileSuccess(null);
    setIsDeleteConfirmed(false);
  }, [isProfileModalOpen, user]);

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const trimmedName = profileName.trim();
    if (!trimmedName) {
      setProfileError("Name cannot be empty.");
      setProfileSuccess(null);
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setProfileError("Password must be at least 6 characters.");
      setProfileSuccess(null);
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setProfileError("Passwords do not match.");
      setProfileSuccess(null);
      return;
    }

    const payload: { name?: string; password?: string } = {};
    if (trimmedName !== user.name) payload.name = trimmedName;
    if (newPassword) payload.password = newPassword;

    if (Object.keys(payload).length === 0) {
      setProfileError("No changes to save.");
      setProfileSuccess(null);
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        let message = "Unable to save changes.";
        try {
          const parsed = JSON.parse(text) as { error?: string | string[] };
          if (Array.isArray(parsed.error)) {
            message = parsed.error.join(", ");
          } else if (parsed.error) {
            message = parsed.error;
          }
        } catch {
          if (text) message = text;
        }
        throw new Error(message);
      }

      await refreshProfile();
      setProfileSuccess("Changes saved.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    try {
      const response = await fetch("/api/users/me", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        let message = "Unable to delete account.";
        try {
          const parsed = JSON.parse(text) as { error?: string };
          if (parsed.error) message = parsed.error;
        } catch {
          if (text) message = text;
        }
        throw new Error(message);
      }

      await logout();
      router.push("/auth");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

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

  const purchasedLessons = useMemo(() => {
    const purchasedIds = new Set(user?.purchasedLessons ?? []);
    return lessons.filter((lesson) => purchasedIds.has(lesson.id));
  }, [lessons, user?.purchasedLessons]);

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
              <h2 className="text-xl font-black">Payments</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">Purchased lessons</span>
                <span className="font-bold text-slate-900">{purchasedLessons.length}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="text-sm text-slate-500">Your lessons</div>
                {purchasedLessons.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {purchasedLessons.map((lesson) => (
                      <span
                        key={lesson.id}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        {lesson.title}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">No lessons purchased yet.</p>
                )}
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
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50"
              >
                <span className="inline-flex items-center gap-3 text-sm font-medium"><Lock size={16} className="text-slate-400" />Profile settings</span>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
              <button className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50">
                <span className="inline-flex items-center gap-3 text-sm font-medium"><Languages size={16} className="text-slate-400" /> Interface language</span>
                <span className="text-sm text-slate-400">English</span>
              </button>
              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
              >
                <span className="inline-flex items-center gap-3 text-sm font-bold"><LogOut size={16} /> Sign out</span>
              </button>
            </div>
          </article>
        </section>
      </main>

      {isProfileModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8"
          onClick={(event) => {
            if (event.currentTarget === event.target) {
              setIsProfileModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-xl rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black">Profile settings</h3>
                <p className="mt-1 text-sm text-slate-500">Update your name or password, or delete your account.</p>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="rounded-full px-3 py-1 text-sm font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Name</label>
                <input
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-cyan-500 focus:outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-cyan-500 focus:outline-none"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-cyan-500 focus:outline-none"
                  placeholder="Repeat new password"
                />
              </div>

              {profileError && (
                <div className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700">
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                  {profileSuccess}
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingProfile ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/70 p-4">
              <h4 className="text-sm font-black text-red-700">Delete account</h4>
              <p className="mt-1 text-sm text-red-600">This action cannot be undone.</p>
              <label className="mt-3 flex items-center gap-2 text-sm font-medium text-red-700">
                <input
                  type="checkbox"
                  checked={isDeleteConfirmed}
                  onChange={(event) => setIsDeleteConfirmed(event.target.checked)}
                  className="h-4 w-4 rounded border-red-200 text-red-600"
                />
                I understand and confirm deletion
              </label>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || !isDeleteConfirmed}
                className="mt-3 inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingAccount ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="w-full max-w-md rounded-[24px] border border-white/70 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
            <h3 className="text-lg font-black">Confirm sign out</h3>
            <p className="mt-2 text-sm text-slate-600">Are you sure you want to sign out?</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsLogoutConfirmOpen(false);
                  await handleLogout();
                }}
                disabled={isLoggingOut}
                className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
