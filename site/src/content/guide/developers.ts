import { t } from './text.ts'

/** The page for people who can code, or build by describing what they want, and the backend developers who need a frontend. */
export const developers = {
  who: {
    title: t('Who it is for', 'لمن هي'),
    lead: t(
      'Wajiha Kit does not ask you to write code. That is why it fits three kinds of people.',
      '«واجهة» لا تطلب منك أن تكتب كودا. ولهذا تناسب ثلاثة أنواع من الناس.',
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
    own: t('These files are copies that belong to your project. Edit them, and review them in a pull request like any other file.', 'هذه الملفات نسخ تخص مشروعك. عدّلها وراجعها في طلب دمج مثل أي ملف آخر.'),
  },
  backend: {
    title: t('Your backend', 'خادمك الخلفي'),
    text: t(
      'If you have an OpenAPI description of your API, save it in the project as docs/api/openapi.json. The kit reads it to learn what your backend offers when it builds services and forms. It does not generate a typed client: add one yourself if you want it. Sending a link to the description instead comes in the next version.',
      'إن كان عندك وصف ⁦OpenAPI⁩ لخادمك، فاحفظه في المشروع باسم ⁦docs/api/openapi.json⁩. تقرؤه الإضافة لتعرف ما يقدمه خادمك عندما تبني الخدمات والنماذج. ولا تولّد عميلا مكتوب الأنواع: أضف واحدا بنفسك إن أردت. وإرسال رابط الوصف بدل ذلك يأتي في النسخة القادمة.',
    ),
    auth: t(
      'Dashboards assume a bearer access token held in memory and refreshed once on a 401. If your backend uses cookies or OIDC, change that rule in .claude/rules/.',
      'تفترض لوحات التحكم رمز وصول يُرسل في الترويسة ويُحفظ في الذاكرة ويُجدَّد مرة واحدة عند الخطأ 401. وإن كان خادمك يستخدم كوكيز أو ⁦OIDC⁩ فغيّر هذه القاعدة في ⁦.claude/rules/⁩.',
    ),
  },
  checks: {
    title: t('What the checks do', 'ماذا تفعل الفحوص'),
    lead: t('They are scripts that run on your computer, at fixed moments, with your permissions.', 'هي سكربتات تعمل على جهازك، في لحظات محددة، بصلاحياتك.'),
    items: [
      t('Before Claude says it is done, the final check runs your typecheck and the unit tests related to the changed files. It stops blocking after three failed tries in a row, so read the report’s “not checked” line.', 'قبل أن يقول ⁦Claude⁩ إنه انتهى، يشغل الفحص الأخير فحص الأنواع والاختبارات المرتبطة بالملفات التي تغيرت. ويتوقف عن المنع بعد ثلاث محاولات فاشلة متتالية، فاقرأ سطر «لم يُفحص» في التقرير.'),
      t('Format and lint run on each edited file, with the tools your project already uses.', 'يعمل التنسيق والتدقيق على كل ملف يُعدَّل، بالأدوات التي يستخدمها مشروعك أصلا.'),
      t('No commit, merge, cherry-pick or push on protected branches. No force push, --no-verify, reset --hard, clean -f or checkout -f.', 'لا إيداع ولا دمج ولا cherry-pick ولا رفع على الفروع المحمية. ولا رفع بالقوة ولا ⁦--no-verify⁩ ولا ⁦reset --hard⁩ ولا ⁦clean -f⁩ ولا ⁦checkout -f⁩.'),
      t('The usual routes to files named .env are blocked, and requests to hosts you list as live are refused.', 'تُسدّ الطرق المعتادة إلى ملفات ⁦.env⁩، وتُرفض الطلبات إلى المضيفين الذين تعدّهم حيّين.'),
    ],
    limits: t(
      'They are a guard rail, not a sandbox. They read commands, but not what a script or a program does inside. Files you @-mention and MCP tools the matchers do not name are outside them. Keep branch protection on in your repository.',
      'هي حاجز وقائي وليست بيئة معزولة. تقرأ الأوامر لكنها لا ترى ما يفعله سكربت أو برنامج من الداخل. والملفات التي تذكرها بـ ⁦@⁩ وأدوات ⁦MCP⁩ التي لا تسميها المطابقات خارجها. أبقِ حماية الفروع مفعّلة في مستودعك.',
    ),
  },
  more: {
    title: t('Modes, settings and the source', 'الأنماط والإعدادات والمصدر'),
    text: t(
      'Nine working modes (new, existing, maintenance, refactor, upgrade, freeze, hotfix, read-only and prototype) change how careful the assistant is. Refactor mode audits a project, writes a phased plan you approve, and restructures one phase at a time with behaviour frozen. After setup, updates are off: you update by hand after reading the changelog. The code is under the MIT licence.',
      'تسعة أنماط عمل (جديد، وموجود، وصيانة، وإعادة هيكلة، وترقية، وتجميد، وإصلاح عاجل، وقراءة فقط، ونموذج أولي) تغيّر درجة حذر المساعد. ونمط إعادة الهيكلة يقيّم المشروع ويكتب خطة بمراحل توافق عليها ويعيد الهيكلة مرحلة مرحلة بسلوك مثبت. وبعد الإعداد يكون التحديث مطفأ: تحدّث بنفسك بعد أن تقرأ سجل التغييرات. والكود برخصة ⁦MIT⁩.',
    ),
  },
}
