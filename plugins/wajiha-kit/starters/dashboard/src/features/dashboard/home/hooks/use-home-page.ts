import { useTranslation } from 'react-i18next';
import { useCan } from '@/components/auth/can';
import { useMe } from '@/hooks/use-me';
import { directionOf } from '@/lib/i18n/languages';
import { formatWeekdayDate } from '@/utils/format';
import {
  HOME_QUERY_DEFAULTS,
  type ActivityTrend,
  type HomeWidgetState,
  type OverviewSummary,
  type RecentChange,
} from '../types/types';
import { formatDayTime } from '../utils/relative-time';
import {
  filterReadableChanges,
  getHomeAccess,
  type HomeAccess,
} from './home-access';
import { greetingKey, toWidgetState } from './home-actions';
import {
  useActivityTrend,
  useOverviewSummary,
  useRecentChanges,
} from './query/use-overview-queries';

export interface HomePageModel {
  dir: 'rtl' | 'ltr';
  title: string;
  subtitle: string;
  dateLabel: string;
  summary: HomeWidgetState<OverviewSummary>;
  activity: HomeWidgetState<ActivityTrend>;
  recent: HomeWidgetState<RecentChange[]>;
  syncLabel: string;
  /** What the user may read: each widget shows only its own kinds of record. */
  access: HomeAccess;
  showSummary: boolean;
  showChart: boolean;
  showRecent: boolean;
  noAccessLabel: string;
}

export function useHomePage(): HomePageModel {
  const { t, i18n } = useTranslation();
  const me = useMe().data;
  const name = me?.firstName || me?.displayName || '';

  const { access, any, all } = getHomeAccess(useCan());
  // Widgets of records the user may not read are neither shown nor fetched.
  const summary = useOverviewSummary(any);
  const activity = useActivityTrend(HOME_QUERY_DEFAULTS.activityDays, all);
  const recent = useRecentChanges(HOME_QUERY_DEFAULTS.recentLimit, any);

  return {
    dir: directionOf(i18n.language),
    title: t(`home.${greetingKey(new Date().getHours(), name !== '')}`, {
      name,
    }),
    subtitle: t('home.subtitle'),
    dateLabel: formatWeekdayDate(new Date(), i18n.language),
    summary: toWidgetState(summary),
    activity: toWidgetState(activity),
    recent: {
      ...toWidgetState(recent),
      data: filterReadableChanges(recent.data, access),
    },
    access,
    showSummary: any,
    showChart: all,
    showRecent: any,
    noAccessLabel: t('home.noAccess'),
    syncLabel: t('home.lastSync', {
      time: formatDayTime(summary.data?.generatedAt, {
        t,
        language: i18n.language,
      }),
    }),
  };
}
