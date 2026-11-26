# هيكل مشروع الداشبورد (Dashboard Starter)

نقطة بداية لداشبورد إداري: React 19 + Vite، عربي (من اليمين لليسار) وإنجليزي، فاتح وداكن.
فيه خمس صفحات تجريبية (والتصنيفات لها تبويب ثاني بمسار خاص) تشتغل على داتا وهمية بالمتصفح، فتشتغل بدون باكند.

التشغيل: `npm install` ثم `npm run dev`، وبعدها `http://localhost:3000`.
تسجيل الدخول يقبل أي اسم وكلمة مرور (لأن `VITE_USE_MOCK="true"` بملف `.env.development`).

**للربط بباكند حقيقي:** بالتطوير Vite يقدّم `.env.development` على `.env` و`.env.local`، فضع قيمك بملف
`.env.development.local` (يغلب الكل ومتجاهَل بـgit): `VITE_USE_MOCK="false"` و`VITE_API_BASE_URL` و`VITE_AUTH_REFRESH="cookie"`.
للبناء: `.env.production.local` أو متغيرات CI. (تحققنا من الترتيب بـ`loadEnv` نفسه.)

**من جهاز ثاني (شبكة محلية أو VPN):** الداتا الوهمية تحتاج service worker، والمتصفح يسمح به فقط على `localhost` أو `https`.
على `http` بعنوان ثاني تطلع صفحة تشرح السبب بدل صفحة فاضية.

## الصفحات الخمس

| الصفحة       | المسار                                     | فيها                                                                                                                |
| ------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| الرئيسية     | `/`                                        | أربع بطاقات (مستودعات، موردون، تصنيفات، وحدات) برسم صغير، رسم النشاط خلال 30 يوماً، آخر التغييرات                   |
| المستودعات   | `/warehouses` و `/warehouses/$warehouseId` | جدول بفلاتر وبحث وتصدير Excel، إضافة وتعديل وحذف، صفحة تفاصيل بتبويبات (نظرة عامة، المواقع، الأعضاء، سجل التغييرات) |
| الموردون     | `/suppliers`                               | **الكيان المرجعي**: ترقيم وترتيب من السيرفر، الفلاتر بالرابط، فورم إضافة وتعديل، حذف بتأكيد، صلاحيات                |
| التصنيفات    | `/categories`                              | شجرة تصنيفات بثلاث مستويات، خصائص مرتبطة وموروثة                                                                    |
| الخصائص      | `/attributes`                              | التبويب الثاني لنفس ميزة التصنيفات: تعريف الخصائص وخياراتها بترتيب (له مسار وعنصر بالقائمة)                         |
| وحدات القياس | `/units-of-measure`                        | جدول بفلاتر وفورم وحذف                                                                                              |

وبالإضافة لها: تسجيل الدخول، وصفحات الأخطاء 401 و403 و404 و500.

## الستاك

| الجزء            | الأداة                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| الإطار           | React 19 + Vite 8 (SPA) + TypeScript strict                                                         |
| التوجيه          | TanStack Router (مسارات ملفات، `routeTree.gen.ts` مولّد)                                            |
| بيانات السيرفر   | TanStack Query 5 + axios (`queryClient` واحد بـ`src/lib/query-client.ts`، يمر للراوتر كـcontext)    |
| الجداول          | TanStack Table 9 (`DataTable`: الترقيم والترتيب من السيرفر والحالة بالرابط)                         |
| حالة العميل      | Zustand 5                                                                                           |
| الفورمات         | react-hook-form + zod 4                                                                             |
| الواجهة          | Tailwind CSS 4 + Base UI + أيقونات Hugeicons + sonner                                               |
| الرسوم           | Recharts                                                                                            |
| اللغات           | i18next، القائمة كلها بملف واحد: `src/lib/i18n/languages.ts`                                        |
| الخطوط           | Cairo و IBM Plex Sans و IBM Plex Sans Arabic و IBM Plex Mono، محلية من حزم `@fontsource` (بدون CDN) |
| الداتا التجريبية | MSW 2 (`src/mocks/`): نفس الـhandlers للمتصفح واختبارات الوحدة وPlaywright                          |
| المراقبة         | Sentry (يشتغل فقط لما يكون `VITE_SENTRY_DSN` موجود)                                                 |

