import { createFileRoute } from '@tanstack/react-router';
import { PERMS } from '@/constants/permissions';
import UnitsOfMeasureListContainer from '@/features/dashboard/units-of-measure';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/_app/units-of-measure/')({
  beforeLoad: () => {
    requirePermission(PERMS.unitOfMeasure.view);
  },
  loader: () => loadFeatureLocale('dashboard/units-of-measure'),
  component: UnitsOfMeasureListContainer,
});
