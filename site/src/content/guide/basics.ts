import { t } from './text.ts'

/** What the kit is, what you do, what you get. */
export const basics = {
  problem: t('The problem', 'المشكلة'),
  problemText: t(
    'You want your own website or dashboard. But the part people see, with its pages, tables and buttons, is a craft of its own. If you have never done it, you do not know where to start. An AI assistant can write that code. But it guesses, and each session guesses differently.',
    'تريد موقعا أو لوحة تحكم خاصة بك. لكن الجزء الذي يراه الناس، بصفحاته وجداوله وأزراره، حرفة قائمة بذاتها. وإذا لم تعمل فيها من قبل، فلا تعرف من أين تبدأ. يستطيع مساعد الذكاء الاصطناعي أن يكتب هذا الكود. لكنه يخمن، وتخمن كل جلسة بطريقة مختلفة.',
  ),
  answer: t('What the kit does about it', 'ماذا تفعل الإضافة'),
  answerText: t(
    'Wajiha Kit is an add-on for Claude Code, an AI assistant that works inside your project folder. You answer a few plain questions. The kit builds a complete, tidy project with a fixed setup that is already proven. You never choose libraries. Then it checks the result before you see it.',
    'واجهة إضافة تعمل داخل ⁦Claude Code⁩، وهو مساعد ذكاء اصطناعي يعمل داخل مجلد مشروعك. تجيب عن بضعة أسئلة بسيطة، فتبني الإضافة مشروعا كاملا ومرتبا بإعداد ثابت مجرب. ولا تختار أنت أي مكتبة. ثم تفحص النتيجة قبل أن تراها.',
  ),
  youDo: t('What you do', 'ماذا تفعل أنت'),
  youDoLead: t('Five steps, and you never need to know the technical words.', 'خمس خطوات، ولا تحتاج أن تعرف الكلمات التقنية.'),
  steps: [
    {
      title: t('Install it', 'ثبّتها'),
      text: t('Open the Claude app and send Claude one message: it installs the kit for you. The Get started page has the message.', 'افتح تطبيق ⁦Claude⁩ وأرسل له رسالة واحدة، فيثبت الإضافة بنفسه. تجد الرسالة في صفحة «ابدأ».'),
    },
    {
      title: t('Start a new project', 'ابدأ مشروعا جديدا'),
      text: t('Right after the install, in the same chat, Claude asks what you are doing. Choose “new project”.', 'بعد التثبيت مباشرة، وفي المحادثة نفسها، يسألك ⁦Claude⁩ ماذا تفعل. اختر «مشروع جديد».'),
    },
    {
      title: t('Answer a few questions', 'أجب عن بضعة أسئلة'),
      text: t(
        'What are you building: a dashboard, a website, or both? Tell it about your project, in your own words: what it contains and what people can do in it. Send your design, or a picture or link of a style you like. Send the link that describes your backend, if you have one. Pick Arabic, English or both.',
        'ماذا تبني: لوحة تحكم أو موقعا أو الاثنين؟ حدثها عن مشروعك بكلماتك: ماذا يحتوي وماذا يستطيع الناس أن يفعلوا فيه. أرسل تصميمك، أو صورة أو رابطا لأسلوب يعجبك. أرسل رابط وصف خادمك الخلفي إن كان عندك.واختر العربية أو الإنجليزية أو الاثنتين.',
      ),
    },
    {
      title: t('Say yes to the summary', 'وافق على الملخص'),
      text: t('The kit shows a short summary in plain words and asks: shall I start?', 'تعرض الإضافة ملخصا قصيرا بكلمات بسيطة وتسأل: هل أبدأ؟'),
    },
    {
      title: t('Keep asking in plain sentences', 'تابع الطلب بجمل عادية'),
      text: t('Your project is built and checked. Later you write things like “add a customers page” or “make it faster”.', 'يُبنى مشروعك ويُفحص. وبعد ذلك تكتب أشياء مثل «أضف صفحة للعملاء» أو «اجعله أسرع».'),
    },
  ],
  youGet: t('What you get', 'ماذا تحصل عليه'),
  youGetLead: t('Not a sketch, but a project you can keep building on.', 'ليس مجرد رسم أولي، بل مشروع تكمل البناء عليه.'),
  gets: [
    t('A complete project with the pages you described, in a tidy structure that is easy to grow.', 'مشروع كامل فيه الصفحات التي وصفتها، ببنية مرتبة يسهل أن تكبر.'),
    t('Your design: its colours, fonts and general feel, or a style you chose.', 'تصميمك: ألوانه وخطوطه وشكله العام، أو أسلوب اخترته.'),
    t('Arabic, English or both, with right-to-left (Arabic) layout done properly.', 'العربية أو الإنجليزية أو الاثنتان، مع اتجاه الكتابة من اليمين إلى اليسار مضبوطا.'),
    t('Light and dark mode, and sign-in and permissions when your project needs them.', 'الوضع الفاتح والداكن، وتسجيل الدخول والصلاحيات إذا احتاجها مشروعك.'),
    t('Safety checks that run by themselves, so mistakes are caught before you see them.', 'فحوص أمان تعمل من تلقاء نفسها، فتُكتشف الأخطاء قبل أن تراها.'),
  ],
  expect: t('What to expect', 'ما الذي تتوقعه'),
  expectText: t(
    'It is a helper, not magic. You still look at the result and approve it. Putting your project online comes later, as a separate step.',
    'هي مساعد وليست سحرا. تبقى أنت من ينظر إلى النتيجة ويوافق عليها. ونشر مشروعك على الإنترنت يأتي لاحقا، كخطوة منفصلة.',
  ),
}
