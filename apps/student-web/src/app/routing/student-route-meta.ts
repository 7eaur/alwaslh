import { primaryStudentDestinations, type StudentDestination } from "../layout/student-navigation";

export function studentDestinationFromPath(pathname: string): StudentDestination | null {
  if (pathname === "/app" || pathname === "/app/") return "home";
  if (pathname === "/app/account" || pathname.startsWith("/app/account/")) return "account";
  if (pathname === "/app/notifications" || pathname.startsWith("/app/notifications/")) return "notifications";
  if (pathname === "/app/progress" || pathname.startsWith("/app/progress/")) return "progress";
  if (pathname === "/app/downloads" || pathname === "/app/library" || pathname.startsWith("/app/library/")) return "library";

  for (const destination of primaryStudentDestinations) {
    if (pathname === destination.href || pathname.startsWith(`${destination.href}/`)) return destination.key;
  }

  return null;
}

export function isFocusedStudentReaderPath(pathname: string): boolean {
  return /^\/app\/learn\/lessons\/[^/]+\/?$/.test(pathname);
}
