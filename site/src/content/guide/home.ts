import { t } from './text.ts'

/** The short page: what it is, one real example, what is inside, how to get it. */
export const home = {
  // The goal of the kit, said first: the smallest ask, the best result.
  title: t('Build any frontend project. Get the best result.', 'ابنِ أي مشروع واجهات، وبأحسن نتيجة.'),
  lead: t(
    'frontend-kit is a Claude Code plugin. Say what you want in plain words, and your assistant builds it the way a senior frontend team would: clean code, fast pages, accessible screens, checked before you commit.',
    '⁦frontend-kit⁩ إضافة لـ ⁦Claude Code⁩. تكتب اللي تريده بكلامك العادي، ومساعدك يبنيه مثل ما يبنيه فريق واجهات محترف: كود نظيف، صفحات سريعة، واجهات تناسب الكل، وكله مفحوص قبل الحفظ.',
  ),
  // Ask simply, get it built well, get it checked: one line each.
  points: [
    {
      name: t('You ask simply', 'اطلب بكلمتين'),
      text: t('One sentence is enough. The right playbooks and your project’s rules are picked for you.', 'جملة وحدة تكفي. هو يختار الأدلة المناسبة وقواعد مشروعك بنفسه.'),
    },
    {
      name: t('It is built well', 'يطلع مضبوط'),
      text: t('Typed, clean code with performance, accessibility, security and RTL built in from the start.', 'كود نظيف ومضبوط الأنواع، والسرعة وسهولة الوصول والأمان ودعم العربي من أول يوم.'),
    },
    {
      name: t('It is checked', 'ومفحوص'),
      text: t('Typecheck, tests and a second reviewer run, and risky commands are blocked. You approve the commit.', 'فحص أنواع واختبارات ومراجع ثاني، والأوامر الخطرة ممنوعة. والحفظ بإيدك.'),
    },
  ],
  see: t('See one request, step by step', 'شوف طلب واحد خطوة بخطوة'),
  docs: t('Read the documentation', 'اقرا التوثيق'),

  example: t('One request, start to finish', 'طلب واحد، من أوله لآخره'),
  exampleLead: t('You type one sentence. This is what happens next.', 'تكتب جملة وحدة، وهذا اللي يصير بعدها.'),
  prompt: t('Add an orders page with a table and a status filter', 'سوّي صفحة طلبات فيها جدول وفلتر للحالة'),
  steps: {
    skills: {
      name: t('Picks the right playbooks', 'يختار الأدلة المناسبة'),
      text: t('The table and filter skills say how to build it: server paging, filters in the URL, every state.', 'مهارة الجدول ومهارة الفلتر تقولله شلون يبني: صفحات من السيرفر، فلاتر بالرابط، وكل الحالات.'),
    },
    rules: {
      name: t('Reads your project’s rules', 'يقرا قواعد مشروعك'),
      text: t('While it edits those files, the rules for tables, permissions and your API are loaded.', 'وهو يعدّل هالملفات، تكون قدامه قواعد الجداول والصلاحيات والـ API.'),
    },
    guard: {
      name: t('Refuses a risky command', 'يرفض الأمر الخطر'),
      text: t('If it tries a force push, the hook stops it with this answer:', 'إذا حاول يسوي force push، الحارس يوقفه بهالرد:'),
    },
    gate: {
      name: t('Runs typecheck and tests', 'يشغّل فحص الأنواع والاختبارات'),
      text: t('Before it can finish. A failure goes back to it to fix.', 'قبل لا يخلص. وأي فشل يرجعله حتى يصلحه.'),
    },
    review: {
      name: t('Gets a second opinion', 'ياخذ رأي ثاني'),
      text: t('frontend-reviewer reads the change with fresh eyes and lists what to fix.', 'frontend-reviewer يقرا التغيير بعين جديدة ويقولك شنو لازم يتصلح.'),
    },
    done: {
      name: t('Asks you', 'يسألك'),
      text: t('A short report and one question: commit and push? The pull request stays your call.', 'تقرير قصير وسؤال واحد: أحفظ وأرفع؟ وفتح الـ pull request قرارك.'),
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
    ask: t('Commit and push?', 'أحفظ وأرفع؟'),
  },

  // Where a project stands when the kit arrives: new, already running, or a mess.
  starts: {
    title: t('New, running or messy: it fits', 'جديد، شغّال، أو فوضوي: تركب عليه'),
    lead: t('Start a project with it, add it to the one you are working on, or use it to clean an old one up. Then keep working, clean.', 'ابدِ مشروع جديد بيها، أو ركّبها على مشروعك الحالي، أو نظّف بيها مشروع قديم. وبعدها كمّل شغلك نظيف.'),
    cases: [
      {
        mode: 'new',
        name: t('A new project', 'مشروع جديد'),
        text: t('Built to the standard from the first file.', 'ينبني على المعايير من أول ملف.'),
        command: '/frontend-kit:mode new',
        page: 'get-started',
      },
      {
        mode: 'existing',
        name: t('A project you are working on', 'مشروع شغّال عليه'),
        text: t('Setup reads your project and follows what it already does. Nothing is rewritten; you carry on where you were.', 'الإعداد يقرا مشروعك ويمشي على طريقته. ما ينكتب شي من جديد، وتكمّل من وين ما وقفت.'),
        command: '/frontend-kit:setup',
        page: 'get-started',
      },
      {
        mode: 'refactor',
        name: t('An old or messy project', 'مشروع قديم أو فوضوي'),
        text: t('Refactor mode measures the mess, plans six phases and runs them one at a time, without changing what the app does.', 'نمط إعادة الهيكلة يقيس الفوضى، يخطط ست مراحل وينفذها وحدة وحدة، بدون ما يغيّر شنو يسوي التطبيق.'),
        command: '/frontend-kit:refactor-mode on',
        page: 'refactor',
      },
    ],
    more: t('Nine modes in all, from building new to a release freeze', 'تسع أنماط بالكامل، من البناء الجديد لحد تجميد الإصدار'),
  },

  inside: t('What is inside', 'شنو بداخلها'),
  insideLead: t('Press any name to read what it does, why it exists and when to use it.', 'اضغط على أي اسم وتعرف شنو يسوي، وليش موجود، ومتى تستعمله.'),
  kinds: {
    skills: t('Skills', 'المهارات'),
    agents: t('Agents', 'الوكلاء'),
    rules: t('Rules', 'القواعد'),
    checks: t('Hooks', 'الحرّاس'),
  },
  kindIs: {
    skills: t('A skill is a written playbook for one job.', 'المهارة دليل مكتوب لشغلة وحدة.'),
    agents: t('An agent is a separate worker with one role and fresh eyes.', 'الوكيل شغّيل مستقل، إله دور واحد وعين جديدة.'),
    rules: t('A rule is a file of standards, read while matching files are being worked on.', 'القاعدة ملف معايير ينقرا وقت الشغل على الملفات اللي تخصها.'),
    checks: t('A hook is a script that runs at a fixed moment, whatever the assistant remembers.', 'الحارس سكربت يشتغل بلحظة ثابتة، تذكّر المساعد أو نسى.'),
  },
  why: t('Why', 'ليش'),
  when: t('When', 'متى'),
  does: t('What it does', 'شنو يسوي'),
  type: t('You type', 'تكتب'),
  open: t('Open its full documentation', 'افتح توثيقه كامل'),

  install: t('Get it in three commands.', 'ثبّتها بثلاث أوامر.'),
  types: t('Works for', 'تشتغل لـ'),
}
