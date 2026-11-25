import {
  type AttributeDefinitionResponse,
  type ItemCategoryResponse,
} from '@/types/api/catalog';
import { type AttributeDataType } from '@/types/api/enums';
/** Category tree, attribute definitions and category assignments. */
import { makeId } from './base';

// Item categories (tree)
// ---------------------------------------------------------------------------

interface CategorySeed {
  code: string;
  name: string;
  parent: string | null;
  itemCount: number;
  isActive?: boolean;
  expiryAlertDays?: number;
}

const CATEGORY_SEEDS: CategorySeed[] = [
  { code: 'BLD', name: 'مواد بناء', parent: null, itemCount: 0 },
  { code: 'BLD-CEM', name: 'إسمنت وجص', parent: 'BLD', itemCount: 6 },
  { code: 'BLD-STL', name: 'حديد ومعادن', parent: 'BLD', itemCount: 14 },
  { code: 'BLD-BRK', name: 'طابوق وبلوك', parent: 'BLD', itemCount: 5 },
  { code: 'ELEC', name: 'أجهزة ومواد كهربائية', parent: null, itemCount: 0 },
  { code: 'ELEC-CBL', name: 'كيبلات وأسلاك', parent: 'ELEC', itemCount: 22 },
  { code: 'ELEC-LGT', name: 'إنارة', parent: 'ELEC', itemCount: 18 },
  { code: 'ELEC-SW', name: 'مفاتيح ومقابس', parent: 'ELEC', itemCount: 31 },
  { code: 'ELEC-GEN', name: 'مولدات', parent: 'ELEC', itemCount: 4 },
  { code: 'OFF', name: 'مستلزمات مكتبية', parent: null, itemCount: 0 },
  { code: 'OFF-PAP', name: 'ورق وقرطاسية', parent: 'OFF', itemCount: 27 },
  { code: 'OFF-INK', name: 'أحبار وطابعات', parent: 'OFF', itemCount: 12 },
  {
    code: 'FOOD',
    name: 'مواد غذائية',
    parent: null,
    itemCount: 0,
    expiryAlertDays: 30,
  },
  { code: 'FOOD-GRN', name: 'حبوب وبقوليات', parent: 'FOOD', itemCount: 9 },
  { code: 'FOOD-OIL', name: 'زيوت ودهون', parent: 'FOOD', itemCount: 4 },
  {
    code: 'FOOD-BEV',
    name: 'مشروبات',
    parent: 'FOOD',
    itemCount: 7,
    expiryAlertDays: 14,
  },
  {
    code: 'MED',
    name: 'مستلزمات طبية',
    parent: null,
    itemCount: 0,
    expiryAlertDays: 90,
  },
  { code: 'MED-CON', name: 'مستهلكات طبية', parent: 'MED', itemCount: 19 },
  { code: 'MED-DRG', name: 'أدوية', parent: 'MED', itemCount: 11 },
  {
    code: 'MED-DRG-ANT',
    name: 'مضادات حيوية',
    parent: 'MED-DRG',
    itemCount: 6,
    expiryAlertDays: 120,
  },
  { code: 'MED-SAN', name: 'معقمات ومطهرات', parent: 'MED', itemCount: 8 },
  { code: 'SPR', name: 'قطع غيار', parent: null, itemCount: 0 },
  { code: 'SPR-CAR', name: 'قطع غيار سيارات', parent: 'SPR', itemCount: 16 },
  { code: 'SPR-CAR-TIR', name: 'إطارات', parent: 'SPR-CAR', itemCount: 8 },
  { code: 'SPR-CAR-BAT', name: 'بطاريات', parent: 'SPR-CAR', itemCount: 5 },
  { code: 'SPR-GEN', name: 'قطع غيار مولدات', parent: 'SPR', itemCount: 13 },
  { code: 'FURN', name: 'أثاث مكتبي', parent: null, itemCount: 0 },
  { code: 'FURN-CHR', name: 'كراسي', parent: 'FURN', itemCount: 6 },
  { code: 'FURN-DSK', name: 'مكاتب', parent: 'FURN', itemCount: 4 },
  { code: 'FURN-CAB', name: 'خزانات ورفوف', parent: 'FURN', itemCount: 5 },
  {
    code: 'PKG',
    name: 'مواد تغليف',
    parent: null,
    itemCount: 0,
    isActive: false,
  },
];

const categoryIdByCode = new Map<string, string>(
  CATEGORY_SEEDS.map((seed, i) => [seed.code, makeId(0xc0, i + 1)]),
);

function categoryId(code: string): string {
  const id = categoryIdByCode.get(code);
  if (!id) {
    throw new Error(`mock category ${code} missing`);
  }
  return id;
}

export const categories: ItemCategoryResponse[] = CATEGORY_SEEDS.map(
  (seed) => ({
    id: categoryId(seed.code),
    parentId: seed.parent === null ? null : categoryId(seed.parent),
    code: seed.code,
    name: seed.name,
    isActive: seed.isActive ?? true,
    itemCount: seed.itemCount,
    childCount: 0,
    expiryAlertDays: seed.expiryAlertDays ?? null,
  }),
);

// ---------------------------------------------------------------------------
// Attribute definitions and category assignments
// ---------------------------------------------------------------------------

interface AttributeSeed {
  code: string;
  name: string;
  dataType: AttributeDataType;
  unitLabel?: string;
  isActive?: boolean;
  options?: [string, string][];
}

