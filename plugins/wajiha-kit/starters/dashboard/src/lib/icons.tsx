import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  Add01Icon,
  ArrowUpLeft01Icon,
  HandIcon,
  HistoryIcon,
  SparklesIcon,
  Xls01Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowDown02Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ArrowUp02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Bookmark01Icon,
  Building02Icon,
  CubeIcon,
  Location01Icon,
  Tag01Icon,
  WarehouseIcon,
  Calendar03Icon,
  Cancel01Icon,
  CancelCircleIcon,
  ChartBarLineIcon,
  Clock01Icon,
  DragDropVerticalIcon,
  Delete02Icon,
  File01Icon,
  HashtagIcon,
  Home01Icon,
  InformationCircleIcon,
  Layers01Icon,
  Loading03Icon,
  LockIcon,
  Login03Icon,
  Logout03Icon,
  Menu01Icon,
  MoreHorizontalIcon,
  Moon02Icon,
  Notification01Icon,
  PencilEdit02Icon,
  PreferenceHorizontalIcon,
  RefreshIcon,
  RotateClockwiseIcon,
  Search01Icon,
  SearchRemoveIcon,
  Settings02Icon,
  Share08Icon,
  Sun03Icon,
  Tick02Icon,
  UnavailableIcon,
  UnfoldMoreIcon,
  UserIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import type { ReactElement, SVGProps } from 'react';

/* Single source of truth for iconography — Hugeicons (stroke-rounded).
   Every icon in the app comes from here so weight and sizing stay uniform:
   size follows the `size-*` utility on the element, stroke stays 1.5. */

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: string | number;
  strokeWidth?: number;
};

export type IconComponent = (props: IconProps) => ReactElement;

const GLOBE_MERIDIAN: IconSvgElement = [
  [
    'circle',
    {
      cx: '12',
      cy: '12',
      r: '9',
      stroke: 'currentColor',
      strokeWidth: '1.5',
      key: '0',
    },
  ],
  [
    'path',
    {
      d: 'M16 12C16 16.9706 14.2091 21 12 21C9.79086 21 8 16.9706 8 12C8 7.02944 9.79086 3 12 3C14.2091 3 16 7.02944 16 12Z',
      stroke: 'currentColor',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: '1.5',
      key: '1',
    },
  ],
  [
    'path',
    {
      d: 'M3 12H21',
      stroke: 'currentColor',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: '1.5',
      key: '2',
    },
  ],
];

function icon(source: IconSvgElement, displayName: string): IconComponent {
  function Icon({ strokeWidth = 1.5, ...props }: IconProps) {
    return <HugeiconsIcon icon={source} strokeWidth={strokeWidth} {...props} />;
  }
  Icon.displayName = displayName;
  return Icon;
}

/* ── Navigation & chrome ── */
export const Home = icon(Home01Icon, 'Home');
export const Menu = icon(Menu01Icon, 'Menu');
export const GripVertical = icon(DragDropVerticalIcon, 'GripVertical');
export const MoreHorizontal = icon(MoreHorizontalIcon, 'MoreHorizontal');
export const Globe = icon(GLOBE_MERIDIAN, 'Globe');
export const Bell = icon(Notification01Icon, 'Bell');
export const Sun = icon(Sun03Icon, 'Sun');
export const Moon = icon(Moon02Icon, 'Moon');
export const LogIn = icon(Login03Icon, 'LogIn');
export const LogOut = icon(Logout03Icon, 'LogOut');
export const Settings = icon(Settings02Icon, 'Settings');

/* ── Arrows & disclosure ── */
export const ArrowRight = icon(ArrowRight01Icon, 'ArrowRight');
export const ChevronRight = icon(ArrowRight01Icon, 'ChevronRight');
export const ChevronRightIcon = ChevronRight;
export const ChevronLeft = icon(ArrowLeft01Icon, 'ChevronLeft');
export const ChevronDown = icon(ArrowDown01Icon, 'ChevronDown');
export const ChevronDownIcon = ChevronDown;
export const ChevronUp = icon(ArrowUp01Icon, 'ChevronUp');
export const ChevronUpIcon = ChevronUp;
export const ArrowDown = icon(ArrowDown02Icon, 'ArrowDown');
export const ArrowUp = icon(ArrowUp02Icon, 'ArrowUp');
export const ArrowLeftLong = icon(ArrowLeft02Icon, 'ArrowLeftLong');
export const ArrowRightLong = icon(ArrowRight02Icon, 'ArrowRightLong');
/** Up-left "send back" arrow of the reject action (03.01). */
export const ArrowUpLeft = icon(ArrowUpLeft01Icon, 'ArrowUpLeft');
export const ChevronsUpDown = icon(UnfoldMoreIcon, 'ChevronsUpDown');

/* ── Status & feedback ── */
export const Check = icon(Tick02Icon, 'Check');
export const CircleCheckIcon = icon(CheckmarkCircle02Icon, 'CircleCheckIcon');
export const TriangleAlertIcon = icon(Alert02Icon, 'TriangleAlertIcon');
export const CheckIcon = Check;
export const AlertCircle = icon(AlertCircleIcon, 'AlertCircle');
export const Info = icon(InformationCircleIcon, 'Info');
export const InfoIcon = Info;
export const OctagonXIcon = icon(CancelCircleIcon, 'OctagonXIcon');
export const Ban = icon(UnavailableIcon, 'Ban');
export const X = icon(Cancel01Icon, 'X');
export const XIcon = X;
export const Loader2 = icon(Loading03Icon, 'Loader2');
export const Loader2Icon = Loader2;

/* ── Actions ── */
export const Plus = icon(Add01Icon, 'Plus');
export const Search = icon(Search01Icon, 'Search');
export const SearchX = icon(SearchRemoveIcon, 'SearchX');
export const SlidersHorizontal = icon(
  PreferenceHorizontalIcon,
  'SlidersHorizontal',
);
export const RefreshCw = icon(RefreshIcon, 'RefreshCw');
export const RefreshCcw = RefreshCw;
export const RotateCw = icon(RotateClockwiseIcon, 'RotateCw');
export const Eye = icon(ViewIcon, 'Eye');
export const EyeOff = icon(ViewOffSlashIcon, 'EyeOff');
export const Pencil = icon(PencilEdit02Icon, 'Pencil');
export const Trash2 = icon(Delete02Icon, 'Trash2');

/* ── Identity, security, documents ── */
export const Lock = icon(LockIcon, 'Lock');
export const Building2 = icon(Building02Icon, 'Building2');
export const Network = icon(Share08Icon, 'Network');
export const Hash = icon(HashtagIcon, 'Hash');
export const FileText = icon(File01Icon, 'FileText');
export const Spreadsheet = icon(Xls01Icon, 'Spreadsheet');
export const Layers = icon(Layers01Icon, 'Layers');
export const BarChart = icon(ChartBarLineIcon, 'BarChart');

/* ── People & time ── */
export const User = icon(UserIcon, 'User');
export const Calendar = icon(Calendar03Icon, 'Calendar');
export const Clock = icon(Clock01Icon, 'Clock');
export const History = icon(HistoryIcon, 'History');
export const Hand = icon(HandIcon, 'Hand');
export const Sparkles = icon(SparklesIcon, 'Sparkles');

/* ── Navigation registry (sidebar groups, top bar) ── */
export const Cube = icon(CubeIcon, 'Cube');
export const Warehouse = icon(WarehouseIcon, 'Warehouse');
export const Bookmark = icon(Bookmark01Icon, 'Bookmark');
export const Location = icon(Location01Icon, 'Location');
export const Tag = icon(Tag01Icon, 'Tag');
