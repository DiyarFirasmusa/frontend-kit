import type {
  AttributeDefinitionRequest,
  AttributeDefinitionResponse,
  CategoryAttributeResponse,
  ItemCategoryRequest,
  ItemCategoryResponse,
} from '@/types/api/catalog';
import type { AttributeDataType } from '@/types/api/enums';
import type { PageResponse } from '@/types/api/page';

// ---------------------------------------------------------------------------
// Categories (the tree page)
// ---------------------------------------------------------------------------

export type CategoryRow = ItemCategoryResponse;
export type CategoryPayload = ItemCategoryRequest;

/** The "All items" view: the root row of the tree, no category selected. */
export const ALL_CATEGORIES = 'all';

/**
 * What the tree request needs. A tree is never paged: the endpoint returns the
 * whole hierarchy (the service asks for one big page), and `q` narrows it to
 * the matches and their ancestors.
 */
export interface CategoryListParams {
  q: string;
}

export type CategoryListResponse = PageResponse<CategoryRow>;

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

// ---------------------------------------------------------------------------
// Attribute definitions (the attributes page, and the lookups of the tree page)
// ---------------------------------------------------------------------------

export type AttributeRow = AttributeDefinitionResponse;
export type AttributePayload = AttributeDefinitionRequest;

export const ATTRIBUTE_STATUSES = ['all', 'active', 'inactive'] as const;
export type AttributeStatusFilter = (typeof ATTRIBUTE_STATUSES)[number];

export type AttributeTypeFilter = AttributeDataType | 'all';

/** What the attribute list request needs, in UI terms (1-based page, `name.asc` sort). */
export interface AttributeListParams {
  page: number;
  pageSize: number;
  sort: string;
  q: string;
  dataType: AttributeTypeFilter;
  status: AttributeStatusFilter;
}

export type AttributeListResponse = PageResponse<AttributeRow>;
