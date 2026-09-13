import { Link, useLocation } from "react-router-dom";
import { StudentOfflineDownloadsSection } from "./student-offline-downloads";

type LibrarySection = "overview" | "downloads" | "notes" | "saved" | "review";

function LibraryIcon({ kind }: { kind: Exclude<LibrarySection, "overview"> }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    focusable: false,
    "aria-hidden": true,
  };
  if (kind === "downloads") return <svg {...common}><path d="M12 3v11" /><path d="m7.5 10 4.5 4.5 4.5-4.5" /><path d="M5 20h14" /></svg>;
  if (kind === "notes") return <svg {...common}><path d="M6 3h9l3 3v15H6z" /><path d="M14 3v4h4" /><path d="M9 11h6M9 15h6" /></svg>;
  if (kind === "saved") return <svg {...common}><path d="M7 4h10v17l-5-3-5 3z" /></svg>;
  return <svg {...common}><path d="M12 3 4 7v5c0 4.4 3.2 7.5 8 9 4.8-1.5 8-4.6 8-9V7z" /><path d="M9 12h6M12 9v6" /></svg>;
}

const sections: Array<{ key: Exclude<LibrarySection, "overview">; label: string; description: string; href: string }> = [
  { key: "downloads", label: "التنزيلات", description: "الدروس التي حفظتها على هذا الجهاز للتعلم دون اتصال.", href: "/app/library/downloads" },
  { key: "notes", label: "ملاحظاتي", description: "كل ما تدوّنه أثناء القراءة والتعلّم في مكان واحد.", href: "/app/library/notes" },
  { key: "saved", label: "المحفوظات", description: "الأسئلة والمحتوى الذي اخترت الرجوع إليه لاحقًا.", href: "/app/library/saved" },
  { key: "review", label: "يحتاج مراجعة", description: "ما تريد التركيز عليه مرة أخرى أثناء المراجعة.", href: "/app/library/review" },
];

function librarySectionFromPath(pathname: string): LibrarySection {
  if (pathname === "/app/downloads" || pathname.startsWith("/app/library/downloads")) return "downloads";
  if (pathname.startsWith("/app/library/notes")) return "notes";
  if (pathname.startsWith("/app/library/saved")) return "saved";
  if (pathname.startsWith("/app/library/review")) return "review";
  return "overview";
}

function EmptyPersonalCollection({ kind }: { kind: "notes" | "saved" | "review" }) {
  const copy = {
    notes: {
      eyebrow: "الملاحظات",
      title: "لا توجد ملاحظات بعد",
      description: "عندما تضيف ملاحظة أثناء قراءة درس ستجدها هنا، مرتبة مع مصدرها لتعود إليها بسهولة.",
      action: "العودة إلى التعلّم",
      href: "/app/learn",
    },
    saved: {
      eyebrow: "المحفوظات",
      title: "لم تحفظ شيئًا بعد",
      description: "ما تختار حفظه أثناء التعلّم أو المراجعة سيبقى هنا لتصل إليه بسرعة وقت الحاجة.",
      action: "فتح التدريب",
      href: "/app/practice",
    },
    review: {
      eyebrow: "يحتاج مراجعة",
      title: "لا توجد عناصر للمراجعة الآن",
      description: "عندما تحدد سؤالًا أو موضوعًا يحتاج مراجعة سيظهر هنا بدل أن تضطر للبحث عنه من جديد.",
      action: "ابدأ تدريبًا",
      href: "/app/practice",
    },
  }[kind];

  return (
    <section className="future-empty-state" aria-labelledby={`future-${kind}-title`}>
      <div className="future-empty-state__mark" aria-hidden="true"><LibraryIcon kind={kind === "review" ? "review" : kind} /></div>
      <p className="eyebrow">{copy.eyebrow}</p>
      <h2 id={`future-${kind}-title`}>{copy.title}</h2>
      <p>{copy.description}</p>
      <Link className="secondary-button student-explicit-action" to={copy.href}>{copy.action}<span aria-hidden="true">←</span></Link>
    </section>
  );
}

