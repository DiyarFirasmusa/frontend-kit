import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

export interface AgentGuide {
  plain: Bilingual
  ask: Bilingual
  checks: Bilingual[]
  returns: Bilingual
}

export const agentGuides: Record<string, AgentGuide> = {
  planner: {
    plain: t('Cuts a large job into pieces several agents can do at the same time without touching the same file.', 'يقسم العمل الكبير إلى أجزاء، يعمل عليها عدة وكلاء معا دون أن يلمسوا الملف نفسه.'),
    ask: t('plan this for a team of agents', 'خطط لي هذا العمل لفريق من الوكلاء'),
    checks: [
      t('Reads the request, rules and code.', 'يقرأ الطلب والقواعد والكود.'),
      t('Fixes the contracts between pieces.', 'يحدد الاتفاق بين الأجزاء.'),
      t('Gives each piece its own files.', 'يعطي كل جزء ملفاته الخاصة.'),
    ],
    returns: t('Work packages for developers, testers and QA, with risks and open questions.', 'حزم عمل للمطورين والمختبرين وفريق QA، مع المخاطر والأسئلة التي بلا جواب بعد.'),
  },
  'frontend-dev': {
    plain: t('A developer who takes one well-defined change and builds it exactly.', 'مطور يأخذ تغييرا واحدا واضحا ويبنيه كما هو مطلوب بالضبط.'),
    ask: t('have frontend-dev build the address book', 'اجعل frontend-dev يبني دفتر العناوين'),
    checks: [
      t('Reads every rule and the matching skills.', 'يقرأ كل القواعد والمهارات المناسبة.'),
      t('Implements only its package.', 'ينفذ حزمته فقط.'),
      t('Must pass the typecheck before reporting back.', 'لا يرسل تقريره قبل أن ينجح فحص الأنواع.'),
    ],
    returns: t('Changed files, exports for the testers and any deviation.', 'الملفات التي تغيرت، وما يحتاجه المختبرون، وأي شيء خالف فيه الخطة.'),
  },
  'ui-designer': {
    plain: t('A product designer who reads code, for screens that work but look off.', 'مصمم منتجات يقرأ الكود، للشاشات التي تعمل لكن شكلها غير مضبوط.'),
    ask: t('ui-designer, review the checkout screen', 'ui-designer، راجع شاشة الدفع'),
    checks: [
      t('Hierarchy, spacing and type.', 'ترتيب العناصر والمسافات والخطوط.'),
      t('Tokens, light and dark parity.', 'الـ tokens، وتطابق المظهر الفاتح والداكن.'),
      t('Each language, phone first, every state.', 'كل لغة، والجوال أولا، وكل الحالات.'),
    ],
    returns: t('Issues with exact classes, before and after.', 'ملاحظات مع الـ classes المطلوبة، قبل التعديل وبعده.'),
  },
  'test-engineer': {
    plain: t('Writes the tests for a finished change and runs them. It also repairs failing or flaky tests.', 'يكتب اختبارات للتغيير المنتهي ويشغلها. ويصلح الاختبارات الفاشلة أو غير المستقرة.'),
    ask: t('add missing tests for the cart', 'أضف الاختبارات الناقصة للسلة'),
    checks: [
      t('Unit tests for logic.', 'اختبارات الوحدة للمنطق.'),
      t('Component and integration tests with a mocked API.', 'اختبارات المكونات والتكامل، مع API وهمي.'),
      t('End-to-end flows with accessibility checks.', 'اختبارات end-to-end مع فحوص إمكانية الوصول.'),
    ],
    returns: t('Results, coverage, bugs found and gaps. It does not change app behaviour.', 'النتائج والتغطية والأخطاء التي وجدها والنواقص. لا يغير سلوك التطبيق.'),
  },
  'bug-hunter': {
    plain: t('A detective for bugs with an unknown cause.', 'محقق للأخطاء التي لا أحد يعرف سببها.'),
    ask: t('find why checkout fails on Safari', 'اعرف سبب فشل الدفع على Safari'),
    checks: [
      t('Pins down the symptom.', 'يحدد المشكلة كما تظهر بدقة.'),
      t('Traces the real code path.', 'يتتبع الكود الذي يعمل فعلا.'),
      t('Looks for the root cause and not a workaround.', 'يبحث عن السبب الحقيقي لا عن حل مؤقت.'),
    ],
    returns: t('The cause, the smallest fix and a test that would have caught it.', 'السبب، وأصغر إصلاح، واختبار كان سيكشف الخطأ.'),
  },
  'frontend-reviewer': {
    plain: t('The senior reviewer. It runs by itself after the quality gate passes.', 'المراجع الخبير. يعمل وحده بعد أن تنجح بوابة الجودة.'),
    ask: t('review my branch', 'راجع فرعي'),
    checks: [
      t('Correctness, types and your project patterns.', 'صحة الكود والأنواع وأنماط مشروعك.'),
      t('API layer and your domain rules.', 'طبقة الـ API وقواعد مجالك.'),
      t('A first pass on security, SEO, access, direction and speed.', 'نظرة أولى على الأمان وSEO وإمكانية الوصول والاتجاه والسرعة.'),
    ],
    returns: t('Blocking issues, should-fix items and suggestions. It never edits.', 'مشاكل لا بد من حلها، وأمور يفضل إصلاحها، واقتراحات. لا يعدل شيئا أبدا.'),
  },
  'accessibility-auditor': {
    plain: t('Checks that everyone can use the screen: keyboard, screen reader, low vision.', 'يتأكد أن الجميع يستطيع استخدام الشاشة: بلوحة المفاتيح أو بقارئ الشاشة أو مع ضعف البصر.'),
    ask: t('audit the login page for accessibility', 'افحص إمكانية الوصول في صفحة الدخول'),
    checks: [
      t('Keyboard and focus.', 'لوحة المفاتيح والتركيز.'),
      t('Semantics, labels and forms.', 'عناصر HTML الدلالية والتسميات والنماذج.'),
      t('Contrast, RTL and WCAG 2.2 AA.', 'التباين وRTL ومعيار WCAG 2.2 AA.'),
    ],
    returns: t('Problems by severity, with the fix at file and line.', 'المشاكل مرتبة حسب الخطورة، مع الإصلاح في الملف والسطر.'),
  },
  'performance-optimizer': {
    plain: t('Finds what makes the app slow, with evidence.', 'يجد سبب بطء التطبيق، مع الدليل.'),
    ask: t('why is the products page slow?', 'لماذا صفحة المنتجات بطيئة؟'),
    checks: [
      t('Bundle and route splitting.', 'حجم الحزمة وتقسيم المسارات.'),
      t('Largest image and layout shift.', 'أكبر صورة وتحرك التخطيط.'),
      t('Re-renders, waterfalls and cache settings.', 'إعادة الرسم، وتسلسل الطلبات، وإعدادات الكاش.'),
    ],
    returns: t('A plan ordered by impact for effort, with before and after code.', 'خطة مرتبة حسب الأثر مقابل الجهد، مع الكود قبل التعديل وبعده.'),
  },
  'refactor-architect': {
    plain: t('Leads restructures bigger than one component.', 'يقود إعادة الهيكلة الأكبر من مكون واحد.'),
    ask: t('split the checkout feature into smaller files', 'قسم ميزة الدفع إلى ملفات أصغر'),
    checks: [
      t('Maps every importer of what moves.', 'يجمع كل الملفات التي تستورد ما سينتقل.'),
      t('Writes the plan and waits for approval.', 'يكتب الخطة وينتظر موافقتك.'),
      t('Moves in steps, checked each time.', 'ينقل خطوة خطوة، ويفحص بعد كل خطوة.'),
    ],
    returns: t('Old to new paths, steps, risks and rollback.', 'المسارات القديمة والجديدة، والخطوات، والمخاطر، وطريقة التراجع.'),
  },
  'qa-engineer': {
    plain: t('The last gate. It tests, walks the pages and reports pass or fail.', 'البوابة الأخيرة. يختبر ويتصفح الصفحات ويعلن النجاح أو الفشل.'),
    ask: t('run final QA on this change', 'اعمل فحص QA الأخير لهذا التغيير'),
    checks: [
      t('Every automated check and the build.', 'كل الفحوص الآلية والبناء.'),
      t('The diff against the rules.', 'يقارن التغييرات بالقواعد.'),
      t('Each changed page in every language, size and theme.', 'كل صفحة تغيرت، بكل لغة وحجم ومظهر.'),
    ],
    returns: t('Pass or fail with steps to reproduce. It never fixes.', 'نجح أو فشل، مع خطوات تكرار المشكلة. لا يصلح شيئا.'),
  },
  'frontend-security-reviewer': {
    plain: t('Reads your code for security and privacy holes before a release. It reports and does not fix.', 'يقرأ كودك ويبحث عن ثغرات الأمان والخصوصية قبل الإصدار. يبلغ فقط ولا يصلح.'),
    ask: t('have frontend-security-reviewer check this before the release', 'اطلب من frontend-security-reviewer فحص هذا قبل الإصدار'),
    checks: [
      t('Reads resolved versions and secrets in client code.', 'يقرأ الإصدارات الفعلية والأسرار في كود المتصفح.'),
      t('Follows input to HTML, redirects and server functions.', 'يتتبع المدخلات إلى HTML وإعادة التوجيه ودوال الخادم.'),
      t('Checks tokens, headers, trackers and logs.', 'يفحص الـ tokens والـ headers وأدوات التتبع والسجلات.'),
    ],
    returns: t('Findings with file, line and attack scenario, plus what it did not check.', 'النتائج مع الملف والسطر وطريقة الهجوم، ويذكر ما لم يفحصه.'),
  },
  'i18n-rtl-reviewer': {
    plain: t('Checks that the languages of your app match: every text, every plural form and the direction of the layout.', 'يتأكد أن لغات تطبيقك متطابقة: كل نص، وكل صيغة جمع، واتجاه الصفحة.'),
    ask: t('have i18n-rtl-reviewer check the new text', 'اطلب من i18n-rtl-reviewer مراجعة النص الجديد'),
    checks: [
      t('Compares the languages and their plural forms.', 'يقارن اللغات وصيغ الجمع.'),
      t('Finds text outside translations.', 'يجد النصوص المكتوبة خارج الترجمات.'),
      t('Checks direction, icons, numbers and dates.', 'يفحص الاتجاه والأيقونات والأرقام والتواريخ.'),
    ],
    returns: t('Findings with the line and the fix, plus what it did not check.', 'النتائج مع السطر والإصلاح، ويذكر ما لم يفحصه.'),
  },
  'upgrade-analyst': {
    plain: t('Plans a major version upgrade file by file, before anything changes.', 'يخطط لترقية الإصدار الرئيسي ملفا ملفا، قبل أن يتغير أي شيء.'),
    ask: t('have upgrade-analyst plan React 19', 'اطلب من upgrade-analyst أن يخطط للانتقال إلى React 19'),
    checks: [
      t('Reads the official guide of every major it crosses.', 'يقرأ الدليل الرسمي لكل إصدار رئيسي يمر به.'),
      t('Finds breaking and silent changes in your code.', 'يجد في كودك التغييرات التي تكسر الكود والتي تحدث بصمت.'),
      t('Names the check for each phase.', 'يحدد الفحص المطلوب في كل مرحلة.'),
    ],
    returns: t('A phased plan with files, commands it did not run and open questions.', 'خطة على مراحل، مع الملفات والأوامر التي لم يشغلها والأسئلة التي بلا جواب.'),
  },
  'seo-auditor': {
    plain: t('Checks a public page the way Google reads it: status, indexing, titles and links.', 'يفحص الصفحة العامة كما يقرؤها Google: الحالة والفهرسة والعناوين والروابط.'),
    ask: t('have seo-auditor check the product page', 'اطلب من seo-auditor فحص صفحة المنتج'),
    checks: [
      t('Reads the server HTML and status.', 'يقرأ HTML القادم من الخادم وحالته.'),
      t('Checks indexing, canonical and languages.', 'يفحص الفهرسة وcanonical واللغات.'),
      t('Checks sitemap, robots and structured data.', 'يفحص خريطة الموقع وrobots والبيانات المنظمة.'),
    ],
    returns: t('Blocking problems first, per URL, plus what it did not check.', 'المشاكل التي لا بد من حلها أولا، لكل رابط، ويذكر ما لم يفحصه.'),
  },
}
