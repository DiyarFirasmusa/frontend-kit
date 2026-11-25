import { t } from './text.ts'

/** What you need on your computer before the three commands. `link` and `hint` are optional. */
export const needs = [
  {
    name: t('A Claude account', 'حساب في Claude'),
    why: t('Claude Code signs in with it. Sign up at claude.ai if you have none.', 'يسجل ⁦Claude Code⁩ الدخول به. أنشئ حسابا من claude.ai إن لم يكن عندك.'),
  },
  {
    name: t('Claude Code, version 2.1.295 or newer', '⁦Claude Code⁩ بالإصدار 2.1.295 أو أحدث'),
    why: t('This is the assistant that does the work. Follow the install steps on its official page.', 'هذا هو المساعد الذي ينفذ العمل. اتبع خطوات التثبيت في صفحته الرسمية.'),
    link: 'https://code.claude.com/docs/en/overview',
    linkLabel: t('Install Claude Code', 'تثبيت ⁦Claude Code⁩'),
  },
  {
    name: t('Node, version 20 or newer', '⁦Node⁩ بالإصدار 20 أو أحدث'),
    why: t('It runs your project on your computer while you build it.', 'يشغل مشروعك على جهازك أثناء بنائه.'),
  },
  {
    name: t('git', '⁦git⁩'),
    why: t('It keeps every saved version of your work, so you can always go back.', 'يحفظ كل نسخة من عملك، فتستطيع الرجوع إليها دائما.'),
  },
  {
    name: t('jq', '⁦jq⁩'),
    why: t('A small tool the safety checks use to read data. On a Mac, install it with brew install jq.', 'أداة صغيرة تستخدمها فحوص الأمان لقراءة البيانات. على جهاز Mac ثبّتها بالأمر ⁦brew install jq⁩.'),
  },
]

/** The sentence before the three commands: where to be, and how to start Claude Code. */
export const openStep = t(
  'Make an empty folder for your project. Open the command window in it (the place where you type commands) and start Claude Code by typing claude. Then type the three lines below into Claude Code, one at a time.',
  'أنشئ مجلدا فارغا لمشروعك. افتح فيه نافذة الأوامر (المكان الذي تكتب فيه الأوامر)، وشغّل ⁦Claude Code⁩ بكتابة ⁦claude⁩. ثم اكتب الأسطر الثلاثة التالية داخل ⁦Claude Code⁩، سطرا بعد سطر.',
)

/** One short title for each of the three commands. */
export const installTitles = [
  t('Tell Claude Code where the kit is', 'عرّف ⁦Claude Code⁩ بمكان الإضافة'),
  t('Install the kit', 'ثبّت الإضافة'),
  t('Start the setup', 'ابدأ الإعداد'),
]

export const installSteps = [
  t('Nothing is installed yet. This only tells Claude Code where the kit lives.', 'لا يثبت هذا شيئا بعد. يخبر ⁦Claude Code⁩ فقط أين توجد الإضافة.'),
  t('This installs the kit: its skills (a ready set of instructions for one job), its specialists (separate helpers with one job, like a reviewer or a tester) and its safety checks.', 'يثبت الإضافة: مهاراتها (مجموعة تعليمات جاهزة لعمل واحد)، ومختصيها (مساعدون منفصلون لكل واحد عمل، كالمراجع والمختبر)، وفحوص الأمان فيها.'),
  t('This starts the setup. When it asks what we are doing, choose “New project”.', 'يبدأ هذا الإعداد. عندما يسألك ماذا سنفعل، اختر «مشروع جديد».'),
]

export const questionsLead = t(
  'The setup asks the same few questions of everyone. None of them is technical. Answer in your own words.',
  'يسأل الإعداد الجميع الأسئلة القليلة نفسها. ليس فيها سؤال تقني. أجب بكلماتك أنت.',
)

