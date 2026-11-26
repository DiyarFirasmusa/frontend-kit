export interface SelectOption {
  value: string;
  label: string;
  /** Secondary line under the label (Combobox only). */
  description?: string;
  disabled?: boolean;
}

/** Base UI's Select cannot hold "" as an item value, so the empty choice travels under this marker. */
const EMPTY_SELECT_VALUE = '__empty__';

export function toSelectValue(value: string): string {
  return value === '' ? EMPTY_SELECT_VALUE : value;
}

export function fromSelectValue(value: string | null | undefined): string {
  if (!value || value === EMPTY_SELECT_VALUE) {
    return '';
  }
  return value;
}

export function selectItemValue(value: string): string {
  return toSelectValue(value);
}
