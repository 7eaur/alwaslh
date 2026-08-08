# SOURCE_INVENTORY.md

## ملخص المشروع

**الاسم:** الوسيلة الذكية (Alwaseela Smart)  
**النوع:** تطبيق ويب تعليمي (PWA) مع لوحة إدارة  
**التقنية الأساسية:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui + Supabase  
**موقع المشروع الحالي:** `/workspace/app-a8tauoehdn9d`

---

## المكونات الرئيسية

### Frontend

| المجلد | الوصف |
|--------|-------|
| `src/App.tsx` | نقطة الدخول الرئيسية للتطبيق |
| `src/main.tsx` | تثبيت React والإعدادات الأولية |
| `src/routes.tsx` | تعريفات مسارات التطبيق |
| `src/index.css` | الأنماط العالمية ومتغيرات التصميم |
| `src/components/admin/` | مكونات لوحة الإدارة |
| `src/components/common/` | مكونات مشتركة (CachedImage، LazyImage، RefreshButton، إلخ) |
| `src/components/layout/` | مكونات تخطيط الصفحات |
| `src/components/ui/` | مكونات shadcn/ui |
| `src/context/` و `src/contexts/` | Providers لإدارة الحالة (Auth، Access، Student، QuestionGeneration، إلخ) |
| `src/db/` | طبقة قاعدة البيانات والـ API (`api.ts`، `supabase.ts`) |
| `src/hooks/` | React Hooks المخصصة |
| `src/lib/` | أدوات مساعدة: التخزين المؤقت، التشفير، معالجة الصور، إلخ |
| `src/pages/admin/` | صفحات لوحة الإدارة |
| `src/pages/student/` | صفحات الطالب (Dashboard، الدروس، الاختبارات، الملاحظات، الإحصائيات) |
| `src/services/` | خدمات إضافية (حالياً فارغة بملف `.keep`) |

### Backend

| المجلد | الوصف |
|--------|-------|
| `supabase/functions/` | Edge Functions (Deno/TypeScript) للمصادقة والتفعيل وإدارة الأكواد والطلاب |
| `supabase/functions/_shared/` | مكتبات مشتركة للـ Edge Functions (`supabase.ts`، `crypto.ts`) |
| `supabase/migrations/` | 45 ملف SQL Migration لإنشاء وتحديث مخطط قاعدة البيانات |
| `supabase/secrets/required.json` | قائمة أسماء الـ Secrets المطلوبة (لا تحتوي على قيم) |
| `supabase/config.toml` | إعدادات Supabase الأساسية |

### Infrastructure / Proxy

| الملف | الوصف |
|-------|-------|
| `tasks/cloudflare-worker/worker.js` | Cloudflare Worker يعمل كوسيط (Proxy) بين التطبيق وSupabase |

### Config / Assets / Static

| الملف/المجلد | الوصف |
|-------------|-------|
| `public/` | الأصول الثابتة (الصور، الأيقونة، manifest للـ PWA) |
| `index.html` | ملف HTML الرئيسي |
| `vite.config.ts` | إعدادات Vite |
| `vite.config.dev.ts` | إعدادات Vite للتطوير |
| `tailwind.config.js` | إعدادات Tailwind CSS |
| `postcss.config.js` | إعدادات PostCSS |
| `components.json` | إعدادات shadcn/ui |
| `biome.json` | إعدادات Biome للـ Linting |
| `tsconfig*.json` | إعدادات TypeScript |
| `package.json` | التبعيات ونصوص التشغيل |
| `pnpm-lock.yaml` | قفل إصدارات التبعيات (pnpm) |
| `pnpm-workspace.yaml` | إعدادات مساحة عمل pnpm |
| `sgconfig.yml` | إعدادات أدوات البحث |
| `.rules/` | قواعد التحقق من الجودة والأنماط |

### Documentation

| الملف | الوصف |
|-------|-------|
| `README.md` | دليل المشروع الرئيسي |
| `docs/prd.md` | وثيقة متطلبات المنتج (PRD) |
| `docs/SOURCE_INVENTORY.md` | هذا الملف |
| `OFFLINE_MODE.md` | توثيق وضع العمل بدون إنترنت |
| `OFFLINE_MODE_README.md` | دليل إضافي للعمل بدون إنترنت |
| `TODO.md` | قائمة المهام الداخلية (قابلة للتحديث) |

