import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const dashboard: Record<string, SkillGuide> = {
  'dash-create-route': {
    plain: t(
      'Adds a screen to an admin app: its address, who may open it, and its place in the sidebar.',
      'يضيف شاشة للوحة الإدارة: عنوانها، ومنو يقدر يفتحها، ومكانها بالشريط الجانبي.',
    ),
    ask: [t('add an orders page to the dashboard', 'ضيف صفحة طلبات للوحة التحكم'), t('only admins can open the reports page', 'صفحة التقارير خليها بس للأدمن')],
    steps: [
      t('Decides the layout group, the permission and the URL values.', 'يحدد مجموعة التخطيط، والصلاحية، وقيم الرابط.'),
      t('Writes the route with a guard and a validated search schema.', 'يكتب المسار مع حارس، ومخطط بحث متحقق منه.'),
      t('Loads the data before the page shows, where the framework has loaders.', 'يجيب البيانات قبل ما تظهر الصفحة، إذا الإطار يدعم هالشي.'),
      t('Adds the sidebar item with the same permission.', 'يضيف عنصرها بالشريط الجانبي بنفس الصلاحية.'),
    ],
    result: [t('A guarded route and its nav entry', 'مسار محمي وعنصره بالقائمة'), t('The right shape for Vite, TanStack Start or Next.js', 'الشكل الصح لـ Vite أو TanStack Start أو Next.js')],
    limits: [t('Never invents a permission name. It asks for the backend’s.', 'ما يخترع اسم صلاحية من عنده، يسأل عن الاسم اللي بالسيرفر.')],
    related: ['dash-create-table', 'dash-create-detail', 'dash-create-crud'],
  },
  'dash-create-table': {
    plain: t(
      'Builds a list page. The server does the paging and sorting, and the table survives a reload and a shared link.',
      'يبني صفحة قائمة. السيرفر يسوي الترقيم والفرز، والجدول يبقى نفسه بعد التحديث ولما تشارك الرابط.',
    ),
    ask: [t('create a table of customers with sorting and pagination', 'سوّي جدول عملاء فيه فرز وصفحات'), t('show all orders with bulk delete', 'اعرضلي كل الطلبات، وأريد أحذف أكثر من وحدة مرة وحدة')],
    steps: [
      t('Reads what the backend can really page, sort and filter.', 'يشوف شنو السيرفر يقدر فعلاً يرقّم ويفرز ويفلتر.'),
      t('Writes types, service, query, columns, page hook and container.', 'يكتب الأنواع، والخدمة، والاستعلام، والأعمدة، والـ hook، والحاوية.'),
      t('Designs loading, refetch, error, empty and no-results states.', 'يصمّم كل الحالات: التحميل، إعادة الجلب، الخطأ، الفراغ، وما في نتائج.'),
      t('Tests it, with permissions.', 'يختبره، ويختبر الصلاحيات معه.'),
    ],
    result: [t('A complete list feature', 'ميزة قائمة كاملة'), t('Paging and sorting kept in the URL', 'الترقيم والفرز محفوظين بالرابط'), t('Both languages and tests', 'اللغتين والاختبارات')],
    limits: [t('Never fakes sorting by sorting only the visible page. It writes a backend request.', 'ما يزيّف الفرز بترتيب الصفحة الظاهرة بس، يكتب طلب للسيرفر.')],
    related: ['dash-create-filter-bar', 'dash-create-route', 'backend-request'],
  },
  'dash-create-filter-bar': {
    plain: t('The search and filters above a list, kept in the address bar.', 'البحث والفلاتر فوق القائمة، محفوظة بشريط العنوان.'),
    ask: [t('add filters by status and date', 'ضيف فلتر للحالة والتاريخ'), t('keep the search after reload', 'خلّي البحث يبقى بعد التحديث')],
    steps: [
      t('Keeps only the filters the backend supports.', 'يخلّي بس الفلاتر اللي يدعمها السيرفر.'),
      t('Puts each in a typed URL schema.', 'يحط كل فلتر بمخطط رابط مضبوط الأنواع.'),
      t('Goes back to page one on a change and waits while you type.', 'يرجع للصفحة الأولى لما يتغير شي، وينتظرك لحد ما تخلص كتابة.'),
      t('Adds clear-all, a phone layout and labels.', 'يضيف زر مسح الكل، وشكل للموبايل، والتسميات.'),
    ],
    result: [t('A filter bar whose links can be shared', 'شريط فلاتر تقدر تشارك روابطه'), t('Schema tests', 'اختبارات للمخطط')],
    limits: [t('No client-side filter over one page of data.', 'ما في فلترة بالمتصفح على صفحة وحدة من البيانات.')],
    related: ['dash-create-table', 'create-form'],
  },
  'dash-create-detail': {
    plain: t('The page you get when you open one row: an order, a user, an invoice.', 'الصفحة اللي تنفتح لما تختار صف: طلب، مستخدم، أو فاتورة.'),
    ask: [t('add an order details page with status changes', 'ضيف صفحة تفاصيل للطلب وأقدر أغيّر حالته منها'), t('open the row in a page with tabs', 'خلّي الصف ينفتح بصفحة فيها تبويبات')],
    steps: [
      t('Lists the actions and state changes the backend allows.', 'يحصر الأفعال وتغييرات الحالة اللي يسمح بها السيرفر.'),
      t('Builds the header, sections, history and tabs in the URL.', 'يبني الرأس، والأقسام، والسجل، والتبويبات بالرابط.'),
      t('Shows only the actions this role may take, each with a confirmation.', 'يطلّع بس الأفعال المسموحة لهذا الدور، وكل وحدة إلها تأكيد.'),
      t('Handles two people editing at once.', 'يتعامل مع شخصين يعدّلون بنفس الوقت.'),
    ],
    result: [t('A detail page with a real 404', 'صفحة تفاصيل فيها 404 حقيقية'), t('Tested permissions and conflicts', 'صلاحيات وتعارضات مختبرة')],
    limits: [t('Never shows an action the state does not allow.', 'ما يعرض أي فعل ما تسمح به الحالة.')],
    related: ['dash-create-crud', 'dash-create-route'],
  },
  'dash-create-crud': {
    plain: t('Create, edit and delete for one kind of record, done safely.', 'إضافة وتعديل وحذف لنوع واحد من السجلات، وبأمان.'),
    ask: [t('add create, edit and delete for products', 'ضيف إضافة وتعديل وحذف للمنتجات'), t('add a toggle to activate a user', 'ضيف سويتش لتفعيل المستخدم')],
    steps: [
      t('Writes the schema and the mappers to and from the API.', 'يكتب المخطط والمحوّلات من وإلى الـ API.'),
      t('Builds the dialog or page with one submit at a time.', 'يبني النافذة أو الصفحة، وما يسمح بأكثر من إرسال بنفس الوقت.'),
      t('Puts backend field errors on the matching inputs.', 'يحط أخطاء السيرفر على الحقول اللي تخصها.'),
      t('Confirms delete with the record’s name and gates each action.', 'يأكّد الحذف باسم السجل، وكل فعل محمي بصلاحية.'),
    ],
    result: [t('Dialogs, mutations and confirmations', 'نوافذ، وعمليات، وتأكيدات'), t('Refreshed lists and tests', 'قوائم تتحدث، واختبارات')],
    limits: [t('Edit never trusts the table row. It loads the record again.', 'التعديل ما يثق بصف الجدول، يجيب السجل من جديد.')],
    related: ['create-form', 'dash-create-table'],
  },
  'dash-create-settings-form': {
    plain: t('A settings page: one record, several sections, one save.', 'صفحة إعدادات: سجل واحد، كم قسم، وزر حفظ واحد.'),
    ask: [t('create the store settings page', 'سوّي صفحة إعدادات المتجر'), t('add a profile page with preferences', 'ضيف صفحة بروفايل فيها التفضيلات')],
    steps: [
      t('Loads the record and groups it into sections.', 'يجيب السجل ويقسّمه لأقسام.'),
      t('Makes sections read-only by permission.', 'يخلّي الأقسام للقراءة بس، حسب الصلاحية.'),
      t('Sends only the changed fields.', 'يرسل بس الحقول اللي تغيّرت.'),
      t('Warns before leaving and handles conflicts.', 'ينبّهك قبل ما تطلع، ويتعامل مع التعارض.'),
    ],
    result: [t('A settings page with one save bar', 'صفحة إعدادات بشريط حفظ واحد'), t('Read-only and conflict tests', 'اختبارات للقراءة بس وللتعارض')],
    limits: [t('Never fills a secret back into an input.', 'ما يرجّع أي قيمة سرية لحقل.')],
    related: ['create-form', 'dash-create-crud'],
  },
}
