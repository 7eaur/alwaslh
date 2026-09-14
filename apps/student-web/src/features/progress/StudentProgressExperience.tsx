import { Link } from "react-router-dom";
import { StudentIcon } from "../../shared/icons/StudentIcon";
import { EmptyState } from "../../shared/ui/EmptyState";

export function StudentProgressExperience() {
  return (
    <section className="student-secondary-v2" aria-label="تقدمي">
      <EmptyState
        icon={<StudentIcon name="progress" />}
        title="سيظهر تقدمك هنا"
        description="لن نعرض أرقامًا تقديرية. تظهر هذه المساحة عندما يوفر النظام بيانات تقدم موثوقة."
        action={<Link className="secondary-button" to="/app/learn">فتح التعلّم</Link>}
      />
    </section>
  );
}
