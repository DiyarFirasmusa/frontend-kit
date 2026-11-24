import { t } from './text.ts'

export const settings = [
  {
    title: t('Project', 'المشروع'),
    keys: [
      ['profile', t('website, dashboard, react or fullstack.', 'website أو dashboard أو react أو fullstack.')],
      ['mode', t('new, existing, maintenance, refactor, upgrade or freeze. Switch it with /frontend-kit:mode.', 'new أو existing أو maintenance أو refactor أو upgrade أو freeze. تبدّله بـ \u2066/frontend-kit:mode\u2069.')],
      ['stack', t('What setup found: package manager, framework, router, data, state, styling, tests, lint, format and i18n.', 'اللي لقاه الإعداد: مدير الحزم، الفريموورك، الراوتر، البيانات، الحالة، الستايل، الاختبارات، التدقيق، الترتيب والترجمة.')],
      ['srcDirs', t('The folders that count as your source. Without them, code in any folder is watched.', 'المجلدات اللي تنحسب كودك. بدونها، الكود بأي مجلد يتراقب.')],
      ['apps', t('The apps of a monorepo or a site plus admin, with their own folders.', 'تطبيقات الـ monorepo أو الموقع مع الإدارة، كل واحد بمجلده.')],
      ['githubRepo', t('owner/name, for the compare link.', 'owner/name، لرابط المقارنة.')],
    ],
  },
  {
    title: t('Protection', 'الحماية'),
    keys: [
      ['defaultBranch', t('Where task branches start.', 'منين تبدي فروع المهام.')],
      ['protectedBranches', t('Branches the guard defends. Default: main and master.', 'الفروع اللي يحميها الحارس. بالأساس main وmaster.')],
      ['liveHosts', t('Production hosts. The assistant may not request or open them.', 'دومينات الإنتاج. المساعد ما يطلبها ولا يفتحها.')],
      ['uatHost', t('The test environment the assistant may use.', 'بيئة التجربة اللي مسموح للمساعد يستعملها.')],
      ['protectedPaths', t('Files the assistant may not edit, such as deploy config.', 'ملفات ممنوع المساعد يعدّلها، مثل إعدادات النشر.')],
      ['generatedPaths', t('Generated files that are changed through their generator.', 'ملفات مولّدة، تتغير بس عن طريق مولّدها.')],
      ['allowJs', t('true allows new JavaScript files in a TypeScript project.', 'true تسمح بملفات JavaScript جديدة بمشروع TypeScript.')],
    ],
  },
  {
    title: t('Commands', 'الأوامر'),
    keys: [
      ['commands.typecheck', t('The typecheck the gate runs.', 'فحص الأنواع اللي تشغّله البوابة.')],
      ['commands.relatedTests', t('Runs the tests for changed files. The files are added to the end.', 'يشغّل اختبارات الملفات اللي تغيّرت، والملفات تنضاف بآخره.')],
      ['commands.allTests', t('The whole suite, when the gate is set to all.', 'كل الاختبارات، من تكون البوابة مضبوطة على all.')],
      ['commands.i18nValidate', t('The translation validator.', 'مدقق الترجمة.')],
      ['commands.formatFile', t('Replaces the detected formatter for one file.', 'يحل محل أداة الترتيب اللي انلقت، لملف واحد.')],
      ['commands.lintFile', t('Replaces the detected linter for one file.', 'يحل محل أداة التدقيق اللي انلقت، لملف واحد.')],
      ['devPort', t('The dev server’s port.', 'بورت سيرفر التطوير.')],
      ['e2ePort', t('The end-to-end tests’ own port.', 'البورت الخاص باختبارات end-to-end.')],
      ['apiBaseEnv', t('The name of the API address variable.', 'اسم متغير عنوان الـ API.')],
    ],
  },
  {
    title: t('Switches', 'المفاتيح'),
    keys: [
      ['guards', t('A switch for each of the newer guards. Loosening one is put to you first.', 'مفتاح لكل حارس من الحرّاس الجداد، وأي تخفيف إلهم ينعرض عليك أول.')],
      ['modes.reportDir', t('Where read-only mode may write. Default: docs/audits.', 'وين يكتب نمط القراءة فقط. بالأساس docs/audits.')],
      ['modes.prototypeDir', t('Where prototype mode may write. Default: prototypes.', 'وين يكتب نمط النموذج الأولي. بالأساس prototypes.')],
      ['stopGate.review', t('false turns off the automatic review.', 'false تطفي المراجعة التلقائية.')],
      ['stopGate.tests', t('all runs every unit test instead of the related ones.', 'all تشغّل كل اختبارات الوحدة بدل المرتبطة بس.')],
      ['hooks.skillSuggest', t('false turns off skill hints.', 'false تطفي تلميحات المهارات.')],
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
