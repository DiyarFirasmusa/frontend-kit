import { t } from './text.ts'

export const problems = [
  [
    t('Every command is refused after installing.', 'كل أمر ينرفض بعد التثبيت.'),
    t('The guards refuse when they cannot read the command, which happens without jq. Install it (on macOS: brew install jq) and restart.', 'الحرّاس يرفضون إذا ما قدروا يقرون الأمر، وهذا يصير إذا ماكو jq. ثبّته (على macOS: \u2066brew install jq\u2069) وأعد التشغيل.'),
  ],
  [
    t('The rules do not seem to load.', 'القواعد كأنها ما تنحمّل.'),
    t('Restart Claude Code after setup. If your source lives in an unusual folder, check srcDirs and the paths at the top of each rule.', 'أعد تشغيل Claude Code بعد الإعداد. وإذا كودك بمجلد مو معتاد، راجع srcDirs والمسارات اللي بأول كل قاعدة.'),
  ],
  [
    t('The assistant does not use the skill I expected.', 'المساعد ما استعمل المهارة اللي توقعتها.'),
    t('Call it by name: /frontend-kit: followed by the skill’s name. Skills of another project type are switched off on purpose.', 'استدعيها باسمها: ‎/frontend-kit: وبعدها اسم المهارة. ومهارات أنواع المشاريع الثانية مطفية عن قصد.'),
  ],
  [
    t('The quality gate keeps failing.', 'بوابة الجودة تفشل كل مرة.'),
    t('Run the commands from frontend-kit.json yourself. A gate that points at a script that does not exist can never pass.', 'شغّل أوامر frontend-kit.json بنفسك. البوابة اللي تأشر على سكربت مو موجود عمرها ما تنجح.'),
  ],
  [
    t('It is too slow or costs too much for small edits.', 'بطيئة أو تكلّف كثير على تعديلات صغيرة.'),
    t('Set stopGate.review to false. The typecheck and related tests stay.', 'خلي stopGate.review على false. فحص الأنواع والاختبارات المرتبطة يبقون.'),
  ],
  [
    t('A teammate does not get the kit.', 'زميلي ما توصله العدّة.'),
    t('They run claude plugin install frontend-kit@frontend-kit --scope project once in a terminal.', 'يشغّل هذا مرة وحدة بالتيرمنال: \u2066claude plugin install frontend-kit@frontend-kit --scope project\u2069'),
  ],
  [
    t('Setup stopped while writing into .claude.', 'الإعداد وقف وهو يكتب بـ ‎.claude.'),
    t('Claude Code asks permission for that folder. Approve it and run setup again: it skips what is already done.', 'Claude Code يطلب إذن لهالمجلد. وافق وشغّل الإعداد مرة ثانية، وهو يعبر اللي خلص.'),
  ],
  [
    t('Does it work on Windows?', 'تشتغل على Windows؟'),
    t('The hooks are bash scripts that need jq. They are developed on macOS, and native Windows is untested.', 'الحرّاس سكربتات bash تحتاج jq. انكتبت على macOS، وما انجرّبت على Windows مباشرة.'),
  ],
] as const
