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
    why: t('Without a procedure the assistant writes a new button each time, in a new place and style. This makes it look for the existing one first, then build to your conventions.', 'بدون خطوات واضحة يكتب المساعد زرا جديدا في كل مرة، في مكان وبشكل مختلف. هذه المهارة تجعله يبحث أولا عن الزر الموجود، ثم يبني حسب أسلوب مشروعك.'),
    when: t('Any new or extracted piece of interface, even a small one. With a Figma link, figma-match runs beside it.', 'أي جزء جديد أو مستخرج من الواجهة، حتى الصغير. وإذا أعطيت المساعد رابط Figma، تعمل figma-match معها.'),
  },
  'create-form': {
    why: t('Forms are where validation, accessibility and double submits go wrong. One recipe settles the schema, labels, translated errors and a single submit.', 'في النماذج تكثر أخطاء التحقق وسهولة الوصول والإرسال المكرر. وصفة واحدة تحدد المخطط والتسميات والأخطاء المترجمة والإرسال مرة واحدة.'),
    when: t('Any screen that takes input: login, phone, code, address, profile, filters or an edit dialog.', 'أي شاشة فيها إدخال: تسجيل الدخول أو الهاتف أو الرمز أو العنوان أو الملف الشخصي أو الفلاتر أو نافذة التعديل.'),
  },
  'create-hook': {
    why: t('Logic piles up inside components until nobody can test it. This moves it into a hook with the right place, keys, guards and tests.', 'المنطق يتراكم داخل المكونات حتى يصعب اختباره. هذه المهارة تنقله إلى hook في المكان الصحيح، مع المفاتيح وشروط الحماية والاختبارات.'),
    when: t('A data query, a mutation, the logic of a page, a small utility, or a container that is getting heavy.', 'استعلام بيانات، أو عملية تعديل، أو منطق صفحة، أو أداة صغيرة، أو حاوية صارت ثقيلة.'),
  },
  'create-store': {
    why: t('Global state is easy to add and hard to remove. This first asks whether a store is needed at all, then handles saving and sign-out cleanup.', 'الحالة العامة سهلة الإضافة وصعبة الحذف. هذه المهارة تسأل أولا: هل تحتاج إلى مخزن أصلا؟ ثم تتولى حفظ الحالة وتنظيفها عند تسجيل الخروج.'),
    when: t('State that outlives a component: a preference, the session, a cart, a draft, or data handed between routes.', 'حالة تعيش أطول من المكون: تفضيل، أو الجلسة، أو سلة، أو مسودة، أو بيانات تنتقل بين المسارات.'),
  },
  'figma-match': {
    why: t('“Close enough” is not what a designer handed over. This reads the frame, maps it to your tokens and compares the result.', '«قريب بما يكفي» ليس ما سلمه المصمم. هذه المهارة تقرأ الإطار وتربطه بـ tokens مشروعك ثم تقارن النتيجة.'),
    when: t('You give a Figma link, or say the screen must look like the design.', 'تعطي المساعد رابط Figma، أو تقول إن الشاشة يجب أن تشبه التصميم.'),
  },
  'frontend-design': {
    why: t('Left alone, the assistant produces the same generic page. This makes it commit to a deliberate visual direction before any code.', 'إذا تركته وحده ينتج المساعد الصفحة العامة نفسها كل مرة. هذه المهارة تجعله يختار اتجاها بصريا مدروسا قبل كتابة أي كود.'),
    when: t('A brand-new page or section with no Figma frame, when you ask for a new look. Not for routine product screens.', 'صفحة أو قسم جديد تماما بلا إطار Figma، عندما تريد شكلا جديدا. ليست لشاشات المنتج العادية.'),
  },
  'ui-ux-pro-max': {
    why: t('Design advice from memory repeats itself. This searches a catalogue of styles, palettes, type pairings and UX guidelines.', 'النصائح التصميمية من الذاكرة تتكرر. هذه المهارة تبحث في فهرس فيه الأساليب والألوان وأزواج الخطوط وإرشادات تجربة الاستخدام.'),
    when: t('You ask for ideas, alternatives or a better experience. Not when a design already exists.', 'تطلب أفكارا أو بدائل أو تجربة أفضل. لا تناسب حالة وجود تصميم جاهز.'),
  },
  'i18n-conventions': {
    why: t('Translations rot quietly: missing languages, deep keys, keys built at run time. One convention keeps every key findable and checkable.', 'الترجمات تفسد بصمت: لغة ناقصة، ومفاتيح عميقة، ومفاتيح تبنى وقت التشغيل. أسلوب واحد يجعل كل مفتاح سهل الإيجاد والفحص.'),
    when: t('Any change to visible text, a locale file or a translation call.', 'أي تغيير في نص ظاهر أو ملف ترجمة أو استدعاء ترجمة.'),
  },
  'tanstack-query-key-conventions': {
    why: t('An inline query key is a cache bug waiting to happen. One factory makes invalidating a whole family reliable.', 'كتابة مفتاح الاستعلام داخل الاستدعاء خطأ ينتظر أن يقع في الكاش. مصنع واحد يجعل إبطال مجموعة المفاتيح كلها يعمل دائما.'),
    when: t('Writing or reviewing any query, mutation, prefetch or invalidation in TanStack Query.', 'عند كتابة أو مراجعة أي استعلام أو تعديل أو جلب مسبق أو إبطال في TanStack Query.'),
  },
  'typescript-advanced-types': {
    why: t('Hard typing problems tempt any and casts. This reference shows the precise type in their place.', 'مشاكل الأنواع الصعبة تغري باستخدام any والتحويل القسري. هذا المرجع يعرض النوع الدقيق بدلا منهما.'),
    when: t('Generics, conditional or mapped types, or a reusable type utility.', 'الأنواع العامة والشرطية والمشتقة، أو أداة أنواع تعيد استخدامها.'),
  },
  'dash-create-route': {
    why: t('An admin page is a route, a guard, a search schema, a loader and a menu entry. Forgetting one means a leak or a broken link.', 'صفحة الإدارة هي مسار وحماية ومخطط بحث ومحمل بيانات وعنصر في القائمة. إذا نسيت واحدا منها حدث تسريب أو انكسر رابط.'),
    when: t('A new page, address, guarded section or sidebar entry in a dashboard.', 'صفحة جديدة أو عنوان جديد أو قسم محمي أو عنصر في القائمة الجانبية في لوحة التحكم.'),
  },
  'dash-create-table': {
    why: t('A table looks done long before it is. This settles server paging, sorting in the URL, actions and all four states.', 'يبدو الجدول جاهزا قبل أن يكتمل بوقت طويل. هذه المهارة تحدد تقسيم الصفحات من الخادم، والترتيب في الرابط، والإجراءات، والحالات الأربع.'),
    when: t('A list page, grid, columns, sorting, paging, row actions or bulk selection.', 'صفحة قائمة، أو شبكة، أو أعمدة، أو ترتيب، أو تقسيم صفحات، أو إجراءات على الصفوف، أو تحديد عدة صفوف.'),
  },
  'dash-create-filter-bar': {
    why: t('Filters kept in component state vanish on reload and cannot be shared. This keeps each one typed in the URL.', 'الفلاتر المحفوظة في حالة المكون تضيع عند تحديث الصفحة ولا يمكن مشاركتها. هذه المهارة تضع كل فلتر في الرابط، بنوع محدد.'),
    when: t('Search, selects, a date range or a toolbar above a list.', 'بحث، أو قوائم اختيار، أو نطاق تواريخ، أو شريط أدوات فوق قائمة.'),
  },
  'dash-create-detail': {
    why: t('A record page mixes reading, tabs, state changes and conflicts. This gives each a fixed place.', 'صفحة السجل تجمع القراءة والتبويبات وتغيير الحالة والتعارضات. هذه المهارة تعطي كلا منها مكانا ثابتا.'),
    when: t('A details page for an order, user or any record with history, notes or a status.', 'صفحة تفاصيل لطلب أو مستخدم أو أي سجل فيه تاريخ أو ملاحظات أو حالة.'),
  },
  'dash-create-crud': {
    why: t('Create, edit and delete repeat in every module and drift. One recipe covers the form, cache, server errors, confirm and permissions.', 'الإضافة والتعديل والحذف تتكرر في كل قسم، ويختلف تنفيذها مع الوقت. وصفة واحدة تغطي النموذج والكاش وأخطاء الخادم والتأكيد والصلاحيات.'),
    when: t('Adding, editing, deleting, archiving or toggling an entity in a dashboard.', 'إضافة عنصر في لوحة التحكم أو تعديله أو حذفه أو أرشفته أو تبديل حالته.'),
  },
  'dash-create-settings-form': {
    why: t('Settings are one record many people edit. This adds conflict handling, an unsaved warning and read-only sections.', 'الإعدادات سجل واحد يعدله أكثر من شخص. هذه المهارة تضيف معالجة التعارض، وتنبيها عند وجود تغييرات غير محفوظة، وأقساما للقراءة فقط.'),
    when: t('A settings, preferences or profile page that edits one record.', 'صفحة إعدادات أو تفضيلات أو ملف شخصي تعدل سجلا واحدا.'),
  },
  'web-create-route': {
    why: t('A public page must be right in the first response: data, title, a real 404 and redirects. Client-only habits break that.', 'الصفحة العامة يجب أن تكون صحيحة من أول استجابة: البيانات والعنوان وصفحة 404 حقيقية والتحويلات. والعمل في المتصفح فقط يفسد ذلك.'),
    when: t('A new page or address, a slug page, a 404, a redirect or data that should render on the server.', 'صفحة أو عنوان جديد، أو صفحة تعتمد على slug، أو صفحة 404، أو تحويل، أو بيانات يجب أن تعرض من الخادم.'),
  },
  'web-create-feature': {
    why: t('From an endpoint to a page is a dozen files. This writes all of them in the same shape every time, translations and tests included.', 'الطريق من endpoint إلى صفحة يمر بنحو 12 ملفا. هذه المهارة تكتبها كلها بالشكل نفسه كل مرة، مع الترجمات والاختبارات.'),
    when: t('You hand over an endpoint or API document and ask for the whole feature.', 'تعطي المساعد endpoint أو وثيقة API وتطلب الميزة كاملة.'),
  },
  'web-seo-page': {
    why: t('A page nobody can find, or that shares with the wrong picture, fails quietly. This covers every tag a search engine or chat app reads.', 'الصفحة التي لا يجدها أحد، أو تظهر بصورة خاطئة عند مشاركتها، تفشل بصمت. هذه المهارة تغطي كل وسم يقرؤه محرك البحث أو تطبيق المحادثة.'),
    when: t('Any new public page, or a problem with titles, previews, structured data, sitemap or canonical links.', 'أي صفحة عامة جديدة، أو مشكلة في العناوين أو المعاينات أو البيانات المنظمة أو خريطة الموقع أو روابط canonical.'),
  },
  'web-server-fn': {
    why: t('Secrets and cookies must never reach the browser. This puts them behind a validated, authorised server function.', 'يجب ألا تصل الأسرار والكوكيز إلى المتصفح أبدا. هذه المهارة تضعها خلف دالة خادم تتحقق من المدخلات والصلاحية.'),
    when: t('Hiding a key, reading a session cookie, proxying the backend, a webhook or a server-only library.', 'إخفاء مفتاح، أو قراءة كوكي الجلسة، أو تمرير الطلبات إلى الـ backend، أو webhook، أو مكتبة تعمل على الخادم فقط.'),
  },
  task: {
    why: t('Work that starts on the wrong branch or ends unverified costs a review round. This runs a ticket from branch to question.', 'العمل الذي يبدأ على فرع خاطئ أو ينتهي بلا تحقق يكلفك جولة مراجعة إضافية. هذه المهارة تنفذ التذكرة من الفرع حتى السؤال الأخير.'),
    when: t('A new task or a ticket link. A single component or form has its own skill.', 'مهمة جديدة أو رابط تذكرة. أما المكون الواحد أو النموذج الواحد فلكل منهما مهارته.'),
  },
  explain: {
    why: t('A question should get an answer, not an edit. This finds the real cause in the code and changes nothing.', 'السؤال يحتاج جوابا لا تعديلا. هذه المهارة تجد السبب الحقيقي في الكود ولا تغير شيئا.'),
    when: t('You ask why, how or which endpoint, or need a note for someone else.', 'تسأل لماذا أو كيف أو أي endpoint، أو تحتاج ملاحظة لشخص آخر.'),
  },
  dev: {
    why: t('A busy port or a stale cache wastes minutes and leads to wrong conclusions. This checks first and waits until the app answers.', 'منفذ مشغول أو كاش قديم يضيع دقائق ويعطي استنتاجات خاطئة. هذه المهارة تفحص أولا ثم تنتظر حتى يرد التطبيق.'),
    when: t('Starting, stopping or restarting the app, or when it serves old code.', 'تشغيل التطبيق أو إيقافه أو إعادة تشغيله، أو عندما يعرض كودا قديما.'),
  },
  refactor: {
    why: t('Cleaning up is where behaviour breaks by accident. This moves code in safe steps and proves nothing changed.', 'عند التنظيف ينكسر السلوك بالخطأ. هذه المهارة تنقل الكود بخطوات آمنة وتثبت أن شيئا لم يتغير.'),
    when: t('A long file, duplicated code, logic in the wrong layer or leftovers of a migration.', 'ملف طويل، أو كود مكرر، أو منطق في الطبقة الخطأ، أو بقايا ترحيل.'),
  },
  'refactor-mode': {
    why: t('A whole old project cannot be fixed in one change. This measures it and rebuilds it phase by phase with your approval.', 'لا يمكن إصلاح مشروع قديم كامل بتغيير واحد. هذه المهارة تقيس المشروع ثم تعيد بناءه مرحلة بعد مرحلة بموافقتك.'),
    when: t('An existing project far from the standards. Only you can start it, by name.', 'مشروع قائم بعيد عن المعايير. وأنت وحدك تشغلها، باسمها.'),
  },
  'fix-everywhere': {
    why: t('The assistant fixes the one case you showed and leaves the rest. This finds them all and proves with a search that none are left.', 'يصلح المساعد الحالة الوحيدة التي أريتها له ويترك الباقي. هذه المهارة تجد كل الحالات، وتثبت بالبحث أنه لم تبق أي حالة.'),
    when: t('You say all, every or other pages, or a bug turns out to be a pattern.', 'تقول «الكل» أو «كل الصفحات» أو «باقي الصفحات»، أو يتضح أن الخلل نمط متكرر.'),
  },
  performance: {
    why: t('Speed work without measuring is guesswork. This starts from a budget and numbers on a slow phone.', 'تحسين السرعة بلا قياس مجرد تخمين. هذه المهارة تبدأ من ميزانية أداء وأرقام على هاتف بطيء.'),
    when: t('A slow page, a jumping layout, a falling Lighthouse score or a heavy new feature.', 'صفحة بطيئة، أو تخطيط يقفز، أو نتيجة Lighthouse تنخفض، أو ميزة جديدة ثقيلة.'),
  },
  'vercel-react-best-practices': {
    why: t('React slows down in known ways. This is Vercel’s ordered list of them, to audit against.', 'لبطء React أسباب معروفة. هذه المهارة هي قائمة Vercel المرتبة لها، لتدقق مشروعك بها.'),
    when: t('A requested React performance audit, or inside a review. The performance skill comes first.', 'عندما تطلب تدقيق أداء React، أو ضمن مراجعة. ومهارة performance تأتي أولا.'),
  },
  'web-design-guidelines': {
    why: t('A working interface can still break many small usability rules. This checks files against Vercel’s guidelines.', 'قد تعمل الواجهة جيدا وهي تخالف مع ذلك قواعد استخدام صغيرة كثيرة. هذه المهارة تفحص الملفات حسب إرشادات Vercel.'),
    when: t('You ask for an audit of existing UI against best practice.', 'تطلب تدقيق واجهة موجودة حسب أفضل الممارسات.'),
  },
  'playwright-best-practices': {
    why: t('A flaky end-to-end test is worse than none, because people stop trusting it. This is the reference for stable ones.', 'اختبار شامل غير مستقر أسوأ من عدم وجوده، لأن الناس يتوقفون عن الثقة به. وهذا مرجع لكتابة اختبارات مستقرة.'),
    when: t('Writing, fixing or debugging Playwright tests of any kind.', 'كتابة أي اختبارات Playwright أو إصلاحها أو معرفة سبب فشلها.'),
  },
  verify: {
    why: t('“Done” without output is a claim. This runs every check and reports the real numbers.', '«انتهيت» بلا نتائج مجرد ادعاء. هذه المهارة تشغل كل الفحوص وتذكر الأرقام الحقيقية.'),
    when: t('Before a commit, or when you ask whether it works.', 'قبل الحفظ، أو عندما تسأل هل يعمل.'),
  },
  review: {
    why: t('The author cannot see their own blind spots. Fresh agents judge the standards and the request separately.', 'الكاتب لا يرى نقاطه العمياء. فيحكم وكلاء جدد على المعايير وعلى الطلب، كل على حدة.'),
    when: t('Before committing anything that is not trivial, or when you ask for another opinion.', 'قبل حفظ أي تغيير ليس بسيطا، أو عندما تريد رأيا آخر.'),
  },
  'live-check': {
    why: t('Some bugs only show with a real login in a real browser. This tests there, and never on the live site.', 'بعض الأخطاء لا تظهر إلا بتسجيل دخول حقيقي في متصفح حقيقي. هذه المهارة تختبر هناك، وليس على الموقع المباشر أبدا.'),
    when: t('A flow that needs a code, single sign-on or a third party, on local or the test environment.', 'مسار يحتاج إلى رمز، أو دخول موحد، أو طرف ثالث، محليا أو في بيئة الاختبار.'),
  },
  'commit-push': {
    why: t('Git mistakes are public. This commits only after your yes, only on the task branch, and stops at a link.', 'أخطاء git يراها الجميع. هذه المهارة تحفظ بعد موافقتك فقط، وعلى فرع المهمة فقط، وتتوقف عند الرابط.'),
    when: t('You say commit, push, or yes to the question at the end of a task.', 'تقول «احفظ» أو «ارفع»، أو توافق على السؤال في نهاية المهمة.'),
  },
  'pr-link': {
    why: t('Opening the pull request is your decision. This prepares everything up to the click.', 'فتح الـ pull request قرارك أنت. هذه المهارة تجهز كل شيء حتى لحظة الضغط.'),
    when: t('You ask for the link or a description to paste.', 'تطلب الرابط، أو وصفا جاهزا تلصقه.'),
  },
  'sync-main': {
    why: t('Rebasing blindly creates conflicts you did not expect. This shows what is coming before it touches anything.', 'عمل rebase دون معرفة ما ينتظرك يسبب تعارضات لم تتوقعها. هذه المهارة تريك ما سيحدث قبل أن تغير أي شيء.'),
    when: t('Main has moved, or you ask to update from it.', 'الفرع الرئيسي تغير، أو تطلب التحديث منه.'),
  },
  'branch-status': {
    why: t('You should know where work stands without reading git output. This answers and changes nothing.', 'يجب أن تعرف أين وصل العمل دون قراءة مخرجات git. هذه المهارة تجيبك ولا تغير شيئا.'),
    when: t('Which branch, is it pushed, what is left to commit.', 'أي فرع، وهل تم رفعه، وما الذي بقي دون حفظ.'),
  },
  'backend-request': {
    why: t('What the frontend needs from the backend gets lost in chat. This keeps one readable list in the repo.', 'ما تحتاجه الواجهة من الـ backend يضيع في المحادثات. هذه المهارة تحفظ قائمة واحدة واضحة داخل المستودع.'),
    when: t('A missing endpoint or field, a wrong response, or a message for the backend team.', 'endpoint أو حقل ناقص، أو استجابة خاطئة، أو رسالة لفريق الـ backend.'),
  },
  setup: {
    why: t('A generic plugin would give generic advice. Setup detects your stack and installs standards written for it.', 'الإضافة العامة تعطي نصائح عامة. أما الإعداد فيكتشف تقنياتك ويثبت معايير مكتوبة لها.'),
    when: t('Once in each project, and again to pick up new rules. Only you can start it.', 'مرة واحدة في كل مشروع، ومرة أخرى لجلب القواعد الجديدة. وأنت وحدك تشغله.'),
  },
  mode: {
    why: t('A release freeze or a hotfix needs other limits than everyday work. One switch changes them, and a guard holds the part a hook can see.', 'تجميد الإصدار أو الإصلاح العاجل يحتاج حدودا غير حدود العمل اليومي. مفتاح واحد يغيرها، وحارس يثبت الجزء الذي يستطيع رؤيته.'),
    when: t('Before a release, during an incident, for a read-only audit, a prototype, or an app that is only maintained. Only you switch it.', 'قبل الإصدار، أو أثناء عطل، أو لتدقيق بالقراءة فقط، أو لنموذج أولي، أو لتطبيق تكتفي بصيانته. وأنت وحدك تبدله.'),
  },
  'upgrade-mode': {
    why: t('A major upgrade fails quietly: the new API compiles while the behaviour changes. This proves each phase against a recorded baseline.', 'الترقية الكبيرة تفشل بصمت: الكود يبنى مع الـ API الجديد، لكن السلوك يتغير. هذه المهارة تثبت كل مرحلة بمقارنتها بخط أساس مسجل.'),
    when: t('A major version of a framework or library. A patch or a single small bump is a normal task.', 'إصدار رئيسي من إطار عمل أو مكتبة. أما الـ patch أو ترقية صغيرة واحدة فهي مهمة عادية.'),
  },
}

