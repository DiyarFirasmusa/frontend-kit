import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const ship: Record<string, SkillGuide> = {
  'branch-status': {
    plain: t(
      'Shows where your current branch stands, at a glance. A branch is a separate line of work, so your changes do not mix with the main version until you decide.',
      'يعرض حالة فرعك الحالي بنظرة واحدة. الفرع خط عمل منفصل، فلا تختلط تغييراتك بالنسخة الرئيسية حتى تقرر أنت.',
    ),
    ask: [t('which branch am I on, is it uploaded?', 'على أي فرع أنا، وهل رفعته؟'), t('what is not saved yet?', 'ما الذي لم أحفظه بعد؟')],
    steps: [
      t('Reads the branch name, what it started from, and how far ahead or behind it is.', 'يقرأ اسم الفرع وما بدأ منه، وكم يتقدم عنه وكم يتأخر.'),
      t('Lists the work that is not uploaded yet and the work that is not saved as a version yet.', 'يعرض العمل الذي لم يرفع بعد، والعمل الذي لم يحفظ كنسخة بعد.'),
      t('Suggests the next step.', 'يقترح الخطوة التالية.'),
    ],
    result: [t('A short status', 'حالة مختصرة')],
    limits: [t('Read-only. It changes nothing.', 'للقراءة فقط. لا يغير شيئا.')],
    related: ['sync-main', 'commit-push'],
  },
  'sync-main': {
    plain: t('Shows what was added to main (the main version of the project) while you worked, and whether it touches the files you changed.', 'يعرض ما أضيف إلى main (النسخة الرئيسية من المشروع) أثناء عملك، وهل يمس الملفات التي غيرتها.'),
    ask: [t('is main ahead?', 'هل تقدم main؟'), t('rebase on main (move my work on top of the newest main)', 'اعمل rebase لفرعي على main (انقل عملي فوق أحدث main)')],
    steps: [
      t('Fetches the new changes and lists them.', 'يجلب التغييرات الجديدة ويعرضها.'),
      t('Shows the files changed on both sides, yours and main’s.', 'يعرض الملفات التي تغيرت في الجهتين: فرعك وmain.'),
      t('Moves your work on top of the newest main (a “rebase”) only when you ask, and checks everything after fixing clashes.', 'لا ينقل عملك فوق أحدث main (وهذا اسمه rebase) إلا إذا طلبت، ويتحقق من كل شيء بعد حل التعارضات.'),
    ],
    result: [t('A forecast of clashes, or an updated branch', 'توقع للتعارضات، أو فرع محدث')],
    limits: [t('Never force-uploads. That step is yours.', 'لا يرفع بالقوة أبدا. هذه خطوتك أنت.')],
    related: ['branch-status', 'verify'],
  },
  'commit-push': {
    plain: t('Saves a version of your work (a commit) and uploads it (a push), only after you say yes.', 'يحفظ نسخة من عملك (وتسمى commit) ويرفعها (وتسمى push)، بعد موافقتك فقط.'),
    ask: [t('commit push (save and upload my work)', 'احفظ وارفع'), t('yes, commit it', 'نعم، احفظه')],
    steps: [
      t('Checks that you said yes, which branch you are on, and who you are in git (the name and email put on saved versions).', 'يتأكد من موافقتك ومن الفرع الذي أنت عليه، ومن هويتك في git (الاسم والبريد اللذان يوضعان على النسخ المحفوظة).'),
      t('Picks only the files that belong to this task.', 'يختار فقط ملفات هذه المهمة.'),
      t('Saves the version under your name, with a message in a standard format called “conventional”.', 'يحفظ النسخة باسمك، برسالة بصيغة قياسية اسمها conventional.'),
      t('Uploads the task branch and shows a link to compare it with main.', 'يرفع فرع المهمة ويعرض رابطا لمقارنته مع main.'),
    ],
    result: [t('An uploaded branch and a link', 'فرع مرفوع ورابط')],
    limits: [t('No AI credit in the message, no uploads to protected branches, no forced uploads, and no skipping of safety checks.', 'لا يذكر الذكاء الاصطناعي في الرسالة، ولا يرفع إلى فروع محمية، ولا يرفع بالقوة، ولا يتجاوز فحوص الأمان.')],
    related: ['verify', 'pr-link'],
  },
  'pr-link': {
    plain: t('Prepares a pull request, which is a request to merge your changes into the main version, and leaves the final click to you.', 'يجهز pull request، وهو طلب لدمج تغييراتك في النسخة الرئيسية، ويترك لك الضغطة الأخيرة.'),
    ask: [t('give me the link to ask for a merge', 'أعطني رابط طلب الدمج'), t('link pr', 'رابط الـ PR')],
    steps: [
      t('Checks that the branch is uploaded.', 'يتأكد أن الفرع مرفوع.'),
      t('Reads what the request contains.', 'يقرأ ما يحتويه الطلب.'),
      t('Prints the link and a description a teammate can understand.', 'يعرض الرابط، ووصفا يفهمه زميلك.'),
    ],
    result: [t('A link, a title and a description', 'رابط وعنوان ووصف')],
    limits: [t('Never creates or merges the pull request.', 'لا ينشئ الـ pull request ولا يدمجه.')],
    related: ['commit-push', 'review'],
  },
}
