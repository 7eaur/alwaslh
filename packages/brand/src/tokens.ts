export const brand = {
  nameAr: "الوسيلة الذكية",
  direction: "rtl" as const,
  colors: {
    ink: "var(--brand-ink-950)",
    primary: "var(--brand-primary-600)",
    accent: "var(--brand-accent-500)",
    canvas: "var(--surface-canvas)",
    panel: "var(--surface-panel)",
    text: "var(--text-primary)",
    textMuted: "var(--text-muted)",
    border: "var(--border-subtle)",
    success: "var(--success-700)",
    warning: "var(--warning-700)",
    danger: "var(--danger-700)",
    info: "var(--info-700)",
  },
  layout: {
    contentMax: "var(--content-max)",
    readerMax: "var(--reader-max)",
    adminSidebarWidth: "var(--admin-sidebar-width)",
    touchTargetMin: "var(--touch-target-min)",
  },
} as const;

export type Brand = typeof brand;
