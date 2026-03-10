export type LessonProgressRecord = {
  lessonSlug: string;
  currentStep: number;
  isCompleted: boolean;
  lastAccessed?: string;
};

const GUEST_PROGRESS_STORAGE_KEY = "asf_guest_lesson_progress";

type BackendProgressItem = {
  currentStep?: number;
  isCompleted?: boolean;
  lastAccessed?: string;
  lesson?: {
    slug?: string;
  };
  Lesson?: {
    slug?: string;
  };
};

function toProgressRecord(item: BackendProgressItem): LessonProgressRecord | null {
  const lessonSlug = item.lesson?.slug ?? item.Lesson?.slug;
  if (!lessonSlug) {
    return null;
  }

  return {
    lessonSlug,
    currentStep: Math.max(0, Number(item.currentStep ?? 0)),
    isCompleted: Boolean(item.isCompleted),
    lastAccessed: item.lastAccessed,
  };
}

function isBrowser() {
  return typeof window !== "undefined";
}

function readGuestProgressMap(): Record<string, LessonProgressRecord> {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, Partial<LessonProgressRecord>>;
    return Object.entries(parsed).reduce<Record<string, LessonProgressRecord>>((acc, [slug, value]) => {
      acc[slug] = {
        lessonSlug: slug,
        currentStep: Math.max(0, Number(value.currentStep ?? 0)),
        isCompleted: Boolean(value.isCompleted),
        lastAccessed: value.lastAccessed,
      };
      return acc;
    }, {});
  } catch {
    return {};
  }
}

function writeGuestProgressMap(progressMap: Record<string, LessonProgressRecord>) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
}

export async function fetchAllLessonProgress(isAuthenticated = true): Promise<Record<string, LessonProgressRecord>> {
  if (!isAuthenticated) {
    return readGuestProgressMap();
  }

  const response = await fetch("/api/lessons/progress", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      return {};
    }
    throw new Error("Не удалось загрузить прогресс по урокам");
  }

  const payload = (await response.json()) as BackendProgressItem[];
  return payload.reduce<Record<string, LessonProgressRecord>>((acc, item) => {
    const mapped = toProgressRecord(item);
    if (mapped) {
      acc[mapped.lessonSlug] = mapped;
    }
    return acc;
  }, {});
}

export async function fetchLessonProgress(slug: string, isAuthenticated = true): Promise<LessonProgressRecord | null> {
  const guestProgress = readGuestProgressMap()[slug];
  if (guestProgress) {
    return guestProgress;
  }

  if (!isAuthenticated) {
    return null;
  }

  const response = await fetch(`/api/lessons/${slug}/progress`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403 || response.status === 404) {
      return null;
    }
    throw new Error("Не удалось загрузить прогресс урока");
  }

  const payload = (await response.json()) as {
    progress?: {
      currentStep?: number;
      isCompleted?: boolean;
      lastAccessed?: string;
    };
  };

  return {
    lessonSlug: slug,
    currentStep: Math.max(0, Number(payload.progress?.currentStep ?? 0)),
    isCompleted: Boolean(payload.progress?.isCompleted),
    lastAccessed: payload.progress?.lastAccessed,
  };
}

export async function saveLessonProgress(slug: string, currentStep: number, totalSteps: number, isAuthenticated = true) {
  const safeTotalSteps = Math.max(1, totalSteps);
  const safeStep = Math.max(1, Math.min(safeTotalSteps, currentStep));

  if (!isAuthenticated) {
    const currentMap = readGuestProgressMap();
    const previous = currentMap[slug];
    const nextStep = Math.max(previous?.currentStep ?? 0, safeStep);

    writeGuestProgressMap({
      ...currentMap,
      [slug]: {
        lessonSlug: slug,
        currentStep: nextStep,
        isCompleted: Boolean(previous?.isCompleted) || nextStep >= safeTotalSteps,
        lastAccessed: new Date().toISOString(),
      },
    });
    return;
  }

  const response = await fetch(`/api/lessons/${slug}/progress`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      currentStep: safeStep,
      isCompleted: safeStep >= safeTotalSteps,
    }),
  });

  if (!response.ok) {
    throw new Error("Не удалось сохранить прогресс урока");
  }
}

export function progressToPercent(currentStep: number, isCompleted: boolean, totalSteps: number) {
  const safeTotalSteps = Math.max(1, totalSteps);
  if (isCompleted) return 100;
  if (currentStep <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((currentStep / safeTotalSteps) * 100)));
}
