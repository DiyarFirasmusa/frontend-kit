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
        t(`Wajiha Kit is made by ${MAKER.name}. Copyright © ${YEAR} ${MAKER.name}.`, `صنع واجهة ديار فراس. جميع الحقوق © ${YEAR} ديار فراس.`),
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
        t('It comes without any warranty. The full text is in the file called LICENSE.', 'وهي تأتي دون أي ضمان. والنص الكامل في الملف المسمى ⁦LICENSE⁩.'),
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
          'Some skills in the kit come from other projects and keep their own licences. They are listed in the third-party notices. The fonts of this website (Familjen Grotesk, IBM Plex Sans Arabic and IBM Plex Mono) are free fonts, used under their own open licences.',
          'بعض المهارات في الإضافة أتت من مشاريع أخرى وتحتفظ برخصها. وهي مذكورة في ملف إشعارات الأطراف الثالثة. أما خطوط هذا الموقع (⁦Familjen Grotesk⁩ و⁦IBM Plex Sans Arabic⁩ و⁦IBM Plex Mono⁩) فخطوط مجانية، تُستخدم برخصها المفتوحة.',
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
          'This website sets no cookies and uses no analytics, no advertising and no tracking. It has no accounts, forms or comments, so it asks you for nothing. Its fonts and files come from the website itself, with no other service involved.',
          'هذا الموقع لا يضع ملفات تعريف الارتباط (كوكيز)، ولا يستخدم أي تحليلات أو إعلانات أو تتبع. وليس فيه حسابات ولا نماذج ولا تعليقات، فهو لا يطلب منك شيئا. وخطوطه وملفاته تأتي من الموقع نفسه، دون أي خدمة أخرى.',
        ),
      ],
    },
    {
      id: 'hosting',
      title: t('Hosting', 'الاستضافة'),
      text: [
        t(
          'The website is hosted by Vercel. Like most hosts, Vercel keeps ordinary server records of each visit, such as the IP address, the time and the page asked for, to run and protect its service. This website adds no analytics of its own on top of that.',
          'يُستضاف الموقع لدى ⁦Vercel⁩. وكأغلب شركات الاستضافة، تحتفظ ⁦Vercel⁩ بسجلات خادم عادية لكل زيارة، مثل عنوان ⁦IP⁩ والوقت والصفحة المطلوبة، لتشغيل خدمتها وحمايتها. ولا يضيف هذا الموقع أي تحليلات من عنده فوق ذلك.',
        ),
      ],
      links: [{ label: t('Vercel’s privacy policy', 'سياسة الخصوصية لدى Vercel'), to: 'https://vercel.com/legal/privacy-policy', kind: 'outside' }],
    },
    {
      id: 'kit',
      title: t('The kit on your computer', 'الإضافة على جهازك'),
      text: [
        t(
          'Wajiha Kit runs on your computer, and the kit itself does not collect anything or send anything to its maker. Other services are still involved when you use it: Claude sends the parts of your project that the assistant reads to Anthropic, under Anthropic’s terms and privacy policy. A documentation tool called Context7 receives documentation searches. Helper tools are downloaded from npm. A link you give, such as a design or a description of your backend, is opened from your computer.',
          'تعمل واجهة على جهازك، والإضافة نفسها لا تجمع شيئا ولا ترسل شيئا إلى صانعها. لكن خدمات أخرى تشارك عندما تستخدمها: يرسل ⁦Claude⁩ الأجزاء التي يقرؤها المساعد من مشروعك إلى ⁦Anthropic⁩، وفق شروطها وسياسة الخصوصية لديها. وتستقبل أداة التوثيق ⁦Context7⁩ عمليات البحث في التوثيق. وتُنزَّل الأدوات المساعدة من ⁦npm⁩. وأي رابط تعطيه، مثل تصميم أو وصف لخادمك، يُفتح من جهازك.',
        ),
      ],
      links: [{ label: t('Anthropic’s privacy policy', 'سياسة الخصوصية لدى Anthropic'), to: 'https://www.anthropic.com/legal/privacy', kind: 'outside' }],
    },
    {
      id: 'keys',
      title: t('Passwords and keys', 'كلمات المرور والمفاتيح'),
      text: [
        t(
          'Never type a password or a key into the chat. Keep keys in a file named .env in your project. The kit stops the assistant from opening that file.',
          'لا تكتب كلمة مرور ولا مفتاحا في المحادثة. احفظ المفاتيح في ملف اسمه ⁦.env⁩ داخل مشروعك. وتمنع الإضافة المساعد من فتح هذا الملف.',
        ),
      ],
    },
    {
      id: 'links',
      title: t('Links to other sites', 'روابط إلى مواقع أخرى'),
      text: [t('This website links to GitHub, Anthropic and other sites. They have their own rules, and this page does not cover them.', 'يشير هذا الموقع إلى ⁦GitHub⁩ و⁦Anthropic⁩ ومواقع أخرى. ولها قواعدها الخاصة، ولا تشملها هذه الصفحة.')],
    },
    {
      id: 'questions',
      title: t('Questions', 'أسئلة'),
      text: [t('If something here is unclear or wrong, open an issue on GitHub.', 'إن كان شيء هنا غير واضح أو غير صحيح، فافتح موضوعا (issue) على ⁦GitHub⁩.')],
      links: [{ label: t('Open an issue', 'افتح موضوعا'), to: 'issues', kind: 'repo' }],
    },
  ],

  terms: [
    {
      id: 'use',
      title: t('Using the kit', 'استخدام الإضافة'),
      text: [
        t(
          'Wajiha Kit is free. You may use it for personal and for commercial projects, under the MIT licence described on the rights page.',
          'واجهة مجانية. يحق لك أن تستخدمها في مشاريع شخصية وتجارية، برخصة ⁦MIT⁩ الموضحة في صفحة الحقوق.',
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
          'تُقدَّم الإضافة وهذا الموقع «كما هما»، دون أي ضمان. وقد يخطئ المساعد. والفحوص تقلل الأخطاء لكنها لا تلغيها. انظر إلى ما يصنعه قبل أن تعتمد عليه، واحتفظ بنسخة من كل ما لا تحتمل خسارته.',
        ),
      ],
    },
    {
      id: 'you',
      title: t('Your responsibility', 'مسؤوليتك'),
      text: [
        t(
          'You are responsible for what you build and publish with it, for the services you connect to it, such as a backend, and for following the terms of those services, including Anthropic’s terms for Claude.',
          'أنت المسؤول عما تبنيه وتنشره بها، وعن الخدمات التي تربطها بها، مثل الخادم الخلفي، وعن الالتزام بشروط تلك الخدمات، ومنها شروط ⁦Anthropic⁩ لاستخدام ⁦Claude⁩.',
        ),
      ],
    },
    {
      id: 'liability',
      title: t('Liability', 'المسؤولية'),
      text: [
        t(
          'As far as the law allows, the maker is not responsible for any loss that comes from using the kit or this website.',
          'بقدر ما يسمح القانون، لا يتحمل صانع الإضافة مسؤولية أي خسارة تنتج عن استخدام الإضافة أو هذا الموقع.',
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
      text: [t('The kit and these terms may change over time. The date at the top of this page shows when it was last written.', 'قد تتغير الإضافة وهذه الشروط مع الوقت. والتاريخ في أعلى هذه الصفحة يبين متى كُتبت آخر مرة.')],
    },
  ],
}
