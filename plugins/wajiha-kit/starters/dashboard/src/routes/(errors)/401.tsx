import { createFileRoute } from '@tanstack/react-router';
import UnauthorizedErrorContainer from '@/features/fallback/401';

export const Route = createFileRoute('/(errors)/401')({
  component: UnauthorizedErrorContainer,
});
