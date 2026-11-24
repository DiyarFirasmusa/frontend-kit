import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const dashboard: Record<string, SkillGuide> = {
  'dash-create-route': {
    plain: t(
      'Adds a screen to an admin app: its address, who may open it, and its place in the sidebar.',
      'يضيف شاشة إلى لوحة الإدارة: عنوانها، ومن يستطيع فتحها، ومكانها في الشريط الجانبي.',
    ),
    ask: [t('add an orders page to the dashboard', 'أضف صفحة طلبات إلى لوحة التحكم'), t('only admins can open the reports page', 'اجعل صفحة التقارير للمشرفين فقط')],
    steps: [
      t('Decides the layout group, the permission and the URL values.', 'يحدد مجموعة التخطيط والصلاحية وقيم الرابط.'),
      t('Writes the route with a guard and a validated search schema.', 'يكتب المسار مع حارس ومخطط بحث يتحقق من القيم.'),
      t('Loads the data before the page shows, where the framework has loaders.', 'يحمّل البيانات قبل ظهور الصفحة، إذا كان الإطار يدعم ذلك.'),
      t('Adds the sidebar item with the same permission.', 'يضيف عنصرها في الشريط الجانبي بالصلاحية نفسها.'),
    ],
    result: [t('A guarded route and its nav entry', 'مسار محمي وعنصره في القائمة'), t('The right shape for Vite, TanStack Start or Next.js', 'الشكل المناسب لـ Vite أو TanStack Start أو Next.js')],
    limits: [t('Never invents a permission name. It asks for the backend’s.', 'لا يخترع اسم صلاحية. يسأل عن الاسم المستخدم في الخادم.')],
    related: ['dash-create-table', 'dash-create-detail', 'dash-create-crud'],
  },
  'dash-create-table': {
    plain: t(
      'Builds a list page. The server does the paging and sorting, and the table survives a reload and a shared link.',
      'يبني صفحة قائمة. الخادم هو الذي يقسّم الصفحات ويفرز، ويبقى الجدول كما هو بعد إعادة التحميل وعند مشاركة الرابط.',
    ),
    ask: [t('create a table of customers with sorting and pagination', 'أنشئ جدول عملاء فيه فرز وتقسيم إلى صفحات'), t('show all orders with bulk delete', 'اعرض كل الطلبات مع حذف جماعي')],
    steps: [
      t('Reads what the backend can really page, sort and filter.', 'يتحقق مما يستطيع الخادم فعلاً تقسيمه إلى صفحات وفرزه وتصفيته.'),
      t('Writes types, service, query, columns, page hook and container.', 'يكتب الأنواع والخدمة والاستعلام والأعمدة وhook الصفحة والحاوية.'),
      t('Designs loading, refetch, error, empty and no-results states.', 'يصمّم الحالات: التحميل وإعادة الجلب والخطأ والفراغ وعدم وجود نتائج.'),
      t('Tests it, with permissions.', 'يختبره مع الصلاحيات.'),
    ],
    result: [t('A complete list feature', 'ميزة قائمة كاملة'), t('Paging and sorting kept in the URL', 'التقسيم إلى صفحات والفرز محفوظان في الرابط'), t('Both languages and tests', 'اللغتان والاختبارات')],
    limits: [t('Never fakes sorting by sorting only the visible page. It writes a backend request.', 'لا يزيّف الفرز بترتيب الصفحة الظاهرة فقط، بل يكتب طلباً إلى الخادم.')],
    related: ['dash-create-filter-bar', 'dash-create-route', 'backend-request'],
  },
  'dash-create-filter-bar': {
    plain: t('The search and filters above a list, kept in the address bar.', 'البحث والفلاتر أعلى القائمة، محفوظة في شريط العنوان.'),
    ask: [t('add filters by status and date', 'أضف فلاتر للحالة والتاريخ'), t('keep the search after reload', 'أبقِ البحث بعد إعادة التحميل')],
    steps: [
      t('Keeps only the filters the backend supports.', 'يُبقي فقط الفلاتر التي يدعمها الخادم.'),
      t('Puts each in a typed URL schema.', 'يضع كل فلتر في مخطط رابط محدد الأنواع.'),
      t('Goes back to page one on a change and waits while you type.', 'يعود إلى الصفحة الأولى عند أي تغيير، وينتظر حتى تنتهي من الكتابة.'),
      t('Adds clear-all, a phone layout and labels.', 'يضيف زر مسح الكل، وتخطيطاً للجوال، والتسميات.'),
    ],
    result: [t('A filter bar whose links can be shared', 'شريط فلاتر يمكن مشاركة روابطه'), t('Schema tests', 'اختبارات للمخطط')],
    limits: [t('No client-side filter over one page of data.', 'لا تصفية في المتصفح على صفحة واحدة من البيانات.')],
    related: ['dash-create-table', 'create-form'],
  },
  'dash-create-detail': {
    plain: t('The page you get when you open one row: an order, a user, an invoice.', 'الصفحة التي تظهر عند فتح صف واحد: طلب أو مستخدم أو فاتورة.'),
    ask: [t('add an order details page with status changes', 'أضف صفحة تفاصيل للطلب مع إمكانية تغيير حالته'), t('open the row in a page with tabs', 'افتح الصف في صفحة فيها تبويبات')],
    steps: [
      t('Lists the actions and state changes the backend allows.', 'يحصر الإجراءات وتغييرات الحالة التي يسمح بها الخادم.'),
      t('Builds the header, sections, history and tabs in the URL.', 'يبني الرأس والأقسام والسجل والتبويبات في الرابط.'),
      t('Shows only the actions this role may take, each with a confirmation.', 'يعرض فقط الإجراءات المسموحة لهذا الدور، ولكل إجراء تأكيد.'),
      t('Handles two people editing at once.', 'يعالج حالة شخصين يعدّلان في الوقت نفسه.'),
    ],
    result: [t('A detail page with a real 404', 'صفحة تفاصيل فيها 404 حقيقية'), t('Tested permissions and conflicts', 'صلاحيات وتعارضات تم اختبارها')],
    limits: [t('Never shows an action the state does not allow.', 'لا يعرض أي إجراء لا تسمح به الحالة.')],
    related: ['dash-create-crud', 'dash-create-route'],
  },
  'dash-create-crud': {
    plain: t('Create, edit and delete for one kind of record, done safely.', 'الإضافة والتعديل والحذف لنوع واحد من السجلات، بطريقة آمنة.'),
    ask: [t('add create, edit and delete for products', 'أضف الإضافة والتعديل والحذف للمنتجات'), t('add a toggle to activate a user', 'أضف مفتاح تبديل لتفعيل المستخدم')],
    steps: [
      t('Writes the schema and the mappers to and from the API.', 'يكتب المخطط والمحوّلات من الـ API وإليه.'),
      t('Builds the dialog or page with one submit at a time.', 'يبني النافذة أو الصفحة، ولا يسمح بأكثر من عملية إرسال في الوقت نفسه.'),
      t('Puts backend field errors on the matching inputs.', 'يضع أخطاء الخادم على الحقول المعنية.'),
      t('Confirms delete with the record’s name and gates each action.', 'يؤكد الحذف باسم السجل، ويحمي كل إجراء بصلاحية.'),
    ],
    result: [t('Dialogs, mutations and confirmations', 'نوافذ وعمليات تعديل وتأكيدات'), t('Refreshed lists and tests', 'قوائم محدّثة واختبارات')],
    limits: [t('Edit never trusts the table row. It loads the record again.', 'لا يعتمد التعديل على صف الجدول، بل يجلب السجل من جديد.')],
    related: ['create-form', 'dash-create-table'],
  },
  'dash-create-settings-form': {
    plain: t('A settings page: one record, several sections, one save.', 'صفحة إعدادات: سجل واحد، وعدة أقسام، وزر حفظ واحد.'),
    ask: [t('create the store settings page', 'أنشئ صفحة إعدادات المتجر'), t('add a profile page with preferences', 'أضف صفحة الملف الشخصي مع التفضيلات')],
    steps: [
      t('Loads the record and groups it into sections.', 'يجلب السجل ويقسّمه إلى أقسام.'),
      t('Makes sections read-only by permission.', 'يجعل الأقسام للقراءة فقط بحسب الصلاحية.'),
      t('Sends only the changed fields.', 'يرسل الحقول التي تغيّرت فقط.'),
      t('Warns before leaving and handles conflicts.', 'ينبّهك قبل أن تغادر الصفحة، ويعالج التعارضات.'),
    ],
    result: [t('A settings page with one save bar', 'صفحة إعدادات بشريط حفظ واحد'), t('Read-only and conflict tests', 'اختبارات للقراءة فقط وللتعارض')],
    limits: [t('Never fills a secret back into an input.', 'لا يعيد أي قيمة سرية إلى حقل.')],
    related: ['create-form', 'dash-create-crud'],
  },
}
