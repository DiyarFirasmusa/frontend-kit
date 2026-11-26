import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User } from '@/components/ui/icons';
import type { Locale } from '@/shared/lib/i18n/languages';
import { privateApi } from '../api/client';
import { endpoints } from '../api/endpoints';
import { useAuthStore } from '../store/auth-store';

/** The signed-in user's name, a link to settings and sign out. */
export function UserMenu({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const clear = useAuthStore((state) => state.clear);

  const signOut = () => {
    // Best effort: the session ends here whatever the server answers.
    void privateApi.post(endpoints.auth.logout, null, { silentError: true }).catch(() => undefined);
    clear();
    queryClient.clear();
    void navigate({ to: '/$locale/admin/login', params: { locale } });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="max-w-48" aria-label={t('admin.accountMenu')}>
            <User className="size-4" />
            <span className="truncate">{user?.name ?? ''}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-48">
        {/* Base UI wants a group label inside a group. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>{user?.username ?? ''}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void navigate({ to: '/$locale/admin/settings', params: { locale } });
          }}
        >
          <Settings />
          {t('admin.navSettings')}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <LogOut />
          {t('admin.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