export const agentPurpose: Record<string, Purpose> = {
  planner: {
    why: t('Agents working at once collide unless someone fixes the contracts and file owners first. The planner does only that.', 'الوكلاء الذين يعملون معا يتصادمون ما لم يحدد أحد العقود وصاحب كل ملف من البداية. والمخطط يفعل هذا فقط.'),
    when: t('A task big enough for a team run or a long autonomous one.', 'مهمة كبيرة تكفي لفريق وكلاء، أو لتشغيل ذاتي طويل.'),
  },
  'frontend-dev': {
    why: t('A focused builder with a clean memory follows the rules more exactly than a long session does.', 'باني مركز بذاكرة نظيفة يلتزم بالقواعد أكثر من جلسة طويلة.'),
    when: t('One well-scoped change or package. It does not write the tests.', 'تغيير واحد محدد النطاق أو حزمة واحدة. ولا يكتب الاختبارات.'),
  },
  'ui-designer': {
    why: t('Code review does not notice weak hierarchy or uneven spacing. This role looks only at the design.', 'مراجعة الكود لا تلاحظ ضعف التسلسل البصري أو اختلاف المسافات. أما هذا الدور فينظر إلى التصميم فقط.'),
    when: t('The screen works but looks off, or before shipping a visible change.', 'الشاشة تعمل لكن شكلها غير مضبوط، أو قبل تسليم تغيير ظاهر.'),
  },
  'test-engineer': {
    why: t('Tests written by the author confirm what they meant, not what the code does. A separate writer finds more.', 'الاختبارات التي يكتبها المؤلف تؤكد ما قصده، لا ما يفعله الكود. وكاتب آخر يكتشف أكثر.'),
    when: t('After a change is built, or to fill missing coverage.', 'بعد بناء التغيير، أو لسد النقص في التغطية.'),
  },
  'bug-hunter': {
    why: t('The first fix for a bug is often a patch over the symptom. This role must name the root cause before proposing one.', 'أول إصلاح للخطأ غالبا ترقيع للمشكلة الظاهرة. وعلى هذا الدور أن يسمي السبب الجذري قبل أن يقترح إصلاحا.'),
    when: t('Something is broken and the cause is unknown.', 'شيء معطل وسببه مجهول.'),
  },
  'frontend-reviewer': {
    why: t('A reader who never saw the conversation judges only the code, the way a colleague would.', 'قارئ لم ير المحادثة يحكم على الكود وحده، مثل زميل.'),
    when: t('After the quality gate passes, or any branch or diff before commit.', 'بعد نجاح بوابة الجودة، أو لأي فرع أو diff قبل الحفظ.'),
  },
  'accessibility-auditor': {
    why: t('People who use a keyboard or screen reader are shut out by bugs nobody else sees. This role checks for them.', 'أخطاء لا يراها غيرهم تمنع من يستخدمون لوحة المفاتيح أو قارئ الشاشة من استعمال الصفحة. هذا الدور يبحث عنها.'),
    when: t('Building or reviewing any page or component people use.', 'عند بناء أو مراجعة أي صفحة أو مكون يستخدمه الناس.'),
  },
  'performance-optimizer': {
    why: t('Speed problems hide until real phones meet real networks. This role measures before it advises.', 'مشاكل السرعة تبقى مخفية حتى تلتقي هواتف حقيقية بشبكات حقيقية. هذا الدور يقيس قبل أن ينصح.'),
    when: t('A slow page, a falling score, or before shipping something heavy.', 'صفحة بطيئة، أو نتيجة تنخفض، أو قبل تسليم شيء ثقيل.'),
  },
  'refactor-architect': {
    why: t('A refactor across many files needs a map and an order, or the build stays red for days.', 'إعادة الهيكلة التي تمس ملفات كثيرة تحتاج إلى خريطة وترتيب، وإلا بقي البناء فاشلا أياما.'),
    when: t('A restructure bigger than one component, or a layer migration.', 'إعادة هيكلة أكبر من مكون واحد، أو ترحيل طبقة.'),
  },
  'qa-engineer': {
    why: t('Green tests still ship broken screens. This role opens every changed page in both languages, sizes and themes.', 'قد تنجح الاختبارات وتصل مع ذلك شاشات معطلة. هذا الدور يفتح كل صفحة تغيرت في كل لغة وكل حجم وكل مظهر.'),
    when: t('The last gate before you are asked to commit.', 'آخر بوابة قبل أن يطلب منك الحفظ.'),
  },
  'frontend-security-reviewer': {
    why: t('A leak or an open redirect looks like normal code in a review. This role reports only what it can show an attack path for.', 'التسريب أو التحويل المفتوح يبدو في المراجعة كأي كود عادي. ولا يبلغ هذا الدور إلا عن الثغرات التي يستطيع أن يبين لها طريق هجوم.'),
    when: t('Before a release, or when sign-in, redirects, secrets, headers or server code change.', 'قبل الإصدار، أو عند تغيير تسجيل الدخول أو التحويلات أو الأسرار أو الـ headers أو كود الخادم.'),
  },
  'i18n-rtl-reviewer': {
    why: t('A missing plural or a physical margin is invisible to whoever does not read that language. This role compares the languages of the project with each other.', 'من لا يقرأ اللغة لا يرى صيغة جمع ناقصة أو هامشا بجهة ثابتة. هذا الدور يقارن لغات المشروع بعضها ببعض.'),
    when: t('Text, translation files or direction changed, in a project with several languages or a right-to-left one.', 'تغير نص أو ملفات ترجمة أو اتجاه، في مشروع متعدد اللغات أو مشروع يكتب من اليمين إلى اليسار.'),
  },
  'upgrade-analyst': {
    why: t('An upgrade planned from memory misses silent changes. This role reads the official guides and maps them to your files.', 'ترقية مخططة من الذاكرة تفوت التغييرات الصامتة. هذا الدور يقرأ الأدلة الرسمية ويربطها بملفاتك.'),
    when: t('Before a major upgrade. Not for a routine minor update.', 'قبل ترقية رئيسية. وليس لتحديث صغير عادي.'),
  },
  'seo-auditor': {
    why: t('A page can look perfect and still tell search engines to stay out. This role reads what a crawler receives.', 'قد تبدو الصفحة مثالية وهي تطلب من محركات البحث ألا تفهرسها. هذا الدور يقرأ ما يصل إلى الزاحف.'),
    when: t('A public page changed, or before a launch. Not for a signed-in dashboard.', 'تغيرت صفحة عامة، أو قبل الإطلاق. وليس للوحة تحكم تحتاج تسجيل دخول.'),
  },
}

