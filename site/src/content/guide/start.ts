import { t } from './text.ts'

export const installSteps = [
  t('This tells Claude Code where the kit lives. It changes nothing in your project.', 'يخبر Claude Code أين توجد العدّة، ولا يغيّر شيئاً في مشروعك.'),
  t('This installs the skills, agents, hooks and tool servers.', 'يثبّت المهارات والوكلاء والحرّاس وخوادم الأدوات.'),
  t('This fits the kit to the project you are standing in. Run it in each project.', 'يلائم العدّة مع المشروع الذي أنت فيه، فشغّله في كل مشروع.'),
]

export const questions = [
  {
    question: t('What are we doing?', 'ماذا نفعل؟'),
    answers: [
      t('New project: build to the standard from the first file.', 'مشروع جديد: ابنِ على المعيار من أول ملف.'),
      t('Existing project: keep its structure and follow its stack.', 'مشروع قائم: أبقِ بنيته واتبع تقنياته.'),
      t('Maintenance: keep an old app running, with fixes and security only.', 'صيانة: أبقِ تطبيقاً قديماً يعمل، بإصلاحات وأمان فقط.'),
      t('Refactor: restructure it later, in approved phases.', 'إعادة هيكلة: تُعاد بنيته لاحقاً على مراحل توافق عليها.'),
    ],
  },
  {
    question: t('What kind of React project?', 'أي نوع من مشاريع React؟'),
    answers: [
      t('Website: public pages, server rendering and SEO.', 'موقع: صفحات عامة وعرض من الخادم وتحسين البحث.'),
      t('Dashboard: you also pick Vite, TanStack Start or Next.js.', 'لوحة تحكم: وتختار Vite أو TanStack Start أو Next.js.'),
      t('Site plus admin in one project.', 'موقع مع إدارة في مشروع واحد.'),
      t('Any other React app.', 'أي تطبيق React آخر.'),
    ],
  },
  {
    question: t('Confirm the values it found.', 'أكّد القيم التي وجدها.'),
    answers: [
      t('Name, GitHub repository and main branch.', 'الاسم ومستودع GitHub والفرع الرئيسي.'),
      t('Live and test hosts.', 'النطاق الحي والتجريبي.'),
      t('Dev and test ports, and the API address variable.', 'منفذا التطوير والاختبار ومتغير عنوان الـ API.'),
    ],
  },
]

export const written = [
  { path: 'CLAUDE.md', text: t('What the assistant reads first: hard rules, commands and layout. Your own file is merged, not replaced.', 'أول ما يقرؤه المساعد: القواعد الصارمة والأوامر والهيكل. ملفك يُدمج ولا يُستبدل.') },
  { path: '.claude/rules/', text: t('The standards for your project type, rewritten for the libraries you really use.', 'معايير نوع مشروعك، معدّلة لمكتباتك الفعلية.') },
  { path: '.claude/settings.json', text: t('Permissions: what runs freely, what asks and what is denied. Also the switch for automatic updates.', 'الصلاحيات: ما يعمل مباشرة وما يسأل وما يُمنع، ومفتاح التحديث التلقائي.') },
  { path: '.claude/frontend-kit.json', text: t('The values every skill and hook reads: ports, branches, hosts, stack and commands.', 'القيم التي تقرؤها كل مهارة وحارس: المنافذ والفروع والنطاقات والتقنيات والأوامر.') },
  { path: 'package.json', text: t('Only missing scripts for tools you already have.', 'الأوامر الناقصة فقط، لأدوات موجودة عندك.') },
]

export const after = [
  t('Restart Claude Code so the new rules and settings load.', 'أعد تشغيل Claude Code لتُحمَّل القواعد والإعدادات.'),
  t('Commit the setup on its own: chore: add frontend-kit.', 'احفظ الإعداد في commit مستقل: chore: add frontend-kit.'),
  t('Give it a first small task and watch the checks run.', 'أعطه مهمة صغيرة أولى وراقب الفحوص تعمل.'),
]

export const maintenance = [
  {
    title: t('Update', 'التحديث'),
    text: t('Setup turns automatic updates on, but they do not run where the updater is switched off, as it can be in the desktop app. To update by hand, run this in a terminal in your project, then restart. Copied rules do not change by themselves: run setup again to see a diff of what is new.', 'الإعداد يفعّل التحديث التلقائي، لكنه لا يعمل حيث يكون المحدّث موقفاً، كما قد يكون في تطبيق سطح المكتب. للتحديث يدوياً نفّذ هذا في الطرفية داخل مشروعك ثم أعد التشغيل. أما القواعد المنسوخة فلا تتغير وحدها: أعد الإعداد لترى فروق الجديد.'),
    // The first command only refreshes the listing. The installed version moves with the second.
    command: 'claude plugin marketplace update frontend-kit && claude plugin update frontend-kit@frontend-kit',
  },
  {
    title: t('Teammates', 'الزملاء'),
    text: t('The rules and settings arrive with the repo. Each teammate installs the plugin once, in a terminal.', 'القواعد والإعدادات تصل مع المستودع، وكل زميل يثبّت الإضافة مرة واحدة من الطرفية.'),
    command: 'claude plugin install frontend-kit@frontend-kit --scope project',
  },
  {
    title: t('Remove', 'الإزالة'),
    text: t('Uninstall in a terminal, at the scope you installed it. The files setup wrote are yours: keep or delete them.', 'أزلها من الطرفية بالنطاق الذي ثبّتها به. ملفات الإعداد ملكك: أبقها أو احذفها.'),
    command: 'claude plugin uninstall frontend-kit@frontend-kit',
  },
]
