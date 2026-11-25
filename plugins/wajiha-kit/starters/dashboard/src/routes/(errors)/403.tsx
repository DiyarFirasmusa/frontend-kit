import { createFileRoute } from '@tanstack/react-router';
import ForbiddenErrorContainer from '@/features/fallback/403';

export const Route = createFileRoute('/(errors)/403')({
  component: ForbiddenErrorContainer,
});
