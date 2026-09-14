import { Link } from "react-router-dom";
import { StudentIcon } from "../../student-icons";
import { studentDestinationLabels, type StudentDestination } from "./student-navigation";

export function StudentAppBar({ destination, online }: { destination: StudentDestination; online: boolean }) {
  const home = destination === "home";

  return (
    <header className={`student-appbar${home ? " student-appbar--home" : ""}`}>
      {home ? (
        <Link className="student-appbar__brand" to="/app/home" aria-label="الوسيلة الذكية — الرئيسية">
          <img src="/app-icon.svg" alt="" aria-hidden="true" />
          <strong>الوسيلة الذكية</strong>
        </Link>
      ) : (
        <div className="student-appbar__title" aria-current="page">{studentDestinationLabels[destination]}</div>
      )}

      <div className="student-appbar__actions">
        {!online ? <span className="student-network-warning" role="status">غير متصل</span> : null}
        <Link
          className={`student-v2-icon-button ${destination === "notifications" ? "is-active" : ""}`}
          to="/app/notifications"
          aria-current={destination === "notifications" ? "page" : undefined}
          aria-label="الإشعارات"
        >
          <StudentIcon name="notifications" />
        </Link>
        <Link
          className={`student-v2-icon-button ${destination === "account" ? "is-active" : ""}`}
          to="/app/account"
          aria-current={destination === "account" ? "page" : undefined}
          aria-label="حسابي"
        >
          <StudentIcon name="account" />
        </Link>
      </div>
    </header>
  );
}
