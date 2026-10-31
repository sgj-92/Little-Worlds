import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import type { AppServices } from '@/services/appServices';
import { ServicesProvider } from '@/services/ServicesContext';
import { ToastProvider } from '@/ui/Toast';
import { routes } from './routes';

const router = createBrowserRouter(routes);

export function App({ services }: { services: AppServices }) {
  return (
    <ServicesProvider services={services}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ServicesProvider>
  );
}
