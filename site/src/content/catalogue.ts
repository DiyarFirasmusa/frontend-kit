export interface Bilingual {
  en: string
  ar: string
}

export interface SkillGroup {
  title: Bilingual
  skills: Record<string, Bilingual>
}

/** Every skill of the plugin, sorted by job. The build fails when this and the plugin disagree. */
export const skillGroups: SkillGroup[] = [
  {
    title: { en: 'Build', ar: 'البناء' },
    skills: {
      'create-component': { en: 'Creates or extracts a component: cards, buttons, dialogs, sections.', ar: 'تنشئ مكوّناً أو تستخرجه: بطاقة أو زر أو نافذة أو قسم.' },
      'create-form': { en: 'Builds a form with your form tools, one schema, translated errors and accessible fields.', ar: 'تبني نموذجاً بأدوات نماذجك ومخطط واحد وأخطاء مترجمة وحقول سهلة الوصول.' },
      'create-hook': { en: 'Writes a hook or your stack’s equivalent, from a small helper to a data query.', ar: 'تكتب hook أو ما يقابله في تقنياتك، من أداة صغيرة إلى استعلام بيانات.' },
      'create-store': { en: 'Adds shared state, in the form your stack uses, for what outlives a component.', ar: 'تضيف حالة مشتركة بالشكل الذي تستعمله تقنياتك، لما يعيش أطول من المكوّن.' },
      'figma-match': { en: 'Matches a Figma frame: sizes, colours, radii, type and states.', ar: 'تطابق إطار Figma في المقاسات والألوان والحواف والخطوط والحالات.' },
      'frontend-design': { en: 'Gives an original visual direction to a page that has no design yet.', ar: 'تقترح اتجاهاً بصرياً أصيلاً لصفحة لا تصميم لها بعد.' },
      'ui-ux-pro-max': { en: 'Searches a catalogue of styles, palettes, font pairs and UX guidelines.', ar: 'تبحث في فهرس للأساليب والألوان والخطوط وإرشادات التجربة.' },
    },
  },
  {
    title: { en: 'Dashboard', ar: 'لوحات التحكم' },
    skills: {
      'dash-create-route': { en: 'Adds a list, detail, create or edit route with its permission guard.', ar: 'تضيف مسار قائمة أو تفاصيل أو إنشاء أو تعديل مع حارس الصلاحية.' },
      'dash-create-table': { en: 'Builds a data table with server pagination, sorting and filters.', ar: 'تبني جدول بيانات بترقيم وفرز وتصفية من الخادم.' },
      'dash-create-filter-bar': { en: 'Adds search, selects and lookups above a list.', ar: 'تضيف البحث والقوائم ومرشحات البيانات فوق الجدول.' },
      'dash-create-detail': { en: 'Adds a detail page with status, gated actions and tabs in the URL.', ar: 'تضيف صفحة تفاصيل بالحالة وإجراءات محمية وتبويبات في الرابط.' },
      'dash-create-crud': { en: 'Adds create, edit and delete for an entity.', ar: 'تضيف الإنشاء والتعديل والحذف لكيان.' },
      'dash-create-settings-form': { en: 'Builds a settings page as one grouped form with one save.', ar: 'تبني صفحة إعدادات في نموذج واحد مقسّم بزر حفظ واحد.' },
    },
  },
  {
    title: { en: 'Website', ar: 'المواقع' },
    skills: {
      'web-create-route': { en: 'Adds a page route with its loader and not-found behaviour.', ar: 'تضيف مسار صفحة مع تحميل بياناته وحالة عدم وجوده.' },
      'web-create-feature': { en: 'Scaffolds a whole feature from the backend endpoints.', ar: 'تبني هيكل ميزة كاملة من نقاط الواجهة الخلفية.' },
      'web-seo-page': { en: 'Writes the title, canonical and share preview of one page.', ar: 'تكتب عنوان الصفحة ورابطها الرسمي ومعاينة مشاركتها.' },
      'web-server-fn': { en: 'Creates a TanStack Start server function with validated input.', ar: 'تنشئ دالة خادم في TanStack Start بمدخلات متحقق منها.' },
    },
  },
  {
    title: { en: 'Work', ar: 'سير العمل' },
    skills: {
      setup: { en: 'Reads your project, proposes a setup and installs it after your yes.', ar: 'تقرأ مشروعك وتقترح إعداداً ثم تثبّته بعد موافقتك.' },
      task: { en: 'Takes a task from a fresh branch to verified work.', ar: 'تأخذ المهمة من فرع جديد إلى عمل متحقق منه.' },
      dev: { en: 'Starts, restarts or frees the dev server on your port.', ar: 'تشغّل خادم التطوير أو تعيده أو تحرّر منفذه.' },
      explain: { en: 'Answers why and how questions about your code.', ar: 'تجيب عن أسئلة لماذا وكيف في شيفرة مشروعك.' },
      refactor: { en: 'Restructures code without changing what it does.', ar: 'تعيد تنظيم الشيفرة دون تغيير ما تفعله.' },
      'refactor-mode': { en: 'Audits a project, then rebuilds it one approved phase at a time.', ar: 'تدقّق المشروع ثم تعيد بناءه مرحلة بعد مرحلة بموافقتك.' },
      mode: { en: 'Turns a working mode on or off: freeze, hotfix, read-only and more.', ar: 'تشغّل نمط عمل أو توقفه: تجميد أو إصلاح عاجل أو قراءة فقط وغيرها.' },
      'upgrade-mode': { en: 'Moves one dependency family to a new version, phase by phase.', ar: 'تنقل عائلة اعتماديات إلى إصدار جديد، مرحلة بعد مرحلة.' },
      'fix-everywhere': { en: 'Finds every copy of a problem, fixes each one and proves none is left.', ar: 'تجد كل نسخة من المشكلة وتصلحها وتثبت أنه لم يبقَ شيء.' },
      'backend-request': { en: 'Writes down what the frontend needs from the backend, in plain words.', ar: 'تدوّن ما تحتاجه الواجهة من الخادم بلغة بسيطة.' },
    },
  },
  {
    title: { en: 'Inspect', ar: 'الفحص' },
    skills: {
      verify: { en: 'Runs the full gate and reports the real numbers.', ar: 'تشغّل الفحص الكامل وتعرض الأرقام الحقيقية.' },
      review: { en: 'Reviews the branch against the standards and against the request.', ar: 'تراجع الفرع مقابل المعايير ومقابل الطلب.' },
      'live-check': { en: 'Checks a change in a real browser on the local server.', ar: 'تختبر التغيير في متصفح حقيقي على الخادم المحلي.' },
      performance: { en: 'Makes the app faster on real phones and slow networks.', ar: 'تسرّع التطبيق على الهواتف الحقيقية والشبكات البطيئة.' },
      'playwright-best-practices': { en: 'Writes and repairs end-to-end tests without flakiness.', ar: 'تكتب اختبارات Playwright وتصلح المتذبذب منها.' },
      'i18n-conventions': { en: 'Keeps translation keys two levels deep, in every language.', ar: 'تبقي مفاتيح الترجمة بمستويين وفي كل اللغات.' },
      'tanstack-query-key-conventions': { en: 'Keeps every query key in one factory.', ar: 'تجمع كل مفاتيح الاستعلام في مصنع واحد.' },
      'typescript-advanced-types': { en: 'Covers generics, conditional and mapped types.', ar: 'تغطي الأنواع العامة والشرطية والمحوّلة.' },
      'vercel-react-best-practices': { en: 'Applies the React performance rules from Vercel.', ar: 'تطبّق قواعد أداء React من Vercel.' },
      'web-design-guidelines': { en: 'Audits UI files against the Web Interface Guidelines.', ar: 'تدقّق ملفات الواجهة وفق إرشادات واجهات الويب.' },
    },
  },
  {
    title: { en: 'Ship', ar: 'التسليم' },
    skills: {
      'branch-status': { en: 'Shows where the current branch stands.', ar: 'تعرض وضع الفرع الحالي.' },
      'sync-main': { en: 'Shows what arrived on main and where it overlaps your work.', ar: 'تعرض ما وصل إلى main وأين يتقاطع مع عملك.' },
      'commit-push': { en: 'Commits and pushes the task branch after your explicit yes.', ar: 'تحفظ فرع المهمة وترفعه بعد موافقتك الصريحة.' },
      'pr-link': { en: 'Prints the compare link and a ready PR description.', ar: 'تطبع رابط المقارنة ووصف طلب الدمج جاهزاً.' },
    },
  },
]

