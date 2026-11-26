# هيكل مشروع الداشبورد (Dashboard Starter)

نقطة بداية لداشبورد إداري: React 19 + Vite، عربي (من اليمين لليسار) وإنجليزي، فاتح وداكن.
فيه خمس صفحات تجريبية (والتصنيفات لها صفحة ثانية للخصائص بمسار خاص) تشتغل على داتا وهمية بالمتصفح، فتشتغل بدون باكند.
كل القوائم فيها بنفس الشكل (الموردون هم المرجع): الحالة بالرابط، والترقيم والترتيب والفلاتر من السيرفر.

التشغيل: `npm install` ثم `npm run dev`، وبعدها `http://localhost:3000`.
تسجيل الدخول يقبل أي اسم وكلمة مرور (لأن `VITE_USE_MOCK="true"` بملف `.env.development`).

**للربط بباكند حقيقي:** بالتطوير Vite يقدّم `.env.development` على `.env` و`.env.local`، فضع قيمك بملف
`.env.development.local` (يغلب الكل ومتجاهَل بـgit): `VITE_USE_MOCK="false"` و`VITE_API_BASE_URL` و`VITE_AUTH_REFRESH="cookie"`.
للبناء: `.env.production.local` أو متغيرات CI. (تحققنا من الترتيب بـ`loadEnv` نفسه.)

**من جهاز ثاني (شبكة محلية أو VPN):** الداتا الوهمية تحتاج service worker، والمتصفح يسمح به فقط على `localhost` أو `https`.
على `http` بعنوان ثاني تطلع صفحة تشرح السبب بدل صفحة فاضية.

## الصفحات (الرئيسية وخمس صفحات موارد)

| الصفحة       | المسار                                     | فيها                                                                                                                           |
| ------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| الرئيسية     | `/`                                        | أربع بطاقات (مستودعات، موردون، تصنيفات، وحدات) برسم صغير، رسم النشاط خلال 30 يوماً، آخر التغييرات                              |
| المستودعات   | `/warehouses` و `/warehouses/$warehouseId` | قائمة بالشكل المرجعي (حالة ونوع وبحث، تصدير Excel)، وصفحة تفاصيل بتبويبات بالرابط (نظرة عامة، المواقع، الأعضاء، سجل التغييرات) |
| الموردون     | `/suppliers`                               | **الكيان المرجعي**: ترقيم وترتيب من السيرفر، الفلاتر بالرابط، فورم إضافة وتعديل، حذف بتأكيد، صلاحيات                           |
| التصنيفات    | `/categories`                              | شجرة تصنيفات بثلاث مستويات (الشجرة كاملة من السيرفر، البحث والعقدة المختارة بالرابط)، خصائص مرتبطة وموروثة                     |
| الخصائص      | `/attributes`                              | صفحة قائمة كاملة بالشكل المرجعي داخل ميزة التصنيفات (`pages/attributes/`)، لها مسار وعنصر بالقائمة                             |
| وحدات القياس | `/units-of-measure`                        | بالشكل المرجعي + فلتر المنازل العشرية                                                                                          |

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
| إثبات أن قاعدة حدود الطبقات تشتغل                   | `npm run lint:probe` (ضمن `check`)                         |
| التنسيق                                             | `npm run fmt:check` ، والكتابة `npm run fmt`               |
| توليد `routeTree.gen.ts` بدون تشغيل Vite            | `npm run routes`                                           |
| بعد أي تعديل: المسارات + إصلاح اللنت + التنسيق      | `npm run fix`                                              |
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
- **الكثافة**: `data-density="compact"` على `<html>` يصغّر ارتفاع الأزرار والحقول (`--control-h*`) وصف الجدول (`--row-h`: 62 مريح و52 مضغوط، والصف والهيكل العظمي يستخدمون نفس المتغير).
- **الأحجام بالعربي**: الحروف العربية تبدو أصغر من اللاتينية بنفس الحجم، فتحت `:lang(ar)` تكبر الأنماط الصغيرة بنقطة (`b2` `b3` `label` `button-2` `table-header`) وتنفتح أسطر العناوين (`h1` `h2` `h3`) حتى ما تنقص نقاط الحروف. الجدول `TYPE_RAMP_ARABIC` بـ`foundation.ts`، واختبار يمنع التصغير.
- **`cn()`** يستخدم `twMerge` ومعه تعريف لكلاسات سلّم الخط (`text-h1` ...) حتى ما تضيع قبل `text-text-primary`.

