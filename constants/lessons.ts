export const TOTAL_STEPS = 10;

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type ChecklistFeedback = {
  minChecked: number;
  title: string;
  message: string;
  tone: "success" | "warning" | "danger" | "info";
};

export type LessonScreen =
  | {
      id: string;
      type: "checklist";
      title: string;
      subtitle?: string;
      imageUrl?: string;
      imageAlt?: string;
      items: string[];
      feedback?: ChecklistFeedback[];
    }
  | {
      id: string;
      type: "video";
      title: string;
      subtitle?: string;
      imageUrl?: string;
      imageAlt?: string;
      videoUrl: string;
      captions: string[];
    }
  | {
      id: string;
      type: "quiz";
      title: string;
      subtitle?: string;
      imageUrl?: string;
      imageAlt?: string;
      question: QuizQuestion;
    }
  | {
      id: string;
      type: "protocol";
      title: string;
      subtitle?: string;
      imageUrl?: string;
      imageAlt?: string;
      steps: Array<{ title: string; details: string }>;
    };

export type Lesson = {
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  premium: boolean;
  requiresAuth?: boolean;
  chain: {
    a: string;
    b: string;
    c: string;
  };
  readinessChecks: string[];
  quiz: QuizQuestion[];
  screens: LessonScreen[];
};
