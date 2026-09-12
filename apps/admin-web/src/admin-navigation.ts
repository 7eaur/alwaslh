export interface AdminNavigationItem {
  label: string;
  to: string;
  end: boolean;
}

export interface AdminNavigationGroup {
  label: string;
  items: readonly AdminNavigationItem[];
}

export const ADMIN_NAVIGATION: readonly AdminNavigationGroup[] = [
  {
    label: "نظرة عامة",
    items: [{ label: "نظرة عامة", to: "/app", end: true }],
  },
  {
    label: "المحتوى التعليمي",
    items: [
      { label: "المنهج", to: "/app/curriculum", end: false },
      { label: "المحتوى", to: "/app/content", end: false },
      { label: "المراجعات", to: "/app/reviews", end: false },
    ],
  },
  {
    label: "الأسئلة والاختبارات",
    items: [
      { label: "بنك الأسئلة", to: "/app/questions", end: false },
      { label: "الاختبارات", to: "/app/quizzes", end: false },
    ],
  },
  {
    label: "الطلاب والوصول",
    items: [
      { label: "الطلاب", to: "/app/students", end: false },
      { label: "أكواد الوصول", to: "/app/access-codes", end: false },
    ],
  },
  {
    label: "التشغيل",
    items: [
      { label: "الحالة والمشكلات", to: "/app/operations", end: true },
      { label: "سجل التدقيق", to: "/app/operations/audit", end: false },
      { label: "التشخيص المتقدم", to: "/app/operations/diagnostics", end: false },
    ],
  },
] as const;

export const ADMIN_PRIMARY_ROUTES = ADMIN_NAVIGATION.flatMap((group) =>
  group.items.map((item) => item.to),
);