## هيكل المجلدات

```text
dashboard-starter/
├── e2e/                         → اختبارات Playwright (fixtures/ فيها mock لكل صفحة)
├── public/                      → الأيقونات، theme-init.js، mockServiceWorker.js
├── scripts/                     → generate-tokens.ts، generate-icons.ts، validate-i18n.ts، generate-routes.ts، probe-lint-boundaries.ts (كلها Node، بدون bun)
├── vite/                        → pwa.ts (اختياري)، pwa-register-stub.ts، vendor-chunks.ts، router-options.ts (نفس إعداد الراوتر للـVite وللسكربت)
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
│   ├── types/api/               → أنواع عقد الباكند (DTO) للصفحات الخمس؛ types/routes.ts: مسارات بلا معاملات مأخوذة من شجرة المسارات المولّدة
│   ├── hooks/                   → use-list-search (الترقيم والترتيب والفلاتر بالرابط)، use-delete-dialog، use-list-export، use-delete-target ...
│   ├── services/ store/ context/ guards/ lib/ utils/ validations/
│   ├── lib/theme.ts  lib/i18n/  → حالة الثيم، اللغات
│   ├── locales/                 → ar.json و en.json (النصوص العامة) + locales/ لكل ميزة
│   ├── style/                   → فوق
│   ├── modules/pwa/             → اختياري، مطفي افتراضياً
│   ├── mocks/                   → core.ts، seed/، handlers/ (واحد لكل ميزة)، index.ts: للمتصفح والاختبارات وPlaywright
│   └── test/                    → setup، render (مكوّن لوحده)، render-app (التطبيق الحقيقي على مسار)، MSW، fixtures
├── PERMISSIONS.md               → من يشوف ويسوي شنو (4 طبقات + جدول لكل صفحة)
└── .env.development             → عناوين وهمية + VITE_USE_MOCK=true (مرفوع بـgit، ما فيه أسرار)
```

كل ملف تحت 400 سطر (اللنت يفشل فوقها، والاختبارات 600). لا `any` ولا `@ts-ignore` ولا تعطيل لنت.

## هيكل الميزة الواحدة

**الموردون هم الكيان المرجعي**، مطابق لقواعد قالب الكيت (`routing-url-state.md` و`data-tables.md` و`forms-crud.md` و`api-layer-mocks.md` و`permissions.md`، كلها في `.claude/rules/`).
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

باقي الصفحات (المستودعات، التصنيفات والخصائص، الوحدات) انتقلت لنفس الشكل وتزيد عليه شيئاً واحداً لكل صفحة:
فلتر ثاني (الوحدات)، صفحة تفاصيل بتبويبات بالرابط (المستودعات)، شجرة قادمة كاملة من السيرفر مع بحثها وعقدتها المختارة بالرابط
وصفحة قائمة ثانية `pages/attributes/` (التصنيفات). الأجزاء المشتركة بين كل القوائم بـ`src/hooks` (`use-list-search` و`use-delete-dialog` و`use-list-export`)،
لا بالميزات. `ClientDataTable` انحذف: كل الجداول `DataTable`، والقائمة الصغيرة غير المرقّمة تستخدم `hidePagination`.

**حدود الطبقات** (قاعدة لنت يولّدها `oxlint.config.ts` من المجلدات): الكود المشترك (`components` `hooks` `lib` `utils` `constants` `services` `store` `types` `validations` `guards` `context` `mocks`) ما يستورد من `features` ولا `layout` ولا `routes`؛
والميزة ما تستورد ميزة ثانية (إلا `features/fallback` وهي شاشات الأخطاء المشتركة) ولا تطلع من مجلدها بمسار نسبي. القاعدة تمسك الاستيراد بـ`@/` وبالمسار النسبي وبكل عمق مجلد،
و`npm run lint:probe` يكتب ملفات مخالفة مؤقتة (528 استيراداً مخالفاً) ويفشل إذا لم يُمسك أحدها.

### التكرار المقصود بين الميزات

