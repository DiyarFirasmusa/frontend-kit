# هيكل موقع الـplayground

قالب موقع عام (واجهة فقط) بنفس عائلة قواعد الداشبورد: أسماء kebab-case، مجلد لكل ميزة، TypeScript صارم، oxlint وoxfmt، Vitest وPlaywright، وi18next بالعربي (RTL) افتراضياً وإنجليزي.
المحتوى كله تجريبي لشركة وهمية ("شركة المثال" / "Example Company"). لا يوجد فيه اسم مشروع حقيقي ولا سر ولا ملف `.env` ملتزم.
المجلد `playground/` مستثنى من git، فلا يُنشر.

## التشغيل

```text
npm install
npm run setup:env        # ينسخ .env.example إلى .env.local (مرة واحدة، يشتغل على ويندوز ولينكس)
npm run dev              # http://localhost:5190  (المنفذ ثابت، لو انشغل يفشل ولا يغيّره)
npm run e2e:install      # مرة واحدة: يثبّت متصفح Chromium للاختبارات
npm run check            # typecheck + lint + format + i18n + env + css + tooling + unit
npm run check:full       # check + build + e2e
```

ملاحظة مهمة عن `lint` و`fmt` داخل هذا المجلد بالذات: `oxlint` و`oxfmt` يحترمان ملف `.gitignore` للمستودع الأب، وفيه `playground/`، فيقولان "لا توجد ملفات". هذا يحصل فقط لأن المجلد داخل المستودع. إذا نسخت القالب لمستودع مستقل يشتغلان عادي. للتجربة هنا: شغّلهم من نسخة خارج المستودع، أو نفّذ `git init` داخل المجلد (وبهذا يشتغل husky أيضاً).

## الصفحات

كل رابط عام يبدأ بلغته: `/ar/...` أو `/en/...`.

| الصفحة | المسار | فيها |
| --- | --- | --- |
| الرئيسية | `/ar` و `/en` | بطل، ثلاث خدمات، أرقام، آخر خبرين، دعوة للتواصل |
| من نحن | `/ar/about` | القصة، القيم، الفريق |
| خدماتنا | `/ar/services` | أربع خدمات، كيف نعمل (3 خطوات) |
| الأخبار | `/ar/news` | قائمة المقالات |
| مقال | `/ar/news/<slug>` | مقال كامل، تاريخ، مدة القراءة، مقالات ذات صلة. الـslug إنجليزي وواحد للغتين |
| تواصل معنا | `/ar/contact` | فورم (اسم، بريد، هاتف اختياري، رسالة) بتحقق في المتصفح وفي السيرفر |
| غير موجودة / خطأ | أي رابط خطأ | صفحة 404 حقيقية (HTTP 404) وصفحة 500 بدون تفاصيل، وكلاهما `noindex` |
| `/` | تحويل 302 | يوجّه للغة المحفوظة بالكوكي، ثم لغة المتصفح، ثم العربي |
| `/robots.txt` و `/sitemap.xml` | ملفات | تُبنى من قائمة التنقل والمقالات، بدون تكرار يدوي |

## الستاك

| الجزء | الأداة | النسخة |
| --- | --- | --- |
| الإطار | TanStack Start (React 19، مسارات ملفات، SSR) | start 1.169.7، router 1.170.46 |
| البناء | Vite 8 + `@vitejs/plugin-react` | 8.3.8 |
| السيرفر عند التشغيل | Nitro (يطلع `.output/server/index.mjs`) | `3.0.261103-rc` مثبتة بالضبط |
| اللغة | TypeScript صارم | 7.0.2 |
| الأنماط | Tailwind CSS 4 + tokens في ملف واحد | 4.3.5 |
| اللغات | i18next + react-i18next، العربي RTL افتراضي والإنجليزي LTR، اللغة في الرابط | 27.2.9 / 18.0.3 |
| حالة العميل | Zustand فقط (الثيم وقائمة الموبايل) | 5.1.0 |
| الفورم | react-hook-form + zod 4 | 7.92 / 4.6.7 |
| الخطوط | Cairo (للعربي) من fontsource بدون CDN، والإنجليزي بخط النظام | 5.3.0 |

