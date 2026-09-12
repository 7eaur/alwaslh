import type {
  OperationsAttentionSummary,
  OperationsAuditEntry,
  OperationsAuditSource,
} from "../../admin-operations-api";

export type AttentionCategory = "review" | "failure" | "support";

export interface AttentionItem {
  key: string;
  category: AttentionCategory;
  title: string;
  description: string;
  count: number;
  to: string;
}

const dateFormatter = new Intl.DateTimeFormat("ar-YE", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatAdminDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function buildAttentionItems(summary: OperationsAttentionSummary): AttentionItem[] {
  return [
    {
      key: "content-review",
      category: "review",
      title: "محتوى بانتظار المراجعة",
      description: "أصول تعليمية وصلت إلى مرحلة المراجعة قبل النشر.",
      count: summary.review.contentAssets,
      to: "/app/reviews/content",
    },
    {
      key: "ocr-review",
      category: "review",
      title: "استخراجات OCR بانتظار المراجعة",
      description: "نصوص مستخرجة تحتاج قرارًا بشريًا قبل اعتمادها.",
      count: summary.review.ocr,
      to: "/app/reviews/content",
    },
    {
      key: "ai-review",
      category: "review",
      title: "مخرجات ذكاء اصطناعي تحتاج مراجعة",
      description: "مخرجات مولدة لم تعتمد بشريًا بعد.",
      count: summary.review.ai,
      to: "/app/reviews/ai",
    },
    {
      key: "question-review",
      category: "review",
      title: "أسئلة بانتظار المراجعة",
      description: "مراجعات بنك الأسئلة التي لم تصل بعد إلى قرار النشر.",
      count: summary.review.questions,
      to: "/app/questions",
    },
    {
      key: "quiz-review",
      category: "review",
      title: "اختبارات بانتظار المراجعة",
      description: "اختبارات تحتاج مراجعة التكوين قبل النشر.",
      count: summary.review.quizzes,
      to: "/app/quizzes",
    },
    {
      key: "ingestion-failure",
      category: "failure",
      title: "فشل في معالجة المحتوى",
      description: "مهام استيراد أو معالجة توقفت وتحتاج تشخيصًا أو إعادة محاولة.",
      count: summary.failures.ingestion,
      to: "/app/content",
    },
    {
      key: "ocr-failure",
      category: "failure",
      title: "فشل في OCR",
      description: "عمليات استخراج لم تكتمل بنجاح وتحتاج متابعة.",
      count: summary.failures.ocr,
      to: "/app/reviews/content",
    },
    {
      key: "ai-failure",
      category: "failure",
      title: "فشل في عمليات الذكاء الاصطناعي",
      description: "مهام توليد توقفت قبل الوصول إلى نتيجة قابلة للمراجعة.",
      count: summary.failures.ai,
      to: "/app/reviews/ai",
    },
    {
      key: "locked-logins",
      category: "support",
      title: "حسابات مقفلة مؤقتًا",
      description: "محاولات دخول وصلت إلى حالة القفل وتحتاج دعمًا عند وجود بلاغ طالب.",
      count: summary.support.lockedLogins,
      to: "/app/students",
    },
    {
      key: "pending-recovery",
      category: "support",
      title: "طلبات استرداد سارية",
      description: "طلبات استرداد لم تستخدم بعد؛ راجعها عند متابعة حالة طالب.",
      count: summary.support.pendingRecovery,
      to: "/app/students",
    },
    {
      key: "forced-password-change",
      category: "support",
      title: "طلاب مطالبون بتغيير كلمة المرور",
      description: "حسابات ما زالت في خطوة تغيير كلمة المرور الإلزامية.",
      count: summary.support.forcedPasswordChanges,
      to: "/app/students",
    },
  ].filter((item) => item.count > 0);
}

export function attentionTotal(summary: OperationsAttentionSummary): number {
  return buildAttentionItems(summary).reduce((total, item) => total + item.count, 0);
}

export function sourceLabel(source: OperationsAuditSource): string {
  return {
    auth: "الحسابات",
    access: "الوصول",
    curriculum: "المنهج والمحتوى",
    ai_review: "مراجعة الذكاء الاصطناعي",
    question_bank: "بنك الأسئلة",
    quiz_builder: "الاختبارات",
  }[source];
}

export function eventLabel(eventType: string): string {
  const labels: Record<string, string> = {
    login_success: "تسجيل دخول ناجح",
    login_failure: "محاولة دخول غير ناجحة",
    login_locked: "قفل تسجيل الدخول",
    logout: "تسجيل خروج",
    password_changed: "تغيير كلمة المرور",
    recovery_issued: "إصدار استرداد",
    recovery_used: "استخدام الاسترداد",
    session_revoked: "إلغاء جلسة",
    device_registered: "تسجيل جهاز",
    temporary_password_issued: "إصدار كلمة مرور مؤقتة",
    device_rebind_reset: "السماح بإعادة ربط الجهاز",
    full_code_redeemed: "استخدام كود وصول شامل",
    class_code_redeemed: "استخدام كود وصول للصف",
    code_generated: "توليد أكواد وصول",
    code_redeemed: "استخدام كود وصول",
    code_revoked: "إيقاف كود وصول",
    entitlement_created: "إنشاء صلاحية وصول",
    entitlement_renewed: "تجديد صلاحية وصول",
    entitlement_revoked: "إلغاء صلاحية وصول",
    created: "إنشاء",
    updated: "تعديل",
    create: "إنشاء",
    import: "استيراد",
    edit: "تعديل",
    submit_review: "إرسال للمراجعة",
    approve: "اعتماد",
    reject: "رفض",
    publish: "نشر",
    archive: "أرشفة",
    regenerate: "إعادة توليد",
    version_add: "إضافة نموذج",
    version_update: "تحديث نموذج",
    version_remove: "حذف نموذج",
  };
  return labels[eventType] ?? "حدث تشغيلي";
}

export function resourceLabel(resourceType: string | null): string | null {
  if (!resourceType) return null;
  const labels: Record<string, string> = {
    profile: "حساب طالب",
    entitlement: "صلاحية وصول",
    full_access_code: "كود وصول شامل",
    class_access_code: "كود وصول للصف",
    class: "صف",
    subject: "مادة",
    lesson: "درس",
    ai_output: "مخرج ذكاء اصطناعي",
    question_bank_item: "سؤال",
    quiz: "اختبار",
  };
  return labels[resourceType] ?? "عنصر تشغيلي";
}

export function auditSubject(entry: OperationsAuditEntry): string {
  return entry.subjectDisplayName ?? entry.actorDisplayName ?? "النظام";
}