الموردون والوحدات (وبدرجة أقل المستودعات) يتشابهون بالـglue: الحاوية `index.tsx` و`use-*-list` و`use-*-mutations` وهوك حوار النموذج
و`use-list-page.ts` و`*-actions.ts` و`use-*-filters.ts`. هذا مقصود: الطريقة الموثّقة هي «انسخ `suppliers/` وعدّل»،
وكل كيان جديد ينسخ هالملفات ثم يغيّر ما يخصه (الأعمدة، `validations.ts`، أعمدة التصدير، الفلاتر). لا نستخرج `useEntityListPage` عامّاً
قبل أن يظهر كيان ثالث حقيقي يحتاجه، لأن الاستخراج المبكر يخفي الفروق ويصعّب التعديل.
الملفات المشتركة فعلاً بين كل القوائم بـ`src/hooks` (`use-list-search` و`use-delete-dialog` و`use-list-export`) و`src/components/table`.
قاعدة «انقل الملف إلى `src/` لما تحتاجه ميزة ثانية» تخص مكان ملف مشترك، لا نسخ الكود.
التصنيفات شجرة بواجهة مختلفة، فليست نسخة رابعة: هوك صفحتها مقسوم إلى `use-category-selection` و`use-category-dialogs` و`use-categories-page`،
وحوار خيارات الخاصية إلى `use-option-drafts` و`use-option-drag` و`OptionDraftList` و`OptionFormSection`.
أسماء الملفات المكررة (`index.tsx` و`types/types.ts` و`validations/validations.ts`) اتفاقية مقصودة لتبقى الميزات متطابقة الشكل.

## إضافة كيان جديد

مثال: كيان اسمه `customers`. **انسخ مجلد واحد وعدّل 11 ملفاً خارجه، ثم أمر واحد** (جُرّبت الخطوات فعلاً على نسخة: 8 اختبارات e2e للكيان الجديد نجحت، واللنت والتنسيق والمسبار نظيفين):

1. انسخ `src/features/dashboard/suppliers/` إلى `src/features/dashboard/customers/` وبدّل الأسماء بالمجلد كله (أسماء الملفات والمحتوى: `supplier` ← `customer`).
   عدّل الحقول حسب OpenAPI: `types/types.ts` و`validations/*` و`services/*` والأعمدة والحوار والترجمات.
   **بعد الاستبدال لازم تعيد صياغة كلام المجال**: نصوص `ar` و`en` للكيان (العناوين والوصف والتلميحات وحقل البحث والرسائل) ورسائل الـmock والداتا الأولية
   وسلاسل النص المكتوبة بيدك بملف الـe2e المنسوخ. ما فيه فحص يمسكها غير هالأمر، ولازم يطلع فاضي:
   `grep -rniE "supplier|مورد|receipt|landed|purchas|payment terms|on documents|مستند|سندات|المشتريات|supplies|sup-" src/features/dashboard/customers src/types/api/customers.ts src/routes/_app/customers src/mocks/handlers/customers.ts src/mocks/seed/customers.ts e2e/customers.spec.ts e2e/a11y-pages/customers.ts`
   (الأقسام الأخرى بالملفات العامة، مثل `nav.customers` و`search.groups`، تنضاف أسطر ولا تنسخ كلام الموردين).
   **حقول أقل من المرجع** (مثلاً اسم وهاتف وحالة بدل سبعة): كل حقل تحذفه له قائمة أماكن تتبعه (الأنواع، `validations`، الأعمدة، الحوار، أعمدة التصدير، الترجمات
   وحقل البحث، `validate()` بالـmock والداتا الأولية، `…-test-utils.ts` وملفات الاختبار والـe2e)؛ القائمة الكاملة بـ`CLAUDE.md` (قسم "Fewer fields than the reference").
