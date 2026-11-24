import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

export type ProfileId = 'website' | 'dashboard' | 'react' | 'fullstack'

interface Project {
  id: ProfileId
  name: Bilingual
  fits: Bilingual
  gets: Bilingual[]
  stack: string[]
  ask: Bilingual
  /** Which rule groups it installs besides the shared one. */
  rules: string[]
}

export const projects: Project[] = [
  {
    id: 'website',
    name: t('Website', 'موقع'),
    fits: t('Public sites that people find through search and shared links: shops, portals, marketing, content.', 'مواقع عامة يصل إليها الناس من البحث والروابط المشاركة: متاجر، بوابات، تسويق، محتوى.'),
    gets: [
      t('Pages rendered on the server, with real 404s and redirects.', 'صفحات يبنيها الخادم، مع صفحات 404 وإعادة توجيه صحيحة.'),
      t('SEO and share previews as part of every public page.', 'الـ SEO ومعاينات المشاركة جزء من كل صفحة عامة.'),
      t('A speed budget for real phones.', 'ميزانية سرعة تناسب الهواتف الحقيقية.'),
      t('Server functions for secrets and cookies.', 'دوال على الخادم للأسرار والـ cookies.'),
    ],
    stack: ['TanStack Start', 'TanStack Query', 'Tailwind', 'i18next', 'Vitest', 'Playwright'],
    ask: t('build the products catalogue from this API', 'ابن كتالوج المنتجات من هذا الـ API'),
    rules: ['website'],
  },
  {
    id: 'dashboard',
    name: t('Dashboard', 'لوحة تحكم'),
    fits: t('Admin panels and internal tools: lists, forms, roles, long working days.', 'لوحات الإدارة والأدوات الداخلية: قوائم ونماذج وأدوار، وأيام عمل طويلة.'),
    gets: [
      t('Tables the server pages and sorts, with their state in the URL.', 'جداول يرتب الخادم بياناتها ويقسمها إلى صفحات، وحالتها في الرابط.'),
      t('Permissions on every route and action.', 'صلاحيات على كل مسار وكل إجراء.'),
      t('A folder map and routing rules for the framework you pick.', 'خريطة مجلدات وقواعد مسارات للإطار الذي تختاره.'),
      t('Edit conflicts, unsaved-change warnings and error monitoring.', 'تعارض التعديلات، وتنبيه عند وجود تغييرات غير محفوظة، ومراقبة الأخطاء.'),
    ],
    stack: ['Vite + TanStack Router', 'TanStack Start SPA', 'Next.js', 'TanStack Table', 'TanStack Query'],
    ask: t('add an orders page with a table and filters', 'أضف صفحة طلبات فيها جدول وفلاتر'),
    rules: ['dashboard', 'dashboard/variants/next', 'dashboard/variants/tanstack-start'],
  },
  {
    id: 'react',
    name: t('Any other frontend', 'أي واجهة أخرى'),
    fits: t('Any other frontend project, React or not, with the stack it already has.', 'أي مشروع واجهات آخر، بـ React أو بغيره، وبالتقنيات التي فيه أصلا.'),
    gets: [
      t('Neutral rules, rewritten for your framework, router, data library and styling.', 'قواعد عامة، يعيد الإعداد كتابتها لتناسب إطارك وموجهك ومكتبة بياناتك وتنسيق واجهتك.'),
      t('An auth rule for apps that hold their own tokens.', 'قاعدة مصادقة للتطبيقات التي تحتفظ بالـ tokens بنفسها.'),
      t('Hooks that use your linter, formatter and test runner.', 'حراس يستخدمون أداة lint وأداة التنسيق ومشغل الاختبارات الذي عندك.'),
      t('JavaScript projects and monorepos too.', 'ومشاريع JavaScript والـ monorepo أيضا.'),
    ],
    stack: ['Next.js', 'React Router', 'Vite', 'Vue', 'Svelte', 'Angular', 'Plain JavaScript'],
    ask: t('create a profile form with validation', 'أنشئ نموذجا للملف الشخصي مع تحقق من المدخلات'),
    rules: ['react'],
  },
  {
    id: 'fullstack',
    name: t('Site + admin', 'موقع + إدارة'),
    fits: t('A public site and its admin panel living in one project.', 'موقع عام ولوحة إدارته، في مشروع واحد.'),
    gets: [
      t('Website rules only under the site’s folders.', 'قواعد الموقع داخل مجلدات الموقع فقط.'),
      t('Dashboard rules only under the admin’s folders.', 'قواعد لوحة التحكم داخل مجلدات الإدارة فقط.'),
      t('Both sets of skills switched on.', 'مهارات الموقع ومهارات لوحة التحكم تعمل كلها.'),
      t('Separate API addresses, and per-app commands where you have them.', 'عنوان API لكل تطبيق، وأوامر خاصة بكل تطبيق إن وجدت.'),
    ],
    stack: ['TanStack Start', 'src/admin', 'src/routes/admin'],
    ask: t('add a blog to the site and its editor to the admin', 'أضف مدونة إلى الموقع، ومحررها إلى لوحة الإدارة'),
    rules: ['website', 'dashboard'],
  },
]
