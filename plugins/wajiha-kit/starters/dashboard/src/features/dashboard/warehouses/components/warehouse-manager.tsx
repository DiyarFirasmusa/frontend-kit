import { PersonName } from '@/components/shared/person-name';
import type { WarehouseResponse } from '@/types/api/warehouses';

interface WarehouseManagerProps {
  warehouse: Pick<
    WarehouseResponse,
    'managerName' | 'managerUserId' | 'managerEmployeeId'
  >;
  className?: string;
}

/** The manager's name from the warehouse, or the directory name behind the manager id. */
export function WarehouseManager({
  warehouse,
  className,
}: WarehouseManagerProps) {
  const name = warehouse.managerName?.trim();
  if (name) {
    return <span className={className}>{name}</span>;
  }
  if (warehouse.managerUserId) {
    return <PersonName id={warehouse.managerUserId} className={className} />;
  }
  return (
    <PersonName
      id={warehouse.managerEmployeeId}
      kind="employee"
      className={className}
    />
  );
}
