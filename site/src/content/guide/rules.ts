import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

/** What each rule file says, keyed by its group and file name. */
export const ruleGuides: Record<string, Bilingual> = {
  'shared/accessibility.md': t('Making the app usable by everyone: where the focus goes, what people type, what a screen reader announces, and how the page reflows on a small screen. These are the WCAG 2.2 AA criteria that get missed.', 'جعل التطبيق قابلا للاستخدام من الجميع: أين يذهب التركيز، وما يكتبه الناس، وما يعلنه قارئ الشاشة، وكيف تعيد الصفحة ترتيب نفسها على الشاشة الصغيرة. هذه معايير WCAG 2.2 AA التي يكثر نسيانها.'),
  'shared/dependencies.md': t('How to add packages (code written by other people) safely, and which versions carry known security fixes.', 'كيف تضيف الحزم (كود كتبه آخرون) بأمان، وما الإصدارات التي فيها إصلاحات أمنية معروفة.'),
  'shared/formatting.md': t('How numbers, money, dates, digits and search work in the languages of the project.', 'كيف تعمل الأعداد والمبالغ والتواريخ وشكل الأرقام والبحث بلغات المشروع.'),
  'shared/git.md': t('A separate branch (line of work) for each task, your yes before saving a version (commit) or uploading it (push), and the assistant never opens a pull request (a request to merge your changes).', 'فرع (خط عمل) منفصل لكل مهمة، وموافقتك قبل حفظ نسخة (commit) أو رفعها (push)، والمساعد لا يفتح pull request (طلب دمج تغييراتك) أبدا.'),
  'shared/i18n.md': t('How text is translated: keys (the name each text is saved under), bundles, plural forms, and every language in the same change.', 'كيف تعمل ترجمة النصوص: المفاتيح (الاسم الذي يحفظ به كل نص) والحزم وصيغ الجمع، وكل اللغات في التغيير نفسه.'),
  'shared/naming.md': t('How files, screen pieces, functions and variables (names that hold a value) are named.', 'كيف نسمي الملفات وأجزاء الشاشة والدوال والمتغيرات (أسماء تحمل قيمة).'),
  'shared/project.md': t('The facts of your own project: where things are, the decisions taken, the versions in use and its local quirks.', 'معلومات مشروعك نفسه: أين الأشياء، والقرارات المتخذة، والإصدارات المستخدمة، وما يخص مشروعك وحده.'),
  'shared/quality-bar.md': t('The definition of done: correct types, structure, states, accessibility, text direction and proof.', 'متى يعتبر العمل منتهيا: الأنواع الصحيحة والبنية والحالات وسهولة الوصول واتجاه الكتابة والإثبات.'),
  'shared/react.md': t('How screen pieces, hooks (small reusable pieces of logic), navigation and imports are written in React and TypeScript.', 'كيف تكتب أجزاء الشاشة والـ hooks (قطع منطق صغيرة يعاد استخدامها) والتنقل والاستيراد في React وTypeScript.'),
  'shared/rtl.md': t('Writing in both directions, right-to-left (Arabic) and left-to-right: CSS that follows the direction, mirrored icons, input fields, tables and mixed text.', 'الكتابة بالاتجاهين، من اليمين إلى اليسار (العربية) والعكس: CSS يتبع الاتجاه، وأيقونات معكوسة، والحقول والجداول والنص المختلط.'),
  'shared/scope.md': t('Do all of what was asked and nothing else. A question gets an answer.', 'ينفذ المساعد كل ما طلبت ولا شيء غيره. والسؤال يأخذ جوابا.'),
  'shared/security.md': t('Protecting the app: HTML, redirects, server code, tokens (secrets that prove who is signed in), uploaded files, and monitoring without personal data.', 'حماية التطبيق: HTML والتحويلات وكود الخادم والـ tokens (أسرار تثبت من سجل دخوله) والملفات المرفوعة والمراقبة دون بيانات شخصية.'),
  'shared/styles.md': t('How the look is built: colour values, type, a layout that fits every screen size, motion, and no jumping while the page loads.', 'كيف يبنى الشكل: قيم الألوان والخطوط، وتخطيط يناسب كل أحجام الشاشات، والحركة، ودون قفزات أثناء تحميل الصفحة.'),
  'shared/testing.md': t('What to test, how to test it, and the things a test must never do.', 'ماذا نختبر وكيف، وما الذي لا يجوز للاختبار فعله أبدا.'),
  'shared/typescript.md': t('A tsconfig (the settings file for TypeScript) that really checks the code, and what changed in TypeScript 6 and 7.', 'ملف tsconfig (ملف إعدادات TypeScript) يفحص الكود فعلا، وما تغير في TypeScript 6 و7.'),

  'website/api-layer.md': t('Where server code and browser code call your backend (its API), and how errors, sessions and services are handled.', 'أين يستدعي كود الخادم وكود المتصفح الخادم الخلفي (الـ API)، وكيف تعالج الأخطاء والجلسات والخدمات.'),
  'website/data-loading.md': t('How data gets onto a page: loaders, server functions, changing data, and saved copies (caching).', 'كيف تصل البيانات إلى الصفحة: الـ loaders ودوال الخادم وتعديل البيانات والنسخ المحفوظة (الكاش).'),
  'website/performance.md': t('The speed budget for real phones: the first byte from the server, images, fonts and JavaScript.', 'حدود السرعة على هواتف حقيقية: أول بايت من الخادم والصور والخطوط وJavaScript.'),
  'website/routing-ssr.md': t('Thin routes (page addresses), search values, guards, 404 pages, and hydration that matches (what the server shows is what the browser shows).', 'مسارات (عناوين صفحات) خفيفة، وقيم البحث، والحراس، وصفحات 404، وتطابق ما يعرضه الخادم مع المتصفح (hydration).'),
  'website/seo-share.md': t('How search engines and chat apps see a page: titles, canonical links (the main address of a page), structured data, share previews and the files that guide crawlers.', 'كيف ترى محركات البحث وتطبيقات المحادثة الصفحة: العناوين وروابط canonical (العنوان الرئيسي للصفحة) والبيانات المنظمة ومعاينات المشاركة وملفات الزحف.'),

  'dashboard/api-layer.md': t('How the dashboard talks to your backend: one client, one response shape, token refresh (renewing the sign-in secret), services, query keys and downloads.', 'كيف تتحدث لوحة التحكم مع الخادم الخلفي: عميل واحد، وشكل واحد للاستجابة، وتجديد الـ token (تجديد سر الدخول)، والخدمات، ومفاتيح الاستعلام، والتنزيلات.'),
  'dashboard/data-tables.md': t('Tables driven by the server: columns, states, actions, selecting rows and accessibility.', 'جداول يقودها الخادم: الأعمدة والحالات والإجراءات وتحديد الصفوف وسهولة الوصول.'),
  'dashboard/error-monitoring.md': t('Sentry (a service that reports errors from the live app) set up without personal data, with error boundaries and source maps.', 'إعداد Sentry (خدمة تبلغك بالأخطاء في التطبيق المنشور) دون بيانات شخصية، مع حدود الأخطاء وخرائط المصدر.'),
  'dashboard/forms-crud.md': t('Adding, editing and deleting: dialog or page, sending, refreshing data, deleting, and conflicts when two people edit.', 'الإضافة والتعديل والحذف: نافذة أو صفحة، والإرسال، وتحديث البيانات، والحذف، وتعارض التعديل عندما يعدل شخصان.'),
  'dashboard/permissions.md': t('One list of permission names, and how the interface follows it.', 'قائمة واحدة بأسماء الصلاحيات، وكيف تتبعها الواجهة.'),
  'dashboard/routing.md': t('How pages are organised: layout groups, guards, loaders, and the state of lists kept in the web address.', 'كيف تنظم الصفحات: مجموعات التخطيط والحراس والـ loaders وحالة القوائم المحفوظة في عنوان الصفحة.'),

  'dashboard/variants/next/error-monitoring.md': t('Sentry (error reports from the live app) on Next.js, on the server and in the browser.', 'Sentry (تقارير أخطاء التطبيق المنشور) في Next.js، على الخادم والمتصفح.'),
  'dashboard/variants/next/routing.md': t('App Router pages, data in the browser and guards without beforeLoad.', 'صفحات App Router وبيانات المتصفح والحراس دون beforeLoad.'),
  'dashboard/variants/next/structure.md': t('The folder map of a Next.js dashboard.', 'خريطة مجلدات لوحة Next.js.'),
  'dashboard/variants/tanstack-start/framework.md': t('Start in SPA mode (the app runs inside the browser): what runs where, hydration, end-to-end tests and the environment.', 'Start في نمط SPA (يعمل التطبيق داخل المتصفح): ما يعمل وأين، والـ hydration، واختبارات end-to-end، والبيئة.'),
  'dashboard/variants/tanstack-start/structure.md': t('The folder map of a TanStack Start dashboard.', 'خريطة مجلدات لوحة TanStack Start.'),

  'react/auth.md': t('Sign-in sessions in the browser: a single token refresh, several tabs, sign-out and safe redirects.', 'جلسات تسجيل الدخول في المتصفح: تجديد واحد للـ token، وتبويبات متعددة، وتسجيل الخروج، وتحويلات آمنة.'),
  'react/data-and-state.md': t('Data from the server against the state of the screen, one client for your backend, and state kept in the web address.', 'بيانات الخادم مقابل حالة الشاشة، وعميل واحد للخادم الخلفي، والحالة المحفوظة في عنوان الصفحة.'),
  'react/forms.md': t('Forms with one schema (one description of the allowed input), errors shown inside the fields, a single send, and a guard for unsaved changes.', 'نماذج بمخطط واحد (وصف واحد للمدخلات المسموحة)، وأخطاء داخل الحقول، وإرسال واحد، وحارس للتغييرات غير المحفوظة.'),
  'react/nextjs.md': t('Next.js App Router: server code that is public, the proxy, saved copies (caching) and generated types.', 'Next.js App Router: كود الخادم العام، والـ proxy، والنسخ المحفوظة (الكاش)، والأنواع المولدة.'),
  'react/react-router.md': t('React Router in its three modes: guards, loaders, titles and real 404 pages.', 'React Router بأنماطه الثلاثة: الحراس والـ loaders والعناوين وصفحات 404 حقيقية.'),
  'react/routing.md': t('Thin routes (page addresses), guards, real links, focus and splitting the code into parts, whatever the router.', 'مسارات (عناوين صفحات) خفيفة، وحراس، وروابط حقيقية، والتركيز، وتقسيم الكود إلى أجزاء، مهما كان الـ router.'),
  'react/structure.md': t('Your own layout, or feature folders in an empty project, with one direction for imports and small files.', 'ترتيبك أنت، أو مجلدات الميزات في مشروع فارغ، مع اتجاه واحد للاستيراد وملفات صغيرة.'),
}
