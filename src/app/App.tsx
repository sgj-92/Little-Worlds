import { useState } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { createMockServices, type MockServices } from '@/services/createMockServices';
import { ServicesProvider } from '@/services/ServicesContext';
import { ToastProvider } from '@/ui/Toast';
import { routes } from './routes';

const router = createBrowserRouter(routes);

export function App({ services: injected }: { services?: MockServices }) {
  const [services] = useState(() => injected ?? createMockServices());
  return (
    <ServicesProvider services={services}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ServicesProvider>
  );
}
