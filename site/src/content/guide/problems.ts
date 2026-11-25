import { t } from './text.ts'

/** The questions a beginner asks before they start. Plain and honest. */
export const beginnerQuestions = [
  [
    t('Does it cost money?', 'هل تكلف مالا؟'),
    t('The kit is free. Claude Code, which the kit works inside, needs a Claude account that allows Claude Code. Check your plan on Anthropic’s site. The kit makes the assistant check its own work, so it uses somewhat more of your Claude allowance than a plain request.', 'الإضافة مجانية. أما ⁦Claude Code⁩، الذي تعمل الإضافة داخله، فيحتاج إلى حساب في ⁦Claude⁩ يسمح باستخدامه. راجع خطتك في موقع ⁦Anthropic⁩. والإضافة تجعل المساعد يفحص عمله بنفسه، فتستهلك من رصيدك في ⁦Claude⁩ أكثر قليلا من طلب عادي.'),
  ],
  [
    t('Do I need to know how to code?', 'هل يجب أن أعرف البرمجة؟'),
    t('No. You describe what you want in plain sentences, in Arabic or English. But you stay in charge. The kit shows you a short summary first and waits for your yes. When it finishes, open the result and look at it. If something is wrong, say so in a plain sentence and it fixes it.', 'لا. تصف ما تريد بجمل بسيطة، بالعربية أو بالإنجليزية. لكنك تبقى صاحب القرار. تعرض عليك الإضافة ملخصا قصيرا أولا وتنتظر موافقتك. وعندما تنتهي، افتح النتيجة وانظر إليها. وإذا وجدت خطأ، قله بجملة بسيطة وسيصلحه.'),
  ],
  [
    t('Is my data safe?', 'هل بياناتي آمنة؟'),
    t('Your project stays on your computer. Like any use of Claude Code, the parts of your project that the assistant reads are sent to Claude so it can work on them. The safety checks are small scripts that run on your computer. One tool the kit uses, Context7, sends documentation searches to its own service, and helper tools are downloaded from npm. Never type a password or a key into the chat; keep keys in a file named .env. The kit tells the assistant not to open it and blocks the usual ways, but this is not a lock. The safety checks are a guard rail, not a locked vault.', 'مشروعك يبقى على جهازك. وكما في أي استخدام لـ ⁦Claude Code⁩، تُرسل الأجزاء التي يقرؤها المساعد من مشروعك إلى Claude حتى يعمل عليها. وفحوص الأمان سكربتات صغيرة تعمل على جهازك. وأداة تستخدمها الإضافة، وهي ⁦Context7⁩، ترسل عمليات البحث في التوثيق إلى خدمتها، وتُنزَّل أدوات مساعدة من ⁦npm⁩. لا تكتب كلمة مرور ولا مفتاحا في المحادثة؛ احفظ المفاتيح في ملف اسمه ⁦.env⁩. تطلب الإضافة من المساعد ألا يفتحه وتسد الطرق المعتادة، لكن هذا ليس قفلا. وفحوص الأمان حاجز يحميك، وليست خزنة مغلقة.'),
  ],
  [
    t('What if it breaks something?', 'ماذا لو أفسد شيئا؟'),
    t('Two things protect you. First, it asks before it starts, and the safety checks stop known risky commands, such as force pushes or deleting top-level folders. They cannot see inside scripts. Second, the same checks run after the work and send mistakes back to the assistant to fix. Still, nothing is perfect. Keep a copy of anything you cannot lose, and ask it to undo the last change if you do not like it.', 'تحميك الإضافة بأمرين. أولهما أنها تسألك قبل أن تبدأ، وفحوص الأمان توقف الأوامر الخطرة المعروفة، مثل الرفع القسري أو حذف المجلدات الرئيسية. ولا ترى ما داخل السكربتات. وثانيهما أن الفحوص نفسها تعمل بعد انتهاء العمل وتعيد الأخطاء إلى المساعد ليصلحها. ومع ذلك لا شيء كامل. احتفظ بنسخة من كل ما لا تحتمل خسارته، واطلب منه أن يتراجع عن آخر تغيير إذا لم يعجبك.'),
  ],
  [
    t('What if I do not know my backend’s API link?', 'ماذا لو لم أكن أعرف رابط وصف خادمي (API)؟'),
    t('That is fine. This is a file or page that describes what your backend offers, often called OpenAPI or Swagger. Ask whoever built your backend for it, and save it in your project as docs/api/openapi.json. If you do not have it yet, skip it. The kit asks instead whether people sign in and what the main things are that you manage, such as orders, customers or products. It can then build the pages with example data, and you connect your real backend later.', 'لا مشكلة. هذا ملف أو صفحة تصف ما يقدمه خادمك، وتسمى غالبا ⁦OpenAPI⁩ أو ⁦Swagger⁩. اطلبه ممن بنى الخادم، واحفظه في مشروعك باسم ⁦docs/api/openapi.json⁩. وإذا لم يكن عندك بعد، تجاوز هذا السؤال. ستسألك الإضافة بدله هل يسجل الناس الدخول، وما أهم الأشياء التي تديرها، مثل الطلبات والعملاء والمنتجات. وعندها تبني الصفحات ببيانات تجريبية، وتربطها بخادمك الحقيقي لاحقا.'),
  ],
  [
    t('What if I have no design?', 'ماذا لو لم يكن عندي تصميم؟'),
    t('Send a picture of a style you like, or a link to a site you want yours to feel like. The kit takes the colours, the fonts and the general feel. It never copies the site. If you have a logo, send it too.', 'أرسل صورة لأسلوب يعجبك، أو رابط موقع تريد أن يشبه موقعك في إحساسه. تأخذ الإضافة الألوان والخطوط والإحساس العام. ولا تنسخ الموقع أبدا. وإذا كان عندك شعار، أرسله أيضا.'),
  ],
  [
    t('Does it work on a phone?', 'هل تعمل على الهاتف؟'),
    t('No. You need the Claude app on a computer. The sites and dashboards it builds do work on phones, but you build them on a computer.', 'لا. تحتاج تطبيق ⁦Claude⁩ على حاسوب. أما المواقع ولوحات التحكم التي تبنيها فتعمل على الهاتف، لكنك تبنيها من حاسوب.'),
  ],
  [
    t('How do my clients or I change the texts and pictures later?', 'كيف أغيّر أنا أو زبائني النصوص والصور لاحقا؟'),
    t('There is no visual editor like Wix. You ask Claude in plain words: “change the title of the home page”. If you choose “Both”, the owner of the site can manage content from a dashboard instead, once it is connected to a backend that stores it.', 'لا يوجد محرر مرئي مثل ⁦Wix⁩. تطلب من ⁦Claude⁩ بكلمات بسيطة: «غيّر عنوان الصفحة الرئيسية». وإذا اخترت «الاثنان»، يستطيع صاحب الموقع أن يدير المحتوى من لوحة تحكم، بعد ربطها بخادم خلفي يخزّن البيانات.'),
  ],
  [
    t('Can I hand the project to a client?', 'هل أستطيع تسليم المشروع لزبون؟'),
    t('Yes. The project is a normal folder of files, and it is yours. You can give the folder to anyone. Whoever takes it over does not need the kit to open the project, but the kit’s rules and checks only work on a computer where it is installed.', 'نعم. المشروع مجلد ملفات عادي، وهو ملكك. تستطيع أن تعطي المجلد لأي شخص. ومن يستلمه لا يحتاج الإضافة ليفتح المشروع، لكن قواعد الإضافة وفحوصها لا تعمل إلا على حاسوب مثبّتة عليه.'),
  ],
  [
    t('Does it put my site online?', 'هل تنشر لي الموقع على الإنترنت؟'),
    t('No. It builds the project and runs it on your computer so you can see it. To put it online you need hosting and a domain name. You can ask Claude: “Explain how to publish this site”, and it will ask before each step.', 'لا. تبني لك المشروع وتشغله على جهازك لترى النتيجة. ولنشره على الإنترنت تحتاج استضافة واسم نطاق (دومين). ويمكنك أن تطلب من ⁦Claude⁩: «اشرح لي كيف أنشر هذا الموقع»، وسيسألك قبل كل خطوة.'),
  ],
] as const

