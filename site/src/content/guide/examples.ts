import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

interface Recipe {
  want: Bilingual
  skills: string[]
}

/** Grouped wishes; what to type comes from each first skill's own page. */
export const recipes: { title: Bilingual; items: Recipe[] }[] = [
  {
    title: t('I want to build', 'أريد أن أبني'),
    items: [
      { want: t('A button, card or dialog', 'زراً أو بطاقة أو نافذة'), skills: ['create-component'] },
      { want: t('A form', 'نموذجاً'), skills: ['create-form'] },
      { want: t('A screen from Figma', 'شاشة من Figma'), skills: ['figma-match'] },
      { want: t('A list with a table', 'قائمة بجدول'), skills: ['dash-create-table', 'dash-create-filter-bar'] },
      { want: t('An admin page', 'صفحة إدارة'), skills: ['dash-create-route', 'dash-create-crud'] },
      { want: t('A website feature from an API', 'ميزة موقع من API'), skills: ['web-create-feature', 'web-create-route'] },
    ],
  },
  {
    title: t('I want to fix', 'أريد أن أصلح'),
    items: [
      { want: t('The same problem everywhere', 'المشكلة نفسها في كل مكان'), skills: ['fix-everywhere'] },
      { want: t('A slow page', 'صفحة بطيئة'), skills: ['performance'] },
      { want: t('A wrong share preview', 'معاينة مشاركة خاطئة'), skills: ['web-seo-page'] },
      { want: t('A flaky end-to-end test', 'اختباراً شاملاً متذبذباً'), skills: ['playwright-best-practices'] },
      { want: t('Messy code', 'شيفرة فوضوية'), skills: ['refactor', 'refactor-mode'] },
    ],
  },
  {
    title: t('I want to check', 'أريد أن أفحص'),
    items: [
      { want: t('That everything works', 'أن كل شيء يعمل'), skills: ['verify'] },
      { want: t('The code, by someone else', 'الشيفرة بعين أخرى'), skills: ['review'] },
      { want: t('The app in a real browser', 'التطبيق في متصفح حقيقي'), skills: ['live-check', 'dev'] },
      { want: t('Why the code does something', 'لماذا تفعل الشيفرة شيئاً'), skills: ['explain'] },
    ],
  },
  {
    title: t('I want to deliver', 'أريد أن أسلّم'),
    items: [
      { want: t('A whole ticket', 'تذكرة كاملة'), skills: ['task'] },
      { want: t('Save and push', 'الحفظ والرفع'), skills: ['commit-push'] },
      { want: t('A pull request link', 'رابط طلب الدمج'), skills: ['pr-link'] },
      { want: t('An update from main', 'تحديثاً من main'), skills: ['sync-main', 'branch-status'] },
      { want: t('A note for the backend team', 'ملاحظة لفريق الخادم'), skills: ['backend-request'] },
    ],
  },
]

export const exampleProjects: Record<string, Bilingual> = {
  'next-eslint': t('A fresh Next.js app after a real setup run: what was kept, dropped and rewritten.', 'تطبيق Next.js جديد بعد إعداد حقيقي: ما بقي وما حُذف وما عُدّل.'),
  'fullstack-site-admin': t('A site and an admin in one tree, each with its own scoped rules.', 'موقع وإدارة في مشروع واحد، لكلٍّ قواعد ضمن مجلداته.'),
  'refactor-legacy': t('A real audit of a messy project: findings by file and line, and the phases.', 'تدقيق حقيقي لمشروع فوضوي: ملاحظات بالملف والسطر والمراحل.'),
  'vite-pnpm-vitest': t('Vite with pnpm, Vitest, Prettier and oxlint.', 'Vite مع pnpm وVitest وPrettier وoxlint.'),
  'react-router-app-dir': t('React Router framework mode, with code in app/.', 'React Router بنمط إطار العمل والشيفرة في app/.'),
  'jest-eslint-prettier': t('An older stack: Jest, ESLint, Redux Toolkit and MUI.', 'تقنيات أقدم: Jest وESLint وRedux Toolkit وMUI.'),
  'pnpm-monorepo': t('A pnpm workspace with checks run inside each package.', 'مستودع pnpm بعدة حزم، تُفحص كل واحدة داخلها.'),
}
