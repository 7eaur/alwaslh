import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ApiRequestError,
  type AdminCurriculumSnapshot,
  type CurriculumLesson,
  type CurriculumRecordStatus,
  type CurriculumSection,
  createCurriculumClass,
  createCurriculumLesson,
  createCurriculumSection,
  createCurriculumSubject,
  createSubjectOffering,
  fetchAdminCurriculum,
  isMissingSessionError,
  updateCurriculumClass,
  updateCurriculumLesson,
  updateCurriculumSection,
  updateCurriculumSubject,
  updateSubjectOffering,
} from "./admin-api";

const statusOptions: readonly CurriculumRecordStatus[] = ["active", "inactive", "archived"];

function statusLabel(status: CurriculumRecordStatus): string {
  switch (status) {
    case "active":
      return "نشط";
    case "inactive":
      return "غير نشط";
    case "archived":
      return "مؤرشف";
  }
}

function fieldString(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function fieldNumber(form: FormData, name: string): number | undefined {
  const raw = fieldString(form, name);
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : undefined;
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "حدث خطأ غير متوقع. أعد المحاولة، وإذا استمر الخطأ راجع سجل التشغيل.";
}

export function CurriculumWorkspace({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [snapshot, setSnapshot] = useState<AdminCurriculumSnapshot | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [actionState, setActionState] = useState<{
    kind: "idle" | "busy" | "success" | "error";
    message: string;
  }>({ kind: "idle", message: "" });
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const refresh = useCallback(async () => {
    setLoadState("loading");
    setLoadError("");
    try {
      setSnapshot(await fetchAdminCurriculum());
      setLoadState("ready");
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setLoadError(errorMessage(error));
      setLoadState("error");
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!snapshot) return;
    if (!selectedClassId || !snapshot.classes.some((record) => record.id === selectedClassId)) {
      setSelectedClassId(
        snapshot.classes.find((record) => record.status !== "archived")?.id ?? snapshot.classes[0]?.id ?? "",
      );
    }
  }, [selectedClassId, snapshot]);

  const selectedClass = snapshot?.classes.find((record) => record.id === selectedClassId);
  const offeringsForClass = useMemo(
    () => snapshot?.offerings.filter((offering) => offering.classId === selectedClassId) ?? [],
    [selectedClassId, snapshot],
  );

  useEffect(() => {
    if (!snapshot) return;
    if (!selectedSubjectId || !offeringsForClass.some((offering) => offering.subjectId === selectedSubjectId)) {
      setSelectedSubjectId(offeringsForClass[0]?.subjectId ?? "");
    }
  }, [offeringsForClass, selectedSubjectId, snapshot]);

  const subjectById = useMemo(
    () => new Map(snapshot?.subjects.map((subject) => [subject.id, subject]) ?? []),
    [snapshot],
  );
  const selectedSubject = subjectById.get(selectedSubjectId);
  const selectedOffering = offeringsForClass.find((offering) => offering.subjectId === selectedSubjectId);
  const sections = useMemo(
    () =>
      snapshot?.sections.filter(
        (section) => section.classId === selectedClassId && section.subjectId === selectedSubjectId,
      ) ?? [],
    [selectedClassId, selectedSubjectId, snapshot],
  );
  const lessons = useMemo(
    () =>
      snapshot?.lessons.filter(
        (lesson) => lesson.classId === selectedClassId && lesson.subjectId === selectedSubjectId,
      ) ?? [],
    [selectedClassId, selectedSubjectId, snapshot],
  );

  const runMutation = useCallback(
    async (label: string, work: () => Promise<void>): Promise<boolean> => {
      setActionState({ kind: "busy", message: label });
      try {
        await work();
        setSnapshot(await fetchAdminCurriculum());
        setLoadState("ready");
        setActionState({ kind: "success", message: "تم حفظ التغيير وتحديث بيانات المنهج." });
        return true;
      } catch (error) {
        if (isMissingSessionError(error)) {
          onSessionExpired();
          return false;
        }
        setActionState({ kind: "error", message: errorMessage(error) });
        return false;
      }
    },
    [onSessionExpired],
  );

  if (loadState === "loading" && !snapshot) {
    return <WorkspaceState title="جارٍ تحميل المنهج" body="نقرأ البنية الحالية من الخادم، وليس من cache محلي." />;
  }

  if (loadState === "error" && !snapshot) {
    return (
      <WorkspaceState title="تعذر تحميل المنهج" body={loadError}>
        <button className="primary-button" type="button" onClick={() => void refresh()}>
          إعادة المحاولة
        </button>
      </WorkspaceState>
    );
  }

  if (!snapshot) return null;
  const activeBusy = actionState.kind === "busy";

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">إدارة المنهج</p>
          <h1>الصفوف والمواد والدروس</h1>
          <p className="page-description">
            بنية صريحة: صف ← مادة ضمن الصف ← وحدة اختيارية ← درس. الحذف المدمر غير متاح هنا؛ استخدم الحالة
            والأرشفة لحماية التاريخ التعليمي.
          </p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => void refresh()}
          disabled={loadState === "loading" || activeBusy}
        >
          {loadState === "loading" ? "جارٍ التحديث…" : "تحديث البيانات"}
        </button>
      </header>

      <section className="metric-grid" aria-label="ملخص المنهج">
        <Metric label="الصفوف" value={snapshot.classes.length} />
        <Metric label="المواد" value={snapshot.subjects.length} />
        <Metric label="روابط المواد" value={snapshot.offerings.length} />
        <Metric label="الدروس" value={snapshot.lessons.length} />
      </section>

      <MutationFeedback state={actionState} />

      <section className="creation-grid" aria-label="إضافة بنية المنهج">
        <CreateClassForm
          disabled={activeBusy}
          onCreate={(input) => runMutation("جارٍ إنشاء الصف…", () => createCurriculumClass(input))}
        />
        <CreateSubjectForm
          disabled={activeBusy}
          onCreate={(input) => runMutation("جارٍ إنشاء المادة…", () => createCurriculumSubject(input))}
        />
        <CreateOfferingForm
          snapshot={snapshot}
          disabled={activeBusy}
          onCreate={(input) => runMutation("جارٍ ربط المادة بالصف…", () => createSubjectOffering(input))}
        />
      </section>

      {snapshot.classes.length === 0 ? (
        <WorkspaceState
          title="لا توجد صفوف بعد"
          body="ابدأ بإضافة صف ومادة، ثم اربط المادة بالصف لإنشاء مساحة الدروس."
        />
      ) : (
        <section className="curriculum-browser" aria-labelledby="curriculum-browser-title">
          <div className="browser-heading">
            <div>
              <p className="section-kicker">HIERARCHY</p>
              <h2 id="curriculum-browser-title">استعراض المنهج</h2>
            </div>
            <div className="selector-row">
              <label>
                <span>الصف</span>
                <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
                  {snapshot.classes.map((record) => (
                    <option value={record.id} key={record.id}>
                      {record.name} — {statusLabel(record.status)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>المادة ضمن الصف</span>
                <select
                  value={selectedSubjectId}
                  onChange={(event) => setSelectedSubjectId(event.target.value)}
                  disabled={offeringsForClass.length === 0}
                >
                  {offeringsForClass.length === 0 ? <option value="">لا توجد مادة مرتبطة</option> : null}
                  {offeringsForClass.map((offering) => (
                    <option value={offering.subjectId} key={offering.subjectId}>
                      {subjectById.get(offering.subjectId)?.name ?? offering.subjectId}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {selectedClass ? (
            <section className="record-summary" aria-label={`إعدادات الصف ${selectedClass.name}`}>
              <div>
                <span className={`status-badge status-${selectedClass.status}`}>{statusLabel(selectedClass.status)}</span>
                <h3>{selectedClass.name}</h3>
                <code>{selectedClass.slug}</code>
              </div>
              <div className="record-controls">
                <StatusSelect
                  label={`حالة الصف ${selectedClass.name}`}
                  value={selectedClass.status}
                  disabled={activeBusy}
                  onChange={(status) =>
                    void runMutation("جارٍ تحديث حالة الصف…", () => updateCurriculumClass(selectedClass.id, { status }))
                  }
                />
                <RenameForm
                  label="تعديل اسم الصف"
                  currentValue={selectedClass.name}
                  disabled={activeBusy}
                  onSave={(name) =>
                    runMutation("جارٍ تحديث اسم الصف…", () => updateCurriculumClass(selectedClass.id, { name }))
                  }
                />
                <PositionForm
                  label="ترتيب الصف"
                  currentValue={selectedClass.position}
                  disabled={activeBusy}
                  onSave={(position) =>
                    runMutation("جارٍ تحديث ترتيب الصف…", () => updateCurriculumClass(selectedClass.id, { position }))
                  }
                />
              </div>
            </section>
          ) : null}

          {!selectedOffering || !selectedSubject ? (
            <div className="empty-panel">
              <h3>هذا الصف بلا مواد مرتبطة</h3>
              <p>استخدم نموذج «ربط مادة بصف» أعلاه. المادة تبقى كيانًا مستقلًا ويمكن ربطها بأكثر من صف.</p>
            </div>
          ) : (
            <OfferingWorkspace
              subjectName={selectedSubject.name}
              subjectStatus={selectedSubject.status}
              offeringStatus={selectedOffering.status}
              offeringPosition={selectedOffering.position}
              sections={sections}
              lessons={lessons}
              disabled={activeBusy}
              onCreateSection={(input) =>
                runMutation("جارٍ إنشاء الوحدة…", () =>
                  createCurriculumSection({ classId: selectedClassId, subjectId: selectedSubjectId, ...input }),
                )
              }
              onCreateLesson={(input) =>
                runMutation("جارٍ إنشاء الدرس…", () =>
                  createCurriculumLesson({ classId: selectedClassId, subjectId: selectedSubjectId, ...input }),
                )
              }
              onSubjectStatus={(status) =>
                runMutation("جارٍ تحديث حالة المادة…", () => updateCurriculumSubject(selectedSubjectId, { status }))
              }
              onSubjectRename={(name) =>
                runMutation("جارٍ تحديث اسم المادة…", () => updateCurriculumSubject(selectedSubjectId, { name }))
              }
              onOfferingStatus={(status) =>
                runMutation("جارٍ تحديث حالة ربط المادة…", () =>
                  updateSubjectOffering(selectedClassId, selectedSubjectId, { status }),
                )
              }
              onOfferingPosition={(position) =>
                runMutation("جارٍ تحديث ترتيب المادة…", () =>
                  updateSubjectOffering(selectedClassId, selectedSubjectId, { position }),
                )
              }
              onSectionStatus={(sectionId, status) =>
                runMutation("جارٍ تحديث حالة الوحدة…", () => updateCurriculumSection(sectionId, { status }))
              }
              onSectionRename={(sectionId, title) =>
                runMutation("جارٍ تحديث اسم الوحدة…", () => updateCurriculumSection(sectionId, { title }))
              }
              onSectionPosition={(sectionId, position) =>
                runMutation("جارٍ تحديث ترتيب الوحدة…", () => updateCurriculumSection(sectionId, { position }))
              }
              onLessonStatus={(lessonId, status) =>
                runMutation("جارٍ تحديث حالة الدرس…", () => updateCurriculumLesson(lessonId, { status }))
              }
              onLessonRename={(lessonId, title) =>
                runMutation("جارٍ تحديث اسم الدرس…", () => updateCurriculumLesson(lessonId, { title }))
              }
              onLessonPosition={(lessonId, position) =>
                runMutation("جارٍ تحديث ترتيب الدرس…", () => updateCurriculumLesson(lessonId, { position }))
              }
              onLessonSection={(lessonId, sectionId) =>
                runMutation("جارٍ نقل الدرس…", () => updateCurriculumLesson(lessonId, { sectionId }))
              }
            />
          )}
        </section>
      )}
    </>
  );
}

function WorkspaceState({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <section className="workspace-state" aria-live="polite">
      <h2>{title}</h2>
      <p>{body}</p>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value.toLocaleString("ar-YE")}</strong>
    </article>
  );
}

function MutationFeedback({
  state,
}: {
  state: { kind: "idle" | "busy" | "success" | "error"; message: string };
}) {
  if (state.kind === "idle") return null;
  return (
    <div
      className={`mutation-feedback is-${state.kind}`}
      aria-live="polite"
      role={state.kind === "error" ? "alert" : "status"}
    >
      {state.message}
    </div>
  );
}

function CreateClassForm({
  disabled,
  onCreate,
}: {
  disabled: boolean;
  onCreate: (input: { slug: string; name: string; position?: number }) => Promise<boolean>;
}) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const position = fieldNumber(form, "position");
    const input = {
      slug: fieldString(form, "slug"),
      name: fieldString(form, "name"),
      ...(position === undefined ? {} : { position }),
    };
    if (await onCreate(input)) element.reset();
  }

  return (
    <details className="creation-card">
      <summary>إضافة صف جديد</summary>
      <form className="stack-form compact-form" aria-label="نموذج إضافة صف" onSubmit={(event) => void submit(event)}>
        <label>
          <span>اسم الصف</span>
          <input name="name" maxLength={200} required />
        </label>
        <label>
          <span>المعرّف القصير</span>
          <input name="slug" maxLength={120} required />
        </label>
        <label>
          <span>الترتيب (اختياري)</span>
          <input name="position" type="number" min={0} step={1} />
        </label>
        <button className="primary-button" type="submit" disabled={disabled}>
          حفظ الصف
        </button>
      </form>
    </details>
  );
}

function CreateSubjectForm({
  disabled,
  onCreate,
}: {
  disabled: boolean;
  onCreate: (input: { slug: string; name: string }) => Promise<boolean>;
}) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    if (await onCreate({ slug: fieldString(form, "slug"), name: fieldString(form, "name") })) element.reset();
  }

  return (
    <details className="creation-card">
      <summary>إضافة مادة جديدة</summary>
      <form
        className="stack-form compact-form"
        aria-label="نموذج إضافة مادة"
        onSubmit={(event) => void submit(event)}
      >
        <label>
          <span>اسم المادة</span>
          <input name="name" maxLength={200} required />
        </label>
        <label>
          <span>المعرّف القصير</span>
          <input name="slug" maxLength={120} required />
        </label>
        <button className="primary-button" type="submit" disabled={disabled}>
          حفظ المادة
        </button>
      </form>
    </details>
  );
}

function CreateOfferingForm({
  snapshot,
  disabled,
  onCreate,
}: {
  snapshot: AdminCurriculumSnapshot;
  disabled: boolean;
  onCreate: (input: { classId: string; subjectId: string; position?: number }) => Promise<boolean>;
}) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const position = fieldNumber(form, "position");
    const input = {
      classId: fieldString(form, "classId"),
      subjectId: fieldString(form, "subjectId"),
      ...(position === undefined ? {} : { position }),
    };
    if (await onCreate(input)) element.reset();
  }

  const availableClasses = snapshot.classes.filter((item) => item.status !== "archived");
  const availableSubjects = snapshot.subjects.filter((item) => item.status !== "archived");
  const unavailable = availableClasses.length === 0 || availableSubjects.length === 0;

  return (
    <details className="creation-card">
      <summary>ربط مادة بصف</summary>
      <form
        className="stack-form compact-form"
        aria-label="نموذج ربط مادة بصف"
        onSubmit={(event) => void submit(event)}
      >
        <label>
          <span>الصف للربط</span>
          <select name="classId" required defaultValue="">
            <option value="" disabled>
              اختر الصف
            </option>
            {availableClasses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>المادة للربط</span>
          <select name="subjectId" required defaultValue="">
            <option value="" disabled>
              اختر المادة
            </option>
            {availableSubjects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>الترتيب (اختياري)</span>
          <input name="position" type="number" min={0} step={1} />
        </label>
        <button className="primary-button" type="submit" disabled={disabled || unavailable}>
          إنشاء الربط
        </button>
      </form>
    </details>
  );
}

function OfferingWorkspace({
  subjectName,
  subjectStatus,
  offeringStatus,
  offeringPosition,
  sections,
  lessons,
  disabled,
  onCreateSection,
  onCreateLesson,
  onSubjectStatus,
  onSubjectRename,
  onOfferingStatus,
  onOfferingPosition,
  onSectionStatus,
  onSectionRename,
  onSectionPosition,
  onLessonStatus,
  onLessonRename,
  onLessonPosition,
  onLessonSection,
}: {
  subjectName: string;
  subjectStatus: CurriculumRecordStatus;
  offeringStatus: CurriculumRecordStatus;
  offeringPosition: number;
  sections: CurriculumSection[];
  lessons: CurriculumLesson[];
  disabled: boolean;
  onCreateSection: (input: { slug: string; title: string; position?: number }) => Promise<boolean>;
  onCreateLesson: (input: {
    slug: string;
    title: string;
    sectionId?: string | null;
    position?: number;
  }) => Promise<boolean>;
  onSubjectStatus: (status: CurriculumRecordStatus) => Promise<boolean>;
  onSubjectRename: (name: string) => Promise<boolean>;
  onOfferingStatus: (status: CurriculumRecordStatus) => Promise<boolean>;
  onOfferingPosition: (position: number) => Promise<boolean>;
  onSectionStatus: (id: string, status: CurriculumRecordStatus) => Promise<boolean>;
  onSectionRename: (id: string, title: string) => Promise<boolean>;
  onSectionPosition: (id: string, position: number) => Promise<boolean>;
  onLessonStatus: (id: string, status: CurriculumRecordStatus) => Promise<boolean>;
  onLessonRename: (id: string, title: string) => Promise<boolean>;
  onLessonPosition: (id: string, position: number) => Promise<boolean>;
  onLessonSection: (id: string, sectionId: string | null) => Promise<boolean>;
}) {
  const unsectioned = lessons.filter((lesson) => lesson.sectionId === null);

  return (
    <div className="offering-workspace">
      <section className="record-summary" aria-label={`إعدادات المادة ${subjectName}`}>
        <div>
          <span className={`status-badge status-${offeringStatus}`}>{statusLabel(offeringStatus)}</span>
          <h3>{subjectName}</h3>
          <p>
            حالة كيان المادة: {statusLabel(subjectStatus)} · ترتيبها داخل الصف: {offeringPosition}
          </p>
        </div>
        <div className="record-controls">
          <StatusSelect
            label={`حالة المادة ${subjectName}`}
            value={subjectStatus}
            disabled={disabled}
            onChange={(status) => void onSubjectStatus(status)}
          />
          <StatusSelect
            label={`حالة ربط المادة ${subjectName}`}
            value={offeringStatus}
            disabled={disabled}
            onChange={(status) => void onOfferingStatus(status)}
          />
          <RenameForm label="تعديل اسم المادة" currentValue={subjectName} disabled={disabled} onSave={onSubjectRename} />
          <PositionForm
            label="ترتيب المادة داخل الصف"
            currentValue={offeringPosition}
            disabled={disabled}
            onSave={onOfferingPosition}
          />
        </div>
      </section>

      <div className="creation-grid two-columns">
        <CreateSectionForm disabled={disabled} onCreate={onCreateSection} />
        <CreateLessonForm sections={sections} disabled={disabled} onCreate={onCreateLesson} />
      </div>

      <div className="section-list">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            lessons={lessons.filter((lesson) => lesson.sectionId === section.id)}
            allSections={sections}
            disabled={disabled}
            onStatus={onSectionStatus}
            onRename={onSectionRename}
            onPosition={onSectionPosition}
            onLessonStatus={onLessonStatus}
            onLessonRename={onLessonRename}
            onLessonPosition={onLessonPosition}
            onLessonSection={onLessonSection}
          />
        ))}
        <section className="section-card unsectioned-card" aria-labelledby="unsectioned-title">
          <div className="section-card-header">
            <div>
              <p className="section-kicker">OPTIONAL SECTION</p>
              <h3 id="unsectioned-title">دروس بدون قسم</h3>
            </div>
            <span className="count-pill">{unsectioned.length}</span>
          </div>
          <LessonList
            lessons={unsectioned}
            sections={sections}
            disabled={disabled}
            onStatus={onLessonStatus}
            onRename={onLessonRename}
            onPosition={onLessonPosition}
            onSection={onLessonSection}
          />
        </section>
      </div>
    </div>
  );
}