## الأوامر

| الغرض                                               | الأمر                                                      |
| --------------------------------------------------- | ---------------------------------------------------------- |
| تشغيل                                               | `npm run dev`                                              |
| فحص الأنواع                                         | `npm run typecheck`                                        |
| اللنت (يفشل حتى على التحذيرات)                      | `npm run lint:check` ، والإصلاح `npm run lint`             |
| التنسيق                                             | `npm run fmt:check` ، والكتابة `npm run fmt`               |
| الاختبارات                                          | `npm run test`                                             |
| اختبارات المتصفح (عربي وإنجليزي × فاتح وداكن + axe) | `npm run test:e2e` (مرة واحدة قبلها `npm run e2e:install`) |
| توليد ملفات الألوان                                 | `npm run tokens`                                           |
| توليد أيقونات PNG من `public/icon.svg`              | `npm run icons`                                            |
| مقارنة مفاتيح الترجمة بين اللغات                    | `npm run i18n:validate`                                    |
| كل الفحوصات                                         | `npm run check`                                            |

كل الأوامر تشتغل على ويندوز ولينكس وماك، بدون `bun` ولا `NODE_ENV=` بالسكربتات.

## الستايل: ثلاثة ملفات فقط

```text
src/style/
├── tokens/                  → المصدر الوحيد للتصميم (TypeScript)
│   ├── presets/neutral.ts   → ألوان الثيم الافتراضي (فاتح وداكن). الثاني ocean.ts لإثبات التبديل
│   ├── status.ts            → ألوان الحالات والوسوم، نفسها لكل الثيمات
│   ├── foundation.ts        → كل شي غير الألوان: الخطوط، المسافات بأسماء أدوار، الزوايا، الظلال، الحركة، الكثافة، سلّم الخط
│   ├── generate-css.ts      → يكتب الملفين الجاهزين
│   ├── contrast.test.ts     → يفحص التباين WCAG لكل ثيم × فاتح وداكن (4.5:1 للنص، 3:1 لحلقة التركيز)
│   └── tokens.test.ts       → يتأكد إن الملفين المولّدين مطابقين للمصدر
├── theme.css                → مولّد: خريطة Tailwind، المسافات، الزوايا، الظلال، الحركة، الكثافة، سلّم الخط
├── preset.css               → مولّد: الألوان لكل ثيم عبر data-preset ولكل وضع (فاتح و .dark)
├── styles.css               → بيدي: القاعدة، حلقة التركيز العامة، تقليل الحركة، تبديل الثيم باللغة، ستايل مشترك
└── button.css input.css select.css badge.css tabs.css ...   → عائلات المكونات المتكررة
```

- **لا تعدّل `theme.css` ولا `preset.css` بيدك.** غيّر ملفات `tokens/` وشغّل `npm run tokens`. الاختبار يفشل إذا اختلفوا.
- **ثيم جديد**: انسخ `presets/neutral.ts`، غيّر عائلة `primary-*`، أضفه لـ `presets/index.ts`، شغّل `npm run tokens` و `npm run test`.
- **لون الهوية**: `brand` (`bg-brand` و`text-brand-text` و`bg-brand-tint`) لكل ثيم، للشعار والمسار والرسوم. ألوان الحالات (`warning` ...) للمعنى فقط.
- **سلّم الخط كمتغيرات**: `--font-b2` وأخواتها، وملفات CSS المكونات تستخدم `font: var(--font-b2)` بدل أرقام منسوخة.
- **قاعدة اللون**: `primary` لون تعبئة فقط. للنص استخدم `text-primary-text`. اختبار `conventions.test.ts` يمنع `text-primary` وأي لون hex داخل المكونات.
- **اتجاه واحد منطقي**: `ms-` و `me-` و `ps-` و `pe-` و `start-` و `end-`. ممنوع `ml-` و `mr-` و `left-` و `right-` (نفس الاختبار).
- **حلقة التركيز**: قاعدة واحدة عامة بـ `styles.css` باللون `--primary-highlight` (3:1 على كل الأسطح).
- **تقليل الحركة**: قاعدة عامة تلغي الحركة والانتقالات (وكلاسات `tw-animate-css`) لمن يطلبها بالنظام.
- **بدون وميض عند التحميل**: السكربت `public/theme-init.js` يُحمَّل من `<head>` قبل أول رسم، ويضبط `dark` و `data-preset` و `data-density` و `lang` و `dir`.
  اختار ملف خارجي مو سكربت داخل الصفحة حتى يبقى `script-src 'self'` شغّال.
