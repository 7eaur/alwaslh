import { Link, useLocation } from "react-router-dom";
import { StudentIcon } from "../../shared/icons/StudentIcon";
import { EmptyState } from "../../shared/ui/EmptyState";
import { StudentOfflineDownloadsSection } from "./StudentOfflineDownloads";

type LibrarySection = "overview" | "downloads" | "notes" | "saved" | "review";

const libraryItems = [
  { key: "downloads", label: "التنزيلات", description: "الدروس المحفوظة على هذا الجهاز", href: "/app/library/downloads", icon: "download" as const },
  { key: "notes", label: "الملاحظات", description: "ملاحظاتك المرتبطة بالدروس", href: "/app/library/notes", icon: "notes" as const },
  { key: "saved", label: "المحفوظات", description: "ما حفظته للرجوع إليه", href: "/app/library/saved", icon: "saved" as const },
  { key: "review", label: "للمراجعة", description: "العناصر التي تريد مراجعتها لاحقًا", href: "/app/library/review", icon: "review" as const },
];

function librarySectionFromPath(pathname: string): LibrarySection {
  if (pathname === "/app/downloads" || pathname.startsWith("/app/library/downloads")) return "downloads";
  if (pathname.startsWith("/app/library/notes")) return "notes";
  if (pathname.startsWith("/app/library/saved")) return "saved";
  if (pathname.startsWith("/app/library/review")) return "review";
  return "overview";
}

function PersonalCollectionEmpty({ kind }: { kind: "notes" | "saved" | "review" }) {
  const copy = {
    notes: { title: "لا توجد ملاحظات بعد", description: "ستظهر ملاحظاتك هنا عندما تصبح ميزة الملاحظات متاحة بالكامل.", action: "فتح التعلّم", href: "/app/learn" },
    saved: { title: "لا توجد محفوظات بعد", description: "ستظهر العناصر التي تحفظها هنا عند اكتمال الربط.", action: "فتح التدريب", href: "/app/practice" },
    review: { title: "لا توجد عناصر للمراجعة الآن", description: "ستظهر العناصر التي تحددها للمراجعة هنا عند اكتمال الربط.", action: "فتح التدريب", href: "/app/practice" },
  }[kind];

  return <EmptyState title={copy.title} description={copy.description} action={<Link className="secondary-button" to={copy.href}>{copy.action}</Link>} />;
}

export function StudentLibraryExperience({ online, refreshKey, onSessionExpired }: {
  online: boolean;
  refreshKey: number;
  onSessionExpired: () => void;
}) {
  const location = useLocation();
  const section = librarySectionFromPath(location.pathname);

  if (section === "downloads") {
    return <StudentOfflineDownloadsSection online={online} refreshKey={refreshKey} onSessionExpired={onSessionExpired} embedded />;
  }

  if (section === "notes") return <PersonalCollectionEmpty kind="notes" />;
  if (section === "saved") return <PersonalCollectionEmpty kind="saved" />;
  if (section === "review") return <PersonalCollectionEmpty kind="review" />;

  return (
    <section className="student-library-v2" aria-label="مكتبتي">
      <div className="student-library-v2__list">
        {libraryItems.map((item) => (
          <Link key={item.key} className="student-library-v2__row" to={item.href}>
            <span className="student-library-v2__icon"><StudentIcon name={item.icon} /></span>
            <span className="student-library-v2__copy"><strong>{item.label}</strong><small>{item.description}</small></span>
            <StudentIcon name="chevron" />
          </Link>
        ))}
      </div>
    </section>
  );
}
