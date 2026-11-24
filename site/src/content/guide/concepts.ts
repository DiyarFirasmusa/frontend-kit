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
    like: t('A playbook', 'دليل شغل'),
    text: t('The steps for one job. The assistant reads it when your request matches, or when you type its name.', 'خطوات شغلة وحدة. المساعد يقراها من يطابقها طلبك، أو من تكتب اسمها.'),
    example: t('You ask for a table, and the assistant follows dash-create-table.', 'تطلب جدول، والمساعد يمشي على مهارة dash-create-table.'),
    page: 'skills',
  },
  {
    name: t('Agent', 'الوكيل'),
    count: 'agents',
    like: t('A teammate', 'زميل'),
    text: t('A second assistant with one role and fresh eyes. It does a job and reports back.', 'مساعد ثاني إله دور واحد وعين جديدة. يسوي الشغلة ويرجع بتقرير.'),
    example: t('When checks pass, frontend-reviewer reads the change.', 'من تنجح الفحوص، frontend-reviewer يقرا التغيير.'),
    page: 'agents',
  },
  {
    name: t('Rule', 'القاعدة'),
    count: 'rules',
    like: t('The team handbook', 'كتيّب الفريق'),
    text: t('Standards saved in your repo. The assistant reads them while it works on matching files.', 'معايير محفوظة بمستودعك، المساعد يقراها وهو يشتغل على الملفات اللي تخصها.'),
    example: t('Editing a form loads the forms rule.', 'تعدّل فورم، تنحمّل قاعدة الفورمات.'),
    page: 'rules',
  },
  {
    name: t('Hook', 'الحارس (Hook)'),
    count: 'events',
    like: t('An automatic checkpoint', 'نقطة فحص تلقائية'),
    text: t('A script that runs at a moment in the session. It can format, test, warn or refuse.', 'سكربت يشتغل بلحظة معيّنة من الجلسة. يرتّب الكود، يختبر، ينبّه، أو يرفض.'),
    example: t('A push to main is refused before it runs.', 'الرفع على main ينرفض قبل لا يصير.'),
    page: 'checks',
  },
  {
    name: t('Project type', 'نوع المشروع'),
    like: t('The fitting', 'التفصيل على القياس'),
    text: t('Website, dashboard, any other frontend, or site plus admin. It decides what gets installed.', 'موقع، لوحة تحكم، أي واجهة ثانية، أو موقع مع إدارة. وهو يحدد شنو ينثبت.'),
    example: t('A dashboard gets table skills and permission rules.', 'لوحة التحكم تاخذ مهارات الجداول وقواعد الصلاحيات.'),
    page: 'project-types',
  },
  {
    name: t('MCP server', 'سيرفر MCP'),
    count: 'servers',
    like: t('An extra tool', 'أداة زايدة'),
    text: t('A connection that gives the assistant a tool it lacks: a browser, or current library documentation.', 'وصلة تنطي المساعد أداة ما عنده: متصفح، أو توثيق مكتبات محدّث.'),
    example: t('Playwright lets the assistant click through your app.', 'Playwright يخلي المساعد يتجول بتطبيقك ويضغط بيه.'),
    page: 'features',
  },
]

interface Moment {
  who: Bilingual
  what: Bilingual
}

/** One request, from the sentence to the link. */
export const journey: Moment[] = [
  { who: t('You', 'انت'), what: t('“Add an orders page with a table and a status filter.”', '«سوّي صفحة طلبات فيها جدول وفلتر للحالة».') },
  { who: t('Hook', 'حارس'), what: t('Tells the assistant which skills fit: the table and the filter bar.', 'يقول للمساعد شنو المهارات المناسبة: الجدول وشريط الفلاتر.') },
  { who: t('Skills', 'مهارات'), what: t('The assistant follows their steps: the guarded route, the server-paged table, filters in the URL, both languages, tests.', 'المساعد يمشي على خطواتها: مسار محمي، جدول صفحاته من السيرفر، فلاتر بالرابط، اللغتين، والاختبارات.') },
  { who: t('Rules', 'قواعد'), what: t('The table, permission and API standards load while those files are edited.', 'معايير الجداول والصلاحيات والـ API تنحمّل وقت تعديل هالملفات.') },
  { who: t('Hook', 'حارس'), what: t('Formats and lints each file as it is saved. Errors go straight back to the assistant.', 'يرتّب ويدقق كل ملف أول ما ينحفظ، والأخطاء ترجع للمساعد على طول.') },
  { who: t('Quality gate', 'بوابة الجودة'), what: t('When the assistant tries to finish, typecheck and related tests run. A failure sends it back to work.', 'من يحاول المساعد يخلص، يشتغل فحص الأنواع والاختبارات المرتبطة. وإذا فشل شي يرجع يشتغل.') },
  { who: t('Agent', 'وكيل'), what: t('frontend-reviewer reads the change with fresh eyes, and the assistant fixes what it finds.', 'frontend-reviewer يقرا التغيير بعين جديدة، والمساعد يصلّح اللي يلقاه.') },
  { who: t('You', 'انت'), what: t('You get a short report and one question: commit and push? Then a link, and you open the pull request.', 'يوصلك تقرير قصير وسؤال واحد: أحفظ وأرفع؟ بعدين رابط، وانت تفتح الـ pull request.') },
]
