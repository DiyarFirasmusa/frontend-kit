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
    why: t('Without a procedure the assistant writes a new button each time, in a new place and style. This makes it look for the existing one first, then build to your conventions.', 'بدون طريقة واضحة، المساعد يكتب زر جديد كل مرة بمكان وشكل مختلف. هالمهارة تخليه يدور على الموجود أول، وبعدين يبني على أسلوب مشروعك.'),
    when: t('Any new or extracted piece of interface, even a small one. With a Figma link, figma-match runs beside it.', 'أي قطعة واجهة جديدة أو مستخرجة، حتى لو صغيرة. وإذا عندك رابط Figma، تشتغل figma-match معها.'),
  },
  'create-form': {
    why: t('Forms are where validation, accessibility and double submits go wrong. One recipe settles the schema, labels, translated errors and a single submit.', 'النماذج أكثر مكان تصير بيه أخطاء التحقق وسهولة الوصول والإرسال المكرر. وصفة وحدة تحسم المخطط والتسميات والأخطاء المترجمة، والإرسال مرة وحدة بس.'),
    when: t('Any screen that takes input: login, phone, code, address, profile, filters or an edit dialog.', 'أي شاشة يدخّل بيها المستخدم شي: تسجيل دخول، هاتف، رمز، عنوان، ملف شخصي، فلاتر، أو نافذة تعديل.'),
  },
  'create-hook': {
    why: t('Logic piles up inside components until nobody can test it. This moves it into a hook with the right place, keys, guards and tests.', 'المنطق يتكدس داخل المكوّنات لحد ما محد يقدر يختبره. هالمهارة تنقله لـ hook بمكانه الصح، مع مفاتيحه وشروطه واختباراته.'),
    when: t('A data query, a mutation, the logic of a page, a small utility, or a container that is getting heavy.', 'استعلام بيانات، أو عملية تعديل، أو منطق صفحة، أو أداة صغيرة، أو حاوية صارت ثقيلة.'),
  },
  'create-store': {
    why: t('Global state is easy to add and hard to remove. This first asks whether a store is needed at all, then handles saving and sign-out cleanup.', 'الحالة العامة سهل تضيفها وصعب تشيلها. هالمهارة تسأل أول: تحتاج مخزن أصلاً؟ وبعدين تتكفل بتخزينها وتنظيفها عند تسجيل الخروج.'),
    when: t('State that outlives a component: a preference, the session, a cart, a draft, or data handed between routes.', 'حالة تعيش أطول من المكوّن: تفضيل، الجلسة، سلة، مسودة، أو بيانات تنتقل بين المسارات.'),
  },
  'figma-match': {
    why: t('“Close enough” is not what a designer handed over. This reads the frame, maps it to your tokens and compares the result.', '«تقريباً نفسه» مو هو اللي سلّمه المصمم. هالمهارة تقرأ الإطار، تربطه برموز تصميمك، وتقارن النتيجة.'),
    when: t('You give a Figma link, or say the screen must look like the design.', 'تعطيه رابط Figma، أو تقول لازم الشاشة تطلع مثل التصميم.'),
  },
  'frontend-design': {
    why: t('Left alone, the assistant produces the same generic page. This makes it commit to a deliberate visual direction before any code.', 'إذا تركت المساعد على راحته، يطلع نفس الصفحة العادية كل مرة. هالمهارة تلزمه يختار اتجاه بصري مقصود قبل أي كود.'),
    when: t('A brand-new page or section with no Figma frame, when you ask for a new look. Not for routine product screens.', 'صفحة أو قسم جديد كلياً بدون Figma، لما تطلب شكل جديد. مو لشاشات المنتج المعتادة.'),
  },
  'ui-ux-pro-max': {
    why: t('Design advice from memory repeats itself. This searches a catalogue of styles, palettes, type pairings and UX guidelines.', 'نصايح التصميم من الذاكرة تكرر نفسها. هالمهارة تدور بفهرس فيه أساليب وألوان وتركيبات خطوط وإرشادات تجربة الاستخدام.'),
    when: t('You ask for ideas, alternatives or a better experience. Not when a design already exists.', 'تطلب أفكار أو بدائل أو تجربة أحسن. مو لما يكون التصميم جاهز.'),
  },
  'i18n-conventions': {
    why: t('Translations rot quietly: missing languages, deep keys, keys built at run time. One convention keeps every key findable and checkable.', 'الترجمات تخرب بصمت: لغة ناقصة، مفاتيح عميقة، مفاتيح تنبني وقت التشغيل. طريقة وحدة تخلي كل مفتاح سهل تلقاه وتفحصه.'),
    when: t('Any change to visible text, a locale file or a translation call.', 'أي تغيير بنص ظاهر، أو ملف ترجمة، أو استدعاء ترجمة.'),
  },
  'tanstack-query-key-conventions': {
    why: t('An inline query key is a cache bug waiting to happen. One factory makes invalidating a whole family reliable.', 'مفتاح الاستعلام المكتوب بمكانه هو خطأ كاش ينتظر وقته. مصنع واحد يخلي إبطال عائلة كاملة مضمون.'),
    when: t('Writing or reviewing any query, mutation, prefetch or invalidation in TanStack Query.', 'لما تكتب أو تراجع أي استعلام، أو عملية تعديل، أو جلب مسبق، أو إبطال بـ TanStack Query.'),
  },
  'typescript-advanced-types': {
    why: t('Hard typing problems tempt any and casts. This reference shows the precise type in their place.', 'مشاكل الأنواع الصعبة تغري الواحد يستعمل any والتحويل القسري. هذا المرجع يبيّنلك النوع الدقيق بدلهم.'),
    when: t('Generics, conditional or mapped types, or a reusable type utility.', 'الأنواع العامة والشرطية والمشتقة، أو أداة أنواع تقدر تعيد استعمالها.'),
  },
  'dash-create-route': {
    why: t('An admin page is a route, a guard, a search schema, a loader and a menu entry. Forgetting one means a leak or a broken link.', 'صفحة الإدارة يعني مسار، وحماية، ومخطط بحث، ومحمّل بيانات، وعنصر بالقائمة. تنسى وحدة منها يعني تسريب أو رابط مكسور.'),
    when: t('A new page, address, guarded section or sidebar entry in a dashboard.', 'صفحة أو عنوان جديد، أو قسم محمي، أو عنصر جديد بالقائمة الجانبية بلوحة التحكم.'),
  },
  'dash-create-table': {
    why: t('A table looks done long before it is. This settles server paging, sorting in the URL, actions and all four states.', 'الجدول يبين جاهز قبل ما يجهز فعلاً بوقت طويل. هالمهارة تحسم الصفحات من السيرفر، والترتيب بالرابط، والإجراءات، والحالات الأربع كلها.'),
    when: t('A list page, grid, columns, sorting, paging, row actions or bulk selection.', 'صفحة قائمة، أو شبكة، أو أعمدة، أو ترتيب، أو تقسيم صفحات، أو إجراءات على الصفوف، أو تحديد جماعي.'),
  },
  'dash-create-filter-bar': {
    why: t('Filters kept in component state vanish on reload and cannot be shared. This keeps each one typed in the URL.', 'الفلاتر اللي تنحفظ داخل المكوّن تروح عند التحديث وما تقدر تشاركها. هالمهارة تخلي كل فلتر بالرابط، وبنوعه.'),
    when: t('Search, selects, a date range or a toolbar above a list.', 'بحث، أو قوائم اختيار، أو مدى تواريخ، أو شريط أدوات فوق قائمة.'),
  },
  'dash-create-detail': {
    why: t('A record page mixes reading, tabs, state changes and conflicts. This gives each a fixed place.', 'صفحة السجل بيها عرض وتبويبات وتغيير حالة وتعارضات، كلها مخلوطة. هالمهارة تعطي كل وحدة مكان ثابت.'),
    when: t('A details page for an order, user or any record with history, notes or a status.', 'صفحة تفاصيل لطلب أو مستخدم أو أي سجل إله تاريخ أو ملاحظات أو حالة.'),
  },
  'dash-create-crud': {
    why: t('Create, edit and delete repeat in every module and drift. One recipe covers the form, cache, server errors, confirm and permissions.', 'الإضافة والتعديل والحذف تتكرر بكل قسم، ومع الوقت كل وحدة تطلع غير. وصفة وحدة تغطي النموذج، والكاش، وأخطاء السيرفر، والتأكيد، والصلاحيات.'),
    when: t('Adding, editing, deleting, archiving or toggling an entity in a dashboard.', 'إضافة عنصر أو تعديله أو حذفه أو أرشفته أو تبديل حالته بلوحة التحكم.'),
  },
  'dash-create-settings-form': {
    why: t('Settings are one record many people edit. This adds conflict handling, an unsaved warning and read-only sections.', 'الإعدادات سجل واحد يعدّل عليه أكثر من شخص. هالمهارة تضيف معالجة التعارض، وتنبيه للتغييرات غير المحفوظة، وأقسام للقراءة بس.'),
    when: t('A settings, preferences or profile page that edits one record.', 'صفحة إعدادات أو تفضيلات أو ملف شخصي تعدّل سجل واحد.'),
  },
  'web-create-route': {
    why: t('A public page must be right in the first response: data, title, a real 404 and redirects. Client-only habits break that.', 'الصفحة العامة لازم تطلع صح من أول رد: البيانات، والعنوان، و404 حقيقية، والتحويلات. عادات الشغل على المتصفح بس تخرب هالشي.'),
    when: t('A new page or address, a slug page, a 404, a redirect or data that should render on the server.', 'صفحة أو عنوان جديد، أو صفحة باسمها بالرابط، أو 404، أو تحويل، أو بيانات لازم تنعرض من السيرفر.'),
  },
  'web-create-feature': {
    why: t('From an endpoint to a page is a dozen files. This writes all of them in the same shape every time, translations and tests included.', 'من نقطة API لحد الصفحة، تقريباً عشر ملفات أو أكثر. هالمهارة تكتبها كلها بنفس الشكل كل مرة، ومعها الترجمة والاختبارات.'),
    when: t('You hand over an endpoint or API document and ask for the whole feature.', 'تسلّمه نقطة أو وثيقة API، وتطلب الميزة كاملة.'),
  },
  'web-seo-page': {
    why: t('A page nobody can find, or that shares with the wrong picture, fails quietly. This covers every tag a search engine or chat app reads.', 'الصفحة اللي محد يلقاها، أو اللي تنشارك بصورة غلط، تفشل بصمت. هالمهارة تغطي كل وسم يقرأه محرك البحث أو تطبيق المحادثة.'),
    when: t('Any new public page, or a problem with titles, previews, structured data, sitemap or canonical links.', 'أي صفحة عامة جديدة، أو مشكلة بالعناوين أو المعاينات أو البيانات المنظمة أو خريطة الموقع أو روابط canonical.'),
  },
  'web-server-fn': {
    why: t('Secrets and cookies must never reach the browser. This puts them behind a validated, authorised server function.', 'الأسرار والكوكيز لازم ما توصل للمتصفح أبداً. هالمهارة تحطها ورا دالة سيرفر تتحقق من المدخلات والصلاحية.'),
    when: t('Hiding a key, reading a session cookie, proxying the backend, a webhook or a server-only library.', 'تخفي مفتاح، أو تقرأ كوكي الجلسة، أو تمرر الطلبات للـ backend، أو webhook، أو مكتبة تشتغل على السيرفر بس.'),
  },
  task: {
    why: t('Work that starts on the wrong branch or ends unverified costs a review round. This runs a ticket from branch to question.', 'الشغل اللي يبدأ على فرع غلط أو يخلص بدون تحقق يكلّفك جولة مراجعة. هالمهارة تمشي بالتذكرة من الفرع لحد السؤال الأخير.'),
    when: t('A new task or a ticket link. A single component or form has its own skill.', 'مهمة جديدة أو رابط تذكرة. أما مكوّن واحد أو نموذج واحد فإله مهارته الخاصة.'),
  },
  explain: {
    why: t('A question should get an answer, not an edit. This finds the real cause in the code and changes nothing.', 'السؤال جوابه كلام، مو تعديل. هالمهارة تلقى السبب الحقيقي بالكود وما تغيّر أي شي.'),
    when: t('You ask why, how or which endpoint, or need a note for someone else.', 'تسأل ليش، أو شلون، أو أي نقطة API، أو تحتاج ملاحظة لشخص ثاني.'),
  },
  dev: {
    why: t('A busy port or a stale cache wastes minutes and leads to wrong conclusions. This checks first and waits until the app answers.', 'بورت مشغول أو كاش قديم يضيّع دقايق ويخليك تستنتج غلط. هالمهارة تفحص أول، وتنتظر لحد ما يرد التطبيق.'),
    when: t('Starting, stopping or restarting the app, or when it serves old code.', 'تشغيل التطبيق أو إيقافه أو إعادة تشغيله، أو لما يعرض كود قديم.'),
  },
  refactor: {
    why: t('Cleaning up is where behaviour breaks by accident. This moves code in safe steps and proves nothing changed.', 'التنظيف هو المكان اللي ينكسر بيه السلوك بالغلط. هالمهارة تنقل الكود بخطوات آمنة، وتثبت إن ولا شي تغيّر.'),
    when: t('A long file, duplicated code, logic in the wrong layer or leftovers of a migration.', 'ملف طويل، أو كود مكرر، أو منطق بطبقة غلط، أو بقايا ترحيل.'),
  },
  'refactor-mode': {
    why: t('A whole old project cannot be fixed in one change. This measures it and rebuilds it phase by phase with your approval.', 'ما تقدر تصلح مشروع قديم كامل بتغيير واحد. هالمهارة تقيسه وتعيد بناءه مرحلة مرحلة، وبموافقتك.'),
    when: t('An existing project far from the standards. Only you can start it, by name.', 'مشروع موجود بعيد عن المعايير. بس أنت تقدر تشغّلها، باسمها.'),
  },
  'fix-everywhere': {
    why: t('The assistant fixes the one case you showed and leaves the rest. This finds them all and proves with a search that none are left.', 'المساعد يصلح الحالة اللي عرضتها عليه ويترك الباقي. هالمهارة تلقاها كلها، وتثبت ببحث إنه ما بقى ولا وحدة.'),
    when: t('You say all, every or other pages, or a bug turns out to be a pattern.', 'تقول الكل أو كل الصفحات أو باقي الصفحات، أو يطلع الخلل نمط متكرر.'),
  },
  performance: {
    why: t('Speed work without measuring is guesswork. This starts from a budget and numbers on a slow phone.', 'تحسين السرعة بدون قياس مجرد تخمين. هالمهارة تبدأ من ميزانية أداء وأرقام على موبايل بطيء.'),
    when: t('A slow page, a jumping layout, a falling Lighthouse score or a heavy new feature.', 'صفحة بطيئة، أو تخطيط يقفز، أو نتيجة Lighthouse نازلة، أو ميزة جديدة ثقيلة.'),
  },
  'vercel-react-best-practices': {
    why: t('React slows down in known ways. This is Vercel’s ordered list of them, to audit against.', 'بطء React إله أسباب معروفة. وهالمهارة هي قائمة Vercel المرتبة إلها، حتى تدقق على أساسها.'),
    when: t('A requested React performance audit, or inside a review. The performance skill comes first.', 'لما تطلب تدقيق أداء React، أو ضمن مراجعة. ومهارة performance تجي أول.'),
  },
  'web-design-guidelines': {
    why: t('A working interface can still break many small usability rules. This checks files against Vercel’s guidelines.', 'ممكن الواجهة تشتغل وبنفس الوقت تخالف قواعد استخدام صغيرة كثيرة. هالمهارة تفحص الملفات حسب إرشادات Vercel.'),
    when: t('You ask for an audit of existing UI against best practice.', 'تطلب تدقيق واجهة موجودة حسب أفضل الممارسات.'),
  },
  'playwright-best-practices': {
    why: t('A flaky end-to-end test is worse than none, because people stop trusting it. This is the reference for stable ones.', 'الاختبار الشامل اللي يتذبذب أسوأ من ما يكون عندك اختبار أصلاً، لأن الناس تبطّل تثق بيه. هذا مرجع الاختبارات المستقرة.'),
    when: t('Writing, fixing or debugging Playwright tests of any kind.', 'تكتب أي اختبارات Playwright، أو تصلحها، أو تتبع ليش تفشل.'),
  },
  verify: {
    why: t('“Done” without output is a claim. This runs every check and reports the real numbers.', '«خلصت» بدون نتائج مجرد كلام. هالمهارة تشغّل كل الفحوص وتذكر الأرقام الحقيقية.'),
    when: t('Before a commit, or when you ask whether it works.', 'قبل الحفظ، أو لما تسأل إذا يشتغل.'),
  },
  review: {
    why: t('The author cannot see their own blind spots. Fresh agents judge the standards and the request separately.', 'الكاتب ما يشوف الأشياء اللي فاتته. وكلاء بعين جديدة يحكمون على المعايير وعلى الطلب، كل وحدة لحالها.'),
    when: t('Before committing anything that is not trivial, or when you ask for another opinion.', 'قبل ما تحفظ أي شي مو بسيط، أو لما تريد رأي ثاني.'),
  },
  'live-check': {
    why: t('Some bugs only show with a real login in a real browser. This tests there, and never on the live site.', 'بعض الأخطاء ما تبين إلا بتسجيل دخول حقيقي بمتصفح حقيقي. هالمهارة تختبر هناك، وأبداً مو على الموقع الحي.'),
    when: t('A flow that needs a code, single sign-on or a third party, on local or the test environment.', 'مسار يحتاج رمز، أو دخول موحد، أو طرف ثالث، محلياً أو ببيئة الاختبار.'),
  },
  'commit-push': {
    why: t('Git mistakes are public. This commits only after your yes, only on the task branch, and stops at a link.', 'أغلاط git الكل يشوفها. هالمهارة ما تحفظ إلا بعد موافقتك، وبس على فرع المهمة، وتوقف عند الرابط.'),
    when: t('You say commit, push, or yes to the question at the end of a task.', 'تقول احفظ أو ارفع، أو توافق على السؤال بنهاية المهمة.'),
  },
  'pr-link': {
    why: t('Opening the pull request is your decision. This prepares everything up to the click.', 'فتح الـ pull request قرارك أنت. هالمهارة تجهّز كل شي لحد الضغطة.'),
    when: t('You ask for the link or a description to paste.', 'تطلب الرابط، أو وصف جاهز تلصقه.'),
  },
  'sync-main': {
    why: t('Rebasing blindly creates conflicts you did not expect. This shows what is coming before it touches anything.', 'الـ rebase على عمى يسوي تعارضات ما كنت متوقعها. هالمهارة تبيّنلك شنو جاي قبل ما تلمس أي شي.'),
    when: t('Main has moved, or you ask to update from it.', 'الفرع الرئيسي تقدّم، أو تطلب تحدّث منه.'),
  },
  'branch-status': {
    why: t('You should know where work stands without reading git output. This answers and changes nothing.', 'لازم تعرف وين وصل الشغل بدون ما تقرأ مخرجات git. هالمهارة تجاوب وما تغيّر أي شي.'),
    when: t('Which branch, is it pushed, what is left to commit.', 'أي فرع، هل انرفع، وشنو باقي ما انحفظ.'),
  },
  'backend-request': {
    why: t('What the frontend needs from the backend gets lost in chat. This keeps one readable list in the repo.', 'اللي تحتاجه الواجهة من الـ backend يضيع بالمحادثات. هالمهارة تخليه بقائمة وحدة واضحة داخل المستودع.'),
    when: t('A missing endpoint or field, a wrong response, or a message for the backend team.', 'نقطة أو حقل ناقص، أو رد غلط، أو رسالة لفريق الـ backend.'),
  },
  setup: {
    why: t('A generic plugin would give generic advice. Setup detects your stack and installs standards written for it.', 'إضافة عامة تعطي نصايح عامة. الإعداد يكتشف التقنيات اللي تستعملها ويثبّت معايير مكتوبة إلها.'),
    when: t('Once in each project, and again to pick up new rules. Only you can start it.', 'مرة وحدة بكل مشروع، ومرة ثانية حتى تجيب القواعد الجديدة. بس أنت تقدر تشغّله.'),
  },
  mode: {
    why: t('A release freeze or a hotfix needs other limits than everyday work. One switch changes them, and a guard holds the part a hook can see.', 'تجميد الإصدار أو الإصلاح المستعجل يحتاج حدود غير حدود الشغل اليومي. مفتاح واحد يبدّلها، وحارس يثبّت الجزء اللي يقدر يشوفه.'),
    when: t('Before a release, during an incident, for a read-only audit, a prototype, or an app that is only maintained. Only you switch it.', 'قبل الإصدار، أو وقت عطل، أو لتدقيق بالقراءة بس، أو نموذج أولي، أو تطبيق بمرحلة صيانة. أنت وحدك تبدّله.'),
  },
  'upgrade-mode': {
    why: t('A major upgrade fails quietly: the new API compiles while the behaviour changes. This proves each phase against a recorded baseline.', 'الترقية الكبيرة تفشل بصمت: الـ API الجديد ينبني بدون أخطاء بس السلوك يتغير. هالمهارة تثبت كل مرحلة مقابل خط أساس مسجّل.'),
    when: t('A major version of a framework or library. A patch or a single small bump is a normal task.', 'إصدار رئيسي لإطار عمل أو مكتبة. أما الـ patch أو ترقية صغيرة وحدة فهي مهمة عادية.'),
  },
}

