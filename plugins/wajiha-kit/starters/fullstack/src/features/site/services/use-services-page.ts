import { getRouteApi } from '@tanstack/react-router';
import { toLocale } from '@/shared/lib/i18n/languages';

const route = getRouteApi('/$locale/services');

export function useServicesPage() {
  return { locale: toLocale(route.useParams().locale) };
}
