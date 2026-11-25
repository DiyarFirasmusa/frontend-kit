import { describe, expect, it } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { NOTIFICATION_TYPE_TONE } from './notification-tones';

describe('NOTIFICATION_TYPE_TONE', () => {
  it('gives every notification type a label in both languages', async () => {
    for (const lng of ['en', 'ar'] as const) {
      await setTestLanguage(lng);
      for (const type of Object.keys(NOTIFICATION_TYPE_TONE)) {
        expect(tt(`notifications.types.${type}`)).not.toBe(
          `notifications.types.${type}`,
        );
      }
    }
  });

  it('reads danger as danger and warning as warning', () => {
    expect(NOTIFICATION_TYPE_TONE.DANGER).toBe('danger');
    expect(NOTIFICATION_TYPE_TONE.WARNING).toBe('warning');
  });
});
