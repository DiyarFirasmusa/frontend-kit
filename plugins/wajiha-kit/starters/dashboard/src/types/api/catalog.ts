// Hand-written mirror of the demo backend's OpenAPI schemas. With a real spec, generate
// these instead (for example `npx openapi-typescript docs/api/openapi.json -o src/types/api/schema.ts`).
import type { AttributeDataType } from './enums';

export interface UnitOfMeasureRequest {
  /** max 20 chars */
  code: string;
  /** max 100 chars */
  name: string;
  /** int32, range 0–6 */
  decimalPlaces?: number;
  isActive?: boolean;
}

export interface UnitOfMeasureResponse {
  /** uuid */
  id: string;
  code: string | null;
  name: string | null;
  /** int32 */
  decimalPlaces: number | null;
  isActive: boolean | null;
  inUse: boolean | null;
}

export interface ItemCategoryRequest {
  /** max 50 chars */
  code?: string;
  /** max 200 chars */
  name: string;
  /** uuid */
  parentId?: string;
  isActive?: boolean;
  /** int32, go-live controls: expiry alert window in days; `0` clears it (inherit) */
  expiryAlertDays?: number;
}

export interface ItemCategoryResponse {
  /** uuid */
  id: string;
  /** uuid */
  parentId: string | null;
  code: string | null;
  name: string | null;
  isActive: boolean | null;
  /** int64 */
  itemCount: number | null;
  /** int64 */
  childCount: number | null;
  /** int32, go-live controls: the category's own expiry alert window; empty = inherited */
  expiryAlertDays?: number | null;
}

export interface CategoryAttributeRequest {
  /** uuid */
  attributeDefinitionId: string;
  isRequired?: boolean;
  isVariantAxis?: boolean;
  /** int32 */
  sortOrder?: number;
}

export interface CategoryAttributeResponse {
  /** uuid */
  id: string;
  /** uuid */
  sourceCategoryId: string | null;
  sourceCategoryName: string | null;
  inherited: boolean | null;
  /** uuid */
  attributeDefinitionId: string | null;
  attributeCode: string | null;
  attributeName: string | null;
  dataType: AttributeDataType | null;
  unitLabel: string | null;
  options: AttributeOptionResponse[] | null;
  isRequired: boolean | null;
  isVariantAxis: boolean | null;
  /** int32 */
  sortOrder: number | null;
}

export interface AttributeDefinitionRequest {
  /** max 50 chars */
  code?: string;
  /** max 100 chars */
  name: string;
  dataType: AttributeDataType;
  /** max 20 chars */
  unitLabel?: string;
  isActive?: boolean;
}

export interface AttributeDefinitionResponse {
  /** uuid */
  id: string;
  code: string | null;
  name: string | null;
  dataType: AttributeDataType | null;
  unitLabel: string | null;
  isActive: boolean | null;
  options: AttributeOptionResponse[] | null;
}

export interface AttributeOptionResponse {
  /** uuid */
  id: string;
  code: string | null;
  label: string | null;
  /** int32 */
  sortOrder: number | null;
  isActive: boolean | null;
}

export interface OptionOrderRequest {
  /** uuid */
  optionIds: string[];
}

export interface AttributeOptionRequest {
  /** max 50 chars */
  code?: string;
  /** max 100 chars */
  label: string;
  /** int32 */
  sortOrder?: number;
  isActive?: boolean;
}
