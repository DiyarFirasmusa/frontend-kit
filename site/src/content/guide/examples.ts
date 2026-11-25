import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

interface Recipe {
  want: Bilingual
  /** The sentence you type, in plain words. */
  say: Bilingual
  skills: string[]
}

/** Grouped wishes. The sentence is what you type; the skills are what answers it. */
export const recipes: { title: Bilingual; items: Recipe[] }[] = [
  {
    title: t('Add something new', 'أضف شيئا جديدا'),
    items: [
      { want: t('A button, a card or a pop-up window', 'زر، أو بطاقة، أو نافذة منبثقة'), say: t('add a Save button that asks “are you sure?” before it saves', 'أضف زر حفظ يسأل «هل أنت متأكد؟» قبل أن يحفظ'), skills: ['create-component'] },
      { want: t('A form', 'نموذج'), say: t('add a form where a customer can write to me', 'أضف نموذجا يستطيع العميل أن يكتب لي منه'), skills: ['create-form'] },
      { want: t('A screen from my design', 'شاشة من تصميمي'), say: t('build this screen from my Figma link', 'ابن هذه الشاشة من رابط ⁦Figma⁩ الخاص بي'), skills: ['figma-match'] },
      { want: t('A table of my data', 'جدول لبياناتي'), say: t('show my orders in a table I can search and filter', 'اعرض طلباتي في جدول أستطيع البحث فيه وتصفيته'), skills: ['dash-create-table', 'dash-create-filter-bar'] },
      { want: t('A new page in my dashboard', 'صفحة جديدة في لوحة التحكم'), say: t('add a customers page where I can list, add and edit customers', 'أضف صفحة عملاء أستطيع أن أعرض فيها العملاء وأضيفهم وأعدلهم'), skills: ['dash-create-route', 'dash-create-crud'] },
      { want: t('A new part of my website', 'جزء جديد في موقعي'), say: t('add a page that shows my products from my backend', 'أضف صفحة تعرض منتجاتي من الـ backend الخاص بي'), skills: ['web-create-feature', 'web-create-route'] },
    ],
  },
  {
    title: t('Change something', 'غيّر شيئا'),
    items: [
      { want: t('The colours and fonts', 'الألوان والخطوط'), say: t('change the colours to green and white', 'غيّر الألوان إلى الأخضر والأبيض'), skills: ['frontend-design'] },
      { want: t('Another language', 'لغة أخرى'), say: t('make it work in Arabic, from right to left', 'اجعله يعمل بالعربية، من اليمين إلى اليسار'), skills: ['i18n-conventions'] },
      { want: t('A slow page', 'صفحة بطيئة'), say: t('the products page is slow, make it faster', 'صفحة المنتجات بطيئة، اجعلها أسرع'), skills: ['performance'] },
      { want: t('The same problem everywhere', 'المشكلة نفسها في كل مكان'), say: t('dates show in the wrong order on every page, fix it everywhere', 'التواريخ تظهر بترتيب خاطئ في كل صفحة، أصلح ذلك في كل مكان'), skills: ['fix-everywhere'] },
      { want: t('A wrong picture when I share a link', 'صورة خاطئة عند مشاركة رابط'), say: t('when I share the home page link, the picture is wrong, fix it', 'عندما أشارك رابط الصفحة الرئيسية تظهر صورة خاطئة، أصلح ذلك'), skills: ['web-seo-page'] },
      { want: t('A check that sometimes fails', 'فحص ينجح أحيانا ويفشل أحيانا'), say: t('one browser check fails now and then, find out why and make it steady', 'فحص في المتصفح يفشل بين حين وآخر، اعرف السبب واجعله ثابتا'), skills: ['playwright-best-practices'] },
      { want: t('Messy code', 'كود فوضوي'), say: t('this folder is messy, tidy it without changing how it works', 'هذا المجلد فوضوي، رتّبه دون أن تغير طريقة عمله'), skills: ['refactor', 'refactor-mode'] },
    ],
  },
  {
    title: t('Check my work', 'افحص عملي'),
    items: [
      { want: t('That everything works', 'أن كل شيء يعمل'), say: t('check that everything still works', 'تأكد أن كل شيء ما زال يعمل'), skills: ['verify'] },
      { want: t('My changes, looked at by someone else', 'تغييراتي، بعين شخص آخر'), say: t('review what I changed, like a careful colleague would', 'راجع ما غيّرته، كما يفعل زميل دقيق'), skills: ['review'] },
      { want: t('The page, in a real browser', 'الصفحة، في متصفح حقيقي'), say: t('open the page, click through it and tell me what is broken', 'افتح الصفحة وجرّبها بالنقر، وأخبرني بما هو معطل'), skills: ['live-check', 'dev'] },
      { want: t('Why something works the way it does', 'لماذا يعمل شيء بهذه الطريقة'), say: t('explain what this page does, in simple words', 'اشرح ما تفعله هذه الصفحة بكلمات بسيطة'), skills: ['explain'] },
    ],
  },
  {
    title: t('Share my work', 'شارك عملي'),
    items: [
      { want: t('A whole job, start to finish', 'مهمة كاملة، من أولها إلى آخرها'), say: t('add a search box to the orders page, from start to finish', 'أضف مربع بحث إلى صفحة الطلبات، من البداية إلى النهاية'), skills: ['task'] },
      { want: t('Save a version and upload it', 'حفظ نسخة ورفعها'), say: t('save a version of my work and upload it', 'احفظ نسخة من عملي وارفعها'), skills: ['commit-push'] },
      { want: t('A request to merge my changes', 'طلب لدمج تغييراتي'), say: t('give me the link to ask for my changes to be merged', 'أعطني رابط طلب دمج تغييراتي'), skills: ['pr-link'] },
      { want: t('The latest changes from my team', 'آخر تغييرات فريقي'), say: t('bring in the latest changes from the main version', 'أدخل آخر التغييرات من النسخة الرئيسية'), skills: ['sync-main', 'branch-status'] },
      { want: t('A note for the backend team', 'ملاحظة لفريق الـ backend'), say: t('write a note to the backend team: I need the order date in the orders list', 'اكتب ملاحظة لفريق الـ backend: أحتاج تاريخ الطلب في قائمة الطلبات'), skills: ['backend-request'] },
    ],
  },
]

