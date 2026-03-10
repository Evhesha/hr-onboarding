import { ArrowRight } from "lucide-react";

type TransitivityVisualizerProps = {
  a: string;
  b: string;
  c: string;
};

function Node({ label }: { label: string }) {
  return (
    <div className="min-w-24 rounded-xl border-2 border-slate-900 bg-slate-100 px-4 py-2 text-center text-sm font-bold text-slate-950">
      {label}
    </div>
  );
}

export function TransitivityVisualizer({
  a,
  b,
  c,
}: TransitivityVisualizerProps) {
  return (
    <section className="rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-slate-950">Transitivity Visualizer</h3>

      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <Node label={a} />
        <ArrowRight className="text-blue-700" size={18} aria-hidden="true" />
        <Node label={b} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <Node label={b} />
        <ArrowRight className="text-blue-700" size={18} aria-hidden="true" />
        <Node label={c} />
      </div>

      <div className="rounded-lg border border-blue-300 bg-blue-50 p-3 text-center text-sm font-semibold text-blue-900">
        {a} -&gt; {b} and {b} -&gt; {c} imply {a} -&gt; {c}
      </div>
    </section>
  );
}
