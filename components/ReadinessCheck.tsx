"use client";

import { useMemo, useState } from "react";
import { CheckSquare, Square } from "lucide-react";

type ReadinessCheckProps = {
  items: string[];
};

export function ReadinessCheck({ items }: ReadinessCheckProps) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));

  const checkedCount = useMemo(
    () => checked.filter(Boolean).length,
    [checked],
  );

  const isReady = checkedCount >= 4;

  function toggle(index: number) {
    setChecked((previous) =>
      previous.map((value, currentIndex) =>
        currentIndex === index ? !value : value,
      ),
    );
  }

  return (
    <section className="rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-950">Readiness Check</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            isReady
              ? "bg-emerald-600 text-white"
              : "bg-amber-500 text-slate-950"
          }`}
        >
          {isReady ? "Ready" : "Not ready"}
        </span>
      </div>

      <p className="mb-4 text-sm font-medium text-slate-700">
        {checkedCount}/5 checks completed. Mark at least 4 to unlock Ready status.
      </p>

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={item}>
            <button
              type="button"
              onClick={() => toggle(index)}
              className="flex w-full items-start gap-3 rounded-lg border border-slate-300 bg-slate-50 p-3 text-left transition hover:bg-slate-100"
            >
              {checked[index] ? (
                <CheckSquare
                  className="mt-0.5 shrink-0 text-emerald-700"
                  size={18}
                  aria-hidden="true"
                />
              ) : (
                <Square
                  className="mt-0.5 shrink-0 text-slate-600"
                  size={18}
                  aria-hidden="true"
                />
              )}
              <span className="text-sm font-medium text-slate-900">{item}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
