import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const build: Record<string, SkillGuide> = {
  'create-component': {
    plain: t(
      'The playbook the assistant follows whenever it makes a piece of interface: a button, card, dialog, badge or section. It stops the third copy of the same button from being written.',
      'الدليل الذي يتبعه المساعد كلما صنع قطعة واجهة: زراً أو بطاقة أو نافذة أو شارة أو قسماً. وهو ما يمنع كتابة نسخة ثالثة من الزر نفسه.',
    ),
    ask: [t('create a product card with image, price and an add button', 'أنشئ بطاقة منتج بصورة وسعر وزر إضافة'), t('extract this header into a component', 'استخرج هذا الرأس في مكوّن مستقل')],
    steps: [
      t('Looks for an existing component that already does the job.', 'يبحث عن مكوّن موجود يؤدي العمل.'),
      t('Decides where it belongs: inside the page, the feature, or the shared folder.', 'يقرر مكانه: داخل الصفحة أو الميزة أو المجلد المشترك.'),
      t('Writes it with your design tokens, mobile first and in both directions.', 'يكتبه برموز تصميمك، للجوال أولاً وبالاتجاهين.'),
      t('Runs typecheck and lint, then looks at it in both languages and sizes.', 'يشغّل فحص الأنواع والمدقّق، ثم يراجعه باللغتين والمقاسين.'),
    ],
    result: [
      t('One file with one named component, in the right folder', 'ملف واحد بمكوّن واحد في المجلد الصحيح'),
      t('Translated text and accessible markup', 'نصوص مترجمة وبنية سهلة الوصول'),
      t('A test when it has real behaviour', 'اختبار إن كان له سلوك حقيقي'),
    ],
    limits: [t('The component does not fetch data. That belongs to a hook.', 'المكوّن لا يجلب البيانات، فذلك عمل الـ hook.'), t('No hard-coded colours.', 'لا ألوان مكتوبة يدوياً.')],
    related: ['figma-match', 'create-hook', 'create-form'],
  },
  'create-form': {
    plain: t(
      'How the assistant builds anything a person types into: login, address, checkout, profile. Forms are where most small bugs hide, so this playbook is strict.',
      'كيف يبني المساعد كل ما يكتب فيه المستخدم: الدخول والعنوان والدفع والملف الشخصي. في النماذج تختبئ أغلب الأخطاء الصغيرة، لذلك هذا الدليل صارم.',
    ),
    ask: [t('create a login form with phone and OTP', 'أنشئ نموذج دخول بالهاتف ورمز التحقق'), t('add an address form with validation', 'أضف نموذج عنوان مع التحقق')],
    steps: [
      t('Writes one schema for the validation, and the type too where the project uses TypeScript.', 'يكتب مخططاً واحداً للتحقق، وهو النوع أيضاً حيث يستعمل المشروع TypeScript.'),
      t('Connects it to the form, with your existing field components.', 'يربطه بالنموذج وبحقولك الموجودة.'),
      t('Shows translated errors under each field and focuses the first wrong one.', 'يعرض الأخطاء مترجمة تحت كل حقل وينقل التركيز إلى أول حقل خاطئ.'),
      t('Blocks a double submit and tests the schema and the request.', 'يمنع الإرسال المزدوج ويختبر المخطط والطلب.'),
    ],
    result: [
      t('A schema, the form logic and the markup', 'مخطط ومنطق النموذج والواجهة'),
      t('Correct keyboards and autofill on phones', 'لوحة مفاتيح وتعبئة تلقائية صحيحة على الجوال'),
      t('Tests for valid and invalid input', 'اختبارات للمدخل الصحيح والخاطئ'),
    ],
    limits: [t('Does not add a form library without asking.', 'لا يضيف مكتبة نماذج دون سؤالك.')],
    related: ['create-hook', 'i18n-conventions', 'dash-create-crud'],
  },
  'create-hook': {
    plain: t(
      'Moves logic out of components. A hook, or a composable, rune or service in other stacks, is a reusable piece of behaviour, such as loading orders or running a whole page. This decides its shape and place.',
      'يُخرج المنطق من المكوّنات. الـ hook، أو ما يقابله في تقنيات أخرى، سلوك قابل لإعادة الاستعمال مثل تحميل الطلبات أو تشغيل صفحة كاملة. وهذا الدليل يحدد شكله ومكانه.',
    ),
    ask: [t('create a hook that loads the order details', 'أنشئ hook يحمّل تفاصيل الطلب'), t('move the logic out of this page', 'أخرج المنطق من هذه الصفحة')],
    steps: [
      t('Picks the kind: data, page or small utility.', 'يختار النوع: بيانات أو صفحة أو أداة صغيرة.'),
      t('For data, uses your data layer, and the one query-key factory where TanStack Query is installed.', 'للبيانات يستعمل طبقة بياناتك، ومصنع المفاتيح الواحد حيث تكون TanStack Query مثبّتة.'),
      t('For a page, validates the URL values and returns one object.', 'للصفحة يتحقق من قيم الرابط ويعيد كائناً واحداً.'),
      t('Tests it.', 'يختبره.'),
    ],
    result: [t('A named hook or equivalent, where your project keeps them', 'hook أو ما يقابله باسم واضح، حيث يحفظها مشروعك'), t('A test', 'اختبار')],
    limits: [t('Never fetches data in an effect when the project has a data layer.', 'لا يجلب البيانات داخل effect إن كان للمشروع طبقة بيانات.')],
    related: ['tanstack-query-key-conventions', 'create-component', 'refactor'],
  },
  'create-store': {
    plain: t(
      'For state that outlives one screen: theme, language, a cart, a draft. It first asks whether you need a store at all.',
      'للحالة التي تعيش أطول من شاشة: المظهر واللغة والسلة والمسودة. ويسأل أولاً هل تحتاج مخزناً أصلاً.',
    ),
    ask: [t('create a store for the cart', 'أنشئ مخزناً للسلة'), t('remember the sidebar state after reload', 'تذكّر حالة الشريط الجانبي بعد التحديث')],
    steps: [
      t('Rules out better homes: server cache, URL, form or local state.', 'يستبعد الأماكن الأنسب: ذاكرة الخادم أو الرابط أو النموذج أو الحالة المحلية.'),
      t('Writes it with the state tool you already have, and saves only what must survive a reload.', 'يكتبها بأداة الحالة الموجودة عندك، ويحفظ فقط ما يجب أن ينجو من التحديث.'),
      t('Adds its reset to sign-out and tests the actions.', 'يضيف تصفيره إلى تسجيل الخروج ويختبر أفعاله.'),
    ],
    result: [t('Shared state where your project keeps it', 'حالة مشتركة حيث يحفظها مشروعك'), t('A sign-out reset and tests', 'تصفير عند الخروج واختبارات')],
    limits: [t('Never saves tokens or copies server data into the store.', 'لا يحفظ الرموز السرية ولا ينسخ بيانات الخادم إلى المخزن.'), t('Does not add a state library without asking.', 'لا يضيف مكتبة حالة دون سؤالك.')],
    related: ['create-hook'],
  },
  'figma-match': {
    plain: t(
      'Turns a Figma link into code that looks like the frame. The design is the specification, so the assistant does not improve it.',
      'يحوّل رابط Figma إلى شيفرة تطابق الإطار. التصميم هو المواصفة، فلا يحسّنه المساعد من عنده.',
    ),
    ask: [t('build this like Figma: <link>', 'ابنِ هذا مثل Figma: <الرابط>'), t('the spacing is not the same as the design', 'المسافات لا تطابق التصميم')],
    steps: [
      t('Reads the frame: spacing, sizes, type, colours and states.', 'يقرأ الإطار: المسافات والمقاسات والخطوط والألوان والحالات.'),
      t('Maps each value to your tokens and reuses your components.', 'يربط كل قيمة برموزك ويعيد استعمال مكوّناتك.'),
      t('Compares screenshots on phone and desktop, in Arabic and English.', 'يقارن اللقطات على الجوال والحاسوب، بالعربية والإنجليزية.'),
      t('Fixes differences until none is left.', 'يصلح الفروق حتى لا يبقى شيء.'),
    ],
    result: [t('Interface that matches the frame', 'واجهة تطابق الإطار'), t('A list of any deliberate difference', 'قائمة بأي فرق مقصود')],
    limits: [t('Asks when a state is missing instead of inventing a design.', 'يسأل عند غياب حالة بدلاً من اختراع تصميم.')],
    related: ['create-component', 'live-check'],
    needs: t('The assistant needs access to Figma (the Figma plugin).', 'يحتاج المساعد صلاحية الوصول إلى Figma (إضافة Figma).'),
  },
  'frontend-design': {
    plain: t(
      'An original visual direction for a page that has no design, such as a landing page or a campaign. It is not for everyday product screens.',
      'اتجاه بصري أصيل لصفحة بلا تصميم، كصفحة هبوط أو حملة. وليس لشاشات المنتج اليومية.',
    ),
    ask: [t('design a new landing page, I want a fresh look', 'صمّم صفحة هبوط جديدة بمظهر مختلف'), t('make a bold campaign banner', 'اصنع لافتة حملة جريئة')],
    steps: [
      t('Understands the purpose and the audience.', 'يفهم الهدف والجمهور.'),
      t('Commits to one clear direction for type, layout and motion.', 'يلتزم باتجاه واحد للخط والتخطيط والحركة.'),
      t('Builds it through your fonts and design tokens.', 'يبنيه بخطوطك ورموز تصميمك.'),
    ],
    result: [t('Working code with a distinct look', 'شيفرة تعمل بمظهر مميز')],
    limits: [t('Stays inside your design system on product pages.', 'يبقى داخل نظام تصميمك في صفحات المنتج.')],
    related: ['ui-ux-pro-max', 'figma-match'],
  },
  'ui-ux-pro-max': {
    plain: t(
      'A searchable library of design ideas: styles, palettes, font pairs and UX guidelines. The assistant opens it when you ask for ideas.',
      'مكتبة أفكار تصميم قابلة للبحث: أساليب ولوحات ألوان وأزواج خطوط وإرشادات تجربة. يفتحها المساعد عندما تطلب أفكاراً.',
    ),
    ask: [t('any better idea for this empty page?', 'هل من فكرة أفضل لهذه الصفحة الفارغة؟'), t('how should this checkout look for better UX', 'كيف يكون شكل الدفع بتجربة أفضل')],
    steps: [
      t('Works out the product type and the problem.', 'يحدد نوع المنتج والمشكلة.'),
      t('Searches the catalogue.', 'يبحث في الفهرس.'),
      t('Suggests options, checked against accessibility and touch rules.', 'يقترح خيارات مفحوصة وفق قواعد الوصول واللمس.'),
    ],
    result: [t('Reasoned design options', 'خيارات تصميم معلّلة')],
    limits: [t('Suggestions never override your tokens, fonts or components.', 'الاقتراحات لا تتقدّم على رموزك وخطوطك ومكوّناتك.')],
    related: ['frontend-design', 'web-design-guidelines'],
    needs: t('Python 3, for its search tool.', 'Python 3 لأداة البحث.'),
  },
}
