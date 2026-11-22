import type { Bilingual } from '../catalogue.ts'
import type { HookEvent } from '../types.ts'
import { t } from './text.ts'

/** Why a piece of the kit exists, and when it is the right one. Written from its source file. */
export interface Purpose {
  why: Bilingual
  when: Bilingual
}

export const skillPurpose: Record<string, Purpose> = {
  'create-component': {
    why: t('Without a procedure Claude writes a new button each time, in a new place and style. This makes it look for the existing one first, then build to your conventions.', 'من دون طريقة محددة يكتب Claude زراً جديداً كل مرة بمكان وشكل مختلفين. هذه تجعله يبحث عن الموجود أولاً ثم يبني وفق أعرافك.'),
    when: t('Any new or extracted piece of interface, even a small one. With a Figma link, figma-match runs beside it.', 'أي قطعة واجهة جديدة أو مستخرجة ولو صغيرة. ومع رابط Figma تعمل figma-match إلى جانبها.'),
  },
  'create-form': {
    why: t('Forms are where validation, accessibility and double submits go wrong. One recipe settles the schema, labels, translated errors and a single submit.', 'النماذج موضع أخطاء التحقق والوصول والإرسال المكرر. وصفة واحدة تحسم المخطط والتسميات والأخطاء المترجمة والإرسال مرة واحدة.'),
    when: t('Any screen that takes input: login, phone, code, address, profile, filters or an edit dialog.', 'أي شاشة تستقبل إدخالاً: دخول أو هاتف أو رمز أو عنوان أو ملف شخصي أو مرشحات أو نافذة تعديل.'),
  },
  'create-hook': {
    why: t('Logic piles up inside components until nobody can test it. This moves it into a hook with the right place, keys, guards and tests.', 'يتراكم المنطق داخل المكوّنات حتى يتعذّر اختباره. هذه تنقله إلى hook بمكانه الصحيح ومفاتيحه وشروطه واختباراته.'),
    when: t('A data query, a mutation, the logic of a page, a small utility, or a container that is getting heavy.', 'استعلام بيانات أو عملية تعديل أو منطق صفحة أو أداة صغيرة، أو حاوية بدأت تثقل.'),
  },
  'create-store': {
    why: t('Global state is easy to add and hard to remove. This first asks whether a store is needed at all, then handles saving and sign-out cleanup.', 'الحالة العامة سهلة الإضافة صعبة الإزالة. هذه تسأل أولاً هل يلزم مخزن أصلاً، ثم تعالج الحفظ والتنظيف عند الخروج.'),
    when: t('State that outlives a component: a preference, the session, a cart, a draft, or data handed between routes.', 'حالة تعيش أطول من المكوّن: تفضيل أو جلسة أو سلة أو مسودة أو بيانات تُسلَّم بين المسارات.'),
  },
  'figma-match': {
    why: t('“Close enough” is not what a designer handed over. This reads the frame, maps it to your tokens and compares the result.', '«قريب منه» ليس ما سلّمه المصمم. هذه تقرأ الإطار وتربطه برموز تصميمك وتقارن النتيجة.'),
    when: t('You give a Figma link, or say the screen must look like the design.', 'تعطي رابط Figma أو تقول إن الشاشة يجب أن تطابق التصميم.'),
  },
  'frontend-design': {
    why: t('Left alone, Claude produces the same generic page. This makes it commit to a deliberate visual direction before any code.', 'إذا تُرك Claude وحده أنتج الصفحة العامة نفسها. هذه تلزمه باتجاه بصري مقصود قبل أي شيفرة.'),
    when: t('A brand-new page or section with no Figma frame, when you ask for a new look. Not for routine product screens.', 'صفحة أو قسم جديد كلياً بلا Figma وأنت تطلب شكلاً جديداً، وليس لشاشات المنتج المعتادة.'),
  },
  'ui-ux-pro-max': {
    why: t('Design advice from memory repeats itself. This searches a catalogue of styles, palettes, type pairings and UX guidelines.', 'نصائح التصميم من الذاكرة تتكرر. هذه تبحث في فهرس من الأساليب والألوان والخطوط وإرشادات الاستخدام.'),
    when: t('You ask for ideas, alternatives or a better experience. Not when a design already exists.', 'تطلب أفكاراً أو بدائل أو تجربة أفضل، وليس عندما يوجد تصميم جاهز.'),
  },
  'i18n-conventions': {
    why: t('Translations rot quietly: missing languages, deep keys, keys built at run time. One convention keeps every key findable and checkable.', 'الترجمات تفسد بصمت: لغة ناقصة ومفاتيح عميقة ومفاتيح تُبنى وقت التشغيل. عُرف واحد يُبقي كل مفتاح قابلاً للبحث والفحص.'),
    when: t('Any change to visible text, a locale file or a translation call.', 'أي تغيير في نص ظاهر أو ملف ترجمة أو نداء ترجمة.'),
  },
  'tanstack-query-key-conventions': {
    why: t('An inline query key is a cache bug waiting to happen. One factory makes invalidating a whole family reliable.', 'مفتاح استعلام مكتوب في مكانه خطأ تخزين مؤجل. مصنع واحد يجعل إبطال عائلة كاملة أمراً مضموناً.'),
    when: t('Writing or reviewing any query, mutation, prefetch or invalidation in TanStack Query.', 'كتابة أو مراجعة أي استعلام أو عملية أو جلب مسبق أو إبطال في TanStack Query.'),
  },
  'typescript-advanced-types': {
    why: t('Hard typing problems tempt any and casts. This reference shows the precise type in their place.', 'مشاكل الأنواع الصعبة تغري باستعمال any والتحويل القسري. هذا المرجع يبيّن النوع الدقيق مكانهما.'),
    when: t('Generics, conditional or mapped types, or a reusable type utility.', 'الأنواع العامة والشرطية والمشتقة، أو أداة أنواع قابلة لإعادة الاستعمال.'),
  },
  'dash-create-route': {
    why: t('An admin page is a route, a guard, a search schema, a loader and a menu entry. Forgetting one means a leak or a broken link.', 'صفحة الإدارة مسار وحارس ومخطط بحث ومحمّل وعنصر قائمة. نسيان واحد منها يعني تسريباً أو رابطاً مكسوراً.'),
    when: t('A new page, address, guarded section or sidebar entry in a dashboard.', 'صفحة أو عنوان أو قسم محمي أو عنصر قائمة جديد في لوحة تحكم.'),
  },
  'dash-create-table': {
    why: t('A table looks done long before it is. This settles server paging, sorting in the URL, actions and all four states.', 'يبدو الجدول جاهزاً قبل أن يجهز بكثير. هذه تحسم الترقيم من الخادم والفرز في الرابط والأفعال والحالات الأربع.'),
    when: t('A list page, grid, columns, sorting, paging, row actions or bulk selection.', 'صفحة قائمة أو شبكة أو أعمدة أو فرز أو ترقيم أو أفعال صفوف أو تحديد جماعي.'),
  },
  'dash-create-filter-bar': {
    why: t('Filters kept in component state vanish on reload and cannot be shared. This keeps each one typed in the URL.', 'المرشحات المحفوظة داخل المكوّن تختفي عند التحديث ولا تُشارَك. هذه تبقي كل واحد في الرابط بنوعه.'),
    when: t('Search, selects, a date range or a toolbar above a list.', 'بحث أو قوائم اختيار أو مدى تواريخ أو شريط أدوات فوق قائمة.'),
  },
  'dash-create-detail': {
    why: t('A record page mixes reading, tabs, state changes and conflicts. This gives each a fixed place.', 'صفحة السجل تخلط العرض والتبويبات وتغيير الحالة والتعارضات. هذه تعطي كلاً مكاناً ثابتاً.'),
    when: t('A details page for an order, user or any record with history, notes or a status.', 'صفحة تفاصيل لطلب أو مستخدم أو أي سجل له تاريخ أو ملاحظات أو حالة.'),
  },
  'dash-create-crud': {
    why: t('Create, edit and delete repeat in every module and drift. One recipe covers the form, cache, server errors, confirm and permissions.', 'الإضافة والتعديل والحذف تتكرر في كل وحدة وتتباعد. وصفة واحدة تغطي النموذج والتخزين وأخطاء الخادم والتأكيد والصلاحيات.'),
    when: t('Adding, editing, deleting, archiving or toggling an entity in a dashboard.', 'إضافة عنصر أو تعديله أو حذفه أو أرشفته أو تبديل حالته في لوحة تحكم.'),
  },
  'dash-create-settings-form': {
    why: t('Settings are one record many people edit. This adds conflict handling, an unsaved warning and read-only sections.', 'الإعدادات سجل واحد يعدّله كثيرون. هذه تضيف معالجة التعارض وتنبيه غير المحفوظ وأقساماً للقراءة فقط.'),
    when: t('A settings, preferences or profile page that edits one record.', 'صفحة إعدادات أو تفضيلات أو ملف شخصي تعدّل سجلاً واحداً.'),
  },
  'web-create-route': {
    why: t('A public page must be right in the first response: data, title, a real 404 and redirects. Client-only habits break that.', 'الصفحة العامة يجب أن تصح من أول استجابة: البيانات والعنوان و404 حقيقية والتحويلات. عادات المتصفح وحده تكسر ذلك.'),
    when: t('A new page or address, a slug page, a 404, a redirect or data that should render on the server.', 'صفحة أو عنوان جديد أو صفحة باسم في الرابط أو 404 أو تحويل أو بيانات يجب عرضها من الخادم.'),
  },
  'web-create-feature': {
    why: t('From an endpoint to a page is a dozen files. This writes all of them in the same shape every time, translations and tests included.', 'من نقطة API إلى صفحة نحو عشرة ملفات أو أكثر. هذه تكتبها كلها بالشكل نفسه كل مرة مع الترجمة والاختبارات.'),
    when: t('You hand over an endpoint or API document and ask for the whole feature.', 'تسلّم نقطة أو وثيقة API وتطلب الميزة كاملة.'),
  },
  'web-seo-page': {
    why: t('A page nobody can find, or that shares with the wrong picture, fails quietly. This covers every tag a search engine or chat app reads.', 'الصفحة التي لا يجدها أحد أو تُشارَك بصورة خاطئة تفشل بصمت. هذه تغطي كل وسم يقرؤه محرك بحث أو تطبيق محادثة.'),
    when: t('Any new public page, or a problem with titles, previews, structured data, sitemap or canonical links.', 'أي صفحة عامة جديدة، أو مشكلة في العناوين أو المعاينات أو البيانات المنظمة أو خريطة الموقع.'),
  },
  'web-server-fn': {
    why: t('Secrets and cookies must never reach the browser. This puts them behind a validated, authorised server function.', 'الأسرار والكوكيز يجب ألا تصل المتصفح. هذه تضعها خلف دالة خادم تتحقق من المدخلات والصلاحية.'),
    when: t('Hiding a key, reading a session cookie, proxying the backend, a webhook or a server-only library.', 'إخفاء مفتاح أو قراءة كوكي الجلسة أو تمرير طلب إلى الخادم أو webhook أو مكتبة للخادم فقط.'),
  },
  task: {
    why: t('Work that starts on the wrong branch or ends unverified costs a review round. This runs a ticket from branch to question.', 'العمل الذي يبدأ على فرع خاطئ أو ينتهي بلا تحقق يكلّف جولة مراجعة. هذه تقود التذكرة من الفرع إلى السؤال الأخير.'),
    when: t('A new task or a ticket link. A single component or form has its own skill.', 'مهمة جديدة أو رابط تذكرة. أما مكوّن أو نموذج واحد فله مهارته.'),
  },
  explain: {
    why: t('A question should get an answer, not an edit. This finds the real cause in the code and changes nothing.', 'السؤال جوابه كلام لا تعديل. هذه تجد السبب الحقيقي في الشيفرة ولا تغيّر شيئاً.'),
    when: t('You ask why, how or which endpoint, or need a note for someone else.', 'تسأل لماذا أو كيف أو أي نقطة API، أو تحتاج ملاحظة لغيرك.'),
  },
  dev: {
    why: t('A busy port or a stale cache wastes minutes and leads to wrong conclusions. This checks first and waits until the app answers.', 'منفذ مشغول أو ذاكرة قديمة يضيّعان الوقت ويقودان لاستنتاج خاطئ. هذه تفحص أولاً وتنتظر حتى يستجيب التطبيق.'),
    when: t('Starting, stopping or restarting the app, or when it serves old code.', 'تشغيل التطبيق أو إيقافه أو إعادته، أو عندما يعرض شيفرة قديمة.'),
  },
  refactor: {
    why: t('Cleaning up is where behaviour breaks by accident. This moves code in safe steps and proves nothing changed.', 'التنظيف موضع كسر السلوك بالخطأ. هذه تنقل الشيفرة بخطوات آمنة وتثبت أن شيئاً لم يتغير.'),
    when: t('A long file, duplicated code, logic in the wrong layer or leftovers of a migration.', 'ملف طويل أو شيفرة مكررة أو منطق في طبقة خاطئة أو بقايا ترحيل.'),
  },
  'refactor-mode': {
    why: t('A whole old project cannot be fixed in one change. This measures it and rebuilds it phase by phase with your approval.', 'المشروع القديم كله لا يُصلح بتغيير واحد. هذه تقيسه وتعيد بناءه مرحلة مرحلة بموافقتك.'),
    when: t('An existing project far from the standards. Only you can start it, by name.', 'مشروع قائم بعيد عن المعايير. أنت وحدك من يشغّلها، باسمها.'),
  },
  'fix-everywhere': {
    why: t('Claude fixes the one case you showed and leaves the rest. This finds them all and proves with a search that none are left.', 'يصلح Claude الحالة التي أريتها ويترك الباقي. هذه تجدها كلها وتثبت ببحث أنه لم يبق منها شيء.'),
    when: t('You say all, every or other pages, or a bug turns out to be a pattern.', 'تقول الكل أو كل الصفحات، أو يتبيّن أن الخلل نمط متكرر.'),
  },
  performance: {
    why: t('Speed work without measuring is guesswork. This starts from a budget and numbers on a slow phone.', 'تحسين السرعة بلا قياس تخمين. هذه تبدأ من حدود وأرقام على هاتف بطيء.'),
    when: t('A slow page, a jumping layout, a falling Lighthouse score or a heavy new feature.', 'صفحة بطيئة أو تخطيط يقفز أو نتيجة Lighthouse تهبط أو ميزة ثقيلة جديدة.'),
  },
  'vercel-react-best-practices': {
    why: t('React slows down in known ways. This is Vercel’s ordered list of them, to audit against.', 'بطء React له أسباب معروفة. هذه قائمة Vercel المرتبة لها للتدقيق عليها.'),
    when: t('A requested React performance audit, or inside a review. The performance skill comes first.', 'تدقيق أداء React مطلوب، أو ضمن مراجعة. ومهارة performance تأتي أولاً.'),
  },
  'web-design-guidelines': {
    why: t('A working interface can still break many small usability rules. This checks files against Vercel’s guidelines.', 'الواجهة العاملة قد تخالف قواعد استخدام صغيرة كثيرة. هذه تفحص الملفات على إرشادات Vercel.'),
    when: t('You ask for an audit of existing UI against best practice.', 'تطلب تدقيق واجهة موجودة على أفضل الممارسات.'),
  },
  'playwright-best-practices': {
    why: t('A flaky end-to-end test is worse than none, because people stop trusting it. This is the reference for stable ones.', 'الاختبار الشامل المتذبذب أسوأ من عدمه لأن الثقة به تضيع. هذا مرجع الاختبارات المستقرة.'),
    when: t('Writing, fixing or debugging Playwright tests of any kind.', 'كتابة أي اختبارات Playwright أو إصلاحها أو تتبع فشلها.'),
  },
  verify: {
    why: t('“Done” without output is a claim. This runs every check and reports the real numbers.', '«انتهيت» بلا نتائج مجرد ادعاء. هذه تشغّل كل الفحوص وتذكر الأرقام الحقيقية.'),
    when: t('Before a commit, or when you ask whether it works.', 'قبل الحفظ، أو عندما تسأل هل يعمل.'),
  },
  review: {
    why: t('The author cannot see their own blind spots. Fresh agents judge the standards and the request separately.', 'الكاتب لا يرى ما غاب عنه. وكلاء بعين جديدة يحكمون على المعايير وعلى الطلب كلٌّ على حدة.'),
    when: t('Before committing anything that is not trivial, or when you ask for another opinion.', 'قبل حفظ أي شيء غير بسيط، أو عندما تطلب رأياً آخر.'),
  },
  'live-check': {
    why: t('Some bugs only show with a real login in a real browser. This tests there, and never on the live site.', 'بعض الأخطاء لا يظهر إلا بدخول حقيقي في متصفح حقيقي. هذه تختبر هناك، وليس على الموقع الحي أبداً.'),
    when: t('A flow that needs a code, single sign-on or a third party, on local or the test environment.', 'مسار يحتاج رمزاً أو دخولاً موحداً أو طرفاً ثالثاً، محلياً أو في البيئة التجريبية.'),
  },
  'commit-push': {
    why: t('Git mistakes are public. This commits only after your yes, only on the task branch, and stops at a link.', 'أخطاء git علنية. هذه لا تحفظ إلا بموافقتك وعلى فرع المهمة فقط، وتتوقف عند الرابط.'),
    when: t('You say commit, push, or yes to the question at the end of a task.', 'تقول احفظ أو ارفع، أو توافق على السؤال في نهاية المهمة.'),
  },
  'pr-link': {
    why: t('Opening the pull request is your decision. This prepares everything up to the click.', 'فتح طلب الدمج قرارك. هذه تجهّز كل شيء حتى الضغطة.'),
    when: t('You ask for the link or a description to paste.', 'تطلب الرابط أو وصفاً جاهزاً للصق.'),
  },
  'sync-main': {
    why: t('Rebasing blindly creates conflicts you did not expect. This shows what is coming before it touches anything.', 'إعادة التأسيس دون نظر تصنع تعارضات مفاجئة. هذه تريك القادم قبل أن تلمس شيئاً.'),
    when: t('Main has moved, or you ask to update from it.', 'تقدّم الفرع الرئيسي، أو تطلب التحديث منه.'),
  },
  'branch-status': {
    why: t('You should know where work stands without reading git output. This answers and changes nothing.', 'يجب أن تعرف أين وصل العمل دون قراءة مخرجات git. هذه تجيب ولا تغيّر شيئاً.'),
    when: t('Which branch, is it pushed, what is left to commit.', 'أي فرع، وهل رُفع، وماذا بقي للحفظ.'),
  },
  'backend-request': {
    why: t('What the frontend needs from the backend gets lost in chat. This keeps one readable list in the repo.', 'ما تحتاجه الواجهة من فريق الخادم يضيع في المحادثات. هذه تحفظه قائمة واحدة مقروءة في المستودع.'),
    when: t('A missing endpoint or field, a wrong response, or a message for the backend team.', 'نقطة أو حقل ناقص أو استجابة خاطئة أو رسالة لفريق الخادم.'),
  },
  setup: {
    why: t('A generic plugin would give generic advice. Setup detects your stack and installs standards written for it.', 'إضافة عامة تعطي نصائح عامة. الإعداد يكتشف تقنياتك ويثبّت معايير مكتوبة لها.'),
    when: t('Once in each project, and again to pick up new rules. Only you can start it.', 'مرة في كل مشروع، ومجدداً لجلب القواعد الجديدة. أنت وحدك من يشغّله.'),
  },
}

