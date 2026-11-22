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
    plain: t('Cuts a large job into pieces several agents can do at the same time without touching the same file.', 'يقطّع العمل الكبير إلى أجزاء ينفّذها عدة وكلاء معاً دون لمس الملف نفسه.'),
    ask: t('plan this for a team of agents', 'خطّط هذا لفريق من الوكلاء'),
    checks: [
      t('Reads the request, rules and code.', 'يقرأ الطلب والقواعد والشيفرة.'),
      t('Fixes the contracts between pieces.', 'يثبّت الاتفاقات بين الأجزاء.'),
      t('Gives each piece its own files.', 'يعطي كل جزء ملفاته.'),
    ],
    returns: t('Work packages for developers, testers and QA, with risks and open questions.', 'حزم عمل للمطورين والمختبرين والجودة، مع المخاطر والأسئلة المفتوحة.'),
  },
  'frontend-dev': {
    plain: t('A developer who takes one well-defined change and builds it exactly.', 'مطوّر يأخذ تغييراً محدداً ويبنيه بدقة.'),
    ask: t('have frontend-dev build the address book', 'اجعل frontend-dev يبني دفتر العناوين'),
    checks: [
      t('Reads every rule and the matching skills.', 'يقرأ كل القواعد والمهارات المناسبة.'),
      t('Implements only its package.', 'ينفّذ حزمته فقط.'),
      t('Must pass the typecheck before reporting back.', 'يجب أن ينجح في فحص الأنواع قبل أن يعود.'),
    ],
    returns: t('Changed files, exports for the testers and any deviation.', 'الملفات المتغيرة وما يحتاجه المختبرون وأي خروج عن الخطة.'),
  },
  'ui-designer': {
    plain: t('A product designer who reads code, for screens that work but look off.', 'مصمم منتجات يقرأ الشيفرة، لشاشات تعمل لكن شكلها ليس مضبوطاً.'),
    ask: t('ui-designer, review the checkout screen', 'يا ui-designer راجع شاشة الدفع'),
    checks: [
      t('Hierarchy, spacing and type.', 'التسلسل والمسافات والخط.'),
      t('Tokens, light and dark parity.', 'رموز التصميم وتطابق الفاتح والداكن.'),
      t('Each language, phone first, every state.', 'كل لغة والجوال أولاً وكل الحالات.'),
    ],
    returns: t('Issues with exact classes, before and after.', 'ملاحظات بالأصناف الدقيقة قبل وبعد.'),
  },
  'test-engineer': {
    plain: t('Writes the tests for a finished change and runs them. It also repairs failing or flaky tests.', 'يكتب اختبارات التغيير المنتهي ويشغّلها، ويصلح الاختبارات الفاشلة أو المتذبذبة.'),
    ask: t('add missing tests for the cart', 'أضف اختبارات السلة الناقصة'),
    checks: [
      t('Unit tests for logic.', 'اختبارات وحدة للمنطق.'),
      t('Component and integration tests with a mocked API.', 'اختبارات مكوّنات وتكامل بـ API محاكى.'),
      t('End-to-end flows with accessibility checks.', 'مسارات شاملة مع فحص الوصول.'),
    ],
    returns: t('Results, coverage, bugs found and gaps. It does not change app behaviour.', 'النتائج والتغطية والأخطاء والفجوات، ولا يغيّر سلوك التطبيق.'),
  },
  'bug-hunter': {
    plain: t('A detective for bugs with an unknown cause.', 'محقق للأخطاء مجهولة السبب.'),
    ask: t('find why checkout fails on Safari', 'اكتشف لماذا يفشل الدفع على Safari'),
    checks: [
      t('Pins down the symptom.', 'يحدد العرض بدقة.'),
      t('Traces the real code path.', 'يتتبع مسار الشيفرة الحقيقي.'),
      t('Looks for the root cause and not a workaround.', 'يبحث عن السبب الجذري لا عن التفاف.'),
    ],
    returns: t('The cause, the smallest fix and a test that would have caught it.', 'السبب وأصغر إصلاح واختبار كان سيكشفه.'),
  },
  'frontend-reviewer': {
    plain: t('The senior reviewer. It runs by itself after the quality gate passes.', 'المراجع الأقدم، ويعمل تلقائياً بعد نجاح بوابة الجودة.'),
    ask: t('review my branch', 'راجع فرعي'),
    checks: [
      t('Correctness, types and your project patterns.', 'الصحة والأنواع وأنماط مشروعك.'),
      t('API layer and your domain rules.', 'طبقة الـ API وقواعد مجالك.'),
      t('A first pass on security, SEO, access, direction and speed.', 'نظرة أولى على الأمان والبحث والوصول والاتجاه والسرعة.'),
    ],
    returns: t('Blocking issues, should-fix items and suggestions. It never edits.', 'مشاكل مانعة وما ينبغي إصلاحه واقتراحات، ولا يعدّل أبداً.'),
  },
  'accessibility-auditor': {
    plain: t('Checks that everyone can use the screen: keyboard, screen reader, low vision.', 'يتأكد أن الجميع يستطيع استعمال الشاشة: لوحة مفاتيح وقارئ شاشة وضعف بصر.'),
    ask: t('audit the login page for accessibility', 'دقّق سهولة الوصول في صفحة الدخول'),
    checks: [
      t('Keyboard and focus.', 'لوحة المفاتيح والتركيز.'),
      t('Semantics, labels and forms.', 'الدلالات والتسميات والنماذج.'),
      t('Contrast, RTL and WCAG 2.2 AA.', 'التباين والاتجاه وWCAG 2.2 AA.'),
    ],
    returns: t('Problems by severity, with the fix at file and line.', 'المشاكل حسب الخطورة مع الإصلاح بالملف والسطر.'),
  },
  'performance-optimizer': {
    plain: t('Finds what makes the app slow, with evidence.', 'يجد ما يبطئ التطبيق، بالدليل.'),
    ask: t('why is the products page slow?', 'لماذا صفحة المنتجات بطيئة؟'),
    checks: [
      t('Bundle and route splitting.', 'الحزمة وتقسيم المسارات.'),
      t('Largest image and layout shift.', 'أكبر صورة وقفز التخطيط.'),
      t('Re-renders, waterfalls and cache settings.', 'إعادة الرسم وشلالات الطلبات وإعدادات التخزين.'),
    ],
    returns: t('A plan ordered by impact for effort, with before and after code.', 'خطة مرتبة حسب الأثر مقابل الجهد، بشيفرة قبل وبعد.'),
  },
  'refactor-architect': {
    plain: t('Leads restructures bigger than one component.', 'يقود إعادة الهيكلة الأكبر من مكوّن.'),
    ask: t('split the checkout feature into smaller files', 'قسّم ميزة الدفع إلى ملفات أصغر'),
    checks: [
      t('Maps every importer of what moves.', 'يحصر كل مستورد لما سيُنقل.'),
      t('Writes the plan and waits for approval.', 'يكتب الخطة وينتظر الموافقة.'),
      t('Moves in steps, checked each time.', 'ينقل على خطوات مفحوصة.'),
    ],
    returns: t('Old to new paths, steps, risks and rollback.', 'المسارات القديمة والجديدة والخطوات والمخاطر والتراجع.'),
  },
  'qa-engineer': {
    plain: t('The last gate. It tests, walks the pages and reports pass or fail.', 'البوابة الأخيرة: يختبر ويتجول في الصفحات ويعلن النجاح أو الفشل.'),
    ask: t('run final QA on this change', 'شغّل فحص الجودة الأخير على هذا التغيير'),
    checks: [
      t('Every automated check and the build.', 'كل الفحوص الآلية والبناء.'),
      t('The diff against the rules.', 'التغييرات مقابل القواعد.'),
      t('Each changed page in every language, size and theme.', 'كل صفحة تغيرت بكل لغة ومقاس ومظهر.'),
    ],
    returns: t('Pass or fail with steps to reproduce. It never fixes.', 'نجاح أو فشل بخطوات التكرار، ولا يصلح شيئاً.'),
  },
  'frontend-security-reviewer': {
    plain: t('Reads your code for security and privacy holes before a release. It reports and does not fix.', 'يبحث في الشيفرة عن ثغرات الأمان والخصوصية قبل الإصدار، ويبلّغ ولا يصلح.'),
    ask: t('have frontend-security-reviewer check this before the release', 'اجعل frontend-security-reviewer يفحص هذا قبل الإصدار'),
    checks: [
      t('Reads resolved versions and secrets in client code.', 'يقرأ الإصدارات الفعلية والأسرار في شيفرة المتصفح.'),
      t('Follows input to HTML, redirects and server functions.', 'يتتبّع المدخلات إلى HTML وإعادة التوجيه ودوال الخادم.'),
      t('Checks tokens, headers, trackers and logs.', 'يفحص الرموز والترويسات وأدوات التتبع والسجلات.'),
    ],
    returns: t('Findings with file, line and attack scenario, plus what it did not check.', 'نتائج بالملف والسطر وسيناريو الهجوم، مع ما لم يفحصه.'),
  },
  'i18n-rtl-reviewer': {
    plain: t('Checks that the languages of your app match: every text, every plural form and the direction of the layout.', 'يتأكد أن لغات تطبيقك متطابقة: كل نص وكل صيغة جمع واتجاه التخطيط.'),
    ask: t('have i18n-rtl-reviewer check the new text', 'اجعل i18n-rtl-reviewer يراجع النص الجديد'),
    checks: [
      t('Compares the languages and their plural forms.', 'يقارن اللغات وصيغ الجمع.'),
      t('Finds text outside translations.', 'يجد النصوص خارج ملفات الترجمة.'),
      t('Checks direction, icons, numbers and dates.', 'يفحص الاتجاه والأيقونات والأرقام والتواريخ.'),
    ],
    returns: t('Findings with the line and the fix, plus what it did not check.', 'نتائج بالسطر والإصلاح، مع ما لم يفحصه.'),
  },
  'upgrade-analyst': {
    plain: t('Plans a major version upgrade file by file, before anything changes.', 'يخطط الترقية الكبيرة ملفاً ملفاً قبل أن يتغير أي شيء.'),
    ask: t('have upgrade-analyst plan React 19', 'اجعل upgrade-analyst يخطط الترقية إلى React 19'),
    checks: [
      t('Reads the official guide of every major it crosses.', 'يقرأ الدليل الرسمي لكل إصدار رئيسي يمرّ به.'),
      t('Finds breaking and silent changes in your code.', 'يجد التغييرات الكاسرة والصامتة في شيفرتك.'),
      t('Names the check for each phase.', 'يحدد فحص كل مرحلة.'),
    ],
    returns: t('A phased plan with files, commands it did not run and open questions.', 'خطة على مراحل بالملفات والأوامر التي لم ينفّذها والأسئلة المفتوحة.'),
  },
  'seo-auditor': {
    plain: t('Checks a public page the way Google reads it: status, indexing, titles and links.', 'يفحص الصفحة العامة كما تقرأها Google: الحالة والفهرسة والعناوين والروابط.'),
    ask: t('have seo-auditor check the product page', 'اجعل seo-auditor يفحص صفحة المنتج'),
    checks: [
      t('Reads the server HTML and status.', 'يقرأ HTML الخادم وحالته.'),
      t('Checks indexing, canonical and languages.', 'يفحص الفهرسة والرابط الأساسي واللغات.'),
      t('Checks sitemap, robots and structured data.', 'يفحص خريطة الموقع وrobots والبيانات المنظمة.'),
    ],
    returns: t('Blocking problems first, per URL, plus what it did not check.', 'المشاكل المانعة أولاً لكل رابط، مع ما لم يفحصه.'),
  },
}
