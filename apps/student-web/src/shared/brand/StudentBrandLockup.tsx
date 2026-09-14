export function StudentBrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="student-brand" aria-label="الوسيلة الذكية — مساحة الطالب">
      <img className="student-brand__asset" src="/app-icon.svg" alt="" aria-hidden="true" />
      <span className="student-brand__copy">
        <strong>الوسيلة الذكية</strong>
        {!compact ? <small>مساحة الطالب</small> : null}
      </span>
    </div>
  );
}
