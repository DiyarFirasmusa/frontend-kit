# دليل قالب الموقع

هذا قالب جاهز لموقع شركة عام (واجهة فقط): صفحة رئيسية، من نحن، خدماتنا، أخبار ومقالات، وصفحة تواصل فيها فورم.
الموقع بالعربي (من اليمين لليسار) والإنجليزي، واللغة جزء من الرابط: `/ar/...` و `/en/...`.
كل المحتوى تجريبي لشركة وهمية ("شركة المثال" / "Example Company"). استبدله بمحتواك (القائمة في آخر الدليل).

## قبل أن تبدأ

- تحتاج **Node 24 أو أحدث**. اكتب `node -v` وتأكد أن الرقم 24 أو أكبر.
  الملف `.npmrc` فيه `engine-strict=true`، فإذا كانت نسختك أقدم يتوقف `npm install` برسالة `EBADENGINE`. الحل: ثبّت Node 24 (أو شغّل `nvm use`، فالملف `.nvmrc` فيه الرقم).
- لا تحتاج أي حساب أو خدمة خارجية لتشغيل الموقع على جهازك.

## التشغيل

```text
npm install
npm run setup:env        # مرة واحدة: ينسخ .env.example إلى .env.local (مطلوب قبل build)
npm run dev              # http://localhost:5190  (المنفذ ثابت، إذا كان مشغولاً يتوقف ولا يغيّره)
```

أوامر أخرى:

```text
npm run build            # نسخة الإنتاج في .output/ (تقرأ .env.local)
npm start                # يشغّل نسخة الإنتاج على المنفذ 3000 (يقرأ .env.local إن وجد)
npm run check            # كل الفحوص السريعة: الأنواع، اللنت، التنسيق، الترجمة، المتغيرات، CSS، الأدوات (ومنها أن كل `npm run` مكتوب في الدليل موجود)، اختبارات الوحدة
npm run check:bundle     # بعد build: حجم الصفحات تحت الميزانية، ومكتبات الفورم في صفحة التواصل فقط
npm run e2e:install      # مرة واحدة: يثبّت متصفح Chromium للاختبارات
npm run test:e2e         # يبني الموقع ويختبره في متصفح حقيقي على المنفذ 5191
npm run check:full       # check ثم build ثم check:bundle ثم test:e2e
```

إذا فشل `npm run build` برسالة `Build stopped: missing or invalid settings` فالسطر الذي تحتها يقول ما الناقص. غالباً نسيت `npm run setup:env`، أو تبني لموقع حقيقي ولم تضع `VITE_SITE_URL` (مثل `VITE_SITE_URL=https://example.com`).

## المتغيرات (ملف `.env.local`)

كل المتغيرات مشروحة في `.env.example`. الملف `.env.local` لجهازك فقط ولا يُرفع إلى git. على السيرفر أو في Docker ضع متغيرات بيئة حقيقية بدل الملف.

| المتغير | متى يُقرأ | ماذا يفعل |
| --- | --- | --- |
| `VITE_SITE_URL` | وقت البناء | عنوان الموقع بدون `/` في الآخر. منه تُبنى روابط canonical وhreflang والـsitemap. مطلوب للبناء. |
| `VITE_ALLOW_INDEXING` | وقت البناء | `true` فقط للموقع الحقيقي. غير ذلك: كل الصفحات `noindex` وrobots يمنع الزحف، فلا تظهر نسخة التجربة في Google. |
| `CSP_MODE` | عند تشغيل السيرفر | `enforce` (الافتراضي) أو `report-only` لأول نشر. |
| `CONTACT_WEBHOOK_URL` | عند تشغيل السيرفر | العنوان الذي يستقبل رسائل الفورم (JSON). |

مهم عن الفورم:

- بدون `CONTACT_WEBHOOK_URL` يكون الفورم في **وضع تجريبي**: الرسالة تُقبل ثم تُهمل، ويكتب السيرفر تحذيراً في السجل.
- هذا مسموح فقط إذا كان `VITE_ALLOW_INDEXING` ليس `true`. على الموقع الحقيقي **يرفض السيرفر أن يبدأ** بدون `CONTACT_WEBHOOK_URL`، ويطبع السبب في سطر واحد. هكذا لا تضيع رسالة زبون بصمت.
- قيمة خاطئة في أي متغير (مثل `CSP_MODE=Enforce`) توقف البناء أو السيرفر برسالة واضحة، ولا تُستبدل بقيمة افتراضية.
- إذا فشل الإرسال إلى الـwebhook يرى الزائر رسالة خطأ ويبقى نصه في الفورم، ويُكتب في سجل السيرفر رقم الخطأ فقط (بدون اسم الزائر أو رسالته أو عنوان الـwebhook).

