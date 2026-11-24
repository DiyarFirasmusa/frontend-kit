import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const ship: Record<string, SkillGuide> = {
  'branch-status': {
    plain: t('Where the branch stands, at a glance.', 'وضع الفرع بنظرة وحدة.'),
    ask: [t('which branch, is it pushed?', 'أنا على أي فرع؟ وانرفع أو لا؟'), t('what is left to commit', 'شنو باقي ما انحفظ؟')],
    steps: [
      t('Reads branch, base, ahead and behind.', 'يقرأ الفرع وأساسه، وكم هو متقدم وكم متأخر.'),
      t('Lists unpushed and uncommitted work.', 'يعرض اللي ما انرفع واللي ما انحفظ.'),
      t('Suggests the next step.', 'يقترح الخطوة الجاية.'),
    ],
    result: [t('A short status', 'حالة مختصرة')],
    limits: [t('Read-only.', 'للقراءة بس.')],
    related: ['sync-main', 'commit-push'],
  },
  'sync-main': {
    plain: t('What landed on main while you worked, and whether it touches your files.', 'شنو نزل على main وانت تشتغل، وإذا يمسّ ملفاتك.'),
    ask: [t('is main ahead?', 'main تقدّم؟'), t('rebase on main', 'حدّثلي الفرع فوق main')],
    steps: [
      t('Fetches and lists incoming commits.', 'يجيب التغييرات الجديدة ويعرضها.'),
      t('Shows files changed on both sides.', 'يعرض الملفات اللي تغيّرت بالجهتين.'),
      t('Rebases only when you ask, and verifies after conflicts.', 'ما يحدّث إلا إذا طلبت، ويتحقق بعد التعارضات.'),
    ],
    result: [t('A conflict forecast, or an updated branch', 'توقّع للتعارضات، أو فرع محدّث')],
    limits: [t('Never force-pushes. You do that.', 'ما يرفع بالقوة أبداً. هذا بإيدك.')],
    related: ['branch-status', 'verify'],
  },
  'commit-push': {
    plain: t('Commit and push, only after you say yes.', 'الحفظ والرفع، بس بعد ما توافق.'),
    ask: [t('commit push', 'احفظ وارفع'), t('yes, commit it', 'إي، احفظه')],
    steps: [
      t('Checks your approval, the branch and your git identity.', 'يتأكد من موافقتك، والفرع، وهويتك بـ git.'),
      t('Stages only this task’s files.', 'يجهّز ملفات هالمهمة بس.'),
      t('Commits with a conventional message, as you.', 'يحفظ باسمك، وبرسالة معيارية.'),
      t('Pushes the task branch and prints the compare link.', 'يرفع فرع المهمة ويطلّعلك رابط المقارنة.'),
    ],
    result: [t('A pushed branch and a link', 'فرع مرفوع ورابط')],
    limits: [t('No AI attribution, no protected branches, no force, no skipped hooks.', 'لا إشارة للذكاء الاصطناعي، ولا فروع محمية، ولا رفع بالقوة، ولا تخطّي للحرّاس.')],
    related: ['verify', 'pr-link'],
  },
  'pr-link': {
    plain: t('Prepares the pull request and leaves the click to you.', 'يجهّز الـ pull request ويخلّي الضغطة عليك.'),
    ask: [t('give me the pr link', 'عطني رابط الـ PR'), t('link pr', 'رابط الـ PR')],
    steps: [
      t('Checks that the branch is pushed.', 'يتأكد إن الفرع مرفوع.'),
      t('Reads what the request contains.', 'يقرأ شنو بداخل الـ pull request.'),
      t('Prints the link and a description for a teammate.', 'يطلّعلك الرابط، ووصف يفهمه زميلك.'),
    ],
    result: [t('A link, a title and a description', 'رابط وعنوان ووصف')],
    limits: [t('Never creates or merges the pull request.', 'ما يفتح الـ pull request ولا يدمجه.')],
    related: ['commit-push', 'review'],
  },
}
