import { ApiRequestError } from "./api-errors";

export type StudentErrorContext =
  | "activation"
  | "login"
  | "access"
  | "curriculum"
  | "reader"
  | "assessment"
  | "downloads"
  | "generic";

const fallbackByContext: Record<StudentErrorContext, string> = {
  activation: "تعذر تفعيل الحساب الآن. تحقق من الرمز ثم حاول مرة أخرى. وإذا استمرت المشكلة افتح صفحة الدعم.",
  login: "تعذر تسجيل الدخول الآن. تحقق من بياناتك ثم حاول مرة أخرى.",
  access: "تعذر تحديث وصولك الآن. تحقق من الرمز أو حاول مرة أخرى بعد قليل.",
  curriculum: "تعذر تحميل موادك الآن. حاول مرة أخرى بعد قليل.",
  reader: "تعذر فتح الدرس الآن. حاول مرة أخرى، أو ارجع واختر درسًا آخر إذا استمرت المشكلة.",
  assessment: "تعذر إكمال العملية الآن. إجاباتك الحالية لن تُعتبر مكتملة حتى تنجح العملية. حاول مرة أخرى.",
  downloads: "تعذر إكمال عملية التنزيل الآن. تحقق من الاتصال أو المساحة المتاحة ثم حاول مرة أخرى.",
  generic: "تعذر إكمال العملية الآن. حاول مرة أخرى. وإذا استمرت المشكلة افتح صفحة الدعم.",
};

export function studentErrorMessage(error: unknown, context: StudentErrorContext = "generic"): string {
  if (error instanceof Error && error.message === "device_key_missing") {
    return "لم نتمكن من التحقق من هذا الجهاز. افتح صفحة الدعم واطلب إعادة ربط الجهاز، ثم سجّل الدخول مرة أخرى.";
  }
  if (error instanceof Error && error.message === "device_crypto_unavailable") {
    return "هذا المتصفح لا يدعم تسجيل الدخول الآمن. حدّث المتصفح أو استخدم متصفحًا حديثًا ثم حاول مرة أخرى.";
  }
  if (!(error instanceof ApiRequestError)) return fallbackByContext[context];

  switch (error.code) {
    case "SERVICE_UNAVAILABLE":
      return "تعذر الاتصال بالخدمة الآن. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.";
    case "RATE_LIMITED":
      return "تمت محاولات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.";
    case "UNAUTHORIZED":
      return context === "login"
        ? "معرّف الحساب أو كلمة المرور غير صحيحة. تحقق منهما ثم حاول مرة أخرى."
        : "انتهت جلستك. سجّل الدخول مرة أخرى للمتابعة.";
    case "FORBIDDEN":
      return context === "access"
        ? "هذا المحتوى غير متاح لحسابك حاليًا. تحقق من رمز الصف أو افتح صفحة الدعم إذا كنت تتوقع أن يكون متاحًا."
        : "هذه العملية غير متاحة لحسابك حاليًا. ارجع إلى الصفحة السابقة أو افتح صفحة الدعم إذا كنت تحتاج مساعدة.";
    case "NOT_FOUND":
      if (context === "activation") return "رمز التفعيل غير صحيح أو لم يعد صالحًا. تحقق من الأرقام أو اطلب رمزًا جديدًا.";
      if (context === "access") return "رمز الصف غير صحيح أو لم يعد صالحًا. تحقق من الرمز ثم حاول مرة أخرى.";
      if (context === "reader") return "هذا الدرس غير موجود أو لم يعد متاحًا. ارجع إلى المادة واختر درسًا آخر.";
      if (context === "assessment") return "هذه المحاولة أو الاختبار لم يعد متاحًا. ارجع إلى التدريب واختر اختبارًا متاحًا.";
      return "العنصر المطلوب غير موجود أو لم يعد متاحًا. ارجع واختر عنصرًا آخر.";
    case "CONFLICT":
      if (context === "activation") return "لا يمكن استخدام رمز التفعيل بهذه الحالة. إذا سبق تفعيل الحساب، استخدم تسجيل الدخول.";
      if (context === "access") return "لا يمكن استخدام رمز الصف بهذه الحالة. قد يكون مفعّلًا مسبقًا أو لم يعد متاحًا.";
      if (context === "assessment") return "تغيّرت حالة هذه المحاولة. حدّث الصفحة ثم تابع من الحالة الظاهرة لك.";
      return "تغيّرت حالة هذه العملية. حدّث الصفحة ثم حاول مرة أخرى.";
    case "BAD_REQUEST":
      if (context === "activation") return "تحقق من رمز التفعيل وكلمة المرور ثم حاول مرة أخرى.";
      if (context === "login") return "تحقق من معرّف الحساب وكلمة المرور ثم حاول مرة أخرى.";
      if (context === "access") return "تحقق من رمز الصف ثم حاول مرة أخرى.";
      return "تحقق من البيانات المدخلة ثم حاول مرة أخرى.";
    case "INTERNAL_ERROR":
    default:
      return fallbackByContext[context];
  }
}
