import type { AuditEntity } from '@/types/api/enums';

/** Named handles for the audit log's entity filter, so callers never type the string. */
export const AUDIT_ENTITY = {
  attributeDefinition: 'ATTRIBUTE_DEFINITION',
  attributeOption: 'ATTRIBUTE_OPTION',
  categoryAttribute: 'CATEGORY_ATTRIBUTE',
  itemCategory: 'ITEM_CATEGORY',
  location: 'LOCATION',
  unitOfMeasure: 'UNIT_OF_MEASURE',
  warehouse: 'WAREHOUSE',
  warehouseUser: 'WAREHOUSE_USER',
} as const satisfies Record<string, AuditEntity>;
