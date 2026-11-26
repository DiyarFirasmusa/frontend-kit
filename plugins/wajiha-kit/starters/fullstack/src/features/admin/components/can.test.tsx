import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { PERMS } from '../constants/permissions';
import { usePermissionStore } from '../store/permission-store';
import { Can } from './can';

function grant(permissions: string[], roles: string[] = []): void {
  usePermissionStore.getState().setPermissions({ permissions, roles });
}

describe('<Can>', () => {
  beforeEach(() => {
    usePermissionStore.getState().clear();
  });

  it('renders children when the permission is held', () => {
    grant([PERMS.supplier.write]);
    render(
      <Can permission={PERMS.supplier.write}>
        <span>add supplier</span>
      </Can>,
    );
    expect(screen.getByText('add supplier')).toBeInTheDocument();
  });

  it('renders the fallback when the permission is missing', () => {
    grant([PERMS.supplier.read]);
    render(
      <Can permission={PERMS.supplier.write} fallback={<span>read only</span>}>
        <span>add supplier</span>
      </Can>,
    );
    expect(screen.queryByText('add supplier')).not.toBeInTheDocument();
    expect(screen.getByText('read only')).toBeInTheDocument();
  });

  it('renders nothing by default when denied', () => {
    render(
      <Can permission={PERMS.supplier.write}>
        <span>add supplier</span>
      </Can>,
    );
    expect(screen.queryByText('add supplier')).not.toBeInTheDocument();
  });

  it('anyOf passes with one of several permissions', () => {
    grant([PERMS.supplier.delete]);
    render(
      <Can anyOf={[PERMS.supplier.write, PERMS.supplier.delete]}>
        <span>manage</span>
      </Can>,
    );
    expect(screen.getByText('manage')).toBeInTheDocument();
  });

  it('the admin role passes every check', () => {
    grant([], ['admin']);
    render(
      <Can permission={PERMS.supplier.delete}>
        <span>delete</span>
      </Can>,
    );
    expect(screen.getByText('delete')).toBeInTheDocument();
  });
});
