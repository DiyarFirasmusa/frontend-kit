import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

interface Recipe {
  want: Bilingual
  skills: string[]
}

/** Grouped wishes; what to type comes from each first skill's own page. */
export const recipes: { title: Bilingual; items: Recipe[] }[] = [
  {
    title: t('I want to build', 'أريد أبني'),
    items: [
      { want: t('A button, card or dialog', 'زر، كارت، أو نافذة'), skills: ['create-component'] },
      { want: t('A form', 'فورم'), skills: ['create-form'] },
      { want: t('A screen from Figma', 'شاشة من Figma'), skills: ['figma-match'] },
      { want: t('A list with a table', 'قائمة بجدول'), skills: ['dash-create-table', 'dash-create-filter-bar'] },
      { want: t('An admin page', 'صفحة إدارة'), skills: ['dash-create-route', 'dash-create-crud'] },
      { want: t('A website feature from an API', 'ميزة للموقع من API'), skills: ['web-create-feature', 'web-create-route'] },
    ],
  },
  {
    title: t('I want to fix', 'أريد أصلّح'),
    items: [
      { want: t('The same problem everywhere', 'نفس المشكلة بكل مكان'), skills: ['fix-everywhere'] },
      { want: t('A slow page', 'صفحة بطيئة'), skills: ['performance'] },
      { want: t('A wrong share preview', 'معاينة مشاركة غلط'), skills: ['web-seo-page'] },
      { want: t('A flaky end-to-end test', 'اختبار end-to-end مرة ينجح ومرة يفشل'), skills: ['playwright-best-practices'] },
      { want: t('Messy code', 'كود فوضوي'), skills: ['refactor', 'refactor-mode'] },
    ],
  },
  {
    title: t('I want to check', 'أريد أفحص'),
    items: [
      { want: t('That everything works', 'إن كل شي يشتغل'), skills: ['verify'] },
      { want: t('The code, by someone else', 'الكود بعين ثانية'), skills: ['review'] },
      { want: t('The app in a real browser', 'التطبيق بمتصفح حقيقي'), skills: ['live-check', 'dev'] },
      { want: t('Why the code does something', 'ليش الكود يسوي شي معيّن'), skills: ['explain'] },
    ],
  },
  {
    title: t('I want to deliver', 'أريد أسلّم'),
    items: [
      { want: t('A whole ticket', 'تذكرة كاملة'), skills: ['task'] },
      { want: t('Save and push', 'الحفظ والرفع'), skills: ['commit-push'] },
      { want: t('A pull request link', 'رابط الـ pull request'), skills: ['pr-link'] },
      { want: t('An update from main', 'تحديث من main'), skills: ['sync-main', 'branch-status'] },
      { want: t('A note for the backend team', 'ملاحظة لفريق الباك إند'), skills: ['backend-request'] },
    ],
  },
]

export const exampleProjects: Record<string, Bilingual> = {
  'next-eslint': t('A fresh Next.js app after a real setup run: what was kept, dropped and rewritten.', 'تطبيق Next.js جديد بعد إعداد حقيقي: شنو بقى، شنو انشال، وشنو انكتب من جديد.'),
  'fullstack-site-admin': t('A site and an admin in one tree, each with its own scoped rules.', 'موقع وإدارة بمشروع واحد، وكل واحد إله قواعده بمجلداته.'),
  'refactor-legacy': t('A real audit of a messy project: findings by file and line, and the phases.', 'تدقيق حقيقي لمشروع فوضوي: الملاحظات بالملف والسطر، والمراحل.'),
  'vite-pnpm-vitest': t('Vite with pnpm, Vitest, Prettier and oxlint.', 'Vite مع pnpm وVitest وPrettier وoxlint.'),
  'react-router-app-dir': t('React Router framework mode, with code in app/.', 'React Router بنمط الفريموورك، والكود بـ app/.'),
  'jest-eslint-prettier': t('An older stack: Jest, ESLint, Redux Toolkit and MUI.', 'تقنيات أقدم شوية: Jest وESLint وRedux Toolkit وMUI.'),
  'pnpm-monorepo': t('A pnpm workspace with checks run inside each package.', 'مستودع pnpm بيه كذا حزمة، وكل وحدة تنفحص من داخلها.'),
}
