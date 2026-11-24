import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

/** What each rule file says, keyed by its group and file name. */
export const ruleGuides: Record<string, Bilingual> = {
  'shared/accessibility.md': t('Focus, input, announcements and reflow: the WCAG 2.2 AA criteria that get missed.', 'التركيز، والإدخال، والإعلانات، وإعادة التدفق: معايير WCAG 2.2 AA اللي عادةً تنسى.'),
  'shared/dependencies.md': t('Adding packages safely, and the versions that carry known security fixes.', 'شلون تضيف حزم بأمان، والإصدارات اللي فيها إصلاحات أمنية معروفة.'),
  'shared/formatting.md': t('Numbers, money, dates, digits and search in the languages of the project.', 'الأرقام، والفلوس، والتواريخ، وشكل الخانات، والبحث بلغات المشروع.'),
  'shared/git.md': t('A branch per task, your yes before commit and push, and never a PR opened by the assistant.', 'فرع لكل مهمة، وموافقتك قبل الحفظ والرفع، والمساعد أبداً ما يفتح pull request.'),
  'shared/i18n.md': t('How text is translated: keys, bundles, plurals, every language in the same change.', 'شلون تنترجم النصوص: المفاتيح، والحزم، والجمع، وكل اللغات بنفس التغيير.'),
  'shared/naming.md': t('How files, components, functions and variables are named.', 'شلون نسمّي الملفات، والمكوّنات، والدوال، والمتغيرات.'),
  'shared/project.md': t('Your project’s own facts: where things are, decisions, versions and local quirks.', 'معلومات مشروعك نفسه: وين كل شي، والقرارات، والإصدارات، وخصوصياته.'),
  'shared/quality-bar.md': t('The definition of done: types, shape, states, accessibility, direction, proof.', 'متى ينحسب الشغل خلصان: الأنواع، والبنية، والحالات، والوصول، والاتجاه، والإثبات.'),
  'shared/react.md': t('How components, hooks, navigation and imports are written in React and TypeScript.', 'شلون تنكتب المكوّنات، والـ hooks، والتنقل، والاستيراد بـ React وTypeScript.'),
  'shared/rtl.md': t('Both directions: logical CSS, mirrored icons, inputs, tables and mixed text.', 'الاتجاهين: CSS منطقي، أيقونات معكوسة، حقول، جداول، ونص مخلوط.'),
  'shared/scope.md': t('Do all of what was asked and nothing else. A question gets an answer.', 'سوّي كل اللي انطلب، ولا شي غيره. والسؤال جوابه كلام.'),
  'shared/security.md': t('HTML, redirects, server code, tokens, uploads and monitoring without personal data.', 'HTML، والتحويلات، وكود السيرفر، والرموز، والملفات المرفوعة، والمراقبة بدون بيانات شخصية.'),
  'shared/styles.md': t('Colour tokens, type, responsive layout, motion and no layout shift.', 'رموز الألوان، والخط، والتخطيط المتجاوب، والحركة، وبدون ما يقفز التخطيط.'),
  'shared/testing.md': t('What to test, how, and the things a test must never do.', 'شنو نختبر وشلون، وشنو الاختبار ما لازم يسويه أبداً.'),
  'shared/typescript.md': t('A tsconfig that checks the code, and what changed in TypeScript 6 and 7.', 'ملف tsconfig يفحص الكود فعلاً، وشنو تغيّر بـ TypeScript 6 و7.'),

  'website/api-layer.md': t('Where server and browser code call the API, errors, sessions and services.', 'وين ينادي كود السيرفر والمتصفح الـ API، والأخطاء، والجلسات، والخدمات.'),
  'website/data-loading.md': t('Loaders, server functions, mutations and caching.', 'تحميل البيانات، ودوال السيرفر، والعمليات، والكاش.'),
  'website/performance.md': t('The speed budget for real phones: first byte, images, fonts and JavaScript.', 'حدود السرعة على موبايلات حقيقية: أول بايت، والصور، والخطوط، وJavaScript.'),
  'website/routing-ssr.md': t('Thin routes, search values, guards, 404 and hydration that matches.', 'مسارات خفيفة، وقيم البحث، والحراس، و404، وتطابق السيرفر مع المتصفح.'),
  'website/seo-share.md': t('Titles, canonical links, structured data, share previews and crawl files.', 'العناوين، والروابط الرسمية، والبيانات المنظمة، ومعاينات المشاركة، وملفات الزحف.'),

  'dashboard/api-layer.md': t('One client, one envelope, token refresh, services, query keys and downloads.', 'عميل واحد، وغلاف واحد، وتجديد الرمز، والخدمات، ومفاتيح الاستعلام، والتنزيلات.'),
  'dashboard/data-tables.md': t('Server-driven tables: columns, states, actions, selection and accessibility.', 'جداول يمشّيها السيرفر: أعمدة، حالات، أفعال، تحديد، ووصول.'),
  'dashboard/error-monitoring.md': t('Sentry set up without personal data, with boundaries and source maps.', 'إعداد Sentry بدون بيانات شخصية، مع حدود الأخطاء وخرائط المصدر.'),
  'dashboard/forms-crud.md': t('Dialog or page, submit, invalidation, delete and edit conflicts.', 'نافذة أو صفحة، والإرسال، والتحديث، والحذف، وتعارض التعديل.'),
  'dashboard/permissions.md': t('One list of permission names and how the interface follows it.', 'قائمة وحدة لأسماء الصلاحيات، وشلون الواجهة تمشي عليها.'),
  'dashboard/routing.md': t('Layout groups, guards, loaders and list state in the URL.', 'مجموعات التخطيط، والحراس، والمحمّلات، وحالة القوائم بالرابط.'),

  'dashboard/variants/next/error-monitoring.md': t('Sentry on Next.js, server and client.', 'Sentry على Next.js، بالسيرفر والمتصفح.'),
  'dashboard/variants/next/routing.md': t('App Router pages, client data and guards without beforeLoad.', 'صفحات App Router، وبيانات المتصفح، وحراس بدون beforeLoad.'),
  'dashboard/variants/next/structure.md': t('The folder map of a Next.js dashboard.', 'خريطة مجلدات لوحة Next.js.'),
  'dashboard/variants/tanstack-start/framework.md': t('Start in SPA mode: what runs where, hydration, end-to-end and environment.', 'Start بوضع SPA: شنو يشتغل وين، والمطابقة، والاختبار من البداية للنهاية، والبيئة.'),
  'dashboard/variants/tanstack-start/structure.md': t('The folder map of a TanStack Start dashboard.', 'خريطة مجلدات لوحة TanStack Start.'),

  'react/auth.md': t('Sessions in the browser: single refresh, tabs, sign-out and safe redirects.', 'الجلسات بالمتصفح: تجديد واحد، والتبويبات، والخروج، وتحويل آمن.'),
  'react/data-and-state.md': t('Server data against client state, one API client and state in the URL.', 'بيانات السيرفر مقابل حالة المتصفح، وعميل API واحد، والحالة بالرابط.'),
  'react/forms.md': t('One schema, inline errors, single submit and a guard for unsaved changes.', 'مخطط واحد، وأخطاء بمكانها، وإرسال واحد، وحارس للتغييرات اللي ما انحفظت.'),
  'react/nextjs.md': t('Next.js App Router: public server code, the proxy, caching and generated types.', 'Next.js App Router: كود السيرفر العام، والـ proxy، والكاش، والأنواع المولّدة.'),
  'react/react-router.md': t('React Router in its three modes: guards, loaders, titles and real 404s.', 'React Router بأوضاعه الثلاثة: الحراس، والمحمّلات، والعناوين، و404 حقيقية.'),
  'react/routing.md': t('Thin routes, guards, real links, focus and code splitting, whatever the router.', 'مسارات خفيفة، وحراس، وروابط حقيقية، والتركيز، وتقسيم الكود، مهما كان الراوتر.'),
  'react/structure.md': t('Your own layout, or feature folders in an empty project, with one import direction and small files.', 'ترتيبك انت، أو مجلدات ميزات بمشروع فاضي، مع اتجاه استيراد واحد وملفات صغيرة.'),
}
