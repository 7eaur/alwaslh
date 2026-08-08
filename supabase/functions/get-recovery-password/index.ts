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
    const { fingerprint, legacyFingerprints = [], deviceSignature = "", legacyDeviceSignatures = [] } = await req.json();
    if (!fingerprint || typeof fingerprint !== "string") {
      return new Response(JSON.stringify({ error: "بصمة الجهاز مفقودة" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getAdminClient();
    const allFingerprints = [fingerprint, ...legacyFingerprints].filter((v): v is string => typeof v === "string");
    const allDeviceSigs = [deviceSignature, ...legacyDeviceSignatures].filter((v): v is string => typeof v === "string" && v !== "");

    // البحث أولاً باستخدام البصمة المخزنة
    let { data: row, error: fetchError } = await supabase
      .from("access_codes")
      .select("id, code, device_fingerprint, device_signature, recovery_password_encrypted, is_used")
      .in("device_fingerprint", allFingerprints)
      .eq("is_used", true)
      .maybeSingle();

    let matchedByLegacySignature = false;

    // إذا لم تُوجد، البحث باستخدام توقيع الجهاز (نفس الجهاز لكن البصمة تغيرت)
    if ((!row || fetchError) && allDeviceSigs.length > 0) {
      const result = await supabase
        .from("access_codes")
        .select("id, code, device_fingerprint, device_signature, recovery_password_encrypted, is_used")
        .in("device_signature", allDeviceSigs)
        .eq("is_used", true)
        .maybeSingle();
      row = result.data;
      fetchError = result.error;
      if (row && allDeviceSigs.length > 0 && row.device_signature !== deviceSignature) {
        matchedByLegacySignature = true;
      }
    }

    if (fetchError || !row || !row.recovery_password_encrypted) {
      return new Response(JSON.stringify({ error: "لا يوجد كلمة مرور لهذا الجهاز" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // تحديث التوقيع المخزن إلى التوقيع الجديد المستقر
    if (deviceSignature && (row.device_signature !== deviceSignature || matchedByLegacySignature)) {
      await supabase
        .from("access_codes")
        .update({ device_signature: deviceSignature })
        .eq("id", row.id);
    }

    const password = await decryptPassword(row.recovery_password_encrypted);

    return new Response(
      JSON.stringify({ success: true, password, code: row.code }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("get-recovery-password error:", err);
    return new Response(JSON.stringify({ error: err.message || "خطأ داخلي" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
