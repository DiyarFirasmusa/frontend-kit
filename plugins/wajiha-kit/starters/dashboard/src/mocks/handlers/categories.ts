import { http } from 'msw';
import { endpoints } from '@/constants/api';
import {
  type AttributeDefinitionResponse,
  type AttributeOptionResponse,
  type CategoryAttributeRequest,
  type CategoryAttributeResponse,
  type ItemCategoryRequest,
  type ItemCategoryResponse,
} from '@/types/api/catalog';
/** Categories and their attribute assignments. */
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
import {
  attributeDefinitions,
  categories,
  categoryAssignments,
  type CategoryAssignment,
} from '../seed/categories';

// Categories and attributes
// ---------------------------------------------------------------------------

function toCategory(c: ItemCategoryResponse): ItemCategoryResponse {
  return {
    ...c,
    childCount: categories.filter((child) => child.parentId === c.id).length,
  };
}

export function sortedOptions(
  def: AttributeDefinitionResponse,
): AttributeOptionResponse[] {
  return [...(def.options ?? [])].toSorted(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
}

export function toAttribute(
  def: AttributeDefinitionResponse,
): AttributeDefinitionResponse {
  return { ...def, options: sortedOptions(def) };
}

function ancestorsOf(categoryId: string): ItemCategoryResponse[] {
  const chain: ItemCategoryResponse[] = [];
  const seen = new Set<string>();
  let nextId = categories.find((c) => c.id === categoryId)?.parentId ?? null;
  while (nextId !== null && !seen.has(nextId)) {
    seen.add(nextId);
    const id = nextId;
    const parent = categories.find((c) => c.id === id);
    if (!parent) {
      break;
    }
    chain.push(parent);
    nextId = parent.parentId;
  }
  return chain;
}

function isDescendant(candidateId: string, ancestorId: string): boolean {
  return ancestorsOf(candidateId).some((a) => a.id === ancestorId);
}

function toAssignment(
  a: CategoryAssignment,
  forCategoryId: string,
): CategoryAttributeResponse {
  const def = attributeDefinitions.find(
    (d) => d.id === a.attributeDefinitionId,
  );
  const source = categories.find((c) => c.id === a.categoryId);
  return {
    id: a.id,
    sourceCategoryId: a.categoryId,
    sourceCategoryName: source?.name ?? null,
    inherited: a.categoryId !== forCategoryId,
    attributeDefinitionId: a.attributeDefinitionId,
    attributeCode: def?.code ?? null,
    attributeName: def?.name ?? null,
    dataType: def?.dataType ?? null,
    unitLabel: def?.unitLabel ?? null,
    options: def ? sortedOptions(def) : null,
    isRequired: a.isRequired,
    isVariantAxis: a.isVariantAxis,
    sortOrder: a.sortOrder,
  };
}

function assignmentsFor(
  categoryId: string,
  includeInherited: boolean,
): CategoryAttributeResponse[] {
  const chain = includeInherited
    ? [
        ...ancestorsOf(categoryId)
          .toReversed()
          .map((c) => c.id),
        categoryId,
      ]
    : [categoryId];
  return chain.flatMap((id) =>
    categoryAssignments
      .filter((a) => a.categoryId === id)
      .toSorted((x, y) => x.sortOrder - y.sortOrder)
      .map((a) => toAssignment(a, categoryId)),
  );
}

export const categoryHandlers = [
  // ----- Item categories -----
  http.get(api(endpoints.itemCategories.list), async ({ request }) => {
    const url = new URL(request.url);
    const q = textParam(url, 'q');
    const parentId = textParam(url, 'parentId');
    const rootOnly = boolParam(url, 'rootOnly') === true;
    const isActive = boolParam(url, 'isActive');
    const response: ItemCategoryResponse[] = categories
      .filter(
        (c) =>
          matches(q, c.code, c.name) &&
          (parentId === '' || c.parentId === parentId) &&
          (!rootOnly || c.parentId === null) &&
          (isActive === undefined || c.isActive === isActive),
      )
      .map((c) => toCategory(c));
    return ok(response);
  }),

  http.post(api(endpoints.itemCategories.create), async ({ request }) => {
    const body = await readJson<ItemCategoryRequest>(request);
    const code =
      body.code?.trim() ||
      nextCode(
        'CAT',
        categories.map((c) => c.code),
      );
    if (categories.some((c) => sameCode(c.code, code))) {
      return fail(
        request,
        409,
        'رمز الفئة مستخدم مسبقاً',
        'Category code already exists',
      );
    }
    if (body.parentId && !categories.some((c) => c.id === body.parentId)) {
      return fail(
        request,
        400,
        'الفئة الأم غير موجودة',
        'Parent category not found',
      );
    }
    const category: ItemCategoryResponse = {
      id: newId(),
      parentId: body.parentId ?? null,
      code,
      name: body.name,
      isActive: body.isActive ?? true,
      itemCount: 0,
      childCount: 0,
      expiryAlertDays: body.expiryAlertDays ? body.expiryAlertDays : null,
    };
    categories.push(category);
    return ok(toCategory(category), 201);
  }),

  http.get(
    api(endpoints.itemCategories.detail(':id')),
    async ({ params, request }) => {
      const category = categories.find((c) => c.id === param(params, 'id'));
      return category ? ok(toCategory(category)) : notFound(request);
    },
  ),

  http.put(
    api(endpoints.itemCategories.update(':id')),
    async ({ params, request }) => {
      const category = categories.find((c) => c.id === param(params, 'id'));
      if (!category) {
        return notFound(request);
      }
      const body = await readJson<ItemCategoryRequest>(request);
      const code = body.code?.trim() || category.code;
      if (
        categories.some((c) => c.id !== category.id && sameCode(c.code, code))
      ) {
        return fail(
          request,
          409,
          'رمز الفئة مستخدم مسبقاً',
          'Category code already exists',
        );
      }
      const parentId = body.parentId ?? null;
      if (
        parentId !== null &&
        (parentId === category.id || isDescendant(parentId, category.id))
      ) {
        return fail(
          request,
          400,
          'لا يمكن نقل الفئة تحت نفسها أو تحت إحدى فئاتها الفرعية',
          'A category cannot be moved under itself or one of its subcategories',
        );
      }
      Object.assign(category, {
        code,
        name: body.name ?? category.name,
        parentId,
        isActive: body.isActive ?? category.isActive,
        expiryAlertDays:
          body.expiryAlertDays === undefined
            ? category.expiryAlertDays
            : body.expiryAlertDays === 0
              ? null
              : body.expiryAlertDays,
      } satisfies Partial<ItemCategoryResponse>);
      return ok(toCategory(category));
    },
  ),

  http.delete(
    api(endpoints.itemCategories.remove(':id')),
    async ({ params, request }) => {
      const id = param(params, 'id');
      const index = categories.findIndex((c) => c.id === id);
      const category = categories[index];
      if (!category) {
        return notFound(request);
      }
      if (categories.some((c) => c.parentId === id)) {
        return fail(
          request,
          409,
          'لا يمكن حذف فئة لديها فئات فرعية',
          'A category with subcategories cannot be deleted',
        );
      }
      if ((category.itemCount ?? 0) > 0) {
        return fail(
          request,
          409,
          'لا يمكن حذف فئة مرتبطة بمواد، يمكنك إيقافها بدلاً من ذلك',
          'A category with items cannot be deleted; deactivate it instead',
        );
      }
      categories.splice(index, 1);
      for (let i = categoryAssignments.length - 1; i >= 0; i -= 1) {
        if (categoryAssignments[i]?.categoryId === id) {
          categoryAssignments.splice(i, 1);
        }
      }
      return noContent();
    },
  ),

  // ----- Category attribute assignments -----
  http.get(
    api(endpoints.itemCategories.attributes(':id')),
    async ({ params, request }) => {
      const id = param(params, 'id');
      if (!categories.some((c) => c.id === id)) {
        return notFound(request);
      }
      const url = new URL(request.url);
      const includeInherited = boolParam(url, 'includeInherited') !== false;
      return ok(assignmentsFor(id, includeInherited));
    },
  ),

  http.post(
    api(endpoints.itemCategories.attributes(':id')),
    async ({ params, request }) => {
      const id = param(params, 'id');
      if (!categories.some((c) => c.id === id)) {
        return notFound(request);
      }
      const body = await readJson<CategoryAttributeRequest>(request);
      if (
        !attributeDefinitions.some((d) => d.id === body.attributeDefinitionId)
      ) {
        return fail(request, 400, 'الخاصية غير موجودة', 'Attribute not found');
      }
      const visible = assignmentsFor(id, true);
      if (
        visible.some(
          (a) => a.attributeDefinitionId === body.attributeDefinitionId,
        )
      ) {
        return fail(
          request,
          409,
          'الخاصية مرتبطة بهذه الفئة أو بإحدى الفئات الأم',
          'Attribute is already assigned to this category or a parent',
        );
      }
      const own = categoryAssignments.filter((a) => a.categoryId === id);
      const assignment: CategoryAssignment = {
        id: newId(),
        categoryId: id,
        attributeDefinitionId: body.attributeDefinitionId,
        isRequired: body.isRequired ?? false,
        isVariantAxis: body.isVariantAxis ?? false,
        sortOrder: body.sortOrder ?? own.length + 1,
      };
      categoryAssignments.push(assignment);
      return ok(toAssignment(assignment, id), 201);
    },
  ),

  http.put(
    api(endpoints.itemCategories.attribute(':id', ':assignmentId')),
    async ({ params, request }) => {
      const id = param(params, 'id');
      const assignment = categoryAssignments.find(
        (a) => a.id === param(params, 'assignmentId') && a.categoryId === id,
      );
      if (!assignment) {
        return notFound(request);
      }
      const body = await readJson<CategoryAttributeRequest>(request);
      assignment.isRequired = body.isRequired ?? assignment.isRequired;
      assignment.isVariantAxis = body.isVariantAxis ?? assignment.isVariantAxis;
      assignment.sortOrder = body.sortOrder ?? assignment.sortOrder;
      return ok(toAssignment(assignment, id));
    },
  ),

  http.delete(
    api(endpoints.itemCategories.attribute(':id', ':assignmentId')),
    async ({ params, request }) => {
      const index = categoryAssignments.findIndex(
        (a) =>
          a.id === param(params, 'assignmentId') &&
          a.categoryId === param(params, 'id'),
      );
      if (index === -1) {
        return notFound(request);
      }
      categoryAssignments.splice(index, 1);
      return noContent();
    },
  ),
];
