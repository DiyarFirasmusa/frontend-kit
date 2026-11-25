import type { Bilingual } from '../catalogue.ts'
import type { ProfileId } from './projects.ts'
import { t } from './text.ts'

/** What can you build: one tab per kind, a short description, four things you get, and the address shown in the picture. */
export interface Feature {
  name: Bilingual
  text: Bilingual
}

export const showcase: { id: ProfileId; tab: Bilingual; title: Bilingual; text: Bilingual; features: Feature[]; say: Bilingual; url: string }[] = [
  {
    id: 'website',
    tab: t('Website', 'موقع'),
    title: t('Pages your visitors open', 'صفحات يفتحها زوارك'),
    text: t(
      'A shop, a company site, a blog or a list of your products. Anyone can open it from a link or a search, on a phone or a computer.',
      'متجر، أو موقع شركة، أو مدونة، أو قائمة بمنتجاتك. يفتحه أي شخص من رابط أو من البحث، على الهاتف أو الحاسوب.',
    ),
    features: [
      { name: t('Fast on phones', 'سريع على الهاتف'), text: t('Pages open quickly, even on a slow connection.', 'الصفحات تفتح بسرعة، حتى مع اتصال ضعيف.') },
      { name: t('Found in search', 'يظهر في البحث'), text: t('Search engines can read every page and show it.', 'تقرأ محركات البحث كل صفحة وتعرضها.') },
      { name: t('Links share with a picture', 'الروابط تظهر بصورة'), text: t('A shared link shows a title and an image in chat apps.', 'الرابط المشارك يظهر بعنوان وصورة في تطبيقات المحادثة.') },
      { name: t('Arabic and English', 'العربية والإنجليزية'), text: t('Both languages, with right-to-left done properly.', 'اللغتان معا، والكتابة من اليمين لليسار مضبوطة.') },
    ],
    say: t('“A shop for handmade soap, with a page for each product.”', '«متجر لصابون يدوي، وفيه صفحة لكل منتج».'),
    url: 'my-shop.com',
  },
  {
    id: 'dashboard',
    tab: t('Dashboard', 'لوحة تحكم'),
    title: t('A private place to run things', 'مكان خاص تدير فيه عملك'),
    text: t(
      'Orders, customers, products and reports, for you and your team. People sign in, and each one sees only what they are allowed to.',
      'الطلبات والعملاء والمنتجات والتقارير، لك ولفريقك. يسجل الناس الدخول، ويرى كل شخص ما يُسمح له به فقط.',
    ),
    features: [
      { name: t('Tables with search', 'جداول مع بحث'), text: t('Sort, search and filter, even with thousands of rows.', 'رتّب وابحث وصفِّ، حتى مع آلاف الصفوف.') },
      { name: t('Forms that check input', 'نماذج تتحقق من الإدخال'), text: t('Clear messages when something is missing or wrong.', 'رسائل واضحة عندما ينقص شيء أو يكون خطأ.') },
      { name: t('Sign-in and permissions', 'دخول وصلاحيات'), text: t('Each person sees only the pages and buttons for them.', 'يرى كل شخص الصفحات والأزرار التي تخصه فقط.') },
      { name: t('Numbers at a glance', 'أرقام بنظرة واحدة'), text: t('Totals and charts on the first page you open.', 'المجاميع والرسوم في أول صفحة تفتحها.') },
    ],
    say: t('“A page with my orders in a table, with filters.”', '«صفحة فيها طلباتي في جدول، مع فلاتر».'),
    url: 'admin.my-shop.com',
  },
  {
    id: 'fullstack',
    tab: t('Both', 'الاثنان'),
    title: t('Your website and its dashboard', 'موقعك ولوحة التحكم الخاصة به'),
    text: t(
      'The public pages and the place where you run them, in one project. What you change in the dashboard shows on the site.',
      'الصفحات العامة والمكان الذي تديرها منه، في مشروع واحد. ما تغيّره في اللوحة يظهر في الموقع.',
    ),
    features: [
      { name: t('Everything from both', 'كل ما في الاثنين'), text: t('All the website gets, and all the dashboard gets.', 'كل ما يحصل عليه الموقع، وكل ما تحصل عليه اللوحة.') },
      { name: t('One project', 'مشروع واحد'), text: t('One place to open, run and keep up to date.', 'مكان واحد تفتحه وتشغله وتحدّثه.') },
      { name: t('They stay in step', 'يبقيان متوافقين'), text: t('The same products, prices and texts in both.', 'المنتجات والأسعار والنصوص نفسها في الاثنين.') },
      { name: t('Each part its own way', 'لكل جزء طريقته'), text: t('The site stays fast for visitors; the dashboard stays private.', 'يبقى الموقع سريعا للزوار، وتبقى اللوحة خاصة.') },
    ],
    say: t('“A blog on the site, and a page in the dashboard where I write the posts.”', '«مدونة في الموقع، وصفحة في اللوحة أكتب فيها المقالات».'),
    url: 'my-shop.com/admin',
  },
]

