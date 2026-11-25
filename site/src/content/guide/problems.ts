import { t } from './text.ts'

/** The questions a beginner asks before they start. Plain and honest. */
export const beginnerQuestions = [
  [
    t('Does it cost money?', 'هل تكلف مالا؟'),
    t('The cost comes from Claude Code, not from the kit. Claude Code needs a Claude plan or credit from Anthropic. The kit makes the assistant check its own work, and that uses somewhat more of your allowance. On two small test tasks it cost about 1.5 times as much. That is a small sample, so treat it as a rough guide.', 'التكلفة تأتي من ⁦Claude Code⁩ وليس من الإضافة. فهو يحتاج إلى اشتراك Claude أو رصيد من Anthropic. والإضافة تجعل المساعد يفحص عمله بنفسه، وهذا يستهلك من رصيدك أكثر قليلا. في اختبار صغير على عدد قليل من المهام كلفت نحو مرة ونصف. هذه عينة صغيرة، فاعتبرها تقديرا تقريبيا.'),
  ],
  [
    t('Do I need to know how to code?', 'هل يجب أن أعرف البرمجة؟'),
    t('No. You describe what you want in plain sentences, in Arabic or English. But you stay in charge. The kit shows you a short summary first and waits for your yes. When it finishes, open the result and look at it. If something is wrong, say so in a plain sentence and it fixes it.', 'لا. تصف ما تريد بجمل بسيطة، بالعربية أو بالإنجليزية. لكنك تبقى صاحب القرار. تعرض عليك الإضافة ملخصا قصيرا أولا وتنتظر موافقتك. وعندما تنتهي، افتح النتيجة وانظر إليها. وإذا وجدت خطأ، قله بجملة بسيطة وسيصلحه.'),
  ],
  [
    t('Is my data safe?', 'هل بياناتي آمنة؟'),
    t('Your project stays on your computer. Like any use of Claude Code, the parts of your project that the assistant reads are sent to Claude so it can work on them. The safety checks are small scripts that run on your computer. One tool the kit uses, Context7, sends documentation searches to its own service. Never type a password or a key into the chat. The safety checks are a guard rail, not a locked vault.', 'مشروعك يبقى على جهازك. وكما في أي استخدام لـ ⁦Claude Code⁩، تُرسل الأجزاء التي يقرؤها المساعد من مشروعك إلى Claude حتى يعمل عليها. وفحوص الأمان سكربتات صغيرة تعمل على جهازك. وأداة واحدة تستخدمها الإضافة، وهي ⁦Context7⁩، ترسل عمليات البحث في التوثيق إلى خدمتها. لا تكتب كلمة مرور ولا مفتاحا في المحادثة. وفحوص الأمان حاجز يحميك، وليست خزنة مغلقة.'),
  ],
  [
    t('What if it breaks something?', 'ماذا لو أفسد شيئا؟'),
    t('Two things protect you. First, it asks before it starts, and the safety checks stop dangerous actions such as deleting folders or touching your live website. Second, the same checks run after the work and send mistakes back to the assistant to fix. Still, nothing is perfect. Keep a copy of anything you cannot lose, and ask it to undo the last change if you do not like it.', 'تحميك الإضافة بعدة طرق. أولها أنها تسألك قبل أن تبدأ، وفحوص الأمان توقف الأعمال الخطرة مثل حذف المجلدات أو لمس موقعك الحي. وثانيها أن الفحوص نفسها تعمل بعد انتهاء العمل وترجع الأخطاء إلى المساعد ليصلحها. ومع ذلك لا شيء كامل. احتفظ بنسخة من كل ما لا تحتمل خسارته، واطلب منه أن يتراجع عن آخر تغيير إذا لم يعجبك.'),
  ],
  [
    t('What if I do not know my backend’s API link?', 'ماذا لو لا أعرف رابط وصف الـ API لخادمي؟'),
    t('That is fine. This link is a page that describes what your backend offers, often called OpenAPI or Swagger. Ask whoever built your backend for it. If you do not have it yet, skip it. The kit asks instead whether people sign in and what the main things are that you manage, such as orders, customers or products. It can then build the pages with example data, and you connect your real backend later.', 'لا مشكلة. هذا الرابط صفحة تصف ما يقدمه خادمك، وتسمى غالبا ⁦OpenAPI⁩ أو ⁦Swagger⁩. اطلبه ممن بنى الخادم. وإذا لم يكن عندك بعد، تجاوز هذا السؤال. ستسألك الإضافة بدله هل يسجل الناس الدخول، وما أهم الأشياء التي تديرها، مثل الطلبات والعملاء والمنتجات. وعندها تبني الصفحات ببيانات تجريبية، وتربطها بخادمك الحقيقي لاحقا.'),
  ],
  [
    t('What if I have no design?', 'ماذا لو لم يكن عندي تصميم؟'),
    t('Send a picture of a style you like, or a link to a site you want yours to feel like. The kit takes the colours, the fonts and the general feel. It never copies the site. If you have a logo, send it too.', 'أرسل صورة لأسلوب يعجبك، أو رابط موقع تريد أن يشبه موقعك في إحساسه. تأخذ الإضافة الألوان والخطوط والإحساس العام. ولا تنسخ الموقع أبدا. وإذا كان عندك شعار، أرسله أيضا.'),
  ],
  [
    t('Does it put my site online?', 'هل تنشر لي الموقع على الإنترنت؟'),
    t('Not yet. It builds a complete project and runs it on your computer so you can see it. Putting it online comes later, and you will decide when.', 'ليس بعد. تبني لك مشروعا كاملا وتشغله على جهازك لترى النتيجة. أما النشر على الإنترنت فيأتي لاحقا، وأنت تقرر متى.'),
  ],
] as const

