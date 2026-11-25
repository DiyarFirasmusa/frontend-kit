import { beforeAll, describe, expect, it } from 'vitest';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { tt } from '@/test/i18n';
import { serveDirectoryNames } from '@/test/msw/directory';
import { renderWithProviders, screen } from '@/test/render';
import { makeWarehouse } from '../../../warehouse-test-utils';
import { OverviewTab } from './overview-tab';

const ORG_UNIT = '9b8a7c6d-0000-4000-8000-000000000020';
const EMPLOYEE = '3c9a1f20-0000-4000-8000-000000000010';

function fieldValue(label: string): HTMLElement {
  return screen.getByRole('textbox', { name: label });
}

describe('OverviewTab names', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  it('shows the manager name the warehouse carries', () => {
    serveDirectoryNames({});
    renderWithProviders(
      <OverviewTab warehouse={makeWarehouse({ managerName: 'Sara Ali' })} />,
    );
    expect(fieldValue(tt('warehouses.overview.manager'))).toHaveTextContent(
      'Sara Ali',
    );
  });

  it('resolves the manager employee name', async () => {
    const bodies = serveDirectoryNames({
      [EMPLOYEE]: 'Laila Kareem',
    });
    renderWithProviders(
      <OverviewTab
        warehouse={makeWarehouse({
          managerUserId: null,
          managerEmployeeId: EMPLOYEE,
          hrOrgUnitId: ORG_UNIT,
        })}
      />,
    );
    expect(await screen.findByText('Laila Kareem')).toBeInTheDocument();
    expect(fieldValue(tt('warehouses.overview.manager'))).toHaveTextContent(
      'Laila Kareem',
    );
    expect(bodies).toEqual([{ employeeIds: [EMPLOYEE] }]);
  });
});
