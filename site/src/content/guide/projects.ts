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
    fits: t('Public sites that people find through search and shared links: shops, portals, marketing, content.', 'مواقع عامة يجدها الناس بالبحث والروابط: متاجر وبوابات وتسويق ومحتوى.'),
    gets: [
      t('Pages rendered on the server, with real 404s and redirects.', 'صفحات من الخادم مع 404 وتحويلات حقيقية.'),
      t('SEO and share previews as part of every public page.', 'تحسين البحث ومعاينات المشاركة في كل صفحة عامة.'),
      t('A speed budget for real phones.', 'حدود سرعة لهواتف حقيقية.'),
      t('Server functions for secrets and cookies.', 'دوال خادم للأسرار والكوكيز.'),
    ],
    stack: ['TanStack Start', 'TanStack Query', 'Tailwind', 'i18next', 'Vitest', 'Playwright'],
    ask: t('build the products catalogue from this API', 'ابنِ كتالوج المنتجات من هذا الـ API'),
    rules: ['website'],
  },
  {
    id: 'dashboard',
    name: t('Dashboard', 'لوحة تحكم'),
    fits: t('Admin panels and internal tools: lists, forms, roles, long working days.', 'لوحات الإدارة والأدوات الداخلية: قوائم ونماذج وأدوار وساعات عمل طويلة.'),
    gets: [
      t('Tables the server pages and sorts, with their state in the URL.', 'جداول يرقّمها الخادم ويفرزها وحالتها في الرابط.'),
      t('Permissions on every route and action.', 'صلاحيات على كل مسار وفعل.'),
      t('A folder map and routing rules for the framework you pick.', 'خريطة مجلدات وقواعد مسارات لإطار عملك.'),
      t('Edit conflicts, unsaved-change warnings and error monitoring.', 'تعارض التعديل وتنبيه غير المحفوظ ومراقبة الأخطاء.'),
    ],
    stack: ['Vite + TanStack Router', 'TanStack Start SPA', 'Next.js', 'TanStack Table', 'TanStack Query'],
    ask: t('add an orders page with a table and filters', 'أضف صفحة طلبات بجدول ومرشحات'),
    rules: ['dashboard', 'dashboard/variants/next', 'dashboard/variants/tanstack-start'],
  },
  {
    id: 'react',
    name: t('Any other frontend', 'أي واجهة أخرى'),
    fits: t('Any other frontend project, React or not, with the stack it already has.', 'أي مشروع واجهات آخر، بـ React أو بغيرها، بتقنياته الموجودة.'),
    gets: [
      t('Neutral rules, rewritten for your framework, router, data library and styling.', 'قواعد محايدة معدّلة لإطارك وموجّهك ومكتبة بياناتك وتنسيقك.'),
      t('An auth rule for apps that hold their own tokens.', 'قاعدة دخول لتطبيقات تحمل رموزها.'),
      t('Hooks that use your linter, formatter and test runner.', 'حرّاس تستعمل مدقّقك ومنسّقك وأداة اختبارك.'),
      t('JavaScript projects and monorepos too.', 'ومشاريع JavaScript والـ monorepo أيضاً.'),
    ],
    stack: ['Next.js', 'React Router', 'Vite', 'Vue', 'Svelte', 'Angular', 'Plain JavaScript'],
    ask: t('create a profile form with validation', 'أنشئ نموذج ملف شخصي مع التحقق'),
    rules: ['react'],
  },
  {
    id: 'fullstack',
    name: t('Site + admin', 'موقع + إدارة'),
    fits: t('A public site and its admin panel living in one project.', 'موقع عام ولوحة إدارته في مشروع واحد.'),
    gets: [
      t('Website rules only under the site’s folders.', 'قواعد الموقع داخل مجلدات الموقع فقط.'),
      t('Dashboard rules only under the admin’s folders.', 'قواعد اللوحة داخل مجلدات الإدارة فقط.'),
      t('Both sets of skills switched on.', 'مجموعتا المهارات مفعّلتان.'),
      t('Separate API addresses, and per-app commands where you have them.', 'عناوين API منفصلة، وأوامر لكل تطبيق حيث توجد.'),
    ],
    stack: ['TanStack Start', 'src/admin', 'src/routes/admin'],
    ask: t('add a blog to the site and its editor to the admin', 'أضف مدونة للموقع ومحررها في الإدارة'),
    rules: ['website', 'dashboard'],
  },
]
