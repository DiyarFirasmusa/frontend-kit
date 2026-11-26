# دليل القالب الكامل (موقع + لوحة إدارة)

هذا قالب لمشروع واحد فيه جزءان:

1. **الموقع العام**: صفحة رئيسية، من نحن، خدماتنا، أخبار، وصفحة تواصل فيها فورم. يُرسم على السيرفر (SSR) حتى يقرأه Google، وفيه SEO وحماية كاملة.
2. **لوحة الإدارة (admin)**: صفحة دخول، ثم إطار فيه قائمة جانبية وشريط علوي، وفيه ثلاث صفحات: نظرة عامة، الموردون (جدول كامل: بحث، فلتر، صفحات، إضافة، تعديل، حذف)، والإعدادات (فورم الملف الشخصي).

الجزءان في مشروع TanStack Start واحد، بأمر تشغيل واحد، وبنظام تصميم واحد (نفس الألوان والخطوط والمسافات).
اللغة جزء من الرابط في الجزأين: `/ar/...` و `/en/...`، ولوحة الإدارة على `/ar/admin` و `/en/admin`.

كل المحتوى تجريبي لشركة وهمية ("شركة المثال" / "Example Company")، وبيانات الموردين وهمية أيضاً.

## قبل أن تبدأ

- تحتاج **Node 24 أو أحدث** (`node -v`). الملف `.npmrc` فيه `engine-strict=true`، فالنسخة الأقدم توقف `npm install`.
- لا تحتاج أي حساب أو باكند لتشغيل المشروع على جهازك: لوحة الإدارة تعمل على **API وهمي داخل المتصفح** (MSW).

## التشغيل

```text
npm install
npm run setup:env        # مرة واحدة: ينسخ .env.example إلى .env.local
npm run dev              # http://localhost:5190  (الموقع)  و  http://localhost:5190/ar/admin  (الإدارة)
```

**الدخول إلى لوحة الإدارة**: أي اسم مستخدم وأي كلمة مرور تعمل في الوضع الوهمي.
اسم المستخدم `viewer` يدخل بصلاحية **قراءة فقط**: يرى الموردين ولا تظهر له أزرار الإضافة والتعديل والحذف. هكذا ترى نظام الصلاحيات يعمل.

أوامر أخرى:

```text
npm run build            # نسخة الإنتاج في .output/
npm start                # يشغّل نسخة الإنتاج على المنفذ 3000
npm run tokens           # يولّد ملفات الألوان من src/style/tokens (بعد أي تغيير في الألوان أو المسافات)
npm run check            # الأنواع، اللنت، التنسيق، الترجمة، المتغيرات، CSS، الأدوات، اختبارات الوحدة
npm run e2e:install      # مرة واحدة: متصفح Chromium للاختبارات
npm run test:e2e         # يبني المشروع ويختبره في متصفح حقيقي (المنفذ 5191، أو E2E_PORT=5401 مثلاً)
npm run check:full       # check ثم build ثم test:e2e
```

## المتغيرات (ملف `.env.local`)

كل المتغيرات مشروحة في `.env.example`. الملف `.env.local` لجهازك فقط ولا يُرفع إلى git.

| المتغير | ماذا يفعل |
| --- | --- |
| `VITE_SITE_URL` | عنوان الموقع بدون `/` في الآخر. منه روابط canonical والـsitemap. مطلوب للبناء. |
| `VITE_ALLOW_INDEXING` | `true` فقط للموقع الحقيقي. غير ذلك كل الصفحات `noindex`. |
| `VITE_ADMIN_API_URL` | عنوان الـAPI الذي تكلمه لوحة الإدارة: مسار على نفس الموقع (`/api`) أو عنوان كامل (`https://api.example.com`). إذا كان على نطاق آخر يُضاف تلقائياً إلى CSP. |
| `VITE_ADMIN_API_MOCK` | `true` = API وهمي داخل المتصفح (أي دخول يعمل، والبيانات تعود لأصلها عند تحديث الصفحة). للتطوير والعرض والاختبارات فقط. `false` (الافتراضي) للباكند الحقيقي، وعندها لا يدخل كود MSW في البناء أصلاً. |
| `CSP_MODE` | `enforce` (الافتراضي) أو `report-only` لأول نشر. |
| `CONTACT_WEBHOOK_URL` | العنوان الذي يستقبل رسائل فورم التواصل. مطلوب على الموقع الحقيقي. |

