// Hand-written mirror of the demo backend's OpenAPI schemas. With a real spec, generate
// these instead (for example `npx openapi-typescript docs/api/openapi.json -o src/types/api/schema.ts`).
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';

export interface NotificationPageResponse {
  /** int64 */
  unreadCount: number | null;
  content: NotificationResponse[] | null;
  /** int32 */
  page: number | null;
  /** int32 */
  size: number | null;
  /** int64 */
  totalElements: number | null;
  /** int32 */
  totalPages: number | null;
}

export interface NotificationResponse {
  /** uuid */
  id: string;
  type: NotificationType | null;
  title: string | null;
  message: string | null;
  /** uuid */
  entityId: string | null;
  entityType: string | null;
  /** date-time */
  createdAt: string | null;
  read: boolean | null;
}
