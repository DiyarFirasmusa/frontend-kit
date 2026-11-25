# هيكل مشروع الداشبورد (Dashboard Starter)

نقطة بداية لداشبورد إداري: React 19 + Vite، عربي (من اليمين لليسار) وإنجليزي، فاتح وداكن.
فيه خمس صفحات تجريبية (والتصنيفات لها تبويب ثاني بمسار خاص) تشتغل على داتا وهمية بالمتصفح، فتشتغل بدون باكند.

التشغيل: `npm install` ثم `npm run dev`، وبعدها `http://localhost:3000`.
تسجيل الدخول يقبل أي اسم وكلمة مرور (لأن `VITE_USE_MOCK="true"` بملف `.env.development`).

## الصفحات الخمس

| الصفحة       | المسار                                     | فيها                                                                                                                |
| ------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| الرئيسية     | `/`                                        | أربع بطاقات (مستودعات، موردون، تصنيفات، وحدات) برسم صغير، رسم النشاط خلال 30 يوماً، آخر التغييرات                   |
| المستودعات   | `/warehouses` و `/warehouses/$warehouseId` | جدول بفلاتر وبحث وتصدير Excel، إضافة وتعديل وحذف، صفحة تفاصيل بتبويبات (نظرة عامة، المواقع، الأعضاء، سجل التغييرات) |
| الموردون     | `/suppliers`                               | جدول وفورم وحذف بتأكيد                                                                                              |
| التصنيفات    | `/categories`                              | شجرة تصنيفات بثلاث مستويات، خصائص مرتبطة وموروثة                                                                    |
| الخصائص      | `/attributes`                              | التبويب الثاني لنفس ميزة التصنيفات: تعريف الخصائص وخياراتها بترتيب (له مسار وعنصر بالقائمة)                         |
| وحدات القياس | `/units-of-measure`                        | جدول بفلاتر وفورم وحذف                                                                                              |

وبالإضافة لها: تسجيل الدخول، وصفحات الأخطاء 401 و403 و404 و500.

## الستاك

| الجزء            | الأداة                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| الإطار           | React 19 + Vite 8 (SPA) + TypeScript strict                                                         |
| التوجيه          | TanStack Router (مسارات ملفات، `routeTree.gen.ts` مولّد)                                            |
| بيانات السيرفر   | TanStack Query 5 + axios                                                                            |
| حالة العميل      | Zustand 5                                                                                           |
| الفورمات         | react-hook-form + zod 4                                                                             |
| الواجهة          | Tailwind CSS 4 + Base UI + أيقونات Hugeicons + sonner                                               |
| الرسوم           | Recharts                                                                                            |
| اللغات           | i18next، القائمة كلها بملف واحد: `src/lib/i18n/languages.ts`                                        |
| الخطوط           | Cairo و IBM Plex Sans و IBM Plex Sans Arabic و IBM Plex Mono، محلية من حزم `@fontsource` (بدون CDN) |
| الداتا التجريبية | MSW 2 بالمتصفح (`src/mocks/`)                                                                       |
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
│   ├── routes/                  → ملفات رفيعة: _auth/login، _dashboard/ (كل صفحة تتحقق من الصلاحية)، (errors)/
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
│   ├── mocks/                   → core.ts، seed/ (داتا لكل مورد)، handlers/ (واحد لكل ميزة)، index.ts
│   └── test/                    → setup، render، MSW للاختبارات، fixtures
├── PERMISSIONS.md               → من يشوف ويسوي شنو (4 طبقات + جدول لكل صفحة)
└── .env.development             → عناوين وهمية + VITE_USE_MOCK=true (مرفوع بالمستودع، ما فيه أسرار)
```

كل ملف تحت 400 سطر (اللنت يفشل فوقها، والاختبارات 600). لا `any` ولا `@ts-ignore` ولا تعطيل لنت.

## هيكل الميزة الواحدة

الشرح الكامل بـ `src/features/dashboard/README.md`. مثال الموردين:

```text
features/dashboard/suppliers/
├── index.tsx                              → JSX + استدعاء use-suppliers-list-page فقط
├── hooks/use-suppliers-list-page.ts       → البحث والفلاتر والجدول والحذف
├── hooks/query/use-suppliers-list.ts      → استعلامات TanStack Query
├── hooks/supplier-actions.ts              → صلاحيات وأفعال كل صف
├── components/supplier-columns.tsx  components/dialog/
├── services/suppliers.service.ts  types/  validations/
├── utils/supplier-status.ts  utils/supplier-export-columns.ts
├── supplier-test-utils.ts
└── locales/{ar,en}.json
```

أسماء الملفات فريدة بكل المشروع (`use-suppliers-list-page` مو `use-list-page`)، وحالة الحذف بكل الصفحات من `useDeleteTarget`:
`deleteTarget` و `isDeleteOpen` و `openDelete` و `closeDelete`.

## الوحدات الاختيارية (مطفية افتراضياً)

| الوحدة                             | كيف تشغّلها                          | وين                                              |
| ---------------------------------- | ------------------------------------ | ------------------------------------------------ |
| PWA (قابل للتثبيت + يشتغل بدون نت) | `VITE_PWA="true"` ثم `npm run build` | `vite/pwa.ts` و `src/modules/pwa/` (فيها README) |
| `<Can>` والصلاحيات                 | جاهزة                                | `src/components/auth/can.tsx` و `PERMISSIONS.md` |
| قائمة اللغات من إعداد واحد         | جاهزة                                | `src/lib/i18n/languages.ts`                      |

PWA: الألوان من الثيم الافتراضي، أيقونات PNG 192 و 512 و maskable و apple-touch، تنبيه "يوجد إصدار جديد" بزر تحديث، والـAPI ما يتخزن.
الخريطة (Leaflet) ما أُضيفت بهالنسخة.

## الداتا التجريبية (src/mocks)

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

## حالة الفحوصات (آخر تشغيل فعلي، ويندوز 11، Node 26)

- `npm run typecheck`: يمر.
- `npm run lint:check` (`--deny-warnings`): يمر بصفر تحذيرات.
- `npm run fmt:check`: يمر.
- `npm run test`: 229 ملفاً و1287 اختباراً، كلها تمر (حوالي 400 ثانية).
- `npm run build`: يمر، وبـ `VITE_PWA=true` يولّد `manifest.webmanifest` و`sw.js`.
- `npm run test:e2e`: 272 اختباراً (4 مشاريع). التشغيل الكامل: 268 يمر و4 تنتهي مهلتها عند `waitForLoadState('networkidle')` بملف `a11y.spec.ts` تحت ضغط 6 عمال على سيرفر Vite بارد.
  إعادة تشغيل `a11y` لوحده: 64 من 64 تمر. شغّل بـ `--workers=4` إذا جهازك أبطأ.

ملاحظة: oxlint يتجاهل ملفات المجلد إذا كان المجلد داخل `.gitignore` لمستودع أب (مثل `playground/` بمستودع الكيت).
داخل مستودعك الخاص يشتغل عادي.
