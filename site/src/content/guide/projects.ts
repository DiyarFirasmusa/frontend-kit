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
    fits: t('Public sites that people find through search and shared links: shops, portals, marketing, content.', 'مواقع عامة يوصلها الناس من البحث والروابط اللي تنشارك: متاجر، بوابات، تسويق، ومحتوى.'),
    gets: [
      t('Pages rendered on the server, with real 404s and redirects.', 'صفحات تنرسم بالسيرفر، مع 404 وتحويلات حقيقية.'),
      t('SEO and share previews as part of every public page.', 'الـ SEO ومعاينات المشاركة جزء من كل صفحة عامة.'),
      t('A speed budget for real phones.', 'حد للسرعة محسوب على موبايلات حقيقية.'),
      t('Server functions for secrets and cookies.', 'دوال سيرفر للأسرار والكوكيز.'),
    ],
    stack: ['TanStack Start', 'TanStack Query', 'Tailwind', 'i18next', 'Vitest', 'Playwright'],
    ask: t('build the products catalogue from this API', 'ابني كتالوج المنتجات من هالـ API'),
    rules: ['website'],
  },
  {
    id: 'dashboard',
    name: t('Dashboard', 'لوحة تحكم'),
    fits: t('Admin panels and internal tools: lists, forms, roles, long working days.', 'لوحات الإدارة والأدوات الداخلية: قوائم، فورمات، أدوار، وساعات شغل طويلة.'),
    gets: [
      t('Tables the server pages and sorts, with their state in the URL.', 'جداول السيرفر يقسّمها صفحات ويرتّبها، وحالتها بالرابط.'),
      t('Permissions on every route and action.', 'صلاحيات على كل مسار وكل إجراء.'),
      t('A folder map and routing rules for the framework you pick.', 'خريطة مجلدات وقواعد مسارات للفريموورك اللي تختاره.'),
      t('Edit conflicts, unsaved-change warnings and error monitoring.', 'تعارض التعديلات، تنبيه للتغييرات اللي ما انحفظت، ومراقبة الأخطاء.'),
    ],
    stack: ['Vite + TanStack Router', 'TanStack Start SPA', 'Next.js', 'TanStack Table', 'TanStack Query'],
    ask: t('add an orders page with a table and filters', 'ضيف صفحة طلبات فيها جدول وفلاتر'),
    rules: ['dashboard', 'dashboard/variants/next', 'dashboard/variants/tanstack-start'],
  },
  {
    id: 'react',
    name: t('Any other frontend', 'أي واجهة ثانية'),
    fits: t('Any other frontend project, React or not, with the stack it already has.', 'أي مشروع واجهات ثاني، بـ React أو بغيره، بنفس تقنياته الموجودة.'),
    gets: [
      t('Neutral rules, rewritten for your framework, router, data library and styling.', 'قواعد عامة، تنكتب من جديد على الفريموورك والراوتر ومكتبة البيانات والستايل مالتك.'),
      t('An auth rule for apps that hold their own tokens.', 'قاعدة تسجيل دخول للتطبيقات اللي تحتفظ بالتوكنات مالتها.'),
      t('Hooks that use your linter, formatter and test runner.', 'حرّاس يستعملون أدوات التدقيق والترتيب والاختبار مالتك.'),
      t('JavaScript projects and monorepos too.', 'ومشاريع JavaScript والـ monorepo هم.'),
    ],
    stack: ['Next.js', 'React Router', 'Vite', 'Vue', 'Svelte', 'Angular', 'Plain JavaScript'],
    ask: t('create a profile form with validation', 'سوّي فورم للملف الشخصي مع تحقق'),
    rules: ['react'],
  },
  {
    id: 'fullstack',
    name: t('Site + admin', 'موقع + إدارة'),
    fits: t('A public site and its admin panel living in one project.', 'موقع عام ولوحة إدارته بنفس المشروع.'),
    gets: [
      t('Website rules only under the site’s folders.', 'قواعد الموقع بس داخل مجلدات الموقع.'),
      t('Dashboard rules only under the admin’s folders.', 'قواعد اللوحة بس داخل مجلدات الإدارة.'),
      t('Both sets of skills switched on.', 'مهارات الاثنين شغّالة.'),
      t('Separate API addresses, and per-app commands where you have them.', 'عناوين API منفصلة، وأوامر لكل تطبيق إذا موجودة.'),
    ],
    stack: ['TanStack Start', 'src/admin', 'src/routes/admin'],
    ask: t('add a blog to the site and its editor to the admin', 'ضيف مدونة للموقع، ومحررها بالإدارة'),
    rules: ['website', 'dashboard'],
  },
]