2. `src/types/api/customers.ts`: أنواع الطلب والرد (أو ولّدها: `npx openapi-typescript docs/api/openapi.json -o src/types/api/schema.ts`).
3. `src/constants/api.ts`: العناوين.
4. `src/constants/query-keys.ts`: `qk.customers` (`all` و`lists` و`list(params)` و`detail(id)`).
5. `src/constants/permissions.ts`: `PERMS.customer` بالمفاتيح `view/create/update/delete` وقيم الباكند نفسها.
6. `src/routes/_app/customers/index.tsx`: انسخ ملف مسار الموردين (حارس + `validateSearch` + `loaderDeps` + `loader`).
7. `src/layout/dashboard/sidebar/config/nav-config.ts`: عنصر القائمة مع `permission` داخل مجموعة: `products` لبيانات الكتالوج (التصنيفات، الموردون، الوحدات)
   و`warehouses` للمواقع؛ المجموعة الجديدة تحتاج `permission` ومفتاح `nav.groups.<id>` بملفَّي اللغة. الأيقونة من `@/lib/icons` (قائمة Hugeicons منتقاة، أضف أيقونتك فيه إذا ناقصة).
   المسار `to` نوعه مأخوذ من شجرة المسارات المولّدة (`StaticRoutePath`)، فالغلط بالمسار يفشل الـ`typecheck`؛
   **وقبل أول `npm run fix` يكون الـ`typecheck` أحمر على هالسطر وهذا متوقع** (الشجرة ما اتولّدت بعد).
8. `src/locales/ar.json`: `nav.customers` (واسم الكيان بـ`search.groups` اختياري، بالقسم الأخير تحت).
9. `src/locales/en.json`: `nav.customers`.
10. `PERMISSIONS.md`: سطر بالجدول (اختبار `route-guards.test.ts` يفشل بدونه).
11. الداتا الوهمية: `src/mocks/handlers/customers.ts` (انسخ ملف الموردين مع جدول `seed/`؛ بدّل مجموعة `makeId(0xe0, ...)` برقم غير مستخدم وإلا تتصادم المعرّفات مع الموردين، وبدّل بادئة الرمز `SUP-` بالداتا والاختبارات). إذا الباكند جاهز تقدر تتخطى هالخطوة والخطوة اللي بعدها.
12. `src/mocks/index.ts`: سجّل الـhandlers.

ثم: **`npm run fix`** يولّد `routeTree.gen.ts` (بدون تشغيل Vite) ويصلح اللنت ويكتب التنسيق، وبعده `npm run check`.
اختبار `src/constants/permissions.test.ts` يثبّت قائمة الصلاحيات عمداً، فبعد إضافة `PERMS.customer` حدّثه بـ`npx vitest run src/constants -u`.
قاعدة حدود الطبقات تغطي المجلد الجديد تلقائياً (تُولَّد من المجلدات) و`npm run lint:probe` يتأكد.

الاختبارات: انسخ `e2e/suppliers.spec.ts` وأضف صفحة بـ`e2e/a11y-pages/`؛ الاثنين يستخدمون `mockApi.backend()` (نفس handlers
`src/mocks`)، فما تحتاج ملف fixture خاص. اختبارات الوحدة بالمجلد المنسوخ تستخدم `server.use(...customerHandlers)` و`renderApp('/customers')`
(المسار الحقيقي مع الحارس والـloader).

عدد الملفات: **11 ملفاً خارج المجلد المنسوخ (الخطوات 2 إلى 12)**، وأمر واحد بعدها (`npm run fix`) يولّد شجرة المسارات ويصلح اللنت ويكتب التنسيق.
قائمة التنقل ما لها نوع مكتوب بيدك.

