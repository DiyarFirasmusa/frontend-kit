export type CategoriesConfirmKind = 'category' | 'assignment' | 'attribute';

/** The row awaiting confirmation in the single categories confirm dialog. */
export interface CategoriesConfirmTarget {
  kind: CategoriesConfirmKind;
  id: string;
  name: string;
}
