import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

/** The owner's name and profile: the only credit on the site. */
export const MAKER = { name: 'Diyar Firas', href: 'https://github.com/DiyarFirasmusa' }
export const YEAR = 2026

/** When these pages were last written. */
export const updated = t('Last updated: 25 November 2026', 'آخر تحديث: 25 نوفمبر 2026')

export type LegalId = 'licence' | 'privacy' | 'terms'

export interface LegalLink {
  label: Bilingual
  /** A path in the repository, or a full address. */
  to: string
  /** `repo` joins the repository address; `site` is a page of this site. */
  kind: 'repo' | 'outside' | 'site'
}

export interface LegalSection {
  id: string
  title: Bilingual
  text: Bilingual[]
  links?: LegalLink[]
}

export const legal: Record<LegalId, LegalSection[]> = {
  licence: [
    {
      id: 'owner',
      title: t('Who made it', 'من صنعها'),
      text: [
        t(`Wajiha Kit is made by ${MAKER.name}. Copyright © ${YEAR} ${MAKER.name}.`, `صنع «واجهة» ديار فراس. حقوق النشر © ${YEAR} ديار فراس.`),
      ],
      links: [{ label: t('GitHub profile', 'الحساب على GitHub'), to: MAKER.href, kind: 'outside' }],
    },
    {
      id: 'licence',
      title: t('What you may do with it', 'ماذا يحق لك أن تفعل بها'),
      text: [
        t(
          'The code of the kit is released under the MIT licence. You may use it, copy it, change it and share it, for free, including in work you sell, as long as you keep the copyright line and the licence text with it.',
          'كود الإضافة منشور برخصة ⁦MIT⁩. يحق لك أن تستخدمه وتنسخه وتعدله وتشاركه، مجانا، حتى في عمل تبيعه، بشرط أن تبقي سطر الحقوق ونص الرخصة معه.',
        ),
        t('It comes without any warranty. The full text is in the file called LICENSE.', 'والإضافة تأتي دون أي ضمان. والنص الكامل في الملف المسمى ⁦LICENSE⁩.'),
      ],
      links: [{ label: t('Read the full licence', 'اقرأ الرخصة كاملة'), to: 'blob/main/LICENSE', kind: 'repo' }],
    },
    {
      id: 'names',
      title: t('The name and the logo', 'الاسم والشعار'),
      text: [
        t(
          'The name Wajiha Kit and its logo tell people which project is the original. You may say that you use Wajiha Kit. Please do not present your own copy or your own product as Wajiha Kit.',
          'اسم واجهة (Wajiha Kit) وشعارها يدلان الناس على المشروع الأصلي. يحق لك أن تقول إنك تستخدم واجهة. ونرجو ألا تقدّم نسختك أو منتجك على أنه واجهة.',
        ),
      ],
    },
    {
      id: 'yours',
      title: t('What you build with it', 'ما تبنيه بها'),
      text: [
        t(
          'Your project, your files and what you publish are yours. The kit claims no rights over them. Anthropic’s terms for Claude also apply to what Claude writes for you.',
          'مشروعك وملفاتك وما تنشره كلها لك. ولا تدّعي الإضافة أي حق فيها. وتنطبق أيضا شروط ⁦Anthropic⁩ لاستخدام ⁦Claude⁩ على ما يكتبه لك.',
        ),
      ],
    },
    {
      id: 'others',
      title: t('Other people’s work', 'أعمال الآخرين'),
      text: [
        t(
          'Some skills in the kit come from other projects and keep their own licences. They are listed in the third-party notices. The fonts of this website (Familjen Grotesk, IBM Plex Sans Arabic and IBM Plex Mono) are free fonts, used under the SIL Open Font Licence.',
          'بعض المهارات في الإضافة أتت من مشاريع أخرى وتحتفظ برخصها. وهي مذكورة في ملف إشعارات الأطراف الثالثة. أما خطوط هذا الموقع (⁦Familjen Grotesk⁩ و⁦IBM Plex Sans Arabic⁩ و⁦IBM Plex Mono⁩) فخطوط مجانية، تُستخدم برخصة ⁦SIL Open Font License⁩.',
        ),
      ],
      links: [{ label: t('Third-party notices', 'إشعارات الأطراف الثالثة'), to: 'blob/main/plugins/wajiha-kit/THIRD_PARTY_NOTICES.md', kind: 'repo' }],
    },
    {
      id: 'anthropic',
      title: t('Claude and Anthropic', '⁦Claude⁩ و⁦Anthropic⁩'),
      text: [
        t(
          'Wajiha Kit is an independent project. It is not made, checked or endorsed by Anthropic. Claude and Claude Code are names of Anthropic.',
          'واجهة مشروع مستقل. لم تصنعه ⁦Anthropic⁩ ولم تراجعه ولم تزكّه. و⁦Claude⁩ و⁦Claude Code⁩ اسمان تملكهما ⁦Anthropic⁩.',
        ),
      ],
    },
  ],

  privacy: [
    {
      id: 'site',
      title: t('This website', 'هذا الموقع'),
      text: [
        t(
          'This website sets no cookies and uses no analytics, no advertising and no tracking. It has no accounts, forms or comments, so it asks you for nothing. Its fonts and files come from this website. The only other party is its host, Vercel.',
          'هذا الموقع لا يضع ملفات تعريف الارتباط (كوكيز)، ولا يستخدم أي تحليلات أو إعلانات أو تتبع. وليس فيه حسابات ولا نماذج ولا تعليقات، فهو لا يطلب منك شيئا. وخطوطه وملفاته تأتي من هذا الموقع. والجهة الوحيدة الأخرى هي مستضيفه ⁦Vercel⁩.',
        ),
      ],
    },
    {
      id: 'hosting',
      title: t('Hosting', 'الاستضافة'),
      text: [
        t(
          'The website is hosted by Vercel. Like most hosts, Vercel keeps ordinary server records of each visit, such as the IP address, the time and the page asked for, to run and protect its service. This website adds no analytics of its own on top of that.',
          'يُستضاف الموقع لدى ⁦Vercel⁩. وكأغلب شركات الاستضافة، تحتفظ ⁦Vercel⁩ بسجلات خادم عادية لكل زيارة، مثل عنوان ⁦IP⁩ والوقت والصفحة المطلوبة، لتشغيل خدمتها وحمايتها. ولا يضيف هذا الموقع أي تحليلات من تلقاء نفسه فوق ذلك.',
        ),
      ],
      links: [{ label: t('Vercel’s privacy policy', 'سياسة الخصوصية لدى Vercel'), to: 'https://vercel.com/legal/privacy-policy', kind: 'outside' }],
    },
    {
      id: 'kit',
      title: t('The kit on your computer', 'الإضافة على جهازك'),
      text: [
        t(
          'Wajiha Kit runs on your computer, and the kit itself does not collect anything or send anything to its maker. Other services are still involved when you use it: Claude sends the parts of your project that the assistant reads to Anthropic, under Anthropic’s terms and privacy policy. A documentation tool called Context7 receives documentation searches. Helper tools are downloaded from npm. A link you give, such as a design or a description of your backend, is opened from your computer. Setup asks once whether to add two helper programs, Chrome DevTools and Playwright. If you say yes, they can open web pages and read what is on them, so use them only on pages that are not private.',
          'تعمل واجهة على جهازك، والإضافة نفسها لا تجمع شيئا ولا ترسل شيئا إلى صانعها. لكن تدخل خدمات أخرى في العمل عند استخدامها: يرسل ⁦Claude⁩ الأجزاء التي يقرؤها المساعد من مشروعك إلى ⁦Anthropic⁩، وفق شروطها وسياسة الخصوصية لديها. وتستقبل أداة التوثيق ⁦Context7⁩ عمليات البحث في التوثيق. وتُنزَّل الأدوات المساعدة من ⁦npm⁩. وأي رابط تعطيه، مثل تصميم أو وصف لخادمك، يُفتح من جهازك. ويسألك الإعداد مرة واحدة إن كنت تريد إضافة برنامجين مساعدين، هما ⁦Chrome DevTools⁩ و⁦Playwright⁩. وإن وافقت فيستطيعان فتح صفحات الويب وقراءة ما فيها، فاستخدمهما فقط في صفحات ليست خاصة.',
        ),
      ],
      links: [{ label: t('Anthropic’s privacy policy', 'سياسة الخصوصية لدى Anthropic'), to: 'https://www.anthropic.com/legal/privacy', kind: 'outside' }],
    },
    {
      id: 'updates',
      title: t('Updates', 'التحديثات'),
      text: [
        t(
          'Setup leaves automatic updates off, so a new version reaches your computer only when you update by hand. Updates come from the kit’s GitHub repository: read the changelog before you take one. If you switch automatic updates on yourself, new versions arrive without you asking.',
          'يترك الإعداد التحديث التلقائي مطفأ، فلا تصل نسخة جديدة إلى جهازك إلا عندما تحدّث بنفسك. وتأتي التحديثات من مستودع الإضافة على ⁦GitHub⁩، فاقرأ سجل التغييرات قبل أن تأخذ أي نسخة. وإن شغّلت التحديث التلقائي بنفسك، فستصل النسخ الجديدة دون أن تطلبها.',
        ),
      ],
    },
    {
      id: 'keys',
      title: t('Passwords and keys', 'كلمات المرور والمفاتيح'),
      text: [
        t(
          'Never type a password or a key into the chat. Keep keys in a file named .env in your project. The kit tells the assistant not to open that file and blocks the usual ways, but it cannot see everything, so keep real production keys out of the project folder.',
          'لا تكتب كلمة مرور ولا مفتاحا في المحادثة. احفظ المفاتيح في ملف اسمه ⁦.env⁩ داخل مشروعك. وتطلب الإضافة من المساعد ألا يفتح هذا الملف وتسد الطرق المعتادة، لكنها لا ترى كل شيء، فأبعد مفاتيح الإنتاج الحقيقية عن مجلد المشروع.',
        ),
      ],
    },
    {
      id: 'links',
      title: t('Links to other sites', 'روابط إلى مواقع أخرى'),
      text: [t('This website links to GitHub, Anthropic and other sites. They have their own rules, and this page does not cover them.', 'يضع هذا الموقع روابط إلى ⁦GitHub⁩ و⁦Anthropic⁩ ومواقع أخرى. ولها قواعدها الخاصة، ولا تشملها هذه الصفحة.')],
    },
    {
      id: 'questions',
      title: t('Questions', 'أسئلة'),
      text: [t('If something here is unclear or wrong, write to Diyar Firas on GitHub. If you found a security problem, please do not post the details in a public place.', 'إن كان شيء هنا غير واضح أو غير صحيح، فاكتب إلى ديار فراس على ⁦GitHub⁩. وإن وجدت مشكلة أمنية، فلا تنشر تفاصيلها في مكان عام.')],
      links: [{ label: t('Diyar Firas on GitHub', 'ديار فراس على GitHub'), to: MAKER.href, kind: 'outside' }],
    },
  ],

  terms: [
    {
      id: 'use',
      title: t('Using the kit', 'استخدام الإضافة'),
      text: [
        t(
          'Wajiha Kit is free. You may use it for personal and for commercial projects, under the MIT licence described on the rights page.',
          '«واجهة» مجانية. يحق لك أن تستخدمها في مشاريع شخصية وتجارية، برخصة ⁦MIT⁩ الموضحة في صفحة الحقوق.',
        ),
      ],
      links: [{ label: t('Rights and licence', 'الحقوق والترخيص'), to: 'licence', kind: 'site' }],
    },
    {
      id: 'asis',
      title: t('No guarantee', 'بلا ضمان'),
      text: [
        t(
          'The kit and this website are provided “as is”, without any warranty. The assistant can make mistakes. The checks reduce them but cannot remove them. Look at what it makes before you rely on it, and keep a copy of anything you cannot lose.',
          'تُقدَّم الإضافة وهذا الموقع «كما هي»، دون أي ضمان. وقد يخطئ المساعد. والفحوص تقلل الأخطاء لكنها لا تلغيها. انظر إلى ما يصنعه قبل أن تعتمد عليه، واحتفظ بنسخة من كل ما لا تحتمل خسارته.',
        ),
      ],
    },
    {
      id: 'you',
      title: t('Your responsibility', 'مسؤوليتك'),
      text: [
        t(
          'You are responsible for what you build and publish with it, for the services you connect to it, such as a backend, and for following the terms of those services, including Anthropic’s terms for Claude. If you use it at work, your Claude account must allow business use under Anthropic’s terms.',
          'أنت المسؤول عما تبنيه وتنشره بالإضافة، وعن الخدمات التي تربطها بمشروعك، مثل الخادم الخلفي، وعن الالتزام بشروط تلك الخدمات، ومنها شروط ⁦Anthropic⁩ لاستخدام ⁦Claude⁩. وإن استخدمتها في العمل، فيجب أن يسمح حسابك في ⁦Claude⁩ بالاستخدام التجاري وفق شروط ⁦Anthropic⁩.',
        ),
      ],
    },
    {
      id: 'liability',
      title: t('Liability', 'المسؤولية'),
      text: [
        t(
          'As far as the law allows, the maker is not responsible for any loss that comes from using the kit or this website.',
          'في حدود ما يسمح به القانون، لا يتحمل صانع الإضافة مسؤولية أي خسارة تنتج عن استخدام الإضافة أو هذا الموقع.',
        ),
      ],
    },
    {
      id: 'maintenance',
      title: t('Who looks after it', 'من يعتني بها'),
      text: [
        t(
          'Wajiha Kit is made and looked after by one person, Diyar Firas. There is no promise of support or of how fast he answers, and only the latest version receives fixes. If it stops being updated, what you installed keeps working. The code is under the MIT licence, so you may keep your copy or make your own.',
          'يصنع واجهة ويعتني بها شخص واحد، هو ديار فراس. ولا وعد بدعم ولا بسرعة الرد، والنسخة الأحدث وحدها تصلها الإصلاحات. وإن توقف تحديثها فما ثبّتّه يبقى يعمل. والكود برخصة ⁦MIT⁩، فيحق لك أن تحتفظ بنسختك أو أن تصنع نسختك.',
        ),
      ],
    },
    {
      id: 'others',
      title: t('Other services', 'خدمات أخرى'),
      text: [t('Claude, GitHub, npm, Context7 and Vercel are separate services with their own terms.', '⁦Claude⁩ و⁦GitHub⁩ و⁦npm⁩ و⁦Context7⁩ و⁦Vercel⁩ خدمات مستقلة، ولكل منها شروطها.')],
    },
    {
      id: 'changes',
      title: t('Changes', 'التغييرات'),
      text: [t('The kit and these terms may change over time. The date at the top of this page shows when it was last written.', 'قد تتغير الإضافة وهذه الشروط مع الوقت. والتاريخ في أعلى هذه الصفحة يبين متى حُدِّثت هذه الصفحة آخر مرة.')],
    },
  ],
}
