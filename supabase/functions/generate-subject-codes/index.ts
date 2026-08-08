import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // التحقق من صلاحيات المدير
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('غير مصرح');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('غير مصرح');
    }

    // التحقق من أن المستخدم مدير
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('غير مصرح - يجب أن تكون مديراً');
    }

    // قراءة البيانات من الطلب
    const { count } = await req.json();

    if (!count || count < 1 || count > 1000) {
      throw new Error('عدد الأكواد يجب أن يكون بين 1 و 1000');
    }

    // توليد الأكواد
    const codes: string[] = [];
    const maxAttempts = count * 10; // لتجنب الحلقة اللانهائية
    let attempts = 0;

    while (codes.length < count && attempts < maxAttempts) {
      attempts++;
      
      // توليد كود عشوائي من 7 أرقام
      const code = Math.floor(1000000 + Math.random() * 9000000).toString();
      
      // التحقق من عدم وجود الكود في قاعدة البيانات
      const { data: existing } = await supabaseClient
        .from('subject_activation_codes')
        .select('id')
        .eq('code', code)
        .maybeSingle();

      if (!existing && !codes.includes(code)) {
        codes.push(code);
      }
    }

    if (codes.length < count) {
      throw new Error('فشل في توليد العدد المطلوب من الأكواد الفريدة');
    }

    // إدراج الأكواد في قاعدة البيانات
    const { data: insertedCodes, error: insertError } = await supabaseClient
      .from('subject_activation_codes')
      .insert(codes.map(code => ({ code })))
      .select();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        codes: insertedCodes,
        message: `تم توليد ${codes.length} كود بنجاح`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
