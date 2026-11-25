import { useState } from 'react';
import { expect, it } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { DateInput } from './date-input';

function Harness() {
  const [value, setValue] = useState('2026-10-03');
  return (
    <DateInput
      aria-label="when"
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
      }}
    />
  );
}

it('picks a day from the custom calendar and writes the ISO value', async () => {
  const { user } = renderWithProviders(<Harness />);
  await user.click(screen.getByRole('button', { name: '2026-10-03' }));
  await user.click(await screen.findByRole('button', { name: '15' }));
  expect(
    screen.getByRole('button', { name: '2026-10-15' }),
  ).toBeInTheDocument();
});

it('clears the value', async () => {
  const { user } = renderWithProviders(<Harness />);
  await user.click(screen.getByRole('button', { name: '2026-10-03' }));
  await user.click(
    await screen.findByRole('button', { name: tt('common.clear') }),
  );
  expect(
    screen.getByRole('button', { name: tt('common.pickDate') }),
  ).toBeInTheDocument();
});

it('renders the calendar in Arabic with Western digits', async () => {
  await setTestLanguage('ar');
  const { user } = renderWithProviders(<Harness />);
  await user.click(screen.getByRole('button', { name: '2026-10-03' }));
  const title = await screen.findByText(/أكتوبر/);
  expect(title).toHaveTextContent('2026');
});
