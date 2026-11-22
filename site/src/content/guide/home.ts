import { t } from './text.ts'

/** The short page: what it is, one real example, what is inside, how to get it. */
export const home = {
  title: t('Every piece of a production frontend, in one kit.', 'كل قطع الواجهة الاحترافية في عدّة واحدة.'),
  what: t(
    'frontend-kit gives your coding assistant the playbooks, standards and checks of a frontend team, for React and TypeScript projects.',
    'frontend-kit تمنح مساعدك البرمجي أدلة فريق الواجهات ومعاييره وفحوصه، لمشاريع React وTypeScript.',
  ),
  changes: [
    {
      name: t('It knows how to build', 'تعرف كيف تبني'),
      text: t('Playbooks for tables, forms, pages, SEO and more, written for your stack.', 'أدلة للجداول والنماذج والصفحات وتحسين البحث وغيرها، ملائمة لتقنياتك.'),
    },
    {
      name: t('It stops the damage', 'توقف الضرر قبل وقوعه'),
      text: t('Pushes to main, secrets and known destructive commands are refused.', 'يُرفض الرفع إلى main والوصول إلى الأسرار والأوامر التخريبية المعروفة.'),
    },
    {
      name: t('It makes the work prove itself', 'لا تسليم قبل الإثبات'),
      text: t('Failing typecheck or tests send the work back. Then another agent reviews.', 'فشل فحص الأنواع أو الاختبارات يعيد العمل، ثم يراجعه وكيل آخر.'),
    },
  ],
  see: t('See an example', 'شاهد مثالاً'),
  docs: t('Read the documentation', 'اقرأ التوثيق'),

  example: t('You type one sentence. This is what happens.', 'تكتب جملة واحدة، وهذا ما يحدث.'),
  prompt: t('Add an orders page with a table and a status filter', 'أضف صفحة طلبات بجدول وفلتر للحالة'),
  steps: {
    skills: {
      name: t('It finds the right playbooks', 'يجد الأدلة الصحيحة'),
      text: t('The table and filter skills are named before work starts: server paging, filters in the URL, all four states.', 'تُسمّى مهارتا الجدول والمرشحات قبل البدء: ترقيم من الخادم ومرشحات في الرابط والحالات الأربع.'),
    },
    rules: {
      name: t('Your standards load', 'تُحمَّل معاييرك'),
      text: t('While it edits those files, the rules for tables, permissions and your API are in front of it.', 'أثناء تعديل تلك الملفات تكون قواعد الجداول والصلاحيات والـ API أمامه.'),
    },
    guard: {
      name: t('A dangerous command is refused', 'يُرفض الأمر الخطر'),
      text: t('If it tries a force push, the hook answers with exactly this:', 'إذا حاول رفعاً قسرياً أجابه الحارس بهذا النص تماماً:'),
    },
    gate: {
      name: t('It cannot just say “done”', 'لا يكفيه أن يقول «انتهيت»'),
      text: t('Typecheck and related tests run when it tries to finish. A failure goes back to it, up to three times in a row.', 'يعمل فحص الأنواع والاختبارات المرتبطة عندما يحاول الانتهاء، ويعود إليه الفشل حتى ثلاث مرات متتالية.'),
    },
    review: {
      name: t('A second agent reads the change', 'وكيل ثانٍ يقرأ التغيير'),
      text: t('frontend-reviewer reads it with fresh eyes and reports what to fix.', 'يقرؤه frontend-reviewer بعين جديدة ويذكر ما يجب إصلاحه.'),
    },
    done: {
      name: t('You decide', 'القرار لك'),
      text: t('You get a short report and one question: commit and push? The pull request stays your click.', 'يصلك تقرير قصير وسؤال واحد: أحفظ وأرفع؟ ويبقى فتح طلب الدمج بيدك.'),
    },
  },

  inside: t('Everything inside. Press any name.', 'كل ما بداخلها. اضغط أي اسم.'),
  insideLead: t('Press it and the blocks become it. Drag to turn it, press it to take it apart.', 'اضغطه فتتحول المكعبات إليه. اسحبه لتديره، واضغطه ليتفكك.'),
  kinds: {
    skills: t('Skills', 'المهارات'),
    agents: t('Agents', 'الوكلاء'),
    rules: t('Rules', 'القواعد'),
    checks: t('Hooks', 'الحرّاس'),
  },
  kindIs: {
    skills: t('A skill is a written playbook for one job.', 'المهارة دليل مكتوب لعمل واحد.'),
    agents: t('An agent is a separate worker with one role and fresh eyes.', 'الوكيل عامل منفصل بدور واحد وعين جديدة.'),
    rules: t('A rule is a file of standards, read while matching files are being worked on.', 'القاعدة ملف معايير يُقرأ أثناء العمل على ملفات تطابقها.'),
    checks: t('A hook is a script that runs at a fixed moment, whatever the assistant remembers.', 'الحارس سكربت يعمل في لحظة ثابتة مهما تذكّر المساعد أو نسي.'),
  },
  why: t('Why', 'لماذا'),
  when: t('When', 'متى'),
  does: t('What it does', 'ماذا يفعل'),
  type: t('You type', 'تكتب'),
  open: t('Open its full documentation', 'افتح توثيقه الكامل'),

  install: t('Get it in three commands.', 'ثبّتها بثلاثة أوامر.'),
  types: t('Works for', 'تعمل لـ'),
}
