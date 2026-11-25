import type { Bilingual } from '../catalogue.ts'
import type { ProfileId } from './projects.ts'
import { t } from './text.ts'

/** What can you build: one tab per kind, with three short things you get and the address shown in the picture. */
export const showcase: { id: ProfileId; tab: Bilingual; title: Bilingual; text: Bilingual; chips: Bilingual[]; say: Bilingual; url: string }[] = [
  {
    id: 'website',
    tab: t('Website', 'موقع'),
    title: t('Pages your visitors open', 'صفحات يفتحها زوارك'),
    text: t('A shop, a company site, a blog or a list of your products.', 'متجر، أو موقع شركة، أو مدونة، أو قائمة بمنتجاتك.'),
    chips: [t('Fast on phones', 'سريع على الهاتف'), t('Found in search', 'يظهر في البحث'), t('Links share with a picture', 'الروابط تظهر بصورة')],
    say: t('“A shop for handmade soap, with a page for each product.”', '«متجر لصابون يدوي، وفيه صفحة لكل منتج».'),
    url: 'my-shop.com',
  },
  {
    id: 'dashboard',
    tab: t('Dashboard', 'لوحة تحكم'),
    title: t('A private place to run things', 'مكان خاص تدير فيه عملك'),
    text: t('Orders, customers, products and reports, for you and your team. People sign in to use it.', 'الطلبات والعملاء والمنتجات والتقارير، لك ولفريقك. ويسجل الناس الدخول لاستخدامه.'),
    chips: [t('Tables with search', 'جداول مع بحث'), t('Forms that check input', 'نماذج تتحقق من الإدخال'), t('Each person sees their part', 'كل شخص يرى ما يخصه')],
    say: t('“A page with my orders in a table, with filters.”', '«صفحة فيها طلباتي في جدول، مع فلاتر».'),
    url: 'admin.my-shop.com',
  },
  {
    id: 'fullstack',
    tab: t('Both', 'الاثنان'),
    title: t('Your website and its dashboard', 'موقعك ولوحة التحكم الخاصة به'),
    text: t('The public pages and the place where you run them, in one project.', 'الصفحات العامة والمكان الذي تديرها منه، في مشروع واحد.'),
    chips: [t('Everything from both', 'كل ما في الاثنين'), t('One project', 'مشروع واحد'), t('They stay in step', 'يبقيان متوافقين')],
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
  after: t('After that, you keep going in plain sentences:', 'بعدها تكمل بجمل بسيطة:'),
  asks: [
    t('Add a page for my customers', 'أضف صفحة لعملائي'),
    t('Change the colours to green', 'غيّر الألوان إلى الأخضر'),
    t('Make the product page faster', 'اجعل صفحة المنتج أسرع'),
    t('Add Arabic next to English', 'أضف العربية بجانب الإنجليزية'),
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
  slash: t('Then type / and pick', 'ثم اكتب / واختر'),
  other: t('Already have a project, or an old one? Read how to start from it', 'عندك مشروع جاهز أو قديم؟ اقرأ كيف تبدأ منه'),
}
