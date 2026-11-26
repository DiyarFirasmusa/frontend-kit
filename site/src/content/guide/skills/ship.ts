import { t } from '../text.ts'
import type { SkillGuide } from './types.ts'

export const ship: Record<string, SkillGuide> = {
  'sync-main': {
    plain: t('Shows where your branch (a separate line of work) stands, what was added to main (the main version of the project) while you worked, and whether it touches the files you changed.', 'يعرض حالة فرعك (خط عمل منفصل)، وما أضيف إلى main (النسخة الرئيسية من المشروع) أثناء عملك، وهل يمس الملفات التي غيرتها.'),
    ask: [t('which branch am I on, is it uploaded?', 'على أي فرع أنا، وهل رفعته؟'), t('is main ahead?', 'هل تقدم main؟'), t('rebase on main (move my work on top of the newest main)', 'اعمل rebase لفرعي على main (انقل عملي فوق أحدث main)')],
    steps: [
      t('Reads the branch, how far ahead or behind main it is, and what is not uploaded or not saved yet.', 'يقرأ الفرع، وكم يتقدم عن main وكم يتأخر، وما لم يرفع أو لم يحفظ بعد.'),
      t('Fetches the new changes and lists them.', 'يجلب التغييرات الجديدة ويعرضها.'),
      t('Shows the files changed on both sides, yours and main’s.', 'يعرض الملفات التي تغيرت في الجهتين: فرعك وmain.'),
      t('Moves your work on top of the newest main (a “rebase”) only when you ask, and checks everything after fixing clashes.', 'لا ينقل عملك فوق أحدث main (وهذا اسمه rebase) إلا إذا طلبت، ويتحقق من كل شيء بعد حل التعارضات.'),
    ],
    result: [t('A short status and a forecast of clashes, or an updated branch', 'حالة مختصرة وتوقع للتعارضات، أو فرع محدث')],
    limits: [t('Never force-uploads. That step is yours.', 'لا يرفع بالقوة أبدا. هذه خطوتك أنت.')],
    related: ['commit-push', 'verify'],
  },
  'commit-push': {
    plain: t('Saves a version of your work (a commit) and uploads it (a push), only after you say yes.', 'يحفظ نسخة من عملك (وتسمى commit) ويرفعها (وتسمى push)، بعد موافقتك فقط.'),
    ask: [t('commit push (save and upload my work)', 'احفظ وارفع'), t('yes, commit it', 'نعم، احفظه'), t('link pr', 'رابط الـ PR')],
    steps: [
      t('Checks that you said yes, which branch you are on, and who you are in git (the name and email put on saved versions).', 'يتأكد من موافقتك ومن الفرع الذي أنت عليه، ومن هويتك في git (الاسم والبريد اللذان يوضعان على النسخ المحفوظة).'),
      t('Picks only the files that belong to this task.', 'يختار فقط ملفات هذه المهمة.'),
      t('Saves the version under your name, with a message in a standard format called “conventional”.', 'يحفظ النسخة باسمك، برسالة بصيغة قياسية اسمها conventional.'),
      t('Uploads the task branch and shows a link to compare it with main.', 'يرفع فرع المهمة ويعرض رابطا لمقارنته مع main.'),
      t('On “link pr” it only reads: it prints the link and a description of the pull request (a request to merge your changes) a teammate can understand.', 'وعند طلب ⁦link pr⁩ يقرأ فقط: يعرض الرابط ووصفا للـ ⁦pull request⁩ (طلب دمج تغييراتك) يفهمه زميلك.'),
    ],
    result: [t('An uploaded branch and a link, or a link and a description', 'فرع مرفوع ورابط، أو رابط ووصف')],
    limits: [t('No AI mention in the message except the co-author line (it follows your Claude Code setting, on by default), no uploads to protected branches, no forced uploads, no skipping of safety checks, and it never opens or merges the pull request.', 'لا يذكر الذكاء الاصطناعي في الرسالة إلا سطر المؤلف المشارك (يتبع إعداد ⁦Claude Code⁩ عندك، وهو مفعّل افتراضيا)، ولا يرفع إلى فروع محمية، ولا يرفع بالقوة، ولا يتجاوز فحوص الأمان، ولا ينشئ الـ ⁦pull request⁩ ولا يدمجه أبدا.')],
    related: ['verify', 'review'],
  },
}
