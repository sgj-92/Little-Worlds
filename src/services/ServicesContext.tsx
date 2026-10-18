import { createContext, useContext, type ReactNode } from 'react';
import type { MockServices } from './createMockServices';

const ServicesContext = createContext<MockServices | null>(null);

export function ServicesProvider({ services, children }: { services: MockServices; children: ReactNode }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): MockServices {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('useServices must be used inside <ServicesProvider>');
  return services;
}
