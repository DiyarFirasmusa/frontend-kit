// Generated from docs/api/openapi.json by scripts/gen-api-types.py — do not edit by hand.
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
