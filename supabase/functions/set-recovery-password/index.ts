import { getAdminClient } from "../_shared/supabase.ts";
import { encryptPassword } from "../_shared/crypto.ts";

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
    const { code, fingerprint, legacyFingerprints = [], password, deviceSignature = "", legacyDeviceSignatures = [] } = await req.json();
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
    const allFingerprints = [fingerprint, ...legacyFingerprints].filter((v): v is string => typeof v === "string");
    const allDeviceSigs = [deviceSignature, ...legacyDeviceSignatures].filter((v): v is string => typeof v === "string" && v !== "");
    if (!password || typeof password !== "string" || password.length < 4) {
      return new Response(JSON.stringify({ error: "كلمة المرور يجب أن تكون 4 أرقام على الأقل" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getAdminClient();

    const { data: row, error: fetchError } = await supabase
      .from("access_codes")
      .select("id, code, device_fingerprint, device_signature, is_used")
      .eq("code", code)
      .maybeSingle();

    if (fetchError || !row) {
      return new Response(JSON.stringify({ error: "الكود غير موجود" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fingerprintMatched = allFingerprints.includes(row.device_fingerprint || "");
    const signatureMatched = !!(deviceSignature && deviceSignature === row.device_signature);
    const legacySignatureMatched = allDeviceSigs.length > 0 && allDeviceSigs.includes(row.device_signature || "");

    if (!row.is_used || (row.device_fingerprint && !fingerprintMatched && !signatureMatched && !legacySignatureMatched)) {
      return new Response(JSON.stringify({ error: "الجهاز غير مرتبط بهذا الكود" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const encrypted = await encryptPassword(password);

    const { error: updateError } = await supabase
      .from("access_codes")
      .update({
        recovery_password_encrypted: encrypted,
        device_fingerprint: fingerprint,
        device_signature: deviceSignature || row.device_signature || null,
      })
      .eq("id", row.id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("set-recovery-password error:", err);
    return new Response(JSON.stringify({ error: err.message || "خطأ داخلي" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
