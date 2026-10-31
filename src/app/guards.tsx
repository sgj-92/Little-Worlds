import { CloudOff } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useServices } from '@/services/ServicesContext';
import { useStore } from '@/state/hooks';
import { Button } from '@/ui/Button';
import { Splash } from '@/ui/Splash';
import { StateMessage } from '@/ui/StateMessage';

/** The child's app: needs a signed-in parent and a child profile. */
export function RequireAccount() {
  const { auth, settings } = useServices();
  const authState = useStore(auth.state);
  const profile = useStore(settings.profile);
  const location = useLocation();

  if (authState.status === 'loading') return <Splash />;
  if (authState.status === 'signed-out') return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  if (profile === 'loading') return <Splash />;
  if (profile === 'needs-onboarding') return <Navigate to="/setup" replace />;
  if (profile === 'error') return <ConnectionProblem onRetry={settings.reload} />;
  return <Outlet />;
}

/** Account screens: signed-in parents are sent on into the app. */
export function GuestOnly() {
  const { auth } = useServices();
  const authState = useStore(auth.state);
  const location = useLocation();
  if (authState.status === 'loading') return <Splash />;
  if (authState.status === 'signed-in') {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? '/'} replace />;
  }
  return <Outlet />;
}

/** First-run child profile setup. */
export function RequireOnboarding() {
  const { auth, settings } = useServices();
  const authState = useStore(auth.state);
  const profile = useStore(settings.profile);
  if (authState.status === 'loading') return <Splash />;
  if (authState.status === 'signed-out') return <Navigate to="/sign-in" replace />;
  if (profile === 'loading') return <Splash />;
  if (profile === 'ready') return <Navigate to="/" replace />;
  if (profile === 'error') return <ConnectionProblem onRetry={settings.reload} />;
  return <Outlet />;
}

export function ConnectionProblem({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="paper flex min-h-dvh items-center justify-center">
      <StateMessage
        tone="error"
        art={<CloudOff aria-hidden className="size-12" />}
        title="We couldn’t open your storybooks"
        body="Please check your internet connection and try again."
        actions={
          <Button size="lg" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    </div>
  );
}
