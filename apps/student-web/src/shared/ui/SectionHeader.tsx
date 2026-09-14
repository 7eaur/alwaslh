import type { ReactNode } from "react";

export function SectionHeader({ title, action, id }: { title: string; action?: ReactNode; id?: string }) {
  return <div className="student-home-section__heading"><h2 id={id}>{title}</h2>{action ?? null}</div>;
}
