import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

export type ProfileId = 'website' | 'dashboard' | 'react' | 'fullstack'

interface Project {
  id: ProfileId
  name: Bilingual
  fits: Bilingual
  /** One plain sentence on what it is, shown in the list at the top of the page. */
  example: Bilingual
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
    fits: t('Pages that visitors open: a shop, a company site, a blog, a list of your products.', 'صفحات يفتحها الزوار: متجر، أو موقع شركة، أو مدونة، أو قائمة بمنتجاتك.'),
    example: t('“A shop for handmade soap, with a page for each product.”', '«متجر لصابون يدوي الصنع، وفيه صفحة لكل منتج».'),
    gets: [
      t('Pages that open fast, even on a phone.', 'صفحات تفتح بسرعة، حتى على الهاتف.'),
      t('Pages that search engines and chat apps can read, so a shared link shows a title and a picture.', 'صفحات تستطيع محركات البحث وتطبيقات المحادثة قراءتها، فيظهر عند مشاركة الرابط عنوان وصورة.'),
      t('A proper “page not found” page, and redirects when an address changes.', 'صفحة «الصفحة غير موجودة» مضبوطة، وتحويل تلقائي عندما يتغير عنوان.'),
      t('Your secrets, such as keys and passwords, stay on the server and never reach the visitor’s browser.', 'أسرارك، مثل المفاتيح وكلمات المرور، تبقى على الخادم ولا تصل إلى متصفح الزائر.'),
    ],
    stack: ['TanStack Start', 'TanStack Query', 'Tailwind', 'i18next', 'Vitest', 'Playwright'],
    ask: t('build a page that shows my products from my backend', 'ابن صفحة تعرض منتجاتي من الـ backend الخاص بي'),
    rules: ['website'],
  },
  {
    id: 'dashboard',
    name: t('Dashboard', 'لوحة تحكم'),
    fits: t('A private area where you or your team manage things: orders, customers, products, reports. People sign in to use it.', 'مكان خاص تديرون فيه أنت وفريقك أشياء مثل الطلبات والعملاء والمنتجات والتقارير. ويسجل الناس الدخول لاستخدامه.'),
    example: t('“A page with my orders in a table, with filters.”', '«صفحة فيها طلباتي في جدول، مع فلاتر».'),
    gets: [
      t('Tables you can sort, search and filter, even with thousands of rows.', 'جداول تستطيع ترتيبها والبحث فيها وتصفيتها، حتى لو كان فيها آلاف الصفوف.'),
      t('Forms to add and edit things, with clear messages when something is missing.', 'نماذج لإضافة الأشياء وتعديلها، مع رسائل واضحة عندما ينقص شيء.'),
      t('Permissions: each person sees only the pages and buttons they are allowed to use.', 'صلاحيات: يرى كل شخص الصفحات والأزرار المسموحة له فقط.'),
      t('A warning before you leave a form with unsaved changes, and a notice when someone else edited the same thing.', 'تنبيه قبل أن تغادر نموذجا فيه تغييرات غير محفوظة، وإشعار عندما يعدّل شخص آخر الشيء نفسه.'),
    ],
    stack: ['Vite + TanStack Router', 'TanStack Start SPA', 'Next.js', 'TanStack Table', 'TanStack Query'],
    ask: t('add an orders page with a table and filters', 'أضف صفحة طلبات فيها جدول وفلاتر'),
    rules: ['dashboard', 'dashboard/variants/next', 'dashboard/variants/tanstack-start'],
  },
  {
    id: 'fullstack',
    name: t('Website + dashboard', 'موقع + لوحة تحكم'),
    fits: t('A public website and the dashboard that manages it, together in one project. For example a shop and the pages where you run it.', 'موقع عام ولوحة التحكم التي تديره، معا في مشروع واحد. مثلا متجر والصفحات التي تدير بها المتجر.'),
    example: t('“A blog on the website, and a page in the dashboard where I write the posts.”', '«مدونة في الموقع، وصفحة في لوحة التحكم أكتب فيها المقالات».'),
    gets: [
      t('Everything the website gets, and everything the dashboard gets.', 'كل ما يحصل عليه الموقع، وكل ما تحصل عليه لوحة التحكم.'),
      t('The public pages and the private dashboard live in one project, so they stay in step.', 'الصفحات العامة ولوحة التحكم الخاصة في مشروع واحد، فتبقيان متوافقتين.'),
      t('If you have two backends, each part talks to its own.', 'إن كان عندك backend لكل جزء، فيتصل كل جزء بالخاص به.'),
    ],
    stack: ['TanStack Start', 'src/admin', 'src/routes/admin'],
    ask: t('add a blog to the website, and a page to write posts in the dashboard', 'أضف مدونة إلى الموقع، وصفحة لكتابة المقالات في لوحة التحكم'),
    rules: ['website', 'dashboard'],
  },
  {
    id: 'react',
    name: t('Another kind of project', 'نوع آخر من المشاريع'),
    fits: t('A project that is neither of these, or one that already exists in other tools. This is for people who know what they use.', 'مشروع ليس من هذين النوعين، أو مشروع قائم مبني بأدوات أخرى. وهذا لمن يعرف الأدوات التي يستخدمها.'),
    example: t('“A form where people edit their profile, and the form checks what they type.”', '«نموذج يعدّل فيه الناس ملفهم الشخصي، ويتحقق مما يكتبونه».'),
    gets: [
      t('The kit looks at what your project already uses and follows it.', 'تنظر الإضافة إلى ما يستخدمه مشروعك وتتبعه.'),
      t('Its rules are rewritten to match your tools.', 'تُعاد كتابة قواعدها لتناسب أدواتك.'),
      t('The safety checks use the checking and testing tools you already have.', 'تستخدم فحوص الأمان أدوات الفحص والاختبار الموجودة عندك.'),
      t('It works with plain JavaScript, and with projects that hold several apps in one folder.', 'تعمل مع JavaScript العادي، ومع المشاريع التي فيها عدة تطبيقات في مجلد واحد.'),
    ],
    stack: ['Next.js', 'React Router', 'Vite', 'Vue', 'Svelte', 'Angular', 'Plain JavaScript'],
    ask: t('create a profile form that checks what people type', 'أنشئ نموذجا للملف الشخصي يتحقق مما يكتبه الناس'),
    rules: ['react'],
  },
]