export const agentPurpose: Record<string, Purpose> = {
  planner: {
    why: t('Agents working at once collide unless someone fixes the contracts and file owners first. The planner does only that.', 'الوكلاء العاملون معاً يتصادمون ما لم يحدد أحد الاتفاقات ومالكي الملفات أولاً. المخطط يفعل هذا فقط.'),
    when: t('A task big enough for a team run or a long autonomous one.', 'مهمة تكفي لفريق وكلاء أو لتشغيل ذاتي طويل.'),
  },
  'frontend-dev': {
    why: t('A focused builder with a clean memory follows the rules more exactly than a long session does.', 'بانٍ مركّز بذاكرة نظيفة يتبع القواعد أدق من جلسة طويلة.'),
    when: t('One well-scoped change or package. It does not write the tests.', 'تغيير أو حزمة واحدة محددة، وهو لا يكتب الاختبارات.'),
  },
  'ui-designer': {
    why: t('Code review does not notice weak hierarchy or uneven spacing. This role looks only at the design.', 'مراجعة الشيفرة لا تلاحظ ضعف التسلسل أو اختلال المسافات. هذا الدور ينظر إلى التصميم وحده.'),
    when: t('The screen works but looks off, or before shipping a visible change.', 'الشاشة تعمل لكن شكلها مختل، أو قبل تسليم تغيير ظاهر.'),
  },
  'test-engineer': {
    why: t('Tests written by the author confirm what they meant, not what the code does. A separate writer finds more.', 'اختبارات الكاتب تؤكد ما قصده لا ما تفعله الشيفرة. كاتب منفصل يجد أكثر.'),
    when: t('After a change is built, or to fill missing coverage.', 'بعد بناء التغيير، أو لسد نقص التغطية.'),
  },
  'bug-hunter': {
    why: t('The first fix for a bug is often a patch over the symptom. This role must name the root cause before proposing one.', 'أول إصلاح غالباً ترقيع للعَرَض. هذا الدور ملزم بتسمية الجذر قبل اقتراح الإصلاح.'),
    when: t('Something is broken and the cause is unknown.', 'شيء معطل وسببه مجهول.'),
  },
  'frontend-reviewer': {
    why: t('A reader who never saw the conversation judges only the code, the way a colleague would.', 'قارئ لم يرَ المحادثة يحكم على الشيفرة وحدها كما يفعل الزميل.'),
    when: t('After the quality gate passes, or any branch or diff before commit.', 'بعد نجاح بوابة الجودة، أو أي فرع أو فرق قبل الحفظ.'),
  },
  'accessibility-auditor': {
    why: t('People who use a keyboard or screen reader are shut out by bugs nobody else sees. This role checks for them.', 'مستخدمو لوحة المفاتيح وقارئ الشاشة تمنعهم أخطاء لا يراها غيرهم. هذا الدور يفحص لأجلهم.'),
    when: t('Building or reviewing any page or component people use.', 'بناء أو مراجعة أي صفحة أو مكوّن يستعمله الناس.'),
  },
  'performance-optimizer': {
    why: t('Speed problems hide until real phones meet real networks. This role measures before it advises.', 'مشاكل السرعة تختبئ حتى تلتقي هواتف حقيقية بشبكات حقيقية. هذا الدور يقيس قبل أن ينصح.'),
    when: t('A slow page, a falling score, or before shipping something heavy.', 'صفحة بطيئة أو نتيجة هابطة، أو قبل تسليم شيء ثقيل.'),
  },
  'refactor-architect': {
    why: t('A refactor across many files needs a map and an order, or the build stays red for days.', 'إعادة هيكلة عبر ملفات كثيرة تحتاج خريطة وترتيباً، وإلا بقي البناء معطلاً أياماً.'),
    when: t('A restructure bigger than one component, or a layer migration.', 'إعادة بناء أكبر من مكوّن واحد، أو ترحيل طبقة.'),
  },
  'qa-engineer': {
    why: t('Green tests still ship broken screens. This role opens every changed page in both languages, sizes and themes.', 'قد تنجح الاختبارات والشاشات معطلة. هذا الدور يفتح كل صفحة تغيرت باللغتين والحجمين والسمتين.'),
    when: t('The last gate before you are asked to commit.', 'آخر بوابة قبل أن يُطلب منك الحفظ.'),
  },
}

