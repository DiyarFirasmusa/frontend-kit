export function required<T extends Element>(selector: string, root: ParentNode = document): T {
  const found = root.querySelector<T>(selector)
  if (!found) throw new Error(`The page has no ${selector}`)
  return found
}

/** Lower-cases and folds Arabic spellings together, so "انشاء" finds "إنشاء" and "مهاره" finds "مهارة". */
export const fold = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[\u064b-\u065f\u0670\u0640]/g, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064a')
    .replace(/\u0629/g, '\u0647')

export const all = <T extends Element>(selector: string, root: ParentNode = document): T[] => [...root.querySelectorAll<T>(selector)]
