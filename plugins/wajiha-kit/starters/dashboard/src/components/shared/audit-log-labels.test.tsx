import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { AUDIT_ENTITY } from '@/constants/audit-entities';
import { PERMS } from '@/constants/permissions';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders, screen, within } from '@/test/render';
import {
  AuditActionValues,
  AuditEntityValues,
  type AuditEntity,
} from '@/types/api/enums';
import { AuditLogButton } from './audit-log-button';

describe('audit log labels', () => {
  beforeEach(() => {
    signIn({ permissions: [PERMS.auditLog.view] });
  });

  it('has an English and Arabic label for every entity and action in the spec', () => {
    for (const bundle of [en, ar]) {
      for (const entity of AuditEntityValues) {
        expect(bundle.auditLog.entities[entity]).toBeTruthy();
      }
      for (const action of AuditActionValues) {
        expect(bundle.auditLog.actions[action]).toBeTruthy();
      }
    }
  });

  it('maps every AUDIT_ENTITY key to a spec entity', () => {
    const values: readonly AuditEntity[] = AuditEntityValues;
    for (const value of Object.values(AUDIT_ENTITY)) {
      expect(values).toContain(value);
    }
    expect(Object.keys(AUDIT_ENTITY)).toHaveLength(AuditEntityValues.length);
  });

  it('names the entity in the dialog and flags entries of another entity', async () => {
    server.use(
      http.get(api(endpoints.auditLog.list), () =>
        HttpResponse.json({
          content: [
            {
              id: 'log-1',
              entity: 'ATTRIBUTE_OPTION',
              entityId: 'line-1',
              parentEntity: 'ATTRIBUTE_DEFINITION',
              parentId: 'doc-1',
              action: 'DELETE',
              changedBy: null,
              changedAt: '2026-10-17T14:33:00Z',
              changes: [],
            },
          ],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
        }),
      ),
    );
    const { user } = renderWithProviders(
      <AuditLogButton
        entity={AUDIT_ENTITY.attributeDefinition}
        entityId="doc-1"
      />,
    );
    await user.click(screen.getByRole('button', { name: tt('auditLog.open') }));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getAllByText(
        new RegExp(tt('auditLog.entities.ATTRIBUTE_DEFINITION')),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      await within(dialog).findByText(tt('auditLog.entities.ATTRIBUTE_OPTION')),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(tt('auditLog.actions.DELETE')),
    ).toBeInTheDocument();
  });

  it('shows the Arabic entity label', async () => {
    await setTestLanguage('ar');
    server.use(
      http.get(api(endpoints.auditLog.list), () =>
        HttpResponse.json({
          content: [],
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
        }),
      ),
    );
    const { user } = renderWithProviders(
      <AuditLogButton entity={AUDIT_ENTITY.warehouse} />,
    );
    await user.click(screen.getByRole('button', { name: 'سجل التغييرات' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/مستودع/)).toBeInTheDocument();
  });
});
