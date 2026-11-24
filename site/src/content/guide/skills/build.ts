import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const build: Record<string, SkillGuide> = {
  'create-component': {
    plain: t(
      'The playbook the assistant follows whenever it makes a piece of interface: a button, card, dialog, badge or section. It stops the third copy of the same button from being written.',
      'الدليل اللي يمشي عليه المساعد كل ما يسوي قطعة واجهة: زر، بطاقة، نافذة، شارة أو قسم. وهو اللي يمنع تنكتب نسخة ثالثة من نفس الزر.',
    ),
    ask: [t('create a product card with image, price and an add button', 'سوّي بطاقة منتج فيها صورة وسعر وزر إضافة'), t('extract this header into a component', 'طلّع هذا الهيدر بمكوّن لحاله')],
    steps: [
      t('Looks for an existing component that already does the job.', 'يدوّر على مكوّن موجود يسوي نفس الشغل.'),
      t('Decides where it belongs: inside the page, the feature, or the shared folder.', 'يقرر وين مكانه: داخل الصفحة، أو الميزة، أو المجلد المشترك.'),
      t('Writes it with your design tokens, mobile first and in both directions.', 'يكتبه برموز تصميمك، للموبايل أول شي، وبالاتجاهين.'),
      t('Runs typecheck and lint, then looks at it in both languages and sizes.', 'يشغّل فحص الأنواع والمدقّق، وبعدين يشوفه باللغتين وبالمقاسين.'),
    ],
    result: [
      t('One file with one named component, in the right folder', 'ملف واحد فيه مكوّن واحد، بالمجلد الصح'),
      t('Translated text and accessible markup', 'نصوص مترجمة وبنية تناسب الكل'),
      t('A test when it has real behaviour', 'اختبار إذا عنده سلوك حقيقي'),
    ],
    limits: [t('The component does not fetch data. That belongs to a hook.', 'المكوّن ما يجيب بيانات، هذا شغل الـ hook.'), t('No hard-coded colours.', 'بلا ألوان مكتوبة يدوياً.')],
    related: ['figma-match', 'create-hook', 'create-form'],
  },
  'create-form': {
    plain: t(
      'How the assistant builds anything a person types into: login, address, checkout, profile. Forms are where most small bugs hide, so this playbook is strict.',
      'شلون يبني المساعد أي شي يكتب فيه المستخدم: الدخول، العنوان، الدفع، الملف الشخصي. أغلب الأخطاء الصغيرة تختبي بالنماذج، فهذا الدليل صارم.',
    ),
    ask: [t('create a login form with phone and OTP', 'سوّي نموذج دخول برقم الموبايل ورمز التحقق'), t('add an address form with validation', 'ضيف نموذج عنوان ويتحقق من الحقول')],
    steps: [
      t('Writes one schema for the validation, and the type too where the project uses TypeScript.', 'يكتب مخطط واحد للتحقق، ويطلع منه النوع إذا المشروع يستعمل TypeScript.'),
      t('Connects it to the form, with your existing field components.', 'يربطه بالنموذج، ويستعمل حقولك الموجودة.'),
      t('Shows translated errors under each field and focuses the first wrong one.', 'يطلّع الأخطاء مترجمة تحت كل حقل، وينقل التركيز لأول حقل غلط.'),
      t('Blocks a double submit and tests the schema and the request.', 'يمنع الإرسال مرتين، ويختبر المخطط والطلب.'),
    ],
    result: [
      t('A schema, the form logic and the markup', 'مخطط، ومنطق النموذج، والواجهة'),
      t('Correct keyboards and autofill on phones', 'كيبورد وتعبئة تلقائية صح على الموبايل'),
      t('Tests for valid and invalid input', 'اختبارات للإدخال الصح والغلط'),
    ],
    limits: [t('Does not add a form library without asking.', 'ما يضيف مكتبة نماذج بدون ما يسألك.')],
    related: ['create-hook', 'i18n-conventions', 'dash-create-crud'],
  },
  'create-hook': {
    plain: t(
      'Moves logic out of components. A hook, or a composable, rune or service in other stacks, is a reusable piece of behaviour, such as loading orders or running a whole page. This decides its shape and place.',
      'يطلّع المنطق من المكوّنات. الـ hook، أو اللي يقابله بتقنيات ثانية، سلوك تقدر تعيد استعماله، مثل تحميل الطلبات أو تشغيل صفحة كاملة. وهذا الدليل يحدد شكله ومكانه.',
    ),
    ask: [t('create a hook that loads the order details', 'سوّي hook يجيب تفاصيل الطلب'), t('move the logic out of this page', 'طلّع المنطق من هالصفحة')],
    steps: [
      t('Picks the kind: data, page or small utility.', 'يختار النوع: بيانات، صفحة، أو أداة صغيرة.'),
      t('For data, uses your data layer, and the one query-key factory where TanStack Query is installed.', 'للبيانات يستعمل طبقة بياناتك، ومصنع المفاتيح الوحيد إذا TanStack Query مثبّتة.'),
      t('For a page, validates the URL values and returns one object.', 'للصفحة يتأكد من قيم الرابط ويرجّع كائن واحد.'),
      t('Tests it.', 'يختبره.'),
    ],
    result: [t('A named hook or equivalent, where your project keeps them', 'hook أو اللي يقابله باسم واضح، وين ما يحطها مشروعك'), t('A test', 'اختبار')],
    limits: [t('Never fetches data in an effect when the project has a data layer.', 'ما يجيب البيانات داخل effect إذا المشروع عنده طبقة بيانات.')],
    related: ['tanstack-query-key-conventions', 'create-component', 'refactor'],
  },
  'create-store': {
    plain: t(
      'For state that outlives one screen: theme, language, a cart, a draft. It first asks whether you need a store at all.',
      'للحالة اللي تعيش أكثر من شاشة وحدة: المظهر، اللغة، السلة، المسودة. وأول شي يسأل: تحتاج مخزن أصلاً؟',
    ),
    ask: [t('create a store for the cart', 'سوّي مخزن للسلة'), t('remember the sidebar state after reload', 'خلّي الشريط الجانبي يتذكر حالته بعد التحديث')],
    steps: [
      t('Rules out better homes: server cache, URL, form or local state.', 'يتأكد أول ما في مكان أنسب: كاش السيرفر، الرابط، النموذج، أو الحالة المحلية.'),
      t('Writes it with the state tool you already have, and saves only what must survive a reload.', 'يكتبها بأداة الحالة اللي عندك، ويحفظ بس اللي لازم يبقى بعد التحديث.'),
      t('Adds its reset to sign-out and tests the actions.', 'يضيف تصفيرها لتسجيل الخروج، ويختبر أفعالها.'),
    ],
    result: [t('Shared state where your project keeps it', 'حالة مشتركة وين ما يحطها مشروعك'), t('A sign-out reset and tests', 'تصفير عند الخروج، واختبارات')],
    limits: [t('Never saves tokens or copies server data into the store.', 'ما يحفظ رموز سرية، وما ينسخ بيانات السيرفر للمخزن.'), t('Does not add a state library without asking.', 'ما يضيف مكتبة حالة بدون ما يسألك.')],
    related: ['create-hook'],
  },
  'figma-match': {
    plain: t(
      'Turns a Figma link into code that looks like the frame. The design is the specification, so the assistant does not improve it.',
      'يحوّل رابط Figma لكود يطابق الإطار. التصميم هو المواصفة، فالمساعد ما يحسّنه من عنده.',
    ),
    ask: [t('build this like Figma: <link>', 'سوّيه نفس Figma بالضبط: <الرابط>'), t('the spacing is not the same as the design', 'المسافات مو نفس التصميم')],
    steps: [
      t('Reads the frame: spacing, sizes, type, colours and states.', 'يقرا الإطار: المسافات، المقاسات، الخطوط، الألوان، والحالات.'),
      t('Maps each value to your tokens and reuses your components.', 'يربط كل قيمة برموزك، ويعيد استعمال مكوّناتك.'),
      t('Compares screenshots on phone and desktop, in Arabic and English.', 'يقارن لقطات الشاشة على الموبايل والكمبيوتر، بالعربي والإنجليزي.'),
      t('Fixes differences until none is left.', 'يصلّح الفروق لحد ما تخلص كلها.'),
    ],
    result: [t('Interface that matches the frame', 'واجهة تطابق الإطار'), t('A list of any deliberate difference', 'قائمة بأي فرق مقصود')],
    limits: [t('Asks when a state is missing instead of inventing a design.', 'إذا حالة ناقصة يسأل، بدل ما يخترع تصميم من عنده.')],
    related: ['create-component', 'live-check'],
    needs: t('The assistant needs access to Figma (the Figma plugin).', 'المساعد يحتاج وصول لـ Figma (إضافة Figma).'),
  },
  'frontend-design': {
    plain: t(
      'An original visual direction for a page that has no design, such as a landing page or a campaign. It is not for everyday product screens.',
      'اتجاه بصري جديد لصفحة ما عندها تصميم، مثل صفحة هبوط أو حملة. ومو لشاشات المنتج اليومية.',
    ),
    ask: [t('design a new landing page, I want a fresh look', 'صمّملي صفحة هبوط جديدة، أريد شكل جديد'), t('make a bold campaign banner', 'سوّي بانر حملة جريء')],
    steps: [
      t('Understands the purpose and the audience.', 'يفهم شنو الهدف، ومنو الجمهور.'),
      t('Commits to one clear direction for type, layout and motion.', 'يمشي على اتجاه واحد واضح للخط والتخطيط والحركة.'),
      t('Builds it through your fonts and design tokens.', 'يبنيه بخطوطك ورموز تصميمك.'),
    ],
    result: [t('Working code with a distinct look', 'كود يشتغل، بشكل مميز')],
    limits: [t('Stays inside your design system on product pages.', 'بصفحات المنتج يبقى داخل نظام تصميمك.')],
    related: ['ui-ux-pro-max', 'figma-match'],
  },
  'ui-ux-pro-max': {
    plain: t(
      'A searchable library of design ideas: styles, palettes, font pairs and UX guidelines. The assistant opens it when you ask for ideas.',
      'مكتبة أفكار تصميم تقدر تدوّر بيها: أساليب، لوحات ألوان، خطوط تناسب بعضها، وإرشادات للتجربة. المساعد يفتحها لما تطلب أفكار.',
    ),
    ask: [t('any better idea for this empty page?', 'عندك فكرة أحسن لهالصفحة الفاضية؟'), t('how should this checkout look for better UX', 'شلون نخلي شكل صفحة الدفع أحسن للمستخدم')],
    steps: [
      t('Works out the product type and the problem.', 'يحدد نوع المنتج، وشنو المشكلة.'),
      t('Searches the catalogue.', 'يدوّر بالفهرس.'),
      t('Suggests options, checked against accessibility and touch rules.', 'يقترح خيارات، مفحوصة على قواعد الوصول واللمس.'),
    ],
    result: [t('Reasoned design options', 'خيارات تصميم، وكل وحدة معها سببها')],
    limits: [t('Suggestions never override your tokens, fonts or components.', 'رموزك وخطوطك ومكوّناتك تبقى هي الأساس، والاقتراحات ما تغيّرها.')],
    related: ['frontend-design', 'web-design-guidelines'],
    needs: t('Python 3, for its search tool.', 'Python 3 لأداة البحث.'),
  },
}