export const rulePurpose: Record<string, Bilingual> = {
  'shared/accessibility.md': t('So the app works by keyboard, by screen reader and at 320 pixels, in the places that get forgotten.', 'ليعمل التطبيق بلوحة المفاتيح وقارئ الشاشة وعلى عرض 320 بكسل، في الأماكن التي تنسى عادة.'),
  'shared/dependencies.md': t('So a package is checked before it runs on your machine and in your builds.', 'لتفحص الحزمة قبل أن تعمل على جهازك وفي عمليات البناء.'),
  'shared/formatting.md': t('So an amount, a date or a search is right in every language and time zone.', 'ليظهر المبلغ والتاريخ والبحث صحيحا في كل لغة وكل منطقة زمنية.'),
  'shared/git.md': t('So branches, commits and pull requests stay under your control.', 'لتبقى الفروع والحفظ والـ pull request تحت سيطرتك.'),
  'shared/i18n.md': t('So no language is left behind and every key can be found.', 'حتى لا تتأخر أي لغة، ويسهل إيجاد كل مفتاح.'),
  'shared/naming.md': t('So the next person guesses a file’s name correctly the first time.', 'ليخمن من يأتي بعدك اسم الملف صحيحا من أول مرة.'),
  'shared/project.md': t('So facts only your team knows are not rediscovered or guessed in every session.', 'حتى لا يكتشف المساعد في كل جلسة ما يعرفه فريقك وحده، ولا يخمنه.'),
  'shared/quality-bar.md': t('So “done” means the same thing every time, with proof.', 'لتعني «انتهيت» الشيء نفسه في كل مرة، مع دليل.'),
  'shared/react.md': t('So components stay thin, hooks stay correct and any session writes the same React.', 'لتبقى المكونات خفيفة والـ hooks صحيحة، وتكتب كل جلسة React بالطريقة نفسها.'),
  'shared/rtl.md': t('So Arabic and English are both right by construction, not patched afterwards.', 'ليعمل كل شيء صحيحا بالعربية والإنجليزية من أول البناء، لا بترقيع بعده.'),
  'shared/scope.md': t('So the assistant neither stops halfway nor changes what you never asked for.', 'حتى لا يتوقف المساعد في منتصف العمل، ولا يغير ما لم تطلبه.'),
  'shared/security.md': t('So user input cannot become a script, a redirect or a leaked token.', 'حتى لا يتحول ما يدخله المستخدم إلى سكربت أو تحويل أو token مسرب.'),
  'shared/styles.md': t('So colour, type and spacing come from your system and layouts do not jump.', 'لتأتي الألوان والخطوط والمسافات من نظامك، ولا يقفز التخطيط.'),
  'shared/testing.md': t('So tests catch real breakage without becoming slow or flaky.', 'لتكشف الاختبارات الأعطال الحقيقية دون أن تصبح بطيئة أو غير مستقرة.'),

  'shared/typescript.md': t('So the typecheck really checks, whatever the TypeScript version.', 'ليعمل فحص الأنواع فعلا مهما كان إصدار TypeScript.'),

  'website/api-layer.md': t('So server and browser call the API safely, and an error is shown once.', 'ليستدعي الخادم والمتصفح الـ API بأمان، ويظهر الخطأ مرة واحدة فقط.'),
  'website/data-loading.md': t('So data is in the first HTML and never fetched twice.', 'لتكون البيانات في أول HTML، ولا تجلب مرتين أبدا.'),
  'website/performance.md': t('So speed on a cheap phone is a limit, not a hope.', 'لتكون السرعة على هاتف رخيص حدا ثابتا، لا أمنية.'),
  'website/routing-ssr.md': t('So every address renders, redirects and fails correctly on the server.', 'ليعمل كل عنوان على الخادم بشكل صحيح، في العرض والتحويل والفشل.'),
  'website/seo-share.md': t('So each page can be found and looks right when shared.', 'ليسهل إيجاد كل صفحة، وتظهر بشكل صحيح عند مشاركتها.'),

  'dashboard/api-layer.md': t('So one client owns tokens, errors and keys instead of every screen.', 'ليتولى عميل واحد الـ tokens والأخطاء والمفاتيح، بدل أن تتولاها كل شاشة.'),
  'dashboard/data-tables.md': t('So tables still work with a hundred thousand rows and a keyboard.', 'لتبقى الجداول تعمل مع مئة ألف صف ومع لوحة المفاتيح.'),
  'dashboard/error-monitoring.md': t('So production errors reach you without leaking personal data.', 'لتصلك أخطاء الإنتاج دون تسريب بيانات شخصية.'),
  'dashboard/forms-crud.md': t('So two admins editing at once, or a double click, cannot lose data.', 'حتى لا تضيع البيانات إذا عدّل أكثر من مدير في الوقت نفسه، أو ضغط أحدهم مرتين.'),
  'dashboard/permissions.md': t('So one list decides what each role sees and can do.', 'لتحدد قائمة واحدة ما يراه كل دور وما يقدر على فعله.'),
  'dashboard/routing.md': t('So guards hold and a list’s state survives a reload or a shared link.', 'لتصمد الحماية، وتبقى حالة القائمة بعد التحديث أو عبر رابط مشارك.'),

  'dashboard/variants/next/error-monitoring.md': t('So monitoring is right for both halves of a Next.js app.', 'لتعمل المراقبة بشكل صحيح في جزء الخادم وجزء المتصفح من تطبيق Next.js.'),
  'dashboard/variants/next/routing.md': t('So guards and data loading follow Next.js, which has no beforeLoad.', 'لتتبع الحماية وتحميل البيانات طريقة Next.js، التي ليس فيها beforeLoad.'),
  'dashboard/variants/next/structure.md': t('So every shared rule knows where things live in a Next.js app.', 'لتعرف كل قاعدة مشتركة أين توجد الأشياء في تطبيق Next.js.'),
  'dashboard/variants/tanstack-start/framework.md': t('So the admin runs as a client app on Start without hydration errors.', 'لتعمل لوحة الإدارة كتطبيق يعمل في المتصفح على Start دون أخطاء hydration.'),
  'dashboard/variants/tanstack-start/structure.md': t('So every shared rule knows where things live on TanStack Start.', 'لتعرف كل قاعدة مشتركة أين توجد الأشياء في TanStack Start.'),

  'react/auth.md': t('So tokens, guards and sign-out are handled one way in any stack.', 'لتعالج الـ tokens والحماية وتسجيل الخروج بطريقة واحدة في أي تقنية.'),
  'react/data-and-state.md': t('So server data and interface state are never mixed up.', 'حتى لا تختلط بيانات الخادم بحالة الواجهة أبدا.'),
  'react/forms.md': t('So forms are labelled and validated whatever library you use.', 'لتكون للنماذج تسميات وتحقق، مهما كانت المكتبة.'),
  'react/nextjs.md': t('So Next.js server code is treated as public and cached data never crosses users.', 'ليعامل كود الخادم في Next.js على أنه عام، ولا تنتقل البيانات المخزنة في الكاش بين المستخدمين أبدا.'),
  'react/react-router.md': t('So a guard on a parent route really protects what is under it.', 'حتى تكون الحماية على المسار الأب فعلية لكل ما تحته.'),
  'react/routing.md': t('So pages follow the router you really have, not the one the assistant assumes.', 'لتتبع الصفحات الـ router الموجود عندك فعلا، لا الذي يفترضه المساعد.'),
  'react/structure.md': t('So new code lands in a known shape, and a refactor has a target.', 'ليأتي الكود الجديد بشكل معروف، ويكون لإعادة الهيكلة هدف واضح.'),
}