لا يوجد TanStack Query ولا axios: الموقع محتواه ثابت، والفورم يستعمل server function.

### قرار Nitro

`nitro` ما له إلا نسخة rc (`3.0.261103-rc`، وهي الـ`latest` على npm). اخترتها لأن TanStack Start يوثّق Nitro لتشغيل Node وDocker، وثبّتها بالضبط (بدون `^`) حتى لا تتغير وحدها. التحديثات تجي عن طريق Dependabot كمقترح يمرّ على الـCI. إذا حبيت تتجنب rc: Cloudflare (`@cloudflare/vite-plugin`) أو Netlify بدل Nitro، وتتغير فقط `vite.config.ts` وطريقة النشر.

## الأدوات والأوامر

| الغرض | الأداة | الأمر |
| --- | --- | --- |
| فحص الأنواع | `tsc` | `npm run typecheck` |
| اللنت | oxlint (`oxlint.config.ts`، بدون أي تحذير مسموح) | `npm run lint:check` / `npm run lint` |
| التنسيق | oxfmt (`oxfmt.config.ts`) | `npm run fmt:check` / `npm run fmt` |
| اختبارات الوحدة | Vitest 5 + Testing Library + jsdom، مع حدود تغطية | `npm run test` / `npm run test:coverage` |
| اختبارات E2E | Playwright + axe | `npm run test:e2e` (يبني ويشغّل نسخة الإنتاج على المنفذ 5191) |
| مفاتيح الترجمة | `scripts/validate-i18n.ts` | `npm run i18n:validate` |
| متغيرات البيئة | مخطط zod واحد + `check-env-example` | `npm run check:env` |
| اتجاه CSS | `scripts/check-logical-css.ts` يمنع left/right الفيزيائية | `npm run check:css` |
| ربط الأدوات | `scripts/check-tooling.ts`: كل أداة موجودة ومربوطة في CI | `npm run check:tooling` |
| الكومت | husky + lint-staged + commitlint | يحتاج المجلد يكون git repo (`prepare` ما يفشل لو ما كان) |
| فحص الحزم | `npm audit --audit-level=high` | `npm run audit` |
| صورة المشاركة | `scripts/generate-og-image.mjs` يكتب `public/og-default.png` (1200×630) | `node scripts/generate-og-image.mjs` |

اختبارات E2E مقسومة إلى مشاريع Playwright:

| المشروع | ماذا يفحص |
| --- | --- |
| `raw` | رد السيرفر الخام بدون JavaScript، مثل الزاحف: SEO، hreflang، sitemap، robots، أكواد الحالة، الهيدرز |
| `ar-desktop` `en-desktop` | كل الصفحات، التنقل، الفورم، التوصيل، الثيم |
| `ar-phone` `en-phone` | نفس الشيء على شاشة موبايل (Pixel 7) مع قائمة الموبايل |
| `ar-dark` `en-dark` | نفس الشيء بالمظهر الداكن |
| `perf-ar-phone` `perf-en-desktop` | ميزانية CLS تحت 0.01، تشتغل بعد الباقي لحاله حتى لا تقيس ضغط الجهاز |

كل اختبار واجهة يفشل لو ظهر خطأ في الكونسول أو استثناء غير ممسوك (أخطاء hydration وانتهاكات CSP تظهر هنا).
`E2E_BASE_URL=https://...` يشغّل نفس الاختبارات على موقع منشور بدون بناء محلي.

## اللغة في الرابط (SEO)