- **وضع الثيم**: `light` أو `dark` أو `system` (الافتراضي `system`، يتبع النظام). الزر الجانبي يحفظ الاختيار الصريح فقط.
- **الكثافة**: `data-density="compact"` على `<html>` يصغّر ارتفاع الأزرار والحقول (`--control-h*`).
- **`cn()`** يستخدم `twMerge` ومعه تعريف لكلاسات سلّم الخط (`text-h1` ...) حتى ما تضيع قبل `text-text-primary`.

## هيكل المجلدات

```text
dashboard-starter/
├── e2e/                         → اختبارات Playwright (fixtures/ فيها mock لكل صفحة)
├── public/                      → الأيقونات، theme-init.js، mockServiceWorker.js
├── scripts/                     → generate-tokens.ts، generate-icons.ts، validate-i18n.ts (كلها Node، بدون bun)
├── vite/                        → pwa.ts (اختياري)، pwa-register-stub.ts، vendor-chunks.ts
├── src/
│   ├── main.tsx  router.tsx  env.ts
│   ├── routes/                  → ملفات رفيعة: _auth/login، _app/ (كل صفحة تتحقق من الصلاحية)، (errors)/
│   ├── features/
│   │   ├── auth/                → الدخول
│   │   ├── fallback/            → صفحات الأخطاء والتحميل
│   │   └── dashboard/<x>/       → ميزة لكل مورد (الهيكل تحت)
│   ├── layout/                  → auth/ (قالب الدخول)، dashboard/sidebar و topbar
│   ├── components/
│   │   ├── ui/                  → button، dialog، select، tabs، sheet، chart، chart-tooltip، chart-legend ...
│   │   ├── table/               → DataTable (+ data-table-rows.ts للبحث والترتيب)، ترقيم، فلاتر، تصدير
│   │   ├── fields/  dialog/  shared/  wrapper/
│   │   └── auth/can.tsx         → <Can> و useCan و useCanAny
│   ├── api/                     → client/ (privateApi، publicApi)، core/، error/، auth/ (تجديد التوكن، أحداث الجلسة)
│   ├── constants/               → api.ts (العناوين)، query-keys.ts، permissions.ts، enums.ts، audit-entities.ts
│   ├── types/api/               → أنواع عقد الباكند (DTO) للصفحات الخمس
│   ├── hooks/ services/ store/ context/ guards/ lib/ utils/ validations/
│   ├── lib/theme.ts  lib/i18n/  → حالة الثيم، اللغات
│   ├── locales/                 → ar.json و en.json (النصوص العامة) + locales/ لكل ميزة
│   ├── style/                   → فوق
│   ├── modules/pwa/             → اختياري، مطفي افتراضياً
│   ├── mocks/                   → core.ts، seed/، handlers/ (واحد لكل ميزة)، index.ts: للمتصفح والاختبارات وPlaywright
│   └── test/                    → setup، render (مكوّن لوحده)، render-app (التطبيق الحقيقي على مسار)، MSW، fixtures
├── PERMISSIONS.md               → من يشوف ويسوي شنو (4 طبقات + جدول لكل صفحة)
└── .env.development             → عناوين وهمية + VITE_USE_MOCK=true (مرفوع بالمستودع، ما فيه أسرار)
```

كل ملف تحت 400 سطر (اللنت يفشل فوقها، والاختبارات 600). لا `any` ولا `@ts-ignore` ولا تعطيل لنت.

## هيكل الميزة الواحدة

**الموردون هم الكيان المرجعي**، مطابق لقواعد قالب الكيت (`routing.md` و`data-tables.md` و`forms-crud.md` و`api-layer.md` و`permissions.md`).
الشرح ملف بملف بـ `src/features/dashboard/README.md`. باختصار:

