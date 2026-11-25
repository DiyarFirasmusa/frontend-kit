import { HomeActivityChart } from './components/home-activity-chart';
import { HomeGreetingHeader } from './components/home-greeting-header';
import { HomeKpiGrid } from './components/home-kpi-grid';
import { HomeRecentChangesTable } from './components/home-recent-changes-table';
import { useHomePage } from './hooks/use-home-page';
import { HOME_QUERY_DEFAULTS } from './types/types';

export default function HomeContainer() {
  const page = useHomePage();

  return (
    <section dir={page.dir} className="flex flex-col gap-4">
      <div className="mb-2">
        <HomeGreetingHeader
          title={page.title}
          subtitle={page.subtitle}
          dateLabel={page.dateLabel}
        />
      </div>
      <HomeKpiGrid state={page.summary} />
      <HomeActivityChart
        state={page.activity}
        days={HOME_QUERY_DEFAULTS.activityDays}
      />
      <HomeRecentChangesTable state={page.recent} />
      <footer className="text-b3 text-text-secondary mt-2">
        {page.syncLabel}
      </footer>
    </section>
  );
}
