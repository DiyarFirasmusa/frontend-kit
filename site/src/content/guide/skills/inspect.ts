import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const inspect: Record<string, SkillGuide> = {
  verify: {
    plain: t('Runs every check of your project in one go and shows the real results.', 'يشغل كل فحوص مشروعك دفعة واحدة ويعرض النتائج الفعلية.'),
    ask: [t('run all checks', 'شغّل كل الفحوص'), t('is it working? verify before we save a version', 'هل يعمل؟ تحقق قبل أن نحفظ نسخة')],
    steps: [
      t('Checks the code for mistakes (typecheck), for style problems (lint) and for formatting.', 'يفحص الكود بحثا عن أخطاء (typecheck) ومشكلات في الأسلوب (lint) وفي التنسيق.'),
      t('Runs the unit tests (small automatic checks of single pieces), and the translation check when translations changed.', 'يشغل اختبارات الوحدة (فحوص تلقائية صغيرة لكل جزء على حدة)، وفحص الترجمة إذا تغيرت الترجمات.'),
      t('Runs end-to-end tests (a robot that uses your app like a person) when a flow changed, then builds the app.', 'يشغل اختبارات end-to-end (روبوت يستخدم تطبيقك كما يفعل الإنسان) إذا تغير مسار، ثم يبني التطبيق.'),
      t('Stops at a failure, fixes the cause and runs again.', 'يتوقف عند أي فشل، ويصلح السبب ويعيد التشغيل.'),
    ],
    result: [t('A table of real results', 'جدول بالنتائج الفعلية'), t('A record that the check before saving a version reads', 'سجل يقرأه الفحص الذي يسبق حفظ النسخة')],
    limits: [t('A check your project does not have is reported as missing, never counted as passed.', 'إذا كان في مشروعك فحص ناقص، يذكره في التقرير ولا يحسبه ناجحا أبدا.')],
    related: ['review', 'commit-push'],
  },
  review: {
    plain: t('A second pair of eyes on your branch. It asks two questions: is this good work, and is it what you asked for?', 'عينان ثانيتان على فرعك. يسأل سؤالين: هل العمل جيد؟ وهل هو ما طلبته؟'),
    ask: [t('review the code before we save a version', 'راجع الكود قبل الحفظ'), t('review it with a separate specialist against this ticket', 'راجعه بمختص منفصل وقارنه بهذه التذكرة')],
    steps: [
      t('Pins down the exact changes of the branch.', 'يحدد تغييرات الفرع بدقة.'),
      t('Finds your request or ticket (the written description of the task).', 'يجد طلبك أو التذكرة (الوصف المكتوب للمهمة).'),
      t('Starts two fresh reviewers: one for the standards, one for your request.', 'يشغل مراجعا جديدا للمعايير، ومراجعا جديدا لطلبك.'),
      t('Adds a specialist for security, translation, SEO or accessibility when the change touches that.', 'يضيف مختصا بالأمان أو الترجمة أو SEO أو سهولة الوصول، إذا كان التغيير يمس ذلك.'),
      t('Shows the two reports separately and asks whether to fix.', 'يعرض كل تقرير على حدة، ويسألك هل يصلح.'),
    ],
    result: [t('Findings with the file, the line and the rule', 'ملاحظات مع الملف والسطر والقاعدة')],
    limits: [t('Never edits, picks files for saving, or saves.', 'لا يعدل ولا يجهز الملفات للحفظ ولا يحفظ.')],
    related: ['verify', 'performance'],
  },
  'live-check': {
    plain: t('The assistant uses your app in a real browser, like a person would, on your own computer or on a test server.', 'يستخدم المساعد تطبيقك في متصفح حقيقي كما يفعل الإنسان، على جهازك أو على خادم تجريبي.'),
    ask: [t('check it in Chrome as a real user', 'افحصه في Chrome كأنك مستخدم حقيقي'), t('try the one-time-code sign-in (OTP) in the browser', 'جرّب تسجيل الدخول برمز التحقق (OTP) في المتصفح')],
    steps: [
      t('Opens the app on your computer or the test version.', 'يفتح التطبيق على جهازك أو النسخة التجريبية.'),
      t('Asks you to sign in when needed.', 'يطلب منك تسجيل الدخول عند الحاجة.'),
      t('Walks through the flow in both languages, on different screen sizes and in light and dark.', 'يمر على المسار بكل لغة، وعلى أحجام شاشات مختلفة، وبالمظهر الفاتح والداكن.'),
      t('Reports the steps, the console errors (messages the browser hides from visitors) and the requests that failed.', 'يذكر الخطوات وأخطاء الـ console (رسائل يخفيها المتصفح عن الزوار) والطلبات الفاشلة.'),
    ],
    result: [t('Pass or fail per step, with screenshots', 'نجاح أو فشل لكل خطوة، مع لقطات شاشة')],
    limits: [t('Does not type your password, and tests only on your computer or the test environment. The safety checks refuse the live hosts you list in the settings.', 'لا يكتب كلمة مرورك، ويختبر على جهازك أو في بيئة الاختبار فقط. وترفض فحوص الأمان المواقع الحية التي تحددها في الإعدادات.')],
    related: ['dev', 'figma-match'],
    needs: t('A browser tool: Claude in Chrome or the optional Chrome DevTools server (setup asks once).', 'أداة متصفح: ⁦Claude in Chrome⁩ أو خادم Chrome DevTools الاختياري (يسألك الإعداد مرة).'),
  },
  performance: {
    plain: t('Makes your app faster on ordinary phones and slow connections. It measures first, so it fixes what is really slow.', 'يجعل تطبيقك أسرع على الجوالات العادية والاتصالات البطيئة. يبدأ بالقياس، فيصلح ما هو بطيء فعلا.'),
    ask: [t('this page is slow on phones', 'هذه الصفحة بطيئة على الجوال'), t('fix the layout shift and improve Lighthouse', 'أصلح تحرك التخطيط وحسن نتيجة Lighthouse')],
    steps: [
      t('Measures against fixed limits: LCP (when the main content shows) under 2.5 s, INP (how fast it reacts to a tap) under 200 ms, CLS (how much the page jumps while loading) under 0.1.', 'يقيس مقابل حدود ثابتة: LCP (متى يظهر المحتوى الرئيسي) أقل من 2.5 ثانية، وINP (سرعة الاستجابة للمسة) أقل من 200ms، وCLS (مقدار قفز الصفحة أثناء التحميل) أقل من 0.1.'),
      t('Fixes only what the numbers point at: loading, images, fonts, data or drawing the page.', 'يصلح فقط ما تدل عليه الأرقام: التحميل أو الصور أو الخطوط أو البيانات أو رسم الصفحة.'),
      t('Measures again.', 'يقيس مرة أخرى.'),
      t('For a React change, it can also check a short list of React speed rules: requests that wait for each other, needless redrawing and a heavy bundle (the code sent to the browser).', 'وفي تغيير على ⁦React⁩ يستطيع أيضا أن يفحص قائمة قصيرة من قواعد سرعة ⁦React⁩: طلبات ينتظر بعضها بعضا، وإعادة رسم بلا حاجة، وحزمة ثقيلة (الكود المرسل إلى المتصفح).'),
    ],
    result: [t('Before and after numbers for each change', 'أرقام قبل التعديل وبعده لكل تغيير')],
    limits: [t('Does not stress-test your live site (sending it lots of traffic): tests only on your computer or the test environment. The safety checks refuse the live hosts you list in the settings.', 'لا يجري اختبار ضغط على موقعك الحي (أي إرسال حركة كثيفة إليه)، ويختبر على جهازك أو في بيئة الاختبار فقط. وترفض فحوص الأمان المواقع الحية التي تحددها في الإعدادات.')],
    related: ['review', 'web-seo-page'],
  },
  'playwright-best-practices': {
    plain: t('A guide for writing end-to-end tests (a robot that uses your app like a person) that do not fail at random.', 'دليل لكتابة اختبارات end-to-end (روبوت يستخدم تطبيقك كما يفعل الإنسان) لا تفشل عشوائيا.'),
    ask: [t('write a Playwright test for checkout', 'اكتب اختبار Playwright للدفع'), t('this test sometimes passes and sometimes fails', 'هذا الاختبار ينجح أحيانا ويفشل أحيانا')],
    steps: [
      t('Opens the guide for the job: writing, fixing, faking data (mocking), signing in, or running on a server (CI).', 'يفتح الدليل المناسب للمهمة: الكتابة أو التصحيح أو محاكاة البيانات (mocking) أو تسجيل الدخول أو التشغيل على خادم (CI).'),
      t('Uses stable ways to find things on the page, and proper waiting.', 'يستخدم طرقا ثابتة للعثور على العناصر في الصفحة، وانتظارا مضبوطا.'),
      t('Runs the test to prove it works.', 'يشغل الاختبار ليثبت أنه يعمل.'),
    ],
    result: [t('Stable end-to-end tests', 'اختبارات end-to-end مستقرة')],
    limits: [t('A guide from another company. Your project’s own testing rule comes first.', 'دليل من جهة أخرى. وقاعدة الاختبار في مشروعك أهم منه.')],
    related: ['verify'],
  },
}
