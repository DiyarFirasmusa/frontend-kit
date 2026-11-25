import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

export type PageId =
  | 'docs'
  | 'modes'
  | 'changelog'
  | 'guide'
  | 'get-started'
  | 'skills'
  | 'agents'
  | 'features'
  | 'project-types'
  | 'rules'
  | 'checks'
  | 'configuration'
  | 'refactor'
  | 'examples'
  | 'questions'
  | 'licence'
  | 'privacy'
  | 'terms'

export interface PageInfo {
  id: PageId
  name: Bilingual
  title: Bilingual
  lead: Bilingual
  /** Which frame of the film stands behind its title. */
  still: string
}

export interface PageSection {
  title: Bilingual
  pages: PageId[]
}

export const PAGES: Record<PageId, PageInfo> = {
  docs: {
    id: 'docs',
    still: 'skills',
    name: t('Guide', 'الدليل'),
    title: t('The guide: from your first idea to a working project.', 'الدليل: من فكرتك الأولى إلى مشروع يعمل.'),
    lead: t(
      'Start with the first pages. The rest explains what works for you behind the scenes, and you can skip it.',
      'ابدأ بالصفحات الأولى. وما بعدها يشرح ما يعمل لأجلك في الخلفية، ويمكنك تجاوزه.',
    ),
  },
  modes: {
    id: 'modes',
    still: 'layers',
    name: t('Ways of working', 'طرق العمل'),
    title: t('Ways of working: how careful the assistant is.', 'طرق العمل: درجة حذر المساعد.'),
    lead: t(
      'Nine modes, from building something new to freezing a release. You switch with one command, and you can skip this page at the start.',
      'تسعة أنماط، من بناء شيء جديد إلى تجميد الإصدار. تنتقل بينها بأمر واحد، ويمكنك تجاوز هذه الصفحة في البداية.',
    ),
  },
  changelog: {
    id: 'changelog',
    still: 'mark',
    name: t('Changelog', 'سجل التغييرات'),
    title: t('What changed, version by version.', 'ما الذي تغير في كل إصدار.'),
    lead: t('The plugin’s own changelog, in full.', 'سجل تغييرات الإضافة كاملا.'),
  },
  guide: {
    id: 'guide',
    still: 'screen',
    name: t('What is it?', 'ما هي؟'),
    title: t('What is Wajiha Kit?', 'ما هي «واجهة»؟'),
    lead: t(
      'A kit for Claude Code that builds your website or dashboard for you, the way a good team would, and checks the work before you see it. You do not need to know how to code.',
      'إضافة لـ Claude Code تبني لك موقعك أو لوحة تحكمك كما يفعل فريق جيد، وتفحص العمل قبل أن تراه. لا تحتاج أن تعرف البرمجة.',
    ),
  },
  'get-started': {
    id: 'get-started',
    still: 'layers',
    name: t('Get started', 'ابدأ'),
    title: t('Get started, step by step.', 'ابدأ خطوة بخطوة.'),
    lead: t(
      'What to install, what to type, what you will be asked and what you get. Every step shows what you will see.',
      'ماذا تثبت، وماذا تكتب، وماذا ستُسأل، وماذا تحصل عليه. كل خطوة تريك ما ستراه على الشاشة.',
    ),
  },
  skills: {
    id: 'skills',
    still: 'skills',
    name: t('Skills', 'المهارات'),
    title: t('Skills: how the assistant knows each job.', 'المهارات: كيف يعرف المساعد كل مهمة.'),
    lead: t(
      'A skill is a ready set of instructions for one job, such as building a table. When your request matches, the assistant follows those instructions.',
      'المهارة تعليمات جاهزة لمهمة واحدة، مثل بناء جدول. وعندما يطابقها طلبك، يتبع المساعد هذه التعليمات.',
    ),
  },
  agents: {
    id: 'agents',
    still: 'agents',
    name: t('Specialists', 'المختصون'),
    title: t('Specialists: a team behind the assistant.', 'المختصون: فريق خلف المساعد.'),
    lead: t(
      'A specialist is a separate helper with one job, like a reviewer or a tester. The main assistant gives it a task and gets a report back.',
      'المختص مساعد مستقل له مهمة واحدة، مثل المراجع أو المختبِر. يعطيه المساعد الرئيسي مهمة، ثم يستلم منه تقريرا.',
    ),
  },
  features: {
    id: 'features',
    still: 'dashboard',
    name: t('Everything it does', 'كل ما تفعله'),
    title: t('Everything it does, in one page.', 'كل ما تفعله الإضافة، في صفحة واحدة.'),
    lead: t('A plain list of what the current version gives you, with a link to the part that explains each.', 'قائمة بسيطة بما يعطيك إياه الإصدار الحالي، مع رابط إلى شرح كل جزء.'),
  },
  'project-types': {
    id: 'project-types',
    still: 'both',
    name: t('What can I build?', 'ماذا تستطيع أن تبني؟'),
    title: t('What can I build?', 'ماذا تستطيع أن تبني؟'),
    lead: t('A website, a dashboard, or both in one project. Pick what fits your idea and the kit prepares the rest.', 'موقع أو لوحة تحكم أو الاثنان في مشروع واحد. اختر ما يناسب فكرتك، وتجهز الإضافة الباقي.'),
  },
  rules: {
    id: 'rules',
    still: 'rules',
    name: t('Rules', 'القواعد'),
    title: t('Rules: what good work means here.', 'القواعد: ماذا يعني العمل الجيد هنا.'),
    lead: t(
      'A rule is a short written standard saved in your project. The assistant reads it when it works on the matching files.',
      'القاعدة معيار مكتوب قصير محفوظ في مشروعك. يقرؤه المساعد عندما يعمل على الملفات المطابقة.',
    ),
  },
  checks: {
    id: 'checks',
    still: 'checks',
    name: t('Safety checks', 'فحوص الأمان'),
    title: t('Safety checks: they work even when the assistant forgets.', 'فحوص الأمان: تعمل حتى لو نسي المساعد.'),
    lead: t(
      'Small programs that run by themselves at fixed moments. They stop risky actions and check the work, so nothing depends on the assistant remembering.',
      'برامج صغيرة تعمل وحدها في لحظات محددة. توقف الأفعال الخطرة وتفحص العمل، فلا يعتمد شيء على تذكر المساعد.',
    ),
  },
  configuration: {
    id: 'configuration',
    still: 'website',
    name: t('Settings', 'الإعدادات'),
    title: t('One file for the settings.', 'ملف واحد للإعدادات.'),
    lead: t('Setup writes .claude/wajiha-kit.json. Change a value there and the skills, specialists and safety checks follow.', 'يكتب الإعداد الملف ‎.claude/wajiha-kit.json. غيّر قيمة فيه، فتتبعها المهارات والمختصون وفحوص الأمان.'),
  },
  refactor: {
    id: 'refactor',
    still: 'broken',
    name: t('Fix an old project', 'إصلاح مشروع قديم'),
    title: t('Fix an old, messy project.', 'أصلح مشروعا قديما وفوضويا.'),
    lead: t('Refactor mode measures the mess, plans six phases and runs one at a time, without changing what the app does.', 'نمط إعادة الهيكلة يقيس حجم الفوضى، ثم يخطط ست مراحل وينفذها واحدة واحدة، دون أن يغير ما يفعله التطبيق.'),
  },
  examples: {
    id: 'examples',
    still: 'mark',
    name: t('What can I say?', 'ماذا أقول؟'),
    title: t('What can I say?', 'ماذا أقول؟'),
    lead: t('Find what you want to do, copy the sentence, or say it in your own words.', 'ابحث عما تريد فعله، وانسخ الجملة، أو قلها بكلماتك.'),
  },
  questions: {
    id: 'questions',
    still: 'gate',
    name: t('Questions', 'الأسئلة'),
    title: t('Questions and problems.', 'أسئلة ومشكلات.'),
    lead: t('Honest answers about cost, safety and limits, and what to do when something does not work.', 'إجابات صريحة عن التكلفة والأمان والحدود، وماذا تفعل عندما لا يعمل شيء.'),
  },
  licence: {
    id: 'licence',
    still: 'skills',
    name: t('Rights and licence', 'الحقوق والترخيص'),
    title: t('Rights and licence.', 'الحقوق والترخيص.'),
    lead: t('Who made Wajiha Kit, what you may do with it, and whose names are whose.', 'من صنع واجهة، وماذا يحق لك أن تفعل بها، ولمن تعود الأسماء.'),
  },
  privacy: {
    id: 'privacy',
    still: 'skills',
    name: t('Privacy', 'الخصوصية'),
    title: t('Privacy.', 'الخصوصية.'),
    lead: t('What this website and the kit do with your information, in plain words.', 'ماذا يفعل هذا الموقع والإضافة بمعلوماتك، بكلمات بسيطة.'),
  },
  terms: {
    id: 'terms',
    still: 'skills',
    name: t('Terms of use', 'شروط الاستخدام'),
    title: t('Terms of use.', 'شروط الاستخدام.'),
    lead: t('The simple rules for using this website and the kit.', 'القواعد البسيطة لاستخدام هذا الموقع والإضافة.'),
  },
}

export const SECTIONS: PageSection[] = [
  { title: t('Start here', 'ابدأ من هنا'), pages: ['docs', 'guide', 'get-started', 'project-types', 'examples'] },
  { title: t('Help', 'مساعدة'), pages: ['questions'] },
  { title: t('Behind the scenes', 'في الخلفية'), pages: ['skills', 'agents', 'rules', 'checks', 'features'] },
  { title: t('For your project', 'لمشروعك'), pages: ['modes', 'configuration', 'refactor'] },
  { title: t('About', 'عن واجهة'), pages: ['changelog', 'licence', 'privacy', 'terms'] },
]

/** The links in the header. */
export const HEADER_PAGES: PageId[] = ['guide', 'get-started', 'project-types', 'examples', 'questions']
