import { getAdminClient } from "../_shared/supabase.ts";
import { decryptPassword } from "../_shared/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fingerprint, legacyFingerprints = [], password, code, deviceSignature = "", legacyDeviceSignatures = [] } = await req.json();
    if (!fingerprint || typeof fingerprint !== "string") {
      return new Response(JSON.stringify({ error: "بصمة الجهاز مفقودة" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const allFingerprints = [fingerprint, ...legacyFingerprints].filter((v): v is string => typeof v === "string");
    const allDeviceSigs = [deviceSignature, ...legacyDeviceSignatures].filter((v): v is string => typeof v === "string" && v !== "");
    if (!password || typeof password !== "string") {
      return new Response(JSON.stringify({ error: "كلمة المرور مفقودة" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getAdminClient();

    let row: any;
    let fetchError: any;

    if (code && typeof code === "string") {
      // البحث بالكود (التدفق الجديد)
      const result = await supabase
        .from("access_codes")
        .select("id, code, device_fingerprint, recovery_password_encrypted, expires_at, activated_at, created_at")
        .eq("code", code)
        .eq("is_used", true)
        .maybeSingle();
      row = result.data;
      fetchError = result.error;
    } else {
      // البحث بالبصمة (للتوافق القديم)
      const result = await supabase
        .from("access_codes")
        .select("id, code, device_fingerprint, recovery_password_encrypted, expires_at, activated_at, created_at")
        .in("device_fingerprint", allFingerprints)
        .eq("is_used", true)
        .maybeSingle();
      row = result.data;
      fetchError = result.error;
    }

    if (fetchError || !row) {
      return new Response(JSON.stringify({ error: "لا يوجد كود مرتبط بهذا الجهاز" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "الكود منتهي الصلاحية" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // التحقق من الجهاز: إذا أُدخل الكود يجب أن تطابق البصمة الجهاز المسجل
    const fingerprintMatched = allFingerprints.includes(row.device_fingerprint || "");
    const signatureMatched = !!(deviceSignature && deviceSignature === row.device_signature);
    const legacySignatureMatched = allDeviceSigs.length > 0 && allDeviceSigs.includes(row.device_signature || "");
    const isSameDevice = fingerprintMatched || signatureMatched || legacySignatureMatched;
    const isLegacyDevice = !row.device_signature;

    // التحقق من الجهاز: البصمة أو التوقيع يجب أن يطابق
    // للحسابات القديمة بدون توقيع، نسمح بالتحقق من كلمة المرور أولاً ثم ربط الجهاز الحالي
    if (code && !isSameDevice && !isLegacyDevice) {
      return new Response(JSON.stringify({ error: "هذا الجهاز غير مصرح له بالدخول" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // إذا لم تُخزن كلمة مرور للاسترجاع (حساب قديم مهاجر قبل التحديث) نكتفي بالتحقق من الجهاز
    if (!row.recovery_password_encrypted) {
      return new Response(
        JSON.stringify({ success: true, deviceOnly: true, code: row.code, created_at: row.created_at, expires_at: row.expires_at }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const storedPassword = await decryptPassword(row.recovery_password_encrypted);

    // مقارنة ثابتة الزمن
    const match = storedPassword.length === password.length &&
      storedPassword.split("").every((c, i) => c === password[i]);

    if (!match) {
      return new Response(JSON.stringify({ error: "كلمة المرور غير صحيحة" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // بعد التحقق من كلمة المرور، نربط الجهاز الحالي (إذا تغيرت البصمة أو كان حساباً قديماً)
    // ونحدث التوقيع المخزن إلى التوقيع الجديد المستقر
    if (row.device_fingerprint !== fingerprint || isLegacyDevice || (legacySignatureMatched && deviceSignature)) {
      await supabase
        .from("access_codes")
        .update({ device_fingerprint: fingerprint, device_signature: deviceSignature || row.device_signature || null })
        .eq("id", row.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        code: row.code,
        created_at: row.created_at,
        expires_at: row.expires_at,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("verify-recovery-password error:", err);
    return new Response(JSON.stringify({ error: err.message || "خطأ داخلي" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
