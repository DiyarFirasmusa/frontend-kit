import type { HookEvent } from '../types.ts'
import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

export const hookEffects: Record<HookEvent, Bilingual> = {
  SessionStart: t('Adds context', 'يضيف سياق'),
  UserPromptSubmit: t('Adds context', 'يضيف سياق'),
  PreToolUse: t('Can refuse', 'يقدر يرفض'),
  PostToolUse: t('Sends errors back', 'يرجّع الأخطاء'),
  PostToolUseFailure: t('Writes a log', 'يكتب سجل'),
  SubagentStart: t('Adds context', 'يضيف سياق'),
  SubagentStop: t('Can send back', 'يقدر يرجّعه'),
  Notification: t('Alerts you', 'ينبّهك'),
  Stop: t('Can send back', 'يقدر يرجّعه'),
  SessionEnd: t('Cleans up', 'ينظّف'),
}

export const guards = [
  {
    title: t('Commands', 'الأوامر'),
    script: 'guard-bash.sh',
    items: [
      t('Commit, merge, rebase or push on a protected branch', 'الحفظ، أو الدمج، أو الـ rebase، أو الرفع على فرع محمي'),
      t('Force pushes and skipped git hooks', 'الرفع بالقوة، وتخطّي الـ git hooks'),
      t('Throwing away work: reset --hard, clean -f, checkout -f', 'ضياع الشغل: reset --hard وclean -f وcheckout -f'),
      t('Recursive deletes outside the project, of its main folders, or of a path it cannot check', 'الحذف الشامل برّا المشروع، أو لمجلداته الأساسية، أو لمسار ما يقدر يتأكد منه'),
      t('Opening or merging a pull request', 'فتح الـ pull request أو دمجه'),
      t('Reading .env secrets through the shell', 'قراءة أسرار ‎.env من الطرفية'),
      t('Publishing, deploying, or installing with another package manager', 'النشر، أو الـ deploy، أو تثبيت الحزم بمدير حزم ثاني'),
      t('Code piped straight into a shell', 'كود يروح مباشرة للطرفية'),
      t('Shell writes to protected paths, lockfiles and git hooks', 'الكتابة من الطرفية على المسارات المحمية، وملفات القفل، والـ git hooks'),
      t('Requests to your live hosts', 'الطلبات إلى نطاقاتك الحية'),
    ],
  },
  {
    title: t('Files', 'الملفات'),
    script: 'guard-paths.sh',
    items: [
      t('Reading or editing .env and other credential files', 'قراءة ‎.env وباقي ملفات الأسرار، أو تعديلها'),
      t('Editing lockfiles or anything inside .git', 'تعديل ملفات القفل، أو أي شي داخل ‎.git'),
      t('Generated files and deploy configuration', 'الملفات المولّدة، وإعدادات النشر'),
      t('Changing an existing build script', 'تغيير سكربت بناء موجود'),
      t('Writing a credential into a file', 'كتابة سرّ داخل ملف'),
      t('A JavaScript file in a TypeScript source folder', 'ملف JavaScript بمجلد كود TypeScript'),
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
  t('Source changed in this session, committed or not? If nothing changed, it stays quiet.', 'الكود تغيّر بهالجلسة، انحفظ أو لا؟ إذا ما تغيّر شي، يبقى ساكت.'),
  t('The typecheck runs.', 'يشتغل فحص الأنواع.'),
  t('The related tests run, or the whole suite if you configure it.', 'تشتغل الاختبارات المرتبطة، أو كل الاختبارات إذا ضبطتها.'),
  t('The translation validator runs when locale files changed.', 'يشتغل مدقّق الترجمة إذا تغيّرت ملفات اللغات.'),
  t('A failure sends the errors to the assistant and keeps it working, up to three times in a row.', 'إذا فشل، يرسل الأخطاء للمساعد ويخليه يكمل شغل، لحد ثلاث مرات ورا بعض.'),
  t('In read-only mode it stays out of the way, because it would run project code.', 'بوضع القراءة فقط ما يتدخل، لأنه راح يحتاج يشغّل كود المشروع.'),
  t('A pass asks for one review by frontend-reviewer.', 'وإذا نجح، يطلب مراجعة وحدة من frontend-reviewer.'),
]

export const limits = [
  t('It reads shell commands like the shell does, but not what is inside a script file, a package script or a program in another language.', 'يقرا أوامر الطرفية مثل ما تقراها الطرفية، بس ما يشوف شنو داخل ملف سكربت، أو أمر بـ package.json، أو برنامج بلغة ثانية.'),
  t('Before Claude Code 2.1.295, a guard that timed out or could not start let the action through.', 'قبل Claude Code 2.1.295، الحارس اللي تخلص مهلته أو ما يقدر يشتغل كان يخلي الفعل يعبر.'),
  t('Files you @-mention and tools the hooks do not name are outside them. Keep the deny rules and use the sandbox.', 'الملفات اللي تذكرها بـ @، والأدوات اللي الحرّاس ما تسمّيها، برّا نطاقهم. فخلّي قواعد المنع، واستعمل البيئة المعزولة.'),
  t('It asks you before the assistant loosens one of the kit’s protections, and refuses where nobody can be asked. You can still switch parts off yourself.', 'يسألك قبل ما يخفف المساعد أي حماية من حمايات العدّة، ويرفض إذا ما في أحد ينسأل. وتبقى تقدر تطفي أجزاء منها بنفسك.'),
  t('It is a guard rail and not a sandbox. Keep branch protection and access control on.', 'هو حاجز أمان، مو بيئة معزولة. فخلّي حماية الفروع وضوابط الوصول شغّالة.'),
]
