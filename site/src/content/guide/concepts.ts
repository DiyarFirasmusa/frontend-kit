import type { Bilingual } from '../catalogue.ts'
import type { Facts } from '../types.ts'
import type { PageId } from './pages.ts'
import { t } from './text.ts'

interface Concept {
  name: Bilingual
  count?: keyof Facts
  like: Bilingual
  text: Bilingual
  example: Bilingual
  page: PageId
}

/** The six words someone needs before anything else on the site makes sense. */
export const concepts: Concept[] = [
  {
    name: t('Skill', 'المهارة'),
    count: 'skills',
    like: t('A ready set of instructions', 'تعليمات جاهزة'),
    text: t(
      'The steps for one job, such as building a table. The assistant reads them when your request fits, or when you type the skill’s name.',
      'خطوات لمهمة واحدة، مثل بناء جدول. يقرؤها المساعد عندما يناسبها طلبك، أو عندما تكتب اسم المهارة.',
    ),
    example: t(
      'You ask for a table, and the assistant follows the skill dash-create-table.',
      'تطلب جدولا، فيتبع المساعد مهارة ⁦dash-create-table⁩.',
    ),
    page: 'skills',
  },
  {
    name: t('Specialist', 'المختص'),
    count: 'agents',
    like: t('A helper with one job', 'مساعد له مهمة واحدة'),
    text: t(
      'A separate helper with one job, like a reviewer or a tester. It does its job and hands you a short report.',
      'مساعد مستقل له مهمة واحدة، مثل مراجع أو مختبر. ينفذ مهمته ثم يسلمك تقريرا قصيرا.',
    ),
    example: t(
      'When the checks pass, the specialist called frontend-reviewer reads the change.',
      'عندما تنجح الفحوص، يقرأ المختص ⁦frontend-reviewer⁩ التغيير.',
    ),
    page: 'agents',
  },
  {
    name: t('Rule', 'القاعدة'),
    count: 'rules',
    like: t('Written standards', 'معايير مكتوبة'),
    text: t(
      'Standards saved in your project folder. The assistant reads them while it works on the files they cover.',
      'معايير محفوظة في مجلد مشروعك. يقرؤها المساعد أثناء عمله على الملفات التي تخصها.',
    ),
    example: t('When the assistant edits a form, it reads the forms rule.', 'عندما يعدل المساعد نموذجا، يقرأ قاعدة النماذج.'),
    page: 'rules',
  },
  {
    name: t('Safety check', 'فحص الأمان'),
    count: 'events',
    like: t('An automatic checkpoint', 'نقطة فحص تلقائية'),
    text: t(
      'It runs by itself at a fixed moment, so the checks themselves do not depend on the assistant remembering. It can tidy the code, test it, warn you, or say no.',
      'يعمل من تلقاء نفسه في لحظة محددة، فلا تعتمد الفحوص نفسها على أن يتذكر المساعد. يمكنه أن ينسق الكود أو يختبره أو ينبهك أو يرفض.',
    ),
    example: t('Uploading straight to the main version is refused before it happens.', 'يرفض فحص الأمان الرفع مباشرة إلى النسخة الرئيسية قبل أن يتم.'),
    page: 'checks',
  },
  {
    name: t('Project type', 'نوع المشروع'),
    like: t('What you are building', 'ما الذي تبنيه'),
    text: t(
      'A website, a dashboard, or both in one project. Your answer decides which skills and rules the kit sets up.',
      'موقع، أو لوحة تحكم، أو الاثنان في مشروع واحد. إجابتك تحدد المهارات والقواعد التي تجهزها الإضافة.',
    ),
    example: t('A dashboard gets table skills and rules about who may see what.', 'لوحة التحكم تحصل على مهارات الجداول وقواعد تحدد من يرى ماذا.'),
    page: 'project-types',
  },
  {
    name: t('Extra tool', 'أداة إضافية'),
    count: 'servers',
    like: t('A new ability', 'قدرة جديدة'),
    text: t(
      'A connection that gives the assistant something it lacks, such as a web browser or the current instructions of a library. Its technical name is MCP server.',
      'اتصال يعطي المساعد شيئا لا يملكه، مثل متصفح أو أحدث تعليمات إحدى المكتبات. اسمه التقني ⁦MCP server⁩.',
    ),
    example: t('With Playwright, the assistant can click through your site like a visitor.', 'مع ⁦Playwright⁩ يستطيع المساعد أن يتنقل في موقعك وينقر فيه كما يفعل الزائر.'),
    page: 'features',
  },
]

interface Moment {
  who: Bilingual
  what: Bilingual
}

/** One request, from the sentence to the link. */
export const journey: Moment[] = [
  { who: t('You', 'أنت'), what: t('“Add an orders page with a table and a status filter.”', '«أضف صفحة طلبات فيها جدول وفلتر للحالة».') },
  { who: t('Safety check', 'فحص أمان'), what: t('Points the assistant to the skills that fit: the table and the filter bar.', 'يدل المساعد على المهارات المناسبة: الجدول وشريط الفلاتر.') },
  {
    who: t('Skills', 'مهارات'),
    what: t(
      'The assistant follows their steps: a page only the right people can open, a table that loads one page at a time, filters that stay in the page address, both languages, and tests.',
      'يتبع المساعد خطواتها: صفحة لا يفتحها إلا من له الصلاحية، وجدول يحمل صفحة واحدة في كل مرة، وفلاتر تبقى في عنوان الصفحة، ودعم اللغتين، واختبارات.',
    ),
  },
  { who: t('Rules', 'قواعد'), what: t('The standards for tables, permissions and your backend are read while those files are edited.', 'يقرأ المساعد معايير الجداول والصلاحيات والخادم الخلفي أثناء تعديل هذه الملفات.') },
  {
    who: t('Safety check', 'فحص أمان'),
    what: t('Each file is tidied and checked for mistakes the moment it is saved. Errors go straight back to the assistant.', 'كل ملف يُنسق ويُفحص بحثا عن الأخطاء لحظة حفظه. وتعيد الأخطاء إلى المساعد مباشرة.'),
  },
  {
    who: t('Final check', 'الفحص الأخير'),
    what: t(
      'When the assistant tries to finish, the code is checked for mistakes and the related tests run. If something fails, it goes back to work.',
      'عندما يريد المساعد أن ينهي المهمة، يُفحص الكود بحثا عن الأخطاء وتعمل الاختبارات المرتبطة بالتغيير. وإذا فشل شيء، يرجع إلى العمل.',
    ),
  },
  {
    who: t('Specialist', 'مختص'),
    what: t('A reviewer called frontend-reviewer reads the change with fresh eyes, and the assistant fixes what it finds.', 'يقرأ المراجع ⁦frontend-reviewer⁩ التغيير بنظرة جديدة، ويصلح المساعد ما يجده.'),
  },
  {
    who: t('You', 'أنت'),
    what: t(
      'You get a short report and one question: save these changes and upload them? Then a link, where you open a request to merge them.',
      'يصلك تقرير قصير وسؤال واحد: هل أحفظ هذه التغييرات وأرفعها؟ ثم رابط تفتح منه طلبا لدمجها.',
    ),
  },
]
