import type { ReactNode } from 'react';
import { useServices } from '@/services/ServicesContext';
import { PrototypeNote } from '@/ui/PrototypeNote';
import { StoryArt } from '@/ui/art/StoryArt';

/** Shared frame for grown-up account screens: artwork beside (tablet) or above (phone) the form. */
export function AuthFrame({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  const { auth } = useServices();
  return (
    <div className="mx-auto grid min-h-dvh max-w-5xl content-start lg:grid-cols-2 lg:content-center lg:items-center lg:gap-12 lg:px-8">
      <div className="relative h-52 overflow-hidden rounded-b-5xl sm:h-64 lg:h-[34rem] lg:rounded-5xl lg:shadow-lift">
        <StoryArt theme="moonlit-forest" variant={1} animated />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
        <p className="absolute bottom-5 left-6 font-display text-3xl font-semibold text-cream-50 lg:bottom-8 lg:left-8 lg:text-4xl">Little Worlds</p>
      </div>
      <div className="mx-auto w-full max-w-md px-5 pt-7 pb-12 lg:px-0 lg:py-12">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {subtitle && <div className="mt-1.5 text-navy-500">{subtitle}</div>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center font-semibold text-navy-700">{footer}</div>}
        {auth.isMock && (
          <div className="mt-6 flex justify-center">
            <PrototypeNote>Demo mode — accounts are simulated on this device</PrototypeNote>
          </div>
        )}
      </div>
    </div>
  );
}
