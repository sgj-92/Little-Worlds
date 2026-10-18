import { Compass } from 'lucide-react';
import { ButtonLink } from '@/ui/Button';
import { StateMessage } from '@/ui/StateMessage';

export function NotFoundScreen({ crashed = false }: { crashed?: boolean }) {
  return (
    <div className="paper flex min-h-dvh items-center justify-center">
      <StateMessage
        tone={crashed ? 'error' : 'neutral'}
        art={<Compass aria-hidden className="size-12" />}
        title={crashed ? 'Oops, a page fell out of the book' : 'This page wandered off'}
        body="Let’s head back home and find another story."
        actions={
          <ButtonLink to="/" size="lg" reloadDocument={crashed}>
            Back home
          </ButtonLink>
        }
      />
    </div>
  );
}
