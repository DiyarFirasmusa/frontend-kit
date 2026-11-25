import { t } from './text.ts'

/** What you need on your computer before you start. `link` and `hint` are optional. */
export const needs = [
  {
    name: t('The Claude app', 'تطبيق ⁦Claude⁩'),
    why: t('This is where you talk to Claude. Sign in with your Claude account. Its Code tab works on a folder on your computer and makes your project there.', 'هنا تتحدث مع ⁦Claude⁩. سجّل الدخول بحسابك في ⁦Claude⁩. قسم ⁦Code⁩ فيه يعمل على مجلد في جهازك ويصنع مشروعك هناك.'),
    link: 'https://claude.com/download',
    linkLabel: t('Download the Claude app', 'نزّل تطبيق ⁦Claude⁩'),
  },
  {
    name: t('Three free helper programs', 'ثلاثة برامج مساعدة مجانية'),
    why: t(
      'Your project needs them to run on your computer: Node (runs the project), git (keeps every version so you can go back) and jq (used by the safety checks). On Windows the safety checks may not fully work yet (see Questions). You do not install anything yourself. If one is missing, Claude tells you which and installs it after your OK. The message below makes Claude check jq first, because without jq the safety checks refuse every command.',
      'يحتاجها مشروعك ليعمل على جهازك: ⁦Node⁩ (يشغل المشروع)، و⁦git⁩ (يحفظ كل نسخة لترجع إليها)، و⁦jq⁩ (تستخدمه فحوص الأمان). وعلى ⁦Windows⁩ قد لا تعمل فحوص الأمان كاملة بعد (راجع «الأسئلة»). ولا تثبّت شيئا بنفسك. إن نقص أحدها يخبرك ⁦Claude⁩ بما ينقص ويثبّته بعد موافقتك. وتجعل الرسالة أدناه ⁦Claude⁩ يتحقق من ⁦jq⁩ أولا، لأن فحوص الأمان ترفض كل الأوامر بدونه.',
    ),
  },
]

/** The message a beginner sends: Claude runs the install for them. The commands are the documented ones. */
export const installMessage = t(
  'Please install the Wajiha Kit plugin for this project. First check that jq is installed. If it is missing, help me install it (brew install jq on a Mac, winget install jqlang.jq on Windows, sudo apt install jq on Linux). Then run these two commands:\nclaude plugin marketplace add DiyarFirasmusa/wajiha-kit\nclaude plugin install wajiha-kit@wajiha-kit --scope project\nIf the claude command is missing, help me get it first. Then start setting up my project with Wajiha Kit.',
  'من فضلك ثبّت إضافة ⁦Wajiha Kit⁩ لهذا المشروع. تحقق أولا أن ⁦jq⁩ مثبّت. وإن لم يكن موجودا فساعدني في تثبيته (⁦brew install jq⁩ على ماك، و⁦winget install jqlang.jq⁩ على ويندوز، و⁦sudo apt install jq⁩ على لينكس). ثم شغّل هذين الأمرين:\n⁦claude plugin marketplace add DiyarFirasmusa/wajiha-kit⁩\n⁦claude plugin install wajiha-kit@wajiha-kit --scope project⁩\nوإذا لم يكن أمر ⁦claude⁩ موجودا، ساعدني في تثبيته أولا. ثم ابدأ بتجهيز مشروعي بواجهة.',
)

/** Three steps, all inside the Claude app. `copy` is what the step asks you to send. */
export const installFlow: { title: ReturnType<typeof t>; text: ReturnType<typeof t>; copy?: ReturnType<typeof t> | string }[] = [
  {
    title: t('Open a folder in the Claude app', 'افتح مجلدا في تطبيق Claude'),
    text: t('Make a new empty folder on your computer for your project, for example “my-shop”. Open the Claude app, choose Code, and pick the folder with the folder button next to the message box.', 'أنشئ مجلدا جديدا فارغا على حاسوبك لمشروعك، مثل «متجري». افتح تطبيق ⁦Claude⁩، واختر ⁦Code⁩، واختر المجلد من زر المجلد بجانب خانة الرسائل.'),
  },
  {
    title: t('Send Claude this message', 'أرسل هذه الرسالة إلى Claude'),
    text: t('Copy it, paste it into the message box and send it. Claude Code asks your permission before each command it runs. For the commands in this message, which contain claude plugin or install jq, press Allow. If a command you do not recognise appears, do not press Allow: ask Claude why it needs it. Then it starts asking about your project. When it asks what you are doing, choose “New project”.', 'انسخها، والصقها في خانة الرسائل وأرسلها. يسألك ⁦Claude Code⁩ إذنك قبل كل أمر ينفذه. والأوامر التي في هذه الرسالة، وفيها ⁦claude plugin⁩ أو تثبيت ⁦jq⁩، اضغط عليها «السماح». وإن ظهر أمر لا تعرفه فلا تضغط «السماح»، واسأل ⁦Claude⁩ لماذا يحتاجه. ثم يبدأ بسؤالك عن مشروعك. وعندما يسألك ماذا تفعل، اختر «مشروع جديد».'),
    copy: installMessage,
  },
]

