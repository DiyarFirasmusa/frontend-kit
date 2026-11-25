import type { PageId } from './pages.ts'

/** Words people type that are not in a page's name: the search finds the page by them, in either language. */
export const KEYWORDS: Record<PageId, string> = {
  docs: 'guide start home دليل ابدأ',
  guide: 'what is it overview about ما هي نظرة عامة تعريف',
  'get-started': 'install update upgrade remove uninstall delete windows mac jq node git download start تثبيت ثبّت تحديث حدّث ترقية إزالة حذف ويندوز ماك تنزيل ابدأ بدء',
  'project-types': 'website dashboard shop store blog portfolio موقع لوحة تحكم متجر مدونة معرض أعمال أنواع',
  examples: 'say prompt example create build form table page أمثلة أقول اكتب أنشئ إنشاء انشاء بناء نموذج جدول صفحة',
  questions: 'not working broken help refused powershell fail failed faq free cost price money safe data privacy windows phone publish online stuck problem error fix jq مساعدة كيف أبدأ فشل لا يعمل أسئلة مجاني تكلفة سعر أمان خصوصية ويندوز هاتف نشر مشكلة خطأ إصلاح تعطل',
  changelog: 'versions release history what changed تغييرات إصدارات سجل جديد',
  skills: 'skill commands slash مهارات أوامر',
  agents: 'specialist agent reviewer tester مختص مختصون مراجع مختبر وكيل',
  rules: 'rule standard قواعد معايير',
  checks: 'safety check hook guard security أمان فحص حماية خطافات',
  features: 'everything features list مميزات كل شيء',
  modes: 'mode freeze hotfix readonly أنماط تجميد إصلاح عاجل',
  configuration: 'settings config json wajiha-kit.json إعدادات تهيئة',
  refactor: 'refactor clean old messy legacy إصلاح قديم فوضوي تنظيف',
  licence: 'license licence mit rights copyright credits الرخصة ترخيص حقوق',
  privacy: 'privacy data cookies analytics tracking خصوصية بيانات كوكيز تتبع',
  terms: 'terms use warranty liability شروط استخدام ضمان مسؤولية',
}
