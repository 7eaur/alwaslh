import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiRequestError,
  type AdminCurriculumSnapshot,
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
import {
  CurriculumContextCreateActions,
  CurriculumRootCreateActions,
} from "./admin/curriculum/CurriculumCreateActions";
import { CurriculumOfferingWorkspace } from "./admin/curriculum/CurriculumStructure";
import {
  CurriculumMutationFeedback,
  CurriculumPositionForm,
  CurriculumRenameForm,
  CurriculumStatusSelect,
  CurriculumWorkspaceState,
  curriculumStatusLabel,
} from "./admin/curriculum/curriculum-ui";
import "./admin/curriculum/curriculum.css";

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
    return <CurriculumWorkspaceState title="جارٍ تحميل المنهج" body="نقرأ البنية الحالية من الخادم." />;
  }

  if (loadState === "error" && !snapshot) {
    return (
      <CurriculumWorkspaceState title="تعذر تحميل المنهج" body={loadError}>
        <button className="primary-button" type="button" onClick={() => void refresh()}>
          إعادة المحاولة
        </button>
      </CurriculumWorkspaceState>
    );
  }

  if (!snapshot) return null;
  const activeBusy = actionState.kind === "busy";

  return (
    <section className="curriculum-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">المحتوى التعليمي</p>
          <h1>الصفوف والمواد والدروس</h1>
          <p className="page-description">
            نظّم هيكل المنهج كما يراه فريق المحتوى: صف، مادة داخل الصف، وحدات اختيارية، ثم الدروس. الأرشفة والحالة
            تحفظان التاريخ بدل الحذف المدمر.
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

      <CurriculumRootCreateActions
        snapshot={snapshot}
        disabled={activeBusy}
        onCreateClass={(input) => runMutation("جارٍ إنشاء الصف…", () => createCurriculumClass(input))}
        onCreateSubject={(input) => runMutation("جارٍ إنشاء المادة…", () => createCurriculumSubject(input))}
        onCreateOffering={(input) => runMutation("جارٍ ربط المادة بالصف…", () => createSubjectOffering(input))}
      />

      <CurriculumMutationFeedback state={actionState} />

      {snapshot.classes.length === 0 ? (
        <CurriculumWorkspaceState
          title="لا توجد صفوف بعد"
          body="ابدأ بإضافة صف ومادة، ثم اربط المادة بالصف لإنشاء مساحة الدروس."
        />
      ) : (
        <section className="curriculum-browser" aria-labelledby="curriculum-browser-title">
          <div className="browser-heading">
            <div>
              <p className="eyebrow">المنهج الحالي</p>
              <h2 id="curriculum-browser-title">اختر الصف والمادة التي تريد تنظيمها</h2>
            </div>
            <div className="selector-row">
              <label>
                <span>الصف</span>
                <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
                  {snapshot.classes.map((record) => (
                    <option value={record.id} key={record.id}>
                      {record.name} — {curriculumStatusLabel(record.status)}
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
                      {subjectById.get(offering.subjectId)?.name ?? "مادة غير معروفة"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {selectedClass ? (
            <section className="curriculum-class-summary" aria-label={`إعدادات الصف ${selectedClass.name}`}>
              <div className="curriculum-summary-main">
                <div className="curriculum-title-row">
                  <span className={`status-badge status-${selectedClass.status}`}>
                    {curriculumStatusLabel(selectedClass.status)}
                  </span>
                  <h3>{selectedClass.name}</h3>
                </div>
                <p>
                  {offeringsForClass.length.toLocaleString("ar-YE")} مادة مرتبطة ·{" "}
                  {snapshot.lessons.filter((lesson) => lesson.classId === selectedClass.id).length.toLocaleString("ar-YE")} درس
                </p>
              </div>
              <details className="curriculum-manage-panel">
                <summary>إعدادات الصف</summary>
                <div className="record-controls">
                  <CurriculumStatusSelect
                    label={`حالة الصف ${selectedClass.name}`}
                    value={selectedClass.status}
                    disabled={activeBusy}
                    onChange={(status) =>
                      void runMutation("جارٍ تحديث حالة الصف…", () => updateCurriculumClass(selectedClass.id, { status }))
                    }
                  />
                  <CurriculumRenameForm
                    label="تعديل اسم الصف"
                    currentValue={selectedClass.name}
                    disabled={activeBusy}
                    onSave={(name) =>
                      runMutation("جارٍ تحديث اسم الصف…", () => updateCurriculumClass(selectedClass.id, { name }))
                    }
                  />
                  <CurriculumPositionForm
                    label="ترتيب الصف"
                    currentValue={selectedClass.position}
                    disabled={activeBusy}
                    onSave={(position) =>
                      runMutation("جارٍ تحديث ترتيب الصف…", () => updateCurriculumClass(selectedClass.id, { position }))
                    }
                  />
                </div>
              </details>
            </section>
          ) : null}

          {!selectedOffering || !selectedSubject ? (
            <div className="empty-panel">
              <h3>هذا الصف بلا مواد مرتبطة</h3>
              <p>استخدم «ربط مادة بصف» أعلاه. المادة تبقى كيانًا مستقلًا ويمكن ربطها بأكثر من صف.</p>
            </div>
          ) : (
            <>
              <CurriculumContextCreateActions
                sections={sections}
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
              />
              <CurriculumOfferingWorkspace
                subjectName={selectedSubject.name}
                subjectStatus={selectedSubject.status}
                offeringStatus={selectedOffering.status}
                offeringPosition={selectedOffering.position}
                sections={sections}
                lessons={lessons}
                disabled={activeBusy}
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
            </>
          )}
        </section>
      )}
    </section>
  );
}
