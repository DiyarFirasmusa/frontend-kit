import { useState } from 'react';
import { expect, it } from 'vitest';
import { tt } from '@/test/i18n';
import { renderWithProviders, screen, within } from '@/test/render';
import { TimeInput } from './time-input';

function Harness() {
  const [value, setValue] = useState('09:30');
  return (
    <TimeInput
      aria-label="at"
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
      }}
    />
  );
}

it('picks hour and minute from the custom lists', async () => {
  const { user } = renderWithProviders(<Harness />);
  await user.click(screen.getByRole('button', { name: '09:30' }));
  const hours = await screen.findByRole('listbox', { name: tt('common.hour') });
  await user.click(within(hours).getByRole('option', { name: '14' }));
  const minutes = screen.getByRole('listbox', { name: tt('common.minute') });
  await user.click(within(minutes).getByRole('option', { name: '45' }));
  expect(screen.getByRole('button', { name: '14:45' })).toBeInTheDocument();
});

it('clears the value', async () => {
  const { user } = renderWithProviders(<Harness />);
  await user.click(screen.getByRole('button', { name: '09:30' }));
  await user.click(
    await screen.findByRole('button', { name: tt('common.clear') }),
  );
  expect(
    screen.getByRole('button', { name: tt('common.pickTime') }),
  ).toBeInTheDocument();
});
