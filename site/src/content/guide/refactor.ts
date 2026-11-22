import { t } from './text.ts'

/** What refactor mode measures, and the order it repairs in. */
export const rescue = {
  measures: [
    t('The safety net: do typecheck, lint and tests pass today?', 'شبكة الأمان: هل تنجح الفحوص اليوم؟'),
    t('Structure: folders, huge files, circular imports, dead code.', 'البنية: المجلدات والملفات الضخمة والاستيراد الدائري والشيفرة الميتة.'),
    t('Types: any, ignored errors, untyped API data.', 'الأنواع: any والأخطاء المتجاهلة وبيانات الـ API بلا أنواع.'),
    t('Data: fetching in components and missing states.', 'البيانات: الجلب داخل المكوّنات والحالات الناقصة.'),
    t('Interface: duplicates, untranslated text, RTL and labels.', 'الواجهة: التكرار والنص غير المترجم والاتجاه والتسميات.'),
    t('Quality: coverage, skipped tests and secrets in the repo.', 'الجودة: التغطية والاختبارات المتخطاة والأسرار في المستودع.'),
  ],
  phaseList: [
    t('Green baseline: make the checks pass.', 'أساس ناجح: اجعل الفحوص تنجح.'),
    t('Mechanical: format, lint, renames and dead code.', 'آلية: تنسيق وتدقيق وتسمية وشيفرة ميتة.'),
    t('Types: strict and no any.', 'الأنواع: صارمة وبلا any.'),
    t('Structure: feature folders and smaller files.', 'البنية: مجلدات ميزات وملفات أصغر.'),
    t('Patterns: one way for data, forms and state.', 'الأنماط: طريقة واحدة للبيانات والنماذج والحالة.'),
    t('Quality: tests, accessibility, translations and speed.', 'الجودة: اختبارات ووصول وترجمة وسرعة.'),
  ],
}
