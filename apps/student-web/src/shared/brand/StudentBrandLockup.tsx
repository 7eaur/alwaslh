export function StudentBrandLockup({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <span className={`student-brand${className ? ` ${className}` : ""}`} aria-label="الوسيلة الذكية — مساحة الطالب">
      <img className="student-brand__asset" src="/app-icon.svg" alt="" aria-hidden="true" />
      <span className="student-brand__copy">
        <strong>الوسيلة الذكية</strong>
        {!compact ? <small>مساحة الطالب</small> : null}
      </span>
    </span>
  );
}
