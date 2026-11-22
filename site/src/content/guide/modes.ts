import { t } from './text.ts'

/** What `/frontend-kit:mode list` prints, in plain words. */
export const modeGroups = [
  {
    title: t('Modes of the project', 'أنماط المشروع'),
    lead: t('Kept in the committed config, so they follow the branch.', 'تُحفظ في ملف الإعدادات داخل git، فتتبع الفرع.'),
    modes: [
      ['new', t('Build to the standards from the first file.', 'ابنِ على المعايير من أول ملف.')],
      ['existing', t('The default. Follow what the project does; it adds no rule.', 'الافتراضي: اتبع ما يفعله المشروع، ولا يضيف أي قاعدة.')],
      ['maintenance', t('Keep an old app running: fixes and security only, no new dependency.', 'أبقِ تطبيقاً قديماً يعمل: إصلاحات وأمان فقط ولا اعتمادية جديدة.')],
      ['refactor', t('Restructure in approved phases, with behaviour and tests held still.', 'أعد البناء على مراحل موافق عليها، مع ثبات السلوك والاختبارات.')],
      ['upgrade', t('Move one dependency family to a new version, in approved phases.', 'انقل عائلة اعتماديات واحدة إلى إصدار جديد على مراحل موافق عليها.')],
      ['freeze', t('Before a release: fixes only, no change to packages or tool configs.', 'قبل الإصدار: إصلاحات فقط، ولا تغيير للحزم أو إعدادات الأدوات.')],
    ],
  },
  {
    title: t('Modes of this checkout', 'أنماط هذه النسخة'),
    lead: t('For one job on one machine. They are never committed.', 'لمهمة واحدة على جهاز واحد، ولا تُحفظ في git.'),
    modes: [
      ['hotfix', t('The smallest safe fix on released code, five source files by default.', 'أصغر إصلاح آمن على الشيفرة المنشورة، خمسة ملفات افتراضياً.')],
      ['read-only', t('Inspect and report. Only the report folder may be written.', 'افحص واكتب تقريراً، ولا يُكتب إلا في مجلد التقارير.')],
      ['prototype', t('Try an idea in its own folder, away from production code.', 'جرّب فكرة في مجلدها، بعيداً عن شيفرة الإنتاج.')],
    ],
  },
] as const