---

## إحصائيات الملفات

```text
ملفات Git المُتتبعة بعد التنظيف: ~200 ملف
- src/ : ~130 ملف TypeScript/TSX/CSS
- supabase/functions/ : ~20 Edge Function
- supabase/migrations/ : 45 ملف SQL
- public/ : أصول ثابتة
- docs/ : 3 ملفات توثيق
- config files : ~15 ملف
```

---

## الملفات المستثناة

| الملف/المجلد | السبب |
|-------------|-------|
| `.env` | يحتوي على مفاتيح Supabase والـ Anon Key — Secret |
| `.env.*` | نسخ البيئة المحلية — Secret |
| `.deploy_key` / `.deploy_key.pub` | مفتاح SSH للنشر — Private Key / Public Key |
| `.skills/` | مهارات النظام المدمجة، ليست Source Code للمشروع |
| `.sync/` | بيانات مزامنة داخلية، ليست Source Code |
| `history/*.json` | بيانات سجل المحادثات/التشغيل |
| `historical_context.txt` | سجل المحادثات والتشغيل، ليس Source Code |
| `lint_final_txt` | مخرجات تشغيل سابقة |
| `node_modules/` | تبعيات قابلة لإعادة التثبيت |
| `dist/` / `dist-ssr/` | مخرجات البناء |
| `*.log` | ملفات السجلات |
| `package-lock.json` | نستخدم `pnpm-lock.yaml` |

---

## Environment Variables المطلوبة

```text
# الواجهة الأمامية
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

# Edge Functions
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
PASSWORD_ENCRYPTION_KEY
INTEGRATIONS_API_KEY
```

انظر `.env.example` للقالب الكامل.

---

## External Services

| الخدمة | الاستخدام |
|--------|-----------|
| Supabase (PostgreSQL + Auth + Storage + Realtime) | قاعدة البيانات، المصادقة، التخزين، التحديثات الفورية |
| Supabase Edge Functions | Backend Logic (Deno/TypeScript) |
| Cloudflare Workers (اختياري) | وسيط (Proxy) بين التطبيق وSupabase |

---

## Runtime Data موجودة في البيئة وليست Source Code

- `historical_context.txt` — سجل المحادثات والتشغيل.
- `.sync/` — بيانات مزامنة داخلية.
- `history/*.json` — سجلات الأحداث.
- `lint_final_txt` — مخرجات Linting سابقة.

---

## مكونات مفقودة حالياً

- **Docker / docker-compose:** لا يوجد. التطبيق يُبنى كـ Static Site ويُستضاف على Vercel/Netlify/Cloudflare Pages أو VPS.
- **Workers / Background Jobs / Queues:** لا يوجد. العمليات الثقيلة تتم عبر Supabase Edge Functions.
- **Tests:** لا يوجد دليل `tests/` أو `__tests__`. المشروع يعتمد على Lint و Typecheck.
- **Database Seeders:** لا يوجد ملفات Seeder منفصلة. البيانات الأولية تُدار عبر Migrations ولوحة الإدارة.
- **CI/CD:** لا يوجد ملفات GitHub Actions أو غيرها.

---

## ملاحظات أمنية

- تمت إزالة `.env` و `historical_context.txt` و `lint_final_txt` من تاريخ Git بالكامل قبل النشر.
- لا توجد مفاتيح خاصة أو Sessions أو Tokens في Source Code المرفوع.
- الـ Edge Functions تستخدم `Deno.env.get(...)` لقراءة الـ Secrets.
- الواجهة الأمامية تستخدم `import.meta.env.VITE_*`.

---

## إعادة البناء

1. `pnpm install`
2. نسخ `.env.example` إلى `.env` وملء القيم
3. `npm run lint` (Typecheck + Biome + Tailwind + Build Test)
4. للبناء الحقيقي: `npx vite build` (غير مفعّل في `package.json` افتراضياً)
