import type { StudentIconName } from "../../student-icons";

export type StudentDestination =
  | "home"
  | "learn"
  | "practice"
  | "library"
  | "notifications"
  | "progress"
  | "account";

export interface StudentDestinationDefinition {
  key: "home" | "learn" | "practice" | "library";
  href: string;
  label: string;
  shortLabel: string;
  icon: StudentIconName;
}

export const primaryStudentDestinations: StudentDestinationDefinition[] = [
  { key: "home", href: "/app/home", label: "الرئيسية", shortLabel: "الرئيسية", icon: "home" },
  { key: "learn", href: "/app/learn", label: "التعلّم", shortLabel: "التعلّم", icon: "learn" },
  { key: "practice", href: "/app/practice", label: "التدريب", shortLabel: "التدريب", icon: "practice" },
  { key: "library", href: "/app/library", label: "مكتبتي", shortLabel: "مكتبتي", icon: "library" },
];

export const studentDestinationLabels: Record<StudentDestination, string> = {
  home: "الرئيسية",
  learn: "التعلّم",
  practice: "التدريب",
  library: "مكتبتي",
  notifications: "الإشعارات",
  progress: "تقدمي",
  account: "حسابي",
};
