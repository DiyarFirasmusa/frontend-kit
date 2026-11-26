import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/dialog/confirm-dialog';
import { SelectControl } from '@/components/fields/select-control';
import { DataBadge } from '@/components/table/data-badge';
import { DataTableRowActions } from '@/components/table/data-table-row-actions';
import { Button } from '@/components/ui/button';
import { Wrapper } from '@/components/wrapper/loading-wrapper';
import { Plus, Trash2 } from '@/lib/icons';
import {
  WarehouseUserRoleValues,
  type WarehouseUserRole,
} from '@/types/api/enums';
import type { WarehouseUserResponse } from '@/types/api/warehouses';
import { formatDate } from '@/utils/format';
import { isOneOf } from '@/utils/is-one-of';
import { useMembersTab } from '../hooks/use-members-tab';
import {
  memberInitials,
  memberRoleLabelKey,
  memberRoleOptions,
} from '../utils/member-role';
import { AddMemberDialog } from './add-member-dialog';

interface MembersTabProps {
  warehouseId: string;
}

export function MembersTab({ warehouseId }: MembersTabProps) {
  const { t } = useTranslation();
  const tab = useMembersTab(warehouseId);

  return (
    <section
      aria-labelledby="warehouse-members-title"
      className="surface-card gap-card flex flex-col"
    >
      <div className="gap-row flex flex-wrap items-start justify-between">
        <div className="flex flex-col gap-1">
          <h2
            id="warehouse-members-title"
            className="text-h4 text-text-primary"
          >
            {t('warehouses.members.title')}
          </h2>
          <p className="text-b3 text-text-secondary">
            {t('warehouses.members.description')}
          </p>
        </div>
        {tab.canManage ? (
          <Button type="button" onClick={tab.addDialog.openAdd}>
            <Plus className="size-4" />
            {t('warehouses.members.add')}
          </Button>
        ) : null}
      </div>

      <Wrapper
        isLoading={tab.query.isLoading}
        isError={tab.query.isError}
        error={tab.query.error}
        data={tab.query.data}
        isEmpty={(rows) => rows.length === 0}
        emptyMessage={t('warehouses.members.empty')}
        onRetry={() => {
          void tab.query.refetch();
        }}
      >
        <ul className="flex flex-col">
          {tab.members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              canManage={tab.canManage}
              isRolePending={tab.roleChange.pendingUserId === member.userId}
              onRoleChange={(role) => {
                if (member.userId) {
                  tab.roleChange.onChange(member.userId, role);
                }
              }}
              onRemove={() => {
                tab.remove.onAsk(member);
              }}
            />
          ))}
        </ul>
      </Wrapper>

      <AddMemberDialog dialog={tab.addDialog} />

      <ConfirmDialog
        open={tab.remove.open}
        onOpenChange={tab.remove.onOpenChange}
        title={t('warehouses.members.removeTitle')}
        description={t('warehouses.members.removeDescription')}
        confirmLabel={t('warehouses.members.removeConfirm')}
        destructive
        isLoading={tab.remove.isPending}
        onConfirm={tab.remove.onConfirm}
      />
    </section>
  );
}

interface MemberRowProps {
  member: WarehouseUserResponse;
  canManage: boolean;
  isRolePending: boolean;
  onRoleChange: (role: WarehouseUserRole) => void;
  onRemove: () => void;
}

function MemberRow({
  member,
  canManage,
  isRolePending,
  onRoleChange,
  onRemove,
}: MemberRowProps) {
  const { t } = useTranslation();
  const name = member.userName?.trim() ?? '';

  return (
    <li className="border-stroke-subtle gap-inline flex items-center justify-between border-b py-3">
      <div className="gap-inline flex min-w-0 items-center">
        <span
          aria-hidden
          className="bg-primary text-primary-foreground text-b2 inline-flex size-10 shrink-0 items-center justify-center rounded-(--radius-control)"
        >
          {memberInitials(name)}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="gap-field flex items-center">
            <span
              className="text-h5 text-text-primary truncate"
              title={member.userId ?? undefined}
            >
              {name || '—'}
            </span>
            {member.isManager ? (
              <DataBadge tone="brand" shape="pill">
                {t('warehouses.members.managerBadge')}
              </DataBadge>
            ) : null}
          </span>
          {member.role ? (
            <MemberRole
              name={name}
              role={member.role}
              editable={canManage && Boolean(member.userId)}
              isPending={isRolePending}
              onChange={onRoleChange}
            />
          ) : (
            <span className="text-b3 text-text-secondary">
              {t('warehouses.members.addedOn', {
                date: formatDate(member.createdAt ?? undefined),
              })}
            </span>
          )}
        </div>
      </div>
      <div className="gap-inline flex items-center">
        <DataBadge
          tone={member.isActive === false ? 'neutral' : 'success'}
          shape="pill"
        >
          {member.isActive === false
            ? t('warehouses.members.inactive')
            : t('warehouses.members.active')}
        </DataBadge>
        {canManage ? (
          <DataTableRowActions
            variant="menu"
            menuLabel={`${t('warehouses.members.menu')}: ${name}`}
            actions={[
              {
                id: 'remove',
                label: t('warehouses.members.remove'),
                icon: Trash2,
                variant: 'destructive',
                onSelect: onRemove,
              },
            ]}
          />
        ) : null}
      </div>
    </li>
  );
}

interface MemberRoleProps {
  name: string;
  role: WarehouseUserRole;
  editable: boolean;
  isPending: boolean;
  onChange: (role: WarehouseUserRole) => void;
}

function MemberRole({
  name,
  role,
  editable,
  isPending,
  onChange,
}: MemberRoleProps) {
  const { t } = useTranslation();
  if (!editable) {
    return (
      <span className="text-b3 text-text-secondary">
        {t(memberRoleLabelKey(role))}
      </span>
    );
  }
  return (
    <SelectControl
      size="sm"
      value={role}
      options={memberRoleOptions(t)}
      aria-label={`${t('warehouses.members.changeRole')}: ${name}`}
      disabled={isPending}
      onChange={(next) => {
        if (next !== role && isOneOf(WarehouseUserRoleValues, next)) {
          onChange(next);
        }
      }}
    />
  );
}
