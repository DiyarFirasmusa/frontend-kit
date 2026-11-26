import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type {
  CategoryAttributeRequest,
  CategoryAttributeResponse,
  ItemCategoryResponse,
} from '@/types/api/catalog';
import type {
  CategoryListParams,
  CategoryListResponse,
  CategoryPayload,
} from '../types/types';

interface RequestOptions {
  signal?: AbortSignal;
}

/** A tree is not paged; this is the most one response may carry. */
export const TREE_PAGE_SIZE = 1000;

/** UI params -> the backend's names: the whole hierarchy in one page. */
export function toCategoryListQuery(
  params: CategoryListParams,
): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: 0,
    size: TREE_PAGE_SIZE,
  };
  if (params.q) {
    query.q = params.q;
  }
  return query;
}

export async function fetchItemCategories(
  params: CategoryListParams,
  options?: RequestOptions,
): Promise<CategoryListResponse> {
  const { data } = await privateApi.get<CategoryListResponse>(
    endpoints.itemCategories.list,
    { params: toCategoryListQuery(params), signal: options?.signal },
  );
  return data;
}

export async function fetchItemCategory(
  id: string,
  options?: RequestOptions,
): Promise<ItemCategoryResponse> {
  const { data } = await privateApi.get<ItemCategoryResponse>(
    endpoints.itemCategories.detail(id),
    { signal: options?.signal },
  );
  return data;
}

export async function createItemCategory(
  payload: CategoryPayload,
): Promise<ItemCategoryResponse> {
  const { data } = await privateApi.post<ItemCategoryResponse>(
    endpoints.itemCategories.create,
    payload,
    { successMessage: 'categories.toasts.categoryCreated' },
  );
  return data;
}

export async function updateItemCategory(
  id: string,
  payload: CategoryPayload,
): Promise<ItemCategoryResponse> {
  const { data } = await privateApi.put<ItemCategoryResponse>(
    endpoints.itemCategories.update(id),
    payload,
    { successMessage: 'categories.toasts.categoryUpdated' },
  );
  return data;
}

export async function deleteItemCategory(id: string): Promise<void> {
  await privateApi.delete(endpoints.itemCategories.remove(id), {
    successMessage: 'categories.toasts.categoryDeleted',
  });
}

export async function fetchCategoryAttributes(
  categoryId: string,
  options?: RequestOptions,
): Promise<CategoryAttributeResponse[]> {
  const { data } = await privateApi.get<CategoryAttributeResponse[]>(
    endpoints.itemCategories.attributes(categoryId),
    { params: { includeInherited: true }, signal: options?.signal },
  );
  return data;
}

export async function attachCategoryAttribute(
  categoryId: string,
  payload: CategoryAttributeRequest,
): Promise<CategoryAttributeResponse> {
  const { data } = await privateApi.post<CategoryAttributeResponse>(
    endpoints.itemCategories.attributes(categoryId),
    payload,
    { successMessage: 'categories.toasts.assignmentCreated' },
  );
  return data;
}

export async function updateCategoryAttribute(
  categoryId: string,
  assignmentId: string,
  payload: CategoryAttributeRequest,
): Promise<CategoryAttributeResponse> {
  const { data } = await privateApi.put<CategoryAttributeResponse>(
    endpoints.itemCategories.attribute(categoryId, assignmentId),
    payload,
    { successMessage: 'categories.toasts.assignmentUpdated' },
  );
  return data;
}

export async function detachCategoryAttribute(
  categoryId: string,
  assignmentId: string,
): Promise<void> {
  await privateApi.delete(
    endpoints.itemCategories.attribute(categoryId, assignmentId),
    { successMessage: 'categories.toasts.assignmentDeleted' },
  );
}
