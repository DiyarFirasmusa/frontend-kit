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
    why: t('Without clear steps the assistant builds a new button each time, in a different place and style. This skill makes it look for the existing button first, then build it the way your project already does things.', 'من دون خطوات واضحة يبني المساعد زرا جديدا في كل مرة، في مكان مختلف وبشكل مختلف. تجعله هذه المهارة يبحث أولا عن الزر الموجود، ثم يبني بالأسلوب الذي يتبعه مشروعك.'),
    when: t('Any new piece of the screen, even a small one: a button, a card, a menu. If you give a Figma link (a link to a design file), figma-match runs beside it.', 'أي جزء جديد من الشاشة، حتى لو كان صغيرا: زر أو بطاقة أو قائمة. وإذا أعطيت المساعد رابط Figma (رابط ملف تصميم)، تعمل figma-match معها.'),
  },
  'create-form': {
    why: t('Forms are where mistakes pile up: wrong input accepted, people who cannot use the form, and the same form sent twice. One recipe settles the rules for what people type, the labels, the error messages in each language, and a single send.', 'في النماذج تكثر الأخطاء: إدخال خاطئ يقبل، وأشخاص لا يستطيعون استعمال النموذج، وإرسال النموذج نفسه مرتين. وصفة واحدة تحدد قواعد فحص ما يكتبه الناس، والتسميات، ورسائل الخطأ بكل لغة، والإرسال مرة واحدة.'),
    when: t('Any screen where people type something: sign in, phone, code, address, profile, filters or an edit window.', 'أي شاشة يكتب فيها الناس شيئا: تسجيل الدخول أو الهاتف أو الرمز أو العنوان أو الملف الشخصي أو الفلاتر أو نافذة التعديل.'),
  },
  'create-hook': {
    why: t('Logic piles up inside the pieces of a screen until nobody can test it. This skill moves it into its own small reusable piece (a React “hook”), in the right place, with the right keys, safeguards and tests.', 'المنطق يتراكم داخل أجزاء الشاشة حتى يصعب اختباره. تنقله هذه المهارة إلى قطعة صغيرة مستقلة يمكن إعادة استخدامها (تسمى في React «hook»)، في المكان الصحيح، مع المفاتيح وشروط الحماية والاختبارات.'),
    when: t('Loading data, changing data, the logic of a page, a small helper, or a screen piece that is getting heavy.', 'تحميل بيانات، أو تعديل بيانات، أو منطق صفحة، أو أداة صغيرة مساعدة، أو جزء من الشاشة صار ثقيلا.'),
  },
  'create-store': {
    why: t('Information shared by the whole app is easy to add and hard to remove. This skill first asks whether you need a shared place for it at all, then handles saving it and clearing it when someone signs out.', 'المعلومات المشتركة بين كل التطبيق سهلة الإضافة وصعبة الحذف. تسأل هذه المهارة أولا: هل تحتاج إلى مكان مشترك لها أصلا؟ ثم تتولى حفظها وتنظيفها عند تسجيل الخروج.'),
    when: t('Information that must outlive one screen piece: a preference, the sign-in session, a cart, a draft, or data passed from one page to another.', 'معلومات يجب أن تعيش أطول من جزء واحد من الشاشة: تفضيل، أو جلسة الدخول، أو سلة، أو مسودة، أو بيانات تنتقل من صفحة إلى أخرى.'),
  },
  'figma-match': {
    why: t('“Close enough” is not what a designer handed over. This skill reads the design frame, maps it to your design values (colours, fonts, spacing) and compares the result with it.', '«قريب بما يكفي» ليس ما سلمه المصمم. تقرأ هذه المهارة إطار التصميم وتربطه بقيم التصميم في مشروعك (الألوان والخطوط والمسافات)، ثم تقارن النتيجة به.'),
    when: t('You give a Figma link (a link to a design file), or say the screen must look like the design.', 'تعطي المساعد رابط Figma (رابط ملف تصميم)، أو تقول إن الشاشة يجب أن تشبه التصميم.'),
  },
  'frontend-design': {
    why: t('Left alone, the assistant makes the same generic page every time. This skill makes it choose a clear look on purpose before it writes any code.', 'إذا تركته وحده يصنع المساعد الصفحة العامة نفسها كل مرة. تجعله هذه المهارة يختار شكلا واضحا عن قصد قبل أن يكتب أي كود.'),
    when: t('A brand-new page or section with no Figma frame, when you want a fresh look. Not for routine product screens.', 'صفحة أو قسم جديد تماما بلا إطار Figma، عندما تريد شكلا جديدا. ليست لشاشات المنتج العادية.'),
  },
  'ui-ux-pro-max': {
    why: t('Design advice from memory repeats itself. This skill searches a catalogue of styles, colour sets, font pairs and usability guidelines (how to make a screen easy to use) instead.', 'النصائح التصميمية من الذاكرة تتكرر. لذلك تبحث هذه المهارة في فهرس فيه الأساليب ومجموعات الألوان وأزواج الخطوط وإرشادات سهولة الاستخدام.'),
    when: t('You ask for ideas, alternatives or a better experience. Not when a design already exists.', 'تطلب أفكارا أو بدائل أو تجربة استخدام أفضل. لا تناسب حالة وجود تصميم جاهز.'),
  },
  'i18n-conventions': {
    why: t('i18n means making the app work in several languages. Translations go bad quietly: a missing language, a badly built key (the name each text is saved under), a key put together while the app runs. One fixed convention keeps every text easy to find and check.', 'i18n تعني أن يعمل التطبيق بعدة لغات. والترجمات تفسد بصمت: لغة ناقصة، أو مفتاح مبني بشكل سيئ (المفتاح هو الاسم الذي يحفظ به كل نص)، أو مفتاح يتكون أثناء تشغيل التطبيق. أسلوب ثابت واحد يجعل كل نص سهل الإيجاد والفحص.'),
    when: t('Any change to visible text, a translation file or a translation call.', 'أي تغيير في نص ظاهر أو ملف ترجمة أو استدعاء ترجمة.'),
  },
  'tanstack-query-key-conventions': {
    why: t('TanStack Query keeps saved copies of data from your backend, and finds each copy by a key. A key written by hand in each place is a mistake waiting to happen. One factory (a single place that makes all the keys) lets you mark a whole family of copies as outdated, so they reload, and it always works.', 'تحتفظ TanStack Query بنسخ محفوظة من بيانات الخادم الخلفي، وتجد كل نسخة بمفتاح. كتابة المفتاح يدويا في كل مكان خطأ ينتظر أن يقع. مصنع واحد (مكان واحد يصنع كل المفاتيح) يجعل تعليم مجموعة كاملة من النسخ على أنها قديمة، حتى تعاد تحميلها، يعمل دائما.'),
    when: t('Writing or reviewing anything that loads, changes, preloads or refreshes data with TanStack Query.', 'عند كتابة أو مراجعة أي كود يحمل البيانات أو يعدلها أو يجلبها مسبقا أو يحدثها باستخدام TanStack Query.'),
  },
  'typescript-advanced-types': {
    why: t('TypeScript describes what kind of data each part of the code expects. When that gets hard, it is tempting to write any (which switches the checking off) or to force a type with a cast. This reference shows the exact type to use instead.', 'تصف TypeScript نوع البيانات الذي يتوقعه كل جزء من الكود. وعندما يصعب ذلك، يغري كتابة any (التي توقف الفحص) أو فرض نوع بالقوة بما يسمى cast. يعرض هذا المرجع النوع الدقيق بدلا منهما.'),
    when: t('Advanced typing: types that depend on other types (generic, conditional or mapped types), or a reusable type helper.', 'كتابة أنواع متقدمة: أنواع تعتمد على أنواع أخرى (generic وconditional وmapped)، أو أداة أنواع تعيد استخدامها.'),
  },
  'dash-create-route': {
    why: t('An admin page is more than one file: a page address, a guard (a check on who may enter), a description of the search values it accepts, a data loader and a menu entry. If you forget one, data can leak or a link can break.', 'صفحة الإدارة أكثر من ملف واحد: عنوان للصفحة، وحارس (فحص لمن يحق له الدخول)، ووصف لقيم البحث التي تقبلها، ومحمل للبيانات، وعنصر في القائمة. إذا نسيت واحدا منها قد تتسرب البيانات أو ينكسر رابط.'),
    when: t('A new page, address, protected section or side menu entry in a dashboard.', 'صفحة جديدة أو عنوان جديد أو قسم محمي أو عنصر في القائمة الجانبية في لوحة التحكم.'),
  },
  'dash-create-table': {
    why: t('A table looks finished long before it is. This skill settles paging done by the server, sorting kept in the web address, the row actions, and all four states of a table (for example loading, empty and failed).', 'يبدو الجدول منتهيا قبل أن يكتمل بوقت طويل. تحدد هذه المهارة تقسيم الصفحات الذي يتم من الخادم، والترتيب المحفوظ في عنوان الصفحة، وإجراءات الصفوف، والحالات الأربع للجدول (مثل التحميل والفراغ والفشل).'),
    when: t('A list page, grid, columns, sorting, paging, row actions or selecting several rows.', 'صفحة قائمة، أو شبكة، أو أعمدة، أو ترتيب، أو تقسيم صفحات، أو إجراءات على الصفوف، أو تحديد عدة صفوف.'),
  },
  'dash-create-filter-bar': {
    why: t('Filters kept inside a screen piece vanish when the page reloads and cannot be shared. This skill keeps each filter in the web address (the URL), with a fixed type.', 'الفلاتر المحفوظة داخل جزء الشاشة تضيع عند تحديث الصفحة ولا يمكن مشاركتها. تضع هذه المهارة كل فلتر في عنوان الصفحة (الرابط)، بنوع محدد.'),
    when: t('Search, drop-down lists, a date range or a toolbar above a list.', 'بحث، أو قوائم اختيار، أو نطاق تواريخ، أو شريط أدوات فوق قائمة.'),
  },
  'dash-create-detail': {
    why: t('A page for one record mixes reading, tabs, changing its status and conflicts (two people changing it at once). This skill gives each one a fixed place.', 'صفحة السجل الواحد تجمع القراءة والتبويبات وتغيير الحالة والتعارضات (أن يعدله شخصان في الوقت نفسه). تعطي هذه المهارة كلا منها مكانا ثابتا.'),
    when: t('A details page for an order, a user or any record that has history, notes or a status.', 'صفحة تفاصيل لطلب أو مستخدم أو أي سجل فيه تاريخ أو ملاحظات أو حالة.'),
  },
  'dash-create-crud': {
    why: t('Create, edit and delete are repeated in every section, and each copy slowly drifts from the others. One recipe covers the form, the saved data, errors from the server, the confirmation and the permissions.', 'الإضافة والتعديل والحذف تتكرر في كل قسم، وتختلف كل نسخة عن غيرها مع الوقت. وصفة واحدة تغطي النموذج والبيانات المحفوظة وأخطاء الخادم والتأكيد والصلاحيات.'),
    when: t('Adding, editing, deleting, archiving or switching the status of an item in a dashboard.', 'إضافة عنصر في لوحة التحكم أو تعديله أو حذفه أو أرشفته أو تبديل حالته.'),
  },
  'dash-create-settings-form': {
    why: t('Settings are one record that several people may edit. This skill adds handling for two people editing at once, a warning about unsaved changes, and read-only sections.', 'الإعدادات سجل واحد قد يعدله أكثر من شخص. تضيف هذه المهارة معالجة تعديل شخصين في الوقت نفسه، وتنبيها عند وجود تغييرات غير محفوظة، وأقساما للقراءة فقط.'),
    when: t('A settings, preferences or profile page that edits one record.', 'صفحة إعدادات أو تفضيلات أو ملف شخصي تعدل سجلا واحدا.'),
  },
  'web-create-route': {
    why: t('A public page must be right in the very first response from the server: its data, its title, a real 404 page (page not found) and redirects. Code that only works inside the browser breaks that.', 'الصفحة العامة يجب أن تكون صحيحة من أول استجابة من الخادم: بياناتها وعنوانها وصفحة 404 حقيقية (الصفحة غير موجودة) والتحويلات. والكود الذي يعمل داخل المتصفح فقط يفسد ذلك.'),
    when: t('A new page or address, a page that depends on a slug (the readable end of an address), a 404, a redirect, or data that should be filled in on the server.', 'صفحة أو عنوان جديد، أو صفحة تعتمد على slug (الجزء المقروء في نهاية العنوان)، أو صفحة 404، أو تحويل، أو بيانات يجب أن تملأ من الخادم.'),
  },
  'web-create-feature': {
    why: t('Going from a backend address (an endpoint) to a finished page takes about 12 files. This skill writes all of them in the same shape every time, translations and tests included.', 'الطريق من عنوان في الخادم الخلفي (endpoint) إلى صفحة كاملة يمر بنحو 12 ملفا. تكتبها هذه المهارة كلها بالشكل نفسه كل مرة، مع الترجمات والاختبارات.'),
    when: t('You hand over an endpoint or an API description (the document that lists what your backend offers) and ask for the whole feature.', 'تعطي المساعد endpoint أو وصف API (الوثيقة التي تسرد ما يقدمه خادمك الخلفي) وتطلب الميزة كاملة.'),
  },
  'web-seo-page': {
    why: t('A page nobody can find, or one that shows the wrong picture when shared, fails quietly. SEO means helping search engines and chat apps understand your page. This skill covers every tag they read.', 'الصفحة التي لا يجدها أحد، أو تظهر بصورة خاطئة عند مشاركتها، تفشل بصمت. وSEO تعني مساعدة محركات البحث وتطبيقات المحادثة على فهم صفحتك. تغطي هذه المهارة كل وسم يقرؤونه.'),
    when: t('Any new public page, or a problem with titles, share previews, structured data (facts written for search engines), the sitemap (the list of your pages) or canonical links (the main address of a page).', 'أي صفحة عامة جديدة، أو مشكلة في العناوين أو معاينات المشاركة أو البيانات المنظمة (معلومات مكتوبة لمحركات البحث) أو خريطة الموقع (قائمة صفحاتك) أو روابط canonical (العنوان الرئيسي للصفحة).'),
  },
  'web-server-fn': {
    why: t('Secrets and cookies (small files that remember a visitor) must never reach the visitor’s browser. This skill puts them behind a function that runs on the server and checks both the input and the permission.', 'يجب ألا تصل الأسرار والكوكيز (ملفات صغيرة تتذكر الزائر) إلى متصفح الزائر أبدا. تضعها هذه المهارة خلف دالة تعمل على الخادم وتتحقق من المدخلات ومن الصلاحية.'),
    when: t('Hiding a key, reading the sign-in cookie, passing requests on to your backend, a webhook (a message another service sends to you) or a library that only works on the server.', 'إخفاء مفتاح، أو قراءة كوكي الجلسة، أو تمرير الطلبات إلى الخادم الخلفي، أو webhook (رسالة ترسلها خدمة أخرى إليك)، أو مكتبة تعمل على الخادم فقط.'),
  },
  task: {
    why: t('Work that starts on the wrong branch (a separate line of work) or ends without being checked costs you an extra review round. This skill runs a ticket from the branch to the final question.', 'العمل الذي يبدأ على فرع خاطئ (الفرع خط عمل منفصل) أو ينتهي بلا تحقق يكلفك جولة مراجعة إضافية. تنفذ هذه المهارة التذكرة من الفرع حتى السؤال الأخير.'),
    when: t('A new task or a link to a ticket. A single screen piece or a form has its own skill.', 'مهمة جديدة أو رابط تذكرة. أما الجزء الواحد من الشاشة أو النموذج الواحد فلكل منهما مهارته.'),
  },
  explain: {
    why: t('A question should get an answer, not an edit. This skill finds the real cause in the code and changes nothing.', 'السؤال يحتاج جوابا لا تعديلا. تجد هذه المهارة السبب الحقيقي في الكود ولا تغير شيئا.'),
    when: t('You ask why, how or which endpoint (backend address), or you need a note for someone else.', 'تسأل لماذا أو كيف أو أي endpoint (عنوان في الخادم الخلفي)، أو تحتاج ملاحظة لشخص آخر.'),
  },
  dev: {
    why: t('A busy port (the number the app listens on) or an old saved copy wastes minutes and leads to wrong conclusions. This skill checks first, then waits until the app answers.', 'منفذ مشغول (الرقم الذي يستمع عليه التطبيق) أو نسخة محفوظة قديمة يضيع دقائق ويعطي استنتاجات خاطئة. تفحص هذه المهارة أولا ثم تنتظر حتى يرد التطبيق.'),
    when: t('Starting, stopping or restarting the app, or when it shows old code.', 'تشغيل التطبيق أو إيقافه أو إعادة تشغيله، أو عندما يعرض كودا قديما.'),
  },
  refactor: {
    why: t('Cleaning up code is where behaviour breaks by accident. This skill moves code in safe steps and proves that nothing changed.', 'عند تنظيف الكود ينكسر السلوك بالخطأ. تنقل هذه المهارة الكود بخطوات آمنة وتثبت أن شيئا لم يتغير.'),
    when: t('A long file, repeated code, logic in the wrong place, or leftovers from a move to a new tool.', 'ملف طويل، أو كود مكرر، أو منطق في المكان الخطأ، أو بقايا من الانتقال إلى أداة جديدة.'),
  },
  'refactor-mode': {
    why: t('A whole old project cannot be fixed in one change. This skill (“fix an old project”) measures the project, then rebuilds it phase by phase with your approval.', 'لا يمكن إصلاح مشروع قديم كامل بتغيير واحد. تقيس هذه المهارة («إصلاح مشروع قديم») المشروع ثم تعيد بناءه مرحلة بعد مرحلة بموافقتك.'),
    when: t('An old project that is far from the standards. Only you can start it, by name.', 'مشروع قديم بعيد عن المعايير. وأنت وحدك تشغلها، باسمها.'),
  },
  'fix-everywhere': {
    why: t('The assistant fixes the one case you showed and leaves the rest. This skill finds them all and proves with a search that none are left.', 'يصلح المساعد الحالة الوحيدة التي أريتها له ويترك الباقي. تجد هذه المهارة كل الحالات، وتثبت بالبحث أنه لم تبق أي حالة.'),
    when: t('You say all, every or other pages, or a bug turns out to be a pattern that repeats.', 'تقول «الكل» أو «كل الصفحات» أو «باقي الصفحات»، أو يتضح أن الخلل نمط يتكرر.'),
  },
  performance: {
    why: t('Speed work without measuring is guesswork. This skill starts from a budget (limits you set) and real numbers from a slow phone.', 'تحسين السرعة بلا قياس مجرد تخمين. تبدأ هذه المهارة من ميزانية أداء (حدود تضعها) وأرقام حقيقية من هاتف بطيء.'),
    when: t('A slow page, a layout that jumps while loading, a falling Lighthouse score (Google’s speed grade) or a heavy new feature.', 'صفحة بطيئة، أو تخطيط يقفز أثناء التحميل، أو نتيجة Lighthouse تنخفض (Lighthouse تقييم السرعة من Google)، أو ميزة جديدة ثقيلة.'),
  },
  'vercel-react-best-practices': {
    why: t('React, the tool this kit uses to build screens, slows down in well-known ways. This skill is Vercel’s ordered list of those ways, so you can check your project against it.', 'React هي الأداة التي تبني بها الإضافة الشاشات، ولبطئها أسباب معروفة. هذه المهارة هي قائمة Vercel المرتبة لتلك الأسباب، لتفحص مشروعك بها.'),
    when: t('You ask for a React speed audit, or during a review. The performance skill comes first.', 'عندما تطلب فحص سرعة React، أو ضمن مراجعة. ومهارة performance تأتي أولا.'),
  },
  'web-design-guidelines': {
    why: t('A screen can work well and still break many small rules of good use. This skill checks your files against Vercel’s guidelines.', 'قد تعمل الشاشة جيدا وهي تخالف مع ذلك قواعد استخدام صغيرة كثيرة. تفحص هذه المهارة الملفات حسب إرشادات Vercel.'),
    when: t('You ask for an audit of an existing screen against good practice.', 'تطلب فحص شاشة موجودة حسب أفضل الممارسات.'),
  },
  'playwright-best-practices': {
    why: t('An end-to-end test clicks through the real app like a person. One that fails at random is worse than none, because people stop trusting it. This is the reference for writing stable ones with Playwright.', 'اختبار end-to-end يتنقل في التطبيق الحقيقي مثل شخص حقيقي. والاختبار الذي يفشل عشوائيا أسوأ من عدم وجوده، لأن الناس يتوقفون عن الثقة به. وهذا مرجع لكتابة اختبارات مستقرة بأداة Playwright.'),
    when: t('Writing, fixing or debugging Playwright tests of any kind.', 'كتابة أي اختبارات Playwright أو إصلاحها أو معرفة سبب فشلها.'),
  },
  verify: {
    why: t('“Done” without output is a claim. This skill runs every check and reports the real numbers.', '«انتهيت» بلا نتائج مجرد ادعاء. تشغل هذه المهارة كل الفحوص وتذكر الأرقام الحقيقية.'),
    when: t('Before saving a version of your work (a commit), or when you ask whether it works.', 'قبل حفظ نسخة من عملك (commit)، أو عندما تسأل هل يعمل.'),
  },
  review: {
    why: t('The author cannot see their own blind spots. Fresh specialists, who never saw the work being done, judge the standards and your request separately.', 'الكاتب لا يرى نقاطه العمياء. فيحكم مختصون جدد لم يروا العمل أثناء تنفيذه على المعايير وعلى طلبك، كل على حدة.'),
    when: t('Before saving a version of anything that is not trivial, or when you want another opinion.', 'قبل حفظ نسخة من أي تغيير ليس بسيطا، أو عندما تريد رأيا آخر.'),
  },
  'live-check': {
    why: t('Some bugs only show with a real sign-in in a real browser. This skill tests there, and never on the live site.', 'بعض الأخطاء لا تظهر إلا بتسجيل دخول حقيقي في متصفح حقيقي. تختبر هذه المهارة هناك، وليس على الموقع المباشر أبدا.'),
    when: t('A flow that needs a code, single sign-on (one login for many services) or a third party, on your own computer or on the test environment (a copy of the app used for testing).', 'مسار يحتاج إلى رمز، أو دخول موحد (تسجيل دخول واحد لعدة خدمات)، أو طرف ثالث، على جهازك أو في بيئة الاختبار (نسخة من التطبيق تستخدم للاختبار).'),
  },
  'commit-push': {
    why: t('Mistakes in git (the tool that stores the versions of your work) are visible to everyone. This skill saves a version (commits) only after your yes, only on the task’s own branch, and stops at a link.', 'أخطاء git (الأداة التي تخزن نسخ عملك) يراها الجميع. تحفظ هذه المهارة نسخة (commit) بعد موافقتك فقط، وعلى فرع المهمة فقط، وتتوقف عند الرابط.'),
    when: t('You say commit, push (upload), or yes to the question at the end of a task.', 'تقول «احفظ» (commit) أو «ارفع» (push)، أو توافق على السؤال في نهاية المهمة.'),
  },
  'pr-link': {
    why: t('Opening the pull request (a request to merge your changes into the main work) is your decision. This skill prepares everything up to the click.', 'فتح الـ pull request (طلب دمج تغييراتك في العمل الرئيسي) قرارك أنت. تجهز هذه المهارة كل شيء حتى لحظة الضغط.'),
    when: t('You ask for the link or a ready description to paste.', 'تطلب الرابط، أو وصفا جاهزا تلصقه.'),
  },
  'sync-main': {
    why: t('Rebasing (moving your work on top of the latest main version) blindly creates conflicts you did not expect. This skill shows what is coming before it touches anything.', 'عمل rebase (نقل عملك فوق آخر نسخة رئيسية) دون معرفة ما ينتظرك يسبب تعارضات لم تتوقعها. تريك هذه المهارة ما سيحدث قبل أن تغير أي شيء.'),
    when: t('The main branch has moved on, or you ask to update from it.', 'الفرع الرئيسي تغير، أو تطلب التحديث منه.'),
  },
  'branch-status': {
    why: t('You should know where your work stands without reading git output. This skill answers in plain words and changes nothing.', 'يجب أن تعرف أين وصل عملك دون قراءة مخرجات git. تجيبك هذه المهارة بكلمات بسيطة ولا تغير شيئا.'),
    when: t('You ask which branch you are on, whether it is uploaded (pushed), or what is left to save.', 'تسأل أي فرع أنت عليه، وهل تم رفعه (push)، وما الذي بقي دون حفظ.'),
  },
  'backend-request': {
    why: t('What the screens need from your backend gets lost in chat. This skill keeps one readable list in the project folder.', 'ما تحتاجه الشاشات من الخادم الخلفي يضيع في المحادثات. تحفظ هذه المهارة قائمة واحدة واضحة داخل مجلد المشروع.'),
    when: t('A backend address (endpoint) or field is missing, a response is wrong, or you need a message for the backend team.', 'عنوان (endpoint) أو حقل ناقص في الخادم الخلفي، أو استجابة خاطئة، أو تحتاج رسالة لفريق الـ backend.'),
  },
  setup: {
    why: t('A generic plugin would give generic advice. Setup looks at the tools your project uses and installs standards written for them.', 'الإضافة العامة تعطي نصائح عامة. أما الإعداد فيكتشف الأدوات التي يستخدمها مشروعك ويثبت معايير مكتوبة لها.'),
    when: t('Once in each project, and again to pick up new rules. Only you can start it.', 'مرة واحدة في كل مشروع، ومرة أخرى لجلب القواعد الجديدة. وأنت وحدك تشغله.'),
  },
  mode: {
    why: t('A release freeze or an urgent fix needs different limits from everyday work. Modes set how careful and how fast the assistant works. One switch changes them, and a safety check holds the part it is able to watch.', 'تجميد الإصدار أو الإصلاح العاجل يحتاج حدودا غير حدود العمل اليومي. الأنماط تحدد مدى حرص المساعد وسرعته. مفتاح واحد يغيرها، وفحص أمان يثبت الجزء الذي يستطيع مراقبته.'),
    when: t('Before a release, during an outage, for an audit where nothing may change (read-only), a prototype, or an app you only maintain. Only you switch it.', 'قبل الإصدار، أو أثناء عطل، أو لتدقيق لا يجوز فيه تغيير شيء (قراءة فقط)، أو لنموذج أولي، أو لتطبيق تكتفي بصيانته. وأنت وحدك تبدله.'),
  },
  'upgrade-mode': {
    why: t('A major upgrade fails quietly: the code builds with the new version’s interface (its API) while the behaviour changes. This skill proves each phase by comparing it with a recorded starting point.', 'الترقية الكبيرة تفشل بصمت: الكود يبنى مع واجهة النسخة الجديدة (الـ API) لكن السلوك يتغير. تثبت هذه المهارة كل مرحلة بمقارنتها بنقطة بداية مسجلة.'),
    when: t('A major new version of a framework or library (a tool your app is built on). A patch (a small fix release) or a single small bump is a normal task.', 'إصدار رئيسي جديد من إطار عمل أو مكتبة (أداة يبنى عليها تطبيقك). أما الـ patch (إصدار إصلاح صغير) أو ترقية صغيرة واحدة فهي مهمة عادية.'),
  },
}

