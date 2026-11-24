import { t } from './text.ts'

/** The short page: what it is, one real example, what is inside, how to get it. */
export const home = {
  // The goal of the kit, said first: the smallest ask, the best result.
  title: t('Build any frontend project. Get the best result.', 'ابدأ بأي مشروع واجهات. واحصل على أفضل نتيجة.'),
  lead: t(
    'Wajiha is a Claude Code plugin. Say what you want in plain words, and your assistant builds it the way a senior frontend team would: clean code, fast pages, accessible screens, checked before you commit.',
    'واجهة إضافة لـ \u2066Claude Code\u2069. قل ما تريده بكلمات بسيطة، فيبنيه مساعدك كما يبنيه فريق واجهات متمرس: كود نظيف، وصفحات سريعة، وشاشات يستخدمها الجميع. ثم يفحص النتيجة قبل أن تحفظها.',
  ),
  // Ask simply, get it built well, get it checked: one line each.
  points: [
    {
      name: t('You ask simply', 'اطلب بجملة واحدة'),
      text: t('One sentence is enough. The right playbooks and your project’s rules are picked for you.', 'جملة واحدة تكفي. يختار المساعد المهارات المناسبة، ويقرأ قواعد مشروعك بنفسه.'),
    },
    {
      name: t('It is built well', 'بناء متقن'),
      text: t('Typed, clean code with performance, accessibility, security and RTL built in from the start.', 'كود نظيف بأنواع صارمة، وفيه الأداء وسهولة الوصول والأمان ودعم RTL من البداية.'),
    },
    {
      name: t('It is checked', 'ثم يفحصه'),
      text: t('Typecheck, tests and a second reviewer run, and risky commands are blocked. You approve the commit.', 'يعمل فحص الأنواع والاختبارات، ويراجعه قارئ ثان، ويرفض الحارس الأوامر الخطرة. وأنت توافق على الحفظ.'),
    },
  ],
  see: t('See one request, step by step', 'شاهد خطوات طلب واحد'),
  docs: t('Read the documentation', 'اقرأ الوثائق'),

  example: t('One request, start to finish', 'من أول طلب إلى آخر خطوة'),
  exampleLead: t('You type one sentence. This is what happens next.', 'تكتب جملة واحدة. وهذا ما يحدث بعدها.'),
  prompt: t('Add an orders page with a table and a status filter', 'أنشئ صفحة طلبات فيها جدول وفلتر للحالة'),
  steps: {
    skills: {
      name: t('Picks the right playbooks', 'يختار المهارات المناسبة'),
      text: t('The table and filter skills say how to build it: server paging, filters in the URL, every state.', 'تحدد مهارة الجدول والفلتر كيف تبني الصفحة.'),
    },
    rules: {
      name: t('Reads your project’s rules', 'يقرأ قواعد مشروعك'),
      text: t('While it edits those files, the rules for tables, permissions and your API are loaded.', 'أثناء تعديل هذه الملفات، يقرأ قواعد الجداول والصلاحيات والـ API.'),
    },
    guard: {
      name: t('Refuses a risky command', 'يرفض أي أمر خطر'),
      text: t('If it tries a force push, the hook stops it with this answer:', 'إذا حاول الرفع بالقوة (force push)، يوقفه الحارس بهذا الرد:'),
    },
    gate: {
      name: t('Runs typecheck and tests', 'يشغل فحص الأنواع والاختبارات'),
      text: t('Before it can finish. A failure goes back to it to fix.', 'قبل أن ينتهي المساعد من عمله. وإذا فشل شيء، يعود إليه ليصلحه.'),
    },
    review: {
      name: t('Gets a second opinion', 'يأخذ رأي قارئ ثان'),
      text: t('frontend-reviewer reads the change with fresh eyes and lists what to fix.', 'يقرأ frontend-reviewer التغيير بعين جديدة، ويكتب ما يجب إصلاحه.'),
    },
    done: {
      name: t('Asks you', 'يسألك'),
      text: t('A short report and one question: commit and push? The pull request stays your call.', 'يصلك ملخص قصير وسؤال واحد: هل أحفظ وأرفع؟ وفتح الـ pull request قرارك.'),
    },
  },
  /** The words of the session panel. */
  session: {
    skill: t('skill', 'مهارة'),
    rule: t('rule', 'قاعدة'),
    blocked: t('blocked', 'مرفوض'),
    passed: t('passed', 'ناجح'),
    typecheck: t('typecheck', 'فحص الأنواع'),
    tests: t('related tests', 'الاختبارات المرتبطة'),
    reviewing: t('reviewing the change', 'يراجع التغيير'),
    ask: t('Commit and push?', 'هل أحفظ وأرفع؟'),
  },

  // Where a project stands when the kit arrives: new, already running, or a mess.
  starts: {
    title: t('New, running or messy: it fits', 'مشروع جديد أو قائم أو فوضوي؟ الإضافة تناسبه'),
    lead: t('Start a project with it, add it to the one you are working on, or use it to clean an old one up. Then keep working, clean.', 'استخدمها في بداية مشروع جديد، أو أضفها إلى مشروعك الحالي، أو نظّف بها مشروعك القديم. ثم واصل العمل بكود نظيف.'),
    cases: [
      {
        mode: 'new',
        name: t('A new project', 'مشروع جديد'),
        text: t('Built to the standard from the first file.', 'كل شيء حسب المعايير من أول ملف.'),
        command: '/wajiha-kit:mode new',
        page: 'get-started',
      },
      {
        mode: 'existing',
        name: t('A project you are working on', 'مشروع تعمل عليه'),
        text: t('Setup reads your project and follows what it already does. Nothing is rewritten; you carry on where you were.', 'يقرأ الإعداد مشروعك ويتبع طريقته. لا يعيد كتابة أي شيء، وتتابع من حيث كنت.'),
        command: '/wajiha-kit:setup',
        page: 'get-started',
      },
      {
        mode: 'refactor',
        name: t('An old or messy project', 'مشروع قديم أو فوضوي'),
        text: t('Refactor mode measures the mess, plans six phases and runs them one at a time, without changing what the app does.', 'يقيس نمط إعادة الهيكلة حجم الفوضى، ويخطط ست مراحل وينفذها واحدة بعد أخرى. ولا يتغير ما يفعله التطبيق.'),
        command: '/wajiha-kit:refactor-mode on',
        page: 'refactor',
      },
    ],
    more: t('Nine modes in all, from building new to a release freeze', 'تسعة أنماط في المجموع، من البناء الجديد إلى تجميد الإصدار'),
  },

  inside: t('What is inside', 'ماذا فيها'),
  insideLead: t('Press any name to read what it does, why it exists and when to use it.', 'اضغط على أي اسم لتعرف ماذا يفعل، ولماذا يوجد، ومتى تستخدمه.'),
  kinds: {
    skills: t('Skills', 'المهارات'),
    agents: t('Agents', 'الوكلاء'),
    rules: t('Rules', 'القواعد'),
    checks: t('Hooks', 'الحراس'),
  },
  kindIs: {
    skills: t('A skill is a written playbook for one job.', 'المهارة دليل مكتوب لمهمة واحدة.'),
    agents: t('An agent is a separate worker with one role and fresh eyes.', 'الوكيل عامل مستقل له دور واحد ونظرة جديدة.'),
    rules: t('A rule is a file of standards, read while matching files are being worked on.', 'القاعدة ملف معايير، يقرأه المساعد أثناء العمل على الملفات المطابقة.'),
    checks: t('A hook is a script that runs at a fixed moment, whatever the assistant remembers.', 'الحارس سكربت يعمل في لحظة محددة، سواء تذكر المساعد أم نسي.'),
  },
  why: t('Why', 'لماذا'),
  when: t('When', 'متى'),
  does: t('What it does', 'ماذا يفعل'),
  type: t('You type', 'تكتب'),
  open: t('Open its full documentation', 'افتح وثائقه الكاملة'),

  install: t('Get it in three commands.', 'ثبّتها بثلاثة أوامر.'),
  types: t('Works for', 'تعمل مع'),
}
