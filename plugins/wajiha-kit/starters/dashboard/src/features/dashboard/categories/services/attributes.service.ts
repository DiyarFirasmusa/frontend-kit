import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type {
  AttributeOptionRequest,
  AttributeOptionResponse,
  OptionOrderRequest,
} from '@/types/api/catalog';
import { toBackendSort } from '@/utils/table-state';
import type {
  AttributeListParams,
  AttributeListResponse,
  AttributePayload,
  AttributeRow,
} from '../types/types';
import type { OptionChanges } from '../utils/option-order';

interface RequestOptions {
  signal?: AbortSignal;
}

/** `silent` skips the success toast; `successMessage` replaces the default one. */
interface OptionRequestConfig {
  silent?: boolean;
  successMessage?: string;
}

/** UI params -> the backend's names: 0-based `page`, `size`, `sort=name,asc`. */
export function toAttributeListQuery(
  params: AttributeListParams,
): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {
    page: params.page - 1,
    size: params.pageSize,
  };
  const sort = toBackendSort(params.sort);
  if (sort) {
    query.sort = sort;
  }
  if (params.q) {
    query.q = params.q;
  }
  if (params.dataType !== 'all') {
    query.dataType = params.dataType;
  }
  if (params.status !== 'all') {
    query.isActive = params.status === 'active';
  }
  return query;
}

export async function fetchAttributeDefinitions(
  params: AttributeListParams,
  options?: RequestOptions,
): Promise<AttributeListResponse> {
  const { data } = await privateApi.get<AttributeListResponse>(
    endpoints.attributeDefinitions.list,
    { params: toAttributeListQuery(params), signal: options?.signal },
  );
  return data;
}

export async function fetchAttributeDefinition(
  id: string,
  options?: RequestOptions,
): Promise<AttributeRow> {
  const { data } = await privateApi.get<AttributeRow>(
    endpoints.attributeDefinitions.detail(id),
    { signal: options?.signal },
  );
  return data;
}

export async function createAttributeDefinition(
  payload: AttributePayload,
): Promise<AttributeRow> {
  const { data } = await privateApi.post<AttributeRow>(
    endpoints.attributeDefinitions.create,
    payload,
    { successMessage: 'categories.toasts.attributeCreated' },
  );
  return data;
}

export async function updateAttributeDefinition(
  id: string,
  payload: AttributePayload,
): Promise<AttributeRow> {
  const { data } = await privateApi.put<AttributeRow>(
    endpoints.attributeDefinitions.update(id),
    payload,
    { successMessage: 'categories.toasts.attributeUpdated' },
  );
  return data;
}

export async function deleteAttributeDefinition(id: string): Promise<void> {
  await privateApi.delete(endpoints.attributeDefinitions.remove(id), {
    successMessage: 'categories.toasts.attributeDeleted',
  });
}

function toOptionConfig(
  options: OptionRequestConfig | undefined,
  fallbackMessage: string,
): OptionRequestConfig {
  return options?.silent
    ? { silent: true }
    : { successMessage: options?.successMessage ?? fallbackMessage };
}

export async function createAttributeOption(
  definitionId: string,
  payload: AttributeOptionRequest,
  options?: OptionRequestConfig,
): Promise<AttributeOptionResponse> {
  const { data } = await privateApi.post<AttributeOptionResponse>(
    endpoints.attributeDefinitions.options(definitionId),
    payload,
    toOptionConfig(options, 'categories.toasts.optionCreated'),
  );
  return data;
}

export async function updateAttributeOption(
  definitionId: string,
  optionId: string,
  payload: AttributeOptionRequest,
  options?: OptionRequestConfig,
): Promise<AttributeOptionResponse> {
  const { data } = await privateApi.put<AttributeOptionResponse>(
    endpoints.attributeDefinitions.option(definitionId, optionId),
    payload,
    toOptionConfig(options, 'categories.toasts.optionUpdated'),
  );
  return data;
}

export async function deleteAttributeOption(
  definitionId: string,
  optionId: string,
  options?: OptionRequestConfig,
): Promise<void> {
  await privateApi.delete(
    endpoints.attributeDefinitions.option(definitionId, optionId),
    toOptionConfig(options, 'categories.toasts.optionDeleted'),
  );
}

export async function reorderAttributeOptions(
  definitionId: string,
  optionIds: string[],
  options?: OptionRequestConfig,
): Promise<AttributeOptionResponse[]> {
  const payload: OptionOrderRequest = { optionIds };
  const { data } = await privateApi.put<AttributeOptionResponse[]>(
    endpoints.attributeDefinitions.optionsOrder(definitionId),
    payload,
    toOptionConfig(options, 'categories.toasts.optionsSaved'),
  );
  return data;
}

/**
 * Saves the changes of the options dialog together: removals first (so a
 * freed label can be reused), then updates, then new options, and finally one
 * reorder request when the order changed. Only the last request reports
 * success, so one toast appears; any failure still reaches the caller.
 */
export async function saveAttributeOptions(
  definitionId: string,
  changes: OptionChanges,
): Promise<void> {
  const createdIds: string[] = [];
  const steps: ((config: OptionRequestConfig) => Promise<unknown>)[] = [
    ...changes.deletes.map(
      (optionId) => (config: OptionRequestConfig) =>
        deleteAttributeOption(definitionId, optionId, config),
    ),
    ...changes.updates.map(
      ({ id, payload }) =>
        (config: OptionRequestConfig) =>
          updateAttributeOption(definitionId, id, payload, config),
    ),
    ...changes.creates.map((payload) => async (config: OptionRequestConfig) => {
      const created = await createAttributeOption(
        definitionId,
        payload,
        config,
      );
      createdIds.push(created.id);
    }),
  ];
  const order = changes.order;
  if (order !== null) {
    steps.push((config) =>
      reorderAttributeOptions(
        definitionId,
        order.map((slot) =>
          typeof slot === 'string' ? slot : (createdIds[slot] ?? ''),
        ),
        config,
      ),
    );
  }
  for (const [index, step] of steps.entries()) {
    const isLast = index === steps.length - 1;
    await step(
      isLast
        ? { successMessage: 'categories.toasts.optionsSaved' }
        : { silent: true },
    );
  }
}
