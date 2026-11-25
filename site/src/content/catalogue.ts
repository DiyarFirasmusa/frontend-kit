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
      'create-component': { en: 'Builds one piece of a screen, such as a card, a button, a pop-up or a section, and reuses what you already have.', ar: 'تبني جزءا من الشاشة، مثل بطاقة أو زر أو نافذة منبثقة أو قسم، وتعيد استخدام ما عندك.' },
      'create-form': { en: 'Builds a form people fill in, with clear error messages in their language and fields everyone can use.', ar: 'تبني نموذجا يملؤه الناس، برسائل خطأ واضحة بلغتهم وحقول يستطيع الجميع استخدامها.' },
      'create-hook': { en: 'Moves the working logic out of a screen into a reusable piece, from a small helper to loading data.', ar: 'تنقل المنطق الذي يعمل خلف الشاشة إلى قطعة يمكن إعادة استخدامها، من أداة صغيرة إلى جلب البيانات.' },
      'create-store': { en: 'Remembers things across screens, such as a cart or the language, when a simpler place will not do.', ar: 'تتذكر ما يجب أن يبقى بين الشاشات، مثل السلة أو اللغة، عندما لا يكفي مكان أبسط.' },
      'figma-match': { en: 'Makes screens match a Figma design: sizes, colours, rounded corners, text and states.', ar: 'تجعل الشاشات تطابق تصميم Figma في الأحجام والألوان وانحناء الحواف والخطوط والحالات.' },
      'frontend-design': { en: 'Gives a page that has no design yet a look of its own.', ar: 'تعطي الصفحة التي ليس لها تصميم بعد مظهرا خاصا بها.' },
      'ui-ux-pro-max': { en: 'Searches a library of styles, colours, font pairs and tips for making things easy to use.', ar: 'تبحث في مكتبة من الأنماط والألوان وأزواج الخطوط ونصائح لجعل الأشياء سهلة الاستخدام.' },
    },
  },
  {
    title: { en: 'Dashboard', ar: 'لوحات التحكم' },
    skills: {
      'dash-create-route': { en: 'Adds a screen to your dashboard (a list, details, add or edit) and decides who may open it.', ar: 'تضيف شاشة إلى لوحة التحكم (قائمة أو تفاصيل أو إضافة أو تعديل) وتحدد من يحق له فتحها.' },
      'dash-create-table': { en: 'Builds a table of records, with pages, sorting and filters done by your backend.', ar: 'تبني جدولا للسجلات، مع التقسيم إلى صفحات والفرز والفلاتر التي ينفذها الخادم عندك.' },
      'dash-create-filter-bar': { en: 'Adds search and filters above a list.', ar: 'تضيف البحث والفلاتر فوق القائمة.' },
      'dash-create-detail': { en: 'Adds the page for one record, with its status, the actions allowed and tabs.', ar: 'تضيف صفحة السجل الواحد، فيها حالته والإجراءات المسموحة وتبويبات.' },
      'dash-create-crud': { en: 'Adds create, edit and delete for one kind of record, such as products.', ar: 'تضيف الإضافة والتعديل والحذف لنوع واحد من السجلات، مثل المنتجات.' },
      'dash-create-settings-form': { en: 'Builds a settings page with several sections and one Save button.', ar: 'تبني صفحة إعدادات فيها عدة أقسام وزر حفظ واحد.' },
    },
  },
  {
    title: { en: 'Website', ar: 'المواقع' },
    skills: {
      'web-create-route': { en: 'Adds a page to your website, with its data and a proper “page not found”.', ar: 'تضيف صفحة إلى موقعك، مع بياناتها وصفحة «غير موجود» صحيحة.' },
      'web-create-feature': { en: 'Builds a whole part of a website from your backend, such as a blog or a catalogue.', ar: 'تبني جزءا كاملا من الموقع من الخادم عندك، مثل مدونة أو كتالوج.' },
      'web-seo-page': { en: 'Sets the title and the share preview of one page, so Google and WhatsApp show it well.', ar: 'تضبط عنوان صفحة واحدة ومعاينة مشاركتها، ليعرضها Google وواتساب بشكل جيد.' },
      'web-server-fn': { en: 'Creates code that runs only on the server (a TanStack Start server function), with its input checked.', ar: 'تنشئ كودا يعمل على الخادم فقط (دالة خادم في TanStack Start)، مع التحقق من مدخلاته.' },
    },
  },
  {
    title: { en: 'Work', ar: 'العمل' },
    skills: {
      setup: { en: 'Looks at your project, or asks what you want to build, proposes a setup and installs it after your yes.', ar: 'تنظر في مشروعك، أو تسألك ماذا تريد أن تبني، وتقترح الإعداد ثم تثبته بعد موافقتك.' },
      task: { en: 'Does one task on a separate branch (a safe line of work) and checks it before you decide.', ar: 'تنفذ مهمة واحدة على فرع منفصل (خط عمل آمن) وتفحصها قبل أن تقرر.' },
      dev: { en: 'Runs your app on your computer, and restarts it or frees its port when it is stuck.', ar: 'تشغل تطبيقك على جهازك، وتعيد تشغيله أو تحرر منفذه عندما يتعطل.' },
      explain: { en: 'Answers “why” and “how” questions about your code, without changing it.', ar: 'تجيب عن أسئلة «لماذا» و«كيف» حول الكود، دون أن تغيره.' },
      refactor: { en: 'Tidies code without changing what it does.', ar: 'ترتب الكود دون تغيير ما يفعله.' },
      'refactor-mode': { en: 'Fixes an old project: measures it first, then improves it one phase at a time, each phase approved by you.', ar: 'تصلح مشروعا قديما: تقيسه أولا، ثم تحسنه مرحلة بمرحلة، وكل مرحلة توافق عليها.' },
      mode: { en: 'Sets how careful and how fast the assistant works: freeze, urgent fix, read-only and more. An advanced option.', ar: 'تحدد مقدار حذر المساعد وسرعته: تجميد، وإصلاح عاجل، وقراءة فقط، وغيرها. خيار متقدم.' },
      'upgrade-mode': { en: 'Moves a family of tools to a new version, one phase at a time.', ar: 'تنقل مجموعة أدوات إلى إصدار جديد، مرحلة بعد مرحلة.' },
      'fix-everywhere': { en: 'Finds every copy of a problem, fixes each one and proves none is left.', ar: 'تجد كل نسخة من المشكلة، وتصلح كل واحدة، وتثبت أنه لم يبق شيء.' },
      'backend-request': { en: 'Writes down in plain words what your screens need from your backend.', ar: 'تكتب بكلمات بسيطة ما تحتاجه شاشاتك من الخادم.' },
    },
  },
  {
    title: { en: 'Inspect', ar: 'الفحص' },
    skills: {
      verify: { en: 'Runs all the checks and shows the real results.', ar: 'تشغل كل الفحوص وتعرض النتائج الفعلية.' },
      review: { en: 'Reviews your work against the standards and against what you asked.', ar: 'تراجع عملك بحسب المعايير وبحسب ما طلبته.' },
      'live-check': { en: 'Tries your change in a real browser on your computer.', ar: 'تجرب التغيير في متصفح حقيقي على جهازك.' },
      performance: { en: 'Makes your app faster on real phones and slow connections.', ar: 'تسرع تطبيقك على هواتف حقيقية واتصالات بطيئة.' },
      'playwright-best-practices': { en: 'Writes and fixes automatic browser tests that do not fail at random.', ar: 'تكتب اختبارات المتصفح التلقائية وتصلحها، فلا تفشل عشوائيا.' },
      'i18n-conventions': { en: 'Keeps every translated text named in the same way, in every language.', ar: 'تبقي كل نص مترجم بتسمية واحدة، في كل اللغات.' },
      'tanstack-query-key-conventions': { en: 'Keeps the names of remembered data in one place.', ar: 'تجمع أسماء البيانات المتذكرة في مكان واحد.' },
      'typescript-advanced-types': { en: 'Helps with hard problems in TypeScript types (the rules that describe the shape of data).', ar: 'تساعد في مشكلات أنواع TypeScript الصعبة (القواعد التي تصف شكل البيانات).' },
      'vercel-react-best-practices': { en: 'Applies the React speed rules from Vercel.', ar: 'تطبق قواعد سرعة React من Vercel.' },
      'web-design-guidelines': { en: 'Checks screen files against the Web Interface Guidelines.', ar: 'تفحص ملفات الشاشات بحسب إرشادات Web Interface Guidelines.' },
    },
  },
  {
    title: { en: 'Ship', ar: 'التسليم' },
    skills: {
      'branch-status': { en: 'Shows where your current branch (line of work) stands.', ar: 'تعرض حالة فرعك الحالي (خط عملك).' },
      'sync-main': { en: 'Shows what was added to main (the main version) and where it overlaps your work.', ar: 'تعرض ما أضيف إلى main (النسخة الرئيسية)، وأين يتداخل مع عملك.' },
      'commit-push': { en: 'Saves a version of your work and uploads it, after your clear yes.', ar: 'تحفظ نسخة من عملك وترفعها، بعد موافقتك الصريحة.' },
      'pr-link': { en: 'Prints the link and a ready description for a pull request (a request to merge your changes).', ar: 'تطبع الرابط مع وصف جاهز لـ pull request (طلب دمج تغييراتك).' },
    },
  },
]

