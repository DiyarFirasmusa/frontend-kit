import { t } from './text.ts'

export const settings = [
  {
    title: t('Project', 'المشروع'),
    keys: [
      ['profile', t('website, dashboard, react or fullstack.', 'website أو dashboard أو react أو fullstack.')],
      ['mode', t('new, existing, maintenance, refactor, upgrade or freeze. Switch it with /wajiha-kit:mode.', 'new أو existing أو maintenance أو refactor أو upgrade أو freeze. بدله بالأمر \u2066/wajiha-kit:mode\u2069.')],
      ['stack', t('What setup found: package manager, framework, router, data, state, styling, tests, lint, format and i18n.', 'ما وجده الإعداد في مشروعك: مدير الحزم، والإطار، والـ router، والبيانات، والحالة، والـ styling، والاختبارات، وlint، والتنسيق، والترجمة.')],
      ['srcDirs', t('The folders that count as your source. Without them, code in any folder is watched.', 'المجلدات التي فيها كود مشروعك. إن لم تحددها، يراقب الحراس الكود في كل المجلدات.')],
      ['apps', t('The apps of a monorepo or a site plus admin, with their own folders.', 'تطبيقات الـ monorepo أو الموقع مع الإدارة، ولكل تطبيق مجلداته.')],
      ['githubRepo', t('owner/name, for the compare link.', 'owner/name، لرابط المقارنة.')],
    ],
  },
  {
    title: t('Protection', 'الحماية'),
    keys: [
      ['defaultBranch', t('Where task branches start.', 'الفرع الذي تبدأ منه فروع المهام.')],
      ['protectedBranches', t('Branches the guard defends. Default: main and master.', 'الفروع التي يحميها الحارس. الافتراضي: main وmaster.')],
      ['liveHosts', t('Production hosts. The assistant may not request or open them.', 'خوادم الإنتاج. ممنوع على المساعد أن يطلبها أو يفتحها.')],
      ['uatHost', t('The test environment the assistant may use.', 'بيئة الاختبار التي يستطيع المساعد استخدامها.')],
      ['protectedPaths', t('Files the assistant may not edit, such as deploy config.', 'ملفات ممنوع على المساعد تعديلها، مثل إعدادات النشر.')],
      ['generatedPaths', t('Generated files that are changed through their generator.', 'ملفات مولدة، تتغير عن طريق المولد الخاص بها.')],
      ['allowJs', t('true allows new JavaScript files in a TypeScript project.', 'القيمة true تسمح بملفات JavaScript جديدة في مشروع TypeScript.')],
    ],
  },
  {
    title: t('Commands', 'الأوامر'),
    keys: [
      ['commands.typecheck', t('The typecheck the gate runs.', 'أمر فحص الأنواع الذي تشغله البوابة.')],
      ['commands.relatedTests', t('Runs the tests for changed files. The files are added to the end.', 'يشغل اختبارات الملفات التي تغيرت، ويضيف أسماء الملفات في آخره.')],
      ['commands.allTests', t('The whole suite, when the gate is set to all.', 'كل الاختبارات، عندما تضبط البوابة على all.')],
      ['commands.i18nValidate', t('The translation validator.', 'أداة التحقق من الترجمة.')],
      ['commands.formatFile', t('Replaces the detected formatter for one file.', 'أمر تنسيق ملف واحد. يحل محل أداة التنسيق التي وجدها الإعداد.')],
      ['commands.lintFile', t('Replaces the detected linter for one file.', 'أمر lint لملف واحد. يحل محل الأداة التي وجدها الإعداد.')],
      ['devPort', t('The dev server’s port.', 'منفذ خادم التطوير.')],
      ['e2ePort', t('The end-to-end tests’ own port.', 'منفذ اختبارات end-to-end.')],
      ['apiBaseEnv', t('The name of the API address variable.', 'اسم المتغير الذي يحمل عنوان الـ API.')],
    ],
  },
  {
    title: t('Switches', 'المفاتيح'),
    keys: [
      ['guards', t('A switch for each of the newer guards. Loosening one is put to you first.', 'مفتاح لكل حارس من الحراس الأحدث. وإذا أردت تخفيف أحدها، يسألك المساعد أولا.')],
      ['modes.reportDir', t('Where read-only mode may write. Default: docs/audits.', 'المجلد الذي يكتب فيه نمط القراءة فقط. الافتراضي: docs/audits.')],
      ['modes.prototypeDir', t('Where prototype mode may write. Default: prototypes.', 'المجلد الذي يكتب فيه نمط النموذج الأولي. الافتراضي: prototypes.')],
      ['stopGate.review', t('false turns off the automatic review.', 'القيمة false توقف المراجعة التلقائية.')],
      ['stopGate.tests', t('all runs every unit test instead of the related ones.', 'القيمة all تشغل كل اختبارات الوحدة بدل المرتبطة فقط.')],
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
