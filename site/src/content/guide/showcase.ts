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
      'A portfolio, a menu, a shop, a company site or a blog. You choose the colours and the logo. Once you put it online, anyone can open it from a link or a search, on a phone or a computer.',
      'معرض أعمال، أو قائمة طعام، أو متجر، أو موقع شركة، أو مدونة. تختار الألوان والشعار، وبعد أن تنشره يفتحه أي شخص من رابط أو من البحث، على الهاتف أو الحاسوب.',
    ),
    features: [
      { name: t('Fast on phones', 'سريع على الهاتف'), text: t('Pages are built to a speed budget for slow phones.', 'تُبنى الصفحات وفق حدود سرعة للهواتف البطيئة.') },
      { name: t('Found in search', 'يظهر في البحث'), text: t('Once it is online, search engines can read your pages and show them.', 'بعد نشره، تستطيع محركات البحث قراءة صفحاتك وعرضها.') },
      { name: t('Links share with a picture', 'الروابط تظهر بصورة'), text: t('A shared link shows a title and an image in chat apps.', 'الرابط المشارك يظهر بعنوان وصورة في تطبيقات المحادثة.') },
      { name: t('Arabic and English', 'العربية والإنجليزية'), text: t('Both languages, with right-to-left done properly.', 'اللغتان معا، والكتابة من اليمين إلى اليسار مضبوطة.') },
    ],
    say: t('“A shop for handmade soap, with a page for each product.”', '«متجر لصابون يدوي، وفيه صفحة لكل منتج».'),
    url: 'my-shop.com',
  },
  {
    id: 'dashboard',
    tab: t('Dashboard', 'لوحة تحكم'),
    title: t('A private place to run things', 'مكان خاص تدير فيه عملك'),
    text: t(
      'Orders, customers, products and reports, for you and your team. Each person sees only what they are allowed to. Without a backend (the program that stores your real data) it starts with sample data.',
      'الطلبات والعملاء والمنتجات والتقارير، لك ولفريقك. ويرى كل شخص ما يُسمح له به فقط. وبلا خادم خلفي (البرنامج الذي يحفظ بياناتك الحقيقية) تبدأ ببيانات تجريبية.',
    ),
    features: [
      { name: t('Tables with search', 'جداول مع بحث'), text: t('Sort, search and filter, even with thousands of rows.', 'ترتيب وبحث وتصفية، حتى مع آلاف الصفوف.') },
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
      'The public pages and the place where you run them, in one project: what you change in the dashboard shows on the site. Without a backend it starts with sample data.',
      'الصفحات العامة والمكان الذي تديرها منه في مشروع واحد: ما تغيّره في اللوحة يظهر في الموقع. وبلا خادم خلفي تبدأ ببيانات تجريبية.',
    ),
    features: [
      { name: t('Everything from both', 'كل ما في الاثنين'), text: t('All the website gets, and all the dashboard gets.', 'كل ما يحصل عليه الموقع، وكل ما تحصل عليه اللوحة.') },
      { name: t('One project', 'مشروع واحد'), text: t('One place to open, run and keep up to date.', 'مكان واحد تفتحه وتشغله وتحدّثه.') },
      { name: t('Same data in both', 'بيانات واحدة في الاثنين'), text: t('The same products, prices and texts in both.', 'المنتجات والأسعار والنصوص نفسها في الاثنين.') },
      { name: t('Fast site, private dashboard', 'موقع سريع ولوحة خاصة'), text: t('The site stays fast for visitors; the dashboard stays private.', 'يبقى الموقع سريعا للزوار، وتبقى اللوحة خاصة.') },
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
    t('Claude builds your project', 'يبني Claude مشروعك'),
    t('Claude checks it', 'يفحصه Claude'),
    t('You decide', 'القرار لك'),
  ],
  lead: t('This is how the kit works, from the first message to a project you can open. You do not need to write code. Questions may appear in a slightly different order.', 'هكذا تعمل الإضافة، من أول رسالة إلى مشروع تفتحه وتتصفحه. ولا تحتاج إلى كتابة أي كود. وقد يختلف ترتيب الأسئلة قليلا.'),
  /** What happens at each stop, one sentence each. */
  details: [
    t('In the Claude app you send one message. Claude installs the kit and starts the setup.', 'في تطبيق Claude ترسل رسالة واحدة. فيثبت Claude الإضافة ويبدأ الإعداد.'),
    t('What you are building, your project in your own words, the design, your backend description if you have one, and the languages.', 'ماذا تبني، ومشروعك بكلماتك، والتصميم، ووصف الخادم إن كان عندك، واللغات.'),
    t('A short summary of the pages and the look. Nothing starts before your yes.', 'ملخص قصير بالصفحات والشكل. ولا يبدأ شيء قبل موافقتك.'),
    t('Pages, forms, tables and sign-in, with sample data so you can click through at once.', 'صفحات ونماذج وجداول وتسجيل دخول، ببيانات تجريبية لتتصفحها فورا.'),
    t('It looks for mistakes, runs tests, and a reviewer reads the work. It tries to fix what fails before you see it.', 'يبحث عن الأخطاء ويجري الاختبارات، ويقرأ مراجِعٌ العمل. ويحاول إصلاح ما يفشل قبل أن تراه.'),
    t('A short report and one question: save this version? Nothing is saved or published without your yes.', 'تقرير قصير وسؤال واحد: هل أحفظ هذه النسخة؟ ولا يُحفظ ولا يُنشر شيء دون موافقتك.'),
  ],
  noteLine: t('Six steps, from one message to a project you can open.', 'ست خطوات، من رسالة واحدة إلى مشروع تفتحه.'),
  endTitle: t('At the end', 'في النهاية'),
  end: [
    t('Nothing is saved or published without your yes.', 'لا يُحفظ ولا يُنشر شيء دون موافقتك.'),
    t('It asks before risky steps.', 'يسألك قبل الخطوات الخطرة.'),
    t('You decide what to keep.', 'أنت تقرر ما تحتفظ به.'),
  ],
  endDetail: [
    t('Everything stays in a folder on your computer until you say so.', 'كل شيء يبقى في مجلد على حاسوبك حتى تقول.'),
    t('Installing programs and deleting files need your permission.', 'تثبيت البرامج وحذف الملفات يحتاجان إذنك.'),
    t('Keep this version, change it, or start over.', 'احتفظ بهذه النسخة أو عدّلها أو ابدأ من جديد.'),
  ],
  install: t('Please install Wajiha Kit…', 'من فضلك ثبّت واجهة…'),
  ask: t('What are we building?', 'ماذا سنبني؟'),
  options: [t('Dashboard', 'لوحة تحكم'), t('Website', 'موقع'), t('Both', 'الاثنان')],
  plan: [t('Orders, customers, products', 'الطلبات والعملاء والمنتجات'), t('Arabic and English', 'العربية والإنجليزية'), t('Light and dark', 'فاتح وداكن')],
  start: t('Yes, start', 'نعم، ابدأ'),
  pages: [t('Orders page', 'صفحة الطلبات'), t('Customers page', 'صفحة العملاء'), t('Sign-in screen', 'شاشة الدخول')],
  checks: [t('Mistakes: none', 'الأخطاء: لا شيء'), t('Tests: passed', 'الاختبارات: نجحت'), t('Reviewer: done', 'المراجِع: تم')],
  save: t('Save this version?', 'هل أحفظ هذه النسخة؟'),
  yes: t('Yes', 'نعم'),
  no: t('Not yet', 'ليس الآن'),
}

