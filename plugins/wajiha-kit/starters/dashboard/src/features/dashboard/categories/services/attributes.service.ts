import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type {
  AttributeDefinitionRequest,
  AttributeDefinitionResponse,
  AttributeOptionRequest,
  AttributeOptionResponse,
  OptionOrderRequest,
} from '@/types/api/catalog';
import type { AttributeDefinitionListParams } from '../types/types';
import type { OptionChanges } from '../utils/option-order';

/** `silent` skips the success toast; `successMessage` replaces the default one. */
interface OptionRequestConfig {
  silent?: boolean;
  successMessage?: string;
}

export async function fetchAttributeDefinitions(
  params: AttributeDefinitionListParams = {},
): Promise<AttributeDefinitionResponse[]> {
  const query: Record<string, string | boolean> = {};
  if (params.q !== undefined && params.q !== '') {
    query.q = params.q;
  }
  if (params.dataType !== undefined) {
    query.dataType = params.dataType;
  }
  if (params.isActive !== undefined) {
    query.isActive = params.isActive;
  }
  const { data } = await privateApi.get<AttributeDefinitionResponse[]>(
    endpoints.attributeDefinitions.list,
    { params: query },
  );
  return data;
}

export async function createAttributeDefinition(
  payload: AttributeDefinitionRequest,
): Promise<AttributeDefinitionResponse> {
  const { data } = await privateApi.post<AttributeDefinitionResponse>(
    endpoints.attributeDefinitions.create,
    payload,
    { successMessage: 'categories.toasts.attributeCreated' },
  );
  return data;
}

export async function updateAttributeDefinition(
  id: string,
  payload: AttributeDefinitionRequest,
): Promise<AttributeDefinitionResponse> {
  const { data } = await privateApi.put<AttributeDefinitionResponse>(
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

export async function createAttributeOption(
  definitionId: string,
  payload: AttributeOptionRequest,
  options?: OptionRequestConfig,
): Promise<AttributeOptionResponse> {
  const config = options?.silent
    ? { silent: true }
    : {
        successMessage:
          options?.successMessage ?? 'categories.toasts.optionCreated',
      };
  const { data } = await privateApi.post<AttributeOptionResponse>(
    endpoints.attributeDefinitions.options(definitionId),
    payload,
    config,
  );
  return data;
}

export async function updateAttributeOption(
  definitionId: string,
  optionId: string,
  payload: AttributeOptionRequest,
  options?: OptionRequestConfig,
): Promise<AttributeOptionResponse> {
  const config = options?.silent
    ? { silent: true }
    : {
        successMessage:
          options?.successMessage ?? 'categories.toasts.optionUpdated',
      };
  const { data } = await privateApi.put<AttributeOptionResponse>(
    endpoints.attributeDefinitions.option(definitionId, optionId),
    payload,
    config,
  );
  return data;
}

export async function deleteAttributeOption(
  definitionId: string,
  optionId: string,
  options?: OptionRequestConfig,
): Promise<void> {
  const config = options?.silent
    ? { silent: true }
    : {
        successMessage:
          options?.successMessage ?? 'categories.toasts.optionDeleted',
      };
  await privateApi.delete(
    endpoints.attributeDefinitions.option(definitionId, optionId),
    config,
  );
}

export async function reorderAttributeOptions(
  definitionId: string,
  optionIds: string[],
  options?: OptionRequestConfig,
): Promise<AttributeOptionResponse[]> {
  const config = options?.silent
    ? { silent: true }
    : {
        successMessage:
          options?.successMessage ?? 'categories.toasts.optionsSaved',
      };
  const payload: OptionOrderRequest = { optionIds };
  const { data } = await privateApi.put<AttributeOptionResponse[]>(
    endpoints.attributeDefinitions.optionsOrder(definitionId),
    payload,
    config,
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
