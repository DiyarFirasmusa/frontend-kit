import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const website: Record<string, SkillGuide> = {
  'web-create-feature': {
    plain: t(
      'Takes backend endpoints and builds a whole part of a public website, from data to pages.',
      'ياخذ نقاط السيرفر ويبني جزء كامل من موقع عام، من البيانات للصفحات.',
    ),
    ask: [t('build the catalogue feature from this API', 'سوّي ميزة الكتالوج من هذا الـ API'), t('new feature: blog list and article page', 'أريد ميزة جديدة: قائمة للمدونة وصفحة للمقال')],
    steps: [
      t('Gathers endpoints, pages and what must be in the first HTML.', 'يجمع النقاط، والصفحات، وشنو لازم يكون بأول HTML.'),
      t('Adds endpoints, query keys, services and queries.', 'يضيف النقاط، ومفاتيح الاستعلام، والخدمات، والاستعلامات.'),
      t('Writes hooks, containers and thin routes with head tags.', 'يكتب الـ hooks، والحاويات، ومسارات خفيفة فيها وسوم الرأس.'),
      t('Adds both languages and tests, then verifies.', 'يضيف اللغتين والاختبارات، وبعدين يتأكد.'),
    ],
    result: [t('A full feature folder', 'مجلد ميزة كامل'), t('Server-rendered routes with SEO', 'مسارات تنبني على السيرفر، مع تحسين البحث')],
    limits: [t('Never fakes data the backend lacks. It says so.', 'ما يزيّف بيانات السيرفر ما يوفرها، يقولك بصراحة.')],
    related: ['web-create-route', 'web-seo-page', 'web-server-fn'],
  },
  'web-create-route': {
    plain: t('Adds one page to a TanStack Start website, rendered on the server and correct for search engines.', 'يضيف صفحة وحدة لموقع TanStack Start، تنبني على السيرفر وتطلع صح بمحركات البحث.'),
    ask: [t('add a product detail page by slug', 'ضيف صفحة منتج تنفتح بالـ slug'), t('redirect the old URLs and show a real 404', 'حوّل الروابط القديمة، وطلّع 404 حقيقية')],
    steps: [
      t('Decides the URL, layout, indexing and first-HTML data.', 'يحدد الرابط، والتخطيط، والفهرسة، وبيانات أول HTML.'),
      t('Waits for the main data and streams the rest.', 'ينتظر البيانات الأساسية، والباقي يبثه بعدين.'),
      t('Adds head tags, 404, redirects and every state.', 'يضيف وسوم الرأس، و404، والتحويلات، وكل الحالات.'),
      t('Links it and updates the crawl files.', 'يربطها ويحدّث ملفات الزحف.'),
    ],
    result: [t('A route, loader, head and tests', 'مسار، ومحمّل، ورأس، واختبارات')],
    limits: [t('Never edits the generated route tree.', 'ما يعدّل شجرة المسارات المولّدة.')],
    related: ['web-seo-page', 'web-create-feature'],
  },
  'web-seo-page': {
    plain: t(
      'Makes one page look right in Google and in link previews on WhatsApp, Telegram, X and Facebook.',
      'يخلّي الصفحة تطلع صح بـ Google وبمعاينات الروابط على واتساب وتيليغرام وX وفيسبوك.',
    ),
    ask: [t('the WhatsApp preview shows the wrong image', 'معاينة الواتساب تطلّع صورة غلط'), t('add SEO to the product page', 'ضيف SEO لصفحة المنتج')],
    steps: [
      t('Classifies the page: home, list, detail, content or private.', 'يصنّف الصفحة: رئيسية، قائمة، تفاصيل، محتوى، أو خاصة.'),
      t('Makes the data available on the server.', 'يخلّي البيانات موجودة على السيرفر.'),
      t('Writes title, description, canonical, share tags and structured data.', 'يكتب العنوان، والوصف، والرابط الرسمي، ووسوم المشاركة، والبيانات المنظّمة.'),
      t('Updates the sitemap, gives private pages noindex, then tests the HTML.', 'يحدّث خريطة الموقع، ويحط noindex للصفحات الخاصة، وبعدين يختبر الـ HTML.'),
    ],
    result: [t('Correct tags in both languages', 'وسوم صح باللغتين'), t('A report of what still needs a manual check', 'تقرير باللي باقي يحتاج فحص يدوي')],
    limits: [t('Never invents ratings or facts that are not on the page.', 'ما يخترع تقييمات أو معلومات مو موجودة بالصفحة.')],
    related: ['web-create-route', 'performance'],
  },
  'web-server-fn': {
    plain: t('Code that runs only on the server: for secrets, cookies or an API the browser cannot reach.', 'كود يشتغل على السيرفر بس: للأسرار، والكوكيز، أو API ما يوصله المتصفح.'),
    ask: [t('hide the API key behind a server function', 'خبّي مفتاح الـ API ورا دالة سيرفر'), t('fix CORS by calling the API from the server', 'صلّح مشكلة CORS، خلّي الـ API ينطلب من السيرفر')],
    steps: [
      t('Checks that a server function is the right tool.', 'يتأكد إن دالة السيرفر هي الأداة الصح.'),
      t('Validates input and checks who may call it.', 'يتحقق من المدخلات، ومنو يحق له يناديها.'),
      t('Returns safe results and cache headers.', 'يرجّع نتائج آمنة، ورؤوس كاش مناسبة.'),
      t('Tests it and searches the browser bundle for leaks.', 'يختبرها، ويدوّر بحزمة المتصفح على أي تسريب.'),
    ],
    result: [t('A typed server function with tests', 'دالة سيرفر مضبوطة الأنواع، مع اختبارات')],
    limits: [t('Never returns raw backend errors, stack traces or tokens.', 'ما يرجّع أخطاء السيرفر الخام، ولا الـ stack traces، ولا الرموز السرية.')],
    related: ['web-create-feature', 'create-form'],
  },
}