export const rulePurpose: Record<string, Bilingual> = {
  'shared/git.md': t('So branches, commits and pull requests stay under your control.', 'لتبقى الفروع والحفظ وطلبات الدمج تحت سيطرتك.'),
  'shared/i18n.md': t('So no language is left behind and every key can be found.', 'حتى لا تتخلف لغة ويمكن العثور على كل مفتاح.'),
  'shared/naming.md': t('So the next person guesses a file’s name correctly the first time.', 'ليخمّن الشخص التالي اسم الملف صحيحاً من أول مرة.'),
  'shared/project.md': t('So facts only your team knows are not rediscovered or guessed in every session.', 'حتى لا تُكتشف حقائق فريقك أو تُخمَّن من جديد كل جلسة.'),
  'shared/quality-bar.md': t('So “done” means the same thing every time, with proof.', 'ليعني «انتهى» الشيء نفسه كل مرة، مع الإثبات.'),
  'shared/react.md': t('So components stay thin, hooks stay correct and any session writes the same React.', 'لتبقى المكوّنات خفيفة والـ hooks صحيحة وتُكتب React بالطريقة نفسها في كل جلسة.'),
  'shared/rtl.md': t('So Arabic and English are both right by construction, not patched afterwards.', 'لتصح العربية والإنجليزية من البناء لا بالترقيع لاحقاً.'),
  'shared/scope.md': t('So Claude neither stops halfway nor changes what you never asked for.', 'حتى لا يتوقف Claude في المنتصف ولا يغيّر ما لم تطلبه.'),
  'shared/styles.md': t('So colour, type and spacing come from your system and layouts do not jump.', 'ليأتي اللون والخط والمسافة من نظامك ولا يقفز التخطيط.'),
  'shared/testing.md': t('So tests catch real breakage without becoming slow or flaky.', 'لتلتقط الاختبارات الكسر الحقيقي دون أن تبطؤ أو تتذبذب.'),

  'website/api-layer.md': t('So server and browser call the API safely, and an error is shown once.', 'ليستدعي الخادم والمتصفح الـ API بأمان ويظهر الخطأ مرة واحدة.'),
  'website/data-loading.md': t('So data is in the first HTML and never fetched twice.', 'لتكون البيانات في أول HTML ولا تُجلب مرتين.'),
  'website/performance.md': t('So speed on a cheap phone is a limit, not a hope.', 'لتكون السرعة على الهاتف الرخيص حداً لا أمنية.'),
  'website/routing-ssr.md': t('So every address renders, redirects and fails correctly on the server.', 'ليُعرض كل عنوان ويحوَّل ويفشل بشكل صحيح من الخادم.'),
  'website/seo-share.md': t('So each page can be found and looks right when shared.', 'لتُكتشف كل صفحة وتظهر صحيحة عند مشاركتها.'),

  'dashboard/api-layer.md': t('So one client owns tokens, errors and keys instead of every screen.', 'ليملك عميل واحد الرموز والأخطاء والمفاتيح بدل كل شاشة.'),
  'dashboard/data-tables.md': t('So tables still work with a hundred thousand rows and a keyboard.', 'لتعمل الجداول مع مئة ألف صف ومع لوحة المفاتيح.'),
  'dashboard/error-monitoring.md': t('So production errors reach you without leaking personal data.', 'لتصلك أخطاء الإنتاج دون تسريب بيانات شخصية.'),
  'dashboard/forms-crud.md': t('So two admins editing at once, or a double click, cannot lose data.', 'حتى لا تضيع بيانات بسبب مديرين يعدّلان معاً أو ضغطة مزدوجة.'),
  'dashboard/permissions.md': t('So one list decides what each role sees and can do.', 'لتحدد قائمة واحدة ما يراه كل دور وما يستطيعه.'),
  'dashboard/routing.md': t('So guards hold and a list’s state survives a reload or a shared link.', 'لتصمد الحراسة وتبقى حالة القائمة بعد التحديث والمشاركة.'),

  'dashboard/variants/next/error-monitoring.md': t('So monitoring is right for both halves of a Next.js app.', 'لتصح المراقبة في نصفي تطبيق Next.js.'),
  'dashboard/variants/next/routing.md': t('So guards and data loading follow Next.js, which has no beforeLoad.', 'لتتبع الحراسة والتحميل طريقة Next.js التي لا beforeLoad فيها.'),
  'dashboard/variants/next/structure.md': t('So every shared rule knows where things live in a Next.js app.', 'لتعرف كل قاعدة مشتركة أماكن الأشياء في تطبيق Next.js.'),
  'dashboard/variants/tanstack-start/framework.md': t('So the admin runs as a client app on Start without hydration errors.', 'لتعمل الإدارة كتطبيق متصفح على Start دون أخطاء تطابق.'),
  'dashboard/variants/tanstack-start/structure.md': t('So every shared rule knows where things live on TanStack Start.', 'لتعرف كل قاعدة مشتركة أماكن الأشياء على TanStack Start.'),

  'react/auth.md': t('So tokens, guards and sign-out are handled one way in any stack.', 'لتُدار الرموز والحراسة والخروج بطريقة واحدة في أي تقنية.'),
  'react/data-and-state.md': t('So server data and interface state are never mixed up.', 'حتى لا تختلط بيانات الخادم بحالة الواجهة.'),
  'react/forms.md': t('So forms are labelled and validated whatever library you use.', 'لتكون النماذج مسمّاة ومتحققاً منها أياً كانت مكتبتك.'),
  'react/routing.md': t('So pages follow the router you really have, not the one Claude assumes.', 'لتتبع الصفحات الموجّه الموجود فعلاً لا الذي يفترضه Claude.'),
  'react/structure.md': t('So new code lands in a known shape, and a refactor has a target.', 'لتقع الشيفرة الجديدة في شكل معروف ويكون لإعادة الهيكلة هدف.'),
}