- `/ar/...` و`/en/...`: اللغة أول جزء من الرابط، وهي مصدر الحقيقة. `<html lang dir>` يطلع من السيرفر صحيح من أول HTML، ولا يتغير بعد التحميل.
- لكل صفحة: canonical لنفسها، وروابط `hreflang` للغتين (`ar-IQ`، `en`) و`x-default` (يشير للعربي)، والصفحتان تشيران لبعض.
- نسخة i18next جديدة لكل طلب (`getRouter()`)، فلا يمكن أن يشوف زائر لغة زائر ثاني.
- الترجمات مستوردة بشكل ثابت، فالنص في أول HTML ما يطلع كمفتاح خام أبداً. الترجمة الناقصة لا تُملأ من اللغة الثانية؛ الفاليديتور يفشل بدلها.
- الأحرف الكبيرة والسلاش الأخير في الرابط يحوَّلان 301 للشكل الواحد (في `src/start.ts`).
- المواقع غير الإنتاجية (`VITE_ALLOW_INDEXING` غير `true`) تقدّم `noindex` وـ`Disallow: /` في robots، فلا يُفهرس موقع التجربة بالغلط.

## هيكل المجلدات

```text
website/
├── e2e/
│   ├── fixtures/                → app.ts (اللغة، حارس الكونسول، قائمة PAGES) + html.ts (قارئ HTML الخام)
│   ├── raw/                     → seo، crawl-files، status-codes، security-headers (بدون متصفح)
│   └── ui/                      → smoke، navigation، contact، a11y، layout-shift
├── public/                      → favicon.svg، og-default.png، site.webmanifest، images/ (أغلفة SVG)
├── scripts/                     → validate-i18n، check-env-example، check-logical-css، check-tooling،
│                                  e2e-server (يبني ويشغّل)، prepare (husky آمن)، setup-env، generate-og-image
├── deploy/nginx/site.conf       → تقوية nginx (حدود، rate limit، منع الماسحات، كاش للملفات المجزّأة)
├── .github/                     → workflows/ci.yml، dependabot.yml
├── src/
│   ├── router.tsx               → getRouter(): نسخة i18n جديدة لكل طلب، الـnonce، صفحات الخطأ
│   ├── start.ts                 → ميدلوير الطلب: CSRF، تحويل 301 للرابط الواحد، هيدرز الأمان، X-Robots-Tag
│   ├── routeTree.gen.ts         → مولّد، لا يُعدَّل (ملتزم حتى يشتغل typecheck بدون بناء)
│   ├── routes/                  → ملفات رفيعة فقط: head()، loader، الحاوية
│   │   ├── __root.tsx           → المستند <html lang dir>، الستايل، الخطوط، وسوم الفشل (noindex)
│   │   ├── index.tsx            → "/" تحويل 302 للغة
│   │   ├── $locale.tsx          → يتحقق من اللغة (غير ذلك 404) ويرسم الهيدر والفوتر
│   │   ├── $locale/             → index، about، services، contact، news/index، news/$slug
│   │   └── robots[.]txt.ts  sitemap[.]xml.ts
│   ├── config/                  → site.config.ts (الأسماء والبريد)، nav.config.ts (يغذّي الهيدر والفوتر والـsitemap)
│   ├── features/
│   │   ├── fallback/            → not-found، route-error
│   │   └── website/<feature>/   → home، about، services، contact، news (index.tsx + use-*-page.ts + *-head.ts + locales/)
│   ├── shared/
│   │   ├── components/          → header، footer، container، picture (يفرض width/height/alt)، article-card، ...
│   │   ├── env/                 → schema.ts (zod: كل المتغيرات) + public-env.ts
│   │   ├── lib/i18n/            → languages.ts (مصدر الحقيقة)، create-i18n.ts، resources.ts
│   │   ├── lib/seo/             → seo() و site.ts و jsonld.ts و sitemap.ts و site-entries.ts
│   │   ├── server/              → security-headers.ts، env.server.ts، root-redirect.ts
│   │   ├── store/               → theme-store.ts، menu-store.ts (Zustand)
│   │   ├── style/               → tokens.css (الألوان، الخطوط، الأحجام) + styles.css
│   │   ├── locales/             → ar.json، en.json (النصوص العامة)
│   │   └── utils/               → cx، format-date، single-flight
│   └── test/                    → setup.ts، render.tsx
├── .env.example                 → كل المتغيرات، مشروحة (الملف الوحيد المسموح ملتزماً)
├── Dockerfile  docker-compose.yml  .dockerignore
├── vite.config.ts  vitest.config.ts  playwright.config.ts  tsconfig.json
├── oxlint.config.ts  oxfmt.config.ts  commitlint.config.ts  .lintstagedrc.json  .husky/
└── .nvmrc  .npmrc  .editorconfig  .gitattributes  .vscode/  package.json
```

