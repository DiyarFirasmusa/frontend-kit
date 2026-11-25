import { createFileRoute } from '@tanstack/react-router';
import NotFoundErrorContainer from '@/features/fallback/404';

export const Route = createFileRoute('/(errors)/404')({
  component: NotFoundErrorContainer,
});
