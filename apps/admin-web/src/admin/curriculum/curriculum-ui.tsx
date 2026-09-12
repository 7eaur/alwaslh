import type { FormEvent, ReactNode } from "react";
import type { CurriculumRecordStatus } from "../../admin-api";

export const curriculumStatusOptions: readonly CurriculumRecordStatus[] = ["active", "inactive", "archived"];

export function curriculumStatusLabel(status: CurriculumRecordStatus): string {
  switch (status) {
    case "active":
      return "نشط";
    case "inactive":
      return "غير نشط";
    case "archived":
      return "مؤرشف";
  }
}

export function fieldString(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function fieldNumber(form: FormData, name: string): number | undefined {
  const raw = fieldString(form, name);
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : undefined;
}

export function CurriculumWorkspaceState({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <section className="workspace-state" aria-live="polite">
      <h2>{title}</h2>
      <p>{body}</p>
      {children}
    </section>
  );
}

export function CurriculumMutationFeedback({
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

export function CurriculumStatusSelect({
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
        {curriculumStatusOptions.map((status) => (
          <option value={status} key={status}>
            {curriculumStatusLabel(status)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CurriculumRenameForm({
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

export function CurriculumPositionForm({
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