export const agentPurpose: Record<string, Purpose> = {
  planner: {
    why: t('Specialists working at the same time collide unless someone first fixes the agreements between them and who owns each file. The planner does only that.', 'المختصون الذين يعملون معا يتصادمون ما لم يحدد أحد من البداية الاتفاق بينهم وصاحب كل ملف. والمخطط يفعل هذا فقط.'),
    when: t('A task big enough for a team of specialists, or for a long run without supervision.', 'مهمة كبيرة تكفي لفريق من المختصين، أو لتشغيل ذاتي طويل دون إشراف.'),
  },
  'frontend-dev': {
    why: t('A focused builder with a clean memory follows the rules more exactly than a long session does.', 'باني مركز بذاكرة نظيفة يلتزم بالقواعد أكثر من جلسة طويلة.'),
    when: t('One well-scoped change or package (a bundle of related work). It does not write the tests.', 'تغيير واحد محدد النطاق أو حزمة عمل واحدة. ولا يكتب الاختبارات.'),
  },
  'ui-designer': {
    why: t('A code review does not notice a weak visual order or uneven spacing. This specialist looks only at the design.', 'مراجعة الكود لا تلاحظ ضعف الترتيب البصري أو اختلاف المسافات. أما هذا المختص فينظر إلى التصميم فقط.'),
    when: t('The screen works but looks off, or before you ship a visible change.', 'الشاشة تعمل لكن شكلها غير مضبوط، أو قبل تسليم تغيير ظاهر.'),
  },
  'test-engineer': {
    why: t('Tests written by the author confirm what they meant, not what the code does. A separate writer finds more.', 'الاختبارات التي يكتبها المؤلف تؤكد ما قصده، لا ما يفعله الكود. وكاتب آخر يكتشف أكثر.'),
    when: t('After a change is built, or to fill gaps in coverage (the parts of the code no test touches).', 'بعد بناء التغيير، أو لسد النقص في التغطية (الأجزاء التي لا يلمسها أي اختبار).'),
  },
  'bug-hunter': {
    why: t('The first fix for a bug is often a patch over the symptom you can see. This specialist must name the root cause before proposing a fix.', 'أول إصلاح للخطأ غالبا ترقيع للمشكلة الظاهرة. وعلى هذا المختص أن يسمي السبب الجذري قبل أن يقترح إصلاحا.'),
    when: t('Something is broken and the cause is unknown.', 'شيء معطل وسببه مجهول.'),
  },
  'frontend-reviewer': {
    why: t('A reader who never saw the conversation judges only the code, the way a colleague would.', 'قارئ لم ير المحادثة يحكم على الكود وحده، مثل زميل.'),
    when: t('After the final checks (the quality gate) pass, or for any branch or diff (the list of changes) before you save a version.', 'بعد نجاح الفحوص الأخيرة (بوابة الجودة)، أو لأي فرع أو diff (قائمة التغييرات) قبل حفظ نسخة.'),
  },
  'accessibility-auditor': {
    why: t('People who use a keyboard or a screen reader (software that reads the screen aloud) are shut out by mistakes nobody else sees. This specialist checks for them.', 'أخطاء لا يراها غيرهم تمنع من يستخدمون لوحة المفاتيح أو قارئ الشاشة (برنامج يقرأ الشاشة بصوت عال) من استعمال الصفحة. هذا المختص يبحث عنها.'),
    when: t('Building or reviewing any page or screen piece that people use.', 'عند بناء أو مراجعة أي صفحة أو جزء من الشاشة يستخدمه الناس.'),
  },
  'performance-optimizer': {
    why: t('Speed problems stay hidden until real phones meet real networks. This specialist measures before it advises.', 'مشاكل السرعة تبقى مخفية حتى تلتقي هواتف حقيقية بشبكات حقيقية. هذا المختص يقيس قبل أن ينصح.'),
    when: t('A slow page, a falling score, or before you ship something heavy.', 'صفحة بطيئة، أو نتيجة تنخفض، أو قبل تسليم شيء ثقيل.'),
  },
  'refactor-architect': {
    why: t('Restructuring code across many files needs a map and an order, or the project fails to build for days.', 'إعادة ترتيب الكود في ملفات كثيرة تحتاج إلى خريطة وترتيب، وإلا بقي المشروع عاجزا عن البناء أياما.'),
    when: t('A restructure bigger than one screen piece, or moving a whole layer of the project.', 'إعادة ترتيب أكبر من جزء واحد من الشاشة، أو نقل طبقة كاملة من المشروع.'),
  },
  'qa-engineer': {
    why: t('Passing tests can still ship broken screens. This specialist opens every changed page in both languages, sizes and themes (light and dark).', 'قد تنجح الاختبارات وتصل مع ذلك شاشات معطلة. هذا المختص يفتح كل صفحة تغيرت في كل لغة وكل حجم وكل مظهر (فاتح وداكن).'),
    when: t('The last gate before you are asked to save a version.', 'آخر بوابة قبل أن يطلب منك حفظ نسخة.'),
  },
  'frontend-security-reviewer': {
    why: t('A leak or an open redirect (a link that can send visitors to any site) looks like normal code in a review. This specialist reports only what it can show an attack path for.', 'التسريب أو التحويل المفتوح (رابط يمكن أن يرسل الزوار إلى أي موقع) يبدو في المراجعة كأي كود عادي. ولا يبلغ هذا المختص إلا عن الثغرات التي يستطيع أن يبين لها طريق هجوم.'),
    when: t('Before a release, or when sign-in, redirects, secrets, headers (extra information sent with each page) or server code change.', 'قبل الإصدار، أو عند تغيير تسجيل الدخول أو التحويلات أو الأسرار أو الـ headers (معلومات إضافية ترسل مع كل صفحة) أو كود الخادم.'),
  },
  'i18n-rtl-reviewer': {
    why: t('A missing plural form or a margin fixed to the left or right is invisible to whoever does not read that language. This specialist compares the languages of the project with each other.', 'من لا يقرأ اللغة لا يرى صيغة جمع ناقصة أو هامشا ثابتا على اليسار أو اليمين. يقارن هذا المختص لغات المشروع بعضها ببعض.'),
    when: t('Text, translation files or text direction changed, in a project with several languages or a right-to-left (Arabic) one.', 'تغير نص أو ملفات ترجمة أو اتجاه الكتابة، في مشروع متعدد اللغات أو مشروع يكتب من اليمين إلى اليسار (العربية).'),
  },
  'upgrade-analyst': {
    why: t('An upgrade planned from memory misses silent changes. This specialist reads the official guides and maps them to your files.', 'ترقية مخططة من الذاكرة تفوتها التغييرات الصامتة. يقرأ هذا المختص الأدلة الرسمية ويربطها بملفاتك.'),
    when: t('Before a major upgrade. Not for a routine minor update.', 'قبل ترقية رئيسية. وليس لتحديث صغير عادي.'),
  },
  'seo-auditor': {
    why: t('A page can look perfect and still tell search engines to stay out. This specialist reads what a crawler (the program a search engine sends to read pages) receives.', 'قد تبدو الصفحة مثالية وهي تطلب من محركات البحث ألا تفهرسها. يقرأ هذا المختص ما يصل إلى الزاحف (البرنامج الذي يرسله محرك البحث ليقرأ الصفحات).'),
    when: t('A public page changed, or before a launch. Not for a dashboard that needs a sign-in.', 'تغيرت صفحة عامة، أو قبل الإطلاق. وليس للوحة تحكم تحتاج تسجيل دخول.'),
  },
}