const ATTRIBUTE_SEEDS: AttributeSeed[] = [
  {
    code: 'COLOR',
    name: 'اللون',
    dataType: 'OPTION',
    options: [
      ['RED', 'أحمر'],
      ['BLUE', 'أزرق'],
      ['BLACK', 'أسود'],
      ['WHITE', 'أبيض'],
      ['GREY', 'رمادي'],
      ['BEIGE', 'بيج'],
    ],
  },
  {
    code: 'SIZE',
    name: 'المقاس',
    dataType: 'OPTION',
    options: [
      ['S', 'صغير'],
      ['M', 'وسط'],
      ['L', 'كبير'],
      ['XL', 'كبير جداً'],
    ],
  },
  {
    code: 'ORIGIN',
    name: 'بلد المنشأ',
    dataType: 'OPTION',
    options: [
      ['IQ', 'العراق'],
      ['TR', 'تركيا'],
      ['CN', 'الصين'],
      ['IR', 'إيران'],
      ['DE', 'ألمانيا'],
      ['IN', 'الهند'],
    ],
  },
  {
    code: 'MATERIAL',
    name: 'نوع المادة',
    dataType: 'OPTION',
    options: [
      ['WOOD', 'خشب'],
      ['STEEL', 'حديد'],
      ['PLASTIC', 'بلاستيك'],
      ['ALU', 'ألمنيوم'],
    ],
  },
  { code: 'WEIGHT', name: 'الوزن', dataType: 'NUMBER', unitLabel: 'كغم' },
  {
    code: 'VOLTAGE',
    name: 'الجهد الكهربائي',
    dataType: 'NUMBER',
    unitLabel: 'V',
  },
  { code: 'POWER', name: 'القدرة', dataType: 'NUMBER', unitLabel: 'W' },
  { code: 'LENGTH', name: 'الطول', dataType: 'NUMBER', unitLabel: 'م' },
  { code: 'WATERPROOF', name: 'مقاوم للماء', dataType: 'BOOLEAN' },
  { code: 'PROD_DATE', name: 'تاريخ الإنتاج', dataType: 'DATE' },
  { code: 'BRAND', name: 'العلامة التجارية', dataType: 'TEXT' },
  { code: 'NOTES', name: 'مواصفات إضافية', dataType: 'TEXT' },
  {
    code: 'CAPACITY_OLD',
    name: 'السعة (قديم)',
    dataType: 'NUMBER',
    unitLabel: 'لتر',
    isActive: false,
  },
];

let optionCounter = 0;

export const attributeDefinitions: AttributeDefinitionResponse[] =
  ATTRIBUTE_SEEDS.map((seed, i) => ({
    id: makeId(0xc1, i + 1),
    code: seed.code,
    name: seed.name,
    dataType: seed.dataType,
    unitLabel: seed.unitLabel ?? null,
    isActive: seed.isActive ?? true,
    options:
      seed.dataType === 'OPTION'
        ? (seed.options ?? []).map(([code, label], o) => {
            optionCounter += 1;
            return {
              id: makeId(0xc2, optionCounter),
              code,
              label,
              sortOrder: o + 1,
              isActive: true,
            };
          })
        : [],
  }));

function attributeId(code: string): string {
  const def = attributeDefinitions.find((a) => a.code === code);
  if (!def) {
    throw new Error(`mock attribute ${code} missing`);
  }
  return def.id;
}

/** A category's own attribute assignment; inherited ones are derived from ancestors. */
export interface CategoryAssignment {
  id: string;
  categoryId: string;
  attributeDefinitionId: string;
  isRequired: boolean;
  isVariantAxis: boolean;
  sortOrder: number;
}

const ASSIGNMENT_SEEDS: [string, string, boolean, boolean][] = [
  // category, attribute, required, variant axis
  ['BLD', 'ORIGIN', true, false],
  ['BLD', 'WEIGHT', false, false],
  ['BLD-STL', 'LENGTH', true, true],
  ['ELEC', 'VOLTAGE', true, false],
  ['ELEC', 'POWER', false, false],
  ['ELEC-CBL', 'LENGTH', true, false],
  ['ELEC-CBL', 'COLOR', false, true],
  ['ELEC-LGT', 'WATERPROOF', false, false],
  ['OFF-PAP', 'COLOR', false, true],
  ['OFF-PAP', 'SIZE', false, true],
  ['FOOD', 'ORIGIN', true, false],
  ['FOOD', 'PROD_DATE', true, false],
  ['FOOD', 'WEIGHT', false, false],
  ['MED', 'ORIGIN', true, false],
  ['MED', 'BRAND', true, false],
  ['MED-DRG', 'NOTES', false, false],
  ['SPR', 'BRAND', true, false],
  ['SPR-CAR-TIR', 'SIZE', true, true],
  ['FURN', 'MATERIAL', true, false],
  ['FURN', 'COLOR', false, true],
  ['FURN-CHR', 'BRAND', false, false],
];

export const categoryAssignments: CategoryAssignment[] = ASSIGNMENT_SEEDS.map(
  ([category, attribute, isRequired, isVariantAxis], i) => ({
    id: makeId(0xc3, i + 1),
    categoryId: categoryId(category),
    attributeDefinitionId: attributeId(attribute),
    isRequired,
    isVariantAxis,
    sortOrder: i + 1,
  }),
);
