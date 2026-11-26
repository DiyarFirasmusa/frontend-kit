// Mock articles. In a real project this comes from a CMS or an API read in the route loader; the shape
// (one slug shared by both languages, per-language text) is what the pages, the sitemap and the tests rely on.
import type { Locale } from '@/shared/lib/i18n/languages';

export type ArticleText = {
  title: string;
  summary: string;
  /** Paragraphs, in order. */
  body: string[];
  coverAlt: string;
};

export type Article = {
  /** English kebab-case, the same in both languages, stable once published. */
  slug: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  readMinutes: number;
  cover: string;
  text: Record<Locale, ArticleText>;
};

export const ARTICLES: readonly Article[] = [
  {
    slug: 'plan-your-first-quarter',
    date: '2026-09-14',
    readMinutes: 3,
    cover: '/images/news-plan.svg',
    text: {
      ar: {
        title: 'كيف تخطط لأول ثلاثة أشهر في عملك',
        summary: 'ثلاث خطوات بسيطة لتحويل الأفكار إلى خطة يمكن تنفيذها.',
        body: [
          'أغلب الأعمال الصغيرة لا تفشل لأن الفكرة سيئة، بل لأن الأسابيع الأولى تضيع بلا ترتيب. الحل أن تكتب خطة قصيرة تغطي ثلاثة أشهر فقط.',
          'الخطوة الأولى: اكتب هدفاً واحداً قابلاً للقياس، مثل عدد الزبائن الذين تريدهم. الخطوة الثانية: قسّم الهدف إلى أسابيع، وفي كل أسبوع مهمة واحدة واضحة.',
          'الخطوة الثالثة: خصّص ساعة كل أسبوع لمراجعة ما تم. إذا تأخرت مهمة، لا تلغِ الخطة، بل انقل المهمة للأسبوع الذي بعده.',
        ],
        coverAlt: 'رسم بسيط لثلاث خطوات متتابعة',
      },
      en: {
        title: 'How to plan the first three months of your business',
        summary: 'Three simple steps to turn ideas into a plan you can carry out.',
        body: [
          'Most small businesses do not fail because the idea is bad, but because the first weeks are lost without order. The fix is a short plan that covers only three months.',
          'Step one: write one measurable goal, such as the number of customers you want. Step two: split the goal into weeks, with one clear task in each week.',
          'Step three: set aside an hour every week to review what was done. If a task slips, do not cancel the plan; move the task to the following week.',
        ],
        coverAlt: 'A simple drawing of three steps in a row',
      },
    },
  },
  {
    slug: 'training-that-sticks',
    date: '2026-10-02',
    readMinutes: 4,
    cover: '/images/news-training.svg',
    text: {
      ar: {
        title: 'تدريب الفريق: كيف نجعل التعلّم يستمر بعد الدورة',
        summary: 'الدورة وحدها لا تكفي. إليك ما نفعله لكي يبقى ما تعلّمه فريقك.',
        body: [
          'بعد أسبوعين من أي دورة ينسى الناس أغلب ما سمعوه. لذلك نبني كل دورة حول مهمة حقيقية من عملكم، وليس حول شرائح عرض.',
          'نترك لكل مشارك ورقة من صفحة واحدة تلخّص الخطوات، ونحدد موعداً بعد شهر للمتابعة والإجابة عن الأسئلة التي ظهرت أثناء التطبيق.',
        ],
        coverAlt: 'رسم بسيط لمجموعة تتعلم معاً',
      },
      en: {
        title: 'Team training: how to make learning last after the course',
        summary:
          'A course alone is not enough. Here is what we do so that what your team learned stays.',
        body: [
          'Two weeks after any course, people forget most of what they heard. That is why we build every course around a real task from your own work, not around presentation slides.',
          'We leave every participant a one-page sheet that sums up the steps, and we set a date a month later to follow up and answer the questions that came up while applying it.',
        ],
        coverAlt: 'A simple drawing of a group learning together',
      },
    },
  },
  {
    slug: 'new-support-hours',
    date: '2026-11-05',
    readMinutes: 1,
    cover: '/images/news-support.svg',
    text: {
      ar: {
        title: 'ساعات دعم جديدة تبدأ من الشهر القادم',
        summary: 'سيكون فريق الدعم متاحاً ساعتين إضافيتين كل يوم.',
        body: [
          'استجابة لطلبات كثير من الزبائن، سيعمل فريق الدعم ساعتين إضافيتين كل يوم من الأحد إلى الخميس، ليصبح الدوام من التاسعة صباحاً إلى السادسة مساءً.',
          'هذا خبر تجريبي لموقع افتراضي، والتواريخ والتفاصيل فيه وهمية.',
        ],
        coverAlt: 'رسم بسيط لساعة وسماعة رأس',
      },
      en: {
        title: 'New support hours starting next month',
        summary: 'The support team will be available for two extra hours every day.',
        body: [
          'In response to many customer requests, the support team will work two extra hours every day from Sunday to Thursday, so the day runs from 9 am to 6 pm.',
          'This is a demo news item for a fictional site; the dates and details in it are made up.',
        ],
        coverAlt: 'A simple drawing of a clock and a headset',
      },
    },
  },
];

export function findArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

/** Newest first. */
export function sortedArticles(): Article[] {
  return ARTICLES.toSorted((a, b) => b.date.localeCompare(a.date));
}
