import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const ship: Record<string, SkillGuide> = {
  'branch-status': {
    plain: t('Where the branch stands, at a glance.', 'حالة الفرع بنظرة واحدة.'),
    ask: [t('which branch, is it pushed?', 'على أي فرع أنا، وهل رفعته؟'), t('what is left to commit', 'ما الذي لم أحفظه بعد؟')],
    steps: [
      t('Reads branch, base, ahead and behind.', 'يقرأ الفرع وأساسه، وكم يتقدم عنه وكم يتأخر.'),
      t('Lists unpushed and uncommitted work.', 'يعرض ما لم ترفعه وما لم تحفظه.'),
      t('Suggests the next step.', 'يقترح الخطوة التالية.'),
    ],
    result: [t('A short status', 'حالة مختصرة')],
    limits: [t('Read-only.', 'للقراءة فقط.')],
    related: ['sync-main', 'commit-push'],
  },
  'sync-main': {
    plain: t('What landed on main while you worked, and whether it touches your files.', 'ما الذي وصل إلى main أثناء عملك، وهل يمس ملفاتك.'),
    ask: [t('is main ahead?', 'هل تقدم main؟'), t('rebase on main', 'اعمل rebase لفرعي على main')],
    steps: [
      t('Fetches and lists incoming commits.', 'يجلب التغييرات الجديدة ويعرضها.'),
      t('Shows files changed on both sides.', 'يعرض الملفات التي تغيرت في فرعك وفي main.'),
      t('Rebases only when you ask, and verifies after conflicts.', 'لا يعمل rebase إلا إذا طلبت، ويتحقق بعد حل التعارضات.'),
    ],
    result: [t('A conflict forecast, or an updated branch', 'توقع للتعارضات، أو فرع محدث')],
    limits: [t('Never force-pushes. You do that.', 'لا يرفع بالقوة أبدا. هذه خطوتك أنت.')],
    related: ['branch-status', 'verify'],
  },
  'commit-push': {
    plain: t('Commit and push, only after you say yes.', 'الحفظ والرفع، بعد موافقتك فقط.'),
    ask: [t('commit push', 'احفظ وارفع'), t('yes, commit it', 'نعم، احفظه')],
    steps: [
      t('Checks your approval, the branch and your git identity.', 'يتأكد من موافقتك ومن الفرع وهويتك في git.'),
      t('Stages only this task’s files.', 'يجهز ملفات هذه المهمة فقط.'),
      t('Commits with a conventional message, as you.', 'يحفظ باسمك، برسالة بصيغة conventional.'),
      t('Pushes the task branch and prints the compare link.', 'يرفع فرع المهمة ويعرض رابط المقارنة.'),
    ],
    result: [t('A pushed branch and a link', 'فرع مرفوع ورابط')],
    limits: [t('No AI attribution, no protected branches, no force, no skipped hooks.', 'لا يذكر الذكاء الاصطناعي، ولا يرفع إلى فروع محمية، ولا يرفع بالقوة، ولا يتجاوز الحراس.')],
    related: ['verify', 'pr-link'],
  },
  'pr-link': {
    plain: t('Prepares the pull request and leaves the click to you.', 'يجهز الـ pull request ويترك لك الضغطة الأخيرة.'),
    ask: [t('give me the pr link', 'أعطني رابط الـ PR'), t('link pr', 'رابط الـ PR')],
    steps: [
      t('Checks that the branch is pushed.', 'يتأكد أن الفرع مرفوع.'),
      t('Reads what the request contains.', 'يقرأ ما يحتويه الـ pull request.'),
      t('Prints the link and a description for a teammate.', 'يعرض الرابط، ووصفا يفهمه زميلك.'),
    ],
    result: [t('A link, a title and a description', 'رابط وعنوان ووصف')],
    limits: [t('Never creates or merges the pull request.', 'لا ينشئ الـ pull request ولا يدمجه.')],
    related: ['commit-push', 'review'],
  },
}
