import type { Bilingual } from '../catalogue.ts'
import { t } from '../guide/text.ts'

/** One thing that appears in the chat window, in the order it happens. */
export type ChatEvent =
  | { kind: 'user'; text: Bilingual | string; command?: boolean }
  | { kind: 'claude'; text: Bilingual }
  | { kind: 'tool'; text: Bilingual; mark?: 'ok' | 'bad'; detail?: Bilingual | string }
  | { kind: 'ask'; question: Bilingual; options: Bilingual[]; picked: number }
  | { kind: 'ready'; title: Bilingual; text: Bilingual }
  /** A card Claude draws inside the chat, like the visuals of the Claude app: the plan, then the build as it runs. */
  | { kind: 'visual'; show: 'plan' | 'build' | 'todo' }

/** The words inside the cards Claude draws in the opening chat. */
export const visualWords = {
  plan: t('Project plan', 'خطة المشروع'),
  drawn: t('Visual', 'رسم'),
  signIn: t('Sign-in', 'تسجيل الدخول'),
  pages: [t('Orders', 'الطلبات'), t('Customers', 'العملاء'), t('Products', 'المنتجات')],
  chips: [t('Arabic · English', 'العربية · English'), t('Light · Dark', 'فاتح · داكن'), t('Phone · Computer', 'هاتف · حاسوب')],
  build: t('Building your project', 'يبني مشروعك'),
  files: ['app/orders/page.tsx', 'app/customers/page.tsx', 'app/products/page.tsx', 'app/sign-in/page.tsx', 'messages/ar.json'],
  counts: [t('14 files', '14 ملفا'), t('38 tests', '38 اختبارا'), t('0 errors', '0 أخطاء')],
  kpis: [
    { label: t('Orders today', 'طلبات اليوم'), value: '128', trend: '+12%' },
    { label: t('Being prepared', 'قيد التجهيز'), value: '14', trend: '−3' },
    { label: t('Delivered', 'تم التسليم'), value: '96%', trend: '+2%' },
  ],
  week: [t('Sat', 'سبت'), t('Sun', 'أحد'), t('Mon', 'إثنين'), t('Tue', 'ثلاثاء'), t('Wed', 'أربعاء'), t('Thu', 'خميس'), t('Fri', 'جمعة')],
  rows: [
    { who: t('Sara', 'سارة'), what: t('3 items', '3 قطع'), state: t('Delivered', 'تم التسليم'), tone: 'ok' },
    { who: t('Ali', 'علي'), what: t('1 item', 'قطعة واحدة'), state: t('Preparing', 'قيد التجهيز'), tone: 'wait' },
    { who: t('Noor', 'نور'), what: t('5 items', '5 قطع'), state: t('Delivered', 'تم التسليم'), tone: 'ok' },
  ],
  todo: t('Tasks', 'المهام'),
  tasks: [t('Pages for orders, customers and products', 'صفحات الطلبات والعملاء والمنتجات'), t('Sign-in screen', 'شاشة الدخول'), t('Arabic and English', 'العربية والإنجليزية'), t('Tests and review', 'الاختبارات والمراجعة')],
  modes: [t('Chat', 'Chat'), t('Code', 'Code')],
  folder: '~/my-shop',
  branch: 'main',
  permission: t('Asks before acting', 'يسأل قبل التنفيذ'),
  report: t('Checked: 0 errors · 38 tests passed', 'فُحصت: 0 أخطاء · 38 اختبارا ناجحا'),
}

const yesStart = t('Yes, start', 'نعم، ابدأ')
const notYet = t('Not yet', 'ليس الآن')

/** The words around the window. */
export const chatWords = {
  title: t('my-shop', 'my-shop'),
  reply: t('Reply to Claude…', 'رد على Claude…'),
  working: t('Working…', 'يعمل…'),
  model: 'Opus 5.5',
  pause: t('Pause animations', 'أوقف الحركة'),
  play: t('Play the demo', 'شغّل العرض'),
  /** What a screen reader hears instead of the moving chat. */
  summary: t(
    'A short demo of the Claude app: you send one message, Claude installs Wajiha Kit, asks you a few plain questions, then builds your project and checks it.',
    'عرض قصير من تطبيق Claude: ترسل رسالة واحدة، فيثبّت Claude إضافة واجهة، ويسألك بضعة أسئلة بسيطة، ثم يبني مشروعك ويفحصه.',
  ),
}