export const problems = [
  [
    t('Every command is refused after installing.', 'تُرفض كل الأوامر بعد التثبيت.'),
    t('The safety checks refuse a command when they cannot read it. This happens when a small free tool called jq is missing. Install it yourself (on macOS: brew install jq; on Windows: winget install jqlang.jq; on Linux: sudo apt install jq), then close Claude Code and open it again. Claude cannot install it for you here, because the checks refuse the command.', 'ترفض فحوص الأمان الأمر إذا لم تستطع قراءته، وهذا يحدث عندما تكون أداة صغيرة مجانية اسمها ⁦jq⁩ غير موجودة. ثبّتها بنفسك (على macOS: ⁦brew install jq⁩، وعلى Windows: ⁦winget install jqlang.jq⁩، وعلى Linux: ⁦sudo apt install jq⁩) ثم أغلق ⁦Claude Code⁩ وافتحه من جديد.'),
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
    t('It is slow, or uses too much of my Claude allowance, for small edits.', 'الإضافة بطيئة، أو تستهلك كثيرا من رصيدي في ⁦Claude⁩، في التعديلات الصغيرة.'),
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
    t('Does it work on Windows?', 'هل تعمل الإضافة على Windows؟'),
    t('The safety checks were built and tested on macOS. On Windows they may not work fully. If every command is refused, see the first answer on this page.', 'بُنيت فحوص الأمان واختُبرت على ⁦macOS⁩. وقد لا تعمل على ⁦Windows⁩ كاملة. وإذا رُفضت كل الأوامر، فراجع أول إجابة في هذه الصفحة.'),
  ],
] as const
