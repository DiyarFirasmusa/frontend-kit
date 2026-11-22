import type { Bilingual } from '../catalogue.ts'
import type { SceneId } from '../scenes.ts'
import { t } from './text.ts'

/** The chapters the guide bar counts through. */
export const chapters: { id: SceneId; name: Bilingual }[] = [
  { id: 'intro', name: t('What it is', 'ما هي') },
  { id: 'without', name: t('Why', 'لماذا') },
  { id: 'how', name: t('Get started', 'البدء') },
  { id: 'website', name: t('Project types', 'أنواع المشاريع') },
  { id: 'skills', name: t('Skills', 'المهارات') },
  { id: 'agents', name: t('Agents', 'الوكلاء') },
  { id: 'rules', name: t('Rules', 'القواعد') },
  { id: 'checks', name: t('Checks', 'الفحوص') },
  { id: 'guards', name: t('Guards', 'الحرّاس') },
  { id: 'features', name: t('Features and settings', 'الميزات والإعدادات') },
  { id: 'rescue', name: t('Old projects', 'المشاريع القديمة') },
  { id: 'examples', name: t('What to type', 'ماذا تكتب') },
  { id: 'questions', name: t('Questions', 'الأسئلة') },
  { id: 'install', name: t('Install', 'التثبيت') },
]

/** Said at the foot of a scene, so nobody has to guess that the explanation follows. */
export const below: Partial<Record<SceneId, Bilingual>> = {
  intro: t('Keep scrolling. Everything is explained on this page.', 'واصل التمرير، فكل شيء مشروح في هذه الصفحة.'),
  with: t('Keep scrolling for the difference, case by case', 'واصل التمرير لترى الفرق حالة بحالة'),
  how: t('Keep scrolling for every step in full', 'واصل التمرير لكل خطوة كاملة'),
  website: t('Keep scrolling for what a website gets', 'واصل التمرير لما يحصل عليه الموقع'),
  dashboard: t('Keep scrolling for what a dashboard gets', 'واصل التمرير لما تحصل عليه لوحة التحكم'),
  both: t('Keep scrolling for both types in full', 'واصل التمرير لشرح النوعين'),
  skills: t('Keep scrolling: each one is explained in turn', 'واصل التمرير: كل واحدة تُشرح بدورها'),
  agents: t('Keep scrolling to meet each one', 'واصل التمرير لتتعرف على كل واحد'),
  rules: t('Keep scrolling to read what each one says', 'واصل التمرير لتقرأ ما تقوله كل واحدة'),
  checks: t('Keep scrolling through each moment', 'واصل التمرير عبر كل لحظة'),
  guards: t('Keep scrolling for everything they refuse', 'واصل التمرير لكل ما ترفضه'),
  features: t('Keep scrolling for each feature and setting', 'واصل التمرير لكل ميزة وإعداد'),
  rescue: t('Keep scrolling for the six phases', 'واصل التمرير للمراحل الست'),
  examples: t('Keep scrolling and copy a sentence', 'واصل التمرير وانسخ جملة'),
  questions: t('Keep scrolling for the answers', 'واصل التمرير للأجوبة'),
}

export const tourWords = {
  next: t('Next:', 'التالي:'),
  chapter: t('Where you are on the page', 'موقعك في الصفحة'),
  docs: t('Full documentation', 'التوثيق الكامل'),
  docsOf: t('Full documentation of', 'التوثيق الكامل لـ'),
  setupQuestions: t('Setup asks you three things', 'يسألك الإعداد ثلاثة أسئلة'),
  approve: t('Nothing is written before your yes', 'لا يُكتب شيء قبل موافقتك'),
  approveText: t(
    'You see one list of every file it will write or adapt. For a file you already have, it shows the difference first.',
    'ترى قائمة واحدة بكل ملف سيُكتب أو يُكيَّف. وللملف الموجود يعرض الفرق أولاً.',
  ),
  files: t('What is now in your project', 'ما أصبح في مشروعك'),
  after: t('Right after setup', 'بعد الإعداد مباشرة'),
  compare: t('The same work, with the kit', 'العمل نفسه، مع العدّة'),
  journey: t('One sentence, start to finish', 'جملة واحدة من البداية إلى النهاية'),
  gate: t('The quality gate, step by step', 'بوابة الجودة خطوة بخطوة'),
  limits: t('What they cannot do', 'ما لا تستطيعه'),
  measured: t('What the audit measures', 'ماذا يقيس التدقيق'),
  phases: t('The six phases', 'المراحل الست'),
  troubles: t('When something does not work', 'عندما لا يعمل شيء'),
  projects: t('Example projects', 'مشاريع أمثلة'),
}
