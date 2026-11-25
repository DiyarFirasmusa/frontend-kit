import { type NotificationResponse } from '@/types/api/notifications';
/** Notifications shown in the top bar. Each points at a page that exists. */
import { isoDaysAgo, makeId } from './base';
import { warehouseId } from './warehouses';

export const notifications: NotificationResponse[] = [
  {
    id: makeId(0xf5, 1),
    type: 'INFO',
    title: 'تمت إضافة مستودع جديد',
    message: 'أُضيف مستودع جديد إلى القائمة. راجع بياناته وأعضاءه.',
    entityId: warehouseId(0),
    entityType: 'WAREHOUSE',
    createdAt: isoDaysAgo(0, 9, 12),
    read: false,
  },
  {
    id: makeId(0xf5, 2),
    type: 'WARNING',
    title: 'مستودع بدون مدير',
    message: 'يوجد مستودع لم يُعيَّن له مدير بعد.',
    entityId: warehouseId(4),
    entityType: 'WAREHOUSE',
    createdAt: isoDaysAgo(0, 8, 40),
    read: false,
  },
  {
    id: makeId(0xf5, 3),
    type: 'INFO',
    title: 'تعديل على بيانات مورد',
    message: 'عُدّلت بيانات الاتصال لأحد الموردين.',
    entityId: null,
    entityType: 'SUPPLIER',
    createdAt: isoDaysAgo(1, 15, 5),
    read: false,
  },
  {
    id: makeId(0xf5, 4),
    type: 'SUCCESS',
    title: 'اكتمل تحديث التصنيفات',
    message: 'حُدّثت شجرة التصنيفات وخصائصها بنجاح.',
    entityId: null,
    entityType: 'CATEGORY',
    createdAt: isoDaysAgo(1, 11, 30),
    read: false,
  },
  {
    id: makeId(0xf5, 5),
    type: 'DANGER',
    title: 'وحدة قياس غير مفعّلة',
    message: 'عُطّلت وحدة قياس كانت مستخدمة. راجع السجلات المرتبطة بها.',
    entityId: null,
    entityType: 'UNIT_OF_MEASURE',
    createdAt: isoDaysAgo(2, 10, 0),
    read: true,
  },
  {
    id: makeId(0xf5, 6),
    type: 'INFO',
    title: 'مرحباً بك',
    message:
      'هذه بيانات تجريبية تعمل بدون خادم. أي تعديل يبقى حتى تحدّث الصفحة.',
    entityId: null,
    entityType: null,
    createdAt: isoDaysAgo(3, 9, 0),
    read: true,
  },
];
