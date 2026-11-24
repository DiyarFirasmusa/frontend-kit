import { t } from './text.ts'

export const problems = [
  [
    t('Every command is refused after installing.', 'يرفض الحراس كل أمر بعد التثبيت.'),
    t('The guards refuse when they cannot read the command, which happens without jq. Install it (on macOS: brew install jq) and restart.', 'يرفض الحراس الأمر إذا لم يستطيعوا قراءته، وهذا يحدث عندما لا يكون jq موجودا. ثبّته (على macOS: \u2066brew install jq\u2069) ثم أعد التشغيل.'),
  ],
  [
    t('The rules do not seem to load.', 'القواعد لا تعمل على ما يبدو.'),
    t('Restart Claude Code after setup. If your source lives in an unusual folder, check srcDirs and the paths at the top of each rule.', 'أعد تشغيل Claude Code بعد الإعداد. وإذا كان الكود في مجلد غير معتاد، راجع srcDirs والمسارات في أعلى كل قاعدة.'),
  ],
  [
    t('The assistant does not use the skill I expected.', 'لم يستخدم المساعد المهارة التي توقعتها.'),
    t('Call it by name: /frontend-kit: followed by the skill’s name. Skills of another project type are switched off on purpose.', 'اكتب اسمها بنفسك: ‎/frontend-kit: ثم اسم المهارة. وتعطل مهارات أنواع المشاريع الأخرى عمدا.'),
  ],
  [
    t('The quality gate keeps failing.', 'بوابة الجودة تفشل دائما.'),
    t('Run the commands from frontend-kit.json yourself. A gate that points at a script that does not exist can never pass.', 'شغّل الأوامر الموجودة في frontend-kit.json بنفسك. إذا كانت البوابة تشير إلى سكربت غير موجود، فلن تنجح أبدا.'),
  ],
  [
    t('It is too slow or costs too much for small edits.', 'الإضافة بطيئة أو مكلفة في التعديلات الصغيرة.'),
    t('Set stopGate.review to false. The typecheck and related tests stay.', 'اضبط stopGate.review على false. يبقى فحص الأنواع والاختبارات المرتبطة.'),
  ],
  [
    t('A teammate does not get the kit.', 'الإضافة لا تصل إلى أحد الزملاء.'),
    t('They run claude plugin install frontend-kit@frontend-kit --scope project once in a terminal.', 'يشغل الزميل هذا الأمر مرة واحدة في الطرفية: \u2066claude plugin install frontend-kit@frontend-kit --scope project\u2069'),
  ],
  [
    t('Setup stopped while writing into .claude.', 'توقف الإعداد أثناء الكتابة في ‎.claude.'),
    t('Claude Code asks permission for that folder. Approve it and run setup again: it skips what is already done.', 'يطلب Claude Code إذنا لهذا المجلد. وافق، ثم شغّل الإعداد مرة أخرى. سيتخطى ما أنجزه سابقا.'),
  ],
  [
    t('Does it work on Windows?', 'هل يعمل على Windows؟'),
    t('The hooks are bash scripts that need jq. They are developed on macOS, and native Windows is untested.', 'الحراس سكربتات bash تحتاج إلى jq. طورناها على macOS، ولم نختبرها على Windows الأصلي.'),
  ],
] as const
