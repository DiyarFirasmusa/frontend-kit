import { t } from './text.ts'

export const settings = [
  {
    title: t('Project', 'المشروع'),
    keys: [
      ['profile', t('website, dashboard, react or fullstack.', 'website أو dashboard أو react أو fullstack.')],
      ['mode', t('new, existing or refactor.', 'new أو existing أو refactor.')],
      ['stack', t('What setup found: package manager, framework, router, data, state, styling, tests, lint, format and i18n.', 'ما وجده الإعداد: مدير الحزم وإطار العمل والموجّه والبيانات والحالة والتنسيق والاختبارات والمدقّق والترجمة.')],
      ['srcDirs', t('The folders that count as your source.', 'المجلدات التي تُعدّ شيفرتك.')],
      ['apps', t('The apps of a monorepo or a site plus admin, with their own folders.', 'تطبيقات الـ monorepo أو الموقع مع الإدارة بمجلداتها.')],
      ['githubRepo', t('owner/name, for the compare link.', 'owner/name لرابط المقارنة.')],
    ],
  },
  {
    title: t('Protection', 'الحماية'),
    keys: [
      ['defaultBranch', t('Where task branches start.', 'من أين تبدأ فروع المهام.')],
      ['protectedBranches', t('Branches the guard defends. Default: main and master.', 'الفروع التي يحميها الحارس، وافتراضياً main وmaster.')],
      ['liveHosts', t('Production hosts. The assistant may not request or open them.', 'نطاقات الإنتاج، لا يطلبها المساعد ولا يفتحها.')],
      ['uatHost', t('The test environment the assistant may use.', 'البيئة التجريبية المسموحة للمساعد.')],
      ['protectedPaths', t('Files the assistant may not edit, such as deploy config.', 'ملفات لا يعدّلها المساعد، مثل إعداد النشر.')],
      ['generatedPaths', t('Generated files that are changed through their generator.', 'ملفات مولّدة تُغيَّر عبر مولّدها.')],
      ['allowJs', t('true allows new JavaScript files in a TypeScript project.', 'true تسمح بملفات JavaScript في مشروع TypeScript.')],
    ],
  },
  {
    title: t('Commands', 'الأوامر'),
    keys: [
      ['commands.typecheck', t('The typecheck the gate runs.', 'فحص الأنواع الذي تشغّله البوابة.')],
      ['commands.relatedTests', t('Runs the tests for changed files. The files are added to the end.', 'يشغّل اختبارات الملفات المتغيرة، وتُضاف الملفات إلى آخره.')],
      ['commands.allTests', t('The whole suite, when the gate is set to all.', 'كل الاختبارات، عندما تُضبط البوابة على all.')],
      ['commands.i18nValidate', t('The translation validator.', 'مدقّق الترجمة.')],
      ['commands.formatFile', t('Replaces the detected formatter for one file.', 'يستبدل المنسّق المكتشف لملف واحد.')],
      ['commands.lintFile', t('Replaces the detected linter for one file.', 'يستبدل المدقّق المكتشف لملف واحد.')],
      ['devPort', t('The dev server’s port.', 'منفذ خادم التطوير.')],
      ['e2ePort', t('The end-to-end tests’ own port.', 'المنفذ الخاص بالاختبارات الشاملة.')],
      ['apiBaseEnv', t('The name of the API address variable.', 'اسم متغير عنوان الـ API.')],
    ],
  },
  {
    title: t('Switches', 'المفاتيح'),
    keys: [
      ['stopGate.review', t('false turns off the automatic review.', 'false توقف المراجعة التلقائية.')],
      ['stopGate.tests', t('all runs every unit test instead of the related ones.', 'all تشغّل كل الاختبارات بدل المرتبطة.')],
      ['hooks.skillSuggest', t('false turns off skill hints.', 'false توقف اقتراح المهارات.')],
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
