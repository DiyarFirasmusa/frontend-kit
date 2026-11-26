import { afterEach, describe, expect, it } from 'vitest';
import { toast, useToastStore } from './toast-store';

afterEach(() => {
  useToastStore.getState().clear();
});

describe('toast store', () => {
  it('queues success and error toasts in order', () => {
    toast.success({ key: 'ui.save' });
    toast.error({ text: 'Network down' });
    const toasts = useToastStore.getState().toasts;
    expect(toasts.map((item) => item.tone)).toEqual(['success', 'error']);
    expect(toasts[1]?.message).toEqual({ text: 'Network down' });
  });

  it('keeps only the newest three', () => {
    for (let index = 0; index < 5; index += 1) {
      toast.success({ text: `n${index}` });
    }
    expect(useToastStore.getState().toasts.map((item) => item.message)).toEqual([
      { text: 'n2' },
      { text: 'n3' },
      { text: 'n4' },
    ]);
  });

  it('dismisses one toast by id', () => {
    toast.success({ text: 'a' });
    toast.success({ text: 'b' });
    const [first] = useToastStore.getState().toasts;
    useToastStore.getState().dismiss(first?.id ?? 0);
    expect(useToastStore.getState().toasts.map((item) => item.message)).toEqual([{ text: 'b' }]);
  });
});
