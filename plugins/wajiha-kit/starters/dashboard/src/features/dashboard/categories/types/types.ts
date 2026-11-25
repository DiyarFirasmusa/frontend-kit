import type {
  CategoryAttributeResponse,
  ItemCategoryResponse,
} from '@/types/api/catalog';
import type { AttributeDataType } from '@/types/api/enums';

export type CategoriesTab = 'categories' | 'attributes';

export interface ItemCategoryListParams {
  q?: string;
  parentId?: string;
  rootOnly?: boolean;
  isActive?: boolean;
}

export interface AttributeDefinitionListParams {
  q?: string;
  dataType?: AttributeDataType;
  isActive?: boolean;
}

export interface CategoryTreeNode {
  id: string;
  category: ItemCategoryResponse;
  depth: number;
  children: CategoryTreeNode[];
}

export interface AssignmentRow extends CategoryAttributeResponse {
  /** Name of the category that owns the assignment; '—' when unknown. */
  sourceName: string;
}
