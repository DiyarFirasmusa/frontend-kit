import { t } from './text.ts'

/** The short page: what it is, one real example, what is inside, how to get it. */
export const home = {
  title: t('A plugin that makes your coding assistant work like a frontend team.', 'إضافة تجعل مساعدك البرمجي يعمل كفريق واجهات.'),
  // The three questions of a first visit, each answered in full on the first screen.
  answers: {
    is: {
      name: t('What is it?', 'ما هي؟'),
      text: t(
        'A plugin for React and TypeScript projects: written know-how, standards, reviewers and automatic guards.',
        'إضافة لمشاريع React وTypeScript، فيها أدلة عمل ومعايير ووكلاء مراجعة وحرّاس تلقائيون.',
      ),
    },
    does: {
      name: t('What does it do?', 'ماذا تفعل؟'),
      text: t(
        'Your assistant builds pages, tables and forms to your standards. Known dangerous commands are refused. Its code is typechecked, tested and sent for review.',
        'تجعل مساعدك يبني الصفحات والجداول والنماذج بمعاييرك، وترفض الأوامر الخطرة المعروفة، وتفحص أنواع الشيفرة واختباراتها ثم تطلب مراجعتها.',
      ),
    },
    works: {
      name: t('How does it work?', 'كيف تعمل؟'),
      steps: [
        t('Install it once. Setup adapts it to your project.', 'تثبّتها مرة، والإعداد يلائمها لمشروعك.'),
        t('Ask in your own words. The assistant follows the matching guide.', 'تطلب بكلامك، فيتبع المساعد الدليل المناسب.'),
        t('Checks run by themselves, and you approve the commit.', 'تعمل الفحوص وحدها، وأنت توافق على الحفظ.'),
      ],
    },
  },
  see: t('See it on a real request', 'شاهدها على طلب حقيقي'),
  docs: t('Read the documentation', 'اقرأ التوثيق'),

  example: t('How it works, step by step, on one request', 'كيف تعمل خطوة بخطوة، على طلب واحد'),
  prompt: t('Add an orders page with a table and a status filter', 'أضف صفحة طلبات بجدول وفلتر للحالة'),
  steps: {
    skills: {
      name: t('1. The matching skills are named', '1. تُسمّى المهارات المناسبة'),
      text: t('The table and filter skills are named before work starts: server paging, filters in the URL, all four states.', 'تُسمّى مهارتا الجدول والمرشحات قبل البدء: ترقيم من الخادم ومرشحات في الرابط والحالات الأربع.'),
    },
    rules: {
      name: t('2. Your project’s rules load', '2. تُحمَّل قواعد مشروعك'),
      text: t('While it edits those files, the rules for tables, permissions and your API are in front of it.', 'أثناء تعديل تلك الملفات تكون قواعد الجداول والصلاحيات والـ API أمامه.'),
    },
    guard: {
      name: t('3. A dangerous command is refused', '3. يُرفض الأمر الخطر'),
      text: t('If it tries a force push, the hook answers with exactly this:', 'إذا حاول رفعاً قسرياً أجابه الحارس بهذا النص تماماً:'),
    },
    gate: {
      name: t('4. Typecheck and tests run', '4. يعمل فحص الأنواع والاختبارات'),
      text: t('Typecheck and related tests run when it tries to finish. A failure goes back to it, up to three times in a row.', 'يعمل فحص الأنواع والاختبارات المرتبطة عندما يحاول الانتهاء، ويعود إليه الفشل حتى ثلاث مرات متتالية.'),
    },
    review: {
      name: t('5. A second agent reviews the change', '5. وكيل ثانٍ يراجع التغيير'),
      text: t('frontend-reviewer reads it with fresh eyes and reports what to fix.', 'يقرؤه frontend-reviewer بعين جديدة ويذكر ما يجب إصلاحه.'),
    },
    done: {
      name: t('6. You approve commit and push', '6. توافق على الحفظ والرفع'),
      text: t('You get a short report and one question: commit and push? The pull request stays your click.', 'يصلك تقرير قصير وسؤال واحد: أحفظ وأرفع؟ ويبقى فتح طلب الدمج بيدك.'),
    },
  },

  inside: t('What is inside', 'ماذا بداخلها'),
  insideLead: t('Press any name to read what it does, why it exists and when to use it.', 'اضغط أي اسم لتقرأ ماذا يفعل ولماذا وُجد ومتى تستعمله.'),
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
