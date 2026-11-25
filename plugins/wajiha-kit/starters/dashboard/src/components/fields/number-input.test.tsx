import { useState } from 'react';
import { expect, it } from 'vitest';
import { tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { NumberInput } from './number-input';

function Harness({ max }: { max?: number }) {
  const [value, setValue] = useState('5');
  return (
    <NumberInput
      aria-label="count"
      value={value}
      min={0}
      max={max}
      onChange={(event) => {
        setValue(event.target.value);
      }}
    />
  );
}

it('steps the value with the custom buttons', async () => {
  const { user } = renderWithProviders(<Harness />);
  const input = screen.getByLabelText('count');
  await user.click(screen.getByRole('button', { name: tt('common.increase') }));
  expect(input).toHaveValue(6);
  await user.click(screen.getByRole('button', { name: tt('common.decrease') }));
  await user.click(screen.getByRole('button', { name: tt('common.decrease') }));
  expect(input).toHaveValue(4);
});

it('does not step past the maximum', async () => {
  const { user } = renderWithProviders(<Harness max={5} />);
  await user.click(screen.getByRole('button', { name: tt('common.increase') }));
  expect(screen.getByLabelText('count')).toHaveValue(5);
});