export const problems = [
  [
    t('Every command is refused after installing.', 'تُرفض كل الأوامر بعد التثبيت.'),
    t('The safety checks refuse a command when they cannot read it. This happens when a small free tool called jq is missing. Install it (on macOS: brew install jq), then close Claude Code and open it again.', 'ترفض فحوص الأمان الأمر إذا لم تستطع قراءته، وهذا يحدث عندما تكون أداة صغيرة مجانية اسمها ⁦jq⁩ غير موجودة. ثبّتها (على macOS: ⁦brew install jq⁩) ثم أغلق ⁦Claude Code⁩ وافتحه من جديد.'),
  ],
  [
    t('The rules do not seem to load.', 'القواعد لا تعمل على ما يبدو.'),
    t('Close Claude Code and open it again after setup. If your code lives in an unusual folder, check srcDirs (the list of your code folders in the settings file) and the paths at the top of each rule.', 'أغلق ⁦Claude Code⁩ وافتحه من جديد بعد الإعداد. وإذا كان الكود في مجلد غير معتاد، فراجع ⁦srcDirs⁩ (قائمة مجلدات الكود في ملف الإعدادات) والمسارات في أعلى كل قاعدة.'),
  ],
  [
    t('The assistant does not use the skill I expected.', 'لم يستخدم المساعد المهارة التي توقعتها.'),
    t('Ask for it by name: type /wajiha-kit: and then the skill’s name. Skills for other kinds of projects are switched off on purpose.', 'اطلبها باسمها: اكتب ⁦/wajiha-kit:⁩ ثم اسم المهارة. وتُعطَّل مهارات أنواع المشاريع الأخرى عمدا.'),
  ],
  [
    t('The final check keeps failing.', 'الفحص الأخير يفشل دائما.'),
    t('It runs the commands listed in wajiha-kit.json, the kit’s settings file. Run those commands yourself to see which one fails. A check that points at a command that does not exist can never pass.', 'يشغل الأوامر المكتوبة في ⁦wajiha-kit.json⁩، وهو ملف إعدادات الإضافة. شغّل هذه الأوامر بنفسك لترى أيها يفشل. وإذا كان الفحص يشير إلى أمر غير موجود، فلن ينجح أبدا.'),
  ],
  [
    t('It is too slow or costs too much for small edits.', 'الإضافة بطيئة أو مكلفة في التعديلات الصغيرة.'),
    t('Set stopGate.review to false in the settings file. The final check still looks for mistakes in the code and runs the tests that relate to your change.', 'اضبط ⁦stopGate.review⁩ على ⁦false⁩ في ملف الإعدادات. يبقى الفحص الأخير يبحث عن أخطاء في الكود ويشغل الاختبارات المرتبطة بتغييرك.'),
  ],
  [
    t('A teammate does not get the kit.', 'الإضافة لا تصل إلى أحد الزملاء.'),
    t('They run this once in the command window: claude plugin install wajiha-kit@wajiha-kit --scope project', 'يشغل الزميل هذا الأمر مرة واحدة في نافذة الأوامر: ⁦claude plugin install wajiha-kit@wajiha-kit --scope project⁩'),
  ],
  [
    t('Setup stopped while writing into .claude.', 'توقف الإعداد أثناء الكتابة في ‎.claude.'),
    t('Claude Code asks your permission to write in that folder. Approve it and run setup again. It skips what is already done.', 'يطلب ⁦Claude Code⁩ إذنك للكتابة في هذا المجلد. وافق، ثم شغّل الإعداد مرة أخرى. سيتخطى ما أنجزه سابقا.'),
  ],
  [
    t('Does it work on Windows?', 'هل يعمل على Windows؟'),
    t('The safety checks are small bash scripts that need jq. We built them on macOS. Windows itself is untested, so it may not work there.', 'فحوص الأمان سكربتات ⁦bash⁩ صغيرة تحتاج إلى ⁦jq⁩. بنيناها على macOS، ولم نجرب Windows نفسه، فقد لا تعمل عليه.'),
  ],
] as const
