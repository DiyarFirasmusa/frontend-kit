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
    plain: t('A planner for big jobs. It cuts a large job into pieces that several specialists can do at the same time without touching the same file.', 'مخطط للأعمال الكبيرة. يقسم العمل الكبير إلى أجزاء، يعمل عليها عدة مختصين معا دون أن يلمسوا الملف نفسه.'),
    ask: t('plan this for a team of specialists', 'خطط لي هذا العمل لفريق من المختصين'),
    checks: [
      t('Reads your request, the rules and the code.', 'يقرأ طلبك والقواعد والكود.'),
      t('Fixes the agreements between the pieces (the contracts).', 'يحدد الاتفاق بين الأجزاء (العقود).'),
      t('Gives each piece its own files.', 'يعطي كل جزء ملفاته الخاصة.'),
    ],
    returns: t('Work packages for the developers, testers and QA (quality checkers), with risks and open questions.', 'حزم عمل للمطورين والمختبرين وفريق QA (فحص الجودة)، مع المخاطر والأسئلة التي بلا جواب بعد.'),
  },
  'frontend-dev': {
    plain: t('A developer that takes one clearly defined change and builds exactly what was asked.', 'مطور يأخذ تغييرا واحدا واضحا ويبني بالضبط ما طلب منه.'),
    ask: t('have frontend-dev build the address book', 'اجعل frontend-dev يبني دفتر العناوين'),
    checks: [
      t('Reads every rule and the matching skills.', 'يقرأ كل القواعد والمهارات المناسبة.'),
      t('Builds only its own package of work.', 'ينفذ حزمة عمله فقط.'),
      t('Must pass the code check (it looks for mistakes) before reporting back.', 'لا يرسل تقريره قبل أن ينجح فحص الكود (يبحث عن الأخطاء).'),
    ],
    returns: t('The files that changed, what the testers need, and anything where it left the plan.', 'الملفات التي تغيرت، وما يحتاجه المختبرون، وأي شيء خالف فيه الخطة.'),
  },
  'ui-designer': {
    plain: t('A product designer who can read code. Use it for screens that work but look off.', 'مصمم منتجات يقرأ الكود. استخدمه للشاشات التي تعمل لكن شكلها غير مضبوط.'),
    ask: t('ui-designer, review the checkout screen', 'ui-designer، راجع شاشة الدفع'),
    checks: [
      t('The order of the elements, the spacing and the fonts.', 'ترتيب العناصر والمسافات والخطوط.'),
      t('Your design values (colours, sizes) and whether light and dark mode match.', 'قيم التصميم عندك (الألوان والأحجام)، وتطابق المظهر الفاتح والداكن.'),
      t('Each language, phone first, every state of the screen.', 'كل لغة، والجوال أولا، وكل حالات الشاشة.'),
    ],
    returns: t('Issues with the exact style classes to change, before and after.', 'ملاحظات مع الـ classes (أسماء الأنماط) المطلوبة، قبل التعديل وبعده.'),
  },
  'test-engineer': {
    plain: t('Writes the tests for a finished change and runs them. A test is a small program that checks that something still works. It also repairs failing or unreliable tests.', 'يكتب اختبارات للتغيير المنتهي ويشغلها. الاختبار برنامج صغير يتأكد أن شيئا ما ما زال يعمل. ويصلح أيضا الاختبارات الفاشلة أو غير المستقرة.'),
    ask: t('add missing tests for the cart', 'أضف الاختبارات الناقصة للسلة'),
    checks: [
      t('Unit tests for the logic (small tests of one piece at a time).', 'اختبارات الوحدة للمنطق (اختبارات صغيرة لكل جزء على حدة).'),
      t('Tests of screen pieces working together, with a fake backend (a mocked API).', 'اختبارات أجزاء الشاشة وهي تعمل معا، مع خادم خلفي وهمي (API وهمي).'),
      t('End-to-end flows (a full walk through the app like a user) with accessibility checks.', 'اختبارات end-to-end (جولة كاملة في التطبيق مثل المستخدم) مع فحوص إمكانية الوصول.'),
    ],
    returns: t('Results, coverage, bugs found and gaps. It does not change how the app behaves.', 'النتائج والتغطية والأخطاء التي وجدها والنواقص. لا يغير سلوك التطبيق.'),
  },
  'bug-hunter': {
    plain: t('A detective for bugs whose cause nobody knows.', 'محقق للأخطاء التي لا أحد يعرف سببها.'),
    ask: t('find why checkout fails on Safari', 'اعرف سبب فشل الدفع على Safari'),
    checks: [
      t('Pins down exactly how the problem shows up.', 'يحدد المشكلة كما تظهر بدقة.'),
      t('Follows the code that really runs.', 'يتتبع الكود الذي يعمل فعلا.'),
      t('Looks for the root cause, not a workaround.', 'يبحث عن السبب الحقيقي لا عن حل مؤقت.'),
    ],
    returns: t('The cause, the smallest fix and a test that would have caught the bug.', 'السبب، وأصغر إصلاح، واختبار كان سيكشف الخطأ.'),
  },
  'frontend-reviewer': {
    plain: t('The experienced reviewer. It reads your changes like a colleague and starts by itself after the final checks pass.', 'المراجع الخبير. يقرأ تغييراتك مثل زميل، ويبدأ وحده بعد أن تنجح الفحوص الأخيرة.'),
    ask: t('review my branch', 'راجع فرعي'),
    checks: [
      t('Is the code correct, are the types right, does it follow your project’s patterns.', 'صحة الكود والأنواع واتباع أنماط مشروعك.'),
      t('How it talks to your backend, and your own domain rules.', 'طريقة اتصاله بالخادم الخلفي، وقواعد مجال عملك.'),
      t('A first look at security, search visibility (SEO), access for everyone, text direction and speed.', 'نظرة أولى على الأمان وظهور الصفحة في البحث (SEO) وإمكانية الوصول للجميع واتجاه الكتابة والسرعة.'),
    ],
    returns: t('Problems that must be fixed, things that should be fixed, and suggestions. It never edits anything.', 'مشاكل لا بد من حلها، وأمور يفضل إصلاحها، واقتراحات. لا يعدل شيئا أبدا.'),
  },
  'accessibility-auditor': {
    plain: t('Checks that everyone can use the screen: with a keyboard, with a screen reader (software that reads the screen aloud), or with poor eyesight.', 'يتأكد أن الجميع يستطيع استخدام الشاشة: بلوحة المفاتيح أو بقارئ الشاشة (برنامج يقرأ الشاشة بصوت عال) أو مع ضعف البصر.'),
    ask: t('audit the login page for accessibility', 'افحص إمكانية الوصول في صفحة الدخول'),
    checks: [
      t('Keyboard use and where the focus goes.', 'لوحة المفاتيح وأين يذهب التركيز.'),
      t('The meaning of each element, the labels and the forms.', 'معنى كل عنصر في الصفحة، والتسميات، والنماذج.'),
      t('Contrast, right-to-left text and the WCAG 2.2 AA standard.', 'التباين والكتابة من اليمين إلى اليسار ومعيار WCAG 2.2 AA.'),
    ],
    returns: t('Problems by how serious they are, with the fix at the file and line.', 'المشاكل مرتبة حسب الخطورة، مع الإصلاح في الملف والسطر.'),
  },
  'performance-optimizer': {
    plain: t('Finds what makes the app slow, and shows the proof.', 'يجد سبب بطء التطبيق، ويعرض الدليل.'),
    ask: t('why is the products page slow?', 'لماذا صفحة المنتجات بطيئة؟'),
    checks: [
      t('How big the downloaded code is, and whether pages load only what they need.', 'حجم الكود الذي يحمل، وهل تحمل كل صفحة ما تحتاجه فقط.'),
      t('The largest image, and content that jumps around while loading.', 'أكبر صورة، والمحتوى الذي يقفز أثناء التحميل.'),
      t('Drawing the same thing again and again, requests that wait for each other, and saved-copy (cache) settings.', 'إعادة رسم الشيء نفسه مرارا، وطلبات تنتظر بعضها، وإعدادات النسخ المحفوظة (الكاش).'),
    ],
    returns: t('A plan ordered by how much it helps for the effort, with the code before and after.', 'خطة مرتبة حسب الفائدة مقابل الجهد، مع الكود قبل التعديل وبعده.'),
  },
  'refactor-architect': {
    plain: t('Leads restructures bigger than one screen piece. A restructure changes how the code is organised without changing what the app does.', 'يقود عمليات إعادة الترتيب الأكبر من جزء واحد من الشاشة. إعادة الترتيب تغير تنظيم الكود دون أن تغير ما يفعله التطبيق.'),
    ask: t('split the checkout feature into smaller files', 'قسم ميزة الدفع إلى ملفات أصغر'),
    checks: [
      t('Finds every file that uses what is going to move.', 'يجمع كل الملفات التي تستخدم ما سينتقل.'),
      t('Writes the plan and waits for your approval.', 'يكتب الخطة وينتظر موافقتك.'),
      t('Moves things step by step, and checks after each step.', 'ينقل خطوة خطوة، ويفحص بعد كل خطوة.'),
    ],
    returns: t('Old and new paths, the steps, the risks and how to go back.', 'المسارات القديمة والجديدة، والخطوات، والمخاطر، وطريقة التراجع.'),
  },
  'qa-engineer': {
    plain: t('A last look at the pages. It runs the tests, walks through the pages and says pass or fail.', 'نظرة أخيرة على الصفحات. يشغل الاختبارات ويتصفح الصفحات ويعلن النجاح أو الفشل.'),
    ask: t('run final QA on this change', 'أجرِ فحص الجودة الأخير لهذا التغيير'),
    checks: [
      t('Every automatic check, and the build (turning the code into the real app).', 'كل الفحوص الآلية، والبناء (تحويل الكود إلى التطبيق الحقيقي).'),
      t('The changes compared with the rules.', 'يقارن التغييرات بالقواعد.'),
      t('Each changed page in every language, size and theme (light and dark).', 'كل صفحة تغيرت، بكل لغة وحجم ومظهر (فاتح وداكن).'),
    ],
    returns: t('Pass or fail, with the steps to repeat the problem. It never fixes anything.', 'نجح أو فشل، مع خطوات تكرار المشكلة. لا يصلح شيئا.'),
  },
  'frontend-security-reviewer': {
    plain: t('Reads your code for security and privacy holes before a release. It reports problems and does not fix them.', 'يقرأ كودك ويبحث عن ثغرات الأمان والخصوصية قبل الإصدار. يبلغ عن المشاكل ولا يصلحها.'),
    ask: t('have frontend-security-reviewer check this before the release', 'اطلب من frontend-security-reviewer فحص هذا قبل الإصدار'),
    checks: [
      t('Reads the versions that are really installed, and looks for secrets in code that reaches the browser.', 'يقرأ الإصدارات المثبتة فعلا، ويبحث عن الأسرار في الكود الذي يصل إلى المتصفح.'),
      t('Follows what people type into the page, links that redirect, and functions that run on the server.', 'يتتبع ما يكتبه الناس في الصفحة، والروابط التي تحول الزائر، والدوال التي تعمل على الخادم.'),
      t('Checks tokens (secrets that prove who is signed in), headers, trackers and logs.', 'يفحص الـ tokens (أسرار تثبت من سجل دخوله) والـ headers وأدوات التتبع والسجلات.'),
    ],
    returns: t('Findings with the file, the line and how an attack would work, plus what it did not check.', 'النتائج مع الملف والسطر وطريقة الهجوم، ويذكر ما لم يفحصه.'),
  },
  'i18n-rtl-reviewer': {
    plain: t('Checks that the languages of your app match: every text, every plural form (one item, two items, many items) and the direction of the page.', 'يتأكد أن لغات تطبيقك متطابقة: كل نص، وكل صيغة جمع (عنصر واحد، عنصران، عناصر كثيرة)، واتجاه الصفحة.'),
    ask: t('have i18n-rtl-reviewer check the new text', 'اطلب من i18n-rtl-reviewer مراجعة النص الجديد'),
    checks: [
      t('Compares the languages and their plural forms.', 'يقارن اللغات وصيغ الجمع.'),
      t('Finds text written outside the translation files.', 'يجد النصوص المكتوبة خارج ملفات الترجمة.'),
      t('Checks direction, icons, numbers and dates.', 'يفحص الاتجاه والأيقونات والأرقام والتواريخ.'),
    ],
    returns: t('Findings with the line and the fix, plus what it did not check.', 'النتائج مع السطر والإصلاح، ويذكر ما لم يفحصه.'),
  },
  'upgrade-analyst': {
    plain: t('Plans the move to a new major version of a tool, file by file, before anything changes.', 'يخطط للانتقال إلى إصدار رئيسي جديد من أداة ما، ملفا ملفا، قبل أن يتغير أي شيء.'),
    ask: t('have upgrade-analyst plan React 19', 'اطلب من upgrade-analyst أن يخطط للانتقال إلى React 19'),
    checks: [
      t('Reads the official guide of every major version it passes.', 'يقرأ الدليل الرسمي لكل إصدار رئيسي يمر به.'),
      t('Finds changes in your code that will break it, and changes that happen silently.', 'يجد في كودك التغييرات التي ستكسره، والتغييرات التي تحدث بصمت.'),
      t('Names the check to run after each phase.', 'يحدد الفحص المطلوب بعد كل مرحلة.'),
    ],
    returns: t('A plan in phases, with the files, the commands it did not run and the open questions.', 'خطة على مراحل، مع الملفات والأوامر التي لم يشغلها والأسئلة التي بلا جواب.'),
  },
  'seo-auditor': {
    plain: t('Checks a public page the way Google reads it: its status, whether it can be indexed (listed in search), titles and links.', 'يفحص الصفحة العامة كما يقرؤها Google: حالتها، وهل يمكن فهرستها (إدراجها في البحث)، والعناوين والروابط.'),
    ask: t('have seo-auditor check the product page', 'اطلب من seo-auditor فحص صفحة المنتج'),
    checks: [
      t('Reads the HTML the server sends, and its status.', 'يقرأ HTML القادم من الخادم وحالته.'),
      t('Checks indexing, the canonical address (the main address of a page) and languages.', 'يفحص الفهرسة وعنوان canonical (العنوان الرئيسي للصفحة) واللغات.'),
      t('Checks the sitemap (the list of your pages), robots (the file that tells search engines where not to go) and structured data.', 'يفحص خريطة الموقع (قائمة صفحاتك) وملف robots (الذي يقول لمحركات البحث أين لا تذهب) والبيانات المنظمة.'),
    ],
    returns: t('Problems that must be fixed first, per link, plus what it did not check.', 'المشاكل التي لا بد من حلها أولا، لكل رابط، ويذكر ما لم يفحصه.'),
  },
}