### هيكل الميزة الواحدة (مثال: الأخبار)

```text
features/website/news/
├── index.tsx                    → القائمة: JSX + استدعاء use-news-list-page فقط
├── use-news-list-page.ts        → يقرأ اللغة من الراوت ويجهّز الكروت
├── news-head.ts                 → seo() للصفحة (عنوان، وصف، breadcrumb)
├── data/articles.ts             → المقالات التجريبية (تُستبدل بـCMS أو API)
├── pages/article/               → صفحة المقال: index.tsx، use-article-page.ts، article-head.ts، load-article.ts (يرمي 404)
├── locales/{ar,en}.json         → نصوص الميزة
└── *.test.ts                    → اختبارات بجانب الكود
```

## القواعد (وكيف تُفرض)

1. كل صفحة عامة تعلن SEO عبر `head()` وداخلها دالة `seo()` الوحيدة. لا `<title>` ولا `<meta>` داخل المكونات. تُفرض باختبار `raw/seo.spec.ts` على كل صفحة في `PAGES`.
2. اللغة في الرابط، وcanonical لكل لغة، وhreflang للاثنتين مع `x-default` وتبادل الروابط. يُفرض بـ`seo.test.ts` و`raw/seo.spec.ts` و`raw/crawl-files.spec.ts`.
3. الصفحات الخاصة والفاشلة `noindex` بالوسم والهيدر، وليست `Disallow` في robots. يُفرض بـ`raw/status-codes.spec.ts`.
4. المورد المفقود 404 حقيقي، والمنقول 301، ولا نص "غير موجود" بحالة 200. يُفرض بـ`raw/status-codes.spec.ts`.
5. لا ملف `.env*` ملتزم إلا `.env.example`، وكل متغير يمر على مخطط zod عند البناء، وكل مفتاح بالمخطط موجود في `.env.example`، وكل `VITE_*` عام (ممنوع فيه سر). يُفرض بـ`check:env` و`check:tooling` والبناء نفسه.
6. كل صفحة تمر على axe بالعربي والإنجليزي والموبايل والداكن (serious وcritical تفشل، مع `wcag22aa`). يُفرض بـ`ui/a11y.spec.ts`.
7. RTL بالتصميم: خصائص منطقية فقط، والأيقونات الاتجاهية تنعكس، و`<html dir>` من السيرفر. يُفرض بـ`check:css` والمشاريع العربية.
8. لا نص مكتوب داخل الواجهة: كله من ملفات اللغات، وبنفس المفاتيح بالعربي والإنجليزي، والجمع العربي كامل (`readTime`). يُفرض بـ`i18n:validate` والـpre-commit.
9. الأداء ميزانية: CLS تحت 0.01، والخطوط ذاتية الاستضافة ومُحمَّلة مسبقاً، والصور بـwidth وheight وalt. يُفرض بـ`ui/layout-shift.spec.ts` ومكوّن `Picture`.
10. هيدرز الأمان وCSP من وحدة واحدة، مع nonce جديد لكل رد، ومُختبرة. تُرسل من التطبيق فقط (لا nginx ولا CDN). تُفرض بـ`security-headers.test.ts` و`raw/security-headers.spec.ts`.
11. بوابة واحدة في كل مكان: نفس الأوامر محلياً وفي الـpre-commit وفي `ci.yml`، وسكربت `check:tooling` يفشل لو أداة مضبوطة وما هي مربوطة بالـCI.
12. الإرسال (submit) أحادي الطلب: ضغطة ثانية أثناء الإرسال لا تفعل شيئاً (`createSingleFlight`). يُفرض بـ`single-flight.test.ts` و`contact-form.test.tsx`.

