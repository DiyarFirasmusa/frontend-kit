import { type RoleResponse } from '@/types/api/directory';
import { type MeResponse } from '@/types/api/me';
/** Signed-in user, directory of people, roles. */
import { ALL_PERMISSIONS, ROLES, TENANT_ID, makeId } from './base';

// Directory: users, employees, org units
// ---------------------------------------------------------------------------

export type DirectoryKindKey = 'USER' | 'EMPLOYEE' | 'ORG_UNIT';

export interface DirectoryRecord {
  id: string;
  kind: DirectoryKindKey;
  name: string;
  subtitle: string | null;
  employmentStatus: string | null;
}

export const PEOPLE: { name: string; jobTitle: string }[] = [
  { name: 'علي حسن الكرخي', jobTitle: 'مدير المخازن' },
  { name: 'زينب كاظم الموسوي', jobTitle: 'أمينة مخزن' },
  { name: 'مصطفى عبد الأمير الساعدي', jobTitle: 'مدير مستودع البصرة' },
  { name: 'حيدر جبار العبودي', jobTitle: 'مدير المستودع الرئيسي' },
  { name: 'نور الهدى سلمان', jobTitle: 'صيدلانية - مسؤولة المخزن الطبي' },
  { name: 'أحمد فاضل الربيعي', jobTitle: 'أمين مخزن' },
  { name: 'سارة عماد الجبوري', jobTitle: 'مدققة مخزنية' },
  { name: 'كرار ناصر الحلفي', jobTitle: 'مدير مستودع النجف' },
  { name: 'رسل محمد التميمي', jobTitle: 'محاسبة مخازن' },
  { name: 'عمر خالد العاني', jobTitle: 'أمين مخزن' },
  { name: 'ياسر عبد الرزاق البدري', jobTitle: 'مدير مستودع كربلاء' },
  { name: 'هبة صباح الدليمي', jobTitle: 'مدققة مخزنية' },
  { name: 'محمد رياض الشمري', jobTitle: 'أمين مخزن' },
  { name: 'دعاء علي الزبيدي', jobTitle: 'موظفة مشتريات' },
  { name: 'آزاد كريم البرزنجي', jobTitle: 'مدير مستودع أربيل' },
  { name: 'حسين علاء المياحي', jobTitle: 'سائق ومسؤول نقل' },
  { name: 'مريم جواد الخفاجي', jobTitle: 'أمينة مخزن' },
  { name: 'سيف الدين قاسم النعيمي', jobTitle: 'فني صيانة' },
];

export const userId = (index: number): string => makeId(0x10, index + 1);
export const employeeId = (index: number): string => makeId(0x11, index + 1);

/** The signed-in mock user is the first person. */
export const ME_USER_ID = userId(0);

const ORG_UNITS = [
  'قسم المخازن - الإدارة العامة',
  'القسم المالي',
  'قسم المشتريات',
  'فرع البصرة',
  'فرع أربيل',
  'فرع النجف',
  'قسم الصيانة',
  'القسم الطبي',
  'فرع كربلاء',
];

export const orgUnitId = (index: number): string => makeId(0x12, index + 1);

export const directory: DirectoryRecord[] = [
  ...PEOPLE.map(
    (person, i): DirectoryRecord => ({
      id: userId(i),
      kind: 'USER',
      name: person.name,
      subtitle: person.jobTitle,
      employmentStatus: 'ACTIVE',
    }),
  ),
  ...PEOPLE.map(
    (person, i): DirectoryRecord => ({
      id: employeeId(i),
      kind: 'EMPLOYEE',
      name: person.name,
      subtitle: person.jobTitle,
      employmentStatus: i === 15 ? 'ON_LEAVE' : 'ACTIVE',
    }),
  ),
  ...ORG_UNITS.map(
    (name, i): DirectoryRecord => ({
      id: orgUnitId(i),
      kind: 'ORG_UNIT',
      name,
      subtitle: 'شركة المثال للتجهيزات العامة',
      employmentStatus: null,
    }),
  ),
];

export function directoryName(id: string | null | undefined): string | null {
  if (!id) {
    return null;
  }
  return directory.find((entry) => entry.id === id)?.name ?? null;
}

export const roles: RoleResponse[] = [
  { code: 'SUPERADMIN', name: 'مدير النظام', description: 'صلاحيات كاملة' },
  {
    code: 'INVENTORY_MANAGER',
    name: 'مدير المخازن',
    description: 'إدارة المستودعات والموافقات',
  },
  {
    code: 'INVENTORY_USER',
    name: 'أمين مخزن',
    description: 'إدخال المستندات والجرد',
  },
  { code: 'FINANCE', name: 'المالية', description: 'التقييم والإقفال الشهري' },
];

export const me: MeResponse = {
  userId: ME_USER_ID,
  tenantId: TENANT_ID,
  username: 'admin',
  displayName: 'علي حسن الكرخي',
  firstName: 'علي',
  lastName: 'الكرخي',
  jobTitle: 'مدير المخازن',
  orgUnitName: 'قسم المخازن - الإدارة العامة',
  avatarUrl: null,
  roles: ROLES,
  permissions: ALL_PERMISSIONS,
  scopes: {},
};
