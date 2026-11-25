import type { Bilingual } from '../catalogue.ts'
import type { SceneId } from '../scenes.ts'
import { t } from './text.ts'

/** The chapters the guide bar counts through. */
export const chapters: { id: SceneId; name: Bilingual }[] = [
  { id: 'intro', name: t('What it is', 'ما هي') },
  { id: 'without', name: t('Why use it', 'لماذا تستخدمها') },
  { id: 'how', name: t('Get started', 'ابدأ') },
  { id: 'website', name: t('What you build', 'ما تبنيه') },
  { id: 'skills', name: t('Skills', 'المهارات') },
  { id: 'agents', name: t('Specialists', 'المختصون') },
  { id: 'rules', name: t('Rules', 'القواعد') },
  { id: 'checks', name: t('Safety checks', 'فحوص الأمان') },
  { id: 'guards', name: t('What is blocked', 'ما يُمنع') },
  { id: 'features', name: t('Features and settings', 'الميزات والإعدادات') },
  { id: 'rescue', name: t('Fix an old project', 'إصلاح مشروع قديم') },
  { id: 'examples', name: t('What to type', 'ماذا تكتب') },
  { id: 'questions', name: t('Questions', 'الأسئلة') },
  { id: 'install', name: t('Install', 'التثبيت') },
]

/** Said at the foot of a scene, so nobody has to guess that the explanation follows. */
export const below: Partial<Record<SceneId, Bilingual>> = {
  intro: t('Keep scrolling. Everything is explained on this page.', 'تابع النزول. كل شيء مشروح في هذه الصفحة.'),
  with: t('Keep scrolling for the difference, case by case', 'تابع النزول لترى الفرق في كل حالة'),
  how: t('Keep scrolling for every step in full', 'تابع النزول لترى كل خطوة بالتفصيل'),
  website: t('Keep scrolling for what a website gets', 'تابع النزول لترى ما يحصل عليه الموقع'),
  dashboard: t('Keep scrolling for what a dashboard gets', 'تابع النزول لترى ما تحصل عليه لوحة التحكم'),
  both: t('Keep scrolling for both in one project', 'تابع النزول لترى الاثنين في مشروع واحد'),
  skills: t('Keep scrolling: each one is explained in turn', 'تابع النزول: نشرح كل مهارة على حدة'),
  agents: t('Keep scrolling to meet each specialist', 'تابع النزول لتتعرف على كل مختص'),
  rules: t('Keep scrolling to read what each one says', 'تابع النزول لتقرأ ما تقوله كل قاعدة'),
  checks: t('Keep scrolling through each moment', 'تابع النزول، لحظة بعد لحظة'),
  guards: t('Keep scrolling for everything they refuse', 'تابع النزول لترى كل ما ترفضه الفحوص'),
  features: t('Keep scrolling for each feature and setting', 'تابع النزول لترى كل ميزة وكل إعداد'),
  rescue: t('Keep scrolling for the six phases', 'تابع النزول لترى المراحل الست'),
  examples: t('Keep scrolling and copy a sentence', 'تابع النزول وانسخ جملة'),
  questions: t('Keep scrolling for the answers', 'تابع النزول لتقرأ الإجابات'),
}

export const tourWords = {
  next: t('Next:', 'التالي:'),
  chapter: t('Where you are on the page', 'أين أنت في الصفحة'),
  docs: t('Full documentation', 'التوثيق الكامل'),
  docsOf: t('Full documentation of', 'التوثيق الكامل لـ'),
  setupQuestions: t('A few plain questions', 'بضعة أسئلة بسيطة'),
  approve: t('Nothing is built before your yes', 'لا يُبنى شيء قبل موافقتك'),
  approveText: t(
    'You see a short summary in plain words, then one question: shall I start? If a file already exists, you see the difference first.',
    'ترى ملخصا قصيرا بكلمات بسيطة، ثم سؤالا واحدا: هل أبدأ؟ وإذا كان هناك ملف موجود من قبل، ترى الفرق أولا.',
  ),
  files: t('What is now in your project', 'ما أصبح في مشروعك'),
  after: t('Right after it is built', 'بعد البناء مباشرة'),
  compare: t('The same work, with the kit', 'العمل نفسه، مع الإضافة'),
  journey: t('One sentence, start to finish', 'جملة واحدة، من البداية إلى النهاية'),
  gate: t('The final check, step by step', 'الفحص الأخير خطوة بخطوة'),
  limits: t('What safety checks cannot do', 'ما لا تستطيعه فحوص الأمان'),
  measured: t('What the check of an old project measures', 'ماذا يقيس فحص المشروع القديم'),
  phases: t('The six phases', 'المراحل الست'),
  troubles: t('When something does not work', 'عندما لا يعمل شيء'),
  projects: t('Example projects', 'أمثلة لمشاريع'),
}