- **الرابط يملك حالة القائمة**: الصفحة وحجمها والترتيب والبحث والفلاتر بـ`validations/search.ts` (كل حقل له `.catch()` وقيمة افتراضية)،
  والقيم الافتراضية تنحذف من الرابط. لا `useState` للفلاتر ولا `useEffect` للمزامنة.
- **السيرفر يرقّم ويرتّب**: الرد بشكل Spring `{content, totalElements, totalPages, number, size}` (`src/types/api/page.ts`)،
  والخدمة تحوّل `page` من 1 إلى 0 و`name.asc` إلى `sort=name,asc` بدالة وحدة.
- **`queryOptions` مشتركة** بين الـloader (يبدأ الطلب ولا ينتظره) والهوك، ومع `signal` حتى ينلغي الطلب لما تتغير الصفحة.
- **جدول TanStack Table 9** (`src/components/table/data-table.tsx`): `manualPagination` و`manualSorting`، والأعمدة من `getXColumns`.
- **حوار واحد للإضافة والتعديل** بحالة وحدة `closed | create | edit(id)`، والتعديل يقرأ السجل من السيرفر بالـid، وأخطاء الحقول من الباكند
  (422 بشكل problem+json) تنزل تحت الحقل بـ`applyApiFieldErrors` (`src/api/error/field-errors.ts`).
- **الصلاحيات تفاعلية**: `useCan()` يرجّع `can` ويمر للدوال الصافية بـ`*-actions.ts`. فعل مسموح عموماً بس مرفوض لهالصف
  (مورد مستخدم بمستندات) يبقى ظاهر بـ`aria-disabled` مع السبب، والضغط عليه ما يرسل شي.

باقي الصفحات (المستودعات، التصنيفات، الوحدات) أقدم: قوائمها ترقّم بالمتصفح (`ClientDataTable`). تبقى مرجعاً لأشياء ما بالموردين
(صفحة تفاصيل بتبويبات، شجرة، مفاتيح داخل الجدول). انقلها لشكل الموردين لما تشتغل عليها.

## إضافة كيان جديد

مثال: كيان اسمه `customers`. **انسخ مجلد واحد وعدّل 11 ملف**:

1. انسخ `src/features/dashboard/suppliers/` إلى `src/features/dashboard/customers/` وبدّل الأسماء (`supplier` ← `customer`).
   عدّل الحقول حسب OpenAPI: `types/types.ts` و`validations/*` و`services/*` والأعمدة والحوار والترجمات.
2. `src/types/api/customers.ts`: أنواع الطلب والرد (أو ولّدها: `npx openapi-typescript docs/api/openapi.json -o src/types/api/schema.ts`).
3. `src/constants/api.ts`: العناوين.
4. `src/constants/query-keys.ts`: `qk.customers` (`all` و`lists` و`list(params)` و`detail(id)`).
5. `src/constants/permissions.ts`: `PERMS.customer` بالمفاتيح `view/create/update/delete` وقيم الباكند نفسها.
6. `src/routes/_app/customers/index.tsx`: انسخ ملف مسار الموردين (حارس + `validateSearch` + `loaderDeps` + `loader`).
7. `src/layout/dashboard/sidebar/config/nav-config.ts`: عنصر القائمة مع `permission`.
8. و 9. `src/locales/ar.json` و`en.json`: `nav.customers`.
9. `PERMISSIONS.md`: سطر بالجدول (اختبار `route-guards.test.ts` يفشل بدونه).
10. الداتا الوهمية: `src/mocks/handlers/customers.ts` (انسخ ملف الموردين؛ الجدول `seedTable(() => [...])` ممكن يكون بنفس الملف)
    وأضفه بـ`src/mocks/index.ts`. إذا الباكند جاهز تقدر تتخطى هالخطوة.

الاختبارات: انسخ `e2e/suppliers.spec.ts` وأضف صفحة بـ`e2e/a11y-pages/`؛ الاثنين يستخدمون `mockApi.backend()` (نفس handlers
`src/mocks`)، فما تحتاج ملف fixture خاص. اختبارات الوحدة بالمجلد المنسوخ تستخدم `server.use(...customerHandlers)` و`renderApp('/customers')`
(المسار الحقيقي مع الحارس والـloader).

