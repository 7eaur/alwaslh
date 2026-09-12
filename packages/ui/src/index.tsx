export type ProductSurface = "student" | "admin";
export type PageStateKind = "loading" | "empty" | "error" | "offline" | "permission" | "info";
export type ProductErrorKind = "session" | "permission" | "offline" | "unavailable" | "validation" | "unknown";

export interface ProductErrorPresentation {
  kind: ProductErrorKind;
  title: string;
  message: string;
  actionLabel?: string;
}

export function pageStateSymbol(kind: PageStateKind): string {
  if (kind === "error") return "!";
  if (kind === "offline") return "↕";
  if (kind === "permission") return "×";
  if (kind === "empty") return "–";
  return "i";
}

export function isAssertivePageState(kind: PageStateKind): boolean {
  return kind === "error" || kind === "permission";
}

function errorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const value = (error as { code?: unknown }).code;
  return typeof value === "string" ? value : null;
}

export function mapProductError(error: unknown, surface: ProductSurface): ProductErrorPresentation {
  const code = errorCode(error);
  const student = surface === "student";

  if (code === "UNAUTHORIZED" || code === "UNAUTHENTICATED" || code === "MISSING_SESSION" || code === "SESSION_EXPIRED") {
    return {
      kind: "session",
      title: "انتهت الجلسة",
      message: student
        ? "سجّل الدخول مرة أخرى للمتابعة."
        : "انتهت جلسة الإدارة. سجّل الدخول مرة أخرى للمتابعة.",
      actionLabel: "تسجيل الدخول",
    };
  }

  if (code === "FORBIDDEN" || code === "PERMISSION_DENIED") {
    return {
      kind: "permission",
      title: "لا تملك صلاحية لهذه الخطوة",
      message: student
        ? "هذا المحتوى غير متاح لحسابك حاليًا."
        : "تحقق من الصلاحيات المطلوبة أو ارجع إلى مساحة العمل السابقة.",
    };
  }

  if (code === "OFFLINE" || code === "NETWORK_ERROR") {
    return {
      kind: "offline",
      title: "تعذر الاتصال",
      message: "تحقق من اتصال الإنترنت ثم حاول مرة أخرى.",
      actionLabel: "إعادة المحاولة",
    };
  }

  if (code === "SERVICE_UNAVAILABLE" || code === "TIMEOUT") {
    return {
      kind: "unavailable",
      title: "الخدمة غير متاحة الآن",
      message: "حاول مرة أخرى بعد قليل.",
      actionLabel: "إعادة المحاولة",
    };
  }

  if (code === "VALIDATION_ERROR" || code === "INVALID_INPUT") {
    return {
      kind: "validation",
      title: "راجع البيانات المدخلة",
      message: "صحح الحقول الموضحة ثم أعد المحاولة.",
    };
  }

  return {
    kind: "unknown",
    title: "تعذر إكمال الطلب",
    message: student
      ? "حاول مرة أخرى. إذا استمرت المشكلة ارجع إلى الصفحة السابقة."
      : "حاول مرة أخرى. إذا استمرت المشكلة راجع سجل العمليات من المساحة المخصصة لذلك.",
    actionLabel: "إعادة المحاولة",
  };
}
