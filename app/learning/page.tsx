import { Suspense } from "react";
import LearningPageClient from "./LearningPageClient";

export default function LearningPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <p className="text-sm font-semibold text-slate-700">Loading learning blocks...</p>
        </div>
      }
    >
      <LearningPageClient />
    </Suspense>
  );
}
