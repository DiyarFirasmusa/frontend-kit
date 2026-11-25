import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithI18n } from '@/test/render';
import { ContactForm } from './contact-form';

async function fill(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Record<string, string> = {},
) {
  const values = {
    Name: 'Sara Ali',
    Email: 'sara@example.com',
    'Your message': 'Hello, I would like to ask about training.',
    ...overrides,
  };
  for (const [label, value] of Object.entries(values)) {
    const field = screen.getByLabelText(label);
    await user.clear(field);
    if (value !== '') {
      await user.type(field, value);
    }
  }
}

describe('ContactForm', () => {
  it('shows a translated error under each invalid field and does not submit', async () => {
    const submit = vi.fn();
    const user = userEvent.setup();
    renderWithI18n(<ContactForm submit={submit} />, 'en');

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText('Enter your name (at least 2 characters).')).toBeInTheDocument();
    expect(
      screen.getByText('Enter a valid email address, for example name@example.com.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('The message is too short. Write at least 10 characters.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
    expect(submit).not.toHaveBeenCalled();
  });

  it('shows the same errors in Arabic', async () => {
    const user = userEvent.setup();
    renderWithI18n(<ContactForm submit={vi.fn()} />, 'ar');
    await user.click(screen.getByRole('button', { name: 'إرسال الرسالة' }));
    expect(await screen.findByText('اكتب اسمك (حرفان على الأقل).')).toBeInTheDocument();
  });

  it('submits trimmed, valid values once and then shows the success message', async () => {
    const submit = vi.fn().mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderWithI18n(<ContactForm submit={submit} />, 'en');

    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText('We got your message')).toBeInTheDocument();
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith({
      name: 'Sara Ali',
      email: 'sara@example.com',
      phone: '',
      message: 'Hello, I would like to ask about training.',
      website: '',
    });

    await user.click(screen.getByRole('button', { name: 'Send another message' }));
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('a second tap while the request is running does not send twice', async () => {
    let finish: (value: { ok: boolean }) => void = () => undefined;
    const submit = vi.fn(() => new Promise<{ ok: boolean }>((resolve) => (finish = resolve)));
    const user = userEvent.setup();
    renderWithI18n(<ContactForm submit={submit} />, 'en');

    await fill(user);
    const button = screen.getByRole('button', { name: 'Send message' });
    await user.click(button);
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Sending...' }));
    expect(submit).toHaveBeenCalledTimes(1);

    finish({ ok: true });
    expect(await screen.findByText('We got your message')).toBeInTheDocument();
  });

  it('keeps the typed text and shows an error when sending fails', async () => {
    const submit = vi.fn().mockResolvedValue({ ok: false });
    const user = userEvent.setup();
    renderWithI18n(<ContactForm submit={submit} />, 'en');

    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText(/could not be sent/)).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Sara Ali');
    expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled();
  });

  it('shows the error too when the request throws', async () => {
    const submit = vi.fn().mockRejectedValue(new Error('offline'));
    const user = userEvent.setup();
    renderWithI18n(<ContactForm submit={submit} />, 'en');
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText(/could not be sent/)).toBeInTheDocument();
  });
});
