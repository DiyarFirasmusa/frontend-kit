import { t } from './text.ts'

/** What refactor mode measures, and the order it repairs in. */
export const rescue = {
  measures: [
    t('The safety net: do typecheck, lint and tests pass today?', 'شبكة الأمان: فحص الأنواع والـ lint والاختبارات، تنجح اليوم أو لا؟'),
    t('Structure: folders, huge files, circular imports, dead code.', 'البنية: المجلدات، والملفات الضخمة، والاستيراد الدائري، والكود الميت.'),
    t('Types: any, ignored errors, untyped API data.', 'الأنواع: any، والأخطاء المتجاهلة، وبيانات الـ API بدون أنواع.'),
    t('Data: fetching in components and missing states.', 'البيانات: الجلب داخل المكوّنات، والحالات الناقصة.'),
    t('Interface: duplicates, untranslated text, RTL and labels.', 'الواجهة: التكرار، والنص اللي ما مترجم، والاتجاه، والتسميات.'),
    t('Quality: coverage, skipped tests and secrets in the repo.', 'الجودة: التغطية، والاختبارات المتروكة بـ skip، والأسرار بالمستودع.'),
  ],
  phaseList: [
    t('Green baseline: make the checks pass.', 'أساس ناجح: خلّي الفحوص تنجح.'),
    t('Mechanical: format, lint, renames and dead code.', 'شغل آلي: تنسيق، وlint، وتغيير أسماء، وكود ميت.'),
    t('Types: strict and no any.', 'الأنواع: صارمة وبدون any.'),
    t('Structure: the layout you picked, by default your own, and smaller files.', 'البنية: الترتيب اللي اخترته، وافتراضياً ترتيبك أنت، وملفات أصغر.'),
    t('Patterns: one way for data, forms and state.', 'الأنماط: طريقة وحدة للبيانات والنماذج والحالة.'),
    t('Quality: tests, accessibility, translations and speed.', 'الجودة: اختبارات، وسهولة وصول، وترجمة، وسرعة.'),
  ],
}
