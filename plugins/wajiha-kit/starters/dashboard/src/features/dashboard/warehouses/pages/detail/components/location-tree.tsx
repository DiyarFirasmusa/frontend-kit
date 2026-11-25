import { useTranslation } from 'react-i18next';
import { DataBadge } from '@/components/table/data-badge';
import { Location } from '@/lib/icons';
import { activeBadge } from '@/utils/status-tones';
import {
  countDescendants,
  type LocationTreeNode,
} from '../utils/location-tree';

interface LocationTreeProps {
  nodes: LocationTreeNode[];
}

/** Top-level zones of the warehouse with how many locations sit below each. */
export function LocationTree({ nodes }: LocationTreeProps) {
  return (
    <ul className="flex flex-col">
      {nodes.map((node) => (
        <ZoneRow key={node.location.id} node={node} />
      ))}
    </ul>
  );
}

function ZoneRow({ node }: { node: LocationTreeNode }) {
  const { t } = useTranslation();
  const { location } = node;
  const status = activeBadge(location.isActive);
  const childCount = countDescendants(node);
  const name = location.name?.trim() || '—';
  const label = (
    <>
      <Location className="text-text-secondary size-5 shrink-0" aria-hidden />
      <span className="text-h5 text-text-primary truncate">{name}</span>
    </>
  );

  return (
    <li className="border-stroke-subtle gap-row flex min-h-16 items-center justify-between border-b py-3">
      <div className="gap-inline flex min-w-0 items-center">{label}</div>
      <div className="gap-inline flex shrink-0 items-center">
        {childCount > 0 ? (
          <span className="text-b3 text-text-secondary tabular-nums">
            {t('warehouses.locations.childCount', { count: childCount })}
          </span>
        ) : null}
        {location.isBlocked ? (
          <DataBadge tone="danger" shape="pill">
            {t('warehouses.locations.blocked')}
          </DataBadge>
        ) : null}
        <DataBadge tone={status.tone} shape="pill">
          {t(status.labelKey)}
        </DataBadge>
      </div>
    </li>
  );
}
