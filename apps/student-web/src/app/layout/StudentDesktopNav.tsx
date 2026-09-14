import { Link } from "react-router-dom";
import { StudentIcon } from "../../shared/icons/StudentIcon";
import { primaryStudentDestinations, type StudentDestination } from "./student-navigation";

export function StudentDesktopNav({ destination }: { destination: StudentDestination }) {
  return (
    <nav className="student-adaptive-nav" aria-label="التنقل الرئيسي للطالب">
      <Link className="student-adaptive-nav__brand" to="/app/home">
        <img src="/app-icon.svg" alt="" aria-hidden="true" />
        <span>الوسيلة الذكية</span>
        <small>مساحة الطالب</small>
      </Link>

      <div className="student-adaptive-nav__links">
        {primaryStudentDestinations.map((item) => (
          <Link
            key={item.key}
            className={`student-nav-link ${destination === item.key ? "is-active" : ""}`}
            to={item.href}
            aria-current={destination === item.key ? "page" : undefined}
          >
            <StudentIcon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="student-adaptive-nav__secondary">
        <Link
          className={`student-nav-link ${destination === "progress" ? "is-active" : ""}`}
          to="/app/progress"
          aria-current={destination === "progress" ? "page" : undefined}
        >
          <StudentIcon name="progress" />
          <span>تقدمي</span>
        </Link>
        <Link
          className={`student-nav-link student-nav-link--account ${destination === "account" ? "is-active" : ""}`}
          to="/app/account"
          aria-current={destination === "account" ? "page" : undefined}
        >
          <StudentIcon name="account" />
          <span>الحساب</span>
        </Link>
      </div>
    </nav>
  );
}
