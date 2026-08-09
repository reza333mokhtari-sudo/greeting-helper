import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/callback')({
  loader: async () => {
    throw redirect({ to: '/' });
  },
});
