import { useEffect, useMemo, useState } from "react";
import {
  ApiRequestError,
  getStudentLessonReader,
  isMissingSessionError,
  listStudentCurriculum,
  studentAssetContentUrl,
  type StudentCurriculumCatalog,
  type StudentCurriculumClass,
  type StudentCurriculumLesson,
  type StudentCurriculumSubject,
  type StudentLessonReader,
  type StudentReaderAsset,
} from "./auth-api";

type CurriculumState =
  | { status: "loading" }
  | { status: "ready"; catalog: StudentCurriculumCatalog }
  | { status: "offline" }
  | { status: "error"; message: string };

type ReaderState =
  | { status: "loading" }
  | { status: "ready"; reader: StudentLessonReader }
  | { status: "offline" }
  | { status: "error"; message: string };

function requestMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر تحميل المحتوى الدراسي. حاول مرة أخرى.";
}

function lessonCount(subject: StudentCurriculumSubject): number {
  return (
    subject.unsectionedLessons.length +
    subject.sections.reduce((total, section) => total + section.lessons.length, 0)
  );
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("ar");
}

function ReaderMedia({ asset }: { asset: StudentReaderAsset }) {
  const [failed, setFailed] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);
  const isImage = asset.mimeType.startsWith("image/");
  const pageLabel = asset.sourcePageNumber ? `صفحة ${asset.sourcePageNumber}` : `محتوى ${asset.position + 1}`;

  if (!isImage) {
    return (
      <div className="reader-media-unsupported" role="status">
        <strong>{pageLabel}</strong>
        <p>هذا النوع من الوسائط ({asset.mimeType}) غير مدعوم في قارئ الدرس الحالي.</p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="reader-media-error" role="alert">
        <strong>تعذر تحميل {pageLabel}</strong>
        <p>قد يكون الاتصال انقطع أو أن الملف لم يعد متاحًا. لن نعرض بديلًا قديمًا على أنه حديث.</p>
        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            setFailed(false);
            setRetryVersion((current) => current + 1);
          }}
        >
          إعادة تحميل الصفحة
        </button>
      </div>
    );
  }

  return (
    <figure className="reader-media">
      <img
        src={`${studentAssetContentUrl(asset.id)}?retry=${retryVersion}`}
        alt={pageLabel}
        width={asset.width ?? undefined}
        height={asset.height ?? undefined}
        loading="lazy"
        onError={() => setFailed(true)}
      />
      <figcaption>{pageLabel}</figcaption>
    </figure>
  );
}