/** Every agent, in the order they stand in the film. */
export const agents: Record<string, Bilingual> = {
  planner: { en: 'Splits a large task', ar: 'يقسّم المهمة الكبيرة' },
  'frontend-dev': { en: 'Writes the code', ar: 'يكتب الشيفرة' },
  'ui-designer': { en: 'Reviews the design', ar: 'يراجع التصميم' },
  'test-engineer': { en: 'Writes the tests', ar: 'يكتب الاختبارات' },
  'bug-hunter': { en: 'Finds the root cause', ar: 'يجد جذر الخلل' },
  'frontend-reviewer': { en: 'Reviews every change', ar: 'يراجع كل تغيير' },
  'accessibility-auditor': { en: 'Audits WCAG 2.2 AA', ar: 'يدقّق WCAG 2.2 AA' },
  'performance-optimizer': { en: 'Measures the slow parts', ar: 'يقيس مواضع البطء' },
  'refactor-architect': { en: 'Leads big refactors', ar: 'يقود إعادة الهيكلة' },
  'qa-engineer': { en: 'Runs the final gate', ar: 'يشغّل الفحص الأخير' },
  'frontend-security-reviewer': { en: 'Audits security', ar: 'يدقّق الأمان' },
  'i18n-rtl-reviewer': { en: 'Checks languages and direction', ar: 'يراجع اللغات والاتجاه' },
  'upgrade-analyst': { en: 'Plans major upgrades', ar: 'يخطط الترقيات الكبيرة' },
  'seo-auditor': { en: 'Checks how Google reads pages', ar: 'يفحص قراءة Google للصفحات' },
}