## الصفحات

| الصفحة | الرابط | فيها |
| --- | --- | --- |
| الرئيسية | `/ar` و `/en` | مقدمة، ثلاث خدمات، أرقام، آخر خبرين، دعوة للتواصل |
| من نحن | `/ar/about` | القصة، القيم، الفريق |
| خدماتنا | `/ar/services` | الخدمات وطريقة العمل |
| الأخبار | `/ar/news` | قائمة المقالات |
| مقال | `/ar/news/<slug>` | المقال كاملاً. الـslug إنجليزي وواحد للغتين |
| تواصل معنا | `/ar/contact` | فورم (اسم، بريد، هاتف اختياري، رسالة) |
| غير موجودة | أي رابط خطأ | صفحة 404 حقيقية، لا تُفهرس |
| `/` | تحويل | إلى اللغة المحفوظة، ثم لغة المتصفح، ثم العربي |
| `/robots.txt` و `/sitemap.xml` | ملفات | تُبنى وحدها من قائمة التنقل والمقالات |

## الأدوات

| الجزء | الأداة |
| --- | --- |
| الإطار | TanStack Start (React 19، مسارات من الملفات، رسم على السيرفر SSR) |
| البناء والسيرفر | Vite 8، وNitro (نسخة rc مثبتة بالضبط، تحدّثها Dependabot) |
| اللغة | TypeScript صارم |
| التصميم | Tailwind CSS 4، والألوان والخطوط في ملف واحد `src/shared/style/tokens.css` |
| الترجمة | i18next + react-i18next |
| حالة المتصفح | Zustand (الثيم وقائمة الموبايل فقط) |
| الفورم | react-hook-form + zod (نفس التحقق في المتصفح وفي السيرفر). استورد `z` من `src/shared/lib/zod.ts` وليس من `'zod'` |
| الفحوص | oxlint، oxfmt، Vitest، Playwright + axe |

لا يوجد TanStack Query ولا axios ولا MSW: محتوى الموقع ثابت، والفورم يرسل عبر server function.

## المجلدات

```text
website/
├── src/
│   ├── routes/                  → ملف لكل صفحة، رفيع: head() والمكوّن فقط
│   │   ├── __root.tsx           → <html lang dir>، الستايل، الخطوط
│   │   ├── index.tsx            → "/" يحوّل إلى اللغة
│   │   ├── $locale.tsx          → يتحقق من اللغة ويرسم الهيدر والفوتر
│   │   └── $locale/             → index، about، services، contact، news/index، news/$slug
│   ├── routeTree.gen.ts         → يتولّد وحده من routes/ عند dev وbuild. لا تعدّله
│   ├── features/website/<اسم>/ → كل صفحة في مجلدها: index.tsx، use-<اسم>-page.ts، <اسم>-head.ts، locales/
│   ├── features/fallback/       → صفحة 404 وصفحة الخطأ
│   ├── config/
│   │   ├── site.config.ts       → اسم الشركة، البريد، الهاتف، صورة المشاركة
│   │   └── nav.config.ts        → قائمة الصفحات: منها الهيدر والفوتر والـsitemap
│   ├── shared/
│   │   ├── components/          → الهيدر، الفوتر، الأزرار، بطاقة المقال، Picture، ...
│   │   ├── env/                 → schema.ts (فحص كل المتغيرات) و public-env.ts (ما يصل للمتصفح)
│   │   ├── lib/i18n/            → languages.ts (اللغات) و resources.ts (ملفات الترجمة)
│   │   ├── lib/seo/             → seo() و sitemap و JSON-LD
│   │   ├── lib/zod.ts           → zod مضبوط على `jitless` (يمنع eval الذي يرفضه CSP)
│   │   ├── server/              → هيدرز الأمان، متغيرات السيرفر، فحص المتغيرات عند التشغيل
│   │   ├── locales/             → النصوص العامة (الهيدر، الفوتر، الأخطاء)
│   │   ├── store/               → الثيم وقائمة الموبايل
│   │   ├── style/               → tokens.css و styles.css
│   │   └── utils/               → دوال صغيرة
│   ├── router.tsx               → إعداد الراوتر
│   └── start.ts                 → ما يمر عليه كل طلب: حماية CSRF، حد الحجم، التحويلات، هيدرز الأمان
├── e2e/                         → اختبارات المتصفح: raw/ (رد السيرفر الخام) و ui/ (الصفحات في متصفح)
├── public/                      → الصور والأيقونة وملف الـmanifest
├── scripts/                     → سكربتات الفحص (المتغيرات، CSS، الترجمة، الأدوات، حجم الصفحات) وتشغيل اختبارات e2e
├── CLAUDE.md  .claude/rules/    → تعليمات مختصرة لـClaude Code (انظر "العمل مع Claude Code")
├── deploy/nginx/site.conf       → إعداد nginx أمام السيرفر
├── Dockerfile  docker-compose.yml
└── .env.example                 → كل المتغيرات مع شرحها
```

