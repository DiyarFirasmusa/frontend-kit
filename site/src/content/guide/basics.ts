import { t } from './text.ts'

/** What the kit is, in two thoughts. */
export const basics = {
  problem: t('The problem', 'المشكلة'),
  problemText: t(
    'A coding assistant can write React very fast. But it does not know your team: where files go, which components exist, what finished means, what must never be touched. So it guesses, and each session guesses differently.',
    'يكتب المساعد البرمجي React بسرعة كبيرة. لكنه لا يعرف فريقك: أين تضع الملفات، وما المكونات الموجودة، وماذا يعني «انتهى»، وما الذي لا يجوز لمسه. فيخمن، وتخمن كل جلسة بطريقة مختلفة.',
  ),
  answer: t('What the kit does about it', 'ماذا تفعل الإضافة'),
  answerText: t(
    'It gives the assistant three things: the knowledge of how to do each job, a team to check the work, and automatic checkpoints it cannot forget. You keep working in plain sentences.',
    'تعطي المساعد ثلاثة أشياء: معرفة بطريقة تنفيذ كل مهمة، وفريقا يراجع العمل، ونقاط فحص تلقائية لا يستطيع نسيانها. وتبقى أنت تكتب بجمل عادية.',
  ),
}
