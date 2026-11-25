import { t } from './text.ts'

/** The short page: what it is, one real example, what is inside, how to get it. */
export const home = {
  // The goal of the kit, said first: the smallest ask, the best result.
  title: t('Build your own website or dashboard. No coding needed.', 'اصنع موقعك أو لوحة التحكم بنفسك. دون أي خبرة في البرمجة.'),
  lead: t(
    'Wajiha Kit works inside Claude Code. You answer a few simple questions, and it builds a complete, working project for you, with the latest proven methods and clean, well-organised code. Then it checks the result before you see it.',
    'واجهة إضافة تعمل داخل \u2066Claude Code\u2069. تجيب عن بضعة أسئلة بسيطة، فتبني لك مشروعا كاملا يعمل، بأحدث الطرق المجربة وبكود نظيف ومرتب. ثم تفحص النتيجة قبل أن تراها.',
  ),
  // Ask simply, get it built well, get it checked: one line each.
  points: [
    {
      name: t('You answer five questions', 'تجيب عن خمسة أسئلة'),
      text: t('What you want to build, a sentence about it, the look you like, your backend link and the languages. No technical choices.', 'ماذا تريد أن تبني، وجملة عنه، والشكل الذي يعجبك، ورابط الخادم، واللغات. دون أي قرار تقني.'),
    },
    {
      name: t('It builds the whole project', 'تبني المشروع كاملا'),
      text: t('Pages, forms, tables, light and dark mode, Arabic and English. All of it is set up in a proven way.', 'الصفحات والنماذج والجداول والوضع الفاتح والداكن والعربية والإنجليزية. كلها مرتبة بطريقة مجربة.'),
    },
    {
      name: t('It checks before showing you', 'تفحص قبل أن تعرض عليك'),
      text: t('It looks for mistakes, runs tests and asks a second reviewer. Risky actions are stopped. You decide what to keep.', 'تبحث عن الأخطاء، وتجري الاختبارات، وتسأل مراجعا ثانيا. وتوقف أي خطوة خطرة. وأنت تقرر ما تحتفظ به.'),
    },
  ],
  start: t('Start now', 'ابدأ الآن'),
  builds: {
    title: t('What can you build?', 'ماذا تستطيع أن تبني؟'),
    lead: t('Pick one when Claude asks. You do not choose any tools: each kind comes ready, set up the way a good team would.', 'اختر واحدا عندما يسألك Claude. لن تختار أي أدوات: كل نوع يأتي جاهزا، مرتبا كما يرتبه فريق جيد.'),
    say: t('You could say', 'يمكنك أن تقول'),
    more: t('More about each kind', 'المزيد عن كل نوع'),
  },
  see: t('See how it goes, step by step', 'شاهد كيف تسير الأمور خطوة بخطوة'),
  docs: t('Read the guide', 'اقرأ الدليل'),

  example: t('From an idea to a working project', 'من فكرة إلى مشروع يعمل'),
  exampleLead: t('You say what you want. This is what happens next, in plain words.', 'تقول ما تريده. وهذا ما يحدث بعدها، بكلمات بسيطة.'),
  prompt: t('I want a dashboard to manage my shop orders', 'أريد لوحة تحكم لإدارة طلبات متجري'),
  steps: {
    install: {
      name: t('You add the kit to Claude', 'تضيف الإضافة إلى Claude'),
      text: t('In the Claude app, you send one message. Claude installs the kit for you, then starts setting up your project.', 'في تطبيق Claude ترسل رسالة واحدة. يثبت Claude الإضافة بنفسه، ثم يبدأ تجهيز مشروعك.'),
    },
    skills: {
      name: t('It asks what you want', 'تسألك ماذا تريد'),
      text: t('Dashboard, website or both. One sentence about it. Do you have a design, or a site you like? Your backend link. Arabic, English or both.', 'لوحة تحكم أو موقع أو الاثنان. جملة عنه. هل عندك تصميم، أو موقع يعجبك؟ رابط الخادم. عربي أو إنجليزي أو الاثنان.'),
    },
    rules: {
      name: t('It tells you the plan', 'تعرض عليك الخطة'),
      text: t('A short summary in plain words: the name, the pages and the look. Nothing starts until you say yes.', 'ملخص قصير بكلمات بسيطة: الاسم والصفحات والشكل. ولا يبدأ شيء حتى توافق.'),
    },
    guard: {
      name: t('It builds the project', 'تبني المشروع'),
      text: t('Orders, customers and products pages, filled with sample data so you can click through them at once.', 'صفحات الطلبات والعملاء والمنتجات، وفيها بيانات تجريبية لتتصفحها فورا.'),
    },
    gate: {
      name: t('It checks its own work', 'تفحص عملها بنفسها'),
      text: t('It looks for mistakes, runs tests, and a second reviewer reads the work. If something fails, it fixes it before you see it.', 'تبحث عن الأخطاء، وتجري الاختبارات، ويقرأ مراجع ثان العمل. وإذا فشل شيء أصلحته قبل أن تراه.'),
    },
    review: {
      name: t('A second reviewer reads it', 'يقرؤها مراجع ثان'),
      text: t('A separate helper reads the work with fresh eyes and lists anything to improve.', 'مساعد مستقل يقرأ العمل بعين جديدة، ويكتب ما يمكن تحسينه.'),
    },
    done: {
      name: t('You decide', 'القرار لك'),
      text: t('You get a short report and one question: save this version? Nothing leaves your computer without your yes.', 'يصلك تقرير قصير وسؤال واحد: هل أحفظ هذه النسخة؟ ولا يخرج شيء من جهازك دون موافقتك.'),
    },
  },
  /** The words of the session panel. */
  session: {
    skill: t('skill', 'مهارة'),
    rule: t('rule', 'قاعدة'),
    blocked: t('stopped', 'موقوف'),
    passed: t('passed', 'ناجح'),
    typecheck: t('mistake check', 'فحص الأخطاء'),
    tests: t('tests', 'الاختبارات'),
    reviewing: t('reading the work', 'يقرأ العمل'),
    ask: t('Save this version?', 'هل أحفظ هذه النسخة؟'),
  },

  // Where a project stands when the kit arrives: new, already running, or a mess.
  starts: {
    title: t('Start from where you are', 'ابدأ من حيث أنت'),
    lead: t('Most people start with an idea and nothing else. If you already have a project, the kit can join it or clean it up.', 'أغلب الناس يبدأون بفكرة فقط. وإن كان عندك مشروع، تستطيع الإضافة أن تنضم إليه أو أن ترتبه.'),
    cases: [
      {
        mode: 'new',
        name: t('I have an idea', 'عندي فكرة'),
        text: t('Answer the questions and get a complete project to open and click through.', 'أجب عن الأسئلة، فتحصل على مشروع كامل تفتحه وتتصفحه.'),
        command: '/wajiha-kit:setup',
        page: 'get-started',
      },
      {
        mode: 'existing',
        name: t('I already have a project', 'عندي مشروع جاهز'),
        text: t('The kit reads your project and follows how it is built. Nothing is rewritten.', 'تقرأ الإضافة مشروعك وتتبع طريقة بنائه. ولا يعاد كتابة شيء.'),
        command: '/wajiha-kit:setup',
        page: 'get-started',
      },
      {
        mode: 'refactor',
        name: t('My project is old and messy', 'مشروعي قديم وفوضوي'),
        text: t('It measures the mess, makes a plan in six steps and does them one by one. What your app does stays the same.', 'تقيس حجم الفوضى، وتضع خطة من ست خطوات، وتنفذها واحدة بعد أخرى. وما يفعله تطبيقك لا يتغير.'),
        command: '/wajiha-kit:refactor-mode on',
        page: 'refactor',
      },
    ],
    more: t('Ways of working, from building new to a release freeze', 'طرق العمل، من البناء الجديد إلى تجميد الإصدار'),
  },

  inside: t('What is inside', 'ما بداخلها'),
  insideLead: t('You do not need this to start. It shows what works for you behind the scenes. Press any name to learn more.', 'لست بحاجة لهذا لتبدأ. هنا ما يعمل لأجلك خلف الستار. اضغط على أي اسم لتعرف أكثر.'),
  kinds: {
    skills: t('Skills', 'المهارات'),
    agents: t('Specialists', 'المختصون'),
    rules: t('Rules', 'القواعد'),
    checks: t('Safety checks', 'فحوص الأمان'),
  },
  kindIs: {
    skills: t('A skill is a ready set of instructions for one job, like building a table.', 'المهارة تعليمات جاهزة لمهمة واحدة، مثل بناء جدول.'),
    agents: t('A specialist is a separate helper with one job, like a reviewer or a tester.', 'المختص مساعد مستقل له مهمة واحدة، مثل المراجع أو المختبِر.'),
    rules: t('A rule is a written standard the assistant follows while it works.', 'القاعدة معيار مكتوب يتبعه المساعد أثناء العمل.'),
    checks: t('A safety check runs by itself at a fixed moment, so nothing depends on the assistant remembering.', 'فحص الأمان يعمل وحده في لحظة محددة، فلا يعتمد شيء على تذكر المساعد.'),
  },
  why: t('Why', 'لماذا'),
  when: t('When', 'متى'),
  does: t('What it does', 'ماذا يفعل'),
  type: t('You type', 'تكتب'),
  open: t('Read the full page', 'اقرأ صفحته كاملة'),

  install: t('Start in three steps.', 'ابدأ بثلاث خطوات.'),
  types: t('What you can build', 'ماذا تستطيع أن تبني'),
}