export const rulePurpose: Record<string, Bilingual> = {
  'shared/accessibility.md': t('So the app works with a keyboard, with a screen reader and on a 320 pixel wide screen, in the places that usually get forgotten.', 'ليعمل التطبيق بلوحة المفاتيح وقارئ الشاشة وعلى عرض 320 بكسل، في الأماكن التي تنسى عادة.'),
  'shared/dependencies.md': t('So a package (a ready-made piece of code from other people) is checked before it runs on your machine and in your builds.', 'لتفحص الحزمة (قطعة كود جاهزة كتبها آخرون) قبل أن تعمل على جهازك وفي عمليات البناء.'),
  'shared/formatting.md': t('So an amount, a date or a search is right in every language and time zone.', 'ليظهر المبلغ والتاريخ والبحث صحيحا في كل لغة وكل منطقة زمنية.'),
  'shared/git.md': t('So branches, saved versions (commits) and pull requests stay under your control.', 'لتبقى الفروع والنسخ المحفوظة (commits) والـ pull requests تحت سيطرتك.'),
  'shared/i18n.md': t('So no language is left behind and every text can be found by its key.', 'حتى لا تتأخر أي لغة، ويسهل إيجاد كل نص بمفتاحه.'),
  'shared/naming.md': t('So the next person guesses a file’s name correctly the first time.', 'ليخمن من يأتي بعدك اسم الملف صحيحا من أول مرة.'),
  'shared/project.md': t('So facts only your team knows are not rediscovered or guessed in every session.', 'حتى لا يكتشف المساعد في كل جلسة ما يعرفه فريقك وحده، ولا يخمنه.'),
  'shared/quality-bar.md': t('So “done” means the same thing every time, with proof.', 'لتعني «انتهيت» الشيء نفسه في كل مرة، مع دليل.'),
  'shared/react.md': t('So screen pieces stay small, hooks (small reusable pieces of logic) stay correct and any session writes React the same way.', 'لتبقى أجزاء الشاشة صغيرة والـ hooks (قطع منطق صغيرة يعاد استخدامها) صحيحة، وتكتب كل جلسة React بالطريقة نفسها.'),
  'shared/rtl.md': t('So Arabic (right-to-left) and English are both right from the start, not patched afterwards.', 'ليعمل كل شيء صحيحا بالعربية (من اليمين إلى اليسار) والإنجليزية من أول البناء، لا بترقيع بعده.'),
  'shared/scope.md': t('So the assistant neither stops halfway nor changes what you never asked for.', 'حتى لا يتوقف المساعد في منتصف العمل، ولا يغير ما لم تطلبه.'),
  'shared/security.md': t('So what a user types cannot become a script, a redirect or a leaked token (a secret that proves who someone is).', 'حتى لا يتحول ما يكتبه المستخدم إلى سكربت أو تحويل أو token مسرب (سر يثبت من هو الشخص).'),
  'shared/styles.md': t('So colour, type and spacing come from your design system and layouts do not jump.', 'لتأتي الألوان والخطوط والمسافات من نظام التصميم عندك، ولا يقفز التخطيط.'),
  'shared/testing.md': t('So tests catch real breakage without becoming slow or flaky (failing at random).', 'لتكشف الاختبارات الأعطال الحقيقية دون أن تصبح بطيئة أو غير مستقرة (تفشل عشوائيا).'),

  'shared/typescript.md': t('So the type check (which looks for mistakes in the code) really checks, whatever the TypeScript version.', 'ليعمل فحص الأنواع (الذي يبحث عن أخطاء في الكود) فعلا مهما كان إصدار TypeScript.'),

  'website/api-layer.md': t('So the server and the browser call your backend (its API) safely, and an error is shown once.', 'ليستدعي الخادم والمتصفح الخادم الخلفي (الـ API) بأمان، ويظهر الخطأ مرة واحدة فقط.'),
  'website/data-loading.md': t('So data is in the first HTML the server sends and is never fetched twice.', 'لتكون البيانات في أول HTML يرسله الخادم، ولا تجلب مرتين أبدا.'),
  'website/performance.md': t('So speed on a cheap phone is a limit, not a hope.', 'لتكون السرعة على هاتف رخيص حدا ثابتا، لا أمنية.'),
  'website/routing-ssr.md': t('So every page address is built, redirected and fails correctly on the server.', 'ليعمل كل عنوان على الخادم بشكل صحيح، في العرض والتحويل والفشل.'),
  'website/seo-share.md': t('So each page can be found by search engines and looks right when shared.', 'ليسهل على محركات البحث إيجاد كل صفحة، وتظهر بشكل صحيح عند مشاركتها.'),

  'dashboard/api-layer.md': t('So one client owns tokens (secrets that prove who is signed in), errors and keys instead of every screen.', 'ليتولى عميل واحد الـ tokens (أسرار تثبت من سجل دخوله) والأخطاء والمفاتيح، بدل أن تتولاها كل شاشة.'),
  'dashboard/data-tables.md': t('So tables still work with a hundred thousand rows and a keyboard.', 'لتبقى الجداول تعمل مع مئة ألف صف ومع لوحة المفاتيح.'),
  'dashboard/error-monitoring.md': t('So errors in the live app reach you without leaking personal data.', 'لتصلك أخطاء التطبيق المنشور دون تسريب بيانات شخصية.'),
  'dashboard/forms-crud.md': t('So two admins editing at once, or a double click, cannot lose data.', 'حتى لا تضيع البيانات إذا عدّل أكثر من مدير في الوقت نفسه، أو ضغط أحدهم مرتين.'),
  'dashboard/permissions.md': t('So one list decides what each role sees and can do.', 'لتحدد قائمة واحدة ما يراه كل دور وما يقدر على فعله.'),
  'dashboard/routing.md': t('So protection holds and a list’s state survives a reload or a shared link.', 'لتصمد الحماية، وتبقى حالة القائمة بعد التحديث أو عبر رابط مشارك.'),

  'dashboard/variants/next/error-monitoring.md': t('So monitoring is right for both halves of a Next.js app: the server part and the browser part.', 'لتعمل المراقبة بشكل صحيح في جزئي تطبيق Next.js: جزء الخادم وجزء المتصفح.'),
  'dashboard/variants/next/routing.md': t('So guards and data loading follow Next.js, which has no beforeLoad.', 'لتتبع الحماية وتحميل البيانات طريقة Next.js، التي ليس فيها beforeLoad.'),
  'dashboard/variants/next/structure.md': t('So every shared rule knows where things live in a Next.js app.', 'لتعرف كل قاعدة مشتركة أين توجد الأشياء في تطبيق Next.js.'),
  'dashboard/variants/tanstack-start/framework.md': t('So the admin runs as a client app (it works inside the browser) on Start without hydration errors.', 'لتعمل لوحة الإدارة كتطبيق يعمل في المتصفح على Start دون أخطاء hydration (عدم تطابق ما يعرضه الخادم مع ما يعرضه المتصفح).'),
  'dashboard/variants/tanstack-start/structure.md': t('So every shared rule knows where things live on TanStack Start.', 'لتعرف كل قاعدة مشتركة أين توجد الأشياء في TanStack Start.'),

  'react/auth.md': t('So tokens (secrets that prove who is signed in), protection and sign-out are handled one way in any set of tools.', 'لتعالج الـ tokens (أسرار تثبت من سجل دخوله) والحماية وتسجيل الخروج بطريقة واحدة في أي مجموعة أدوات.'),
  'react/data-and-state.md': t('So data from the server and the state of the screen are never mixed up.', 'حتى لا تختلط بيانات الخادم بحالة الشاشة أبدا.'),
  'react/forms.md': t('So forms are labelled and checked, whatever library you use.', 'لتكون للنماذج تسميات وفحص لما يكتب، مهما كانت المكتبة.'),
  'react/nextjs.md': t('So Next.js server code is treated as public and cached data never crosses users.', 'ليعامل كود الخادم في Next.js على أنه عام، ولا تنتقل البيانات المخزنة في الكاش بين المستخدمين أبدا.'),
  'react/react-router.md': t('So a guard on a parent route really protects what is under it.', 'حتى تكون الحماية على المسار الأب فعلية لكل ما تحته.'),
  'react/routing.md': t('So pages follow the router (the part that matches addresses to pages) you really have, not the one the assistant assumes.', 'لتتبع الصفحات الـ router (الجزء الذي يربط العناوين بالصفحات) الموجود عندك فعلا، لا الذي يفترضه المساعد.'),
  'react/structure.md': t('So new code lands in a known shape, and restructuring has a target.', 'ليأتي الكود الجديد بشكل معروف، ويكون لإعادة الترتيب هدف واضح.'),
}