/** The small live pictures on the six cards of the journey. */
export const journeyWords = {
  /** The six stops, two or three words each. */
  stops: [
    t('You send one message', 'ترسل رسالة'),
    t('You answer a few questions', 'تجيب عن أسئلة'),
    t('You say yes to the plan', 'توافق على الخطة'),
    t('Your project is built', 'يُبنى مشروعك'),
    t('It is checked', 'يُفحص كله'),
    t('You decide', 'القرار لك'),
  ],
  lead: t('This is how the kit works, from the first message to a project you can open. You never write code.', 'هكذا تعمل الإضافة، من أول رسالة إلى مشروع تفتحه وتتصفحه. ولا تكتب أي كود.'),
  /** What happens at each stop, one sentence each. */
  details: [
    t('In the Claude app you send one message. Claude installs the kit and starts the setup.', 'في تطبيق Claude ترسل رسالة واحدة. فيثبت Claude الإضافة ويبدأ الإعداد.'),
    t('What you are building, one sentence about it, the design, your backend link if you have one, and the languages.', 'ماذا تبني، وجملة عنه، والتصميم، ورابط الخادم إن كان عندك، واللغات.'),
    t('A short summary of the pages and the look. Nothing starts before your yes.', 'ملخص قصير بالصفحات والشكل. ولا يبدأ شيء قبل موافقتك.'),
    t('Pages, forms, tables and sign-in, with sample data so you can click through at once.', 'صفحات ونماذج وجداول وتسجيل دخول، ببيانات تجريبية لتتصفحها فورا.'),
    t('It looks for mistakes, runs tests, and a second reviewer reads the work. What fails is fixed first.', 'يبحث عن الأخطاء ويجري الاختبارات، ويقرأ مراجع ثان العمل. وما يفشل يُصلَح أولا.'),
    t('A short report and one question: save this version? Nothing leaves your computer without your yes.', 'تقرير قصير وسؤال واحد: هل أحفظ هذه النسخة؟ ولا يخرج شيء من جهازك دون موافقتك.'),
  ],
  install: t('Please install Wajiha Kit…', 'من فضلك ثبّت واجهة…'),
  ask: t('What are we building?', 'ماذا سنبني؟'),
  options: [t('Dashboard', 'لوحة تحكم'), t('Website', 'موقع'), t('Both', 'الاثنان')],
  plan: [t('Orders, customers, products', 'الطلبات والعملاء والمنتجات'), t('Arabic and English', 'العربية والإنجليزية'), t('Light and dark', 'فاتح وداكن')],
  start: t('Yes, start', 'نعم، ابدأ'),
  pages: [t('Orders page', 'صفحة الطلبات'), t('Customers page', 'صفحة العملاء'), t('Sign-in screen', 'شاشة الدخول')],
  checks: [t('Mistakes: none', 'الأخطاء: لا شيء'), t('Tests: passed', 'الاختبارات: نجحت'), t('Second reviewer: done', 'المراجع الثاني: تم')],
  save: t('Save this version?', 'هل أحفظ هذه النسخة؟'),
  yes: t('Yes', 'نعم'),
  no: t('Not yet', 'ليس الآن'),
}

