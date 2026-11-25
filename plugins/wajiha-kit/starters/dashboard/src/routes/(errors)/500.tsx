import { createFileRoute } from '@tanstack/react-router';
import ServerErrorContainer from '@/features/fallback/500';

export const Route = createFileRoute('/(errors)/500')({
  component: ServerErrorContainer,
});
