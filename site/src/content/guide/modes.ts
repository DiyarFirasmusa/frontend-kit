import { t } from './text.ts'

/** What `/frontend-kit:mode list` prints, in plain words. */
export const modeGroups = [
  {
    title: t('Modes of the project', 'أنماط المشروع'),
    lead: t('Kept in the committed config, so they follow the branch.', 'تُخزَّن في ملف الإعدادات الذي يُحفظ مع الكود، فتتبع الفرع.'),
    modes: [
      ['new', t('Build to the standards from the first file.', 'ابنِ وفق المعايير من أول ملف.')],
      ['existing', t('The default. Follow what the project does; it adds no rule.', 'الافتراضي. اتبع ما يفعله المشروع، فهو لا يضيف أي قاعدة.')],
      ['maintenance', t('Keep an old app running: fixes and security only, no new dependency.', 'أبقِ تطبيقاً قديماً يعمل: إصلاحات وأمان فقط، ودون أي حزمة جديدة.')],
      ['refactor', t('Restructure in approved phases, with behaviour and tests held still.', 'أعد الهيكلة على مراحل توافق عليها، مع بقاء السلوك والاختبارات ثابتين.')],
      ['upgrade', t('Move one dependency family to a new version, in approved phases.', 'انقل عائلة حزم واحدة إلى إصدار جديد، على مراحل توافق عليها.')],
      ['freeze', t('Before a release: fixes only, no change to packages or tool configs.', 'قبل الإصدار: إصلاحات فقط، ودون تغيير في الحزم أو إعدادات الأدوات.')],
    ],
  },
  {
    title: t('Modes of this checkout', 'أنماط هذه النسخة'),
    lead: t('For one job on one machine. They are never committed.', 'لعمل واحد على جهاز واحد، ولا تُحفظ مع الكود أبداً.'),
    modes: [
      ['hotfix', t('The smallest safe fix on released code, five source files by default.', 'أصغر إصلاح آمن على كود منشور، بخمسة ملفات كود افتراضياً.')],
      ['read-only', t('Inspect and report. Only the report folder may be written.', 'افحص واكتب تقريراً. ويُسمح بالكتابة في مجلد التقارير فقط.')],
      ['prototype', t('Try an idea in its own folder, away from production code.', 'جرّب فكرة في مجلد خاص بها، بعيداً عن كود الإنتاج.')],
    ],
  },
] as const
