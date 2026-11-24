import { t } from './text.ts'

export const problems = [
  [
    t('Every command is refused after installing.', 'يُرفض كل أمر بعد التثبيت.'),
    t('The guards refuse when they cannot read the command, which happens without jq. Install it (on macOS: brew install jq) and restart.', 'يرفض الحرّاس الأمر عندما لا يستطيعون قراءته، وهذا يحدث عند غياب jq. ثبّته (على macOS: \u2066brew install jq\u2069) ثم أعد التشغيل.'),
  ],
  [
    t('The rules do not seem to load.', 'يبدو أن القواعد لا تُحمَّل.'),
    t('Restart Claude Code after setup. If your source lives in an unusual folder, check srcDirs and the paths at the top of each rule.', 'أعد تشغيل Claude Code بعد الإعداد. وإذا كان الكود المصدري في مجلد غير معتاد، فتحقق من srcDirs ومن المسارات في أعلى كل قاعدة.'),
  ],
  [
    t('The assistant does not use the skill I expected.', 'لم يستخدم المساعد المهارة التي توقعتها.'),
    t('Call it by name: /frontend-kit: followed by the skill’s name. Skills of another project type are switched off on purpose.', 'استدعها باسمها: ‎/frontend-kit: ثم اسم المهارة. مهارات أنواع المشاريع الأخرى معطّلة عمداً.'),
  ],
  [
    t('The quality gate keeps failing.', 'تفشل بوابة الجودة باستمرار.'),
    t('Run the commands from frontend-kit.json yourself. A gate that points at a script that does not exist can never pass.', 'شغّل الأوامر المذكورة في frontend-kit.json بنفسك. البوابة التي تشير إلى سكربت غير موجود لن تنجح أبداً.'),
  ],
  [
    t('It is too slow or costs too much for small edits.', 'تبطؤ أو تكلّف كثيراً في التعديلات الصغيرة.'),
    t('Set stopGate.review to false. The typecheck and related tests stay.', 'اضبط stopGate.review على false. يبقى فحص الأنواع والاختبارات المرتبطة.'),
  ],
  [
    t('A teammate does not get the kit.', 'لا تصل الإضافة إلى أحد الزملاء.'),
    t('They run claude plugin install frontend-kit@frontend-kit --scope project once in a terminal.', 'يشغّل كل زميل هذا الأمر مرة واحدة في الطرفية: \u2066claude plugin install frontend-kit@frontend-kit --scope project\u2069'),
  ],
  [
    t('Setup stopped while writing into .claude.', 'توقف الإعداد أثناء الكتابة في ‎.claude.'),
    t('Claude Code asks permission for that folder. Approve it and run setup again: it skips what is already done.', 'يطلب Claude Code إذناً لهذا المجلد. وافق وشغّل الإعداد مرة أخرى: فهو يتخطى ما أُنجز سابقاً.'),
  ],
  [
    t('Does it work on Windows?', 'هل يعمل على Windows؟'),
    t('The hooks are bash scripts that need jq. They are developed on macOS, and native Windows is untested.', 'الحرّاس سكربتات bash تحتاج إلى jq. طُوّرت على macOS، ولم يُختبر Windows الأصلي بعد.'),
  ],
] as const
