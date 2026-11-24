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
      'create-component': { en: 'Creates or extracts a component: cards, buttons, dialogs, sections.', ar: 'تسوي مكوّن أو تستخرجه: بطاقة، زر، نافذة، أو قسم.' },
      'create-form': { en: 'Builds a form with your form tools, one schema, translated errors and accessible fields.', ar: 'تبني نموذج بأدوات النماذج عندك، بمخطط واحد، وأخطاء مترجمة، وحقول سهلة الوصول.' },
      'create-hook': { en: 'Writes a hook or your stack’s equivalent, from a small helper to a data query.', ar: 'تكتب hook أو اللي يقابله بتقنياتك، من أداة صغيرة لاستعلام بيانات.' },
      'create-store': { en: 'Adds shared state, in the form your stack uses, for what outlives a component.', ar: 'تضيف حالة مشتركة بالشكل اللي تستعمله تقنياتك، للأشياء اللي تعيش أطول من المكوّن.' },
      'figma-match': { en: 'Matches a Figma frame: sizes, colours, radii, type and states.', ar: 'تطابق إطار Figma بالمقاسات والألوان والحواف والخطوط والحالات.' },
      'frontend-design': { en: 'Gives an original visual direction to a page that has no design yet.', ar: 'تقترح شكل بصري أصلي لصفحة ما إلها تصميم لحد الآن.' },
      'ui-ux-pro-max': { en: 'Searches a catalogue of styles, palettes, font pairs and UX guidelines.', ar: 'تدوّر بفهرس أساليب وألوان وخطوط وإرشادات تجربة المستخدم.' },
    },
  },
  {
    title: { en: 'Dashboard', ar: 'لوحات التحكم' },
    skills: {
      'dash-create-route': { en: 'Adds a list, detail, create or edit route with its permission guard.', ar: 'تضيف مسار قائمة أو تفاصيل أو إنشاء أو تعديل، مع حارس الصلاحية.' },
      'dash-create-table': { en: 'Builds a data table with server pagination, sorting and filters.', ar: 'تبني جدول بيانات بصفحات وترتيب وفلاتر من السيرفر.' },
      'dash-create-filter-bar': { en: 'Adds search, selects and lookups above a list.', ar: 'تضيف بحث وقوائم اختيار وفلاتر بيانات فوق الجدول.' },
      'dash-create-detail': { en: 'Adds a detail page with status, gated actions and tabs in the URL.', ar: 'تضيف صفحة تفاصيل فيها الحالة، وإجراءات محمية، وتبويبات بالرابط.' },
      'dash-create-crud': { en: 'Adds create, edit and delete for an entity.', ar: 'تضيف الإنشاء والتعديل والحذف لأي كيان.' },
      'dash-create-settings-form': { en: 'Builds a settings page as one grouped form with one save.', ar: 'تبني صفحة إعدادات بنموذج واحد مقسّم وزر حفظ واحد.' },
    },
  },
  {
    title: { en: 'Website', ar: 'المواقع' },
    skills: {
      'web-create-route': { en: 'Adds a page route with its loader and not-found behaviour.', ar: 'تضيف مسار صفحة مع تحميل بياناتها، وشنو يصير إذا الصفحة مو موجودة.' },
      'web-create-feature': { en: 'Scaffolds a whole feature from the backend endpoints.', ar: 'تبني هيكل ميزة كاملة من نقاط الواجهة الخلفية.' },
      'web-seo-page': { en: 'Writes the title, canonical and share preview of one page.', ar: 'تكتب عنوان الصفحة، ورابطها الرسمي، ومعاينة مشاركتها.' },
      'web-server-fn': { en: 'Creates a TanStack Start server function with validated input.', ar: 'تسوي دالة سيرفر بـ TanStack Start، ومدخلاتها مفحوصة.' },
    },
  },
  {
    title: { en: 'Work', ar: 'الشغل' },
    skills: {
      setup: { en: 'Reads your project, proposes a setup and installs it after your yes.', ar: 'تقرا مشروعك وتقترح إعداد، وبعد موافقتك تثبّته.' },
      task: { en: 'Takes a task from a fresh branch to verified work.', ar: 'تاخذ المهمة من فرع جديد لحد شغل مفحوص.' },
      dev: { en: 'Starts, restarts or frees the dev server on your port.', ar: 'تشغّل سيرفر التطوير، أو تعيد تشغيله، أو تفضّي منفذه.' },
      explain: { en: 'Answers why and how questions about your code.', ar: 'تجاوب على أسئلة ليش وشلون بكود مشروعك.' },
      refactor: { en: 'Restructures code without changing what it does.', ar: 'ترتّب الكود من جديد بدون ما تغيّر شنو يسوي.' },
      'refactor-mode': { en: 'Audits a project, then rebuilds it one approved phase at a time.', ar: 'تدقّق المشروع، وبعدين تعيد بناءه مرحلة مرحلة بموافقتك.' },
      mode: { en: 'Turns a working mode on or off: freeze, hotfix, read-only and more.', ar: 'تشغّل نمط شغل أو تطفيه: تجميد، إصلاح عاجل، قراءة بس، وغيرها.' },
      'upgrade-mode': { en: 'Moves one dependency family to a new version, phase by phase.', ar: 'تنقل عائلة اعتماديات لإصدار جديد، مرحلة مرحلة.' },
      'fix-everywhere': { en: 'Finds every copy of a problem, fixes each one and proves none is left.', ar: 'تلقى كل نسخة من المشكلة، وتصلحها، وتثبت إنه ما بقى شي.' },
      'backend-request': { en: 'Writes down what the frontend needs from the backend, in plain words.', ar: 'تكتب شنو تحتاج الواجهة من السيرفر، بكلام بسيط.' },
    },
  },
  {
    title: { en: 'Inspect', ar: 'الفحص' },
    skills: {
      verify: { en: 'Runs the full gate and reports the real numbers.', ar: 'تشغّل الفحص الكامل وتعرض الأرقام الحقيقية.' },
      review: { en: 'Reviews the branch against the standards and against the request.', ar: 'تراجع الفرع على المعايير وعلى الطلب.' },
      'live-check': { en: 'Checks a change in a real browser on the local server.', ar: 'تجرّب التغيير بمتصفح حقيقي على السيرفر المحلي.' },
      performance: { en: 'Makes the app faster on real phones and slow networks.', ar: 'تسرّع التطبيق على موبايلات حقيقية وشبكات بطيئة.' },
      'playwright-best-practices': { en: 'Writes and repairs end-to-end tests without flakiness.', ar: 'تكتب اختبارات Playwright وتصلح اللي تنجح مرة وتفشل مرة.' },
      'i18n-conventions': { en: 'Keeps translation keys two levels deep, in every language.', ar: 'تخلي مفاتيح الترجمة بمستويين، وبكل اللغات.' },
      'tanstack-query-key-conventions': { en: 'Keeps every query key in one factory.', ar: 'تجمع كل مفاتيح الاستعلام بمصنع واحد.' },
      'typescript-advanced-types': { en: 'Covers generics, conditional and mapped types.', ar: 'تغطي الأنواع العامة والشرطية والمحوّلة.' },
      'vercel-react-best-practices': { en: 'Applies the React performance rules from Vercel.', ar: 'تطبّق قواعد أداء React من Vercel.' },
      'web-design-guidelines': { en: 'Audits UI files against the Web Interface Guidelines.', ar: 'تدقّق ملفات الواجهة حسب إرشادات واجهات الويب.' },
    },
  },
  {
    title: { en: 'Ship', ar: 'التسليم' },
    skills: {
      'branch-status': { en: 'Shows where the current branch stands.', ar: 'تعرض وين واصل الفرع الحالي.' },
      'sync-main': { en: 'Shows what arrived on main and where it overlaps your work.', ar: 'تعرض شنو وصل لـ main، ووين يتقاطع مع شغلك.' },
      'commit-push': { en: 'Commits and pushes the task branch after your explicit yes.', ar: 'تحفظ فرع المهمة وترفعه بعد موافقتك الصريحة.' },
      'pr-link': { en: 'Prints the compare link and a ready PR description.', ar: 'تطبع رابط المقارنة، ووصف جاهز للـ pull request.' },
    },
  },
]

