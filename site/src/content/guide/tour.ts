import type { Bilingual } from '../catalogue.ts'
import type { SceneId } from '../scenes.ts'
import { t } from './text.ts'

/** The chapters the guide bar counts through. */
export const chapters: { id: SceneId; name: Bilingual }[] = [
  { id: 'intro', name: t('What it is', 'شنو هي') },
  { id: 'without', name: t('Why', 'ليش') },
  { id: 'how', name: t('Get started', 'ابدأ') },
  { id: 'website', name: t('Project types', 'أنواع المشاريع') },
  { id: 'skills', name: t('Skills', 'المهارات') },
  { id: 'agents', name: t('Agents', 'الوكلاء') },
  { id: 'rules', name: t('Rules', 'القواعد') },
  { id: 'checks', name: t('Checks', 'الفحوص') },
  { id: 'guards', name: t('Guards', 'الحرّاس') },
  { id: 'features', name: t('Features and settings', 'الميزات والإعدادات') },
  { id: 'rescue', name: t('Old projects', 'المشاريع القديمة') },
  { id: 'examples', name: t('What to type', 'شنو تكتب') },
  { id: 'questions', name: t('Questions', 'الأسئلة') },
  { id: 'install', name: t('Install', 'التثبيت') },
]

/** Said at the foot of a scene, so nobody has to guess that the explanation follows. */
export const below: Partial<Record<SceneId, Bilingual>> = {
  intro: t('Keep scrolling. Everything is explained on this page.', 'كمّل نزول، كل شي مشروح بهالصفحة.'),
  with: t('Keep scrolling for the difference, case by case', 'كمّل نزول وشوف الفرق حالة حالة'),
  how: t('Keep scrolling for every step in full', 'كمّل نزول لكل خطوة بالتفصيل'),
  website: t('Keep scrolling for what a website gets', 'كمّل نزول وشوف شنو ياخذ الموقع'),
  dashboard: t('Keep scrolling for what a dashboard gets', 'كمّل نزول وشوف شنو تاخذ لوحة التحكم'),
  both: t('Keep scrolling for both types in full', 'كمّل نزول لشرح النوعين كامل'),
  skills: t('Keep scrolling: each one is explained in turn', 'كمّل نزول: كل وحدة تنشرح بدورها'),
  agents: t('Keep scrolling to meet each one', 'كمّل نزول وتعرّف على كل واحد'),
  rules: t('Keep scrolling to read what each one says', 'كمّل نزول واقرا شتقول كل وحدة'),
  checks: t('Keep scrolling through each moment', 'كمّل نزول لحظة لحظة'),
  guards: t('Keep scrolling for everything they refuse', 'كمّل نزول لكل شي يرفضوه'),
  features: t('Keep scrolling for each feature and setting', 'كمّل نزول لكل ميزة وإعداد'),
  rescue: t('Keep scrolling for the six phases', 'كمّل نزول للمراحل الست'),
  examples: t('Keep scrolling and copy a sentence', 'كمّل نزول وانسخ جملة'),
  questions: t('Keep scrolling for the answers', 'كمّل نزول للأجوبة'),
}

export const tourWords = {
  next: t('Next:', 'التالي:'),
  chapter: t('Where you are on the page', 'انت وين بالصفحة'),
  docs: t('Full documentation', 'التوثيق كامل'),
  docsOf: t('Full documentation of', 'التوثيق الكامل لـ'),
  setupQuestions: t('Setup asks you three things', 'الإعداد يسألك ثلاث أسئلة'),
  approve: t('Nothing is written before your yes', 'ما ينكتب شي قبل موافقتك'),
  approveText: t(
    'You see one list of every file it will write or adapt. For a file you already have, it shows the difference first.',
    'تشوف قائمة وحدة بكل ملف راح ينكتب أو يتعدّل. والملف اللي عندك من قبل، يعرضلك الفرق أول.',
  ),
  files: t('What is now in your project', 'شنو صار بمشروعك'),
  after: t('Right after setup', 'بعد الإعداد على طول'),
  compare: t('The same work, with the kit', 'نفس الشغل، مع العدّة'),
  journey: t('One sentence, start to finish', 'جملة وحدة، من أولها لآخرها'),
  gate: t('The quality gate, step by step', 'بوابة الجودة خطوة بخطوة'),
  limits: t('What they cannot do', 'شنو ما يقدرون عليه'),
  measured: t('What the audit measures', 'شنو يقيس التدقيق'),
  phases: t('The six phases', 'المراحل الست'),
  troubles: t('When something does not work', 'من شي ما يشتغل'),
  projects: t('Example projects', 'مشاريع أمثلة'),
}
