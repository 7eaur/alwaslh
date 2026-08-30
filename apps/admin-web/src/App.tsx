const sections = [
  "نظرة عامة",
  "المحتوى",
  "الاختبارات والذكاء الاصطناعي",
  "الطلاب والوصول",
  "الإشعارات",
  "التقارير",
  "النظام",
] as const;

export function App() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="التنقل الرئيسي">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">و</span>
          <div>
            <strong>الوسيلة الذكية</strong>
            <small>لوحة الإدارة</small>
          </div>
        </div>

        <nav className="admin-nav">
          {sections.map((section, index) => (
            <button
              className={index === 0 ? "nav-item is-active" : "nav-item"}
              key={section}
              type="button"
            >
              {section}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="page-header">
          <div>
            <p className="eyebrow">مركز التشغيل</p>
            <h1>نظرة عامة</h1>
            <p className="page-description">
              هذه هي قشرة التطبيق الجديدة فقط. البيانات الحقيقية ستتصل بعد تدقيق قاعدة البيانات،
              ولن نستخدم أرقامًا وهمية في لوحة التشغيل.
            </p>
          </div>
          <div className="header-actions">
            <button className="secondary-button" type="button">سجل العمليات</button>
            <button className="primary-button" type="button">إضافة محتوى</button>
          </div>
        </header>

        <section className="foundation-notice" aria-labelledby="foundation-title">
          <div>
            <span className="status-dot" aria-hidden="true" />
            <h2 id="foundation-title">Foundation mode</h2>
          </div>
          <p>
            Admin وStudent أصبحا تطبيقين منفصلين. الخطوة التالية هي ربط هذه القشرة بعقود البيانات
            الآمنة بعد Database Reality Audit.
          </p>
        </section>

        <section className="workspace-grid" aria-label="مناطق العمل الرئيسية">
          <article>
            <span className="section-kicker">CONTENT</span>
            <h2>إدارة المحتوى</h2>
            <p>الصفوف والمواد والدروس والرفع والمعالجة ضمن مسار واحد واضح.</p>
          </article>
          <article>
            <span className="section-kicker">AI</span>
            <h2>عمليات الذكاء الاصطناعي</h2>
            <p>Jobs وحالات التنفيذ وإعادة المحاولة بدل عمليات طويلة مرتبطة بصفحة المتصفح.</p>
          </article>
          <article>
            <span className="section-kicker">ACCESS</span>
            <h2>الطلاب والوصول</h2>
            <p>حسابات وEntitlements وأكواد في نموذج تشغيل موحد قابل للتدقيق.</p>
          </article>
        </section>
      </main>
    </div>
  );
}
