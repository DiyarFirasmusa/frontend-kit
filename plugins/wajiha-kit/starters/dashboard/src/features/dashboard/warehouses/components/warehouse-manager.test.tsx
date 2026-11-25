import { describe, expect, it } from 'vitest';
import { serveDirectoryNames } from '@/test/msw/directory';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { WarehouseManager } from './warehouse-manager';

const USER = '6f1d2c3a-0000-4000-8000-000000000001';
const EMPLOYEE = '3c9a1f20-0000-4000-8000-000000000010';

describe('WarehouseManager', () => {
  it('shows the manager name from the warehouse without asking the directory', async () => {
    const bodies = serveDirectoryNames({ [USER]: 'Directory name' });
    renderWithProviders(
      <WarehouseManager
        warehouse={{
          managerName: 'Sara Ali',
          managerUserId: USER,
          managerEmployeeId: null,
        }}
      />,
    );
    expect(screen.getByText('Sara Ali')).toBeInTheDocument();
    await Promise.resolve();
    expect(bodies).toHaveLength(0);
  });

  it('resolves the manager user id when the warehouse has no name', async () => {
    const bodies = serveDirectoryNames({ [USER]: 'Sara Ali' });
    renderWithProviders(
      <WarehouseManager
        warehouse={{
          managerName: null,
          managerUserId: USER,
          managerEmployeeId: EMPLOYEE,
        }}
      />,
    );
    expect(screen.getByText('6f1d2c3a')).toBeInTheDocument();
    expect(await screen.findByText('Sara Ali')).toBeInTheDocument();
    expect(bodies).toEqual([{ userIds: [USER] }]);
  });

  it('resolves the manager employee id when there is no manager user', async () => {
    const bodies = serveDirectoryNames({ [EMPLOYEE]: 'Laila Kareem' });
    renderWithProviders(
      <WarehouseManager
        warehouse={{
          managerName: '  ',
          managerUserId: null,
          managerEmployeeId: EMPLOYEE,
        }}
      />,
    );
    expect(await screen.findByText('Laila Kareem')).toBeInTheDocument();
    expect(bodies).toEqual([{ employeeIds: [EMPLOYEE] }]);
  });

  it('renders an em dash without a manager', async () => {
    const bodies = serveDirectoryNames({});
    renderWithProviders(
      <WarehouseManager
        warehouse={{
          managerName: null,
          managerUserId: null,
          managerEmployeeId: null,
        }}
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
    await waitFor(() => {
      expect(bodies).toHaveLength(0);
    });
  });
});
