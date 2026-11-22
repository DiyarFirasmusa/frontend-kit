import { t } from './text.ts'

export const problems = [
  [
    t('Every command is refused after installing.', 'كل أمر يُرفض بعد التثبيت.'),
    t('The guards refuse when they cannot read the command, which happens without jq. Install it (on macOS: brew install jq) and restart.', 'الحرّاس ترفض عندما لا تستطيع قراءة الأمر، وهذا يحدث من دون jq. ثبّته (على macOS: \u2066brew install jq\u2069) وأعد التشغيل.'),
  ],
  [
    t('The rules do not seem to load.', 'يبدو أن القواعد لا تُحمَّل.'),
    t('Restart Claude Code after setup. If your source lives in an unusual folder, check srcDirs and the paths at the top of each rule.', 'أعد تشغيل Claude Code بعد الإعداد. وإن كانت شيفرتك في مجلد غير معتاد فراجع srcDirs والمسارات أعلى كل قاعدة.'),
  ],
  [
    t('The assistant does not use the skill I expected.', 'لا يستعمل المساعد المهارة التي توقعتها.'),
    t('Call it by name: /frontend-kit: followed by the skill’s name. Skills of another project type are switched off on purpose.', 'استدعها باسمها: ‎/frontend-kit: ثم اسم المهارة. ومهارات أنواع المشاريع الأخرى معطّلة عمداً.'),
  ],
  [
    t('The quality gate keeps failing.', 'بوابة الجودة تفشل باستمرار.'),
    t('Run the commands from frontend-kit.json yourself. A gate that points at a script that does not exist can never pass.', 'شغّل الأوامر من frontend-kit.json بنفسك، فالبوابة التي تشير إلى أمر غير موجود لا تنجح أبداً.'),
  ],
  [
    t('It is too slow or costs too much for small edits.', 'بطيئة أو مكلفة للتعديلات الصغيرة.'),
    t('Set stopGate.review to false. The typecheck and related tests stay.', 'اضبط stopGate.review على false، ويبقى فحص الأنواع والاختبارات المرتبطة.'),
  ],
  [
    t('A teammate does not get the kit.', 'زميلي لا تصله العدّة.'),
    t('They run claude plugin install frontend-kit@frontend-kit --scope project once in a terminal.', 'يشغّل مرة واحدة في الطرفية: \u2066claude plugin install frontend-kit@frontend-kit --scope project\u2069'),
  ],
  [
    t('Setup stopped while writing into .claude.', 'توقف الإعداد أثناء الكتابة في ‎.claude.'),
    t('Claude Code asks permission for that folder. Approve it and run setup again: it skips what is already done.', 'يطلب Claude Code إذناً لهذا المجلد. وافق وأعد الإعداد، وسيتخطى ما أُنجز.'),
  ],
  [
    t('Does it work on Windows?', 'هل تعمل على Windows؟'),
    t('The hooks are bash scripts that need jq. They are developed on macOS, and native Windows is untested.', 'الحرّاس سكربتات bash تحتاج jq، طُوّرت على macOS، ولم تُختبر على Windows مباشرة.'),
  ],
] as const
