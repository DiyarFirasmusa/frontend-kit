import type { Bilingual } from '../catalogue.ts'
import { t } from '../guide/text.ts'

/** One thing that appears in the chat window, in the order it happens. */
export type ChatEvent =
  | { kind: 'user'; text: Bilingual | string; command?: boolean }
  | { kind: 'claude'; text: Bilingual }
  | { kind: 'tool'; text: Bilingual; mark?: 'ok' | 'bad'; detail?: Bilingual | string }
  | { kind: 'ask'; question: Bilingual; options: Bilingual[]; picked: number }
  | { kind: 'ready'; title: Bilingual; text: Bilingual }

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
  { kind: 'user', text: yesStart },
  { kind: 'tool', text: t('Made the pages and the sign-in screen', 'أنشأت الصفحات وشاشة الدخول'), mark: 'ok' },
  { kind: 'tool', text: t('Checked for mistakes: none', 'فحصت الأخطاء: لا شيء'), mark: 'ok' },
  { kind: 'tool', text: t('Ran the tests: all passed', 'أجريت الاختبارات: نجحت كلها'), mark: 'ok' },
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
