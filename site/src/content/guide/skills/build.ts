import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const build: Record<string, SkillGuide> = {
  'create-component': {
    plain: t(
      'Builds one piece of your screens, such as a button, a card, a pop-up window or a section of a page. Before it makes a new piece, it checks whether you already have a similar one, so you do not end up with the same button three times.',
      'يبني جزءا واحدا من شاشاتك، مثل زر أو بطاقة أو نافذة منبثقة أو قسم في الصفحة. وقبل أن يصنع جزءا جديدا يتأكد هل عندك جزء مشابه، فلا يتكرر الزر نفسه ثلاث مرات.',
    ),
    ask: [t('create a product card with image, price and an add button', 'أنشئ بطاقة منتج فيها صورة وسعر وزر إضافة'), t('turn this header into its own reusable piece', 'اجعل هذا الهيدر جزءا مستقلا يمكن إعادة استخدامه')],
    steps: [
      t('Looks for a piece you already have that does the same job.', 'يبحث عن جزء موجود عندك يؤدي العمل نفسه.'),
      t('Decides where to put it: with one page, with one feature, or in the shared folder that everything can use.', 'يقرر أين يضعه: مع صفحة واحدة، أو مع ميزة واحدة، أو في المجلد المشترك الذي يستخدمه الجميع.'),
      t('Builds it with your own colours, fonts and spacing (called design tokens), starting from the phone size, and for both Arabic (right-to-left) and English.', 'يبنيه بألوانك وخطوطك ومسافاتك (وتسمى رموز التصميم)، ويبدأ من حجم الجوال، ويجعله يعمل بالعربية (من اليمين إلى اليسار) وبالإنجليزية.'),
      t('Checks the code for mistakes, then looks at the result in both languages and on small and big screens.', 'يفحص الكود بحثا عن أخطاء، ثم ينظر إلى النتيجة بالعربية والإنجليزية وعلى الشاشات الصغيرة والكبيرة.'),
    ],
    result: [
      t('One file with one clearly named piece, in the right folder', 'ملف واحد فيه جزء واحد باسم واضح، في المجلد الصحيح'),
      t('Text that is ready for translation, built so that screen readers can follow it', 'نصوص جاهزة للترجمة، وبناء يستطيع قارئ الشاشة متابعته'),
      t('A test (an automatic check) when the piece does something and does not only sit there', 'اختبار (فحص تلقائي) إذا كان الجزء يفعل شيئا ولا يكتفي بالظهور'),
    ],
    limits: [
      t('The piece does not load data by itself. That job belongs to a hook, a small reusable piece of logic.', 'الجزء لا يجلب البيانات بنفسه. هذه مهمة الـ hook، وهو قطعة صغيرة من المنطق يمكن إعادة استخدامها.'),
      t('No colours typed straight into the code. They come from your design tokens.', 'لا ألوان مكتوبة مباشرة في الكود. الألوان تأتي من رموز تصميمك.'),
    ],
    related: ['figma-match', 'create-hook', 'create-form'],
  },
  'create-form': {
    plain: t(
      'Builds anything a person types into: a sign-in form, an address, a checkout, a profile page. Many small bugs hide in forms, so the steps here are strict.',
      'يبني أي شيء يكتب فيه المستخدم: نموذج تسجيل الدخول، أو العنوان، أو الدفع، أو الملف الشخصي. أخطاء صغيرة كثيرة تختبئ في النماذج، لذلك هذه الخطوات صارمة.',
    ),
    ask: [t('create a login form with phone and OTP', 'أنشئ نموذج دخول برقم الجوال ورمز التحقق'), t('add an address form with validation', 'أضف نموذج عنوان مع التحقق من الحقول')],
    steps: [
      t('Writes the rules for each field in one place, for example “phone is required and has 10 digits”. This is called a schema. If your project uses TypeScript, it writes the matching type too.', 'يكتب قواعد كل حقل في مكان واحد، مثل «الجوال مطلوب ويتكون من 10 أرقام». وهذا يسمى schema. وإذا كان مشروعك يستخدم TypeScript يكتب معه النوع المناسب.'),
      t('Connects the rules to the form, using the input fields you already have.', 'يربط القواعد بالنموذج، ويستخدم حقول الإدخال الموجودة عندك.'),
      t('Shows an error under each wrong field, in the reader’s language, and moves the cursor to the first one.', 'يعرض تحت كل حقل خاطئ رسالة بلغة المستخدم، وينقل المؤشر إلى أول حقل خاطئ.'),
      t('Stops people from sending the form twice by accident, and tests the rules and the request.', 'يمنع إرسال النموذج مرتين بالخطأ، ويختبر القواعد والطلب.'),
    ],
    result: [
      t('The field rules, the form logic and the form itself', 'قواعد الحقول ومنطق النموذج والنموذج نفسه'),
      t('The right keyboard on phones (numbers for a phone field) and working autofill', 'لوحة المفاتيح المناسبة على الجوال (أرقام لحقل الجوال) وتعبئة تلقائية تعمل'),
      t('Tests with correct and with wrong input', 'اختبارات للمدخلات الصحيحة والخاطئة'),
    ],
    limits: [t('Does not add a new form tool to your project without asking you first.', 'لا يضيف أداة نماذج جديدة إلى مشروعك قبل أن يسألك.')],
    related: ['create-hook', 'i18n-conventions', 'dash-create-crud'],
  },
  'create-hook': {
    plain: t(
      'Moves the working logic out of the screen pieces into a reusable piece of its own, for example loading orders or running everything a page needs. In React this piece is called a hook (other tools call it a composable, a rune or a service). This skill decides what it looks like and where it goes.',
      'ينقل المنطق الذي يعمل خلف الشاشة إلى قطعة مستقلة يمكن إعادة استخدامها، مثل تحميل الطلبات أو تشغيل كل ما تحتاجه صفحة. وتسمى هذه القطعة في React: hook (وتسميها تقنيات أخرى composable أو rune أو service). هذه المهارة تحدد شكلها ومكانها.',
    ),
    ask: [t('create a hook that loads the order details', 'أنشئ hook يجلب تفاصيل الطلب'), t('move the logic out of this page', 'انقل المنطق خارج هذه الصفحة')],
    steps: [
      t('Picks the kind: loading data, running a page, or a small helper.', 'يختار النوع: تحميل بيانات، أو تشغيل صفحة، أو أداة مساعدة صغيرة.'),
      t('For data, it uses the way your project already loads data. If TanStack Query is installed (a tool that remembers loaded data), it also uses one single place that names every piece of loaded data.', 'للبيانات يستخدم الطريقة التي يحمل بها مشروعك بياناته. وإذا كانت TanStack Query مثبتة (وهي أداة تتذكر البيانات المحملة)، فهو يستخدم أيضا مكانا واحدا يسمي كل بيان محمل.'),
      t('For a page, it checks the values in the address (such as ?page=2) and hands the page one tidy object.', 'للصفحة يتحقق من القيم الموجودة في الرابط (مثل ‎?page=2) ويسلم الصفحة كائنا واحدا مرتبا.'),
      t('Tests it.', 'يختبره.'),
    ],
    result: [t('A clearly named hook, or its equivalent, in the folder where your project keeps them', 'hook باسم واضح، أو ما يشبهه، في المجلد الذي يضع فيه مشروعك هذه الملفات'), t('A test', 'اختبار')],
    limits: [t('If your project already has a way to load data, it does not load data in an effect (a bit of code that runs by itself after the screen shows).', 'إذا كان في مشروعك طريقة لجلب البيانات، فلا يجلبها داخل effect (قطعة كود تعمل وحدها بعد ظهور الشاشة).')],
    related: ['tanstack-query-key-conventions', 'create-component', 'refactor'],
  },
  'create-store': {
    plain: t(
      'Remembers things that must stay across screens: the theme (light or dark), the language, a shopping cart, a draft. The first thing it asks is whether you need a shared place to remember it at all.',
      'يتذكر ما يجب أن يبقى بين الشاشات: المظهر (فاتح أو داكن)، واللغة، وسلة الشراء، والمسودة. وأول سؤال له: هل تحتاج مكانا مشتركا للتذكر أصلا؟',
    ),
    ask: [t('create a store for the cart', 'أنشئ store للسلة'), t('remember the sidebar state after reload', 'اجعل الشريط الجانبي يتذكر حالته بعد إعادة التحميل')],
    steps: [
      t('First checks whether a simpler place fits better: data kept from your backend, the page address, the form itself, or one screen’s own memory.', 'يفحص أولا هل يناسبك مكان أبسط: بيانات محفوظة من الخادم، أو عنوان الصفحة، أو النموذج نفسه، أو ذاكرة شاشة واحدة.'),
      t('Writes it with the state tool you already have, and saves only what must still be there after the page reloads.', 'يكتبه بأداة الحالة الموجودة عندك، ويحفظ فقط ما يجب أن يبقى بعد إعادة تحميل الصفحة.'),
      t('Makes it reset when the user signs out, and tests the actions.', 'يجعله يعود إلى حالته الأولى عند تسجيل الخروج، ويختبر الإجراءات.'),
    ],
    result: [t('Shared memory in the folder where your project keeps it', 'ذاكرة مشتركة في المجلد الذي يضع فيه مشروعك هذه الملفات'), t('A reset on sign-out, and tests', 'إعادة ضبط عند الخروج، واختبارات')],
    limits: [t('Never saves tokens (secret keys that prove who a person is) in it, and never copies data from your backend into it.', 'لا يحفظ فيه الـ tokens (مفاتيح سرية تثبت هوية المستخدم)، ولا ينسخ إليه بيانات الخادم.'), t('Does not add a new tool for this without asking you first.', 'لا يضيف أداة جديدة لهذا الغرض قبل أن يسألك.')],
    related: ['create-hook'],
  },
  'figma-match': {
    plain: t(
      'Turns a Figma link into screens that look like the design. Figma is an app where designers draw screens. The design is the instruction, so the assistant does not try to improve it.',
      'يحول رابط Figma إلى شاشات تشبه التصميم. وFigma تطبيق يرسم فيه المصممون الشاشات. التصميم هو المرجع، لذلك لا يحاول المساعد تحسينه.',
    ),
    ask: [t('build this like Figma: <link>', 'ابن هذا مثل Figma تماما: <الرابط>'), t('the spacing is not the same as the design', 'المسافات لا تطابق التصميم')],
    steps: [
      t('Reads the design: gaps, sizes, text styles, colours and states (such as hover or disabled).', 'يقرأ التصميم: المسافات والأحجام وأنماط الخطوط والألوان والحالات (مثل التمرير بالمؤشر أو التعطيل).'),
      t('Matches each value to your own colours, fonts and spacing, and reuses the pieces you already have.', 'يربط كل قيمة بألوانك وخطوطك ومسافاتك، ويستخدم الأجزاء الموجودة عندك.'),
      t('Compares screenshots on phone and computer, in Arabic and English.', 'يقارن لقطات الشاشة على الجوال والحاسوب، بالعربية والإنجليزية.'),
      t('Fixes the differences until none is left.', 'يصلح الفروق حتى لا يبقى فرق.'),
    ],
    result: [t('Screens that match the design', 'شاشات تطابق التصميم'), t('A list of any difference made on purpose', 'قائمة بأي فرق مقصود')],
    limits: [t('Asks when a state is missing from the design instead of inventing one.', 'إذا نقصت حالة في التصميم، يسألك ولا يخترع تصميما.')],
    related: ['create-component', 'live-check'],
    needs: t('The assistant needs access to Figma (the Figma plugin).', 'يحتاج المساعد إلى الوصول إلى Figma (إضافة Figma).'),
  },
  'frontend-design': {
    plain: t(
      'Gives a new look to a page that has no design yet, such as a landing page (the first page visitors see) or a campaign page. It is not for the everyday screens of your product.',
      'يعطي مظهرا جديدا لصفحة ليس لها تصميم بعد، مثل صفحة هبوط (أول صفحة يراها الزائر) أو صفحة حملة. ولا تستخدمه لشاشات منتجك اليومية.',
    ),
    ask: [t('design a new landing page, I want a fresh look', 'صمّم صفحة هبوط جديدة، أريد شكلا مختلفا'), t('make a bold campaign banner', 'اعمل بانر جريئا للحملة')],
    steps: [
      t('Understands the goal and who the visitors are.', 'يفهم الهدف ومن هم الزوار.'),
      t('Picks one clear direction for fonts, layout and movement.', 'يختار اتجاها واحدا واضحا للخطوط والتخطيط والحركة.'),
      t('Builds it with your fonts and your design tokens (your saved colours and spacing).', 'يبنيه بخطوطك ورموز تصميمك (ألوانك ومسافاتك المحفوظة).'),
    ],
    result: [t('Working code with a look of its own', 'كود يعمل بمظهر مميز')],
    limits: [t('On product pages it stays inside your own design.', 'في صفحات المنتج يبقى داخل تصميمك أنت.')],
    related: ['ui-ux-pro-max', 'figma-match'],
  },
  'ui-ux-pro-max': {
    plain: t(
      'A library of design ideas you can search: styles, colour sets, font pairs and tips for making things easy to use (this is what UX means). The assistant opens it when you ask for ideas.',
      'مكتبة أفكار تصميم يمكنك البحث فيها: أنماط ومجموعات ألوان وأزواج خطوط ونصائح لجعل الأشياء سهلة الاستخدام (وهذا معنى UX). يفتحها المساعد عندما تطلب أفكارا.',
    ),
    ask: [t('any better idea for this empty page?', 'هل عندك فكرة أفضل لهذه الصفحة الفارغة؟'), t('how should this checkout look for better UX', 'كيف تكون صفحة الدفع هذه أفضل لتجربة المستخدم؟')],
    steps: [
      t('Works out what kind of product it is and what the problem is.', 'يحدد نوع المنتج وما المشكلة.'),
      t('Searches the library.', 'يبحث في المكتبة.'),
      t('Suggests options, after checking them against accessibility (can everyone use it?) and touch rules (are buttons big enough for a finger?).', 'يقترح خيارات بعد فحصها بقواعد سهولة الوصول (هل يستطيع الجميع استخدامها؟) وقواعد اللمس (هل الأزرار كبيرة بما يكفي للإصبع؟).'),
    ],
    result: [t('Design options, each with its reason', 'خيارات تصميم مع أسبابها')],
    limits: [t('Suggestions never override your colours, fonts or pieces.', 'الاقتراحات لا تغير ألوانك ولا خطوطك ولا أجزاءك.')],
    related: ['frontend-design', 'web-design-guidelines'],
    needs: t('Python 3 (a programming tool that must be on your computer), for its search.', 'يحتاج إلى Python 3 (أداة برمجة يجب أن تكون على جهازك) لعمل البحث.'),
  },
}
