import { t } from './text.ts'

/** What the kit is, in two thoughts. */
export const basics = {
  problem: t('The problem', 'المشكلة'),
  problemText: t(
    'A coding assistant can write React very fast. But it does not know your team: where files go, which components exist, what finished means, what must never be touched. So it guesses, and each session guesses differently.',
    'المساعد البرمجي يكتب React بسرعة كبيرة. بس ما يعرف فريقك: وين تنحط الملفات، شنو المكوّنات الموجودة، شنو يعني «خلص»، وشنو الأشياء الممنوع تنلمس. فيخمّن، وكل جلسة تخمّن بطريقة مختلفة.',
  ),
  answer: t('What the kit does about it', 'شنو تسوي العدّة'),
  answerText: t(
    'It gives the assistant three things: the knowledge of how to do each job, a team to check the work, and automatic checkpoints it cannot forget. You keep working in plain sentences.',
    'تعطي المساعد ثلاث أشياء: يعرف شلون يسوي كل شغلة، وفريق يفحص الشغل، ونقاط تفتيش تلقائية ما يقدر ينساها. وأنت تبقى تكتب بجمل عادية.',
  ),
}
