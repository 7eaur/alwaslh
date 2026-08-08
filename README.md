# الوسيلة الذكية (Alwaseela Smart)

تطبيق ويب تعليمي (PWA) لإدارة المحتوى الدراسي وتوزيع الدروس على الطلاب عبر نظام أكواد آمن، مع دعم الذكاء الاصطناعي لتحليل المحتوى وتوليد الأسئلة والاختبارات التفاعلية.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React + TypeScript + Vite + Tailwind CSS + shadcn/ui       │
│  PWA with offline caching (IndexedDB + localStorage)        │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │   Supabase   │ │   Supabase   │ │  Cloudflare  │
   │   PostgreSQL │ │ Edge Functions│ │   Worker     │
   │   Auth       │ │   (Deno/TS)  │ │  (Proxy)     │
   │   Storage    │ │               │ │  (Optional)  │
   │   Realtime   │ │               │ │               │
   └──────────────┘ └──────────────┘ └──────────────┘
```

### Frontend

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 3.4 + shadcn/ui
- **Routing:** React Router v7
- **State Management:** React Context + Hooks
- **PWA:** Vite Plugin PWA + Workbox
- **Storage Offline:** IndexedDB (Dexie) + localStorage
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion (motion)

### Backend

- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Serverless Functions:** Supabase Edge Functions (Deno)
- **Storage:** Supabase Storage
- **Realtime:** Supabase Realtime subscriptions
- **Migrations:** 45 SQL migration files في `supabase/migrations/`
- **Secrets:** `PASSWORD_ENCRYPTION_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `INTEGRATIONS_API_KEY`

---

## Project Directory

```
├── README.md                    # هذا الملف
├── .env.example                 # قالب متغيرات البيئة
├── package.json                 # التبعيات ونصوص التشغيل
├── pnpm-lock.yaml               # قفل إصدارات التبعيات
├── pnpm-workspace.yaml          # إعدادات مساحة عمل pnpm
├── index.html                   # نقطة الدخول HTML
├── vite.config.ts              # إعدادات Vite
├── vite.config.dev.ts          # إعدادات Vite للتطوير
├── tailwind.config.js          # إعدادات Tailwind
├── postcss.config.js           # إعدادات PostCSS
├── biome.json                  # إعدادات Biome
├── components.json             # إعدادات shadcn/ui
├── tsconfig*.json              # إعدادات TypeScript
├── public/                     # الأصول الثابتة
├── src/                        # كود الواجهة الأمامية
│   ├── components/             # المكونات
│   ├── context/ / contexts/    # Providers
│   ├── db/                     # API + Supabase client
│   ├── hooks/                  # Hooks مخصصة
│   ├── lib/                    # أدوات مساعدة
│   ├── pages/                  # الصفحات
│   ├── App.tsx
│   ├── main.tsx
│   ├── routes.tsx
│   └── index.css
├── supabase/                   # Backend
│   ├── functions/              # Edge Functions
│   ├── migrations/             # SQL Migrations
│   ├── secrets/required.json   # أسماء Secrets المطلوبة
│   └── config.toml
├── tasks/                      # سكربتات ومهام إضافية
│   └── cloudflare-worker/
├── docs/                       # التوثيق
│   ├── prd.md
│   └── SOURCE_INVENTORY.md
└── .rules/                     # قواعد التحقق من الجودة
```

---

## Requirements

- Node.js 18+ (يفضل 20 LTS)
- pnpm 8+
- حساب Supabase (مشروع فعّال)

---

## Installation

```bash
# استنساخ المستودع
git clone git@github.com:7eaur/alwaslh.git
cd alwaslh

# تثبيت التبعيات
pnpm install

# إعداد متغيرات البيئة
cp .env.example .env
# عدّل .env بقيم مشروع Supabase الخاص بك
```

---

## Environment Variables

انظر `.env.example` للقالب الكامل.

```text
# الواجهة الأمامية
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Edge Functions
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PASSWORD_ENCRYPTION_KEY=your-encryption-key
INTEGRATIONS_API_KEY=your-integrations-api-key
```

---

## Database

### Migrations

مigrations موجودة في `supabase/migrations/`. قم بتطبيقها عبر Supabase CLI أو لوحة التحكم:

```bash
supabase db reset
# أو
supabase migrations up
```

### Seeds

