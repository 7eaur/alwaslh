export interface AdminNavigationItem {
  label: string;
  to: string;
  end?: boolean;
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
      { label: "المنهج", to: "/app/curriculum" },
      { label: "المحتوى", to: "/app/content" },
      { label: "المراجعات", to: "/app/reviews" },
    ],
  },
  {
    label: "الأسئلة والاختبارات",
    items: [
      { label: "بنك الأسئلة", to: "/app/questions" },
      { label: "الاختبارات", to: "/app/quizzes" },
    ],
  },
  {
    label: "الطلاب والوصول",
    items: [
      { label: "الطلاب", to: "/app/students" },
      { label: "أكواد الوصول", to: "/app/access-codes" },
    ],
  },
  {
    label: "التشغيل",
    items: [
      { label: "الحالة والمشكلات", to: "/app/operations" },
      { label: "سجل التدقيق", to: "/app/operations/audit" },
      { label: "التشخيص المتقدم", to: "/app/operations/diagnostics" },
    ],
  },
] as const;

export const ADMIN_PRIMARY_ROUTES = ADMIN_NAVIGATION.flatMap((group) =>
  group.items.map((item) => item.to),
);
