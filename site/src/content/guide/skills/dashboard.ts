import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const dashboard: Record<string, SkillGuide> = {
  'dash-create-route': {
    plain: t(
      'Adds a screen to your admin dashboard: the address people use to reach it, who is allowed to open it, and its place in the side menu.',
      'يضيف شاشة إلى لوحة التحكم عندك: العنوان الذي يصل به الناس إليها، ومن يحق له فتحها، ومكانها في القائمة الجانبية.',
    ),
    ask: [t('add an orders page to the dashboard', 'أضف صفحة طلبات إلى لوحة التحكم'), t('only admins can open the reports page', 'اجعل صفحة التقارير للمشرفين فقط')],
    steps: [
      t('Decides which layout it uses, which permission it needs and which values the address can carry.', 'يحدد أي تخطيط تستخدمه، وأي صلاحية تحتاجها، وأي قيم يمكن أن يحملها الرابط.'),
      t('Writes the route (the screen’s address and its logic) with a guard, a check that stops people who have no permission, and rules for the search values in the address.', 'يكتب المسار (عنوان الشاشة ومنطقها) مع حارس، وهو فحص يمنع من لا صلاحية له، ومع قواعد تتحقق من قيم البحث في الرابط.'),
      t('Loads the data before the page shows, when your framework can do that.', 'يحمل البيانات قبل ظهور الصفحة، إذا كان إطار العمل عندك يدعم ذلك.'),
      t('Adds the item to the side menu with the same permission.', 'يضيف العنصر إلى القائمة الجانبية بالصلاحية نفسها.'),
    ],
    result: [t('A protected screen and its menu item', 'شاشة محمية وعنصرها في القائمة'), t('The right shape for Vite, TanStack Start or Next.js (the tools a dashboard can be built with)', 'الشكل المناسب لـ Vite أو TanStack Start أو Next.js (أدوات يمكن أن تبنى بها لوحة التحكم)')],
    limits: [t('Never makes up a permission name. It asks you for the one your backend uses.', 'لا يخترع اسم صلاحية، بل يسألك عن الاسم الذي يستخدمه الخادم عندك.')],
    related: ['dash-create-table', 'dash-create-detail', 'dash-create-crud'],
  },
  'dash-create-table': {
    plain: t(
      'Builds a page that lists records in a table, such as customers or orders. Your backend does the splitting into pages and the sorting, and the table stays the same after a reload or when you share its link.',
      'يبني صفحة تعرض السجلات في جدول، مثل العملاء أو الطلبات. الخادم عندك يقسم النتائج إلى صفحات ويفرزها، ويبقى الجدول كما هو بعد إعادة التحميل وعند مشاركة رابطه.',
    ),
    ask: [t('create a table of customers with sorting and pagination', 'أنشئ جدول عملاء فيه فرز وتقسيم إلى صفحات'), t('show all orders with bulk delete', 'اعرض كل الطلبات مع حذف جماعي')],
    steps: [
      t('Checks what your backend can really split into pages, sort and filter.', 'يتأكد مما يستطيع الخادم فعلا تقسيمه إلى صفحات وفرزه وتصفيته.'),
      t('Writes the pieces: the data shapes, the call to your backend, the columns, the page logic and the page itself.', 'يكتب الأجزاء: شكل البيانات، والطلب إلى الخادم، والأعمدة، ومنطق الصفحة، والصفحة نفسها.'),
      t('Designs every state: loading, refreshing, error, empty, and no matching results.', 'يصمم كل حالة: التحميل، والتحديث، والخطأ، والفراغ، وعدم وجود نتائج مطابقة.'),
      t('Tests it, including who is allowed to see it.', 'يختبره، ويشمل ذلك من يحق له رؤيته.'),
    ],
    result: [t('A complete list feature', 'ميزة قائمة كاملة'), t('Page number and sorting kept in the address', 'رقم الصفحة والفرز محفوظان في الرابط'), t('Both languages and tests', 'النصوص بالعربية والإنجليزية، والاختبارات')],
    limits: [t('Never fakes sorting by reordering only the rows on screen. It writes a real request to your backend.', 'لا يزيف الفرز بترتيب الصفوف الظاهرة فقط، بل يكتب طلبا حقيقيا إلى الخادم.')],
    related: ['dash-create-filter-bar', 'dash-create-route', 'backend-request'],
  },
  'dash-create-filter-bar': {
    plain: t('The search box and filters above a list. What you chose stays in the address bar, so a reload or a shared link shows the same list.', 'مربع البحث والفلاتر أعلى القائمة. ما اخترته يبقى في شريط العنوان، فتظهر القائمة نفسها بعد إعادة التحميل أو عند مشاركة الرابط.'),
    ask: [t('add filters by status and date', 'أضف فلاتر للحالة والتاريخ'), t('keep the search after reload', 'اجعل البحث يبقى بعد إعادة التحميل')],
    steps: [
      t('Keeps only the filters your backend supports.', 'يبقي فقط الفلاتر التي يدعمها الخادم.'),
      t('Saves each filter in the address, with a fixed rule for which values are allowed.', 'يحفظ كل فلتر في الرابط، بقاعدة ثابتة لما يسمح به من قيم.'),
      t('Goes back to page one when a filter changes, and waits until you stop typing.', 'يرجع إلى الصفحة الأولى عند أي تغيير في الفلاتر، وينتظر حتى تتوقف عن الكتابة.'),
      t('Adds a clear-all button, a phone layout and labels.', 'يضيف زر مسح الكل، وتخطيطا للجوال، وتسميات.'),
    ],
    result: [t('A filter bar whose link can be shared', 'شريط فلاتر يمكن مشاركة رابطه'), t('Tests for the filter rules', 'اختبارات لقواعد الفلاتر')],
    limits: [t('No filtering in the browser on one page of data. The filters go to your backend.', 'لا تصفية في المتصفح على صفحة واحدة من البيانات. الفلاتر تذهب إلى الخادم.')],
    related: ['dash-create-table', 'create-form'],
  },
  'dash-create-detail': {
    plain: t('The page that opens when you click one row of a list: an order, a user, an invoice.', 'الصفحة التي تفتح عند الضغط على صف واحد من قائمة: طلب أو مستخدم أو فاتورة.'),
    ask: [t('add an order details page with status changes', 'أضف صفحة تفاصيل للطلب مع تغيير حالته'), t('open the row in a page with tabs', 'افتح الصف في صفحة فيها تبويبات')],
    steps: [
      t('Lists the actions and status changes your backend allows.', 'يحدد الإجراءات وتغييرات الحالة التي يسمح بها الخادم.'),
      t('Builds the top part, the sections, the history, and tabs that are kept in the address.', 'يبني الجزء العلوي والأقسام والسجل، والتبويبات المحفوظة في الرابط.'),
      t('Shows only the actions this user’s role may take, each one asking “are you sure?”.', 'يعرض فقط الإجراءات المسموحة لدور هذا المستخدم، وكل إجراء يسأل «هل أنت متأكد؟».'),
      t('Handles two people editing the same record at once.', 'يتعامل مع شخصين يعدلان السجل نفسه في الوقت نفسه.'),
    ],
    result: [t('A detail page with a real “not found” page (404)', 'صفحة تفاصيل فيها صفحة «غير موجود» حقيقية (404)'), t('Tests for permissions and for editing clashes', 'اختبارات للصلاحيات ولتعارض التعديلات')],
    limits: [t('Never shows an action the current status does not allow.', 'لا يعرض أي إجراء لا تسمح به الحالة الحالية.')],
    related: ['dash-create-crud', 'dash-create-route'],
  },
  'dash-create-crud': {
    plain: t('Add, edit and delete for one kind of record, such as products, done safely. (CRUD stands for create, read, update, delete.)', 'الإضافة والتعديل والحذف لنوع واحد من السجلات، مثل المنتجات، بطريقة آمنة. (CRUD اختصار: إنشاء وقراءة وتحديث وحذف.)'),
    ask: [t('add create, edit and delete for products', 'أضف الإضافة والتعديل والحذف للمنتجات'), t('add a toggle to activate a user', 'أضف مفتاح تبديل لتفعيل المستخدم')],
    steps: [
      t('Writes the field rules and the converters that turn your backend’s data into screen data and back.', 'يكتب قواعد الحقول والمحولات التي تحول بيانات الخادم إلى بيانات الشاشة والعكس.'),
      t('Builds the pop-up or page, and allows only one send at a time.', 'يبني النافذة المنبثقة أو الصفحة، ولا يسمح بأكثر من إرسال في الوقت نفسه.'),
      t('Shows errors from your backend next to the matching fields.', 'يعرض أخطاء الخادم بجانب الحقول المعنية.'),
      t('Asks for confirmation before deleting, showing the record’s name, and protects each action with a permission.', 'يطلب تأكيدا قبل الحذف ويذكر اسم السجل، ويحمي كل إجراء بصلاحية.'),
    ],
    result: [t('Pop-ups, saving actions and confirmations', 'نوافذ منبثقة وإجراءات حفظ وتأكيدات'), t('Lists that refresh after a change, and tests', 'قوائم تتحدث بعد كل تغيير، واختبارات')],
    limits: [t('Editing does not trust the row in the table. It loads the record again.', 'التعديل لا يعتمد على صف الجدول، بل يجلب السجل من جديد.')],
    related: ['create-form', 'dash-create-table'],
  },
  'dash-create-settings-form': {
    plain: t('A settings page: one record, several sections, one Save button.', 'صفحة إعدادات: سجل واحد، وعدة أقسام، وزر حفظ واحد.'),
    ask: [t('create the store settings page', 'أنشئ صفحة إعدادات المتجر'), t('add a profile page with preferences', 'أضف صفحة الملف الشخصي مع التفضيلات')],
    steps: [
      t('Loads the record and groups it into sections.', 'يجلب السجل ويقسمه إلى أقسام.'),
      t('Makes some sections read-only for people who have no permission to change them.', 'يجعل بعض الأقسام للقراءة فقط لمن لا صلاحية له لتغييرها.'),
      t('Sends only the fields that changed.', 'يرسل الحقول التي تغيرت فقط.'),
      t('Warns you before you leave with unsaved changes, and handles two people saving at once.', 'ينبهك قبل أن تغادر وفيها تغييرات غير محفوظة، ويعالج حالة حفظ شخصين في الوقت نفسه.'),
    ],
    result: [t('A settings page with one save bar', 'صفحة إعدادات بشريط حفظ واحد'), t('Tests for read-only sections and for saving clashes', 'اختبارات للأقسام للقراءة فقط وللتعارض عند الحفظ')],
    limits: [t('Never puts a secret value, such as a password, back into a field.', 'لا يعيد أي قيمة سرية، مثل كلمة المرور، إلى حقل.')],
    related: ['create-form', 'dash-create-crud'],
  },
}
