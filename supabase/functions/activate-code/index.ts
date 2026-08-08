import { getAdminClient } from "../_shared/supabase.ts";
import { decryptPassword, encryptPassword } from "../_shared/crypto.ts";

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
    const { code, password, fingerprint, legacyFingerprints = [], is_migration, deviceSignature = "" } = await req.json();

    if (!code || typeof code !== "string" || code.length !== 6) {
      return new Response(JSON.stringify({ error: "كود التفعيل يجب أن يكون 6 أرقام" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getAdminClient();
    const allFingerprints = [fingerprint, ...legacyFingerprints].filter((v): v is string =>
      typeof v === "string"
    );

    const { data: row, error: fetchError } = await supabase
      .from("access_codes")
      .select("id, code, is_used, expires_at, created_at, profile_id, device_fingerprint, device_signature, recovery_password_encrypted")
      .eq("code", code)
      .maybeSingle();

    if (fetchError || !row) {
      return new Response(
        JSON.stringify({ error: "الكود الذي أدخلته غير صحيح. الرجاء التأكد والمحاولة مرة أخرى" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "الكود منتهي الصلاحية" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = `${code}@miaoda.com`;

    // تفعيل جديد: الكود غير مستخدم
    if (!row.is_used) {
      if (!password || typeof password !== "string" || password.length < 4) {
        return new Response(JSON.stringify({ error: "كلمة المرور يجب أن تكون 4 أرقام على الأقل" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return await createAccountForCode(supabase, row, email, password, fingerprint, deviceSignature);
    }

    // ترحيل الطلاب القدامى: الكود مستخدم ولا يوجد حساب
    if (is_migration && !row.profile_id) {
      const fingerprintMatched = allFingerprints.includes(row.device_fingerprint || "");
      const signatureMatched = !!(deviceSignature && deviceSignature === row.device_signature);
      const isLegacyDevice = !row.device_signature;
      const deviceVerified = fingerprintMatched || signatureMatched || (isLegacyDevice && !!password);
      if (!deviceVerified) {
        return new Response(JSON.stringify({ error: "هذا الجهاز غير مرتبط بهذا الكود" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const migrationPassword = password || (row.recovery_password_encrypted ? await decryptPassword(row.recovery_password_encrypted) : null);
      if (!migrationPassword) {
        return new Response(JSON.stringify({ error: "لا يوجد كلمة مرور محفوظة لهذا الكود" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return await createAccountForCode(supabase, row, email, migrationPassword, fingerprint, deviceSignature);
    }

    // الكود مستخدم بالفعل (ولو تم ترحيله) → تسجيل الدخول
    return new Response(
      JSON.stringify({ error: "هذا الكود مستخدم مسبقاً. استخدم خيار تسجيل الدخول" }),
      {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: any) {
    console.error("activate-code error:", err);
    return new Response(JSON.stringify({ error: err.message || "خطأ داخلي" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function createAccountForCode(
  supabase: ReturnType<typeof getAdminClient>,
  row: any,
  email: string,
  password: string,
  fingerprint?: string,
  deviceSignature?: string,
) {
  // حذف أي حساب قديم بنفس البريد (بعد إعادة تعيين الكود مثلاً)
  let existingUser: any = null;
  try {
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) {
      console.warn("listUsers error:", listError);
    } else {
      existingUser = (usersData?.users || []).find((u: any) => u.email === email);
    }
  } catch (listErr) {
    console.warn("listUsers exception:", listErr);
  }

  if (existingUser) {
    await supabase.from("profiles").delete().eq("id", existingUser.id);
    await supabase.auth.admin.deleteUser(existingUser.id);
  }

  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !createData?.user) {
    console.error("createUser error:", createError);
    return new Response(JSON.stringify({ error: "فشل إنشاء حساب الطالب" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = createData.user.id;

  // إنشاء سجل الملف الشخصي للطالب
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    username: row.code,
    password: password,
    role: "student",
    activated_subjects: [],
    full_access_code: row.code,
  });
  if (profileError) {
    console.error("profile insert error:", profileError);
  }

  let recoveryPasswordEncrypted: string | null = null;
  try {
    recoveryPasswordEncrypted = await encryptPassword(password);
  } catch (cryptoErr) {
    console.warn("encryptPassword error:", cryptoErr);
  }

  const { error: updateError } = await supabase
    .from("access_codes")
    .update({
      is_used: true,
      profile_id: userId,
      device_fingerprint: fingerprint || row.device_fingerprint || null,
      device_signature: deviceSignature || row.device_signature || null,
      activated_at: new Date().toISOString(),
      expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      recovery_password_encrypted: recoveryPasswordEncrypted,
    })
    .eq("id", row.id);

  if (updateError) {
    console.error("access_codes update error:", updateError);
    await supabase.auth.admin.deleteUser(userId);
    return new Response(JSON.stringify({ error: "فشل ربط الحساب بالكود" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      code: row.code,
      user_id: userId,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
