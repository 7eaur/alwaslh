import { useEffect, type ReactNode } from "react";

export type ProductSurface = "student" | "admin";
export type PageStateKind = "loading" | "empty" | "error" | "offline" | "permission" | "info";
export type ProductErrorKind = "session" | "permission" | "offline" | "unavailable" | "validation" | "unknown";

export interface ProductErrorPresentation {
  kind: ProductErrorKind;
  title: string;
  message: string;
  actionLabel?: string;
}

interface ProductShellProps {
  surface: ProductSurface;
  children: ReactNode;
  contentId?: string;
  skipLabel?: string;
}

export function ProductShell({
  surface,
  children,
  contentId = "route-content",
  skipLabel = "انتقل إلى المحتوى",
}: ProductShellProps) {
  return (
    <div className={`aw-product-shell aw-product-shell--${surface}`} dir="rtl">
      <a className="aw-skip-link" href={`#${contentId}`}>
        {skipLabel}
      </a>
      <div id={contentId} className="aw-route-content" data-route-focus tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}

export function RouteFocus({ routeKey, targetId = "route-content" }: { routeKey: string; targetId?: string }) {
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [routeKey, targetId]);

  return null;
}

interface PageStateProps {
  kind: PageStateKind;
  title: string;
  description: string;
  action?: ReactNode;
  eyebrow?: string;
}

export function PageState({ kind, title, description, action, eyebrow }: PageStateProps) {
  const isAssertive = kind === "error" || kind === "permission";
  const isBusy = kind === "loading";

  return (
    <section
      className={`aw-page-state aw-page-state--${kind}`}
      aria-live={isAssertive ? "assertive" : "polite"}
      aria-busy={isBusy || undefined}
    >
      <span className="aw-page-state__icon" aria-hidden="true">
        {kind === "loading" ? <span className="aw-spinner" /> : stateSymbol(kind)}
      </span>
      <div className="aw-page-state__body">
        {eyebrow ? <p className="aw-page-state__eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p>{description}</p>
        {action ? <div className="aw-page-state__action">{action}</div> : null}
      </div>
    </section>
  );
}

function stateSymbol(kind: PageStateKind): string {
  if (kind === "error") return "!";
  if (kind === "offline") return "↕";
  if (kind === "permission") return "×";
  if (kind === "empty") return "–";
  return "i";
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
