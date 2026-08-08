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
    const { fingerprint, legacyFingerprints = [] } = await req.json();
    if (!fingerprint || typeof fingerprint !== "string") {
      return new Response(JSON.stringify({ error: "بصمة الجهاز مفقودة" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getAdminClient();
    const allFingerprints = [fingerprint, ...legacyFingerprints].filter((v): v is string => typeof v === "string");

    const { data: row, error: fetchError } = await supabase
      .from("access_codes")
      .select("id, code, is_used, device_fingerprint, recovery_password_encrypted, expires_at")
      .in("device_fingerprint", allFingerprints)
      .eq("is_used", true)
      .maybeSingle();

    if (fetchError || !row) {
      return new Response(JSON.stringify({ status: "inactive" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return new Response(JSON.stringify({ status: "inactive" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const status = row.recovery_password_encrypted ? "active_with_password" : "active_without_password";

    // ترقية البصمة المخزنة إلى البصمة الجديدة المستقرة إذا اقتضى الأمر
    if (row.device_fingerprint !== fingerprint) {
      await supabase
        .from("access_codes")
        .update({ device_fingerprint: fingerprint })
        .eq("id", row.id);
    }

    return new Response(
      JSON.stringify({ status, code: row.code }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("check-device error:", err);
    return new Response(JSON.stringify({ status: "inactive" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
