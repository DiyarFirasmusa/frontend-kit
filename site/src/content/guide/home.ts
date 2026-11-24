import { t } from './text.ts'

/** The short page: what it is, one real example, what is inside, how to get it. */
export const home = {
  // The goal of the kit, said first: the smallest ask, the best result.
  title: t('Build any frontend project from a simple ask. Get the best result.', 'ابنِ أي مشروع واجهات بطلب بسيط، بأفضل نتيجة.'),
  lead: t(
    'frontend-kit is a Claude Code plugin. Say what you want in plain words, and your assistant builds it the way a senior frontend team would: clean code, fast pages, accessible screens, checked before you commit.',
    '⁦frontend-kit⁩ إضافة لـ ⁦Claude Code⁩. قل ما تريد بكلامك العادي، ويبنيه مساعدك كما يبنيه فريق واجهات محترف: شيفرة نظيفة، وصفحات سريعة، وواجهات يستعملها الجميع، وكلها مفحوصة قبل الحفظ.',
  ),
  // Ask simply, get it built well, get it checked: one line each.
  points: [
    {
      name: t('You ask simply', 'تطلب ببساطة'),
      text: t('One sentence is enough. The right playbooks and your project’s rules are picked for you.', 'جملة واحدة تكفي. تُختار الأدلة المناسبة وقواعد مشروعك تلقائياً.'),
    },
    {
      name: t('It is built well', 'يُبنى بإتقان'),
      text: t('Typed, clean code with performance, accessibility, security and RTL built in from the start.', 'شيفرة نظيفة ومحددة الأنواع، والأداء وسهولة الوصول والأمان ودعم العربية من البداية.'),
    },
    {
      name: t('It is checked', 'ويُفحص'),
      text: t('Typecheck, tests and a second reviewer run, and risky commands are blocked. You approve the commit.', 'فحص الأنواع والاختبارات ومراجع ثانٍ، والأوامر الخطرة ممنوعة. وأنت توافق على الحفظ.'),
    },
  ],
  see: t('See one request, step by step', 'شاهد طلباً واحداً خطوة بخطوة'),
  docs: t('Read the documentation', 'اقرأ التوثيق'),

  example: t('One request, start to finish', 'طلب واحد، من البداية للنهاية'),
  exampleLead: t('You type one sentence. This is what happens next.', 'تكتب جملة واحدة. هذا ما يحدث بعدها.'),
  prompt: t('Add an orders page with a table and a status filter', 'أضف صفحة طلبات بجدول وفلتر للحالة'),
  steps: {
    skills: {
      name: t('Picks the right playbooks', 'يختار الأدلة المناسبة'),
      text: t('The table and filter skills say how to build it: server paging, filters in the URL, every state.', 'مهارتا الجدول والفلتر تحددان طريقة البناء: ترقيم من الخادم، فلاتر في الرابط، وكل الحالات.'),
    },
    rules: {
      name: t('Reads your project’s rules', 'يقرأ قواعد مشروعك'),
      text: t('While it edits those files, the rules for tables, permissions and your API are loaded.', 'أثناء تعديل تلك الملفات تُحمَّل قواعد الجداول والصلاحيات والـ API.'),
    },
    guard: {
      name: t('Refuses a risky command', 'يرفض أمراً خطراً'),
      text: t('If it tries a force push, the hook stops it with this answer:', 'إذا حاول رفعاً قسرياً، يوقفه الحارس بهذا الرد:'),
    },
    gate: {
      name: t('Runs typecheck and tests', 'يشغّل فحص الأنواع والاختبارات'),
      text: t('Before it can finish. A failure goes back to it to fix.', 'قبل أن ينتهي. وأي فشل يعود إليه ليصلحه.'),
    },
    review: {
      name: t('Gets a second opinion', 'يأخذ رأياً ثانياً'),
      text: t('frontend-reviewer reads the change with fresh eyes and lists what to fix.', 'يقرأ frontend-reviewer التغيير بعين جديدة ويذكر ما يجب إصلاحه.'),
    },
    done: {
      name: t('Asks you', 'يسألك'),
      text: t('A short report and one question: commit and push? The pull request stays your call.', 'تقرير قصير وسؤال واحد: أحفظ وأرفع؟ وفتح طلب الدمج قرارك.'),
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

  inside: t('What is inside', 'ماذا بداخلها'),
  insideLead: t('Press any name to read what it does, why it exists and when to use it.', 'اضغط أي اسم لتقرأ ماذا يفعل ولماذا وُجد ومتى تستعمله.'),
  kinds: {
    skills: t('Skills', 'المهارات'),
    agents: t('Agents', 'الوكلاء'),
    rules: t('Rules', 'القواعد'),
    checks: t('Hooks', 'الحرّاس'),
  },
  kindIs: {
    skills: t('A skill is a written playbook for one job.', 'المهارة دليل مكتوب لعمل واحد.'),
    agents: t('An agent is a separate worker with one role and fresh eyes.', 'الوكيل عامل منفصل بدور واحد وعين جديدة.'),
    rules: t('A rule is a file of standards, read while matching files are being worked on.', 'القاعدة ملف معايير يُقرأ أثناء العمل على ملفات تطابقها.'),
    checks: t('A hook is a script that runs at a fixed moment, whatever the assistant remembers.', 'الحارس سكربت يعمل في لحظة ثابتة مهما تذكّر المساعد أو نسي.'),
  },
  why: t('Why', 'لماذا'),
  when: t('When', 'متى'),
  does: t('What it does', 'ماذا يفعل'),
  type: t('You type', 'تكتب'),
  open: t('Open its full documentation', 'افتح توثيقه الكامل'),

  install: t('Get it in three commands.', 'ثبّتها بثلاثة أوامر.'),
  types: t('Works for', 'تعمل لـ'),
}