/** The install panel. */
export const installWords = {
  title: t('Start in two steps', 'ابدأ بخطوتين'),
  lead: t('Wajiha Kit is free. You send one message, and Claude installs the kit for you.', '«واجهة» مجانية. ترسل رسالة واحدة، ويثبّت ⁦Claude⁩ الإضافة بنفسه.'),
  needsTitle: t('What you need', 'ما تحتاجه'),
  needsList: [
    t('The Claude app, with a plan that includes the Code tab.', 'تطبيق ⁦Claude⁩، بخطة تتضمن تبويب ⁦Code⁩.'),
    t('A computer.', 'حاسوب.'),
    t('Claude installs the small helper programs for you, after you say yes.', 'يثبّت ⁦Claude⁩ البرامج المساعدة الصغيرة لك بعد موافقتك.'),
  ],
  helpers: t('Claude checks that jq, Node and git are on your computer and helps you install them if they are not. Claude’s plans and prices are set by Anthropic, not by this kit.', 'يتأكد ⁦Claude⁩ أن ⁦jq⁩ و⁦Node⁩ و⁦git⁩ على حاسوبك ويساعدك في تثبيتها إن لم تكن. وخطط ⁦Claude⁩ وأسعارها تحددها ⁦Anthropic⁩ لا الإضافة.'),
  needsDetail: [
    t('The Code tab comes with some plans.', 'تبويب ⁦Code⁩ يأتي مع بعض الخطط.'),
    t('Windows, Mac or Linux. A phone is not enough.', 'ويندوز أو ماك أو لينكس. الهاتف لا يكفي.'),
    t('Claude checks them and asks first.', 'يتحقق ⁦Claude⁩ منها ويسألك أولا.'),
  ],
  moreTitle: t('Notes before you start', 'ملاحظات قبل أن تبدأ'),
  windows: t('You can use it on Windows. Some of the safety checks were only tried by hand there, so some may not work as expected: keep a copy of any important file.', 'تستطيع استخدامها على ويندوز. وبعض فحوص الأمان جُرّبت يدويا هناك فقط، فقد لا يعمل بعضها كما هو متوقع: احتفظ بنسخة من أي ملف مهم.'),
  reopen: t('If Claude installs jq for you, close the Claude app and open it again, then send: “Continue setting up my project.”', 'وإن ثبّت ⁦Claude⁩ أداة ⁦jq⁩ لك، فأغلق تطبيق ⁦Claude⁩ وافتحه من جديد، ثم أرسل: «تابع تجهيز مشروعي».'),
  tonight: t('At the end you will see your site on your own computer only. Putting it online is a separate step, and a hosting service may charge for it.', 'وفي النهاية سترى موقعك على حاسوبك وحده. ونشره على الإنترنت خطوة منفصلة، وقد تأخذ خدمة الاستضافة مقابلا عنها.'),
  copy: t('Copy the message', 'انسخ الرسالة'),
  copied: t('Copied. Paste it in Claude', 'نُسخت. الصقها في Claude'),
  failed: t('Select it and copy', 'حدّدها وانسخها'),
  send: t('Paste it in the message box and press Enter.', 'الصقها في خانة الرسائل واضغط Enter.'),
  phone: t('On your phone? Send yourself the link of this page, open it on your computer, and copy the message there.', 'أنت على الهاتف؟ أرسل رابط هذه الصفحة إلى نفسك، وافتحه على حاسوبك، ثم انسخ الرسالة من هناك.'),
  folder: t('Choose folder', 'اختر مجلدا'),
  reply: t('Reply to Claude…', 'رد على Claude…'),
  slash: t('Then type / and pick', 'ثم اكتب / واختر'),
  illustration: t('An illustration, not a measurement. Wajiha Kit builds the files on your computer and publishes nothing.', 'رسم توضيحي وليس قياسا. تبني «واجهة» الملفات على حاسوبك ولا تنشر شيئا.'),
  differs: t('Site builders host and publish your site for you. Wajiha Kit builds the files on your computer, inside Claude, and publishes nothing.', 'منصات بناء المواقع تستضيف موقعك وتنشره لك. أما واجهة فتبني الملفات على حاسوبك داخل ⁦Claude⁩، ولا تنشر شيئا.'),
  hint: t('You do not need to understand it. Claude carries it out, and asks your permission before each command, including the jq, Node or git installs it proposes.', 'لا تحتاج إلى فهمها. ينفذها ⁦Claude⁩، ويسألك إذنك قبل كل أمر، ومنها أوامر تثبيت ⁦jq⁩ أو ⁦Node⁩ أو ⁦git⁩ التي يقترحها.'),
  source: t('This installs code from one source only:', 'يثبّت هذا الكود من مصدر واحد فقط:'),
  madeBy: t('Made by', 'صنعها'),
  other: t('Have a project already?', 'لديك مشروع؟'),
}

