import { t } from './text.ts'

export const installSteps = [
  t('This tells Claude Code where the kit lives. It changes nothing in your project.', 'يقول لـ Claude Code وين موجودة العدّة، وما يغيّر شي بمشروعك.'),
  t('This installs the skills, agents, hooks and tool servers.', 'يثبّت المهارات والوكلاء والحرّاس وسيرفرات الأدوات.'),
  t('This fits the kit to the project you are standing in. Run it in each project.', 'يفصّل العدّة على المشروع اللي انت بيه، فشغّله بكل مشروع.'),
]

export const questions = [
  {
    question: t('What are we doing?', 'شنو راح نسوي؟'),
    answers: [
      t('New project: build to the standard from the first file.', 'مشروع جديد: نبني على المعيار من أول ملف.'),
      t('Existing project: keep its structure and follow its stack.', 'مشروع موجود: نخلي بنيته مثل ما هي ونمشي على تقنياته.'),
      t('Maintenance: keep an old app running, with fixes and security only.', 'صيانة: نخلي تطبيق قديم يشتغل، بس تصليحات وأمان.'),
      t('Refactor: restructure it later, in approved phases.', 'إعادة هيكلة: نعيد بنيته بعدين، على مراحل انت توافق عليها.'),
    ],
  },
  {
    question: t('What kind of project?', 'شنو نوع المشروع؟'),
    answers: [
      t('Website: public pages, server rendering and SEO.', 'موقع: صفحات عامة، عرض من السيرفر، وSEO.'),
      t('Dashboard: you also pick Vite, TanStack Start or Next.js.', 'لوحة تحكم: وتختار هم Vite أو TanStack Start أو Next.js.'),
      t('Site plus admin in one project.', 'موقع مع إدارة بمشروع واحد.'),
      t('Any other frontend, React or not.', 'أي واجهة ثانية، بـ React أو بغيره.'),
    ],
  },
  {
    question: t('Confirm the values it found.', 'أكّد القيم اللي لقاها.'),
    answers: [
      t('Name, GitHub repository and main branch.', 'الاسم، مستودع GitHub، والفرع الرئيسي.'),
      t('Live and test hosts.', 'دومين الإنتاج ودومين التجربة.'),
      t('Dev and test ports, and the API address variable.', 'بورت التطوير وبورت الاختبار، ومتغير عنوان الـ API.'),
    ],
  },
]

export const written = [
  { path: 'CLAUDE.md', text: t('What the assistant reads first: hard rules, commands and layout. Your own file is merged, not replaced.', 'أول شي يقراه المساعد: القواعد الصارمة والأوامر وهيكل المشروع. ملفك ينضم معه، ما ينمسح.') },
  { path: '.claude/rules/', text: t('The standards for your project type, rewritten for the libraries you really use.', 'معايير نوع مشروعك، منكتبة من جديد على المكتبات اللي فعلاً تستعملها.') },
  { path: '.claude/settings.json', text: t('Permissions: what runs freely, what asks and what is denied. Also the switch for automatic updates.', 'الصلاحيات: شنو يشتغل على طول، شنو يسأل، وشنو ممنوع. وبيه هم مفتاح التحديث التلقائي.') },
  { path: '.claude/frontend-kit.json', text: t('The values every skill and hook reads: ports, branches, hosts, stack and commands.', 'القيم اللي تقراها كل مهارة وكل حارس: البورتات، الفروع، الدومينات، التقنيات والأوامر.') },
  { path: 'package.json', text: t('Only missing scripts for tools you already have.', 'بس السكربتات الناقصة، لأدوات موجودة عندك أصلاً.') },
]

export const after = [
  t('Restart Claude Code so the new rules and settings load.', 'سوّي إعادة تشغيل لـ Claude Code حتى تنحمّل القواعد والإعدادات الجديدة.'),
  t('Commit the setup on its own: chore: add frontend-kit.', 'احفظ الإعداد بـ commit لحاله: chore: add frontend-kit.'),
  t('Give it a first small task and watch the checks run.', 'انطيه أول شغلة صغيرة وشوف الفحوص شلون تشتغل.'),
]

export const maintenance = [
  {
    title: t('Update', 'التحديث'),
    text: t('Setup turns automatic updates on, but they do not run where the updater is switched off, as it can be in the desktop app. To update by hand, run this in a terminal in your project, then restart. Copied rules do not change by themselves: run setup again to see a diff of what is new.', 'الإعداد يشغّل التحديث التلقائي، بس ما يشتغل إذا المحدّث مطفي، مثل ما ممكن يكون بتطبيق سطح المكتب. حتى تحدّث بإيدك، شغّل هذا بالتيرمنال داخل مشروعك وبعدين أعد التشغيل. والقواعد المنسوخة ما تتغير لحالها: شغّل الإعداد مرة ثانية حتى تشوف فرق الجديد.'),
    // The first command only refreshes the listing. The installed version moves with the second.
    command: 'claude plugin marketplace update frontend-kit && claude plugin update frontend-kit@frontend-kit',
  },
  {
    title: t('Teammates', 'الزملاء'),
    text: t('The rules and settings arrive with the repo. Each teammate installs the plugin once, in a terminal.', 'القواعد والإعدادات توصل مع المستودع، وكل زميل يثبّت الإضافة مرة وحدة من التيرمنال.'),
    command: 'claude plugin install frontend-kit@frontend-kit --scope project',
  },
  {
    title: t('Remove', 'الإزالة'),
    text: t('Uninstall in a terminal, at the scope you installed it. The files setup wrote are yours: keep or delete them.', 'شيلها من التيرمنال، بنفس النطاق اللي ثبّتها بيه. الملفات اللي كتبها الإعداد مالتك: خليها أو امسحها.'),
    command: 'claude plugin uninstall frontend-kit@frontend-kit',
  },
]
