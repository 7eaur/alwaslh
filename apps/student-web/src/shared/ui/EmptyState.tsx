import type { ReactNode } from "react";

export function EmptyState({ title, description, action, icon }: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <section className="student-v2-empty-state">
      {icon ? <div className="student-v2-empty-state__icon" aria-hidden="true">{icon}</div> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action ? <div className="student-v2-empty-state__action">{action}</div> : null}
    </section>
  );
}
