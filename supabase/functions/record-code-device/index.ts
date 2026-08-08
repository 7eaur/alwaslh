import { getAdminClient } from "../_shared/supabase.ts";

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
    const { code, fingerprint, legacyFingerprints = [], deviceSignature = "", legacyDeviceSignatures = [] } = await req.json();
    if (!code || typeof code !== "string" || code.length !== 6) {
      return new Response(JSON.stringify({ error: "كود التفعيل غير صالح" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!fingerprint || typeof fingerprint !== "string") {
      return new Response(JSON.stringify({ error: "بصمة الجهاز مفقودة" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getAdminClient();
    const allFingerprints = [fingerprint, ...legacyFingerprints].filter((v): v is string => typeof v === "string");
    const allDeviceSigs = [deviceSignature, ...legacyDeviceSignatures].filter((v): v is string => typeof v === "string" && v !== "");

    const { data: row, error: fetchError } = await supabase
      .from("access_codes")
      .select("id, code, is_used, device_fingerprint, device_signature, recovery_password_encrypted")
      .eq("code", code)
      .maybeSingle();

    if (fetchError || !row) {
      return new Response(JSON.stringify({ error: "الكود غير موجود" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // إذا لم يكن الكود مفعلاً، نُرجع حالة الكود دون تسجيل جهاز
    if (!row.is_used) {
      return new Response(
        JSON.stringify({ success: true, is_used: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const matched = allFingerprints.includes(row.device_fingerprint || "");
    const signatureMatched = !!(deviceSignature && deviceSignature === row.device_signature);
    const legacySignatureMatched = allDeviceSigs.length > 0 && allDeviceSigs.includes(row.device_signature || "");

    // تحديث التوقيع المخزن إلى التوقيع الجديد المستقر
    if (deviceSignature && (legacySignatureMatched || (signatureMatched && row.device_signature !== deviceSignature))) {
      await supabase
        .from("access_codes")
        .update({ device_signature: deviceSignature })
        .eq("id", row.id);
    }

    // إذا تطابقت البصمة أو التوقيع لا حاجة للتحديث
    if (matched || signatureMatched || legacySignatureMatched) {
      return new Response(
        JSON.stringify({ success: true, is_used: true, updated: false, has_recovery_password: !!row.recovery_password_encrypted }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // رفض التحديث إذا كان التوقيع مخالفاً (جهاز مختلف)
    if (row.device_signature && allDeviceSigs.length > 0 && !allDeviceSigs.includes(row.device_signature)) {
      return new Response(JSON.stringify({ error: "هذا الجهاز غير مرتبط بهذا الكود" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // إذا لم يكن هناك توقيع مخزن (حساب قديم) نترك التحديث لخطوة التحقق من كلمة المرور
    // لضمان عدم ربط الجهاز إلا بعد التحقق من كلمة المرور
    if (!row.device_signature) {
      return new Response(
        JSON.stringify({ success: true, is_used: true, updated: false, has_recovery_password: !!row.recovery_password_encrypted }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // تحديث بصمة الجهاز إلى الجهاز الحالي (نفس الجهاز ولكن البصمة تغيرت مثل حذف التطبيق)
    const { error: updateError } = await supabase
      .from("access_codes")
      .update({ device_fingerprint: fingerprint })
      .eq("id", row.id);

    if (updateError) {
      console.error("record-code-device update error:", updateError);
      return new Response(JSON.stringify({ error: "فشل تحديث بصمة الجهاز" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, is_used: true, updated: true, has_recovery_password: !!row.recovery_password_encrypted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("record-code-device error:", err);
    return new Response(JSON.stringify({ error: err.message || "خطأ داخلي" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
