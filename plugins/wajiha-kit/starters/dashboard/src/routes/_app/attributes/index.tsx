import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { PERMS } from '@/constants/permissions';
import { attributeDefinitionsListQueryOptions } from '@/features/dashboard/categories/hooks/query/use-attribute-definitions';
import AttributesListContainer from '@/features/dashboard/categories/pages/attributes';
import { toAttributeListParams } from '@/features/dashboard/categories/pages/attributes/utils/list-params';
import {
  attributeSearchSchema,
  defaultAttributeSearch,
} from '@/features/dashboard/categories/pages/attributes/validations/search';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

/* The attribute definitions are the second page of the categories feature,
   with their own address so the sidebar can link straight to them. */
export const Route = createFileRoute('/_app/attributes/')({
  validateSearch: attributeSearchSchema,
  search: { middlewares: [stripSearchParams(defaultAttributeSearch)] },
  beforeLoad: () => {
    requirePermission(PERMS.attributeDefinition.view);
  },
  loaderDeps: ({ search }) => toAttributeListParams(search),
  loader: ({ context, deps }) => {
    // Start the fetch, do not wait: the table keeps the previous page meanwhile.
    void context.queryClient
      .query(attributeDefinitionsListQueryOptions(deps))
      .catch(() => null);
    return loadFeatureLocale('dashboard/categories');
  },
  component: AttributesListContainer,
});
