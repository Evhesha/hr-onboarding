type StepNavigatorProps = {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
};

export function StepNavigator({
  currentStep,
  totalSteps,
  onBack,
  onNext,
}: StepNavigatorProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep}
        className="rounded-xl border-2 border-slate-800 px-5 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Назад
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={isLastStep}
        className="rounded-xl border-2 border-blue-900 bg-blue-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Продолжить
      </button>
    </div>
  );
}