لا توجد ملفات Seeder منفصلة حالياً. البيانات الأولية تُدخل عبر لوحة الإدارة أو Migrations.

---

## Workers

لا يوجد Workers/Queues منفصلة. العمليات الثقيلة (مثل تحليل الدرس وتوليد الأسئلة) تتم عبر Supabase Edge Functions.

---

## Docker

لا يوجد `Dockerfile` أو `docker-compose.yml` حالياً. التطبيق مصمم ليبنى كـ Static Site ويُستضاف على:

- Vercel
- Netlify
- Cloudflare Pages
- VPS + Nginx

---

## Tests

لا يوجد دليل `tests/` منفصل. يُنصح بإضافة اختبارات مع:

```bash
vitest
# أو
jest
```

---

## Lint

```bash
npm run lint
```

يقوم بـ:

- TypeScript type check (`tsgo -p tsconfig.check.json`)
- Biome linting
- Tailwind CSS compilation check
- Build sanity check (`.rules/testBuild.sh`)

## Typecheck

```bash
npx tsgo -p tsconfig.check.json
# أو
npx tsc --noEmit
```

## Build

```bash
# ملاحظة: package.json لا يحتوي على build script فعّال
# يمكنك البناء مباشرة عبر:
npx vite build
```

## Deployment

### Frontend (Static Hosting)

```bash
npx vite build
# ارفع مجلد dist/ على خادمك الثابت
```

### Backend (Supabase)

```bash
supabase functions deploy
supabase db push
```

---

## Documentation

- `docs/prd.md` — متطلبات المنتج
- `docs/SOURCE_INVENTORY.md` — جرد الملفات والمكونات
- `OFFLINE_MODE.md` — العمل بدون إنترنت
- `OFFLINE_MODE_README.md` — دليل إضافي للأوفلاين

---

## Security Notes

- لا تُرفع `.env` أو `.deploy_key`.
- الـ Edge Functions تستخدم `Deno.env.get(...)` لقراءة Secrets.
- الواجهة الأمامية تستخدم `import.meta.env.VITE_*` فقط.
- لا توجد بيانات طلاب أو Sessions أو Tokens في Source Code.

---

## Development Guidelines

### How to edit code locally?

You can choose [VSCode](https://code.visualstudio.com/Download) or any IDE you prefer. The only requirement is to have Node.js and npm installed.

### Environment Requirements

```
# Node.js ≥ 20
# npm ≥ 10
Example:
# node -v   # v20.18.3
# npm -v    # 10.8.2
```

### Installing Node.js on Windows

```
# Step 1: Visit the Node.js official website: https://nodejs.org/, click download. The website will automatically suggest a suitable version (32-bit or 64-bit) for your system.
# Step 2: Run the installer: Double-click the downloaded installer to run it.
# Step 3: Complete the installation: Follow the installation wizard to complete the process.
# Step 4: Verify installation: Open Command Prompt (cmd) or your IDE terminal, and type `node -v` and `npm -v` to check if Node.js and npm are installed correctly.
```

### Installing Node.js on macOS

```
# Step 1: Using Homebrew (Recommended method): Open Terminal. Type the command `brew install node` and press Enter. If Homebrew is not installed, you need to install it first by running the following command in Terminal:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
Alternatively, use the official installer: Visit the Node.js official website. Download the macOS .pkg installer. Open the downloaded .pkg file and follow the prompts to complete the installation.
# Step 2: Verify installation: Open Command Prompt (cmd) or your IDE terminal, and type `node -v` and `npm -v` to check if Node.js and npm are installed correctly.
```

### After installation, follow these steps:

```
# Step 1: Download the code package
# Step 2: Extract the code package
# Step 3: Open the code package with your IDE and navigate into the code directory
# Step 4: In the IDE terminal, run the command to install dependencies: npm i
# Step 5: In the IDE terminal, run the command to start the development server: npm run dev -- --host 127.0.0.1
# Step 6: if step 5 failed, try this command to start the development server: npx vite --host 127.0.0.1
```

### How to develop backend services?

Configure environment variables and install relevant dependencies.If you need to use a database, please use the official version of Supabase.

## Learn More

You can also check the help documentation: Download and Building the app（ [https://intl.cloud.baidu.com/en/doc/MIAODA/s/download-and-building-the-app-en](https://intl.cloud.baidu.com/en/doc/MIAODA/s/download-and-building-the-app-en)）to learn more detailed content.
