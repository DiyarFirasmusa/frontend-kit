import type { HookEvent } from '../types.ts'
import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

export const hookEffects: Record<HookEvent, Bilingual> = {
  SessionStart: t('Adds context', 'يضيف سياقاً'),
  UserPromptSubmit: t('Adds context', 'يضيف سياقاً'),
  PreToolUse: t('Can refuse', 'يستطيع الرفض'),
  PostToolUse: t('Sends errors back', 'يعيد الأخطاء'),
  PostToolUseFailure: t('Writes a log', 'يكتب سجلاً'),
  SubagentStop: t('Can send back', 'يستطيع الإعادة'),
  Notification: t('Alerts you', 'ينبّهك'),
  Stop: t('Can send back', 'يستطيع الإعادة'),
  SessionEnd: t('Cleans up', 'ينظّف'),
}

export const guards = [
  {
    title: t('Commands', 'الأوامر'),
    script: 'guard-bash.sh',
    items: [
      t('Commit, merge, rebase or push on a protected branch', 'الحفظ أو الدمج أو الرفع على فرع محمي'),
      t('Force pushes and skipped git hooks', 'الرفع القسري وتخطّي فحوص git'),
      t('Throwing away work: reset --hard, clean -f, checkout -f', 'رمي العمل: reset --hard وclean -f وcheckout -f'),
      t('Recursive deletes outside the project, of its main folders, or of a path it cannot check', 'الحذف الشامل خارج المشروع أو لمجلداته الأساسية أو لمسار لا يمكن التحقق منه'),
      t('Opening or merging a pull request', 'فتح طلب دمج أو دمجه'),
      t('Reading .env secrets through the shell', 'قراءة أسرار ‎.env من الطرفية'),
      t('Requests to your live hosts', 'الطلبات إلى نطاقاتك الحية'),
    ],
  },
  {
    title: t('Files', 'الملفات'),
    script: 'guard-paths.sh',
    items: [
      t('Reading or editing .env files', 'قراءة ملفات ‎.env أو تعديلها'),
      t('Editing lockfiles or anything inside .git', 'تعديل ملفات القفل أو ما داخل ‎.git'),
      t('Generated files and deploy configuration', 'الملفات المولّدة وإعدادات النشر'),
      t('Changing an existing build script', 'تغيير أمر بناء موجود'),
      t('A JavaScript file in a TypeScript source folder', 'ملف JavaScript في مجلد TypeScript'),
    ],
  },
  {
    title: t('Addresses', 'العناوين'),
    script: 'guard-url.sh',
    items: [
      t('Fetching a page on a live host', 'جلب صفحة من نطاق حي'),
      t('Opening a live host in a browser tool', 'فتح نطاق حي في أداة متصفح'),
    ],
  },
]

export const gate = [
  t('Source changed in this session, committed or not? If nothing changed, it stays quiet.', 'هل تغيّرت الشيفرة في هذه الجلسة، حُفظت أم لا؟ إن لم يتغير شيء يبقى صامتاً.'),
  t('The typecheck runs.', 'يعمل فحص الأنواع.'),
  t('The related tests run, or the whole suite if you configure it.', 'تعمل الاختبارات المرتبطة، أو كلها إن ضبطت ذلك.'),
  t('The translation validator runs when locale files changed.', 'يعمل مدقّق الترجمة إن تغيّرت ملفاتها.'),
  t('A failure sends the errors to the assistant and keeps it working, up to three times in a row.', 'الفشل يرسل الأخطاء إلى المساعد ويبقيه يعمل، حتى ثلاث مرات متتالية.'),
  t('A pass asks for one review by frontend-reviewer.', 'والنجاح يطلب مراجعة واحدة من frontend-reviewer.'),
]

export const limits = [
  t('It reads shell commands like the shell does, but not what is inside a script file, a package script or a program in another language.', 'يقرأ أوامر الطرفية كما تقرؤها الطرفية، لكنه لا يرى ما داخل ملف سكربت أو أمر في package.json أو برنامج بلغة أخرى.'),
  t('A hook that runs past its timeout lets the action through.', 'الحارس الذي يتجاوز مهلته يترك الفعل يمر.'),
  t('It is a guard rail and not a sandbox. Keep branch protection and access control on.', 'هو حاجز أمان لا بيئة معزولة، فأبقِ حماية الفروع وضوابط الوصول.'),
]
