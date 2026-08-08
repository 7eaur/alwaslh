import { createClient } from "jsr:@supabase/supabase-js@2";
import { decryptPassword } from "../_shared/crypto.ts";

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

    const { data: row, error: fetchError } = await supabase
      .from("access_codes")
      .select("id, recovery_password_encrypted")
      .eq("id", codeId)
      .maybeSingle();

    if (fetchError || !row) {
      return new Response(JSON.stringify({ error: "Code not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!row.recovery_password_encrypted) {
      return new Response(JSON.stringify({ password: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const password = await decryptPassword(row.recovery_password_encrypted);

    return new Response(
      JSON.stringify({ password }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("admin-get-recovery-password error:", err);
    return new Response(JSON.stringify({ error: err.message || "خطأ داخلي" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
