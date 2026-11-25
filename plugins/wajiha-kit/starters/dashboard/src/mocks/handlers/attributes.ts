import { http } from 'msw';
import { endpoints } from '@/constants/api';
import {
  type AttributeDefinitionRequest,
  type AttributeDefinitionResponse,
  type AttributeOptionRequest,
  type AttributeOptionResponse,
  type OptionOrderRequest,
} from '@/types/api/catalog';
import {
  AttributeDataTypeValues,
  type AttributeDataType,
} from '@/types/api/enums';
/** Attribute definitions and options. */
import {
  api,
  boolParam,
  fail,
  matches,
  nextCode,
  noContent,
  notFound,
  ok,
  param,
  readJson,
  sameCode,
  textParam,
} from '../core';
import { newId } from '../seed/base';
import { attributeDefinitions, categoryAssignments } from '../seed/categories';
import { sortedOptions, toAttribute } from './categories';

export const attributeHandlers = [
  // ----- Attribute definitions and options -----
  http.get(api(endpoints.attributeDefinitions.list), async ({ request }) => {
    const url = new URL(request.url);
    const q = textParam(url, 'q');
    const dataType = textParam(url, 'dataType');
    const isActive = boolParam(url, 'isActive');
    const response: AttributeDefinitionResponse[] = attributeDefinitions
      .filter(
        (d) =>
          matches(q, d.code, d.name) &&
          (dataType === '' || d.dataType === dataType) &&
          (isActive === undefined || d.isActive === isActive),
      )
      .map((d) => toAttribute(d));
    return ok(response);
  }),

  http.post(api(endpoints.attributeDefinitions.create), async ({ request }) => {
    const body = await readJson<AttributeDefinitionRequest>(request);
    const code =
      body.code?.trim() ||
      nextCode(
        'ATTR',
        attributeDefinitions.map((d) => d.code),
      );
    if (attributeDefinitions.some((d) => sameCode(d.code, code))) {
      return fail(
        request,
        409,
        'رمز الخاصية مستخدم مسبقاً',
        'Attribute code already exists',
      );
    }
    const dataType: AttributeDataType = (
      AttributeDataTypeValues as readonly string[]
    ).includes(body.dataType)
      ? body.dataType
      : 'TEXT';
    const definition: AttributeDefinitionResponse = {
      id: newId(),
      code,
      name: body.name,
      dataType,
      unitLabel: body.unitLabel?.trim() || null,
      isActive: body.isActive ?? true,
      options: [],
    };
    attributeDefinitions.push(definition);
    return ok(toAttribute(definition), 201);
  }),

  http.get(
    api(endpoints.attributeDefinitions.detail(':id')),
    async ({ params, request }) => {
      const definition = attributeDefinitions.find(
        (d) => d.id === param(params, 'id'),
      );
      return definition ? ok(toAttribute(definition)) : notFound(request);
    },
  ),

  http.put(
    api(endpoints.attributeDefinitions.update(':id')),
    async ({ params, request }) => {
      const definition = attributeDefinitions.find(
        (d) => d.id === param(params, 'id'),
      );
      if (!definition) {
        return notFound(request);
      }
      const body = await readJson<AttributeDefinitionRequest>(request);
      const code = body.code?.trim() || definition.code;
      if (
        attributeDefinitions.some(
          (d) => d.id !== definition.id && sameCode(d.code, code),
        )
      ) {
        return fail(
          request,
          409,
          'رمز الخاصية مستخدم مسبقاً',
          'Attribute code already exists',
        );
      }
      Object.assign(definition, {
        code,
        name: body.name ?? definition.name,
        dataType: body.dataType ?? definition.dataType,
        unitLabel: body.unitLabel?.trim() || null,
        isActive: body.isActive ?? definition.isActive,
      } satisfies Partial<AttributeDefinitionResponse>);
      return ok(toAttribute(definition));
    },
  ),

  http.delete(
    api(endpoints.attributeDefinitions.remove(':id')),
    async ({ params, request }) => {
      const id = param(params, 'id');
      const index = attributeDefinitions.findIndex((d) => d.id === id);
      if (index === -1) {
        return notFound(request);
      }
      if (categoryAssignments.some((a) => a.attributeDefinitionId === id)) {
        return fail(
          request,
          409,
          'الخاصية مرتبطة بفئات ولا يمكن حذفها، يمكنك إيقافها بدلاً من ذلك',
          'Attribute is assigned to categories and cannot be deleted; deactivate it instead',
        );
      }
      attributeDefinitions.splice(index, 1);
      return noContent();
    },
  ),

  http.get(
    api(endpoints.attributeDefinitions.options(':id')),
    async ({ params, request }) => {
      const definition = attributeDefinitions.find(
        (d) => d.id === param(params, 'id'),
      );
      return definition ? ok(sortedOptions(definition)) : notFound(request);
    },
  ),

  http.post(
    api(endpoints.attributeDefinitions.options(':id')),
    async ({ params, request }) => {
      const definition = attributeDefinitions.find(
        (d) => d.id === param(params, 'id'),
      );
      if (!definition) {
        return notFound(request);
      }
      const body = await readJson<AttributeOptionRequest>(request);
      const options = definition.options ?? [];
      if (options.some((o) => sameCode(o.label, body.label))) {
        return fail(
          request,
          409,
          'هذا الخيار موجود مسبقاً',
          'Option already exists',
        );
      }
      const option: AttributeOptionResponse = {
        id: newId(),
        code: body.code?.trim() || null,
        label: body.label,
        sortOrder: body.sortOrder ?? options.length + 1,
        isActive: body.isActive ?? true,
      };
      definition.options = [...options, option];
      return ok(option, 201);
    },
  ),

  // Must come before the `:optionId` handler, which would also match `/order`.
  http.put(
    api(endpoints.attributeDefinitions.optionsOrder(':id')),
    async ({ params, request }) => {
      const definition = attributeDefinitions.find(
        (d) => d.id === param(params, 'id'),
      );
      if (!definition) {
        return notFound(request);
      }
      const body = await readJson<OptionOrderRequest>(request);
      const order = body.optionIds ?? [];
      for (const option of definition.options ?? []) {
        const position = order.indexOf(option.id);
        option.sortOrder =
          position === -1
            ? order.length + (option.sortOrder ?? 0)
            : position + 1;
      }
      return ok(sortedOptions(definition));
    },
  ),

  http.put(
    api(endpoints.attributeDefinitions.option(':id', ':optionId')),
    async ({ params, request }) => {
      const definition = attributeDefinitions.find(
        (d) => d.id === param(params, 'id'),
      );
      const option = definition?.options?.find(
        (o) => o.id === param(params, 'optionId'),
      );
      if (!definition || !option) {
        return notFound(request);
      }
      const body = await readJson<AttributeOptionRequest>(request);
      if (
        (definition.options ?? []).some(
          (o) => o.id !== option.id && sameCode(o.label, body.label),
        )
      ) {
        return fail(
          request,
          409,
          'هذا الخيار موجود مسبقاً',
          'Option already exists',
        );
      }
      option.label = body.label ?? option.label;
      option.code = body.code?.trim() || option.code;
      option.sortOrder = body.sortOrder ?? option.sortOrder;
      option.isActive = body.isActive ?? option.isActive;
      return ok(option);
    },
  ),

  http.delete(
    api(endpoints.attributeDefinitions.option(':id', ':optionId')),
    async ({ params, request }) => {
      const definition = attributeDefinitions.find(
        (d) => d.id === param(params, 'id'),
      );
      const optionId = param(params, 'optionId');
      if (
        !definition ||
        !(definition.options ?? []).some((o) => o.id === optionId)
      ) {
        return notFound(request);
      }
      definition.options = (definition.options ?? []).filter(
        (o) => o.id !== optionId,
      );
      return noContent();
    },
  ),
];
