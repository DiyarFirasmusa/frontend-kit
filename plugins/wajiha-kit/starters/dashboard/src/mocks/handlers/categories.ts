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
  intParam,
  matches,
  nextCode,
  noContent,
  notFound,
  ok,
  paginate,
  param,
  readJson,
  sameCode,
  textParam,
  validationProblem,
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

/** A malformed body (readJson returns {}) must fail validation, not throw. */
function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** 422 with field errors: name required and unique among siblings, parent valid. */
function validateCategory(
  request: Request,
  body: ItemCategoryRequest,
  current: ItemCategoryResponse | null,
): Promise<Response> | null {
  const errors: { field: string; ar: string; en: string }[] = [];
  const name = text(body.name);
  const parentId = body.parentId ?? null;
  if (!name) {
    errors.push({ field: 'name', ar: 'الاسم مطلوب', en: 'Name is required' });
  } else if (
    categories.some(
      (c) =>
        c.id !== current?.id &&
        c.parentId === parentId &&
        sameCode(c.name, name),
    )
  ) {
    errors.push({
      field: 'name',
      ar: 'يوجد تصنيف بهذا الاسم في نفس المكان',
      en: 'A category with this name already exists here',
    });
  }
  const code = body.code?.trim() || null;
  if (
    code !== null &&
    categories.some((c) => c.id !== current?.id && sameCode(c.code, code))
  ) {
    errors.push({
      field: 'code',
      ar: 'رمز التصنيف مستخدم مسبقاً',
      en: 'Category code already exists',
    });
  }
  if (parentId !== null && !categories.some((c) => c.id === parentId)) {
    errors.push({
      field: 'parentId',
      ar: 'التصنيف الأم غير موجود',
      en: 'Parent category not found',
    });
  } else if (
    parentId !== null &&
    current !== null &&
    (parentId === current.id || isDescendant(parentId, current.id))
  ) {
    errors.push({
      field: 'parentId',
      ar: 'لا يمكن نقل التصنيف تحت نفسه أو تحت أحد تصنيفاته الفرعية',
      en: 'A category cannot be moved under itself or one of its subcategories',
    });
  }
  return errors.length > 0 ? validationProblem(request, errors) : null;
}

export const categoryHandlers = [
  // ----- Item categories -----
  // The whole hierarchy in one Spring page (a tree is never paged). With `q`
  // the matches come with their ancestors, so every path stays intact.
  http.get(api(endpoints.itemCategories.list), async ({ request }) => {
    const url = new URL(request.url);
    const q = textParam(url, 'q');
    const parentId = textParam(url, 'parentId');
    const rootOnly = boolParam(url, 'rootOnly') === true;
    const isActive = boolParam(url, 'isActive');
    const matched = categories.filter(
      (c) =>
        matches(q, c.code, c.name) &&
        (parentId === '' || c.parentId === parentId) &&
        (!rootOnly || c.parentId === null) &&
        (isActive === undefined || c.isActive === isActive),
    );
    const visible =
      q === ''
        ? matched
        : categories.filter((c) =>
            matched.some((m) => m.id === c.id || isDescendant(m.id, c.id)),
          );
    return ok(
      paginate(
        visible.map((c) => toCategory(c)),
        intParam(url, 'page', 0),
        intParam(url, 'size', 10),
      ),
    );
  }),

  http.post(api(endpoints.itemCategories.create), async ({ request }) => {
    const body = await readJson<ItemCategoryRequest>(request);
    const invalid = validateCategory(request, body, null);
    if (invalid) {
      return invalid;
    }
    const category: ItemCategoryResponse = {
      id: newId(),
      parentId: body.parentId ?? null,
      code:
        body.code?.trim() ||
        nextCode(
          'CAT',
          categories.map((c) => c.code),
        ),
      name: text(body.name),
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
      const invalid = validateCategory(request, body, category);
      if (invalid) {
        return invalid;
      }
      Object.assign(category, {
        code: body.code?.trim() || category.code,
        name: text(body.name),
        parentId: body.parentId ?? null,
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
