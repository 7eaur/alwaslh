import { StudentBrandLockup } from "../../shared/brand/StudentBrandLockup";
import { LoadingSpinner } from "../../shared/ui/LoadingSpinner";

export function StudentSessionLoading() {
  return (
    <main className="student-session-state" aria-busy="true">
      <StudentBrandLockup />
      <div role="status" aria-live="polite">
        <LoadingSpinner />
        <h1>جاري فتح مساحة الطالب</h1>
        <p>ثوانٍ قليلة ونكمل من حيث توقفت.</p>
      </div>
    </main>
  );
}

export function StudentConnectionGate({ kind, onRetry }: { kind: "offline" | "unavailable"; onRetry: () => void }) {
  const offline = kind === "offline";
  return (
    <main className="student-session-state">
      <StudentBrandLockup />
      <section aria-labelledby="connection-title">
        <p className="eyebrow">{offline ? "لا يوجد اتصال" : "تعذر الاتصال"}</p>
        <h1 id="connection-title">{offline ? "اتصل بالإنترنت للمتابعة" : "الخدمة غير متاحة الآن"}</h1>
        <p>{offline ? "نحتاج اتصالًا للتحقق من حسابك عند فتح التطبيق. اتصل بالإنترنت ثم أعد المحاولة." : "لم يتم تسجيل خروجك. انتظر قليلًا ثم أعد المحاولة."}</p>
        <button className="primary-button" type="button" onClick={onRetry} disabled={offline && !navigator.onLine}>إعادة المحاولة</button>
      </section>
    </main>
  );
}