/** The install panel. */
export const installWords = {
  title: t('Start in three steps', 'ابدأ بثلاث خطوات'),
  lead: t('Everything happens in the Claude app. You send one message, and Claude installs the kit for you.', 'كل شيء يحدث في تطبيق Claude. ترسل رسالة واحدة، ويثبت Claude الإضافة بنفسه.'),
  copy: t('Copy the message', 'انسخ الرسالة'),
  copied: t('Copied. Paste it in Claude', 'نُسخت. الصقها في Claude'),
  failed: t('Select it and copy', 'حدده وانسخه'),
  send: t('Paste it in the message box and press Enter.', 'الصقها في خانة الرسائل واضغط Enter.'),
  folder: t('Choose folder', 'اختر مجلدا'),
  reply: t('Reply to Claude…', 'رد على Claude…'),
  slash: t('Then type / and pick', 'ثم اكتب / واختر'),
  other: t('Already have a project, or an old one? Read how to start from it', 'عندك مشروع جاهز أو قديم؟ اقرأ كيف تبدأ منه'),
}

/** Why use the kit and not an AI on its own: two pictures of the result, then six gains. */
export interface Gain {
  name: Bilingual
  text: Bilingual
  instead: Bilingual
}

export const compare = {
  title: t('Why not just ask an AI?', 'لماذا لا تسأل الذكاء الاصطناعي وحده؟'),
  lead: t(
    'An AI on its own can write code. Wajiha Kit makes sure it is the right code, built the same good way every time.',
    'الذكاء الاصطناعي وحده يستطيع كتابة الكود. وواجهة تضمن أن يكون الكود الصحيح، مبنيا بالطريقة الجيدة نفسها في كل مرة.',
  ),
  without: t('AI on its own', 'الذكاء الاصطناعي وحده'),
  with: t('With Wajiha Kit', 'مع واجهة'),
  broken: t('Build failed · broken on phones', 'فشل البناء · مكسور على الهاتف'),
  fine: t('No mistakes · tests passed', 'لا أخطاء · نجحت الاختبارات'),
  instead: t('Instead of', 'بدلا من'),
  gains: <Gain[]>[
    {
      name: t('Plain questions only', 'أسئلة بسيطة فقط'),
      text: t('The setup is chosen for you, the way a good team would choose it.', 'يُختار الإعداد لك، كما يختاره فريق جيد.'),
      instead: t('questions about libraries and frameworks you do not know', 'أسئلة عن مكتبات وأطر عمل لا تعرفها'),
    },
    {
      name: t('One clear structure', 'هيكل واحد واضح'),
      text: t('Every file has its place, and it is the same every time.', 'لكل ملف مكانه، وهو نفسه في كل مرة.'),
      instead: t('a different layout every time you ask', 'ترتيب مختلف في كل مرة تطلب فيها'),
    },
    {
      name: t('Checked before “done”', 'يُفحص قبل «تم»'),
      text: t('It looks for mistakes and runs tests before it tells you it is finished.', 'يبحث عن الأخطاء ويجري الاختبارات قبل أن يخبرك أنه انتهى.'),
      instead: t('“done” while something is broken', '«تم» وهناك شيء معطل'),
    },
    {
      name: t('Nothing made twice', 'لا شيء يتكرر'),
      text: t('It finds the button you already have and uses it again.', 'يجد الزر الموجود عندك ويعيد استخدامه.'),
      instead: t('a third copy of the same button', 'نسخة ثالثة من الزر نفسه'),
    },
    {
      name: t('Arabic and phones from day one', 'العربية والهاتف من البداية'),
      text: t('Right to left and small screens work from the first page.', 'الكتابة من اليمين لليسار والشاشات الصغيرة تعمل من أول صفحة.'),
      instead: t('a layout that breaks in Arabic or on a phone', 'شكل ينكسر بالعربية أو على الهاتف'),
    },
    {
      name: t('Safe by default', 'آمن دائما'),
      text: t('Risky steps, like deleting work or publishing, are stopped until you say yes.', 'الخطوات الخطرة، مثل حذف العمل أو النشر، تتوقف حتى توافق.'),
      instead: t('a risky step run without asking', 'خطوة خطرة تُنفذ دون سؤال'),
    },
  ],
}
