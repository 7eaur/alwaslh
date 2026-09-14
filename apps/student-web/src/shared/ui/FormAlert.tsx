import type { ReactNode } from "react";

export type FormAlertTone = "danger" | "warning" | "success" | "info";

export function FormAlert({ tone, children }: { tone: FormAlertTone; children: ReactNode }) {
  return <div className={`form-alert is-${tone}`} role={tone === "danger" ? "alert" : "status"}>{children}</div>;
}
