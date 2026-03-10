"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Lock,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

type FlowStep = "locked" | "success" | "cancel";

export function PremiumAccessFlow() {
  const { refreshProfile, user } = useAuth();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<FlowStep>("locked");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get("status");
    const sessionId = searchParams.get("session_id");

    if (status === "success") {
      if (!sessionId) {
        setStep("success");
        return;
      }

      let isCancelled = false;

      setLoading(true);
      setError(null);

      void fetch("/api/stripe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      })
        .then(async (response) => {
          const payload = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(payload.error || "Unable to activate Premium.");
          }
          await refreshProfile();
          if (!isCancelled) {
            setStep("success");
          }
        })
        .catch((confirmError) => {
          if (isCancelled) return;
          setError(confirmError instanceof Error ? confirmError.message : "Unable to activate Premium.");
          setStep("locked");
        })
        .finally(() => {
          if (!isCancelled) {
            setLoading(false);
          }
        });

      return () => {
        isCancelled = true;
      };
    }

    if (status === "cancel") {
      setStep("cancel");
      return;
    }
  }, [refreshProfile, searchParams]);

  const startCheckout = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: user?.name || "",
          email: user?.email || "",
          source: "premium-page",
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
    <section className="relative mx-auto min-h-[calc(100vh-5rem)] w-full max-w-6xl overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <div className="mx-auto mt-10 w-full max-w-4xl space-y-6">
          <div className="h-8 w-64 rounded-lg bg-slate-200" />
          <div className="aspect-video rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-5/6 rounded bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-200" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-10 bg-white/30 backdrop-blur-sm" />

      <div className="relative z-20 mx-auto mt-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
        {step === "locked" && (
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
              <Lock size={30} />
            </div>
            <h1 className="mb-3 text-2xl font-extrabold text-slate-900">
              Premium access required
            </h1>
            <p className="mb-6 text-sm leading-6 text-slate-600">
              Unlock full access to lessons, playbooks, and learning analytics.
            </p>

            <div className="mb-6 grid gap-2 text-left text-sm text-slate-700">
              <p className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-teal-700" /> All modules unlocked</p>
              <p className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-teal-700" /> Detailed leadership playbooks</p>
              <p className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-teal-700" /> Advanced progress analytics</p>
            </div>

            {loading && searchParams.get("status") === "success" && (
              <p className="mb-4 text-sm text-slate-600">Confirming payment and updating your access...</p>
            )}
            {error && <p className="mb-4 text-sm text-rose-700">{error}</p>}

            <button
              type="button"
              onClick={() => void startCheckout()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:bg-slate-400"
            >
              <Rocket size={16} /> {loading ? "Redirecting to Stripe..." : "Upgrade to Premium"}
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck size={30} />
            </div>
            <h2 className="mb-2 text-2xl font-extrabold text-slate-900">Payment confirmed</h2>
            <p className="mb-6 text-sm text-slate-600">Your Premium access is active.</p>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/profile";
                }}
                className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === "cancel" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Lock size={30} />
            </div>
            <h2 className="mb-2 text-2xl font-extrabold text-slate-900">Payment canceled</h2>
            <p className="mb-6 text-sm text-slate-600">
              You returned from Stripe without completing checkout.
            </p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep("locked");
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              <Rocket size={16} /> Try again
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