export const exampleProjects: Record<string, Bilingual> = {
  'next-eslint': t('A fresh app made with Next.js, after a real setup run: what the kit kept, removed and rewrote.', 'تطبيق جديد مبني بـ Next.js بعد تشغيل الإعداد عليه فعلا: ما أبقته الإضافة وما حذفته وما أعادت كتابته.'),
  'fullstack-site-admin': t('A website and a dashboard in one project, each with its own rules.', 'موقع ولوحة تحكم في مشروع واحد، ولكل منهما قواعده الخاصة.'),
  'refactor-legacy': t('A real check of a messy old project: what was found, file by file, and the steps to fix it.', 'فحص حقيقي لمشروع قديم فوضوي: ما وُجد فيه ملفا ملفا، وخطوات إصلاحه.'),
  'vite-pnpm-vitest': t('An app made with Vite, with pnpm, Vitest, Prettier and oxlint already in place.', 'تطبيق مبني بـ Vite، وفيه pnpm وVitest وPrettier وoxlint.'),
  'react-router-app-dir': t('An app made with React Router, with its code in the app folder.', 'تطبيق مبني بـ React Router، وكوده في مجلد app.'),
  'jest-eslint-prettier': t('An older project with older tools: Jest, ESLint, Redux Toolkit and MUI.', 'مشروع أقدم بأدوات أقدم: Jest وESLint وRedux Toolkit وMUI.'),
  'pnpm-monorepo': t('One folder that holds several apps, with the checks run inside each one.', 'مجلد واحد فيه عدة تطبيقات، وتعمل الفحوص داخل كل واحد منها.'),
}
