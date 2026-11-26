import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { TooltipProvider } from '@/components/ui/tooltip';
import { createSiteI18n } from '@/features/site/i18n/resources';
import { directionOf, toLocale, type Locale } from '@/shared/lib/i18n/languages';
import { testI18n } from './i18n';

/** Renders with a fresh per-test i18n instance in the given language (the same shape the router provides). */
export function renderWithI18n(ui: ReactElement, locale: Locale = 'en'): RenderResult {
  return render(<I18nextProvider i18n={createSiteI18n(locale)}>{ui}</I18nextProvider>);
}

/** A QueryClient with retries off, so a failing query settles at once. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

function Providers({ children, queryClient }: { children: ReactNode; queryClient: QueryClient }) {
  return (
    <I18nextProvider i18n={testI18n}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div dir={directionOf(toLocale(testI18n.language))}>{children}</div>
        </TooltipProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

type ProvidersOptions = Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient };

/** Renders inside the admin's providers (i18n with admin text, query client, tooltips, direction). */
export function renderWithProviders(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), ...options }: ProvidersOptions = {},
) {
  const user = userEvent.setup();
  const result = render(ui, {
    wrapper: ({ children }) => <Providers queryClient={queryClient}>{children}</Providers>,
    ...options,
  });
  return { ...result, user, queryClient };
}

export * from '@testing-library/react';
export { userEvent };
