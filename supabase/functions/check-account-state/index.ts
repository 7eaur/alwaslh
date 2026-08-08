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
    const { user_id, code } = await req.json();
    if (!user_id && !code) {
      return new Response(JSON.stringify({ error: "user_id أو code مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getAdminClient();

    let query = supabase.from("access_codes").select("code, is_used, profile_id, expires_at");
    if (user_id) {
      query = query.eq("profile_id", user_id);
    } else {
      query = query.eq("code", code);
    }

    const { data: row, error } = await query.maybeSingle();

    if (error) throw error;

    if (!row) {
      return new Response(JSON.stringify({ valid: false, reason: "no_code" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!row.is_used || !row.profile_id) {
      return new Response(JSON.stringify({ valid: false, reason: "reset_or_unused", code: row.code }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return new Response(JSON.stringify({ valid: false, reason: "expired", code: row.code }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(row.profile_id);
    if (authError || !user) {
      return new Response(JSON.stringify({ valid: false, reason: "user_deleted", code: row.code }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ valid: true, code: row.code }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("check-account-state error:", err);
    return new Response(JSON.stringify({ error: err.message || "خطأ داخلي" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
