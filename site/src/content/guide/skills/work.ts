import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const work: Record<string, SkillGuide> = {
  setup: {
    plain: t(
      'The first thing you run. A plugin cannot write project rules by itself, so setup reads your project and installs them after you agree.',
      'أول أمر تشغله. الإضافة لا تستطيع كتابة قواعد المشروع بنفسها، لذلك يقرأ setup مشروعك ويضع القواعد فيه بعد موافقتك.',
    ),
    ask: [t('/wajiha-kit:setup', '/wajiha-kit:setup')],
    steps: [
      t('Asks: new, existing, maintenance or refactor, and which kind of project.', 'يسألك: المشروع جديد أم موجود، أم للصيانة أم لإعادة الهيكلة؟ وما نوعه؟'),
      t('Detects your stack from package.json and the config files.', 'يعرف تقنيات مشروعك من package.json وملفات الإعدادات.'),
      t('Shows one proposal: files, adaptations and clean-up.', 'يعرض اقتراحا واحدا: الملفات، والتعديلات التي تناسب مشروعك، والتنظيف.'),
      t('After your yes, writes the files and shows a diff for any that exist.', 'بعد موافقتك يكتب الملفات، ويعرض الفرق في كل ملف موجود.'),
    ],
    result: [
      t('CLAUDE.md and the rules', 'CLAUDE.md والقواعد'),
      t('Settings with permissions', 'الإعدادات مع الصلاحيات'),
      t('The kit’s config file', 'ملف إعدادات الإضافة'),
    ],
    limits: [
      t('Reads .env.example, never .env.', 'يقرأ ‎.env.example ولا يقرأ ‎.env أبدا.'),
      t('Does not commit, install packages unasked or restructure code.', 'لا يحفظ التغييرات، ولا يثبت حزما دون أن تطلب، ولا يعيد هيكلة الكود.'),
    ],
    related: ['task', 'refactor-mode'],
    needs: t('Claude Code 2.1.295 or newer, jq, Node 20 or newer, and git.', 'يحتاج إلى Claude Code 2.1.295 أو أحدث، وjq، وNode 20 أو أحدث، وgit.'),
  },
  task: {
    plain: t('One ticket from start to finish: branch, code, checks, report, and then your decision.', 'مهمة واحدة من البداية إلى النهاية: فرع، وكود، وفحوص، وتقرير، ثم قرارك.'),
    ask: [t('new task: add order export <ticket link>', 'مهمة جديدة: أضف تصدير الطلبات <رابط التذكرة>'), t('/wajiha-kit:task', '/wajiha-kit:task')],
    steps: [
      t('Says the task back in a few lines and asks if something decisive is unclear.', 'يعيد المهمة بكلامه في أسطر قليلة، ويسألك إن كان شيء مهم غير واضح.'),
      t('Creates a branch from the latest main.', 'ينشئ فرعا من آخر main.'),
      t('Builds it with the matching skills and adds tests.', 'يبنيها بالمهارات المناسبة ويضيف الاختبارات.'),
      t('Verifies, gets a review and asks whether to commit and push.', 'يتحقق، ويطلب مراجعة، ثم يسألك هل يحفظ ويرفع.'),
    ],
    result: [t('A verified task branch', 'فرع للمهمة بعد التحقق منه'), t('A short report with what was not checked', 'تقرير قصير يذكر ما لم يفحصه')],
    limits: [t('Never opens or merges a pull request.', 'لا يفتح الـ pull request ولا يدمجه أبدا.'), t('Never commits without your yes.', 'لا يحفظ دون موافقتك.')],
    related: ['verify', 'commit-push', 'pr-link'],
  },
  dev: {
    plain: t('Runs your app on its port and tells you when it really answers.', 'يشغل تطبيقك على منفذه، ويخبرك عندما يرد فعلا.'),
    ask: [t('run the dashboard', 'شغّل لوحة التحكم'), t('restart the server, it serves stale code', 'أعد تشغيل الخادم، فهو يعرض كودا قديما')],
    steps: [
      t('Looks at what holds the port.', 'يفحص ما الذي يستخدم المنفذ.'),
      t('Asks before stopping another project’s process.', 'يسألك قبل أن يوقف عملية تابعة لمشروع آخر.'),
      t('Clears the cache when needed and starts.', 'يمسح الكاش عند الحاجة ثم يشغل التطبيق.'),
      t('Waits for an answer before giving you the URL.', 'ينتظر حتى يستجيب التطبيق قبل أن يعطيك الرابط.'),
    ],
    result: [t('A running app and its local URL', 'تطبيق يعمل ورابطه المحلي')],
    limits: [t('Never points the app at the live host.', 'لا يربط التطبيق بالخادم الحي أبدا.')],
    related: ['live-check', 'verify'],
  },
  explain: {
    plain: t('When you ask a question, you get an answer and not an edit.', 'تسأل، فتحصل على جواب لا على تعديل.'),
    ask: [t('why does the cart refetch twice?', 'لماذا تعيد السلة جلب البيانات مرتين؟'), t('what endpoint does checkout use? explain for the team', 'ما الـ endpoint الذي يستخدمه الدفع؟ اشرحه للفريق')],
    steps: [
      t('Follows the code that really runs, down to the endpoint.', 'يتتبع الكود الذي يعمل فعلا، حتى الـ endpoint.'),
      t('Reads git history for questions about why.', 'يقرأ تاريخ git إذا سألت عن السبب.'),
      t('Answers first, then shows the files and lines.', 'يجيب أولا، ثم يعرض الملفات والأسطر.'),
    ],
    result: [t('A plain answer with evidence', 'جواب واضح مع الدليل')],
    limits: [t('Edits nothing, even when it spots a bug. It offers instead.', 'لا يعدل شيئا حتى لو رأى خطأ، بل يعرض عليك إصلاحه.')],
    related: ['backend-request'],
  },
  refactor: {
    plain: t('Makes code cleaner while it keeps doing exactly the same thing.', 'يجعل الكود أنظف دون أن يتغير ما يفعله.'),
    ask: [t('split this 700-line page', 'قسم هذه الصفحة، طولها 700 سطر'), t('clean up and remove the duplication', 'نظّفه وأزل التكرار')],
    steps: [
      t('Makes sure tests cover the code first.', 'يتأكد أولا أن الاختبارات تغطي الكود.'),
      t('Makes one kind of change at a time.', 'ينفذ نوعا واحدا من التغيير في كل مرة.'),
      t('Runs the checks after each small step.', 'يشغل الفحوص بعد كل خطوة صغيرة.'),
      t('Moves files with git and updates importers.', 'ينقل الملفات بـ git ويحدث الملفات التي تستوردها.'),
    ],
    result: [t('Smaller files and the same behaviour', 'ملفات أصغر وسلوك كما هو'), t('Green checks', 'فحوص ناجحة')],
    limits: [t('A behaviour change becomes a separate task.', 'أي تغيير في السلوك يصبح مهمة منفصلة.')],
    related: ['refactor-mode', 'fix-everywhere'],
  },
  'refactor-mode': {
    plain: t('Brings a whole old project up to the standard, in phases you approve.', 'يوصل مشروعا قديما كاملا إلى المعيار المطلوب، على مراحل توافق عليها.'),
    ask: [t('/wajiha-kit:refactor-mode audit', '/wajiha-kit:refactor-mode audit'), t('/wajiha-kit:refactor-mode next', '/wajiha-kit:refactor-mode next')],
    steps: [
      t('on: switches the project into the mode.', 'on: ينقل المشروع إلى هذا النمط.'),
      t('audit: measures everything without editing code and writes a six-phase plan.', 'audit: يقيس كل شيء دون تعديل الكود، ويكتب خطة من ست مراحل.'),
      t('next: runs one approved phase and compares with the first measurement.', 'next: ينفذ مرحلة واحدة وافقت عليها، ويقارنها بالقياس الأول.'),
      t('status and off: show progress, or return to normal.', 'status وoff: الأول يعرض التقدم، والثاني يعود إلى الوضع العادي.'),
    ],
    result: [t('docs/refactor-plan.md', 'docs/refactor-plan.md'), t('One commit per phase, after your yes', 'حفظ واحد لكل مرحلة، بعد موافقتك')],
    limits: [
      t('Keeps your own folder layout unless you pick another.', 'يبقي ترتيب مجلداتك كما هو، إلا إذا اخترت ترتيبا آخر.'),
      t('No skipped tests or new suppressions. The guard catches the common forms, the rest is instruction.', 'لا يتخطى اختبارات، ولا يسكت أخطاء جديدة. الحارس يلتقط الصيغ الشائعة، والباقي تعليمات.'),
    ],
    related: ['refactor', 'verify'],
  },
  mode: {
    plain: t(
      'A switch for how careful the work must be: a freeze before a release, a hotfix, a read-only review. Only you turn it.',
      'مفتاح يحدد مقدار الحذر في العمل: تجميد قبل الإصدار، أو إصلاح عاجل، أو مراجعة للقراءة فقط. أنت وحدك تشغله.',
    ),
    ask: [t('/wajiha-kit:mode freeze --days 3', '/wajiha-kit:mode freeze --days 3'), t('/wajiha-kit:mode off', '/wajiha-kit:mode off')],
    steps: [
      t('list: names every mode and what it enforces.', 'list: يعرض كل نمط وما يفرضه.'),
      t('A mode’s name turns it on, for the project or for this checkout.', 'اسم النمط يشغله، للمشروع كله أو لهذه النسخة منه.'),
      t('status shows what is on, and off leaves it.', 'status يعرض النمط المفعل، وoff يوقفه.'),
    ],
    result: [
      t('The mode’s rules, repeated to the assistant while it is on', 'قواعد النمط، يذكرها للمساعد ما دام النمط مفعلا'),
      t('A guard on what a hook can see', 'حماية تشمل ما يراه الحارس'),
    ],
    limits: [
      t('A guard rail, not a sandbox: in the shell it catches common forms only.', 'حاجز أمان وليس بيئة معزولة. في الطرفية يلتقط الصيغ الشائعة فقط.'),
      t('A mode adds restrictions. It never lifts a guard.', 'النمط يضيف قيودا، ولا يرفع أي حارس.'),
    ],
    related: ['refactor-mode', 'upgrade-mode'],
    needs: t('jq', 'jq'),
  },
  'upgrade-mode': {
    plain: t(
      'A major upgrade done as its own job: one family of packages, in phases you approve, proven by the whole test suite.',
      'ترقية كبيرة كعمل مستقل: مجموعة حزم واحدة، على مراحل توافق عليها، وكل الاختبارات تثبت نجاحها.',
    ),
    ask: [t('/wajiha-kit:upgrade-mode on', '/wajiha-kit:upgrade-mode on'), t('/wajiha-kit:upgrade-mode plan', '/wajiha-kit:upgrade-mode plan')],
    steps: [
      t('on: switches the project into upgrade mode.', 'on: ينقل المشروع إلى نمط الترقية.'),
      t('plan: records a baseline, reads the official guides and waits for your yes.', 'plan: يسجل خط الأساس، ويقرأ الأدلة الرسمية، وينتظر موافقتك.'),
      t('next: runs the first pending phase, then compares the real numbers with the baseline.', 'next: ينفذ أول مرحلة متبقية، ثم يقارن الأرقام الحقيقية بخط الأساس.'),
      t('off: returns to normal work. The plan stays.', 'off: يعود إلى العمل العادي، وتبقى الخطة.'),
    ],
    result: [t('docs/upgrade-plan.md', 'docs/upgrade-plan.md'), t('One commit per phase, after your yes', 'حفظ واحد لكل مرحلة، بعد موافقتك')],
    limits: [
      t('No forced peer versions, skipped tests or refreshed snapshots. The guard catches the common forms.', 'لا يفرض إصدارات peer بالقوة، ولا يتخطى اختبارات، ولا يحدث الـ snapshots. الحارس يلتقط الصيغ الشائعة.'),
      t('No new features or clean-up inside an upgrade.', 'لا يضيف ميزات جديدة ولا ينظف الكود أثناء الترقية.'),
    ],
    related: ['mode', 'verify'],
  },
  'fix-everywhere': {
    plain: t('For “fix all of them”. It proves that none is left.', 'لطلب «أصلحها كلها». ويثبت لك أنه لم يبق شيء.'),
    ask: [t('fix this dropdown on every page', 'أصلح هذه القائمة المنسدلة في كل الصفحات'), t('check all, did you forget any?', 'افحص الكل، هل نسيت شيئا؟')],
    steps: [
      t('Writes down what counts as an occurrence.', 'يكتب ما الذي يحسب موضعا للمشكلة.'),
      t('Searches the whole source and prints the list.', 'يبحث في كل الكود ويعرض القائمة.'),
      t('Asks first when the list is long or needs a product decision.', 'يسألك أولا إذا كانت القائمة طويلة أو تحتاج قرارا من المنتج.'),
      t('Fixes each, then runs the same search again.', 'يصلح كل موضع، ثم يعيد البحث نفسه.'),
    ],
    result: [t('The count fixed and a final empty search', 'عدد ما أصلحه، وبحث أخير بلا نتائج')],
    limits: [t('Keeps every place’s other behaviour unchanged.', 'يبقي باقي سلوك كل موضع كما هو.')],
    related: ['refactor', 'verify'],
  },
  'backend-request': {
    plain: t('A document you can send to the backend team as it is.', 'مستند ترسله إلى فريق الخادم كما هو.'),
    ask: [t('note that the API has no slug field', 'سجل أن الـ API ليس فيه حقل slug'), t('prepare the missing endpoints for the backend', 'جهّز الـ endpoints الناقصة لفريق الخادم')],
    steps: [
      t('Says what the user is doing and what is missing.', 'يذكر ما يفعله المستخدم وما الناقص.'),
      t('Shows the request and response wanted.', 'يعرض الطلب والرد المطلوب.'),
      t('Sets a priority and the odd cases.', 'يحدد الأولوية والحالات الخاصة.'),
    ],
    result: [t('docs/backend-requests.md, written for colleagues', 'docs/backend-requests.md، مكتوب للزملاء')],
    limits: [t('No frontend paths or internal names in it.', 'لا يكتب فيه مسارات الواجهة ولا أسماء داخلية.')],
    related: ['explain'],
  },
}
