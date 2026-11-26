import { z } from 'zod';
import {
  looseText,
  pageSchema,
  pageSizeSchema,
  withFallback,
} from '@/lib/list-search';
import { AttributeDataTypeValues } from '@/types/api/enums';
import { ATTRIBUTE_STATUSES } from '../../../types/types';

/**
 * The URL is the state of the list: page, size, sort, search and filters.
 * Every field falls back and has a default, so a bad or partial shared link
 * still opens the list.
 */
export const attributeSearchSchema = z.object({
  page: pageSchema,
  pageSize: pageSizeSchema,
  sort: withFallback(z.string(), '').default(''),
  q: withFallback(looseText, '').default(''),
  dataType: withFallback(
    z.enum(['all', ...AttributeDataTypeValues]),
    'all',
  ).default('all'),
  status: withFallback(z.enum(ATTRIBUTE_STATUSES), 'all').default('all'),
});

export type AttributeSearch = z.infer<typeof attributeSearchSchema>;

export const defaultAttributeSearch: AttributeSearch =
  attributeSearchSchema.parse({});