## القواعد

1. **لا نص مكتوب داخل المكونات.** كل نص في ملفات `locales/ar.json` و `locales/en.json`، بنفس المفاتيح في اللغتين. `npm run i18n:validate` يفشل لو نقص مفتاح.
2. **لا يسار ولا يمين.** استعمل `ms-` و `me-` و `ps-` و `pe-` و `start` و `end` بدل `ml-` و `left`. `npm run check:css` يفشل غير ذلك.
3. **لا `<title>` ولا `<meta>` داخل المكونات.** كل صفحة تعلنها في `head()` عبر الدالة `seo()`.
4. **الألوان من tokens فقط** (`bg-surface`، `text-muted`، ...). لكتلة ملوّنة بلون الهوية استعمل الكلاس `surface-primary` (وليس `bg-primary`)، حتى يبقى إطار التركيز ظاهراً على الأزرار داخلها.
5. **الصور عبر المكوّن `Picture`**: يفرض العرض والارتفاع والنص البديل، فلا تقفز الصفحة أثناء التحميل.
6. **المتغيرات عبر المخطط فقط.** أي متغير جديد يُضاف إلى `src/shared/env/schema.ts` وإلى `.env.example` معاً (`npm run check:env` يتأكد، ويتأكد أيضاً أن `VITE_ALLOW_INDEXING=false` في المثال حتى لا تفتح نسخة منه الفهرسة بالخطأ). ما يبدأ بـ`VITE_` يصل للمتصفح، فلا تضع فيه سراً.
7. **هيدرز الأمان من مكان واحد**: `src/shared/server/security-headers.ts`. أي خدمة خارجية (تحليلات، خرائط) تُضاف في `THIRD_PARTY` بنفس الملف.
8. **أسماء الملفات kebab-case**، وكل ملف أقل من 400 سطر، وبدون `any`.
9. **الاختبار بجانب الكود**: `x.ts` واختباره `x.test.ts` في نفس المجلد. اختبار يحتاج المتصفح (`window` أو التخزين) اسمه `x.dom.test.ts`.
10. **zod من `src/shared/lib/zod.ts` فقط.** الاستيراد المباشر من `'zod'` يفشل في `npm run lint:check`.
11. **مكوّن المشاركة يأخذ قيماً بسيطة**: بطاقة المقال تستقبل `articleCard(article, locale)` (في `news/data/articles.ts`)، فلا تنسخ تحويل المقال إلى بطاقة في مكان آخر.

## كيف تضيف صفحة

مثال: صفحة "الأسئلة الشائعة" على الرابط `/ar/faq`.

1. أنشئ المجلد `src/features/website/faq/` وفيه:
   - `index.tsx`: الصفحة (JSX فقط).
   - `faq-head.ts`: يستدعي `seo()` بالعنوان والوصف (انسخ `about/about-head.ts` وعدّله).
   - `locales/ar.json` و `locales/en.json`: نصوص الصفحة تحت مجموعة واحدة، مثل `{ "faq": { "title": "..." } }`.
2. سجّل ملفي اللغة في `src/shared/lib/i18n/resources.ts` (سطر import لكل لغة، وأضفهما إلى `merge`).
3. أنشئ ملف الراوت `src/routes/$locale/faq.tsx` (انسخ `about.tsx` وغيّر الاسم).
4. شغّل `npm run dev` مرة: يُحدَّث `routeTree.gen.ts` وحده بالصفحة الجديدة.
5. لتظهر في القائمة والفوتر والـsitemap أضف سطراً واحداً في `src/config/nav.config.ts`:
   ```ts
   navItem({ to: '/$locale/faq', labelKey: 'nav.faq', changefreq: 'monthly', priority: 0.5 }),
   ```
   وأضف المفتاح `nav.faq` في `src/shared/locales/ar.json` و `en.json`. الحقل `to` يُفحص مع الصفحات الموجودة فعلاً، فالخطأ في الاسم يظهر في `npm run typecheck`.
6. أضف الصفحة إلى `PAGES` في `e2e/fixtures/app.ts`: تدخل فوراً في فحوص SEO وaxe والشكل.
7. شغّل `npm run check` ثم `npm run test:e2e`.

