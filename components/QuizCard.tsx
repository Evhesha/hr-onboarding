"use client";

import { useState } from "react";
import { BadgeCheck, CircleX } from "lucide-react";
import type { QuizQuestion } from "@/constants/lessons";

type QuizCardProps = {
  questions: QuizQuestion[];
};

export function QuizCard({ questions }: QuizCardProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  return (
    <section className="rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-slate-950">Mini Test (3 Questions)</h3>

      <div className="space-y-5">
        {questions.map((question, questionIndex) => {
          const selected = answers[questionIndex];
          const hasAnswer = typeof selected === "number";
          const isCorrect = selected === question.correctIndex;

          return (
            <article key={question.question} className="rounded-xl border border-slate-300 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-900">
                {questionIndex + 1}. {question.question}
              </p>

              <div className="grid gap-2">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selected === optionIndex;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setAnswers((previous) => ({
                          ...previous,
                          [questionIndex]: optionIndex,
                        }))
                      }
                      className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                        isSelected
                          ? "border-blue-800 bg-blue-100 text-blue-950"
                          : "border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {hasAnswer && (
                <div
                  className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                    isCorrect
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-rose-300 bg-rose-50 text-rose-900"
                  }`}
                >
                  {isCorrect ? (
                    <BadgeCheck size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                  ) : (
                    <CircleX size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                  )}
                  <p>
                    <span className="font-bold">{isCorrect ? "Correct." : "Try again."} </span>
                    {question.explanation}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
