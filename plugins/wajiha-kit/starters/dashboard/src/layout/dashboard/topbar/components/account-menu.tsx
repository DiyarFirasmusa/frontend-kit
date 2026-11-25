import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, LogOut } from '@/lib/icons';

interface AccountMenuProps {
  displayName: string;
  roleLabel: string;
  orgUnitName: string | null;
  avatarUrl: string | null;
  initials: string;
  onLogout: () => void;
}

export function AccountMenu({
  displayName,
  roleLabel,
  orgUnitName,
  avatarUrl,
  initials,
  onLogout,
}: AccountMenuProps): ReactElement {
  const { t } = useTranslation();
  const subtitle = [roleLabel, orgUnitName]
    .filter((part) => part && part !== '—')
    .join(' • ');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="account-trigger"
        className="topbar-chip topbar-chip-soft min-w-0 text-start"
      >
        <UserAvatar
          src={avatarUrl}
          initials={initials}
          className="text-button-2 size-8 rounded-lg"
        />
        <span className="flex min-w-0 flex-col leading-tight max-md:sr-only">
          <span className="text-button-2 text-text-primary truncate">
            {displayName}
          </span>
          <span className="text-b3 text-text-secondary truncate">
            {roleLabel}
          </span>
        </span>
        <ChevronDown
          aria-hidden
          className="text-text-secondary size-4 shrink-0 max-md:hidden"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-1">
            <span className="text-h4 text-text-primary">{displayName}</span>
            {subtitle ? (
              <span className="text-b3 text-text-secondary font-normal">
                {subtitle}
              </span>
            ) : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="text-b1 h-10"
          onClick={onLogout}
        >
          <LogOut className="size-4" /> {t('common.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
