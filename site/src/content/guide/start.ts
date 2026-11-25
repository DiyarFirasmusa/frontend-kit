import { t } from './text.ts'

/** What you need on your computer before you start. `link` and `hint` are optional. */
export const needs = [
  {
    name: t('The Claude app', 'تطبيق ⁦Claude⁩'),
    why: t('This is where you talk to Claude. Sign in with your Claude account. Its Code tab works on a folder on your computer and makes your project there.', 'هنا تتحدث مع ⁦Claude⁩. سجّل الدخول بحسابك في ⁦Claude⁩. قسم ⁦Code⁩ فيه يعمل على مجلد في جهازك ويصنع مشروعك هناك.'),
    link: 'https://claude.ai/download',
    linkLabel: t('Download the Claude app', 'نزّل تطبيق ⁦Claude⁩'),
  },
  {
    name: t('Three free helper programs', 'ثلاثة برامج مساعدة مجانية'),
    why: t(
      'Your project needs them to run on your computer: Node (runs the project), git (keeps every version so you can go back) and jq (used by the safety checks). If you do not have them, ask Claude: “Install what Wajiha Kit needs”. It will show you each step and ask before it installs anything.',
      'يحتاجها مشروعك ليعمل على جهازك: ⁦Node⁩ (يشغل المشروع)، و⁦git⁩ (يحفظ كل نسخة لترجع إليها)، و⁦jq⁩ (تستخدمه فحوص الأمان). إن لم تكن عندك، اطلب من ⁦Claude⁩: «ثبّت ما تحتاجه واجهة». سيريك كل خطوة ويسألك قبل أن يثبت أي شيء.',
    ),
  },
]

/** The message a beginner sends: Claude runs the install for them. The commands are the documented ones. */
export const installMessage = t(
  'Please install the Wajiha Kit plugin for this project. Run these two commands:\nclaude plugin marketplace add DiyarFirasmusa/wajiha-kit\nclaude plugin install wajiha-kit@wajiha-kit --scope project\nIf the claude command is missing, help me get it first. Then start setting up my project with Wajiha Kit.',
  'من فضلك ثبّت إضافة ⁦Wajiha Kit⁩ لهذا المشروع. شغّل هذين الأمرين:\n⁦claude plugin marketplace add DiyarFirasmusa/wajiha-kit⁩\n⁦claude plugin install wajiha-kit@wajiha-kit --scope project⁩\nوإذا لم يكن أمر ⁦claude⁩ موجودا، ساعدني في تثبيته أولا. ثم ابدأ بتجهيز مشروعي بواجهة.',
)

/** Three steps, all inside the Claude app. `copy` is what the step asks you to send. */
export const installFlow: { title: ReturnType<typeof t>; text: ReturnType<typeof t>; copy?: ReturnType<typeof t> | string }[] = [
  {
    title: t('Open a folder in the Claude app', 'افتح مجلدا في تطبيق Claude'),
    text: t('Make a new empty folder on your computer for your project, for example “my-shop”. Open the Claude app, choose Code, and pick the folder with the folder button next to the message box.', 'أنشئ مجلدا جديدا فارغا على حاسوبك لمشروعك، مثل «متجري». افتح تطبيق ⁦Claude⁩، واختر ⁦Code⁩، واختر المجلد من زر المجلد بجانب خانة الرسائل.'),
  },
  {
    title: t('Send Claude this message', 'أرسل هذه الرسالة إلى Claude'),
    text: t('Copy it, paste it into the message box and send it. Claude installs the kit, asks before each step, and then starts asking about your project. When it asks what you are doing, choose “New project”.', 'انسخها، والصقها في خانة الرسائل وأرسلها. يثبت ⁦Claude⁩ الإضافة، ويسألك قبل كل خطوة، ثم يبدأ بسؤالك عن مشروعك. وعندما يسألك ماذا تفعل، اختر «مشروع جديد».'),
    copy: installMessage,
  },
]

export const questionsLead = t(
  'The setup asks the same few questions of everyone. None of them is technical. Answer in your own words.',
  'يسأل Claude الجميع الأسئلة القليلة نفسها. ليس فيها سؤال تقني. أجب بكلماتك أنت.',
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
    question: t('Tell me about your project.', 'حدثني عن مشروعك.'),
    answers: [
      t('Explain what your project contains and what people can do in it, the way you would ask for it.', 'اشرح ماذا يحتوي مشروعك وماذا يستطيع الناس أن يفعلوا فيه، بالطريقة التي تطلبه بها.'),
      t('For example: “A shop for handmade soap. Visitors see the products and order; I manage the orders from a dashboard.”', 'مثلا: «متجر لصابون يدوي. يرى الزوار المنتجات ويطلبون، وأنا أدير الطلبات من لوحة تحكم».'),
      t('The project name is suggested from your answer, and you can change it.', 'ويُقترح اسم المشروع من جوابك، وتستطيع تغييره.'),
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
    question: t('Do you already have a backend?', 'هل عندك خادم خلفي (backend)؟'),
    answers: [
      t('Yes: send the link to its description, or the file. It is often called OpenAPI or Swagger. The kit reads it to learn what your backend offers.', 'نعم: أرسل رابط وصفه أو ملفه. وغالبا يسمى ⁦OpenAPI⁩ أو ⁦Swagger⁩. تقرؤه الإضافة لتعرف ما يقدمه خادمك.'),
      t('Not sure, or no: say no, and connect one later. It asks whether people sign in. It asks what the main things are that your project manages (orders, customers, products…) only if you did not already say so.', 'لست متأكدا أو لا: قل لا، وتستطيع ربط خادم لاحقا. تسألك إن كان الناس يسجلون الدخول. وتسألك عن الأشياء الرئيسية التي يديرها مشروعك (طلبات، عملاء، منتجات…) فقط إن لم تذكرها من قبل.'),
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
  t('Putting your project on the internet is a separate step after this, and you can ask Claude to guide you.', 'نشر مشروعك على الإنترنت خطوة منفصلة بعد هذا، وتستطيع أن تطلب من Claude أن يرشدك إليها.'),
]

export const maintenance = [
  {
    title: t('Update', 'التحديث'),
    text: t('Setup turns automatic updates on, but they do not run where the updater is switched off, as it can be in the desktop app. To update by hand, run this in the command window, inside your project folder, then restart Claude Code. Rules already copied into your project do not change by themselves: run setup again to see what is new.', 'يفعّل الإعداد التحديث التلقائي، لكنه لا يعمل إذا كان المحدّث معطلا، كما قد يحدث في تطبيق سطح المكتب. للتحديث يدويا، شغّل هذا الأمر في نافذة الأوامر داخل مجلد مشروعك، ثم أعد تشغيل ⁦Claude Code⁩. القواعد المنسوخة إلى مشروعك لا تتغير وحدها. شغّل الإعداد مرة أخرى لترى الجديد.'),
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