/** Every agent, in the order they stand in the film. */
export const agents: Record<string, Bilingual> = {
  planner: { en: 'Splits a large task', ar: 'يقسّم المهمة الكبيرة' },
  'frontend-dev': { en: 'Writes the code', ar: 'يكتب الكود' },
  'ui-designer': { en: 'Reviews the design', ar: 'يراجع التصميم' },
  'test-engineer': { en: 'Writes the tests', ar: 'يكتب الاختبارات' },
  'bug-hunter': { en: 'Finds the root cause', ar: 'يلقى أصل المشكلة' },
  'frontend-reviewer': { en: 'Reviews every change', ar: 'يراجع كل تغيير' },
  'accessibility-auditor': { en: 'Audits WCAG 2.2 AA', ar: 'يدقّق WCAG 2.2 AA' },
  'performance-optimizer': { en: 'Measures the slow parts', ar: 'يقيس وين البطء' },
  'refactor-architect': { en: 'Leads big refactors', ar: 'يقود إعادة الهيكلة الكبيرة' },
  'qa-engineer': { en: 'Runs the final gate', ar: 'يشغّل الفحص الأخير' },
  'frontend-security-reviewer': { en: 'Audits security', ar: 'يدقّق الأمان' },
  'i18n-rtl-reviewer': { en: 'Checks languages and direction', ar: 'يراجع اللغات والاتجاه' },
  'upgrade-analyst': { en: 'Plans major upgrades', ar: 'يخطط للترقيات الكبيرة' },
  'seo-auditor': { en: 'Checks how Google reads pages', ar: 'يشوف شلون Google يقرا الصفحات' },
}
