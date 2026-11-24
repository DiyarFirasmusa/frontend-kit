import { t } from './text.ts'

export const installSteps = [
  t('This tells Claude Code where the kit lives. It changes nothing in your project.', 'يخبر Claude Code أين توجد الإضافة. ولا يغير شيئا في مشروعك.'),
  t('This installs the skills, agents, hooks and tool servers.', 'يثبت المهارات والوكلاء والحراس وخوادم الأدوات.'),
  t('This fits the kit to the project you are standing in. Run it in each project.', 'يضبط الإضافة على المشروع الذي أنت فيه. شغّله في كل مشروع.'),
]

export const questions = [
  {
    question: t('What are we doing?', 'ماذا سنفعل؟'),
    answers: [
      t('New project: build to the standard from the first file.', 'مشروع جديد: نبني بالمعيار من أول ملف.'),
      t('Existing project: keep its structure and follow its stack.', 'مشروع قائم: نبقي هيكله كما هو ونتبع تقنياته.'),
      t('Maintenance: keep an old app running, with fixes and security only.', 'صيانة: نبقي تطبيقا قديما يعمل، بإصلاح الأخطاء والأمان فقط.'),
      t('Refactor: restructure it later, in approved phases.', 'إعادة هيكلة: نعيد بناءه لاحقا على مراحل توافق عليها.'),
    ],
  },
  {
    question: t('What kind of project?', 'ما نوع المشروع؟'),
    answers: [
      t('Website: public pages, server rendering and SEO.', 'موقع: صفحات عامة، وعرض من الخادم، وSEO.'),
      t('Dashboard: you also pick Vite, TanStack Start or Next.js.', 'لوحة تحكم: وتختار معها Vite أو TanStack Start أو Next.js.'),
      t('Site plus admin in one project.', 'موقع مع إدارة في مشروع واحد.'),
      t('Any other frontend, React or not.', 'أي واجهة أخرى، بـ React أو بغيره.'),
    ],
  },
  {
    question: t('Confirm the values it found.', 'أكد القيم التي وجدها.'),
    answers: [
      t('Name, GitHub repository and main branch.', 'الاسم، ومستودع GitHub، والفرع الرئيسي.'),
      t('Live and test hosts.', 'خادم الإنتاج وخادم الاختبار.'),
      t('Dev and test ports, and the API address variable.', 'منفذ التطوير ومنفذ الاختبار، ومتغير عنوان الـ API.'),
    ],
  },
]

export const written = [
  { path: 'CLAUDE.md', text: t('What the assistant reads first: hard rules, commands and layout. Your own file is merged, not replaced.', 'أول ما يقرؤه المساعد: القواعد الصارمة والأوامر وهيكل المشروع. يدمج الإعداد ملفك الحالي ولا يستبدله.') },
  { path: '.claude/rules/', text: t('The standards for your project type, rewritten for the libraries you really use.', 'معايير نوع مشروعك، مكتوبة للمكتبات التي تستخدمها فعلا.') },
  { path: '.claude/settings.json', text: t('Permissions: what runs freely, what asks and what is denied. Also the switch for automatic updates.', 'الصلاحيات: ما يعمل مباشرة، وما يطلب إذنك، وما هو ممنوع. وفيه أيضا مفتاح التحديث التلقائي.') },
  { path: '.claude/wajiha-kit.json', text: t('The values every skill and hook reads: ports, branches, hosts, stack and commands.', 'القيم التي تقرؤها كل مهارة وكل حارس: المنافذ، والفروع، والخوادم، والتقنيات، والأوامر.') },
  { path: 'package.json', text: t('Only missing scripts for tools you already have.', 'السكربتات الناقصة فقط، لأدوات عندك أصلا.') },
]

export const after = [
  t('Restart Claude Code so the new rules and settings load.', 'أعد تشغيل Claude Code ليقرأ القواعد والإعدادات الجديدة.'),
  t('Commit the setup on its own: chore: add wajiha-kit.', 'احفظ الإعداد في commit مستقل: chore: add wajiha-kit.'),
  t('Give it a first small task and watch the checks run.', 'أعطه مهمة صغيرة، وشاهد الفحوص تعمل.'),
]

export const maintenance = [
  {
    title: t('Update', 'التحديث'),
    text: t('Setup turns automatic updates on, but they do not run where the updater is switched off, as it can be in the desktop app. To update by hand, run this in a terminal in your project, then restart. Copied rules do not change by themselves: run setup again to see a diff of what is new.', 'يفعل الإعداد التحديث التلقائي، لكنه لا يعمل إذا كان المحدث معطلا، كما قد يحدث في تطبيق سطح المكتب. للتحديث يدويا، شغّل هذا الأمر في الطرفية داخل مشروعك، ثم أعد التشغيل. القواعد المنسوخة لا تتغير وحدها. شغّل الإعداد مرة أخرى لترى الفرق.'),
    // The first command only refreshes the listing. The installed version moves with the second.
    command: 'claude plugin marketplace update wajiha-kit && claude plugin update wajiha-kit@wajiha-kit',
  },
  {
    title: t('Teammates', 'الزملاء'),
    text: t('The rules and settings arrive with the repo. Each teammate installs the plugin once, in a terminal.', 'تصل القواعد والإعدادات مع المستودع. وعلى كل زميل أن يثبت الإضافة مرة واحدة من الطرفية.'),
    command: 'claude plugin install wajiha-kit@wajiha-kit --scope project',
  },
  {
    title: t('Remove', 'الإزالة'),
    text: t('Uninstall in a terminal, at the scope you installed it. The files setup wrote are yours: keep or delete them.', 'احذف الإضافة من الطرفية، بالنطاق نفسه الذي ثبّتها به. الملفات التي كتبها الإعداد ملكك: احتفظ بها أو احذفها.'),
    command: 'claude plugin uninstall wajiha-kit@wajiha-kit',
  },
]
