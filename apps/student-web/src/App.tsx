const quickActions = [
  { title: "دروسي", description: "تابع من آخر درس وابدأ القراءة بسرعة." },
  { title: "الاختبارات", description: "تدرّب على الاختبارات والنماذج المتاحة." },
  { title: "ملاحظاتي", description: "ارجع إلى ملاحظاتك وأسئلتك المحفوظة." },
] as const;

const navigation = ["الرئيسية", "الدروس", "الاختبارات", "الملاحظات", "المزيد"] as const;

export function App() {
  return (
    <div className="student-app">
      <header className="student-header">
        <div className="student-brand">
          <span className="student-brand-mark" aria-hidden="true">و</span>
          <div>
            <strong>الوسيلة الذكية</strong>
            <small>مساحة الطالب</small>
          </div>
        </div>
        <button className="icon-button" type="button" aria-label="الإشعارات">
          <span aria-hidden="true">●</span>
        </button>
      </header>

      <main className="student-main">
        <section className="welcome-block">
          <p className="eyebrow">مرحبًا بك</p>
          <h1>دراستك أقرب وأوضح.</h1>
          <p>
            هذه قشرة النسخة الجديدة. ستتصل الدروس والتقدم والوصول بالحساب الحقيقي بعد تثبيت
            نموذج البيانات والصلاحيات من قاعدة البيانات.
          </p>
        </section>

        <section className="resume-panel" aria-labelledby="resume-title">
          <div>
            <span className="status-label">متابعة الدراسة</span>
            <h2 id="resume-title">لا توجد جلسة مرتبطة بعد</h2>
            <p>لن نعرض تقدمًا وهميًا. بعد ربط Sync Engine سيظهر آخر درس فعلي على هذا الجهاز.</p>
          </div>
          <button className="primary-button" type="button">استعراض الدروس</button>
        </section>

        <section className="quick-section" aria-labelledby="quick-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">اختصارات</p>
              <h2 id="quick-title">ماذا تريد أن تفعل؟</h2>
            </div>
          </div>

          <div className="quick-grid">
            {quickActions.map((action) => (
              <button className="quick-action" type="button" key={action.title}>
                <strong>{action.title}</strong>
                <span>{action.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="offline-card" aria-labelledby="offline-title">
          <span className="offline-indicator" aria-hidden="true" />
          <div>
            <h2 id="offline-title">Offline-first بدون إخفاء الحالة</h2>
            <p>
              النسخة النهائية ستحتفظ بالمحتوى المصرّح به فقط وتوضح آخر مزامنة وحالة الاتصال بدل
              إخفاء التنبيه بعد ثوانٍ.
            </p>
          </div>
        </section>
      </main>

      <nav className="bottom-navigation" aria-label="تنقل الطالب">
        {navigation.map((item, index) => (
          <button className={index === 0 ? "bottom-item is-active" : "bottom-item"} type="button" key={item}>
            <span className="nav-symbol" aria-hidden="true">{index + 1}</span>
            <span>{item}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
