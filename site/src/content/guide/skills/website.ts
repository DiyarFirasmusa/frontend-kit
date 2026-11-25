import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const website: Record<string, SkillGuide> = {
  'web-create-feature': {
    plain: t(
      'Takes the endpoints of your backend (the addresses it offers for getting and sending data) and builds a whole part of a public website, from the data to the pages. Example: a blog with a list page and an article page.',
      'يأخذ الـ endpoints من الخادم (العناوين التي يقدمها لجلب البيانات وإرسالها) ويبني جزءا كاملا من موقع عام، من البيانات إلى الصفحات. مثال: مدونة فيها صفحة قائمة وصفحة مقال.',
    ),
    ask: [t('build the catalogue feature from this API', 'ابن ميزة الكتالوج من هذا الـ API'), t('new feature: blog list and article page', 'أريد ميزة جديدة: قائمة للمدونة وصفحة للمقال')],
    steps: [
      t('Collects the endpoints, the pages, and what must already be in the first HTML (the page as search engines first receive it).', 'يجمع الـ endpoints والصفحات وما يجب أن يكون موجودا في أول HTML (الصفحة كما تصل أول مرة إلى محركات البحث).'),
      t('Adds the endpoints, the names for loaded data, and the code that calls your backend.', 'يضيف الـ endpoints وأسماء البيانات المحملة والكود الذي يستدعي الخادم.'),
      t('Writes the page logic, the page containers and thin routes with head tags (the title and description of each page).', 'يكتب منطق الصفحات وحاوياتها ومسارات خفيفة فيها وسوم الرأس (عنوان كل صفحة ووصفها).'),
      t('Adds every language and tests, then verifies the result.', 'يضيف كل اللغات والاختبارات، ثم يتحقق من النتيجة.'),
    ],
    result: [t('A full feature folder', 'مجلد ميزة كامل'), t('Pages built on the server, with SEO (so that Google can read them)', 'صفحات تبنى على الخادم، مع SEO (ليستطيع Google قراءتها)')],
    limits: [t('Never fakes data your backend does not have. It tells you so.', 'لا يزيف بيانات ليست عند الخادم، بل يخبرك بذلك.')],
    related: ['web-create-route', 'web-seo-page', 'web-server-fn'],
  },
  'web-create-route': {
    plain: t('Adds one page to a website built with TanStack Start. The page is built on the server, so search engines read it correctly.', 'يضيف صفحة واحدة إلى موقع مبني بـ TanStack Start. تبنى الصفحة على الخادم، فتقرأها محركات البحث بشكل صحيح.'),
    ask: [t('add a product detail page by slug', 'أضف صفحة تفاصيل المنتج عبر الـ slug'), t('redirect the old URLs and show a real 404', 'حول الروابط القديمة وأظهر 404 حقيقية')],
    steps: [
      t('Decides the address, the layout, whether Google may list the page, and which data must be in the first HTML.', 'يحدد الرابط والتخطيط وهل يسمح لـ Google بإدراج الصفحة، وأي بيانات يجب أن تكون في أول HTML.'),
      t('Waits for the main data and sends the rest as it arrives.', 'ينتظر البيانات الأساسية ويرسل الباقي عند وصوله.'),
      t('Adds the title tags in the head, the “not found” page (404), redirects and every state.', 'يضيف وسوم العنوان في الرأس، وصفحة «غير موجود» (404)، والتحويلات، وكل الحالات.'),
      t('Links it from the rest of the site and updates the files search engines use to crawl it.', 'يربطها بباقي الموقع، ويحدث الملفات التي تستخدمها محركات البحث لزحفها.'),
    ],
    result: [t('A route (the page address and its logic), a loader (the code that gets its data), head tags and tests', 'مسار (عنوان الصفحة ومنطقها)، وloader (الكود الذي يجلب بياناتها)، ووسوم رأس، واختبارات')],
    limits: [t('Never edits the generated route tree (a file the tool writes for itself).', 'لا يعدل شجرة المسارات المولدة (ملف تكتبه الأداة لنفسها).')],
    related: ['web-seo-page', 'web-create-feature'],
  },
  'web-seo-page': {
    plain: t(
      'Makes one page look right in Google and in link previews on WhatsApp, Telegram, X and Facebook. SEO means helping people find your page in search.',
      'يجعل الصفحة تظهر بشكل صحيح في Google وفي معاينات الروابط على واتساب وتيليغرام وX وفيسبوك. وSEO معناها مساعدة الناس على إيجاد صفحتك في البحث.',
    ),
    ask: [t('the WhatsApp preview shows the wrong image', 'معاينة واتساب تعرض صورة خاطئة'), t('add SEO to the product page', 'أضف SEO إلى صفحة المنتج')],
    steps: [
      t('Decides what kind of page it is: home, list, detail, article or private.', 'يحدد نوع الصفحة: رئيسية أو قائمة أو تفاصيل أو مقال أو خاصة.'),
      t('Makes sure the data is ready on the server.', 'يتأكد أن البيانات جاهزة على الخادم.'),
      t('Writes the title, the description, the canonical address (the one official address of the page), the share tags and structured data (facts about the page written for search engines).', 'يكتب العنوان والوصف والـ canonical (العنوان الرسمي الوحيد للصفحة) ووسوم المشاركة والبيانات المنظمة (معلومات عن الصفحة مكتوبة لمحركات البحث).'),
      t('Updates the sitemap (the list of your pages for Google), marks private pages noindex (“do not list”), then tests the HTML.', 'يحدث خريطة الموقع (قائمة صفحاتك لـ Google)، ويضع noindex («لا تدرج») على الصفحات الخاصة، ثم يختبر الـ HTML.'),
    ],
    result: [t('Correct tags in both languages', 'وسوم صحيحة بكل اللغات'), t('A report of what you still need to check by hand', 'تقرير بما ما زلت تحتاج إلى فحصه بنفسك')],
    limits: [t('Never invents ratings or facts that are not on the page.', 'لا يخترع تقييمات ولا معلومات غير موجودة في الصفحة.')],
    related: ['web-create-route', 'performance'],
  },
  'web-server-fn': {
    plain: t('Code that runs only on the server, not in the visitor’s browser. Use it for secrets, cookies, or a backend that the browser is not allowed to reach.', 'كود يعمل على الخادم فقط، لا في متصفح الزائر. استخدمه للأسرار والكوكيز، أو لخادم لا يسمح للمتصفح بالوصول إليه.'),
    ask: [t('hide the API key behind a server function', 'أخف مفتاح الـ API خلف دالة خادم'), t('fix the “blocked by CORS” error by calling the API from the server', 'أصلح خطأ CORS باستدعاء الـ API من الخادم')],
    steps: [
      t('Checks that a server function is the right tool.', 'يتأكد أن دالة الخادم هي الأداة المناسبة.'),
      t('Checks the input and who is allowed to call it.', 'يتحقق من المدخلات ومن يحق له استدعاءها.'),
      t('Returns only safe results, with cache headers (instructions on how long to keep the answer).', 'يعيد نتائج آمنة فقط، مع رؤوس كاش (تعليمات عن مدة الاحتفاظ بالجواب).'),
      t('Tests it and searches the code sent to the browser for leaked secrets.', 'يختبرها ويبحث في الكود المرسل إلى المتصفح عن أي أسرار مسربة.'),
    ],
    result: [t('A server function with checked input, and tests', 'دالة خادم مدخلاتها مفحوصة، مع اختبارات')],
    limits: [t('Never returns raw backend errors, stack traces (technical error details) or tokens.', 'لا يعيد أخطاء الخادم الخام ولا الـ stack traces (تفاصيل تقنية للأخطاء) ولا الـ tokens.')],
    related: ['web-create-feature', 'create-form'],
  },
}
