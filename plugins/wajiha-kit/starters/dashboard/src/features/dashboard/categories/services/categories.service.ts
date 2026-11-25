import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type {
  CategoryAttributeRequest,
  CategoryAttributeResponse,
  ItemCategoryRequest,
  ItemCategoryResponse,
} from '@/types/api/catalog';
import type { ItemCategoryListParams } from '../types/types';

export async function fetchItemCategories(
  params: ItemCategoryListParams = {},
): Promise<ItemCategoryResponse[]> {
  const { data } = await privateApi.get<ItemCategoryResponse[]>(
    endpoints.itemCategories.list,
    { params },
  );
  return data;
}

export async function createItemCategory(
  payload: ItemCategoryRequest,
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
  payload: ItemCategoryRequest,
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
): Promise<CategoryAttributeResponse[]> {
  const { data } = await privateApi.get<CategoryAttributeResponse[]>(
    endpoints.itemCategories.attributes(categoryId),
    { params: { includeInherited: true } },
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
