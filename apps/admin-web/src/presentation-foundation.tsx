import { isAssertivePageState, pageStateSymbol, type PageStateKind } from "@alwaslh/ui";
import { useEffect, type ReactNode } from "react";

export function AdminProductShell({ children }: { children: ReactNode }) {
  return (
    <div className="aw-product-shell aw-product-shell--admin" dir="rtl">
      <a className="aw-skip-link" href="#route-content">
        انتقل إلى المحتوى
      </a>
      <div
        id="route-content"
        className="aw-route-content"
        data-route-focus
        role="region"
        aria-label="محتوى الصفحة"
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}

export function RouteFocus({ routeKey }: { routeKey: string }) {
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("route-content")?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [routeKey]);

  return null;
}

export function PageState({
  kind,
  title,
  description,
  action,
  eyebrow,
}: {
  kind: PageStateKind;
  title: string;
  description: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <section
      className={`aw-page-state aw-page-state--${kind}`}
      aria-live={isAssertivePageState(kind) ? "assertive" : "polite"}
      aria-busy={kind === "loading" || undefined}
    >
      <span className="aw-page-state__icon" aria-hidden="true">
        {kind === "loading" ? <span className="aw-spinner" /> : pageStateSymbol(kind)}
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
