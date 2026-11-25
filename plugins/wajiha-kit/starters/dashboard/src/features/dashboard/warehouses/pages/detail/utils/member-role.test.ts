import { describe, expect, it } from 'vitest';
import {
  memberInitials,
  memberRoleLabelKey,
  memberRoleOptions,
  memberRoleTone,
} from './member-role';

describe('member role helpers', () => {
  it('maps each role to a tone and a locale key', () => {
    expect(memberRoleTone('WAREHOUSE_MANAGER')).toBe('brand');
    expect(memberRoleTone('STOREKEEPER')).toBe('info');
    expect(memberRoleTone('STOCK_CONTROLLER')).toBe('warning');
    expect(memberRoleLabelKey('STOREKEEPER')).toBe(
      'warehouses.members.roles.STOREKEEPER',
    );
  });

  it('lists the three backend roles as select options', () => {
    expect(memberRoleOptions((key) => key)).toEqual([
      {
        value: 'WAREHOUSE_MANAGER',
        label: 'warehouses.members.roles.WAREHOUSE_MANAGER',
      },
      {
        value: 'STOREKEEPER',
        label: 'warehouses.members.roles.STOREKEEPER',
      },
      {
        value: 'STOCK_CONTROLLER',
        label: 'warehouses.members.roles.STOCK_CONTROLLER',
      },
    ]);
  });
});

describe('memberInitials', () => {
  it('takes the first two letters of the name', () => {
    expect(memberInitials('حسين الشمري')).toBe('حس');
    expect(memberInitials(' Omar Hadi ')).toBe('Om');
  });

  it('renders an em dash for an empty name', () => {
    expect(memberInitials('  ')).toBe('—');
  });
});