ما يبدأ بـ`VITE_` يصل للمتصفح، فلا تضع فيه سراً.

## المجلدات

```text
fullstack/
├── src/
│   ├── routes/                       → ملف رفيع لكل صفحة (يربط الرابط بالميزة فقط)
│   │   ├── __root.tsx                → <html lang dir>، الستايل، الخطوط، noindex لصفحات الإدارة
│   │   ├── $locale.tsx  $locale/     → الموقع العام: /ar و /en وكل صفحاته
│   │   └── $locale_/admin.tsx  $locale_/admin/   → لوحة الإدارة (انظر "كيف يعمل الرابط" تحت)
│   │       ├── login.tsx             → /ar/admin/login
│   │       ├── _shell.tsx            → الإطار (قائمة + شريط) وحارس الدخول، بدون أن يظهر في الرابط
│   │       └── _shell/               → index (نظرة عامة)، suppliers، settings، forbidden
│   ├── features/
│   │   ├── site/                     → الموقع العام فقط
│   │   │   ├── home/ about/ services/ news/ contact/   → صفحة لكل مجلد: index.tsx، <اسم>-head.ts، locales/
│   │   │   ├── layout/               → الهيدر والفوتر
│   │   │   ├── components/           → بطاقة المقال، رأس الصفحة
│   │   │   ├── config/nav.config.ts  → قائمة الصفحات: منها الهيدر والفوتر والـsitemap
│   │   │   ├── i18n/resources.ts     → نصوص الموقع
│   │   │   └── seo/                  → ما يدخل في الـsitemap
│   │   └── admin/                    → لوحة الإدارة فقط
│   │       ├── auth/                 → صفحة الدخول
│   │       ├── overview/             → النظرة العامة (بطاقات أرقام + آخر التعديلات)
│   │       ├── suppliers/            → الموردون (الميزة الكاملة: مثال لأي جدول تضيفه)
│   │       ├── settings/             → الملف الشخصي
│   │       ├── layout/               → الإطار، القائمة الجانبية، قائمة الموبايل، قائمة الحساب
│   │       ├── api/                  → عميل axios، العناوين، مفاتيح TanStack Query، رسائل الأخطاء
│   │       ├── store/                → الجلسة والصلاحيات (Zustand)
│   │       ├── guards/               → حراس الصفحات (دخول، صلاحية)
│   │       ├── components/can.tsx    → <Can> لإخفاء الأزرار حسب الصلاحية
│   │       ├── constants/permissions.ts → كل الصلاحيات
│   │       ├── mocks/                → الـAPI الوهمي (MSW): البيانات والردود
│   │       ├── i18n/                 → تحميل نصوص الإدارة عند فتحها فقط
│   │       └── types/api.ts          → شكل البيانات بين الواجهة والباكند
│   ├── components/                   → مكونات مشتركة يستعملها الجزءان
│   │   ├── ui/                       → زر، حوار، قائمة منسدلة، حقل، جدول، Sheet، Toaster، أيقونات...
│   │   ├── table/                    → DataTable، الترقيم، شريط البحث والفلاتر
│   │   ├── dialog/  fields/          → حوار فورم، حوار تأكيد، حقول react-hook-form
│   │   ├── common/                   → زر اللغة، زر الثيم، Container، Picture، صفحة 404 والخطأ
│   │   └── locales/                  → نصوص هذه المكونات (مجموعة ui)
│   ├── shared/                       → كود مشترك بلا واجهة: المتغيرات، اللغات، SEO، هيدرز الأمان، stores، دوال
│   ├── style/                        → نظام التصميم (تحت)
│   ├── config/site.config.ts         → اسم الشركة، البريد، الهاتف
│   ├── router.tsx  start.ts          → إعداد الراوتر، وما يمر عليه كل طلب (CSRF، الهيدرز، noindex للإدارة)
│   └── test/                         → إعداد الاختبارات، MSW للاختبارات، render مع المزوّدات
├── e2e/                              → raw/ (رد السيرفر الخام) و ui/ (المتصفح، ومنها admin.spec.ts)
├── public/                           → الصور، الأيقونة، mockServiceWorker.js (للـAPI الوهمي)
├── scripts/                          → توليد الألوان، فحص الترجمة والمتغيرات وCSS، سيرفر e2e
├── deploy/nginx/  Dockerfile  docker-compose.yml
└── .env.example
```

