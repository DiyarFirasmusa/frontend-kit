import { PageHeader } from '@/components/shared/page-header';

export interface HomeGreetingHeaderProps {
  title: string;
  subtitle: string;
  dateLabel: string;
}

export function HomeGreetingHeader({
  title,
  subtitle,
  dateLabel,
}: HomeGreetingHeaderProps) {
  return (
    <PageHeader
      breadcrumb={
        <p className="gap-field text-label text-text-primary mb-2 flex items-center">
          {dateLabel}
          <span
            aria-hidden="true"
            className="bg-primary h-0.5 w-5 rounded-full"
          />
        </p>
      }
      title={title}
      subtitle={subtitle}
    />
  );
}
