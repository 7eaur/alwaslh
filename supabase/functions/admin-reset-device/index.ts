import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function getAdminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) throw new Error("Supabase env missing");
  return createClient(url, serviceKey);
}

async function verifyAdmin(req: Request): Promise<{ success: boolean; error?: string }> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return { success: false, error: "Missing authorization header" };

  const token = authHeader.replace("Bearer ", "");
  const supabase = getAdminClient();

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return { success: false, error: "Invalid session" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") {
    return { success: false, error: "Admin access required" };
  }

  return { success: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.success) {
      return new Response(JSON.stringify({ error: adminCheck.error }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { codeId } = await req.json();
    if (!codeId) {
      return new Response(JSON.stringify({ error: "codeId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getAdminClient();

    // جلب معرّف الحساب المرتبط قبل إعادة التعيين
    const { data: codeRow, error: fetchError } = await supabase
      .from("access_codes")
      .select("profile_id")
      .eq("id", codeId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // حذف الملف الشخصي والحساب المصادق للطالب
    if (codeRow?.profile_id) {
      await supabase.from("profiles").delete().eq("id", codeRow.profile_id);
      await supabase.auth.admin.deleteUser(codeRow.profile_id);
    }

    const { error: updateError } = await supabase
      .from("access_codes")
      .update({
        is_used: false,
        device_fingerprint: null,
        device_id: null,
        recovery_password_encrypted: null,
        profile_id: null,
        activated_at: null,
      })
      .eq("id", codeId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("admin-reset-device error:", err);
    return new Response(JSON.stringify({ error: err.message || "خطأ داخلي" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