export const hookPurpose: Record<HookEvent, Bilingual> = {
  SessionStart: t('Claude starts each session knowing nothing, and forgets after clear or compact. This hands the essentials back.', 'يبدأ Claude كل جلسة لا يعرف شيئاً، وينسى بعد التفريغ أو الضغط. هذا يعيد إليه الأساسيات.'),
  UserPromptSubmit: t('Short requests are ambiguous, and Claude does not always notice the skill that fits. This names it before work starts.', 'الطلبات القصيرة ملتبسة، وClaude لا ينتبه دائماً للمهارة المناسبة. هذا يسمّيها قبل بدء العمل.'),
  PreToolUse: t('An instruction can be forgotten. A refusal before the tool runs cannot, so the known dangerous actions are stopped here.', 'التعليمة قد تُنسى، أما الرفض قبل تشغيل الأداة فلا. لذلك تُوقَف الأفعال الخطرة المعروفة هنا.'),
  PostToolUse: t('An error is cheapest to fix in the second it is written. This returns it to Claude at once.', 'أرخص وقت لإصلاح الخطأ ثانية كتابته. هذا يعيده إلى Claude فوراً.'),
  PostToolUseFailure: t('One failure is noise and five are a pattern. This keeps the record that shows the difference.', 'فشل واحد ضجيج وخمسة نمط. هذا يحفظ السجل الذي يُظهر الفرق.'),
  SubagentStop: t('Broken code from an agent would spread into the main session. The agent has to face the typecheck first.', 'الشيفرة المعطلة من وكيل تنتشر في الجلسة الرئيسية. على الوكيل أن يواجه فحص الأنواع أولاً.'),
  Notification: t('A long run waiting for your answer looks like one still working. An alert tells you which.', 'التشغيل الطويل المنتظر جوابك يشبه الذي ما زال يعمل. التنبيه يخبرك أيهما.'),
  Stop: t('Claude says done before it is. This makes it prove that with your own checks, then be read by another agent.', 'يقول Claude انتهيت قبل أن ينتهي. هذا يلزمه بالإثبات بفحوصك، ثم يقرؤه وكيل آخر.'),
  SessionEnd: t('Working files of old sessions would pile up in your project. This clears them.', 'ملفات عمل الجلسات القديمة تتراكم في مشروعك. هذا ينظفها.'),
}
