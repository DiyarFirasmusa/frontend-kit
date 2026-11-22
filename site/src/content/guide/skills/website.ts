import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const website: Record<string, SkillGuide> = {
  'web-create-feature': {
    plain: t(
      'Takes backend endpoints and builds a whole part of a public website, from data to pages.',
      'يأخذ نقاط الخادم ويبني جزءاً كاملاً من موقع عام، من البيانات إلى الصفحات.',
    ),
    ask: [t('build the catalogue feature from this API', 'ابنِ ميزة الكتالوج من هذا الـ API'), t('new feature: blog list and article page', 'ميزة جديدة: قائمة المدونة وصفحة المقال')],
    steps: [
      t('Gathers endpoints, pages and what must be in the first HTML.', 'يجمع النقاط والصفحات وما يجب أن يكون في أول HTML.'),
      t('Adds endpoints, query keys, services and queries.', 'يضيف النقاط والمفاتيح والخدمات والاستعلامات.'),
      t('Writes hooks, containers and thin routes with head tags.', 'يكتب الـ hooks والحاويات ومسارات خفيفة بوسوم الرأس.'),
      t('Adds both languages and tests, then verifies.', 'يضيف اللغتين والاختبارات ثم يتحقق.'),
    ],
    result: [t('A full feature folder', 'مجلد ميزة كامل'), t('Server-rendered routes with SEO', 'مسارات من الخادم مع تحسين البحث')],
    limits: [t('Never fakes data the backend lacks. It says so.', 'لا يزيّف بيانات لا يوفرها الخادم، بل يصرّح بذلك.')],
    related: ['web-create-route', 'web-seo-page', 'web-server-fn'],
  },
  'web-create-route': {
    plain: t('Adds one page to a TanStack Start website, rendered on the server and correct for search engines.', 'يضيف صفحة إلى موقع TanStack Start، تُبنى على الخادم وصحيحة لمحركات البحث.'),
    ask: [t('add a product detail page by slug', 'أضف صفحة منتج بالرابط النصي'), t('redirect the old URLs and show a real 404', 'حوّل الروابط القديمة واعرض 404 حقيقية')],
    steps: [
      t('Decides the URL, layout, indexing and first-HTML data.', 'يحدد الرابط والتخطيط والفهرسة وبيانات أول HTML.'),
      t('Waits for the main data and streams the rest.', 'ينتظر البيانات الرئيسية ويبثّ الباقي.'),
      t('Adds head tags, 404, redirects and every state.', 'يضيف وسوم الرأس و404 والتحويلات وكل الحالات.'),
      t('Links it and updates the crawl files.', 'يربطها ويحدّث ملفات الزحف.'),
    ],
    result: [t('A route, loader, head and tests', 'مسار ومحمّل ورأس واختبارات')],
    limits: [t('Never edits the generated route tree.', 'لا يعدّل شجرة المسارات المولّدة.')],
    related: ['web-seo-page', 'web-create-feature'],
  },
  'web-seo-page': {
    plain: t(
      'Makes one page look right in Google and in link previews on WhatsApp, Telegram, X and Facebook.',
      'يجعل الصفحة تظهر صحيحة في Google وفي معاينات الروابط على واتساب وتيليغرام وX وفيسبوك.',
    ),
    ask: [t('the WhatsApp preview shows the wrong image', 'معاينة واتساب تعرض صورة خاطئة'), t('add SEO to the product page', 'أضف تحسين البحث لصفحة المنتج')],
    steps: [
      t('Classifies the page: home, list, detail, content or private.', 'يصنّف الصفحة: رئيسية أو قائمة أو تفاصيل أو محتوى أو خاصة.'),
      t('Makes the data available on the server.', 'يوفّر البيانات على الخادم.'),
      t('Writes title, description, canonical, share tags and structured data.', 'يكتب العنوان والوصف والرابط الرسمي ووسوم المشاركة والبيانات المنظّمة.'),
      t('Updates the sitemap, gives private pages noindex, then tests the HTML.', 'يحدّث خريطة الموقع ويضع noindex للصفحات الخاصة ثم يختبر الـ HTML.'),
    ],
    result: [t('Correct tags in both languages', 'وسوم صحيحة باللغتين'), t('A report of what still needs a manual check', 'تقرير بما يحتاج فحصاً يدوياً')],
    limits: [t('Never invents ratings or facts that are not on the page.', 'لا يخترع تقييمات أو حقائق ليست في الصفحة.')],
    related: ['web-create-route', 'performance'],
  },
  'web-server-fn': {
    plain: t('Code that runs only on the server: for secrets, cookies or an API the browser cannot reach.', 'شيفرة تعمل على الخادم فقط: للأسرار والكوكيز أو API لا يصله المتصفح.'),
    ask: [t('hide the API key behind a server function', 'أخفِ مفتاح الـ API خلف دالة خادم'), t('fix CORS by calling the API from the server', 'حلّ CORS باستدعاء الـ API من الخادم')],
    steps: [
      t('Checks that a server function is the right tool.', 'يتأكد أن دالة الخادم هي الأداة الصحيحة.'),
      t('Validates input and checks who may call it.', 'يتحقق من المدخل وممّن يحق له الاستدعاء.'),
      t('Returns safe results and cache headers.', 'يعيد نتائج آمنة ورؤوس تخزين مناسبة.'),
      t('Tests it and searches the browser bundle for leaks.', 'يختبرها ويبحث في حزمة المتصفح عن تسريب.'),
    ],
    result: [t('A typed server function with tests', 'دالة خادم مضبوطة الأنواع مع اختبارات')],
    limits: [t('Never returns raw backend errors, stack traces or tokens.', 'لا يعيد أخطاء الخادم الخام ولا الرموز السرية.')],
    related: ['web-create-feature', 'create-form'],
  },
}
