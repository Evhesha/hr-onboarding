import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { PremiumAccessFlow } from "@/components/PremiumAccessFlow";

export default function PremiumPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft size={16} /> Back to home
        </Link>
      </div>
      <Suspense fallback={<div className="mx-auto w-full max-w-6xl px-4 py-10 text-sm text-slate-500">Loading premium flow...</div>}>
        <PremiumAccessFlow />
      </Suspense>
    </main>
  );
}
