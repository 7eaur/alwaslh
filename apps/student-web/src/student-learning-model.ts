import type {
  StudentCurriculumCatalog,
  StudentCurriculumClass,
  StudentCurriculumLesson,
  StudentCurriculumSubject,
} from "./auth-api";

export interface StudentSubjectContext {
  classRecord: StudentCurriculumClass;
  subject: StudentCurriculumSubject;
}

export interface StudentLessonContext extends StudentSubjectContext {
  lesson: StudentCurriculumLesson;
}

export function lessonCount(subject: StudentCurriculumSubject): number {
  return (
    subject.unsectionedLessons.length +
    subject.sections.reduce((total, section) => total + section.lessons.length, 0)
  );
}

export function findStudentSubject(
  catalog: StudentCurriculumCatalog,
  subjectId: string,
): StudentSubjectContext | null {
  for (const classRecord of catalog.classes) {
    const subject = classRecord.subjects.find((candidate) => candidate.id === subjectId);
    if (subject) return { classRecord, subject };
  }
  return null;
}

export function findStudentLesson(
  catalog: StudentCurriculumCatalog,
  lessonId: string,
): StudentLessonContext | null {
  for (const classRecord of catalog.classes) {
    for (const subject of classRecord.subjects) {
      const unsectioned = subject.unsectionedLessons.find((candidate) => candidate.id === lessonId);
      if (unsectioned) return { classRecord, subject, lesson: unsectioned };

      for (const section of subject.sections) {
        const lesson = section.lessons.find((candidate) => candidate.id === lessonId);
        if (lesson) return { classRecord, subject, lesson };
      }
    }
  }
  return null;
}

export function studentSubjectHref(subjectId: string): string {
  return `/app/learn/subjects/${encodeURIComponent(subjectId)}`;
}

export function studentLessonHref(lessonId: string): string {
  return `/app/learn/lessons/${encodeURIComponent(lessonId)}`;
}
