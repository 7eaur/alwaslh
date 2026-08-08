// Cloudflare Worker — وسيط (Proxy) بين التطبيق وبين Supabase
// ضعه في Cloudflare Workers Dashboard

const SUPABASE_URL = "https://rtbqrifibedvspxxqrty.supabase.co";
const ALLOWED_ORIGINS = [
  "https://wasila-thkia.com",
  "https://www.wasila-thkia.com",
  "https://api.wasila-thkia.com",
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // التعامل مع طلبات CORS المبدئية (OPTIONS)
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }

    // بناء العنوان الجديد نحو Supabase
    const targetURL = SUPABASE_URL + url.pathname + url.search;

    // نسخ الـ headers الأصلية
    const newHeaders = new Headers(request.headers);

    // إضافة host الصحيح
    newHeaders.set("host", "rtbqrifibedvspxxqrty.supabase.co");

    // إعداد الطلب الجديد
    const newRequest = new Request(targetURL, {
      method: request.method,
      headers: newHeaders,
      body: request.method !== "GET" && request.method !== "HEAD"
        ? request.body
        : undefined,
      redirect: "follow",
    });

    // إرسال الطلب إلى Supabase
    const response = await fetch(newRequest);

    // نسخ الـ headers من الرد
    const responseHeaders = new Headers(response.headers);

    // إضافة CORS headers للسماح بالوصول من أي مصدر
    const origin = request.headers.get("Origin") || "";
    responseHeaders.set("Access-Control-Allow-Origin", origin || "*");
    responseHeaders.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    responseHeaders.set(
      "Access-Control-Allow-Headers",
      "authorization, x-client-info, apikey, content-type, x-supabase-api-version, prefer, range, accept-profile, content-profile"
    );
    responseHeaders.set("Access-Control-Allow-Credentials", "true");
    responseHeaders.set("Access-Control-Max-Age", "86400");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};

// معالجة طلبات CORS المبدئية
function handleOptions(request) {
  const origin = request.headers.get("Origin") || "*";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods":
        "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-supabase-api-version, prefer, range, accept-profile, content-profile",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    },
  });
}
