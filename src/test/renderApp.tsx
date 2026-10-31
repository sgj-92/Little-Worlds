import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { routes } from '@/app/routes';
import type { AppServices } from '@/services/appServices';
import { createMockServices, type MockServiceOptions } from '@/services/createMockServices';
import { ServicesProvider } from '@/services/ServicesContext';
import { memoryStorage } from '@/services/store';
import { ToastProvider } from '@/ui/Toast';

export function renderApp(path = '/', options: MockServiceOptions = {}, setup?: (services: AppServices) => void) {
  const services = createMockServices({
    storage: memoryStorage(),
    sessionStorage: memoryStorage(),
    now: () => new Date('2026-10-18T10:00:00'),
    stageMs: { writing: 300, illustrating: 300, narrating: 300 },
    tickMs: 50,
    speechProcessingMs: 10,
    ...options,
  });
  setup?.(services);
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const user = userEvent.setup();
  const utils = render(
    <ServicesProvider services={services}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ServicesProvider>,
  );
  return { ...utils, services, router, user };
}
