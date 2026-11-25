import type { HookEvent } from '../types.ts'
import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

export const hookEffects: Record<HookEvent, Bilingual> = {
  SessionStart: t('Adds background information', 'يضيف معلومات خلفية'),
  UserPromptSubmit: t('Adds background information', 'يضيف معلومات خلفية'),
  PreToolUse: t('Can refuse the action', 'يستطيع أن يرفض الإجراء'),
  PostToolUse: t('Sends errors back to the assistant', 'يرجع الأخطاء إلى المساعد'),
  PostToolUseFailure: t('Writes a log', 'يكتب سجلا'),
  SubagentStart: t('Adds background information', 'يضيف معلومات خلفية'),
  SubagentStop: t('Can send the work back', 'يستطيع أن يعيده إلى العمل'),
  Notification: t('Alerts you', 'ينبهك'),
  Stop: t('Can send the work back', 'يستطيع أن يعيده إلى العمل'),
  SessionEnd: t('Cleans up', 'ينظف'),
}

export const guards = [
  {
    title: t('Commands', 'الأوامر'),
    script: 'guard-bash.sh',
    items: [
      t('Saving a version (commit), merging, rebasing or uploading (push) on a protected branch', 'الحفظ (commit) أو الدمج أو الـ rebase أو الرفع (push) على فرع محمي'),
      t('Force pushes (uploads that overwrite other people’s work) and skipped git hooks (checks git runs by itself)', 'الرفع القسري (force push، رفع يمسح عمل غيرك) وتخطي الـ git hooks (فحوص يشغلها git تلقائيا)'),
      t('Throwing away work: reset --hard, clean -f, checkout -f', 'حذف العمل: reset --hard وclean -f وcheckout -f'),
      t('Recursive deletes (deleting a folder and everything in it) outside the project, of its main folders, or of a path it cannot check', 'حذف مجلدات بكل ما فيها (recursive) خارج المشروع، أو مجلداته الرئيسية، أو مسار لا يستطيع التأكد منه'),
      t('Opening or merging a pull request (a request to merge your changes)', 'فتح pull request (طلب دمج تغييراتك) أو دمجه'),
      t('Reading .env secrets (the file that holds your passwords and keys) through the command window', 'قراءة أسرار ‎.env (الملف الذي يحمل كلمات المرور والمفاتيح) من نافذة الأوامر'),
      t('Publishing, deploying (putting the app online), or installing with another package manager', 'النشر أو الـ deploy (وضع التطبيق على الإنترنت) أو التثبيت بمدير حزم آخر'),
      t('Code downloaded and run straight away without being read', 'كود يحمل ويشغل مباشرة دون أن يقرأه أحد'),
      t('Writes from the command window to protected paths, lockfiles (files that pin exact versions) and git hooks', 'الكتابة من نافذة الأوامر في المسارات المحمية وملفات القفل (ملفات تثبت الإصدارات بدقة) والـ git hooks'),
      t('Requests to your live hosts (your real, public sites)', 'الطلبات إلى مواقعك الحية (مواقعك الحقيقية المنشورة)'),
    ],
  },
  {
    title: t('Files', 'الملفات'),
    script: 'guard-paths.sh',
    items: [
      t('Reading or editing .env and other credential files', 'قراءة أو تعديل ‎.env وملفات الأسرار الأخرى'),
      t('Editing lockfiles or anything inside .git (where git keeps its data)', 'تعديل ملفات القفل أو أي شيء داخل ‎.git (المكان الذي يحفظ فيه git بياناته)'),
      t('Generated files (made by a tool, not by hand) and deploy configuration', 'الملفات المولدة (تصنعها أداة لا إنسان) وإعدادات النشر'),
      t('Changing an existing build script', 'تغيير سكربت بناء موجود'),
      t('Writing a credential into a file', 'كتابة سر داخل ملف'),
      t('A JavaScript file in a TypeScript source folder', 'ملف JavaScript في مجلد كود TypeScript'),
    ],
  },
  {
    title: t('Addresses', 'الروابط'),
    script: 'guard-url.sh',
    items: [
      t('Fetching a page on a live host', 'جلب صفحة من موقع حي'),
      t('Opening a live host in a browser tool', 'فتح موقع حي في أداة متصفح'),
    ],
  },
]

export const gate = [
  t('Did the source code change in this session, saved or not? If nothing changed, this safety check stays quiet.', 'هل تغير الكود في هذه الجلسة، حفظته أم لا؟ إذا لم يتغير شيء، لا يتدخل فحص الأمان.'),
  t('The code is checked for mistakes (the typecheck).', 'يفحص الكود بحثا عن الأخطاء (فحص الأنواع).'),
  t('The related tests run, or the whole suite if you set it up that way.', 'تعمل الاختبارات المرتبطة، أو كل الاختبارات إذا ضبطت ذلك.'),
  t('The translation validator runs when translation files changed.', 'يعمل مدقق الترجمة إذا تغيرت ملفات اللغات.'),
  t('A failure sends the errors to the assistant and keeps it working, up to three times in a row.', 'إذا فشل شيء، يرسل الأخطاء إلى المساعد ويبقيه يعمل، حتى ثلاث مرات متتالية.'),
  t('In read-only mode it stays out of the way, because it would run project code.', 'في نمط القراءة فقط لا يتدخل، لأنه سيشغل كود المشروع.'),
  t('When everything passes, it asks for one review by frontend-reviewer.', 'وإذا نجح كل شيء، يطلب مراجعة واحدة من frontend-reviewer.'),
]

export const limits = [
  t('It reads commands from the command window the way the window itself does, but not what is inside a script file, a package script or a program in another language.', 'يقرأ أوامر نافذة الأوامر كما تقرؤها النافذة نفسها، لكنه لا يرى ما داخل ملف سكربت، أو سكربت في package.json، أو برنامج بلغة أخرى.'),
  t('Before Claude Code 2.1.295, a safety check that timed out or could not start let the action through.', 'قبل Claude Code 2.1.295، كان فحص الأمان الذي تنتهي مهلته أو لا يبدأ يسمح للإجراء بالمرور.'),
  t('Files you @-mention and tools the safety checks do not name are outside them. Keep the deny rules and use the sandbox (a closed space where the assistant cannot touch the rest of your computer).', 'الملفات التي تذكرها بـ @ والأدوات التي لا تسميها فحوص الأمان خارج نطاقها. أبق قواعد المنع، واستخدم الـ sandbox (مساحة مغلقة لا يستطيع المساعد فيها لمس بقية جهازك).'),
  t('It asks you before the assistant loosens one of the kit’s protections, and refuses where nobody can be asked. You can still switch parts off yourself.', 'يسألك قبل أن يخفف المساعد أي حماية من حمايات الإضافة، ويرفض إذا لم يوجد من يسأله. ويمكنك إيقاف بعضها بنفسك.'),
  t('It is a guard rail and not a sandbox. Keep branch protection and access control on.', 'هو حاجز أمان وليس sandbox. أبق حماية الفروع وضوابط الوصول مفعلة.'),
]
