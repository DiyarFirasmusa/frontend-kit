import { t } from './text.ts'

/** What `/frontend-kit:mode list` prints, in plain words. */
export const modeGroups = [
  {
    title: t('Modes of the project', 'أنماط المشروع'),
    lead: t('Kept in the committed config, so they follow the branch.', 'تنحفظ بملف الإعدادات داخل git، فتمشي مع الفرع.'),
    modes: [
      ['new', t('Build to the standards from the first file.', 'ابنِ على المعايير من أول ملف.')],
      ['existing', t('The default. Follow what the project does; it adds no rule.', 'الافتراضي: امشِ على اللي يسويه المشروع، وما يضيف أي قاعدة.')],
      ['maintenance', t('Keep an old app running: fixes and security only, no new dependency.', 'خلّي تطبيق قديم يبقى شغّال: إصلاحات وأمان بس، وبدون أي حزمة جديدة.')],
      ['refactor', t('Restructure in approved phases, with behaviour and tests held still.', 'أعد البناء على مراحل توافق عليها، والسلوك والاختبارات تبقى ثابتة.')],
      ['upgrade', t('Move one dependency family to a new version, in approved phases.', 'انقل عائلة حزم وحدة لإصدار جديد، على مراحل توافق عليها.')],
      ['freeze', t('Before a release: fixes only, no change to packages or tool configs.', 'قبل الإصدار: إصلاحات بس، وبدون تغيير بالحزم أو إعدادات الأدوات.')],
    ],
  },
  {
    title: t('Modes of this checkout', 'أنماط هالنسخة'),
    lead: t('For one job on one machine. They are never committed.', 'لشغلة وحدة على جهاز واحد، وما تنحفظ بـ git أبداً.'),
    modes: [
      ['hotfix', t('The smallest safe fix on released code, five source files by default.', 'أصغر إصلاح آمن على كود منشور، خمس ملفات كود افتراضياً.')],
      ['read-only', t('Inspect and report. Only the report folder may be written.', 'افحص واكتب تقرير. بس مجلد التقارير مسموح الكتابة بيه.')],
      ['prototype', t('Try an idea in its own folder, away from production code.', 'جرّب فكرة بمجلدها الخاص، بعيد عن كود الإنتاج.')],
    ],
  },
] as const
