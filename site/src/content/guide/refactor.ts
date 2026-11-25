import { t } from './text.ts'

/** What fixing an old project measures, and the order it repairs in. */
export const rescue = {
  measures: [
    t('The safety net: do the checks for mistakes, for code style and the tests pass today?', 'شبكة الأمان: هل تنجح اليوم فحوص الأخطاء وأسلوب الكود والاختبارات؟'),
    t('Structure: folders, huge files, files that depend on each other in circles, and code nobody uses.', 'البنية: المجلدات، والملفات الضخمة، والملفات التي يعتمد بعضها على بعض في دائرة، والكود الذي لا يستخدمه أحد.'),
    t('Type safety: places that skip the checks (any), errors that are ignored, and data from your backend with no description.', 'سلامة الأنواع: الأماكن التي تتجاوز الفحص (any)، والأخطاء المتجاهلة، وبيانات الخادم التي لا وصف لها.'),
    t('Data: loading data in messy places, and missing states such as loading and error.', 'البيانات: جلب البيانات في أماكن غير مرتبة، والحالات الناقصة مثل التحميل والخطأ.'),
    t('Screens: copy-pasted parts, text that is not translated, right-to-left (Arabic) problems and missing labels.', 'الشاشات: الأجزاء المكررة، والنص غير المترجم، ومشكلات الاتجاه من اليمين إلى اليسار (العربية)، والتسميات الناقصة.'),
    t('Quality: how much code the tests cover, skipped tests, and passwords or keys saved in the project.', 'الجودة: مقدار الكود الذي تغطيه الاختبارات، والاختبارات المتخطاة، وكلمات المرور أو المفاتيح المحفوظة داخل المشروع.'),
  ],
  phaseList: [
    t('A green start: make the checks pass first.', 'بداية سليمة: اجعل الفحوص تنجح أولا.'),
    t('Safe automatic clean-up: tidy layout, style fixes, better names and removing unused code.', 'تنظيف آلي آمن: ترتيب الشكل، وإصلاح الأسلوب، وأسماء أفضل، وحذف الكود غير المستخدم.'),
    t('Stricter types: no any.', 'أنواع أشد صرامة: بلا any.'),
    t('Structure: the folder layout you picked (by default, your own) and smaller files.', 'البنية: ترتيب المجلدات الذي اخترته (وافتراضيا ترتيبك أنت)، وملفات أصغر.'),
    t('One way for each job: one way to load data, handle forms and keep state.', 'طريقة واحدة لكل عمل: طريقة واحدة لجلب البيانات، ولمعالجة النماذج، ولحفظ الحالة.'),
    t('Quality: tests, use by people with disabilities, translations and speed.', 'الجودة: الاختبارات، وسهولة الاستخدام لذوي الإعاقة، والترجمات، والسرعة.'),
  ],
}