## الوحدات الاختيارية (مطفية افتراضياً)

| الوحدة                             | كيف تشغّلها                          | وين                                              |
| ---------------------------------- | ------------------------------------ | ------------------------------------------------ |
| PWA (قابل للتثبيت + يشتغل بدون نت) | `VITE_PWA="true"` ثم `npm run build` | `vite/pwa.ts` و `src/modules/pwa/` (فيها README) |
| `<Can>` والصلاحيات                 | جاهزة                                | `src/components/auth/can.tsx` و `PERMISSIONS.md` |
| قائمة اللغات من إعداد واحد         | جاهزة                                | `src/lib/i18n/languages.ts`                      |

PWA: الألوان من الثيم الافتراضي، أيقونات PNG 192 و 512 و maskable و apple-touch، تنبيه "يوجد إصدار جديد" بزر تحديث، والـAPI ما يتخزن.
الخريطة (Leaflet) ما أُضيفت بهالنسخة.

## الداتا التجريبية (src/mocks)

- **طبقة وحدة**: نفس handlers تخدم المتصفح (`npm run dev`)، واختبارات الوحدة (`server.use(...supplierHandlers)`)،
  وPlaywright (`mockApi.backend()` يمرر كل طلب لـ`getResponse` من MSW). المسارات تطابق أي origin (`*/api/...`).
  `resetMockDb()` يرجّع الجداول للبداية قبل كل اختبار. ملفات `e2e/fixtures/` للصفحات القديمة باقية لحد ما تنتقل.
- **شكل الردود مثل باكند OpenAPI عادي**: القوائم مرقّمة (`?page=0&size=10&sort=name,asc` ← `{content, totalElements, ...}`)،
  التحقق 422 بشكل problem+json مع `errors: { field: [..] }`، 404 لسجل غير موجود، 409 لما قاعدة ترفض.

- 7 مستودعات مع مواقع وأعضاء، و25 مورداً، و12 وحدة قياس، و31 تصنيفاً بشجرة، و13 خاصية.
- الرئيسية: الأرقام من عدد السجلات الفعلية، والنشاط رسم ثابت لكل يوم، وآخر التغييرات من داتا ثابتة مع أي تعديل تسويه على المستودعات.
- 6 إشعارات، وبحث عام يدور بالأنواع الأربعة، وملف واحد لكل ميزة بدل ملفين ضخمين.
- الإضافة والتعديل والحذف تغيّر الداتا بالذاكرة لحد ما تحدّث الصفحة. كل رد يتأخر 150 إلى 400 ملي ثانية حتى يبين التحميل.

## وش تغيّر عن الـplayground القديم، ولماذا

**الستايل**

- ملف ألوان واحد ضخم صار مصدراً بـTypeScript يولّد ملفين: ثيمات قابلة للتبديل بدون إعادة بناء، واختبار تباين يمر على كل ثيم.
  اللون الافتراضي محايد (رمادي بارد) بدل البورغندي حتى ما يكون الستارتر مرتبط بمنتج معين.
- أُضيفت حلقة تركيز عامة، وقاعدة تقليل الحركة، وكثافة (مريح/مضغوط)، وأزمنة الحركة صارت متغيرات بدل `150ms` مكررة 29 مرة.
- لا وميض عند تحميل الصفحة، والثيم يتبع النظام افتراضياً.
- الخطوط من الحزمة محلياً بدل رابط Google Fonts، فيشتغل بدون نت ومع سياسة أمان صارمة.
- لون `primary` ثبّتناه كلون تعبئة، وأُضيف لون ثابت للوحة الدخول (`brand-panel-*`) حتى ما تخرب بالوضع الداكن.
- حُذفت ألوان قديمة غير مستخدمة (gold و coral و auth-panel...) ولون بنفسجي ثابت بتقرير الطباعة (الملف نفسه محذوف لأنه ما ينستخدم).

**التنظيف**

