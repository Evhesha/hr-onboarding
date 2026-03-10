"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { LessonScreen } from "@/constants/lessons";

type Props = {
  screen: LessonScreen;
};

function getYouTubeEmbedUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      if (url.pathname.startsWith("/embed/")) {
        return videoUrl;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function LessonScreenRenderer({ screen }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showCaptions, setShowCaptions] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [expandedProtocolStep, setExpandedProtocolStep] = useState<number | null>(0);
  const checklistItemsCount = screen.type === "checklist" ? screen.items.length : 0;

  const checklistProgress = useMemo(() => {
    if (checklistItemsCount === 0) return 0;
    const done = Object.values(checked).filter(Boolean).length;
    return Math.round((done / checklistItemsCount) * 100);
  }, [checked, checklistItemsCount]);

  const checkedCount = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked],
  );

  const embeddedVideoUrl = useMemo(
    () => (screen.type === "video" ? getYouTubeEmbedUrl(screen.videoUrl) : null),
    [screen],
  );
  const screenImageUrl = useMemo(() => {
    if (!screen.imageUrl) return null;
    if (/^https?:\/\//.test(screen.imageUrl) || screen.imageUrl.startsWith("/")) return screen.imageUrl;
    if (screen.imageUrl.startsWith("lessons-images/")) return `/${screen.imageUrl}`;
    return `/lessons-images/${screen.imageUrl}`;
  }, [screen.imageUrl]);
  const screenImageAlt = screen.imageAlt || screen.title;
  const screenImage = screenImageUrl ? (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Image
        src={screenImageUrl}
        alt={screenImageAlt}
        width={1200}
        height={675}
        unoptimized
        className="h-auto w-full object-cover"
      />
    </div>
  ) : null;

  switch (screen.type) {
    case "checklist": {
      const activeFeedback = screen.feedback
        ?.slice()
        .sort((left, right) => right.minChecked - left.minChecked)
        .find((item) => checkedCount >= item.minChecked);

      const feedbackStyles = activeFeedback
        ? {
            success: "border-emerald-300 bg-emerald-50 text-emerald-900",
            warning: "border-amber-300 bg-amber-50 text-amber-900",
            danger: "border-rose-300 bg-rose-50 text-rose-900",
            info: "border-cyan-300 bg-cyan-50 text-cyan-900",
          }[activeFeedback.tone]
        : null;

      return (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{screen.title}</h2>
            {screen.subtitle && <p className="mt-1 text-sm text-slate-600">{screen.subtitle}</p>}
          </div>
          {screenImage}

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            {screen.items.map((item, idx) => {
              const key = `${screen.id}-${idx}`;
              const isChecked = checked[key] ?? false;

              return (
                <label key={key} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => setChecked((prev) => ({ ...prev, [key]: !isChecked }))}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600"
                  />
                  <span className={`text-sm ${isChecked ? "text-slate-400 line-through" : "text-slate-700"}`}>
                    {item}
                  </span>
                </label>
              );
            })}
            <div className="pt-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Checklist progress: {checklistProgress}% ({checkedCount}/{screen.items.length})
              </p>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>
            </div>

            {activeFeedback && (
              <div className={`rounded-xl border px-4 py-3 text-sm ${feedbackStyles}`}>
                <p className="font-semibold">{activeFeedback.title}</p>
                <p className="mt-1">{activeFeedback.message}</p>
              </div>
            )}
          </div>
        </section>
      );
    }

    case "video": {
      return (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{screen.title}</h2>
            {screen.subtitle && <p className="mt-1 text-sm text-slate-600">{screen.subtitle}</p>}
          </div>
          {screenImage}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            {embeddedVideoUrl ? (
              <iframe
                className="aspect-video w-full"
                src={embeddedVideoUrl}
                title={screen.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <video controls className="aspect-video w-full" src={screen.videoUrl}>
                Ваш браузер не поддерживает видео.
              </video>
            )}
          </div>

          {embeddedVideoUrl && (
            <a
              href={screen.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Открыть в YouTube
            </a>
          )}

          <button
            type="button"
            onClick={() => setShowCaptions((value) => !value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
          >
            {showCaptions ? "Скрыть" : "Показать"} captions
          </button>

          {showCaptions && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Custom captions</p>
              <ul className="space-y-1 text-sm text-slate-700">
                {screen.captions.map((caption) => (
                  <li key={caption}>• {caption}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      );
    }

    case "quiz": {
      const isAnswered = selectedOption !== null;
      const isCorrect = selectedOption === screen.question.correctIndex;

      return (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{screen.title}</h2>
            <p className="mt-1 text-sm text-slate-700">{screen.question.question}</p>
          </div>
          {screenImage}

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            {screen.question.options.map((option, idx) => {
              const picked = selectedOption === idx;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                    picked
                      ? "border-cyan-500 bg-cyan-50 text-cyan-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-rose-300 bg-rose-50 text-rose-800"
              }`}
            >
              <p className="font-semibold">{isCorrect ? "Верно" : "Почти"}</p>
              <p className="mt-1">{screen.question.explanation}</p>
            </div>
          )}
        </section>
      );
    }

    case "protocol": {
      return (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{screen.title}</h2>
            {screen.subtitle && <p className="mt-1 text-sm text-slate-600">{screen.subtitle}</p>}
          </div>
          {screenImage}

          <div className="space-y-2">
            {screen.steps.map((step, idx) => {
              const expanded = expandedProtocolStep === idx;
              return (
                <article key={step.title} className="rounded-2xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setExpandedProtocolStep(expanded ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                  >
                    <span className="font-semibold text-slate-800">{idx + 1}. {step.title}</span>
                    <span className="text-xs text-slate-500">{expanded ? "Hide" : "Expand"}</span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden px-4 pb-3 text-sm text-slate-600">{step.details}</div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}
