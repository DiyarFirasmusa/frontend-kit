import { type WarehouseUserRole } from '@/types/api/enums';
import {
  type LocationResponse,
  type LocationTypeResponse,
  type WarehouseResponse,
  type WarehouseUserResponse,
} from '@/types/api/warehouses';
/** Warehouses, location types, locations and warehouse members. */
import { isoDaysAgo, makeId } from './base';
import { employeeId, orgUnitId, PEOPLE, userId } from './people';

// Warehouses, location types, locations, members
// ---------------------------------------------------------------------------

interface WarehouseSeed {
  code: string;
  name: string;
  address: string;
  orgUnit: number;
  manager: number | null;
  isTransit: boolean;
  isActive: boolean;
  createdDaysAgo: number;
  zones: string[];
  racksPerZone: number;
  binsPerRack: number;
  members: [number, WarehouseUserRole][];
}

export const WAREHOUSE_SEEDS: WarehouseSeed[] = [
  {
    code: 'WH-BGD-01',
    name: 'المستودع الرئيسي - بغداد',
    address: 'بغداد - الدورة - المنطقة الصناعية، قرب سيطرة الدورة',
    orgUnit: 0,
    manager: 3,
    isTransit: false,
    isActive: true,
    createdDaysAgo: 420,
    zones: ['منطقة الاستلام', 'منطقة المواد الإنشائية', 'منطقة الكهربائيات'],
    racksPerZone: 3,
    binsPerRack: 4,
    members: [
      [3, 'WAREHOUSE_MANAGER'],
      [0, 'STOCK_CONTROLLER'],
      [1, 'STOREKEEPER'],
      [5, 'STOREKEEPER'],
      [6, 'STOCK_CONTROLLER'],
      [16, 'STOREKEEPER'],
    ],
  },
  {
    code: 'WH-BSR-01',
    name: 'مستودع البصرة',
    address: 'البصرة - شارع الجزائر، مجاور مجمع الموانئ',
    orgUnit: 3,
    manager: 2,
    isTransit: false,
    isActive: true,
    createdDaysAgo: 360,
    zones: ['منطقة الاستلام', 'منطقة المواد الغذائية'],
    racksPerZone: 3,
    binsPerRack: 3,
    members: [
      [2, 'WAREHOUSE_MANAGER'],
      [9, 'STOREKEEPER'],
      [11, 'STOCK_CONTROLLER'],
    ],
  },
  {
    code: 'WH-ERB-01',
    name: 'مستودع أربيل',
    address: 'أربيل - طريق كركوك، المنطقة الصناعية الجديدة',
    orgUnit: 4,
    manager: 14,
    isTransit: false,
    isActive: true,
    createdDaysAgo: 300,
    zones: ['منطقة الأثاث', 'منطقة قطع الغيار'],
    racksPerZone: 2,
    binsPerRack: 3,
    members: [
      [14, 'WAREHOUSE_MANAGER'],
      [12, 'STOREKEEPER'],
      [17, 'STOREKEEPER'],
    ],
  },
  {
    code: 'WH-NJF-01',
    name: 'مستودع النجف',
    address: 'النجف - حي الأمير، شارع المطار',
    orgUnit: 5,
    manager: 7,
    isTransit: false,
    isActive: true,
    createdDaysAgo: 240,
    zones: ['منطقة التخزين العام', 'منطقة المواد الغذائية'],
    racksPerZone: 2,
    binsPerRack: 2,
    members: [
      [7, 'WAREHOUSE_MANAGER'],
      [13, 'STOREKEEPER'],
    ],
  },
  {
    code: 'WH-MED-01',
    name: 'مخزن المستلزمات الطبية',
    address: 'بغداد - الكرادة، شارع 62، بناية المركز الطبي',
    orgUnit: 7,
    manager: 4,
    isTransit: false,
    isActive: true,
    createdDaysAgo: 200,
    zones: ['منطقة الأدوية المبردة', 'منطقة المستهلكات'],
    racksPerZone: 2,
    binsPerRack: 4,
    members: [
      [4, 'WAREHOUSE_MANAGER'],
      [8, 'STOCK_CONTROLLER'],
      [1, 'STOREKEEPER'],
    ],
  },
  {
    code: 'WH-TRN-01',
    name: 'مستودع العبور (بضاعة بالطريق)',
    address: 'افتراضي - بضاعة منقولة بين المستودعات',
    orgUnit: 0,
    manager: null,
    isTransit: true,
    isActive: true,
    createdDaysAgo: 420,
    zones: [],
    racksPerZone: 0,
    binsPerRack: 0,
    members: [[15, 'STOREKEEPER']],
  },
  {
    code: 'WH-KRB-01',
    name: 'مستودع كربلاء',
    address: 'كربلاء - حي الحسين، طريق بغداد',
    orgUnit: 8,
    manager: 10,
    isTransit: false,
    isActive: false,
    createdDaysAgo: 150,
    zones: ['منطقة التخزين العام'],
    racksPerZone: 2,
    binsPerRack: 2,
    members: [[10, 'WAREHOUSE_MANAGER']],
  },
];

