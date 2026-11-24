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
      'create-component': { en: 'Creates or extracts a component: cards, buttons, dialogs, sections.', ar: 'تنشئ مكوّناً أو تستخرجه: بطاقة، زر، نافذة حوار، قسم.' },
      'create-form': { en: 'Builds a form with your form tools, one schema, translated errors and accessible fields.', ar: 'تبني نموذجاً بأدوات النماذج لديك، بمخطط (schema) واحد، وأخطاء مترجمة، وحقول سهلة الوصول.' },
      'create-hook': { en: 'Writes a hook or your stack’s equivalent, from a small helper to a data query.', ar: 'تكتب hook أو ما يقابله في تقنياتك، من أداة مساعدة صغيرة إلى استعلام بيانات.' },
      'create-store': { en: 'Adds shared state, in the form your stack uses, for what outlives a component.', ar: 'تضيف حالة مشتركة بالشكل الذي تستخدمه تقنياتك، لما يعيش أطول من المكوّن.' },
      'figma-match': { en: 'Matches a Figma frame: sizes, colours, radii, type and states.', ar: 'تطابق إطار Figma في الأحجام والألوان وانحناء الحواف والخطوط والحالات.' },
      'frontend-design': { en: 'Gives an original visual direction to a page that has no design yet.', ar: 'تعطي صفحة لا تصميم لها بعد اتجاهاً بصرياً أصلياً.' },
      'ui-ux-pro-max': { en: 'Searches a catalogue of styles, palettes, font pairs and UX guidelines.', ar: 'تبحث في فهرس من الأساليب والألوان وأزواج الخطوط وإرشادات تجربة المستخدم.' },
    },
  },
  {
    title: { en: 'Dashboard', ar: 'لوحات التحكم' },
    skills: {
      'dash-create-route': { en: 'Adds a list, detail, create or edit route with its permission guard.', ar: 'تضيف مساراً للقائمة أو التفاصيل أو الإنشاء أو التعديل، مع حماية بالصلاحية.' },
      'dash-create-table': { en: 'Builds a data table with server pagination, sorting and filters.', ar: 'تبني جدول بيانات مع تقسيم الصفحات والترتيب والفلاتر من الخادم.' },
      'dash-create-filter-bar': { en: 'Adds search, selects and lookups above a list.', ar: 'تضيف بحثاً وقوائم اختيار وحقول بحث عن القيم فوق القائمة.' },
      'dash-create-detail': { en: 'Adds a detail page with status, gated actions and tabs in the URL.', ar: 'تضيف صفحة تفاصيل فيها الحالة، وإجراءات محمية بالصلاحيات، وتبويبات في الرابط.' },
      'dash-create-crud': { en: 'Adds create, edit and delete for an entity.', ar: 'تضيف الإنشاء والتعديل والحذف لكيان.' },
      'dash-create-settings-form': { en: 'Builds a settings page as one grouped form with one save.', ar: 'تبني صفحة إعدادات كنموذج واحد مقسَّم إلى مجموعات، بزر حفظ واحد.' },
    },
  },
  {
    title: { en: 'Website', ar: 'المواقع' },
    skills: {
      'web-create-route': { en: 'Adds a page route with its loader and not-found behaviour.', ar: 'تضيف مسار صفحة، مع تحميل بياناتها وسلوك «الصفحة غير موجودة».' },
      'web-create-feature': { en: 'Scaffolds a whole feature from the backend endpoints.', ar: 'تنشئ هيكل ميزة كاملة انطلاقاً من نقاط النهاية (endpoints) في الواجهة الخلفية.' },
      'web-seo-page': { en: 'Writes the title, canonical and share preview of one page.', ar: 'تكتب عنوان صفحة واحدة، ورابطها الأساسي (canonical)، ومعاينة مشاركتها.' },
      'web-server-fn': { en: 'Creates a TanStack Start server function with validated input.', ar: 'تنشئ دالة خادم في TanStack Start، بمدخلات يجري التحقق منها.' },
    },
  },
  {
    title: { en: 'Work', ar: 'العمل' },
    skills: {
      setup: { en: 'Reads your project, proposes a setup and installs it after your yes.', ar: 'تقرأ مشروعك، وتقترح إعداداً، وتثبّته بعد موافقتك.' },
      task: { en: 'Takes a task from a fresh branch to verified work.', ar: 'تنقل المهمة من فرع جديد إلى عمل جرى فحصه.' },
      dev: { en: 'Starts, restarts or frees the dev server on your port.', ar: 'تشغّل خادم التطوير أو تعيد تشغيله أو تحرّر منفذه.' },
      explain: { en: 'Answers why and how questions about your code.', ar: 'تجيب عن أسئلة «لماذا» و«كيف» حول الكود.' },
      refactor: { en: 'Restructures code without changing what it does.', ar: 'تعيد هيكلة الكود دون تغيير ما يفعله.' },
      'refactor-mode': { en: 'Audits a project, then rebuilds it one approved phase at a time.', ar: 'تدقّق المشروع، ثم تعيد بناءه مرحلة معتمدة تلو أخرى.' },
      mode: { en: 'Turns a working mode on or off: freeze, hotfix, read-only and more.', ar: 'تشغّل نمط عمل أو توقفه: تجميد، وإصلاح عاجل، وقراءة فقط، وغيرها.' },
      'upgrade-mode': { en: 'Moves one dependency family to a new version, phase by phase.', ar: 'تنقل عائلة اعتماديات إلى إصدار جديد، مرحلة بعد مرحلة.' },
      'fix-everywhere': { en: 'Finds every copy of a problem, fixes each one and proves none is left.', ar: 'تجد كل نسخة من المشكلة، وتصلح كلاً منها، وتثبت أنه لم يبقَ شيء.' },
      'backend-request': { en: 'Writes down what the frontend needs from the backend, in plain words.', ar: 'تكتب بكلمات بسيطة ما تحتاجه الواجهة من الواجهة الخلفية.' },
    },
  },
  {
    title: { en: 'Inspect', ar: 'الفحص' },
    skills: {
      verify: { en: 'Runs the full gate and reports the real numbers.', ar: 'تشغّل الفحص الكامل وتعرض الأرقام الحقيقية.' },
      review: { en: 'Reviews the branch against the standards and against the request.', ar: 'تراجع الفرع بالمقارنة مع المعايير ومع الطلب.' },
      'live-check': { en: 'Checks a change in a real browser on the local server.', ar: 'تجرّب التغيير في متصفح حقيقي على الخادم المحلي.' },
      performance: { en: 'Makes the app faster on real phones and slow networks.', ar: 'تسرّع التطبيق على هواتف حقيقية وشبكات بطيئة.' },
      'playwright-best-practices': { en: 'Writes and repairs end-to-end tests without flakiness.', ar: 'تكتب اختبارات end-to-end مستقرة وتصلحها.' },
      'i18n-conventions': { en: 'Keeps translation keys two levels deep, in every language.', ar: 'تُبقي مفاتيح الترجمة بعمق مستويين، في كل اللغات.' },
      'tanstack-query-key-conventions': { en: 'Keeps every query key in one factory.', ar: 'تجمع كل مفاتيح الاستعلام في مصنع (factory) واحد.' },
      'typescript-advanced-types': { en: 'Covers generics, conditional and mapped types.', ar: 'تغطي generics والأنواع الشرطية وأنواع mapped.' },
      'vercel-react-best-practices': { en: 'Applies the React performance rules from Vercel.', ar: 'تطبّق قواعد أداء React من Vercel.' },
      'web-design-guidelines': { en: 'Audits UI files against the Web Interface Guidelines.', ar: 'تدقّق ملفات الواجهة بحسب إرشادات واجهات الويب (Web Interface Guidelines).' },
    },
  },
  {
    title: { en: 'Ship', ar: 'التسليم' },
    skills: {
      'branch-status': { en: 'Shows where the current branch stands.', ar: 'تعرض حالة الفرع الحالي.' },
      'sync-main': { en: 'Shows what arrived on main and where it overlaps your work.', ar: 'تعرض ما وصل إلى main، وأين يتداخل مع عملك.' },
      'commit-push': { en: 'Commits and pushes the task branch after your explicit yes.', ar: 'تحفظ فرع المهمة وترفعه بعد موافقتك الصريحة.' },
      'pr-link': { en: 'Prints the compare link and a ready PR description.', ar: 'تطبع رابط المقارنة، ووصفاً جاهزاً للـ pull request.' },
    },
  },
]

