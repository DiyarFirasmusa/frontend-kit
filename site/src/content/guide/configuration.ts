import { t } from './text.ts'

export const settings = [
  {
    title: t('Project', 'المشروع'),
    keys: [
      ['profile', t('The kind of project: website, dashboard, react or fullstack.', 'نوع المشروع: website أو dashboard أو react أو fullstack.')],
      ['mode', t('How careful and how fast the assistant works: new, existing, maintenance, refactor, upgrade or freeze. Switch it with /wajiha-kit:mode.', 'مقدار حذر المساعد وسرعته: new أو existing أو maintenance أو refactor أو upgrade أو freeze. بدّله بالأمر \u2066/wajiha-kit:mode\u2069.')],
      ['stack', t('What setup found in your project: the tool that installs libraries, the framework, the page router, data, state, styling, tests, the code checker, the formatter and translations.', 'ما وجده الإعداد في مشروعك: أداة تثبيت المكتبات، والإطار، ونظام التنقل بين الصفحات (router)، والبيانات، والحالة، والتنسيق البصري (styling)، والاختبارات، وفاحص الكود (lint)، ومنسّق الكود، والترجمة.')],
      ['srcDirs', t('The folders that hold your code. If you leave it empty, code in any folder is watched.', 'المجلدات التي فيها كود مشروعك. إن تركتها فارغة، يراقب المساعد الكود في كل المجلدات.')],
      ['apps', t('For a project with more than one app, such as a website plus an admin area. Each app has its own folders.', 'لمشروع فيه أكثر من تطبيق، مثل موقع مع لوحة إدارة. ولكل تطبيق مجلداته.')],
      ['githubRepo', t('The address of your project on GitHub, as owner/name. It is used to make a link that shows your changes.', 'عنوان مشروعك على GitHub بصيغة owner/name. يُستخدم لعمل رابط يعرض تغييراتك.')],
    ],
  },
  {
    title: t('Protection', 'الحماية'),
    keys: [
      ['defaultBranch', t('The main version of your project, where each new task starts from.', 'النسخة الرئيسية من مشروعك، وتبدأ منها كل مهمة جديدة.')],
      ['protectedBranches', t('Versions of the project that the safety checks defend, so the checks refuse known ways of saving or uploading straight into them. Default: main and master.', 'نسخ المشروع التي تحميها فحوص الأمان، فلا تُحفظ فيها التغييرات ولا تُرفع إليها مباشرة. الافتراضي: main وmaster.')],
      ['liveHosts', t('The addresses of your live website. The assistant may not request or open them.', 'عناوين موقعك المنشور. ممنوع على المساعد أن يطلبها أو يفتحها.')],
      ['uatHost', t('The address of your test copy. The assistant may use it.', 'عنوان النسخة التجريبية من موقعك. يستطيع المساعد استخدامه.')],
      ['protectedPaths', t('Files the assistant may not edit, such as the files that publish your site.', 'ملفات ممنوع على المساعد تعديلها، مثل الملفات التي تنشر موقعك.')],
      ['generatedPaths', t('Files made by a tool. They change by running that tool, not by hand.', 'ملفات تصنعها أداة. تتغير بتشغيل هذه الأداة وليس باليد.')],
      ['allowJs', t('true allows new JavaScript files in a TypeScript project (TypeScript is JavaScript with stricter checks).', 'القيمة true تسمح بملفات JavaScript جديدة في مشروع TypeScript (وهو JavaScript بفحوص أشد).')],
    ],
  },
  {
    title: t('Commands', 'الأوامر'),
    keys: [
      ['commands.typecheck', t('The command that checks the code for mistakes. The final check runs it.', 'أمر فحص الكود بحثا عن الأخطاء. يشغله الفحص الأخير.')],
      ['commands.relatedTests', t('Runs the tests for the files that changed. The file names are added at the end.', 'يشغل اختبارات الملفات التي تغيرت، ويضيف أسماء الملفات في آخره.')],
      ['commands.allTests', t('Runs every test, when the final check is set to all.', 'يشغل كل الاختبارات، عندما تضبط الفحص الأخير على all.')],
      ['commands.i18nValidate', t('The command that checks your translations.', 'أمر التحقق من الترجمة.')],
      ['commands.formatFile', t('The command that tidies one file’s layout. It replaces the tool setup found.', 'أمر ترتيب شكل ملف واحد. يحل محل الأداة التي وجدها الإعداد.')],
      ['commands.lintFile', t('The command that checks one file for common mistakes and style problems. It replaces the tool setup found.', 'أمر فحص ملف واحد بحثا عن الأخطاء الشائعة ومشكلات الأسلوب. يحل محل الأداة التي وجدها الإعداد.')],
      ['devPort', t('The number your app uses while you work on it on your computer (the port).', 'الرقم الذي يستخدمه تطبيقك أثناء عملك عليه على جهازك (المنفذ).')],
      ['e2ePort', t('The port used by the tests that click through your whole app like a person would.', 'المنفذ الذي تستخدمه الاختبارات التي تتنقل في تطبيقك كله كما يفعل شخص حقيقي.')],
      ['apiBaseEnv', t('The name of the setting that holds your backend’s address.', 'اسم الإعداد الذي يحمل عنوان خادمك.')],
    ],
  },
  {
    title: t('Switches', 'المفاتيح'),
    keys: [
      ['guards', t('A switch for each of the newer safety checks. If the assistant wants to loosen one, it asks you first.', 'مفتاح لكل فحص من فحوص الأمان الأحدث. وإذا أراد المساعد تخفيف أحدها، يسألك أولا.')],
      ['modes.reportDir', t('Where read-only mode may write. Default: docs/audits.', 'المجلد الذي يكتب فيه نمط القراءة فقط. الافتراضي: docs/audits.')],
      ['modes.prototypeDir', t('Where prototype mode may write. Default: prototypes.', 'المجلد الذي يكتب فيه نمط النموذج الأولي. الافتراضي: prototypes.')],
      ['stopGate.review', t('false turns off the automatic review at the end.', 'القيمة false توقف المراجعة التلقائية في النهاية.')],
      ['stopGate.tests', t('all runs every test instead of only the related ones.', 'القيمة all تشغل كل الاختبارات بدل المرتبطة فقط.')],
      ['hooks.skillSuggest', t('false turns off the hints about which skill to use.', 'القيمة false توقف التلميحات عن المهارة المناسبة.')],
    ],
  },
] as const

export const sample = `{
  "profile": "dashboard",
  "mode": "existing",
  "defaultBranch": "main",
  "protectedBranches": ["main"],
  "liveHosts": ["admin.example.com"],
  "uatHost": "uat.example.com",
  "devPort": "5173",
  "srcDirs": ["src"],
  "commands": {
    "typecheck": "npm run typecheck",
    "relatedTests": "npx vitest related --run --passWithNoTests"
  },
  "stopGate": { "review": true, "tests": "related" },
  "hooks": { "skillSuggest": true }
}`
