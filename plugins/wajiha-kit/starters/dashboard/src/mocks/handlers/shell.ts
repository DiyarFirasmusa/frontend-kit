import { http } from 'msw';
import { endpoints } from '@/constants/api';
import { type PageResponseAuditLogResponse } from '@/types/api/audit';
import {
  type DirectoryEntryResponse,
  type DirectoryResolveRequest,
  type RoleResponse,
} from '@/types/api/directory';
import { type NotificationPageResponse } from '@/types/api/notifications';
/** Directory, notifications, audit log. */
import {
  api,
  intParam,
  matches,
  noContent,
  notFound,
  ok,
  paginate,
  param,
  readJson,
  textParam,
} from '../core';
import { auditLog } from '../seed/misc';
import { notifications } from '../seed/notifications';
import { directory, roles, type DirectoryKindKey } from '../seed/people';

export const shellHandlers = [
  // ----- Directory -----
  http.post(api(endpoints.directory.resolve), async ({ request }) => {
    const body = await readJson<DirectoryResolveRequest>(request);
    const ids = new Set([
      ...(body.userIds ?? []),
      ...(body.employeeIds ?? []),
      ...(body.orgUnitIds ?? []),
    ]);
    const response: DirectoryEntryResponse[] = directory
      .filter((entry) => ids.has(entry.id))
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        avatarUrl: null,
        subtitle: entry.subtitle,
        employmentStatus: entry.employmentStatus,
      }));
    return ok(response);
  }),

  http.get(api(endpoints.directory.search), async ({ request }) => {
    const url = new URL(request.url);
    const kind = (url.searchParams.get('kind') ?? 'USER') as DirectoryKindKey;
    const q = textParam(url, 'q');
    const limit = intParam(url, 'limit', 20);
    const response: DirectoryEntryResponse[] = directory
      .filter(
        (entry) =>
          entry.kind === kind && matches(q, entry.name, entry.subtitle),
      )
      .slice(0, limit)
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        avatarUrl: null,
        subtitle: entry.subtitle,
        employmentStatus: entry.employmentStatus,
      }));
    return ok(response);
  }),

  http.get(api(endpoints.directory.roles), async () => {
    const response: RoleResponse[] = roles;
    return ok(response);
  }),

  // ----- Notifications -----
  http.get(api(endpoints.notifications.list), async ({ request }) => {
    const url = new URL(request.url);
    const sorted = [...notifications].toSorted((a, b) =>
      (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
    );
    const response: NotificationPageResponse = {
      unreadCount: notifications.filter((n) => n.read !== true).length,
      ...paginate(sorted, intParam(url, 'page', 0), intParam(url, 'size', 20)),
    };
    return ok(response);
  }),

  http.post(
    api(endpoints.notifications.read(':id')),
    async ({ params, request }) => {
      const notification = notifications.find(
        (n) => n.id === param(params, 'id'),
      );
      if (!notification) {
        return notFound(request);
      }
      notification.read = true;
      return noContent();
    },
  ),

  // ----- Audit log -----
  http.get(api(endpoints.auditLog.list), async ({ request }) => {
    const url = new URL(request.url);
    const entity = textParam(url, 'entity');
    const entityId = textParam(url, 'entityId');
    const rows = auditLog
      .filter((entry) => {
        if (entityId !== '') {
          return (
            (entry.entity === entity && entry.entityId === entityId) ||
            (entry.parentEntity === entity && entry.parentId === entityId)
          );
        }
        return entity === '' || entry.entity === entity;
      })
      .toSorted((a, b) => (b.changedAt ?? '').localeCompare(a.changedAt ?? ''));
    const response: PageResponseAuditLogResponse = paginate(
      rows,
      intParam(url, 'page', 0),
      intParam(url, 'size', 20),
    );
    return ok(response);
  }),
];
