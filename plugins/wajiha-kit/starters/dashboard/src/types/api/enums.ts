// Backend enums the starter's pages use. Add an enum here when a feature needs it;
// `const X = [...] as const` is the list, `type X` the union.

export const WarehouseUserRoleValues = [
  'WAREHOUSE_MANAGER',
  'STOREKEEPER',
  'STOCK_CONTROLLER',
] as const;
export type WarehouseUserRole = (typeof WarehouseUserRoleValues)[number];

export const AttributeDataTypeValues = [
  'TEXT',
  'NUMBER',
  'BOOLEAN',
  'DATE',
  'OPTION',
] as const;
export type AttributeDataType = (typeof AttributeDataTypeValues)[number];

export const AuditEntityValues = [
  'ATTRIBUTE_DEFINITION',
  'ATTRIBUTE_OPTION',
  'CATEGORY_ATTRIBUTE',
  'ITEM_CATEGORY',
  'LOCATION',
  'UNIT_OF_MEASURE',
  'WAREHOUSE',
  'WAREHOUSE_USER',
] as const;
export type AuditEntity = (typeof AuditEntityValues)[number];

export const AuditActionValues = ['CREATE', 'UPDATE', 'DELETE'] as const;
export type AuditAction = (typeof AuditActionValues)[number];