### الحدود بين الأجزاء (قاعدة لنت تفرضها)

- `features/site` لا يستورد من `features/admin`، والعكس.
- `components` و `shared` و `style` و `config` لا تستورد من أي `features` أو `routes`.
- إذا احتاج الجزءان نفس الشيء، انقله إلى `components` (إذا كان واجهة) أو `shared` (إذا لم يكن).
- `axios` يُستورد فقط داخل `features/admin/api`.

`npm run lint:check` يفشل إذا كُسرت قاعدة من هذه.

### كيف يعمل رابط الإدارة

`$locale_` (بشرطة سفلية في الآخر) يعني: الرابط يبدأ باللغة (`/ar/admin`) لكن الصفحة **لا تدخل** داخل قالب الموقع (الهيدر والفوتر). لوحة الإدارة لها قالبها الخاص.

لوحة الإدارة تُرسم في المتصفح فقط (`ssr: false`): لا تحتاج Google ولا HTML من السيرفر، والجلسة في المتصفح. السيرفر يرسل لها:

- `X-Robots-Tag: noindex, nofollow` و `<meta name="robots" content="noindex, nofollow">` دائماً، حتى على الموقع الحقيقي.
- نفس هيدرز الأمان ونفس CSP الصارم للموقع.
- لا تظهر في الـsitemap، ولا تُمنع في robots.txt (المنع يخفي الـnoindex عن Google).

## نظام تصميم واحد للجزأين

المصدر الوحيد للألوان والمسافات والخطوط ملفات TypeScript في `src/style/tokens/`:

```text
src/style/
├── tokens/
│   ├── presets/neutral.ts   → ألوان الثيم الافتراضي (فاتح وداكن). ocean.ts ثيم ثانٍ لإثبات التبديل
│   ├── status.ts            → ألوان النجاح والتحذير والخطأ والوسوم (نفسها لكل الثيمات)
│   ├── foundation.ts        → الخطوط، المسافات بأسماء أدوار، عرض المحتوى، الزوايا، الظلال، الحركة، سلّم الخط
│   ├── generate-css.ts      → يكتب theme.css و preset.css
│   ├── contrast.test.ts     → يفحص تباين WCAG لكل ثيم فاتح وداكن (4.5:1 للنص، 3:1 لحلقة التركيز وحدود الحقول)
│   └── tokens.test.ts       → يتأكد أن الملفين المولّدين مطابقان للمصدر
├── theme.css  preset.css    → مولّدان: لا تعدّلهما بيدك، شغّل npm run tokens
├── styles.css               → الملف الوحيد الذي تحمّله الصفحات: القاعدة، حلقة التركيز، تقليل الحركة
└── button.css input.css select.css badge.css pagination.css actions.css → مكونات الإدارة
```