- حُذفت الكود الميت: 54 ملف ما أحد يستورده (مكونات، هوكات، أنواع، سكربتات)، وصفحات "غير موجودة بالنسخة التجريبية" وروابطها.
- الرئيسية كانت داشبورد مخزون كامل (موافقات، نقص مخزون، دفعات تنتهي...). صارت عامة: أرقام الميزات الأربع، رسم نشاط، آخر التغييرات.
- البحث العام والإشعارات والقائمة الجانبية كانت تعرف مستندات المخزون والدفعات. صارت تعرف الصفحات الخمس فقط.
- السجلات المركزية (`constants/api.ts` و `query-keys.ts` و `permissions.ts`) نزلت من 298 و269 و186 سطراً إلى حجم الصفحات الخمس.
  تركناها مركزية لأن قالب الكيت نفسه يقول كذا؛ إذا تبي كل ميزة تحمل عناوينها، هذا قرار لاحق.
- توحيد الأسماء: `use-<x>-list-page` و `use-<x>-list` و `<x>-status` و `<x>-export-columns` و `<x>-test-utils`، و`deleteTarget` بكل مكان (كانت `removeTarget` ببعضها).
- هوك واحد للحذف `useDeleteTarget` بدل نفس الحالة منسوخة بثلاث صفحات.
- `use-refresh-token` طلع من `hooks/` إلى `api/auth/` (طبقة الـAPI ما تستورد من الهوكات)، وانتهاء الجلسة صار حدثاً يسمعه الراوتر بدل `window.location.href`.
- حدود الطبقات بقاعدة لنت: `components` و `lib` و `utils` و `hooks` ما تستورد من `features` أو `layout` أو `routes`، و`api` ما تستورد من الواجهة.
- سكربتات تشتغل على ويندوز: `build` بدون `NODE_ENV=`، وبدون `bun` بأي مكان، وسكربت `i18n:validate` كتبناه فعلاً.
- أسماء المنتج الأصلي وعناوين خوادمه واسم الشركة بالداتا التجريبية استُبدلت بأسماء عامة.
- ملفات كانت فوق 400 سطر انقسمت: `chart.tsx` إلى ثلاثة ملفات، و`data-table.tsx` استخرج البحث والترتيب، وملفا `mocks` الضخمان صارا ملفاً لكل ميزة.

**فحوصات جديدة**

- `conventions.test.ts` (اتجاه منطقي فقط، بدون ألوان ثابتة، بدون `text-primary`).
- `route-guards.test.ts` (كل صفحة لها حارس، وكل صفحة مذكورة بـ `PERMISSIONS.md`).
- `contrast.test.ts` على كل ثيم، و`tokens.test.ts` (الملفات المولّدة محدثة)، واختبارات `theme-init.js` و`cn` و`<Can>`.

## حالة الفحوصات (آخر تشغيل فعلي، ويندوز 11)

- `npm run typecheck`: يمر.
- `npm run lint:check` (`--deny-warnings`) و`npm run fmt:check`: يمرون (على نسخة خارج المستودع، شوف الملاحظة تحت).
- `npm run test`: 235 ملفاً و1428 اختباراً، كلها تمر بحوالي 45 ثانية (كانت 333 ثانية).
  السبب: `isolate: false` بـ`vitest.config.ts` (الوحدات تنحمّل مرة لكل عامل)، و`src/test/setup.ts` يرجّع بعد كل اختبار
  المخازن والتخزين وhandlers الـMSW وقاعدة الداتا الوهمية ومؤقتات vitest وحالة الاتصال بـTanStack Query.
  لا تستخدم `vi.mock` (يتسرّب بين الملفات بهالوضع).
- `npm run build`: يمر. أول تحميل حوالي 290 كيلوبايت JS مضغوط. بدون الداتا الوهمية يُحذف `mockServiceWorker.js` من `dist`.
- `npm run test:e2e`: 288 اختباراً (4 مشاريع)، كلها تمر بحوالي 5 دقائق. `e2e/global-setup.ts` يسخّن سيرفر Vite قبل العمّال.

ملاحظة: oxlint يتجاهل ملفات المجلد إذا كان المجلد داخل `.gitignore` لمستودع أب (مثل `playground/` بمستودع الكيت).
داخل مستودعك الخاص يشتغل عادي.
