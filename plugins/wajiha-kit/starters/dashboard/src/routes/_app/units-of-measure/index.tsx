import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { PERMS } from '@/constants/permissions';
import UnitsOfMeasureListContainer from '@/features/dashboard/units-of-measure';
import { unitsOfMeasureListQueryOptions } from '@/features/dashboard/units-of-measure/hooks/query/use-units-of-measure-list';
import { toUnitOfMeasureListParams } from '@/features/dashboard/units-of-measure/utils/list-params';
import {
  defaultUnitOfMeasureSearch,
  unitOfMeasureSearchSchema,
} from '@/features/dashboard/units-of-measure/validations/search';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/_app/units-of-measure/')({
  validateSearch: unitOfMeasureSearchSchema,
  search: { middlewares: [stripSearchParams(defaultUnitOfMeasureSearch)] },
  beforeLoad: () => {
    requirePermission(PERMS.unitOfMeasure.view);
  },
  loaderDeps: ({ search }) => toUnitOfMeasureListParams(search),
  loader: ({ context, deps }) => {
    // Start the fetch, do not wait: the table keeps the previous page meanwhile.
    void context.queryClient
      .query(unitsOfMeasureListQueryOptions(deps))
      .catch(() => null);
    return loadFeatureLocale('dashboard/units-of-measure');
  },
  component: UnitsOfMeasureListContainer,
});
