"use client";

import { useMemo, useState } from "react";
import { BookOpen, PlayCircle, Route } from "lucide-react";
import type { Lesson } from "@/constants/lessons";
import { TOTAL_STEPS } from "@/constants/lessons";
import { LessonProgressBar } from "@/components/LessonProgressBar";
import { ReadinessCheck } from "@/components/ReadinessCheck";
import { StepNavigator } from "@/components/StepNavigator";
import { TransitivityVisualizer } from "@/components/TransitivityVisualizer";
import { QuizCard } from "@/components/QuizCard";

type LessonEngineProps = {
  lesson: Lesson;
};

const protocolSteps = [
  "Подготовка рабочего места и стимулов",
  "Установление контакта",
  "Презентация базового стимула",
  "Использование подсказок",
  "Угасание подсказок",
  "Сбор данных",
  "Проверка на транзитивность",
  "Закрепление навыка",
  "Переход к обобщению",
  "Завершение сессии",
];

export function LessonEngine({ lesson }: LessonEngineProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const stepTitle = useMemo(() => {
    if (currentStep <= 2) return "Введение";
    if (currentStep <= 4) return "Логика";
    if (currentStep <= 6) return "Готовность";
    if (currentStep <= 9) return "Проверка";
    return "Финал";
  }, [currentStep]);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-10 px-4 pb-28 pt-6 md:px-8">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-6 text-white md:p-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <BookOpen size={14} /> Модуль 1: Основы
          </div>
          <h1 className="mb-2 text-3xl font-black md:text-5xl">{lesson.title}</h1>
          <p className="mb-6 max-w-2xl text-sm text-slate-200 md:text-base">
            {lesson.subtitle}. В уроке используется принцип транзитивности и
            последовательная отработка связей.
          </p>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            <PlayCircle size={18} /> Начать урок
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Route size={20} className="text-blue-700" />
          <h2 className="text-2xl font-bold">Логическая цепочка</h2>
        </div>
        <TransitivityVisualizer
          a={lesson.chain.a}
          b={lesson.chain.b}
          c={lesson.chain.c}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Чек-лист готовности</h2>
        <ReadinessCheck items={lesson.readinessChecks} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Мини-тест</h2>
        <QuizCard questions={lesson.quiz} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Протокол тренинга</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {protocolSteps.map((step, index) => {
            const stepNumber = index + 1;
            const isCurrent = stepNumber === currentStep;
            const isDone = stepNumber < currentStep;

            return (
              <div
                key={step}
                className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? "bg-blue-700 text-white"
                      : isDone
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {stepNumber.toString().padStart(2, "0")}
                </span>
                <p
                  className={`text-sm ${
                    isCurrent ? "font-bold text-slate-900" : "font-semibold text-slate-600"
                  }`}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="hidden md:block">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {stepTitle}
            </p>
            <div className="mt-1 w-52">
              <LessonProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <StepNavigator
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              onBack={() => setCurrentStep((step) => Math.max(1, step - 1))}
              onNext={() => setCurrentStep((step) => Math.min(TOTAL_STEPS, step + 1))}
            />
          </div>
        </div>
      </footer>
    </main>
  );
}