export const agentPurpose: Record<string, Purpose> = {
  planner: {
    why: t('Agents working at once collide unless someone fixes the contracts and file owners first. The planner does only that.', 'الوكلاء اللي يشتغلون سوا يتصادمون، إلا إذا أحد حدد الاتفاقات ومالك كل ملف من البداية. المخطط يسوي هذا بس.'),
    when: t('A task big enough for a team run or a long autonomous one.', 'مهمة كبيرة تكفي لفريق وكلاء، أو لتشغيل ذاتي طويل.'),
  },
  'frontend-dev': {
    why: t('A focused builder with a clean memory follows the rules more exactly than a long session does.', 'بنّاء مركّز بذاكرة نظيفة يلتزم بالقواعد أدق من جلسة طويلة.'),
    when: t('One well-scoped change or package. It does not write the tests.', 'تغيير واحد أو حزمة وحدة محددة. وهو ما يكتب الاختبارات.'),
  },
  'ui-designer': {
    why: t('Code review does not notice weak hierarchy or uneven spacing. This role looks only at the design.', 'مراجعة الكود ما تنتبه لضعف التسلسل البصري أو المسافات غير المتساوية. هالدور يشوف التصميم بس.'),
    when: t('The screen works but looks off, or before shipping a visible change.', 'الشاشة تشتغل بس شكلها مو مضبوط، أو قبل ما تسلّم تغيير يبين.'),
  },
  'test-engineer': {
    why: t('Tests written by the author confirm what they meant, not what the code does. A separate writer finds more.', 'الاختبارات اللي يكتبها نفس الكاتب تأكد شنو قصد، مو شنو يسوي الكود فعلاً. كاتب منفصل يلقى أكثر.'),
    when: t('After a change is built, or to fill missing coverage.', 'بعد ما ينبني التغيير، أو حتى تسد نقص التغطية.'),
  },
  'bug-hunter': {
    why: t('The first fix for a bug is often a patch over the symptom. This role must name the root cause before proposing one.', 'أول إصلاح للخطأ غالباً ترقيع فوق العَرَض. هالدور لازم يسمّي السبب الجذري قبل ما يقترح إصلاح.'),
    when: t('Something is broken and the cause is unknown.', 'شي خربان وسببه مو معروف.'),
  },
  'frontend-reviewer': {
    why: t('A reader who never saw the conversation judges only the code, the way a colleague would.', 'قارئ ما شاف المحادثة يحكم على الكود بس، مثل ما يسوي زميلك.'),
    when: t('After the quality gate passes, or any branch or diff before commit.', 'بعد ما تنجح بوابة الجودة، أو أي فرع أو diff قبل الحفظ.'),
  },
  'accessibility-auditor': {
    why: t('People who use a keyboard or screen reader are shut out by bugs nobody else sees. This role checks for them.', 'اللي يستعملون لوحة المفاتيح أو قارئ الشاشة، أخطاء محد غيرهم يشوفها تسد الطريق بوجههم. هالدور يدور عليها.'),
    when: t('Building or reviewing any page or component people use.', 'تبني أو تراجع أي صفحة أو مكوّن يستعمله الناس.'),
  },
  'performance-optimizer': {
    why: t('Speed problems hide until real phones meet real networks. This role measures before it advises.', 'مشاكل السرعة تبقى مخفية لحد ما تلتقي موبايلات حقيقية بشبكات حقيقية. هالدور يقيس قبل ما ينصح.'),
    when: t('A slow page, a falling score, or before shipping something heavy.', 'صفحة بطيئة، أو نتيجة نازلة، أو قبل ما تسلّم شي ثقيل.'),
  },
  'refactor-architect': {
    why: t('A refactor across many files needs a map and an order, or the build stays red for days.', 'إعادة الهيكلة على ملفات كثيرة تحتاج خريطة وترتيب، وإلا البناء يبقى خربان أيام.'),
    when: t('A restructure bigger than one component, or a layer migration.', 'إعادة هيكلة أكبر من مكوّن واحد، أو ترحيل طبقة.'),
  },
  'qa-engineer': {
    why: t('Green tests still ship broken screens. This role opens every changed page in both languages, sizes and themes.', 'ممكن الاختبارات تنجح والشاشات تطلع خربانة. هالدور يفتح كل صفحة تغيّرت، باللغتين والحجمين والسمتين.'),
    when: t('The last gate before you are asked to commit.', 'آخر بوابة قبل ما ينطلب منك الحفظ.'),
  },
  'frontend-security-reviewer': {
    why: t('A leak or an open redirect looks like normal code in a review. This role reports only what it can show an attack path for.', 'التسريب أو التحويل المفتوح يبين كود عادي بالمراجعة. هالدور ما يبلّغ إلا عن الشي اللي يقدر يبيّن طريقة استغلاله.'),
    when: t('Before a release, or when sign-in, redirects, secrets, headers or server code change.', 'قبل الإصدار، أو لما يتغير تسجيل الدخول أو التحويلات أو الأسرار أو الـ headers أو كود السيرفر.'),
  },
  'i18n-rtl-reviewer': {
    why: t('A missing plural or a physical margin is invisible to whoever does not read that language. This role compares the languages of the project with each other.', 'صيغة جمع ناقصة أو هامش باتجاه ثابت، ما يشوفها اللي ما يقرأ هاللغة. هالدور يقارن لغات المشروع ببعضها.'),
    when: t('Text, translation files or direction changed, in a project with several languages or a right-to-left one.', 'تغيّر نص أو ملفات ترجمة أو اتجاه، بمشروع بيه أكثر من لغة أو لغة من اليمين لليسار.'),
  },
  'upgrade-analyst': {
    why: t('An upgrade planned from memory misses silent changes. This role reads the official guides and maps them to your files.', 'الترقية اللي تنخطط من الذاكرة تفوتها التغييرات الصامتة. هالدور يقرأ الأدلة الرسمية ويطابقها مع ملفاتك.'),
    when: t('Before a major upgrade. Not for a routine minor update.', 'قبل ترقية رئيسية. مو لتحديث صغير عادي.'),
  },
  'seo-auditor': {
    why: t('A page can look perfect and still tell search engines to stay out. This role reads what a crawler receives.', 'ممكن الصفحة تبين مثالية وهي تطلب من محركات البحث ما تفهرسها. هالدور يقرأ شنو يستلم الزاحف.'),
    when: t('A public page changed, or before a launch. Not for a signed-in dashboard.', 'تغيّرت صفحة عامة، أو قبل الإطلاق. مو للوحة تحكم تحتاج تسجيل دخول.'),
  },
}

