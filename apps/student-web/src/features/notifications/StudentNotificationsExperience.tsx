import { StudentIcon } from "../../shared/icons/StudentIcon";
import { EmptyState } from "../../shared/ui/EmptyState";

export function StudentNotificationsExperience() {
  return (
    <section className="student-secondary-v2" aria-label="الإشعارات">
      <EmptyState
        icon={<StudentIcon name="notifications" />}
        title="لا توجد إشعارات جديدة"
        description="ستظهر هنا التنبيهات المهمة المرتبطة بحسابك وتعلّمك عندما تتوفر."
      />
    </section>
  );
}