export const questions = [
  {
    question: t('What are we building?', 'ماذا سنبني؟'),
    answers: [
      t('A dashboard: pages for you or your team to manage things, like orders or customers.', 'لوحة تحكم: صفحات لك أو لفريقك لإدارة أشياء مثل الطلبات أو العملاء.'),
      t('A website: pages for visitors, like a shop or a company site.', 'موقع: صفحات للزوار، مثل متجر أو موقع شركة.'),
      t('Both, in one project.', 'الاثنان معا، في مشروع واحد.'),
    ],
  },
  {
    question: t('Describe it in one sentence.', 'صف المشروع في جملة واحدة.'),
    answers: [
      t('For example: “A shop for handmade soap, with a page where I manage orders.”', 'مثلا: «متجر لصابون يدوي الصنع، مع صفحة أدير فيها الطلبات».'),
    ],
  },
  {
    question: t('Do you have a design?', 'هل عندك تصميم؟'),
    answers: [
      t('Yes: send a Figma link or pictures of the screens. Send your logo too, if you have one.', 'نعم: أرسل رابط ⁦Figma⁩ أو صورا للشاشات. وأرسل شعارك أيضا إن كان عندك.'),
      t('No: send a picture of a style you like, or a link to a site you want yours to feel like. The kit takes the colours, the fonts and the general feel. It never copies the site.', 'لا: أرسل صورة لأسلوب يعجبك، أو رابط موقع تريد أن يشبهه موقعك. تأخذ الإضافة الألوان والخطوط والإحساس العام. ولا تنسخ الموقع أبدا.'),
    ],
  },
  {
    question: t('Do you have a backend?', 'هل عندك خلفية برمجية (backend)؟'),
    answers: [
      t('Yes: send the link to its description. It is often called OpenAPI or Swagger. The kit reads it to learn what your backend offers.', 'نعم: أرسل رابط وصفها. وغالبا يسمى ⁦OpenAPI⁩ أو ⁦Swagger⁩. تقرؤه الإضافة لتعرف ما يقدمه الـ backend عندك.'),
      t('No: it asks whether people sign in, and what the main things are that your project manages (orders, customers, products and so on).', 'لا: تسألك إن كان الناس يسجلون الدخول، وما الأشياء الرئيسية التي يديرها مشروعك (طلبات، عملاء، منتجات وغيرها).'),
    ],
  },
  {
    question: t('Which languages?', 'أي لغات؟'),
    answers: [
      t('Arabic, English, or both. Arabic pages read from right to left, and the kit sets that up for you.', 'العربية أو الإنجليزية أو الاثنتان. تُعرض الصفحات العربية من اليمين إلى اليسار، وتضبط الإضافة ذلك لك.'),
    ],
  },
]

export const summary = {
  title: t('It shows you a short summary', 'تعرض عليك ملخصا قصيرا'),
  text: t(
    'Before it builds anything, it writes a summary in plain words: what it will make, in which languages, and in which style. Then it asks: shall I start? Change whatever you like. Nothing is built until you say yes.',
    'قبل أن تبني أي شيء، تكتب ملخصا بكلمات بسيطة: ماذا ستصنع، وبأي لغات، وبأي أسلوب. ثم تسأل: هل أبدأ؟ غيّر ما تشاء. ولا يُبنى شيء قبل أن توافق.',
  ),
}

export const build = {
  title: t('It builds your project', 'تبني مشروعك'),
  text: t(
    'It builds a complete project on a fixed setup that has already been proven to work. You never choose libraries or tools. The kit also decides light and dark mode, who may open which page, and how the files are organised. Then it runs its checks and shows you the result.',
    'تبني مشروعا كاملا على إعداد ثابت ثبتت جودته من قبل. ولا تختار أنت أي مكتبات أو أدوات. وتقرر الإضافة أيضا الوضع الفاتح والداكن، ومن يحق له فتح أي صفحة، وكيف تُرتب الملفات. ثم تشغل فحوصها وتعرض عليك النتيجة.',
  ),
}