export const rulePurpose: Record<string, Bilingual> = {
  'shared/accessibility.md': t('So the app works by keyboard, by screen reader and at 320 pixels, in the places that get forgotten.', 'حتى يشتغل التطبيق بلوحة المفاتيح، وبقارئ الشاشة، وعلى عرض 320 بكسل، بالأماكن اللي تنتسى.'),
  'shared/dependencies.md': t('So a package is checked before it runs on your machine and in your builds.', 'حتى الحزمة تنفحص قبل ما تشتغل على جهازك وبالبناء.'),
  'shared/formatting.md': t('So an amount, a date or a search is right in every language and time zone.', 'حتى المبلغ والتاريخ والبحث يطلعون صح بكل لغة وكل منطقة زمنية.'),
  'shared/git.md': t('So branches, commits and pull requests stay under your control.', 'حتى الفروع والحفظ والـ pull requests تبقى بإيدك.'),
  'shared/i18n.md': t('So no language is left behind and every key can be found.', 'حتى ولا لغة تتأخر، وكل مفتاح تقدر تلقاه.'),
  'shared/naming.md': t('So the next person guesses a file’s name correctly the first time.', 'حتى الشخص اللي بعدك يخمّن اسم الملف صح من أول مرة.'),
  'shared/project.md': t('So facts only your team knows are not rediscovered or guessed in every session.', 'حتى المعلومات اللي بس فريقك يعرفها ما ينعاد اكتشافها أو تخمينها بكل جلسة.'),
  'shared/quality-bar.md': t('So “done” means the same thing every time, with proof.', 'حتى «خلص» يعني نفس الشي كل مرة، ومعه الإثبات.'),
  'shared/react.md': t('So components stay thin, hooks stay correct and any session writes the same React.', 'حتى تبقى المكوّنات خفيفة، والـ hooks صحيحة، وأي جلسة تكتب React بنفس الطريقة.'),
  'shared/rtl.md': t('So Arabic and English are both right by construction, not patched afterwards.', 'حتى العربي والإنجليزي يطلعون صح من البداية، مو بالترقيع بعدين.'),
  'shared/scope.md': t('So the assistant neither stops halfway nor changes what you never asked for.', 'حتى المساعد ما يوقف بالنص، ولا يغيّر شي ما طلبته.'),
  'shared/security.md': t('So user input cannot become a script, a redirect or a leaked token.', 'حتى إدخال المستخدم ما يتحول لسكربت أو تحويل أو توكن مسرّب.'),
  'shared/styles.md': t('So colour, type and spacing come from your system and layouts do not jump.', 'حتى الألوان والخطوط والمسافات تجي من نظامك، والتخطيط ما يقفز.'),
  'shared/testing.md': t('So tests catch real breakage without becoming slow or flaky.', 'حتى الاختبارات تمسك الكسر الحقيقي، بدون ما تصير بطيئة أو متذبذبة.'),

  'shared/typescript.md': t('So the typecheck really checks, whatever the TypeScript version.', 'حتى فحص الأنواع يفحص فعلاً، مهما كان إصدار TypeScript.'),

  'website/api-layer.md': t('So server and browser call the API safely, and an error is shown once.', 'حتى السيرفر والمتصفح يستدعون الـ API بأمان، والخطأ يظهر مرة وحدة.'),
  'website/data-loading.md': t('So data is in the first HTML and never fetched twice.', 'حتى البيانات تكون بأول HTML، وما تنجلب مرتين أبداً.'),
  'website/performance.md': t('So speed on a cheap phone is a limit, not a hope.', 'حتى السرعة على موبايل رخيص تكون حد ثابت، مو أمنية.'),
  'website/routing-ssr.md': t('So every address renders, redirects and fails correctly on the server.', 'حتى كل عنوان ينعرض ويتحوّل ويفشل صح من السيرفر.'),
  'website/seo-share.md': t('So each page can be found and looks right when shared.', 'حتى كل صفحة سهل تنلقى، وتطلع صح لما تتشارك.'),

  'dashboard/api-layer.md': t('So one client owns tokens, errors and keys instead of every screen.', 'حتى عميل واحد يمسك التوكنات والأخطاء والمفاتيح، بدل ما كل شاشة تمسكها.'),
  'dashboard/data-tables.md': t('So tables still work with a hundred thousand rows and a keyboard.', 'حتى الجداول تبقى تشتغل مع مية ألف صف، ومع لوحة المفاتيح.'),
  'dashboard/error-monitoring.md': t('So production errors reach you without leaking personal data.', 'حتى توصلك أخطاء الإنتاج بدون ما تتسرب بيانات شخصية.'),
  'dashboard/forms-crud.md': t('So two admins editing at once, or a double click, cannot lose data.', 'حتى ما تضيع بيانات إذا اثنين مدراء عدّلوا بنفس الوقت، أو صارت ضغطة مزدوجة.'),
  'dashboard/permissions.md': t('So one list decides what each role sees and can do.', 'حتى قائمة وحدة تقرر شنو يشوف كل دور، وشنو يقدر يسوي.'),
  'dashboard/routing.md': t('So guards hold and a list’s state survives a reload or a shared link.', 'حتى الحماية تصمد، وحالة القائمة تبقى بعد التحديث أو بالرابط المشارك.'),

  'dashboard/variants/next/error-monitoring.md': t('So monitoring is right for both halves of a Next.js app.', 'حتى المراقبة تشتغل صح بنصّي تطبيق Next.js الاثنين.'),
  'dashboard/variants/next/routing.md': t('So guards and data loading follow Next.js, which has no beforeLoad.', 'حتى الحماية وتحميل البيانات يمشون على طريقة Next.js، اللي ما بيها beforeLoad.'),
  'dashboard/variants/next/structure.md': t('So every shared rule knows where things live in a Next.js app.', 'حتى كل قاعدة مشتركة تعرف وين مكان كل شي بتطبيق Next.js.'),
  'dashboard/variants/tanstack-start/framework.md': t('So the admin runs as a client app on Start without hydration errors.', 'حتى لوحة الإدارة تشتغل كتطبيق متصفح على Start، بدون أخطاء hydration.'),
  'dashboard/variants/tanstack-start/structure.md': t('So every shared rule knows where things live on TanStack Start.', 'حتى كل قاعدة مشتركة تعرف وين مكان كل شي على TanStack Start.'),

  'react/auth.md': t('So tokens, guards and sign-out are handled one way in any stack.', 'حتى التوكنات والحماية وتسجيل الخروج تنمسك بطريقة وحدة، مهما كانت التقنية.'),
  'react/data-and-state.md': t('So server data and interface state are never mixed up.', 'حتى بيانات السيرفر وحالة الواجهة ما تختلط أبداً.'),
  'react/forms.md': t('So forms are labelled and validated whatever library you use.', 'حتى النماذج يكون إلها تسميات وتحقق، مهما كانت المكتبة اللي تستعملها.'),
  'react/nextjs.md': t('So Next.js server code is treated as public and cached data never crosses users.', 'حتى كود السيرفر بـ Next.js ينعامل كأنه عام، وبيانات الكاش ما تنتقل بين المستخدمين أبداً.'),
  'react/react-router.md': t('So a guard on a parent route really protects what is under it.', 'حتى الحماية على المسار الأب تحمي فعلاً اللي تحته.'),
  'react/routing.md': t('So pages follow the router you really have, not the one the assistant assumes.', 'حتى الصفحات تمشي على الـ router اللي عندك فعلاً، مو اللي يفترضه المساعد.'),
  'react/structure.md': t('So new code lands in a known shape, and a refactor has a target.', 'حتى الكود الجديد ينزل بشكل معروف، وإعادة الهيكلة يكون إلها هدف.'),
}