## كيف تضيف نصاً (ترجمة)

1. اختر الملف: نص خاص بصفحة يذهب إلى `src/features/website/<الصفحة>/locales/`، ونص عام (الهيدر، الفوتر) إلى `src/shared/locales/`.
2. أضف المفتاح في **الملفين** `ar.json` و `en.json` بنفس الاسم، بشكل `مجموعة.مفتاح`:
   ```json
   { "contact": { "hoursNote": "نرد خلال يوم عمل" } }
   ```
3. استعمله في المكوّن: `const { t } = useTranslation();` ثم `t('contact.hoursNote')`.
4. شغّل `npm run i18n:validate`: يتأكد أن المفتاح موجود باللغتين.

## كيف تضيف حقلاً لفورم التواصل

مثال: حقل "اسم الشركة" (اختياري).

1. `src/features/website/contact/validations/contact-schema.ts`: أضف الحقل إلى `contactSchema` (مثلاً `company: z.string().trim().max(120, { message: 'contact.companyTooLong' })`) وإلى `EMPTY_CONTACT`. هذا الملف يستعمله المتصفح والسيرفر معاً.
2. `src/features/website/contact/components/contact-form.tsx`: أضف `<label>` و `<input>` مثل حقل الهاتف (نفس `aria-invalid` و `aria-describedby` ورسالة الخطأ).
3. `locales/ar.json` و `en.json` في نفس الميزة: نص العنوان `contact.companyLabel` ونص الخطأ `contact.companyTooLong`.
4. `server/deliver-contact.server.ts`: أضف الحقل إلى الـJSON المرسل للـwebhook.
5. حدّث الاختبارات: `contact-schema.test.ts` و `contact-form.test.tsx`.

الحقل المخفي `contactRef` فخ للبوتات (honeypot). اسمه بلا معنى عن قصد حتى لا يملأه المتصفح أو مدير كلمات المرور. لا تغيّره إلى اسم مثل `website` أو `url`.

## الأمان

- كل صفحة ترسل CSP مع nonce جديد لكل رد، وHSTS، و`X-Frame-Options`، وغيرها. الملفات الثابتة (الصور، الأيقونة، ملفات البناء) ترسل `nosniff`، والصور ترسل CSP تمنع تشغيل أي سكربت.
- CSP يمنع `eval`، وzod يحاول استعماله لتسريع التحقق، فنوقفه بـ`jitless` في `src/shared/lib/zod.ts`. اختبارات e2e تحوّل أي مخالفة CSP إلى خطأ يفشل الاختبار، فلا تمرّ مخالفة صامتة.
- التخزين المؤقت: الصفحات `private, no-cache` (فيها nonce خاص بكل رد فلا يخزّنها وسيط)، والصفحات الفاشلة وردود الـserver function `no-store`، وملفات `/assets` المبصومة `immutable` لسنة.
- التحويل إلى الشكل الوحيد للرابط (حروف صغيرة، بدون `/` في الآخر وبدون `//`) برمز 301 وفي خطوة واحدة، لطلبات GET وHEAD فقط: التحويل 301 يحوّل POST إلى GET ويضيّع الجسم.
- `CSP_MODE=report-only` لأول نشر، ثم `enforce` بعد التأكد أن الكونسول بلا أخطاء.
- HSTS يشمل النطاقات الفرعية (`includeSubDomains`). إذا كان عندك نطاق فرعي يعمل بـHTTP فقط، احذف هذا الجزء من `HSTS` في `security-headers.ts` قبل أول نشر.
- الفورم: تحقق في المتصفح وفي السيرفر، حماية CSRF، حد 16 كيلوبايت لحجم الطلب، حقل فخ للبوتات، والسيرفر لا يعيد تفاصيل التحقق.
- لا ترفع ملفات من الزوار لتُعرض من نفس عنوان الموقع.

## النشر

- **Docker**: `Dockerfile` يبني الموقع ويشغّله بمستخدم عادي (ليس root). قيم `VITE_*` تُمرَّر وقت البناء (`--build-arg`)، و`CONTACT_WEBHOOK_URL` و`CSP_MODE` وقت التشغيل (`-e`). التفاصيل في أول الملف.
- **docker-compose**: `docker compose up --build` يشغّل الموقع خلف nginx على `http://localhost:8080`.
- **nginx** (`deploy/nginx/site.conf`): حدود الحجم والوقت، حد معدل للفورم، ضغط الصفحات، ومنع الماسحات. إذا كان أمامه موزّع أحمال (load balancer) فعّل أسطر `set_real_ip_from` في أول الملف بعنوان الموزّع، وإلا سيعتبر nginx كل الزوار زائراً واحداً في حد المعدل. شغّل `nginx -t` قبل كل نشر.
- Dependabot يحدّث حزم npm وGitHub Actions وصور Docker أسبوعياً.

