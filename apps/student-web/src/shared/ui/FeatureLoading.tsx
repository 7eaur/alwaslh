export function FeatureLoading({ label = "جاري فتح الصفحة" }: { label?: string }) {
  return (
    <div className="student-feature-loading" role="status" aria-live="polite" aria-busy="true">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