export const written = [
  { path: 'src/', text: t('Your pages, tables and forms, built from your answers.', 'صفحاتك وجداولك ونماذجك، مبنية من إجاباتك.') },
  { path: 'CLAUDE.md', text: t('A note the assistant reads first: what your project is, the rules it follows and how to run it.', 'ملاحظة يقرؤها المساعد أولا: ما مشروعك، والقواعد التي يتبعها، وكيف يُشغَّل.') },
  { path: '.claude/rules/', text: t('The rules: written standards the assistant follows in your project.', 'القواعد: معايير مكتوبة يتبعها المساعد في مشروعك.') },
  { path: '.claude/settings.json', text: t('What the assistant may do freely, what it must ask you about, and what it may never do.', 'ما يفعله المساعد بحرية، وما عليه أن يسألك عنه، وما يمنع عليه تماما.') },
  { path: '.claude/wajiha-kit.json', text: t('The settings the skills and safety checks read, such as ports, names and commands.', 'الإعدادات التي تقرؤها المهارات وفحوص الأمان، مثل المنافذ والأسماء والأوامر.') },
]

export const after = [
  t('Look at the result and tell it what to change, in plain sentences.', 'انظر إلى النتيجة، وقل لها ما تريد تغييره بجمل بسيطة.'),
  t('Each change runs through the same safety checks. They run by themselves, so nothing depends on the assistant remembering.', 'يمر كل تغيير بفحوص الأمان نفسها. وهي تعمل وحدها، فلا يعتمد شيء على أن يتذكر المساعد.'),
  t('When you are happy, ask it to save a version. You can always go back to it.', 'عندما ترضى عن النتيجة، اطلب منها حفظ نسخة. وتستطيع الرجوع إليها دائما.'),
]

export const limits = [
  t('It is a helper, not magic. It can make mistakes.', 'هي مساعد وليست سحرا. وقد تخطئ.'),
  t('You still look at what it made and say yes or no.', 'يبقى عليك أن تنظر إلى ما صنعته وتقول نعم أو لا.'),
  t('Putting your project on the internet comes later. It is not part of this setup.', 'نشر مشروعك على الإنترنت يأتي لاحقا. وليس جزءا من هذا الإعداد.'),
]

export const maintenance = [
  {
    title: t('Update', 'التحديث'),
    text: t('Setup turns automatic updates on, but they do not run where the updater is switched off, as it can be in the desktop app. To update by hand, run this in the command window, inside your project folder, then restart Claude Code. Rules already copied into your project do not change by themselves: run setup again to see what is new.', 'يفعل الإعداد التحديث التلقائي، لكنه لا يعمل إذا كان المحدّث معطلا، كما قد يحدث في تطبيق سطح المكتب. للتحديث يدويا، شغّل هذا الأمر في نافذة الأوامر داخل مجلد مشروعك، ثم أعد تشغيل ⁦Claude Code⁩. القواعد المنسوخة إلى مشروعك لا تتغير وحدها. شغّل الإعداد مرة أخرى لترى الجديد.'),
    // The first command only refreshes the listing. The installed version moves with the second.
    command: 'claude plugin marketplace update wajiha-kit && claude plugin update wajiha-kit@wajiha-kit',
  },
  {
    title: t('Teammates', 'الزملاء'),
    text: t('The rules and settings travel with the project folder. Each teammate installs the kit once, in the command window.', 'تصل القواعد والإعدادات مع مجلد المشروع. وعلى كل زميل أن يثبت الإضافة مرة واحدة من نافذة الأوامر.'),
    command: 'claude plugin install wajiha-kit@wajiha-kit --scope project',
  },
  {
    title: t('Remove', 'الإزالة'),
    text: t('Uninstall it in the command window, in the same place you installed it. The files setup wrote are yours: keep them or delete them.', 'احذف الإضافة من نافذة الأوامر، في المكان نفسه الذي ثبّتها فيه. الملفات التي كتبها الإعداد ملكك: احتفظ بها أو احذفها.'),
    command: 'claude plugin uninstall wajiha-kit@wajiha-kit',
  },
]