## الأداء

- ملفات JS وCSS تُرسل مضغوطة (brotli أو gzip) من السيرفر نفسه.
- جافاسكربت الصفحة الرئيسية حوالي 142 كيلوبايت gzip (و159 مع الـCSS)، أغلبها React والراوتر والترجمة. مكتبات الفورم (react-hook-form وzod) تُحمَّل فقط في صفحة التواصل.
- `npm run check:bundle` (بعد `npm run build`) يشغّل السيرفر المبني ويقيس حجم gzip لكل ما تحمّله `/ar` و`/ar/news` و`/ar/contact`، ويفشل إذا تجاوزت صفحة ميزانيتها (الأرقام في أول `scripts/check-bundle-size.mjs`) أو ظهر كود الفورم في صفحة بلا فورم. إذا أضفت ميزة حقيقية وتجاوزت الميزانية عن قصد، ارفع الرقم في نفس الـcommit مع السبب.
- الخطوط مستضافة مع الموقع (بدون CDN)، والإنجليزي يستعمل خط النظام فلا يحمّل خطاً.
- اختبار e2e يفشل إذا قفزت أي صفحة أثناء التحميل (CLS أعلى من 0.01).

## الاختبارات

| المجموعة | ماذا تفحص |
| --- | --- |
| اختبارات الوحدة (`npm run test`) | الدوال والفورم والتحقق، بجانب كل ملف |
| `raw` | رد السيرفر بدون متصفح، كما يراه Google: SEO، hreflang، sitemap، أكواد الحالة، الهيدرز، حدود الطلب |
| `ar-desktop` `en-desktop` | كل الصفحات، التنقل، الفورم، إمكانية الوصول (axe)، الثيم |
| `ar-phone` `en-phone` | نفس الشيء على شاشة موبايل مع قائمة الموبايل |
| `ar-dark` `en-dark` | نفس الشيء بالمظهر الداكن |
| `perf-ar-phone` `perf-en-desktop` | أن الصفحة لا تقفز أثناء التحميل |

- اختبارات الواجهة تفشل إذا ظهر أي خطأ في الكونسول، أو خطأ غير ملتقط، أو مخالفة CSP.
- اختبارات الوحدة مقسومة إلى مشروعين: `node` للدوال (`*.test.ts`) و`dom` للمكوّنات (`*.test.tsx` و`*.dom.test.ts`)، فلا تدفع الدوال البسيطة ثمن بيئة المتصفح.
- الاختبارات تقرأ النصوص من ملفات الترجمة نفسها، فتغيير النصوص التجريبية لا يكسرها.
- أثناء `npm run test:e2e` يشغّل السكربت مستقبِل webhook محلياً، فيُختبر إرسال الفورم ونجاحه وفشله فعلاً.
- `E2E_BASE_URL=https://...` يشغّل نفس الاختبارات على موقع منشور بدون بناء محلي.

## العمل مع Claude Code

- `CLAUDE.md` في جذر المشروع: ملخص قصير للمكدّس والقواعد الصارمة وخريطة المجلدات وخطوات إضافة صفحة ونص وحقل فورم.
- `.claude/rules/`: ست قواعد قصيرة تُحمَّل حسب مسار الملف الذي يعمل عليه Claude: `routing-seo` و`i18n-rtl` و`styles-tokens` و`contact-form` و`security-headers` و`testing`.
- عند تغيير بنية المشروع (مجلد أو أمر أو قاعدة) حدّث `CLAUDE.md` والقاعدة المعنية مع هذا الدليل. `npm run check:tooling` يفشل إذا ذكرتَ فيها أمر `npm run` غير موجود.

## استبدال الشركة التجريبية بشركتك

- `src/config/site.config.ts`: الاسم، البريد، الهاتف، لون الثيم.
- ملفات `locales/*.json` (العامة وفي كل ميزة): كل النصوص.
- `src/features/website/news/data/articles.ts`: المقالات (أو اربطها بـCMS).
- `public/favicon.svg` و `public/images/` و `public/og-default.png` (أعد توليدها بـ`node scripts/generate-og-image.mjs` أو ضع صورتك 1200×630).
- `public/site.webmanifest`: الاسم والاسم القصير.
- `src/shared/style/tokens.css`: الألوان والخطوط (وغيّر `themeColor` في `site.config.ts` معها).
- `package.json`: اسم المشروع.
