import type {
  CurriculumLesson,
  CurriculumRecordStatus,
  CurriculumSection,
} from "../../admin-api";
import {
  CurriculumPositionForm,
  CurriculumRenameForm,
  CurriculumStatusSelect,
  curriculumStatusLabel,
} from "./curriculum-ui";

export function CurriculumOfferingWorkspace({
  subjectName,
  subjectStatus,
  offeringStatus,
  offeringPosition,
  sections,
  lessons,
  disabled,
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
      <section className="curriculum-subject-summary" aria-label={`إعدادات المادة ${subjectName}`}>
        <div>
          <div className="curriculum-title-row">
            <span className={`status-badge status-${offeringStatus}`}>{curriculumStatusLabel(offeringStatus)}</span>
            <h3>{subjectName}</h3>
          </div>
          <p>
            {sections.length.toLocaleString("ar-YE")} وحدة · {lessons.length.toLocaleString("ar-YE")} درس
          </p>
        </div>
        <details className="curriculum-manage-panel">
          <summary>إعدادات المادة</summary>
          <div className="record-controls">
            <CurriculumStatusSelect
              label={`حالة المادة ${subjectName}`}
              value={subjectStatus}
              disabled={disabled}
              onChange={(status) => void onSubjectStatus(status)}
            />
            <CurriculumStatusSelect
              label={`حالة ربط المادة ${subjectName}`}
              value={offeringStatus}
              disabled={disabled}
              onChange={(status) => void onOfferingStatus(status)}
            />
            <CurriculumRenameForm
              label="تعديل اسم المادة"
              currentValue={subjectName}
              disabled={disabled}
              onSave={onSubjectRename}
            />
            <CurriculumPositionForm
              label="ترتيب المادة داخل الصف"
              currentValue={offeringPosition}
              disabled={disabled}
              onSave={onOfferingPosition}
            />
          </div>
        </details>
      </section>

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
              <h3 id="unsectioned-title">دروس بدون قسم</h3>
              <p className="curriculum-muted-copy">دروس مرتبطة بالمادة مباشرة دون وحدة.</p>
            </div>
            <span className="count-pill">{unsectioned.length.toLocaleString("ar-YE")}</span>
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
          <div className="curriculum-title-row">
            <span className={`status-badge status-${section.status}`}>{curriculumStatusLabel(section.status)}</span>
            <h3>{section.title}</h3>
          </div>
          <p className="curriculum-muted-copy">{lessons.length.toLocaleString("ar-YE")} درس</p>
        </div>
        <details className="curriculum-manage-panel">
          <summary>إدارة الوحدة</summary>
          <div className="record-controls section-controls">
            <CurriculumStatusSelect
              label={`حالة الوحدة ${section.title}`}
              value={section.status}
              disabled={disabled}
              onChange={(status) => void onStatus(section.id, status)}
            />
            <CurriculumRenameForm
              label={`تعديل اسم الوحدة ${section.title}`}
              currentValue={section.title}
              disabled={disabled}
              onSave={(title) => onRename(section.id, title)}
            />
            <CurriculumPositionForm
              label={`ترتيب الوحدة ${section.title}`}
              currentValue={section.position}
              disabled={disabled}
              onSave={(position) => onPosition(section.id, position)}
            />
          </div>
        </details>
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
              <span>ترتيب {lesson.position.toLocaleString("ar-YE")}</span>
            </div>
            <span className={`status-badge status-${lesson.status}`}>{curriculumStatusLabel(lesson.status)}</span>
          </div>
          <details className="curriculum-lesson-manage">
            <summary>إدارة الدرس: {lesson.title}</summary>
            <div className="lesson-controls">
              <CurriculumStatusSelect
                label={`حالة درس ${lesson.title}`}
                value={lesson.status}
                disabled={disabled}
                onChange={(status) => void onStatus(lesson.id, status)}
              />
              <label className="compact-control">
                <span>الوحدة</span>
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
              <CurriculumRenameForm
                label={`تعديل اسم الدرس ${lesson.title}`}
                currentValue={lesson.title}
                disabled={disabled}
                onSave={(title) => onRename(lesson.id, title)}
              />
              <CurriculumPositionForm
                label={`ترتيب الدرس ${lesson.title}`}
                currentValue={lesson.position}
                disabled={disabled}
                onSave={(position) => onPosition(lesson.id, position)}
              />
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
