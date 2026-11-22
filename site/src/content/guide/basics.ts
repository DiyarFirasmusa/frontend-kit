import { t } from './text.ts'

/** What the kit is, in two thoughts. */
export const basics = {
  problem: t('The problem', 'المشكلة'),
  problemText: t(
    'Claude Code can write React very fast. But it does not know your team: where files go, which components exist, what finished means, what must never be touched. So it guesses, and each session guesses differently.',
    'يكتب Claude Code بـ React بسرعة كبيرة، لكنه لا يعرف فريقك: أين تُوضع الملفات، وأي المكوّنات موجودة، ومتى ينتهي العمل، وما الذي لا يُمسّ. فيخمّن، وكل جلسة تخمّن بشكل مختلف.',
  ),
  answer: t('What the kit does about it', 'ماذا تفعل العدّة'),
  answerText: t(
    'It gives Claude three things: the knowledge of how to do each job, a team to check the work, and automatic checkpoints it cannot forget. You keep working in plain sentences.',
    'تمنح Claude ثلاثة أشياء: معرفة طريقة كل عمل، وفريقاً يفحص العمل، ونقاط تفتيش آلية لا ينساها. وأنت تواصل العمل بجمل عادية.',
  ),
}
