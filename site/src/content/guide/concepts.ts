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
    like: t('A playbook', 'دليل عمل'),
    text: t('The steps for one job. The assistant reads it when your request matches, or when you type its name.', 'خطوات مهمة واحدة. يقرؤها المساعد عندما يطابقها طلبك، أو عندما تكتب اسمها.'),
    example: t('You ask for a table, and the assistant follows dash-create-table.', 'تطلب جدولا، فيتبع المساعد مهارة dash-create-table.'),
    page: 'skills',
  },
  {
    name: t('Agent', 'الوكيل'),
    count: 'agents',
    like: t('A teammate', 'زميل'),
    text: t('A second assistant with one role and fresh eyes. It does a job and reports back.', 'مساعد آخر له دور واحد ونظرة جديدة. ينفذ مهمة ثم يكتب تقريرا.'),
    example: t('When checks pass, frontend-reviewer reads the change.', 'عندما تنجح الفحوص، يقرأ frontend-reviewer التغيير.'),
    page: 'agents',
  },
  {
    name: t('Rule', 'القاعدة'),
    count: 'rules',
    like: t('The team handbook', 'دليل الفريق'),
    text: t('Standards saved in your repo. The assistant reads them while it works on matching files.', 'معايير محفوظة في مستودعك. يقرؤها المساعد أثناء عمله على الملفات التي تخصها.'),
    example: t('Editing a form loads the forms rule.', 'عندما تعدل نموذجا، يقرأ المساعد قاعدة النماذج.'),
    page: 'rules',
  },
  {
    name: t('Hook', 'الحارس (Hook)'),
    count: 'events',
    like: t('An automatic checkpoint', 'نقطة فحص تلقائية'),
    text: t('A script that runs at a moment in the session. It can format, test, warn or refuse.', 'سكربت يعمل في لحظة معينة من الجلسة. يمكنه أن ينسق الكود أو يختبره أو ينبه أو يرفض.'),
    example: t('A push to main is refused before it runs.', 'يرفض الحارس الرفع إلى main قبل أن يتم.'),
    page: 'checks',
  },
  {
    name: t('Project type', 'نوع المشروع'),
    like: t('The fitting', 'ما يناسب مشروعك'),
    text: t('Website, dashboard, any other frontend, or site plus admin. It decides what gets installed.', 'موقع، أو لوحة تحكم، أو أي واجهة أخرى، أو موقع مع إدارة. هو الذي يحدد ما يثبته الإعداد.'),
    example: t('A dashboard gets table skills and permission rules.', 'لوحة التحكم تحصل على مهارات الجداول وقواعد الصلاحيات.'),
    page: 'project-types',
  },
  {
    name: t('MCP server', 'خادم MCP'),
    count: 'servers',
    like: t('An extra tool', 'أداة إضافية'),
    text: t('A connection that gives the assistant a tool it lacks: a browser, or current library documentation.', 'اتصال يعطي المساعد أداة لا يملكها، مثل متصفح أو توثيق حديث للمكتبات.'),
    example: t('Playwright lets the assistant click through your app.', 'مع Playwright يستطيع المساعد أن يتنقل في تطبيقك وينقر فيه.'),
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
  { who: t('Hook', 'حارس'), what: t('Tells the assistant which skills fit: the table and the filter bar.', 'يخبر المساعد بالمهارات المناسبة: الجدول وشريط الفلاتر.') },
  { who: t('Skills', 'مهارات'), what: t('The assistant follows their steps: the guarded route, the server-paged table, filters in the URL, both languages, tests.', 'يتبع المساعد خطواتها: مسار محمي، وجدول صفحاته من الخادم، وفلاتر في الرابط، ودعم اللغات، واختبارات.') },
  { who: t('Rules', 'قواعد'), what: t('The table, permission and API standards load while those files are edited.', 'يقرأ المساعد معايير الجداول والصلاحيات والـ API أثناء تعديل هذه الملفات.') },
  { who: t('Hook', 'حارس'), what: t('Formats and lints each file as it is saved. Errors go straight back to the assistant.', 'عند كل حفظ لملف، ينسقه ويفحصه بأداة lint. وترجع الأخطاء إلى المساعد مباشرة.') },
  { who: t('Quality gate', 'بوابة الجودة'), what: t('When the assistant tries to finish, typecheck and related tests run. A failure sends it back to work.', 'عندما يريد المساعد أن ينهي المهمة، يعمل فحص الأنواع والاختبارات المرتبطة بالتغيير. وإذا فشل شيء، يرجع إلى العمل.') },
  { who: t('Agent', 'وكيل'), what: t('frontend-reviewer reads the change with fresh eyes, and the assistant fixes what it finds.', 'يقرأ frontend-reviewer التغيير بنظرة جديدة، ويصلح المساعد ما يجده.') },
  { who: t('You', 'أنت'), what: t('You get a short report and one question: commit and push? Then a link, and you open the pull request.', 'يصلك تقرير قصير وسؤال واحد: هل أحفظ التغييرات وأرفعها؟ ثم رابط، وتفتح أنت الـ pull request.') },
]