- **الموقع والإدارة يستعملان نفس الأسماء**: `bg-background`، `bg-surface`، `text-text-primary`، `text-text-muted`، `border-stroke`، `bg-primary` مع `text-primary-foreground`، `text-primary-text` للنص الملوّن.
- **الثيم الداكن** يتبع النظام بدون أي JavaScript (CSS فقط). إذا اختار الزائر ثيماً من الزر يُحفظ ويُطبَّق قبل أول رسم عبر سكربت صغير في `__root.tsx` (مع nonce، فـCSP يبقى صارماً). نفس الزر في الموقع والإدارة.
- **الخط**: العربي Cairo (محلي، بدون CDN)، والإنجليزي خط النظام، والاختيار تلقائي حسب `<html lang>`.
- **اتجاه منطقي فقط**: `ms-` `me-` `ps-` `pe-` `start-` `end-`. `npm run check:css` يفشل على `ml-` أو `left`.
- **حلقة التركيز** قاعدة واحدة بلون `--primary-highlight`، و**تقليل الحركة** قاعدة واحدة تلغي كل الحركات لمن يطلبها.
- **لون جديد للهوية**: انسخ `presets/neutral.ts`، غيّر عائلة `primary-*`، أضفه في `presets/index.ts`، ثم `npm run tokens` و `npm run test` (اختبار التباين يرفض أي لون ضعيف). غيّر `themeColor` في `site.config.ts` معه.

## الصلاحيات

- كل الصلاحيات في `features/admin/constants/permissions.ts` بشكل `supplier:read`.
- الصفحة تُحمى في ملف الراوت: `requirePermission(locale, PERMS.supplier.read)`. بدونها يذهب المستخدم لصفحة "لا صلاحية".
- الزر يُخفى بـ`<Can permission={PERMS.supplier.write}>`، أو `useCan(...)` في الكود.
- الدور `admin` يمر من كل الفحوص. الإخفاء في الواجهة مجاملة فقط: **الباكند هو من يقرر**.

## كيف تضيف صفحة للموقع

مثال: "الأسئلة الشائعة" على `/ar/faq`.

1. أنشئ `src/features/site/faq/` وفيه `index.tsx` و `faq-head.ts` (انسخ `about/about-head.ts`) و `locales/ar.json` و `locales/en.json` بمجموعة واحدة `{ "faq": { ... } }`.
2. سجّل ملفي اللغة في `src/features/site/i18n/resources.ts`.
3. أنشئ `src/routes/$locale/faq.tsx` (انسخ `about.tsx`).
4. شغّل `npm run dev` مرة: يتحدث `routeTree.gen.ts` وحده.
5. لتظهر في القائمة والفوتر والـsitemap: سطر في `src/features/site/config/nav.config.ts` ومفتاح `nav.faq` في `src/shared/locales/`.
6. أضفها إلى `PAGES` في `e2e/fixtures/app.ts`، ثم `npm run check` و `npm run test:e2e`.

## كيف تضيف كياناً للإدارة (مثل الموردين)

مثال: "العملاء" على `/ar/admin/customers`. انسخ مجلد الموردين وغيّر الأسماء:

1. **الشكل**: أضف `Customer` و `CustomerRequest` في `features/admin/types/api.ts`.
2. **العناوين والمفاتيح**: `customers` في `api/endpoints.ts`، و `qk.customers` في `api/query-keys.ts`.
3. **الصلاحيات**: `customer: { read, write, delete }` في `constants/permissions.ts`.
4. **الميزة**: انسخ `features/admin/suppliers/` إلى `customers/` وغيّر: `validations.ts` (الحقول)، `customers.service.ts`، `use-customer-queries.ts`، `customer-columns.tsx`، `customer-form-dialog.tsx`، `use-customers-page.ts`، `index.tsx`، و `locales/` بمجموعة `customers`.
5. **النصوص**: سجّل ملفي اللغة في `features/admin/i18n/admin-resources.ts`.
6. **الصفحة**: انسخ `src/routes/$locale_/admin/_shell/suppliers.tsx` إلى `customers.tsx` (فيه `validateSearch` لحالة الجدول في الرابط، و `requirePermission`).
7. **القائمة**: سطر في `features/admin/layout/nav-config.ts`.
8. **الـAPI الوهمي** (اختياري، حتى تعمل الصفحة بدون باكند): بيانات في `mocks/seed.ts` و `mocks/db.ts`، وردود في `mocks/handlers.ts`.
9. **الاختبارات**: انسخ `validations.test.ts` و `index.test.tsx` من الموردين، وأضف حالة في `e2e/ui/admin.spec.ts`.
10. شغّل `npm run check` ثم `npm run test:e2e`.