export const hookPurpose: Record<HookEvent, Bilingual> = {
  SessionStart: t('The assistant starts each session knowing nothing, and forgets after clear or compact. This hands the essentials back.', 'المساعد يبدأ كل جلسة وهو ما يعرف أي شي، وينسى بعد clear أو compact. هالحارس يرجّعله الأساسيات.'),
  UserPromptSubmit: t('Short requests are ambiguous, and the assistant does not always notice the skill that fits. This names it before work starts.', 'الطلبات القصيرة مو واضحة، والمساعد مو دايماً ينتبه للمهارة المناسبة. هالحارس يسمّيها قبل ما يبدأ الشغل.'),
  PreToolUse: t('An instruction can be forgotten. A refusal before the tool runs cannot, so the known dangerous actions are stopped here.', 'التعليمات ممكن تنتسى، بس الرفض قبل ما تشتغل الأداة ما ينتسى. لهذا الأوامر الخطرة المعروفة تنوقف هنا.'),
  PostToolUse: t('An error is cheapest to fix in the second it is written. This returns it to the assistant at once.', 'أرخص وقت تصلح بيه الخطأ هو نفس الثانية اللي انكتب بيها. هالحارس يرجّعه للمساعد فوراً.'),
  PostToolUseFailure: t('One failure is noise and five are a pattern. This keeps the record that shows the difference.', 'فشل واحد ممكن صدفة، بس خمسة يعني نمط. هالحارس يحتفظ بالسجل اللي يبيّن الفرق.'),
  SubagentStart: t('A subagent never sees the session’s opening briefing. Without this it would not know the branch rules, the live hosts or the mode.', 'الوكيل ما يشوف شرح بداية الجلسة أبداً. بدون هالحارس ما راح يعرف قواعد الفروع، ولا عناوين المواقع الحية، ولا النمط.'),
  SubagentStop: t('Broken code from an agent would spread into the main session. The agent has to face the typecheck first.', 'الكود الخربان من وكيل راح ينتشر بالجلسة الرئيسية. لازم الوكيل يعدّي فحص الأنواع أول.'),
  Notification: t('A long run waiting for your answer looks like one still working. An alert tells you which.', 'التشغيل الطويل اللي ينتظر جوابك يبين مثل اللي بعده يشتغل. التنبيه يعرّفك أي واحد بيهم.'),
  Stop: t('The assistant says done before it is. This makes it prove that with your own checks, then be read by another agent.', 'المساعد يقول خلصت قبل ما يخلص. هالحارس يلزمه يثبتها بفحوصك أنت، وبعدين وكيل ثاني يقرأ الشغل.'),
  SessionEnd: t('Working files of old sessions would pile up in your project. This clears them.', 'ملفات الشغل من الجلسات القديمة تتكدس بمشروعك. هالحارس ينظفها.'),
}