export function StudentLibraryExperience({ online, refreshKey, onSessionExpired }: {
  online: boolean;
  refreshKey: number;
  onSessionExpired: () => void;
}) {
  const location = useLocation();
  const section = librarySectionFromPath(location.pathname);

  return (
    <section className="student-library" aria-labelledby="student-library-title">
      <header className="student-page-heading student-library__heading">
        <p className="eyebrow">مكتبتي</p>
        <h1 id="student-library-title">كل ما يخص تعلمك في مكان واحد</h1>
        <p>تنزيلاتك وملاحظاتك وما تحفظه للمراجعة، مرتبة لتصل إليها بدون تشتيت.</p>
      </header>

      <nav className="student-library-tabs" aria-label="أقسام مكتبتي">
        <Link className={section === "overview" ? "is-active" : ""} to="/app/library" aria-current={section === "overview" ? "page" : undefined}>نظرة عامة</Link>
        {sections.map((item) => <Link key={item.key} className={section === item.key ? "is-active" : ""} to={item.href} aria-current={section === item.key ? "page" : undefined}>{item.label}</Link>)}
      </nav>

      {section === "overview" ? (
        <div className="student-library-grid">
          {sections.map((item) => (
            <Link className="student-library-card student-clickable-card" key={item.key} to={item.href}>
              <span className="student-library-card__icon"><LibraryIcon kind={item.key} /></span>
              <span><strong>{item.label}</strong><small>{item.description}</small></span>
              <span className="student-clickable-card__arrow" aria-hidden="true">←</span>
            </Link>
          ))}
        </div>
      ) : null}

      {section === "downloads" ? <StudentOfflineDownloadsSection online={online} refreshKey={refreshKey} onSessionExpired={onSessionExpired} embedded /> : null}
      {section === "notes" ? <EmptyPersonalCollection kind="notes" /> : null}
      {section === "saved" ? <EmptyPersonalCollection kind="saved" /> : null}
      {section === "review" ? <EmptyPersonalCollection kind="review" /> : null}
    </section>
  );
}

export function StudentNotificationsExperience() {
  return (
    <section className="student-future-page" aria-labelledby="notifications-title">
      <header className="student-page-heading">
        <p className="eyebrow">الإشعارات</p>
        <h1 id="notifications-title">ما يحتاج انتباهك</h1>
        <p>ستجد هنا التنبيهات المرتبطة بتعلمك وحسابك مرتبة من الأحدث إلى الأقدم.</p>
      </header>
      <div className="future-empty-state future-empty-state--quiet">
        <div className="future-empty-state__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 8H3c0-1 3-1 3-8Z" /><path d="M10 21h4" /></svg></div>
        <h2>لا توجد إشعارات جديدة</h2>
        <p>عندما يوجد أمر مهم أو تحديث يحتاج متابعتك سيظهر هنا بوضوح.</p>
        <Link className="secondary-button student-explicit-action" to="/app/home">العودة إلى الرئيسية<span aria-hidden="true">←</span></Link>
      </div>
    </section>
  );
}

export function StudentProgressExperience() {
  return (
    <section className="student-future-page student-progress" aria-labelledby="progress-title">
      <header className="student-page-heading">
        <p className="eyebrow">تقدمي</p>
        <h1 id="progress-title">شاهد تقدمك بدون أرقام مربكة</h1>
        <p>هذه المساحة تجمع تقدم الدروس والتدريب والإنجازات عندما تتوفر بيانات موثوقة من النظام.</p>
      </header>

      <div className="student-progress-layout">
        <section className="future-summary-panel" aria-labelledby="progress-learning-title">
          <span className="future-summary-panel__icon" aria-hidden="true">✓</span>
          <div><p className="eyebrow">التعلّم</p><h2 id="progress-learning-title">ابدأ التعلّم ليظهر تقدمك هنا</h2><p>سنستخدم فقط الدروس والأنشطة التي يؤكد النظام أنك أكملتها.</p></div>
          <Link className="secondary-button student-explicit-action" to="/app/learn">فتح التعلّم<span aria-hidden="true">←</span></Link>
        </section>
        <section className="future-summary-panel" aria-labelledby="progress-practice-title">
          <span className="future-summary-panel__icon" aria-hidden="true">◎</span>
          <div><p className="eyebrow">التدريب</p><h2 id="progress-practice-title">نتائجك ستظهر بعد أول محاولة</h2><p>النتائج ستعتمد على المحاولات المحفوظة في النظام، بدون تقديرات أو أرقام تجريبية.</p></div>
          <Link className="secondary-button student-explicit-action" to="/app/practice">فتح التدريب<span aria-hidden="true">←</span></Link>
        </section>
        <section className="future-summary-panel future-summary-panel--wide" aria-labelledby="progress-achievements-title">
          <span className="future-summary-panel__icon" aria-hidden="true">★</span>
          <div><p className="eyebrow">الإنجازات</p><h2 id="progress-achievements-title">إنجازاتك ستظهر عندما تستحقها</h2><p>لن نعرض شارات أو ترتيبًا وهميًا. كل إنجاز سيعتمد على قاعدة واضحة ونتيجة حقيقية.</p></div>
        </section>
      </div>
    </section>
  );
}
