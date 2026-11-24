import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const work: Record<string, SkillGuide> = {
  setup: {
    plain: t(
      'The first thing you run. A plugin cannot write project rules by itself, so setup reads your project and installs them after you agree.',
      'أول شي تشغّله. الإضافة ما تقدر تكتب قواعد المشروع بنفسها، فـ setup يقرأ مشروعك ويثبّتها بعد ما توافق.',
    ),
    ask: [t('/frontend-kit:setup', '/frontend-kit:setup')],
    steps: [
      t('Asks: new, existing, maintenance or refactor, and which kind of project.', 'يسألك: جديد، أو موجود، أو صيانة، أو إعادة هيكلة، وشنو نوع المشروع.'),
      t('Detects your stack from package.json and the config files.', 'يعرف التقنيات اللي تستعملها من package.json وملفات الإعدادات.'),
      t('Shows one proposal: files, adaptations and clean-up.', 'يعرض مقترح واحد: الملفات، والتعديلات اللي تناسب مشروعك، والتنظيف.'),
      t('After your yes, writes the files and shows a diff for any that exist.', 'بعد ما توافق يكتب الملفات، واللي موجود منها يعرضلك الفرق بيه.'),
    ],
    result: [
      t('CLAUDE.md and the rules', 'CLAUDE.md والقواعد'),
      t('Settings with permissions', 'إعدادات فيها الصلاحيات'),
      t('The kit’s config file', 'ملف إعدادات العدّة'),
    ],
    limits: [
      t('Reads .env.example, never .env.', 'يقرأ ‎.env.example ولا يقرأ ‎.env.'),
      t('Does not commit, install packages unasked or restructure code.', 'ما يحفظ بـ git، ولا يثبّت حزم بدون ما تطلب، ولا يعيد هيكلة الكود.'),
    ],
    related: ['task', 'refactor-mode'],
    needs: t('Claude Code 2.1.295 or newer, jq, Node 20 or newer, and git.', 'Claude Code 2.1.295 أو أحدث وjq وNode 20 أو أحدث وgit.'),
  },
  task: {
    plain: t('One ticket from start to finish: branch, code, checks, report, and then your decision.', 'مهمة وحدة من البداية للنهاية: فرع، وكود، وفحوص، وتقرير، وبعدين إنت تقرر.'),
    ask: [t('new task: add order export <ticket link>', 'مهمة جديدة: ضيف تصدير للطلبات <رابط التذكرة>'), t('/frontend-kit:task', '/frontend-kit:task')],
    steps: [
      t('Says the task back in a few lines and asks if something decisive is unclear.', 'يعيدلك المهمة بكم سطر، ويسألك إذا شي مهم مو واضح.'),
      t('Creates a branch from the latest main.', 'يسوي فرع من آخر main.'),
      t('Builds it with the matching skills and adds tests.', 'يبنيها بالمهارات المناسبة ويضيف اختبارات.'),
      t('Verifies, gets a review and asks whether to commit and push.', 'يتحقق، وياخذ مراجعة، وبعدين يسألك يحفظ ويرفع أو لا.'),
    ],
    result: [t('A verified task branch', 'فرع مهمة متحقق منه'), t('A short report with what was not checked', 'تقرير قصير، ويذكر شنو ما انفحص')],
    limits: [t('Never opens or merges a pull request.', 'ما يفتح الـ pull request ولا يدمجه أبداً.'), t('Never commits without your yes.', 'ما يحفظ بدون موافقتك.')],
    related: ['verify', 'commit-push', 'pr-link'],
  },
  dev: {
    plain: t('Runs your app on its port and tells you when it really answers.', 'يشغّل تطبيقك على منفذه، ويخبرك لما يصير يستجيب فعلاً.'),
    ask: [t('run the dashboard', 'شغّل الداشبورد'), t('restart the server, it serves stale code', 'عيد تشغيل السيرفر، يعرض كود قديم')],
    steps: [
      t('Looks at what holds the port.', 'يشوف شنو شاغل المنفذ.'),
      t('Asks before stopping another project’s process.', 'يسألك قبل ما يوقف عملية لمشروع ثاني.'),
      t('Clears the cache when needed and starts.', 'يمسح الكاش إذا احتاج، ويشغّل.'),
      t('Waits for an answer before giving you the URL.', 'ينتظر لحد ما يستجيب، وبعدين يعطيك الرابط.'),
    ],
    result: [t('A running app and its local URL', 'تطبيق شغّال ورابطه المحلي')],
    limits: [t('Never points the app at the live host.', 'ما يربط التطبيق بالسيرفر الحي أبداً.')],
    related: ['live-check', 'verify'],
  },
  explain: {
    plain: t('When you ask a question, you get an answer and not an edit.', 'إذا سألت سؤال، تاخذ جواب مو تعديل.'),
    ask: [t('why does the cart refetch twice?', 'ليش السلة تنجلب مرتين؟'), t('what endpoint does checkout use? explain for the team', 'الدفع شنو الـ endpoint اللي يستعمله؟ اشرحها للفريق')],
    steps: [
      t('Follows the code that really runs, down to the endpoint.', 'يتتبع الكود اللي يشتغل فعلاً، لحد نقطة السيرفر.'),
      t('Reads git history for questions about why.', 'يقرأ تاريخ git إذا السؤال عن «ليش».'),
      t('Answers first, then shows the files and lines.', 'يجاوب أول، وبعدين يعرض الملفات والأسطر.'),
    ],
    result: [t('A plain answer with evidence', 'جواب واضح مع الدليل')],
    limits: [t('Edits nothing, even when it spots a bug. It offers instead.', 'ما يعدّل شي حتى لو شاف خطأ. بداله يعرض عليك الإصلاح.')],
    related: ['backend-request'],
  },
  refactor: {
    plain: t('Makes code cleaner while it keeps doing exactly the same thing.', 'ينظّف الكود، وهو يبقى يسوي نفس الشي بالضبط.'),
    ask: [t('split this 700-line page', 'قسّم هالصفحة اللي طولها 700 سطر'), t('clean up and remove the duplication', 'نظّفه وشيل التكرار')],
    steps: [
      t('Makes sure tests cover the code first.', 'يتأكد أول إن الاختبارات تغطي الكود.'),
      t('Makes one kind of change at a time.', 'يسوي نوع واحد من التغيير كل مرة.'),
      t('Runs the checks after each small step.', 'يشغّل الفحوص بعد كل خطوة صغيرة.'),
      t('Moves files with git and updates importers.', 'ينقل الملفات بـ git ويحدّث الملفات اللي تستوردها.'),
    ],
    result: [t('Smaller files and the same behaviour', 'ملفات أصغر ونفس السلوك'), t('Green checks', 'فحوص ناجحة')],
    limits: [t('A behaviour change becomes a separate task.', 'أي تغيير بالسلوك يصير مهمة لحالها.')],
    related: ['refactor-mode', 'fix-everywhere'],
  },
  'refactor-mode': {
    plain: t('Brings a whole old project up to the standard, in phases you approve.', 'يرفع مشروع قديم كله للمعيار، على مراحل إنت توافق عليها.'),
    ask: [t('/frontend-kit:refactor-mode audit', '/frontend-kit:refactor-mode audit'), t('/frontend-kit:refactor-mode next', '/frontend-kit:refactor-mode next')],
    steps: [
      t('on: switches the project into the mode.', 'on: يحوّل المشروع لهالنمط.'),
      t('audit: measures everything without editing code and writes a six-phase plan.', 'audit: يقيس كل شي بدون ما يعدّل الكود، ويكتب خطة من ست مراحل.'),
      t('next: runs one approved phase and compares with the first measurement.', 'next: ينفّذ مرحلة وحدة موافق عليها، ويقارنها بأول قياس.'),
      t('status and off: show progress, or return to normal.', 'status وoff: يعرض التقدم، أو يرجع للوضع العادي.'),
    ],
    result: [t('docs/refactor-plan.md', 'docs/refactor-plan.md'), t('One commit per phase, after your yes', 'حفظ واحد لكل مرحلة، بعد ما توافق')],
    limits: [
      t('Keeps your own folder layout unless you pick another.', 'يخلّي ترتيب مجلداتك مثل ما هو، إلا إذا اخترت غيره.'),
      t('No skipped tests or new suppressions. The guard catches the common forms, the rest is instruction.', 'لا اختبارات متخطّاة ولا إسكات للأخطاء. الحارس يمسك الصيغ الشائعة، والباقي تعليمات.'),
    ],
    related: ['refactor', 'verify'],
  },
  mode: {
    plain: t(
      'A switch for how careful the work must be: a freeze before a release, a hotfix, a read-only review. Only you turn it.',
      'مفتاح يحدد قد إيش لازم يكون الشغل حذر: تجميد قبل الإصدار، أو إصلاح مستعجل، أو مراجعة بالقراءة بس. وما يحرّكه غيرك.',
    ),
    ask: [t('/frontend-kit:mode freeze --days 3', '/frontend-kit:mode freeze --days 3'), t('/frontend-kit:mode off', '/frontend-kit:mode off')],
    steps: [
      t('list: names every mode and what it enforces.', 'list: يعرض كل نمط وشنو يفرض.'),
      t('A mode’s name turns it on, for the project or for this checkout.', 'اسم النمط يشغّله، للمشروع كله أو لهالنسخة.'),
      t('status shows what is on, and off leaves it.', 'status يعرض شنو مفعّل، وoff يطلع منه.'),
    ],
    result: [
      t('The mode’s rules, repeated to the assistant while it is on', 'قواعد النمط تنعاد على المساعد طول ما هو مفعّل'),
      t('A guard on what a hook can see', 'حماية على اللي يقدر يشوفه الحارس'),
    ],
    limits: [
      t('A guard rail, not a sandbox: in the shell it catches common forms only.', 'حاجز أمان، مو بيئة معزولة: بالطرفية يمسك الصيغ الشائعة بس.'),
      t('A mode adds restrictions. It never lifts a guard.', 'النمط يضيف قيود، وما يشيل أي حارس.'),
    ],
    related: ['refactor-mode', 'upgrade-mode'],
    needs: t('jq', 'jq'),
  },
  'upgrade-mode': {
    plain: t(
      'A major upgrade done as its own job: one family of packages, in phases you approve, proven by the whole test suite.',
      'ترقية كبيرة كشغلة لحالها: عائلة حزم وحدة، على مراحل توافق عليها، وكل الاختبارات تثبتها.',
    ),
    ask: [t('/frontend-kit:upgrade-mode on', '/frontend-kit:upgrade-mode on'), t('/frontend-kit:upgrade-mode plan', '/frontend-kit:upgrade-mode plan')],
    steps: [
      t('on: switches the project into upgrade mode.', 'on: يحوّل المشروع لنمط الترقية.'),
      t('plan: records a baseline, reads the official guides and waits for your yes.', 'plan: يسجّل خط الأساس، ويقرأ الأدلة الرسمية، وينتظر موافقتك.'),
      t('next: runs the first pending phase, then compares the real numbers with the baseline.', 'next: ينفّذ أول مرحلة باقية، وبعدين يقارن الأرقام الحقيقية بخط الأساس.'),
      t('off: returns to normal work. The plan stays.', 'off: يرجع للشغل العادي، والخطة تبقى.'),
    ],
    result: [t('docs/upgrade-plan.md', 'docs/upgrade-plan.md'), t('One commit per phase, after your yes', 'حفظ واحد لكل مرحلة، بعد ما توافق')],
    limits: [
      t('No forced peer versions, skipped tests or refreshed snapshots. The guard catches the common forms.', 'لا إصدارات مفروضة بالقوة، ولا اختبارات متخطّاة، ولا لقطات مجدّدة. والحارس يمسك الصيغ الشائعة.'),
      t('No new features or clean-up inside an upgrade.', 'لا ميزات جديدة ولا تنظيف وسط الترقية.'),
    ],
    related: ['mode', 'verify'],
  },
  'fix-everywhere': {
    plain: t('For “fix all of them”. It proves that none is left.', 'لما تقول «صلّحها كلها». ويثبتلك إنه ما بقى ولا وحدة.'),
    ask: [t('fix this dropdown on every page', 'صلّح هالقائمة بكل الصفحات'), t('check all, did you forget any?', 'افحص الكل، نسيت شي؟')],
    steps: [
      t('Writes down what counts as an occurrence.', 'يحدد شنو ينحسب موضع للمشكلة.'),
      t('Searches the whole source and prints the list.', 'يدوّر بالكود كله ويعرض القائمة.'),
      t('Asks first when the list is long or needs a product decision.', 'يسألك أول إذا القائمة طويلة أو تحتاج قرار.'),
      t('Fixes each, then runs the same search again.', 'يصلّح كل وحدة، وبعدين يعيد نفس البحث.'),
    ],
    result: [t('The count fixed and a final empty search', 'عدد اللي تصلّح، وبحث أخير فاضي')],
    limits: [t('Keeps every place’s other behaviour unchanged.', 'يخلّي باقي سلوك كل موضع مثل ما هو.')],
    related: ['refactor', 'verify'],
  },
  'backend-request': {
    plain: t('A document you can send to the backend team as it is.', 'مستند تبعثه لفريق السيرفر مثل ما هو.'),
    ask: [t('note that the API has no slug field', 'سجّل إن الـ API ما فيه حقل slug'), t('prepare the missing endpoints for the backend', 'جهّزلي الـ endpoints الناقصة لفريق السيرفر')],
    steps: [
      t('Says what the user is doing and what is missing.', 'يذكر شنو يسوي المستخدم وشنو ناقص.'),
      t('Shows the request and response wanted.', 'يعرض الطلب والرد المطلوبين.'),
      t('Sets a priority and the odd cases.', 'يحدد الأولوية والحالات الخاصة.'),
    ],
    result: [t('docs/backend-requests.md, written for colleagues', 'docs/backend-requests.md، مكتوب للزملاء')],
    limits: [t('No frontend paths or internal names in it.', 'ما فيه مسارات ولا أسماء داخلية من الواجهة.')],
    related: ['explain'],
  },
}
