import { t } from './text.ts'

export const settings = [
  {
    title: t('Project', 'المشروع'),
    keys: [
      ['profile', t('website, dashboard, react or fullstack.', 'website أو dashboard أو react أو fullstack.')],
      ['mode', t('new, existing, maintenance, refactor, upgrade or freeze. Switch it with /frontend-kit:mode.', 'new أو existing أو maintenance أو refactor أو upgrade أو freeze. بدّله بالأمر \u2066/frontend-kit:mode\u2069.')],
      ['stack', t('What setup found: package manager, framework, router, data, state, styling, tests, lint, format and i18n.', 'ما اكتشفه الإعداد: مدير الحزم، والإطار، والموجّه، والبيانات، والحالة، وتنسيق الواجهة، والاختبارات، وأداة lint، وأداة التنسيق، والترجمة.')],
      ['srcDirs', t('The folders that count as your source. Without them, code in any folder is watched.', 'المجلدات التي تعدّها مصدر الكود. وإن لم تحددها، يُراقَب الكود في أي مجلد.')],
      ['apps', t('The apps of a monorepo or a site plus admin, with their own folders.', 'تطبيقات الـ monorepo أو الموقع مع الإدارة، لكل تطبيق مجلداته.')],
      ['githubRepo', t('owner/name, for the compare link.', 'owner/name، لرابط المقارنة.')],
    ],
  },
  {
    title: t('Protection', 'الحماية'),
    keys: [
      ['defaultBranch', t('Where task branches start.', 'المكان الذي تبدأ منه فروع المهام.')],
      ['protectedBranches', t('Branches the guard defends. Default: main and master.', 'الفروع التي يحميها الحارس. الافتراضي: main وmaster.')],
      ['liveHosts', t('Production hosts. The assistant may not request or open them.', 'خوادم الإنتاج. لا يجوز للمساعد أن يطلبها أو يفتحها.')],
      ['uatHost', t('The test environment the assistant may use.', 'بيئة الاختبار التي يجوز للمساعد استخدامها.')],
      ['protectedPaths', t('Files the assistant may not edit, such as deploy config.', 'ملفات لا يجوز للمساعد تعديلها، مثل إعدادات النشر.')],
      ['generatedPaths', t('Generated files that are changed through their generator.', 'ملفات مولّدة، تتغير عبر المولّد الخاص بها.')],
      ['allowJs', t('true allows new JavaScript files in a TypeScript project.', 'القيمة true تسمح بملفات JavaScript جديدة في مشروع TypeScript.')],
    ],
  },
  {
    title: t('Commands', 'الأوامر'),
    keys: [
      ['commands.typecheck', t('The typecheck the gate runs.', 'فحص الأنواع الذي تشغّله البوابة.')],
      ['commands.relatedTests', t('Runs the tests for changed files. The files are added to the end.', 'يشغّل اختبارات الملفات التي تغيّرت، ويضيف الملفات في آخره.')],
      ['commands.allTests', t('The whole suite, when the gate is set to all.', 'كل الاختبارات، عندما تُضبط البوابة على all.')],
      ['commands.i18nValidate', t('The translation validator.', 'أداة التحقق من الترجمة.')],
      ['commands.formatFile', t('Replaces the detected formatter for one file.', 'يحل محل أداة التنسيق المكتشفة، لملف واحد.')],
      ['commands.lintFile', t('Replaces the detected linter for one file.', 'يحل محل أداة lint المكتشفة، لملف واحد.')],
      ['devPort', t('The dev server’s port.', 'منفذ خادم التطوير.')],
      ['e2ePort', t('The end-to-end tests’ own port.', 'المنفذ الخاص باختبارات end-to-end.')],
      ['apiBaseEnv', t('The name of the API address variable.', 'اسم المتغير الذي يحمل عنوان الـ API.')],
    ],
  },
  {
    title: t('Switches', 'المفاتيح'),
    keys: [
      ['guards', t('A switch for each of the newer guards. Loosening one is put to you first.', 'مفتاح لكل حارس من الحرّاس الأحدث. وأي تخفيف لحارس يُعرض عليك أولاً.')],
      ['modes.reportDir', t('Where read-only mode may write. Default: docs/audits.', 'المكان الذي يُسمح لنمط القراءة فقط بالكتابة فيه. الافتراضي: docs/audits.')],
      ['modes.prototypeDir', t('Where prototype mode may write. Default: prototypes.', 'المكان الذي يُسمح لنمط النموذج الأولي بالكتابة فيه. الافتراضي: prototypes.')],
      ['stopGate.review', t('false turns off the automatic review.', 'القيمة false توقف المراجعة التلقائية.')],
      ['stopGate.tests', t('all runs every unit test instead of the related ones.', 'القيمة all تشغّل كل اختبارات الوحدة بدل المرتبطة فقط.')],
      ['hooks.skillSuggest', t('false turns off skill hints.', 'القيمة false توقف تلميحات المهارات.')],
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
