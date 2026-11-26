import {
  CheckmarkCircle02Icon,
  Add01Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Building02Icon,
  Cancel01Icon,
  CancelCircleIcon,
  Delete02Icon,
  Home01Icon,
  Loading03Icon,
  Logout03Icon,
  Menu01Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  PreferenceHorizontalIcon,
  RefreshIcon,
  RotateClockwiseIcon,
  Search01Icon,
  SearchRemoveIcon,
  Settings02Icon,
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
export const MoreHorizontal = icon(MoreHorizontalIcon, 'MoreHorizontal');
export const LogOut = icon(Logout03Icon, 'LogOut');
export const Settings = icon(Settings02Icon, 'Settings');

/* ── Arrows & disclosure ── */
export const ChevronRight = icon(ArrowRight01Icon, 'ChevronRight');
export const ChevronRightIcon = ChevronRight;
export const ChevronLeft = icon(ArrowLeft01Icon, 'ChevronLeft');
export const ChevronDown = icon(ArrowDown01Icon, 'ChevronDown');
export const ChevronDownIcon = ChevronDown;
export const ChevronUp = icon(ArrowUp01Icon, 'ChevronUp');
export const ChevronUpIcon = ChevronUp;
export const ChevronsUpDown = icon(UnfoldMoreIcon, 'ChevronsUpDown');

/* ── Status & feedback ── */
export const Check = icon(Tick02Icon, 'Check');
export const CircleCheckIcon = icon(CheckmarkCircle02Icon, 'CircleCheckIcon');
export const CheckIcon = Check;
export const AlertCircle = icon(AlertCircleIcon, 'AlertCircle');
export const OctagonXIcon = icon(CancelCircleIcon, 'OctagonXIcon');
export const Ban = icon(UnavailableIcon, 'Ban');
export const X = icon(Cancel01Icon, 'X');
export const XIcon = X;
export const Loader2 = icon(Loading03Icon, 'Loader2');

/* ── Actions ── */
export const Plus = icon(Add01Icon, 'Plus');
export const Search = icon(Search01Icon, 'Search');
export const SearchX = icon(SearchRemoveIcon, 'SearchX');
export const SlidersHorizontal = icon(PreferenceHorizontalIcon, 'SlidersHorizontal');
export const RefreshCw = icon(RefreshIcon, 'RefreshCw');
export const RotateCw = icon(RotateClockwiseIcon, 'RotateCw');
export const Eye = icon(ViewIcon, 'Eye');
export const EyeOff = icon(ViewOffSlashIcon, 'EyeOff');
export const Pencil = icon(PencilEdit02Icon, 'Pencil');
export const Trash2 = icon(Delete02Icon, 'Trash2');

/* ── Identity, security, documents ── */
export const Building2 = icon(Building02Icon, 'Building2');

/* ── People & time ── */
export const User = icon(UserIcon, 'User');

/* ── Navigation registry (sidebar groups, top bar) ── */