export const questionsLead = t(
  'The setup asks the same few questions of everyone. You do not need technical knowledge. Answer in your own words. The setup is being updated, so today it may ask a little differently, for example which kind of project and which framework. Answer in the same plain way.',
  'يسأل Claude الجميع الأسئلة القليلة نفسها. ولا تحتاج إلى معرفة تقنية. أجب بكلماتك أنت. والإعداد قيد التحديث، فقد يسأل اليوم بصيغة مختلفة قليلا، مثل نوع المشروع والإطار الذي يُبنى به. أجب بالطريقة البسيطة نفسها.',
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
    question: t('Tell me about your project.', 'حدّثني عن مشروعك.'),
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
      t('Yes: save its description in your project as docs/api/openapi.json. It is often called OpenAPI or Swagger. The kit reads it to learn what your backend offers. Sending a link instead comes in the next version.', 'نعم: احفظ وصفه في مشروعك باسم ⁦docs/api/openapi.json⁩. وغالبا يسمى ⁦OpenAPI⁩ أو ⁦Swagger⁩. تقرؤه الإضافة لتعرف ما يقدمه خادمك. وإرسال رابطه بدل ذلك يأتي في النسخة القادمة.'),
      t('Not sure, or no: say no, and connect one later. It asks whether people sign in. It asks what the main things are that your project manages (orders, customers, products…) only if you did not already say so.', 'إن لم تكن متأكدا أو لم يكن عندك: قل لا، وتستطيع ربط خادم لاحقا. تسألك إن كان الناس يسجلون الدخول. وتسألك عن الأشياء الرئيسية التي يديرها مشروعك (طلبات، عملاء، منتجات…) فقط إن لم تذكرها من قبل.'),
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
    'It builds a complete project on a fixed setup chosen for these kinds of project. You do not need to know libraries or tools: the kit picks them, and may ask you about the framework. The kit also decides light and dark mode, who may open which page, and how the files are organised. Then it runs its checks and shows you the result.',
    'تبني مشروعا كاملا على إعداد ثابت اختير لهذه الأنواع من المشاريع. ولا تحتاج أن تعرف المكتبات أو الأدوات: تختارها الإضافة، وقد تسألك عن الإطار. وتقرر الإضافة أيضا الوضع الفاتح والداكن، ومن يحق له فتح أي صفحة، وكيف تُرتب الملفات. ثم تشغل فحوصها وتعرض عليك النتيجة.',
  ),
}

export const written = [
  { path: 'src/', text: t('Your pages, tables and forms, built from your answers.', 'صفحاتك وجداولك ونماذجك، مبنية من إجاباتك.') },
  { path: 'CLAUDE.md', text: t('A note the assistant reads first: what your project is, the rules it follows and how to run it.', 'ملاحظة يقرؤها المساعد أولا: ما مشروعك، والقواعد التي يتبعها، وكيف يُشغَّل.') },
  { path: '.claude/rules/', text: t('The rules: written standards the assistant follows in your project.', 'القواعد: معايير مكتوبة يتبعها المساعد في مشروعك.') },
  { path: '.claude/settings.json', text: t('What the assistant may do freely, what it must ask you about, and what it may never do.', 'ما يفعله المساعد بحرية، وما عليه أن يسألك عنه، وما يُمنع منه تماما.') },
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
    text: t('Setup leaves automatic updates off, so nothing changes until you decide. To update by hand, run this in the command window (on Windows, open PowerShell from the Start menu), inside your project folder, then restart Claude Code. Or just tell Claude: “Update Wajiha Kit.” Updates come straight from the GitHub repository, so read the changelog first. If you switch automatic updates on yourself, they do not run where the updater is switched off, as it can be in the desktop app. Rules already copied into your project do not change by themselves: run setup again to see what is new.', 'يترك الإعداد التحديث التلقائي مطفأ، فلا يتغير شيء حتى تقرر أنت. للتحديث يدويا، شغّل هذا الأمر في نافذة الأوامر (على ويندوز افتح ⁦PowerShell⁩ من قائمة ابدأ) داخل مجلد مشروعك، ثم أعد تشغيل ⁦Claude Code⁩. أو قل لـ ⁦Claude⁩ فقط: «حدّث واجهة». تأتي التحديثات مباشرة من مستودع ⁦GitHub⁩، فاقرأ سجل التغييرات أولا. وإن شغّلت التحديث التلقائي بنفسك، فلا يعمل إذا كان المحدّث معطلا، كما قد يحدث في تطبيق سطح المكتب. القواعد المنسوخة إلى مشروعك لا تتغير وحدها. شغّل الإعداد مرة أخرى لترى الجديد.'),
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
    text: t('You can also tell Claude: “Remove Wajiha Kit from this project.” Or run these in the command window, in the same place you installed it. Node, git and jq stay installed, like any other program. The files setup wrote are yours: keep them or delete them.', 'ويمكنك أن تقول لـ ⁦Claude⁩: «أزل واجهة من هذا المشروع». أو شغّل هذين الأمرين في نافذة الأوامر، في المكان نفسه الذي ثبّتها فيه. وتبقى ⁦Node⁩ و⁦git⁩ و⁦jq⁩ مثبتة، كأي برنامج آخر. الملفات التي كتبها الإعداد ملكك: احتفظ بها أو احذفها.'),
    command: 'claude plugin uninstall wajiha-kit@wajiha-kit --scope project && claude plugin marketplace remove wajiha-kit',
  },
]
