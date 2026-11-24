import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

/** What each rule file says, keyed by its group and file name. */
export const ruleGuides: Record<string, Bilingual> = {
  'shared/accessibility.md': t('Focus, input, announcements and reflow: the WCAG 2.2 AA criteria that get missed.', 'التركيز والإدخال والإعلانات وإعادة التدفق: معايير WCAG 2.2 AA التي كثيراً ما تُهمل.'),
  'shared/dependencies.md': t('Adding packages safely, and the versions that carry known security fixes.', 'كيف تضيف الحزم بأمان، والإصدارات التي تحمل إصلاحات أمنية معروفة.'),
  'shared/formatting.md': t('Numbers, money, dates, digits and search in the languages of the project.', 'الأعداد والمبالغ والتواريخ وشكل الأرقام والبحث، بلغات المشروع.'),
  'shared/git.md': t('A branch per task, your yes before commit and push, and never a PR opened by the assistant.', 'فرع لكل مهمة، وموافقتك قبل الحفظ والرفع، ولا يفتح المساعد pull request أبداً.'),
  'shared/i18n.md': t('How text is translated: keys, bundles, plurals, every language in the same change.', 'كيف تُترجم النصوص: المفاتيح والحزم وصيغ الجمع، وكل اللغات في التغيير نفسه.'),
  'shared/naming.md': t('How files, components, functions and variables are named.', 'كيف نسمّي الملفات والمكوّنات والدوال والمتغيرات.'),
  'shared/project.md': t('Your project’s own facts: where things are, decisions, versions and local quirks.', 'معلومات مشروعك نفسه: أين توجد الأشياء، والقرارات، والإصدارات، والخصوصيات المحلية.'),
  'shared/quality-bar.md': t('The definition of done: types, shape, states, accessibility, direction, proof.', 'تعريف الإنجاز: الأنواع والبنية والحالات وسهولة الوصول والاتجاه والإثبات.'),
  'shared/react.md': t('How components, hooks, navigation and imports are written in React and TypeScript.', 'كيف تُكتب المكوّنات والـ hooks والتنقل والاستيراد في React وTypeScript.'),
  'shared/rtl.md': t('Both directions: logical CSS, mirrored icons, inputs, tables and mixed text.', 'الاتجاهان: CSS منطقي، وأيقونات معكوسة، والحقول والجداول والنص المختلط.'),
  'shared/scope.md': t('Do all of what was asked and nothing else. A question gets an answer.', 'نفّذ كل ما طُلب منك ولا شيء غيره. وإذا سألت فالمطلوب جواب.'),
  'shared/security.md': t('HTML, redirects, server code, tokens, uploads and monitoring without personal data.', 'HTML والتحويلات وكود الخادم والـ tokens والملفات المرفوعة والمراقبة دون بيانات شخصية.'),
  'shared/styles.md': t('Colour tokens, type, responsive layout, motion and no layout shift.', 'رموز الألوان والخطوط والتخطيط المتجاوب والحركة، دون قفزات في التخطيط.'),
  'shared/testing.md': t('What to test, how, and the things a test must never do.', 'ماذا نختبر وكيف، وما لا يجوز للاختبار أن يفعله أبداً.'),
  'shared/typescript.md': t('A tsconfig that checks the code, and what changed in TypeScript 6 and 7.', 'ملف tsconfig يفحص الكود فعلاً، وما تغيّر في TypeScript 6 و7.'),

  'website/api-layer.md': t('Where server and browser code call the API, errors, sessions and services.', 'أين يستدعي كود الخادم وكود المتصفح الـ API، والأخطاء والجلسات والخدمات.'),
  'website/data-loading.md': t('Loaders, server functions, mutations and caching.', 'الـ loaders ودوال الخادم وعمليات التعديل والكاش.'),
  'website/performance.md': t('The speed budget for real phones: first byte, images, fonts and JavaScript.', 'حدود السرعة على هواتف حقيقية: أول بايت والصور والخطوط وJavaScript.'),
  'website/routing-ssr.md': t('Thin routes, search values, guards, 404 and hydration that matches.', 'مسارات خفيفة، وقيم البحث، والحراس، و404، وتطابق ما يعرضه الخادم مع المتصفح (hydration).'),
  'website/seo-share.md': t('Titles, canonical links, structured data, share previews and crawl files.', 'العناوين وروابط canonical والبيانات المنظّمة ومعاينات المشاركة وملفات الزحف.'),

  'dashboard/api-layer.md': t('One client, one envelope, token refresh, services, query keys and downloads.', 'عميل واحد، وغلاف واحد للاستجابة، وتجديد الـ token، والخدمات، ومفاتيح الاستعلام، والتنزيلات.'),
  'dashboard/data-tables.md': t('Server-driven tables: columns, states, actions, selection and accessibility.', 'جداول يقودها الخادم: الأعمدة والحالات والإجراءات والتحديد وسهولة الوصول.'),
  'dashboard/error-monitoring.md': t('Sentry set up without personal data, with boundaries and source maps.', 'إعداد Sentry دون بيانات شخصية، مع حدود الأخطاء وخرائط المصدر.'),
  'dashboard/forms-crud.md': t('Dialog or page, submit, invalidation, delete and edit conflicts.', 'نافذة أو صفحة، والإرسال، وتحديث البيانات، والحذف، وتعارض التعديل.'),
  'dashboard/permissions.md': t('One list of permission names and how the interface follows it.', 'قائمة واحدة بأسماء الصلاحيات، وكيف تلتزم بها الواجهة.'),
  'dashboard/routing.md': t('Layout groups, guards, loaders and list state in the URL.', 'مجموعات التخطيط والحراس والـ loaders وحالة القوائم في الرابط.'),

  'dashboard/variants/next/error-monitoring.md': t('Sentry on Next.js, server and client.', 'Sentry في Next.js، على الخادم والمتصفح.'),
  'dashboard/variants/next/routing.md': t('App Router pages, client data and guards without beforeLoad.', 'صفحات App Router وبيانات المتصفح والحراس دون beforeLoad.'),
  'dashboard/variants/next/structure.md': t('The folder map of a Next.js dashboard.', 'خريطة مجلدات لوحة Next.js.'),
  'dashboard/variants/tanstack-start/framework.md': t('Start in SPA mode: what runs where, hydration, end-to-end and environment.', 'Start في نمط SPA: ما الذي يعمل وأين، والـ hydration، واختبارات end-to-end، والبيئة.'),
  'dashboard/variants/tanstack-start/structure.md': t('The folder map of a TanStack Start dashboard.', 'خريطة مجلدات لوحة TanStack Start.'),

  'react/auth.md': t('Sessions in the browser: single refresh, tabs, sign-out and safe redirects.', 'الجلسات في المتصفح: تجديد واحد، والتبويبات، وتسجيل الخروج، وتحويلات آمنة.'),
  'react/data-and-state.md': t('Server data against client state, one API client and state in the URL.', 'بيانات الخادم مقابل حالة المتصفح، وعميل API واحد، والحالة في الرابط.'),
  'react/forms.md': t('One schema, inline errors, single submit and a guard for unsaved changes.', 'مخطط واحد، وأخطاء داخل الحقول، وإرسال واحد، وحارس للتغييرات غير المحفوظة.'),
  'react/nextjs.md': t('Next.js App Router: public server code, the proxy, caching and generated types.', 'Next.js App Router: كود الخادم العام، والـ proxy، والكاش، والأنواع المولّدة.'),
  'react/react-router.md': t('React Router in its three modes: guards, loaders, titles and real 404s.', 'React Router بأنماطه الثلاثة: الحراس والـ loaders والعناوين و404 حقيقية.'),
  'react/routing.md': t('Thin routes, guards, real links, focus and code splitting, whatever the router.', 'مسارات خفيفة، وحراس، وروابط حقيقية، والتركيز، وتقسيم الكود، أياً كان الـ router.'),
  'react/structure.md': t('Your own layout, or feature folders in an empty project, with one import direction and small files.', 'ترتيبك أنت، أو مجلدات الميزات في مشروع فارغ، مع اتجاه استيراد واحد وملفات صغيرة.'),
}
