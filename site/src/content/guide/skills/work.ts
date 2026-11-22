import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const work: Record<string, SkillGuide> = {
  setup: {
    plain: t(
      'The first thing you run. A plugin cannot write project rules by itself, so setup reads your project and installs them after you agree.',
      'أول ما تشغّله. الإضافة لا تكتب قواعد المشروع من تلقاء نفسها، لذلك يقرأ الإعداد مشروعك ويثبّتها بعد موافقتك.',
    ),
    ask: [t('/frontend-kit:setup', '/frontend-kit:setup')],
    steps: [
      t('Asks: new, existing, maintenance or refactor, and which kind of project.', 'يسأل: جديد أم قائم أم صيانة أم إعادة هيكلة، وأي نوع من المشاريع.'),
      t('Detects your stack from package.json and the config files.', 'يكتشف تقنياتك من package.json وملفات الإعداد.'),
      t('Shows one proposal: files, adaptations and clean-up.', 'يعرض مقترحاً واحداً: الملفات والتكييفات والتنظيف.'),
      t('After your yes, writes the files and shows a diff for any that exist.', 'بعد موافقتك يكتب الملفات ويعرض فروق الموجود منها.'),
    ],
    result: [
      t('CLAUDE.md and the rules', 'CLAUDE.md والقواعد'),
      t('Settings with permissions', 'إعدادات بالصلاحيات'),
      t('The kit’s config file', 'ملف إعداد العدّة'),
    ],
    limits: [
      t('Reads .env.example, never .env.', 'يقرأ ‎.env.example ولا يقرأ ‎.env.'),
      t('Does not commit, install packages unasked or restructure code.', 'لا يحفظ في git ولا يثبّت حزماً دون طلب ولا يعيد هيكلة الشيفرة.'),
    ],
    related: ['task', 'refactor-mode'],
    needs: t('Claude Code 2.1.295 or newer, jq, Node 20 or newer, and git.', 'Claude Code 2.1.295 أو أحدث وjq وNode 20 أو أحدث وgit.'),
  },
  task: {
    plain: t('One ticket from start to finish: branch, code, checks, report, and then your decision.', 'مهمة واحدة من البداية إلى النهاية: فرع وشيفرة وفحوص وتقرير، ثم قرارك.'),
    ask: [t('new task: add order export <ticket link>', 'مهمة جديدة: أضف تصدير الطلبات <رابط التذكرة>'), t('/frontend-kit:task', '/frontend-kit:task')],
    steps: [
      t('Says the task back in a few lines and asks if something decisive is unclear.', 'يعيد المهمة في أسطر ويسأل إن غمض أمر حاسم.'),
      t('Creates a branch from the latest main.', 'ينشئ فرعاً من أحدث main.'),
      t('Builds it with the matching skills and adds tests.', 'يبنيها بالمهارات المناسبة ويضيف الاختبارات.'),
      t('Verifies, gets a review and asks whether to commit and push.', 'يتحقق ويطلب مراجعة ثم يسأل عن الحفظ والرفع.'),
    ],
    result: [t('A verified task branch', 'فرع مهمة متحقق منه'), t('A short report with what was not checked', 'تقرير قصير بما لم يُفحص')],
    limits: [t('Never opens or merges a pull request.', 'لا يفتح طلب دمج ولا يدمجه.'), t('Never commits without your yes.', 'لا يحفظ دون موافقتك.')],
    related: ['verify', 'commit-push', 'pr-link'],
  },
  dev: {
    plain: t('Runs your app on its port and tells you when it really answers.', 'يشغّل تطبيقك على منفذه ويخبرك عندما يستجيب فعلاً.'),
    ask: [t('run the dashboard', 'شغّل لوحة التحكم'), t('restart the server, it serves stale code', 'أعد تشغيل الخادم فهو يقدّم شيفرة قديمة')],
    steps: [
      t('Looks at what holds the port.', 'يرى ما الذي يشغل المنفذ.'),
      t('Asks before stopping another project’s process.', 'يسأل قبل إيقاف عملية مشروع آخر.'),
      t('Clears the cache when needed and starts.', 'يمسح الذاكرة المؤقتة عند الحاجة ويشغّل.'),
      t('Waits for an answer before giving you the URL.', 'ينتظر الاستجابة قبل إعطائك الرابط.'),
    ],
    result: [t('A running app and its local URL', 'تطبيق يعمل ورابطه المحلي')],
    limits: [t('Never points the app at the live host.', 'لا يوجّه التطبيق إلى النطاق الحي.')],
    related: ['live-check', 'verify'],
  },
  explain: {
    plain: t('When you ask a question, you get an answer and not an edit.', 'عندما تسأل تحصل على جواب لا على تعديل.'),
    ask: [t('why does the cart refetch twice?', 'لماذا تُجلب السلة مرتين؟'), t('what endpoint does checkout use? explain for the team', 'أي نقطة يستعملها الدفع؟ اشرح للفريق')],
    steps: [
      t('Follows the code that really runs, down to the endpoint.', 'يتتبع الشيفرة التي تعمل فعلاً حتى نقطة الخادم.'),
      t('Reads git history for questions about why.', 'يقرأ تاريخ git لأسئلة السبب.'),
      t('Answers first, then shows the files and lines.', 'يجيب أولاً ثم يعرض الملفات والأسطر.'),
    ],
    result: [t('A plain answer with evidence', 'جواب واضح مع الدليل')],
    limits: [t('Edits nothing, even when it spots a bug. It offers instead.', 'لا يعدّل شيئاً حتى لو رأى خطأ، بل يعرض الإصلاح.')],
    related: ['backend-request'],
  },
  refactor: {
    plain: t('Makes code cleaner while it keeps doing exactly the same thing.', 'ينظّف الشيفرة وهي تفعل الشيء نفسه تماماً.'),
    ask: [t('split this 700-line page', 'قسّم هذه الصفحة ذات الـ700 سطر'), t('clean up and remove the duplication', 'نظّف واحذف التكرار')],
    steps: [
      t('Makes sure tests cover the code first.', 'يتأكد أولاً أن الاختبارات تغطي الشيفرة.'),
      t('Makes one kind of change at a time.', 'يجري نوعاً واحداً من التغيير في كل مرة.'),
      t('Runs the checks after each small step.', 'يشغّل الفحوص بعد كل خطوة صغيرة.'),
      t('Moves files with git and updates importers.', 'ينقل الملفات بـ git ويحدّث مستورديها.'),
    ],
    result: [t('Smaller files and the same behaviour', 'ملفات أصغر والسلوك نفسه'), t('Green checks', 'فحوص ناجحة')],
    limits: [t('A behaviour change becomes a separate task.', 'تغيير السلوك يصبح مهمة منفصلة.')],
    related: ['refactor-mode', 'fix-everywhere'],
  },
  'refactor-mode': {
    plain: t('Brings a whole old project up to the standard, in phases you approve.', 'يرفع مشروعاً قديماً كاملاً إلى المعيار، على مراحل توافق عليها.'),
    ask: [t('/frontend-kit:refactor-mode audit', '/frontend-kit:refactor-mode audit'), t('/frontend-kit:refactor-mode next', '/frontend-kit:refactor-mode next')],
    steps: [
      t('on: switches the project into the mode.', 'on: ينقل المشروع إلى هذا النمط.'),
      t('audit: measures everything without editing code and writes a six-phase plan.', 'audit: يقيس كل شيء دون تعديل ويكتب خطة من ست مراحل.'),
      t('next: runs one approved phase and compares with the first measurement.', 'next: ينفّذ مرحلة موافقاً عليها ويقارنها بالقياس الأول.'),
      t('status and off: show progress, or return to normal.', 'status وoff: عرض التقدم أو العودة إلى الوضع العادي.'),
    ],
    result: [t('docs/refactor-plan.md', 'docs/refactor-plan.md'), t('One commit per phase, after your yes', 'حفظ واحد لكل مرحلة بعد موافقتك')],
    limits: [
      t('Keeps your own folder layout unless you pick another.', 'يبقي ترتيب مجلداتك ما لم تختر غيره.'),
      t('No skipped tests or new suppressions. The guard catches the common forms, the rest is instruction.', 'لا اختبارات متخطاة ولا إسكات للأخطاء. الحارس يلتقط الصيغ الشائعة والباقي تعليمات.'),
    ],
    related: ['refactor', 'verify'],
  },
  mode: {
    plain: t(
      'A switch for how careful the work must be: a freeze before a release, a hotfix, a read-only review. Only you turn it.',
      'مفتاح يحدد مقدار الحذر في العمل: تجميد قبل الإصدار أو إصلاح عاجل أو مراجعة بالقراءة فقط. ولا يحرّكه إلا أنت.',
    ),
    ask: [t('/frontend-kit:mode freeze --days 3', '/frontend-kit:mode freeze --days 3'), t('/frontend-kit:mode off', '/frontend-kit:mode off')],
    steps: [
      t('list: names every mode and what it enforces.', 'list: يعرض كل نمط وما يفرضه.'),
      t('A mode’s name turns it on, for the project or for this checkout.', 'اسم النمط يشغّله، للمشروع أو لهذه النسخة.'),
      t('status shows what is on, and off leaves it.', 'status يعرض المفعّل، وoff يخرج منه.'),
    ],
    result: [
      t('The mode’s rules, repeated to Claude while it is on', 'قواعد النمط تُكرَّر على Claude ما دام مفعّلاً'),
      t('A guard on what a hook can see', 'حارس على ما يستطيع الـ hook رؤيته'),
    ],
    limits: [
      t('A guard rail, not a sandbox: in the shell it catches common forms only.', 'حاجز أمان لا بيئة معزولة: لا يلتقط في الطرفية إلا الصيغ الشائعة.'),
      t('A mode adds restrictions. It never lifts a guard.', 'النمط يضيف قيوداً ولا يرفع حارساً.'),
    ],
    related: ['refactor-mode', 'upgrade-mode'],
    needs: t('jq', 'jq'),
  },
  'upgrade-mode': {
    plain: t(
      'A major upgrade done as its own job: one family of packages, in phases you approve, proven by the whole test suite.',
      'ترقية كبيرة كمهمة مستقلة: عائلة حزم واحدة، على مراحل توافق عليها، تثبتها كل الاختبارات.',
    ),
    ask: [t('/frontend-kit:upgrade-mode on', '/frontend-kit:upgrade-mode on'), t('/frontend-kit:upgrade-mode plan', '/frontend-kit:upgrade-mode plan')],
    steps: [
      t('on: switches the project into upgrade mode.', 'on: ينقل المشروع إلى نمط الترقية.'),
      t('plan: records a baseline, reads the official guides and waits for your yes.', 'plan: يسجّل خط الأساس ويقرأ الأدلة الرسمية وينتظر موافقتك.'),
      t('next: runs the first pending phase, then compares the real numbers with the baseline.', 'next: ينفّذ أول مرحلة متبقية ثم يقارن الأرقام الحقيقية بخط الأساس.'),
      t('off: returns to normal work. The plan stays.', 'off: يعود إلى العمل العادي، وتبقى الخطة.'),
    ],
    result: [t('docs/upgrade-plan.md', 'docs/upgrade-plan.md'), t('One commit per phase, after your yes', 'حفظ واحد لكل مرحلة بعد موافقتك')],
    limits: [
      t('No forced peer versions, skipped tests or refreshed snapshots. The guard catches the common forms.', 'لا إصدارات مفروضة ولا اختبارات متخطاة ولا لقطات مجدّدة، والحارس يلتقط الصيغ الشائعة.'),
      t('No new features or clean-up inside an upgrade.', 'لا ميزات جديدة ولا تنظيف داخل الترقية.'),
    ],
    related: ['mode', 'verify'],
  },
  'fix-everywhere': {
    plain: t('For “fix all of them”. It proves that none is left.', 'لطلب «أصلحها كلها»، ويثبت أنه لم يبقَ شيء.'),
    ask: [t('fix this dropdown on every page', 'أصلح هذه القائمة في كل الصفحات'), t('check all, did you forget any?', 'افحص الكل، هل نسيت شيئاً؟')],
    steps: [
      t('Writes down what counts as an occurrence.', 'يحدد ما الذي يُعدّ موضعاً للمشكلة.'),
      t('Searches the whole source and prints the list.', 'يبحث في الشيفرة كلها ويعرض القائمة.'),
      t('Asks first when the list is long or needs a product decision.', 'يسأل أولاً إن طالت القائمة أو احتاجت قراراً.'),
      t('Fixes each, then runs the same search again.', 'يصلح كلاً منها ثم يعيد البحث نفسه.'),
    ],
    result: [t('The count fixed and a final empty search', 'عدد ما أُصلح وبحث أخير فارغ')],
    limits: [t('Keeps every place’s other behaviour unchanged.', 'يُبقي السلوك الآخر لكل موضع كما هو.')],
    related: ['refactor', 'verify'],
  },
  'backend-request': {
    plain: t('A document you can send to the backend team as it is.', 'مستند ترسله إلى فريق الخادم كما هو.'),
    ask: [t('note that the API has no slug field', 'دوّن أن الـ API لا يحوي حقل slug'), t('prepare the missing endpoints for the backend', 'جهّز النقاط الناقصة لفريق الخادم')],
    steps: [
      t('Says what the user is doing and what is missing.', 'يذكر ما يفعله المستخدم وما ينقص.'),
      t('Shows the request and response wanted.', 'يعرض الطلب والاستجابة المطلوبين.'),
      t('Sets a priority and the odd cases.', 'يحدد الأولوية والحالات الخاصة.'),
    ],
    result: [t('docs/backend-requests.md, written for colleagues', 'docs/backend-requests.md مكتوب للزملاء')],
    limits: [t('No frontend paths or internal names in it.', 'لا مسارات ولا أسماء داخلية من الواجهة.')],
    related: ['explain'],
  },
}