حالة الجدول (البحث، الفلتر، رقم الصفحة) في الرابط: `?q=...&status=inactive&page=2`. يمكن مشاركته وتحديثه وزر الرجوع يعمل.

## ربط باكند حقيقي

1. `VITE_ADMIN_API_MOCK=false` و `VITE_ADMIN_API_URL=` عنوان الـAPI.
2. اجعل الباكند يرد بنفس الأشكال في `features/admin/types/api.ts` (أو عدّل الأنواع والخدمات).
3. الدخول: `POST /auth/login` يرد `{ accessToken, user, roles, permissions }`. الطلبات بعدها ترسل `Authorization: Bearer ...`. أي رد 401 ينهي الجلسة ويعيد لصفحة الدخول.
4. الجلسة محفوظة في `sessionStorage` (تنتهي بإغلاق التبويب). للأمان الأعلى اجعل الباكند يضع التوكن في كوكي `HttpOnly` واحذف `accessToken` من `store/auth-store.ts`.

## الاختبارات

| المجموعة | ماذا تفحص |
| --- | --- |
| اختبارات الوحدة (`npm run test`) | الدوال، الفورمات، التحقق، المكونات المشتركة، صفحة الموردين مع الـAPI الوهمي، عميل الـAPI، الحراس، التباين |
| `raw` | رد السيرفر الخام: SEO، sitemap، الهيدرز، ومنها: الإدارة `noindex` وليست في الـsitemap |
| `ar-desktop` `en-desktop` `ar-phone` `en-phone` `ar-dark` `en-dark` | صفحات الموقع، و: الدخول ← النظرة العامة، إضافة/بحث/تعديل/حذف مورد، الفلتر والصفحات في الرابط، مستخدم القراءة فقط، الإعدادات، الخروج، قائمة الموبايل، axe لصفحات الإدارة |
| `perf-ar-phone` `perf-en-desktop` | أن صفحات الموقع لا تقفز أثناء التحميل |

الاختبارات تفشل على أي خطأ في الكونسول (ومنها مخالفات CSP)، وتقرأ النصوص من ملفات الترجمة.

## ملاحظات

- الـToaster (رسائل "تم الحفظ") مكتوب داخل المشروع وليس مكتبة: مكتبات الـtoast المعروفة تضيف `<style>` وقت التشغيل، وCSP الصارم يمنعه.
- `public/mockServiceWorker.js` من حزمة msw ويُنشر مع الموقع، لكنه لا يعمل إلا إذا بُني المشروع بـ`VITE_ADMIN_API_MOCK=true`. يمكنك حذفه من نسخة الإنتاج.
- oxlint و oxfmt يتجاهلان المشروع إذا كان مجلده داخل مجلد مستبعد في `.gitignore` لمستودع أب. داخل مستودعك الخاص يعملان عادي.

## استبدال الشركة التجريبية بشركتك

- `src/config/site.config.ts`: الاسم، البريد، الهاتف، لون الثيم.
- ملفات `locales/*.json`: كل النصوص.
- `src/features/site/news/data/articles.ts`: المقالات.
- `public/favicon.svg` و `public/images/` و `public/og-default.png` و `public/site.webmanifest`.
- `src/style/tokens/presets/`: الألوان (ثم `npm run tokens`).
