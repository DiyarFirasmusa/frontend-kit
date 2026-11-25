// i18n keys for backend enum values: `enums.<Name>.<VALUE>` in the global
// locale files. Feature-only enums keep their labels in the feature's locales.
export type EnumName = 'AttributeDataType';

/** i18n key for a backend enum value, e.g. `enums.AttributeDataType.TEXT`. */
export function enumLabelKey(name: EnumName, value: string): string {
  return `enums.${name}.${value}`;
}
