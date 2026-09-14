import { Link } from "react-router-dom";
import { StudentIcon } from "../../student-icons";
import { primaryStudentDestinations, type StudentDestination } from "./student-navigation";

export function StudentBottomNav({ destination }: { destination: StudentDestination }) {
  return (
    <nav className="student-bottom-nav" aria-label="التنقل الرئيسي للطالب على الهاتف">
      {primaryStudentDestinations.map((item) => (
        <Link
          key={item.key}
          className={`student-bottom-nav__item ${destination === item.key ? "is-active" : ""}`}
          to={item.href}
          aria-current={destination === item.key ? "page" : undefined}
        >
          <StudentIcon name={item.icon} />
          <span>{item.shortLabel}</span>
        </Link>
      ))}
    </nav>
  );
}
