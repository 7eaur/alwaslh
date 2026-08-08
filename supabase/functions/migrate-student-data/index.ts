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
    const { code, user_id } = await req.json();
    if (!code || typeof code !== "string") {
      return new Response(JSON.stringify({ error: "كود الوصول مفقود" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!user_id || typeof user_id !== "string") {
      return new Response(JSON.stringify({ error: "معرّف الحساب مفقود" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getAdminClient();

    const { data: codeRow, error: codeError } = await supabase
      .from("access_codes")
      .select("id, code, device_id, device_fingerprint")
      .eq("code", code)
      .maybeSingle();

    if (codeError) throw codeError;
    if (!codeRow) {
      return new Response(JSON.stringify({ error: "الكود غير موجود" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const oldIds = new Set<string>();
    oldIds.add(code);
    if (codeRow.device_id) oldIds.add(codeRow.device_id);
    if (codeRow.device_fingerprint) oldIds.add(codeRow.device_fingerprint);
    const ids = Array.from(oldIds).filter((id) => id !== user_id);

    const tables = [
      "student_notes",
      "saved_questions",
      "quiz_attempts",
      "student_achievements",
      "quiz_progress",
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .update({ student_id: user_id })
        .in("student_id", ids);
      if (error) {
        console.warn(`[migrate-student-data] فشل تحديث ${table}:`, error.message);
      }
    }

    return new Response(
      JSON.stringify({ success: true, updated: ids.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("migrate-student-data error:", err);
    return new Response(JSON.stringify({ error: err.message || "خطأ داخلي" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
