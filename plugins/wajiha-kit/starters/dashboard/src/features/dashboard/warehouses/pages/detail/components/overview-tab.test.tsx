import { beforeAll, describe, expect, it } from 'vitest';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { makeWarehouse } from '../../../warehouse-test-utils';
import { OverviewTab } from './overview-tab';

function field(label: string): HTMLElement {
  return screen.getByRole('textbox', { name: new RegExp(`^${label}`) });
}

describe('OverviewTab', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  it('renders the warehouse fields as read-only boxes', () => {
    renderWithProviders(<OverviewTab warehouse={makeWarehouse()} />);

    expect(field('Warehouse name')).toHaveTextContent(
      'Baghdad central warehouse',
    );
    expect(field('Warehouse code')).toHaveTextContent('BGD-01');
    expect(field('Warehouse code')).toHaveAttribute('aria-readonly', 'true');
    expect(field('Address')).toHaveTextContent('Baghdad, industrial zone');
    expect(
      screen.getByText(tt('warehouses.overview.codeLocked')),
    ).toBeInTheDocument();
  });

  it('shows the transit and active flags as read-only switches', () => {
    renderWithProviders(
      <OverviewTab warehouse={makeWarehouse({ isTransit: true })} />,
    );

    expect(
      screen.getByRole('switch', { name: 'Transit warehouse' }),
    ).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Active' })).toBeChecked();
  });

  it('renders an em dash for empty address and manager', () => {
    renderWithProviders(
      <OverviewTab
        warehouse={makeWarehouse({
          address: null,
          managerUserId: null,
          managerEmployeeId: null,
        })}
      />,
    );

    expect(field('Address')).toHaveTextContent('—');
    expect(field('Manager')).toHaveTextContent('—');
  });

  it('shows the location count from the warehouse in the map tile', () => {
    renderWithProviders(
      <OverviewTab warehouse={makeWarehouse({ locationCount: 3 })} />,
    );

    expect(screen.getByText('3 storage locations')).toBeInTheDocument();
  });

  it('renders an em dash when the location count is missing', () => {
    renderWithProviders(
      <OverviewTab warehouse={makeWarehouse({ locationCount: null })} />,
    );

    expect(screen.queryByText(/storage locations/)).not.toBeInTheDocument();
    expect(
      screen.getByText(tt('warehouses.overview.map')).parentElement,
    ).toHaveTextContent('—');
  });

  it('renders the Arabic labels', async () => {
    await setTestLanguage('ar');
    renderWithProviders(<OverviewTab warehouse={makeWarehouse()} />);

    expect(field(tt('warehouses.overview.name'))).toHaveTextContent(
      'Baghdad central warehouse',
    );
    expect(screen.getByText(tt('warehouses.overview.map'))).toBeInTheDocument();
  });
});
