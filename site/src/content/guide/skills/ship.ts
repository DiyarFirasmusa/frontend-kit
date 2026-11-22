import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const ship: Record<string, SkillGuide> = {
  'branch-status': {
    plain: t('Where the branch stands, at a glance.', 'وضع الفرع بنظرة واحدة.'),
    ask: [t('which branch, is it pushed?', 'أي فرع، وهل رُفع؟'), t('what is left to commit', 'ما الذي بقي للحفظ')],
    steps: [
      t('Reads branch, base, ahead and behind.', 'يقرأ الفرع وأساسه والتقدم والتأخر.'),
      t('Lists unpushed and uncommitted work.', 'يعرض ما لم يُرفع وما لم يُحفظ.'),
      t('Suggests the next step.', 'يقترح الخطوة التالية.'),
    ],
    result: [t('A short status', 'حالة مختصرة')],
    limits: [t('Read-only.', 'للقراءة فقط.')],
    related: ['sync-main', 'commit-push'],
  },
  'sync-main': {
    plain: t('What landed on main while you worked, and whether it touches your files.', 'ما وصل إلى main أثناء عملك، وهل يمسّ ملفاتك.'),
    ask: [t('is main ahead?', 'هل تقدّم main؟'), t('rebase on main', 'حدّث الفرع فوق main')],
    steps: [
      t('Fetches and lists incoming commits.', 'يجلب ويعرض التغييرات القادمة.'),
      t('Shows files changed on both sides.', 'يعرض الملفات المتغيرة في الجهتين.'),
      t('Rebases only when you ask, and verifies after conflicts.', 'لا يحدّث إلا بطلبك، ويتحقق بعد التعارضات.'),
    ],
    result: [t('A conflict forecast, or an updated branch', 'توقع بالتعارضات أو فرع محدّث')],
    limits: [t('Never force-pushes. You do that.', 'لا يرفع قسرياً، فذلك لك.')],
    related: ['branch-status', 'verify'],
  },
  'commit-push': {
    plain: t('Commit and push, only after you say yes.', 'الحفظ والرفع، بعد موافقتك فقط.'),
    ask: [t('commit push', 'احفظ وارفع'), t('yes, commit it', 'نعم، احفظه')],
    steps: [
      t('Checks your approval, the branch and your git identity.', 'يتحقق من موافقتك والفرع وهويتك في git.'),
      t('Stages only this task’s files.', 'يجهّز ملفات هذه المهمة فقط.'),
      t('Commits with a conventional message, as you.', 'يحفظ باسمك وبرسالة معيارية.'),
      t('Pushes the task branch and prints the compare link.', 'يرفع فرع المهمة ويطبع رابط المقارنة.'),
    ],
    result: [t('A pushed branch and a link', 'فرع مرفوع ورابط')],
    limits: [t('No AI attribution, no protected branches, no force, no skipped hooks.', 'لا إشارة للذكاء الاصطناعي ولا فروع محمية ولا رفع قسري ولا تخطٍّ للفحوص.')],
    related: ['verify', 'pr-link'],
  },
  'pr-link': {
    plain: t('Prepares the pull request and leaves the click to you.', 'يجهّز طلب الدمج ويترك الضغطة لك.'),
    ask: [t('give me the pr link', 'أعطني رابط طلب الدمج'), t('link pr', 'رابط الـ PR')],
    steps: [
      t('Checks that the branch is pushed.', 'يتأكد أن الفرع مرفوع.'),
      t('Reads what the request contains.', 'يقرأ محتوى الطلب.'),
      t('Prints the link and a description for a teammate.', 'يطبع الرابط ووصفاً لزميل.'),
    ],
    result: [t('A link, a title and a description', 'رابط وعنوان ووصف')],
    limits: [t('Never creates or merges the pull request.', 'لا ينشئ طلب الدمج ولا يدمجه.')],
    related: ['commit-push', 'review'],
  },
}