function CreateSectionForm({
  disabled,
  onCreate,
}: {
  disabled: boolean;
  onCreate: (input: { slug: string; title: string; position?: number }) => Promise<boolean>;
}) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const position = fieldNumber(form, "position");
    if (
      await onCreate({
        slug: fieldString(form, "slug"),
        title: fieldString(form, "title"),
        ...(position === undefined ? {} : { position }),
      })
    ) {
      element.reset();
    }
  }

  return (
    <details className="creation-card">
      <summary>إضافة وحدة أو قسم</summary>
      <form className="stack-form compact-form" aria-label="نموذج إضافة وحدة" onSubmit={(event) => void submit(event)}>
        <label>
          <span>اسم الوحدة</span>
          <input name="title" maxLength={200} required />
        </label>
        <label>
          <span>المعرّف القصير</span>
          <input name="slug" maxLength={120} required />
        </label>
        <label>
          <span>الترتيب (اختياري)</span>
          <input name="position" type="number" min={0} step={1} />
        </label>
        <button className="primary-button" type="submit" disabled={disabled}>
          حفظ الوحدة
        </button>
      </form>
    </details>
  );
}

function CreateLessonForm({
  sections,
  disabled,
  onCreate,
}: {
  sections: CurriculumSection[];
  disabled: boolean;
  onCreate: (input: {
    slug: string;
    title: string;
    sectionId?: string | null;
    position?: number;
  }) => Promise<boolean>;
}) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const sectionId = fieldString(form, "sectionId");
    const position = fieldNumber(form, "position");
    const input = {
      slug: fieldString(form, "slug"),
      title: fieldString(form, "title"),
      sectionId: sectionId || null,
      ...(position === undefined ? {} : { position }),
    };
    if (await onCreate(input)) element.reset();
  }

  return (
    <details className="creation-card">
      <summary>إضافة درس</summary>
      <form className="stack-form compact-form" aria-label="نموذج إضافة درس" onSubmit={(event) => void submit(event)}>
        <label>
          <span>عنوان الدرس</span>
          <input name="title" maxLength={200} required />
        </label>
        <label>
          <span>المعرّف القصير</span>
          <input name="slug" maxLength={120} required />
        </label>
        <label>
          <span>الوحدة (اختيارية)</span>
          <select name="sectionId" defaultValue="">
            <option value="">بدون قسم</option>
            {sections
              .filter((item) => item.status !== "archived")
              .map((item) => (
                <option value={item.id} key={item.id}>
                  {item.title}
                </option>
              ))}
          </select>
        </label>
        <label>
          <span>الترتيب (اختياري)</span>
          <input name="position" type="number" min={0} step={1} />
        </label>
        <button className="primary-button" type="submit" disabled={disabled}>
          حفظ الدرس
        </button>
      </form>
    </details>
  );
}

