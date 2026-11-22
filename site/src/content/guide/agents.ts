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
      t('Arabic and English, phone first, every state.', 'العربية والإنجليزية والجوال أولاً وكل الحالات.'),
    ],
    returns: t('Issues with exact classes, before and after.', 'ملاحظات بالأصناف الدقيقة قبل وبعد.'),
  },
  'test-engineer': {
    plain: t('Writes the tests for a finished change and runs them until they are green.', 'يكتب اختبارات التغيير المنتهي ويشغّلها حتى تنجح.'),
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
      t('Correctness, types and React patterns.', 'الصحة والأنواع وأنماط React.'),
      t('API layer and your domain rules.', 'طبقة الـ API وقواعد مجالك.'),
      t('SEO, accessibility, RTL and speed.', 'البحث والوصول والاتجاه والسرعة.'),
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
    ask: t('move the project to feature folders', 'انقل المشروع إلى مجلدات الميزات'),
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
      t('Each changed page in both languages, sizes and themes.', 'كل صفحة تغيرت باللغتين والمقاسين والمظهرين.'),
    ],
    returns: t('Pass or fail with steps to reproduce. It never fixes.', 'نجاح أو فشل بخطوات التكرار، ولا يصلح شيئاً.'),
  },
}