/** The opening screen: from installing the kit to a working project, as it really goes. */
export const firstRun: ChatEvent[] = [
  { kind: 'user', text: t('Please install the Wajiha Kit plugin for this project. First check that jq, Node and git are installed. Then start setting it up.', 'من فضلك ثبّت إضافة Wajiha Kit لهذا المشروع. تحقق أولا أن ⁦jq⁩ و⁦Node⁩ و⁦git⁩ مثبّتة، ثم ابدأ بتجهيزه.') },
  { kind: 'tool', text: t('Added the kit’s source', 'أضفت مصدر الإضافة'), mark: 'ok' },
  { kind: 'tool', text: t('Installed Wajiha Kit', 'ثبّتُّ واجهة'), mark: 'ok' },
    { kind: 'claude', text: t('Let’s set up your project. A few quick questions, nothing technical.', 'لنجهز مشروعك. بضعة أسئلة سريعة، ولا شيء تقني.') },
  {
    kind: 'ask',
    question: t('What are we building?', 'ماذا سنبني؟'),
    options: [t('A dashboard', 'لوحة تحكم'), t('A website', 'موقع'), t('Both', 'الاثنان')],
    picked: 0,
  },
  { kind: 'claude', text: t('Tell me about your project: what it contains and what people can do in it.', 'حدّثني عن مشروعك: ماذا يحتوي، وماذا يستطيع الناس أن يفعلوا فيه.') },
  { kind: 'user', text: t('My team sees the orders, changes their status, and manages customers and products.', 'يرى فريقي الطلبات ويغير حالتها، ويدير العملاء والمنتجات.') },
  {
    kind: 'ask',
    question: t('Do you have a design?', 'هل عندك تصميم؟'),
    options: [t('Yes, a Figma link or pictures', 'نعم، رابط Figma أو صور'), t('A site I like', 'موقع يعجبني'), t('Not yet', 'ليس بعد')],
    picked: 1,
  },
  {
    kind: 'ask',
    question: t('Which languages?', 'أي لغات؟'),
    options: [t('Arabic', 'العربية'), t('English', 'الإنجليزية'), t('Both', 'الاثنتان')],
    picked: 2,
  },
  {
    kind: 'claude',
    text: t(
      'Here is the plan: a shop dashboard with orders, customers and products, in Arabic and English, light and dark. Shall I start?',
      'هذه الخطة: لوحة متجر فيها الطلبات والعملاء والمنتجات، بالعربية والإنجليزية، بوضع فاتح وداكن. هل أبدأ؟',
    ),
  },
  { kind: 'visual', show: 'plan' },
  { kind: 'user', text: yesStart },
  { kind: 'visual', show: 'todo' },
  { kind: 'visual', show: 'build' },
  { kind: 'ready', title: t('Your dashboard is ready', 'لوحتك جاهزة'), text: t('Open it in your browser and click around.', 'افتحها في المتصفح وتصفحها.') },
]

/** The section of steps: what the window shows at each one. */
export const stepChat: ChatEvent[][] = [
  [
    { kind: 'user', text: t('Please install the Wajiha Kit plugin for this project. First check that jq, Node and git are installed. Then start setting it up.', 'من فضلك ثبّت إضافة Wajiha Kit لهذا المشروع. تحقق أولا أن ⁦jq⁩ و⁦Node⁩ و⁦git⁩ مثبّتة، ثم ابدأ بتجهيزه.') },
    { kind: 'tool', text: t('Added the kit’s source', 'أضفت مصدر الإضافة'), mark: 'ok' },
    { kind: 'tool', text: t('Installed Wajiha Kit', 'ثبّتُّ واجهة'), mark: 'ok' },
      ],
  [
    { kind: 'claude', text: t('Let’s set up your project. A few quick questions.', 'لنجهز مشروعك. بضعة أسئلة سريعة.') },
    {
      kind: 'ask',
      question: t('What are we building?', 'ماذا سنبني؟'),
      options: [t('A dashboard', 'لوحة تحكم'), t('A website', 'موقع'), t('Both', 'الاثنان')],
      picked: 0,
    },
    { kind: 'claude', text: t('Tell me about your project: what it contains and what people can do in it.', 'حدّثني عن مشروعك: ماذا يحتوي، وماذا يستطيع الناس أن يفعلوا فيه.') },
    { kind: 'user', text: t('My team sees the orders, changes their status, and manages customers and products.', 'يرى فريقي الطلبات ويغير حالتها، ويدير العملاء والمنتجات.') },
  ],
  [
    {
      kind: 'claude',
      text: t('The plan: orders, customers and products, in Arabic and English. Shall I start?', 'الخطة: الطلبات والعملاء والمنتجات، بالعربية والإنجليزية. هل أبدأ؟'),
    },
    { kind: 'user', text: yesStart },
  ],
  [
    { kind: 'tool', text: t('Made the orders page', 'أنشأت صفحة الطلبات'), mark: 'ok' },
    { kind: 'tool', text: t('Made the customer details page', 'أنشأت صفحة تفاصيل العميل'), mark: 'ok' },
  ],
  [
    { kind: 'tool', text: t('Checked for mistakes: none', 'فحصت الأخطاء: لا شيء'), mark: 'ok' },
    { kind: 'tool', text: t('Ran the tests: all passed', 'أجريت الاختبارات: نجحت كلها'), mark: 'ok' },
    { kind: 'tool', text: t('A reviewer read the work', 'قرأ مراجع العمل'), mark: 'ok' },
  ],
  [
    { kind: 'ready', title: t('Your dashboard is ready', 'لوحتك جاهزة'), text: t('Open it in your browser and click around.', 'افتحها في المتصفح وتصفحها.') },
    { kind: 'ask', question: t('Save this version?', 'هل أحفظ هذه النسخة؟'), options: [t('Yes, save it', 'نعم، احفظها'), notYet], picked: 0 },
  ],
]
