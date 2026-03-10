import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { type ChecklistFeedback, type Lesson, type LessonScreen, type QuizQuestion } from "@/constants/lessons";

const LESSONS_DIR = path.join(process.cwd(), "lessons");

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isQuizQuestion(value: unknown): value is QuizQuestion {
  return (
    isObject(value) &&
    typeof value.question === "string" &&
    isStringArray(value.options) &&
    typeof value.correctIndex === "number" &&
    typeof value.explanation === "string"
  );
}

function isChecklistFeedback(value: unknown): value is ChecklistFeedback {
  return (
    isObject(value) &&
    typeof value.minChecked === "number" &&
    typeof value.title === "string" &&
    typeof value.message === "string" &&
    (value.tone === "success" || value.tone === "warning" || value.tone === "danger" || value.tone === "info")
  );
}

function isLessonScreen(value: unknown): value is LessonScreen {
  if (!isObject(value) || typeof value.id !== "string" || typeof value.type !== "string" || typeof value.title !== "string") {
    return false;
  }

  if ("subtitle" in value && value.subtitle !== undefined && typeof value.subtitle !== "string") {
    return false;
  }

  if ("imageUrl" in value && value.imageUrl !== undefined && typeof value.imageUrl !== "string") {
    return false;
  }

  if ("imageAlt" in value && value.imageAlt !== undefined && typeof value.imageAlt !== "string") {
    return false;
  }

  switch (value.type) {
    case "checklist":
      return (
        isStringArray(value.items) &&
        (!("feedback" in value) ||
          value.feedback === undefined ||
          (Array.isArray(value.feedback) && value.feedback.every(isChecklistFeedback)))
      );
    case "video":
      return typeof value.videoUrl === "string" && isStringArray(value.captions);
    case "quiz":
      return isQuizQuestion(value.question);
    case "protocol":
      return (
        Array.isArray(value.steps) &&
        value.steps.every(
          (step) =>
            isObject(step) &&
            typeof step.title === "string" &&
            typeof step.details === "string",
        )
      );
    default:
      return false;
  }
}

function isLesson(value: unknown): value is Lesson {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.shortTitle === "string" &&
    typeof value.subtitle === "string" &&
    typeof value.premium === "boolean" &&
    (!("requiresAuth" in value) || typeof value.requiresAuth === "boolean") &&
    isObject(value.chain) &&
    typeof value.chain.a === "string" &&
    typeof value.chain.b === "string" &&
    typeof value.chain.c === "string" &&
    isStringArray(value.readinessChecks) &&
    Array.isArray(value.quiz) &&
    value.quiz.every(isQuizQuestion) &&
    Array.isArray(value.screens) &&
    value.screens.every(isLessonScreen)
  );
}

function lessonAccessRank(lesson: Lesson) {
  if (lesson.premium) return 2;
  if (lesson.requiresAuth) return 1;
  return 0;
}

async function loadLessonFromFile(fileName: string): Promise<Lesson | null> {
  if (!fileName.endsWith(".json")) {
    return null;
  }

  try {
    const filePath = path.join(LESSONS_DIR, fileName);
    const rawContent = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(rawContent) as unknown;

    if (!isLesson(parsed)) {
      console.warn(`Skipping invalid lesson file: ${fileName}`);
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn(`Skipping unreadable lesson file: ${fileName}`, error);
    return null;
  }
}

export async function getLessons(): Promise<Lesson[]> {
  const fileNames = await readdir(LESSONS_DIR);
  const lessons = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".json"))
      .sort((left, right) => left.localeCompare(right))
      .map((fileName) => loadLessonFromFile(fileName)),
  );

  return lessons
    .filter((lesson): lesson is Lesson => lesson !== null)
    .sort((left, right) => {
      const leftRank = lessonAccessRank(left);
      const rightRank = lessonAccessRank(right);

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return left.title.localeCompare(right.title, "ru");
    });
}

export async function getLessonById(id: string): Promise<Lesson | undefined> {
  const lessons = await getLessons();
  return lessons.find((lesson) => lesson.id === id);
}
