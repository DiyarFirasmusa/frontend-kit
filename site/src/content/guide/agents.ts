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
    plain: t('Cuts a large job into pieces several agents can do at the same time without touching the same file.', 'يقسّم الشغل الكبير لأجزاء يشتغل عليها كذا وكيل بنفس الوقت، بدون ما يلمسون نفس الملف.'),
    ask: t('plan this for a team of agents', 'خطّطلي هالشغل لفريق وكلاء'),
    checks: [
      t('Reads the request, rules and code.', 'يقرأ الطلب والقواعد والكود.'),
      t('Fixes the contracts between pieces.', 'يثبّت الاتفاق بين الأجزاء.'),
      t('Gives each piece its own files.', 'يعطي كل جزء ملفاته.'),
    ],
    returns: t('Work packages for developers, testers and QA, with risks and open questions.', 'حزم شغل للمطورين والمختبرين والجودة، مع المخاطر والأسئلة المفتوحة.'),
  },
  'frontend-dev': {
    plain: t('A developer who takes one well-defined change and builds it exactly.', 'مطوّر ياخذ تغيير واحد واضح ويبنيه بالضبط.'),
    ask: t('have frontend-dev build the address book', 'خلّي frontend-dev يبني دفتر العناوين'),
    checks: [
      t('Reads every rule and the matching skills.', 'يقرأ كل القواعد والمهارات المناسبة.'),
      t('Implements only its package.', 'يشتغل على حزمته بس.'),
      t('Must pass the typecheck before reporting back.', 'لازم يعدّي فحص الأنواع قبل ما يرجع.'),
    ],
    returns: t('Changed files, exports for the testers and any deviation.', 'الملفات اللي تغيّرت، واللي يحتاجه المختبرين، وأي شي طلع عن الخطة.'),
  },
  'ui-designer': {
    plain: t('A product designer who reads code, for screens that work but look off.', 'مصمم منتجات يقرأ الكود، للشاشات اللي تشتغل بس شكلها مو مضبوط.'),
    ask: t('ui-designer, review the checkout screen', 'يا ui-designer، راجعلي شاشة الدفع'),
    checks: [
      t('Hierarchy, spacing and type.', 'ترتيب العناصر والمسافات والخط.'),
      t('Tokens, light and dark parity.', 'رموز التصميم، وتطابق الفاتح والداكن.'),
      t('Each language, phone first, every state.', 'كل لغة، والموبايل أول، وكل الحالات.'),
    ],
    returns: t('Issues with exact classes, before and after.', 'ملاحظات بالأصناف بالضبط، قبل وبعد.'),
  },
  'test-engineer': {
    plain: t('Writes the tests for a finished change and runs them. It also repairs failing or flaky tests.', 'يكتب اختبارات التغيير اللي خلص ويشغّلها، ويصلّح الاختبارات اللي تفشل أو تتذبذب.'),
    ask: t('add missing tests for the cart', 'ضيف اختبارات السلة الناقصة'),
    checks: [
      t('Unit tests for logic.', 'اختبارات وحدة للمنطق.'),
      t('Component and integration tests with a mocked API.', 'اختبارات مكوّنات وتكامل بـ API وهمي.'),
      t('End-to-end flows with accessibility checks.', 'مسارات كاملة من البداية للنهاية، مع فحص الوصول.'),
    ],
    returns: t('Results, coverage, bugs found and gaps. It does not change app behaviour.', 'النتائج والتغطية والأخطاء اللي لقاها والنواقص. وما يغيّر سلوك التطبيق.'),
  },
  'bug-hunter': {
    plain: t('A detective for bugs with an unknown cause.', 'محقق للأخطاء اللي ما معروف سببها.'),
    ask: t('find why checkout fails on Safari', 'شوف ليش الدفع يفشل على Safari'),
    checks: [
      t('Pins down the symptom.', 'يحدد شنو اللي يصير بالضبط.'),
      t('Traces the real code path.', 'يتتبع مسار الكود الحقيقي.'),
      t('Looks for the root cause and not a workaround.', 'يدوّر على السبب الأصلي، مو على ترقيعة.'),
    ],
    returns: t('The cause, the smallest fix and a test that would have caught it.', 'السبب، وأصغر إصلاح، واختبار كان يكشفه من البداية.'),
  },
  'frontend-reviewer': {
    plain: t('The senior reviewer. It runs by itself after the quality gate passes.', 'المراجع الخبير. يشتغل لحاله بعد ما تعدّي بوابة الجودة.'),
    ask: t('review my branch', 'راجعلي فرعي'),
    checks: [
      t('Correctness, types and your project patterns.', 'صحة الكود، والأنواع، وأنماط مشروعك.'),
      t('API layer and your domain rules.', 'طبقة الـ API وقواعد مجالك.'),
      t('A first pass on security, SEO, access, direction and speed.', 'نظرة أولى على الأمان ومحركات البحث والوصول والاتجاه والسرعة.'),
    ],
    returns: t('Blocking issues, should-fix items and suggestions. It never edits.', 'مشاكل لازم تنحل، وأشياء الأحسن تتصلح، واقتراحات. وما يعدّل أبداً.'),
  },
  'accessibility-auditor': {
    plain: t('Checks that everyone can use the screen: keyboard, screen reader, low vision.', 'يتأكد إن الكل يقدر يستعمل الشاشة: بلوحة المفاتيح، أو بقارئ الشاشة، أو بنظر ضعيف.'),
    ask: t('audit the login page for accessibility', 'دقّقلي سهولة الوصول بصفحة الدخول'),
    checks: [
      t('Keyboard and focus.', 'لوحة المفاتيح والتركيز.'),
      t('Semantics, labels and forms.', 'الدلالات والتسميات والنماذج.'),
      t('Contrast, RTL and WCAG 2.2 AA.', 'التباين والاتجاه وWCAG 2.2 AA.'),
    ],
    returns: t('Problems by severity, with the fix at file and line.', 'المشاكل مرتبة حسب خطورتها، مع الإصلاح بالملف والسطر.'),
  },
  'performance-optimizer': {
    plain: t('Finds what makes the app slow, with evidence.', 'يكتشف شنو اللي مبطّئ التطبيق، وبالدليل.'),
    ask: t('why is the products page slow?', 'ليش صفحة المنتجات بطيئة؟'),
    checks: [
      t('Bundle and route splitting.', 'الحزمة وتقسيم المسارات.'),
      t('Largest image and layout shift.', 'أكبر صورة وقفز التخطيط.'),
      t('Re-renders, waterfalls and cache settings.', 'إعادة الرسم وشلالات الطلبات وإعدادات التخزين.'),
    ],
    returns: t('A plan ordered by impact for effort, with before and after code.', 'خطة مرتبة حسب الفايدة مقابل الجهد، مع الكود قبل وبعد.'),
  },
  'refactor-architect': {
    plain: t('Leads restructures bigger than one component.', 'يقود إعادة الهيكلة اللي أكبر من مكوّن واحد.'),
    ask: t('split the checkout feature into smaller files', 'قسّم ميزة الدفع لملفات أصغر'),
    checks: [
      t('Maps every importer of what moves.', 'يحصر كل ملف يستورد الشي اللي راح ينتقل.'),
      t('Writes the plan and waits for approval.', 'يكتب الخطة وينتظر الموافقة.'),
      t('Moves in steps, checked each time.', 'ينقل خطوة خطوة، ويفحص كل مرة.'),
    ],
    returns: t('Old to new paths, steps, risks and rollback.', 'المسارات القديمة والجديدة، والخطوات، والمخاطر، وطريقة التراجع.'),
  },
  'qa-engineer': {
    plain: t('The last gate. It tests, walks the pages and reports pass or fail.', 'آخر بوابة: يختبر، ويمرّ على الصفحات، ويقول نجح أو فشل.'),
    ask: t('run final QA on this change', 'سوّي فحص الجودة الأخير على هالتغيير'),
    checks: [
      t('Every automated check and the build.', 'كل الفحوص الآلية والبناء.'),
      t('The diff against the rules.', 'التغييرات مقارنةً بالقواعد.'),
      t('Each changed page in every language, size and theme.', 'كل صفحة تغيّرت، بكل لغة ومقاس ومظهر.'),
    ],
    returns: t('Pass or fail with steps to reproduce. It never fixes.', 'نجح أو فشل، مع خطوات تعيد بيها المشكلة. وما يصلّح شي.'),
  },
  'frontend-security-reviewer': {
    plain: t('Reads your code for security and privacy holes before a release. It reports and does not fix.', 'يدوّر بكودك على ثغرات الأمان والخصوصية قبل الإصدار. يبلّغ بس، وما يصلّح.'),
    ask: t('have frontend-security-reviewer check this before the release', 'خلّي frontend-security-reviewer يفحصه قبل الإصدار'),
    checks: [
      t('Reads resolved versions and secrets in client code.', 'يقرأ الإصدارات الفعلية والأسرار بكود المتصفح.'),
      t('Follows input to HTML, redirects and server functions.', 'يتتبّع المدخلات لحد HTML وإعادة التوجيه ودوال السيرفر.'),
      t('Checks tokens, headers, trackers and logs.', 'يفحص الرموز والترويسات وأدوات التتبع والسجلات.'),
    ],
    returns: t('Findings with file, line and attack scenario, plus what it did not check.', 'النتائج بالملف والسطر وسيناريو الهجوم، ويذكر شنو اللي ما فحصه.'),
  },
  'i18n-rtl-reviewer': {
    plain: t('Checks that the languages of your app match: every text, every plural form and the direction of the layout.', 'يتأكد إن لغات تطبيقك متطابقة: كل نص، وكل صيغة جمع، واتجاه التخطيط.'),
    ask: t('have i18n-rtl-reviewer check the new text', 'خلّي i18n-rtl-reviewer يراجع النص الجديد'),
    checks: [
      t('Compares the languages and their plural forms.', 'يقارن اللغات وصيغ الجمع.'),
      t('Finds text outside translations.', 'يلقى النصوص اللي برّا ملفات الترجمة.'),
      t('Checks direction, icons, numbers and dates.', 'يفحص الاتجاه والأيقونات والأرقام والتواريخ.'),
    ],
    returns: t('Findings with the line and the fix, plus what it did not check.', 'النتائج بالسطر والإصلاح، ويذكر شنو اللي ما فحصه.'),
  },
  'upgrade-analyst': {
    plain: t('Plans a major version upgrade file by file, before anything changes.', 'يخطط للترقية الكبيرة ملف ملف، قبل ما يتغير أي شي.'),
    ask: t('have upgrade-analyst plan React 19', 'خلّي upgrade-analyst يخطط للترقية لـ React 19'),
    checks: [
      t('Reads the official guide of every major it crosses.', 'يقرأ الدليل الرسمي لكل إصدار رئيسي يعدّي عليه.'),
      t('Finds breaking and silent changes in your code.', 'يلقى التغييرات اللي تكسر، واللي تتغير بصمت، بكودك.'),
      t('Names the check for each phase.', 'يحدد شنو ينفحص بكل مرحلة.'),
    ],
    returns: t('A phased plan with files, commands it did not run and open questions.', 'خطة على مراحل، بالملفات والأوامر اللي ما شغّلها والأسئلة المفتوحة.'),
  },
  'seo-auditor': {
    plain: t('Checks a public page the way Google reads it: status, indexing, titles and links.', 'يفحص الصفحة العامة مثل ما تقراها Google: الحالة، والفهرسة، والعناوين، والروابط.'),
    ask: t('have seo-auditor check the product page', 'خلّي seo-auditor يفحص صفحة المنتج'),
    checks: [
      t('Reads the server HTML and status.', 'يقرأ HTML السيرفر وحالته.'),
      t('Checks indexing, canonical and languages.', 'يفحص الفهرسة والرابط الأساسي واللغات.'),
      t('Checks sitemap, robots and structured data.', 'يفحص خريطة الموقع وrobots والبيانات المنظمة.'),
    ],
    returns: t('Blocking problems first, per URL, plus what it did not check.', 'المشاكل المانعة أول، لكل رابط، ويذكر شنو اللي ما فحصه.'),
  },
}
