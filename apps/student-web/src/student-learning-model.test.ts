import { describe, expect, it } from "vitest";
import type { StudentCurriculumCatalog } from "./auth-api";
import {
  findStudentLesson,
  findStudentSubject,
  lessonCount,
  studentLessonHref,
  studentSubjectHref,
} from "./student-learning-model";

const catalog: StudentCurriculumCatalog = {
  classes: [
    {
      id: "class-1",
      slug: "class-1",
      name: "الصف الأول",
      description: null,
      position: 1,
      subjects: [
        {
          id: "subject-1",
          slug: "arabic",
          name: "اللغة العربية",
          description: null,
          position: 1,
          unsectionedLessons: [
            {
              id: "lesson-a",
              slug: "intro",
              title: "مقدمة",
              summary: null,
              position: 1,
              contentRevision: 1,
              publishedAt: "2026-09-12T00:00:00.000Z",
            },
          ],
          sections: [
            {
              id: "section-1",
              slug: "unit-1",
              title: "الوحدة الأولى",
              description: null,
              position: 1,
              lessons: [
                {
                  id: "lesson-b",
                  slug: "reading",
                  title: "القراءة",
                  summary: null,
                  position: 1,
                  contentRevision: 2,
                  publishedAt: "2026-09-12T00:00:00.000Z",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

describe("student learning route model", () => {
  it("resolves subjects only from the authorized curriculum catalog", () => {
    expect(findStudentSubject(catalog, "subject-1")?.classRecord.id).toBe("class-1");
    expect(findStudentSubject(catalog, "missing")).toBeNull();
  });

  it("resolves unsectioned and section lessons with parent context", () => {
    expect(findStudentLesson(catalog, "lesson-a")?.subject.id).toBe("subject-1");
    expect(findStudentLesson(catalog, "lesson-b")?.classRecord.id).toBe("class-1");
    expect(findStudentLesson(catalog, "missing")).toBeNull();

    const subject = findStudentSubject(catalog, "subject-1")?.subject;
    expect(subject).toBeDefined();
    if (!subject) throw new Error("expected subject fixture");
    expect(lessonCount(subject)).toBe(2);
  });

  it("encodes learning route identifiers", () => {
    expect(studentSubjectHref("subject / 1")).toBe("/app/learn/subjects/subject%20%2F%201");
    expect(studentLessonHref("lesson / 1")).toBe("/app/learn/lessons/lesson%20%2F%201");
  });
});
