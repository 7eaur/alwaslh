import type { HTMLAttributes, ReactNode } from "react";

export function Surface({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={`student-v2-surface${className ? ` ${className}` : ""}`} {...props}>{children}</div>;
}
