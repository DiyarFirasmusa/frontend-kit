export interface SelectOption {
  value: string;
  label: string;
  /** Secondary line under the label (Combobox only). */
  description?: string;
  disabled?: boolean;
}
