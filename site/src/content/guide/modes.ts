import { t } from './text.ts'

/** What `/wajiha-kit:mode list` prints, in plain words. */
export const modeGroups = [
  {
    title: t('Modes for the whole project', 'أنماط للمشروع كله'),
    lead: t('Saved with your project, so everyone who works on it shares them.', 'تُحفظ مع مشروعك، فيشترك فيها كل من يعمل عليه.'),
    modes: [
      ['new', t('Build to the kit’s standards from the first file.', 'ابنِ حسب معايير الإضافة من أول ملف.')],
      ['existing', t('The default. The assistant follows how your project already works and adds no extra limits.', 'الافتراضي. يتبع المساعد ما يفعله مشروعك الآن، ولا يضيف أي قيود.')],
      ['maintenance', t('Keep an old app running. Only fixes and security updates, and no new libraries (code written by others).', 'حافظ على تشغيل تطبيق قديم. إصلاحات وتحديثات أمان فقط، وبدون مكتبات جديدة (كود كتبه غيرك).')],
      ['refactor', t('Fix an old project step by step. You approve each step, and what the app does stays the same.', 'إصلاح مشروع قديم خطوة بخطوة. توافق على كل خطوة، ويبقى ما يفعله التطبيق كما هو.')],
      ['upgrade', t('Move one group of libraries to a newer version, step by step, with your approval at each step.', 'انقل مجموعة مكتبات واحدة إلى إصدار أحدث، خطوة بخطوة، وبموافقتك في كل خطوة.')],
      ['freeze', t('For the days before a release: only fixes. No change to libraries or tool settings.', 'لأيام ما قبل الإصدار: إصلاحات فقط، وبلا تغيير في المكتبات أو إعدادات الأدوات.')],
    ],
  },
  {
    title: t('Modes for one job on this computer', 'أنماط لعمل واحد على هذا الجهاز'),
    lead: t('For one task on one computer. They are never saved with the project.', 'لمهمة واحدة على جهاز واحد. ولا تُحفظ مع المشروع أبدا.'),
    modes: [
      ['hotfix', t('The smallest safe fix for something already live. By default it touches at most five code files.', 'أصغر إصلاح آمن لشيء منشور بالفعل. وهو افتراضيا لا يلمس أكثر من خمسة ملفات كود.')],
      ['read-only', t('Look and report, change nothing. It may only write in the reports folder.', 'انظر واكتب تقريرا ولا تغير شيئا. يُسمح له بالكتابة في مجلد التقارير فقط.')],
      ['prototype', t('Try an idea in its own folder, away from the real code.', 'جرّب فكرة في مجلد خاص بها، بعيدا عن الكود الحقيقي.')],
    ],
  },
] as const
