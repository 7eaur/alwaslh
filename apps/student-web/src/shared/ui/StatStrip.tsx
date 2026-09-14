import type { ReactNode } from "react";

type StatItem = {
  key: string;
  label: string;
  value: ReactNode;
  icon?: ReactNode;
};

export function StatStrip({ items, ariaLabel, className = "" }: { items: StatItem[]; ariaLabel: string; className?: string }) {
  return (
    <div className={`student-home-stats student-v2-surface${className ? ` ${className}` : ""}`} aria-label={ariaLabel}>
      {items.map((item) => <div key={item.key}>{item.icon ?? null}<strong>{item.value}</strong><span>{item.label}</span></div>)}
    </div>
  );
}
