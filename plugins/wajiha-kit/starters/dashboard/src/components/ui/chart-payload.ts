import type { ChartConfig } from './chart';

export function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== 'object' || payload === null) {
    return;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof (payload as { payload?: unknown }).payload === 'object' &&
    (payload as { payload?: unknown }).payload !== null
      ? (payload as { payload: Record<string, unknown> }).payload
      : undefined;

  let configLabelKey: string = key;

  const record = payload as Record<string, unknown>;
  if (key in record && typeof record[key] === 'string') {
    configLabelKey = record[key] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === 'string'
  ) {
    configLabelKey = payloadPayload[key] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}
