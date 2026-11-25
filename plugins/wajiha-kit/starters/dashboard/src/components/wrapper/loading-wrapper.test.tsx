import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { Wrapper } from './loading-wrapper';

function axiosError(status: number): AxiosError {
  const error = new AxiosError('Request failed', 'ERR_BAD_RESPONSE');
  error.response = {
    status,
    statusText: '',
    data: {},
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe('Wrapper', () => {
  it('shows a skeleton-only loading state', () => {
    renderWithProviders(
      <Wrapper isLoading data={null}>
        <p>content</p>
      </Wrapper>,
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('content')).not.toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="detail-skeleton"]'),
    ).not.toBeNull();
  });

  it('shows the error state with a retry button', async () => {
    const onRetry = vi.fn();
    const { user } = renderWithProviders(
      <Wrapper error={axiosError(500)} data={null} onRetry={onRetry}>
        <p>content</p>
      </Wrapper>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: tt('common.tryAgain') }),
    );
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith();
  });

  it('renders a 404 as the empty state, not an error', () => {
    renderWithProviders(
      <Wrapper error={axiosError(404)} data={null}>
        <p>content</p>
      </Wrapper>,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText(tt('common.noData'))).toBeInTheDocument();
  });

  it('renders a 400 as a real error with retry, not empty', async () => {
    const onRetry = vi.fn();
    const { user } = renderWithProviders(
      <Wrapper error={axiosError(400)} data={null} onRetry={onRetry}>
        <p>content</p>
      </Wrapper>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText(tt('common.noData'))).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: tt('common.tryAgain') }),
    );
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders the children once data is present', () => {
    renderWithProviders(
      <Wrapper data={{ id: 1 }}>
        <p>content</p>
      </Wrapper>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the empty message for an empty array', () => {
    renderWithProviders(
      <Wrapper data={[]} emptyMessage="Nothing here">
        <p>content</p>
      </Wrapper>,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('announces the empty state as a status region with the message', () => {
    renderWithProviders(
      <Wrapper data={null} emptyMessage="No warehouses yet">
        <p>content</p>
      </Wrapper>,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('data-slot', 'wrapper-empty');
    expect(status).toHaveTextContent('No warehouses yet');
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('renders nothing when empty and hideEmpty is set', () => {
    const { container } = renderWithProviders(
      <Wrapper data={[]} hideEmpty>
        <p>content</p>
      </Wrapper>,
    );
    expect(container.querySelector('[data-slot="wrapper-empty"]')).toBeNull();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('shows the error state without retry when no onRetry is given', () => {
    renderWithProviders(
      <Wrapper error={axiosError(500)} data={null}>
        <p>content</p>
      </Wrapper>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: tt('common.tryAgain') }),
    ).not.toBeInTheDocument();
  });

  it('passes resolved data to function children', () => {
    renderWithProviders(
      <Wrapper data={{ name: 'Ali' }}>{(d) => <p>{d.name}</p>}</Wrapper>,
    );
    expect(screen.getByText('Ali')).toBeInTheDocument();
  });

  it('renders the Arabic empty and retry labels when the language is ar', async () => {
    await setTestLanguage('ar');
    const onRetry = vi.fn();
    const { user } = renderWithProviders(
      <>
        <Wrapper data={null}>
          <p>content</p>
        </Wrapper>
        <Wrapper error={axiosError(500)} data={null} onRetry={onRetry}>
          <p>content</p>
        </Wrapper>
      </>,
    );
    expect(screen.getByText('لا توجد بيانات')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: tt('common.tryAgain') }),
    ).toHaveTextContent('حاول مرة أخرى');
    await user.click(screen.getByRole('button', { name: 'حاول مرة أخرى' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('uses one heading level for the empty and error titles', () => {
    renderWithProviders(
      <>
        <Wrapper data={null}>
          <p>content</p>
        </Wrapper>
        <Wrapper error={axiosError(500)} data={null}>
          <p>content</p>
        </Wrapper>
      </>,
    );
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(2);
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull();
  });
});
