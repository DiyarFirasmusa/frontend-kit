import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { AUDIT_ENTITY } from '@/constants/audit-entities';
import { PERMS } from '@/constants/permissions';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders, screen, within } from '@/test/render';
import type {
  AuditLogResponse,
  PageResponseAuditLogResponse,
} from '@/types/api/audit';
import { AuditLogButton } from './audit-log-button';

const USER_ID = '6f1d2c3a-0000-4000-8000-000000000001';

function makeEntry(
  overrides: Partial<AuditLogResponse> = {},
): AuditLogResponse {
  return {
    id: 'log-1',
    entity: 'ITEM_CATEGORY',
    entityId: 'item-1',
    parentEntity: null,
    parentId: null,
    action: 'UPDATE',
    changedBy: USER_ID,
    changedAt: '2026-10-17T14:33:00Z',
    changes: [{ field: 'name', oldValue: 'Gloves', newValue: null }],
    ...overrides,
  };
}

function page(
  content: AuditLogResponse[],
  pageNumber = 0,
  totalPages = 1,
): PageResponseAuditLogResponse {
  return {
    content,
    page: pageNumber,
    size: 20,
    totalElements: content.length,
    totalPages,
  };
}

describe('AuditLogButton', () => {
  beforeEach(() => {
    signIn({ permissions: [PERMS.auditLog.read] });
  });

  it('renders nothing without audit_log:read', () => {
    signIn({ permissions: [] });
    renderWithProviders(<AuditLogButton entity={AUDIT_ENTITY.itemCategory} />);
    expect(
      screen.queryByRole('button', { name: tt('auditLog.open') }),
    ).not.toBeInTheDocument();
  });

  it('loads nothing until opened, then lists the changes with the resolved name', async () => {
    const seen: URLSearchParams[] = [];
    server.use(
      http.get(api(endpoints.auditLog.list), ({ request }) => {
        seen.push(new URL(request.url).searchParams);
        return HttpResponse.json(page([makeEntry()]));
      }),
      http.post(api(endpoints.directory.resolve), () =>
        HttpResponse.json([
          { id: USER_ID, name: 'Ali Al-Karkhi', avatarUrl: null },
        ]),
      ),
    );
    const { user } = renderWithProviders(
      <AuditLogButton entity={AUDIT_ENTITY.itemCategory} entityId="item-1" />,
    );
    expect(seen).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: tt('auditLog.open') }));

    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByText('Gloves')).toBeInTheDocument();
    expect(within(dialog).getByText('—')).toBeInTheDocument();
    expect(
      within(dialog).getByText(tt('auditLog.actions.UPDATE')),
    ).toBeInTheDocument();
    expect(
      await within(dialog).findByText('Ali Al-Karkhi'),
    ).toBeInTheDocument();
    expect(seen[0]?.get('entity')).toBe('ITEM_CATEGORY');
    expect(seen[0]?.get('entityId')).toBe('item-1');
    expect(seen[0]?.get('page')).toBe('0');
  });

  it('omits entityId for an entity-wide log and shows the empty state', async () => {
    let params: URLSearchParams | undefined;
    server.use(
      http.get(api(endpoints.auditLog.list), ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json(page([]));
      }),
    );
    const { user } = renderWithProviders(
      <AuditLogButton entity={AUDIT_ENTITY.unitOfMeasure} />,
    );

    await user.click(screen.getByRole('button', { name: tt('auditLog.open') }));

    expect(await screen.findByText(tt('auditLog.empty'))).toBeInTheDocument();
    expect(params?.has('entityId')).toBe(false);
  });

  it('loads the next page on "show more"', async () => {
    server.use(
      http.get(api(endpoints.auditLog.list), ({ request }) => {
        const pageNumber = Number(
          new URL(request.url).searchParams.get('page'),
        );
        return HttpResponse.json(
          pageNumber === 0
            ? page([makeEntry()], 0, 2)
            : page(
                [makeEntry({ id: 'log-2', action: 'CREATE', changes: [] })],
                1,
                2,
              ),
        );
      }),
    );
    const { user } = renderWithProviders(
      <AuditLogButton entity={AUDIT_ENTITY.itemCategory} entityId="item-1" />,
    );
    await user.click(screen.getByRole('button', { name: tt('auditLog.open') }));

    await user.click(
      await screen.findByRole('button', { name: tt('auditLog.loadMore') }),
    );

    expect(
      await screen.findByText(tt('auditLog.actions.CREATE')),
    ).toBeInTheDocument();
    expect(screen.getByText(tt('auditLog.noFieldChanges'))).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: tt('auditLog.loadMore') }),
    ).not.toBeInTheDocument();
  });

  it('shows the error state with a retry', async () => {
    server.use(
      http.get(api(endpoints.auditLog.list), () =>
        HttpResponse.json({ message: 'bad' }, { status: 400 }),
      ),
    );
    const { user } = renderWithProviders(
      <AuditLogButton entity={AUDIT_ENTITY.warehouse} entityId="wh-1" />,
    );
    await user.click(screen.getByRole('button', { name: tt('auditLog.open') }));

    expect(
      await screen.findByRole('button', { name: tt('common.tryAgain') }),
    ).toBeInTheDocument();
  });

  it('renders the button label in Arabic', async () => {
    await setTestLanguage('ar');
    renderWithProviders(<AuditLogButton entity={AUDIT_ENTITY.itemCategory} />);

    expect(
      screen.getByRole('button', { name: 'سجل التغييرات' }),
    ).toBeInTheDocument();
  });

  it('accepts a custom label and variant, and can drop the icon', () => {
    renderWithProviders(
      <AuditLogButton
        entity={AUDIT_ENTITY.attributeDefinition}
        entityId="doc-1"
        label="Decision log"
        variant="default"
        showIcon={false}
      />,
    );

    const button = screen.getByRole('button', { name: 'Decision log' });
    expect(button).toHaveClass('btn-primary');
    expect(button.querySelector('svg')).toBeNull();
  });

  it('keeps the outline variant and icon by default', () => {
    renderWithProviders(<AuditLogButton entity={AUDIT_ENTITY.itemCategory} />);

    const button = screen.getByRole('button', { name: tt('auditLog.open') });
    expect(button).toHaveClass('btn-outline');
    expect(button.querySelector('svg')).not.toBeNull();
  });
});