export const hookPurpose: Record<HookEvent, Bilingual> = {
  SessionStart: t('The assistant starts each session knowing nothing, and forgets after clear or compact (commands that wipe or shorten the conversation). This safety check hands the essentials back.', 'يبدأ المساعد كل جلسة دون أي معرفة، وينسى بعد clear أو compact (أمران يمسحان المحادثة أو يختصرانها). يعيد إليه فحص الأمان هذا الأساسيات.'),
  UserPromptSubmit: t('Short requests are ambiguous, and the assistant does not always notice the skill that fits. This safety check names it before work starts.', 'الطلبات القصيرة غير واضحة، والمساعد لا ينتبه دائما إلى المهارة المناسبة. يسميها فحص الأمان هذا قبل بدء العمل.'),
  PreToolUse: t('An instruction can be forgotten. A refusal before the assistant uses a tool cannot be, so the known dangerous actions are stopped here.', 'التعليمات قد تنسى، أما الرفض قبل أن يستخدم المساعد الأداة فلا ينسى. لذلك يوقف فحص الأمان هذا هنا الأوامر الخطرة المعروفة.'),
  PostToolUse: t('A mistake is cheapest to fix the second it is written. This safety check returns it to the assistant at once.', 'أرخص وقت لإصلاح الخطأ هو لحظة كتابته. يعيده فحص الأمان هذا إلى المساعد فورا.'),
  PostToolUseFailure: t('One failure is noise and five are a pattern. This safety check keeps the record that shows the difference.', 'فشل واحد قد يكون عابرا، وخمس مرات فشل تعني نمطا. يحتفظ فحص الأمان هذا بالسجل الذي يبين الفرق.'),
  SubagentStart: t('A specialist the assistant starts never sees the opening briefing of the session. Without this safety check it would not know the branch rules, the live sites or the mode.', 'المختص الذي يشغله المساعد لا يرى الشرح الذي بدأت به الجلسة. بدون فحص الأمان هذا لن يعرف قواعد الفروع ولا عناوين المواقع المباشرة ولا النمط.'),
  SubagentStop: t('Broken code from a specialist would spread into the main session. The specialist has to pass the code check (the typecheck) first.', 'كود معطوب من مختص سينتقل إلى الجلسة الرئيسية. لذلك على المختص أن يمر أولا بفحص الكود (فحص الأنواع).'),
  Notification: t('A long run waiting for your answer looks like one that is still working. An alert tells you which.', 'التشغيل الطويل الذي ينتظر جوابك يبدو وكأنه ما زال يعمل. والتنبيه يقول لك ما الذي يحدث.'),
  Stop: t('The assistant says it is done before it is. This safety check makes it prove that with your own checks, then have another specialist read its work.', 'يقول المساعد إنه انتهى قبل أن ينتهي فعلا. يجعله فحص الأمان هذا يثبت ذلك بفحوصك أنت، ثم يقرأ مختص آخر عمله.'),
  SessionEnd: t('Working files of old sessions would pile up in your project. This safety check clears them.', 'ملفات عمل الجلسات القديمة تتراكم في مشروعك. ينظفها فحص الأمان هذا.'),
}