function SectionCard({
  section,
  lessons,
  allSections,
  disabled,
  onStatus,
  onRename,
  onPosition,
  onLessonStatus,
  onLessonRename,
  onLessonPosition,
  onLessonSection,
}: {
  section: CurriculumSection;
  lessons: CurriculumLesson[];
  allSections: CurriculumSection[];
  disabled: boolean;
  onStatus: (id: string, status: CurriculumRecordStatus) => Promise<boolean>;
  onRename: (id: string, title: string) => Promise<boolean>;
  onPosition: (id: string, position: number) => Promise<boolean>;
  onLessonStatus: (id: string, status: CurriculumRecordStatus) => Promise<boolean>;
  onLessonRename: (id: string, title: string) => Promise<boolean>;
  onLessonPosition: (id: string, position: number) => Promise<boolean>;
  onLessonSection: (id: string, sectionId: string | null) => Promise<boolean>;
}) {
  return (
    <section className="section-card">
      <div className="section-card-header">
        <div>
          <span className={`status-badge status-${section.status}`}>{statusLabel(section.status)}</span>
          <h3>{section.title}</h3>
          <code>{section.slug}</code>
        </div>
        <span className="count-pill">{lessons.length}</span>
      </div>
      <div className="record-controls section-controls">
        <StatusSelect
          label={`حالة الوحدة ${section.title}`}
          value={section.status}
          disabled={disabled}
          onChange={(status) => void onStatus(section.id, status)}
        />
        <RenameForm
          label={`تعديل اسم الوحدة ${section.title}`}
          currentValue={section.title}
          disabled={disabled}
          onSave={(title) => onRename(section.id, title)}
        />
        <PositionForm
          label={`ترتيب الوحدة ${section.title}`}
          currentValue={section.position}
          disabled={disabled}
          onSave={(position) => onPosition(section.id, position)}
        />
      </div>
      <LessonList
        lessons={lessons}
        sections={allSections}
        disabled={disabled}
        onStatus={onLessonStatus}
        onRename={onLessonRename}
        onPosition={onLessonPosition}
        onSection={onLessonSection}
      />
    </section>
  );
}

