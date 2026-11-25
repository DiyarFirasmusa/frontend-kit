import { describe, expect, it } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { PageLoading } from './page-loading';

describe('PageLoading', () => {
  it.each([false, true])('announces loading with compact=%s', (compact) => {
    renderWithProviders(<PageLoading compact={compact} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveTextContent(tt('common.loading'));
  });
  it('announces Arabic loading copy', async () => {
    await setTestLanguage('ar');
    renderWithProviders(<PageLoading />);
    expect(screen.getByRole('status')).toHaveTextContent(tt('common.loading'));
  });
});
