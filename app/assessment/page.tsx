"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, RefreshCcw } from "lucide-react";
import {
  AnswerId,
  AssessmentTest,
  assessmentTests,
  getScaleBand,
} from "@/lib/assessmentData";

const COOKIE_NAME = "assessment_results";

type StoredResults = {
  updatedAt: string;
  latestTestId: AssessmentTest["id"];
  results: Record<
    AssessmentTest["id"],
    {
      score: number;
      completedAt: string;
    }
  >;
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

const writeResultsCookie = (payload: StoredResults) => {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(JSON.stringify(payload));
  document.cookie = `${COOKIE_NAME}=${encoded}; path=/; max-age=31536000; samesite=lax`;
};

export default function AssessmentPage() {
  const [selectedTestId, setSelectedTestId] = useState<AssessmentTest["id"]>("feedback");
  const [answers, setAnswers] = useState<Record<number, AnswerId[]>>({});
  const [result, setResult] = useState<{
    score: number;
    level: string;
    description?: string;
    completedAt: string;
  } | null>(null);
  const [saved, setSaved] = useState<StoredResults | null>(null);

  useEffect(() => {
    const cookie = readResultsCookie();
    setSaved(cookie);
    if (cookie?.latestTestId) {
      setSelectedTestId(cookie.latestTestId);
    }
  }, []);

  useEffect(() => {
    setAnswers({});
    setResult(null);
  }, [selectedTestId]);

  const selectedTest = useMemo(
    () => assessmentTests.find((test) => test.id === selectedTestId) ?? assessmentTests[0],
    [selectedTestId]
  );

  const toggleAnswer = (questionId: number, answerId: AnswerId) => {
    setAnswers((prev) => {
      const current = new Set(prev[questionId] ?? []);
      if (current.has(answerId)) {
        current.delete(answerId);
      } else {
        current.add(answerId);
      }
      return { ...prev, [questionId]: Array.from(current) };
    });
  };

  const resetAnswers = () => {
    setAnswers({});
    setResult(null);
  };

  const calculateScore = () => {
    let score = 0;
    selectedTest.questions.forEach((question) => {
      const given = new Set(answers[question.id] ?? []);
      const correct = new Set(question.correct);
      if (given.size !== correct.size) return;
      for (const answer of correct) {
        if (!given.has(answer)) return;
      }
      score += 1;
    });
    return score;
  };

  const submit = () => {
    const score = calculateScore();
    const band = getScaleBand(selectedTest, score);
    const completedAt = new Date().toISOString();
    const nextPayload: StoredResults = {
      updatedAt: completedAt,
      latestTestId: selectedTest.id,
      results: {
        ...(saved?.results ?? {}),
        [selectedTest.id]: { score, completedAt },
      },
    } as StoredResults;

    writeResultsCookie(nextPayload);
    setSaved(nextPayload);
    setResult({
      score,
      level: band.label,
      description: band.description,
      completedAt,
    });
  };

  const savedForTest = saved?.results?.[selectedTest.id];

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Free Assessment</p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Leadership competency check
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              Choose a topic, answer 10 questions, and instantly see your level. Results are stored locally
              in cookies — no database needed.
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
        {assessmentTests.map((test) => {
          const isActive = test.id === selectedTestId;
          const testResult = saved?.results?.[test.id];
          return (
            <button
              key={test.id}
              type="button"
              onClick={() => setSelectedTestId(test.id)}
              className={`rounded-2xl border p-5 text-left shadow-sm transition ${
                isActive
                  ? "border-teal-400 bg-teal-50/60"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <h2 className="text-lg font-semibold text-slate-900">{test.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{test.description}</p>
              {testResult ? (
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-teal-700">
                  <CheckCircle2 size={16} /> Last score: {testResult.score}/10
                </div>
              ) : (
                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Not attempted
                </div>
              )}
            </button>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Now testing</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">{selectedTest.title}</h3>
              <p className="mt-2 text-sm text-slate-600">Select all answers that apply.</p>
            </div>
            <button
              type="button"
              onClick={resetAnswers}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Reset <RefreshCcw size={14} />
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {selectedTest.questions.map((question) => (
              <div key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  {question.id}. {question.text}
                </p>
                <div className="mt-3 grid gap-2">
                  {question.options.map((option) => {
                    const checked = (answers[question.id] ?? []).includes(option.id);
                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                          checked
                            ? "border-teal-400 bg-white"
                            : "border-slate-200 bg-white/80 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAnswer(question.id, option.id)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600"
                        />
                        <span className="text-slate-700">
                          <span className="font-semibold text-slate-900">{option.id}.</span> {option.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submit}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Get result <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Your result</p>
            {result ? (
              <div className="mt-4 space-y-3">
                <h4 className="text-2xl font-semibold text-slate-900">
                  {result.score}/10 — {result.level}
                </h4>
                {result.description ? (
                  <p className="text-sm text-slate-600">{result.description}</p>
                ) : (
                  <p className="text-sm text-slate-600">Keep practicing to move up a level.</p>
                )}
                <p className="text-xs text-slate-400">Saved locally • {new Date(result.completedAt).toLocaleString()}</p>
              </div>
            ) : savedForTest ? (
              <div className="mt-4 space-y-3">
                <h4 className="text-2xl font-semibold text-slate-900">{savedForTest.score}/10</h4>
                <p className="text-sm text-slate-600">Take the test again to refresh your result.</p>
                <p className="text-xs text-slate-400">
                  Last attempt • {new Date(savedForTest.completedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">Complete the test to see your competency level.</p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Next steps</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Use the score to choose the right learning block.</li>
              <li>Retake the assessment after finishing a micro-lesson.</li>
              <li>All results stay in your browser cookies.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
