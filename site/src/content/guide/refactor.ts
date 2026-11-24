import { t } from './text.ts'

/** What refactor mode measures, and the order it repairs in. */
export const rescue = {
  measures: [
    t('The safety net: do typecheck, lint and tests pass today?', 'شبكة الأمان: هل ينجح اليوم فحص الأنواع والـ lint والاختبارات؟'),
    t('Structure: folders, huge files, circular imports, dead code.', 'البنية: المجلدات، والملفات الضخمة، والاستيراد الدائري، والكود الميت.'),
    t('Types: any, ignored errors, untyped API data.', 'الأنواع: any، والأخطاء المتجاهلة، وبيانات الـ API بلا أنواع.'),
    t('Data: fetching in components and missing states.', 'البيانات: الجلب داخل المكونات، والحالات الناقصة.'),
    t('Interface: duplicates, untranslated text, RTL and labels.', 'الواجهة: التكرار، والنص غير المترجم، واتجاه RTL، والتسميات.'),
    t('Quality: coverage, skipped tests and secrets in the repo.', 'الجودة: التغطية، والاختبارات التي تم تخطيها، والأسرار في المستودع.'),
  ],
  phaseList: [
    t('Green baseline: make the checks pass.', 'أساس ناجح: اجعل الفحوص تنجح.'),
    t('Mechanical: format, lint, renames and dead code.', 'العمل الآلي: التنسيق، والـ lint، وتغيير الأسماء، والكود الميت.'),
    t('Types: strict and no any.', 'الأنواع: صارمة وبلا any.'),
    t('Structure: the layout you picked, by default your own, and smaller files.', 'البنية: الترتيب الذي اخترته (وافتراضيا ترتيبك أنت)، وملفات أصغر.'),
    t('Patterns: one way for data, forms and state.', 'الأنماط: طريقة واحدة للبيانات والنماذج والحالة.'),
    t('Quality: tests, accessibility, translations and speed.', 'الجودة: الاختبارات، وسهولة الوصول، والترجمات، والسرعة.'),
  ],
}