/** Why use the kit and not an AI on its own: two pictures of the result, then six gains. */
export interface Gain {
  name: Bilingual
  text: Bilingual
  instead: Bilingual
  /** Two or three words for the problem, and a short example of each side, as it looks in a project. */
  short: Bilingual
  bad: string
  good: string
}

export const compare = {
  title: t('Why not just ask an AI?', 'لماذا لا تسأل الذكاء الاصطناعي وحده؟'),
  lead: t(
    'An AI on its own can write code. Wajiha Kit gives it a fixed way to build, and checks the result before you see it.',
    'الذكاء الاصطناعي وحده يستطيع كتابة الكود. وتعطيه واجهة طريقة بناء ثابتة، وتفحص النتيجة قبل أن تراها.',
  ),
  without: t('Claude on its own', '\u2066Claude\u2069 وحده'),
  with: t('Claude with Wajiha Kit', '\u2066Claude\u2069 مع واجهة'),
  broken: t('Build failed · broken on phones', 'فشل البناء · مكسور على الهاتف'),
  fine: t('No mistakes · tests passed', 'لا أخطاء · نجحت الاختبارات'),
  instead: t('Instead of', 'بدلا من'),
  /** The same request, two results: a frame with a line you drag between them. */
  slider: {
    lead: t('The same request, two results. Drag the line to see the difference.', 'الطلب نفسه، ونتيجتان. اسحب الخط لترى الفرق.'),
    ask: t('“I want a dashboard to manage my shop orders”', '«أريد لوحة تحكم لإدارة طلبات متجري»'),
    drag: t('Move the line between the two results', 'حرّك الخط بين النتيجتين'),
    cue: t('Drag to compare', 'اسحب لتقارن'),
    orders: t('Orders', 'الطلبات'),
    customers: t('Customers', 'العملاء'),
    products: t('Products', 'المنتجات'),
    search: t('Search orders…', 'ابحث في الطلبات…'),
    newOrder: t('New order', 'طلب جديد'),
    statAll: t('orders', 'طلب'),
    statWait: t('being prepared', 'قيد التجهيز'),
    statDone: t('delivered', 'تم التسليم'),
    row1: t('Sara · 3 items', 'سارة · 3 قطع'),
    row2: t('Ali · 1 item', 'علي · قطعة واحدة'),
    row3: t('Noor · 5 items', 'نور · 5 قطع'),
    row4: t('Omar · 2 items', 'عمر · قطعتان'),
    done: t('Delivered', 'تم التسليم'),
    wait: t('Preparing', 'قيد التجهيز'),
    saved: t('Saved', 'تم الحفظ'),
    error: t('Error: could not load the data', 'خطأ: تعذر تحميل البيانات'),
    broken: t('Orders Page (copy)', 'صفحة الطلبات (نسخة)'),
    results: [
      t('Claude looks for mistakes before you see the project', 'يبحث Claude عن الأخطاء قبل أن ترى المشروع'),
      t('Arabic and phones follow written rules', 'العربية والهاتف تتبعان قواعد مكتوبة'),
      t('Works on phones and in dark mode', 'يعمل على الهاتف وفي الوضع الداكن'),
      t('Every file is yours, on your computer', 'كل ملف ملكك، على حاسوبك'),
    ],
    resultsDetail: [
      t('It tests the pages and fixes what fails.', 'يختبر الصفحات ويصلح ما يفشل.'),
      t('Right-to-left and small screens are checked.', 'يفحص اتجاه الكتابة والشاشات الصغيرة.'),
      t('Both light and dark look right.', 'يبدو الوضعان الفاتح والداكن سليمين.'),
      t('Nothing is stored anywhere else.', 'لا يُخزَّن شيء في مكان آخر.'),
    ],
  },
  gains: <Gain[]>[
    {
      name: t('Plain questions', 'أسئلة بسيطة'),
      text: t('The kit picks the setup, the way a good team would.', 'تقترح الإضافة الإعداد، كما يقترحه فريق جيد.'),
      instead: t('questions about libraries and frameworks you do not know', 'أسئلة عن مكتبات وأطر عمل لا تعرفها'),
      short: t('Technical questions', 'أسئلة تقنية'),
      bad: 'redux? zustand? vite? next?',
      good: '? dashboard · website · both',
    },
    {
      name: t('One clear structure', 'هيكل واحد واضح'),
      text: t('Every file has its place, and it is the same every time.', 'لكل ملف مكانه، وهو نفسه في كل مرة.'),
      instead: t('a different layout every time you ask', 'ترتيب مختلف في كل مرة تطلب فيها'),
      short: t('A random layout', 'ترتيب عشوائي'),
      bad: 'src/new/stuff/page2.tsx',
      good: 'src/pages/orders.tsx',
    },
    {
      name: t('Checked before “done”', 'يُفحص قبل «تم»'),
      text: t('It looks for mistakes and runs tests before it tells you it is finished.', 'يبحث عن الأخطاء ويجري الاختبارات قبل أن يخبرك أنه انتهى.'),
      instead: t('“done” while something is broken', '«تم» وهناك شيء معطل'),
      short: t('“Done”, but broken', '«تم» وهو معطل'),
      bad: 'done ✓ · build ✕',
      good: 'checks ✓ · tests ✓ · done',
    },
    {
      name: t('It reuses what you have', 'يعيد استخدام ما عندك'),
      text: t('It finds the button you already have and uses it again.', 'يجد الزر الموجود عندك ويعيد استخدامه.'),
      instead: t('a third copy of the same button', 'نسخة ثالثة من الزر نفسه'),
      short: t('Copies', 'تكرار'),
      bad: 'Button2.tsx · button-new.tsx',
      good: 'components/Button.tsx ↺',
    },
    {
      name: t('Arabic and phones from day one', 'العربية والهاتف من البداية'),
      text: t('Right to left and small screens work from the first page.', 'الكتابة من اليمين إلى اليسار والشاشات الصغيرة تعمل من أول صفحة.'),
      instead: t('a layout that breaks in Arabic or on a phone', 'شكل يختل بالعربية أو على الهاتف'),
      short: t('Arabic breaks', 'العربية تختل'),
      bad: '/ar → layout ✕',
      good: '/ar ✓ · /en ✓ · phone ✓',
    },
    {
      name: t('Stops known risky steps', 'توقف الخطوات الخطرة المعروفة'),
      text: t('Known risky steps, like force pushes or publishing, are refused.', 'الخطوات الخطرة المعروفة، مثل الرفع القسري والنشر، تُرفض.'),
      instead: t('a risky step run without asking', 'خطوة خطرة تُنفذ دون سؤال'),
      short: t('Risky steps', 'خطوات خطرة'),
      bad: 'git push --force',
      good: 'git push --force → blocked',
    },
  ],
}