function StudentLessonReaderPanel({
  lesson,
  online,
  onBack,
  onSessionExpired,
}: {
  lesson: StudentCurriculumLesson;
  online: boolean;
  onBack: () => void;
  onSessionExpired: () => void;
}) {
  const [state, setState] = useState<ReaderState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [speaking, setSpeaking] = useState(false);

  async function loadReader() {
    if (!online) {
      setState({ status: "offline" });
      return;
    }
    setState({ status: "loading" });
    try {
      setState({ status: "ready", reader: await getStudentLessonReader(lesson.id) });
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setState({ status: "error", message: requestMessage(error) });
    }
  }

  useEffect(() => {
    setQuery("");
    void loadReader();
  }, [lesson.id, online]);

  useEffect(
    () => () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [],
  );

  const normalizedQuery = normalizeSearch(query);
  const reader = state.status === "ready" ? state.reader : null;
  const readableText = reader
    ? [reader.lesson.summary, ...reader.assets.map((asset) => asset.text)].filter(
        (value): value is string => Boolean(value?.trim()),
      )
    : [];
  const speechSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance === "function";
  const visibleAssets = reader
    ? normalizedQuery
      ? reader.assets.filter((asset) => normalizeSearch(asset.text ?? "").includes(normalizedQuery))
      : reader.assets
    : [];

  function toggleSpeech() {
    if (!speechSupported || readableText.length === 0) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(readableText.join("\n\n"));
    utterance.lang = "ar";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <section className="reader-panel" aria-labelledby="reader-title">
      <div className="reader-toolbar">
        <button className="text-button reader-back" type="button" onClick={onBack}>
          العودة إلى دروس المادة
        </button>
        {state.status === "ready" ? (
          <button
            className="secondary-button"
            type="button"
            onClick={toggleSpeech}
            disabled={!speechSupported || readableText.length === 0}
            aria-pressed={speaking}
          >
            {speaking ? "إيقاف الاستماع" : speechSupported ? "استماع للنص" : "الاستماع غير مدعوم"}
          </button>
        ) : null}
      </div>

      <header className="reader-heading">
        <p className="eyebrow">قارئ الدرس</p>
        <h3 id="reader-title">{lesson.title}</h3>
        {lesson.summary ? <p>{lesson.summary}</p> : null}
      </header>

      {state.status === "loading" ? (
        <div className="reader-skeleton" role="status" aria-live="polite" aria-busy="true">
          <span className="sr-only">جاري تحميل الدرس</span>
          <span />
          <span />
        </div>
      ) : state.status === "offline" ? (
        <div className="form-alert is-warning" role="status">
          يلزم اتصال للتحقق من صلاحية الدرس ووسائطه. سنحافظ على سياق الدرس، لكن لن نعرض نسخة قديمة على أنها حديثة.
        </div>
      ) : state.status === "error" ? (
        <div className="access-error" role="alert">
          <div className="form-alert is-danger">{state.message}</div>
          <button className="secondary-button" type="button" onClick={() => void loadReader()} disabled={!online}>
            إعادة محاولة فتح الدرس
          </button>
        </div>
      ) : (
        <>
          {state.reader.assets.length > 0 && readableText.length > 0 ? (
            <div className="reader-search">
              <label htmlFor={`reader-search-${lesson.id}`}>بحث داخل النص المعتمد</label>
              <input
                id={`reader-search-${lesson.id}`}
                className="text-input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="اكتب كلمة أو عبارة"
              />
              <p className="field-hint">البحث يعمل على النص المنشور والمعتمد فقط، ولا يستخدم نصوصًا قيد المراجعة.</p>
            </div>
          ) : null}

          {state.reader.assets.length === 0 ? (
            <div className="empty-state">
              <strong>لا توجد صفحات منشورة لهذا الدرس بعد</strong>
              <p>يبقى ملخص الدرس ظاهرًا، لكن قارئ الدرس لا يعرض مسودات أو وسائط غير جاهزة.</p>
            </div>
          ) : normalizedQuery && visibleAssets.length === 0 ? (
            <div className="empty-state" role="status">
              <strong>لا توجد نتيجة في النص المعتمد</strong>
              <p>جرّب كلمة أخرى أو امسح البحث للعودة إلى جميع صفحات الدرس.</p>
            </div>
          ) : (
            <div className="reader-pages" aria-label={`محتوى ${lesson.title}`}>
              {visibleAssets.map((asset) => (
                <article className="reader-page" key={asset.id} data-reader-asset-id={asset.id}>
                  <ReaderMedia asset={asset} />
                  {asset.text ? (
                    <div className="reader-text">
                      <p className="eyebrow">النص المعتمد</p>
                      <p>{asset.text}</p>
                    </div>
                  ) : (
                    <div className="reader-text is-muted" role="status">
                      لا يوجد نص معتمد لهذه الصفحة. الصورة المنشورة تبقى المصدر المرئي.
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function LessonRow({
  lesson,
  index,
  onOpen,
}: {
  lesson: StudentCurriculumLesson;
  index: number;
  onOpen: (lesson: StudentCurriculumLesson) => void;
}) {
  return (
    <button className="lesson-row" type="button" data-lesson-id={lesson.id} onClick={() => onOpen(lesson)}>
      <span className="lesson-number" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="lesson-copy">
        <strong>{lesson.title}</strong>
        {lesson.summary ? (
          <span className="lesson-summary">{lesson.summary}</span>
        ) : (
          <span className="lesson-summary lesson-muted">لا يوجد ملخص منشور لهذا الدرس بعد.</span>
        )}
      </span>
      <span className="lesson-status">فتح الدرس</span>
    </button>
  );
}

function SubjectLessons({
  subject,
  onOpenLesson,
}: {
  subject: StudentCurriculumSubject;
  onOpenLesson: (lesson: StudentCurriculumLesson) => void;
}) {
  let lessonIndex = 0;
  return (
    <div className="subject-lessons" aria-label={`دروس ${subject.name}`}>
      {subject.unsectionedLessons.length > 0 ? (
        <div className="lesson-group">
          {subject.unsectionedLessons.map((lesson) => {
            const currentIndex = lessonIndex;
            lessonIndex += 1;
            return <LessonRow key={lesson.id} lesson={lesson} index={currentIndex} onOpen={onOpenLesson} />;
          })}
        </div>
      ) : null}

      {subject.sections.map((section) => (
        <section className="curriculum-section-group" key={section.id} aria-labelledby={`section-${section.id}`}>
          <div className="curriculum-section-heading">
            <div>
              <p className="eyebrow">وحدة دراسية</p>
              <h4 id={`section-${section.id}`}>{section.title}</h4>
              {section.description ? <p>{section.description}</p> : null}
            </div>
            <span>{section.lessons.length} درس</span>
          </div>
          <div className="lesson-group">
            {section.lessons.map((lesson) => {
              const currentIndex = lessonIndex;
              lessonIndex += 1;
              return <LessonRow key={lesson.id} lesson={lesson} index={currentIndex} onOpen={onOpenLesson} />;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function StudentCurriculumSection({
  online,
  refreshKey,
  onSessionExpired,
}: {
  online: boolean;
  refreshKey: number;
  onSessionExpired: () => void;
}) {
  const [state, setState] = useState<CurriculumState>({ status: "loading" });
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<StudentCurriculumLesson | null>(null);
  const [returnFocusLessonId, setReturnFocusLessonId] = useState<string | null>(null);

  async function loadCurriculum() {
    if (!online) {
      setState({ status: "offline" });
      return;
    }
    setState({ status: "loading" });
    try {
      const catalog = await listStudentCurriculum();
      setState({ status: "ready", catalog });
      const firstClass = catalog.classes[0];
      setSelectedClassId((current) =>
        current && catalog.classes.some((record) => record.id === current) ? current : (firstClass?.id ?? null),
      );
      const preferredClass = catalog.classes.find((record) => record.id === selectedClassId) ?? firstClass ?? null;
      setSelectedSubjectId((current) =>
        current && preferredClass?.subjects.some((subject) => subject.id === current)
          ? current
          : (preferredClass?.subjects[0]?.id ?? null),
      );
      setSelectedLesson((current) => {
        if (!current) return null;
        const stillPublished = catalog.classes.some((classRecord) =>
          classRecord.subjects.some(
            (subject) =>
              subject.unsectionedLessons.some((candidate) => candidate.id === current.id) ||
              subject.sections.some((section) => section.lessons.some((candidate) => candidate.id === current.id)),
          ),
        );
        return stillPublished ? current : null;
      });
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setState({ status: "error", message: requestMessage(error) });
    }
  }

  useEffect(() => {
    if (!online && selectedLesson) return;
    void loadCurriculum();
  }, [online, refreshKey]);

  useEffect(() => {
    if (selectedLesson || !returnFocusLessonId) return;
    const lessonButton = document.querySelector<HTMLButtonElement>(`[data-lesson-id="${returnFocusLessonId}"]`);
    lessonButton?.focus();
  }, [selectedLesson, returnFocusLessonId]);

  const selectedClass = useMemo<StudentCurriculumClass | null>(() => {
    if (state.status !== "ready") return null;
    return state.catalog.classes.find((record) => record.id === selectedClassId) ?? state.catalog.classes[0] ?? null;
  }, [selectedClassId, state]);

  const selectedSubject = useMemo<StudentCurriculumSubject | null>(() => {
    if (!selectedClass) return null;
    return selectedClass.subjects.find((subject) => subject.id === selectedSubjectId) ?? selectedClass.subjects[0] ?? null;
  }, [selectedClass, selectedSubjectId]);

  function chooseClass(classId: string) {
    if (state.status !== "ready") return;
    const nextClass = state.catalog.classes.find((record) => record.id === classId);
    if (!nextClass) return;
    setSelectedClassId(classId);
    setSelectedSubjectId(nextClass.subjects[0]?.id ?? null);
    setReturnFocusLessonId(null);
    setSelectedLesson(null);
  }

  function chooseSubject(subjectId: string) {
    setSelectedSubjectId(subjectId);
    setReturnFocusLessonId(null);
    setSelectedLesson(null);
  }

  function openLesson(lesson: StudentCurriculumLesson) {
    setReturnFocusLessonId(lesson.id);
    setSelectedLesson(lesson);
  }

  return (
    <section className="curriculum-surface" aria-labelledby="curriculum-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">مسارك الدراسي</p>
          <h2 id="curriculum-title">الصفوف والمواد والدروس</h2>
        </div>
        <button
          className="text-button"
          type="button"
          onClick={() => void loadCurriculum()}
          disabled={!online || state.status === "loading"}
        >
          تحديث المحتوى
        </button>
      </div>

      {state.status === "loading" ? (
        <div className="curriculum-skeleton" role="status" aria-live="polite" aria-busy="true">
          <span className="sr-only">جاري تحميل المحتوى الدراسي</span>
          <span />
          <span />
          <span />
        </div>
      ) : state.status === "offline" ? (
        <div className="form-alert is-warning" role="status">
          لا يمكن التحقق من أحدث محتوى دراسي أثناء عدم الاتصال. أعد الاتصال قبل فتح محتوى جديد أو تحديث القائمة.
        </div>
      ) : state.status === "error" ? (
        <div className="access-error" role="alert">
          <div className="form-alert is-danger">{state.message}</div>
          <button className="secondary-button" type="button" onClick={() => void loadCurriculum()} disabled={!online}>
            إعادة المحاولة
          </button>
        </div>
      ) : state.catalog.classes.length === 0 ? (
        <div className="empty-state">
          <strong>لا يوجد محتوى دراسي منشور ضمن صلاحياتك الآن</strong>
          <p>إذا أضفت رمز صف للتو فحدّث المحتوى. لن تظهر دروس غير منشورة أو صفوف خارج صلاحياتك.</p>
        </div>
      ) : (
        <div className="curriculum-browser">
          <nav className="class-switcher" aria-label="الصفوف المتاحة">
            {state.catalog.classes.map((classRecord) => (
              <button
                key={classRecord.id}
                type="button"
                className={classRecord.id === selectedClass?.id ? "is-active" : ""}
                aria-pressed={classRecord.id === selectedClass?.id}
                onClick={() => chooseClass(classRecord.id)}
              >
                <strong>{classRecord.name}</strong>
                <small>{classRecord.subjects.length} مادة</small>
              </button>
            ))}
          </nav>

          {selectedClass ? (
            <div className="curriculum-workspace">
              <header className="curriculum-context">
                <p className="eyebrow">الصف الحالي</p>
                <h3>{selectedClass.name}</h3>
                {selectedClass.description ? <p>{selectedClass.description}</p> : null}
              </header>

              {selectedClass.subjects.length === 0 ? (
                <div className="empty-state">
                  <strong>لا توجد مواد نشطة منشورة لهذا الصف</strong>
                  <p>يبقى الصف ظاهرًا لأنه ضمن صلاحياتك، ولن تظهر مواد أو دروس غير منشورة.</p>
                </div>
              ) : (
                <>
                  <nav className="subject-switcher" aria-label="مواد الصف">
                    {selectedClass.subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        className={subject.id === selectedSubject?.id ? "is-active" : ""}
                        aria-pressed={subject.id === selectedSubject?.id}
                        onClick={() => chooseSubject(subject.id)}
                      >
                        <span>{subject.name}</span>
                        <small>{lessonCount(subject)} درس</small>
                      </button>
                    ))}
                  </nav>

                  {selectedSubject ? (
                    <section className="subject-panel" aria-labelledby={`subject-${selectedSubject.id}`}>
                      {selectedLesson ? (
                        <StudentLessonReaderPanel
                          lesson={selectedLesson}
                          online={online}
                          onBack={() => setSelectedLesson(null)}
                          onSessionExpired={onSessionExpired}
                        />
                      ) : (
                        <>
                          <div className="subject-heading">
                            <div>
                              <p className="eyebrow">المادة</p>
                              <h3 id={`subject-${selectedSubject.id}`}>{selectedSubject.name}</h3>
                              {selectedSubject.description ? <p>{selectedSubject.description}</p> : null}
                            </div>
                            <span className="subject-count">{lessonCount(selectedSubject)} درس منشور</span>
                          </div>

                          {lessonCount(selectedSubject) === 0 ? (
                            <div className="empty-state">
                              <strong>لا توجد دروس منشورة في هذه المادة بعد</strong>
                              <p>سيظهر الدرس هنا فقط بعد نشره واعتماده ضمن صلاحياتك.</p>
                            </div>
                          ) : (
                            <SubjectLessons subject={selectedSubject} onOpenLesson={openLesson} />
                          )}
                        </>
                      )}
                    </section>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