**أماكن ثانية تذكر الكيان وما هي ضمن الـ11 ملفاً**: البحث العام (`topbar/types/types.ts` و`utils/search-options.ts` و`hooks/use-global-search.ts` و`components/global-search.tsx` و`search.groups` بملفَّي الترجمة العامين، وهو المكان الثاني الذي يسمّي الكيان بعد `nav.*`، و`mocks/handlers/search.ts`)،
الإشعارات (`mocks/seed/notifications.ts` و`utils/notification-target.ts`)، الرئيسية (`types/api/overview.ts` و`mocks/handlers/overview.ts` و`mocks/seed/activity.ts` و`home-kpi-grid.tsx` و`home-recent-changes-table.tsx` و`hooks/home-access.ts`: الرئيسية تعرض البطاقة أو التغيير فقط لمن يملك صلاحية قراءة ذلك المورد)،
وسجل التدقيق (`types/api/enums.ts` و`constants/audit-entities.ts`). القائمة الكاملة بملفات الاختبار بـ`CLAUDE.md` (قسم "Show the entity in search, notifications and the home page").
كيان بدون حذف، ومنتقي فوق كيان ثاني، وحقل التاريخ والوقت: بـ`CLAUDE.md` أيضاً. لا يوجد حقل تاريخ ووقت بحقل واحد: التاريخ حقل والوقت حقل.

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
  `resetMockDb()` يرجّع الجداول للبداية قبل كل اختبار. ملفات `e2e/fixtures/` (`home.ts` و`warehouses.ts`) تبقى فقط لاختبارات الرئيسية والبحث العام والإشعارات التي تحتاج ردوداً ثابتة بعينها؛ كل صفحات القوائم تستخدم `mockApi.backend()`.
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
- حدود الطبقات بقاعدة لنت تُولَّد من المجلدات وتمسك `@/` والمسار النسبي بكل عمق (الكود المشترك، والميزات بعضها عن بعض، و`api` عن الواجهة)، ويثبتها `npm run lint:probe` (فوق).
- سكربتات تشتغل على ويندوز: `build` بدون `NODE_ENV=`، وبدون `bun` بأي مكان، وسكربت `i18n:validate` كتبناه فعلاً.
- أسماء المنتج الأصلي وعناوين خوادمه واسم الشركة بالداتا التجريبية استُبدلت بأسماء عامة.
- ملفات كانت فوق 400 سطر انقسمت: `chart.tsx` إلى ثلاثة ملفات، و`data-table.tsx` استخرج البحث والترتيب، وملفا `mocks` الضخمان صارا ملفاً لكل ميزة.

**فحوصات جديدة**

- `conventions.test.ts` (اتجاه منطقي فقط، بدون ألوان ثابتة، بدون `text-primary`).
- `route-guards.test.ts` (كل صفحة لها حارس، وكل صفحة مذكورة بـ `PERMISSIONS.md`).
- `contrast.test.ts` على كل ثيم، و`tokens.test.ts` (الملفات المولّدة محدثة)، واختبارات `theme-init.js` و`cn` و`<Can>`.

## حالة الفحوصات (آخر تشغيل فعلي، ويندوز 11)

- `npm run typecheck`: يمر.
- `npm run lint:check` (`--deny-warnings`) و`npm run fmt:check`: يمرون (721 ملفاً، على نسخة خارج المستودع، شوف الملاحظة تحت). `npm run lint:probe`: 528 استيراداً مخالفاً كلها تُمسك، و291 مسموحاً نظيفين.
- `npm run test`: 216 ملفاً و1358 اختباراً، كلها تمر بحوالي 40 ثانية (كانت 333 ثانية)، ثم الوضع المعزول (ملفان و18 اختباراً).
  `npm run test:coverage` له حد أدنى (80% للأسطر والعبارات والدوال و70% للفروع) والتغطية الحالية 83.6% / 74.6% / 83.7%.
  السبب: `isolate: false` بـ`vitest.config.ts` (الوحدات تنحمّل مرة لكل عامل)، و`src/test/setup.ts` يرجّع بعد كل اختبار
  المخازن والتخزين وhandlers الـMSW وقاعدة الداتا الوهمية ومؤقتات vitest وحالة الاتصال بـTanStack Query.
  لا تستخدم `vi.mock` (يتسرّب بين الملفات بهالوضع). والملفان اللذان يستدعيان `vi.resetModules()` (`env.test.ts` و`monitoring.test.ts`)
  يشتغلان بأمر ثاني معزول (`npm run test:isolated`، جزء من `npm run test`): بدون ذلك كانت ملفات تالية بنفس العامل تفشل أحياناً بـ"Network Error" حسب ترتيب التشغيل.
- `npm run build`: يمر. بدون الداتا الوهمية يُحذف `mockServiceWorker.js` من `dist`.
- `npm run test:e2e`: 320 اختباراً (4 مشاريع): 319 نجحوا بالتشغيل الكامل، وواحد فشل بتوقف الجهاز (انتهى الاختبار قبل أن يجد الزر) ونجح عند إعادة ملفه. `e2e/global-setup.ts` يسخّن سيرفر Vite قبل العمّال.

ملاحظة: oxlint يتجاهل ملفات المجلد إذا كان المجلد داخل `.gitignore` لمستودع أب (مثل `playground/` بمستودع الكيت).
داخل مستودعك الخاص يشتغل عادي.
