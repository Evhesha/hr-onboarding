"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const learningBlocks = [
  {
    title: "Feedback",
    description: "Build confidence in tough conversations and growth plans.",
    tags: ["Micro-lesson (free)", "Mini quiz (free)"],
    slug: "feedback",
  },
  {
    title: "Delegation",
    description: "Translate goals into clear ownership without micromanaging.",
    tags: ["Micro-lesson (free)", "Mini quiz (free)"],
    slug: "delegation",
  },
  {
    title: "Conflict Management",
    description: "De-escalate tension and keep teams aligned under pressure.",
    tags: ["Micro-lesson (free)", "Mini quiz (free)"],
    slug: "conflict-management",
  },
  {
    title: "Motivation",
    description: "Sustain energy, autonomy, and accountability in your team.",
    tags: ["Micro-lesson (free)", "Mini quiz (free)"],
    slug: "motivation",
  },
];

export default function LearningPage() {
  const [expandedBlock, setExpandedBlock] = useState<string | null>(learningBlocks[0].slug);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Learning Blocks</p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Four focused modules</h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              Choose a block and expand it to start a test, jump into lessons, or open the trainer.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Back to home <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {learningBlocks.map((block) => {
          const isExpanded = expandedBlock === block.slug;
          return (
            <div key={block.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <button
                type="button"
                onClick={() => setExpandedBlock(isExpanded ? null : block.slug)}
                className="flex w-full items-center justify-between text-left"
              >
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{block.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{block.description}</p>
                </div>
                <ArrowRight size={16} className={`transition ${isExpanded ? "rotate-90 text-slate-900" : "text-slate-500"}`} />
              </button>
              <div className="mt-4 flex flex-wrap gap-2">
                {block.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
              {isExpanded ? (
                <div className="mt-5 grid gap-2">
                  <Link
                    href={`/lesson/${block.slug}?tab=test`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                  >
                    Тест
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    href={`/lesson/${block.slug}?tab=lessons`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                  >
                    Уроки
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    href={`/lesson/${block.slug}?tab=trainer`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                  >
                    Тренажер
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}