## كيف تضيف صفحة

1. أنشئ `src/features/website/<name>/` فيه `index.tsx` و`use-<name>-page.ts` و`<name>-head.ts` و`locales/ar.json` و`locales/en.json` (مفاتيح من مستويين `group.key`).
2. سجّل ملفي اللغة في `src/shared/lib/i18n/resources.ts`.
3. أنشئ الراوت `src/routes/$locale/<name>.tsx` (يحتوي `head` والمكوّن فقط).
4. أضف عنصراً لـ`src/config/nav.config.ts`: يظهر وحده في الهيدر والفوتر والـsitemap. (اختبار `nav.config.test.ts` يتأكد أن `path` و`to` متطابقان.)
5. أضف الصفحة لقائمة `PAGES` في `e2e/fixtures/app.ts`: تدخل فوراً في فحوص SEO وaxe والتنقل وCLS.
6. شغّل `npm run check` ثم `npm run test:e2e`.

## الأمان

- هيدرز كل رد HTML: CSP (مبنية من ثوابت مسماة، بدون `unsafe-inline` ولا `unsafe-eval` بالإنتاج) مع nonce جديد لكل رد، HSTS، `X-Content-Type-Options`، `X-Frame-Options: DENY`، `Referrer-Policy`، `Permissions-Policy`، `COOP`. الملف: `src/shared/server/security-headers.ts`.
- مصادر خارجية (تحليلات، خرائط، كابتشا) تُضاف فقط في الثابت `THIRD_PARTY` بنفس الملف.
- `CSP_MODE=report-only` للطرح الأول، ثم `enforce`.
- الفورم: تحقق zod في المتصفح وفي السيرفر، وحقل فخ (honeypot) للبوتات، وحماية CSRF لدوال السيرفر.
- `CONTACT_WEBHOOK_URL` اختياري ويقرأ فقط في السيرفر. بدونه الرسالة تُقبل وتُهمل (وضع تجريبي).
- `assetsInlineLimit: 0` حتى تمنع CSP صور وخطوط `data:`.

## النشر

- `Dockerfile`: مراحل (deps، build، runtime)، مستخدم غير root، فحص صحة. متغيرات `VITE_*` تدخل وقت البناء كـbuild args.
- `docker-compose.yml`: التطبيق خلف nginx مع `service_healthy`.
- `deploy/nginx/site.conf`: حدود الحجم والوقت، rate limit للفورم، منع الماسحات وملفات النقاط (ما عدا `.well-known`)، كاش سنة للملفات المجزّأة. لا هيدرز أمان فيه عن قصد.
- ما أنجزته من هذا الجزء: كتبته فقط. Docker وnginx غير مثبتين على هذا الجهاز، فلم أبنِ الصورة ولم أشغّل `nginx -t`. فحصها يتم أول مرة في الـCI (job `docker`) وعلى السيرفر.

## الحالة

انظر نتائج الفحوص الفعلية في تقرير التسليم. الخلاصة وقت الكتابة: `typecheck` و`lint:check` و`fmt:check` و`i18n:validate` و`check:env` و`check:css` و`check:tooling` والبناء تمر، و105 اختبار وحدة تمر في 17 ملفاً، و210 اختبار E2E تمر (12 تُتخطى عن قصد لأنها خاصة بالموبايل أو بالكيبورد).

### غير موجود بعد (بالترتيب)

- Lighthouse CI وميزانية حجم الحزمة (الـJS لصفحة الرئيسية حوالي 165 كيلوبايت gzip، ومعظمها React وrouter).
- فحص الروابط الخارجية، وhtml-validate، واختبار بصري بالصور.
- صور المقالات SVG بسيطة، وصورة المشاركة PNG لون واحد: استبدلها بتصميم حقيقي.
- حد معدل (rate limit) داخل التطبيق للفورم: موجود فقط في nginx.
- workflow للنشر (`deploy.yml`) وفحص ما بعد النشر بـ`E2E_BASE_URL`.
- `security.txt`.
