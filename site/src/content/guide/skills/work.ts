import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const work: Record<string, SkillGuide> = {
  setup: {
    plain: t(
      'The first thing you run. It looks at your project, or asks what you want to build, and sets the kit up after you agree. A plugin cannot write your project rules by itself, so setup does it with you.',
      'أول أمر تشغله. ينظر في مشروعك، أو يسألك ماذا تريد أن تبني، ثم يجهز الإضافة بعد موافقتك. الإضافة لا تستطيع كتابة قواعد مشروعك بنفسها، لذلك يكتبها setup معك.',
    ),
    ask: [t('/wajiha-kit:setup', '/wajiha-kit:setup')],
    steps: [
      t('Asks whether your project is new, already exists, needs upkeep, or needs fixing up. For a new project it asks a few plain questions, such as what you are building and what it should look like.', 'يسألك: هل المشروع جديد، أم موجود، أم يحتاج صيانة، أم يحتاج إصلاحا؟ وللمشروع الجديد يسألك أسئلة بسيطة قليلة، مثل ماذا تبني وكيف تريد أن يبدو.'),
      t('Finds out which tools your project uses, by reading package.json (the list of tools a JavaScript project uses) and its settings files.', 'يعرف الأدوات التي يستخدمها مشروعك بقراءة package.json (قائمة الأدوات التي يستخدمها مشروع JavaScript) وملفات الإعدادات.'),
      t('Shows one proposal in plain words: the files it will add, what it will adapt to your project, and what it will tidy up.', 'يعرض اقتراحا واحدا بكلمات بسيطة: الملفات التي سيضيفها، وما سيعدله ليناسب مشروعك، وما سينظفه.'),
      t('After your yes, writes the files, and shows what changed in any file that already existed (this is called a diff).', 'بعد موافقتك يكتب الملفات، ويعرض ما تغير في أي ملف كان موجودا (ويسمى diff).'),
    ],
    result: [
      t('CLAUDE.md (the instructions file the assistant reads) and the rules', 'CLAUDE.md (ملف التعليمات الذي يقرؤه المساعد) والقواعد'),
      t('Settings with permissions (what the assistant may and may not do)', 'الإعدادات مع الصلاحيات (ما يجوز للمساعد فعله وما لا يجوز)'),
      t('The kit’s settings file', 'ملف إعدادات الإضافة'),
    ],
    limits: [
      t('Reads .env.example, never .env (the file with your real secrets).', 'يقرأ ‎.env.example ولا يقرأ ‎.env أبدا (الملف الذي فيه أسرارك الحقيقية).'),
      t('Does not save a version of your work, install packages you did not ask for, or reorganise your code.', 'لا يحفظ نسخة من عملك، ولا يثبت حزما دون أن تطلب، ولا يعيد ترتيب الكود.'),
    ],
    related: ['task', 'refactor-mode'],
    needs: t('Claude Code 2.1.295 or newer, jq (a small tool for reading data files), Node 20 or newer (what runs JavaScript on your computer), and git (the tool that keeps the history of your files).', 'يحتاج إلى Claude Code 2.1.295 أو أحدث، وjq (أداة صغيرة لقراءة ملفات البيانات)، وNode 20 أو أحدث (ما يشغل JavaScript على جهازك)، وgit (الأداة التي تحفظ تاريخ ملفاتك).'),
  },
  task: {
    plain: t('One piece of work from start to finish: a separate branch, the code, the checks, a report, and then your decision.', 'عمل واحد من البداية إلى النهاية: فرع منفصل، وكود، وفحوص، وتقرير، ثم قرارك.'),
    ask: [t('new task: add order export <ticket link>', 'مهمة جديدة: أضف تصدير الطلبات <رابط التذكرة>'), t('/wajiha-kit:task', '/wajiha-kit:task')],
    steps: [
      t('Says the task back in a few lines, and asks if something important is unclear.', 'يعيد المهمة بكلامه في أسطر قليلة، ويسألك إن كان شيء مهم غير واضح.'),
      t('Starts a separate branch (a safe line of work) from the newest main.', 'ينشئ فرعا منفصلا (خط عمل آمن) من أحدث main.'),
      t('Builds it with the matching skills and adds tests.', 'يبنيها بالمهارات المناسبة ويضيف الاختبارات.'),
      t('Checks it, asks for a review, then asks whether to save it and upload it.', 'يتحقق منها، ويطلب مراجعة، ثم يسألك هل يحفظ النسخة ويرفعها.'),
    ],
    result: [t('A checked task branch', 'فرع للمهمة بعد التحقق منه'), t('A short report that says what was not checked', 'تقرير قصير يذكر ما لم يفحصه')],
    limits: [t('Does not open or merge a pull request (a request to merge your changes): the safety checks refuse the common ways.', 'لا يفتح الـ pull request (طلب دمج تغييراتك) ولا يدمجه، وترفض فحوص الأمان الطرق المعتادة لذلك.'), t('Never saves a version without your yes.', 'لا يحفظ نسخة دون موافقتك.')],
    related: ['verify', 'commit-push', 'pr-link'],
  },
  dev: {
    plain: t('Starts your app on its port (its numbered door on your computer) and tells you when it really answers.', 'يشغل تطبيقك على منفذه (بابه المرقم على جهازك) ويخبرك عندما يرد فعلا.'),
    ask: [t('run the dashboard', 'شغّل لوحة التحكم'), t('restart the server, it shows old code', 'أعد تشغيل الخادم، فهو يعرض كودا قديما')],
    steps: [
      t('Looks at what is using the port.', 'يفحص ما الذي يستخدم المنفذ.'),
      t('Asks before stopping a program that belongs to another project.', 'يسألك قبل أن يوقف برنامجا تابعا لمشروع آخر.'),
      t('Clears stored old copies (the cache) when needed, then starts the app.', 'يمسح النسخ القديمة المخزنة (الكاش) عند الحاجة ثم يشغل التطبيق.'),
      t('Waits until the app answers before giving you the link.', 'ينتظر حتى يستجيب التطبيق قبل أن يعطيك الرابط.'),
    ],
    result: [t('A running app and its local link', 'تطبيق يعمل ورابطه المحلي')],
    limits: [t('Never connects the app to your live site.', 'لا يربط التطبيق بموقعك الحي أبدا.')],
    related: ['live-check', 'verify'],
  },
  explain: {
    plain: t('You ask a question and get an answer, not a change to your code.', 'تسأل، فتحصل على جواب لا على تغيير في الكود.'),
    ask: [t('why does the cart load its data twice?', 'لماذا تجلب السلة بياناتها مرتين؟'), t('what endpoint does checkout use? explain for the team', 'ما الـ endpoint الذي يستخدمه الدفع؟ اشرحه للفريق')],
    steps: [
      t('Follows the code that really runs, all the way to the backend address it calls (the endpoint).', 'يتتبع الكود الذي يعمل فعلا، حتى العنوان الذي يستدعيه في الخادم (الـ endpoint).'),
      t('Reads the history of changes (git history) when you ask why something is the way it is.', 'يقرأ تاريخ التغييرات (تاريخ git) إذا سألت عن سبب وضع ما.'),
      t('Answers first, then shows the files and lines.', 'يجيب أولا، ثم يعرض الملفات والأسطر.'),
    ],
    result: [t('A plain answer with evidence', 'جواب واضح مع الدليل')],
    limits: [t('Edits nothing, even when it spots a bug. It offers to fix it instead.', 'لا يعدل شيئا حتى لو رأى خطأ، بل يعرض عليك إصلاحه.')],
    related: ['backend-request'],
  },
  refactor: {
    plain: t('Tidies the code while it keeps doing exactly what it did before. This is what the word refactor means.', 'يرتب الكود ويجعله أنظف، ويبقى يفعل ما كان يفعله تماما. وهذا هو معنى كلمة refactor.'),
    ask: [t('split this 700-line page', 'قسم هذه الصفحة، طولها 700 سطر'), t('clean up and remove the duplication', 'نظّفه وأزل التكرار')],
    steps: [
      t('First makes sure tests cover the code.', 'يتأكد أولا أن الاختبارات تغطي الكود.'),
      t('Makes one kind of change at a time.', 'ينفذ نوعا واحدا من التغيير في كل مرة.'),
      t('Runs the checks after each small step.', 'يشغل الفحوص بعد كل خطوة صغيرة.'),
      t('Moves files with git and updates the files that use them.', 'ينقل الملفات بـ git ويحدث الملفات التي تستخدمها.'),
    ],
    result: [t('Smaller files and the same behaviour', 'ملفات أصغر وسلوك كما هو'), t('Checks that pass', 'فحوص ناجحة')],
    limits: [t('A change in behaviour becomes a separate task.', 'أي تغيير في السلوك يصبح مهمة منفصلة.')],
    related: ['refactor-mode', 'fix-everywhere'],
  },
  'refactor-mode': {
    plain: t('Brings a whole old project up to a good standard, in phases (steps) that you approve. In the kit this is called “fix an old project”.', 'يوصل مشروعا قديما كاملا إلى مستوى جيد، على مراحل توافق عليها. وتسمى هذه الميزة في الإضافة «إصلاح مشروع قديم».'),
    ask: [t('/wajiha-kit:refactor-mode audit', '/wajiha-kit:refactor-mode audit'), t('/wajiha-kit:refactor-mode next', '/wajiha-kit:refactor-mode next')],
    steps: [
      t('on: switches the project into this mode.', 'on: ينقل المشروع إلى هذا النمط.'),
      t('audit: measures everything without editing any code, and writes a plan with seven phases.', 'audit: يقيس كل شيء دون تعديل أي كود، ويكتب خطة من سبع مراحل.'),
      t('next: carries out one phase you approved, and compares the result with the first measurement.', 'next: ينفذ مرحلة واحدة وافقت عليها، ويقارن النتيجة بالقياس الأول.'),
      t('status and off: status shows the progress, off returns to normal work.', 'status وoff: الأول يعرض التقدم، والثاني يعود إلى العمل العادي.'),
    ],
    result: [t('docs/refactor-plan.md', 'docs/refactor-plan.md'), t('One saved version per phase, after your yes', 'نسخة محفوظة واحدة لكل مرحلة، بعد موافقتك')],
    limits: [
      t('Keeps your own folder layout unless you pick another.', 'يبقي ترتيب مجلداتك كما هو، إلا إذا اخترت ترتيبا آخر.'),
      t('Does not skip tests or hide new errors. The safety checks catch the common ways of doing this, and for the rest the assistant follows instructions.', 'لا يتخطى اختبارات، ولا يخفي أخطاء جديدة. فحوص الأمان تلتقط الطرق الشائعة لذلك، والباقي تعليمات يتبعها المساعد.'),
    ],
    related: ['refactor', 'verify'],
  },
  mode: {
    plain: t(
      'A switch for how careful and how fast the assistant works: a freeze before a release, an urgent fix, or a review where nothing may change. Only you turn it on. This is an advanced option.',
      'مفتاح يحدد مقدار الحذر وسرعة عمل المساعد: تجميد قبل الإصدار، أو إصلاح عاجل، أو مراجعة لا يتغير فيها شيء. أنت وحدك تشغله. وهو خيار متقدم.',
    ),
    ask: [t('/wajiha-kit:mode freeze --days 3', '/wajiha-kit:mode freeze --days 3'), t('/wajiha-kit:mode off', '/wajiha-kit:mode off')],
    steps: [
      t('list: shows every mode and what it enforces.', 'list: يعرض كل نمط وما يفرضه.'),
      t('A mode’s name turns it on, for the whole project or only for this copy of it.', 'اسم النمط يشغله، للمشروع كله أو لهذه النسخة منه فقط.'),
      t('status shows what is on, and off turns it off.', 'status يعرض النمط المفعل، وoff يوقفه.'),
    ],
    result: [
      t('The mode’s rules, repeated to the assistant while it is on', 'قواعد النمط، يذكرها للمساعد ما دام النمط مفعلا'),
      t('A safety check that blocks the actions it can recognise', 'فحص أمان يمنع الإجراءات التي يستطيع التعرف عليها'),
    ],
    limits: [
      t('A guard rail, not a sandbox (a fully sealed room): in the command window it catches common forms only.', 'حاجز أمان وليس بيئة معزولة تماما. في نافذة الأوامر يلتقط الصيغ الشائعة فقط.'),
      t('A mode only adds limits. It never removes a safety check.', 'النمط يضيف قيودا فقط، ولا يرفع أي فحص أمان.'),
    ],
    related: ['refactor-mode', 'upgrade-mode'],
    needs: t('jq (a small tool for reading data files)', 'jq (أداة صغيرة لقراءة ملفات البيانات)'),
  },
  'upgrade-mode': {
    plain: t(
      'Moves your project to a new major version of its tools, as a job of its own: one family of packages (tools your project uses) at a time, in phases you approve, proven by the whole set of tests.',
      'ينقل مشروعك إلى إصدار رئيسي جديد من أدواته، كعمل مستقل: مجموعة حزم واحدة (أدوات يستخدمها مشروعك) في كل مرة، على مراحل توافق عليها، وتؤكد نجاحه الاختبارات.',
    ),
    ask: [t('/wajiha-kit:upgrade-mode on', '/wajiha-kit:upgrade-mode on'), t('/wajiha-kit:upgrade-mode plan', '/wajiha-kit:upgrade-mode plan')],
    steps: [
      t('on: switches the project into upgrade mode.', 'on: ينقل المشروع إلى نمط الترقية.'),
      t('plan: records the starting numbers (the baseline), reads the official upgrade guides and waits for your yes.', 'plan: يسجل الأرقام الأولى (خط الأساس)، ويقرأ أدلة الترقية الرسمية، وينتظر موافقتك.'),
      t('next: carries out the first phase that is left, then compares the real numbers with the baseline.', 'next: ينفذ أول مرحلة متبقية، ثم يقارن الأرقام الحقيقية بخط الأساس.'),
      t('off: returns to normal work. The plan stays.', 'off: يعود إلى العمل العادي، وتبقى الخطة.'),
    ],
    result: [t('docs/upgrade-plan.md', 'docs/upgrade-plan.md'), t('One saved version per phase, after your yes', 'نسخة محفوظة واحدة لكل مرحلة، بعد موافقتك')],
    limits: [
      t('It does not force packages to accept versions they do not support, skip tests, or refresh saved test comparisons (snapshots) to hide changes. The safety checks catch the common ways of doing this.', 'لا يجبر الحزم على قبول إصدارات لا تدعمها، ولا يتخطى اختبارات، ولا يحدث المقارنات المحفوظة للاختبارات (snapshots) ليخفي التغييرات. فحوص الأمان تلتقط الطرق الشائعة لذلك.'),
      t('No new features and no clean-up inside an upgrade.', 'لا يضيف ميزات جديدة ولا ينظف الكود أثناء الترقية.'),
    ],
    related: ['mode', 'verify'],
  },
  'fix-everywhere': {
    plain: t('For “fix all of them”. It proves that none is left.', 'لطلب «أصلحها كلها». ويثبت لك أنه لم يبق شيء.'),
    ask: [t('fix this dropdown on every page', 'أصلح هذه القائمة المنسدلة في كل الصفحات'), t('check all, did you forget any?', 'افحص الكل، هل نسيت شيئا؟')],
    steps: [
      t('Writes down what counts as one occurrence of the problem.', 'يكتب ما الذي يحسب موضعا للمشكلة.'),
      t('Searches all of the code and shows you the list.', 'يبحث في كل الكود ويعرض لك القائمة.'),
      t('Asks first when the list is long or needs a decision about the product.', 'يسألك أولا إذا كانت القائمة طويلة أو تحتاج قرارا يخص المنتج.'),
      t('Fixes each one, then runs the same search again.', 'يصلح كل موضع، ثم يعيد البحث نفسه.'),
    ],
    result: [t('The number fixed, and a final search with no results', 'عدد ما أصلحه، وبحث أخير بلا نتائج')],
    limits: [t('Keeps everything else in each place the same.', 'يبقي باقي سلوك كل موضع كما هو.')],
    related: ['refactor', 'verify'],
  },
  'backend-request': {
    plain: t('A document you can send as it is to the people who build your backend. It says what your screens need that the backend does not offer yet.', 'مستند ترسله كما هو إلى من يبنون الخادم عندك. يقول ما تحتاجه شاشاتك مما لا يقدمه الخادم بعد.'),
    ask: [t('note that the API has no slug field', 'سجل أن الـ API ليس فيه حقل slug'), t('prepare the missing endpoints for the backend', 'جهّز الـ endpoints الناقصة لفريق الخادم')],
    steps: [
      t('Says what the user is doing and what is missing.', 'يذكر ما يفعله المستخدم وما الناقص.'),
      t('Shows the request and the answer you want.', 'يعرض الطلب والرد المطلوبين.'),
      t('Sets a priority and lists the unusual cases.', 'يحدد الأولوية ويذكر الحالات الخاصة.'),
    ],
    result: [t('docs/backend-requests.md, written for colleagues', 'docs/backend-requests.md، مكتوب للزملاء')],
    limits: [t('It has no file paths or internal names from the screens side, so the backend team can read it without knowing your code.', 'لا يكتب فيه مسارات ملفات ولا أسماء داخلية من جهة الشاشات، ليقرأه فريق الخادم دون أن يعرف كودك.')],
    related: ['explain'],
  },
}
