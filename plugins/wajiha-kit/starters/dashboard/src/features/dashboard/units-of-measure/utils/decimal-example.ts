const SAMPLE_VALUE = 12.3456;

export function formatDecimalExample(
  decimalPlaces: number | null | undefined,
): string {
  if (
    decimalPlaces === null ||
    decimalPlaces === undefined ||
    !Number.isInteger(decimalPlaces) ||
    decimalPlaces < 0 ||
    decimalPlaces > 6
  ) {
    return '—';
  }
  return SAMPLE_VALUE.toFixed(decimalPlaces);
}
