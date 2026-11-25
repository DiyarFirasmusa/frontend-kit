import { t } from './text.ts'

/** The short page: what it is, one real example, what is inside, how to get it. */
export const home = {
  // The goal of the kit, said first: the smallest ask, the best result.
  title: t('Build your own website or dashboard. No coding needed.', 'اصنع موقعك أو لوحة تحكمك بنفسك. دون أن تكتب أي كود.'),
  lead: t(
    'A free kit for the Claude app on your computer. You answer a few simple questions, and it builds a website or dashboard you can open and click through, in Arabic and English. Then it checks the result before you see it. You approve each command it runs.',
    '«واجهة» إضافة مجانية لتطبيق \u2066Claude\u2069 على حاسوبك. تجيب عن بضعة أسئلة بسيطة، فتبني لك موقعا أو لوحة تحكم تفتحها وتتصفحها، بالعربية والإنجليزية. ثم تفحص النتيجة قبل أن تراها. وتوافق أنت على كل أمر ينفذه.',
  ),
  // Ask simply, get it built well, get it checked: one line each.
  points: [
    {
      name: t('You answer five questions', 'تجيب عن خمسة أسئلة'),
      text: t('What you want to build, a few lines about it, the look you like, your backend link and the languages. No technical choices.', 'ماذا تريد أن تبني، وأسطر قليلة عنه، والشكل الذي يعجبك، ورابط الخادم، واللغات. دون أي قرار تقني.'),
    },
    {
      name: t('It builds the whole project', 'تبني المشروع كاملا'),
      text: t('Pages, forms, tables, light and dark mode, Arabic and English. All of it is set up in a proven way.', 'الصفحات والنماذج والجداول والوضع الفاتح والداكن والعربية والإنجليزية. كلها مرتبة بطريقة مجربة.'),
    },
    {
      name: t('It checks before showing you', 'تفحص العمل قبل أن تعرضه عليك'),
      text: t('It looks for mistakes, runs tests and asks a reviewer. Known risky commands are stopped. You decide what to keep.', 'تبحث عن الأخطاء، وتجري الاختبارات، وتسأل مراجعا. وتوقف الأوامر الخطرة المعروفة. وأنت تقرر ما تحتفظ به.'),
    },
  ],
  start: t('Install the kit', 'ثبّت الإضافة'),
  builds: {
    title: t('What can you build?', 'ماذا تستطيع أن تبني؟'),
    lead: t('Pick one when Claude asks. You do not choose any tools: each kind comes ready.', 'اختر واحدا عندما يسألك Claude. ولن تختار أي أدوات: كل نوع يأتي جاهزا.'),
    say: t('You could say', 'يمكنك أن تقول'),
    more: t('See the three kinds of project', 'شاهد الأنواع الثلاثة للمشاريع'),
  },
  see: t('See an example, step by step', 'شاهد مثالا خطوة بخطوة'),
  docs: t('Read the guide', 'اقرأ الدليل'),

  example: t('From an idea to a working project', 'من فكرة إلى مشروع يعمل'),
  exampleLead: t('You say what you want. This is what happens next, in plain words.', 'تقول ما تريده. وهذا ما يحدث بعدها، بكلمات بسيطة.'),
  prompt: t('I want a dashboard to manage my shop orders', 'أريد لوحة تحكم لإدارة طلبات متجري'),
  steps: {
    install: {
      name: t('You add the kit to Claude', 'تضيف الإضافة إلى Claude'),
      text: t('In the Claude app, you send one message. Claude installs the kit for you and goes straight on to your project.', 'في تطبيق Claude ترسل رسالة واحدة. يثبت Claude الإضافة بنفسه، ثم يبدأ تجهيز مشروعك.'),
    },
    skills: {
      name: t('It asks what you want', 'تسألك ماذا تريد'),
      text: t('Dashboard, website or both. Your project in your own words: what it contains and what people can do in it. Your design or a site you like. Your backend link. The languages.', 'لوحة تحكم أو موقع أو الاثنان. مشروعك بكلماتك: ماذا يحتوي وماذا يفعل الناس فيه. تصميمك أو موقع يعجبك. رابط الخادم. واللغات.'),
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
      text: t('It looks for mistakes, runs tests, and a reviewer reads the work. If something fails, it tries to fix it before you see it.', 'تبحث عن الأخطاء، وتجري الاختبارات، ويقرأ مراجع العمل. وإذا فشل شيء حاولت إصلاحه قبل أن تراه.'),
    },
    review: {
      name: t('A reviewer reads it', 'يقرؤها مراجع'),
      text: t('Another Claude helper, called a reviewer, reads the work and lists anything to improve.', 'مساعد آخر من ⁦Claude⁩ يسمى المراجع يقرأ العمل ويكتب ما يمكن تحسينه.'),
    },
    done: {
      name: t('You decide', 'القرار لك'),
      text: t('You get a short report and one question: save this version? Nothing is saved or published without your yes.', 'يصلك تقرير قصير وسؤال واحد: هل أحفظ هذه النسخة؟ ولا يُحفظ ولا يُنشر شيء دون موافقتك.'),
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
    lead: t('Most people start with an idea and nothing else. If you already have a project, the kit can join it or clean it up.', 'أغلب الناس يبدؤون بفكرة فقط. وإن كان عندك مشروع، تستطيع الإضافة أن تنضم إليه أو أن ترتبه.'),
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
        text: t('The kit reads your project and follows how it is built. Nothing is rewritten.', 'تقرأ الإضافة مشروعك وتتبع طريقة بنائه. ولا تُعاد كتابة شيء.'),
        command: '/wajiha-kit:setup',
        page: 'get-started',
      },
      {
        mode: 'refactor',
        name: t('My project is old and messy', 'مشروعي قديم وفوضوي'),
        text: t('It measures the mess, makes a plan in six steps and does them one by one. What your app does stays the same.', 'تقيس حجم الفوضى، وتضع خطة من ست مراحل، وتنفذها واحدة بعد أخرى. وما يفعله تطبيقك لا يتغير.'),
        command: '/wajiha-kit:refactor-mode on',
        page: 'refactor',
      },
    ],
    more: t('Ways of working, from building something new to protecting an old app', 'طرق العمل، من بناء شيء جديد إلى حماية تطبيق قديم'),
  },

  inside: t('What is inside', 'ما بداخلها'),
  insideLead: t('You do not need this to start. It shows what works for you behind the scenes. Press any name to learn more.', 'لست بحاجة إلى هذا لتبدأ. هنا ما يعمل لأجلك في الخلفية. اضغط على أي اسم لتعرف أكثر.'),
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

  install: t('Start in two steps.', 'ابدأ بخطوتين.'),
  types: t('What you can build', 'ماذا تستطيع أن تبني'),
}
