import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { publicEnv } from '@/shared/env/public-env';
import { useToastStore } from '@/shared/store/toast-store';
import { tt } from '@/test/i18n';
import { server } from '@/test/msw-server';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { useAuthStore } from '../store/auth-store';
import { startSession } from '../store/session';
import { SettingsPage } from './index';

function signIn(name = 'Demo Admin') {
  startSession({
    accessToken: 'mock-token-admin-abc',
    user: { id: 'u1', username: 'demo', name },
    roles: ['admin'],
    permissions: [],
  });
}

const nameField = () => screen.findByLabelText(new RegExp(`^${tt('settings.name')}`, 'u'));

describe('<SettingsPage>', () => {
  it('loads the profile into the form', async () => {
    signIn();
    renderWithProviders(<SettingsPage />);
    expect(await nameField()).toHaveValue('Demo Admin');
  });

  it('shows an error with a retry when the profile cannot be loaded', async () => {
    signIn();
    server.use(
      http.get(`${publicEnv.VITE_ADMIN_API_URL}/profile`, () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );
    const { user } = renderWithProviders(<SettingsPage />);
    expect(await screen.findByText(tt('settings.loadError'))).toBeInTheDocument();
    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: tt('ui.tryAgain') }));
    expect(await nameField()).toHaveValue('Demo Admin');
  });

  it('saves the profile, toasts, and updates the name kept for the top bar', async () => {
    signIn();
    const { user } = renderWithProviders(<SettingsPage />);
    const field = await nameField();
    await user.clear(field);
    await user.type(field, 'Sara Ahmed');
    await user.click(screen.getByRole('button', { name: tt('ui.save') }));
    await waitFor(() => {
      expect(useAuthStore.getState().user?.name).toBe('Sara Ahmed');
    });
    expect(useToastStore.getState().toasts).toEqual([
      expect.objectContaining({ tone: 'success', message: { key: 'settings.saved' } }),
    ]);
  });

  it('asks for the name before it sends anything', async () => {
    signIn();
    const { user } = renderWithProviders(<SettingsPage />);
    const field = await nameField();
    await user.clear(field);
    await user.click(screen.getByRole('button', { name: tt('ui.save') }));
    expect(await screen.findByText(tt('settings.nameRequired'))).toBeInTheDocument();
    expect(useAuthStore.getState().user?.name).toBe('Demo Admin');
  });
});
