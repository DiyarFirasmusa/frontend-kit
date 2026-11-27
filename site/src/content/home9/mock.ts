import { t } from '../guide/text.ts'

/** The words inside the detailed drawings of "What can you build": a made-up soap shop, its dashboard, and both. */
export const mockWords = {
  shop: t('Rif Soap', 'صابون الريف'),
  nav: [t('Shop', 'المتجر'), t('Our story', 'قصتنا'), t('Contact', 'تواصل')],
  tag: t('Handmade', 'صناعة يدوية'),
  headline: t('Natural soap from olive oil', 'صابون طبيعي من زيت الزيتون'),
  sub: t('Made in small batches, sent to your door.', 'يُصنع بكميات صغيرة ويصل إلى بابك.'),
  shopNow: t('Shop now', 'تسوق الآن'),
  story: t('Our story', 'قصتنا'),
  products: [t('Lavender', 'لافندر'), t('Honey & oat', 'عسل وشوفان'), t('Charcoal', 'فحم')],
  add: t('Add to cart', 'أضف إلى السلة'),
  added: t('Added to cart', 'أضيف إلى السلة'),

  hello: t('Good morning, Layla', 'صباح الخير، ليلى'),
  search: t('Search orders…', 'ابحث في الطلبات…'),
  side: [t('Home', 'الرئيسية'), t('Orders', 'الطلبات'), t('Customers', 'العملاء'), t('Products', 'المنتجات'), t('Settings', 'الإعدادات')],
  kpis: [
    { label: t('Orders today', 'طلبات اليوم'), value: '128', trend: '+12%' },
    { label: t('Being prepared', 'قيد التجهيز'), value: '14', trend: '−3' },
    { label: t('Delivered', 'تم التسليم'), value: '96%', trend: '+2%' },
    { label: t('New customers', 'عملاء جدد'), value: '23', trend: '+5' },
  ],
  chartTitle: t('Orders this week', 'طلبات هذا الأسبوع'),
  week: [t('Sat', 'سبت'), t('Sun', 'أحد'), t('Mon', 'إثنين'), t('Tue', 'ثلاثاء'), t('Wed', 'أربعاء'), t('Thu', 'خميس'), t('Fri', 'جمعة')],
  latest: t('Latest orders', 'أحدث الطلبات'),
  rows: [
    { id: '#1042', who: t('Sara', 'سارة'), what: t('3 items', '3 قطع'), state: t('Delivered', 'تم التسليم'), tone: 'ok' },
    { id: '#1041', who: t('Ali', 'علي'), what: t('1 item', 'قطعة واحدة'), state: t('Preparing', 'قيد التجهيز'), tone: 'wait' },
    { id: '#1040', who: t('Noor', 'نور'), what: t('5 items', '5 قطع'), state: t('Delivered', 'تم التسليم'), tone: 'ok' },
  ],

  editTitle: t('Edit product', 'تعديل منتج'),
  nameLabel: t('Name', 'الاسم'),
  newName: t('Lavender & mint', 'لافندر ونعناع'),
  descLabel: t('Description', 'الوصف'),
  photoLabel: t('Photos', 'الصور'),
  inStock: t('In stock', 'متوفر'),
  save: t('Save', 'حفظ'),
  saved: t('Saved', 'حُفظ'),
  live: t('Shows on the site at once', 'يظهر في الموقع فورا'),
}