/** Every specialist (the plugin calls them agents), in the order they stand in the film. */
export const agents: Record<string, Bilingual> = {
  planner: { en: 'Splits a large task into steps', ar: 'يقسم المهمة الكبيرة إلى خطوات' },
  'frontend-dev': { en: 'Writes the code', ar: 'يكتب الكود' },
  'ui-designer': { en: 'Reviews how it looks', ar: 'يراجع المظهر' },
  'test-engineer': { en: 'Writes the tests', ar: 'يكتب الاختبارات' },
  'bug-hunter': { en: 'Finds why something breaks', ar: 'يجد سبب العطل' },
  'frontend-reviewer': { en: 'Reviews every change', ar: 'يراجع كل تغيير' },
  'accessibility-auditor': { en: 'Checks that everyone can use it (WCAG 2.2 AA)', ar: 'يفحص أن الجميع يستطيع استخدامه (WCAG 2.2 AA)' },
  'performance-optimizer': { en: 'Finds what makes it slow', ar: 'يجد ما يبطئه' },
  'refactor-architect': { en: 'Leads the fixing of an old project', ar: 'يقود إصلاح المشروع القديم' },
  'qa-engineer': { en: 'Runs the final check', ar: 'يشغل الفحص الأخير' },
  'frontend-security-reviewer': { en: 'Checks for security problems', ar: 'يفحص مشكلات الأمان' },
  'i18n-rtl-reviewer': { en: 'Checks languages and right-to-left', ar: 'يفحص اللغات والكتابة من اليمين إلى اليسار' },
  'upgrade-analyst': { en: 'Plans big upgrades', ar: 'يخطط للترقيات الكبيرة' },
  'seo-auditor': { en: 'Checks how Google reads your pages', ar: 'يفحص كيف يقرأ Google صفحاتك' },
}