function LessonList({
  lessons,
  sections,
  disabled,
  onStatus,
  onRename,
  onPosition,
  onSection,
}: {
  lessons: CurriculumLesson[];
  sections: CurriculumSection[];
  disabled: boolean;
  onStatus: (id: string, status: CurriculumRecordStatus) => Promise<boolean>;
  onRename: (id: string, title: string) => Promise<boolean>;
  onPosition: (id: string, position: number) => Promise<boolean>;
  onSection: (id: string, sectionId: string | null) => Promise<boolean>;
}) {
  if (lessons.length === 0) return <p className="empty-inline">لا توجد دروس في هذا القسم.</p>;

  return (
    <ul className="lesson-list">
      {lessons.map((lesson) => (
        <li key={lesson.id}>
          <div className="lesson-main">
            <div>
              <strong>{lesson.title}</strong>
              <span>
                {lesson.slug} · ترتيب {lesson.position}
              </span>
            </div>
            <span className={`status-badge status-${lesson.status}`}>{statusLabel(lesson.status)}</span>
          </div>
          <div className="lesson-controls">
            <StatusSelect
              label={`حالة درس ${lesson.title}`}
              value={lesson.status}
              disabled={disabled}
              onChange={(status) => void onStatus(lesson.id, status)}
            />
            <label className="compact-control">
              <span>القسم</span>
              <select
                aria-label={`قسم درس ${lesson.title}`}
                value={lesson.sectionId ?? ""}
                disabled={disabled}
                onChange={(event) => void onSection(lesson.id, event.target.value || null)}
              >
                <option value="">بدون قسم</option>
                {sections
                  .filter((item) => item.status !== "archived")
                  .map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.title}
                    </option>
                  ))}
              </select>
            </label>
            <RenameForm
              label={`تعديل اسم الدرس ${lesson.title}`}
              currentValue={lesson.title}
              disabled={disabled}
              onSave={(title) => onRename(lesson.id, title)}
            />
            <PositionForm
              label={`ترتيب الدرس ${lesson.title}`}
              currentValue={lesson.position}
              disabled={disabled}
              onSave={(position) => onPosition(lesson.id, position)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatusSelect({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: CurriculumRecordStatus;
  disabled: boolean;
  onChange: (status: CurriculumRecordStatus) => void;
}) {
  return (
    <label className="compact-control">
      <span>الحالة</span>
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as CurriculumRecordStatus)}
      >
        {statusOptions.map((status) => (
          <option value={status} key={status}>
            {statusLabel(status)}
          </option>
        ))}
      </select>
    </label>
  );
}

function RenameForm({
  label,
  currentValue,
  disabled,
  onSave,
}: {
  label: string;
  currentValue: string;
  disabled: boolean;
  onSave: (value: string) => Promise<boolean>;
}) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const value = fieldString(new FormData(formElement), "value");
    if (!value || value === currentValue) return;
    if (await onSave(value)) formElement.closest("details")?.removeAttribute("open");
  }

  return (
    <details className="inline-editor">
      <summary>{label}</summary>
      <form onSubmit={(event) => void submit(event)}>
        <label>
          <span className="sr-only">{label}</span>
          <input name="value" defaultValue={currentValue} maxLength={200} required />
        </label>
        <button className="secondary-button small-button" type="submit" disabled={disabled}>
          حفظ
        </button>
      </form>
    </details>
  );
}

function PositionForm({
  label,
  currentValue,
  disabled,
  onSave,
}: {
  label: string;
  currentValue: number;
  disabled: boolean;
  onSave: (position: number) => Promise<boolean>;
}) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const position = fieldNumber(new FormData(formElement), "position");
    if (position === undefined || position === currentValue) return;
    if (await onSave(position)) formElement.closest("details")?.removeAttribute("open");
  }

  return (
    <details className="inline-editor">
      <summary>{label}</summary>
      <form onSubmit={(event) => void submit(event)}>
        <label>
          <span className="sr-only">{label}</span>
          <input name="position" type="number" min={0} step={1} defaultValue={currentValue} required />
        </label>
        <button className="secondary-button small-button" type="submit" disabled={disabled}>
          حفظ
        </button>
      </form>
    </details>
  );
}
