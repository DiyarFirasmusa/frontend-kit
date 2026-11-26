// The demo articles: what the lists, the cards, the head and the sitemap need, one entry per article. The
// paragraphs live in bodies/<slug>.ts and load only when an article page opens, so they stay out of the
// browser's entry chunk. Replace this file (and bodies/) with your CMS in articles.ts: nothing else reads it,
// except the e2e fixture, which needs one real slug.
import type { ArticleMeta } from './types';

export const ARTICLE_META: readonly ArticleMeta[] = [
  {
    slug: 'plan-your-first-quarter',
    date: '2026-09-14',
    readMinutes: 3,
    cover: '/images/news-plan.svg',
    text: {
      ar: {
        title: 'كيف تخطط لأول ثلاثة أشهر في عملك',
        summary: 'ثلاث خطوات بسيطة لتحويل الأفكار إلى خطة يمكن تنفيذها.',
        coverAlt: 'رسم بسيط لثلاث خطوات متتابعة',
      },
      en: {
        title: 'How to plan the first three months of your business',
        summary: 'Three simple steps to turn ideas into a plan you can carry out.',
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
        coverAlt: 'رسم بسيط لمجموعة تتعلم معاً',
      },
      en: {
        title: 'Team training: how to make learning last after the course',
        summary:
          'A course alone is not enough. Here is what we do so that what your team learned stays.',
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
        coverAlt: 'رسم بسيط لساعة وسماعة رأس',
      },
      en: {
        title: 'New support hours starting next month',
        summary: 'The support team will be available for two extra hours every day.',
        coverAlt: 'A simple drawing of a clock and a headset',
      },
    },
  },
];