/** Every agent, in the order they stand in the film. */
export const agents: Record<string, Bilingual> = {
  planner: { en: 'Splits a large task', ar: 'يقسّم المهمة الكبيرة' },
  'frontend-dev': { en: 'Writes the code', ar: 'يكتب الكود' },
  'ui-designer': { en: 'Reviews the design', ar: 'يراجع التصميم' },
  'test-engineer': { en: 'Writes the tests', ar: 'يكتب الاختبارات' },
  'bug-hunter': { en: 'Finds the root cause', ar: 'يجد السبب الجذري' },
  'frontend-reviewer': { en: 'Reviews every change', ar: 'يراجع كل تغيير' },
  'accessibility-auditor': { en: 'Audits WCAG 2.2 AA', ar: 'يدقّق WCAG 2.2 AA' },
  'performance-optimizer': { en: 'Measures the slow parts', ar: 'يقيس الأجزاء البطيئة' },
  'refactor-architect': { en: 'Leads big refactors', ar: 'يقود إعادات الهيكلة الكبيرة' },
  'qa-engineer': { en: 'Runs the final gate', ar: 'يشغّل الفحص الأخير' },
  'frontend-security-reviewer': { en: 'Audits security', ar: 'يدقّق الأمان' },
  'i18n-rtl-reviewer': { en: 'Checks languages and direction', ar: 'يفحص اللغات والاتجاه' },
  'upgrade-analyst': { en: 'Plans major upgrades', ar: 'يخطط للترقيات الكبيرة' },
  'seo-auditor': { en: 'Checks how Google reads pages', ar: 'يفحص كيف يقرأ Google الصفحات' },
}
