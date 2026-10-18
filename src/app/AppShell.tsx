import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { BottomNav } from './BottomNav';

const NAV_ROUTES = new Set(['/', '/library']);

export function AppShell() {
  const { pathname } = useLocation();
  const showNav = NAV_ROUTES.has(pathname);

  useEffect(() => {
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="paper min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-xl focus:bg-white focus:p-3">
        Skip to content
      </a>
      <main id="main" tabIndex={-1} key={pathname} className="min-h-dvh animate-page-in outline-none">
        <Outlet />
      </main>
      {showNav && <BottomNav />}
      <ScrollRestoration />
    </div>
  );
}