export const hookPurpose: Record<HookEvent, Bilingual> = {
  SessionStart: t('The assistant starts each session knowing nothing, and forgets after clear or compact. This hands the essentials back.', 'يبدأ المساعد كل جلسة دون أي معرفة، وينسى بعد clear أو compact. هذا الحارس يعيد إليه الأساسيات.'),
  UserPromptSubmit: t('Short requests are ambiguous, and the assistant does not always notice the skill that fits. This names it before work starts.', 'الطلبات القصيرة غير واضحة، والمساعد لا ينتبه دائما إلى المهارة المناسبة. هذا الحارس يسميها قبل بدء العمل.'),
  PreToolUse: t('An instruction can be forgotten. A refusal before the tool runs cannot, so the known dangerous actions are stopped here.', 'التعليمات قد تنسى، أما الرفض قبل تشغيل الأداة فلا ينسى. لذلك يوقف هذا الحارس هنا الأوامر الخطرة المعروفة.'),
  PostToolUse: t('An error is cheapest to fix in the second it is written. This returns it to the assistant at once.', 'أرخص وقت لإصلاح الخطأ هو لحظة كتابته. هذا الحارس يعيده إلى المساعد فورا.'),
  PostToolUseFailure: t('One failure is noise and five are a pattern. This keeps the record that shows the difference.', 'فشل واحد قد يكون عابرا، وخمس مرات فشل تعني نمطا. هذا الحارس يحتفظ بالسجل الذي يبين الفرق.'),
  SubagentStart: t('A subagent never sees the session’s opening briefing. Without this it would not know the branch rules, the live hosts or the mode.', 'الوكيل الفرعي لا يرى الشرح الذي بدأت به الجلسة. بدون هذا الحارس لن يعرف قواعد الفروع ولا عناوين المواقع المباشرة ولا النمط.'),
  SubagentStop: t('Broken code from an agent would spread into the main session. The agent has to face the typecheck first.', 'كود وكيل معطوب سينتقل إلى الجلسة الرئيسية. لذلك على الوكيل أن يمر أولا بفحص الأنواع.'),
  Notification: t('A long run waiting for your answer looks like one still working. An alert tells you which.', 'التشغيل الطويل الذي ينتظر جوابك يبدو وكأنه ما زال يعمل. والتنبيه يقول لك ما الذي يحدث.'),
  Stop: t('The assistant says done before it is. This makes it prove that with your own checks, then be read by another agent.', 'يقول المساعد إنه انتهى قبل أن ينتهي فعلا. هذا الحارس يجعله يثبت ذلك بفحوصك أنت، ثم يقرأ وكيل آخر عمله.'),
  SessionEnd: t('Working files of old sessions would pile up in your project. This clears them.', 'ملفات عمل الجلسات القديمة تتراكم في مشروعك. هذا الحارس ينظفها.'),
}
