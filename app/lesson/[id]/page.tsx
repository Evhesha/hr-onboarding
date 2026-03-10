import { notFound } from "next/navigation";
import { getLessonById, getLessons } from "@/lib/lessonCatalog";
import { InteractiveLessonEngine } from "@/components/InteractiveLessonEngine";

export const dynamic = "force-dynamic";

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const [lesson, lessons] = await Promise.all([getLessonById(id), getLessons()]);

  if (!lesson) {
    notFound();
  }

  const lessonIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessonIndex >= 0 ? lessons[lessonIndex + 1] : undefined;

  return (
    <InteractiveLessonEngine
      lesson={lesson}
      nextLesson={
        nextLesson
          ? {
              id: nextLesson.id,
              shortTitle: nextLesson.shortTitle,
            }
          : null
      }
    />
  );
}