export const warehouseId = (index: number): string => makeId(0xa0, index + 1);

export const locationTypes: LocationTypeResponse[] = [
  {
    id: makeId(0xa1, 1),
    code: 'ZONE',
    name: 'منطقة',
    rank: 1,
    canHoldStock: false,
    isActive: true,
    usageCount: 0,
  },
  {
    id: makeId(0xa1, 2),
    code: 'RACK',
    name: 'رف',
    rank: 2,
    canHoldStock: false,
    isActive: true,
    usageCount: 0,
  },
  {
    id: makeId(0xa1, 3),
    code: 'BIN',
    name: 'خانة',
    rank: 3,
    canHoldStock: true,
    isActive: true,
    usageCount: 0,
  },
  {
    id: makeId(0xa1, 4),
    code: 'DOCK',
    name: 'رصيف تحميل',
    rank: 1,
    canHoldStock: true,
    isActive: true,
    usageCount: 0,
  },
];

const [ZONE_TYPE, RACK_TYPE, BIN_TYPE, DOCK_TYPE] = locationTypes as [
  LocationTypeResponse,
  LocationTypeResponse,
  LocationTypeResponse,
  LocationTypeResponse,
];

export const warehouses: WarehouseResponse[] = [];
export const locations: LocationResponse[] = [];
export const members: WarehouseUserResponse[] = [];

let locationCounter = 0;
let memberCounter = 0;

function addLocation(
  warehouse: WarehouseResponse,
  type: LocationTypeResponse,
  code: string,
  name: string | null,
  parent: LocationResponse | null,
  flags: { isBlocked?: boolean; isActive?: boolean } = {},
): LocationResponse {
  locationCounter += 1;
  const shortCode = (warehouse.code ?? 'WH').replace(/^WH-/, '');
  const location: LocationResponse = {
    id: makeId(0xa2, locationCounter),
    warehouseId: warehouse.id,
    parentId: parent?.id ?? null,
    parentCode: parent?.code ?? null,
    locationTypeId: type.id,
    locationTypeName: type.name,
    code,
    name,
    barcode: `LOC-${shortCode}-${code}`,
    isBlocked: flags.isBlocked ?? false,
    isActive: flags.isActive ?? true,
    childCount: 0,
  };
  locations.push(location);
  return location;
}

WAREHOUSE_SEEDS.forEach((seed, index) => {
  const warehouse: WarehouseResponse = {
    id: warehouseId(index),
    code: seed.code,
    name: seed.name,
    address: seed.address,
    hrOrgUnitId: orgUnitId(seed.orgUnit),
    managerEmployeeId: seed.manager === null ? null : employeeId(seed.manager),
    managerUserId: seed.manager === null ? null : userId(seed.manager),
    isTransit: seed.isTransit,
    isActive: seed.isActive,
    createdAt: isoDaysAgo(seed.createdDaysAgo, 9, 15),
    updatedAt: isoDaysAgo(Math.floor(seed.createdDaysAgo / 4), 13, 40),
    locationCount: 0,
    memberCount: 0,
    managerName: null,
  };
  warehouses.push(warehouse);

  if (seed.isTransit) {
    addLocation(warehouse, DOCK_TYPE, 'DOCK-IN', 'رصيف الاستلام', null);
    addLocation(warehouse, DOCK_TYPE, 'IN-TRANSIT', 'بضاعة بالطريق', null);
  }

  seed.zones.forEach((zoneName, z) => {
    const letter = String.fromCodePoint(65 + z);
    const zone = addLocation(warehouse, ZONE_TYPE, letter, zoneName, null);
    for (let r = 1; r <= seed.racksPerZone; r += 1) {
      const rackCode = `${letter}-${String(r).padStart(2, '0')}`;
      const rack = addLocation(
        warehouse,
        RACK_TYPE,
        rackCode,
        `رف ${rackCode}`,
        zone,
      );
      for (let b = 1; b <= seed.binsPerRack; b += 1) {
        const binCode = `${rackCode}-${String(b).padStart(2, '0')}`;
        addLocation(
          warehouse,
          BIN_TYPE,
          binCode,
          `خانة ${b} - المستوى ${b}`,
          rack,
          {
            isBlocked: z === 0 && r === 1 && b === seed.binsPerRack,
            isActive: !(index === 0 && z === 2 && r === 3 && b === 4),
          },
        );
      }
    }
  });

  seed.members.forEach(([person, role], m) => {
    memberCounter += 1;
    members.push({
      id: makeId(0xa3, memberCounter),
      warehouseId: warehouse.id,
      userId: userId(person),
      role,
      isManager: false,
      createdAt: isoDaysAgo(seed.createdDaysAgo - m * 7, 11, 5),
      userName: PEOPLE[person]?.name ?? null,
      isActive: !(index === 0 && person === 16),
    });
  });
});
