import type { FormEvent } from "react";
import type { AdminCurriculumSnapshot, CurriculumSection } from "../../admin-api";
import { fieldNumber, fieldString } from "./curriculum-ui";

export function CurriculumRootCreateActions({
  snapshot,
  disabled,
  onCreateClass,
  onCreateSubject,
  onCreateOffering,
}: {
  snapshot: AdminCurriculumSnapshot;
  disabled: boolean;
  onCreateClass: (input: { slug: string; name: string; position?: number }) => Promise<boolean>;
  onCreateSubject: (input: { slug: string; name: string }) => Promise<boolean>;
  onCreateOffering: (input: { classId: string; subjectId: string; position?: number }) => Promise<boolean>;
}) {
  return (
    <section className="curriculum-create-zone" aria-labelledby="curriculum-root-actions-title">
      <div className="curriculum-section-heading">
        <div>
          <p className="eyebrow">إدارة البنية</p>
          <h2 id="curriculum-root-actions-title">إضافة إلى المنهج</h2>
          <p>أنشئ الكيان مرة واحدة، ثم اربط المواد بالصفوف بدل تكرارها.</p>
        </div>
      </div>
      <div className="creation-grid">
        <CreateClassForm disabled={disabled} onCreate={onCreateClass} />
        <CreateSubjectForm disabled={disabled} onCreate={onCreateSubject} />
        <CreateOfferingForm snapshot={snapshot} disabled={disabled} onCreate={onCreateOffering} />
      </div>
    </section>
  );
}

export function CurriculumContextCreateActions({
  sections,
  disabled,
  onCreateSection,
  onCreateLesson,
}: {
  sections: CurriculumSection[];
  disabled: boolean;
  onCreateSection: (input: { slug: string; title: string; position?: number }) => Promise<boolean>;
  onCreateLesson: (input: {
    slug: string;
    title: string;
    sectionId?: string | null;
    position?: number;
  }) => Promise<boolean>;
}) {
  return (
    <section className="curriculum-context-actions" aria-labelledby="curriculum-context-actions-title">
      <div className="curriculum-section-heading compact">
        <div>
          <h3 id="curriculum-context-actions-title">إضافة داخل المادة الحالية</h3>
          <p>أضف وحدة لتنظيم الدروس أو أضف درسًا مباشرة بدون قسم.</p>
        </div>
      </div>
      <div className="creation-grid two-columns">
        <CreateSectionForm disabled={disabled} onCreate={onCreateSection} />
        <CreateLessonForm sections={sections} disabled={disabled} onCreate={onCreateLesson} />
      </div>
    </section>
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
        <details className="curriculum-advanced-fields">
          <summary>خيارات متقدمة</summary>
          <label>
            <span>الترتيب</span>
            <input name="position" type="number" min={0} step={1} />
          </label>
        </details>
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
      <form className="stack-form compact-form" aria-label="نموذج إضافة مادة" onSubmit={(event) => void submit(event)}>
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
      <form className="stack-form compact-form" aria-label="نموذج ربط مادة بصف" onSubmit={(event) => void submit(event)}>
        <label>
          <span>الصف</span>
          <select name="classId" aria-label="الصف للربط" required defaultValue="">
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
          <span>المادة</span>
          <select name="subjectId" aria-label="المادة للربط" required defaultValue="">
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
        <details className="curriculum-advanced-fields">
          <summary>خيارات متقدمة</summary>
          <label>
            <span>الترتيب داخل الصف</span>
            <input name="position" type="number" min={0} step={1} />
          </label>
        </details>
        <button className="primary-button" type="submit" disabled={disabled || unavailable}>
          إنشاء الربط
        </button>
      </form>
    </details>
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
        <details className="curriculum-advanced-fields">
          <summary>خيارات متقدمة</summary>
          <label>
            <span>الترتيب</span>
            <input name="position" type="number" min={0} step={1} />
          </label>
        </details>
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
        <details className="curriculum-advanced-fields">
          <summary>خيارات متقدمة</summary>
          <label>
            <span>الترتيب</span>
            <input name="position" type="number" min={0} step={1} />
          </label>
        </details>
        <button className="primary-button" type="submit" disabled={disabled}>
          حفظ الدرس
        </button>
      </form>
    </details>
  );
}
