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
import { logout } from '../auth/logout.service';
import { useAuthStore } from '../store/auth-store';
import { useEndSession } from './end-session';

/** The signed-in user's name, a link to settings and sign out. */
export function UserMenu({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const endSession = useEndSession(locale);
  const user = useAuthStore((state) => state.user);

  const signOut = () => {
    // Read the token before the session is cleared: the request must still identify it.
    void logout(useAuthStore.getState().accessToken);
    endSession();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="max-w-48">
            <User className="size-4" aria-hidden="true" />
            <span className="truncate">{user?.name ?? ''}</span>
            {/* The visible name comes first, so the accessible name starts with it (WCAG 2.5.3). */}
            <span className="sr-only">{t('admin.accountMenu')}</span>
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
