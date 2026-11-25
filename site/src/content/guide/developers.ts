import { t } from './text.ts'

/** The page for people who can code, or build by describing what they want, and the backend developers who need a frontend. */
export const developers = {
  who: {
    title: t('Who it is for', 'لمن هي'),
    lead: t(
      'You keep the code. The kit adds conventions and checks to Claude Code, and it does not ask you to write code, so it fits three kinds of people.',
      'الكود يبقى لك. تضيف «واجهة» أعرافا وفحوصا إلى ⁦Claude Code⁩، ولا تطلب منك أن تكتب كودا، ولهذا تناسب ثلاثة أنواع من الناس.',
    ),
    items: [
      {
        name: t('People who do not code', 'من لا يبرمج'),
        text: t('You answer plain questions and look at the result. The start page is written for you.', 'تجيب عن أسئلة بسيطة وتنظر إلى النتيجة. وصفحة البدء مكتوبة لك.'),
      },
      {
        name: t('Vibe coders', 'من يبني بالذكاء الاصطناعي (vibe coding)'),
        text: t(
          'You build by describing what you want and letting the assistant write it. The kit gives that assistant standards to follow and checks that run before it says it is done, so the project stays tidy as it grows.',
          'تبني بأن تصف ما تريده ويكتبه المساعد. وتعطي الإضافة هذا المساعد معايير يتبعها وفحوصا تعمل قبل أن يقول إنه انتهى، فيبقى المشروع مرتبا وهو يكبر.',
        ),
      },
      {
        name: t('Backend developers who need a frontend', 'مطورو الخادم الخلفي الذين يحتاجون واجهة'),
        text: t(
          'You have the API and you need the screens: a website, or an admin dashboard with tables, forms and permissions. The kit builds them in a structure you can read and take over.',
          'عندك الخادم وتحتاج الشاشات: موقعا، أو لوحة تحكم فيها جداول ونماذج وصلاحيات. وتبنيها الإضافة بهيكل تستطيع أن تقرأه وتتسلمه.',
        ),
      },
    ],
  },
  tidy: {
    title: t('How does it stay tidy?', 'كيف يبقى مرتبا؟'),
    items: [
      t('Before it creates a component, a hook or a form, it looks for one you already have, and starts from the nearest example in your project.', 'قبل أن ينشئ مكوّنا أو hook أو نموذجا يبحث عن واحد موجود عندك، ويبدأ من أقرب مثال في مشروعك.'),
      t('It follows the naming and folder rules kept in your project, and a project map of where each role lives.', 'يتبع قواعد التسمية والمجلدات المحفوظة في مشروعك، وخريطة المشروع التي تبين أين يوجد كل دور.'),
      t('When you say “task”, it works on its own branch from your default branch, so a change is easy to review or drop.', 'وعندما تقول «مهمة» يعمل على فرع خاص من فرعك الافتراضي، فيسهل أن تراجع التغيير أو تتخلى عنه.'),
      t('Before it says it is done, the final check runs your typecheck and the related tests, and a reviewer specialist reads the change.', 'وقبل أن يقول إنه انتهى يشغل الفحص الأخير فحص الأنواع والاختبارات المرتبطة، ويقرأ مختص مراجعة التغيير.'),
    ],
    see: t('See two of the rules it follows:', 'شاهد قاعدتين من التي يتبعها:'),
    limits: t('This lowers the mess. It does not promise there will be none.', 'هذا يقلل الفوضى، ولا يعد بألا تكون هناك فوضى.'),
  },
  existing: {
    title: t('I already have a project', 'عندي مشروع جاهز'),
    messy: t('If your project is already a mess, read how a refactor works: it measures the mess, writes a plan in phases you approve, and restructures one phase at a time.', 'وإن كان مشروعك مبعثرا أصلا، فاقرأ كيف تعمل إعادة الهيكلة: تقيس الفوضى، وتكتب خطة بمراحل توافق عليها، وتعيد الهيكلة مرحلة مرحلة.'),
    messyLink: t('Fix an old project', 'إصلاح مشروع قديم'),
    text: t(
      'Choose “existing project” at setup. The kit keeps your structure and follows your stack. Setup is a written procedure that Claude follows. For every existing file it would touch, Claude is told to show you the difference and ask: overwrite, merge or skip. Permission lists are merged, not replaced, and the values you already set stay.',
      'اختر «مشروع موجود» عند الإعداد. تبقي الإضافة هيكلك وتتبع تقنياتك. والإعداد إجراء مكتوب يتبعه ⁦Claude⁩: ولكل ملف موجود يريد أن يلمسه يُطلب منه أن يريك الفرق ويسألك: استبدال أو دمج أو تخطٍّ. وتُدمج قوائم الصلاحيات ولا تُستبدل، وتبقى القيم التي ضبطتها.',
    ),
  },
  terminal: {
    title: t('Install from a terminal', 'التثبيت من الطرفية'),
    lead: t(
      'In Claude Code, in the terminal or in an editor, type these three lines one at a time. Then restart Claude Code.',
      'في ⁦Claude Code⁩، في الطرفية أو في محرر، اكتب هذه الأسطر الثلاثة واحدا بعد الآخر. ثم أعد تشغيل ⁦Claude Code⁩.',
    ),
    commands: ['/plugin marketplace add DiyarFirasmusa/wajiha-kit', '/plugin install wajiha-kit@wajiha-kit', '/wajiha-kit:setup'],
    needs: t(
      'You need jq (Mac: brew install jq, Windows: winget install jqlang.jq, Linux: sudo apt install jq), Node 20 or later, git, and Claude Code 2.1.295 or later. Older Claude Code versions let a call through when a safety check times out or cannot start.',
      'تحتاج ⁦jq⁩ (على ماك ⁦brew install jq⁩، وعلى ويندوز ⁦winget install jqlang.jq⁩، وعلى لينكس ⁦sudo apt install jq⁩)، و⁦Node⁩ 20 أو أحدث، و⁦git⁩، و⁦Claude Code⁩ 2.1.295 أو أحدث. فالنسخ الأقدم من ⁦Claude Code⁩ تمرّر الأمر إذا انتهت مهلة فحص الأمان أو لم يستطع أن يبدأ.',
    ),
    note: t(
      'This is the same kit as the one-message install in the Claude app. Only the way you start it differs.',
      'هذه هي الإضافة نفسها التي تُثبَّت برسالة واحدة في تطبيق ⁦Claude⁩. وما يختلف هو طريقة البدء فقط.',
    ),
  },
  safe: {
    title: t('Try it safely', 'جرّبها بأمان'),
    text: t(
      'Install it at project scope (`--scope project`, or choose project when `/plugin install` asks): the checks come from the plugin, not from the branch, so a user-scope install would guard every project on your computer. Make a trial branch first (`git switch -c try-wajiha`; if the project is not a git repository, copy the whole folder), run setup there, and commit nothing until you have read the differences.',
      'ثبّتها على مستوى المشروع (`--scope project`، أو اختر المشروع عندما يسألك `/plugin install`): فالفحوص تأتي من الإضافة لا من الفرع، والتثبيت على مستوى المستخدم يحرس كل مشاريع حاسوبك. أنشئ فرع تجربة أولا (`git switch -c try-wajiha`؛ وإن لم يكن المشروع مستودع ⁦git⁩ فانسخ المجلد كله)، وشغّل الإعداد هناك، ولا تعمل ⁦commit⁩ حتى تقرأ الفروق.',
    ),
    undo: t(
      'To undo: commit the setup on the trial branch, switch back to your branch and delete the trial branch. Setup also adds the kit to `.claude/settings.json`, so teammates are asked to install it: deleting the branch removes that too. Delete `.claude/state/` and `.claude/kit-backup/` yourself: git does not track them. Then run the two commands below. If you remove the kit without a trial branch, the files setup wrote stay: delete `.claude/rules/`, `.claude/wajiha-kit.json`, `.claude/state/`, and the kit’s parts of `CLAUDE.md` and `.claude/settings.json` (it still names skills that no longer exist).',
      'وللتراجع: اعمل ⁦commit⁩ للإعداد على فرع التجربة، ثم ارجع إلى فرعك واحذف فرع التجربة. ويضيف الإعداد الإضافة أيضا إلى `.claude/settings.json` فيُطلب من زملائك تثبيتها: وحذف الفرع يزيل ذلك أيضا. واحذف `.claude/state/` و`.claude/kit-backup/` بنفسك: فلا يتتبعهما ⁦git⁩. ثم شغّل الأمرين أدناه. وإن أزلت الإضافة دون فرع تجربة فتبقى الملفات التي كتبها الإعداد: احذف `.claude/rules/` و`.claude/wajiha-kit.json` و`.claude/state/`، وأجزاء الإضافة من `CLAUDE.md` و`.claude/settings.json` (فهي ما زالت تذكر مهارات لم تعد موجودة).',
    ),
    commands: ['claude plugin uninstall wajiha-kit@wajiha-kit --scope project', 'claude plugin marketplace remove wajiha-kit'],
  },
  setup: {
    title: t('What setup asks and writes', 'ماذا يسأل الإعداد وماذا يكتب'),
    lead: t(
      'Setup asks two things first. What are we doing: a new project, an existing project, one in maintenance, or a refactor. And what kind of project:',
      'يسأل الإعداد سؤالين أولا. ماذا نفعل: مشروعا جديدا، أو مشروعا موجودا، أو في صيانة، أو إعادة هيكلة. وأي نوع من المشاريع:',
    ),
    kinds: [
      t('website: TanStack Start, for server rendering and search engines.', 'موقع: ⁦TanStack Start⁩، للعرض من الخادم ولمحركات البحث.'),
      t('dashboard: TanStack Table and Query with permissions, on Vite and TanStack Router, on TanStack Start in SPA mode, or on Next.js. You pick the framework.', 'لوحة تحكم: ⁦TanStack Table⁩ و⁦Query⁩ مع صلاحيات، على ⁦Vite⁩ و⁦TanStack Router⁩، أو على ⁦TanStack Start⁩ بنمط الصفحة الواحدة، أو على ⁦Next.js⁩. وتختار أنت الإطار.'),
      t('website and dashboard in one project: a site and an admin in one tree, each with its own rules, skills and checks.', 'موقع ولوحة تحكم في مشروع واحد: موقع ولوحة إدارة في شجرة واحدة، لكل منهما قواعده ومهاراته وفحوصه.'),
      t('any other frontend: Next.js, React Router, Vue, Nuxt, Svelte, Angular or plain. The profile is called react for historical reasons.', 'أي واجهة أخرى: ⁦Next.js⁩ أو ⁦React Router⁩ أو ⁦Vue⁩ أو ⁦Nuxt⁩ أو ⁦Svelte⁩ أو ⁦Angular⁩ أو عادية. واسم النوع ⁦react⁩ لأسباب تاريخية.'),
    ],
    scope: t(
      'The table, form and permissions skills (`dash-*`) and TanStack Table and Query are for React. Other frameworks get the neutral rules without them.',
      'مهارات الجداول والنماذج والصلاحيات (`dash-*`) و⁦TanStack Table⁩ و⁦Query⁩ لـ ⁦React⁩. أما الأطر الأخرى فتأخذ القواعد المحايدة بدونها.',
    ),
    keep: t(
      'In an existing project it reads `package.json` and follows your package manager, framework, formatter and tests. A new dashboard starts from a fixed stack: React, Vite, TanStack Router, Query and Table, axios, zod and react-hook-form, Zustand, Tailwind, i18next, Sentry (error reports go to a third party) and husky with commitlint. Change the rules if you want something else. The “website” kind is TanStack Start only. A dashboard can also run on TanStack Start; for any other framework, choose “any other frontend”.',
      'في مشروع موجود تقرأ `package.json` وتتبع مدير الحزم والإطار والمنسّق والاختبارات عندك. أما لوحة التحكم الجديدة فتبدأ من مجموعة ثابتة: ⁦React⁩ و⁦Vite⁩ و⁦TanStack Router⁩ و⁦Query⁩ و⁦Table⁩ و⁦axios⁩ و⁦zod⁩ و⁦react-hook-form⁩ و⁦Zustand⁩ و⁦Tailwind⁩ و⁦i18next⁩ و⁦Sentry⁩ (تذهب تقارير الأخطاء إلى طرف ثالث) و⁦husky⁩ مع ⁦commitlint⁩. وغيّر القواعد إن أردت غير ذلك. ونوع «موقع» يعمل على ⁦TanStack Start⁩ فقط. ويمكن أن تعمل لوحة التحكم عليه أيضا. ولأي إطار آخر اختر «أي واجهة أخرى».',
    ),
    detects: t(
      'Then it detects your stack (package manager, framework, router, data layer, styling, tests, linter, formatter, i18n and source folders) and adapts the copied rules, permissions and hook commands to it.',
      'ثم يكتشف تقنياتك (مدير الحزم، والإطار، والموجّه، وطبقة البيانات، والتنسيق، والاختبارات، والمدقق، والمنسّق، والترجمة، ومجلدات الكود) ويضبط عليها القواعد والصلاحيات وأوامر الفحوص المنسوخة.',
    ),
    writes: [
      ['CLAUDE.md', t('What the project is, the rules to follow and how to run it.', 'ما المشروع، والقواعد المتبعة، وكيف يُشغَّل.')],
      ['.claude/rules/', t('The written standards, loaded when the assistant works on a matching file.', 'المعايير المكتوبة، وتُقرأ عندما يعمل المساعد على ملف مطابق.')],
      ['.claude/settings.json', t('What it may do freely, what it must ask about, and what it may never do.', 'ما يفعله بحرية، وما عليه أن يسأل عنه، وما يمنع عليه.')],
      ['.claude/wajiha-kit.json', t('The values the skills and the checks read: protected branches, ports, hosts, commands and the working mode.', 'القيم التي تقرؤها المهارات والفحوص: الفروع المحمية والمنافذ والمضيفون والأوامر ونمط العمل.')],
    ] as const,
    approval: t(
      'Setup shows a list before it writes the kit files and waits for your yes. It asks separately about `.gitignore` and the helper tools, and creates `.env.example` when neither .env nor `.env.example` exists. Claude Code may ask you to approve writes inside `.claude/`. The templates assume Arabic (right to left) and English, and setup does not ask about languages, so in a single-language project edit `CLAUDE.md` and the wording of the task skill. It does not commit. Rules left over from another project type are moved to `.claude/kit-backup/`. It adds scripts such as check, lint and fmt to `package.json`; the `i18n:validate` script needs Node 22.18 or later.',
      'يعرض الإعداد قائمة قبل أن يكتب ملفات الإضافة وينتظر موافقتك. ويسأل بشكل منفصل عن `.gitignore` والأدوات المساعدة، وينشئ `.env.example` إن لم يوجد ⁦.env⁩ ولا `.env.example`. وقد يطلب منك ⁦Claude Code⁩ أن توافق على الكتابة داخل `.claude/`. وتفترض القوالب العربية (من اليمين إلى اليسار) والإنجليزية، ولا يسأل الإعداد عن اللغات، فإن كان مشروعك بلغة واحدة فعدّل `CLAUDE.md` وصياغة مهارة المهام. ولا يعمل ⁦commit⁩. وتنتقل القواعد المتبقية من نوع مشروع آخر إلى `.claude/kit-backup/`. ويضيف سكربتات مثل ⁦check⁩ و⁦lint⁩ و⁦fmt⁩ إلى `package.json`؛ وسكربت `i18n:validate` يحتاج ⁦Node⁩ 22.18 أو أحدث.',
    ),
    own: t('These files are copies that belong to your project. Edit them, and review them in a pull request like any other file.', 'هذه الملفات نسخ تخص مشروعك. عدّلها وراجعها في طلب دمج مثل أي ملف آخر.'),
  },
  backend: {
    title: t('Your backend', 'خادمك الخلفي'),
    text: t(
      'If you have an OpenAPI description of your API, save it in the project as `docs/api/openapi.json` (as JSON: convert a YAML file to JSON yourself). Claude reads it when you ask for a table or a form, and copies its field names, paging and enums. It does not validate the file or generate a typed client: add one yourself if you want it. A very large file costs context.',
      'إن كان عندك وصف ⁦OpenAPI⁩ لخادمك، فاحفظه في المشروع باسم `docs/api/openapi.json` (بصيغة ⁦JSON⁩: حوّل ملف ⁦YAML⁩ إلى ⁦JSON⁩ بنفسك). يقرؤه ⁦Claude⁩ عندما تطلب جدولا أو نموذجا، وينقل منه أسماء الحقول والترقيم والقيم. ولا يتحقق من الملف ولا يولّد عميلا مكتوب الأنواع: أضف واحدا بنفسك إن أردت. والملف الكبير جدا يستهلك من السياق.',
    ),
    auth: t(
      'Dashboards assume a bearer access token held in memory and refreshed once on a 401. If your backend uses cookies or OIDC, change that rule in `.claude/rules/`. The API layer is axios. The refresh token goes in an `HttpOnly` cookie if your backend offers one, otherwise in `sessionStorage`, which JavaScript can read. An envelope such as { success, message, data } is unwrapped by code the assistant writes for your shape. Every successful non-GET request shows a toast, and an `Accept-Language` header is sent: change them in the `api-layer` rule.',
      'تفترض لوحات التحكم رمز وصول يُرسل في الترويسة ويُحفظ في الذاكرة ويُجدَّد مرة واحدة عند الخطأ 401. وإن كان خادمك يستخدم كوكيز أو ⁦OIDC⁩ فغيّر هذه القاعدة في `.claude/rules/`. وطبقة الاتصال تستخدم ⁦axios⁩. ورمز التجديد يُحفظ في كوكي `HttpOnly` إن وفّره خادمك، وإلا ففي `sessionStorage` الذي تستطيع ⁦JavaScript⁩ قراءته. وغلاف مثل ⁦{ success, message, data }⁩ يفتحه كود يكتبه المساعد لشكل استجابتك. وكل طلب ناجح غير ⁦GET⁩ يُظهر رسالة، وتُرسل ترويسة `Accept-Language`: وتغيّر ذلك في قاعدة `api-layer`.',
    ),
  },
  checks: {
    title: t('What the checks do', 'ماذا تفعل الفحوص'),
    lead: t('They are scripts that run on your computer, at fixed moments, with your permissions.', 'هي سكربتات تعمل على جهازك، في لحظات محددة، بصلاحياتك.'),
    items: [
      t('When source files in your watched folders change, the final check runs your typecheck and the unit tests related to them before Claude says it is done. It stays quiet in read-only mode, while a background specialist is still editing, when only a config file changed, and when jq is missing. It stops blocking after three failed tries in a row, and if it gives up, or finds no check tool installed, it tells you; run `npm run check` yourself when it matters.', 'عندما تتغير ملفات المصدر في المجلدات المراقَبة، يشغّل الفحص الأخير فحص الأنواع والاختبارات المرتبطة بها قبل أن يقول ⁦Claude⁩ إنه انتهى. ويسكت في نمط القراءة فقط، وأثناء عمل مختص في الخلفية، وحين يتغير ملف إعداد فقط، وحين يغيب ⁦jq⁩. ويتوقف عن المنع بعد ثلاث محاولات فاشلة متتالية، وإن توقف عن المنع أو لم يجد أداة فحص مثبتة فإنه يخبرك بذلك؛ فشغّل `npm run check` بنفسك عندما يهم الأمر.'),
      t('The final check and the review add to your Claude usage on every task. After a pass it asks Claude to start one review by the `frontend-reviewer` specialist, which runs on Opus. That is an instruction to Claude, not something the check enforces. Setting `stopGate.review` to false in `.claude/wajiha-kit.json` turns that off.', 'والفحص الأخير والمراجعة يزيدان استهلاكك في ⁦Claude⁩ في كل مهمة. وبعد النجاح يطلب من ⁦Claude⁩ أن يبدأ مراجعة واحدة من المختص `frontend-reviewer`، وهو يعمل على ⁦Opus⁩. وهذا طلب إلى ⁦Claude⁩ لا يفرضه الفحص. وضبط `stopGate.review` على ⁦false⁩ في `.claude/wajiha-kit.json` يوقفها.'),
      t('The formatter rewrites each edited file, so an unformatted existing codebase can show noisy differences at first. Format and lint get 60 seconds per file, the final check 120 seconds and the specialist typecheck 180 seconds. A check that runs out of time is cut off without a message, so run `npm run check` yourself when it matters.', 'يعيد المنسّق كتابة كل ملف يُعدَّل، فقد يُظهر مشروع غير منسّق فروقا كثيرة في البداية. ويُعطى التنسيق والتدقيق 60 ثانية لكل ملف، والفحص الأخير 120 ثانية، وفحص الأنواع لدى المختص 180 ثانية. والفحص الذي ينتهي وقته يُقطع دون رسالة، فشغّل `npm run check` بنفسك عندما يهم الأمر.'),
      t('Format and lint run on each file the assistant edits with its edit tools, with the tools your project already uses. A file changed through the shell is tracked but not formatted.', 'يعمل التنسيق والتدقيق على كل ملف يعدّله المساعد بأدوات التعديل، وبالأدوات التي يستخدمها مشروعك أصلا. أما ملف يتغير عبر نافذة الأوامر فيُتتبَّع ولا يُنسَّق.'),
      t('No commit, merge, cherry-pick or push on protected branches. No force push, `--no-verify`, `reset --hard`, `clean -f` or `checkout -f`.', 'لا حفظ نسخة (⁦commit⁩) ولا دمج ولا cherry-pick ولا رفع على الفروع المحمية. ولا رفع بالقوة ولا `--no-verify` ولا `reset --hard` ولا `clean -f` ولا `checkout -f`.'),
      t('The shell check refuses `gh pr create` and `gh pr merge` and GitHub API calls that open or merge a pull request, and writes to `.github/`. It does not see GitHub MCP tools or other command-line tools such as hub or glab.', 'يرفض فحص الأوامر `gh pr create` و`gh pr merge` واستدعاءات ⁦GitHub API⁩ التي تفتح طلب دمج أو تدمجه، والكتابة في `.github/`. ولا يرى أدوات ⁦GitHub MCP⁩ ولا أدوات الأوامر الأخرى مثل ⁦hub⁩ و⁦glab⁩.'),
      t('The usual routes to files named .env are blocked, and requests to hosts you list as live are refused.', 'تُسدّ الطرق المعتادة إلى ملفات ⁦.env⁩، وتُرفض الطلبات إلى المواقع التي تحدّدها على أنها منشورة.'),
    ],
    limits: t(
      'They run only inside Claude Code and do not replace CI: setup adds `npm run check` (typecheck, lint and unit tests; `check:full` adds more), so call it from your pipeline. They are a guard rail, not a sandbox. They read commands, but not what a script or a program does inside. Files you @-mention and MCP tools the matchers do not name are outside them. Keep branch protection on in your repository. The safety checks are scripts. The plugin’s automatic tests run on Linux; on Windows the checks were only tried by hand, so keep your work in Git.',
      'وهي تعمل داخل ⁦Claude Code⁩ فقط ولا تغني عن ⁦CI⁩: يضيف الإعداد `npm run check` (فحص الأنواع والتدقيق والاختبارات الوحدوية، و`check:full` يضيف أكثر)، فاستدعِه من خط البناء. وهي حاجز أمان وليست بيئة معزولة. تقرأ الأوامر لكنها لا ترى ما يفعله سكربت أو برنامج من الداخل. والملفات التي تذكرها بـ ⁦@⁩ وأدوات ⁦MCP⁩ التي لا تسميها المطابقات خارجها. أبقِ حماية الفروع مفعّلة في مستودعك. وفحوص الأمان سكربتات. وتعمل اختبارات الإضافة الآلية على لينكس؛ وعلى ويندوز جُرّبت الفحوص يدويا فقط، فاحتفظ بعملك في ⁦Git⁩.',
    ),
  },
  more: {
    title: t('Modes, settings and the source', 'الأنماط والإعدادات والمصدر'),
    text: t(
      'Nine working modes (new, existing, maintenance, refactor, upgrade, freeze, hotfix, read-only and prototype) change how careful the assistant is. Refactor mode audits a project, writes a phased plan you approve, and restructures one phase at a time. It records routes, exports, requests and keys first and compares them after each phase. A script blocks only skipped or removed tests, snapshot edits and suppression comments; the rest is an instruction Claude follows, so read each phase’s diff. After setup, updates are off: you update by hand after reading the changelog. The kit ships a `test-hooks.sh` script that tests the guards on your machine; the README says how to run it. The plugin starts no helper server by itself: setup asks once about the browser helpers and once about library documentation lookup (Context7), and writes them to `.mcp.json` only if you say yes. They run pinned third-party npm packages through npx, and the browser tools can read pages and local files. The code is under the MIT licence.',
      'تسعة أنماط عمل (جديد، وموجود، وصيانة، وإعادة هيكلة، وترقية، وتجميد، وإصلاح عاجل، وقراءة فقط، ونموذج أولي) تغيّر درجة حذر المساعد. ونمط إعادة الهيكلة يقيّم المشروع ويكتب خطة بمراحل توافق عليها ويعيد الهيكلة مرحلة مرحلة. ويسجل المسارات والتصديرات والطلبات والمفاتيح أولا ويقارنها بعد كل مرحلة. ولا يمنع سكربت إلا الاختبارات المتخطاة أو المحذوفة وتعديل اللقطات وتعليقات الإسكات؛ وما عدا ذلك تعليمات يتبعها ⁦Claude⁩، فاقرأ فروق كل مرحلة. وبعد الإعداد يكون التحديث مطفأ: تحدّث بنفسك بعد أن تقرأ سجل التغييرات. وتأتي الإضافة بسكربت `test-hooks.sh` يختبر الحواجز على جهازك؛ ويشرح ملف ⁦README⁩ كيف تشغله. ولا تشغّل الإضافة أي خادم مساعد من تلقاء نفسها: يسألك الإعداد مرة واحدة عن مساعدي المتصفح ومرة عن البحث في توثيق المكتبات (⁦Context7⁩)، ولا يكتبها في `.mcp.json` إلا إن وافقت. وتشغّل حزم ⁦npm⁩ لأطراف ثالثة بإصدار مثبّت عبر ⁦npx⁩، وتستطيع أدوات المتصفح قراءة الصفحات والملفات المحلية. والكود برخصة ⁦MIT⁩.',
    ),
  },
}
